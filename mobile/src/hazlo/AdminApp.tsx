import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { useAtras } from '@/lib/atras';
import { getMiPerfil, logout } from '@/lib/services/auth';
import type { Profile } from '@/lib/types';
import { TabBar, type TabItem } from './TabBar';
import { Icon } from './icons';
import { AdminNegociosScreen } from './screens/AdminNegocios';
import { AdminOrdenesScreen } from './screens/AdminOrdenes';
import { AdminResumenScreen } from './screens/AdminResumen';
import { AdminUsuariosScreen } from './screens/AdminUsuarios';
import { Fade, PressableScale } from './motion';
import { BG, C, F, FG, MUTED, R } from './theme';

type TabAdmin = 'resumen' | 'negocios' | 'ordenes' | 'usuarios' | 'cuenta';

function CuentaAdmin() {
  const [perfil, setPerfil] = useState<Profile | null>(null);
  useEffect(() => {
    let activo = true;
    getMiPerfil().then((p) => activo && setPerfil(p));
    return () => {
      activo = false;
    };
  }, []);
  const nombre = perfil?.nombre || 'Administrador';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 18 }}>Cuenta</Text>

      <View style={{ borderRadius: R.lg, padding: 20, marginBottom: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <LinearGradient colors={['#1A1840', '#2D2B8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="settings" size={26} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG }}>{nombre}</Text>
          <View style={{ marginTop: 8, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(45,43,143,0.12)' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#2D2B8F' }}>Administrador</Text>
          </View>
        </View>
      </View>

      <PressableScale
        onPress={() => logout()}
        style={{ marginTop: 4, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.accent }}>Cerrar sesión</Text>
      </PressableScale>

      <Text style={{ marginTop: 14, textAlign: 'center', fontFamily: F.reg, fontSize: 11, color: MUTED }}>Hazlo Cash · Admin</Text>
    </ScrollView>
  );
}

const TABS: TabItem<TabAdmin>[] = [
  { k: 'resumen', label: 'Resumen', icon: 'chart' },
  { k: 'negocios', label: 'Negocios', icon: 'home' },
  { k: 'ordenes', label: 'Órdenes', icon: 'activity' },
  { k: 'usuarios', label: 'Usuarios', icon: 'user' },
  { k: 'cuenta', label: 'Cuenta', icon: 'settings' },
];

export function AdminApp() {
  const [tab, setTab] = useState<TabAdmin>('resumen');
  // Atrás (Android o navegador) desde otra pestaña regresa a Resumen.
  useAtras(tab !== 'resumen', () => setTab('resumen'));

  const screen = () => {
    if (tab === 'negocios') return <AdminNegociosScreen />;
    if (tab === 'ordenes') return <AdminOrdenesScreen />;
    if (tab === 'usuarios') return <AdminUsuariosScreen />;
    if (tab === 'cuenta') return <CuentaAdmin />;
    return <AdminResumenScreen />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Fade key={tab} style={{ flex: 1 }}>
          {screen()}
        </Fade>
      </SafeAreaView>

      <TabBar tabs={TABS} active={tab} onSelect={setTab} />
    </View>
  );
}
