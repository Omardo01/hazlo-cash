import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated as RNAnimated, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { DUR, EASE, Fade, useReduceMotion } from '../motion';
import { C, F, FG } from '../theme';
import type { Camara } from './camara';
import type { BaseMapa, DatosMapa, NegocioMapa, Zona, ZonaBase } from './datosEjemplo';
import { AGUA, AGUA_TEXTO, CALLE, CALLE_BORDE, NIVELES, TIERRA, TRONCAL, TRONCAL_BORDE, VERDE } from './paleta';
import type { Geometria } from './tipos';

/** A partir de esta escala se montan las etiquetas de colonia y los negocios. */
const ESCALA_CERCA = 0.72;
const ESCALA_NEGOCIOS = 0.95;

export type Modo = 'sectores' | 'colonias';

// ── Capas fijas: calles, agua y verde. No se repintan nunca. ──────────────────
const CapaBase = memo(function CapaBase({ geo }: { geo: Geometria }) {
  const { CAPAS: c, ANCHO_MAPA: w, ALTO_MAPA: h } = geo;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={StyleSheet.absoluteFill}>
      <Path d={c.verde} fill={VERDE} />
      <G fill="none" stroke={AGUA} strokeLinecap="round" strokeLinejoin="round">
        <Path d={c.rioFino} strokeWidth={1.1} />
        <Path d={c.rioMedio} strokeWidth={4} />
        <Path d={c.rioGrueso} strokeWidth={8} />
      </G>
      <Path d={c.agua} fill={AGUA} fillRule="evenodd" />
      <G fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d={c.primaria} stroke={CALLE_BORDE} strokeWidth={2.9} />
        <Path d={c.troncal} stroke={TRONCAL_BORDE} strokeWidth={3.4} />
        <Path d={c.local} stroke={CALLE} strokeWidth={0.55} />
        <Path d={c.terciaria} stroke={CALLE} strokeWidth={1} />
        <Path d={c.secundaria} stroke={CALLE} strokeWidth={1.4} />
        <Path d={c.primaria} stroke={CALLE} strokeWidth={2.1} />
        <Path d={c.troncal} stroke={TRONCAL} strokeWidth={2.6} />
      </G>
    </Svg>
  );
});

