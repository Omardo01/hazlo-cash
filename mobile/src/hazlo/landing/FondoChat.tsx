import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { C, F } from '../theme';
import type { FondoProps, Zonas } from './fondos';

/**
 * "Boca en boca": la plática de WhatsApp que ya pasa todos los días, y lo que
 * Hazlo Cash le agrega. Arriba del titular alguien pregunta, tú recomiendas
 * con tu código y te cuentan que les fue bien; abajo llega la notificación
 * con tu comisión. Luego todo se desvanece y empieza otra plática.
 *
 * Cada plática es un componente con su propio reloj (0 a 1, native driver).
 * Los globos se apilan desde abajo: cuando llega uno nuevo, los anteriores
 * suben un renglón y el que ya no cabe se desvanece.
 */

type Mensaje = { de: 'amigo' | 'tu'; texto: string } | { de: 'codigo'; texto: string };

interface Platica {
  mensajes: Mensaje[];
  quien: string;
  negocio: string;
  monto: number;
}

const PLATICAS: Platica[] = [
  {
    mensajes: [
      { de: 'amigo', texto: '¿Dónde hay buenos tacos? 🌮' },
      { de: 'tu', texto: 'Ve a Tacos El Güero 😉' },
      { de: 'codigo', texto: 'HAZLO-K7Q2' },
      { de: 'amigo', texto: '¡Fui! Me regalaron el agua 🙌' },
    ],
    quien: 'Lupe',
    negocio: 'Tacos El Güero',
    monto: 25,
  },
  {
    mensajes: [
      { de: 'amigo', texto: '¿Un barbero que sí sepa? 💈' },
      { de: 'tu', texto: 'Barbería Don Pepe, 100% 👌' },
      { de: 'codigo', texto: 'HAZLO-B4R8' },
      { de: 'amigo', texto: 'Quedé bien guapo 😎' },
    ],
    quien: 'Luis',
    negocio: 'Barbería Don Pepe',
    monto: 40,
  },
  {
    mensajes: [
      { de: 'amigo', texto: 'Se me descompuso el carro 😩' },
      { de: 'tu', texto: 'Taller Ruiz, son de confianza' },
      { de: 'codigo', texto: 'HAZLO-T9M1' },
      { de: 'amigo', texto: '¡Quedó como nuevo! 🚗' },
    ],
    quien: 'Mariana',
    negocio: 'Taller Ruiz',
    monto: 60,
  },
];

const DURACION = 10_000;
// Cuándo entra cada globo y la notificación (fracciones de la plática).
const LLEGADAS = [0.03, 0.17, 0.27, 0.44];
const NOTIFICA = 0.58;
const SE_VA = 0.9;
const MOVER = 0.03;
const GLOBO = 32;
const RENGLON = GLOBO + 8;
const MARGEN = 18;
// Aire entre el último globo y el bloque del titular.
const AIRE = 14;
// Cuadro "quieto" (menos movimiento): la plática completa.
const CUADRO_QUIETO = 0.8;

// Interpolación desde una lista de puntos (t, valor) ya ordenada.
function curva(t: Animated.Value, puntos: [number, number][]) {
  return t.interpolate({ inputRange: puntos.map((p) => p[0]), outputRange: puntos.map((p) => p[1]), extrapolate: 'clamp' });
}

function Globo({ t, m, i, z }: { t: Animated.Value; m: Mensaje; i: number; z: Zonas }) {
  const llega = LLEGADAS[i];
  const caben = Math.max(1, Math.floor((z.arriba[1] - z.arriba[0] - AIRE) / RENGLON));

  // Sube un renglón cada vez que llega un globo después de él.
  const sube: [number, number][] = [[llega, 10], [llega + MOVER, 0]];
  const ve: [number, number][] = [[llega, 0], [llega + MOVER, 1]];
  LLEGADAS.slice(i + 1).forEach((otro, k) => {
    sube.push([otro, -k * RENGLON], [otro + MOVER, -(k + 1) * RENGLON]);
    // El que ya no cabe en la zona se desvanece mientras sube.
    if (k + 1 === caben) ve.push([otro, 1], [otro + MOVER, 0]);
  });
  if (ve[ve.length - 1][1] !== 0) ve.push([SE_VA, 1], [SE_VA + 0.05, 0]);

  const derecha = m.de !== 'amigo';
  return (
    <Animated.View
      style={[
        s.globo,
        m.de === 'amigo' ? s.globoAmigo : m.de === 'tu' ? s.globoTu : s.globoCodigo,
        derecha ? { right: MARGEN } : { left: MARGEN },
        {
          top: z.arriba[1] - GLOBO - AIRE,
          maxWidth: z.w * 0.76,
          opacity: curva(t, ve),
          transform: [{ translateY: curva(t, sube) }, { scale: curva(t, [[llega, 0.88], [llega + MOVER, 1]]) }],
        },
      ]}>
      {m.de === 'codigo' && <Icon name="qr" size={14} color="#fff" sw={2} />}
      <Text style={m.de === 'codigo' ? s.codigoTxt : s.globoTxt} numberOfLines={1}>
        {m.texto}
      </Text>
    </Animated.View>
  );
}

