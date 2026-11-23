import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Text, TextInput, View } from 'react-native';

import { Icon } from '../icons';
import { Fade, PressableScale } from '../motion';
import { C, F, FG, MUTED } from '../theme';
import type { Buscador } from './useBuscador';

export const ALTO_CAMPO = 48;

/** Lo ya elegido, dentro de la caja: naranja lo que se busca, negro la colonia. */
function Ficha({ texto, oscura, ancho, alQuitar }: { texto: string; oscura?: boolean; /** Tope, para que quepan las dos. */ ancho?: number; alQuitar: () => void }) {
  return (
    <Fade desde={4} style={ancho ? { flexShrink: 0, maxWidth: ancho } : { flexShrink: 1 }}>
      <PressableScale
        onPress={alQuitar}
        accessibilityRole="button"
        accessibilityLabel={`Quitar ${texto}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 30, paddingLeft: 11, paddingRight: 9, borderRadius: 999, backgroundColor: oscura ? FG : `${C.primary}24` }}>
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.semi, fontSize: 12.5, color: oscura ? '#fff' : C.accent }}>{texto}</Text>
        <Icon name="x" size={10} color={oscura ? 'rgba(255,255,255,0.7)' : C.accent} sw={2.6} />
      </PressableScale>
    </Fade>
  );
}

/**
 * La caja del landing. Entiende giro, nombre y colonia juntos; lo ya elegido
 * queda como fichas y se puede seguir escribiendo para afinar.
 */
export function CampoBusqueda({
  buscador: b,
  abierto,
  progreso,
  claro,
  alAbrir,
  alCerrar,
}: {
  buscador: Buscador;
  abierto: boolean;
  /** 0 a 1: la misma animación con la que sube. */
  progreso: Animated.Value;
  /** Sobre fondo claro la caja blanca necesita orilla y sombra para verse. */
  claro: boolean;
  alAbrir: () => void;
  alCerrar: () => void;
}) {
  const [foco, setFoco] = useState(false);
  const campo = useRef<TextInput>(null);

  useEffect(() => {
    if (!abierto) campo.current?.blur();
  }, [abierto]);

  const hayAlgo = b.texto.length > 0 || !!b.que || !!b.colonia;
  const confirmar = () => {
    if (b.fase === 'colonia') {
      if (b.texto.trim() && b.colonias[0]) b.elegirColonia(b.colonias[0].zona);
    } else if (b.fase === 'escribe') b.fijar(b.entendido.que, b.entendido.colonia, b.entendido.etiqueta);
    Keyboard.dismiss();
  };

  return (
    <View
      style={{
        height: ALTO_CAMPO,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 16,
        paddingRight: 8,
        borderRadius: 999,
        backgroundColor: '#fff',
        // Mismo grosor siempre: al enfocar no brinca nada.
        borderWidth: 1.5,
        borderColor: foco ? C.primary : claro ? 'rgba(13,13,13,0.08)' : 'transparent',
        boxShadow: claro ? '0 8px 24px rgba(13,13,13,0.10)' : undefined,
      }}>
      <Icon name="search" size={17} color={foco ? C.primary : FG} sw={2.3} />
      {abierto && b.fase !== 'colonia' && (b.que || b.colonia) && (
        <View style={{ flexDirection: 'row', gap: 6, maxWidth: '72%' }}>
          {b.que && <Ficha key={`q-${b.que.etiqueta}`} texto={b.que.etiqueta} ancho={b.colonia ? 116 : 200} alQuitar={b.quitarQue} />}
          {b.colonia && <Ficha key={`c-${b.colonia.id}`} texto={b.colonia.nombre} oscura alQuitar={b.quitarColonia} />}
        </View>
      )}
      <TextInput
        ref={campo}
        value={b.texto}
        onChangeText={b.escribir}
        onFocus={() => {
          setFoco(true);
          alAbrir();
        }}
        onBlur={() => setFoco(false)}
        onKeyPress={(e) => {
          if (e.nativeEvent.key !== 'Backspace' || b.texto) return;
          if (b.colonia) b.quitarColonia();
          else if (b.que) b.quitarQue();
        }}
        placeholder={abierto && b.fase === 'colonia' ? '¿En qué colonia estás?' : abierto && (b.que || b.colonia) ? '' : 'Busca giro, negocio o colonia'}
        placeholderTextColor={MUTED}
        accessibilityLabel="Busca un giro, un negocio o una colonia"
        returnKeyType="search"
        onSubmitEditing={confirmar}
        autoCorrect={false}
        style={{ flex: 1, minWidth: 0, height: ALTO_CAMPO - 3, fontFamily: F.base, fontSize: 13.5, color: FG, padding: 0, paddingRight: abierto ? 34 : 0 }}
      />
      {/* Encima del campo: cerrada, su lugar lo ocupa el texto de ayuda. */}
      <Animated.View style={{ position: 'absolute', right: 8, opacity: progreso, pointerEvents: abierto ? 'auto' : 'none' }}>
        <PressableScale
          onPress={() => {
            if (!hayAlgo && b.fase !== 'colonia') {
              alCerrar();
              return;
            }
            b.limpiar();
            campo.current?.focus();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={hayAlgo ? 'Borrar búsqueda' : 'Cerrar la búsqueda'}
          style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,13,13,0.07)' }}>
          <Icon name="x" size={13} color={FG} sw={2.2} />
        </PressableScale>
      </Animated.View>
    </View>
  );
}
