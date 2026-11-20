import type { NegocioEnMapa, Sector } from '@/lib/services/mapa';

import { GRUPOS, grupoPorSlug, type Grupo, type IconoGrupo } from '../categorias/catalogo';
import { girosDeNegocio, grupoDeCategoria } from '../categorias/grupoDeNegocio';
import { hueColors } from '../ui';
import type { Nivel } from './paleta';
import { centroSector, unirColonias } from './sectores';
import type { ColoniaGeo, Geometria } from './tipos';

/**
 * Lo que dibuja el mapa: la geometría de OpenStreetMap, los negocios activos
 * con su ubicación real y, si el admin los armó, los sectores. Sin sectores
 * la ciudad se ve por colonias, tal cual.
 */

export interface Caja {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface NegocioMapa {
  id: string;
  nombre: string;
  /** Slug del grupo del catálogo. */
  grupo: string;
  /** Giro tal como viene en el catálogo. */
  giro: string;
  icono: IconoGrupo;
  color: string;
  x: number;
  y: number;
  /** Coordenadas reales: para «Cómo llegar» y para mover el pin. */
  lat: number;
  lng: number;
  /** null: cae fuera de las colonias del mapa. */
  coloniaId: string | null;
  coloniaNombre: string | null;
  recomendadores: number;
  ventasMes: number;
}

/** Lo que no cambia con los filtros: la forma de la zona. */
export interface ZonaBase {
  tipo: 'sector' | 'colonia';
  id: string;
  nombre: string;
  /** Debajo del nombre: «Fraccionamiento · Sector Centro» o «15 colonias». */
  detalle: string;
  x: number;
  y: number;
  anillos: number[][];
  d: string;
  caja: Caja;
  /** Solo en colonias. */
  sectorId?: string;
}

export interface Zona extends ZonaBase {
  negocios: number;
  recomendadores: number;
  ventasMes: number;
  nivel: Nivel;
  lista: NegocioMapa[];
  /** Solo en sectores. */
  colonias: Zona[];
}

export interface BaseMapa {
  /** Vacío si el admin no ha agrupado colonias. */
  sectores: ZonaBase[];
  colonias: ZonaBase[];
  negocios: NegocioMapa[];
  /** Activos que todavía no se marcan en el mapa (o quedaron fuera de Villahermosa). */
  sinUbicacion: NegocioEnMapa[];
  caja: Caja;
}

export interface DatosMapa {
  sectores: Zona[];
  colonias: Zona[];
  negocios: NegocioMapa[];
  totales: { negocios: number; recomendadores: number; ventasMes: number };
}

export interface Filtro {
  grupo: string | null;
  giro: string | null;
}

export const SIN_FILTRO: Filtro = { grupo: null, giro: null };

export function nombreFiltro(f: Filtro): string | null {
  if (f.giro) return f.giro;
  return f.grupo ? (grupoPorSlug(f.grupo)?.nombre ?? null) : null;
}

function cajaDe(anillos: number[][]): Caja {
  const caja: Caja = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (const a of anillos) {
    for (let i = 0; i < a.length; i += 2) {
      caja.x0 = Math.min(caja.x0, a[i]);
      caja.x1 = Math.max(caja.x1, a[i]);
      caja.y0 = Math.min(caja.y0, a[i + 1]);
      caja.y1 = Math.max(caja.y1, a[i + 1]);
    }
  }
  return caja;
}

function pathDe(anillos: number[][]): string {
  return anillos
    .map((a) => {
      let d = `M${a[0]} ${a[1]}`;
      for (let i = 2; i < a.length; i += 2) d += `L${a[i]} ${a[i + 1]}`;
      return `${d}Z`;
    })
    .join('');
}

/** Regla par-impar: un punto en el hueco de la laguna no está en la zona. */
export function contiene(zona: ZonaBase, x: number, y: number): boolean {
  const { caja } = zona;
  if (x < caja.x0 || x > caja.x1 || y < caja.y0 || y > caja.y1) return false;
  let adentro = false;
  for (const a of zona.anillos) {
    for (let i = 0, j = a.length - 2; i < a.length; j = i, i += 2) {
      if (a[i + 1] > y !== a[j + 1] > y && x < ((a[j] - a[i]) * (y - a[i + 1])) / (a[j + 1] - a[i + 1]) + a[i]) adentro = !adentro;
    }
  }
  return adentro;
}

const porArea = (a: ZonaBase, b: ZonaBase) => (b.caja.x1 - b.caja.x0) * (b.caja.y1 - b.caja.y0) - (a.caja.x1 - a.caja.x0) * (a.caja.y1 - a.caja.y0);

/** De lat/lng al lienzo del mapa. */
export function aLienzo(geo: Geometria, lat: number, lng: number): { x: number; y: number } {
  const p = geo.PROYECCION;
  return { x: (lng - p.oeste) * p.kx, y: (p.norte - lat) * p.ky };
}

/** Del lienzo a lat/lng, con 6 decimales (≈ 10 cm). */
export function aCoordenadas(geo: Geometria, x: number, y: number): { lat: number; lng: number } {
  const p = geo.PROYECCION;
  const redondo = (n: number) => Math.round(n * 1e6) / 1e6;
  return { lat: redondo(p.norte - y / p.ky), lng: redondo(p.oeste + x / p.kx) };
}

/** Metros entre dos puntos del lienzo (la ciudad es chica: plano basta). */
export function metrosEnLienzo(geo: Geometria, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const p = geo.PROYECCION;
  const lat = ((p.norte - (a.y + b.y) / 2 / p.ky) * Math.PI) / 180;
  const dx = ((b.x - a.x) / p.kx) * 111_320 * Math.cos(lat);
  const dy = ((b.y - a.y) / p.ky) * 110_574;
  return Math.hypot(dx, dy);
}

export interface Cercano {
  negocio: NegocioMapa;
  metros: number;
}

/** Los negocios más cerca de un punto, del más cercano al más lejano. */
export function cercanos(geo: Geometria, negocios: NegocioMapa[], punto: { x: number; y: number }, cuantos: number): Cercano[] {
  return negocios
    .map((negocio) => ({ negocio, metros: metrosEnLienzo(geo, punto, negocio) }))
    .sort((a, b) => a.metros - b.metros)
    .slice(0, cuantos);
}

/** «350 m» o «2.4 km». */
export function formatearDistancia(metros: number): string {
  if (metros < 1000) return `${Math.max(10, Math.round(metros / 10) * 10)} m`;
  return `${(metros / 1000).toFixed(metros < 10_000 ? 1 : 0)} km`;
}

const dentroDelLienzo = (geo: Geometria, x: number, y: number) => x >= 0 && y >= 0 && x <= geo.ANCHO_MAPA && y <= geo.ALTO_MAPA;

/**
 * La colonia de un punto. Los contornos son aproximados, así que un negocio
 * que cae justo afuera se queda con la colonia más cercana (hasta ~600 m).
 */
export function coloniaEn(colonias: ZonaBase[], x: number, y: number): ZonaBase | null {
  const adentro = colonias.find((c) => contiene(c, x, y));
  if (adentro) return adentro;
  let mejor: ZonaBase | null = null;
  let mejorD = 28;
  for (const c of colonias) {
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < mejorD) {
      mejor = c;
      mejorD = d;
    }
  }
  return mejor;
}

