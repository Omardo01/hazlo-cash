import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAnimatedReaction } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import type { Ubicacion } from '@/lib/types';
import { abrirAjustes, hayUbicacion, leerMiUbicacion, mensajeSinUbicacion } from '@/lib/ubicacion';

import { Buscador, TextoResaltado } from '../categorias/piezas';
import { normalizar } from '../categorias/catalogo';
import { Icon } from '../icons';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { useCamara } from './camara';
import { aCoordenadas, aLienzo, armarZonas, coloniaEn, type Caja, type ZonaBase } from './datos';
import { CapaBase, Flotante, Rotulo, SuperficieMapa, escalasSinChoque } from './Lienzo';
import { MiniMapa } from './MiniMapa';
import { TIERRA } from './paleta';
import type { Geometria } from './tipos';

/**
 * Marcar dónde está un negocio: el pin se queda fijo al centro y se mueve el
 * mapa debajo, como en las apps de viajes. Sirve igual al dueño que al admin.
 */

const SOMBRA = '0 2px 10px rgba(13,13,13,0.13)';
const ALTO_TARJETA = 176;
// Para poner el pin en la puerta del negocio hay que llegar a nivel de cuadra:
// a 12× una unidad del lienzo (~22 m) mide 12 px.
const ESCALA_PIN = 12;


function escalaParaCaja(caja: Caja, ancho: number, alto: number): number {
  return Math.min(ancho / (caja.x1 - caja.x0 + 40), alto / (caja.y1 - caja.y0 + 40));
}

// Solo las orillas de las colonias: el pin es lo que debe resaltar.
const Contornos = memo(function Contornos({ colonias, ancho, alto, grosor }: { colonias: ZonaBase[]; ancho: number; alto: number; grosor: number }) {
  return (
    <Svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} style={StyleSheet.absoluteFill}>
      <Path d={colonias.map((c) => c.d).join('')} fill="none" stroke="rgba(235,78,0,0.4)" strokeWidth={grosor} strokeLinejoin="round" />
    </Svg>
  );
});

// Tres niveles de detalle según el acercamiento: [calles, orillas de colonia].
const NIVELES_TRAZO: { desde: number; calles: number; orillas: number }[] = [
  { desde: 0, calles: 1, orillas: 0.9 },
  { desde: 2.6, calles: 0.55, orillas: 0.4 },
  { desde: 5.5, calles: 0.3, orillas: 0.16 },
];

/**
 * Ciudad y orillas con el trazo de su nivel. Al cruzar de nivel, el trazo nuevo
 * entra encima del anterior y este se quita ya tapado: nada parpadea.
 */
function CapasConTrazo({ geo, colonias, camara }: { geo: Geometria; colonias: ZonaBase[]; camara: ReturnType<typeof useCamara> }) {
  const [capas, setCapas] = useState([0]);
  const quitar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setNivel = useCallback((nivel: number) => {
    setCapas((c) => (c[c.length - 1] === nivel ? c : [...c.slice(-1), nivel]));
    if (quitar.current) clearTimeout(quitar.current);
    quitar.current = setTimeout(() => setCapas((c) => c.slice(-1)), DUR.base + 60);
  }, []);
  useEffect(() => () => {
    if (quitar.current) clearTimeout(quitar.current);
  }, []);
  useAnimatedReaction(
    () => {
      const s = camara.s.get();
      let n = 0;
      for (let i = 0; i < NIVELES_TRAZO.length; i++) if (s >= NIVELES_TRAZO[i].desde) n = i;
      return n;
    },
    (ahora, antes) => {
      if (ahora !== antes) scheduleOnRN(setNivel, ahora);
    },
  );
  return (
    <>
      {capas.map((n) => (
        <Fade key={n} style={StyleSheet.absoluteFill}>
          <CapaBase geo={geo} grosor={NIVELES_TRAZO[n].calles} />
          <Contornos colonias={colonias} ancho={geo.ANCHO_MAPA} alto={geo.ALTO_MAPA} grosor={NIVELES_TRAZO[n].orillas} />
        </Fade>
      ))}
    </>
  );
}

