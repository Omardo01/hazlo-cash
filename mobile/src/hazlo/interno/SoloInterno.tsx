import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

/**
 * Las páginas internas (/lab, /sugerencias, /ia, /requerimientos) son
 * herramientas del equipo: se ven en web y en desarrollo, pero NO en una
 * build de producción del teléfono. Si un revisor de la tienda llegara a una
 * por deep link (hazlocash://ia), vería maquetas y datos de ejemplo.
 */
export const INTERNO_VISIBLE = Platform.OS === 'web' || __DEV__;

export function SoloInterno({ children }: { children: React.ReactNode }) {
  if (!INTERNO_VISIBLE) return <Redirect href="/" />;
  return <>{children}</>;
}