function zonaColonia(c: ColoniaGeo, sector: string | undefined): ZonaBase {
  return {
    tipo: 'colonia',
    id: c.id,
    nombre: c.nombre,
    detalle: sector ? `${c.tipo} · Sector ${sector}` : c.tipo,
    x: c.x,
    y: c.y,
    anillos: c.anillos,
    d: pathDe(c.anillos),
    caja: cajaDe(c.anillos),
  };
}

/** Las colonias con su sector (si tienen) y los sectores armados desde ellas. */
export function armarZonas(geo: Geometria, guardados: Sector[]): { colonias: ZonaBase[]; sectores: ZonaBase[] } {
  const porId = new Map(geo.COLONIAS.map((c) => [c.id, c]));
  const sectorDe = new Map<string, Sector>();
  for (const s of guardados) for (const id of s.colonias) if (porId.has(id) && !sectorDe.has(id)) sectorDe.set(id, s);

  const colonias = geo.COLONIAS.map((c) => {
    const s = sectorDe.get(c.id);
    return { ...zonaColonia(c, s?.nombre), sectorId: s?.id };
  });

  const sectores: ZonaBase[] = [];
  for (const s of guardados) {
    const suyas = geo.COLONIAS.filter((c) => sectorDe.get(c.id) === s);
    if (suyas.length === 0) continue;
    const anillos = unirColonias(suyas);
    const centro = centroSector(suyas);
    sectores.push({
      tipo: 'sector',
      id: s.id,
      nombre: s.nombre,
      detalle: `${suyas.length} ${suyas.length === 1 ? 'colonia' : 'colonias'}`,
      x: centro.x,
      y: centro.y,
      anillos,
      d: pathDe(anillos),
      caja: cajaDe(anillos),
    });
  }
  // Las zonas grandes dicen su nombre primero en el mapa.
  return { colonias: colonias.sort(porArea), sectores: sectores.sort(porArea) };
}

