import type { MotivoSinUbicacion, ResultadoUbicacion } from './ubicacion';

export type { MotivoSinUbicacion, ResultadoUbicacion } from './ubicacion';

/** En el navegador: el permiso lo pide el propio navegador al leer la posición. */
export function leerMiUbicacion(): Promise<ResultadoUbicacion> {
  const g = typeof navigator !== 'undefined' && 'geolocation' in navigator ? navigator.geolocation : null;
  if (!g) return Promise.resolve({ ok: false, motivo: 'fallo' });
  return new Promise((resolve) => {
    g.getCurrentPosition(
      (pos) => resolve({ ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude, precision: pos.coords.accuracy ?? null }),
      // 1 = permiso negado; el navegador ya no vuelve a preguntar por su cuenta.
      (e) => resolve({ ok: false, motivo: e.code === 1 ? 'bloqueado' : e.code === 2 ? 'apagado' : 'fallo' }),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 },
    );
  });
}

// En web no hay Ajustes de la app que abrir: el permiso se cambia en el candado de la barra.
export const abrirAjustes: (() => void) | null = null;

export function mensajeSinUbicacion(motivo: MotivoSinUbicacion): string {
  if (motivo === 'bloqueado' || motivo === 'denegado') return 'Tu navegador no deja ver tu ubicación. Permítela en el candado junto a la dirección.';
  if (motivo === 'apagado') return 'No encontramos tu ubicación ahora. Revisa que esté encendida e inténtalo otra vez.';
  return 'No pudimos leer tu ubicación. Inténtalo otra vez.';
}

export const hayUbicacion = typeof navigator !== 'undefined' && 'geolocation' in navigator;
