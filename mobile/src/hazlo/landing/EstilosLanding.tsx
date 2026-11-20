import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { HazloMark } from '../HazloMark';
import { bucle, DUR, EASE, Fade, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED } from '../theme';

/**
 * Tres caras para el landing, en prueba: el botón junto a «Iniciar sesión» las
 * va cambiando. Lo que no se mueve (logo, buscador, los dos botones y «Entrar»)
 * vive en Landing.tsx; aquí solo el fondo, lo de arriba del buscador y la línea
 * de abajo.
 *
 * 1 · Toldo de mercado — claro: el puesto del comercio local y sus giros.
 * 2 · Mapa vivo — oscuro: Villahermosa con pines de negocios.
 * 3 · Boca en boca — claro: la plática de WhatsApp donde ya recomiendas.
 */
export type EstiloLanding = 'mercado' | 'mapa' | 'platica';

export const ESTILOS: { k: EstiloLanding; nombre: string }[] = [
  { k: 'mercado', nombre: 'Toldo de mercado' },
  { k: 'mapa', nombre: 'Mapa vivo' },
  { k: 'platica', nombre: 'Boca en boca' },
];

/** Colores de lo fijo (logo, sesión, botón secundario) según el fondo. */
export interface TemaLanding {
  oscuro: boolean;
  fondo: string;
}

export const TEMAS: Record<EstiloLanding, TemaLanding> = {
  mercado: { oscuro: false, fondo: '#FFF8EF' },
  mapa: { oscuro: true, fondo: '#121212' },
  platica: { oscuro: false, fondo: '#FFFFFF' },
};

const LLAVE = 'hazlo-estilo-landing';

/** El estilo elegido se recuerda en este teléfono. null mientras se lee. */
export function useEstiloLanding(): [EstiloLanding | null, (e: EstiloLanding) => void] {
  const [estilo, setEstilo] = useState<EstiloLanding | null>(null);
  useEffect(() => {
    let vivo = true;
    AsyncStorage.getItem(LLAVE)
      .catch(() => null)
      .then((v) => {
        if (vivo) setEstilo(ESTILOS.some((e) => e.k === v) ? (v as EstiloLanding) : 'mercado');
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

type IconoIon = React.ComponentProps<typeof Ionicons>['name'];

// ── Fondos ────────────────────────────────────────────────────────────────────

/** El toldo de rayas del puesto: cae bajo el logo. */
function Toldo({ ancho }: { ancho: number }) {
  const RAYA = 23;
  const n = Math.ceil(ancho / RAYA) + 1;
  return (
    <Svg width={ancho} height={72}>
      <Rect width={ancho} height={6} fill={C.accent} />
      {Array.from({ length: n }, (_, i) => {
        const x = i * RAYA;
        return <Path key={i} d={`M${x} 6h${RAYA}v46q${-RAYA / 2} 20 ${-RAYA} 0Z`} fill={i % 2 === 0 ? C.primary : '#FFFFFF'} stroke={C.accent} strokeOpacity={0.3} strokeWidth={1} />;
      })}
    </Svg>
  );
}

/** Calles, río y manzanas a oscuras: se estira a todo el cuadro. */
function Calles() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 370 824" preserveAspectRatio="xMidYMid slice">
      <Path d="M250 -10C230 120 300 200 260 300S180 470 230 560S320 700 300 840" stroke="#16323A" strokeWidth={26} fill="none" />
      <Path d="M-10 180L380 140M-10 260L380 230M-10 350L380 330M-10 520L380 500M-10 600L380 610M40 -10L80 840M130 -10L150 840M220 -10L210 840M300 -10L330 840" stroke="#262626" strokeWidth={1.2} fill="none" />
      <Path d="M-10 300C90 280 120 380 200 370S330 300 380 320" stroke="#3A2A1C" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Rect x={60} y={190} width={58} height={34} rx={6} fill="#1A1A1A" />
      <Rect x={150} y={240} width={48} height={60} rx={6} fill="#1A1A1A" />
      <Rect x={60} y={540} width={70} height={40} rx={6} fill="#1A1A1A" />
      <Rect x={290} y={540} width={44} height={50} rx={6} fill="#1A1A1A" />
    </Svg>
  );
}

/** Dos luces cálidas detrás de la plática. */
function Luces() {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <RadialGradient id="luz-a" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={C.primary} stopOpacity={0.24} />
          <Stop offset="1" stopColor={C.primary} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="luz-b" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFB400" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#FFB400" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="92%" cy="28%" r={190} fill="url(#luz-a)" />
      <Circle cx="2%" cy="52%" r={160} fill="url(#luz-b)" />
    </Svg>
  );
}

/** Lo que va detrás de todo: color, dibujo y adornos fijos. */
export function FondoLanding({ estilo, ancho, topeToldo }: { estilo: EstiloLanding; ancho: number; topeToldo: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: TEMAS[estilo].fondo, pointerEvents: 'none' }]}>
      {estilo === 'mercado' && (
        <Fade desde={-18} style={{ position: 'absolute', left: 0, right: 0, top: topeToldo }}>
          <Toldo ancho={ancho} />
        </Fade>
      )}
      {estilo === 'mapa' && (
        <Fade style={StyleSheet.absoluteFill}>
          <Calles />
        </Fade>
      )}
      {estilo === 'platica' && (
        <Fade style={StyleSheet.absoluteFill}>
          <Luces />
        </Fade>
      )}
    </View>
  );
}

