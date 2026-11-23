import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as DegradadoSvg, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import nocheAvenidas from '@/assets/images/landing/noche-avenidas.webp';
import nocheCalles from '@/assets/images/landing/noche-calles.webp';
import rioAgua from '@/assets/images/landing/rio-agua.webp';
import rioCalles from '@/assets/images/landing/rio-calles.webp';

import { bucle, DUR, EASE, Fade, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED } from '../theme';

/**
 * Cinco caras para el landing, en prueba: el botón junto a «Iniciar sesión» las
 * va cambiando. Todas dicen lo mismo («Recomienda y gana», el buscador y las dos
 * puertas); lo único que cambia es el fondo, y cada uno lleva una sola idea. Lo
 * fijo vive en Landing.tsx.
 *
 * 1 · La voz que se corre — naranja: el globo de plática que crece y paga.
 * 2 · Mapa con ruta — claro: una sola línea, de ti al negocio.
 * 3 · Ciudad encendida — oscuro: Villahermosa real, de noche y desde el aire.
 * 4 · Solo el río — blanco: calles finísimas y el agua naranja.
 * 5 · Amanecer — pura luz, sin dibujo.
 */
export type EstiloLanding = 'voz' | 'ruta' | 'noche' | 'rio' | 'amanecer';

export const ESTILOS: { k: EstiloLanding; nombre: string }[] = [
  { k: 'voz', nombre: 'La voz que se corre' },
  { k: 'ruta', nombre: 'Mapa con ruta' },
  { k: 'noche', nombre: 'Ciudad encendida' },
  { k: 'rio', nombre: 'Solo el río' },
  { k: 'amanecer', nombre: 'Amanecer' },
];

/** Cómo se viste lo fijo (logo, título, botones) sobre cada fondo. */
export interface TemaLanding {
  fondo: string;
  /** Fondo oscuro: la barra y el botón secundario van de vidrio. */
  oscuro: boolean;
  /** El título y el buscador arriba, con el dibujo abajo; si no, al centro. */
  arriba: boolean;
  titulo: string;
  acento: string;
  /** Color de «Cash» y, si el logo va de un color, cuál. */
  cash: string;
  logo?: string;
  /** El botón principal en negro, para fondos que ya son naranjas. */
  principalNegro: boolean;
  pregunta: string;
  pie: string;
  liga: string;
  /** Usa el trazo de OpenStreetMap: la licencia pide el crédito a la vista. */
  credito: boolean;
}

const CLARO = { oscuro: false, titulo: FG, acento: '#F06400', cash: C.primary, principalNegro: false, pregunta: 'rgba(13,13,13,0.55)', pie: MUTED, liga: '#E05A00' } as const;

export const TEMAS: Record<EstiloLanding, TemaLanding> = {
  ruta: { ...CLARO, fondo: '#FBF7F0', arriba: true, credito: false },
  voz: { fondo: '#D53E00', oscuro: true, arriba: true, titulo: '#fff', acento: '#1B0A00', cash: '#1B0A00', logo: '#fff', principalNegro: true, pregunta: '#fff', pie: '#fff', liga: '#fff', credito: false },
  noche: { fondo: '#0B0A0C', oscuro: true, arriba: false, titulo: '#fff', acento: '#FF8A1F', cash: C.primary, principalNegro: false, pregunta: 'rgba(255,255,255,0.8)', pie: 'rgba(255,255,255,0.72)', liga: '#FF8A1F', credito: true },
  rio: { ...CLARO, fondo: '#FFFFFF', arriba: false, credito: true },
  amanecer: { ...CLARO, fondo: '#FFF4E6', arriba: false, principalNegro: true, pregunta: '#5A2C08', pie: '#5A2C08', liga: '#7A2600', credito: false },
};

/** Con cuál abre quien no ha elegido. */
export const ESTILO_INICIAL: EstiloLanding = 'voz';

const LLAVE = 'hazlo-estilo-landing';

/** El estilo elegido se recuerda en este teléfono. null mientras se lee. */
export function useEstiloLanding(): [EstiloLanding | null, (e: EstiloLanding) => void] {
  const [estilo, setEstilo] = useState<EstiloLanding | null>(null);
  useEffect(() => {
    let vivo = true;
    AsyncStorage.getItem(LLAVE)
      .catch(() => null)
      .then((v) => {
        if (vivo) setEstilo(ESTILOS.find((e) => e.k === v)?.k ?? ESTILO_INICIAL);
      });
    return () => {
      vivo = false;
    };
  }, []);
  const elegir = (e: EstiloLanding) => {
    setEstilo(e);
    AsyncStorage.setItem(LLAVE, e).catch(() => {});
  };
  return [estilo, elegir];
}

