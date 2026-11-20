import { MarcoMovil } from '@/hazlo/categorias/MarcoMovil';
import { SoloAdmin } from '@/hazlo/interno/SoloInterno';
import { Mapa } from '@/hazlo/mapa/Mapa';

// /mapa — Villahermosa con los negocios activos donde de verdad están, y los
// sectores si el admin los armó. Son datos reales de operación: solo entran los
// admin (botón en su pestaña Cuenta), también en web.
export default function MapaRoute() {
  return (
    <SoloAdmin>
      <MarcoMovil>
        <Mapa />
      </MarcoMovil>
    </SoloAdmin>
  );
}
