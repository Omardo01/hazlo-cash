import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Vibration } from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { useAuth } from '../auth-context';
import { supabase } from '../supabase';
import type { EstadoReferral } from '../types';
import { invalidar, mutar } from './cache';
import { K } from './consultas';

/**
 * Un solo canal de Realtime para toda la app.
 *
 * Antes cada pantalla abría el suyo: cambiar de pestaña cerraba y reabría el
 * WebSocket, y cada evento disparaba un refetch completo con joins. Aquí el
 * canal vive mientras dure la sesión y los eventos se aplican DIRECTO sobre la
 * caché, así que un cambio de estado no cuesta ni una petición.
 *
 * Consumo de datos, en orden de preferencia:
 *  1. UPDATE de estado → se parcha la fila en memoria. Cero red.
 *  2. INSERT (una visita nueva) → se marca la lista como vieja. Solo se vuelve
 *     a consultar si alguien está mirando esa pantalla; si no, espera.
 *  3. En segundo plano el canal se cierra. Al volver se revalida una vez.
 *
 * Qué eventos llegan lo decide RLS en el servidor: el negocio solo recibe los
 * referidos de sus códigos, el cliente los suyos. No hace falta filtrar aquí.
 */

export interface Aviso {
  id: string;
  tipo: 'nueva-orden' | 'confirmada' | 'rechazada';
  titulo: string;
  detalle: string;
  /** Id del referido que lo originó, para que una pantalla lo destaque. */
  referralId: string;
}

interface EstadoLive {
  /** Último aviso recibido. Se conserva tras cerrarlo para poder animar la salida. */
  aviso: Aviso | null;
  /** ¿El banner está en pantalla? */
  abierto: boolean;
  descartar: () => void;
  /** ¿El canal está suscrito? Se apaga en segundo plano. */
  conectado: boolean;
}

const LiveContext = createContext<EstadoLive>({
  aviso: null,
  abierto: false,
  descartar: () => {},
  conectado: false,
});

export const useLive = () => useContext(LiveContext);

type FilaReferral = { id: string; estado: EstadoReferral; codigo_id: string; cliente_id: string | null };

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [conectado, setConectado] = useState(false);

  const mostrar = useCallback((a: Aviso) => {
    setAviso(a);
    setAbierto(true);
  }, []);
  const canalRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const abrir = () => {
      if (canalRef.current) return;

      // Nombre único por suscripción: reusar un canal ya suscrito rompe
      // postgres_changes, y así el cleanup siempre limpia el que abrió.
      const canal = supabase.channel(`hazlo-loop-${userId.slice(0, 8)}-${Date.now()}`);
      canalRef.current = canal;

      canal
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'referrals' },
          ({ new: fila }) => aplicarUpdate(fila as FilaReferral, userId, mostrar),
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'referrals' },
          ({ new: fila }) => aplicarInsert(fila as FilaReferral, userId, mostrar),
        )
        .subscribe((estado) => setConectado(estado === 'SUBSCRIBED'));
    };

    const cerrar = () => {
      if (!canalRef.current) return;
      supabase.removeChannel(canalRef.current);
      canalRef.current = null;
      setConectado(false);
    };

    abrir();

    // En segundo plano no se gastan datos ni batería manteniendo el socket.
    // Al volver se revalida lo volátil una sola vez (lo que pasó mientras).
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        abrir();
        [K.visitasCliente, K.visitasNegocio, K.saldo, K.comisiones, K.ajustes, K.misRecomendaciones].forEach((k) => invalidar(k));
      } else {
        cerrar();
      }
    });

    return () => {
      sub.remove();
      cerrar();
    };
  }, [userId, mostrar]);

  return (
    <LiveContext.Provider value={{ aviso, abierto, descartar: () => setAbierto(false), conectado }}>
      {children}
    </LiveContext.Provider>
  );
}

/** Cambio de estado de una visita: se parcha en memoria, sin volver a consultar. */
function aplicarUpdate(fila: FilaReferral, userId: string, avisar: (a: Aviso) => void) {
  if (!fila?.id) return;

  const parche = <T extends { id: string; estado: EstadoReferral }>(lista: T[]) =>
    lista.map((v) => (v.id === fila.id ? { ...v, estado: fila.estado } : v));

  mutar<{ id: string; estado: EstadoReferral }[]>(K.visitasCliente, parche);
  mutar<{ id: string; estado: EstadoReferral }[]>(K.visitasNegocio, parche);
  mutar<{ id: string; estado: EstadoReferral }[]>(K.adminOrdenes, parche);

  if (fila.estado === 'confirmado') {
    // El dinero sí cambió y la comisión no viene en este payload: se marcan
    // viejos para que se refresquen cuando el usuario los mire.
    [K.saldo, K.comisiones, K.statsEmbajador, K.misRecomendaciones].forEach((k) => invalidar(k));

    if (fila.cliente_id === userId) {
      Vibration.vibrate(40);
      avisar({
        id: `${fila.id}-conf`,
        tipo: 'confirmada',
        titulo: '¡Compra confirmada!',
        detalle: 'El negocio validó tu recomendación.',
        referralId: fila.id,
      });
    }
  }

  if (fila.estado === 'rechazado' && fila.cliente_id === userId) {
    avisar({
      id: `${fila.id}-rech`,
      tipo: 'rechazada',
      titulo: 'Orden rechazada',
      detalle: 'El negocio no validó esta visita.',
      referralId: fila.id,
    });
  }
}

/**
 * Visita nueva. La fila no trae el código ni el nombre del negocio (viven en
 * los joins), así que en vez de inventarlos se marca la lista como vieja: si
 * el negocio tiene la pantalla abierta se refresca al momento, y si no, espera
 * a que la abra.
 */
function aplicarInsert(fila: FilaReferral, userId: string, avisar: (a: Aviso) => void) {
  if (!fila?.id) return;

  invalidar(K.visitasNegocio);
  invalidar(K.adminOrdenes);
  invalidar(K.adminMetricas);
  // Si la visita vino de un código del recomendador en sesión, sube su conteo.
  invalidar(K.misRecomendaciones);

  // El propio cliente ya vio su reclamo al hacerlo; el aviso es para el negocio.
  if (fila.cliente_id === userId) {
    invalidar(K.visitasCliente);
    return;
  }

  Vibration.vibrate(40);
  avisar({
    id: `${fila.id}-nueva`,
    tipo: 'nueva-orden',
    titulo: 'Nueva orden',
    detalle: 'Un cliente llegó con una recomendación.',
    referralId: fila.id,
  });
}
