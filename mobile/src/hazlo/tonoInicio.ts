import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/**
 * Color del bloque oscuro del Inicio. Mientras Omar decide cuál le gusta, el
 * visor de colores (VisorTonos) lo cambia en vivo; la elección se guarda en el
 * dispositivo. Cuando elija uno, se fija como el primero de la lista y el visor
 * se puede quitar.
 */
export interface Tono {
  id: string;
  nombre: string;
  /** Degradado del bloque (de arriba-izquierda a abajo-derecha). */
  colores: [string, string];
  /** Color del ícono sobre el botón blanco principal. */
  acento: string;
}

export const TONOS: Tono[] = [
  { id: 'negro', nombre: 'Negro', colores: ['#0D0D0D', '#0D0D0D'], acento: '#0D0D0D' },
  // El del panel admin (brand-dark → brand-purple).
  { id: 'morado', nombre: 'Morado admin', colores: ['#1A1840', '#2D2B8F'], acento: '#2D2B8F' },
  { id: 'indigo', nombre: 'Índigo', colores: ['#2D2B8F', '#4E49D6'], acento: '#2D2B8F' },
  { id: 'noche', nombre: 'Azul noche', colores: ['#0B1026', '#1D2D63'], acento: '#1D2D63' },
  { id: 'naranja', nombre: 'Naranja', colores: ['#EB4E00', '#9C3200'], acento: '#C64200' },
  { id: 'teal', nombre: 'Verde teal', colores: ['#004D45', '#00A896'], acento: '#007F71' },
  { id: 'vino', nombre: 'Vino', colores: ['#33081B', '#7A1638'], acento: '#7A1638' },
  { id: 'grafito', nombre: 'Grafito', colores: ['#1C1C22', '#3D3D48'], acento: '#2A2A33' },
];

const LLAVE = 'hazlo-tono-inicio';
let actual = TONOS[0].id;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

// Lo guardado llega un instante después de abrir; mientras, se ve el primero.
AsyncStorage.getItem(LLAVE)
  .then((v) => {
    if (v && v !== actual && TONOS.some((t) => t.id === v)) {
      actual = v;
      avisar();
    }
  })
  .catch(() => {});

export function elegirTono(id: string) {
  if (id === actual) return;
  actual = id;
  avisar();
  AsyncStorage.setItem(LLAVE, id).catch(() => {});
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

export function useTonoInicio(): Tono {
  const id = useSyncExternalStore(suscribir, () => actual, () => actual);
  return TONOS.find((t) => t.id === id) ?? TONOS[0];
}
