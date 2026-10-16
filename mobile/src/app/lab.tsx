import { SoloInterno } from '@/hazlo/interno/SoloInterno';
import { Laboratorio } from '@/hazlo/lab/Laboratorio';

// /lab — banco de pruebas web: varios teléfonos lado a lado, cada uno con su
// propia sesión. Ver hazlo/lab/Laboratorio.web.tsx.
export default function LabRoute() {
  return (
    <SoloInterno>
      <Laboratorio />
    </SoloInterno>
  );
}
