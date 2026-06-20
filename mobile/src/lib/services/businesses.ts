import { supabase } from '../supabase';
import type { Business, BusinessAdmin, ComisionTipo } from '../types';

// Columnas extra que sólo ven admin y dueño (dueño + saldo + config de comisión).
const COLS_ADMIN = 'id, nombre, categoria, descripcion, direccion, oferta, activo, owner_id, creditos, comision_tipo, comision_valor';

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
export async function getNegociosAdmin(): Promise<BusinessAdmin[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select(COLS_ADMIN)
    .order('nombre');

  if (error) throw new Error(`Error al cargar negocios: ${error.message}`);
  return (data ?? []) as BusinessAdmin[];
}

// El negocio del usuario en sesión (vista dueño). RLS negocio_all_dueno.
// MVP: un dueño tiene un negocio; devolvemos el primero. null si no tiene.
export async function getMiNegocio(): Promise<BusinessAdmin | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('businesses')
    .select(COLS_ADMIN)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as BusinessAdmin | null) ?? null;
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
  comision_tipo?: ComisionTipo;
  comision_valor?: number;
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
    comision_tipo: n.comision_tipo ?? 'fijo',
    comision_valor: n.comision_valor ?? 10,
    owner_id: null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}

// Admin activa/recarga créditos a un negocio. Pasa por la función
// admin_recargar_creditos (atómica, valida rol admin server-side).
// Devuelve el nuevo saldo de créditos.
export async function recargarCreditos(
  negocioId: string,
  monto: number,
): Promise<{ ok: boolean; saldo: number | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_recargar_creditos', {
    p_negocio_id: negocioId,
    p_monto: monto,
  });
  if (error) return { ok: false, saldo: null, error: error.message };
  return { ok: true, saldo: Number(data), error: null };
}

// Asigna (o quita, con null) la cuenta dueña del negocio. El dueño debe ser un
// usuario con rol 'negocio' para poder operarlo desde su sesión. RLS
// negocio_all_admin permite este update directo a admins.
export async function asignarDuenoNegocio(
  negocioId: string,
  ownerId: string | null,
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.from('businesses').update({ owner_id: ownerId }).eq('id', negocioId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}

// Actualiza la configuración de comisión del negocio (admin).
// RLS negocio_all_admin permite el update directo a admins.
export async function setComisionNegocio(
  negocioId: string,
  tipo: ComisionTipo,
  valor: number,
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase
    .from('businesses')
    .update({ comision_tipo: tipo, comision_valor: valor })
    .eq('id', negocioId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
