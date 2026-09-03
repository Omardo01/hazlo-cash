import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TabBar, type TabItem } from './TabBar';
import { Fade } from './motion';
import { EmbajadoresNegocioScreen } from './screens/EmbajadoresNegocio';
import { MiNegocioScreen } from './screens/MiNegocio';
import { SolicitudesNegocioScreen } from './screens/SolicitudesNegocio';
import { BG } from './theme';

type TabNeg = 'solicitudes' | 'embajadores' | 'negocio';

const TABS: TabItem<TabNeg>[] = [
  { k: 'solicitudes', label: 'Solicitudes', icon: 'activity' },
  { k: 'embajadores', label: 'Embajadores', icon: 'star' },
  { k: 'negocio', label: 'Mi negocio', icon: 'home' },
];

export function NegocioApp() {
  const [tab, setTab] = useState<TabNeg>('solicitudes');

  const screen = () => {
    if (tab === 'embajadores') return <EmbajadoresNegocioScreen />;
    if (tab === 'negocio') return <MiNegocioScreen />;
    return <SolicitudesNegocioScreen />;
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