/** Dónde quedó lo fijo: los fondos se acomodan a eso, no a una pantalla modelo. */
export interface MarcoLanding {
  ancho: number;
  alto: number;
  /** Dónde empieza el título y dónde la caja de búsqueda. */
  titulo: number;
  caja: number;
  /** El espacio libre entre la caja y «¿Qué quieres hacer?». */
  hueco: { y: number; alto: number };
}

// ── Piezas comunes ───────────────────────────────────────────────────────────

/** Un color que tapa más o menos según la altura: así el texto siempre se lee. */
function Velo({ rgb, alto, puntos }: { rgb: string; alto: number; puntos: [y: number, tapa: number][] }) {
  const color = (tapa: number) => `rgba(${rgb},${tapa})`;
  // En pantallas bajas dos puntos pueden cruzarse: nunca van para atrás.
  const lugares = puntos.reduce<number[]>((a, [y]) => [...a, Math.max(a.length ? a[a.length - 1] : 0, Math.min(1, Math.max(0, y / alto)))], []);
  const colores = puntos.map(([, tapa]) => color(tapa));
  return (
    <LinearGradient
      colors={[colores[0], colores[1], ...colores.slice(2)]}
      locations={[lugares[0], lugares[1], ...lugares.slice(2)]}
      style={StyleSheet.absoluteFill}
    />
  );
}

