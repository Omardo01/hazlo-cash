import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { HazloMark } from './HazloMark';
import { C, F, FG, MUTED } from './theme';

export function Splash({ onDone, duration = 2400 }: { onDone: () => void; duration?: number }) {
  const aura = useRef(new Animated.Value(0)).current; // loop 0→1
  const enter = useRef(new Animated.Value(0)).current; // entrada del mark
  const word = useRef(new Animated.Value(0)).current; // wordmark slide
  const tag = useRef(new Animated.Value(0)).current; // tagline slide
  const fade = useRef(new Animated.Value(1)).current; // salida

  useEffect(() => {
    Animated.loop(
      Animated.timing(aura, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    ).start();
    Animated.timing(enter, { toValue: 1, duration: 800, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: true }).start();
    Animated.timing(word, { toValue: 1, duration: 700, delay: 400, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: true }).start();
    Animated.timing(tag, { toValue: 1, duration: 700, delay: 700, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: true }).start();

    const t1 = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 320, useNativeDriver: true }).start();
    }, duration - 320);
    const t2 = setTimeout(onDone, duration);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [aura, enter, word, tag, fade, duration, onDone]);

  const auraScale = aura.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1, 1.3] });
  const auraOpacity = aura.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.85, 0] });
  const markScale = enter.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.4, 1.06, 1] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: fade }]}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: 999,
            backgroundColor: `${C.primary}33`,
            transform: [{ scale: auraScale }],
            opacity: auraOpacity,
          }}
        />
        <Animated.View style={{ opacity: enter, transform: [{ scale: markScale }] }}>
          <HazloMark size={100} />
        </Animated.View>
      </View>

      <Animated.Text
        style={{
          marginTop: 36,
          fontFamily: F.bold,
          fontSize: 28,
          color: FG,
          letterSpacing: -0.7,
          opacity: word,
          transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        }}>
        Hazlo <Text style={{ color: C.primary }}>Cash</Text>
      </Animated.Text>
      <Animated.Text
        style={{
          marginTop: 8,
          fontFamily: F.base,
          fontSize: 11,
          color: MUTED,
          letterSpacing: 3,
          textTransform: 'uppercase',
          opacity: tag,
          transform: [{ translateY: tag.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        }}>
        Recomienda · Conecta · Gana
      </Animated.Text>

      <View style={{ position: 'absolute', bottom: 70, flexDirection: 'row', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 160} />
        ))}
      </View>
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.4, duration: 480, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  return <Animated.View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: C.primary, opacity: v, transform: [{ scale: v }] }} />;
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
});
