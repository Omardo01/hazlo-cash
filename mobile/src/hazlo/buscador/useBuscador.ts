import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCatalogoPublico } from '@/lib/datos/consultas';
import { leerMiUbicacion, mensajeSinUbicacion } from '@/lib/ubicacion';

import { aLienzo, coloniaEn, contiene, type ZonaBase } from '../mapa/datos';
import { useGeometria } from '../mapa/MiniMapa';
import { armarIndice, buscar, buscarColonias, coloniasDe, etiquetaDe, girosCon, interpretar, ordenar, porNombre, tokensDe, type Indice, type Lugar, type LugarCerca, type Punto, type Resultados } from './motor';

const LLAVE_COLONIA = 'hazlo-mi-colonia';
/** Hasta dónde algo está «cerca». */
const CERCA = 3000;

/**
 * - inicio: nada escrito; lo que hay alrededor.
 * - escribe: lo que se va entendiendo con cada letra.
 * - resultados: ya se eligió qué y/o en qué colonia.
 * - colonia: eligiendo la colonia propia.
 */
export type Fase = 'inicio' | 'escribe' | 'resultados' | 'colonia';

/** Un pin del mapa: con número en los resultados, con el ícono del giro en lo demás. */
export interface PinLugar {
  lugar: Lugar;
  numero?: number;
  /** Fuera de la colonia buscada. */
  fuera: boolean;
}

export interface Pedido {
  que: string;
  /** Cómo se lee en la caja. */
  etiqueta: string;
}

export interface Buscador {
  indice: Indice;
  cargando: boolean;
  error: boolean;
  fase: Fase;
  texto: string;
  escribir: (t: string) => void;
  que: Pedido | null;
  colonia: ZonaBase | null;
  /** Lo que se entiende de lo escrito. */
  entendido: { que: string; etiqueta: string; colonia: ZonaBase | null; /** La que sí escribió. */ escrita: ZonaBase | null };
  fijar: (que: string, colonia: ZonaBase | null, etiqueta?: string) => void;
  quitarQue: () => void;
  quitarColonia: () => void;
  limpiar: () => void;
  resultados: Resultados;
  /** Los más cercanos a donde se parte (o todos, sin punto de partida). */
  cercanos: LugarCerca[];
  giros: { giro: string; lugar: Lugar; total: number }[];
  hayCerca: boolean;
  sugerencias: { giros: { giro: string; lugar: Lugar; total: number }[]; lugares: LugarCerca[]; colonias: { zona: ZonaBase; total: number }[] };
  /** Desde dónde se mide, para decirlo. */
  desdeNombre: string | null;
  base: 'yo' | 'colonia' | null;
  yo: Punto | null;
  miColonia: ZonaBase | null;
  ubicando: boolean;
  fallo: string | null;
  bloqueado: boolean;
  usarUbicacion: () => void;
  elegirColonia: (z: ZonaBase) => void;
  abrirColonias: (abrir: boolean) => void;
  colonias: { zona: ZonaBase; total: number }[];
  /** La colonia pintada en el mapa y los pines que lleva. */
  zona: ZonaBase | null;
  pines: PinLugar[];
  /** Cuántos pines, desde el primero, tienen que caber en el mapa. */
  encuadrar: number;
}

