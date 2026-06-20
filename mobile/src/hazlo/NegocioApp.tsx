import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { getMiPerfil, logout } from '@/lib/services/auth';
import type { Profile } from '@/lib/types';
import { TabBar, type TabItem } from './TabBar';
import { Icon } from './icons';
import { SolicitudesNegocioScreen } from './screens/SolicitudesNegocio';
import { BG, C, F, FG, MUTED, R } from './theme';

type TabNeg = 'solicitudes' | 'cuenta';

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '··';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

function CuentaNegocio() {
  const [perfil, setPerfil] = useState<Profile | null>(null);
  useEffect(() => {
    let activo = true;
    getMiPerfil().then((p) => activo && setPerfil(p));
    return () => {
      activo = false;
    };
  }, []);
  const nombre = perfil?.nombre || 'Tu negocio';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Mi negocio</Text>

      <View style={{ borderRadius: R.lg, padding: 20, marginBottom: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 22, letterSpacing: -0.5 }}>{iniciales(nombre)}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG }}>{nombre}</Text>
          <View style={{ marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: `${C.primary}15` }}>
            <Icon name="star" size={11} color={C.primary} fill={C.primary} sw={1} />
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>Negocio</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => logout()}
        style={{ marginTop: 4, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>Cerrar sesión</Text>
      </Pressable>

      <Text style={{ marginTop: 14, textAlign: 'center', fontFamily: F.reg, fontSize: 11, color: MUTED }}>Hazlo Cash · Negocio</Text>
    </ScrollView>
  );
}

const TABS: TabItem<TabNeg>[] = [
  { k: 'solicitudes', label: 'Solicitudes', icon: 'activity' },
  { k: 'cuenta', label: 'Mi negocio', icon: 'user' },
];

export function NegocioApp() {
  const [tab, setTab] = useState<TabNeg>('solicitudes');

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flex: 1 }}>{tab === 'solicitudes' ? <SolicitudesNegocioScreen /> : <CuentaNegocio />}</View>
      </SafeAreaView>

      <TabBar tabs={TABS} active={tab} onSelect={setTab} />
    </View>
  );
}
