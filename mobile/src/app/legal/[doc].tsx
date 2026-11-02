import { useLocalSearchParams } from 'expo-router';

import { DocumentoLegalScreen } from '@/hazlo/legal/PantallaLegal';

// /legal/privacidad, /legal/recomendadores, /legal/negocios
export default function DocumentoLegalRoute() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  return <DocumentoLegalScreen slug={typeof doc === 'string' ? doc : ''} />;
}
