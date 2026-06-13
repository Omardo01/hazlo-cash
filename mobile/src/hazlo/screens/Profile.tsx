import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getMiPerfil, logout } from '@/lib/services/auth';
import type { Profile } from '@/lib/types';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
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

const settings: { t: string; icon: IconName; badge?: string }[] = [
  { t: 'Cuenta y verificación', icon: 'user' },
  { t: 'Métodos de pago', icon: 'wallet' },
  { t: 'Notificaciones', icon: 'bell' },
  { t: 'Privacidad', icon: 'settings' },
  { t: 'Programa de embajadores', icon: 'gift', badge: 'Nuevo' },
];

const miniStats = [
  { v: '23', l: 'Recos' },
  { v: '12', l: 'Amigos' },
  { v: '$487', l: 'Total' },
];

export function ProfileScreen({ openSheet }: ScreenProps) {
  const [perfil, setPerfil] = useState<Profile | null>(null);

  useEffect(() => {
    let activo = true;
    getMiPerfil().then((p) => {
      if (activo) setPerfil(p);
    });
    return () => {
      activo = false;
    };
  }, []);

  const nombre = perfil?.nombre || 'Tu perfil';
  const rolPrincipal = perfil?.roles?.includes('embajador')
    ? 'Embajador'
    : perfil?.roles?.[0]
      ? perfil.roles[0][0].toUpperCase() + perfil.roles[0].slice(1)
      : 'Cliente';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Perfil</Text>

      {/* Profile card */}
      <View style={{ borderRadius: R.lg, padding: 20, marginBottom: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 24, letterSpacing: -0.5 }}>{iniciales(nombre)}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG }}>{nombre}</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 1 }}>{rolPrincipal}</Text>
          <View style={{ marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: `${C.primary}15` }}>
            <Icon name="star" size={11} color={C.primary} fill={C.primary} sw={1} />
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>{rolPrincipal} nivel 2</Text>
          </View>
        </View>
      </View>

      {/* Invite CTA */}
      <Pressable
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
      </Pressable>

      {/* Stats grid */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
        {miniStats.map((s) => (
          <View key={s.l} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, borderRadius: R.md, alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.36 }}>{s.v}</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, marginTop: 1 }}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* Settings */}
      <SectionHeader title="Ajustes" />
      <View style={{ borderRadius: R.md, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        {settings.map((s, i) => (
          <View key={s.t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: i < settings.length - 1 ? 0.5 : 0, borderColor: 'rgba(0,0,0,0.05)' }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={s.icon} size={16} color={C.primary} />
            </View>
            <Text style={{ flex: 1, fontFamily: F.base, fontSize: 13, color: FG }}>{s.t}</Text>
            {s.badge ? (
              <View style={{ backgroundColor: `${C.primary}18`, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 10, color: C.primary }}>{s.badge}</Text>
              </View>
            ) : null}
            <Icon name="chevR" size={16} color={MUTED} />
          </View>
        ))}
      </View>

      {/* Cerrar sesión */}
      <Pressable
        onPress={() => logout()}
        style={{ marginTop: 18, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>Cerrar sesión</Text>
      </Pressable>

      <Text style={{ marginTop: 14, textAlign: 'center', fontFamily: F.reg, fontSize: 11, color: MUTED }}>Hazlo Cash · v2.4.1</Text>
    </ScrollView>
  );
}
