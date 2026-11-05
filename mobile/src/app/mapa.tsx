import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { InternoOAdmin } from '@/hazlo/interno/SoloInterno';
import { Mapa } from '@/hazlo/mapa/Mapa';

// /mapa — Villahermosa por sectores y colonias. Las calles y las colonias son
// reales; los sectores y las cifras son de ejemplo, por eso solo entran el equipo
// y los admin (botón en su pestaña Cuenta).
export default function MapaRoute() {
  return (
    <InternoOAdmin>
      <MarcoMovil>
        <Mapa />
      </MarcoMovil>
    </InternoOAdmin>
  );
}
