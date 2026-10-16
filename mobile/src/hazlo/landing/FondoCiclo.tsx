import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

import { Icon, type IconName } from '../icons';
import { bucle } from '../motion';
import { C, F } from '../theme';
import type { FondoProps, Zonas } from './fondos';

/**
 * "El ciclo": los cuatro pasos de Hazlo Cash en una órbita que rodea al
 * titular. Un cometa recorre la órbita y se detiene en cada estación —
 * compartes, tu amigo compra, el negocio confirma, tú ganas— y al cerrar la
 * vuelta cae el "+$25". Las estaciones van en las cuatro esquinas, en los
 * huecos libres de arriba y abajo, así la órbita pasa detrás del texto sin
 * taparlo.
 *
 * Un solo reloj de 0 a 1 en bucle. El avance del cometa sobre la órbita no es
 * lineal: acelera entre estaciones y se queda quieto en cada una; esa curva se
 * muestrea en una tabla y se le pasa a interpolate (native driver).
 */

interface Estacion {
  icono: IconName;
  texto: string;
}

// En el orden del recorrido (horario): arriba-izq, arriba-der, abajo-der, abajo-izq.
const ESTACIONES: Estacion[] = [
  { icono: 'qr', texto: 'Compartes tu QR' },
  { icono: 'user', texto: 'Tu amigo compra' },
  { icono: 'check', texto: 'El negocio confirma' },
  { icono: 'dollar', texto: 'Tú ganas' },
];

const VUELTA = 9000;
// Fracción de cada cuarto que el cometa se queda en la estación.
const PAUSA = 0.38;
const MUESTRAS = 160;
const ESTELA = 7;
const DESFASE_ESTELA = 0.0045;
const LADO = 46;
const MONTO = 25;

// Avance (0..1 sobre la órbita) para un instante (0..1 de la vuelta): cada
// cuarto arranca parado en su estación y luego viaja a la siguiente.
function avance(t: number): number {
  const u = ((t % 1) + 1) % 1;
  const cuarto = Math.floor(u * 4);
  const f = u * 4 - cuarto;
  const viaje = f < PAUSA ? 0 : (f - PAUSA) / (1 - PAUSA);
  const suave = viaje < 0.5 ? 4 * viaje ** 3 : 1 - (-2 * viaje + 2) ** 3 / 2;
  return (cuarto + suave) / 4;
}

function geometria(z: Zonas) {
  const yArriba = (z.arriba[0] + z.arriba[1]) / 2 - 8;
  const yAbajo = (z.abajo[0] + z.abajo[1]) / 2 - 8;
  const cx = z.w / 2;
  const cy = (yArriba + yAbajo) / 2;
  const dx = z.w * 0.28;
  const dy = (yAbajo - yArriba) / 2;
  // Las estaciones caen a 45° sobre la elipse.
  const rx = dx * Math.SQRT2;
  const ry = dy * Math.SQRT2;
  // Ángulo inicial: arriba-izquierda (225°), y gira en sentido horario.
  const punto = (p: number) => {
    const a = (Math.PI * 5) / 4 + p * Math.PI * 2;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  };
  return { cx, cy, rx, ry, punto };
}

const Estaciones = memo(function Estaciones({ t, z, quieto }: { t: Animated.Value; z: Zonas; quieto: boolean }) {
  const { punto } = geometria(z);
  return (
    <>
      {ESTACIONES.map((e, i) => {
        const p = punto(i / 4);
        // Cuándo llega el cometa a esta estación (y cuánto se queda).
        const llega = i / 4;
        const sale = llega + PAUSA / 4;
        const rango = i === 0 ? [0, 0.001, sale, sale + 0.04, 0.96, 1] : [llega - 0.03, llega, sale, sale + 0.06, 1, 1.001];
        const salida = i === 0 ? [1, 1, 1, 0, 0, 1] : [0, 1, 1, 0, 0, 0];
        const encendido = quieto ? 1 : t.interpolate({ inputRange: rango, outputRange: salida, extrapolate: 'clamp' });
        const texto = quieto ? 1 : t.interpolate({ inputRange: rango, outputRange: salida.map((v) => 0.45 + v * 0.55), extrapolate: 'clamp' });
        const anillo = quieto
          ? 0
          : t.interpolate({ inputRange: [llega, llega + 0.002, llega + 0.07], outputRange: [0, 0.8, 0], extrapolate: 'clamp' });
        const escalaAnillo = t.interpolate({ inputRange: [llega, llega + 0.07], outputRange: [1, 1.9], extrapolate: 'clamp' });
        const ancho = 140;
        const izq = Math.max(4, Math.min(z.w - ancho - 4, p.x - ancho / 2));
        return (
          <View key={e.texto} pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Animated.View
              style={[s.anillo, { left: p.x - LADO / 2, top: p.y - LADO / 2, opacity: anillo, transform: [{ scale: escalaAnillo }] }]}
            />
            <View style={[s.estacion, { left: p.x - LADO / 2, top: p.y - LADO / 2 }]}>
              <Icon name={e.icono} size={20} color="rgba(255,255,255,0.7)" sw={1.9} />
            </View>
            <Animated.View style={[s.estacion, s.estacionViva, { left: p.x - LADO / 2, top: p.y - LADO / 2, opacity: encendido }]}>
              <Icon name={e.icono} size={20} color="#fff" sw={2.1} />
            </Animated.View>
            <View style={[s.numero, { left: p.x + LADO / 2 - 14, top: p.y - LADO / 2 - 4 }]}>
              <Text style={s.numeroTxt}>{i + 1}</Text>
            </View>
            <Animated.Text style={[s.texto, { left: izq, width: ancho, top: p.y + LADO / 2 + 6, opacity: texto }]} numberOfLines={1}>
              {e.texto}
            </Animated.Text>
          </View>
        );
      })}
    </>
  );
});

