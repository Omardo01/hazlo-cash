import { useEffect, useState } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';

import { useReduceMotion } from './motion';
import { R } from './theme';

/**
 * Bloques de carga.
 *
 * Solo se ven la PRIMERA vez que se pide un dato: en cuanto está en caché, al
 * volver a la pantalla se pinta el contenido real y la revalidación ocurre
 * callada (ver `useConsulta`). Por eso el skeleton debe tener la forma y la
 * altura de lo que va a reemplazar — si no coincide, el contenido brinca al
 * llegar y se pierde justo lo que veníamos a arreglar.
 */

const BASE = 'rgba(13,13,13,0.06)';
const BRILLO = 'rgba(13,13,13,0.11)';

/** Respiración compartida: un solo ciclo para que todos los bloques latan juntos. */
function usePulso(): Animated.AnimatedInterpolation<string | number> | number {
  const v = useState(() => new Animated.Value(0))[0];
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) return;
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 620, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 620, useNativeDriver: true }),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [v, reduce]);

  return reduce ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
}

export function Bloque({
  w,
  h = 14,
  radio = 8,
  style,
}: {
  w?: number | `${number}%`;
  h?: number;
  radio?: number;
  style?: ViewStyle;
}) {
  const opacidad = usePulso();
  return (
    <Animated.View
      style={[{ width: w ?? '100%', height: h, borderRadius: radio, backgroundColor: BASE, opacity: opacidad }, style]}
    />
  );
}

/** Fila de lista: círculo + dos líneas + monto a la derecha. */
export function FilaSkeleton({ conAvatar = true }: { conAvatar?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      {conAvatar && <Bloque w={40} h={40} radio={999} />}
      <View style={{ flex: 1, gap: 7 }}>
        <Bloque w="62%" h={13} />
        <Bloque w="38%" h={11} />
      </View>
      <Bloque w={54} h={16} />
    </View>
  );
}

/** Varias filas seguidas, con separador tenue como la lista real. */
export function ListaSkeleton({ filas = 4, conAvatar = true }: { filas?: number; conAvatar?: boolean }) {
  return (
    <View>
      {Array.from({ length: filas }).map((_, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: 'rgba(13,13,13,0.05)' } : undefined}>
          <FilaSkeleton conAvatar={conAvatar} />
        </View>
      ))}
    </View>
  );
}

/** Tarjeta grande (hero de saldo, orden en curso). */
export function TarjetaSkeleton({ h = 150, style }: { h?: number; style?: ViewStyle }) {
  const opacidad = usePulso();
  return (
    <Animated.View
      style={[{ height: h, borderRadius: R.lg, backgroundColor: BASE, opacity: opacidad, overflow: 'hidden' }, style]}>
      <View style={{ padding: 20, gap: 12 }}>
        <View style={{ width: '40%', height: 12, borderRadius: 6, backgroundColor: BRILLO }} />
        <View style={{ width: '65%', height: 26, borderRadius: 8, backgroundColor: BRILLO }} />
        <View style={{ width: '30%', height: 12, borderRadius: 6, backgroundColor: BRILLO }} />
      </View>
    </Animated.View>
  );
}

/** Rejilla de tiles (catálogo de negocios). */
export function TilesSkeleton({ filas = 2 }: { filas?: number }) {
  return (
    <View style={{ gap: 14 }}>
      {Array.from({ length: filas }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
          <Bloque style={{ flex: 1 }} h={140} radio={20} />
          <Bloque style={{ flex: 1 }} h={140} radio={20} />
        </View>
      ))}
    </View>
  );
}