/** De 0 a 1 una sola vez, cuando `listo`. */
function useEntrada(listo: boolean, duracion: number, demora = 0) {
  const p = useState(() => new Animated.Value(0))[0];
  const quieto = useReduceMotion();
  useEffect(() => {
    if (!listo) return;
    if (quieto) {
      p.setValue(1);
      return;
    }
    const a = Animated.timing(p, { toValue: 1, duration: duracion, delay: demora, easing: EASE.inOut, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [p, listo, quieto, duracion, demora]);
  return p;
}

/** Va y viene despacio entre 1 y `minimo`, sin parar. */
function useRespiro(minimo: number, duracion: number) {
  const p = useState(() => new Animated.Value(1))[0];
  const quieto = useReduceMotion();
  useEffect(() => {
    if (quieto) {
      p.setValue(1);
      return;
    }
    const a = bucle(
      Animated.sequence([
        Animated.timing(p, { toValue: minimo, duration: duracion, easing: EASE.inOut, useNativeDriver: true }),
        Animated.timing(p, { toValue: 1, duration: duracion, easing: EASE.inOut, useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [p, quieto, minimo, duracion]);
  return p;
}

/** Descubre lo de adentro como cortina: dos cajas que corren al revés (solo transform). */
function Cortina({ p, ancho, alto, eje, children }: { p: Animated.Value; ancho: number; alto: number; eje: 'x' | 'y'; children: React.ReactNode }) {
  const largo = eje === 'x' ? ancho : alto;
  const fuera = p.interpolate({ inputRange: [0, 1], outputRange: [-largo, 0] });
  const dentro = p.interpolate({ inputRange: [0, 1], outputRange: [largo, 0] });
  return (
    <Animated.View style={{ width: ancho, height: alto, overflow: 'hidden', transform: [eje === 'x' ? { translateX: fuera } : { translateY: fuera }] }}>
      <Animated.View style={{ width: ancho, height: alto, transform: [eje === 'x' ? { translateX: dentro } : { translateY: dentro }] }}>{children}</Animated.View>
    </Animated.View>
  );
}

const llenar = { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' } as const;

// ── Mapa con ruta ────────────────────────────────────────────────────────

const RUTA = 'M66 572C120 572 118 512 176 500S250 484 262 440S292 392 314 392';
const CALLES_V = Array.from({ length: 16 }, (_, i) => `M${-320 + i * 74} -200V1100`).join('');
const CALLES_H = Array.from({ length: 21 }, (_, i) => `M-320 ${-180 + i * 62}H820`).join('');
// Lo que ocupa la ruta con su pin, en las medidas del dibujo.
const VISTA_RUTA = { x: 40, y: 312, ancho: 312, alto: 282 };

function FondoRuta({ m }: { m: MarcoLanding }) {
  const vista = `${VISTA_RUTA.x} ${VISTA_RUTA.y} ${VISTA_RUTA.ancho} ${VISTA_RUTA.alto}`;
  // Las calles se asoman un poco detrás de la caja y de la pregunta, ya difusas.
  const arriba = Math.max(0, m.hueco.y - 78);
  const alto = m.hueco.alto + 78 + 60;
  const altoRuta = Math.max(80, m.hueco.alto - 26);
  const traza = useEntrada(true, 950, DUR.slow);
  return (
    <>
      <Fade style={{ position: 'absolute', left: 0, right: 0, top: arriba, height: alto, overflow: 'hidden' }}>
        <Svg width={m.ancho} height={alto} viewBox="0 250 390 440" preserveAspectRatio="xMidYMid slice">
          <Rect x={-200} y={0} width={800} height={1000} fill="#F3EBDD" />
          <G transform="rotate(-14 195 450)">
            <Rect x={50} y={384} width={148} height={62} fill="#DFE8CE" />
            <Path d={CALLES_V + CALLES_H} stroke="#FFFDF9" strokeWidth={7} fill="none" />
            <Path d="M-320 508H820" stroke="#FFFDF9" strokeWidth={15} />
          </G>
          <Path d="M420 470C360 500 350 540 296 566S220 640 200 720" stroke="#CBE3E1" strokeWidth={40} fill="none" />
        </Svg>
        <Velo
          rgb="251,247,240"
          alto={alto}
          puntos={[
            [0, 1],
            [40, 0.85],
            [100, 0],
            [alto - 110, 0],
            [alto - 56, 0.92],
            [alto, 1],
          ]}
        />
      </Fade>
      <View style={{ position: 'absolute', left: 0, top: m.hueco.y + 10 }}>
        <Cortina p={traza} ancho={m.ancho} alto={altoRuta} eje="x">
          <Svg width={m.ancho} height={altoRuta} viewBox={vista}>
            <Defs>
              <DegradadoSvg id="ruta-color" x1={66} y1={572} x2={314} y2={392} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#FFB400" />
                <Stop offset="0.5" stopColor={C.primary} />
                <Stop offset="1" stopColor={C.accent} />
              </DegradadoSvg>
            </Defs>
            <Path d={RUTA} stroke={C.accent} strokeOpacity={0.14} strokeWidth={17} fill="none" strokeLinecap="round" transform="translate(0 5)" />
            <Path d={RUTA} stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" />
            <Path d={RUTA} stroke="url(#ruta-color)" strokeWidth={7} fill="none" strokeLinecap="round" />
            <Circle cx={66} cy={572} r={13} fill="#fff" />
            <Circle cx={66} cy={572} r={8} fill="#FFB400" />
          </Svg>
        </Cortina>
      </View>
      {/* El pin cae cuando la línea llega. */}
      <Fade delay={DUR.slow + 820} desde={-16} style={{ position: 'absolute', left: 0, top: m.hueco.y + 10 }}>
        <Svg width={m.ancho} height={altoRuta} viewBox={vista}>
          <Ellipse cx={314} cy={393} rx={13} ry={4.5} fill="#7A2C00" opacity={0.22} />
          <Path d="M314 392C302 372 290 365 290 348a24 24 0 0 1 48 0C338 365 326 372 314 392Z" fill={C.accent} stroke="#fff" strokeWidth={3.5} />
          <Circle cx={314} cy={348} r={8.5} fill="#fff" />
        </Svg>
      </Fade>
    </>
  );
}

// ── La voz que se corre ──────────────────────────────────────────────────

const GLOBO = 'M150 402h90a34 34 0 0 1 34 34v22a34 34 0 0 1-34 34h-62l-30 26v-27.5a34 34 0 0 1-32-32.5v-22a34 34 0 0 1 34-34Z';
// El mismo globo con orilla cada vez más gruesa: crece parejo por todos lados.
const ECOS: [orilla: number, color: string][] = [
  [1010, '#DB4300'],
  [800, '#E04900'],
  [610, '#E65100'],
  [440, '#EC5A00'],
  [290, '#F26503'],
  [160, '#F8730C'],
  [62, '#FD8420'],
];

function Globo({ lado }: { lado: number }) {
  return (
    <Svg width={lado} height={lado} viewBox="105 365 180 180">
      <Path d={GLOBO} fill="#fff" />
    </Svg>
  );
}

function FondoVoz({ m }: { m: MarcoLanding }) {
  const e = Math.max(0.62, Math.min(1.1, m.hueco.alto / 300));
  const cx = m.ancho / 2;
  const cy = m.hueco.y + m.hueco.alto / 2;
  const lado = 180 * e;
  const sale = useEntrada(true, DUR.slow, STAGGER * 5);
  const eco = useState(() => new Animated.Value(0))[0];
  const quieto = useReduceMotion();
  useEffect(() => {
    if (quieto) return;
    const a = bucle(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(eco, { toValue: 1, duration: 2200, easing: EASE.out, useNativeDriver: true }),
        Animated.timing(eco, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [eco, quieto]);
  const caja = { position: 'absolute', left: cx - lado / 2, top: cy - lado / 2, width: lado, height: lado } as const;
  return (
    <>
      <Fade style={StyleSheet.absoluteFill}>
        <Svg width={m.ancho} height={m.alto}>
          <G transform={`translate(${cx} ${cy}) scale(${e}) translate(-195 -455)`}>
            {ECOS.map(([orilla, color]) => (
              <Path key={color} d={GLOBO} fill={color} stroke={color} strokeWidth={orilla} strokeLinejoin="round" />
            ))}
          </G>
        </Svg>
      </Fade>
      {!quieto && (
        <Animated.View style={[caja, { opacity: eco.interpolate({ inputRange: [0, 0.08, 1], outputRange: [0, 0.3, 0] }), transform: [{ scale: eco.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.75] }) }] }]}>
          <Globo lado={lado} />
        </Animated.View>
      )}
      <Animated.View style={[caja, { opacity: sale, transform: [{ scale: sale.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
        <Globo lado={lado} />
        {/* El globo va del 20 al 70 % de su caja; abajo queda el piquito. */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: lado * 0.205, height: lado * 0.5, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.bold, fontSize: 54 * e, lineHeight: 66 * e, color: C.accent, includeFontPadding: false }}>$</Text>
        </View>
      </Animated.View>
    </>
  );
}

// ── Villahermosa real: de noche y solo el río ────────────────────────────────────────────────
// Las imágenes salen de scripts/fondos-landing.ts (trazo © OpenStreetMap).

const MAPA: Record<'calles' | 'avenidas' | 'callesRio' | 'agua', ImageSourcePropType> = {
  calles: nocheCalles,
  avenidas: nocheAvenidas,
  callesRio: rioCalles,
  agua: rioAgua,
};

function FondoNoche({ m }: { m: MarcoLanding }) {
  const [listas, setListas] = useState({ calles: false, avenidas: false });
  const calles = useEntrada(listas.calles, 420);
  // La ciudad se prende: primero las colonias, luego las avenidas.
  const avenidas = useEntrada(listas.calles && listas.avenidas, 1500, 260);
  const respiro = useRespiro(0.72, 3400);
  const piso = m.hueco.y + m.hueco.alto;
  return (
    <>
      <Animated.Image source={MAPA.calles} resizeMode="cover" onLoad={() => setListas((l) => ({ ...l, calles: true }))} style={[llenar, { opacity: calles }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: avenidas }]}>
        <Animated.Image source={MAPA.avenidas} resizeMode="cover" onLoad={() => setListas((l) => ({ ...l, avenidas: true }))} style={[llenar, { opacity: respiro }]} />
      </Animated.View>
      <Velo
        rgb="11,10,12"
        alto={m.alto}
        puntos={[
          [0, 0.84],
          [70, 0.62],
          [m.titulo - 90, 0.45],
          [m.titulo - 6, 0.84],
          [m.caja - 8, 0.84],
          [m.hueco.y + 24, 0.08],
          [piso - 44, 0.12],
          [piso + 6, 0.9],
          [m.alto, 0.97],
        ]}
      />
    </>
  );
}

function FondoRio({ m }: { m: MarcoLanding }) {
  const [listas, setListas] = useState({ calles: false, agua: false });
  const calles = useEntrada(listas.calles, 420);
  // El agua baja de norte a sur.
  const agua = useEntrada(listas.calles && listas.agua, 1500, 160);
  const piso = m.hueco.y + m.hueco.alto;
  return (
    <>
      <Animated.Image source={MAPA.callesRio} resizeMode="cover" onLoad={() => setListas((l) => ({ ...l, calles: true }))} style={[llenar, { opacity: calles }]} />
      <View style={StyleSheet.absoluteFill}>
        <Cortina p={agua} ancho={m.ancho} alto={m.alto} eje="y">
          <Animated.Image source={MAPA.agua} resizeMode="cover" onLoad={() => setListas((l) => ({ ...l, agua: true }))} style={llenar} />
        </Cortina>
      </View>
      <Velo
        rgb="255,255,255"
        alto={m.alto}
        puntos={[
          [0, 0.92],
          [80, 0.62],
          [m.titulo - 90, 0.5],
          [m.titulo - 6, 0.95],
          [m.caja - 8, 0.95],
          [m.hueco.y + 30, 0],
          [piso - 54, 0.06],
          [piso + 6, 0.96],
          [m.alto, 1],
        ]}
      />
    </>
  );
}

// ── Amanecer ─────────────────────────────────────────────────────────────

function FondoAmanecer({ m }: { m: MarcoLanding }) {
  const sube = useEntrada(true, 1300, STAGGER * 2);
  const respiro = useRespiro(0.8, 3600);
  const radio = Math.max(m.ancho, 340) * 0.72;
  const cy = m.hueco.y + 20;
  return (
    <>
      <LinearGradient colors={['#FFFDFA', '#FFF4E6', '#FFDDB0', '#FFB469', '#FF9440']} locations={[0, 0.3, 0.52, 0.74, 1]} style={StyleSheet.absoluteFill} />
      <Svg width={m.ancho} height={m.alto} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="brasa" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={C.primary} stopOpacity={0.5} />
            <Stop offset="1" stopColor={C.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={m.ancho * 0.06} cy={m.alto * 0.95} rx={m.ancho * 0.78} ry={230} fill="url(#brasa)" />
        <Ellipse cx={m.ancho * 1.03} cy={m.alto * 0.855} rx={m.ancho * 0.6} ry={200} fill="url(#brasa)" opacity={0.7} />
      </Svg>
      <Animated.View
        style={{
          position: 'absolute',
          left: m.ancho / 2 - radio,
          top: cy - radio,
          opacity: Animated.multiply(sube, respiro),
          transform: [{ translateY: sube.interpolate({ inputRange: [0, 1], outputRange: [70, 0] }) }],
        }}>
        <Svg width={radio * 2} height={radio * 2}>
          <Defs>
            <RadialGradient id="sol" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFF9EC" stopOpacity={0.95} />
              <Stop offset="0.3" stopColor="#FFF4DF" stopOpacity={0.8} />
              <Stop offset="0.65" stopColor="#FFE9C8" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#FFE2B5" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={radio} cy={radio} r={radio} fill="url(#sol)" />
        </Svg>
      </Animated.View>
    </>
  );
}

// ── Lo que usa el landing ────────────────────────────────────────────────────

/** Lo que va detrás de todo. */
export function FondoLanding({ estilo, marco }: { estilo: EstiloLanding; marco: MarcoLanding }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: TEMAS[estilo].fondo, overflow: 'hidden', pointerEvents: 'none' }]}>
      {estilo === 'ruta' && <FondoRuta m={marco} />}
      {estilo === 'voz' && <FondoVoz m={marco} />}
      {estilo === 'noche' && <FondoNoche m={marco} />}
      {estilo === 'rio' && <FondoRio m={marco} />}
      {estilo === 'amanecer' && <FondoAmanecer m={marco} />}
    </View>
  );
}

/** El título: lo único que se lee antes del buscador. */
export function HeroLanding({ estilo, titulo }: { estilo: EstiloLanding; titulo: number }) {
  const tema = TEMAS[estilo];
  return (
    <Fade delay={STAGGER * 2} desde={14} style={{ alignSelf: 'stretch' }}>
      <Text style={{ fontFamily: F.bold, fontSize: titulo, lineHeight: titulo * 1.08, letterSpacing: -titulo * 0.038, color: tema.titulo, textAlign: tema.arriba ? 'left' : 'center' }}>
        Recomienda{'\n'}
        <Text style={{ color: tema.acento }}>y gana</Text>
      </Text>
    </Fade>
  );
}
