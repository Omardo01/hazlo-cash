import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { DUR, useReduceMotion } from '../motion';
import { BG } from '../theme';

export type Snap = 'pico' | 'medio' | 'alto';

export type Alturas = Record<Snap, number>;

const ENTRADA = { duration: DUR.slow, easing: Easing.out(Easing.cubic) };
const SIGUIENTE: Record<Snap, Snap> = { pico: 'medio', medio: 'alto', alto: 'pico' };

/**
 * Hoja sobre el mapa, sin Modal: el mapa sigue vivo debajo. Se arrastra del
 * encabezado; el cuerpo es libre para hacer scroll. `encima` son los controles
 * que viajan pegados a su borde y se van cuando la hoja tapa el mapa.
 */
export function Hoja({
  alturas,
  altoMax,
  snap,
  alCambiar,
  encima,
  encabezado,
  children,
}: {
  alturas: Alturas;
  /** Altura de la hoja completamente abierta. */
  altoMax: number;
  snap: Snap;
  alCambiar: (snap: Snap) => void;
  encima: React.ReactNode;
  encabezado: React.ReactNode;
  children: React.ReactNode;
}) {
  const reduce = useReduceMotion();
  const destinos = {
    pico: altoMax - alturas.pico,
    medio: altoMax - alturas.medio,
    alto: altoMax - alturas.alto,
  };
  // Nace abajo de la pantalla y sube al montarse.
  const y = useSharedValue(altoMax);

  useEffect(() => {
    y.set(reduce ? destinos[snap] : withTiming(destinos[snap], ENTRADA));
    // Solo cuando cambia el destino.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, destinos.pico, destinos.medio, destinos.alto, reduce]);

  const { pico: yPico, medio: yMedio, alto: yAlto } = destinos;
  const arrastre = Gesture.Pan()
    .minDistance(2)
    .onChange((e) => {
      y.set(Math.min(yPico, Math.max(yAlto, y.get() + e.changeY)));
    })
    .onEnd((e) => {
      // Se proyecta el impulso: un jalón corto y rápido también cambia de nivel.
      const proyectado = y.get() + e.velocityY * 0.12;
      const opciones: [Snap, number][] = [['pico', yPico], ['medio', yMedio], ['alto', yAlto]];
      let mejor = opciones[0];
      for (const o of opciones) if (Math.abs(o[1] - proyectado) < Math.abs(mejor[1] - proyectado)) mejor = o;
      y.set(withTiming(mejor[1], ENTRADA));
      scheduleOnRN(alCambiar, mejor[0]);
    });

  const hoja = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const controles = useAnimatedStyle(() => ({
    opacity: interpolate(y.get(), [yAlto + 80, yMedio], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, height: altoMax }, hoja]}>
      {/* Como prop: en web, «box-none» dentro del estilo de un Animated.View se pierde. */}
      <Animated.View pointerEvents="box-none" style={[{ position: 'absolute', left: 12, right: 12, bottom: altoMax + 10 }, controles]}>
        {encima}
      </Animated.View>
      <View
        style={{
          flex: 1,
          backgroundColor: BG,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          overflow: 'hidden',
          boxShadow: '0 -8px 24px rgba(13,13,13,0.14)',
        }}>
        <GestureDetector gesture={arrastre}>
          <View>
            <Pressable onPress={() => alCambiar(SIGUIENTE[snap])} accessibilityRole="button" accessibilityLabel="Cambiar el tamaño de la hoja" style={{ alignItems: 'center', paddingTop: 9, paddingBottom: 7 }}>
              <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(13,13,13,0.18)' }} />
            </Pressable>
            {encabezado}
          </View>
        </GestureDetector>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </Animated.View>
  );
}
