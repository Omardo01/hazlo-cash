import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TabBar, type TabItem } from './TabBar';
import { Sheet } from './sheets';
import { BG } from './theme';
import { BalanceScreen } from './screens/Balance';
import { DiscoverScreen } from './screens/Discover';
import { HomeScreen } from './screens/Home';
import { ProfileScreen } from './screens/Profile';
import { ShareScreen } from './screens/Share';
import type { SheetName, Tab } from './screens/types';

// [Inicio, Descubre, (FAB), Actividad, Perfil]
const TABS: TabItem<Tab>[] = [
  { k: 'home', label: 'Inicio', icon: 'home' },
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

  const go = (t: Tab) => setTab(t);
  const openSheet = (s: SheetName) => setSheet(s);

  // Al cerrar el sheet de reclamar, fuerza recarga de Home (nueva venta en proceso).
  const cerrarSheet = () => {
    if (sheet === 'claim') setHomeReload((k) => k + 1);
    setSheet(null);
  };

  const screen = () => {
    switch (tab) {
      case 'discover':
        return <DiscoverScreen />;
      case 'balance':
        return <BalanceScreen go={go} openSheet={openSheet} />;
      case 'share':
        return <ShareScreen />;
      case 'profile':
        return <ProfileScreen go={go} openSheet={openSheet} />;
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

      {sheet && (
        <Sheet
          name={sheet}
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
