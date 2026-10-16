import { Stack } from 'expo-router';

import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { BG } from '@/hazlo/theme';

// /categorias — catálogo de giros. En escritorio web se ve dentro de un
// teléfono; el Stack interno anima la entrada a cada grupo en el celular.
export default function CategoriasLayout() {
  return (
    <MarcoMovil>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG } }} />
    </MarcoMovil>
  );
}
