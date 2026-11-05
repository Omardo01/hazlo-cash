/// <reference types="node" />
/**
 * Genera src/hazlo/mapa/geometria.ts: el mapa de Villahermosa como datos
 * propios (sin proveedor de mapas, sin llaves y sin dependencias nuevas).
 *
 *   cd mobile && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/generar-mapa.ts
 *
 * Qué hace:
 *  1. Baja de OpenStreetMap las calles, el agua, los parques y las colonias
 *     (se guardan en scripts/.mapa-osm/ para no volver a pedirlos). Hay que
 *     mostrar el crédito «© OpenStreetMap» junto al mapa: es la licencia.
 *  2. Proyecta y simplifica todo a un lienzo de ANCHO unidades.
 *  3. OSM solo trae el punto de cada colonia, no su contorno, así que el
 *     contorno se aproxima: sobre una rejilla, cada cuadro de zona urbana se le
 *     da a la colonia más cercana caminando, sin cruzar ríos ni lagunas.
 *
 * SECTORES es la lista de la que hay que platicar: mover una colonia de sector
 * es cambiarla de lista aquí y volver a correr el script.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(RAIZ, 'scripts', '.mapa-osm');
const SALIDA = join(RAIZ, 'src', 'hazlo', 'mapa', 'geometria.ts');

// Encuadre completo (carreteras y ríos) y ciudad (ahí sí, todas las calles).
const OESTE = -93.035;
const ESTE = -92.865;
const SUR = 17.887;
const NORTE = 18.103;
const CIUDAD = '17.93,-93.03,18.06,-92.87';
const ENCUADRE = `${SUR},${OESTE},${NORTE},${ESTE}`;

const ANCHO = 800;
const KX = ANCHO / (ESTE - OESTE);
const KY = KX / Math.cos((18 * Math.PI) / 180);
const ALTO = Math.round((NORTE - SUR) * KY);

// Rejilla de las zonas: 3 unidades ≈ 67 m.
const CELDA = 3;
const COLS = Math.ceil(ANCHO / CELDA);
const FILAS = Math.ceil(ALTO / CELDA);

/** Propuesta inicial: sectores por definir con Omar y su socio. */
const SECTORES: { id: string; nombre: string; colonias: string[] }[] = [
  {
    id: 'centro',
    nombre: 'Centro',
    colonias: ['Centro', 'Mayito', 'Municipal', 'Reforma', 'Los Tulipanes', 'Gil y Sáenz', 'Nueva Villahermosa', 'Jesús García', 'José Narciso Rovirosa', 'Florida', 'Lago Ilusiones', 'Lidia Esther', 'Portal del Agua', 'Adolfo López Mateos', 'Magisterial'],
  },
  {
    id: 'tabasco-2000',
    nombre: 'Tabasco 2000',
    colonias: ['Tabasco 2000', 'Galaxia', 'Multiochenta', 'La Choca', 'Villas del Bosque', 'Brisas del Usumacinta', 'El Espejo I', 'El Espejo II', 'Oropeza', 'Álvaro Obregón', 'Nueva Imagen', 'Bonanza', 'Prados de Villahermosa'],
  },
  {
    id: 'atasta',
    nombre: 'Atasta',
    colonias: ['Atasta de Serra', 'José Colomo', 'Lindavista', 'Loma Linda', 'Militar', 'Pensiones', 'Guadalupe', 'Del Bosque', 'Deportiva', 'José María Pino Suárez', 'Villa las Fuentes', 'Andrés Sánchez Magallanes', 'Fovissste Etapa I', 'Fovissste Etapa II'],
  },
  {
    id: 'tamulte',
    nombre: 'Tamulté',
    colonias: ['Tamulté de las Barrancas', 'Vista Alegre', 'Villa de los Arcos', '18 de Marzo', 'Guadalupe Borja', 'Cotip', 'Nuevas Pensiones', 'Las Delicias', 'Punta Brava', 'Real del Parque', 'Palmitas', 'Ixtacomitán 1ra', 'Jardines del Sur', 'Plaza Villahermosa', 'Sabina', 'Blancas Mariposas'],
  },
  {
    id: 'sur',
    nombre: 'Primero de Mayo',
    colonias: ['Primero de Mayo', 'Plutarco Elías Calles', 'El Parque', 'Guayabal', 'Las Brisas', 'Marcos Buendía Pérez'],
  },
  {
    id: 'gaviotas',
    nombre: 'Gaviotas',
    colonias: ['Gaviotas Norte', 'Explanada', 'Gaviotas Popular', 'Armenia', 'El Monal I', 'El Monal II', 'El Monal III', 'San José', 'Triunfo La Manga I', 'Triunfo La Manga II', 'Triunfo La Manga III'],
  },
  {
    id: 'casa-blanca',
    nombre: 'Casa Blanca',
    colonias: ['Casa Blanca 1ra', 'Casa Blanca 2da', 'La Manga I', 'La Manga II', 'La Manga III', 'Fovissste Casa Blanca', 'Brisas del Grijalva', 'Framboyanes', 'El Recreo', 'Villa de las Palmas', 'Valle Marino', 'Tierra Colorada'],
  },
  {
    id: 'industrial',
    nombre: 'Ciudad Industrial',
    colonias: ['Indeco', 'Las Garzas', 'Cosmos', 'Jardines del Sol', 'Infonavit Ciudad Industrial', 'Villa las Flores', 'Roberto Madrazo Pintado', 'Vicente Guerrero', 'Insurgentes', 'Olmeca', 'Lagunas', 'Francisco Villa', 'Lagunas del Maurel'],
  },
  {
    id: 'carrizal',
    nombre: 'Carrizal',
    colonias: ['Carrizal', 'Fracc. Carrizal', 'Bosque de Saloya', 'Brisas del Carrizal', 'Parque Tabasco', 'Flores del Trópico', 'La Selva', 'Club Campestre', 'Giraldas', 'Real de Minas', 'Bosques de Villahermosa', 'Heriberto Kehoe Vicent', 'José María Pino Suárez Norte', 'El Cedro', 'Anacleto Canabal 3ra', 'Nueva Villa de los Trabajadores'],
  },
  {
    id: 'miguel-hidalgo',
    nombre: 'Miguel Hidalgo',
    colonias: ['Miguel Hidalgo I', 'Invitab Miguel Hidalgo', 'Islas del Mundo', 'José Pagés Llergo', 'Carlos Alberto Madrazo Becerra', 'Santa Elena', 'El Olimpo', 'Palma Real', 'Real del Valle', 'Bonampak', 'Estrellas de Buenavista', 'Anacleto Canabal 1ra', 'Río Viejo 1ra'],
  },
];

