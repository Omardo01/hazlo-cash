import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { bucle } from '../motion';
import { C, F } from '../theme';
import type { FondoProps, Zonas } from './fondos';

/**
 * "La red": el boca en boca dibujado. Personas y negocios regados arriba y
 * abajo del titular, unidos por hilos tenues. Cada tanto una recomendación
 * (un punto de luz) sale de alguien, pasa por un amigo y llega a un negocio;
 * el negocio confirma y la comisión regresa volando a quien recomendó.
 *
 * Cada cadena tiene su propio reloj de 0 a 1 en bucle (native driver) y todo
 * lo suyo —punto, hilos encendidos, anillo del negocio, moneda, "+$"— se
 * interpola de ese reloj. Las cadenas arrancan desfasadas para que siempre
 * esté pasando algo.
 */

type Tipo = 'persona' | 'negocio';

interface Nodo {
  id: string;
  tipo: Tipo;
  // Posición: x en fracción del ancho; y en fracción de su zona.
  x: number;
  zona: 'arriba' | 'abajo';
  y: number;
  // Inicial (persona) o emoji (negocio).
  marca: string;
}

const NODOS: Nodo[] = [
  { id: 'ana', tipo: 'persona', x: 0.13, zona: 'arriba', y: 0.38, marca: 'A' },
  { id: 'tacos', tipo: 'negocio', x: 0.47, zona: 'arriba', y: 0.18, marca: '🌮' },
  { id: 'luis', tipo: 'persona', x: 0.84, zona: 'arriba', y: 0.3, marca: 'L' },
  { id: 'meli', tipo: 'persona', x: 0.33, zona: 'arriba', y: 0.82, marca: 'M' },
  { id: 'barber', tipo: 'negocio', x: 0.7, zona: 'arriba', y: 0.78, marca: '💈' },
  { id: 'cafe', tipo: 'negocio', x: 0.18, zona: 'abajo', y: 0.3, marca: '☕' },
  { id: 'jorge', tipo: 'persona', x: 0.52, zona: 'abajo', y: 0.62, marca: 'J' },
  { id: 'sofi', tipo: 'persona', x: 0.86, zona: 'abajo', y: 0.22, marca: 'S' },
  { id: 'taller', tipo: 'negocio', x: 0.82, zona: 'abajo', y: 0.86, marca: '🔧' },
  { id: 'raul', tipo: 'persona', x: 0.1, zona: 'abajo', y: 0.86, marca: 'R' },
];

// Hilos de fondo (siempre tenues).
const HILOS: [string, string][] = [
  ['ana', 'tacos'], ['tacos', 'luis'], ['ana', 'meli'], ['meli', 'barber'], ['luis', 'barber'], ['tacos', 'meli'],
  ['cafe', 'jorge'], ['jorge', 'sofi'], ['sofi', 'taller'], ['jorge', 'taller'], ['raul', 'cafe'], ['raul', 'jorge'],
  // Dos que cruzan por detrás del titular: es una sola red.
  ['meli', 'cafe'], ['barber', 'sofi'],
];

interface Cadena {
  // Persona que recomienda → (amigos) → negocio.
  ruta: string[];
  monto: number;
  // Cuándo arranca la primera vuelta, en ms.
  arranque: number;
}

const CADENAS: Cadena[] = [
  { ruta: ['ana', 'meli', 'barber'], monto: 40, arranque: 300 },
  { ruta: ['sofi', 'jorge', 'cafe'], monto: 25, arranque: 2100 },
  { ruta: ['luis', 'tacos'], monto: 15, arranque: 3900 },
  { ruta: ['raul', 'jorge', 'taller'], monto: 60, arranque: 5700 },
  { ruta: ['meli', 'cafe'], monto: 20, arranque: 7500 },
];

