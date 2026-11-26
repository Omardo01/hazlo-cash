import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useVentanaApp } from '@/lib/columna-web';
import { useTecladoWeb } from '@/lib/ios-web';
import { abrirAjustes, hayUbicacion } from '@/lib/ubicacion';

import { nombreCorto, type Grupo } from '../categorias/catalogo';
import { TextoResaltado } from '../categorias/piezas';
import { Icon } from '../icons';
import { formatearDistancia } from '../mapa/datos';
import { TIERRA } from '../mapa/paleta';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { hueColors } from '../ui';
import { MapaLugares } from './MapaLugares';
import type { LugarCerca } from './motor';
import { RegistrateParaVer, Renglon, Titulo, type IconoIon } from './piezas';
import { CERCA, type Buscador, type ConteoCategoria } from './useBuscador';

const MORADO = '#5F3DC4';
const FUERA = '#4A4540';
// En columnas anchas (iPhone Duo) el mapa también crece: si no, corta los pines.
const altoMapa = (ancho: number) => Math.max(152, Math.min(210, Math.round((ancho - 56) * 0.42)));

const distancia = (c: LugarCerca) => (c.metros === null ? null : formatearDistancia(c.metros));
const donde = (c: LugarCerca) => [c.lugar.giro, c.lugar.coloniaNombre].filter(Boolean).join(' · ');
const negocios = (n: number) => (n === 1 ? '1 negocio' : `${n} negocios`);

function Chip({ icono, texto, activo, cargando, alTocar }: { icono: IconoIon; texto: string; activo: boolean; cargando?: boolean; alTocar: () => void }) {
  return (
    <PressableScale
      onPress={alTocar}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={{ flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 13, borderRadius: 999, backgroundColor: activo ? FG : 'rgba(13,13,13,0.06)' }}>
      {cargando ? <ActivityIndicator size="small" color={activo ? '#fff' : FG} /> : <Ionicons name={icono} size={15} color={activo ? '#fff' : FG} />}
      <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.semi, fontSize: 12.5, color: activo ? '#fff' : FG }}>{texto}</Text>
    </PressableScale>
  );
}

/** De dónde se parte: la ubicación del teléfono o una colonia. */
function Partida({ b }: { b: Buscador }) {
  const eligiendo = b.fase === 'colonia';
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
      {hayUbicacion && <Chip icono="locate" texto="Cerca de mí" activo={b.base === 'yo' && !eligiendo} cargando={b.ubicando} alTocar={b.usarUbicacion} />}
      <Chip icono="location-outline" texto={b.miColonia && b.base === 'colonia' ? b.miColonia.nombre : 'Elegir colonia'} activo={eligiendo || (b.base === 'colonia' && !!b.miColonia)} alTocar={() => b.abrirColonias(!eligiendo)} />
    </View>
  );
}

function Minimapa({ b, alAmpliar, alAbrir }: { b: Buscador; alAmpliar: () => void; alAbrir: (id: string) => void }) {
  const { geo, colonias } = b.indice;
  const { width } = useVentanaApp();
  const rotulo = b.zona ? (b.base === 'yo' && b.fase === 'inicio' ? `Estás en ${b.zona.nombre}` : b.zona.nombre) : null;
  const alTocarPin = useCallback((id: string | null) => {
    if (id) alAbrir(id);
  }, [alAbrir]);
  return (
    <View style={{ height: altoMapa(width), borderRadius: R.lg - 4, overflow: 'hidden', backgroundColor: TIERRA }}>
      {geo ? (
        <Fade style={{ flex: 1 }}>
          <MapaLugares geo={geo} colonias={colonias} pines={b.pines} encuadrar={b.encuadrar} zona={b.zona} yo={b.yo} chico alTocarPin={alTocarPin} />
        </Fade>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED }}>Abriendo el mapa…</Text>
        </View>
      )}
      {geo && (
        <PressableScale onPress={alAmpliar} accessibilityRole="button" accessibilityLabel="Abrir el mapa completo" hitSlop={6} style={{ position: 'absolute', right: 9, top: 9, width: 34, height: 34, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(13,13,13,0.16)' }}>
          <Ionicons name="expand-outline" size={17} color={FG} />
        </PressableScale>
      )}
      {rotulo && (
        <Fade key={rotulo} desde={5} style={{ position: 'absolute', left: 9, bottom: 9, maxWidth: '62%', flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 8, paddingRight: 11, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.95)', pointerEvents: 'none' }}>
          <Ionicons name="location-outline" size={13} color={C.accent} />
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.semi, fontSize: 11.5, color: FG }}>{rotulo}</Text>
        </Fade>
      )}
    </View>
  );
}

