import { useEffect, useRef } from 'react';
import { Animated, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useEmbajadoresNegocio } from '@/lib/datos/consultas';
import type { EmbajadorNegocio } from '@/lib/services/businesses';
import { Icon } from '../icons';
import { DUR, EASE, Fade, STAGGER, useReduceMotion } from '../motion';
import { ListaSkeleton } from '../Skeleton';
import { C, F, FG, MUTED, R } from '../theme';
import { useTonoInicio } from '../tonoInicio';
import { FondoTono } from '../VisorTonos';

const money = (n: number) => `$${n.toFixed(2)}`;

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '··';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

// Los tres primeros llevan medalla: el ranking es el incentivo del embajador
// y el negocio necesita ver de un vistazo quién le trae clientes.
const MEDALLA = ['#F5A623', '#9AA0A6', '#C67C43'];

function desde(iso: string | null): string {
  if (!iso) return 'Sin actividad';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 30) return `Hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

function Fila({ e, pos, delay }: { e: EmbajadorNegocio; pos: number; delay: number }) {
  const medalla = pos < 3 && e.confirmadas > 0 ? MEDALLA[pos] : null;

  return (
    <Fade delay={delay} desde={12}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 10 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: medalla ? `${medalla}22` : 'rgba(13,13,13,0.05)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.bold, fontSize: 14, color: medalla ?? FG, letterSpacing: -0.3 }}>{iniciales(e.nombre)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }} numberOfLines={1}>
              {e.nombre}
            </Text>
            {medalla && <Icon name="star" size={12} color={medalla} fill={medalla} sw={1} />}
          </View>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2 }}>
            {e.codigo} · {desde(e.ultima)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 7 }}>
            <Text style={{ fontFamily: F.base, fontSize: 11, color: FG }}>
              {e.confirmadas} {e.confirmadas === 1 ? 'venta' : 'ventas'}
            </Text>
            {e.pendientes > 0 && (
              <Text style={{ fontFamily: F.base, fontSize: 11, color: C.primary }}>{e.pendientes} pendiente{e.pendientes === 1 ? '' : 's'}</Text>
            )}
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: F.bold, fontSize: 15, color: FG, letterSpacing: -0.3 }}>{money(e.comisionPagada)}</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED, marginTop: 1 }}>pagado</Text>
        </View>
      </View>
    </Fade>
  );
}

// ── Podio de los tres primeros ─────────────────────────────────────────────────
// Orden visual 2 · 1 · 3, con el primero más alto. Los pedestales suben desde
// abajo (scaleY con native driver) y los avatares caen encima.
const ALTURAS = [78, 104, 60];

function Pedestal({ e, lugar, delay }: { e: EmbajadorNegocio; lugar: number; delay: number }) {
  const p = useRef(new Animated.Value(0)).current;
  const quieto = useReduceMotion();
  useEffect(() => {
    if (quieto) return p.setValue(1);
    Animated.timing(p, { toValue: 1, duration: DUR.slow + 160, delay, easing: EASE.out, useNativeDriver: true }).start();
  }, [p, delay, quieto]);
  const color = MEDALLA[lugar];
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View style={{ alignItems: 'center', opacity: p, transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }}>
        <View style={{ width: lugar === 0 ? 58 : 48, height: lugar === 0 ? 58 : 48, borderRadius: 999, borderWidth: 3, borderColor: color, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.bold, fontSize: lugar === 0 ? 18 : 15, color: '#fff' }}>{iniciales(e.nombre)}</Text>
        </View>
        <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 12.5, color: '#fff', marginTop: 6, maxWidth: 96 }}>{e.nombre.split(' ')[0]}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>
          {e.confirmadas} {e.confirmadas === 1 ? 'venta' : 'ventas'}
        </Text>
      </Animated.View>
      <Animated.View
        style={{ marginTop: 8, width: '86%', height: ALTURAS[lugar], borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: 'hidden', transformOrigin: 'bottom', transform: [{ scaleY: p }] }}>
        <LinearGradient colors={[`${color}`, `${color}66`]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1, alignItems: 'center', paddingTop: 8 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff' }}>{lugar + 1}</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function Podio({ top, total }: { top: EmbajadorNegocio[]; total: { embajadores: number; ventas: number; pagado: number } }) {
  const tono = useTonoInicio();
  // 2 · 1 · 3 (huecos si hay menos de tres)
  const orden = [1, 0, 2];
  return (
    <Fade delay={STAGGER} desde={14}>
      <View style={{ borderRadius: 30, overflow: 'hidden', paddingTop: 20, marginBottom: 22 }}>
        <FondoTono tono={tono} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 10 }}>
          {orden.map((lugar) =>
            top[lugar] ? (
              <Pedestal key={top[lugar].codigoId} e={top[lugar]} lugar={lugar} delay={STAGGER * (2 + (lugar === 0 ? 1 : lugar === 1 ? 0 : 2))} />
            ) : (
              <View key={`vacio-${lugar}`} style={{ flex: 1 }} />
            ),
          )}
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.22)', paddingVertical: 12 }}>
          {[
            { v: String(total.embajadores), l: total.embajadores === 1 ? 'embajador' : 'embajadores' },
            { v: String(total.ventas), l: total.ventas === 1 ? 'venta traída' : 'ventas traídas' },
            { v: money(total.pagado), l: 'pagado' },
          ].map((d) => (
            <View key={d.l} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 16, color: '#fff' }}>{d.v}</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{d.l}</Text>
            </View>
          ))}
        </View>
      </View>
    </Fade>
  );
}

export function EmbajadoresNegocioScreen() {
  const { datos, cargando, refrescar } = useEmbajadoresNegocio();
  // Ordenados por ventas traídas (y luego por recomendaciones).
  const lista = [...(datos ?? [])].sort((x, y) => y.confirmadas - x.confirmadas || y.recomendaciones - x.recomendaciones);
  const conVentas = lista.filter((e) => e.confirmadas > 0);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
      <Fade desde={8}>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>Quién te recomienda</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 18 }}>
          Tus embajadores, ordenados por ventas que te trajeron.
        </Text>
      </Fade>

      {cargando ? (
        <ListaSkeleton filas={4} />
      ) : lista.length === 0 ? (
        <Fade delay={STAGGER} desde={12}>
          <View style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: `${C.primary}14`, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon name="share" size={23} color={C.primary} />
            </View>
            <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG, textAlign: 'center' }}>Nadie te recomienda todavía</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 19 }}>
              Cuando alguien genere su código para tu negocio va a aparecer aquí, con las ventas
              que te trajo y lo que le has pagado.
            </Text>
          </View>
        </Fade>
      ) : (
        <>
          {/* El podio sale cuando ya hay al menos una venta traída. */}
          {conVentas.length > 0 && (
            <Podio
              top={conVentas.slice(0, 3)}
              total={{
                embajadores: lista.length,
                ventas: lista.reduce((t, e) => t + e.confirmadas, 0),
                pagado: lista.reduce((t, e) => t + e.comisionPagada, 0),
              }}
            />
          )}
          {conVentas.length > 0 && (
            <Text style={{ fontFamily: F.bold, fontSize: 17, color: FG, letterSpacing: -0.3, marginBottom: 12, paddingHorizontal: 4 }}>Todos</Text>
          )}
          {lista.map((e, i) => (
            <Fila key={e.codigoId} e={e} pos={i} delay={(conVentas.length > 0 ? 5 : 0) * STAGGER + Math.min(i, 8) * STAGGER} />
          ))}
        </>
      )}
    </ScrollView>
  );
}
