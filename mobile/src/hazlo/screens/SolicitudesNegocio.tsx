import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mutar } from '@/lib/datos/cache';
import { K, useMiNegocio, useVisitasNegocio } from '@/lib/datos/consultas';
import { useLive } from '@/lib/datos/realtime';
import { confirmarVenta, rechazarVisita, registrarVentaPorCodigo, type QrVenta, type VisitaNegocio } from '@/lib/services/referrals';
import type { BusinessAdmin, EstadoReferral } from '@/lib/types';
import { ListaSkeleton } from '../Skeleton';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { QrScanner } from '../QrScanner';
import { BG, C, F, FG, MUTED, R } from '../theme';
import { Glass, SectionHeader } from '../ui';

const ESTILO_ESTADO: Record<EstadoReferral, { label: string; color: string; bg: string; icon: IconName }> = {
  pendiente: { label: 'Pendiente', color: '#B7791F', bg: 'rgba(245,166,35,0.15)', icon: 'send' },
  confirmado: { label: 'Confirmada', color: '#00A896', bg: 'rgba(0,168,150,0.15)', icon: 'check' },
  rechazado: { label: 'Rechazada', color: MUTED, bg: 'rgba(13,13,13,0.06)', icon: 'arrowDown' },
};

const money = (n: number) => `$${n.toFixed(2)}`;

