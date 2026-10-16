import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';

import { Icon } from '../icons';
import { DUR, EASE, PressableScale, useReduceMotion } from '../motion';
import { C, F, FG, MUTED } from '../theme';
import { CajaCampo, hueColors } from '../ui';
import { normalizar, type Grupo } from './catalogo';

/** Círculo con el gradiente y el ícono del grupo. */
export function IconoGrupo({ grupo, size = 36 }: { grupo: Grupo; size?: number }) {
  const [a, b] = hueColors(grupo.hue);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={[a, b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Ionicons name={grupo.icono} size={Math.round(size * 0.5)} color="#fff" />
    </View>
  );
}

/** Pinta en color de marca la parte del texto que coincide con la búsqueda. */
export function TextoResaltado({ texto, busqueda, style }: { texto: string; busqueda: string; style: TextStyle }) {
  const q = normalizar(busqueda.trim());
  const i = q ? normalizar(texto).indexOf(q) : -1;
  if (i < 0) return <Text style={style}>{texto}</Text>;
  return (
    <Text style={style}>
      {texto.slice(0, i)}
      <Text style={{ color: C.primary }}>{texto.slice(i, i + q.length)}</Text>
      {texto.slice(i + q.length)}
    </Text>
  );
}

/** Campo de búsqueda con botón para limpiar. */
export function Buscador({ valor, onCambio, placeholder }: { valor: string; onCambio: (t: string) => void; placeholder: string }) {
  const [foco, setFoco] = useState(false);
  return (
    <CajaCampo activo={foco} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}>
      <Icon name="search" size={18} color={foco ? C.primary : MUTED} />
      <TextInput
        value={valor}
        onChangeText={onCambio}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        returnKeyType="search"
        autoCorrect={false}
        style={{ flex: 1, fontFamily: F.reg, fontSize: 13, color: FG, padding: 0 }}
      />
      <BotonLimpiar visible={valor.length > 0} onPress={() => onCambio('')} />
    </CajaCampo>
  );
}

// Siempre montado: aparece y se va con fade + escala en vez de brincar.
function BotonLimpiar({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  const p = useState(() => new Animated.Value(visible ? 1 : 0))[0];
  const reduce = useReduceMotion();

  useEffect(() => {
    const destino = visible ? 1 : 0;
    if (reduce) {
      p.setValue(destino);
      return;
    }
    Animated.timing(p, { toValue: destino, duration: DUR.fast, easing: visible ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [p, visible, reduce]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{ opacity: p, transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
      <PressableScale onPress={onPress} hitSlop={10} accessibilityLabel="Borrar búsqueda" style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,13,13,0.08)' }}>
        <Icon name="x" size={12} color={FG} />
      </PressableScale>
    </Animated.View>
  );
}
