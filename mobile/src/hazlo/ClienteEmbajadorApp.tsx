import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAtras } from '@/lib/atras';

import { ExplicadorHazlo } from './explicador/ExplicadorHazlo';
import { Retiros } from './Retiros';
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

// Experiencia del recomendador (inicio, catálogo, recomendar, actividad, perfil).
export function ClienteEmbajadorApp() {
  const [tab, setTab] = useState<Tab>('home');
  const [sheet, setSheet] = useState<SheetName | null>(null);
  // Pantalla de retiros: null = cerrada; si abre, con qué pestaña.
  const [retiros, setRetiros] = useState<'historial' | 'cuentas' | null>(null);
  // Animación de 30 s "Así funciona Hazlo Cash".
  const [explicador, setExplicador] = useState(false);

  const go = (t: Tab) => setTab(t);
  const openSheet = (s: SheetName) => setSheet(s);

  const cerrarSheet = () => setSheet(null);

  // Atrás (Android o navegador): de otra pestaña vuelve a Inicio; retiros y
  // el explicador se cierran. Las hojas manejan su propio atrás (animan su
  // salida). Sin esto, atrás en web sacaba de la app.
  useAtras(tab !== 'home', () => setTab('home'));
  useAtras(retiros !== null, () => setRetiros(null));
  useAtras(explicador, () => setExplicador(false));

  const screen = () => {
    switch (tab) {
      case 'discover':
        return <DiscoverScreen />;
      case 'balance':
        return <BalanceScreen go={go} openSheet={openSheet} onAbrirRetiros={() => setRetiros('historial')} />;
      case 'share':
        return <ShareScreen />;
      case 'profile':
        return <ProfileScreen go={go} openSheet={openSheet} onAbrirCuentas={() => setRetiros('cuentas')} />;
      default:
        return <HomeScreen go={go} openSheet={openSheet} onComoFunciona={() => setExplicador(true)} />;
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
            setTab(t);
            setSheet(null);
          }}
          onOpenSheet={(s) => setSheet(s)}
        />
      )}

      {/* Encima de todo, incluida la barra de abajo. */}
      <ExplicadorHazlo
        visible={explicador}
        onCerrar={() => setExplicador(false)}
        onRecomendar={() => {
          setExplicador(false);
          setTab('share');
        }}
      />
    </View>
  );
}