// ── El tercer filtro: qué categoría, en la colonia o cerca ──────────────────

function ChipCategoria({ grupo, total, activo, apagada, indice, alTocar }: { grupo: Grupo; total: number; activo: boolean; apagada: boolean; indice: number; alTocar: () => void }) {
  const corto = nombreCorto(grupo);
  return (
    <Fade delay={Math.min(indice, 7) * STAGGER} desde={6}>
      <PressableScale
        onPress={alTocar}
        disabled={apagada}
        accessibilityRole="button"
        accessibilityState={{ selected: activo, disabled: apagada }}
        accessibilityLabel={activo ? `Quitar ${corto}` : `${corto}, ${negocios(total)}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingLeft: 11, paddingRight: 12, borderRadius: 999, backgroundColor: activo ? FG : 'rgba(13,13,13,0.045)' }}>
        <Ionicons name={grupo.icono} size={15} color={activo ? '#fff' : hueColors(grupo.hue)[1]} />
        <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 12.5, color: activo ? '#fff' : FG }}>{corto}</Text>
        {/* Mismo ancho elegido o no: la cuenta cede su lugar a la cruz. */}
        <View style={{ minWidth: 10, alignItems: 'center' }}>
          {activo ? <Icon name="x" size={10} color="rgba(255,255,255,0.75)" sw={2.6} /> : <Text style={{ fontFamily: F.base, fontSize: 12, color: MUTED }}>{total}</Text>}
        </View>
      </PressableScale>
    </Fade>
  );
}

/** Abre la lista con las 12, también las que aún no tienen negocios. */
function VerTodas({ abierta, apagada, alTocar }: { abierta: boolean; apagada: boolean; alTocar: () => void }) {
  return (
    <Fade desde={6}>
      <PressableScale
        onPress={alTocar}
        disabled={apagada}
        accessibilityRole="button"
        accessibilityState={{ expanded: abierta, disabled: apagada }}
        accessibilityLabel={abierta ? 'Cerrar la lista de categorías' : 'Ver todas las categorías'}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingLeft: 11, paddingRight: 11, borderRadius: 999, backgroundColor: abierta ? FG : 'rgba(13,13,13,0.045)' }}>
        <Ionicons name="grid-outline" size={14} color={abierta ? '#fff' : FG} />
        <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 12.5, color: abierta ? '#fff' : FG }}>Ver todas</Text>
        <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={13} color={abierta ? 'rgba(255,255,255,0.75)' : MUTED} />
      </PressableScale>
    </Fade>
  );
}

/** Aparece ya elegida la colonia (o la ubicación); mientras se elige otra, se apaga. */
function Categorias({ b }: { b: Buscador }) {
  const apagada = b.fase === 'colonia';
  const reduce = useReduceMotion();
  const opacidad = useState(() => new Animated.Value(1))[0];
  useEffect(() => {
    const a = apagada ? 0.35 : 1;
    if (reduce) opacidad.setValue(a);
    else Animated.timing(opacidad, { toValue: a, duration: DUR.fast, easing: EASE.inOut, useNativeDriver: true }).start();
  }, [apagada, reduce, opacidad]);

  if (b.categorias.length === 0) return null;
  return (
    <Animated.View style={{ opacity: opacidad, marginHorizontal: -18, marginBottom: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, gap: 7 }}>
        <VerTodas abierta={b.viendoCategorias} apagada={apagada} alTocar={() => b.abrirCategorias(!b.viendoCategorias)} />
        {b.categorias.map(({ grupo, total }, i) => {
          const activo = b.grupo?.slug === grupo.slug;
          return <ChipCategoria key={grupo.slug} grupo={grupo} total={total} activo={activo} apagada={apagada} indice={i + 1} alTocar={() => b.elegirGrupo(activo ? null : grupo.slug)} />;
        })}
      </ScrollView>
    </Animated.View>
  );
}

/** Las 12: primero las que hay cerca, luego las de otras partes y al final las que aún no tienen negocios. */
function ListaCategorias({ b }: { b: Buscador }) {
  const cerca = b.todasCategorias.filter((c) => c.cerca > 0).sort((x, y) => y.cerca - x.cerca);
  const lejos = b.todasCategorias.filter((c) => c.cerca === 0 && c.total > 0).sort((x, y) => y.total - x.total);
  const vacias = b.todasCategorias.filter((c) => c.total === 0);
  const area = b.base === 'yo' && !b.colonia ? 'Cerca de ti' : b.zona ? `En ${b.zona.nombre} o cerca` : 'Cerca';
  const fila = (c: ConteoCategoria, i: number, detalle: string, vacia = false) => {
    const elegida = b.grupo?.slug === c.grupo.slug;
    return (
      <Renglon
        key={c.grupo.slug}
        indice={i}
        icono={c.grupo.icono}
        color={vacia ? FUERA : hueColors(c.grupo.hue)[1]}
        titulo={c.grupo.nombre}
        detalle={detalle}
        etiqueta={elegida ? 'Elegida' : undefined}
        alTocar={() => b.elegirGrupo(c.grupo.slug)}
      />
    );
  };
  return (
    <>
      {cerca.length > 0 && <Titulo>{area}</Titulo>}
      {cerca.map((c, i) => fila(c, i, c.total > c.cerca ? `${negocios(c.cerca)} · ${c.total} en Villahermosa` : negocios(c.cerca)))}
      {lejos.length > 0 && <Titulo demora={STAGGER * 2}>En otras partes de Villahermosa</Titulo>}
      {lejos.map((c, i) => fila(c, i, `${negocios(c.total)}, a más de ${CERCA / 1000} km`))}
      {vacias.length > 0 && (
        <Titulo demora={STAGGER * 3} cuenta={vacias.length}>
          Aún sin negocios
        </Titulo>
      )}
      {vacias.map((c, i) => fila(c, i, c.grupo.giros.slice(0, 4).join(', '), true))}
    </>
  );
}

// ── Lo que hay a tu alrededor, sin escribir nada ─────────────────────────────

function Inicio({ b, alAbrir }: { b: Buscador; alAbrir: (id: string) => void }) {
  return (
    <>
      {b.giros.length > 0 && <Titulo>{b.hayCerca ? 'Lo que hay cerca' : 'Qué puedes buscar'}</Titulo>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {b.giros.map((g, i) => (
          <Fade key={g.giro} delay={Math.min(i, 7) * STAGGER} desde={6} style={{ maxWidth: '100%' }}>
            <PressableScale
              onPress={() => b.fijar(g.giro, b.base === 'colonia' ? b.miColonia : null, g.giro)}
              accessibilityRole="button"
              accessibilityLabel={`${g.giro}, ${negocios(g.total)}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(13,13,13,0.1)' }}>
              <Ionicons name={g.lugar.grupo.icono} size={15} color={g.lugar.color} />
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.semi, fontSize: 12.5, color: FG }}>{g.giro}</Text>
              <Text style={{ fontFamily: F.base, fontSize: 12, color: MUTED }}>{g.total}</Text>
            </PressableScale>
          </Fade>
        ))}
      </View>
      {b.cercanos.length > 0 && <Titulo demora={STAGGER * 2}>{b.desdeNombre ? `Los más cercanos a ${b.desdeNombre}` : 'En Villahermosa'}</Titulo>}
      {b.cercanos.slice(0, 6).map((c, i) => (
        <Renglon key={c.lugar.id} indice={i} icono={c.lugar.grupo.icono} color={c.lugar.color} titulo={c.lugar.nombre} detalle={donde(c)} derecha={distancia(c)} alTocar={() => alAbrir(c.lugar.id)} />
      ))}
    </>
  );
}

