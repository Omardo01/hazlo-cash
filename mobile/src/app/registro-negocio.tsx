import { router } from 'expo-router';

import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { SoloInterno } from '@/hazlo/interno/SoloInterno';
import { RegistroNegocioScreen } from '@/hazlo/screens/RegistroNegocio';

// /registro-negocio — la misma alta de negocio de la puerta de entrada, suelta
// para probarla. En una build de producción del teléfono redirige a / (ver
// SoloInterno). En escritorio web se ve dentro de un teléfono, como /categorias.
export default function RegistroNegocioRoute() {
  return (
    <SoloInterno>
      <MarcoMovil>
        <RegistroNegocioScreen onListo={() => router.replace('/')} />
      </MarcoMovil>
    </SoloInterno>
  );
}
