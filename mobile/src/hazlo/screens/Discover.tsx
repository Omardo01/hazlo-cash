import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useNegocios } from '@/lib/datos/consultas';
import type { Business } from '@/lib/types';
import { buscarGiros, GRUPOS, normalizar, type Grupo } from '../categorias/catalogo';
import { girosDeNegocio, grupoDeCategoria } from '../categorias/grupoDeNegocio';
import { Buscador, IconoGrupo, TextoResaltado } from '../categorias/piezas';
import { ListaSkeleton } from '../Skeleton';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { FoodTile, hueColors, SectionHeader } from '../ui';

// Hue estable por negocio para que los tiles se vean variados sin foto real.
function hueDeId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

// Valor de "giro" que abre la lista completa del grupo (ningún giro se llama así).
const TODOS = '__todos__';

function FilaNegocio({ n, delay }: { n: Business; delay: number }) {
  return (
    <Fade
      delay={delay}
      desde={12}
      style={{ flexDirection: 'row', gap: 12, padding: 10, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
      <View style={{ width: 72, height: 72 }}>
        <FoodTile hue={hueDeId(n.id)} radius={14} height={72} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{n.nombre}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{n.categoria}</Text>
        {n.oferta && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 16, height: 16, borderRadius: 999 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>{n.oferta}</Text>
            </View>
          </View>
        )}
      </View>
    </Fade>
  );
}

// Tarjeta de un grupo del catálogo con cuántos negocios tiene hoy.
function TarjetaGrupo({ grupo, negocios, delay, onPress }: { grupo: Grupo; negocios: number; delay: number; onPress: () => void }) {
  const [a, b, c] = hueColors(grupo.hue);
  return (
    <Fade delay={delay} desde={14} style={{ flex: 1 }}>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${grupo.nombre}, ${plural(negocios, 'negocio', 'negocios')}`}
        style={{ height: 140, borderRadius: 22, overflow: 'hidden', padding: 14, justifyContent: 'space-between' }}>
        <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 0.6 }} style={StyleSheet.absoluteFill} />
        <View style={{ position: 'absolute', right: -14, bottom: -18, opacity: 0.14 }}>
          <Ionicons name={grupo.icono} size={100} color="#fff" />
        </View>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={grupo.icono} size={19} color="#fff" />
        </View>
        <View>
          <Text numberOfLines={2} style={{ fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: '#fff', letterSpacing: -0.1 }}>
            {grupo.nombre}
          </Text>
          <Text style={{ fontFamily: F.reg, fontSize: 11, color: 'rgba(255,255,255,0.88)', marginTop: 3 }}>
            {negocios > 0 ? plural(negocios, 'negocio', 'negocios') : 'Sin negocios aún'}
          </Text>
        </View>
      </PressableScale>
    </Fade>
  );
}

function Rejilla({ porGrupo, onAbrir }: { porGrupo: Map<string, Business[]>; onAbrir: (g: Grupo) => void }) {
  // Filas de dos: con flex, cada tarjeta mide la mitad del teléfono sin
  // depender del ancho de la ventana (en web la pantalla vive dentro del marco).
  const filas: Grupo[][] = [];
  for (let i = 0; i < GRUPOS.length; i += 2) filas.push(GRUPOS.slice(i, i + 2));
  return (
    <View style={{ gap: 12 }}>
      {filas.map((fila, f) => (
        <View key={fila[0].slug} style={{ flexDirection: 'row', gap: 12 }}>
          {fila.map((g, k) => (
            <TarjetaGrupo
              key={g.slug}
              grupo={g}
              negocios={porGrupo.get(g.slug)?.length ?? 0}
              delay={(3 + Math.min(f * 2 + k, 8)) * STAGGER}
              onPress={() => onAbrir(g)}
            />
          ))}
          {fila.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

// Botón de volver con la etiqueta de a dónde regresa.
function Volver({ etiqueta, onPress }: { etiqueta: string; onPress: () => void }) {
  return (
    <Fade desde={8}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Volver a ${etiqueta}`}
          hitSlop={8}
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(13,13,13,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name="chevR" size={16} color={FG} sw={2.2} />
          </View>
        </PressableScale>
        <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 13, color: MUTED, flexShrink: 1 }}>{etiqueta}</Text>
      </View>
    </Fade>
  );
}

