import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TabBar } from './TabBar';
import { Sheet } from './sheets';
import { BG } from './theme';
import { BalanceScreen } from './screens/Balance';
import { DiscoverScreen } from './screens/Discover';
import { HomeScreen } from './screens/Home';
import { ProfileScreen } from './screens/Profile';
import { ShareScreen } from './screens/Share';
import type { SheetName, Tab } from './screens/types';

// Experiencia para cliente / embajador (catálogo, recomendar, balance, perfil).
export function ClienteEmbajadorApp() {
  const [tab, setTab] = useState<Tab>('home');
  const [sheet, setSheet] = useState<SheetName | null>(null);

  const go = (t: Tab) => setTab(t);
  const openSheet = (s: SheetName) => setSheet(s);

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
        return <HomeScreen go={go} openSheet={openSheet} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flex: 1 }}>{screen()}</View>
      </SafeAreaView>

      <TabBar tab={tab} setTab={setTab} onPlus={() => setSheet('action')} />

      {sheet && (
        <Sheet
          name={sheet}
          onClose={() => setSheet(null)}
          onNav={(t) => {
            setTab(t);
            setSheet(null);
          }}
          onOpenSheet={(s) => setSheet(s)}
        />
      )}
    </View>
  );
}
