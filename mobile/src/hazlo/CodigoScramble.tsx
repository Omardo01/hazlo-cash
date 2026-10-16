import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { useReduceMotion } from './motion';
import { C, F, FG, MUTED } from './theme';

/**
 * Código con efecto de "máquina tragamonedas": las letras giran y se fijan en
 * cascada. Lo usan el código de invitación (InviteSheet) y la generación del
 * QR de Recomienda, para que se sientan como la misma animación.
 *
 * `final` puede llegar tarde (lo genera el servidor): mientras sea null las
 * letras siguen girando, y cuando llega se fijan una por una. `molde` dice el
 * largo y dónde van los guiones mientras tanto.
 *
 * Vive en su propio componente a propósito: hace ~14 re-renders por segundo y,
 * si estuviera en la pantalla, repintaría el QR y los botones en cada tick.
 */
const SCRAMBLE = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
const TICK_MS = 70;
const SETTLE_MS = 95;
// Aunque el servidor conteste al instante, las letras giran al menos esto.
const MIN_GIRO_MS = 350;

const aleatoria = () => SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];

export function CodigoScramble({
  molde,
  final,
  genKey,
  listo,
  onListo,
  oscuro = false,
  tamano = 22,
}: {
  molde: string;
  final: string | null;
  genKey: number;
  /** Ya terminó la secuencia: todas las letras en color de marca. */
  listo: boolean;
  onListo: () => void;
  /** Sobre fondo oscuro: letras claras mientras giran. */
  oscuro?: boolean;
  tamano?: number;
}) {
  const plantilla = final ?? molde;
  const [chars, setChars] = useState<string[]>(() => Array(plantilla.length).fill(''));
  const [settled, setSettled] = useState(0);
  const quieto = useReduceMotion();
  const inicio = useRef(0);
  const avisar = useRef(onListo);
  useEffect(() => {
    avisar.current = onListo;
  }, [onListo]);

  // Cada generación nueva arranca de cero.
  useEffect(() => {
    inicio.current = Date.now();
    setSettled(0);
    setChars(Array(molde.length).fill(''));
  }, [genKey, molde]);

  useEffect(() => {
    if (quieto) {
      if (final != null) {
        setChars(final.split(''));
        setSettled(final.length);
        avisar.current();
      }
      return;
    }

    const giro = setInterval(() => {
      setChars((prev) => prev.map((_, i) => (plantilla[i] === '-' ? '-' : aleatoria())));
    }, TICK_MS);
    if (final == null) return () => clearInterval(giro);

    // Llegó el código: cada carácter se fija en cascada y al último se avisa.
    const espera = Math.max(0, MIN_GIRO_MS - (Date.now() - inicio.current));
    const timers = final.split('').map((_, i) => setTimeout(() => setSettled((n) => n + 1), espera + i * SETTLE_MS));
    const fin = setTimeout(() => {
      clearInterval(giro);
      setChars(final.split(''));
      avisar.current();
    }, espera + final.length * SETTLE_MS + 120);

    return () => {
      clearInterval(giro);
      timers.forEach(clearTimeout);
      clearTimeout(fin);
    };
  }, [genKey, final, plantilla, quieto]);

  const visibles = chars.map((ch, i) => (final && i < settled ? final[i] : ch));
  const tenue = oscuro ? 'rgba(255,255,255,0.5)' : MUTED;
  const girando = oscuro ? '#fff' : FG;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: tamano > 20 ? 4 : 3 }}>
      {visibles.map((ch, i) => {
        const fijo = !!final && i < settled;
        if (plantilla[i] === '-')
          return (
            <Text key={i} style={{ fontFamily: F.reg, fontSize: tamano, color: tenue }}>
              –
            </Text>
          );
        return (
          <View
            key={i}
            style={{
              minWidth: tamano * 0.82,
              borderRadius: 6,
              paddingHorizontal: tamano > 20 ? 4 : 3,
              paddingVertical: 2,
              backgroundColor: fijo ? `${C.primary}${oscuro ? '30' : '12'}` : 'transparent',
            }}>
            <Text style={{ fontFamily: F.bold, fontSize: tamano, letterSpacing: 0.88, textAlign: 'center', color: fijo || listo ? C.primary : girando }}>
              {ch || '·'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