/** Geometría, sectores y negocios reales. Se rearma solo cuando cambian los datos. */
export function armarBase(geo: Geometria, crudos: NegocioEnMapa[], guardados: Sector[]): BaseMapa {
  const { colonias, sectores } = armarZonas(geo, guardados);
  const negocios: NegocioMapa[] = [];
  const sinUbicacion: NegocioEnMapa[] = [];

  for (const n of crudos) {
    const punto = n.lat !== null && n.lng !== null ? aLienzo(geo, n.lat, n.lng) : null;
    if (!punto || n.lat === null || n.lng === null || !dentroDelLienzo(geo, punto.x, punto.y)) {
      sinUbicacion.push(n);
      continue;
    }
    const grupo = grupoDeCategoria(n.categoria);
    const colonia = coloniaEn(colonias, punto.x, punto.y);
    negocios.push({
      id: n.id,
      nombre: n.nombre,
      grupo: grupo.slug,
      giro: girosDeNegocio({ categoria: n.categoria, giros: n.giros })[0] ?? grupo.nombre,
      icono: grupo.icono,
      color: hueColors(grupo.hue)[1],
      x: punto.x,
      y: punto.y,
      lat: n.lat,
      lng: n.lng,
      coloniaId: colonia?.id ?? null,
      coloniaNombre: colonia?.nombre ?? null,
      recomendadores: n.recomendadores,
      ventasMes: n.ventasMes,
    });
  }

  return {
    sectores,
    colonias,
    negocios,
    sinUbicacion,
    caja: cajaDe(geo.SECTORES.flatMap((s) => s.anillos)),
  };
}

function medir(base: ZonaBase, lista: NegocioMapa[], colonias: Zona[]): Zona {
  return {
    ...base,
    negocios: lista.length,
    recomendadores: lista.reduce((t, n) => t + n.recomendadores, 0),
    ventasMes: lista.reduce((t, n) => t + n.ventasMes, 0),
    nivel: 0,
    lista,
    colonias,
  };
}

// La presencia es relativa a la mejor zona de lo que se está viendo: así el mapa
// dice dónde están las taquerías aunque sean pocas. El piso evita que una sola
// taquería pinte una colonia como «fuerte».
function ponerNiveles(zonas: Zona[]) {
  const mayor = Math.max(3, ...zonas.map((z) => z.negocios));
  for (const z of zonas) z.nivel = (z.negocios === 0 ? 0 : Math.ceil((3 * z.negocios) / mayor)) as Nivel;
}

const porPresencia = (a: Zona, b: Zona) => b.negocios - a.negocios || b.recomendadores - a.recomendadores || a.nombre.localeCompare(b.nombre, 'es');

/** Las cifras de cada zona, contando solo lo que pasa el filtro. */
export function aplicarFiltro(base: BaseMapa, filtro: Filtro): DatosMapa {
  const negocios = base.negocios.filter((n) => (!filtro.grupo || n.grupo === filtro.grupo) && (!filtro.giro || n.giro === filtro.giro));

  const porColonia = new Map<string, NegocioMapa[]>();
  for (const n of negocios) {
    if (!n.coloniaId) continue;
    const lista = porColonia.get(n.coloniaId);
    if (lista) lista.push(n);
    else porColonia.set(n.coloniaId, [n]);
  }

  const colonias = base.colonias.map((c) => medir(c, porColonia.get(c.id) ?? [], []));
  const sectores = base.sectores.map((s) => {
    const suyas = colonias.filter((c) => c.sectorId === s.id).sort(porPresencia);
    return medir(s, suyas.flatMap((c) => c.lista), suyas);
  });
  ponerNiveles(colonias);
  ponerNiveles(sectores);

  return {
    sectores: sectores.sort(porPresencia),
    colonias: [...colonias].sort(porPresencia),
    negocios,
    totales: {
      negocios: negocios.length,
      recomendadores: negocios.reduce((t, n) => t + n.recomendadores, 0),
      ventasMes: negocios.reduce((t, n) => t + n.ventasMes, 0),
    },
  };
}

export interface ConteoGrupo {
  grupo: Grupo;
  negocios: number;
}

export interface ConteoGiro {
  giro: string;
  negocios: number;
}

/** Grupos del catálogo con negocios, de más a menos. */
export function contarGrupos(lista: NegocioMapa[]): ConteoGrupo[] {
  return GRUPOS.map((grupo) => ({ grupo, negocios: lista.filter((n) => n.grupo === grupo.slug).length }))
    .filter((c) => c.negocios > 0)
    .sort((a, b) => b.negocios - a.negocios);
}

/** Giros de un grupo con negocios, de más a menos. */
export function contarGiros(lista: NegocioMapa[], grupo: string): ConteoGiro[] {
  const cuenta = new Map<string, number>();
  for (const n of lista) if (n.grupo === grupo) cuenta.set(n.giro, (cuenta.get(n.giro) ?? 0) + 1);
  return [...cuenta].map(([giro, negocios]) => ({ giro, negocios })).sort((a, b) => b.negocios - a.negocios);
}
