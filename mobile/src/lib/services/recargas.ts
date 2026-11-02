import { supabase } from '../supabase';
import type { SolicitudRecarga, SolicitudRecargaAdmin } from '../types';

const COLS = 'id, negocio_id, monto, referencia, estado, created_at, resuelta_en';

// Recargas del negocio en sesión (RLS recarga_select_dueno), la más nueva primero.
export async function getMisRecargas(): Promise<SolicitudRecarga[]> {
  const { data, error } = await supabase.from('solicitudes_recarga').select(COLS).order('created_at', { ascending: false }).limit(10);
  if (error) throw new Error(`Error al cargar recargas: ${error.message}`);
  return (data ?? []).map((r) => ({ ...r, monto: Number(r.monto) })) as SolicitudRecarga[];
}

// El dueño pide una recarga. La función valida que el negocio esté aprobado y
// genera la referencia que va en el concepto de la transferencia.
export async function solicitarRecarga(monto: number): Promise<{ ok: boolean; solicitud: SolicitudRecarga | null; error: string | null }> {
  const { data, error } = await supabase.rpc('negocio_solicitar_recarga', { p_monto: monto });
  if (error) return { ok: false, solicitud: null, error: error.message };
  const s = data as SolicitudRecarga;
  return { ok: true, solicitud: { ...s, monto: Number(s.monto) }, error: null };
}

// Pendientes de todos los negocios, la más vieja primero (admin).
export async function getRecargasPendientesAdmin(): Promise<SolicitudRecargaAdmin[]> {
  const { data, error } = await supabase
    .from('solicitudes_recarga')
    .select(`${COLS}, negocio:businesses(nombre)`)
    .eq('estado', 'pendiente')
    .order('created_at');
  if (error) throw new Error(`Error al cargar recargas: ${error.message}`);
  return (data ?? []).map((r) => {
    const negocio = r.negocio as unknown as { nombre: string } | null;
    return { ...r, monto: Number(r.monto), negocio: negocio?.nombre ?? 'Negocio' };
  }) as SolicitudRecargaAdmin[];
}

// El admin acepta (ya llegó la transferencia) o rechaza. Aceptar suma los
// créditos en la misma transacción. Devuelve el saldo del negocio.
export async function resolverRecarga(id: string, aceptar: boolean): Promise<{ ok: boolean; saldo: number | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_resolver_recarga', { p_solicitud_id: id, p_aceptar: aceptar });
  if (error) return { ok: false, saldo: null, error: error.message };
  return { ok: true, saldo: Number(data), error: null };
}