// --- OpenStreetMap ----------------------------------------------------------

interface PuntoOsm {
  lat: number;
  lon: number;
}
interface ElementoOsm {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: PuntoOsm;
  tags?: Record<string, string>;
  geometry?: PuntoOsm[];
  members?: { type: string; role: string; geometry?: PuntoOsm[] }[];
}

const SERVIDORES = ['https://overpass-api.de/api/interpreter', 'https://lz4.overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

async function bajar(nombre: string, consulta: string): Promise<ElementoOsm[]> {
  const archivo = join(CACHE, `${nombre}.json`);
  if (!existsSync(archivo)) {
    mkdirSync(CACHE, { recursive: true });
    let texto = '';
    for (let intento = 0; intento < 8 && !texto.startsWith('{'); intento++) {
      const servidor = SERVIDORES[intento % SERVIDORES.length];
      console.log(`Bajando ${nombre} de ${servidor}…`);
      const r = await fetch(servidor, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'hazlocash-mapa-generador/1.0' },
        body: new URLSearchParams({ data: consulta }),
      });
      texto = await r.text();
      if (!texto.startsWith('{')) await new Promise((listo) => setTimeout(listo, 8000 * (intento + 1)));
    }
    if (!texto.startsWith('{')) throw new Error(`No se pudo bajar ${nombre}: los servidores de Overpass están ocupados.`);
    writeFileSync(archivo, texto);
  }
  const datos = JSON.parse(readFileSync(archivo, 'utf8')) as { elements: ElementoOsm[] };
  return datos.elements;
}

// --- Geometría --------------------------------------------------------------

type P = [number, number];

const proyectar = (p: PuntoOsm): P => [(p.lon - OESTE) * KX, (NORTE - p.lat) * KY];

function douglasPeucker(puntos: P[], tolerancia: number): P[] {
  if (puntos.length < 3) return puntos;
  const conservar = new Array<boolean>(puntos.length).fill(false);
  conservar[0] = true;
  conservar[puntos.length - 1] = true;
  const pila: [number, number][] = [[0, puntos.length - 1]];
  while (pila.length > 0) {
    const [a, b] = pila.pop() as [number, number];
    const [ax, ay] = puntos[a];
    const [bx, by] = puntos[b];
    const dx = bx - ax;
    const dy = by - ay;
    const largo = Math.hypot(dx, dy) || 1;
    let mayor = -1;
    let cual = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (puntos[i][0] - ax) - dx * (puntos[i][1] - ay)) / largo;
      if (d > mayor) {
        mayor = d;
        cual = i;
      }
    }
    if (mayor > tolerancia) {
      conservar[cual] = true;
      pila.push([a, cual], [cual, b]);
    }
  }
  return puntos.filter((_, i) => conservar[i]);
}

// Un anillo empieza y acaba en el mismo punto: Douglas-Peucker lo colapsaría.
// Se parte en el punto más lejano y se simplifica cada mitad.
function simplificarAnillo(anillo: P[], tolerancia: number): P[] {
  let lejos = 0;
  let mayor = -1;
  anillo.forEach(([x, y], i) => {
    const d = Math.hypot(x - anillo[0][0], y - anillo[0][1]);
    if (d > mayor) {
      mayor = d;
      lejos = i;
    }
  });
  if (lejos === 0) return [];
  const ida = douglasPeucker(anillo.slice(0, lejos + 1), tolerancia);
  const vuelta = douglasPeucker(anillo.slice(lejos), tolerancia);
  return [...ida.slice(0, -1), ...vuelta.slice(0, -1)];
}

