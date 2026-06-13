import { BlurView } from 'expo-blur';
import { Pressable, Text, View } from 'react-native';

import { Icon, IconName } from './icons';
import { C, F } from './theme';
import type { Tab } from './screens/types';

const MUTED_TAB = 'rgba(13,13,13,0.45)';

const tabs: { k: Tab; label: string; icon: IconName }[] = [
  { k: 'home', label: 'Inicio', icon: 'home' },
  { k: 'discover', label: 'Descubre', icon: 'search' },
  { k: 'balance', label: 'Actividad', icon: 'activity' },
  { k: 'profile', label: 'Perfil', icon: 'user' },
];

export function TabBar({ tab, setTab, onPlus }: { tab: Tab; setTab: (t: Tab) => void; onPlus: () => void }) {
  // [Inicio, Descubre, (FAB), Actividad, Perfil]
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);

  const TabBtn = ({ t }: { t: (typeof tabs)[number] }) => {
    const active = tab === t.k;
    const color = active ? C.primary : MUTED_TAB;
    return (
      <Pressable onPress={() => setTab(t.k)} style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <Icon name={t.icon} size={22} color={color} sw={active ? 2.2 : 1.8} />
        <Text style={{ fontFamily: F.semi, fontSize: 9.5, color }}>{t.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ position: 'absolute', bottom: 26, left: 16, right: 16 }}>
      {/* Barra (recorta su propio contenido para el blur redondeado) */}
      <BlurView
        intensity={40}
        tint="light"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 8,
          backgroundColor: 'rgba(255,255,255,0.55)',
          borderWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.6)',
          borderRadius: 28,
          overflow: 'hidden',
        }}>
        {left.map((t) => (
          <TabBtn key={t.k} t={t} />
        ))}
        {/* hueco reservado para el FAB */}
        <View style={{ width: 64 }} />
        {right.map((t) => (
          <TabBtn key={t.k} t={t} />
        ))}
      </BlurView>

      {/* FAB flotante — overlay fuera del recorte, sobresale por arriba */}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: -18, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          onPress={onPlus}
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: '#F5F3F0',
            shadowColor: C.primary,
            shadowOpacity: 0.45,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}>
          <Icon name="plus" size={24} color="#fff" sw={2.4} />
        </Pressable>
      </View>
    </View>
  );
}
