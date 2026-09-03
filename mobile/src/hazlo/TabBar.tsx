import { useEffect, useRef, useState } from 'react';
import { BlurView } from 'expo-blur';
import { Animated, Text, View } from 'react-native';

import { Icon, IconName } from './icons';
import { DUR, EASE, PressableScale, useReduceMotion } from './motion';
import { C, F } from './theme';

const MUTED_TAB = 'rgba(13,13,13,0.45)';

export type TabItem<K extends string> = { k: K; label: string; icon: IconName };

type Props<K extends string> = {
  tabs: TabItem<K>[];
  active: K;
  onSelect: (k: K) => void;
  // Si se pasa, muestra el FAB morado central (parte los tabs en dos mitades).
  onPlus?: () => void;
};

// Selector glassmorphism compartido por las 3 apps (cliente/embajador, negocio, admin).
export function TabBar<K extends string>({ tabs, active, onSelect, onPlus }: Props<K>) {
  const TabBtn = ({ t }: { t: TabItem<K> }) => {
    const isActive = active === t.k;
    const color = isActive ? C.primary : MUTED_TAB;
    // Pequeño impulso del icono al volverse activo: confirma el cambio de tab
    // sin que haga falta leer el color.
    const pop = useState(() => new Animated.Value(isActive ? 1 : 0))[0];
    const reduce = useReduceMotion();

    useEffect(() => {
      if (reduce) {
        pop.setValue(isActive ? 1 : 0);
        return;
      }
      Animated.timing(pop, {
        toValue: isActive ? 1 : 0,
        duration: DUR.fast,
        easing: EASE.out,
        useNativeDriver: true,
      }).start();
    }, [isActive, pop, reduce]);

    const escala = pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

    return (
      <PressableScale onPress={() => onSelect(t.k)} style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <Animated.View style={{ transform: [{ scale: escala }] }}>
          <Icon name={t.icon} size={22} color={color} sw={isActive ? 2.2 : 1.8} />
        </Animated.View>
        <Text style={{ fontFamily: F.semi, fontSize: 9.5, color }}>{t.label}</Text>
        <Animated.View
          style={{ position: 'absolute', bottom: 1, width: 4, height: 4, borderRadius: 999, backgroundColor: C.primary, opacity: pop }}
        />
      </PressableScale>
    );
  };

  // Con FAB se reserva un hueco central y se reparten los tabs a ambos lados.
  const half = Math.ceil(tabs.length / 2);
  const left = onPlus ? tabs.slice(0, half) : tabs;
  const right = onPlus ? tabs.slice(half) : [];

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
        {onPlus && <View style={{ width: 64 }} />}
        {right.map((t) => (
          <TabBtn key={t.k} t={t} />
        ))}
      </BlurView>

      {/* FAB flotante — overlay fuera del recorte, sobresale por arriba */}
      {onPlus && (
        <View pointerEvents="box-none" style={{ position: 'absolute', top: -18, left: 0, right: 0, alignItems: 'center' }}>
          <PressableScale
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
          </PressableScale>
        </View>
      )}
    </View>
  );
}