// ── Mientras se escribe ──────────────────────────────────────────────────────

function Escribiendo({ b, alAbrir, alInvitar }: { b: Buscador; alAbrir: (id: string) => void; alInvitar: () => void }) {
  const { entendido: e, resultados: r, sugerencias: s } = b;
  const adentro = r.dentro.length;
  const total = adentro + r.fuera.length + r.sinUbicacion.length;
  const cerca = r.fuera[0];
  const confirmar = () => {
    Keyboard.dismiss();
    b.fijar(e.que, e.colonia, e.etiqueta);
  };

  if (b.cargando) return <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, padding: 18, textAlign: 'center' }}>Buscando…</Text>;
  if (total === 0) {
    return (
      <>
        <SinNada que={e.etiqueta || b.texto.trim()} alInvitar={alInvitar} />
        {s.colonias.map(({ zona, total: n }, i) => (
          <Renglon key={zona.id} indice={i} icono="location-outline" color={MORADO} titulo={zona.nombre} detalle={n > 0 ? `Todo lo que hay en la colonia · ${n}` : 'Aún sin negocios; te mostramos lo más cercano'} etiqueta="Colonia" alTocar={() => b.fijar('', zona)} />
        ))}
      </>
    );
  }
  const detalle = e.colonia
    ? adentro > 0
      ? `${adentro} en la colonia${r.fuera.length > 0 ? ` · ${r.fuera.length} más cerca` : ''}`
      : cerca
        ? `El más cercano está a ${distancia(cerca) ?? ''}`
        : 'Sin ubicación en el mapa todavía'
    : `${negocios(total)}${b.desdeNombre ? ', del más cercano al más lejano' : ''}`;

  return (
    <>
      <Fade desde={6}>
        <PressableScale onPress={confirmar} accessibilityRole="button" style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, paddingRight: 14, borderRadius: R.md + 2, backgroundColor: `${C.primary}16` }}>
          <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="search" size={18} color="#fff" sw={2.4} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 14.5, letterSpacing: -0.2, color: FG }}>
              {e.etiqueta || 'Todo'}
              {e.colonia && <Text style={{ fontFamily: F.reg }}> en </Text>}
              {e.colonia?.nombre}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 12, color: '#7A5231', marginTop: 1 }}>{detalle}</Text>
          </View>
          <Icon name="chevR" size={16} color={FG} sw={2.4} />
        </PressableScale>
      </Fade>
      {(s.giros.length > 0 || s.lugares.length > 0 || s.colonias.length > 0) && <Titulo>También encontramos</Titulo>}
      {s.giros.map((g, i) => (
        <Renglon key={`g-${g.giro}`} indice={i} icono={g.lugar.grupo.icono} color={g.lugar.color} titulo={<TextoResaltado texto={g.giro} busqueda={e.que} style={{ fontFamily: F.semi, fontSize: 14.5, color: FG }} />} detalle={`${negocios(g.total)} en Villahermosa`} etiqueta="Giro" alTocar={() => b.fijar(g.giro, e.colonia, g.giro)} />
      ))}
      {s.lugares.map((c, i) => (
        <Renglon key={`n-${c.lugar.id}`} indice={s.giros.length + i} icono="storefront-outline" color={C.accent} titulo={<TextoResaltado texto={c.lugar.nombre} busqueda={b.texto} style={{ fontFamily: F.semi, fontSize: 14.5, color: FG }} />} detalle={donde(c)} derecha={distancia(c)} etiqueta={distancia(c) ? undefined : 'Negocio'} alTocar={() => alAbrir(c.lugar.id)} />
      ))}
      {s.colonias.map(({ zona, total: n }, i) => (
        <Renglon key={`c-${zona.id}`} indice={s.giros.length + s.lugares.length + i} icono="location-outline" color={MORADO} titulo={zona.nombre} detalle={n > 0 ? `Todo lo que hay en la colonia · ${n}` : 'Aún sin negocios; te mostramos lo más cercano'} etiqueta="Colonia" alTocar={() => b.fijar('', zona)} />
      ))}
    </>
  );
}

