import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

/**
 * Web en pantallas táctiles anchas (iPhone Duo abierto, tablets): la app no se
 * estira a lo ancho; se queda en una columna de teléfono al centro. Lo resuelve
 * CSS sobre <body>, así que las hojas (Modal hace portal a <body>) quedan
 * dentro de la misma columna.
 *
 * Solo con puntero táctil: en escritorio / enseña el teléfono de
 * Escritorio.web.tsx y las herramientas (/lab, /sugerencias…) usan todo el ancho.
 */

export const ANCHO_COLUMNA = 520;
// Más angosto que esto, la pantalla entera es la app. El Duo abierto (669 en
// vertical, 951 acostado) ya va en columna; su pantalla de afuera (382 / 594) no.
const DESDE = 600;
const CONSULTA = `(pointer: coarse) and (min-width: ${DESDE}px)`;

export const CSS_COLUMNA = `
@media ${CONSULTA} {
  html { background-color: #E4E0DA; }
  body {
    width: 100%;
    max-width: ${ANCHO_COLUMNA}px;
    margin: 0 auto;
    /* Con transform, <body> contiene a lo fijo: las hojas no se salen de la columna. */
    transform: translateZ(0);
    box-shadow: 0 0 0 1px rgba(13,13,13,0.05), 0 0 48px rgba(13,13,13,0.08);
  }
}
`;

function enColumna() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(CONSULTA).matches;
}

/** Como useWindowDimensions, pero con el ancho que de verdad tiene la app. */
export function useVentanaApp() {
  const ventana = useWindowDimensions();
  const [columna, setColumna] = useState(enColumna);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(CONSULTA);
    const alCambiar = () => setColumna(mq.matches);
    alCambiar();
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);
  return { width: columna ? Math.min(ventana.width, ANCHO_COLUMNA) : ventana.width, height: ventana.height };
}
