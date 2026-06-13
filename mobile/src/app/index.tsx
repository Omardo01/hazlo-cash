import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/lib/auth-context';
import { Splash } from '@/hazlo/Splash';
import { TabBar } from '@/hazlo/TabBar';
import { Sheet } from '@/hazlo/sheets';
import { BG } from '@/hazlo/theme';
import { BalanceScreen } from '@/hazlo/screens/Balance';
import { DiscoverScreen } from '@/hazlo/screens/Discover';
import { HomeScreen } from '@/hazlo/screens/Home';
import { LoginScreen } from '@/hazlo/screens/Login';
import { ProfileScreen } from '@/hazlo/screens/Profile';
import { ShareScreen } from '@/hazlo/screens/Share';
import type { SheetName, Tab } from '@/hazlo/screens/types';

export default function HazloApp() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const [showSplash, setShowSplash] = useState(true);

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

  // Aún verificando si hay sesión guardada en el dispositivo: solo el splash.
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <StatusBar style="dark" />
        {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      </View>
    );
  }

  // Sin sesión → login. El splash sigue encima hasta que termine su animación.
  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <LoginScreen />
        </SafeAreaView>
        {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      </View>
    );
  }

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

      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
    </View>
  );
}
