import type { NegocioCatalogo } from '@/lib/types';

import { GRUPOS, normalizar, type Grupo } from '../categorias/catalogo';
import { girosDeNegocio, grupoDeCategoria } from '../categorias/grupoDeNegocio';
import { aLienzo, armarZonas, coloniaEn, metrosEnLienzo, type ZonaBase } from '../mapa/datos';
import type { Geometria } from '../mapa/tipos';
import { hueColors } from '../ui';

/**
 * El buscador del landing: una sola caja que entiende giro, nombre y colonia,
 * juntos o por separado («dentista», «don chuy», «dentista atasta»). Todo corre
 * en el teléfono sobre el catálogo ya cargado: ninguna letra pide internet.
 */

export interface Punto {
  x: number;
  y: number;
}

export interface Lugar {
  id: string;
  nombre: string;
  /** Su giro principal, o el grupo si no eligió giro. */
  giro: string;
  grupo: Grupo;
  color: string;
  /** Dónde está en el lienzo. null: aún no lo marcan, o cae fuera del mapa. */
  punto: Punto | null;
  coloniaId: string | null;
  coloniaNombre: string | null;
  /** Palabras por las que se encuentra: nombre, giros y grupo. */
  palabras: string[];
}

export interface Indice {
  geo: Geometria | null;
  lugares: Lugar[];
  colonias: ZonaBase[];
}

export interface LugarCerca {
  lugar: Lugar;
  /** null: sin punto de partida o sin ubicación. */
  metros: number | null;
}

export interface Resultados {
  dentro: LugarCerca[];
  fuera: LugarCerca[];
  sinUbicacion: Lugar[];
}

export interface Interpretacion {
  /** Lo que se busca (giro o nombre), sin la colonia. */
  que: string;
  colonia: ZonaBase | null;
}

const partir = (t: string) => normalizar(t).split(/[^a-z0-9]+/).filter(Boolean);

// Lo que se dice al hablar y no ayuda a encontrar.
const RELLENO = new Set(['en', 'de', 'del', 'la', 'el', 'los', 'las', 'y', 'a', 'un', 'una', 'mi', 'por', 'para', 'con', 'cerca', 'cercano', 'cercana', 'cercanos', 'colonia', 'col', 'fracc', 'fraccionamiento', 'busco', 'quiero', 'donde', 'hay']);

// Como se pide contra como se llama en el catálogo de giros.
const SINONIMOS: Record<string, string[]> = {
  taco: ['taqueria'],
  taqueria: ['taco'],
  mecanico: ['taller', 'automotriz'],
  carro: ['automotriz'],
  coche: ['automotriz'],
  peluqueria: ['estetica', 'barberia'],
  barbero: ['barberia'],
  barberia: ['barber'],
  doctor: ['medicina', 'salud'],
  medico: ['medicina', 'salud'],
  diente: ['dentista'],
  dental: ['dentista'],
  cafe: ['cafeteria'],
  gimnasio: ['gym'],
  comida: ['alimentos'],
  comer: ['alimentos'],
  restaurante: ['alimentos'],
  luz: ['electricista'],
  electrico: ['electricista'],
  fuga: ['plomero'],
  plomeria: ['plomero'],
  ropa: ['lavanderia', 'boutique'],
  contabilidad: ['contador'],
  escuela: ['ensenanza'],
  fiesta: ['salon', 'fiestas'],
};