// ── Resultados: primero la colonia, luego lo más cercano ─────────────────────

function ListaResultados({ b, alAbrir, alInvitar }: { b: Buscador; alAbrir: (id: string) => void; alInvitar: () => void }) {
  const { dentro, fuera, sinUbicacion } = b.resultados;
  const total = dentro.length + fuera.length + sinUbicacion.length;
  const que = b.que?.etiqueta ?? '';
  if (total === 0) {
    const titulo = !que && b.grupo ? `Aún no hay negocios de ${nombreCorto(b.grupo).toLowerCase()} en Hazlo Cash` : undefined;
    return <SinNada que={que || (b.colonia?.nombre ?? '')} titulo={titulo} alInvitar={alInvitar} />;
  }
  const primero = fuera[0];
  return (
    <>
      {b.colonia && dentro.length > 0 && <Titulo cuenta={dentro.length}>{`En ${b.colonia.nombre}`}</Titulo>}
      {dentro.map((c, i) => (
        <Renglon key={c.lugar.id} indice={i} numero={i + 1} color={C.accent} titulo={c.lugar.nombre} detalle={c.lugar.giro} derecha={distancia(c)} alTocar={() => alAbrir(c.lugar.id)} />
      ))}

      {b.colonia && dentro.length === 0 && (
        <Fade desde={6} style={{ marginTop: 14, padding: 13, borderRadius: R.md, backgroundColor: 'rgba(13,13,13,0.05)' }}>
          <Text style={{ fontFamily: F.base, fontSize: 13, lineHeight: 19, color: FG }}>
            {que ? `En ${b.colonia.nombre} todavía no hay «${que}».` : b.grupo ? `En ${b.colonia.nombre} todavía no hay negocios de ${nombreCorto(b.grupo).toLowerCase()}.` : `En ${b.colonia.nombre} todavía no hay negocios.`}
            {primero && distancia(primero) ? ` El más cercano está a ${distancia(primero)}${primero.lugar.coloniaNombre ? `, en ${primero.lugar.coloniaNombre}` : ''}.` : ''}
          </Text>
        </Fade>
      )}

      {fuera.length > 0 && (
        <Titulo demora={STAGGER * 2} cuenta={b.colonia ? undefined : fuera.length}>
          {b.colonia ? (dentro.length > 0 ? 'Fuera de la colonia, pero cerca' : 'Lo más cercano') : b.desdeNombre ? `Del más cercano al más lejano de ${b.desdeNombre}` : 'En Villahermosa'}
        </Titulo>
      )}
      {fuera.slice(0, b.colonia ? 8 : 30).map((c, i) => (
        <Renglon key={c.lugar.id} indice={i} numero={dentro.length + i + 1} color={b.colonia ? FUERA : C.accent} titulo={c.lugar.nombre} detalle={donde(c)} derecha={distancia(c)} alTocar={() => alAbrir(c.lugar.id)} />
      ))}

      {sinUbicacion.length > 0 && <Titulo demora={STAGGER * 3}>Aún sin ubicación en el mapa</Titulo>}
      {sinUbicacion.map((l, i) => (
        <Renglon key={l.id} indice={i} icono={l.grupo.icono} color={FUERA} titulo={l.nombre} detalle={l.giro} alTocar={() => alAbrir(l.id)} />
      ))}
    </>
  );
}

