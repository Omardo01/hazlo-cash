import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mutar } from '@/lib/datos/cache';
import { K, useMiNegocio, useResumenNegocio } from '@/lib/datos/consultas';
import { logout } from '@/lib/services/auth';
import type { BusinessAdmin } from '@/lib/types';
import { EditarNegocio } from '../EditarNegocio';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { Bloque } from '../Skeleton';
import { C, F, FG, MUTED, R } from '../theme';
import { SectionHeader } from '../ui';

const money = (n: number) => `$${n.toFixed(2)}`;

function Metrica({ v, l, icon, delay }: { v: string; l: string; icon: IconName; delay: number }) {
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

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingVertical: 10 }}>
      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED }}>{label}</Text>
      <Text style={{ flex: 1, fontFamily: F.base, fontSize: 12.5, color: FG, textAlign: 'right' }}>{valor}</Text>
    </View>
  );
}

// Cuenta sin negocio asignado: sin esto la pestaña quedaba en blanco y el
// usuario no sabía si la app estaba rota o le faltaba un paso.
function SinNegocio() {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <Fade desde={8}>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Mi negocio</Text>
      </Fade>

      <Fade delay={STAGGER} desde={12}>
        <View style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: `${C.primary}14`, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon name="home" size={24} color={C.primary} />
          </View>
          <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG, textAlign: 'center' }}>Todavía no tienes un negocio asignado</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 19 }}>
            Hazlo Cash da de alta cada negocio y lo conecta con tu cuenta. En cuanto quede
            ligado vas a ver aquí tus ventas, tus créditos y quién te recomienda.
          </Text>
        </View>
      </Fade>

      <Fade delay={STAGGER * 2} desde={10}>
        <PressableScale
          onPress={() => logout()}
          style={{ marginTop: 16, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>Cerrar sesión</Text>
        </PressableScale>
      </Fade>
    </ScrollView>
  );
}