const adentro = ([x, y]: P, margen = 30) => x > -margen && y > -margen && x < ANCHO + margen && y < ALTO + margen;

/** Corta una línea donde sale del lienzo: lo de afuera solo pesa. */
function recortar(linea: P[]): P[][] {
  const tramos: P[][] = [];
  let actual: P[] = [];
  linea.forEach((p, i) => {
    if (adentro(p) || (i > 0 && adentro(linea[i - 1])) || (i < linea.length - 1 && adentro(linea[i + 1]))) actual.push(p);
    else if (actual.length > 0) {
      tramos.push(actual);
      actual = [];
    }
  });
  if (actual.length > 1) tramos.push(actual);
  return tramos;
}

function area(anillo: P[]): number {
  let suma = 0;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) suma += anillo[j][0] * anillo[i][1] - anillo[i][0] * anillo[j][1];
  return suma / 2;
}

// Número compacto en décimas de unidad: 12 → "1.2", -3 → "-.3", 0 → "0".
function num(decimas: number): string {
  if (decimas === 0) return '0';
  const signo = decimas < 0 ? '-' : '';
  const abs = Math.abs(decimas);
  const entero = Math.floor(abs / 10);
  const dec = abs % 10;
  return `${signo}${entero === 0 ? '' : entero}${dec === 0 ? '' : `.${dec}`}`;
}

/** Path de SVG con coordenadas relativas a 0.1 unidades: pesa la mitad. */
function pathDe(lineas: P[][], cerrar: boolean): string {
  let salida = '';
  let cx = 0;
  let cy = 0;
  const par = (a: string, b: string) => (b.startsWith('-') ? `${a}${b}` : `${a} ${b}`);
  for (const linea of lineas) {
    let primero = true;
    let cuerpo = '';
    for (const [x, y] of linea) {
      const X = Math.round(x * 10);
      const Y = Math.round(y * 10);
      const dx = X - cx;
      const dy = Y - cy;
      if (primero) salida += `m${par(num(dx), num(dy))}`;
      else if (dx !== 0 || dy !== 0) {
        const trozo = par(num(dx), num(dy));
        cuerpo += cuerpo === '' || trozo.startsWith('-') ? trozo : ` ${trozo}`;
      }
      cx = X;
      cy = Y;
      primero = false;
    }
    if (cuerpo) salida += `l${cuerpo}`;
    if (cerrar) {
      salida += 'z';
      // Tras `z` el punto actual vuelve al inicio del subpath.
      cx = Math.round(linea[0][0] * 10);
      cy = Math.round(linea[0][1] * 10);
    }
  }
  return salida;
}

/** Une los tramos de una relación en anillos cerrados. */
function unirAnillos(tramos: P[][]): P[][] {
  const clave = (p: P) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
  const restantes = tramos.map((t) => [...t]);
  const anillos: P[][] = [];
  while (restantes.length > 0) {
    const anillo = restantes.pop() as P[];
    let creció = true;
    while (creció && clave(anillo[0]) !== clave(anillo[anillo.length - 1])) {
      creció = false;
      for (let i = 0; i < restantes.length; i++) {
        const t = restantes[i];
        const fin = clave(anillo[anillo.length - 1]);
        if (clave(t[0]) === fin) anillo.push(...t.slice(1));
        else if (clave(t[t.length - 1]) === fin) anillo.push(...[...t].reverse().slice(1));
        else continue;
        restantes.splice(i, 1);
        creció = true;
        break;
      }
    }
    if (anillo.length >= 4) anillos.push(anillo);
  }
  return anillos;
}

function anillosDe(e: ElementoOsm): P[][] {
  if (e.type === 'way') return e.geometry && e.geometry.length >= 4 ? [e.geometry.map(proyectar)] : [];
  const tramos = (e.members ?? []).filter((m) => m.type === 'way' && m.geometry).map((m) => (m.geometry as PuntoOsm[]).map(proyectar));
  return unirAnillos(tramos);
}

// --- Rejilla ----------------------------------------------------------------

const indice = (c: number, f: number) => f * COLS + c;
const celdaDe = ([x, y]: P): [number, number] => [Math.floor(x / CELDA), Math.floor(y / CELDA)];

function marcarAnillo(mascara: Uint8Array, anillo: P[]) {
  const ys = anillo.map((p) => p[1]);
  const f0 = Math.max(0, Math.floor(Math.min(...ys) / CELDA));
  const f1 = Math.min(FILAS - 1, Math.ceil(Math.max(...ys) / CELDA));
  for (let f = f0; f <= f1; f++) {
    const y = (f + 0.5) * CELDA;
    const cruces: number[] = [];
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      const [ax, ay] = anillo[j];
      const [bx, by] = anillo[i];
      if (ay <= y !== by <= y) cruces.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
    }
    cruces.sort((a, b) => a - b);
    for (let k = 0; k + 1 < cruces.length; k += 2) {
      const c0 = Math.max(0, Math.ceil(cruces[k] / CELDA - 0.5));
      const c1 = Math.min(COLS - 1, Math.floor(cruces[k + 1] / CELDA - 0.5));
      for (let c = c0; c <= c1; c++) mascara[indice(c, f)] = 1;
    }
  }
}

