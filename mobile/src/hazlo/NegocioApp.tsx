import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAtras } from '@/lib/atras';

import { TabBar, type TabItem } from './TabBar';
import { Fade } from './motion';
import { EmbajadoresNegocioScreen } from './screens/EmbajadoresNegocio';
import { InicioNegocioScreen } from './screens/InicioNegocio';
import { MiNegocioScreen } from './screens/MiNegocio';
import { SolicitudesNegocioScreen } from './screens/SolicitudesNegocio';
import { BG } from './theme';

type TabNeg = 'inicio' | 'solicitudes' | 'embajadores' | 'negocio';

// [Inicio, Solicitudes, (escanear), Embajadores, Mi negocio]
const TABS: TabItem<TabNeg>[] = [
  { k: 'inicio', label: 'Inicio', icon: 'home' },
  { k: 'solicitudes', label: 'Solicitudes', icon: 'activity' },
  { k: 'embajadores', label: 'Embajadores', icon: 'star' },
  { k: 'negocio', label: 'Mi negocio', icon: 'settings' },
];

export function NegocioApp() {
  const [tab, setTab] = useState<TabNeg>('inicio');
  // Escanear es la acción principal del negocio: el botón central de la barra
  // (y el del Inicio) lleva a Solicitudes, que es donde vive el escáner y la
  // confirmación de la venta, y lo abre.
  const [escanear, setEscanear] = useState(0);
  const abrirEscaner = () => {
    setTab('solicitudes');
    setEscanear((k) => k + 1);
  };
  // Navegar normal limpia el pedido: si no, volver a Solicitudes más tarde
  // (se monta de nuevo) abriría el escáner otra vez.
  const ir = (t: TabNeg) => {
    setTab(t);
    setEscanear(0);
  };

  // Atrás (Android o navegador) desde otra pestaña regresa a Inicio.
  useAtras(tab !== 'inicio', () => ir('inicio'));

  const screen = () => {
    if (tab === 'inicio') return <InicioNegocioScreen onEscanear={abrirEscaner} ir={ir} />;
    if (tab === 'embajadores') return <EmbajadoresNegocioScreen />;
    if (tab === 'negocio') return <MiNegocioScreen />;
    return <SolicitudesNegocioScreen escanear={escanear} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Fade key={tab} style={{ flex: 1 }}>
          {screen()}
        </Fade>
      </SafeAreaView>

      <TabBar tabs={TABS} active={tab} onSelect={ir} onPlus={abrirEscaner} plusIcon="qr" />
    </View>
  );
}