function ListaColonias({ b }: { b: Buscador }) {
  if (b.colonias.length === 0) {
    return (
      <Fade desde={6} style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG, textAlign: 'center' }}>No tenemos esa colonia en el mapa</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 3 }}>Prueba con una cercana{hayUbicacion ? ' o toca «Cerca de mí»' : ''}.</Text>
      </Fade>
    );
  }
  return (
    <>
      <Titulo>Elige tu colonia</Titulo>
      {b.colonias.map(({ zona, total }, i) => (
        <Renglon
          key={zona.id}
          indice={i}
          icono="location-outline"
          color={total > 0 ? C.accent : FUERA}
          titulo={<TextoResaltado texto={zona.nombre} busqueda={b.texto} style={{ fontFamily: F.semi, fontSize: 14.5, color: FG }} />}
          detalle={total > 0 ? negocios(total) : zona.detalle}
          alTocar={() => {
            Keyboard.dismiss();
            b.elegirColonia(zona);
          }}
        />
      ))}
    </>
  );
}

function SinNada({ que, titulo, alInvitar }: { que: string; titulo?: string; alInvitar: () => void }) {
  return (
    <Fade desde={6} style={{ paddingTop: 20, paddingBottom: 12, alignItems: 'center' }}>
      <Ionicons name="storefront-outline" size={24} color={MUTED} />
      <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginTop: 6, textAlign: 'center' }}>{titulo ?? `«${que}» aún no está en Hazlo Cash`}</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 2, textAlign: 'center' }}>{titulo ? '¿Conoces uno? Invítalo a sumarse.' : '¿Lo conoces? Invítalo a sumarse.'}</Text>
      <PressableScale onPress={alInvitar} accessibilityRole="button" style={{ marginTop: 12, paddingHorizontal: 18, height: 40, borderRadius: 999, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Invitar a un negocio</Text>
      </PressableScale>
    </Fade>
  );
}

