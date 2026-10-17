import type { RefObject } from 'react';
import { Platform, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * Compartir la foto del QR desde el navegador del teléfono.
 *
 * En web, expo-sharing no adjunta archivos: manda lo que le pases como `url`,
 * y una foto en data-uri llega a WhatsApp como texto basura. Lo que sí adjunta
 * es `navigator.share({ files })` (Chrome en Android, Safari y Chrome en
 * iPhone), así que la tarjeta se convierte en un File de PNG.
 *
 * El navegador solo deja abrir el menú de compartir justo después de un toque
 * (Safari da ~1 s), y capturar la tarjeta tarda. Por eso la foto se prepara
 * antes, en cuanto el QR está listo, y al tocar solo se comparte.
 */
export async function fotoDeTarjeta(ref: RefObject<View | null>, nombre: string): Promise<File | null> {
  if (Platform.OS !== 'web' || !ref.current) return null;
  try {
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'data-uri' });
    const blob = await (await fetch(uri)).blob();
    return new File([blob], nombre, { type: 'image/png' });
  } catch {
    return null;
  }
}

/** ¿Este navegador puede mandar la foto con el menú de compartir del teléfono? */
export function puedeCompartirFoto(foto: File | null): foto is File {
  if (!foto || typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [foto] });
  } catch {
    return false;
  }
}

/** El usuario cerró el menú de compartir sin elegir nada: no es un error. */
export function esCancelacion(e: unknown): boolean {
  return e instanceof Error && e.name === 'AbortError';
}
