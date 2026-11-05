import { C } from '../theme';

/** Colores del mapa: papel cálido para que el naranja de la marca sea lo que resalta. */
export const TIERRA = '#EFEBE4';
export const AGUA = '#B9DAE2';
export const AGUA_TEXTO = '#4F8896';
export const VERDE = '#D6E4C4';
export const CALLE = '#FFFFFF';
export const CALLE_BORDE = '#DDD6CA';
export const TRONCAL = '#FFD9AE';
export const TRONCAL_BORDE = '#E8C093';

export type Nivel = 0 | 1 | 2 | 3;

/** Presencia de Hazlo Cash en una zona, de nada a fuerte. */
export const NIVELES: { etiqueta: string; relleno: string; muestra: string }[] = [
  { etiqueta: 'Sin presencia', relleno: 'rgba(13,13,13,0.04)', muestra: 'rgba(13,13,13,0.08)' },
  { etiqueta: 'Arrancando', relleno: `${C.primary}1F`, muestra: `${C.primary}40` },
  { etiqueta: 'Creciendo', relleno: `${C.primary}40`, muestra: `${C.primary}80` },
  { etiqueta: 'Fuerte', relleno: `${C.primary}6B`, muestra: C.primary },
];