export function useBuscador(abierto: boolean): Buscador {
  // Se piden hasta que alguien toca la caja; luego todo corre en el teléfono.
  const geo = useGeometria(abierto);
  const { datos: negocios, cargando, error } = useCatalogoPublico(abierto);
  const todas = useMemo(() => coloniasDe(geo), [geo]);
  const indice = useMemo(() => armarIndice(geo, todas, negocios ?? []), [geo, todas, negocios]);

  const [texto, setTexto] = useState('');
  const [que, setQue] = useState<Pedido | null>(null);
  const [colonia, setColonia] = useState<ZonaBase | null>(null);
  const [eligiendo, setEligiendo] = useState(false);

  // ── De dónde se parte: la ubicación (si la dio) o su colonia (si la eligió) ──
  const [yo, setYo] = useState<Punto | null>(null);
  const [miColoniaId, setMiColoniaId] = useState<string | null>(null);
  const [base, setBase] = useState<'yo' | 'colonia' | null>(null);
  const [ubicando, setUbicando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    let vivo = true;
    AsyncStorage.getItem(LLAVE_COLONIA)
      .then((id) => {
        if (!vivo || !id) return;
        setMiColoniaId(id);
        setBase((b) => b ?? 'colonia');
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [abierto]);

  const miColonia = useMemo(() => todas.find((c) => c.id === miColoniaId) ?? null, [todas, miColoniaId]);

  const usarUbicacion = useCallback(async () => {
    if (!geo || ubicando) return;
    setFallo(null);
    setBloqueado(false);
    setUbicando(true);
    const r = await leerMiUbicacion();
    setUbicando(false);
    if (!r.ok) {
      setFallo(`${mensajeSinUbicacion(r.motivo)} También puedes elegir tu colonia.`);
      setBloqueado(r.motivo === 'bloqueado');
      return;
    }
    const p = aLienzo(geo, r.lat, r.lng);
    if (p.x < 0 || p.y < 0 || p.x > geo.ANCHO_MAPA || p.y > geo.ALTO_MAPA) {
      setFallo('Estás fuera del mapa de Villahermosa. Elige una colonia para buscar ahí.');
      return;
    }
    setYo(p);
    setBase('yo');
    setColonia(null);
  }, [geo, ubicando]);

  const elegirColonia = useCallback(
    (z: ZonaBase) => {
      setMiColoniaId(z.id);
      setBase('colonia');
      // A media búsqueda, la colonia nueva también cambia dónde se busca.
      setColonia(que ? z : null);
      setEligiendo(false);
      setTexto('');
      setFallo(null);
      AsyncStorage.setItem(LLAVE_COLONIA, z.id).catch(() => {});
    },
    [que],
  );

  const abrirColonias = useCallback((abrir: boolean) => {
    setEligiendo(abrir);
    setTexto('');
    setFallo(null);
  }, []);

  const escribir = useCallback((t: string) => {
    setTexto(t);
    setFallo(null);
  }, []);

  const fijar = useCallback(
    (nuevo: string, zona: ZonaBase | null, etiqueta?: string) => {
      setQue(nuevo.trim() ? { que: nuevo, etiqueta: etiqueta ?? etiquetaDe(indice, nuevo) } : null);
      setColonia(zona);
      setTexto('');
      setEligiendo(false);
    },
    [indice],
  );
  const limpiar = useCallback(() => {
    setQue(null);
    setColonia(null);
    setTexto('');
    setEligiendo(false);
    setFallo(null);
  }, []);
  const quitarQue = useCallback(() => setQue(null), []);
  const quitarColonia = useCallback(() => setColonia(null), []);

  const hayTexto = texto.trim().length > 0;
  const fase: Fase = eligiendo ? 'colonia' : hayTexto ? 'escribe' : que || colonia ? 'resultados' : 'inicio';

  const completo = [que?.que, texto].filter(Boolean).join(' ');
  const entendido = useMemo(() => {
    const i = interpretar(indice, completo, colonia);
    return {
      que: i.que,
      etiqueta: etiquetaDe(indice, i.que, completo),
      // Sin nombrar colonia se busca en la suya (y alrededor).
      colonia: i.colonia ?? (base === 'colonia' ? miColonia : null),
      escrita: i.colonia,
    };
  }, [indice, completo, colonia, base, miColonia]);

  const enfoque = fase === 'resultados' ? { que: que?.que ?? '', colonia } : fase === 'escribe' ? entendido : { que: '', colonia: null };
  const zonaBuscada = enfoque.colonia;

  // Dentro de la colonia buscada se mide desde uno mismo; si no, desde su centro.
  const desde = useMemo<{ punto: Punto; nombre: string } | null>(() => {
    if (zonaBuscada) return yo && contiene(zonaBuscada, yo.x, yo.y) ? { punto: yo, nombre: 'donde estás' } : { punto: { x: zonaBuscada.x, y: zonaBuscada.y }, nombre: zonaBuscada.nombre };
    if (base === 'yo' && yo) return { punto: yo, nombre: 'donde estás' };
    if (base === 'colonia' && miColonia) return { punto: { x: miColonia.x, y: miColonia.y }, nombre: miColonia.nombre };
    return null;
  }, [zonaBuscada, yo, base, miColonia]);

  const resultados = useMemo(() => buscar(indice, enfoque.que, zonaBuscada, desde?.punto ?? null), [indice, enfoque.que, zonaBuscada, desde]);

  const cercanos = useMemo(() => ordenar(indice, indice.lugares.filter((l) => l.punto || !indice.geo), desde?.punto ?? null), [indice, desde]);
  const alrededor = useMemo(() => cercanos.filter((c) => c.metros !== null && c.metros <= CERCA), [cercanos]);
  const hayCerca = alrededor.length >= 3;
  const giros = useMemo(() => girosCon(hayCerca ? { ...indice, lugares: alrededor.map((c) => c.lugar) } : indice, '', 8), [indice, alrededor, hayCerca]);

  const cuentaColonia = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of indice.lugares) if (l.coloniaId) m.set(l.coloniaId, (m.get(l.coloniaId) ?? 0) + 1);
    return m;
  }, [indice]);
  const conTotal = useCallback((zona: ZonaBase) => ({ zona, total: cuentaColonia.get(zona.id) ?? 0 }), [cuentaColonia]);

  const sugerencias = useMemo(() => {
    if (!hayTexto) return { giros: [], lugares: [], colonias: [] };
    const soloQue = entendido.que;
    return {
      giros: soloQue ? girosCon(indice, soloQue, 3) : [],
      lugares: ordenar(indice, porNombre(indice, texto, 4), desde?.punto ?? null),
      // Se busca con lo último escrito: «dentista ata» también propone Atasta.
      colonias: colonia ? [] : buscarColonias(indice.colonias, entendido.escrita ? entendido.escrita.nombre : (tokensDe(texto).at(-1) ?? ''), 3)
            .filter((c) => c === entendido.escrita || (tokensDe(texto).at(-1) ?? '').length >= 3)
            .map(conTotal),
    };
  }, [hayTexto, entendido, indice, texto, colonia, desde, conTotal]);

  const colonias = useMemo(() => {
    if (!eligiendo) return [];
    const lista = hayTexto ? buscarColonias(todas, texto, 20) : [...todas].sort((a, b) => (cuentaColonia.get(b.id) ?? 0) - (cuentaColonia.get(a.id) ?? 0) || a.nombre.localeCompare(b.nombre, 'es', { numeric: true }));
    return lista.map(conTotal);
  }, [eligiendo, hayTexto, texto, todas, cuentaColonia, conTotal]);

  const zona = useMemo(() => {
    if (zonaBuscada) return zonaBuscada;
    if (fase === 'colonia') return hayTexto ? (colonias[0]?.zona ?? null) : null;
    if (base === 'yo' && yo) return coloniaEn(todas, yo.x, yo.y);
    return base === 'colonia' ? miColonia : null;
  }, [zonaBuscada, fase, hayTexto, colonias, base, yo, todas, miColonia]);

  const pines = useMemo<PinLugar[]>(() => {
    if (fase === 'inicio') return cercanos.slice(0, desde ? 10 : 30).filter((c) => c.lugar.punto).map((c) => ({ lugar: c.lugar, fuera: false }));
    if (fase === 'colonia') return [];
    const lista = [...resultados.dentro, ...resultados.fuera].slice(0, 12);
    return lista.map((c, i) => ({ lugar: c.lugar, numero: fase === 'resultados' ? i + 1 : undefined, fuera: !!zonaBuscada && c.lugar.coloniaId !== zonaBuscada.id }));
  }, [fase, cercanos, desde, resultados, zonaBuscada]);

  // Con punto de partida, el mapa se acerca a lo próximo; sin él, enseña todo.
  const encuadrar = fase === 'inicio' ? (desde ? 4 : pines.length) : zonaBuscada ? (resultados.dentro.length > 0 ? Math.max(resultados.dentro.length, 3) : 2) : desde ? 4 : pines.length;

  return {
    indice,
    cargando: cargando && !negocios,
    error: !!error && !negocios,
    fase,
    texto,
    escribir,
    que,
    colonia,
    entendido,
    fijar,
    quitarQue,
    quitarColonia,
    limpiar,
    resultados,
    cercanos,
    giros,
    hayCerca,
    sugerencias,
    desdeNombre: desde?.nombre ?? null,
    base,
    yo: base === 'yo' ? yo : null,
    miColonia,
    ubicando,
    fallo,
    bloqueado,
    usarUbicacion,
    elegirColonia,
    abrirColonias,
    colonias,
    zona,
    pines,
    encuadrar,
  };
}
