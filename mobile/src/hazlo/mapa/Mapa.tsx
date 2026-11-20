import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAtras } from '@/lib/atras';
import { invalidar } from '@/lib/datos/cache';
import { K, useMapaNegocios, useSectores } from '@/lib/datos/consultas';
import { guardarSectores, type NegocioEnMapa, type Sector } from '@/lib/services/mapa';
import { getNegocioAdmin, setUbicacionNegocio } from '@/lib/services/businesses';
import type { BusinessAdmin, Ubicacion } from '@/lib/types';
import { abrirAjustes, hayUbicacion, leerMiUbicacion, mensajeSinUbicacion } from '@/lib/ubicacion';

import { Buscador, TextoResaltado } from '../categorias/piezas';
import { GRUPOS, buscarGiros, normalizar } from '../categorias/catalogo';
import { Icon } from '../icons';
import { EditarNegocio } from '../EditarNegocio';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { useCamara } from './camara';
import { CuerpoHoja, EncabezadoHoja, type AccionesNegocio } from './ContenidoHoja';
import { FiltroGiros } from './FiltroGiros';
import { SIN_FILTRO, aLienzo, aplicarFiltro, armarBase, cercanos, contiene, type BaseMapa, type Caja, type DatosMapa, type Filtro, type NegocioMapa, type ZonaBase } from './datos';
import { CuerpoEditor, EncabezadoEditor, alternarColonia, coloresDe, type Borrador } from './EditorSectores';
import { Hoja, type Alturas, type Snap } from './Hoja';
import { ModalUbicacion } from './SelectorUbicacion';
import { Lienzo, type Modo } from './Lienzo';
import { NIVELES, TIERRA } from './paleta';
import type { Geometria } from './tipos';

/**
 * /mapa — la ciudad con los negocios activos donde de verdad están. Agrupar
 * colonias en sectores es opcional: sin sectores se ve por colonias, tal cual.
 *
 * La geometría pesa, así que llega en su propio paquete: nadie la descarga hasta
 * que abre esta pantalla.
 */
export function Mapa() {
  const [geo, setGeo] = useState<Geometria | null>(null);
  const [fallo, setFallo] = useState(false);
  const negocios = useMapaNegocios();
  const sectores = useSectores();

  const cargar = useCallback(() => {
    setFallo(false);
    import('./geometria').then(setGeo).catch(() => setFallo(true));
  }, []);
  useEffect(cargar, [cargar]);

  const reintentar = () => {
    cargar();
    if (negocios.error) negocios.refrescar();
    if (sectores.error) sectores.refrescar();
  };

  if (!geo || !negocios.datos || !sectores.datos) {
    const error = fallo || (!negocios.datos && negocios.error !== null) || (!sectores.datos && sectores.error !== null);
    return <Cargando fallo={error} reintentar={reintentar} />;
  }
  return <MapaListo geo={geo} negocios={negocios.datos} sectores={sectores.datos} refrescarNegocios={negocios.refrescar} refrescarSectores={sectores.refrescar} />;
}

function Cargando({ fallo, reintentar }: { fallo: boolean; reintentar: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: TIERRA, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <StatusBar style="dark" />
      {fallo ? (
        <Fade desde={8} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG, textAlign: 'center' }}>No pudimos abrir el mapa</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, textAlign: 'center', marginTop: 4 }}>Revisa tu conexión e inténtalo otra vez.</Text>
          <PressableScale onPress={reintentar} accessibilityRole="button" style={{ marginTop: 14, backgroundColor: C.primary, borderRadius: R.sm, paddingHorizontal: 18, paddingVertical: 10 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Reintentar</Text>
          </PressableScale>
        </Fade>
      ) : (
        <Fade delay={200}>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Abriendo el mapa…</Text>
        </Fade>
      )}
    </View>
  );
}

// «Cerca de ti»: cuántos se listan y hasta dónde entra un negocio en el encuadre.
const CERCANOS = 5;
const RADIO_ENCUADRE = 2500;
// ~1.3 km de lado: con un solo punto el encuadre no se pega a la cuadra.
const LADO_MINIMO = 60;

const SOMBRA = '0 2px 10px rgba(13,13,13,0.13)';
// «box-none» solo funciona en web dentro de StyleSheet.create.
const S = StyleSheet.create({ pasaToques: { pointerEvents: 'box-none' } });

function volverAtras() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// ── Sectores | Colonias ───────────────────────────────────────────────────────
const ANCHO_OPCION = 82;