// ── Zonas: el reparto de la ciudad, pintado por presencia. ────────────────────
const CapaZonas = memo(function CapaZonas({ zonas, ancho, alto, finas }: { zonas: Zona[]; ancho: number; alto: number; finas: boolean }) {
  return (
    <Svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} style={StyleSheet.absoluteFill}>
      {zonas.map((z) => (
        <Path
          key={z.id}
          d={z.d}
          fill={NIVELES[z.nivel].relleno}
          fillRule="evenodd"
          stroke={finas ? 'rgba(235,78,0,0.28)' : 'rgba(235,78,0,0.5)'}
          strokeWidth={finas ? 0.45 : 0.9}
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
});

// Al cambiar de reparto o de giro, el mapa nuevo entra encima del anterior y este
// se quita cuando ya quedó tapado: el color cambia sin parpadeo.
function ZonasCruzadas({ clave, zonas, ancho, alto, finas }: { clave: string; zonas: Zona[]; ancho: number; alto: number; finas: boolean }) {
  const [capas, setCapas] = useState([{ clave, zonas, finas }]);

  useEffect(() => {
    setCapas((c) => (c[c.length - 1].clave === clave ? c : [...c.slice(-1), { clave, zonas, finas }]));
    const t = setTimeout(() => setCapas((c) => c.slice(-1)), DUR.base + 60);
    return () => clearTimeout(t);
    // La clave ya resume el cambio de zonas y de grosor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return (
    <>
      {capas.map((c) => (
        <Fade key={c.clave} style={StyleSheet.absoluteFill}>
          <CapaZonas zonas={c.zonas} ancho={ancho} alto={alto} finas={c.finas} />
        </Fade>
      ))}
    </>
  );
}

// La zona elegida vive en su propio SVG, del tamaño de la zona: entra y sale con
// opacidad nativa sin repintar la ciudad entera.
function ZonaResaltada({ zona, grosor }: { zona: ZonaBase | null; grosor: number }) {
  // Sigue pintando la última zona mientras se desvanece.
  const [ultima, setUltima] = useState(zona);
  const opacidad = useState(() => new RNAnimated.Value(0))[0];
  const reduce = useReduceMotion();
  if (zona && zona !== ultima) setUltima(zona);

  useEffect(() => {
    if (reduce) {
      opacidad.setValue(zona ? 1 : 0);
      return;
    }
    if (zona) {
      opacidad.setValue(0);
      RNAnimated.timing(opacidad, { toValue: 1, duration: DUR.base, easing: EASE.out, useNativeDriver: true }).start();
      return;
    }
    RNAnimated.timing(opacidad, { toValue: 0, duration: DUR.fast, easing: EASE.in, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setUltima(null);
    });
  }, [zona, opacidad, reduce]);

  const visible = zona ?? (reduce ? null : ultima);
  if (!visible) return null;
  const orilla = 6;
  const { caja } = visible;
  const w = caja.x1 - caja.x0 + orilla * 2;
  const h = caja.y1 - caja.y0 + orilla * 2;
  return (
    <RNAnimated.View style={{ position: 'absolute', left: caja.x0 - orilla, top: caja.y0 - orilla, width: w, height: h, opacity: opacidad, pointerEvents: 'none' }}>
      <Svg width={w} height={h} viewBox={`${caja.x0 - orilla} ${caja.y0 - orilla} ${w} ${h}`}>
        <Path d={visible.d} fill={`${C.primary}38`} fillRule="evenodd" stroke={FG} strokeWidth={grosor} strokeLinejoin="round" />
      </Svg>
    </RNAnimated.View>
  );
}

// ── Lo que flota sobre el mapa: conserva su tamaño aunque el mapa se acerque. ──
function Flotante({
  camara,
  x,
  y,
  desde,
  hasta,
  crecer,
  arriba,
  children,
}: {
  camara: Camara;
  x: number;
  y: number;
  /** Escala a la que aparece. */
  desde: number;
  /** Escala a la que se va. */
  hasta?: number;
  /** Crece con el acercamiento: de `[escala, tamaño]` a `[escala, tamaño]`. */
  crecer?: [number, number, number, number];
  /** Encima de los demás: el negocio elegido no queda tapado. */
  arriba?: boolean;
  children: React.ReactNode;
}) {
  const estilo = useAnimatedStyle(() => {
    const s = camara.s.get();
    const entra = interpolate(s, [desde * 0.93, desde], [0, 1], Extrapolation.CLAMP);
    const sale = hasta === undefined ? 1 : interpolate(s, [hasta, hasta * 1.08], [1, 0], Extrapolation.CLAMP);
    return {
      opacity: entra * sale,
      transform: [
        { translateX: camara.tx.get() + x * s },
        { translateY: camara.ty.get() + y * s },
        { scale: crecer ? interpolate(s, [crecer[0], crecer[2]], [crecer[1], crecer[3]], Extrapolation.CLAMP) : 1 },
      ],
    };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none', zIndex: arriba ? 5 : 0 }, estilo]}>
      {children}
    </Animated.View>
  );
}

const CAJA_TEXTO = 180;

function Rotulo({ texto, peso, tam, color, cursiva }: { texto: string; peso: string; tam: number; color: string; cursiva?: boolean }) {
  return (
    <View style={{ position: 'absolute', left: -CAJA_TEXTO / 2, top: -tam, width: CAJA_TEXTO, height: tam * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: peso,
          fontSize: tam,
          color,
          fontStyle: cursiva ? 'italic' : 'normal',
          textAlign: 'center',
          textShadowColor: 'rgba(255,255,255,0.95)',
          textShadowRadius: 4,
          textShadowOffset: { width: 0, height: 0 },
        }}>
        {texto}
      </Text>
    </View>
  );
}

// Un rótulo aparece a la escala en que ya no choca con los que tienen prioridad:
// conforme te acercas, la ciudad va diciendo más nombres sin encimarse.
function escalasSinChoque<T extends { x: number; y: number; nombre: string }>(items: T[], tam: number, piso: number): Map<T, number> {
  const puestos: { x: number; y: number; w: number; desde: number }[] = [];
  const salida = new Map<T, number>();
  const alto = tam + 4;
  for (const item of items) {
    const w = item.nombre.length * tam * 0.56 + 6;
    let desde = piso;
    for (const p of puestos) {
      const dx = Math.abs(item.x - p.x);
      const dy = Math.abs(item.y - p.y);
      const sinTocarX = dx > 0 ? (w + p.w) / 2 / dx : Infinity;
      const sinTocarY = dy > 0 ? alto / dy : Infinity;
      desde = Math.max(desde, Math.min(sinTocarX, sinTocarY));
    }
    salida.set(item, desde);
    puestos.push({ x: item.x, y: item.y, w, desde });
  }
  return salida;
}

type EstadoPin = 'normal' | 'apagado' | 'oculto';
const OPACIDAD_PIN: Record<EstadoPin, number> = { normal: 1, apagado: 0.28, oculto: 0 };

function Pin({ negocio, activo, estado }: { negocio: NegocioMapa; activo: boolean; estado: EstadoPin }) {
  const tam = activo ? 34 : 24;
  const p = useState(() => new RNAnimated.Value(OPACIDAD_PIN[estado]))[0];
  const reduce = useReduceMotion();

  useEffect(() => {
    const destino = OPACIDAD_PIN[estado];
    if (reduce) p.setValue(destino);
    else RNAnimated.timing(p, { toValue: destino, duration: estado === 'oculto' ? DUR.fast : DUR.base, easing: estado === 'oculto' ? EASE.in : EASE.out, useNativeDriver: true }).start();
  }, [estado, p, reduce]);

  return (
    <RNAnimated.View
      style={{
        opacity: p,
        transform: [{ scale: p.interpolate({ inputRange: [0, 0.28, 1], outputRange: [0.5, 0.85, 1] }) }],
        position: 'absolute',
        left: -tam / 2,
        top: -tam / 2,
        width: tam,
        height: tam,
        borderRadius: tam / 2,
        backgroundColor: negocio.color,
        borderWidth: 2,
        borderColor: activo ? FG : '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(13,13,13,0.28)',
      }}>
      <Ionicons name={negocio.icono} size={activo ? 17 : 12} color="#fff" />
    </RNAnimated.View>
  );
}

export function Lienzo({
  geo,
  base,
  datos,
  camara,
  modo,
  claveFiltro,
  seleccion,
  zona,
  grosorSeleccion,
  verNegocios,
  pinActivo,
  alMedir,
  alTocar,
}: {
  geo: Geometria;
  base: BaseMapa;
  datos: DatosMapa;
  camara: Camara;
  modo: Modo;
  /** Vacía cuando no hay filtro de giro. */
  claveFiltro: string;
  /** La forma de la zona elegida: no cambia al filtrar. */
  seleccion: ZonaBase | null;
  /** La misma zona con sus cifras, ya filtradas. */
  zona: Zona | null;
  grosorSeleccion: number;
  verNegocios: boolean;
  pinActivo: string | null;
  alMedir: (ancho: number, alto: number) => void;
  /** Coordenadas del lienzo y escala en el momento del toque. */
  alTocar: (x: number, y: number, escala: number) => void;
}) {
  const { tx, ty, s } = camara;
  const [cerca, setCerca] = useState(false);
  const [negociosCerca, setNegociosCerca] = useState(false);

  useAnimatedReaction(
    () => s.get() >= ESCALA_CERCA,
    (ahora, antes) => {
      if (ahora !== antes) scheduleOnRN(setCerca, ahora);
    },
  );
  useAnimatedReaction(
    () => s.get() >= ESCALA_NEGOCIOS * 0.9,
    (ahora, antes) => {
      if (ahora !== antes) scheduleOnRN(setNegociosCerca, ahora);
    },
  );

  const capa = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: s.get() }],
  }));

  const gesto = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(3)
      .onBegin(() => {
        camara.alzar();
      })
      .onChange((e) => {
        camara.mover(e.changeX, e.changeY);
      })
      .onEnd((e) => {
        camara.soltar(e.velocityX, e.velocityY);
      });
    const pellizco = Gesture.Pinch()
      .onStart((e) => {
        camara.empezarPellizco(e.focalX, e.focalY);
      })
      .onChange((e) => {
        camara.pellizcar(e.scaleChange, e.focalX, e.focalY);
      });
    const doble = Gesture.Tap()
      .numberOfTaps(2)
      .maxDistance(12)
      .onEnd((e) => {
        camara.acercarEnWorklet(1.8, e.x, e.y);
      });
    const simple = Gesture.Tap()
      .maxDistance(12)
      .onEnd((e) => {
        const escala = s.get();
        scheduleOnRN(alTocar, (e.x - tx.get()) / escala, (e.y - ty.get()) / escala, escala);
      });
    return Gesture.Simultaneous(pan, pellizco, Gesture.Exclusive(doble, simple));
  }, [camara, alTocar, s, tx, ty]);

  // Web: la rueda del ratón y el pellizco del trackpad acercan el mapa.
  const contenedor = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const nodo = contenedor.current as unknown as HTMLElement | null;
    if (!nodo) return;
    const alGirar = (e: WheelEvent) => {
      e.preventDefault();
      const caja = nodo.getBoundingClientRect();
      const fuerza = e.ctrlKey ? 0.012 : 0.0022;
      camara.acercar(Math.exp(-e.deltaY * fuerza), e.clientX - caja.left, e.clientY - caja.top, false);
    };
    nodo.addEventListener('wheel', alGirar, { passive: false });
    return () => nodo.removeEventListener('wheel', alGirar);
  }, [camara]);

  // iPhone: sin esto, Safari también acerca la página entera con dos dedos o con
  // doble toque, y el mapa parece moverse solo. Solo mientras el mapa está abierto.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const raiz = document.documentElement;
    const antes = raiz.style.touchAction;
    raiz.style.touchAction = 'pan-x pan-y';
    const impedir = (e: Event) => e.preventDefault();
    const dosDedos = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('gesturestart', impedir, { passive: false });
    document.addEventListener('gesturechange', impedir, { passive: false });
    document.addEventListener('touchmove', dosDedos, { passive: false });
    return () => {
      raiz.style.touchAction = antes;
      document.removeEventListener('gesturestart', impedir);
      document.removeEventListener('gesturechange', impedir);
      document.removeEventListener('touchmove', dosDedos);
    };
  }, []);

  const zonas = modo === 'sectores' ? datos.sectores : datos.colonias;
  const enZona = useMemo(() => (zona ? new Set(zona.lista.map((n) => n.id)) : null), [zona]);
  const visibles = useMemo(() => new Set(datos.negocios.map((n) => n.id)), [datos.negocios]);
  // Con un giro elegido importa dónde están: los negocios se ven desde lejos.
  const filtrando = claveFiltro !== '';
  const desdeNegocios = filtrando ? 0.3 : ESCALA_NEGOCIOS;

  // Las colonias con más área dicen su nombre primero.
  const escalaColonia = useMemo(() => escalasSinChoque(base.colonias, 10, 0.78), [base.colonias]);
  const escalaSector = useMemo(() => escalasSinChoque(base.sectores, 12, 0.45), [base.sectores]);

  return (
    <GestureDetector gesture={gesto}>
      <View
        ref={contenedor}
        onLayout={(e) => {
          alMedir(e.nativeEvent.layout.width, e.nativeEvent.layout.height);
          if (Platform.OS === 'web' && contenedor.current) {
            const caja = (contenedor.current as unknown as HTMLElement).getBoundingClientRect();
            camara.medirOrigen(caja.left, caja.top);
          }
        }}
        style={{ flex: 1, overflow: 'hidden', backgroundColor: TIERRA }}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: geo.ANCHO_MAPA, height: geo.ALTO_MAPA, transformOrigin: 'left top' }, capa]}>
          <CapaBase geo={geo} />
          <ZonasCruzadas clave={`${modo}|${claveFiltro}`} zonas={zonas} ancho={geo.ANCHO_MAPA} alto={geo.ALTO_MAPA} finas={modo === 'colonias'} />
          <ZonaResaltada zona={seleccion} grosor={grosorSeleccion} />
        </Animated.View>

        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
          {geo.ETIQUETAS_AGUA.map((e) => (
            <Flotante key={e.nombre} camara={camara} x={e.x} y={e.y} desde={0.82}>
              <Rotulo texto={e.nombre} peso={F.reg} tam={9.5} color={AGUA_TEXTO} cursiva />
            </Flotante>
          ))}
          {cerca &&
            base.colonias.map((z) => (
              <Flotante key={z.id} camara={camara} x={z.x} y={z.y} desde={Math.max(escalaColonia.get(z) ?? 1, modo === 'sectores' ? 1.15 : 0.78)}>
                <Rotulo texto={z.nombre} peso={F.base} tam={10} color="rgba(13,13,13,0.72)" />
              </Flotante>
            ))}
          {modo === 'sectores' &&
            base.sectores.map((z) => (
              <Flotante key={z.id} camara={camara} x={z.x} y={z.y} desde={escalaSector.get(z) ?? 0.45} hasta={1.15}>
                <Rotulo texto={z.nombre.replace(/^Ciudad /, 'Cd. ')} peso={F.semi} tam={12} color={FG} />
              </Flotante>
            ))}
          {verNegocios &&
            (negociosCerca || filtrando) &&
            base.negocios.map((n) => (
              <Flotante
                key={n.id}
                camara={camara}
                x={n.x}
                y={n.y}
                desde={n.id === pinActivo ? 0.3 : desdeNegocios}
                arriba={n.id === pinActivo}
                crecer={n.id === pinActivo ? undefined : [ESCALA_NEGOCIOS, filtrando ? 0.62 : 0.42, 1.9, 1]}>
                <Pin negocio={n} activo={n.id === pinActivo} estado={!visibles.has(n.id) ? 'oculto' : n.id !== pinActivo && enZona && !enZona.has(n.id) ? 'apagado' : 'normal'} />
              </Flotante>
            ))}
        </View>
      </View>
    </GestureDetector>
  );
}
