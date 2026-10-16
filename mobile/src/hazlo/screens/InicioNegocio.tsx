import { useEffect, useRef } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useEmbajadoresNegocio, useMiNegocio, useVisitasNegocio } from '@/lib/datos/consultas';
import { useLive } from '@/lib/datos/realtime';
import type { VisitaNegocio } from '@/lib/services/referrals';
import type { BusinessAdmin } from '@/lib/types';
import { Icon, type IconName } from '../icons';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { Bloque } from '../Skeleton';
import { C, F, FG, MUTED, R } from '../theme';
import { useTonoInicio } from '../tonoInicio';
import { FondoTono } from '../VisorTonos';
import { SinNegocio } from './MiNegocio';

/**
 * Inicio del negocio: cómo va hoy de un vistazo. Mismo lenguaje que el Inicio
 * del recomendador (bloque de color arriba con el dinero y las acciones), con
 * lo que le importa al dueño: créditos, ventas, quién lo recomienda y qué pasó.
 */

export type DestinoNegocio = 'solicitudes' | 'embajadores' | 'negocio';

const SOFT = 'rgba(255,255,255,0.09)';
const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const pesos = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return '¡Buenos días!';
  if (h < 19) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '··';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

function comisionTexto(n: BusinessAdmin): string {
  return n.comision_tipo === 'porcentaje' ? `${n.comision_valor}% por venta` : `${pesos(Number(n.comision_valor))} por venta`;
}

function hora(iso: string): string {
  const d = new Date(iso);
  const hoy = d.toDateString() === new Date().toDateString();
  const h = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return hoy ? `Hoy · ${h}` : `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${h}`;
}

function Accion({ icon, label, onPress, principal, acento, badge, delay }: { icon: IconName; label: string; onPress: () => void; principal?: boolean; acento: string; badge?: number; delay: number }) {
  return (
    <Fade delay={delay} desde={10} style={{ alignItems: 'center' }}>
      <View style={{ height: 64, justifyContent: 'center' }}>
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={{ width: principal ? 64 : 54, height: principal ? 64 : 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: principal ? '#fff' : SOFT }}>
          <Icon name={icon} size={principal ? 25 : 20} color={principal ? acento : '#fff'} sw={2} />
          {!!badge && (
            <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 10, color: '#fff' }}>{badge}</Text>
            </View>
          )}
        </PressableScale>
      </View>
      <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: '#fff', marginTop: 8 }}>{label}</Text>
    </Fade>
  );
}

function Mosaico({ icon, label, valor, sub, delay }: { icon: IconName; label: string; valor: string; sub: string; delay: number }) {
  return (
    <Fade delay={delay} desde={12} style={{ flex: 1 }}>
      <View style={{ borderRadius: R.lg, padding: 14, backgroundColor: SOFT }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={12} color="#fff" sw={2.4} />
          </View>
          <Text style={{ fontFamily: F.base, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>{label}</Text>
        </View>
        <Text style={{ fontFamily: F.bold, fontSize: 24, color: '#fff', letterSpacing: -0.6, marginTop: 10 }}>{valor}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{sub}</Text>
      </View>
    </Fade>
  );
}

// Barra de la gráfica: crece desde abajo con transform (native driver).
function Barra({ valor, max, hoy, etiqueta, delay }: { valor: number; max: number; hoy: boolean; etiqueta: string; delay: number }) {
  const p = useRef(new Animated.Value(0)).current;
  const quieto = useReduceMotion();
  useEffect(() => {
    if (quieto) return p.setValue(1);
    Animated.timing(p, { toValue: 1, duration: DUR.slow + 140, delay, easing: EASE.out, useNativeDriver: true }).start();
  }, [p, delay, quieto]);
  const alto = 96;
  const h = max > 0 ? Math.max(6, (valor / max) * alto) : 6;
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: valor > 0 ? FG : 'transparent', marginBottom: 4 }}>{valor}</Text>
      <View style={{ height: alto, justifyContent: 'flex-end' }}>
        <Animated.View style={{ width: 22, height: h, borderRadius: 7, overflow: 'hidden', transformOrigin: 'bottom', transform: [{ scaleY: p }] }}>
          {hoy ? (
            <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: valor > 0 ? `${C.primary}40` : 'rgba(13,13,13,0.07)' }]} />
          )}
        </Animated.View>
      </View>
      <Text style={{ fontFamily: hoy ? F.bold : F.reg, fontSize: 11, color: hoy ? C.primary : MUTED, marginTop: 6 }}>{etiqueta}</Text>
    </View>
  );
}

