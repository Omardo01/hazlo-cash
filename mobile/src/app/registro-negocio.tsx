import { router, useLocalSearchParams } from 'expo-router';

import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { RegistroNegocioScreen } from '@/hazlo/screens/RegistroNegocio';

// /registro-negocio — alta pública de un negocio. Es la página del link de
// invitación que el admin manda por WhatsApp (?s=<id de la sugerencia>), que
// llega con el formulario lleno. En escritorio web se ve dentro de un
// teléfono, como /categorias.
export default function RegistroNegocioRoute() {
  const { s } = useLocalSearchParams<{ s?: string }>();
  return (
    <MarcoMovil>
      <RegistroNegocioScreen sugerencia={typeof s === 'string' && s ? s : undefined} onListo={() => router.replace('/')} />
    </MarcoMovil>
  );
}