// El pin se levanta mientras el mapa se mueve y se asienta al soltar.
function PinCentro({ x, y, moviendo }: { x: number; y: number; moviendo: boolean }) {
  const reduce = useReduceMotion();
  const [p] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduce) p.setValue(0);
    else Animated.timing(p, { toValue: moviendo ? 1 : 0, duration: moviendo ? DUR.fast : DUR.base, easing: moviendo ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [moviendo, p, reduce]);
  return (
    <View style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none' }}>
      <Animated.View style={{ position: 'absolute', left: -5, top: -2.5, width: 10, height: 5, borderRadius: 5, backgroundColor: 'rgba(13,13,13,0.28)', transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) }] }} />
      <Animated.View style={{ position: 'absolute', left: -20, top: -44, width: 40, height: 44, alignItems: 'center', transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>
        <Ionicons name="location" size={42} color={C.accent} />
      </Animated.View>
    </View>
  );
}

/** Lee qué hay bajo el pin. Vive aparte: se repinta cada que el mapa se mueve. */
function useCentro(camara: ReturnType<typeof useCamara>, cx: number, cy: number) {
  const [centro, setCentro] = useState<{ x: number; y: number } | null>(null);
  useAnimatedReaction(
    () => {
      const s = camara.s.get();
      // De a una unidad (≈ 22 m): basta para la colonia y no repinta a cada cuadro.
      return `${Math.round((cx - camara.tx.get()) / s)},${Math.round((cy - camara.ty.get()) / s)}`;
    },
    (ahora, antes) => {
      if (ahora === antes) return;
      const [x, y] = ahora.split(',').map(Number);
      scheduleOnRN(setCentro, { x, y });
    },
    [cx, cy],
  );
  return centro;
}