const Cometa = memo(function Cometa({ t, z }: { t: Animated.Value; z: Zonas }) {
  const { punto } = geometria(z);
  const entradas = Array.from({ length: MUESTRAS + 1 }, (_, i) => i / MUESTRAS);
  return (
    <>
      {Array.from({ length: ESTELA }, (_, k) => {
        // Cada punto de la estela va un poquito atrás en el tiempo; en las
        // pausas la estela alcanza al cometa y se junta con él.
        const pos = entradas.map((u) => punto(avance(u - k * DESFASE_ESTELA)));
        const lado = 12 - k * 1.3;
        return (
          <Animated.View
            key={k}
            style={[
              s.cometa,
              {
                width: lado,
                height: lado,
                borderRadius: lado / 2,
                opacity: k === 0 ? 1 : 0.55 - k * 0.07,
                backgroundColor: k === 0 ? '#FFE2B8' : C.primary,
                transform: [
                  { translateX: t.interpolate({ inputRange: entradas, outputRange: pos.map((p) => p.x - lado / 2) }) },
                  { translateY: t.interpolate({ inputRange: entradas, outputRange: pos.map((p) => p.y - lado / 2) }) },
                ],
              },
            ]}
          />
        );
      }).reverse()}
    </>
  );
});

// "+$25" que brota a un lado de la última estación cuando el cometa llega
// (de lado y no hacia arriba: en pantallas chicas arriba ya está el texto).
function Ganancia({ t, z }: { t: Animated.Value; z: Zonas }) {
  const p = geometria(z).punto(3 / 4);
  const ini = 3 / 4;
  const fin = ini + PAUSA / 4 + 0.04;
  const opacity = t.interpolate({ inputRange: [ini, ini + 0.015, fin - 0.03, fin], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });
  const translateX = t.interpolate({ inputRange: [ini, fin], outputRange: [-6, 10], extrapolate: 'clamp' });
  const translateY = t.interpolate({ inputRange: [ini, fin], outputRange: [4, -8], extrapolate: 'clamp' });
  const scale = t.interpolate({ inputRange: [ini, ini + 0.02, ini + 0.035], outputRange: [0.6, 1.15, 1], extrapolate: 'clamp' });
  return (
    <Animated.View style={[s.ganancia, { left: p.x + LADO / 2 + 6, top: p.y - 14, opacity, transform: [{ translateX }, { translateY }, { scale }] }]}>
      <Text style={s.gananciaTxt}>+${MONTO}</Text>
    </Animated.View>
  );
}

export function FondoCiclo({ z, quieto }: FondoProps) {
  const t = useState(() => new Animated.Value(0))[0];
  const { cx, cy, rx, ry } = geometria(z);

  useEffect(() => {
    if (quieto) return;
    const a = bucle(Animated.timing(t, { toValue: 1, duration: VUELTA, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [t, quieto]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={z.w} height={z.h} style={StyleSheet.absoluteFill}>
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={C.primary} strokeOpacity={0.08} strokeWidth={10} fill="none" />
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="#fff" strokeOpacity={0.14} strokeWidth={1} strokeDasharray="2 7" fill="none" />
      </Svg>
      {!quieto && <Cometa t={t} z={z} />}
      <Estaciones t={t} z={z} quieto={quieto} />
      {!quieto && <Ganancia t={t} z={z} />}
    </View>
  );
}

const s = StyleSheet.create({
  estacion: {
    position: 'absolute',
    width: LADO,
    height: LADO,
    borderRadius: LADO / 2,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  estacionViva: {
    backgroundColor: C.primary,
    borderColor: '#FFB36B',
    shadowColor: C.primary,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  anillo: { position: 'absolute', width: LADO, height: LADO, borderRadius: LADO / 2, borderWidth: 1.5, borderColor: C.primary },
  numero: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTxt: { fontFamily: F.semi, fontSize: 9.5, color: 'rgba(255,255,255,0.8)' },
  texto: { position: 'absolute', textAlign: 'center', fontFamily: F.semi, fontSize: 11.5, color: '#fff' },
  cometa: {
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: C.primary,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  ganancia: { position: 'absolute', width: 80, alignItems: 'flex-start' },
  gananciaTxt: {
    fontFamily: F.bold,
    fontSize: 18,
    color: '#FFC044',
    textShadowColor: 'rgba(254,120,1,0.85)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
});
