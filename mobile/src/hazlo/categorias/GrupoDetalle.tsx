import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '../icons';
import { DUR, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { BG, C, F, FG, MUTED, R } from '../theme';
import { hueColors } from '../ui';
import { GRUPOS, grupoPorSlug, normalizar, type Grupo } from './catalogo';
import { Buscador, IconoGrupo, TextoResaltado } from './piezas';

/**
 * /categorias/[grupo] — los giros (subgrupos) de un grupo. Si se llega desde
 * la búsqueda, `resaltar` trae el giro buscado: se marca y se hace scroll a él.
 */

// Con pocos giros, un filtro estorba más de lo que ayuda.
const MIN_PARA_FILTRO = 9;

function volver() {
  if (router.canGoBack()) router.back();
  else router.replace('/categorias');
}

function BotonVolver() {
  return (
    <PressableScale
      onPress={volver}
      accessibilityRole="button"
      accessibilityLabel="Volver a categorías"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 10 }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={18} color={FG} />
      </View>
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Categorías</Text>
    </PressableScale>
  );
}

export function GrupoDetalle() {
  const { grupo: slug, resaltar } = useLocalSearchParams<{ grupo: string; resaltar?: string }>();
  const grupo = grupoPorSlug(slug);

  if (!grupo) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
        <View style={{ padding: 20 }}>
          <BotonVolver />
          <Fade desde={8} style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG }}>Ese grupo no existe</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, textAlign: 'center' }}>
              Regresa al catálogo para ver todos los grupos.
            </Text>
          </Fade>
        </View>
      </SafeAreaView>
    );
  }

  // La llave reinicia filtro, scroll y animaciones al saltar a otro grupo.
  return <Detalle key={grupo.slug} grupo={grupo} resaltar={resaltar} />;
}

function Detalle({ grupo, resaltar }: { grupo: Grupo; resaltar?: string }) {
  const [filtro, setFiltro] = useState('');
  const reduce = useReduceMotion();
  const [a, b, c] = hueColors(grupo.hue);
  const tinte = `hsla(${grupo.hue}, 70%, 45%, 0.10)`;
  const tono = `hsl(${grupo.hue + 8}, 52%, 38%)`;
  const indice = GRUPOS.indexOf(grupo);

  const q = normalizar(filtro.trim());
  const visibles = q ? grupo.giros.filter((g) => normalizar(g).includes(q)) : grupo.giros;

  // Scroll al giro buscado, una sola vez: hace falta la posición de la lista
  // dentro del scroll y la de la fila dentro de la lista.
  const scroll = useRef<ScrollView>(null);
  const yaDesplazo = useRef(false);
  const [yLista, setYLista] = useState<number | null>(null);
  const [yFila, setYFila] = useState<number | null>(null);
  useEffect(() => {
    if (yaDesplazo.current || yLista === null || yFila === null) return;
    yaDesplazo.current = true;
    // Si la fila ya se ve al entrar, no hay por qué mover nada.
    if (yLista + yFila < 420) return;
    scroll.current?.scrollTo({ y: yLista + yFila - 140, animated: !reduce });
  }, [yLista, yFila, reduce]);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 48 }}>
          <Fade desde={6}>
            <BotonVolver />
          </Fade>

          {/* Portada del grupo */}
          <Fade delay={STAGGER} desde={14} style={{ marginTop: 12 }}>
            <View style={{ height: 168, borderRadius: R.lg, overflow: 'hidden', padding: 18, justifyContent: 'space-between' }}>
              <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 0.6 }} style={StyleSheet.absoluteFill} />
              <View style={{ position: 'absolute', right: -18, bottom: -26, opacity: 0.14 }}>
                <Ionicons name={grupo.icono} size={150} color="#fff" />
              </View>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={grupo.icono} size={24} color="#fff" />
              </View>
              <View>
                <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 }}>
                  GRUPO {indice + 1} DE {GRUPOS.length}
                </Text>
                <Text style={{ fontFamily: F.bold, fontSize: 24, lineHeight: 29, color: '#fff', letterSpacing: -0.5, marginTop: 2 }}>{grupo.nombre}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.88)', marginTop: 2 }}>
                  {grupo.giros.length} {grupo.giros.length === 1 ? 'giro' : 'giros'}
                </Text>
              </View>
            </View>
          </Fade>

          {grupo.giros.length >= MIN_PARA_FILTRO && (
            <Fade delay={STAGGER * 2} desde={8} style={{ marginTop: 16 }}>
              <Buscador valor={filtro} onCambio={setFiltro} placeholder={`Filtrar en ${grupo.nombre.toLowerCase()}…`} />
            </Fade>
          )}

          <Fade delay={STAGGER * 2} style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 20, marginBottom: 10, paddingHorizontal: 4 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG, letterSpacing: -0.17 }}>Subgrupos</Text>
            <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>{q ? `${visibles.length} de ${grupo.giros.length}` : grupo.giros.length}</Text>
          </Fade>

          {visibles.length === 0 ? (
            <Fade key={q} desde={8} style={{ paddingVertical: 28, alignItems: 'center' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Nada con «{filtro.trim()}» aquí</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, textAlign: 'center' }}>
                Búscalo en todo el catálogo desde Categorías.
              </Text>
            </Fade>
          ) : (
            <View onLayout={(e) => setYLista(e.nativeEvent.layout.y)} style={{ borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {visibles.map((giro, i) => {
                const marcado = giro === resaltar;
                return (
                  <View key={giro} onLayout={marcado ? (e) => setYFila(e.nativeEvent.layout.y) : undefined}>
                    <Fade delay={(3 + Math.min(i, 8)) * STAGGER} desde={8}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
                        {/* El resaltado entra después de la lista, para que el ojo lo encuentre. */}
                        {marcado && (
                          <Fade delay={DUR.slow * 2} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
                            <View style={{ flex: 1, backgroundColor: tinte }} />
                          </Fade>
                        )}
                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: tinte, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontFamily: F.semi, fontSize: 12, color: tono }}>{giro.charAt(0)}</Text>
                        </View>
                        <TextoResaltado texto={giro} busqueda={filtro} style={{ flex: 1, fontFamily: marcado ? F.semi : F.base, fontSize: 14, color: FG }} />
                        {marcado && (
                          <View style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: C.primary }}>
                            <Text style={{ fontFamily: F.semi, fontSize: 10, color: '#fff' }}>Buscado</Text>
                          </View>
                        )}
                      </View>
                    </Fade>
                  </View>
                );
              })}
            </View>
          )}

          {/* Saltar a otro grupo sin volver a la rejilla */}
          <Fade delay={STAGGER * 4} desde={8} style={{ marginTop: 26 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG, letterSpacing: -0.17, marginBottom: 10, paddingHorizontal: 4 }}>Otros grupos</Text>
          </Fade>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
            {GRUPOS.filter((g) => g !== grupo).map((g, i) => (
              <Fade key={g.slug} delay={(4 + Math.min(i, 6)) * STAGGER} desde={8}>
                <PressableScale
                  onPress={() => router.replace({ pathname: '/categorias/[grupo]', params: { grupo: g.slug } })}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingLeft: 6, paddingRight: 14, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
                  <IconoGrupo grupo={g} size={26} />
                  <Text style={{ fontFamily: F.semi, fontSize: 12, color: FG }}>{g.nombre}</Text>
                  <Icon name="chevR" size={12} color={MUTED} />
                </PressableScale>
              </Fade>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
