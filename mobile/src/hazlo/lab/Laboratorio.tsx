import { Text, View } from 'react-native';

import { BG, F, MUTED } from '../theme';

// En el teléfono el laboratorio no tiene sentido: la versión real vive en
// Laboratorio.web.tsx. Esta solo evita una ruta rota si alguien llega a /lab.
export function Laboratorio() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG, padding: 24 }}>
      <Text style={{ fontFamily: F.reg, fontSize: 14, color: MUTED, textAlign: 'center' }}>
        El laboratorio solo está disponible en la versión web.
      </Text>
    </View>
  );
}
