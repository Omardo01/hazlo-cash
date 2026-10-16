import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { DUR, EASE, PressableScale, useReduceMotion } from '../motion';
import { C, F } from '../theme';

/**
 * Botón flotante del Inicio que abre "Así funciona Hazlo Cash". Entra con un
 * pop y un anillo que late de vez en cuando para que se note sin estorbar.
 */
export function BotonComoFunciona({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  const entrada = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const quieto = useReduceMotion();

  useEffect(() => {
    Animated.timing(entrada, { toValue: visible ? 1 : 0, duration: visible ? DUR.slow : DUR.base, easing: visible ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [visible, entrada]);

  useEffect(() => {
    if (quieto) return;
    const latido = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(pulso, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    latido.start();
    return () => latido.stop();
  }, [pulso, quieto]);

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={{
        position: 'absolute',
        right: 16,
        bottom: 118,
        opacity: entrada,
        transform: [{ scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
      }}>
      {/* Anillo que se expande y se desvanece */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: C.primary,
          opacity: pulso.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.6, 0] }),
          transform: [{ scaleX: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }, { scaleY: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
        }}
      />
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Ver cómo funciona Hazlo Cash"
        style={{ borderRadius: 999, overflow: 'hidden', shadowColor: C.accent, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }}>
        <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 44, paddingLeft: 6, paddingRight: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="play" size={15} color="#fff" style={{ marginLeft: 2 }} />
          </View>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Cómo funciona</Text>
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}
