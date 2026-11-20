import { supabase } from '../supabase';

/** Un negocio activo como lo necesita el mapa. Sin ubicación, lat y lng llegan en null. */
export interface NegocioEnMapa {
  id: string;
  nombre: string;
  categoria: string;
  giros: string[];
  lat: number | null;
  lng: number | null;
  recomendadores: number;
  ventasMes: number;
  /** Beneficio para quien llega recomendado (solo lo trae la lectura del recomendador). */
  oferta?: string | null;
}

/** Colonias agrupadas por el admin. Sin sectores, el mapa muestra las colonias tal cual. */
export interface Sector {
  id: string;
  nombre: string;
  /** Ids de colonia de geometria.ts. */
  colonias: string[];
}

// Negocios activos con sus cifras. admin_mapa_negocios() (security definer)
// cuenta recomendadores y ventas del mes en el servidor y exige rol admin.
export async function getMapaNegocios(): Promise<NegocioEnMapa[]> {
  const { data, error } = await supabase.rpc('admin_mapa_negocios');
  if (error) throw new Error(`Error al cargar el mapa: ${error.message}`);
  return ((data ?? []) as Record<string, unknown>[]).map((n) => ({
    id: String(n.id),
    nombre: String(n.nombre),
    categoria: String(n.categoria ?? ''),
    giros: Array.isArray(n.giros) ? n.giros.map(String) : [],
    lat: typeof n.lat === 'number' ? n.lat : null,
    lng: typeof n.lng === 'number' ? n.lng : null,
    recomendadores: Number(n.recomendadores ?? 0),
    ventasMes: Number(n.ventas_mes ?? 0),
  }));
}

// Lo que ve un recomendador: los mismos negocios activos, sin cifras internas.
// RLS ya deja leer los negocios activos a cualquiera (el catálogo usa lo mismo).
export async function getMapaNegociosPublico(): Promise<NegocioEnMapa[]> {
  const { data, error } = await supabase.from('businesses').select('id, nombre, categoria, giros, lat, lng, oferta').eq('activo', true).order('nombre');
  if (error) throw new Error(`Error al cargar el mapa: ${error.message}`);
  return (data ?? []).map((n) => ({
    id: String(n.id),
    nombre: String(n.nombre),
    categoria: String(n.categoria ?? ''),
    giros: Array.isArray(n.giros) ? n.giros.map(String) : [],
    lat: typeof n.lat === 'number' ? n.lat : null,
    lng: typeof n.lng === 'number' ? n.lng : null,
    recomendadores: 0,
    ventasMes: 0,
    oferta: typeof n.oferta === 'string' && n.oferta.trim() ? n.oferta : null,
  }));
}

export async function getSectores(): Promise<Sector[]> {
  const { data, error } = await supabase.from('sectores').select('id, nombre, colonias').order('orden');
  if (error) throw new Error(`Error al cargar los sectores: ${error.message}`);
  return (data ?? []) as Sector[];
}

// Reemplaza todos los sectores de una vez (admin). Lista vacía = sin sectores.
export async function guardarSectores(sectores: { nombre: string; colonias: string[] }[]): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.rpc('admin_guardar_sectores', { p_sectores: sectores });
  if (!error) return { ok: true, error: null };
  if (error.code === '23505') return { ok: false, error: 'Una colonia quedó en dos sectores. Revisa y vuelve a guardar.' };
  if (error.code === '42501') return { ok: false, error: 'Solo el administrador puede organizar los sectores.' };
  return { ok: false, error: 'No se pudieron guardar los sectores. Inténtalo otra vez.' };
}