// ── 1 · Toldo de mercado ─────────────────────────────────────────────────────

const GIROS: { nombre: string; icono: IconoIon; color: string; gana: string }[][] = [
  [
    { nombre: 'Taquería', icono: 'restaurant', color: '#E8590C', gana: '+$25' },
    { nombre: 'Barbería', icono: 'cut', color: '#2F9E44', gana: '+$30' },
    { nombre: 'Taller', icono: 'construct', color: '#1971C2', gana: '+$80' },
    { nombre: 'Panadería', icono: 'nutrition', color: '#B7791F', gana: '+$15' },
  ],
  [
    { nombre: 'Estética', icono: 'sparkles', color: '#C2255C', gana: '+$40' },
    { nombre: 'Plomero', icono: 'water', color: '#5F3DC4', gana: '+$60' },
    { nombre: 'Café', icono: 'cafe', color: '#8B5E34', gana: '+$15' },
    { nombre: 'Lavandería', icono: 'shirt', color: '#0C8599', gana: '+$20' },
  ],
];

function Chip({ g }: { g: (typeof GIROS)[number][number] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 6, paddingRight: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(13,13,13,0.1)', boxShadow: '0 3px 10px rgba(13,13,13,0.06)' }}>
      <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: g.color, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={g.icono} size={14} color="#fff" />
      </View>
      <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG }}>{g.nombre}</Text>
      <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: `${C.primary}1F` }}>
        <Text style={{ fontFamily: F.bold, fontSize: 10.5, color: C.accent }}>{g.gana}</Text>
      </View>
    </View>
  );
}

/**
 * Una fila de giros que corre sola, de lado a lado. Se dibuja dos veces seguidas
 * y se recorre el ancho de una: al volver al inicio no se nota el corte.
 */
function FilaGiros({ giros, sentido, demora }: { giros: (typeof GIROS)[number]; sentido: 1 | -1; demora: number }) {
  const [ancho, setAncho] = useState(0);
  const x = useState(() => new Animated.Value(0))[0];
  const quieto = useReduceMotion();
  useEffect(() => {
    if (!ancho || quieto) return;
    x.setValue(0);
    const a = bucle(Animated.timing(x, { toValue: 1, duration: ancho * 55, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [ancho, quieto, x]);
  const desde = sentido === -1 ? 0 : -ancho;
  const hasta = sentido === -1 ? -ancho : 0;
  return (
    <Fade delay={demora} desde={10} style={{ overflow: 'hidden', marginHorizontal: -26, paddingVertical: 4 }}>
      <Animated.View style={{ flexDirection: 'row', alignSelf: 'flex-start', transform: [{ translateX: ancho ? x.interpolate({ inputRange: [0, 1], outputRange: [desde, hasta] }) : -12 }] }}>
        {[0, 1].map((copia) => (
          <View key={copia} onLayout={copia === 0 ? (e) => setAncho(Math.round(e.nativeEvent.layout.width)) : undefined} style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
            {giros.map((g) => (
              <Chip key={g.nombre} g={g} />
            ))}
          </View>
        ))}
      </Animated.View>
    </Fade>
  );
}

function HeroMercado({ titulo, bajo }: { titulo: number; bajo: boolean }) {
  return (
    <View style={{ alignSelf: 'stretch', alignItems: 'center' }}>
      {!bajo && (
        <Fade delay={STAGGER * 2} desde={12}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: `${C.primary}1A`, marginBottom: 14 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, letterSpacing: 1.6, color: C.accent, textTransform: 'uppercase' }}>Hecho para el comercio local</Text>
          </View>
        </Fade>
      )}
      <Fade delay={STAGGER * 3} desde={14}>
        <Text style={{ fontFamily: F.bold, fontSize: titulo, lineHeight: titulo * 1.1, letterSpacing: -titulo * 0.034, color: FG, textAlign: 'center' }}>
          Tu recomendación{'\n'}
          <Text style={{ color: C.primary }}>vale dinero</Text>
        </Text>
      </Fade>
      <View style={{ alignSelf: 'stretch', marginTop: 16, gap: 4 }}>
        <FilaGiros giros={GIROS[0]} sentido={-1} demora={STAGGER * 4} />
        {!bajo && <FilaGiros giros={GIROS[1]} sentido={1} demora={STAGGER * 5} />}
      </View>
    </View>
  );
}

function PieMercado() {
  const caras = ['#FFD8A8', '#B2F2BB', '#A5D8FF'];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      <View style={{ flexDirection: 'row' }}>
        {caras.map((c, i) => (
          <View key={c} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c, borderWidth: 2, borderColor: TEMAS.mercado.fondo, marginLeft: i === 0 ? 0 : -8, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="person" size={11} color="rgba(13,13,13,0.35)" />
          </View>
        ))}
      </View>
      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.reg, fontSize: 12, color: MUTED }}>
        <Text style={{ fontFamily: F.semi, color: FG }}>Tus vecinos</Text> ya están recomendando
      </Text>
    </View>
  );
}

