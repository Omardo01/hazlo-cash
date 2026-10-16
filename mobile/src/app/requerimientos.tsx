import { SoloInterno } from '@/hazlo/interno/SoloInterno';
import { Requerimientos } from '@/hazlo/requerimientos/Requerimientos';

// /requerimientos — qué falta para publicar en Google Play y App Store.
export default function RequerimientosRoute() {
  return (
    <SoloInterno>
      <Requerimientos />
    </SoloInterno>
  );
}
