import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { SoloInterno } from '@/hazlo/interno/SoloInterno';
import { RegistroNegocioScreen } from '@/hazlo/screens/RegistroNegocio';

// /registro-negocio — alta de negocio con grupo y giros del catálogo. Aún no
// la abre ningún botón ni guarda nada; mientras sea solo vista, en una build
// de producción del teléfono redirige a / (ver SoloInterno). En escritorio web
// se ve dentro de un teléfono, como /categorias.
export default function RegistroNegocioRoute() {
  return (
    <SoloInterno>
      <MarcoMovil>
        <RegistroNegocioScreen />
      </MarcoMovil>
    </SoloInterno>
  );
}
