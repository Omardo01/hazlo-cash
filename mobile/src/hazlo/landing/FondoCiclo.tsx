import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, LinearGradient as SvgLinear, RadialGradient, Stop } from 'react-native-svg';

import { Icon, type IconName } from '../icons';
import { bucle, useReduceMotion } from '../motion';
import { C, F } from '../theme';

/**
 * Fondo del landing, "El ciclo": los cuatro pasos de Hazlo Cash en una órbita
 * que rodea al titular. Un cometa recorre la órbita y se detiene en cada
 * estación —compartes, tu amigo compra, el negocio confirma, tú ganas— y al
 * cerrar la vuelta brota el "+$25" con chispas. Las estaciones van en las
 * cuatro esquinas, en los huecos libres de arriba y abajo (las `Zonas` que
 * mide el Landing), así la órbita pasa detrás del texto sin taparlo.
 *
 * Dos relojes en bucle, cada uno en su componente para no repintar todo:
 * - la vuelta (0..1): cometa, estaciones y ganancia. El avance del cometa no
 *   es lineal (acelera entre estaciones y se queda quieto en cada una); esa
 *   curva se muestrea en una tabla y se le pasa a interpolate (native driver).
 * - el ambiente: luces de fondo que respiran y se desplazan despacio.
 */

/** Dónde queda libre el fondo: arriba y abajo del bloque de texto, en puntos. */
export interface Zonas {
  w: number;
  h: number;
  /** Entre el logo y el bloque del titular. */
  arriba: [number, number];
  /** Entre el bloque del titular y el botón. */
  abajo: [number, number];
}

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
const RESPIRO = 7000;
// Fracción de cada cuarto que el cometa se queda en la estación.
const PAUSA = 0.38;
const MUESTRAS = 160;
const ESTELA = 18;
const DESFASE_ESTELA = 0.0024;
const LADO = 48;
const MONTO = 25;
const CHISPAS = 8;
const ORO = '#FFC044';

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
  // Centro del titular: entre el hueco de arriba y el de abajo.
  const titular = (z.arriba[1] + z.abajo[0]) / 2;
  return { cx, cy, rx, ry, punto, titular };
}

// ── Ambiente ──────────────────────────────────────────────────────────────────

