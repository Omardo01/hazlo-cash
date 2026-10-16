import { Platform, Text, View, useWindowDimensions } from 'react-native';

import { BG, F, FG } from '../theme';

// Pantalla lógica de un teléfono "normal", la misma que usa /lab.
const ANCHO = 390;
const ALTO = 844;
const BISEL = 10;
const ESTADO = 44;

/**
 * En el navegador de escritorio, la pantalla se dibuja dentro de un teléfono
 * para verla como en el celular. En el teléfono (o una ventana angosta) no
 * hace nada: la pantalla ocupa todo.
 */
export function MarcoMovil({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width < 640) return <>{children}</>;

  const alto = Math.min(ALTO, height - 48);
  return (
    <View style={{ flex: 1, backgroundColor: '#E9E6E1', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View
        style={{
          width: ANCHO + BISEL * 2,
          height: alto,
          padding: BISEL,
          borderRadius: 54,
          backgroundColor: '#0D0D0D',
          boxShadow: '0 30px 60px -20px rgba(13,13,13,0.35)',
        }}>
        <View style={{ flex: 1, borderRadius: 44, overflow: 'hidden', backgroundColor: BG }}>
          {/* En web no hay inset superior: barra de estado falsa, como en /lab. */}
          <View style={{ height: ESTADO, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, paddingTop: 4 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>9:41</Text>
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: FG }}>5G ▮</Text>
          </View>
          <View style={{ flex: 1 }}>{children}</View>
        </View>
        <View style={{ position: 'absolute', top: BISEL + 9, left: '50%', width: 110, height: 30, marginLeft: -55, borderRadius: 999, backgroundColor: '#0D0D0D' }} />
      </View>
    </View>
  );
}