export function MiNegocioScreen() {
  const { datos: negocio, cargando, refrescar: refrescarNegocio } = useMiNegocio();
  const { datos: resumen, refrescar: refrescarResumen } = useResumenNegocio();
  const [editando, setEditando] = useState(false);

  const refrescar = () => {
    refrescarNegocio();
    refrescarResumen();
  };

  if (cargando) {
    return (
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
        <Bloque h={30} radio={10} style={{ width: 150, marginBottom: 18 }} />
        <Bloque h={168} radio={24} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Bloque style={{ flex: 1 }} h={86} radio={16} />
          <Bloque style={{ flex: 1 }} h={86} radio={16} />
          <Bloque style={{ flex: 1 }} h={86} radio={16} />
        </View>
        <Bloque h={190} radio={16} style={{ marginTop: 14 }} />
      </ScrollView>
    );
  }

  if (!negocio) return <SinNegocio />;

  const comision =
    negocio.comision_tipo === 'porcentaje'
      ? `${negocio.comision_valor}% de la venta`
      : `${money(Number(negocio.comision_valor))} por venta`;

  // Con comisión fija se sabe cuántas ventas más alcanzan los créditos.
  const ventasPosibles =
    negocio.comision_tipo === 'fijo' && Number(negocio.comision_valor) > 0
      ? Math.floor(Number(negocio.creditos) / Number(negocio.comision_valor))
      : null;

  const sinCreditos = Number(negocio.creditos) <= 0;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
        <Fade desde={8}>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Mi negocio</Text>
        </Fade>

        {/* Créditos: es lo que paga las comisiones, va primero y grande. */}
        <Fade delay={STAGGER} desde={12}>
          <View style={{ borderRadius: R.lg, padding: 20, marginBottom: 14, overflow: 'hidden', position: 'relative' }}>
            <LinearGradient
              colors={['#1A1840', '#2D2B8F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View style={{ position: 'absolute', right: -34, bottom: -34, opacity: 0.18 }}>
              <HazloMark size={170} primary="#fff" secondary="#fff" />
            </View>
            <Text style={{ fontFamily: F.semi, fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Créditos disponibles
            </Text>
            <Text style={{ fontFamily: F.bold, fontSize: 36, color: '#fff', letterSpacing: -1.2, marginTop: 4 }}>
              {money(Number(negocio.creditos))}
            </Text>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 14 }}>
              <View>
                <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>Tu comisión</Text>
                <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff', marginTop: 1 }}>{comision}</Text>
              </View>
              {ventasPosibles !== null && (
                <View>
                  <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>Alcanzan para</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff', marginTop: 1 }}>
                    {ventasPosibles} {ventasPosibles === 1 ? 'venta' : 'ventas'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Fade>

        {sinCreditos && (
          <Fade delay={STAGGER * 2} desde={10}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, padding: 14, borderRadius: R.md, backgroundColor: 'rgba(235,78,0,0.09)' }}>
              <Icon name="bell" size={16} color={C.accent} />
              <Text style={{ flex: 1, fontFamily: F.base, fontSize: 12.5, color: FG, lineHeight: 18 }}>
                Te quedaste sin créditos: no vas a poder confirmar ventas hasta recargar. Escríbele a
                Hazlo Cash para activarlos.
              </Text>
            </View>
          </Fade>
        )}

        {resumen && (
          <>
            <SectionHeader title="Tu operación" />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Metrica v={String(resumen.confirmadas)} l="Ventas" icon="check" delay={STAGGER * 3} />
              <Metrica v={String(resumen.pendientes)} l="Pendientes" icon="send" delay={STAGGER * 4} />
              <Metrica v={String(resumen.embajadores)} l="Recomiendan" icon="star" delay={STAGGER * 5} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <Metrica v={money(resumen.comisionesPagadas)} l="Comisiones pagadas" icon="dollar" delay={STAGGER * 6} />
              <Metrica v={money(resumen.ventasRegistradas)} l="Ventas registradas" icon="chart" delay={STAGGER * 7} />
            </View>
          </>
        )}

        {/* Ficha pública: lo que el cliente ve de este negocio. */}
        <SectionHeader title="Tu ficha" />
        <Fade delay={STAGGER * 8} desde={12}>
          <View style={{ borderRadius: R.md, padding: 18, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <LinearGradient
                colors={[C.primary, C.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="home" size={22} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG }} numberOfLines={1}>
                  {negocio.nombre}
                </Text>
                <View style={{ marginTop: 6, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: negocio.activo ? 'rgba(0,168,150,0.14)' : 'rgba(13,13,13,0.07)' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: negocio.activo ? '#00806F' : MUTED }}>
                    {negocio.activo ? 'Visible en el catálogo' : 'Oculto del catálogo'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginVertical: 8 }} />
            <Dato label="Categoría" valor={negocio.categoria} />
            <Dato label="Dirección" valor={negocio.direccion || 'Sin dirección'} />
            <Dato label="Oferta" valor={negocio.oferta || 'Sin oferta configurada'} />
            <Dato label="Descripción" valor={negocio.descripcion || 'Sin descripción'} />

            <PressableScale
              onPress={() => setEditando(true)}
              style={{ marginTop: 12, height: 46, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: FG }}>
              <Icon name="settings" size={15} color="#fff" />
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Editar ficha</Text>
            </PressableScale>
          </View>
        </Fade>

        <Fade delay={STAGGER * 9} desde={10}>
          <PressableScale
            onPress={() => logout()}
            style={{ marginTop: 16, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>Cerrar sesión</Text>
          </PressableScale>
          <Text style={{ marginTop: 14, textAlign: 'center', fontFamily: F.reg, fontSize: 11, color: MUTED }}>Hazlo Cash · Negocio</Text>
        </Fade>
      </ScrollView>

      <EditarNegocio
        negocio={negocio}
        visible={editando}
        onClose={() => setEditando(false)}
        onGuardado={(n) => mutar<BusinessAdmin | null>(K.miNegocio, () => n)}
      />
    </>
  );
}