// Encabezado con el color del grupo.
function Encabezado({ grupo, titulo, detalle }: { grupo: Grupo; titulo: string; detalle: string }) {
  const [a, b, c] = hueColors(grupo.hue);
  return (
    <Fade delay={STAGGER} desde={14} style={{ borderRadius: R.lg, overflow: 'hidden', padding: 20, marginBottom: 18 }}>
      <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', right: -16, bottom: -24, opacity: 0.16 }}>
        <Ionicons name={grupo.icono} size={130} color="#fff" />
      </View>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Ionicons name={grupo.icono} size={22} color="#fff" />
      </View>
      <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff', letterSpacing: -0.4 }}>{titulo}</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{detalle}</Text>
    </Fade>
  );
}

function SinNegocios({ grupo, que }: { grupo: Grupo; que: string }) {
  return (
    <Fade delay={STAGGER * 2} desde={10} style={{ alignItems: 'center', paddingVertical: 26, paddingHorizontal: 20, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
      <IconoGrupo grupo={grupo} size={48} />
      <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG, marginTop: 12, textAlign: 'center' }}>Aún no hay negocios, recomienda a uno</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 18 }}>
        ¿Conoces uno bueno de {que}? Cuando se sume a Hazlo Cash podrás ganar por recomendarlo.
      </Text>
    </Fade>
  );
}