// ── 2 · Mapa vivo ─────────────────────────────────────────────────────────────

/** Pin con forma de gota y un halo que late. */
function Pin({ icono, x, y, color = C.primary, demora, tenue }: { icono: IconoIon; x: string; y: number; color?: string; demora: number; tenue?: boolean }) {
  const p = useState(() => new Animated.Value(0))[0];
  const quieto = useReduceMotion();
  useEffect(() => {
    if (quieto) return;
    const a = bucle(
      Animated.sequence([
        Animated.delay(demora),
        Animated.timing(p, { toValue: 1, duration: 1600, easing: EASE.out, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [p, quieto, demora]);
  return (
    // La opacidad tenue va adentro: en el style de Fade pisaría su entrada.
    <Fade delay={demora} desde={-14} style={{ position: 'absolute', left: x as `${number}%`, top: y }}>
      <View style={{ opacity: tenue ? 0.8 : 1 }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: -6,
          top: -6,
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: color,
          opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
          transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.5] }) }],
        }}
      />
      <View style={{ width: 34, height: 34, borderTopLeftRadius: 17, borderTopRightRadius: 17, borderBottomRightRadius: 17, backgroundColor: color, transform: [{ rotate: '-45deg' }], alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 18px ${color}99` }}>
        <View style={{ transform: [{ rotate: '45deg' }] }}>
          <Ionicons name={icono} size={16} color="#fff" />
        </View>
      </View>
      </View>
    </Fade>
  );
}

function HeroMapa({ titulo, bajo }: { titulo: number; bajo: boolean }) {
  const t = Math.min(titulo, 34);
  return (
    <View style={{ alignSelf: 'stretch' }}>
      {!bajo && (
        <Fade delay={STAGGER * 2} desde={12} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 9, paddingRight: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
            <Ionicons name="location-outline" size={13} color={C.primary} />
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#fff' }}>Villahermosa, Tabasco</Text>
          </View>
        </Fade>
      )}
      <Fade delay={STAGGER * 3} desde={14}>
        <Text style={{ fontFamily: F.bold, fontSize: t, lineHeight: t * 1.08, letterSpacing: -t * 0.034, color: '#fff' }}>
          Recomienda{'\n'}lo mejor de{'\n'}
          <Text style={{ color: C.primary, textShadowColor: 'rgba(254,120,1,0.5)', textShadowRadius: 20, textShadowOffset: { width: 0, height: 0 } }}>tu ciudad</Text>
        </Text>
      </Fade>
      {/* Los pines van en su propio espacio: nunca pisan el titular ni el buscador. */}
      <View style={{ height: bajo ? 96 : 150, marginTop: 6 }}>
        <Pin icono="restaurant" x="4%" y={bajo ? 26 : 34} color="#E8590C" demora={STAGGER * 4} />
        <Pin icono="construct" x="84%" y={bajo ? 58 : 98} color={C.accent} demora={STAGGER * 6} tenue />
        <Pin icono="cut" x="46%" y={bajo ? 54 : 92} demora={STAGGER * 5} />
        <Fade delay={STAGGER * 8} desde={8} style={{ position: 'absolute', left: '26%', right: 0, top: bajo ? 2 : 22, alignItems: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 13, color: FG }}>Barbería Don Chuy</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>
              Tamulté · 12 te recomiendan <Text style={{ fontFamily: F.bold, color: C.accent }}>+$30</Text>
            </Text>
          </View>
        </Fade>
      </View>
    </View>
  );
}

function PieMapa() {
  return (
    <View style={{ height: 56 }}>
      <Pin icono="sparkles" x="10%" y={6} color={C.accent} demora={STAGGER * 7} tenue />
      <Pin icono="cafe" x="76%" y={14} demora={STAGGER * 9} tenue />
    </View>
  );
}

// ── 3 · Boca en boca ─────────────────────────────────────────────────────────

function Burbuja({ quien, children, mia, demora }: { quien: string; children: React.ReactNode; mia?: boolean; demora: number }) {
  return (
    <Fade delay={demora} desde={10} style={{ alignSelf: mia ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
      <View
        style={{
          paddingVertical: 9,
          paddingHorizontal: 13,
          borderRadius: 18,
          borderBottomLeftRadius: mia ? 18 : 5,
          borderBottomRightRadius: mia ? 5 : 18,
          backgroundColor: mia ? C.primary : '#F1EFEC',
          boxShadow: mia ? '0 8px 20px rgba(235,78,0,0.28)' : undefined,
        }}>
        <Text style={{ fontFamily: F.semi, fontSize: 10, color: mia ? 'rgba(255,255,255,0.8)' : 'rgba(13,13,13,0.5)', marginBottom: 1 }}>{quien}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12.5, lineHeight: 18, color: mia ? '#fff' : FG }}>{children}</Text>
      </View>
    </Fade>
  );
}

/** El aviso de la comisión llega al final, deslizándose desde arriba. */
function Aviso({ demora }: { demora: number }) {
  return (
    <Fade delay={demora} desde={-12} style={{ marginHorizontal: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 18, backgroundColor: FG, boxShadow: '0 14px 30px rgba(13,13,13,0.25)' }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <HazloMark size={20} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>Hazlo Cash · ahora</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>
            Ganaste <Text style={{ color: C.primary }}>+$80.00</Text> por recomendar
          </Text>
        </View>
      </View>
    </Fade>
  );
}

function HeroPlatica({ titulo, bajo }: { titulo: number; bajo: boolean }) {
  const t = Math.min(26, Math.round(titulo * 0.72));
  return (
    <View style={{ alignSelf: 'stretch' }}>
      <Fade delay={STAGGER * 2} desde={14}>
        <Text style={{ fontFamily: F.bold, fontSize: t, lineHeight: t * 1.12, letterSpacing: -t * 0.034, color: FG }}>
          Recomendar ya lo haces.{'\n'}
          <Text style={{ color: C.primary }}>Ahora cobra por ello.</Text>
        </Text>
      </Fade>
      <View style={{ gap: 8, marginTop: 18 }}>
        <Burbuja quien="Mamá" demora={DUR.slow + STAGGER * 2}>
          ¿Conocen un buen mecánico? Se me descompuso el coche
        </Burbuja>
        <Burbuja quien="Tú" mia demora={DUR.slow + STAGGER * 8}>
          ¡Taller Ramírez! Dile que vas de mi parte: <Text style={{ fontFamily: F.bold }}>HAZLO-OD42</Text>
        </Burbuja>
        {!bajo && <Aviso demora={DUR.slow + STAGGER * 16} />}
      </View>
    </View>
  );
}

function PiePlatica() {
  return (
    <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, textAlign: 'center' }}>
      Como siempre, pero ahora <Text style={{ fontFamily: F.semi, color: FG }}>te llega dinero</Text>.
    </Text>
  );
}

// ── Lo que usa el landing ────────────────────────────────────────────────────

/** Lo que va arriba del buscador. `bajo`: pantalla chica, se quitan adornos. */
export function HeroLanding({ estilo, titulo, bajo }: { estilo: EstiloLanding; titulo: number; bajo: boolean }) {
  if (estilo === 'mapa') return <HeroMapa titulo={titulo} bajo={bajo} />;
  if (estilo === 'platica') return <HeroPlatica titulo={titulo} bajo={bajo} />;
  return <HeroMercado titulo={titulo} bajo={bajo} />;
}

/** La línea entre el buscador y los botones. */
export function PieLanding({ estilo }: { estilo: EstiloLanding }) {
  return (
    <Fade delay={STAGGER * 6} desde={8}>
      {estilo === 'mapa' ? <PieMapa /> : estilo === 'platica' ? <PiePlatica /> : <PieMercado />}
    </Fade>
  );
}
