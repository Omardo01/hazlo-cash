import { useLocalSearchParams } from 'expo-router';

import { RecomendacionPublica } from '@/hazlo/screens/RecomendacionPublica';

// Link del mensaje de WhatsApp: hazlocash.com/r/HAZLO-XXXX (sin sesión).
export default function RutaRecomendacion() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  return <RecomendacionPublica codigo={typeof codigo === 'string' ? codigo : ''} />;
}