// Un giro como botón grande: con negocios se pinta del color del grupo; sin
// ellos queda claro y dice que aún no hay.
function BotonGiro({ grupo, giro, negocios, delay, onPress }: { grupo: Grupo; giro: string; negocios: number; delay: number; onPress: () => void }) {
  const [a, b] = hueColors(grupo.hue);
  const hay = negocios > 0;
  return (
    <Fade delay={delay} desde={12} style={{ flex: 1 }}>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${giro}: ${hay ? plural(negocios, 'negocio', 'negocios') : 'aún no hay negocios'}`}
        style={{
          minHeight: 104,
          borderRadius: 20,
          overflow: 'hidden',
          padding: 14,
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          borderWidth: hay ? 0 : 1,
          borderColor: 'rgba(13,13,13,0.07)',
        }}>
        {hay && <LinearGradient colors={[a, b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Text numberOfLines={3} style={{ flex: 1, fontFamily: F.semi, fontSize: 14.5, lineHeight: 19, color: hay ? '#fff' : FG, letterSpacing: -0.1 }}>
            {giro}
          </Text>
          <Icon name="chevR" size={15} color={hay ? 'rgba(255,255,255,0.85)' : MUTED} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: hay ? '#fff' : 'rgba(13,13,13,0.2)' }} />
          <Text style={{ fontFamily: hay ? F.semi : F.reg, fontSize: 11.5, color: hay ? '#fff' : MUTED }}>
            {hay ? `Hay ${plural(negocios, 'negocio', 'negocios')}` : 'Aún no hay'}
          </Text>
        </View>
      </PressableScale>
    </Fade>
  );
}

// Dentro de una categoría: todos sus negocios y sus giros como botones grandes.
function VistaGrupo({
  grupo,
  negocios,
  porGiro,
  cargando,
  onVolver,
  onAbrir,
}: {
  grupo: Grupo;
  negocios: Business[];
  porGiro: Map<string, Business[]>;
  cargando: boolean;
  onVolver: () => void;
  onAbrir: (giro: string) => void;
}) {
  const cuenta = (g: string) => porGiro.get(g)?.length ?? 0;
  // Primero los giros que ya tienen negocios; luego el resto, en orden alfabético.
  const giros = [...grupo.giros].sort((x, y) => cuenta(y) - cuenta(x) || x.localeCompare(y, 'es'));
  const conNegocios = giros.filter((g) => cuenta(g) > 0).length;
  const filas: string[][] = [];
  for (let i = 0; i < giros.length; i += 2) filas.push(giros.slice(i, i + 2));

  return (
    <>
      <Volver etiqueta="Categorías" onPress={onVolver} />
      <Encabezado
        grupo={grupo}
        titulo={grupo.nombre}
        detalle={`${plural(negocios.length, 'negocio', 'negocios')} · ${plural(grupo.giros.length, 'giro', 'giros')}`}
      />

      {/* Todos los negocios del grupo, tengan o no un giro específico. */}
      <Fade delay={STAGGER * 2} desde={10} style={{ marginBottom: 24 }}>
        <PressableScale
          onPress={() => onAbrir(TODOS)}
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: R.md, backgroundColor: FG }}>
          <IconoGrupo grupo={grupo} size={42} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Todos los negocios</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              {cargando ? 'Cargando…' : negocios.length > 0 ? plural(negocios.length, 'negocio', 'negocios') : 'Aún no hay ninguno'}
            </Text>
          </View>
          <Icon name="chevR" size={17} color="rgba(255,255,255,0.8)" />
        </PressableScale>
      </Fade>

      <SectionHeader title="Giros" />
      <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: -6, marginBottom: 12, paddingHorizontal: 4 }}>
        {cargando ? 'Revisando qué giros tienen negocios…' : `${conNegocios} de ${plural(grupo.giros.length, 'giro tiene', 'giros tienen')} negocios`}
      </Text>
      <View style={{ gap: 10 }}>
        {filas.map((fila, f) => (
          <View key={fila[0]} style={{ flexDirection: 'row', gap: 10 }}>
            {fila.map((g, k) => (
              <BotonGiro key={g} grupo={grupo} giro={g} negocios={cuenta(g)} delay={(3 + Math.min(f * 2 + k, 10)) * STAGGER} onPress={() => onAbrir(g)} />
            ))}
            {fila.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>
    </>
  );
}

// Un giro (o "todos los negocios" del grupo): la lista o la invitación a recomendar.
function VistaGiro({ grupo, giro, negocios, cargando, onVolver }: { grupo: Grupo; giro: string; negocios: Business[]; cargando: boolean; onVolver: () => void }) {
  const todos = giro === TODOS;
  return (
    <>
      <Volver etiqueta={grupo.nombre} onPress={onVolver} />
      <Encabezado
        grupo={grupo}
        titulo={todos ? 'Todos los negocios' : giro}
        detalle={todos ? grupo.nombre : `${grupo.nombre} · ${negocios.length > 0 ? plural(negocios.length, 'negocio', 'negocios') : 'aún sin negocios'}`}
      />
      {cargando ? (
        <View style={{ borderRadius: R.md, paddingHorizontal: 12, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <ListaSkeleton filas={2} />
        </View>
      ) : negocios.length === 0 ? (
        <SinNegocios grupo={grupo} que={(todos ? grupo.nombre : giro).toLowerCase()} />
      ) : (
        <View style={{ gap: 12 }}>
          {negocios.map((n, i) => (
            <FilaNegocio key={n.id} n={n} delay={(2 + Math.min(i, 6)) * STAGGER} />
          ))}
        </View>
      )}
    </>
  );
}

// Búsqueda: negocios por nombre/oferta y giros del catálogo (que llevan a su categoría).
function Resultados({ busqueda, negocios, onAbrir }: { busqueda: string; negocios: Business[]; onAbrir: (g: Grupo, giro?: string) => void }) {
  const q = normalizar(busqueda.trim());
  const deNegocios = negocios.filter((n) => [n.nombre, n.categoria, n.oferta ?? ''].some((campo) => normalizar(campo).includes(q)));
  const giros = buscarGiros(busqueda).slice(0, 20);

  if (deNegocios.length === 0 && giros.length === 0) {
    return (
      <Fade key={busqueda} desde={8} style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 12 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG, textAlign: 'center' }}>No encontramos «{busqueda.trim()}»</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 18 }}>
          Prueba con otra palabra, como «tacos», «plomero» o «dentista».
        </Text>
      </Fade>
    );
  }

  return (
    <>
      {deNegocios.length > 0 && (
        <>
          <SectionHeader title="Negocios" />
          <View style={{ gap: 12, marginBottom: 22 }}>
            {deNegocios.map((n, i) => (
              <FilaNegocio key={n.id} n={n} delay={Math.min(i, 6) * STAGGER} />
            ))}
          </View>
        </>
      )}
      {giros.length > 0 && (
        <>
          <SectionHeader title="Giros" />
          <View style={{ borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {giros.map((r, i) => (
              <Fade key={`${r.grupo.slug}-${r.giro}`} delay={Math.min(i, 6) * STAGGER} desde={8}>
                <PressableScale
                  onPress={() => onAbrir(r.grupo, r.giro)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
                  <IconoGrupo grupo={r.grupo} size={34} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <TextoResaltado texto={r.giro} busqueda={busqueda} style={{ fontFamily: F.semi, fontSize: 14, color: FG }} />
                    <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>
                      {r.grupo.nombre}
                    </Text>
                  </View>
                  <Icon name="chevR" size={16} color={MUTED} />
                </PressableScale>
              </Fade>
            ))}
          </View>
        </>
      )}
    </>
  );
}

// Descubre: el catálogo de categorías del Excel (12 grupos) con los negocios
// que hay en cada una y en cada giro.
export function DiscoverScreen() {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  // Giro abierto dentro del grupo (o TODOS para la lista completa del grupo).
  const [giro, setGiro] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  // El catálogo de negocios cambia poco: se revalida cada 5 minutos.
  const { datos: negocios = [], cargando, error } = useNegocios();

  const porGrupo = new Map<string, Business[]>();
  const porGiro = new Map<string, Business[]>();
  for (const n of negocios) {
    const slug = grupoDeCategoria(n.categoria).slug;
    porGrupo.set(slug, [...(porGrupo.get(slug) ?? []), n]);
    for (const g of girosDeNegocio(n)) porGiro.set(g, [...(porGiro.get(g) ?? []), n]);
  }
  const conPromo = negocios.filter((n) => n.oferta);

  const abrir = (g: Grupo, conGiro?: string) => {
    setBusqueda('');
    setGrupo(g);
    setGiro(conGiro ?? null);
  };

  const volver = () => (giro ? setGiro(null) : setGrupo(null));

  // Android: el botón atrás regresa un nivel en vez de salir.
  useEffect(() => {
    if (!grupo) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (giro) setGiro(null);
      else setGrupo(null);
      return true;
    });
    return () => sub.remove();
  }, [grupo, giro]);

  return (
    <ScrollView
      key={`${grupo?.slug ?? 'categorias'}-${giro ?? ''}`}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      {grupo && giro ? (
        <VistaGiro
          grupo={grupo}
          giro={giro}
          negocios={giro === TODOS ? porGrupo.get(grupo.slug) ?? [] : porGiro.get(giro) ?? []}
          cargando={cargando}
          onVolver={volver}
        />
      ) : grupo ? (
        <VistaGrupo
          grupo={grupo}
          negocios={porGrupo.get(grupo.slug) ?? []}
          porGiro={porGiro}
          cargando={cargando}
          onVolver={volver}
          onAbrir={setGiro}
        />
      ) : (
        <>
          <Fade desde={8}>
            <Text style={{ fontFamily: F.bold, fontSize: 28, color: FG, letterSpacing: -0.7, marginBottom: 14 }}>Descubre</Text>
          </Fade>

          <Fade delay={STAGGER} desde={8} style={{ marginBottom: 18 }}>
            <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Busca un negocio o un giro: tacos, dentista…" />
          </Fade>

          {busqueda.trim() ? (
            <Resultados busqueda={busqueda} negocios={negocios} onAbrir={abrir} />
          ) : (
            <>
              {/* Promociones reales de los negocios que ya están. */}
              {conPromo.length > 0 && (
                <>
                  <SectionHeader title="Con promoción" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }} style={{ marginBottom: 22 }}>
                    {conPromo.map((n, i) => (
                      <Fade key={n.id} delay={(2 + i) * STAGGER} desde={10} style={{ width: 200 }}>
                        <FoodTile name={n.nombre} type={n.oferta ?? n.categoria} hue={hueDeId(n.id)} radius={R.md} height={180} />
                      </Fade>
                    ))}
                  </ScrollView>
                </>
              )}

              <SectionHeader title="Categorías" />
              {!cargando && error && (
                <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginBottom: 12 }}>
                  No pudimos cargar los negocios; las categorías se ven sin conteo.
                </Text>
              )}
              <Rejilla porGrupo={porGrupo} onAbrir={(g) => abrir(g)} />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
