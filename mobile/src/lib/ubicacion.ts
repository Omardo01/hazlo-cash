import * as Location from 'expo-location';
import { Linking } from 'react-native';

/**
 * Dónde está el teléfono, pidiendo permiso la primera vez. Solo mientras la
 * app está abierta: nunca en segundo plano. La versión web vive en
 * `ubicacion.web.ts` y usa la del navegador.
 */

export type MotivoSinUbicacion = 'denegado' | 'bloqueado' | 'apagado' | 'fallo';

export type ResultadoUbicacion = { ok: true; lat: number; lng: number; precision: number | null } | { ok: false; motivo: MotivoSinUbicacion };

export async function leerMiUbicacion(): Promise<ResultadoUbicacion> {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') return { ok: false, motivo: permiso.canAskAgain ? 'denegado' : 'bloqueado' };
    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, motivo: 'apagado' };
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude, precision: pos.coords.accuracy ?? null };
  } catch {
    return { ok: false, motivo: 'fallo' };
  }
}

/** Con el permiso bloqueado, la app ya no puede volver a preguntar: solo Ajustes. */
export const abrirAjustes: (() => void) | null = () => {
  Linking.openSettings().catch(() => {});
};

export function mensajeSinUbicacion(motivo: MotivoSinUbicacion): string {
  switch (motivo) {
    case 'denegado':
      return 'Sin permiso no podemos ubicarte. Toca otra vez para darlo.';
    case 'bloqueado':
      return 'La ubicación está bloqueada para Hazlo Cash. Actívala en Ajustes.';
    case 'apagado':
      return 'La ubicación del teléfono está apagada. Enciéndela e inténtalo otra vez.';
    default:
      return 'No pudimos leer tu ubicación. Inténtalo otra vez.';
  }
}

export const hayUbicacion = true;