function Notificacion({ t, p, z }: { t: Animated.Value; p: Platica; z: Zonas }) {
  const ancho = Math.min(310, z.w - 36);
  const centro = (z.abajo[0] + z.abajo[1]) / 2;
  const ve = curva(t, [[NOTIFICA, 0], [NOTIFICA + 0.03, 1], [SE_VA, 1], [SE_VA + 0.05, 0]]);
  const translateY = curva(t, [[NOTIFICA, 22], [NOTIFICA + 0.035, 0], [SE_VA, 0], [SE_VA + 0.05, 8]]);
  const scale = curva(t, [[NOTIFICA, 0.94], [NOTIFICA + 0.035, 1]]);
  // El monto late una vez cuando ya se leyó la notificación.
  const late = curva(t, [[NOTIFICA + 0.06, 1], [NOTIFICA + 0.08, 1.25], [NOTIFICA + 0.11, 1]]);
  const brilla = curva(t, [[NOTIFICA + 0.06, 0], [NOTIFICA + 0.08, 1], [NOTIFICA + 0.2, 0]]);

  return (
    <Animated.View style={[s.notif, { width: ancho, left: (z.w - ancho) / 2, top: centro - 31, opacity: ve, transform: [{ translateY }, { scale }] }]}>
      <Animated.View style={[StyleSheet.absoluteFill, s.notifBrillo, { opacity: brilla }]} />
      <View style={s.notifIcono}>
        <HazloMark size={16} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.notifApp}>Hazlo Cash · ahora</Text>
        <Text style={s.notifTxt} numberOfLines={2}>
          {p.quien} usó tu código en {p.negocio}
        </Text>
      </View>
      <Animated.Text style={[s.notifMonto, { transform: [{ scale: late }] }]}>+${p.monto}</Animated.Text>
    </Animated.View>
  );
}

function PlaticaAnimada({ p, z, quieto, alTerminar }: { p: Platica; z: Zonas; quieto: boolean; alTerminar: () => void }) {
  const t = useState(() => new Animated.Value(quieto ? CUADRO_QUIETO : 0))[0];

  useEffect(() => {
    if (quieto) {
      t.setValue(CUADRO_QUIETO);
      return;
    }
    const a = Animated.timing(t, { toValue: 1, duration: DURACION, easing: Easing.linear, useNativeDriver: true });
    a.start(({ finished }) => finished && alTerminar());
    return () => a.stop();
  }, [t, quieto, alTerminar]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {p.mensajes.map((m, i) => (
        <Globo key={i} t={t} m={m} i={i} z={z} />
      ))}
      <Notificacion t={t} p={p} z={z} />
    </View>
  );
}

export function FondoChat({ z, quieto }: FondoProps) {
  const [indice, setIndice] = useState(0);
  // Estable para que el efecto de la plática no se reinicie en cada render.
  const [siguiente] = useState(() => () => setIndice((i) => (i + 1) % PLATICAS.length));

  return <PlaticaAnimada key={indice} p={PLATICAS[indice]} z={z} quieto={quieto} alTerminar={siguiente} />;
}

const s = StyleSheet.create({
  globo: {
    position: 'absolute',
    height: GLOBO,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  globoAmigo: { backgroundColor: 'rgba(255,255,255,0.1)', borderBottomLeftRadius: 5 },
  globoTu: { backgroundColor: 'rgba(254,120,1,0.22)', borderWidth: 1, borderColor: 'rgba(254,120,1,0.38)', borderBottomRightRadius: 5 },
  globoCodigo: { backgroundColor: C.primary, borderBottomRightRadius: 5 },
  globoTxt: { fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.88)' },
  codigoTxt: { fontFamily: F.bold, fontSize: 12, letterSpacing: 0.8, color: '#fff' },
  notif: {
    position: 'absolute',
    minHeight: 62,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(30,30,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  notifBrillo: { backgroundColor: 'rgba(254,120,1,0.16)' },
  notifIcono: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' },
  notifApp: { fontFamily: F.reg, fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  notifTxt: { fontFamily: F.semi, fontSize: 11.5, lineHeight: 15, color: '#fff', marginTop: 1 },
  notifMonto: { fontFamily: F.bold, fontSize: 17, color: C.primary },
});
