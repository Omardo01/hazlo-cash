import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from './icons';
import { DUR, EASE, PressableScale, useReduceMotion } from './motion';
import { C, F, FG, MUTED, R } from './theme';
import { elegirTono, TONOS, type Tono } from './tonoInicio';

/**
 * Fondo del bloque del Inicio. Al cambiar de tono, el nuevo entra con fundido
 * sobre el anterior en vez de cambiar de golpe.
 */
export function FondoTono({ tono }: { tono: Tono }) {
  const [anterior, setAnterior] = useState(tono);
  const [visible, setVisible] = useState(tono);
  const opacidad = useRef(new Animated.Value(1)).current;
  const quieto = useReduceMotion();

  useEffect(() => {
    if (tono.id === visible.id) return;
    setAnterior(visible);
    setVisible(tono);
    if (quieto) return;
    opacidad.setValue(0);
    Animated.timing(opacidad, { toValue: 1, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
  }, [tono, visible, opacidad, quieto]);

  return (
    <>
      <LinearGradient colors={anterior.colores} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacidad }]}>
        <LinearGradient colors={visible.colores} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </>
  );
}

/**
 * Visor para probar colores del bloque del Inicio en vivo: una tira de
 * muestras sobre la barra de abajo. No es un Modal a propósito: deja ver el
 * Inicio detrás mientras se cambia. Entra deslizándose y sale antes de
 * desmontarse.
 */
export function VisorTonos({ visible, actual, onCerrar }: { visible: boolean; actual: Tono; onCerrar: () => void }) {
  const [montado, setMontado] = useState(visible);
  const p = useRef(new Animated.Value(0)).current;
  const quieto = useReduceMotion();

  useEffect(() => {
    if (visible) {
      setMontado(true);
      if (quieto) return p.setValue(1);
      Animated.timing(p, { toValue: 1, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
    } else if (montado) {
      if (quieto) {
        p.setValue(0);
        setMontado(false);
        return;
      }
      Animated.timing(p, { toValue: 0, duration: DUR.base, easing: EASE.in, useNativeDriver: true }).start(() => setMontado(false));
    }
  }, [visible, montado, p, quieto]);

  if (!montado) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 104,
        opacity: p,
        transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        borderRadius: R.lg,
        backgroundColor: '#fff',
        paddingTop: 14,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Color del bloque</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>{actual.nombre} · se guarda en este dispositivo</Text>
        </View>
        <PressableScale
          onPress={onCerrar}
          accessibilityRole="button"
          style={{ height: 32, paddingHorizontal: 14, borderRadius: 999, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: '#fff' }}>Listo</Text>
        </PressableScale>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
        {TONOS.map((t) => {
          const elegido = t.id === actual.id;
          return (
            <PressableScale
              key={t.id}
              onPress={() => elegirTono(t.id)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${t.nombre}`}
              accessibilityState={{ selected: elegido }}
              style={{ alignItems: 'center', width: 64 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  padding: 3,
                  borderWidth: 2,
                  borderColor: elegido ? C.primary : 'transparent',
                }}>
                <LinearGradient colors={t.colores} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                  {elegido && <Icon name="check" size={16} color="#fff" sw={2.6} />}
                </LinearGradient>
              </View>
              <Text numberOfLines={2} style={{ fontFamily: elegido ? F.semi : F.reg, fontSize: 10.5, color: elegido ? FG : MUTED, marginTop: 5, textAlign: 'center' }}>
                {t.nombre}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
