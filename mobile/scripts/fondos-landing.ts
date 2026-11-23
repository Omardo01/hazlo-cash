/// <reference types="node" />
/**
 * Genera las imágenes del landing (assets/images/landing/*.webp) con el trazo
 * real de Villahermosa que ya está en src/hazlo/mapa/geometria.ts. Van como
 * imagen porque miles de puntos de luz en SVG pesan demasiado en el teléfono, y
 * por capas para poder animarlas.
 *
 *   cd mobile && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/fondos-landing.ts
 *
 * Necesita Google Chrome y cwebp (brew install webp).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { Geometria } from '../src/hazlo/mapa/tipos';

const { CAPAS } = (await import(new URL('../src/hazlo/mapa/geometria.ts', import.meta.url).href)) as Geometria;

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(RAIZ, 'assets', 'images', 'landing');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ANCHO = 440;
const ALTO = 940;
const ESCALA = 2.25;
// Qué parte de la ciudad: el centro y el Grijalva, en unidades del lienzo.
const ZOOM = 2.35;
const CENTRO = { x: 522, y: 520 };
const MOVER = `translate(${ANCHO / 2 - CENTRO.x * ZOOM} ${ALTO / 2 - CENTRO.y * ZOOM}) scale(${ZOOM})`;

/** Del agua, solo los ríos: las lagunas recortadas ensucian el dibujo. Son los dos contornos con más puntos. */
function rios(): string {
  const trozos: string[] = [];
  let x = 0;
  let y = 0;
  let ox = 0;
  let oy = 0;
  let puntos: string[] = [];
  const cerrar = () => {
    if (puntos.length) trozos.push(`M${puntos.join(' ')}Z`);
    puntos = [];
  };
  let orden = 'm';
  const fichas = CAPAS.agua.match(/[a-z]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  for (let i = 0; i < fichas.length; ) {
    if (/[a-z]/.test(fichas[i])) {
      orden = fichas[i++];
      if (orden === 'z') [x, y] = [ox, oy];
      continue;
    }
    x += Number(fichas[i]);
    y += Number(fichas[i + 1]);
    i += 2;
    if (orden === 'm') {
      cerrar();
      [ox, oy] = [x, y];
      orden = 'l';
    }
    puntos.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  cerrar();
  const coordenadas = (t: string) => t.slice(1, -1).split(' ').map(Number);
  // El contorno con más puntos es el Carrizal y lo que sigue; el del Grijalva en
  // el centro es el único alto que pasa junto al malecón.
  const mayor = trozos.reduce((m, t) => (t.length > m.length ? t : m), '');
  const grijalva = trozos.filter((t) => {
    const n = coordenadas(t);
    const ys = n.filter((_, i) => i % 2 === 1);
    const malecon = ys.some((py, i) => py > 540 && py < 620 && n[i * 2] > 550 && n[i * 2] < 610);
    return t !== mayor && malecon && Math.max(...ys) - Math.min(...ys) > 300;
  });
  return mayor + grijalva.join('');
}

const RIO = rios();
const traza = (d: string, estilo: string) => `<path d="${d}" fill="none" ${estilo}/>`;
const luces = (d: string, ancho: number, paso: number, color: string, op = 1) =>
  traza(d, `stroke="${color}" stroke-width="${ancho}" stroke-dasharray="0 ${paso}" stroke-linecap="round" opacity="${op}"`);
const resplandor = (d: string, ancho: number, op: number) => traza(d, `stroke="#FE7801" stroke-width="${ancho}" opacity="${op}"`);
const DESENFOQUE = '<filter id="b" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="7"/></filter>';

const CALLES_NOCHE = `<rect width="${ANCHO}" height="${ALTO}" fill="#0B0A0C"/><g filter="url(#b)"><g transform="${MOVER}">${resplandor(CAPAS.local, 2.2, 0.2)}</g></g><g transform="${MOVER}">${luces(CAPAS.local, 0.62, 2.3, '#FF9A3C', 0.62)}</g>`;
const RIO_NOCHE = `<g transform="${MOVER}"><path d="${RIO}" fill="#0A0F14"/></g>`;

const IMAGENES: { nombre: string; calidad: number; dibujo: string }[] = [
  {
    nombre: 'noche-calles',
    calidad: 62,
    dibujo: `<defs>${DESENFOQUE}</defs>${CALLES_NOCHE}${RIO_NOCHE}`,
  },
  {
    // La misma escena con las avenidas encendidas: se funde sobre la anterior.
    nombre: 'noche-avenidas',
    calidad: 58,
    dibujo: `<defs>${DESENFOQUE}</defs>${CALLES_NOCHE}<g filter="url(#b)"><g transform="${MOVER}">${resplandor(CAPAS.secundaria, 3.2, 0.42)}${resplandor(CAPAS.primaria, 4, 0.5)}${resplandor(CAPAS.troncal, 4.4, 0.55)}</g></g><g transform="${MOVER}">${luces(CAPAS.terciaria, 0.95, 2, '#FFB053', 0.9)}${luces(CAPAS.secundaria, 1.15, 2.1, '#FFC06A', 0.95)}${luces(CAPAS.primaria, 1.35, 2.2, '#FFD08A')}${luces(CAPAS.troncal, 1.5, 2.3, '#FFE0AE')}</g>${RIO_NOCHE}`,
  },
  {
    nombre: 'rio-calles',
    calidad: 72,
    dibujo: `<rect width="${ANCHO}" height="${ALTO}" fill="#fff"/><g transform="${MOVER}">${traza(CAPAS.local, 'stroke="#EFEAE4" stroke-width=".7"')}${traza(CAPAS.terciaria, 'stroke="#E9E2DA" stroke-width="1"')}${traza(CAPAS.secundaria, 'stroke="#E6DED4" stroke-width="1.3"')}${traza(CAPAS.primaria, 'stroke="#E2D9CD" stroke-width="1.6"')}${traza(CAPAS.troncal, 'stroke="#E2D9CD" stroke-width="1.8"')}</g>`,
  },
  {
    nombre: 'rio-agua',
    calidad: 80,
    dibujo: `<defs><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="480" y1="380" x2="600" y2="640"><stop stop-color="#FFC04A"/><stop offset=".5" stop-color="#FE7801"/><stop offset="1" stop-color="#EB4E00"/></linearGradient></defs><g transform="${MOVER}"><path d="${RIO}" fill="url(#a)"/></g>`,
  },
];

mkdirSync(DESTINO, { recursive: true });
const taller = mkdtempSync(join(tmpdir(), 'fondos-landing-'));
try {
  for (const { nombre, calidad, dibujo } of IMAGENES) {
    const html = join(taller, `${nombre}.html`);
    const png = join(taller, `${nombre}.png`);
    const webp = join(DESTINO, `${nombre}.webp`);
    writeFileSync(html, `<!doctype html><style>*{margin:0}svg{display:block}</style><svg width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}" xmlns="http://www.w3.org/2000/svg">${dibujo}</svg>`);
    execFileSync(CHROME, ['--headless=new', `--user-data-dir=${join(taller, 'perfil')}`, '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', `--force-device-scale-factor=${ESCALA}`, `--window-size=${ANCHO},${ALTO}`, '--virtual-time-budget=4000', `--screenshot=${png}`, pathToFileURL(html).href], { stdio: 'ignore' });
    execFileSync('cwebp', ['-quiet', '-q', String(calidad), '-m', '6', png, '-o', webp]);
    console.log(webp);
  }
} finally {
  rmSync(taller, { recursive: true, force: true });
}