function SelectorModo({ modo, alCambiar }: { modo: Modo; alCambiar: (m: Modo) => void }) {
  const p = useState(() => new Animated.Value(modo === 'sectores' ? 0 : 1))[0];
  const reduce = useReduceMotion();
  useEffect(() => {
    const destino = modo === 'sectores' ? 0 : 1;
    if (reduce) p.setValue(destino);
    else Animated.timing(p, { toValue: destino, duration: DUR.base, easing: EASE.out, useNativeDriver: true }).start();
  }, [modo, p, reduce]);

  const opciones: [Modo, string][] = [['sectores', 'Sectores'], ['colonias', 'Colonias']];
  return (
    <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: '#fff', boxShadow: SOMBRA }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: 3,
          top: 3,
          bottom: 3,
          width: ANCHO_OPCION,
          borderRadius: 999,
          backgroundColor: FG,
          transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, ANCHO_OPCION] }) }],
        }}
      />
      {opciones.map(([m, texto]) => (
        <PressableScale key={m} onPress={() => alCambiar(m)} accessibilityRole="button" accessibilityState={{ selected: modo === m }} style={{ width: ANCHO_OPCION, paddingVertical: 7, alignItems: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: modo === m ? '#fff' : FG }}>{texto}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

function InterruptorNegocios({ activo, alCambiar }: { activo: boolean; alCambiar: () => void }) {
  return (
    <PressableScale
      onPress={alCambiar}
      accessibilityRole="switch"
      accessibilityState={{ checked: activo }}
      accessibilityLabel="Ver negocios en el mapa"
      style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: activo ? C.primary : '#fff', boxShadow: SOMBRA }}>
      <Ionicons name="storefront-outline" size={15} color={activo ? '#fff' : FG} />
    </PressableScale>
  );
}

// Filtros que se esconden cuando la hoja abierta llega hasta aquí.
function FilasFiltro({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const p = useState(() => new Animated.Value(1))[0];
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) p.setValue(visible ? 1 : 0);
    else Animated.timing(p, { toValue: visible ? 1 : 0, duration: visible ? DUR.base : DUR.fast, easing: visible ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [visible, p, reduce]);
  // Como prop: en web, «box-none» dentro del estilo de un Animated.View se pierde.
  return (
    <Animated.View pointerEvents={visible ? 'box-none' : 'none'} style={{ opacity: p }}>
      {children}
    </Animated.View>
  );
}

// ── Controles que viajan sobre la hoja ────────────────────────────────────────
function BotonMapa({
  icono,
  etiqueta,
  alTocar,
  ocupado,
  color = FG,
}: {
  icono: React.ComponentProps<typeof Ionicons>['name'];
  etiqueta: string;
  alTocar: () => void;
  ocupado?: boolean;
  color?: string;
}) {
  return (
    <PressableScale onPress={alTocar} disabled={ocupado} accessibilityRole="button" accessibilityLabel={etiqueta} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: SOMBRA }}>
      {ocupado ? <ActivityIndicator size="small" color={FG} /> : <Ionicons name={icono} size={19} color={color} />}
    </PressableScale>
  );
}

// Avisos cortos sobre el mapa (permiso de ubicación, fuera de la ciudad).
function AvisoMapa({ texto, icono, alAjustes, alCerrar }: { texto: string; icono: React.ComponentProps<typeof Ionicons>['name']; alAjustes: (() => void) | null; alCerrar: () => void }) {
  return (
    <Fade desde={8} style={{ flex: 1, marginRight: 10, alignSelf: 'flex-end' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: R.md, backgroundColor: '#fff', boxShadow: SOMBRA }}>
        <Ionicons name={icono} size={16} color={C.accent} style={{ marginTop: 1 }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: F.base, fontSize: 12, lineHeight: 17, color: FG }}>{texto}</Text>
          {alAjustes && (
            <PressableScale onPress={alAjustes} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginTop: 6 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG, textDecorationLine: 'underline' }}>Abrir Ajustes</Text>
            </PressableScale>
          )}
        </View>
        <PressableScale onPress={alCerrar} hitSlop={8} accessibilityRole="button" accessibilityLabel="Cerrar aviso">
          <Ionicons name="close" size={16} color={MUTED} />
        </PressableScale>
      </View>
    </Fade>
  );
}

// Con una zona abierta la leyenda estorba: se desvanece y deja el crédito.
function Leyenda({ visible }: { visible: boolean }) {
  const p = useState(() => new Animated.Value(1))[0];
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) p.setValue(visible ? 1 : 0);
    else Animated.timing(p, { toValue: visible ? 1 : 0, duration: visible ? DUR.base : DUR.fast, easing: visible ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [visible, p, reduce]);

  return (
    <View style={[S.pasaToques, { gap: 5 }]}>
      <Animated.View style={{ opacity: p, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, boxShadow: SOMBRA }}>
        <Text style={{ fontFamily: F.semi, fontSize: 9.5, color: FG }}>Presencia</Text>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {NIVELES.map((n) => (
            <View key={n.etiqueta} style={{ width: 13, height: 8, borderRadius: 2, backgroundColor: n.muestra }} />
          ))}
        </View>
      </Animated.View>
      {/* La licencia de OpenStreetMap pide este crédito a la vista. */}
      <Text onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')} accessibilityRole="link" style={{ fontFamily: F.reg, fontSize: 9, color: 'rgba(13,13,13,0.55)' }}>
        © OpenStreetMap
      </Text>
    </View>
  );
}

