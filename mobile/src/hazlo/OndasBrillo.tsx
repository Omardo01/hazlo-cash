import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { bucle, useReduceMotion } from './motion';

/**
 * Ondas de luz del hero (el "glowy waves" del landing web), hechas para correr
 * igual en el teléfono: cada onda es un trazo periódico más ancho que la
 * pantalla que se desliza en bucle con transform (useNativeDriver), así no se
 * repinta nada en cada cuadro. El brillo se finge con tres trazos encimados
 * (ancho y tenue → fino y vivo) porque el SVG nativo no tiene shadowBlur.
 */

interface Onda {
  color: string;
  opacidad: number;
  amplitud: number;
  // Largo de una vuelta completa de la onda, en puntos.
  periodo: number;
  fase: number;
  // Milisegundos en recorrer un periodo; negativo = hacia la derecha.
  vuelta: number;
  // Respiración vertical lenta, para que no se vea como una banda que corre.
  respira: number;
}

const ONDAS: Onda[] = [
  { color: '#F5A623', opacidad: 0.6, amplitud: 34, periodo: 560, fase: 0, vuelta: 14000, respira: 10 },
  { color: '#E55000', opacidad: 0.45, amplitud: 42, periodo: 720, fase: Math.PI / 2, vuelta: -19000, respira: 14 },
  { color: '#FFC044', opacidad: 0.38, amplitud: 28, periodo: 460, fase: Math.PI, vuelta: 11000, respira: 8 },
  { color: '#FF8C00', opacidad: 0.3, amplitud: 38, periodo: 840, fase: Math.PI * 1.5, vuelta: -23000, respira: 12 },
];

const PASO = 6;

// Senoide con un armónico al doble de frecuencia: sigue siendo periódica en
// `periodo`, así el bucle empata sin brinco.
function trazo(o: Onda, ancho: number, centro: number): string {
  const k = (Math.PI * 2) / o.periodo;
  let d = '';
  for (let x = 0; x <= ancho; x += PASO) {
    const y = centro + Math.sin(k * x + o.fase) * o.amplitud + Math.sin(2 * k * x + o.fase * 0.5) * o.amplitud * 0.35;
    d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
  }
  return d;
}

const Capa = memo(function Capa({ o, ancho, alto, centro, quieto }: { o: Onda; ancho: number; alto: number; centro: number; quieto: boolean }) {
  const corre = useState(() => new Animated.Value(0))[0];
  const sube = useState(() => new Animated.Value(0))[0];
  const total = ancho + o.periodo;

  useEffect(() => {
    if (quieto) return;
    const a = bucle(
      Animated.timing(corre, { toValue: 1, duration: Math.abs(o.vuelta), easing: Easing.linear, useNativeDriver: true }),
    );
    const b = bucle(
      Animated.sequence([
        Animated.timing(sube, { toValue: 1, duration: Math.abs(o.vuelta) / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sube, { toValue: 0, duration: Math.abs(o.vuelta) / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [corre, sube, o.vuelta, quieto]);

  // Hacia la izquierda va de 0 a -periodo; hacia la derecha, al revés.
  const translateX = corre.interpolate({
    inputRange: [0, 1],
    outputRange: o.vuelta > 0 ? [0, -o.periodo] : [-o.periodo, 0],
  });
  const translateY = sube.interpolate({ inputRange: [0, 1], outputRange: [-o.respira, o.respira] });
  const d = trazo(o, total, alto * centro);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { width: total, transform: [{ translateX }, { translateY }] }]}>
      <Svg width={total} height={alto}>
        <Path d={d} stroke={o.color} strokeWidth={16} strokeOpacity={o.opacidad * 0.12} fill="none" strokeLinecap="round" />
        <Path d={d} stroke={o.color} strokeWidth={7} strokeOpacity={o.opacidad * 0.28} fill="none" strokeLinecap="round" />
        <Path d={d} stroke={o.color} strokeWidth={2.2} strokeOpacity={o.opacidad} fill="none" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
});

// `centro`: a qué altura corren las ondas (0 arriba, 1 abajo).
export function OndasBrillo({ centro = 0.5 }: { centro?: number }) {
  const [medida, setMedida] = useState<{ w: number; h: number } | null>(null);
  const quieto = useReduceMotion();

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setMedida((m) => (m && m.w === Math.round(width) && m.h === Math.round(height) ? m : { w: Math.round(width), h: Math.round(height) }));
      }}>
      {medida && ONDAS.map((o) => <Capa key={o.color} o={o} ancho={medida.w} alto={medida.h} centro={centro} quieto={quieto} />)}
    </View>
  );
}
