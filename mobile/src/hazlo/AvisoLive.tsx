import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLive, type Aviso } from '@/lib/datos/realtime';
import { Icon, type IconName } from './icons';
import { DUR, EASE, PressableScale, useReduceMotion } from './motion';
import { C, F, R } from './theme';

/**
 * Banner de eventos en vivo: cae desde arriba cuando llega algo del canal
 * (una orden nueva para el negocio, la confirmación para el cliente) y se va
 * solo a los 5 segundos.
 *
 * Se monta una vez sobre toda la app para que el aviso llegue esté donde esté
 * el usuario, sin que ninguna pantalla tenga que enterarse.
 */

const SEGUNDOS_VISIBLE = 5000;

const ESTILO: Record<Aviso['tipo'], { fondo: string; icono: IconName }> = {
  'nueva-orden': { fondo: C.primary, icono: 'bell' },
  confirmada: { fondo: '#00A896', icono: 'check' },
  rechazada: { fondo: '#0D0D0D', icono: 'x' },
};

export function AvisoLive() {
  const { aviso, abierto, descartar } = useLive();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();

  const p = useState(() => new Animated.Value(0))[0];
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El aviso se conserva aunque esté cerrado: `abierto` maneja entrada y
  // salida, así que la salida se anima en vez de desaparecer de golpe.
  useEffect(() => {
    Animated.timing(p, {
      toValue: abierto ? 1 : 0,
      duration: reduce ? 0 : abierto ? DUR.slow : DUR.base,
      easing: abierto ? EASE.out : EASE.in,
      useNativeDriver: true,
    }).start();

    if (timer.current) clearTimeout(timer.current);
    if (abierto) timer.current = setTimeout(descartar, SEGUNDOS_VISIBLE);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [abierto, aviso, p, reduce, descartar]);

  if (!aviso) return null;

  const { fondo, icono } = ESTILO[aviso.tipo];

  return (
    <Animated.View
      pointerEvents={abierto ? 'box-none' : 'none'}
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 14,
        right: 14,
        zIndex: 100,
        opacity: p,
        transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-28, 0] }) }],
      }}>
      <PressableScale
        onPress={descartar}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: R.lg,
          backgroundColor: fondo,
          shadowColor: '#000',
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.18)',
          }}>
          <Icon name={icono} size={17} color="#fff" sw={2.4} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>{aviso.titulo}</Text>
          <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>
            {aviso.detalle}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}
