import { supabase } from '../supabase';
import type { Business, BusinessAdmin, ComisionTipo, NegocioCatalogo } from '../types';

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

// Catálogo para quien entra sin cuenta: los negocios sin el texto de su
// promoción (se ve hasta registrarse), solo si tienen una. Así la promo ni
// siquiera viaja al teléfono del invitado.
export async function getNegociosPublicos(): Promise<NegocioCatalogo[]> {
  const [lista, conPromo] = await Promise.all([
    supabase.from('businesses').select('id, nombre, categoria, descripcion, direccion, activo').eq('activo', true).order('nombre'),
    supabase.from('businesses').select('id').eq('activo', true).not('oferta', 'is', null),
  ]);
  if (lista.error) throw new Error(`Error al cargar negocios: ${lista.error.message}`);
  const ids = new Set((conPromo.data ?? []).map((n) => n.id));
  return (lista.data ?? []).map((n) => ({ ...n, oferta: null, promoOculta: ids.has(n.id) }));
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

// =============================================================
// Panel del negocio (vista dueño)
// =============================================================

export interface ResumenNegocio {
  negocioId: string;
  creditos: number;
  ordenes: number;
  pendientes: number;
  confirmadas: number;
  rechazadas: number;
  comisionesPagadas: number;
  ventasRegistradas: number;
  embajadores: number;
  clientes: number;
}

// Resumen de operación del negocio en sesión. Pasa por negocio_resumen()
// (security definer): los agregados se calculan server-side en una sola
// consulta en vez de bajarse todas las órdenes al teléfono.
export async function getResumenNegocio(): Promise<ResumenNegocio | null> {
  const { data, error } = await supabase.rpc('negocio_resumen');
  if (error || !data) return null;

  const r = data as Record<string, unknown>;
  const num = (k: string) => Number(r[k] ?? 0);
  return {
    negocioId: String(r.negocio_id ?? ''),
    creditos: num('creditos'),
    ordenes: num('ordenes'),
    pendientes: num('pendientes'),
    confirmadas: num('confirmadas'),
    rechazadas: num('rechazadas'),
    comisionesPagadas: num('comisiones_pagadas'),
    ventasRegistradas: num('ventas_registradas'),
    embajadores: num('embajadores'),
    clientes: num('clientes'),
  };
}

export interface EmbajadorNegocio {
  codigoId: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  recomendaciones: number;
  confirmadas: number;
  pendientes: number;
  comisionPagada: number;
  ultima: string | null;
}

// Quién recomienda a este negocio. El nombre del embajador lo resuelve
// negocio_embajadores() server-side (el negocio no puede leer profiles).
export async function getEmbajadoresNegocio(): Promise<EmbajadorNegocio[]> {
  const { data, error } = await supabase.rpc('negocio_embajadores');
  if (error) throw new Error(`Error al cargar embajadores: ${error.message}`);

  return ((data ?? []) as Record<string, unknown>[]).map((e) => ({
    codigoId: String(e.codigo_id),
    codigo: String(e.codigo),
    nombre: String(e.nombre),
    activo: Boolean(e.activo),
    recomendaciones: Number(e.recomendaciones ?? 0),
    confirmadas: Number(e.confirmadas ?? 0),
    pendientes: Number(e.pendientes ?? 0),
    comisionPagada: Number(e.comision_pagada ?? 0),
    ultima: (e.ultima as string) ?? null,
  }));
}

export interface EdicionNegocio {
  nombre: string;
  categoria: string;
  direccion?: string;
  descripcion?: string;
  oferta?: string;
}

// Edita la ficha del negocio. La usan el dueño (RLS negocio_all_dueno) y el
// admin (negocio_all_admin). Las columnas de dinero y control (creditos,
// comision_*, owner_id, activo) NO se tocan aquí: el trigger
// proteger_columnas_negocio las rechaza para todo el que no sea admin.
export async function actualizarNegocio(
  id: string,
  n: EdicionNegocio,
): Promise<{ ok: boolean; error: string | null }> {
  if (!n.nombre.trim()) return { ok: false, error: 'El nombre no puede quedar vacío.' };
  if (!n.categoria) return { ok: false, error: 'Selecciona una categoría.' };

  const { error } = await supabase
    .from('businesses')
    .update({
      nombre: n.nombre.trim(),
      categoria: n.categoria,
      direccion: n.direccion?.trim() || null,
      descripcion: n.descripcion?.trim() || null,
      oferta: n.oferta?.trim() || null,
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
