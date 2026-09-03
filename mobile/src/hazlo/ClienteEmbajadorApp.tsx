import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Retiros } from './Retiros';
import { TabBar, type TabItem } from './TabBar';
import { Sheet } from './sheets';
import { BG } from './theme';
import { BalanceScreen } from './screens/Balance';
import { DiscoverScreen } from './screens/Discover';
import { HomeScreen } from './screens/Home';
import { Home2Screen } from './screens/Home2';
import { ProfileScreen } from './screens/Profile';
import { ShareScreen } from './screens/Share';
import type { SheetName, Tab } from './screens/types';

// [Inicio, Inicio 2, Descubre, (FAB), Actividad, Perfil]
// 'Inicio 2' es la propuesta de rediseño que estamos comparando contra la
// actual; cuando se elija una, la otra se quita de aquí.
const TABS: TabItem<Tab>[] = [
  { k: 'home', label: 'Inicio', icon: 'home' },
  { k: 'home2', label: 'Inicio 2', icon: 'dollar' },
  { k: 'discover', label: 'Descubre', icon: 'search' },
  { k: 'balance', label: 'Actividad', icon: 'activity' },
  { k: 'profile', label: 'Perfil', icon: 'user' },
];

// Experiencia para cliente / embajador (catálogo, recomendar, balance, perfil).
export function ClienteEmbajadorApp() {
  const [tab, setTab] = useState<Tab>('home');
  const [sheet, setSheet] = useState<SheetName | null>(null);
  // Se incrementa al reclamar un código para que Home recargue sus visitas.
  const [homeReload, setHomeReload] = useState(0);
  // Pantalla de retiros: null = cerrada; si abre, con qué pestaña.
  const [retiros, setRetiros] = useState<'historial' | 'cuentas' | null>(null);

  const go = (t: Tab) => setTab(t);
  const openSheet = (s: SheetName) => setSheet(s);

  // Al cerrar el sheet de reclamar, fuerza recarga de Home (nueva venta en proceso).
  const cerrarSheet = () => {
    if (sheet === 'claim') setHomeReload((k) => k + 1);
    setSheet(null);
  };

  const screen = () => {
    switch (tab) {
      case 'home2':
        return <Home2Screen go={go} openSheet={openSheet} reloadKey={homeReload} />;
      case 'discover':
        return <DiscoverScreen />;
      case 'balance':
        return <BalanceScreen go={go} openSheet={openSheet} onAbrirRetiros={() => setRetiros('historial')} />;
      case 'share':
        return <ShareScreen />;
      case 'profile':
        return <ProfileScreen go={go} openSheet={openSheet} onAbrirCuentas={() => setRetiros('cuentas')} />;
      default:
        return <HomeScreen go={go} openSheet={openSheet} reloadKey={homeReload} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flex: 1 }}>{screen()}</View>
      </SafeAreaView>

      <TabBar tabs={TABS} active={tab} onSelect={setTab} onPlus={() => setSheet('action')} />

      {retiros && <Retiros visible vistaInicial={retiros} onClose={() => setRetiros(null)} />}

      {sheet && (
        <Sheet
          name={sheet}
          onAbrirCuentas={() => setRetiros('cuentas')}
          onClose={cerrarSheet}
          onNav={(t) => {
            if (sheet === 'claim') setHomeReload((k) => k + 1);
            setTab(t);
            setSheet(null);
          }}
          onOpenSheet={(s) => setSheet(s)}
        />
      )}
    </View>
  );
}
