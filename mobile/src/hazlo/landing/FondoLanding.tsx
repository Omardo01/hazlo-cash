import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../icons';
import { DUR, EASE, Fade, PressableScale, useReduceMotion } from '../motion';
import { OndasBrillo } from '../OndasBrillo';
import { F } from '../theme';
import { elegirFondo, FONDOS, useFondoLanding, type FondoId, type FondoProps, type Zonas } from './fondos';
import { FondoChat } from './FondoChat';
import { FondoCiclo } from './FondoCiclo';
import { FondoMuro } from './FondoMuro';
import { FondoRed } from './FondoRed';

// El de hoy: ondas de luz entre el subtítulo y el botón, con el velo de antes.
function FondoOndas() {
  return (
    <>
      <OndasBrillo centro={0.72} />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.45)']}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

const COMPONENTES: Record<FondoId, (p: FondoProps) => React.ReactNode> = {
  red: FondoRed,
  muro: FondoMuro,
  ciclo: FondoCiclo,
  chat: FondoChat,
  ondas: FondoOndas,
};

function Capa({ id, z, quieto }: { id: FondoId; z: Zonas; quieto: boolean }) {
  const Componente = COMPONENTES[id];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Componente z={z} quieto={quieto} />
    </View>
  );
}

/**
 * Fondo del landing. Hasta tener las zonas medidas no pinta nada (el fondo es
 * negro igual). Al cambiar de fondo, el nuevo entra con fundido encima del
 * anterior y el anterior se desmonta hasta que el nuevo ya lo tapa. Cada capa
 * trae su propia opacidad y su `key`, así la de abajo sigue corriendo sin
 * reiniciarse mientras la nueva aparece.
 */
export function FondoLanding({ id, z }: { id: FondoId; z: Zonas | null }) {
  const quieto = useReduceMotion();
  const [capas, setCapas] = useState(() => [{ id, o: new Animated.Value(1) }]);

  // Cambió el fondo: la capa nueva se agrega encima, transparente.
  const ultima = capas[capas.length - 1];
  if (ultima.id !== id) {
    const o = new Animated.Value(quieto ? 1 : 0);
    setCapas(quieto ? [{ id, o }] : [ultima, { id, o }]);
  }

  useEffect(() => {
    if (capas.length < 2) return;
    const o = capas[capas.length - 1].o;
    Animated.timing(o, { toValue: 1, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      // Se queda esta capa y las que hayan llegado después.
      setCapas((cs) => {
        const i = cs.findIndex((c) => c.o === o);
        return i > 0 ? cs.slice(i) : cs;
      });
    });
  }, [capas]);

  if (!z) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {capas.map((c) => (
        <Animated.View key={c.id} style={[StyleSheet.absoluteFill, { opacity: c.o, backgroundColor: '#000' }]}>
          <Capa id={c.id} z={z} quieto={quieto} />
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Selector para comparar fondos en vivo: ‹ nombre › en la esquina del landing.
 * Es una herramienta interna (solo sale con INTERNO_VISIBLE).
 */
export function VisorFondos() {
  const fondo = useFondoLanding();
  const i = FONDOS.findIndex((f) => f.id === fondo.id);
  const mover = (paso: number) => elegirFondo(FONDOS[(i + paso + FONDOS.length) % FONDOS.length].id);

  return (
    <View style={s.visor}>
      <PressableScale onPress={() => mover(-1)} accessibilityRole="button" accessibilityLabel="Fondo anterior" hitSlop={6} style={s.flecha}>
        <View style={{ transform: [{ rotate: '180deg' }] }}>
          <Icon name="chevR" size={13} color="#fff" sw={2.4} />
        </View>
      </PressableScale>
      <Fade key={fondo.id} desde={4}>
        <Text style={s.nombre} numberOfLines={1}>
          {fondo.nombre} <Text style={s.cuenta}>{i + 1}/{FONDOS.length}</Text>
        </Text>
      </Fade>
      <PressableScale onPress={() => mover(1)} accessibilityRole="button" accessibilityLabel="Fondo siguiente" hitSlop={6} style={s.flecha}>
        <Icon name="chevR" size={13} color="#fff" sw={2.4} />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  visor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 30,
    paddingHorizontal: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  flecha: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nombre: { fontFamily: F.semi, fontSize: 11, color: '#fff', minWidth: 84, textAlign: 'center' },
  cuenta: { fontFamily: F.reg, color: 'rgba(255,255,255,0.5)' },
});
