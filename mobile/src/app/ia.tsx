import { SoloInterno } from '@/hazlo/interno/SoloInterno';
import { IdeasIA } from '@/hazlo/ia/IdeasIA';

// /ia — propuestas de IA y ML para el negocio. Ver hazlo/ia/IdeasIA.tsx.
export default function IARoute() {
  return (
    <SoloInterno>
      <IdeasIA />
    </SoloInterno>
  );
}
