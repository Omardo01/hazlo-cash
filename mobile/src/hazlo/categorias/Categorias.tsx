import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { BG, C, F, FG, MUTED, R } from '../theme';
import { hueColors } from '../ui';
import { buscarGiros, GRUPOS, TOTAL_GIROS, type Grupo, type Resultado } from './catalogo';
import { Buscador, IconoGrupo, TextoResaltado } from './piezas';

/**
 * /categorias — catálogo de giros por grupo. Arriba se busca un giro en todo
 * el catálogo; abajo, la rejilla de grupos lleva a sus subgrupos.
 */

function abrirGrupo(grupo: Grupo, resaltar?: string) {
  router.push({ pathname: '/categorias/[grupo]', params: resaltar ? { grupo: grupo.slug, resaltar } : { grupo: grupo.slug } });
}

function TarjetaGrupo({ grupo, delay }: { grupo: Grupo; delay: number }) {
  const [a, b, c] = hueColors(grupo.hue);
  return (
    <Fade delay={delay} desde={14} style={{ flex: 1 }}>
      <PressableScale
        onPress={() => abrirGrupo(grupo)}
        accessibilityRole="button"
        accessibilityLabel={`${grupo.nombre}, ${grupo.giros.length} giros`}
        style={{ height: 150, borderRadius: 22, overflow: 'hidden', padding: 14, justifyContent: 'space-between' }}>
        <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 0.6 }} style={StyleSheet.absoluteFill} />
        {/* Ícono grande de fondo: le da textura de catálogo sin necesitar fotos. */}
        <View style={{ position: 'absolute', right: -14, bottom: -18, opacity: 0.14 }}>
          <Ionicons name={grupo.icono} size={104} color="#fff" />
        </View>

        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={grupo.icono} size={20} color="#fff" />
        </View>
        <View>
          <Text numberOfLines={2} style={{ fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: '#fff', letterSpacing: -0.1 }}>
            {grupo.nombre}
          </Text>
          <Text style={{ fontFamily: F.reg, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>
            {grupo.giros.length} {grupo.giros.length === 1 ? 'giro' : 'giros'}
          </Text>
        </View>
      </PressableScale>
    </Fade>
  );
}

function Rejilla() {
  // Filas de dos: con flex, cada tarjeta mide la mitad del teléfono sin
  // depender del ancho de la ventana (en web la pantalla vive dentro del marco).
  const filas: Grupo[][] = [];
  for (let i = 0; i < GRUPOS.length; i += 2) filas.push(GRUPOS.slice(i, i + 2));

  return (
    <View style={{ gap: 12 }}>
      {filas.map((fila, f) => (
        <View key={fila[0].slug} style={{ flexDirection: 'row', gap: 12 }}>
          {fila.map((g, k) => (
            <TarjetaGrupo key={g.slug} grupo={g} delay={(3 + Math.min(f * 2 + k, 8)) * STAGGER} />
          ))}
          {fila.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

function Resultados({ busqueda, resultados }: { busqueda: string; resultados: Resultado[] }) {
  if (resultados.length === 0) {
    return (
      <Fade key={busqueda} desde={8} style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 12 }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(13,13,13,0.05)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="search" size={22} color={MUTED} />
        </View>
        <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG, marginTop: 12, textAlign: 'center' }}>
          No encontramos «{busqueda.trim()}»
        </Text>
        <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 18 }}>
          Prueba con otra palabra, como «tacos», «plomero» o «dentista».
        </Text>
      </Fade>
    );
  }

  return (
    <View>
      <Text style={{ fontFamily: F.semi, fontSize: 12, color: MUTED, marginBottom: 10, paddingHorizontal: 4 }}>
        {resultados.length} {resultados.length === 1 ? 'giro encontrado' : 'giros encontrados'}
      </Text>
      <View style={{ borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {resultados.map((r, i) => (
          // La llave no incluye la búsqueda: al teclear, las filas que siguen
          // coincidiendo se quedan quietas y solo entran las nuevas.
          <Fade key={`${r.grupo.slug}-${r.giro}`} delay={Math.min(i, 6) * STAGGER} desde={8}>
            <PressableScale
              onPress={() => abrirGrupo(r.grupo, r.giro)}
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
    </View>
  );
}

export function Categorias() {
  const [busqueda, setBusqueda] = useState('');
  const buscando = busqueda.trim().length > 0;
  const resultados = buscarGiros(busqueda);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 }}>
          <Fade desde={8}>
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary, letterSpacing: 0.8 }}>HAZLO CASH · CATÁLOGO</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 28, color: FG, letterSpacing: -0.7, marginTop: 2 }}>Categorías</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 19 }}>
              Todos los giros que caben en Hazlo Cash, ordenados por grupo.
            </Text>
          </Fade>

          <Fade delay={STAGGER} desde={8} style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {[
              { n: GRUPOS.length, t: 'grupos' },
              { n: TOTAL_GIROS, t: 'giros' },
            ].map((s) => (
              <View key={s.t} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: FG }}>{s.n}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED }}>{s.t}</Text>
              </View>
            ))}
          </Fade>

          <Fade delay={STAGGER * 2} desde={8} style={{ marginTop: 16, marginBottom: 18 }}>
            <Buscador valor={busqueda} onCambio={setBusqueda} placeholder="Busca un giro: tacos, plomero, dentista…" />
          </Fade>

          {buscando ? <Resultados busqueda={busqueda} resultados={resultados} /> : <Rejilla />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