// Ventas confirmadas de los últimos 7 días (hoy al final).
function semana(visitas: VisitaNegocio[]) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() - (6 - i));
    const delDia = visitas.filter((v) => v.estado === 'confirmado' && new Date(v.creada).toDateString() === dia.toDateString());
    return { etiqueta: DIAS[dia.getDay()], ventas: delDia.length, comision: delDia.reduce((t, v) => t + (v.comision ?? 0), 0), hoy: i === 6 };
  });
}

const ESTADO: Record<VisitaNegocio['estado'], { label: string; color: string; bg: string; icon: IconName }> = {
  pendiente: { label: 'Por confirmar', color: '#B7791F', bg: 'rgba(245,166,35,0.15)', icon: 'send' },
  confirmado: { label: 'Venta', color: '#00806F', bg: 'rgba(0,168,150,0.14)', icon: 'check' },
  rechazado: { label: 'Rechazada', color: MUTED, bg: 'rgba(13,13,13,0.06)', icon: 'x' },
};

function Encabezado({ titulo, accion, onAccion }: { titulo: string; accion?: string; onAccion?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 17, color: FG, letterSpacing: -0.3 }}>{titulo}</Text>
      {accion && onAccion && (
        <PressableScale onPress={onAccion} hitSlop={8}>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary }}>{accion}</Text>
        </PressableScale>
      )}
    </View>
  );
}

const MEDALLA = ['#F5A623', '#9AA0A6', '#C67C43'];

