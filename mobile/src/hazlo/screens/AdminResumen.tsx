import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAdminMetricas } from '@/lib/datos/consultas';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { Fade, STAGGER } from '../motion';
import { Bloque } from '../Skeleton';
import { C, F, FG, MUTED, R } from '../theme';
import { SectionHeader } from '../ui';

const money = (n: number) => `$${n.toFixed(2)}`;

function Tarjeta({ v, l, icon, delay }: { v: string; l: string; icon: IconName; delay: number }) {
  return (
    <Fade delay={delay} desde={12} style={{ flex: 1 }}>
      <View style={{ padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        <Icon name={icon} size={17} color={C.primary} />
        <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4, marginTop: 8 }}>{v}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{l}</Text>
      </View>
    </Fade>
  );
}

export function AdminResumenScreen() {
  // Las métricas se invalidan solas cuando entra o se confirma una orden
  // (ver el canal global), así que al volver a esta pestaña ya están al día.
  const { datos: m, cargando, refrescar } = useAdminMetricas();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
      <Fade desde={8}>
        <Text style={{ fontFamily: F.semi, fontSize: 10, color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Admin</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Resumen</Text>
      </Fade>

      {cargando ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Bloque style={{ flex: 1 }} h={86} radio={16} />
            <Bloque style={{ flex: 1 }} h={86} radio={16} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Bloque style={{ flex: 1 }} h={86} radio={16} />
            <Bloque style={{ flex: 1 }} h={86} radio={16} />
          </View>
          <Bloque h={140} radio={16} />
        </View>
      ) : !m ? (
        <View style={{ borderRadius: R.md, padding: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, lineHeight: 19 }}>
            No pudimos cargar las métricas. Desliza hacia abajo para reintentar.
          </Text>
        </View>
      ) : (
        <>
          {/* Dinero en circulación */}
          <Fade delay={STAGGER} desde={12}>
            <View style={{ borderRadius: R.lg, padding: 20, marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
              <LinearGradient colors={['#1A1840', '#2D2B8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              <View style={{ position: 'absolute', right: -34, bottom: -34, opacity: 0.18 }}>
                <HazloMark size={170} mono="#fff" />
              </View>
              <Text style={{ fontFamily: F.semi, fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Comisiones pagadas
              </Text>
              <Text style={{ fontFamily: F.bold, fontSize: 36, color: '#fff', letterSpacing: -1.2, marginTop: 4 }}>{money(m.comisiones)}</Text>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 14 }}>
                <View>
                  <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>Créditos cargados</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff', marginTop: 1 }}>{money(m.creditos)}</Text>
                </View>
                <View>
                  <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>En wallets</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff', marginTop: 1 }}>{money(m.wallets)}</Text>
                </View>
              </View>
            </View>
          </Fade>

          <SectionHeader title="Actividad" />
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <Tarjeta v={String(m.ordenes)} l="Órdenes" icon="activity" delay={STAGGER * 2} />
            <Tarjeta v={String(m.pendientes)} l="Pendientes" icon="send" delay={STAGGER * 3} />
            <Tarjeta v={String(m.confirmadas)} l="Confirmadas" icon="check" delay={STAGGER * 4} />
          </View>

          <View style={{ marginTop: 12 }}>
            <SectionHeader title="Plataforma" />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tarjeta v={`${m.negociosActivos}/${m.negocios}`} l="Negocios activos" icon="home" delay={STAGGER * 5} />
            <Tarjeta v={String(m.usuarios)} l="Usuarios" icon="user" delay={STAGGER * 6} />
            <Tarjeta v={String(m.embajadores)} l="Embajadores" icon="star" delay={STAGGER * 7} />
          </View>

          {m.pendientes > 0 && (
            <Fade delay={STAGGER * 8} desde={10}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, padding: 14, borderRadius: R.md, backgroundColor: `${C.primary}12` }}>
                <Icon name="bell" size={16} color={C.primary} />
                <Text style={{ flex: 1, fontFamily: F.base, fontSize: 12.5, color: FG, lineHeight: 18 }}>
                  Hay {m.pendientes} {m.pendientes === 1 ? 'orden esperando' : 'órdenes esperando'} confirmación del negocio.
                </Text>
              </View>
            </Fade>
          )}
        </>
      )}
    </ScrollView>
  );
}
