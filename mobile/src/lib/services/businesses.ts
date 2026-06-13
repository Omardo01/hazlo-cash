import { supabase } from '../supabase';
import type { Business } from '../types';

// Catálogo público de negocios activos (vista Cliente / Discover).
// RLS permite la lectura anónima de negocios con activo = true.
export async function getNegociosActivos(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, nombre, categoria, descripcion, direccion, oferta, activo')
    .eq('activo', true)
    .order('nombre');

  if (error) throw new Error(`Error al cargar negocios: ${error.message}`);
  return data ?? [];
}

// Todos los negocios (incl. inactivos) — vista admin. RLS negocio_all_admin.
export async function getNegociosAdmin(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, nombre, categoria, descripcion, direccion, oferta, activo')
    .order('nombre');

  if (error) throw new Error(`Error al cargar negocios: ${error.message}`);
  return data ?? [];
}

// Activar / desactivar un negocio (admin).
export async function setNegocioActivo(id: string, activo: boolean): Promise<{ ok: boolean }> {
  const { error } = await supabase.from('businesses').update({ activo }).eq('id', id);
  return { ok: !error };
}

export interface NuevoNegocio {
  nombre: string;
  categoria: string;
  direccion?: string;
  descripcion?: string;
  oferta?: string;
}

// Alta de negocio (vista admin). RLS (negocio_all_admin) exige rol admin.
// Se crea sin dueño (owner_id null); luego se podrá asignar a una cuenta negocio.
export async function crearNegocio(n: NuevoNegocio): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.from('businesses').insert({
    nombre: n.nombre.trim(),
    categoria: n.categoria,
    direccion: n.direccion?.trim() || null,
    descripcion: n.descripcion?.trim() || null,
    oferta: n.oferta?.trim() || null,
    owner_id: null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