/** «dentistas» busca «dentista»; «talleres», «taller». */
function raiz(token: string): string {
  if (token.length > 5 && token.endsWith('es')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

const variantes = (token: string) => {
  const r = raiz(token);
  return [r, ...(SINONIMOS[r] ?? SINONIMOS[token] ?? [])];
};

/** Palabras útiles de lo escrito. Si todo era relleno («la»), se usa tal cual. */
export function tokensDe(texto: string): string[] {
  const todas = partir(texto);
  const utiles = todas.filter((t) => !RELLENO.has(t));
  return utiles.length > 0 ? utiles : todas.filter((t) => t.length > 2 && t !== 'cerca' && t !== 'colonia');
}

const encaja = (palabras: string[], tokens: string[]) => tokens.every((t) => variantes(t).some((v) => palabras.some((p) => p.startsWith(v))));

// Todos los giros del catálogo, haya o no negocios: para reconocer lo que se pide.
const GIROS_CATALOGO = GRUPOS.flatMap((g) => g.giros.map((giro) => ({ giro, palabras: partir(giro) })));

export function armarIndice(geo: Geometria | null, colonias: ZonaBase[], negocios: NegocioCatalogo[]): Indice {
  const lugares = negocios.map((n): Lugar => {
    const grupo = grupoDeCategoria(n.categoria);
    const giros = girosDeNegocio(n);
    const p = geo && typeof n.lat === 'number' && typeof n.lng === 'number' ? aLienzo(geo, n.lat, n.lng) : null;
    const punto = geo && p && p.x >= 0 && p.y >= 0 && p.x <= geo.ANCHO_MAPA && p.y <= geo.ALTO_MAPA ? p : null;
    const colonia = punto ? coloniaEn(colonias, punto.x, punto.y) : null;
    return {
      id: n.id,
      nombre: n.nombre,
      giro: giros[0] ?? grupo.nombre,
      grupo,
      color: hueColors(grupo.hue)[1],
      punto,
      coloniaId: colonia?.id ?? null,
      coloniaNombre: colonia?.nombre ?? null,
      palabras: partir([n.nombre, ...giros, grupo.nombre, n.categoria].join(' ')),
    };
  });
  return { geo, lugares, colonias };
}

let coloniasGuardadas: { geo: Geometria; colonias: ZonaBase[] } | null = null;

/** Las colonias con su forma. Armarlas cuesta: se hace una vez. */
export function coloniasDe(geo: Geometria | null): ZonaBase[] {
  if (!geo) return [];
  if (coloniasGuardadas?.geo !== geo) coloniasGuardadas = { geo, colonias: armarZonas(geo, []).colonias };
  return coloniasGuardadas.colonias;
}

// «la manga 2» es La Manga II, y «gaviotas 1» vale por 1ra.
const NUMEROS: Record<string, string[]> = { '1': ['i', '1ra'], '2': ['ii', '2da'], '3': ['iii', '3ra'], '4': ['iv', '4ta'] };
const igualNumero = (t: string, p: string) => p === t || (NUMEROS[t]?.includes(p) ?? false);

/** Qué tanto se parece lo escrito a una colonia. 0: nada. */
function parecido(colonia: ZonaBase, tokens: string[]): number {
  const palabras = partir(colonia.nombre);
  // Los números y los romanos van completos: «i» no es «ii».
  const cabe = (t: string, p: string) => igualNumero(t, p) || (!/^(\d|[ivx]+$)/.test(t) && p.startsWith(t)) || (/^\d{2,}/.test(t) && p.startsWith(t));
  if (!tokens.every((t) => palabras.some((p) => cabe(t, p)))) return 0;
  const propias = palabras.filter((p) => !RELLENO.has(p));
  const exactas = tokens.filter((t) => palabras.some((p) => igualNumero(t, p))).length;
  const letras = tokens.join('').length / Math.max(1, propias.join('').length);
  return 0.4 + Math.min(1, letras) + (exactas === propias.length ? 1 : exactas * 0.2);
}

/** Colonias que se parecen, de la más a la menos. */
export function buscarColonias(colonias: ZonaBase[], texto: string, cuantas: number): ZonaBase[] {
  const tokens = tokensDe(texto);
  if (tokens.length === 0) return [];
  return colonias
    .map((c) => ({ c, v: parecido(c, tokens) }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v || a.c.nombre.localeCompare(b.c.nombre, 'es', { numeric: true }))
    .slice(0, cuantas)
    .map((x) => x.c);
}

/**
 * Separa lo escrito en «qué» y «en qué colonia», probando todos los cortes en
 * los dos órdenes («dentista atasta», «atasta dentista») y quedándose con el que
 * mejor cuadra. Con una colonia ya elegida, todo es «qué».
 */
export function interpretar(indice: Indice, texto: string, coloniaFija: ZonaBase | null): Interpretacion {
  const tokens = tokensDe(texto);
  if (coloniaFija || tokens.length === 0) return { que: texto.trim(), colonia: coloniaFija };

  const puntosQue = (q: string[]): number | null => {
    if (q.length === 0) return 0;
    if (indice.lugares.some((l) => encaja(l.palabras, q))) return 3 + q.length * 0.2;
    return GIROS_CATALOGO.some((g) => encaja(g.palabras, q)) ? 2 : null;
  };
  const mejorColonia = (c: string[]): { colonia: ZonaBase; puntos: number } | null => {
    if (c.join('').length < 3) return null;
    const colonia = buscarColonias(indice.colonias, c.join(' '), 1)[0];
    return colonia ? { colonia, puntos: 2.2 + parecido(colonia, c) + c.length * 0.2 } : null;
  };

  let mejor: (Interpretacion & { puntos: number }) | null = null;
  const probar = (q: string[], c: string[]) => {
    // Un número suelto es parte de la colonia («la manga 2»), no lo que se busca.
    if (c.length > 0 && q.length > 0 && q.every((t) => /^\d+$/.test(t))) return;
    const pq = puntosQue(q);
    if (pq === null) return;
    const pc = c.length === 0 ? null : mejorColonia(c);
    if (c.length > 0 && !pc) return;
    const puntos = pq + (pc?.puntos ?? 0);
    if (!mejor || puntos > mejor.puntos) mejor = { que: q.join(' '), colonia: pc?.colonia ?? null, puntos };
  };
  for (let i = 0; i <= tokens.length; i++) {
    probar(tokens.slice(0, i), tokens.slice(i));
    if (i > 0 && i < tokens.length) probar(tokens.slice(i), tokens.slice(0, i));
  }
  const m = mejor as (Interpretacion & { puntos: number }) | null;
  return m ? { que: m.que, colonia: m.colonia } : { que: texto.trim(), colonia: null };
}

/** Cómo decir lo que se busca: el nombre del giro si lo es; si no, lo escrito. */
export function etiquetaDe(indice: Indice, que: string, original?: string): string {
  const tokens = tokensDe(que);
  if (tokens.length === 0) return '';
  const giro = GIROS_CATALOGO.find((g) => {
    const propias = g.palabras.filter((p) => !RELLENO.has(p));
    return propias.length === tokens.length && tokens.every((t, i) => propias[i] === t || propias[i].startsWith(raiz(t)) && propias[i].length - raiz(t).length <= 2);
  });
  if (giro) return giro.giro;
  // «denti» ya solo puede ser Dentista. Por sinónimo no: quien escribió
  // «peluquería» debe seguir leyendo lo suyo.
  const posibles = new Set(indice.lugares.map((l) => l.giro).filter((g) => tokens.every((t) => partir(g).some((p) => p.startsWith(raiz(t))))));
  if (posibles.size === 1 && tokens.join('').length >= 4 && !indice.lugares.some((l) => encaja(partir(l.nombre), tokens))) return [...posibles][0];
  // Se rescata cómo lo escribió (con acentos): mismas palabras, en su orden.
  const suyas = (original ?? que).split(/\s+/).filter((p) => tokens.includes(partir(p)[0] ?? ''));
  const t = suyas.length > 0 ? suyas.join(' ') : que;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Giros con negocios que encajan con lo escrito, de más a menos. */
export function girosCon(indice: Indice, que: string, cuantos: number): { giro: string; lugar: Lugar; total: number }[] {
  const tokens = tokensDe(que);
  const cuenta = new Map<string, { giro: string; lugar: Lugar; total: number }>();
  for (const l of indice.lugares) {
    if (tokens.length > 0 && !encaja(partir(l.giro), tokens)) continue;
    const c = cuenta.get(l.giro);
    if (c) c.total++;
    else cuenta.set(l.giro, { giro: l.giro, lugar: l, total: 1 });
  }
  return [...cuenta.values()].sort((a, b) => b.total - a.total || a.giro.localeCompare(b.giro, 'es')).slice(0, cuantos);
}

/** Negocios que se encuentran por su nombre. */
export function porNombre(indice: Indice, texto: string, cuantos: number): Lugar[] {
  const tokens = tokensDe(texto);
  if (tokens.length === 0) return [];
  const q = normalizar(texto.trim());
  return indice.lugares
    .filter((l) => {
      const palabras = partir(l.nombre);
      return tokens.every((t) => palabras.some((p) => p.startsWith(t)));
    })
    .sort((a, b) => Number(normalizar(b.nombre).startsWith(q)) - Number(normalizar(a.nombre).startsWith(q)) || a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
    .slice(0, cuantos);
}

/** De más cerca a más lejos; sin punto de partida, por nombre. */
export function ordenar(indice: Indice, lugares: Lugar[], desde: Punto | null): LugarCerca[] {
  const { geo } = indice;
  return lugares
    .map((lugar) => ({ lugar, metros: geo && desde && lugar.punto ? metrosEnLienzo(geo, desde, lugar.punto) : null }))
    .sort((a, b) => (a.metros ?? Infinity) - (b.metros ?? Infinity) || a.lugar.nombre.localeCompare(b.lugar.nombre, 'es', { numeric: true }));
}

/**
 * Los lugares que encajan: primero los de la colonia y luego los de fuera, cada
 * grupo del más cercano al más lejano. Sin colonia, todos van en `fuera`.
 * Con `grupo`, solo los de esa categoría.
 */
export function buscar(indice: Indice, que: string, colonia: ZonaBase | null, desde: Punto | null, grupo: string | null = null): Resultados {
  const tokens = tokensDe(que);
  // Algo escrito que no deja palabras útiles no es «todo»: no encontró nada.
  const encajan = que.trim() && tokens.length === 0 ? [] : indice.lugares.filter((l) => (!grupo || l.grupo.slug === grupo) && encaja(l.palabras, tokens));
  const ubicados = ordenar(indice, encajan.filter((l) => l.punto), desde);
  return {
    dentro: colonia ? ubicados.filter((l) => l.lugar.coloniaId === colonia.id) : [],
    fuera: colonia ? ubicados.filter((l) => l.lugar.coloniaId !== colonia.id) : ubicados,
    sinUbicacion: encajan.filter((l) => !l.punto),
  };
}
