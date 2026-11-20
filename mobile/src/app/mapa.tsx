import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { AdminOEmbajador } from '@/hazlo/interno/SoloInterno';
import { Mapa } from '@/hazlo/mapa/Mapa';

// /mapa — Villahermosa con los negocios activos donde de verdad están, y los
// sectores si el admin los armó. Entran el admin (Cuenta: acomoda el mapa y ve
// cifras) y el recomendador (Perfil: elige un negocio y genera su QR).
export default function MapaRoute() {
  return (
    <AdminOEmbajador>
      <MarcoMovil>
        <Mapa />
      </MarcoMovil>
    </AdminOEmbajador>
  );
}
