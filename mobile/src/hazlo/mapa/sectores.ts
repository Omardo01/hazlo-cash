import type { ColoniaGeo } from './tipos';

/**
 * El contorno de un sector se arma juntando sus colonias, aquí en el teléfono:
 * así el admin puede agrupar como quiera sin volver a correr el script.
 *
 * Funciona porque generar-mapa.ts traza todas las colonias sobre la misma red
 * de vértices: la frontera entre dos colonias vecinas tiene exactamente los
 * mismos puntos en las dos, recorridos al revés. Si de todos los tramos de las
 * colonias del sector se quitan los que también aparecen al revés, queda solo
 * la orilla del sector.
 */

const punto = (x: number, y: number) => `${x},${y}`;

export function unirColonias(colonias: ColoniaGeo[]): number[][] {
  // Tramos dirigidos «a→b», con cuántas veces aparece cada uno.
  const tramos = new Map<string, number>();
  const coords = new Map<string, [number, number]>();
  for (const c of colonias) {
    for (const a of c.anillos) {
      const n = a.length / 2;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const p = punto(a[i * 2], a[i * 2 + 1]);
        const q = punto(a[j * 2], a[j * 2 + 1]);
        if (p === q) continue;
        coords.set(p, [a[i * 2], a[i * 2 + 1]]);
        const clave = `${p}|${q}`;
        tramos.set(clave, (tramos.get(clave) ?? 0) + 1);
      }
    }
  }

  // Lo que queda después de cancelar las fronteras internas, por punto de salida.
  const salen = new Map<string, string[]>();
  for (const [clave, veces] of tramos) {
    const [p, q] = clave.split('|');
    const reves = tramos.get(`${q}|${p}`) ?? 0;
    for (let k = 0; k < veces - reves; k++) {
      const lista = salen.get(p);
      if (lista) lista.push(q);
      else salen.set(p, [q]);
    }
  }

  const anillos: number[][] = [];
  for (const inicio of [...salen.keys()]) {
    while ((salen.get(inicio)?.length ?? 0) > 0) {
      const anillo: number[] = [];
      let v = inicio;
      // Tope por si algún tramo no cierra: nunca un ciclo infinito.
      for (let pasos = 0; pasos < 200_000; pasos++) {
        const [x, y] = coords.get(v) as [number, number];
        anillo.push(x, y);
        const opciones = salen.get(v);
        if (!opciones || opciones.length === 0) break;
        v = opciones.pop() as string;
        if (v === inicio) break;
      }
      if (anillo.length >= 6) anillos.push(anillo);
    }
  }
  return anillos;
}

function areaAnillo(a: number[]): number {
  let s = 0;
  const n = a.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    s += a[i * 2] * a[j * 2 + 1] - a[j * 2] * a[i * 2 + 1];
  }
  return Math.abs(s) / 2;
}

/**
 * Dónde va el nombre del sector: el centro de sus colonias pesado por área,
 * llevado al rótulo de colonia más cercano para que caiga siempre adentro.
 */
export function centroSector(colonias: ColoniaGeo[]): { x: number; y: number } {
  let total = 0;
  let cx = 0;
  let cy = 0;
  for (const c of colonias) {
    const area = c.anillos.reduce((t, a) => t + areaAnillo(a), 0) || 1;
    total += area;
    cx += c.x * area;
    cy += c.y * area;
  }
  cx /= total;
  cy /= total;
  let mejor = colonias[0];
  let mejorD = Infinity;
  for (const c of colonias) {
    const d = Math.hypot(c.x - cx, c.y - cy);
    if (d < mejorD) {
      mejor = c;
      mejorD = d;
    }
  }
  return { x: mejor.x, y: mejor.y };
}

/** Colores para distinguir sectores mientras se organizan. */
export const COLORES_SECTOR = ['#EB4E00', '#2D2B8F', '#00A896', '#E0A100', '#C2185B', '#5E8C31', '#0277BD', '#8E24AA', '#795548', '#00838F', '#D84315', '#546E7A'];

export const colorSector = (indice: number) => COLORES_SECTOR[indice % COLORES_SECTOR.length];