// Una vuelta de cadena; las fracciones de abajo son de este periodo.
const PERIODO = 9000;
const TRAMO = 0.12; // lo que tarda el punto en cada hilo
const CONFIRMA = 0.08; // pausa del negocio confirmando
const REGRESO = 0.14; // vuelo de la moneda de regreso
const FESTEJO = 0.16; // el "+$" sube y se va

const PERSONA = 30;
const NEGOCIO = 34;

function posicion(n: Nodo, z: Zonas) {
  const [y0, y1] = z[n.zona];
  return { x: n.x * z.w, y: y0 + (y1 - y0) * n.y };
}

function nodo(id: string) {
  const n = NODOS.find((m) => m.id === id);
  if (!n) throw new Error(`Nodo desconocido: ${id}`);
  return n;
}

const Hilos = memo(function Hilos({ z }: { z: Zonas }) {
  return (
    <Svg width={z.w} height={z.h} style={StyleSheet.absoluteFill}>
      {HILOS.map(([a, b]) => {
        const p = posicion(nodo(a), z);
        const q = posicion(nodo(b), z);
        return <Line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#fff" strokeOpacity={0.07} strokeWidth={1} />;
      })}
    </Svg>
  );
});

const Nodos = memo(function Nodos({ z }: { z: Zonas }) {
  return (
    <>
      {NODOS.map((n) => {
        const p = posicion(n, z);
        const lado = n.tipo === 'persona' ? PERSONA : NEGOCIO;
        return (
          <View
            key={n.id}
            style={{
              position: 'absolute',
              left: p.x - lado / 2,
              top: p.y - lado / 2,
              width: lado,
              height: lado,
              borderRadius: n.tipo === 'persona' ? lado / 2 : 11,
              borderWidth: 1,
              borderColor: n.tipo === 'persona' ? 'rgba(255,255,255,0.16)' : 'rgba(254,120,1,0.4)',
              backgroundColor: n.tipo === 'persona' ? '#141414' : '#1F1408',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={n.tipo === 'persona' ? s.inicial : s.emoji}>{n.marca}</Text>
          </View>
        );
      })}
    </>
  );
});

// Un tramo recorrido: el hilo se enciende mientras pasa el punto y se apaga
// después. Si cruza por detrás del titular, se enciende menos para no
// competir con las letras.
function HiloEncendido({ t, z, de, a, ini, fin }: { t: Animated.Value; z: Zonas; de: Nodo; a: Nodo; ini: number; fin: number }) {
  const p = posicion(de, z);
  const q = posicion(a, z);
  const tope = de.zona !== a.zona ? 0.35 : 1;
  const opacity = t.interpolate({ inputRange: [ini, fin, fin + 0.18, fin + 0.3], outputRange: [0, tope, tope * 0.6, 0], extrapolate: 'clamp' });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width={z.w} height={z.h}>
        <Line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.primary} strokeOpacity={0.18} strokeWidth={5} strokeLinecap="round" />
        <Line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.primary} strokeOpacity={0.85} strokeWidth={1.4} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

// Anillo que se expande sobre un nodo en el instante `en`.
function Anillo({ t, x, y, en, lado, color }: { t: Animated.Value; x: number; y: number; en: number; lado: number; color: string }) {
  const opacity = t.interpolate({ inputRange: [en - 0.001, en, en + 0.12], outputRange: [0, 0.9, 0], extrapolate: 'clamp' });
  const scale = t.interpolate({ inputRange: [en, en + 0.12], outputRange: [1, 2.1], extrapolate: 'clamp' });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - lado / 2, top: y - lado / 2, width: lado, height: lado, borderRadius: lado / 2, borderWidth: 1.5, borderColor: color, opacity, transform: [{ scale }] }}
    />
  );
}

