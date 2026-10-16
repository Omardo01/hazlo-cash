import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/**
 * Fondo animado del landing. Mientras Omar decide, el visor del landing los
 * cambia en vivo y la elección se guarda en el dispositivo. Cuando elija uno,
 * se deja solo ese y se quitan el visor y los demás archivos.
 */
export type FondoId = 'red' | 'muro' | 'ciclo' | 'chat' | 'ondas';

export interface Fondo {
  id: FondoId;
  nombre: string;
}

export const FONDOS: Fondo[] = [
  { id: 'red', nombre: 'La red' },
  { id: 'muro', nombre: 'En vivo' },
  { id: 'ciclo', nombre: 'El ciclo' },
  { id: 'chat', nombre: 'Boca en boca' },
  { id: 'ondas', nombre: 'Actual' },
];

const LLAVE = 'hazlo-fondo-landing';
let actual: FondoId = FONDOS[0].id;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

// Lo guardado llega un instante después de abrir; mientras, se ve el primero.
AsyncStorage.getItem(LLAVE)
  .then((v) => {
    const guardado = FONDOS.find((f) => f.id === v);
    if (guardado && guardado.id !== actual) {
      actual = guardado.id;
      avisar();
    }
  })
  .catch(() => {});

export function elegirFondo(id: FondoId) {
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

export function useFondoLanding(): Fondo {
  const id = useSyncExternalStore(suscribir, () => actual, () => actual);
  return FONDOS.find((f) => f.id === id) ?? FONDOS[0];
}

/** Dónde queda libre el fondo: arriba y abajo del bloque de texto, en puntos. */
export interface Zonas {
  w: number;
  h: number;
  /** Entre el logo y el bloque del titular. */
  arriba: [number, number];
  /** Entre el bloque del titular y el botón. */
  abajo: [number, number];
}

export interface FondoProps {
  z: Zonas;
  quieto: boolean;
}