/**
 * Lo que sale bajo la caja del landing: de dónde partes, el minimapa y la lista.
 * Sin cuenta se ve qué hay y dónde está; nada de menús ni promociones.
 */
export function PanelBusqueda({
  buscador: b,
  alAbrirLugar,
  alAmpliar,
  alRegistrarse,
  alVerTodos,
  alInvitar,
}: {
  buscador: Buscador;
  alAbrirLugar: (id: string) => void;
  alAmpliar: () => void;
  alRegistrarse: () => void;
  alVerTodos: () => void;
  alInvitar: () => void;
}) {
  const [teclado, setTeclado] = useState(0);
  useEffect(() => {
    const abre = Keyboard.addListener('keyboardDidShow', (e) => setTeclado(e.endCoordinates.height));
    const cierra = Keyboard.addListener('keyboardDidHide', () => setTeclado(0));
    return () => {
      abre.remove();
      cierra.remove();
    };
  }, []);

  const tecladoWeb = useTecladoWeb();

  // Cada vista empieza desde arriba.
  const lista = useRef<ScrollView>(null);
  const clave = `${b.fase}|${b.que?.que ?? ''}|${b.colonia?.id ?? ''}|${b.grupo?.slug ?? ''}|${b.viendoCategorias}`;
  useEffect(() => {
    lista.current?.scrollTo({ y: 0, animated: false });
  }, [clave]);

  return (
    <View style={{ flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', backgroundColor: '#fff' }}>
      <ScrollView
        ref={lista}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 26 + Math.max(teclado, tecladoWeb) }}>
        <Partida b={b} />
        {b.fallo && (
          <Fade key={b.fallo} desde={-4} style={{ marginBottom: 12, padding: 11, borderRadius: R.sm, backgroundColor: `${C.accent}12` }}>
            <Text style={{ fontFamily: F.base, fontSize: 12, lineHeight: 17, color: '#8A2E00' }}>{b.fallo}</Text>
            {b.bloqueado && abrirAjustes && (
              <PressableScale onPress={abrirAjustes} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginTop: 4, paddingVertical: 3 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG, textDecorationLine: 'underline' }}>Abrir Ajustes</Text>
              </PressableScale>
            )}
          </Fade>
        )}
        <Categorias b={b} />
        <Minimapa b={b} alAmpliar={alAmpliar} alAbrir={alAbrirLugar} />

        {b.error ? (
          <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, padding: 18, textAlign: 'center' }}>No pudimos buscar. Revisa tu conexión e inténtalo otra vez.</Text>
        ) : (
          <Fade key={clave}>
            {b.fase === 'colonia' ? (
              <ListaColonias b={b} />
            ) : b.viendoCategorias ? (
              <ListaCategorias b={b} />
            ) : b.fase === 'escribe' ? (
              <Escribiendo b={b} alAbrir={alAbrirLugar} alInvitar={alInvitar} />
            ) : b.fase === 'resultados' ? (
              <ListaResultados b={b} alAbrir={alAbrirLugar} alInvitar={alInvitar} />
            ) : (
              <Inicio b={b} alAbrir={alAbrirLugar} />
            )}
          </Fade>
        )}

        {(b.fase === 'inicio' || b.fase === 'resultados') && !b.viendoCategorias && !b.error && (
          <Fade delay={STAGGER * 4} desde={6} style={{ marginTop: 18 }}>
            <RegistrateParaVer alTocar={alRegistrarse} />
          </Fade>
        )}
        {b.fase !== 'colonia' && !b.viendoCategorias && (
          <PressableScale onPress={alVerTodos} accessibilityRole="button" style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderTopWidth: b.fase === 'escribe' ? StyleSheet.hairlineWidth : 0, borderTopColor: 'rgba(13,13,13,0.08)' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG }}>Ver todas las categorías</Text>
            <Icon name="chevR" size={13} color={FG} sw={2.2} />
          </PressableScale>
        )}
      </ScrollView>
    </View>
  );
}
