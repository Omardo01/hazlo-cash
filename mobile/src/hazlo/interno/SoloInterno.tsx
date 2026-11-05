import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

import { usePerfil } from '@/lib/datos/consultas';

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

/**
 * Igual que SoloInterno, pero en el teléfono también deja pasar a los admin:
 * /mapa se abre desde su pestaña Cuenta y tiene que funcionar en un APK.
 */
export function InternoOAdmin({ children }: { children: React.ReactNode }) {
  if (INTERNO_VISIBLE) return <>{children}</>;
  return <SoloAdmin>{children}</SoloAdmin>;
}

function SoloAdmin({ children }: { children: React.ReactNode }) {
  const { datos: perfil, cargando } = usePerfil();
  if (cargando) return null;
  if (!perfil?.roles.includes('admin')) return <Redirect href="/" />;
  return <>{children}</>;
}