function comisionLabel(n: BusinessAdmin): string {
  return n.comision_tipo === 'porcentaje' ? `${n.comision_valor}% por venta` : `${money(n.comision_valor)} por venta`;
}

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  const mismoDia = d.toDateString() === new Date().toDateString();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (mismoDia) return `Hoy · ${hora}`;
  return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${hora}`;
}

// Modal para capturar el monto de la venta (sólo negocios con comisión %).
function MontoVentaModal({
  visible,
  porcentaje,
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  porcentaje: number;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (monto: number) => void;
}) {
  const [valor, setValor] = useState('');
  const monto = parseFloat(valor.replace(',', '.'));
  const valido = !isNaN(monto) && monto > 0;
  const comision = valido ? (monto * porcentaje) / 100 : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: BG, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 34 }}>
          <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.12)', alignSelf: 'center', marginBottom: 18 }} />
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>Monto de la venta</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 19 }}>
            La comisión del recomendador es el {porcentaje}% de esta venta.
          </Text>

          <View style={{ marginTop: 18, borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 26, color: MUTED }}>$</Text>
            <TextInput
              value={valor}
              onChangeText={setValor}
              placeholder="0.00"
              placeholderTextColor="rgba(13,13,13,0.3)"
              keyboardType="decimal-pad"
              autoFocus
              style={{ flex: 1, fontFamily: F.bold, fontSize: 26, color: FG, padding: 0, marginLeft: 4 }}
            />
          </View>

          <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary, marginTop: 12, minHeight: 18 }}>
            {valido ? `Comisión: ${money(comision)}` : ' '}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <PressableScale onPress={onCancel} style={{ flex: 1, height: 50, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: MUTED }}>Cancelar</Text>
            </PressableScale>
            <PressableScale
              onPress={() => valido && onConfirm(monto)}
              disabled={!valido || loading}
              style={{ flex: 2, height: 50, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', opacity: valido && !loading ? 1 : 0.5 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Confirmar venta</Text>}
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// `escanear` cambia cada vez que piden abrir el escáner desde fuera (el botón
// central de la barra o el Inicio del negocio).
export function SolicitudesNegocioScreen({ escanear = 0 }: { escanear?: number } = {}) {
  // Las solicitudes llegan solas: el canal global marca esta lista como vieja
  // en cuanto entra una visita nueva y, si la pantalla está abierta, se
  // refresca al momento. Sin refrescar a mano y sin sondeo.
  const { datos: visitas = [], cargando: loading, error: errorCarga, refrescar: refrescarVisitas } = useVisitasNegocio();
  const { datos: negocio, refrescar: refrescarNegocio } = useMiNegocio();
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resolviendo, setResolviendo] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<QrVenta | null>(null); // venta esperando monto (comisión %)
  const [scannerVisible, setScannerVisible] = useState(false);
  useEffect(() => {
    if (escanear > 0) setScannerVisible(true);
  }, [escanear]);

  const cargar = useCallback(() => {
    setError(null);
    refrescarVisitas();
    refrescarNegocio();
  }, [refrescarVisitas, refrescarNegocio]);

  // Clave para el spinner: el id de la visita, o el código en venta directa.
  const claveDe = (t: QrVenta) => (t.tipo === 'visita' ? t.id : t.codigo);

  // Procesa la venta: confirma una visita reclamada o registra una venta directa
  // a partir del código del recomendador. Ambas mueven dinero server-side.
  const procesar = async (target: QrVenta, montoVenta?: number) => {
    setAviso(null);
    setResolviendo(claveDe(target));
    const r =
      target.tipo === 'visita'
        ? await confirmarVenta(target.id, montoVenta)
        : await registrarVentaPorCodigo(target.codigo, montoVenta);
    setResolviendo(null);
    setPendiente(null);
    if (r.ok) {
      // El saldo de créditos vuelve en la respuesta: se parcha en caché sin
      // pedir el negocio otra vez.
      if (r.creditosRestantes != null)
        mutar<BusinessAdmin | null>(K.miNegocio, (n) => (n ? { ...n, creditos: r.creditosRestantes! } : n));
      if (r.comision != null) setAviso(`Venta registrada · ${money(r.comision)} para el recomendador`);
      refrescarVisitas(); // el estado de la visita ya cambió server-side
    } else {
      setError(r.error ?? 'No se pudo registrar la venta.');
    }
  };

  // Punto de entrada (botón de la lista o escáner): pide monto si la comisión es %.
  const iniciar = (target: QrVenta) => {
    setError(null);
    if (negocio?.comision_tipo === 'porcentaje') {
      setPendiente(target);
    } else {
      procesar(target);
    }
  };

  // El negocio escaneó un QR (código del recomendador o visita del cliente).
  const onScan = (venta: QrVenta) => {
    setScannerVisible(false);
    iniciar(venta);
  };

  const rechazar = async (id: string) => {
    setResolviendo(id);
    const { ok } = await rechazarVisita(id);
    // Cambio local inmediato sobre la caché: la fila se pinta rechazada sin
    // esperar una consulta nueva.
    if (ok)
      mutar<VisitaNegocio[]>(K.visitasNegocio, (prev) =>
        prev.map((v) => (v.id === id ? { ...v, estado: 'rechazado' } : v)),
      );
    setResolviendo(null);
  };

  const pendientes = visitas.filter((v) => v.estado === 'pendiente').length;
  const hoy = new Date().toDateString();
  const ventasHoy = visitas.filter((v) => v.estado === 'confirmado' && new Date(v.creada).toDateString() === hoy).length;
  const confirmadas = visitas.filter((v) => v.estado === 'confirmado').length;
  const creditos = negocio?.creditos ?? 0;
  // El canal de Realtime es lo que hace que las solicitudes lleguen solas.
  const { conectado } = useLive();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      {/* Saludo */}
      <Fade desde={8}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Tu negocio</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginTop: 2 }}>{negocio?.nombre ?? 'Tu negocio'}</Text>
        </View>
        <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 12, borderRadius: 999 }}>
          <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: conectado ? '#00A896' : 'rgba(13,13,13,0.3)' }} />
          <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: conectado ? '#00806F' : MUTED }}>{conectado ? 'En vivo' : 'Conectando…'}</Text>
        </Glass>
      </View>
      </Fade>

      {/* Hero */}
      <Fade delay={STAGGER} desde={12}>
      <View
        style={{ position: 'relative', overflow: 'hidden', borderRadius: R.lg, padding: 20, marginBottom: 22, shadowColor: C.primary, shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 8 }}>
        <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', right: -30, top: -30, opacity: 0.18 }}>
          <HazloMark size={180} primary="#fff" secondary="#fff" />
        </View>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.24, textTransform: 'uppercase' }}>Por confirmar</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 44, color: '#fff', letterSpacing: -1.5, marginTop: 2 }}>{pendientes}</Text>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
          {pendientes > 0 ? 'visitas esperando tu confirmación' : '¡Todo al día!'}
        </Text>
      </View>
      </Fade>

      {/* Stats (los pendientes ya están en el hero) */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {[
          { v: String(ventasHoy), l: 'Ventas hoy', icon: 'activity' as IconName, alerta: false },
          { v: String(confirmadas), l: 'Confirmadas', icon: 'check' as IconName, alerta: false },
          { v: money(creditos), l: 'Créditos', icon: 'wallet' as IconName, alerta: creditos <= 0 },
        ].map((s, i) => (
          <Fade key={s.l} delay={STAGGER * (2 + i)} desde={10} style={{ flex: 1 }}>
            <Glass style={{ padding: 12, borderRadius: R.md }}>
              <View style={{ marginBottom: 6 }}>
                <Icon name={s.icon} size={18} color={s.alerta ? C.accent : C.primary} />
              </View>
              <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 16, color: s.alerta ? C.accent : FG, letterSpacing: -0.32 }}>{s.v}</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, marginTop: 1 }}>{s.l}</Text>
            </Glass>
          </Fade>
        ))}
      </View>

      {negocio && (
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginBottom: 14, paddingHorizontal: 2 }}>
          Comisión: <Text style={{ fontFamily: F.semi, color: FG }}>{comisionLabel(negocio)}</Text>. Se descuenta de tus créditos al confirmar.
        </Text>
      )}

      {/* Escanear QR del cliente para confirmar la venta */}
      <Fade delay={STAGGER * 5} desde={10}>
      <PressableScale
        onPress={() => setScannerVisible(true)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: R.md, backgroundColor: FG, marginBottom: 22 }}>
        <Icon name="qr" size={19} color="#fff" />
        <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Escanear QR del cliente</Text>
      </PressableScale>
      </Fade>

      {aviso && (
        <Fade key={aviso} desde={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,168,150,0.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 }}>
          <Icon name="check" size={16} color="#00A896" sw={2.4} />
          <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 12.5, color: '#00786C' }}>{aviso}</Text>
        </Fade>
      )}

      {error && (
        <Fade key={error} desde={8} style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 }}>
          <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
        </Fade>
      )}

      <SectionHeader title="Solicitudes" />

      {loading && (
        <View style={{ borderRadius: R.lg, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <ListaSkeleton filas={4} />
        </View>
      )}

      {!loading && (error || errorCarga) && visitas.length === 0 && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>No pudimos cargar las solicitudes. Desliza para reintentar.</Text>
      )}

      {!loading && visitas.length === 0 && !error && (
        <Fade desde={12} style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Aún no hay solicitudes</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
            Cuando un cliente reclame una recomendación de tu negocio, aparecerá aquí para que la confirmes.
          </Text>
        </Fade>
      )}

      {!loading && visitas.length > 0 && (
        <View style={{ gap: 12 }}>
          {visitas.map((v, i) => {
            const e = ESTILO_ESTADO[v.estado];
            return (
              <Fade key={v.id} delay={STAGGER * Math.min(i, 8)} desde={12} style={{ borderRadius: R.md, padding: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: e.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={e.icon} size={19} color={e.color} sw={2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 16, color: FG, letterSpacing: 0.5 }}>{v.folio}</Text>
                    <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>Código {v.codigo} · {fechaCorta(v.creada)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: e.bg }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 11, color: e.color }}>{e.label}</Text>
                    </View>
                    {v.estado === 'confirmado' && v.comision != null && (
                      <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#00A896' }}>{money(v.comision)} comisión</Text>
                    )}
                  </View>
                </View>

                {v.estado === 'pendiente' && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <PressableScale
                      onPress={() => rechazar(v.id)}
                      disabled={resolviendo === v.id}
                      style={{ flex: 1, height: 44, borderRadius: R.sm, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 13, color: MUTED }}>Rechazar</Text>
                    </PressableScale>
                    <PressableScale
                      onPress={() => iniciar({ tipo: 'visita', id: v.id })}
                      disabled={resolviendo === v.id}
                      style={{ flex: 2, height: 44, borderRadius: R.sm, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: resolviendo === v.id ? 0.7 : 1 }}>
                      {resolviendo === v.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Icon name="check" size={16} color="#fff" sw={2.4} />
                          <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Confirmar venta</Text>
                        </>
                      )}
                    </PressableScale>
                  </View>
                )}
              </Fade>
            );
          })}
        </View>
      )}

      <MontoVentaModal
        visible={pendiente !== null}
        porcentaje={negocio?.comision_valor ?? 0}
        loading={resolviendo !== null}
        onCancel={() => setPendiente(null)}
        onConfirm={(monto) => pendiente && procesar(pendiente, monto)}
      />

      <QrScanner visible={scannerVisible} onClose={() => setScannerVisible(false)} onScan={onScan} />
    </ScrollView>
  );
}
