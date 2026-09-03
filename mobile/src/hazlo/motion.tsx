import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, type PressableProps, type ViewStyle } from 'react-native';

/**
 * Tokens de movimiento de Hazlo Cash.
 *
 * Toda animación de la app sale de aquí para que el movimiento se sienta de la
 * misma familia en las cuatro vistas. Reglas de la casa:
 *  - Siempre `useNativeDriver: true` (opacity + transform). Si necesitas animar
 *    layout, replantea el efecto: en Android eso salta.
 *  - Entrar es más lento que salir: aparecer se disfruta, desaparecer estorba.
 *  - Nada por encima de SLOW: la app debe sentirse rápida, no cinematográfica.
 */
export const DUR = {
  /** Feedback inmediato: presión de botón, cambio de estado de un chip. */
  fast: 130,
  /** Transición estándar: fade de contenido, aparición de tarjetas. */
  base: 190,
  /** Entradas con recorrido: hojas, hero, celebraciones. */
  slow: 260,
} as const;

export const EASE = {
  /** Entradas: arranca rápido y asienta suave. */
  out: Easing.out(Easing.cubic),
  /** Salidas: acelera al irse. */
  in: Easing.in(Easing.cubic),
  /** Cambios de estado en sitio. */
  inOut: Easing.inOut(Easing.quad),
} as const;

/** Escala al presionar. El estándar de la app para todo lo tocable. */
export const PRESS_SCALE = 0.97;

/**
 * ¿El sistema pidió menos movimiento? Las animaciones deben degradarse a un
 * corte seco, nunca desaparecer el contenido.
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => vivo && setReduce(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      vivo = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/**
 * Aparición al montar: fade + un desplazamiento corto hacia arriba.
 * Con una `key` distinta por vista, cambiar de contenido se ve como transición
 * y no como salto. `delay` sirve para escalonar listas (ver STAGGER).
 */
export function Fade({
  children,
  style,
  delay = 0,
  desde = 0,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  /** Píxeles desde abajo. 0 = solo fade. */
  desde?: number;
}) {
  const p = useState(() => new Animated.Value(0))[0];
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) {
      p.setValue(1);
      return;
    }
    Animated.timing(p, { toValue: 1, duration: DUR.base, delay, easing: EASE.out, useNativeDriver: true }).start();
  }, [p, delay, reduce]);

  const transform = desde ? [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [desde, 0] }) }] : undefined;
  return <Animated.View style={[{ opacity: p, transform }, style]}>{children}</Animated.View>;
}

/** Retraso entre elementos de una lista que entra escalonada. */
export const STAGGER = 45;

/**
 * Pressable con hundido al tocar. Úsalo en vez de Pressable para cualquier
 * cosa que el usuario toque: es la diferencia entre una app que responde y
 * una que parece una foto. Anima el propio Pressable (un solo nodo), así el
 * `style` se comporta igual que en un Pressable normal — incluido `flex`.
 */
const PressableAnimado = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  ...props
}: Omit<PressableProps, 'style'> & { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const escala = useState(() => new Animated.Value(1))[0];
  const reduce = useReduceMotion();

  const animar = (a: number) => {
    if (reduce) return;
    Animated.timing(escala, { toValue: a, duration: DUR.fast, easing: EASE.inOut, useNativeDriver: true }).start();
  };

  return (
    <PressableAnimado
      {...props}
      onPressIn={(e) => {
        animar(PRESS_SCALE);
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animar(1);
        props.onPressOut?.(e);
      }}
      style={[style as ViewStyle, { transform: [{ scale: escala }] }]}>
      {children}
    </PressableAnimado>
  );
}