function TarjetaUbicacion({
  camara,
  cx,
  cy,
  colonias,
  guardando,
  error,
  ubicando,
  alUsar,
  alMiUbicacion,
  alAjustes,
}: {
  camara: ReturnType<typeof useCamara>;
  cx: number;
  cy: number;
  colonias: ZonaBase[];
  guardando: boolean;
  error: string | null;
  ubicando: boolean;
  alUsar: (x: number, y: number, colonia: string | null) => void;
  alMiUbicacion: (() => void) | null;
  /** Con el permiso bloqueado: el único camino es Ajustes. */
  alAjustes: (() => void) | null;
}) {
  const insets = useSafeAreaInsets();
  const centro = useCentro(camara, cx, cy);
  const colonia = centro ? coloniaEn(colonias, centro.x, centro.y) : null;
  return (
    <Fade desde={16} delay={STAGGER} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 16, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: '#fff', boxShadow: '0 -6px 24px rgba(13,13,13,0.12)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="location-outline" size={19} color={C.accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>
            {colonia ? colonia.nombre : 'Fuera de las colonias del mapa'}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>
            {colonia ? colonia.detalle : 'Acércate y pon el pin justo en el negocio'}
          </Text>
        </View>
        {alMiUbicacion && (
          <PressableScale onPress={alMiUbicacion} disabled={ubicando} accessibilityRole="button" accessibilityLabel="Ir a mi ubicación" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(13,13,13,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            {ubicando ? <ActivityIndicator size="small" color={FG} /> : <Ionicons name="locate" size={19} color={FG} />}
          </PressableScale>
        )}
      </View>
      {error && (
        <Fade>
          <Text style={{ fontFamily: F.base, fontSize: 12, color: C.accent, marginTop: 10 }}>{error}</Text>
          {alAjustes && (
            <PressableScale onPress={alAjustes} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginTop: 6, paddingVertical: 4 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG, textDecorationLine: 'underline' }}>Abrir Ajustes</Text>
            </PressableScale>
          )}
        </Fade>
      )}
      <PressableScale
        onPress={() => centro && alUsar(centro.x, centro.y, colonia?.nombre ?? null)}
        disabled={guardando || !centro}
        accessibilityRole="button"
        style={{ marginTop: 14, height: 50, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center', opacity: guardando ? 0.7 : 1 }}>
        {guardando ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Usar esta ubicación</Text>}
      </PressableScale>
    </Fade>
  );
}

function SelectorListo({
  geo,
  titulo,
  inicial,
  alElegir,
  alCerrar,
}: {
  geo: Geometria;
  titulo: string;
  inicial: Ubicacion | null;
  alElegir: (u: Ubicacion, colonia: string | null) => Promise<string | null> | void;
  alCerrar: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const camara = useCamara(geo.ANCHO_MAPA, geo.ALTO_MAPA, ESCALA_PIN);
  const { colonias } = useMemo(() => armarZonas(geo, []), [geo]);
  const caja = useMemo<Caja>(() => {
    const c = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const z of colonias) {
      c.x0 = Math.min(c.x0, z.caja.x0);
      c.y0 = Math.min(c.y0, z.caja.y0);
      c.x1 = Math.max(c.x1, z.caja.x1);
      c.y1 = Math.max(c.y1, z.caja.y1);
    }
    return c;
  }, [colonias]);
  const escalaColonia = useMemo(() => escalasSinChoque(colonias, 10, 0.78), [colonias]);

  const [tam, setTam] = useState({ w: 0, h: 0 });
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ubicando, setUbicando] = useState(false);
  const [moviendo, setMoviendo] = useState(false);

  const arriba = insets.top + 64;
  const abajo = tam.h - (ALTO_TARJETA + insets.bottom);
  const cx = tam.w / 2;
  const cy = arriba + (abajo - arriba) / 2;

  // Cualquier movimiento de cámara levanta el pin; se asienta cuando para.
  const quieto = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alMoverse = useCallback(() => {
    setMoviendo(true);
    if (quieto.current) clearTimeout(quieto.current);
    quieto.current = setTimeout(() => setMoviendo(false), 160);
  }, []);
  useEffect(() => () => {
    if (quieto.current) clearTimeout(quieto.current);
  }, []);
  useAnimatedReaction(
    () => camara.tx.get() + camara.ty.get() * 1.0001 + camara.s.get() * 1000,
    (ahora, antes) => {
      if (antes !== null && Math.abs(ahora - antes) > 0.5) scheduleOnRN(alMoverse);
    },
  );

  const yaEncuadro = useRef(false);
  const alMedir = useCallback(
    (w: number, h: number) => {
      camara.medir(w, h);
      setTam({ w, h });
      if (yaEncuadro.current) return;
      yaEncuadro.current = true;
      const a = insets.top + 64;
      const b = h - (ALTO_TARJETA + insets.bottom);
      if (inicial) {
        const p = aLienzo(geo, inicial.lat, inicial.lng);
        camara.volarA(p.x, p.y, 6, a, b, false);
        return;
      }
      const s = escalaParaCaja(caja, w, b - a);
      camara.volarA((caja.x0 + caja.x1) / 2, (caja.y0 + caja.y1) / 2, s * 0.93, a, b, false);
      if (!reduce) camara.volarA((caja.x0 + caja.x1) / 2, (caja.y0 + caja.y1) / 2, s, a, b, true);
    },
    [camara, insets, inicial, geo, caja, reduce],
  );

  const irA = useCallback(
    (x: number, y: number, escala: number) => {
      camara.volarA(x, y, escala, arriba, abajo, !reduce);
    },
    [camara, arriba, abajo, reduce],
  );

  const alTocar = useCallback(
    (x: number, y: number, escala: number) => {
      Keyboard.dismiss();
      if (busqueda) {
        setBusqueda('');
        return;
      }
      irA(x, y, Math.max(escala * 1.6, 2));
    },
    [busqueda, irA],
  );

  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return [];
    return colonias.filter((c) => normalizar(c.nombre).includes(q)).slice(0, 6);
  }, [busqueda, colonias]);

  const [bloqueado, setBloqueado] = useState(false);
  const miUbicacion = useCallback(async () => {
    setError(null);
    setBloqueado(false);
    setUbicando(true);
    const r = await leerMiUbicacion();
    setUbicando(false);
    if (!r.ok) {
      setError(`${mensajeSinUbicacion(r.motivo)} También puedes mover el pin a mano.`);
      setBloqueado(r.motivo === 'bloqueado');
      return;
    }
    const p = aLienzo(geo, r.lat, r.lng);
    if (p.x < 0 || p.y < 0 || p.x > geo.ANCHO_MAPA || p.y > geo.ALTO_MAPA) {
      setError('Tu ubicación está fuera del mapa de Villahermosa. Mueve el pin a mano.');
      return;
    }
    irA(p.x, p.y, 7);
  }, [geo, irA]);

  const usar = useCallback(
    async (x: number, y: number, colonia: string | null) => {
      setError(null);
      const r = alElegir(aCoordenadas(geo, x, y), colonia);
      if (!r) return;
      setGuardando(true);
      const fallo = await r;
      setGuardando(false);
      if (fallo) setError(fallo);
    },
    [alElegir, geo],
  );

  return (
    <View style={{ flex: 1, backgroundColor: TIERRA }}>
      <SuperficieMapa
        camara={camara}
        ancho={geo.ANCHO_MAPA}
        alto={geo.ALTO_MAPA}
        alMedir={alMedir}
        alTocar={alTocar}
        capa={<CapasConTrazo geo={geo} colonias={colonias} camara={camara} />}
        encima={colonias.map((z) => (
          <Flotante key={z.id} camara={camara} x={z.x} y={z.y} desde={escalaColonia.get(z) ?? 1}>
            <Rotulo texto={z.nombre} peso={F.base} tam={10} color="rgba(13,13,13,0.7)" />
          </Flotante>
        ))}
      />

      {tam.h > 0 && <PinCentro x={cx} y={cy} moviendo={moviendo} />}

      {tam.h > 0 && (
        <TarjetaUbicacion camara={camara} cx={cx} cy={cy} colonias={colonias} guardando={guardando} error={error} ubicando={ubicando} alUsar={usar} alMiUbicacion={hayUbicacion ? miUbicacion : null} alAjustes={bloqueado ? abrirAjustes : null} />
      )}

      <View style={{ position: 'absolute', left: 12, right: 12, top: insets.top + 8 }}>
        <Fade desde={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <PressableScale onPress={alCerrar} accessibilityRole="button" accessibilityLabel="Cerrar sin guardar" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: SOMBRA }}>
            <Icon name="x" size={17} color={FG} />
          </PressableScale>
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: R.md, boxShadow: SOMBRA }}>
            <Buscador valor={busqueda} onCambio={setBusqueda} placeholder={`¿En qué colonia está ${titulo}?`} />
          </View>
        </Fade>
        {resultados.length > 0 && (
          <Fade desde={-6} style={{ marginTop: 8, marginLeft: 52, borderRadius: R.md, backgroundColor: '#fff', overflow: 'hidden', boxShadow: '0 8px 24px rgba(13,13,13,0.16)' }}>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 260 }}>
              {resultados.map((c, i) => (
                <PressableScale
                  key={c.id}
                  onPress={() => {
                    Keyboard.dismiss();
                    setBusqueda('');
                    irA(c.x, c.y, 3.5);
                  }}
                  accessibilityRole="button"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
                  <Ionicons name="location-outline" size={16} color={C.accent} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <TextoResaltado texto={c.nombre} busqueda={busqueda} style={{ fontFamily: F.semi, fontSize: 13, color: FG }} />
                    <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{c.detalle}</Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </Fade>
        )}
      </View>
    </View>
  );
}