function marcarLinea(mascara: Uint8Array, linea: P[], radio: number) {
  for (let i = 0; i + 1 < linea.length; i++) {
    const [ax, ay] = linea[i];
    const [bx, by] = linea[i + 1];
    const pasos = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / (CELDA / 2)));
    for (let k = 0; k <= pasos; k++) {
      const x = ax + ((bx - ax) * k) / pasos;
      const y = ay + ((by - ay) * k) / pasos;
      const [c0, f0] = celdaDe([x, y]);
      for (let f = f0 - radio; f <= f0 + radio; f++) {
        for (let c = c0 - radio; c <= c0 + radio; c++) {
          if (c >= 0 && f >= 0 && c < COLS && f < FILAS && (c - c0) ** 2 + (f - f0) ** 2 <= radio * radio + 0.5) mascara[indice(c, f)] = 1;
        }
      }
    }
  }
}

function dilatar(mascara: Uint8Array, veces: number): Uint8Array {
  let actual = mascara;
  for (let v = 0; v < veces; v++) {
    const nueva = actual.slice();
    for (let f = 0; f < FILAS; f++) {
      for (let c = 0; c < COLS; c++) {
        if (!actual[indice(c, f)]) continue;
        if (c > 0) nueva[indice(c - 1, f)] = 1;
        if (c < COLS - 1) nueva[indice(c + 1, f)] = 1;
        if (f > 0) nueva[indice(c, f - 1)] = 1;
        if (f < FILAS - 1) nueva[indice(c, f + 1)] = 1;
      }
    }
    actual = nueva;
  }
  return actual;
}

const invertir = (m: Uint8Array) => m.map((v) => (v ? 0 : 1));
const erosionar = (m: Uint8Array, veces: number) => invertir(dilatar(invertir(m), veces));

/** Lo que no se puede alcanzar desde la orilla del lienzo es un hueco: se rellena. */
function rellenarHuecos(mascara: Uint8Array): Uint8Array {
  const afuera = new Uint8Array(COLS * FILAS);
  const pila: number[] = [];
  const meter = (c: number, f: number) => {
    if (c < 0 || f < 0 || c >= COLS || f >= FILAS) return;
    const i = indice(c, f);
    if (mascara[i] || afuera[i]) return;
    afuera[i] = 1;
    pila.push(i);
  };
  for (let c = 0; c < COLS; c++) {
    meter(c, 0);
    meter(c, FILAS - 1);
  }
  for (let f = 0; f < FILAS; f++) {
    meter(0, f);
    meter(COLS - 1, f);
  }
  while (pila.length > 0) {
    const i = pila.pop() as number;
    const c = i % COLS;
    const f = (i - c) / COLS;
    meter(c + 1, f);
    meter(c - 1, f);
    meter(c, f + 1);
    meter(c, f - 1);
  }
  return afuera.map((v) => (v ? 0 : 1));
}

/** Reparto: Dijkstra con varias fuentes, sin pasar por las celdas prohibidas. */
function repartir(permitido: Uint8Array, semillas: [number, number][], maximo: number): Int16Array {
  const etiqueta = new Int16Array(COLS * FILAS).fill(-1);
  const dist = new Float32Array(COLS * FILAS).fill(Infinity);
  const monton: [number, number, number][] = [];
  const subir = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (monton[p][0] <= monton[i][0]) break;
      [monton[p], monton[i]] = [monton[i], monton[p]];
      i = p;
    }
  };
  const bajarMonton = () => {
    let i = 0;
    for (;;) {
      const a = i * 2 + 1;
      const b = a + 1;
      let m = i;
      if (a < monton.length && monton[a][0] < monton[m][0]) m = a;
      if (b < monton.length && monton[b][0] < monton[m][0]) m = b;
      if (m === i) return;
      [monton[m], monton[i]] = [monton[i], monton[m]];
      i = m;
    }
  };
  const meter = (d: number, celda: number, quien: number) => {
    monton.push([d, celda, quien]);
    subir(monton.length - 1);
  };

  semillas.forEach(([c, f], quien) => {
    // La semilla puede caer en un parque o en la laguna: busca la celda útil más cercana.
    let mejor = -1;
    let mejorD = Infinity;
    for (let df = -14; df <= 14; df++) {
      for (let dc = -14; dc <= 14; dc++) {
        const nc = c + dc;
        const nf = f + df;
        if (nc < 0 || nf < 0 || nc >= COLS || nf >= FILAS || !permitido[indice(nc, nf)]) continue;
        const d = dc * dc + df * df;
        if (d < mejorD) {
          mejorD = d;
          mejor = indice(nc, nf);
        }
      }
    }
    if (mejor >= 0) meter(0, mejor, quien);
  });

  while (monton.length > 0) {
    const [d, celda, quien] = monton[0];
    const ultimo = monton.pop() as [number, number, number];
    if (monton.length > 0) {
      monton[0] = ultimo;
      bajarMonton();
    }
    if (etiqueta[celda] !== -1) continue;
    etiqueta[celda] = quien;
    dist[celda] = d;
    const c = celda % COLS;
    const f = (celda - c) / COLS;
    for (let df = -1; df <= 1; df++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dc === 0 && df === 0) continue;
        const nc = c + dc;
        const nf = f + df;
        if (nc < 0 || nf < 0 || nc >= COLS || nf >= FILAS) continue;
        const ni = indice(nc, nf);
        if (!permitido[ni] || etiqueta[ni] !== -1) continue;
        const nd = d + (dc !== 0 && df !== 0 ? 1.414 : 1);
        if (nd <= maximo) meter(nd, ni, quien);
      }
    }
  }
  return etiqueta;
}

