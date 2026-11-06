import { GRUPOS, grupoPorSlug, type Grupo, type IconoGrupo } from '../categorias/catalogo';
import { hueColors } from '../ui';
import type { Nivel } from './paleta';
import type { Geometria } from './tipos';

/**
 * Cifras y negocios DE EJEMPLO para diseñar la pantalla: la geometría y el
 * catálogo de giros son reales, esto no. Salen de un azar con semilla para que
 * no cambien entre recargas. Cuando exista presencia real, armarBase se
 * reemplaza por una consulta y lo demás sigue igual.
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
  coloniaId: string;
  coloniaNombre: string;
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
  sectores: ZonaBase[];
  colonias: ZonaBase[];
  negocios: NegocioMapa[];
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

function azar(semilla: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

// Qué tanto "ha llegado" el ejemplo a cada sector: más al centro, menos a la orilla.
const PESO: Record<string, number> = {
  centro: 1,
  'tabasco-2000': 0.85,
  atasta: 0.7,
  gaviotas: 0.6,
  tamulte: 0.5,
  'casa-blanca': 0.4,
  sur: 0.3,
  industrial: 0.2,
  carrizal: 0.12,
  'miguel-hidalgo': 0.08,
};

// Los giros se escriben igual que en el catálogo: así el filtro funciona igual
// cuando los negocios sean de verdad.
const PLANTILLAS: { grupo: string; giro: string; prefijo: string }[] = [
  { grupo: 'alimentos', giro: 'Taquerías de pastor y sirloin', prefijo: 'Tacos' },
  { grupo: 'belleza', giro: 'Estética', prefijo: 'Estética' },
  { grupo: 'automotriz', giro: 'Taller mecánico', prefijo: 'Taller' },
  { grupo: 'oficios', giro: 'Plomero', prefijo: 'Plomería' },
  { grupo: 'alimentos', giro: 'Cafetería', prefijo: 'Café' },
  { grupo: 'salud', giro: 'Dentista', prefijo: 'Consultorio' },
  { grupo: 'servicios', giro: 'Lavandería', prefijo: 'Lavandería' },
  { grupo: 'alimentos', giro: 'Cocina económica', prefijo: 'Cocina' },
  { grupo: 'oficios', giro: 'Electricista', prefijo: 'Electricidad' },
  { grupo: 'deportes', giro: 'Gym', prefijo: 'Gym' },
  { grupo: 'belleza', giro: 'Barbería', prefijo: 'Barbería' },
  { grupo: 'alimentos', giro: 'Panadería', prefijo: 'Panadería' },
  { grupo: 'fiestas', giro: 'Salón para fiestas', prefijo: 'Salón' },
  { grupo: 'automotriz', giro: 'Venta de llantas', prefijo: 'Llantera' },
  { grupo: 'ensenanza', giro: 'Escuela de inglés', prefijo: 'Inglés' },
  { grupo: 'salud', giro: 'Medicina general', prefijo: 'Clínica' },
  { grupo: 'servicios', giro: 'Ferreterías', prefijo: 'Ferretería' },
  { grupo: 'profesionales', giro: 'Contador público', prefijo: 'Despacho' },
  { grupo: 'oficios', giro: 'Cerrajero', prefijo: 'Cerrajería' },
  { grupo: 'fiestas', giro: 'Florería', prefijo: 'Florería' },
  { grupo: 'inmuebles', giro: 'Venta y renta', prefijo: 'Inmobiliaria' },
  { grupo: 'automotriz', giro: 'Lavado de autos', prefijo: 'Autolavado' },
  { grupo: 'vehiculos', giro: 'Venta y renta', prefijo: 'Autos' },
];

const SUFIJOS = ['El Güero', 'Don Beto', 'La Esquina', 'Doña Chela', 'El Compadre', 'La Ceiba', 'San Juan', 'Los Primos', 'El Malecón', 'Doña Mary', 'La Tabasqueña', 'El Jobo', 'Santa Elena', 'La Pigua'];

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

/** Geometría más negocios de ejemplo. Se arma una sola vez. */
export function armarBase(geo: Geometria): BaseMapa {
  const negocios: NegocioMapa[] = [];
  const nombreSector = new Map(geo.SECTORES.map((s) => [s.id, s.nombre]));

  const colonias: ZonaBase[] = geo.COLONIAS.map((c) => {
    const r = azar(c.id);
    r();
    const cuantos = Math.floor((PESO[c.sector] ?? 0.1) * r() * 3.4);
    for (let i = 0; i < cuantos; i++) {
      const n = negocios.length;
      const p = PLANTILLAS[n % PLANTILLAS.length];
      const grupo = grupoPorSlug(p.grupo);
      negocios.push({
        id: `${c.id}-${i}`,
        nombre: `${p.prefijo} ${SUFIJOS[n % SUFIJOS.length]}`,
        grupo: p.grupo,
        giro: p.giro,
        icono: grupo?.icono ?? 'storefront-outline',
        color: hueColors(grupo?.hue ?? 26)[1],
        x: c.x + (r() - 0.5) * 22,
        y: c.y + (r() - 0.5) * 22,
        coloniaId: c.id,
        coloniaNombre: c.nombre,
        recomendadores: 2 + Math.floor(r() * 5),
        ventasMes: 4 + Math.floor(r() * 16),
      });
    }
    return {
      tipo: 'colonia',
      id: c.id,
      nombre: c.nombre,
      detalle: `${c.tipo} · Sector ${nombreSector.get(c.sector) ?? ''}`,
      x: c.x,
      y: c.y,
      anillos: c.anillos,
      d: pathDe(c.anillos),
      caja: cajaDe(c.anillos),
      sectorId: c.sector,
    };
  });

  const sectores: ZonaBase[] = geo.SECTORES.map((s) => ({
    tipo: 'sector',
    id: s.id,
    nombre: s.nombre,
    detalle: `${geo.COLONIAS.filter((c) => c.sector === s.id).length} colonias`,
    x: s.x,
    y: s.y,
    anillos: s.anillos,
    d: pathDe(s.anillos),
    caja: cajaDe(s.anillos),
  }));

  return {
    // Las zonas grandes dicen su nombre primero en el mapa.
    sectores: sectores.sort(porArea),
    colonias: colonias.sort(porArea),
    negocios,
    caja: cajaDe(sectores.flatMap((s) => s.anillos)),
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