function Selector(props: { titulo: string; inicial: Ubicacion | null; alElegir: (u: Ubicacion, colonia: string | null) => Promise<string | null> | void; alCerrar: () => void }) {
  const [geo, setGeo] = useState<Geometria | null>(null);
  const [fallo, setFallo] = useState(false);
  const cargar = useCallback(() => {
    setFallo(false);
    import('./geometria').then(setGeo).catch(() => setFallo(true));
  }, []);
  useEffect(cargar, [cargar]);

  if (geo) return <SelectorListo geo={geo} {...props} />;
  return (
    <View style={{ flex: 1, backgroundColor: TIERRA, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      {fallo ? (
        <Fade desde={8} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>No pudimos abrir el mapa</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <PressableScale onPress={props.alCerrar} accessibilityRole="button" style={{ borderRadius: R.sm, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#fff' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Cerrar</Text>
            </PressableScale>
            <PressableScale onPress={cargar} accessibilityRole="button" style={{ borderRadius: R.sm, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: C.primary }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Reintentar</Text>
            </PressableScale>
          </View>
        </Fade>
      ) : (
        <Fade delay={200}>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Abriendo el mapa…</Text>
        </Fade>
      )}
    </View>
  );
}

/**
 * El selector en su propia ventana. `alElegir` puede devolver una promesa: si
 * resuelve con texto, es el error que se enseña y la ventana sigue abierta.
 */
export function ModalUbicacion({
  visible,
  titulo,
  inicial,
  alElegir,
  alCerrar,
}: {
  visible: boolean;
  titulo: string;
  inicial: Ubicacion | null;
  alElegir: (u: Ubicacion, colonia: string | null) => Promise<string | null> | void;
  alCerrar: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={alCerrar} presentationStyle="fullScreen">
      {/* Dentro de un Modal nativo los gestos y el área segura necesitan su propia raíz. */}
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>{visible && <Selector titulo={titulo} inicial={inicial} alElegir={alElegir} alCerrar={alCerrar} />}</GestureHandlerRootView>
      </SafeAreaProvider>
    </Modal>
  );
}

/** Campo de formulario: muestra si el negocio ya está en el mapa y abre el selector. */
export function CampoUbicacion({
  valor,
  alCambiar,
  titulo,
  etiqueta = 'Ubicación en el mapa',
  ayuda = 'Así aparece en el mapa de Hazlo Cash.',
}: {
  valor: Ubicacion | null;
  alCambiar: (u: Ubicacion | null) => void;
  /** Nombre del negocio, para el buscador del selector. */
  titulo: string;
  etiqueta?: string;
  ayuda?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [colonia, setColonia] = useState<string | null>(null);
  const nombre = titulo.trim() || 'tu negocio';
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>{etiqueta}</Text>
      {valor && (
        <View style={{ marginBottom: 8 }}>
          <MiniMapa ubicacion={valor} alto={130} onPress={() => setAbierto(true)} />
        </View>
      )}
      {/* Dos botones hermanos: un botón no puede ir dentro de otro. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: R.md, borderWidth: 1, borderColor: valor ? `${C.primary}55` : 'rgba(0,0,0,0.1)', backgroundColor: valor ? `${C.primary}0D` : '#fff' }}>
        <PressableScale
          onPress={() => setAbierto(true)}
          accessibilityRole="button"
          accessibilityLabel={valor ? 'Cambiar la ubicación en el mapa' : 'Marcar la ubicación en el mapa'}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 14, paddingRight: valor ? 4 : 14, paddingVertical: 12 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: valor ? C.accent : 'rgba(13,13,13,0.06)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={valor ? 'location' : 'location-outline'} size={17} color={valor ? '#fff' : FG} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>
              {valor ? (colonia ? `Marcado en ${colonia}` : 'Marcado en el mapa') : 'Marcar en el mapa'}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>{valor ? 'Toca para moverlo' : ayuda}</Text>
          </View>
          {!valor && <Icon name="chevR" size={15} color={MUTED} />}
        </PressableScale>
        {valor && (
          <PressableScale
            onPress={() => {
              setColonia(null);
              alCambiar(null);
            }}
            accessibilityRole="button"
            accessibilityLabel="Quitar del mapa"
            style={{ paddingHorizontal: 14, paddingVertical: 16 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 12, color: MUTED }}>Quitar</Text>
          </PressableScale>
        )}
      </View>
      <ModalUbicacion
        visible={abierto}
        titulo={nombre}
        inicial={valor}
        alCerrar={() => setAbierto(false)}
        alElegir={(u, c) => {
          setColonia(c);
          alCambiar(u);
          setAbierto(false);
        }}
      />
    </View>
  );
}