/** Filtro de mayoría: quita los dientes de las fronteras entre colonias. */
function suavizarEtiquetas(etiqueta: Int16Array, veces: number): Int16Array {
  let actual = etiqueta;
  for (let v = 0; v < veces; v++) {
    const nueva = actual.slice();
    for (let f = 1; f < FILAS - 1; f++) {
      for (let c = 1; c < COLS - 1; c++) {
        const cuenta = new Map<number, number>();
        for (let df = -1; df <= 1; df++) for (let dc = -1; dc <= 1; dc++) {
          const l = actual[indice(c + dc, f + df)];
          cuenta.set(l, (cuenta.get(l) ?? 0) + 1);
        }
        let mejor = actual[indice(c, f)];
        let veces2 = cuenta.get(mejor) ?? 0;
        for (const [l, n] of cuenta) if (n > veces2) [mejor, veces2] = [l, n];
        nueva[indice(c, f)] = mejor;
      }
    }
    actual = nueva;
  }
  return actual;
}

// --- Fronteras --------------------------------------------------------------

// Vértices de la rejilla. Los anillos de dos zonas vecinas pasan por los mismos
// vértices, y por eso, al suavizarlos, sus fronteras siguen coincidiendo.
const vertice = (c: number, f: number) => f * (COLS + 1) + c;

class Fronteras {
  vecinos = new Map<number, Set<number>>();
  x = new Map<number, number>();
  y = new Map<number, number>();
  conservar = new Set<number>();

  constructor(etiqueta: Int16Array) {
    const unir = (a: number, b: number) => {
      if (!this.vecinos.has(a)) this.vecinos.set(a, new Set());
      if (!this.vecinos.has(b)) this.vecinos.set(b, new Set());
      (this.vecinos.get(a) as Set<number>).add(b);
      (this.vecinos.get(b) as Set<number>).add(a);
    };
    const en = (c: number, f: number) => (c < 0 || f < 0 || c >= COLS || f >= FILAS ? -1 : etiqueta[indice(c, f)]);
    for (let f = 0; f <= FILAS; f++) {
      for (let c = 0; c <= COLS; c++) {
        if (en(c, f) !== en(c, f - 1)) unir(vertice(c, f), vertice(c + 1, f));
        if (en(c, f) !== en(c - 1, f)) unir(vertice(c, f), vertice(c, f + 1));
      }
    }
    for (const v of this.vecinos.keys()) {
      const c = v % (COLS + 1);
      this.x.set(v, c * CELDA);
      this.y.set(v, ((v - c) / (COLS + 1)) * CELDA);
    }
    this.suavizar(12);
    this.elegirVertices(3);
  }

  private suavizar(veces: number) {
    for (let v = 0; v < veces; v++) {
      const nx = new Map<number, number>();
      const ny = new Map<number, number>();
      for (const [i, vs] of this.vecinos) {
        if (vs.size !== 2) continue; // los cruces de tres zonas no se mueven
        const [a, b] = [...vs];
        nx.set(i, 0.5 * (this.x.get(i) as number) + 0.25 * ((this.x.get(a) as number) + (this.x.get(b) as number)));
        ny.set(i, 0.5 * (this.y.get(i) as number) + 0.25 * ((this.y.get(a) as number) + (this.y.get(b) as number)));
      }
      for (const [i, n] of nx) this.x.set(i, n);
      for (const [i, n] of ny) this.y.set(i, n);
    }
  }

  // Recorre cada tramo una sola vez y deja un vértice de cada `paso`: la
  // decisión es por vértice, así las dos zonas de una frontera ven los mismos.
  private elegirVertices(paso: number) {
    const visto = new Set<string>();
    const arista = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
    const caminar = (inicio: number, siguiente: number) => {
      let prev = inicio;
      let v = siguiente;
      let n = 1;
      while (!visto.has(arista(prev, v))) {
        visto.add(arista(prev, v));
        const vs = this.vecinos.get(v) as Set<number>;
        if (vs.size !== 2) return;
        if (n % paso === 0) this.conservar.add(v);
        n++;
        const [a, b] = [...vs];
        const proximo = a === prev ? b : a;
        prev = v;
        v = proximo;
      }
    };
    for (const [v, vs] of this.vecinos) {
      if (vs.size === 2) continue;
      this.conservar.add(v);
      for (const w of vs) caminar(v, w);
    }
    // Lazos sin cruces (una colonia aislada, una isla).
    for (const [v, vs] of this.vecinos) {
      if (vs.size !== 2) continue;
      const [a] = [...vs];
      if (visto.has(arista(v, a))) continue;
      this.conservar.add(v);
      caminar(v, a);
    }
  }