/** Mancha de luz radial; se dibuja una vez y solo se mueve con transform. */
function Luz({ id, lado, color, intensidad }: { id: string; lado: number; color: string; intensidad: number }) {
  return (
    <Svg width={lado} height={lado}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={intensidad} />
          <Stop offset="0.55" stopColor={color} stopOpacity={intensidad * 0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={lado / 2} cy={lado / 2} rx={lado / 2} ry={lado / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

const Ambiente = memo(function Ambiente({ z, quieto }: { z: Zonas; quieto: boolean }) {
  const r = useState(() => new Animated.Value(0))[0];
  const { cx, titular } = geometria(z);
  const grande = Math.max(z.w, z.h) * 0.9;
  const halo = z.w * 1.15;

  useEffect(() => {
    if (quieto) return;
    const a = bucle(Animated.timing(r, { toValue: 1, duration: RESPIRO * 2, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [r, quieto]);

  // Ida y vuelta suave dentro de una sola vuelta del reloj.
  const ola = (a: number, b: number) => (quieto ? a : r.interpolate({ inputRange: [0, 0.5, 1], outputRange: [a, b, a] }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={{
          position: 'absolute',
          left: -grande * 0.45,
          top: z.arriba[0] - grande * 0.45,
          opacity: ola(0.55, 0.9),
          transform: [{ translateX: ola(0, z.w * 0.12) }, { translateY: ola(0, z.h * 0.06) }],
        }}>
        <Luz id="luz-a" lado={grande} color={C.primary} intensidad={0.32} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          left: z.w - grande * 0.55,
          top: z.abajo[1] - grande * 0.55,
          opacity: ola(0.8, 0.45),
          transform: [{ translateX: ola(0, -z.w * 0.1) }, { translateY: ola(0, -z.h * 0.05) }],
        }}>
        <Luz id="luz-b" lado={grande} color={C.accent} intensidad={0.28} />
      </Animated.View>
      {/* Halo cálido detrás del titular: le da peso sin bajar el contraste. */}
      <Animated.View
        style={{
          position: 'absolute',
          left: cx - halo / 2,
          top: titular - halo / 2,
          opacity: ola(0.6, 1),
          transform: [{ scale: ola(0.94, 1.04) }],
        }}>
        <Luz id="luz-halo" lado={halo} color={C.primary} intensidad={0.2} />
      </Animated.View>
    </View>
  );
});

// ── Órbita ────────────────────────────────────────────────────────────────────

const Orbita = memo(function Orbita({ z }: { z: Zonas }) {
  const { cx, cy, rx, ry } = geometria(z);
  return (
    <Svg width={z.w} height={z.h} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgLinear id="orbita" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={C.primary} stopOpacity={0.95} />
          <Stop offset="0.5" stopColor={C.accent} stopOpacity={0.35} />
          <Stop offset="1" stopColor={ORO} stopOpacity={0.85} />
        </SvgLinear>
      </Defs>
      {/* Resplandor ancho y la línea fina encima. */}
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="url(#orbita)" strokeOpacity={0.14} strokeWidth={16} fill="none" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="url(#orbita)" strokeOpacity={0.75} strokeWidth={1.4} fill="none" />
      {/* Un eco punteado por dentro, para que se sienta con volumen. */}
      <Ellipse cx={cx} cy={cy} rx={rx * 0.88} ry={ry * 0.92} stroke="#fff" strokeOpacity={0.09} strokeWidth={1} strokeDasharray="1 8" fill="none" />
    </Svg>
  );
});

// ── Estaciones ────────────────────────────────────────────────────────────────

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
        const vivo = (a: number, b: number) =>
          quieto ? b : t.interpolate({ inputRange: rango, outputRange: salida.map((v) => a + v * (b - a)), extrapolate: 'clamp' });
        // Dos ondas que salen al llegar el cometa, una tras otra.
        const onda = (desfase: number) => ({
          opacity: quieto
            ? 0
            : t.interpolate({ inputRange: [llega + desfase, llega + desfase + 0.002, llega + desfase + 0.08], outputRange: [0, 0.75, 0], extrapolate: 'clamp' }),
          transform: [{ scale: t.interpolate({ inputRange: [llega + desfase, llega + desfase + 0.08], outputRange: [1, 2.1], extrapolate: 'clamp' }) }],
        });
        const ancho = 150;
        const izq = Math.max(4, Math.min(z.w - ancho - 4, p.x - ancho / 2));
        const caja = { left: p.x - LADO / 2, top: p.y - LADO / 2 };
        return (
          <View key={e.texto} pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Animated.View style={[s.onda, caja, onda(0)]} />
            <Animated.View style={[s.onda, caja, onda(0.025)]} />
            <Animated.View style={[s.estacionMarco, caja, { transform: [{ scale: vivo(1, 1.1) }] }]}>
              <View style={s.estacion}>
                <Icon name={e.icono} size={20} color="rgba(255,255,255,0.72)" sw={1.9} />
              </View>
              {/* Encendida: degradado de marca y brillo, encima de la apagada. */}
              <Animated.View style={[s.estacionViva, { opacity: vivo(0, 1) }]}>
                <LinearGradient colors={[ORO, C.primary, C.accent]} locations={[0, 0.45, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={s.relleno} />
                <Icon name={e.icono} size={20} color="#fff" sw={2.2} />
              </Animated.View>
            </Animated.View>
            <View style={[s.numero, { left: p.x + LADO / 2 - 14, top: p.y - LADO / 2 - 5 }]}>
              <Text style={s.numeroTxt}>{i + 1}</Text>
            </View>
            <Animated.Text
              style={[s.texto, { left: izq, width: ancho, top: p.y + LADO / 2 + 8, opacity: vivo(0.62, 1) }]}
              numberOfLines={1}>
              {e.texto}
            </Animated.Text>
          </View>
        );
      })}
    </>
  );
});

// ── Cometa ────────────────────────────────────────────────────────────────────

// De la cabeza a la cola: crema → naranja de marca → rojo, cada vez más tenue.
function colorEstela(k: number): string {
  if (k < 3) return '#FFE2B8';
  if (k < 10) return C.primary;
  return C.accent;
}

const Cometa = memo(function Cometa({ t, z }: { t: Animated.Value; z: Zonas }) {
  const { punto } = geometria(z);
  const entradas = Array.from({ length: MUESTRAS + 1 }, (_, i) => i / MUESTRAS);
  const sigue = (k: number, lado: number) => {
    // Cada punto va un poquito atrás en el tiempo; en las pausas la estela
    // alcanza al cometa y se junta con él.
    const pos = entradas.map((u) => punto(avance(u - k * DESFASE_ESTELA)));
    return [
      { translateX: t.interpolate({ inputRange: entradas, outputRange: pos.map((q) => q.x - lado / 2) }) },
      { translateY: t.interpolate({ inputRange: entradas, outputRange: pos.map((q) => q.y - lado / 2) }) },
    ];
  };
  const HALO = 44;

  return (
    <>
      {Array.from({ length: ESTELA }, (_, k) => {
        const lado = 9.5 - k * 0.36;
        return (
          <Animated.View
            key={k}
            style={[
              s.punto,
              { width: lado, height: lado, borderRadius: lado / 2, opacity: 0.6 * (1 - k / ESTELA), backgroundColor: colorEstela(k), transform: sigue(k + 1, lado) },
            ]}
          />
        );
      }).reverse()}
      <Animated.View style={[s.punto, { transform: sigue(0, HALO) }]}>
        <Luz id="cometa" lado={HALO} color={C.primary} intensidad={0.85} />
      </Animated.View>
      <Animated.View style={[s.punto, s.cabeza, { transform: sigue(0, 11) }]} />
    </>
  );
});

// ── Ganancia ──────────────────────────────────────────────────────────────────

// "+$25" que brota a un lado de la última estación cuando el cometa llega
// (de lado y no hacia arriba: en pantallas chicas arriba ya está el texto),
// con chispas que salen de la estación.
const Ganancia = memo(function Ganancia({ t, z }: { t: Animated.Value; z: Zonas }) {
  const p = geometria(z).punto(3 / 4);
  const ini = 3 / 4;
  const fin = ini + PAUSA / 4 + 0.04;
  const opacity = t.interpolate({ inputRange: [ini, ini + 0.015, fin - 0.03, fin], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });
  const translateX = t.interpolate({ inputRange: [ini, fin], outputRange: [-8, 8], extrapolate: 'clamp' });
  const translateY = t.interpolate({ inputRange: [ini, fin], outputRange: [6, -10], extrapolate: 'clamp' });
  const scale = t.interpolate({ inputRange: [ini, ini + 0.02, ini + 0.035], outputRange: [0.5, 1.18, 1], extrapolate: 'clamp' });

  return (
    <>
      {Array.from({ length: CHISPAS }, (_, k) => {
        const a = (k / CHISPAS) * Math.PI * 2 + 0.3;
        // Salen del borde de la estación hacia afuera: nunca tapan el ícono.
        const borde = LADO * 0.6;
        const lejos = LADO * (1.05 + (k % 3) * 0.25);
        const tramo = [ini, ini + 0.01, ini + 0.07];
        return (
          <Animated.View
            key={k}
            style={[
              s.chispa,
              {
                left: p.x - 2.5,
                top: p.y - 2.5,
                backgroundColor: k % 2 ? ORO : '#FFE2B8',
                opacity: t.interpolate({ inputRange: tramo, outputRange: [0, 1, 0], extrapolate: 'clamp' }),
                transform: [
                  { translateX: t.interpolate({ inputRange: [ini, ini + 0.07], outputRange: [Math.cos(a) * borde, Math.cos(a) * lejos], extrapolate: 'clamp' }) },
                  { translateY: t.interpolate({ inputRange: [ini, ini + 0.07], outputRange: [Math.sin(a) * borde, Math.sin(a) * lejos], extrapolate: 'clamp' }) },
                ],
              },
            ]}
          />
        );
      })}
      <Animated.View style={[s.ganancia, { left: p.x + LADO / 2 + 10, top: p.y - 17, opacity, transform: [{ translateX }, { translateY }, { scale }] }]}>
        <LinearGradient colors={[ORO, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.relleno} />
        <Text style={s.gananciaTxt}>+${MONTO}</Text>
      </Animated.View>
    </>
  );
});

export function FondoCiclo({ z }: { z: Zonas }) {
  const quieto = useReduceMotion();
  const t = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (quieto) return;
    const a = bucle(Animated.timing(t, { toValue: 1, duration: VUELTA, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [t, quieto]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Ambiente z={z} quieto={quieto} />
      <Orbita z={z} />
      {!quieto && <Cometa t={t} z={z} />}
      <Estaciones t={t} z={z} quieto={quieto} />
      {!quieto && <Ganancia t={t} z={z} />}
    </View>
  );
}

// Llena al padre (en esta versión de RN ya no existe absoluteFillObject).
const LLENO = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } as const;

const s = StyleSheet.create({
  estacionMarco: { position: 'absolute', width: LADO, height: LADO },
  estacion: {
    ...LLENO,
    borderRadius: LADO / 2,
    backgroundColor: 'rgba(22,18,16,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  estacionViva: {
    ...LLENO,
    borderRadius: LADO / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,226,184,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOpacity: 0.95,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  relleno: { ...LLENO },
  onda: { position: 'absolute', width: LADO, height: LADO, borderRadius: LADO / 2, borderWidth: 1.5, borderColor: C.primary },
  numero: {
    position: 'absolute',
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(254,120,1,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTxt: { fontFamily: F.semi, fontSize: 9.5, color: '#fff' },
  texto: {
    position: 'absolute',
    textAlign: 'center',
    fontFamily: F.semi,
    fontSize: 12,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  punto: { position: 'absolute', left: 0, top: 0 },
  cabeza: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#FFF6EA',
    shadowColor: '#FFE2B8',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  chispa: { position: 'absolute', width: 5, height: 5, borderRadius: 3 },
  ganancia: {
    position: 'absolute',
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,240,214,0.7)',
    shadowColor: C.primary,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  gananciaTxt: { fontFamily: F.bold, fontSize: 16, color: '#fff', letterSpacing: -0.2, textShadowColor: 'rgba(120,40,0,0.45)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } },
});