export function InicioNegocioScreen({ onEscanear, ir }: { onEscanear: () => void; ir: (d: DestinoNegocio) => void }) {
  const { datos: negocio, cargando, refrescar: refNegocio } = useMiNegocio();
  const { datos: visitas = [], refrescar: refVisitas } = useVisitasNegocio();
  const { datos: embajadores = [], refrescar: refEmbajadores } = useEmbajadoresNegocio();
  const { conectado } = useLive();
  const tono = useTonoInicio();

  const refrescar = () => {
    refNegocio();
    refVisitas();
    refEmbajadores();
  };

  if (cargando) {
    return (
      <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 120 }}>
        <Bloque h={380} radio={34} />
        <Bloque h={170} radio={20} style={{ marginTop: 16, marginHorizontal: 8 }} />
      </ScrollView>
    );
  }
  if (!negocio) return <SinNegocio />;

  const creditos = Number(negocio.creditos);
  const alcanzan = negocio.comision_tipo === 'fijo' && Number(negocio.comision_valor) > 0 ? Math.floor(creditos / Number(negocio.comision_valor)) : null;
  const pendientes = visitas.filter((v) => v.estado === 'pendiente').length;
  const dias = semana(visitas);
  const ventasHoy = dias[6].ventas;
  const ventasSemana = dias.reduce((t, d) => t + d.ventas, 0);
  const comisionSemana = dias.reduce((t, d) => t + d.comision, 0);
  const max = Math.max(...dias.map((d) => d.ventas));
  const top = [...embajadores].sort((a, b) => b.confirmadas - a.confirmadas || b.recomendaciones - a.recomendaciones).slice(0, 3);
  const recientes = visitas.slice(0, 5);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
      {/* Bloque de color: créditos y acciones */}
      <View style={{ marginHorizontal: 12, borderRadius: 34, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 22, overflow: 'hidden' }}>
        <FondoTono tono={tono} />
        <Fade desde={8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#fff' }}>{iniciales(negocio.nombre)}</Text>
            </LinearGradient>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{saludo()}</Text>
              <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 17, color: '#fff' }}>
                {negocio.nombre}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 11, borderRadius: 999, backgroundColor: SOFT }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: conectado ? '#3FE0CC' : 'rgba(255,255,255,0.35)' }} />
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#fff' }}>{conectado ? 'En vivo' : 'Conectando'}</Text>
            </View>
          </View>
        </Fade>

        <Fade delay={STAGGER} desde={12} style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontFamily: F.base, fontSize: 13.5, color: 'rgba(255,255,255,0.6)' }}>Créditos disponibles</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 42, color: creditos > 0 ? '#fff' : '#FFB38A', letterSpacing: -1.6, marginTop: 4 }}>{pesos(creditos)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: SOFT }}>
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#fff' }}>{comisionTexto(negocio)}</Text>
            </View>
            {alcanzan !== null && (
              <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>
                alcanza para {alcanzan} {alcanzan === 1 ? 'venta' : 'ventas'}
              </Text>
            )}
          </View>
        </Fade>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 22 }}>
          <Accion icon="qr" label="Escanear" principal acento={tono.acento} onPress={onEscanear} delay={STAGGER * 2} />
          <Accion icon="activity" label="Solicitudes" acento={tono.acento} badge={pendientes} onPress={() => ir('solicitudes')} delay={STAGGER * 3} />
          <Accion icon="home" label="Mi ficha" acento={tono.acento} onPress={() => ir('negocio')} delay={STAGGER * 4} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
          <Mosaico icon="check" label="Hoy" valor={String(ventasHoy)} sub={ventasHoy === 1 ? 'venta confirmada' : 'ventas confirmadas'} delay={STAGGER * 5} />
          <Mosaico icon="chart" label="7 días" valor={String(ventasSemana)} sub={`${pesos(comisionSemana)} en comisiones`} delay={STAGGER * 6} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        {/* Avisos: lo que pide acción va antes que todo */}
        {pendientes > 0 && (
          <Fade delay={STAGGER * 6} desde={12}>
            <PressableScale onPress={() => ir('solicitudes')} style={{ borderRadius: R.md, overflow: 'hidden', marginBottom: 12 }}>
              <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="bell" size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>
                    {pendientes} {pendientes === 1 ? 'visita espera' : 'visitas esperan'} tu confirmación
                  </Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>Confírmalas para pagar al recomendador.</Text>
                </View>
                <Icon name="chevR" size={16} color="#fff" />
              </LinearGradient>
            </PressableScale>
          </Fade>
        )}
        {creditos <= 0 && (
          <Fade delay={STAGGER * 6} desde={12}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, padding: 14, borderRadius: R.md, backgroundColor: 'rgba(235,78,0,0.09)' }}>
              <Icon name="wallet" size={16} color={C.accent} />
              <Text style={{ flex: 1, fontFamily: F.base, fontSize: 12.5, color: FG, lineHeight: 18 }}>
                Te quedaste sin créditos: no podrás confirmar ventas hasta recargar con Hazlo Cash.
              </Text>
            </View>
          </Fade>
        )}

        {/* Gráfica de la semana */}
        <Fade delay={STAGGER * 7} desde={12}>
          <View style={{ borderRadius: R.lg, padding: 18, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <View>
                <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Ventas de la semana</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2 }}>Confirmadas por día</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4 }}>{ventasSemana}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{ventasSemana === 1 ? 'venta' : 'ventas'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              {dias.map((d, i) => (
                <Barra key={i} valor={d.ventas} max={max} hoy={d.hoy} etiqueta={d.etiqueta} delay={STAGGER * (8 + i)} />
              ))}
            </View>
            {ventasSemana === 0 && (
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 12 }}>
                Aún sin ventas esta semana. Cuando confirmes una, aparece aquí.
              </Text>
            )}
          </View>
        </Fade>

        {/* Quién te recomienda */}
        <Fade delay={STAGGER * 9} desde={12}>
          <Encabezado titulo="Quién te recomienda" accion={embajadores.length > 0 ? 'Ver todos' : undefined} onAccion={() => ir('embajadores')} />
          <View style={{ borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 24, overflow: 'hidden' }}>
            {top.length === 0 ? (
              <View style={{ padding: 18 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Nadie te recomienda todavía</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 18 }}>
                  Cuando alguien genere su código para tu negocio, lo verás aquí con las ventas que te trae.
                </Text>
              </View>
            ) : (
              top.map((e, i) => (
                <View key={e.codigoId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${MEDALLA[i]}26`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: MEDALLA[i] }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{e.nombre}</Text>
                    <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>{e.codigo}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 14, color: FG }}>{e.confirmadas}</Text>
                    <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED }}>{e.confirmadas === 1 ? 'venta' : 'ventas'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Fade>

        {/* Actividad reciente */}
        <Fade delay={STAGGER * 10} desde={12}>
          <Encabezado titulo="Actividad reciente" accion={visitas.length > 0 ? 'Ver todo' : undefined} onAccion={() => ir('solicitudes')} />
          <View style={{ borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {recientes.length === 0 ? (
              <View style={{ padding: 18 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Todavía no hay movimientos</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 18 }}>
                  Escanea el QR de un recomendador o de un cliente y la venta aparecerá aquí al instante.
                </Text>
              </View>
            ) : (
              recientes.map((v, i) => {
                const e = ESTADO[v.estado];
                return (
                  <View key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: e.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={e.icon} size={15} color={e.color} sw={2.2} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>
                        Orden #{v.folio}
                      </Text>
                      <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                        {v.codigo} · {hora(v.creada)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: e.bg }}>
                        <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: e.color }}>{e.label}</Text>
                      </View>
                      {v.comision != null && <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: MUTED, marginTop: 3 }}>{pesos(v.comision)} comisión</Text>}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </Fade>
      </View>
    </ScrollView>
  );
}