  /** Anillos de una región, con los vértices ya suavizados. */
  anillos(dentro: (c: number, f: number) => boolean, areaMinima: number): number[][] {
    // Aristas dirigidas con la región a la derecha; con eso, los huecos quedan al revés.
    const salen = new Map<number, number[]>();
    const agregar = (a: number, b: number) => {
      const lista = salen.get(a);
      if (lista) lista.push(b);
      else salen.set(a, [b]);
    };
    for (let f = 0; f < FILAS; f++) {
      for (let c = 0; c < COLS; c++) {
        if (!dentro(c, f)) continue;
        if (!(f > 0 && dentro(c, f - 1))) agregar(vertice(c, f), vertice(c + 1, f));
        if (!(c < COLS - 1 && dentro(c + 1, f))) agregar(vertice(c + 1, f), vertice(c + 1, f + 1));
        if (!(f < FILAS - 1 && dentro(c, f + 1))) agregar(vertice(c + 1, f + 1), vertice(c, f + 1));
        if (!(c > 0 && dentro(c - 1, f))) agregar(vertice(c, f + 1), vertice(c, f));
      }
    }
    const salida: number[][] = [];
    for (const inicio of [...salen.keys()]) {
      while ((salen.get(inicio)?.length ?? 0) > 0) {
        const lazo: number[] = [inicio];
        let v = (salen.get(inicio) as number[]).pop() as number;
        while (v !== inicio) {
          lazo.push(v);
          const opciones = salen.get(v);
          if (!opciones || opciones.length === 0) break;
          v = opciones.pop() as number;
        }
        let puntos = lazo.filter((w) => this.conservar.has(w));
        if (puntos.length < 3) puntos = lazo;
        const anillo: P[] = puntos.map((w) => [this.x.get(w) as number, this.y.get(w) as number]);
        if (Math.abs(area(anillo)) < areaMinima) continue;
        salida.push(anillo.flatMap(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]));
      }
    }
    return salida;
  }
}

/** El punto de la región más lejos de su orilla: ahí va la etiqueta. */
function centroVisual(dentro: (c: number, f: number) => boolean): P {
  const dist = new Int16Array(COLS * FILAS).fill(-1);
  let frente: number[] = [];
  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLS; c++) {
      if (!dentro(c, f)) {
        dist[indice(c, f)] = 0;
        frente.push(indice(c, f));
      }
    }
  }
  let ultimo = -1;
  while (frente.length > 0) {
    const nuevo: number[] = [];
    for (const i of frente) {
      const c = i % COLS;
      const f = (i - c) / COLS;
      for (const [dc, df] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc;
        const nf = f + df;
        if (nc < 0 || nf < 0 || nc >= COLS || nf >= FILAS) continue;
        const ni = indice(nc, nf);
        if (dist[ni] !== -1) continue;
        dist[ni] = dist[i] + 1;
        nuevo.push(ni);
        ultimo = ni;
      }
    }
    frente = nuevo;
  }
  const c = ultimo % COLS;
  const f = (ultimo - c) / COLS;
  return [Math.round((c + 0.5) * CELDA * 10) / 10, Math.round((f + 0.5) * CELDA * 10) / 10];
}

// --- Colonias ---------------------------------------------------------------

interface Colonia {
  id: string;
  nombre: string;
  tipo: string;
  sector: string;
  x: number;
  y: number;
}

const slug = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function limpiarNombre(crudo: string, lat: number): { nombre: string; tipo: string } {
  let nombre = crudo;
  let tipo = 'Colonia';
  const prefijos: [RegExp, string][] = [
    [/^Colonia /, 'Colonia'],
    [/^Fraccionamiento /, 'Fraccionamiento'],
    [/^Unidad Habitacional /, 'Unidad habitacional'],
  ];
  for (const [re, t] of prefijos) {
    if (re.test(nombre)) {
      nombre = nombre.replace(re, '');
      tipo = t;
    }
  }
  nombre = nombre
    .replace(/^del Bosque$/, 'Del Bosque')
    .replace(/ Primera Sección$/, ' 1ra')
    .replace(/ 1ra Sección$/, ' 1ra')
    .replace(/ 2da Sección$/, ' 2da')
    .replace(/ Tercera Sección$/, ' 3ra')
    .replace(/^Privada /, '')
    .replace(/^Gaviotas Norte Sector Explanada$/, 'Explanada')
    .replace(/^Gaviotas Norte Sector Popular$/, 'Gaviotas Popular')
    .replace(/^Gaviotas Sur Sector /, '');
  if (crudo === 'Fraccionamiento Carrizal') nombre = 'Fracc. Carrizal';
  if (nombre === 'José María Pino Suárez' && lat > 18) nombre = 'José María Pino Suárez Norte';
  return { nombre, tipo };
}

// --- Principal --------------------------------------------------------------

