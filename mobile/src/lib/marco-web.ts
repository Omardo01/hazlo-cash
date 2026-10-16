import { Platform } from 'react-native';

/**
 * En una pantalla de escritorio la raíz (/) no estira la app a todo lo ancho:
 * enseña un teléfono con la app adentro (un iframe de `/`), para que lo que se
 * prueba en web sea siempre la vista móvil tal cual, con el ancho de un
 * teléfono y las hojas dentro de su pantalla. En un celular, dentro del
 * laboratorio o con `?marco=0`, la app se pinta directo.
 *
 * Se decide una sola vez al cargar: lib/supabase.ts lo usa para que la página
 * del marco no abra sesión (la sesión vive en el teléfono de adentro).
 */
function calcular(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  // Ya estamos dentro de un teléfono (este marco o el laboratorio).
  if (window.self !== window.top) return false;
  if (window.location.pathname !== '/') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('sesion') || params.get('marco') === '0') return false;
  // Un celular acostado puede pasar de 700 de ancho, pero no de 560 de alto.
  return window.matchMedia('(min-width: 700px) and (min-height: 560px)').matches;
}

export const ES_MARCO_ESCRITORIO = calcular();
