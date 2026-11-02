import { Stack } from 'expo-router';

import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { BG } from '@/hazlo/theme';

// /legal — aviso de privacidad y contratos. Públicas, sin sesión. En escritorio
// web se ven dentro de un teléfono, como /categorias.
export default function LegalLayout() {
  return (
    <MarcoMovil>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG } }} />
    </MarcoMovil>
  );
}
