/** Formas de los datos que escribe scripts/generar-mapa.ts en geometria.ts. */

export interface CapasMapa {
  local: string;
  terciaria: string;
  secundaria: string;
  primaria: string;
  troncal: string;
  agua: string;
  verde: string;
  rioGrueso: string;
  rioMedio: string;
  rioFino: string;
}

export interface EtiquetaGeo {
  nombre: string;
  x: number;
  y: number;
}

export interface SectorGeo extends EtiquetaGeo {
  id: string;
  /** Anillos [x0, y0, x1, y1, …] en unidades del lienzo. Los huecos van con regla par-impar. */
  anillos: number[][];
}

export interface ColoniaGeo extends SectorGeo {
  tipo: string;
  sector: string;
}

export type Geometria = typeof import('./geometria');