// ── Búsqueda ──────────────────────────────────────────────────────────────────
type Resultado = { clave: string; titulo: string; detalle: string; icono: React.ComponentProps<typeof Ionicons>['name']; alElegir: () => void };

// Se queda montado mientras se va: nunca desaparece de golpe.
function ResultadosBusqueda({ busqueda, resultados }: { busqueda: string; resultados: Resultado[] }) {
  const visible = busqueda.trim().length > 0;
  const [montado, setMontado] = useState(visible);
  const p = useState(() => new Animated.Value(0))[0];
  const reduce = useReduceMotion();
  if (visible && !montado) setMontado(true);
  useEffect(() => {
    if (reduce) {
      p.setValue(visible ? 1 : 0);
      return;
    }
    Animated.timing(p, { toValue: visible ? 1 : 0, duration: visible ? DUR.base : DUR.fast, easing: visible ? EASE.out : EASE.in, useNativeDriver: true }).start(({ finished }) => {
      if (finished && !visible) setMontado(false);
    });
  }, [visible, p, reduce]);

  if (!visible && (!montado || reduce)) return null;
  return (
    <Animated.View
      style={{
        marginTop: 8,
        maxHeight: 320,
        borderRadius: R.md,
        backgroundColor: '#fff',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(13,13,13,0.16)',
        opacity: p,
        transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
      }}>
      {resultados.length === 0 ? (
        <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, padding: 16, textAlign: 'center' }}>No encontramos «{busqueda.trim()}» en Villahermosa.</Text>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          {resultados.map((r, i) => (
            <PressableScale key={r.clave} onPress={r.alElegir} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
              <Ionicons name={r.icono} size={17} color={C.accent} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <TextoResaltado texto={r.titulo} busqueda={busqueda} style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }} />
                <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{r.detalle}</Text>
              </View>
            </PressableScale>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
}

// ── La pantalla ───────────────────────────────────────────────────────────────
// Lo que ocupan la búsqueda y los selectores, para centrar lo que importa debajo.
const ALTO_BARRA = 150;

function escalaParaCaja(caja: Caja, ancho: number, alto: number): number {
  const orilla = 56;
  return Math.min(ancho / (caja.x1 - caja.x0 + orilla), alto / (caja.y1 - caja.y0 + orilla));
}

function MapaListo({
  geo,
  negocios,
  sectores,
  refrescarNegocios,
  refrescarSectores,
}: {
  geo: Geometria;
  negocios: NegocioEnMapa[];
  sectores: Sector[];
  refrescarNegocios: () => Promise<void>;
  refrescarSectores: () => Promise<void>;
}) {
  const base: BaseMapa = useMemo(() => armarBase(geo, negocios, sectores), [geo, negocios, sectores]);
  const haySectores = base.sectores.length > 0;
  const [filtro, setFiltro] = useState<Filtro>(SIN_FILTRO);
  const datos: DatosMapa = useMemo(() => aplicarFiltro(base, filtro), [base, filtro]);
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const camara = useCamara(geo.ANCHO_MAPA, geo.ALTO_MAPA, 6);

  const [tam, setTam] = useState({ w: 0, h: 0 });
  const [modo, setModo] = useState<Modo>(haySectores ? 'sectores' : 'colonias');
  // Sin sectores no hay nada que ver en ese modo.
  if (!haySectores && modo === 'sectores') setModo('colonias');
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [guardandoSectores, setGuardandoSectores] = useState(false);
  const [errorSectores, setErrorSectores] = useState<string | null>(null);
  const editando = borrador !== null;
  const colores = useMemo(() => (borrador ? coloresDe(borrador) : null), [borrador]);
  // Marcar por primera vez (sin `inicial`) o mover el pin de uno que ya está.
  const [porUbicar, setPorUbicar] = useState<{ id: string; nombre: string; inicial: Ubicacion | null } | null>(null);
  const [fichaEditando, setFichaEditando] = useState<BusinessAdmin | null>(null);
  const [abriendoEdicion, setAbriendoEdicion] = useState(false);
  const [verNegocios, setVerNegocios] = useState(true);
  // Se guarda la forma; sus cifras se leen de `datos` para que sigan al filtro.
  const [seleccion, setSeleccion] = useState<ZonaBase | null>(null);
  const [grosor, setGrosor] = useState(2);
  const [pinActivo, setPinActivo] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snap>('pico');
  const [busqueda, setBusqueda] = useState('');

  // Si el filtro de giro lo esconde, su ficha se cierra con él.
  const negocioActivo = useMemo(() => datos.negocios.find((n) => n.id === pinActivo) ?? null, [datos.negocios, pinActivo]);

  const zona = useMemo(() => {
    if (!seleccion) return null;
    return (seleccion.tipo === 'sector' ? datos.sectores : datos.colonias).find((z) => z.id === seleccion.id) ?? null;
  }, [seleccion, datos]);

  const tope = insets.top + 62;
  const altoHoja = Math.max(0, tam.h - tope);
  const alturas: Alturas = {
    pico: 150 + insets.bottom,
    medio: Math.min(altoHoja, Math.round(tam.h * 0.47)),
    alto: altoHoja,
  };
  const arriba = insets.top + ALTO_BARRA;

  const encuadrar = useCallback(
    (caja: Caja, abajo: number, animar: boolean) => {
      const w = tam.w;
      const s = escalaParaCaja(caja, w, abajo - arriba);
      camara.volarA((caja.x0 + caja.x1) / 2, (caja.y0 + caja.y1) / 2, s, arriba, abajo, animar && !reduce);
      return s;
    },
    [tam.w, arriba, camara, reduce],
  );

  // «Dónde estoy»: el punto azul y los negocios a la vuelta. Al abrir el mapa
  // se pide solo; si no hay permiso, se queda la ciudad completa sin avisos.
  const [yo, setYo] = useState<{ x: number; y: number } | null>(null);
  const [ubicandome, setUbicandome] = useState(false);
  const [avisoYo, setAvisoYo] = useState<{ texto: string; ajustes: boolean; icono?: React.ComponentProps<typeof Ionicons>['name'] } | null>(null);
  const cerca = useMemo(() => (yo ? cercanos(geo, datos.negocios, yo, CERCANOS) : []), [geo, datos.negocios, yo]);
  // Si mientras llegaba la ubicación ya abrieron algo, no se les mueve el mapa.
  const ocupado = useRef(false);
  useEffect(() => {
    ocupado.current = seleccion !== null || pinActivo !== null || busqueda !== '' || borrador !== null;
  }, [seleccion, pinActivo, busqueda, borrador]);

  const ubicarme = useCallback(
    async (alAbrir: boolean) => {
      setAvisoYo(null);
      setUbicandome(true);
      const r = await leerMiUbicacion();
      setUbicandome(false);
      if (!r.ok) {
        if (!alAbrir) setAvisoYo({ texto: mensajeSinUbicacion(r.motivo), ajustes: r.motivo === 'bloqueado' });
        return;
      }
      const p = aLienzo(geo, r.lat, r.lng);
      if (p.x < 0 || p.y < 0 || p.x > geo.ANCHO_MAPA || p.y > geo.ALTO_MAPA) {
        setYo(null);
        setAvisoYo({ texto: 'Estás fuera de Villahermosa: este mapa solo cubre la ciudad.', ajustes: false });
        return;
      }
      setYo(p);
      if (alAbrir && ocupado.current) return;
      setSeleccion(null);
      setPinActivo(null);
      setSnap('medio');
      // Encuadre: tú y los 3 negocios más cercanos que estén a una distancia caminable o en coche corto.
      const vecinos = cercanos(geo, datos.negocios, p, 3).filter((c) => c.metros <= RADIO_ENCUADRE);
      let caja: Caja = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
      for (const { negocio: n } of vecinos) caja = { x0: Math.min(caja.x0, n.x), y0: Math.min(caja.y0, n.y), x1: Math.max(caja.x1, n.x), y1: Math.max(caja.y1, n.y) };
      const cx = (caja.x0 + caja.x1) / 2;
      const cy = (caja.y0 + caja.y1) / 2;
      const mw = Math.max(caja.x1 - caja.x0, LADO_MINIMO) / 2;
      const mh = Math.max(caja.y1 - caja.y0, LADO_MINIMO) / 2;
      encuadrar({ x0: cx - mw, y0: cy - mh, x1: cx + mw, y1: cy + mh }, tam.h - alturas.medio, true);
    },
    [geo, datos.negocios, encuadrar, tam.h, alturas.medio],
  );

  const pidioAlAbrir = useRef(false);
  useEffect(() => {
    if (tam.h === 0 || pidioAlAbrir.current || !hayUbicacion) return;
    pidioAlAbrir.current = true;
    // Deja terminar el acercamiento de entrada antes de volar a ti.
    const t = setTimeout(() => ubicarme(true), 450);
    return () => clearTimeout(t);
  }, [tam.h, ubicarme]);

  // Al abrir: la ciudad completa, con un acercamiento corto de entrada.
  const yaEncuadro = useRef(false);
  const alMedir = useCallback(
    (w: number, h: number) => {
      camara.medir(w, h);
      setTam({ w, h });
      if (yaEncuadro.current) return;
      yaEncuadro.current = true;
      const abajo = h - (150 + insets.bottom);
      const s = escalaParaCaja(base.caja, w, abajo - arriba);
      const cx = (base.caja.x0 + base.caja.x1) / 2;
      const cy = (base.caja.y0 + base.caja.y1) / 2;
      camara.volarA(cx, cy, s * 0.93, arriba, abajo, false);
      if (!reduce) camara.volarA(cx, cy, s, arriba, abajo, true);
    },
    [camara, base.caja, arriba, insets.bottom, reduce],
  );

  const elegirZona = useCallback(
    (elegida: ZonaBase) => {
      Keyboard.dismiss();
      setBusqueda('');
      setSeleccion(elegida);
      setPinActivo(null);
      setModo(elegida.tipo === 'sector' ? 'sectores' : 'colonias');
      setSnap('medio');
      const s = encuadrar(elegida.caja, tam.h - alturas.medio, true);
      setGrosor(2.2 / Math.min(3.5, s));
    },
    [encuadrar, tam.h, alturas.medio],
  );

  const elegirNegocio = useCallback(
    (negocio: NegocioMapa, deMapa: boolean) => {
      Keyboard.dismiss();
      setBusqueda('');
      setPinActivo(negocio.id);
      // La zona abierta se queda solo si el negocio es de ahí.
      const colonia = base.colonias.find((c) => c.id === negocio.coloniaId);
      setSeleccion((z) => (z && (z.id === colonia?.id || z.id === colonia?.sectorId) ? z : null));
      setSnap('medio');
      const abajo = tam.h - alturas.medio;
      const s = deMapa ? camara.s.get() : Math.max(camara.s.get(), 1.8);
      camara.volarA(negocio.x, negocio.y, s, arriba, abajo, !reduce);
    },
    [base, camara, tam.h, alturas.medio, arriba, reduce],
  );

  const cerrarNegocio = useCallback(() => {
    setPinActivo(null);
    if (!seleccion) setSnap('pico');
  }, [seleccion]);

  const cerrar = useCallback(() => {
    setSeleccion(null);
    setPinActivo(null);
    setSnap('pico');
    encuadrar(base.caja, tam.h - alturas.pico, true);
  }, [encuadrar, base.caja, tam.h, alturas.pico]);

  useAtras(seleccion !== null, cerrar);
  useAtras(pinActivo !== null, cerrarNegocio);

  const alTocarMapa = useCallback(
    (x: number, y: number, escala: number) => {
      Keyboard.dismiss();
      // Con resultados abiertos, tocar el mapa solo los cierra: no elige nada por accidente.
      if (busqueda.trim()) {
        setBusqueda('');
        return;
      }
      if (borrador) {
        const colonia = base.colonias.find((z) => contiene(z, x, y));
        if (!colonia) return;
        if (!borrador.activo) {
          setErrorSectores('Primero elige o crea un sector.');
          return;
        }
        setErrorSectores(null);
        setBorrador(alternarColonia(borrador, colonia.id));
        return;
      }
      // Los pines empiezan a verse desde 0.88: desde ahí también se pueden tocar.
      if (verNegocios && (escala >= 0.88 || filtro.grupo)) {
        // Medida de un dedo, no del dibujo: de lejos los pines son pequeños.
        const radio = 24 / escala;
        let mejor: NegocioMapa | null = null;
        let mejorD = radio;
        for (const n of datos.negocios) {
          const d = Math.hypot(n.x - x, n.y - y);
          if (d < mejorD) {
            mejor = n;
            mejorD = d;
          }
        }
        if (mejor) {
          elegirNegocio(mejor, true);
          return;
        }
      }
      const tocada = (modo === 'sectores' ? base.sectores : base.colonias).find((z) => contiene(z, x, y));
      if (tocada) elegirZona(tocada);
      else if (pinActivo) cerrarNegocio();
      else if (seleccion) cerrar();
    },
    [busqueda, borrador, verNegocios, filtro.grupo, datos.negocios, base, modo, seleccion, pinActivo, elegirNegocio, elegirZona, cerrar, cerrarNegocio],
  );

  const cambiarModo = useCallback(
    (m: Modo) => {
      if (m === modo) return;
      setModo(m);
      setPinActivo(null);
      // Una zona de un reparto no existe en el otro.
      if (seleccion) cerrar();
    },
    [modo, seleccion, cerrar],
  );

  const resultados: Resultado[] = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return [];
    const salida: Resultado[] = [];
    const coincide = (t: string) => normalizar(t).includes(q);
    const filtrarPor = (f: Filtro) => () => {
      Keyboard.dismiss();
      setBusqueda('');
      setFiltro(f);
    };
    if (borrador) {
      // Organizando: buscar una colonia solo lleva el mapa hasta ella.
      const irA = (z: ZonaBase) => () => {
        Keyboard.dismiss();
        setBusqueda('');
        encuadrar(z.caja, tam.h - alturas[snap], true);
      };
      for (const z of base.colonias) if (coincide(z.nombre)) salida.push({ clave: `c-${z.id}`, titulo: z.nombre, detalle: z.detalle, icono: 'location-outline', alElegir: irA(z) });
      return salida.slice(0, 8);
    }
    for (const z of base.sectores) if (coincide(z.nombre)) salida.push({ clave: `s-${z.id}`, titulo: z.nombre, detalle: `Sector · ${z.detalle}`, icono: 'layers-outline', alElegir: () => elegirZona(z) });
    for (const z of base.colonias) if (coincide(z.nombre)) salida.push({ clave: `c-${z.id}`, titulo: z.nombre, detalle: z.detalle, icono: 'location-outline', alElegir: () => elegirZona(z) });
    for (const g of GRUPOS) if (coincide(g.nombre)) salida.push({ clave: `g-${g.slug}`, titulo: g.nombre, detalle: 'Categoría · ver en el mapa', icono: g.icono, alElegir: filtrarPor({ grupo: g.slug, giro: null }) });
    for (const r of buscarGiros(busqueda).slice(0, 4)) salida.push({ clave: `r-${r.grupo.slug}-${r.giro}`, titulo: r.giro, detalle: `Giro · ${r.grupo.nombre}`, icono: r.grupo.icono, alElegir: filtrarPor({ grupo: r.grupo.slug, giro: r.giro }) });
    for (const n of base.negocios) if (coincide(n.nombre)) salida.push({ clave: `n-${n.id}`, titulo: n.nombre, detalle: n.coloniaNombre ? `${n.giro} · ${n.coloniaNombre}` : n.giro, icono: 'storefront-outline', alElegir: () => elegirNegocio(n, false) });
    return salida.slice(0, 8);
    // encuadrar, alturas y snap solo importan al tocar un resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, base, borrador, elegirZona, elegirNegocio]);

  // ── Sectores ──
  const empezarEdicion = useCallback(() => {
    Keyboard.dismiss();
    setBusqueda('');
    setSeleccion(null);
    setPinActivo(null);
    setErrorSectores(null);
    const actuales = sectores.map((s) => ({ clave: s.id, nombre: s.nombre, colonias: s.colonias.filter((id) => base.colonias.some((c) => c.id === id)) }));
    setBorrador({ sectores: actuales, activo: actuales[0]?.clave ?? null });
    setSnap('medio');
    encuadrar(base.caja, tam.h - alturas.medio, true);
  }, [sectores, base, encuadrar, tam.h, alturas.medio]);

  const cancelarEdicion = useCallback(() => {
    setBorrador(null);
    setErrorSectores(null);
    setSnap('pico');
  }, []);
  useAtras(editando, cancelarEdicion);

  const usarPropuesta = useCallback(() => {
    const propuesta = geo.SECTORES.map((s) => ({ clave: `propuesta-${s.id}`, nombre: s.nombre, colonias: geo.COLONIAS.filter((c) => c.sector === s.id).map((c) => c.id) }));
    setBorrador({ sectores: propuesta, activo: propuesta[0]?.clave ?? null });
  }, [geo]);

  const guardarEdicion = useCallback(async () => {
    if (!borrador) return;
    setErrorSectores(null);
    setGuardandoSectores(true);
    const lista = borrador.sectores
      .map((s, i) => ({ nombre: s.nombre.trim() || `Sector ${i + 1}`, colonias: s.colonias }))
      .filter((s) => s.colonias.length > 0);
    const r = await guardarSectores(lista);
    if (!r.ok) {
      setGuardandoSectores(false);
      setErrorSectores(r.error);
      return;
    }
    await refrescarSectores();
    setGuardandoSectores(false);
    setBorrador(null);
    setModo(lista.length > 0 ? 'sectores' : 'colonias');
    setSnap('pico');
  }, [borrador, refrescarSectores]);

  const nombreColonia = useCallback((id: string) => base.colonias.find((c) => c.id === id)?.nombre ?? id, [base.colonias]);

  // ── Negocios sin ubicación ──
  // Al marcar uno, en cuanto llega del servidor se abre su ficha en el mapa.
  const recienUbicado = useRef<string | null>(null);
  const ubicar = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      if (!porUbicar) return null;
      const r = await setUbicacionNegocio(porUbicar.id, { lat, lng });
      if (!r.ok) return 'No se pudo guardar la ubicación. Inténtalo otra vez.';
      recienUbicado.current = porUbicar.id;
      invalidar(K.adminNegocios);
      await refrescarNegocios();
      setPorUbicar(null);
      return null;
    },
    [porUbicar, refrescarNegocios],
  );
  useAtras(porUbicar !== null, () => setPorUbicar(null));

  // ── Ficha del negocio: mover su pin o editarla sin salir del mapa ──
  const acciones: AccionesNegocio = useMemo(
    () => ({
      abriendoEdicion,
      alMoverPin: (n) => setPorUbicar({ id: n.id, nombre: n.nombre, inicial: { lat: n.lat, lng: n.lng } }),
      alEditar: async (n) => {
        setAbriendoEdicion(true);
        try {
          const completo = await getNegocioAdmin(n.id);
          if (completo) setFichaEditando(completo);
          else setAvisoYo({ texto: 'Ese negocio ya no existe.', ajustes: false, icono: 'alert-circle-outline' });
        } catch {
          setAvisoYo({ texto: 'No pudimos abrir la ficha. Revisa tu conexión e inténtalo otra vez.', ajustes: false, icono: 'alert-circle-outline' });
        } finally {
          setAbriendoEdicion(false);
        }
      },
    }),
    [abriendoEdicion],
  );
  useAtras(fichaEditando !== null, () => setFichaEditando(null));

  useEffect(() => {
    const id = recienUbicado.current;
    if (!id) return;
    const n = base.negocios.find((x) => x.id === id);
    if (!n) return;
    recienUbicado.current = null;
    // Espera a que la ventana del selector termine de bajar.
    const t = setTimeout(() => elegirNegocio(n, false), 320);
    return () => clearTimeout(t);
  }, [base.negocios, elegirNegocio]);

  // La hoja que sube o baja a mano se lleva consigo la mitad de su recorrido: lo
  // que estabas viendo sigue centrado en el espacio que queda.
  const moverHoja = (nuevo: Snap) => {
    if (nuevo !== snap && nuevo !== 'alto' && snap !== 'alto') camara.desplazar((alturas[snap] - alturas[nuevo]) / 2, !reduce);
    setSnap(nuevo);
  };

  const centroZoom = () => ({ x: tam.w / 2, y: arriba + (tam.h - alturas[snap] - arriba) / 2 });

  return (
    <View style={{ flex: 1, backgroundColor: TIERRA }}>
      <StatusBar style="dark" />
      <Fade style={{ flex: 1 }}>
        <Lienzo
          geo={geo}
          base={base}
          datos={datos}
          camara={camara}
          modo={modo}
          claveFiltro={filtro.grupo ? `${filtro.grupo}|${filtro.giro ?? ''}` : ''}
          seleccion={seleccion}
          zona={zona}
          grosorSeleccion={grosor}
          verNegocios={verNegocios}
          pinActivo={pinActivo}
          edicion={colores}
          yo={yo}
          alMedir={alMedir}
          alTocar={alTocarMapa}
        />
      </Fade>

      {/* Velo bajo la barra: lo que pasa por debajo no compite con los botones. */}
      <LinearGradient
        colors={[`${TIERRA}F2`, `${TIERRA}00`]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: insets.top + 156, pointerEvents: 'none' }}
      />

      {tam.h > 0 && (
        <Hoja
          alturas={alturas}
          altoMax={altoHoja}
          snap={snap}
          alCambiar={moverHoja}
          encima={
            <View style={[S.pasaToques, { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }]}>
              {avisoYo ? (
                <AvisoMapa texto={avisoYo.texto} icono={avisoYo.icono ?? 'locate-outline'} alAjustes={avisoYo.ajustes ? abrirAjustes : null} alCerrar={() => setAvisoYo(null)} />
              ) : (
                <Leyenda visible={snap === 'pico' && !editando} />
              )}
              <View style={{ gap: 8 }}>
                {hayUbicacion && <BotonMapa icono={yo ? 'locate' : 'locate-outline'} color={yo ? '#1A73E8' : FG} etiqueta="Ir a mi ubicación" ocupado={ubicandome} alTocar={() => ubicarme(false)} />}
                <BotonMapa icono="add" etiqueta="Acercar" alTocar={() => { const c = centroZoom(); camara.acercar(1.6, c.x, c.y, !reduce); }} />
                <BotonMapa icono="remove" etiqueta="Alejar" alTocar={() => { const c = centroZoom(); camara.acercar(1 / 1.6, c.x, c.y, !reduce); }} />
                <BotonMapa icono="scan-outline" etiqueta="Ver toda la ciudad" alTocar={() => encuadrar(seleccion ? seleccion.caja : base.caja, tam.h - alturas[snap], true)} />
              </View>
            </View>
          }
          encabezado={
            borrador ? (
              <EncabezadoEditor guardando={guardandoSectores} alCancelar={cancelarEdicion} alGuardar={guardarEdicion} />
            ) : (
              <EncabezadoHoja negocio={negocioActivo} zona={zona} datos={datos} filtro={filtro} haySectores={haySectores} alOrganizar={empezarEdicion} alCerrar={negocioActivo ? cerrarNegocio : cerrar} />
            )
          }>
          {borrador ? (
            <CuerpoEditor
              borrador={borrador}
              totalColonias={base.colonias.length}
              nombreColonia={nombreColonia}
              sectoresPropuesta={geo.SECTORES.length}
              error={errorSectores}
              relleno={altoHoja - alturas[snap] + insets.bottom + 24}
              alCambiar={(b) => {
                setErrorSectores(null);
                setBorrador(b);
              }}
              alUsarPropuesta={usarPropuesta}
            />
          ) : (
          <CuerpoHoja
            negocio={negocioActivo}
            zona={zona}
            base={base}
            datos={datos}
            modo={modo}
            filtro={filtro}
            alCambiarFiltro={setFiltro}
            relleno={altoHoja - alturas[snap] + insets.bottom + 24}
            pinActivo={pinActivo}
            cerca={cerca}
            alElegirZona={elegirZona}
            alElegirNegocio={(n) => elegirNegocio(n, false)}
            alUbicar={(n) => setPorUbicar({ id: n.id, nombre: n.nombre, inicial: null })}
            acciones={acciones}
          />
          )}
        </Hoja>
      )}

      {/* Barra de arriba: encima de la hoja, para que la búsqueda siempre se alcance. */}
      <View style={[S.pasaToques, { position: 'absolute', left: 12, right: 12, top: insets.top + 8 }]}>
        <Fade desde={8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PressableScale onPress={() => (editando ? cancelarEdicion() : negocioActivo ? cerrarNegocio() : seleccion ? cerrar() : volverAtras())} accessibilityRole="button" accessibilityLabel={editando ? 'Salir sin guardar los sectores' : negocioActivo ? 'Cerrar la información del negocio' : seleccion ? 'Volver a toda la ciudad' : 'Volver'} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: SOMBRA }}>
              <View style={{ transform: [{ rotate: '180deg' }] }}>
                <Icon name="chevR" size={18} color={FG} />
              </View>
            </PressableScale>
            <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: R.md, boxShadow: SOMBRA }}>
              <Buscador valor={busqueda} onCambio={setBusqueda} placeholder={editando ? 'Busca una colonia' : 'Busca tu colonia o un negocio'} />
            </View>
          </View>
        </Fade>
        <FilasFiltro visible={snap !== 'alto' && !editando}>
          {/* Cada uno en su Fade: entre los dos, el mapa sigue recibiendo los toques. */}
          {haySectores ? (
            <Fade delay={STAGGER} desde={8} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              <SelectorModo modo={modo} alCambiar={cambiarModo} />
            </Fade>
          ) : (
            // Mismo alto que el selector: los filtros no brincan al crear el primer sector.
            <View style={{ height: 44 }} />
          )}
          <Fade delay={STAGGER} desde={8} style={{ position: 'absolute', right: 0, top: 8 }}>
            <InterruptorNegocios activo={verNegocios} alCambiar={() => setVerNegocios((v) => !v)} />
          </Fade>
          <Fade delay={STAGGER * 2} desde={8} style={{ marginHorizontal: -12, marginTop: 4 }}>
            <FiltroGiros negocios={base.negocios} filtro={filtro} alCambiar={setFiltro} />
          </Fade>
        </FilasFiltro>
        <View style={[S.pasaToques, { position: 'absolute', left: 0, right: 0, top: 44 }]}>
          <ResultadosBusqueda busqueda={busqueda} resultados={resultados} />
        </View>
      </View>

      <ModalUbicacion
        visible={porUbicar !== null}
        titulo={porUbicar?.nombre ?? 'el negocio'}
        inicial={porUbicar?.inicial ?? null}
        alCerrar={() => setPorUbicar(null)}
        alElegir={(u) => ubicar(u.lat, u.lng)}
      />
      <EditarNegocio
        negocio={fichaEditando}
        visible={fichaEditando !== null}
        onClose={() => setFichaEditando(null)}
        onGuardado={() => {
          // Nombre, giro o ubicación pudieron cambiar: el mapa y el panel se vuelven a leer.
          invalidar(K.adminNegocios);
          refrescarNegocios();
        }}
      />
    </View>
  );
}
