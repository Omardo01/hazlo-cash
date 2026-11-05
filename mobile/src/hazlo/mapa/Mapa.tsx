import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAtras } from '@/lib/atras';

import { Buscador, TextoResaltado } from '../categorias/piezas';
import { GRUPOS, buscarGiros, normalizar } from '../categorias/catalogo';
import { Icon } from '../icons';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { useCamara } from './camara';
import { CuerpoHoja, EncabezadoHoja } from './ContenidoHoja';
import { FiltroGiros } from './FiltroGiros';
import { SIN_FILTRO, aplicarFiltro, armarBase, contiene, type BaseMapa, type Caja, type DatosMapa, type Filtro, type NegocioMapa, type ZonaBase } from './datosEjemplo';
import { Hoja, type Alturas, type Snap } from './Hoja';
import { Lienzo, type Modo } from './Lienzo';
import { NIVELES, TIERRA } from './paleta';
import type { Geometria } from './tipos';

/**
 * /mapa — la ciudad y cómo se reparte. Se puede ver por sectores o por colonias
 * porque todavía no se decide cuál será la unidad de Hazlo Cash.
 *
 * La geometría pesa, así que llega en su propio paquete: nadie la descarga hasta
 * que abre esta pantalla.
 */
export function Mapa() {
  const [geo, setGeo] = useState<Geometria | null>(null);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(() => {
    setFallo(false);
    import('./geometria').then(setGeo).catch(() => setFallo(true));
  }, []);
  useEffect(cargar, [cargar]);

  if (!geo) return <Cargando fallo={fallo} reintentar={cargar} />;
  return <MapaListo geo={geo} />;
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
function BotonMapa({ icono, etiqueta, alTocar }: { icono: React.ComponentProps<typeof Ionicons>['name']; etiqueta: string; alTocar: () => void }) {
  return (
    <PressableScale onPress={alTocar} accessibilityRole="button" accessibilityLabel={etiqueta} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: SOMBRA }}>
      <Ionicons name={icono} size={19} color={FG} />
    </PressableScale>
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

function MapaListo({ geo }: { geo: Geometria }) {
  const base: BaseMapa = useMemo(() => armarBase(geo), [geo]);
  const [filtro, setFiltro] = useState<Filtro>(SIN_FILTRO);
  const datos: DatosMapa = useMemo(() => aplicarFiltro(base, filtro), [base, filtro]);
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const camara = useCamara(geo.ANCHO_MAPA, geo.ALTO_MAPA);

  const [tam, setTam] = useState({ w: 0, h: 0 });
  const [modo, setModo] = useState<Modo>('sectores');
  const [verNegocios, setVerNegocios] = useState(true);
  // Se guarda la forma; sus cifras se leen de `datos` para que sigan al filtro.
  const [seleccion, setSeleccion] = useState<ZonaBase | null>(null);
  const [grosor, setGrosor] = useState(2);
  const [pinActivo, setPinActivo] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snap>('pico');
  const [busqueda, setBusqueda] = useState('');

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
      const colonia = base.colonias.find((c) => c.id === negocio.coloniaId);
      if (colonia) {
        const dueña = modo === 'sectores' ? base.sectores.find((s) => s.id === colonia.sectorId) : colonia;
        if (dueña && dueña.id !== seleccion?.id) {
          setSeleccion(dueña);
          setGrosor(2.2 / Math.max(1, camara.s.get()));
        }
      }
      setSnap('medio');
      const abajo = tam.h - alturas.medio;
      const s = deMapa ? camara.s.get() : Math.max(camara.s.get(), 1.8);
      camara.volarA(negocio.x, negocio.y, s, arriba, abajo, !reduce);
    },
    [base, modo, seleccion, camara, tam.h, alturas.medio, arriba, reduce],
  );

  const cerrar = useCallback(() => {
    setSeleccion(null);
    setPinActivo(null);
    setSnap('pico');
    encuadrar(base.caja, tam.h - alturas.pico, true);
  }, [encuadrar, base.caja, tam.h, alturas.pico]);

  useAtras(seleccion !== null, cerrar);

  const alTocarMapa = useCallback(
    (x: number, y: number, escala: number) => {
      Keyboard.dismiss();
      // Con resultados abiertos, tocar el mapa solo los cierra: no elige nada por accidente.
      if (busqueda.trim()) {
        setBusqueda('');
        return;
      }
      if (verNegocios && (escala >= 0.95 || filtro.grupo)) {
        const radio = 16 / escala;
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
      else if (seleccion) cerrar();
    },
    [busqueda, verNegocios, filtro.grupo, datos.negocios, base, modo, seleccion, elegirNegocio, elegirZona, cerrar],
  );

  const cambiarModo = useCallback(
    (m: Modo) => {
      if (m === modo) return;
      setModo(m);
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
    for (const z of base.sectores) if (coincide(z.nombre)) salida.push({ clave: `s-${z.id}`, titulo: z.nombre, detalle: `Sector · ${z.detalle}`, icono: 'layers-outline', alElegir: () => elegirZona(z) });
    for (const z of base.colonias) if (coincide(z.nombre)) salida.push({ clave: `c-${z.id}`, titulo: z.nombre, detalle: z.detalle, icono: 'location-outline', alElegir: () => elegirZona(z) });
    for (const g of GRUPOS) if (coincide(g.nombre)) salida.push({ clave: `g-${g.slug}`, titulo: g.nombre, detalle: 'Categoría · ver en el mapa', icono: g.icono, alElegir: filtrarPor({ grupo: g.slug, giro: null }) });
    for (const r of buscarGiros(busqueda).slice(0, 4)) salida.push({ clave: `r-${r.grupo.slug}-${r.giro}`, titulo: r.giro, detalle: `Giro · ${r.grupo.nombre}`, icono: r.grupo.icono, alElegir: filtrarPor({ grupo: r.grupo.slug, giro: r.giro }) });
    for (const n of base.negocios) if (coincide(n.nombre)) salida.push({ clave: `n-${n.id}`, titulo: n.nombre, detalle: `${n.giro} · ${n.coloniaNombre}`, icono: 'storefront-outline', alElegir: () => elegirNegocio(n, false) });
    return salida.slice(0, 8);
  }, [busqueda, base, elegirZona, elegirNegocio]);

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
              <Leyenda visible={snap === 'pico'} />
              <View style={{ gap: 8 }}>
                <BotonMapa icono="add" etiqueta="Acercar" alTocar={() => { const c = centroZoom(); camara.acercar(1.6, c.x, c.y, !reduce); }} />
                <BotonMapa icono="remove" etiqueta="Alejar" alTocar={() => { const c = centroZoom(); camara.acercar(1 / 1.6, c.x, c.y, !reduce); }} />
                <BotonMapa icono="scan-outline" etiqueta="Ver toda la ciudad" alTocar={() => encuadrar(seleccion ? seleccion.caja : base.caja, tam.h - alturas[snap], true)} />
              </View>
            </View>
          }
          encabezado={<EncabezadoHoja zona={zona} datos={datos} filtro={filtro} alCerrar={cerrar} />}>
          <CuerpoHoja
            zona={zona}
            base={base}
            datos={datos}
            modo={modo}
            filtro={filtro}
            alCambiarFiltro={setFiltro}
            relleno={altoHoja - alturas[snap] + insets.bottom + 24}
            pinActivo={pinActivo}
            alElegirZona={elegirZona}
            alElegirNegocio={(n) => elegirNegocio(n, false)}
          />
        </Hoja>
      )}

      {/* Barra de arriba: encima de la hoja, para que la búsqueda siempre se alcance. */}
      <View style={[S.pasaToques, { position: 'absolute', left: 12, right: 12, top: insets.top + 8 }]}>
        <Fade desde={8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PressableScale onPress={() => (seleccion ? cerrar() : volverAtras())} accessibilityRole="button" accessibilityLabel={seleccion ? 'Volver a toda la ciudad' : 'Volver'} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: SOMBRA }}>
              <View style={{ transform: [{ rotate: '180deg' }] }}>
                <Icon name="chevR" size={18} color={FG} />
              </View>
            </PressableScale>
            <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: R.md, boxShadow: SOMBRA }}>
              <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Busca tu colonia o un negocio" />
            </View>
          </View>
        </Fade>
        <FilasFiltro visible={snap !== 'alto'}>
          {/* Cada uno en su Fade: entre los dos, el mapa sigue recibiendo los toques. */}
          <Fade delay={STAGGER} desde={8} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
            <SelectorModo modo={modo} alCambiar={cambiarModo} />
          </Fade>
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
    </View>
  );
}