// Brillo de un nodo encendido (tapa el nodo con su versión naranja).
function Brillo({ t, n, z, ini, fin }: { t: Animated.Value; n: Nodo; z: Zonas; ini: number; fin: number }) {
  const p = posicion(n, z);
  const lado = n.tipo === 'persona' ? PERSONA : NEGOCIO;
  const opacity = t.interpolate({ inputRange: [ini, ini + 0.03, fin - 0.05, fin], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: p.x - lado / 2,
        top: p.y - lado / 2,
        width: lado,
        height: lado,
        borderRadius: n.tipo === 'persona' ? lado / 2 : 11,
        backgroundColor: n.tipo === 'persona' ? C.primary : '#3A2208',
        borderWidth: 1,
        borderColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        shadowColor: C.primary,
        shadowOpacity: 0.8,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      }}>
      <Text style={n.tipo === 'persona' ? [s.inicial, { color: '#fff' }] : s.emoji}>{n.marca}</Text>
    </Animated.View>
  );
}

const CadenaAnimada = memo(function CadenaAnimada({ c, z, quieto }: { c: Cadena; z: Zonas; quieto: boolean }) {
  const t = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (quieto) return;
    let vuelta: Animated.CompositeAnimation | null = null;
    const espera = setTimeout(() => {
      vuelta = bucle(Animated.timing(t, { toValue: 1, duration: PERIODO, easing: Easing.linear, useNativeDriver: true }));
      vuelta.start();
    }, c.arranque);
    return () => {
      clearTimeout(espera);
      vuelta?.stop();
    };
  }, [t, c.arranque, quieto]);

  if (quieto) return null;

  const nodos = c.ruta.map(nodo);
  const puntos = nodos.map((n) => posicion(n, z));
  const origen = nodos[0];
  const negocio = nodos[nodos.length - 1];
  const tramos = nodos.length - 1;
  const llega = tramos * TRAMO; // el punto llega al negocio
  const vuela = llega + CONFIRMA; // sale la moneda
  const cobra = vuela + REGRESO; // la moneda llega a quien recomendó
  const fin = cobra + FESTEJO;

  // El punto de la recomendación, de nodo en nodo. Mientras cruza por detrás
  // del titular (tramo entre zonas) se atenúa.
  const marcas = puntos.map((_, i) => i * TRAMO);
  const brillo: [number, number][] = [[0, 0], [0.02, 1]];
  nodos.slice(1).forEach((n, i) => {
    if (n.zona === nodos[i].zona) return;
    brillo.push([i * TRAMO + TRAMO * 0.25, 0.25], [(i + 1) * TRAMO - TRAMO * 0.25, 0.25]);
  });
  brillo.push([llega - 0.01, 1], [llega, 0]);
  const punto = {
    opacity: t.interpolate({ inputRange: brillo.map((b) => b[0]), outputRange: brillo.map((b) => b[1]), extrapolate: 'clamp' }),
    transform: [
      { translateX: t.interpolate({ inputRange: marcas, outputRange: puntos.map((p) => p.x - 5), extrapolate: 'clamp' }) },
      { translateY: t.interpolate({ inputRange: marcas, outputRange: puntos.map((p) => p.y - 5), extrapolate: 'clamp' }) },
    ],
  };

  // La moneda de regreso: del negocio a quien recomendó, con un arco hacia arriba.
  const pn = puntos[puntos.length - 1];
  const po = puntos[0];
  const medio = (vuela + cobra) / 2;
  const arco = Math.min(60, Math.abs(pn.x - po.x) * 0.35 + 20);
  const moneda = {
    opacity: t.interpolate({ inputRange: [vuela - 0.001, vuela, cobra - 0.01, cobra], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' }),
    transform: [
      { translateX: t.interpolate({ inputRange: [vuela, cobra], outputRange: [pn.x - 9, po.x - 9], extrapolate: 'clamp' }) },
      {
        translateY: t.interpolate({
          inputRange: [vuela, medio, cobra],
          outputRange: [pn.y - 9, (pn.y + po.y) / 2 - 9 - arco, po.y - 9],
          extrapolate: 'clamp',
        }),
      },
      { scale: t.interpolate({ inputRange: [vuela, medio, cobra], outputRange: [0.6, 1.15, 0.8], extrapolate: 'clamp' }) },
    ],
  };

  // "+$40" junto a quien recomendó: sube por encima del nodo si cabe en su
  // zona; si no (zona chica, o el nodo pegado al logo), sale de lado.
  const anchoEtiqueta = 64;
  const [zona0] = z[origen.zona];
  const encima = po.y - PERSONA / 2 - 28;
  const deLado = encima - 26 < zona0 - 2;
  const hacia = po.x > z.w / 2 ? -1 : 1;
  const etiqueta = deLado
    ? { left: hacia < 0 ? po.x - PERSONA / 2 - 4 - anchoEtiqueta : po.x + PERSONA / 2 + 4, top: po.y - 11, alignItems: hacia < 0 ? ('flex-end' as const) : ('flex-start' as const) }
    : { left: Math.max(6, Math.min(z.w - anchoEtiqueta - 6, po.x - anchoEtiqueta / 2)), top: encima, alignItems: 'center' as const };
  const festejo = {
    opacity: t.interpolate({ inputRange: [cobra, cobra + 0.03, fin - 0.04, fin], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' }),
    transform: [
      { translateX: t.interpolate({ inputRange: [cobra, fin], outputRange: [0, deLado ? hacia * 10 : 0], extrapolate: 'clamp' }) },
      { translateY: t.interpolate({ inputRange: [cobra, fin], outputRange: [0, deLado ? -8 : -26], extrapolate: 'clamp' }) },
      { scale: t.interpolate({ inputRange: [cobra, cobra + 0.04, cobra + 0.07], outputRange: [0.7, 1.12, 1], extrapolate: 'clamp' }) },
    ],
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {nodos.slice(1).map((n, i) => (
        <HiloEncendido key={n.id} t={t} z={z} de={nodos[i]} a={n} ini={i * TRAMO} fin={(i + 1) * TRAMO} />
      ))}
      <Brillo t={t} n={origen} z={z} ini={0} fin={TRAMO + 0.06} />
      <Brillo t={t} n={negocio} z={z} ini={llega} fin={vuela + 0.06} />
      <Anillo t={t} x={pn.x} y={pn.y} en={llega} lado={NEGOCIO} color={C.primary} />
      <Brillo t={t} n={origen} z={z} ini={cobra} fin={fin} />
      <Anillo t={t} x={po.x} y={po.y} en={cobra} lado={PERSONA} color="#FFC044" />

      <Animated.View style={[s.punto, punto]} />
      <Animated.View style={[s.moneda, moneda]}>
        <Text style={s.monedaTxt}>$</Text>
      </Animated.View>
      <Animated.View style={[s.festejo, { width: anchoEtiqueta }, etiqueta, festejo]}>
        <Text style={s.festejoTxt}>+${c.monto}</Text>
      </Animated.View>
    </View>
  );
});

export function FondoRed({ z, quieto }: FondoProps) {
  // La red entera respira despacio para que no parezca un dibujo fijo.
  const respira = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (quieto) return;
    const a = bucle(
      Animated.sequence([
        Animated.timing(respira, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(respira, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [respira, quieto]);

  const translateY = respira.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateY }] }]}>
      <Hilos z={z} />
      <Nodos z={z} />
      {CADENAS.map((c) => (
        <CadenaAnimada key={c.ruta.join('-')} c={c} z={z} quieto={quieto} />
      ))}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  inicial: { fontFamily: F.semi, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  emoji: { fontSize: 16 },
  punto: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE2B8',
    shadowColor: C.primary,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  moneda: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F5A623',
    borderWidth: 1.5,
    borderColor: '#FFD27A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5A623',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  monedaTxt: { fontFamily: F.bold, fontSize: 10, color: '#5A3300', marginTop: 1 },
  festejo: { position: 'absolute' },
  festejoTxt: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFC044',
    textShadowColor: 'rgba(254,120,1,0.8)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
});
