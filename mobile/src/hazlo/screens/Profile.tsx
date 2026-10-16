import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Animated, ScrollView, Text, View } from 'react-native';

import { useAjustes, useComisiones, usePerfil, useStatsEmbajador } from '@/lib/datos/consultas';
import { logout } from '@/lib/services/auth';
import { calcularNivel } from '@/lib/services/referrals';
import { AdminAltaNegocio } from '../AdminAltaNegocio';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { DUR, EASE, Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { SectionHeader } from '../ui';
import type { ScreenProps } from './types';

// Iniciales para el avatar a partir del nombre del perfil.
function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '··';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

// Barra de nivel: se anima con scaleX (native driver), nunca con width.
function BarraNivel({ progreso }: { progreso: number }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(v, { toValue: progreso, duration: DUR.slow, delay: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
  }, [v, progreso]);
  return (
    <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', marginTop: 12 }}>
      <Animated.View
        style={{ height: '100%', width: '100%', borderRadius: 999, backgroundColor: C.primary, alignSelf: 'flex-start', transform: [{ scaleX: v }] }}
      />
    </View>
  );
}

export function ProfileScreen({ openSheet, onAbrirCuentas }: ScreenProps & { onAbrirCuentas: () => void }) {
  const { datos: perfil, cargando: cargandoPerfil } = usePerfil();
  const { datos: stats, cargando: cargandoStats } = useStatsEmbajador();
  const { datos: comisiones = [] } = useComisiones();
  const { datos: ajustesSaldo = [] } = useAjustes();
  // Igual que en Inicio 2: comisiones + ajustes del admin, para que cuadre con el saldo.
  const ganado = comisiones.reduce((t, c) => t + c.monto, 0) + ajustesSaldo.reduce((t, a) => t + a.monto, 0);
  // El perfil aguanta minutos en caché, así que al volver aquí ya está puesto:
  // el "cargando" solo aplica al primer arranque de la sesión.
  const cargando = cargandoPerfil || cargandoStats;

  const [altaVisible, setAltaVisible] = useState(false);

  const nombre = perfil?.nombre || 'Tu perfil';
  const esAdmin = perfil?.roles?.includes('admin') ?? false;
  const esEmbajador = perfil?.roles?.includes('embajador') ?? false;
  const rolPrincipal = esAdmin ? 'Admin' : esEmbajador ? 'Embajador' : 'Cliente';
  const nivel = calcularNivel(stats?.confirmadas ?? 0);

  // Métodos de pago es la única entrada viva por ahora; el resto se marca como
  // pendiente en vez de fingir que hace algo.
  const ajustes: { t: string; icon: IconName; badge?: string; onPress?: () => void }[] = [
    { t: 'Métodos de pago', icon: 'wallet', onPress: onAbrirCuentas },
    { t: 'Cuenta y verificación', icon: 'user', badge: 'Pronto' },
    { t: 'Notificaciones', icon: 'bell', badge: 'Pronto' },
    { t: 'Privacidad', icon: 'settings', badge: 'Pronto' },
  ];

  const tarjetas: { v: string; l: string }[] = [
    { v: String(stats?.recomendaciones ?? 0), l: 'Recos' },
    { v: String(stats?.clientes ?? 0), l: 'Amigos' },
    { v: `$${ganado.toFixed(0)}`, l: 'Ganado' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      <Fade desde={8}>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Perfil</Text>
      </Fade>

      {/* Identidad */}
      <Fade delay={STAGGER} desde={10}>
        <View style={{ borderRadius: R.lg, padding: 20, marginBottom: 12, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 24, letterSpacing: -0.5 }}>{iniciales(nombre)}</Text>
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 17, color: FG }}>{nombre}</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 1 }}>{rolPrincipal}</Text>
            {perfil?.telefono ? (
              <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 2 }}>{perfil.telefono}</Text>
            ) : null}
          </View>
        </View>
      </Fade>

      {/* Nivel de embajador — solo tiene sentido con el rol */}
      {esEmbajador && (
        <Fade delay={STAGGER * 2} desde={12}>
          <View style={{ borderRadius: R.lg, padding: 20, marginBottom: 14, backgroundColor: '#0D0D0D', overflow: 'hidden' }}>
            <View style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.4 }}>
              <HazloMark size={140} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="star" size={14} color={C.primary} fill={C.primary} sw={1} />
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Embajador {nivel.nivel}
              </Text>
            </View>

            {cargando ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color={C.primary} />
              </View>
            ) : (
              <>
                <Text style={{ fontFamily: F.bold, fontSize: 26, color: '#fff', letterSpacing: -0.6, marginTop: 8 }}>
                  {stats?.confirmadas ?? 0} <Text style={{ fontSize: 15, fontFamily: F.reg, color: 'rgba(255,255,255,0.6)' }}>ventas confirmadas</Text>
                </Text>
                <BarraNivel progreso={nivel.progreso} />
                <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 17 }}>
                  {nivel.siguiente
                    ? `Te faltan ${nivel.faltan} ${nivel.faltan === 1 ? 'venta' : 'ventas'} para llegar a ${nivel.siguiente}.`
                    : 'Estás en el nivel más alto. '}
                  {stats && stats.pendientes > 0 ? `Tienes ${stats.pendientes} por confirmar.` : ''}
                </Text>
              </>
            )}
          </View>
        </Fade>
      )}

      {/* Admin: alta de negocios (solo rol admin) */}
      {esAdmin && (
        <Fade delay={STAGGER * 3} desde={10}>
          <PressableScale
            onPress={() => setAltaVisible(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: R.lg, marginBottom: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: C.primary }}>
            <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={22} color={C.primary} sw={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Dar de alta un negocio</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 2 }}>Panel de administrador</Text>
            </View>
            <Icon name="chevR" size={16} color={MUTED} />
          </PressableScale>
        </Fade>
      )}

      {/* Invite CTA */}
      <Fade delay={STAGGER * 4} desde={10}>
        <PressableScale
          onPress={() => openSheet('invite')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: R.lg, marginBottom: 22, backgroundColor: '#0D0D0D', overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -20, top: -10, opacity: 0.7 }}>
            <HazloMark size={90} />
          </View>
          <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)' }}>
            <Icon name="qr" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Mi código de invitación</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              Genera tu QR y gana <Text style={{ color: C.primary, fontFamily: F.semi }}>$5</Text> por amigo
            </Text>
          </View>
          <Icon name="chevR" size={16} color="rgba(255,255,255,0.5)" />
        </PressableScale>
      </Fade>

      {/* Stats reales */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
        {tarjetas.map((s, i) => (
          <Fade key={s.l} delay={STAGGER * 5 + i * STAGGER} desde={12} style={{ flex: 1 }}>
            <View style={{ paddingVertical: 12, paddingHorizontal: 10, borderRadius: R.md, alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.36 }}>{cargando ? '—' : s.v}</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, marginTop: 1 }}>{s.l}</Text>
            </View>
          </Fade>
        ))}
      </View>

      {/* Ajustes */}
      <Fade delay={STAGGER * 6}>
        <SectionHeader title="Ajustes" />
      </Fade>
      <Fade delay={STAGGER * 6} desde={12}>
        <View style={{ borderRadius: R.md, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          {ajustes.map((s, i) => (
            <PressableScale
              key={s.t}
              onPress={s.onPress}
              disabled={!s.onPress}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: i < ajustes.length - 1 ? 0.5 : 0, borderColor: 'rgba(0,0,0,0.05)' }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={16} color={C.primary} />
              </View>
              <Text style={{ flex: 1, fontFamily: F.base, fontSize: 13, color: s.onPress ? FG : MUTED }}>{s.t}</Text>
              {s.badge ? (
                <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 10, color: MUTED }}>{s.badge}</Text>
                </View>
              ) : null}
              <Icon name="chevR" size={16} color={MUTED} />
            </PressableScale>
          ))}
        </View>
      </Fade>

      {/* Cerrar sesión */}
      <Fade delay={STAGGER * 7}>
        <PressableScale
          onPress={() => logout()}
          style={{ marginTop: 18, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>Cerrar sesión</Text>
        </PressableScale>
        <Text style={{ marginTop: 14, textAlign: 'center', fontFamily: F.reg, fontSize: 11, color: MUTED }}>Hazlo Cash · v2.4.1</Text>
      </Fade>

      {esAdmin && <AdminAltaNegocio visible={altaVisible} onClose={() => setAltaVisible(false)} />}
    </ScrollView>
  );
}