async function principal() {
  const lugares = await bajar(
    'lugares',
    `[out:json][timeout:90];(node["place"~"^(suburb|neighbourhood|quarter|village)$"](${ENCUADRE});relation["place"="neighbourhood"](${ENCUADRE});way["place"="neighbourhood"](${ENCUADRE}););out center tags;`,
  );
  const calles = await bajar(
    'calles',
    `[out:json][timeout:170];(way["highway"~"^(motorway|trunk|primary|secondary|motorway_link|trunk_link|primary_link)$"](${ENCUADRE});way["highway"~"^(tertiary|residential|unclassified|living_street)$"](${CIUDAD}););out geom tags;`,
  );
  const agua = await bajar(
    'agua',
    `[out:json][timeout:170];(way["natural"="water"](${ENCUADRE});relation["natural"="water"](${ENCUADRE});way["waterway"~"^(river|canal)$"](${ENCUADRE});way["leisure"~"^(park|golf_course)$"](${ENCUADRE});relation["leisure"~"^(park|golf_course)$"](${ENCUADRE});way["landuse"~"^(forest|recreation_ground)$"](${ENCUADRE});way["natural"~"^(wetland|grassland)$"](${ENCUADRE});relation["natural"="wetland"](${ENCUADRE}););out geom;`,
  );

  // Calles, de la menor a la mayor.
  const claseDe: Record<string, string> = {
    motorway: 'troncal', motorway_link: 'troncal', trunk: 'troncal', trunk_link: 'troncal',
    primary: 'primaria', primary_link: 'primaria',
    secondary: 'secundaria',
    tertiary: 'terciaria',
    residential: 'local', unclassified: 'local', living_street: 'local',
  };
  const lineas: Record<string, P[][]> = { troncal: [], primaria: [], secundaria: [], terciaria: [], local: [] };
  const paraMancha = new Uint8Array(COLS * FILAS);
  for (const e of calles) {
    if (e.type !== 'way' || !e.geometry || !e.tags) continue;
    const clase = claseDe[e.tags.highway];
    if (!clase) continue;
    const crudo = e.geometry.map(proyectar);
    if (clase === 'local' || clase === 'terciaria') marcarLinea(paraMancha, crudo, 0);
    for (const tramo of recortar(crudo)) {
      const linea = douglasPeucker(tramo, clase === 'local' ? 0.45 : 0.3);
      if (clase === 'local' && Math.hypot(linea[0][0] - linea[linea.length - 1][0], linea[0][1] - linea[linea.length - 1][1]) < 1.5) continue;
      lineas[clase].push(linea);
    }
  }

  // Agua y verde.
  const aguaPoligonos: P[][] = [];
  const verdePoligonos: P[][] = [];
  const rios: Record<string, P[][]> = { grueso: [], medio: [], fino: [] };
  const paredes = new Uint8Array(COLS * FILAS);
  const etiquetasAgua: { nombre: string; x: number; y: number }[] = [];
  const buscados: Record<string, string> = { 'Laguna De Las Ilusiones': 'Laguna de las Ilusiones', 'Laguna del Espejo': 'Laguna del Espejo', 'Laguna del Negro': 'Laguna del Negro' };
  const yaEtiquetada = new Set<string>();

  for (const e of agua) {
    const t = e.tags ?? {};
    if (t.waterway && e.type === 'way' && e.geometry) {
      const crudo = e.geometry.map(proyectar);
      const nombre = t.name ?? '';
      const clase = /Grijalva/.test(nombre) ? 'grueso' : /Carrizal|La Sierra|Viejo Mezcalapa/.test(nombre) ? 'medio' : 'fino';
      if (clase === 'grueso') marcarLinea(paredes, crudo, 2);
      if (clase === 'medio') marcarLinea(paredes, crudo, 1);
      for (const tramo of recortar(crudo)) rios[clase].push(douglasPeucker(tramo, 0.5));
      continue;
    }
    const anillos = anillosDe(e);
    if (anillos.length === 0) continue;
    const esAgua = t.natural === 'water';
    for (const anillo of anillos) {
      const a = Math.abs(area(anillo));
      if (!anillo.some((p) => adentro(p, 60))) continue;
      if (a < (esAgua ? 4 : 5)) continue;
      const simple = simplificarAnillo(anillo, esAgua ? 0.45 : 0.6);
      if (simple.length < 3) continue;
      (esAgua ? aguaPoligonos : verdePoligonos).push(simple);
      if (esAgua && a > 40) marcarAnillo(paredes, anillo);
    }
    const nombreEtiqueta = t.name ? buscados[t.name] : undefined;
    if (nombreEtiqueta && !yaEtiquetada.has(nombreEtiqueta)) {
      yaEtiquetada.add(nombreEtiqueta);
      const mayor = [...anillos].sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)))[0];
      etiquetasAgua.push({
        nombre: nombreEtiqueta,
        x: Math.round((mayor.reduce((s, p) => s + p[0], 0) / mayor.length) * 10) / 10,
        y: Math.round((mayor.reduce((s, p) => s + p[1], 0) / mayor.length) * 10) / 10,
      });
    }
  }
  for (const [nombre, lat, lon] of [['Río Grijalva', 18.0235, -92.9125], ['Río Carrizal', 18.0125, -92.9815], ['Río La Sierra', 17.9545, -92.9185]] as const) {
    const [x, y] = proyectar({ lat, lon });
    etiquetasAgua.push({ nombre, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  // Colonias.
  const sectorDe = new Map<string, string>();
  for (const s of SECTORES) for (const c of s.colonias) sectorDe.set(c, s.id);
  const excluidas = new Set(['El Cedro@v', 'Saloya Segunda Sección']);
  const colonias: Colonia[] = [];
  const vistas = new Set<string>();
  const sinSector: string[] = [];
  const nombres = [...lugares].sort((a, b) => (a.type === 'node' ? -1 : 1) - (b.type === 'node' ? -1 : 1));
  for (const e of nombres) {
    const crudo = e.tags?.name;
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    if (!crudo || lat === undefined || lon === undefined) continue;
    if (excluidas.has(crudo) || (e.tags?.place === 'village' && crudo === 'El Cedro')) continue;
    const { nombre, tipo } = limpiarNombre(crudo, lat);
    if (vistas.has(nombre)) continue;
    vistas.add(nombre);
    const sector = sectorDe.get(nombre);
    if (!sector) {
      sinSector.push(nombre);
      continue;
    }
    const [x, y] = proyectar({ lat, lon });
    colonias.push({ id: slug(nombre), nombre, tipo, sector, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }
  if (sinSector.length > 0) console.warn('Colonias sin sector (se omiten):', sinSector.join(', '));
  for (const s of SECTORES) {
    for (const c of s.colonias) if (!vistas.has(c)) console.warn(`En el sector ${s.nombre} sobra «${c}»: no viene en OSM.`);
  }

  // Mancha urbana: cerca de las calles, sin tiras sueltas de carretera y sin agua.
  let mancha = dilatar(paraMancha, 5);
  mancha = erosionar(mancha, 3); // cierra huecos entre manzanas
  mancha = dilatar(erosionar(mancha, 3), 3); // quita tiras sueltas de carretera
  mancha = rellenarHuecos(mancha);
  const permitido = mancha.map((v, i) => (v && !paredes[i] ? 1 : 0));

  const semillas = colonias.map((c) => celdaDe([c.x, c.y]));
  let etiqueta = repartir(permitido, semillas, 32);
  etiqueta = suavizarEtiquetas(etiqueta, 2);

  const fronteras = new Fronteras(etiqueta);
  const coloniaDe = (c: number, f: number) => etiqueta[indice(c, f)];
  const sectorIndice = new Map(SECTORES.map((s, i) => [s.id, i]));
  const sectorDeColonia = colonias.map((c) => sectorIndice.get(c.sector) as number);
  const sectorEn = (c: number, f: number) => {
    const l = coloniaDe(c, f);
    return l < 0 ? -1 : sectorDeColonia[l];
  };

  const salidaColonias = colonias.map((c, i) => ({ ...c, anillos: fronteras.anillos((col, f) => coloniaDe(col, f) === i, 12) }));
  const salidaSectores = SECTORES.map((s, i) => {
    const dentro = (c: number, f: number) => sectorEn(c, f) === i;
    const [x, y] = centroVisual(dentro);
    return { id: s.id, nombre: s.nombre, x, y, anillos: fronteras.anillos(dentro, 30) };
  });

  const capas = {
    local: pathDe(lineas.local, false),
    terciaria: pathDe(lineas.terciaria, false),
    secundaria: pathDe(lineas.secundaria, false),
    primaria: pathDe(lineas.primaria, false),
    troncal: pathDe(lineas.troncal, false),
    agua: pathDe(aguaPoligonos, true),
    verde: pathDe(verdePoligonos, true),
    rioGrueso: pathDe(rios.grueso, false),
    rioMedio: pathDe(rios.medio, false),
    rioFino: pathDe(rios.fino, false),
  };

  const contenido = `// GENERADO por scripts/generar-mapa.ts. No se edita a mano: los sectores se
// cambian en ese script. Datos © colaboradores de OpenStreetMap (ODbL).
import type { CapasMapa, ColoniaGeo, EtiquetaGeo, SectorGeo } from './tipos';

export const ANCHO_MAPA = ${ANCHO};
export const ALTO_MAPA = ${ALTO};

export const CAPAS: CapasMapa = ${JSON.stringify(capas)};

export const ETIQUETAS_AGUA: EtiquetaGeo[] = ${JSON.stringify(etiquetasAgua)};

export const SECTORES: SectorGeo[] = ${JSON.stringify(salidaSectores)};

export const COLONIAS: ColoniaGeo[] = ${JSON.stringify(salidaColonias)};
`;
  mkdirSync(dirname(SALIDA), { recursive: true });
  writeFileSync(SALIDA, contenido);

  console.log(`Lienzo ${ANCHO}×${ALTO}, ${colonias.length} colonias en ${SECTORES.length} sectores.`);
  for (const s of salidaSectores) console.log(`  ${s.nombre}: ${colonias.filter((c) => c.sector === s.id).length} colonias, ${s.anillos.length} anillo(s)`);
  for (const [k, v] of Object.entries(capas)) console.log(`  capa ${k}: ${(v.length / 1024).toFixed(0)} KB`);
  console.log(`Archivo: ${(contenido.length / 1024).toFixed(0)} KB`);
}

await principal();
