import { supabase } from '../supabase';
import type { EstadoReferral } from '../types';

export interface MiCodigo {
  codigo: string;
  negocio: string;
  oferta: string | null;
  // Link de referido que codifica el QR y se manda por WhatsApp (/r/CODE).
  shareUrl: string;
}

// Código de referido activo del embajador en sesión.
// RLS (codigo_all_embajador) garantiza que solo lee los suyos.
// Devuelve null si no hay sesión o el usuario aún no tiene código.
export async function getMiCodigo(): Promise<MiCodigo | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('referral_codes')
    .select('codigo, businesses(nombre, oferta)')
    .eq('embajador_id', user.id)
    .eq('activo', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  // Sin tipos generados de la BD, supabase-js infiere la relación como array.
  const negocio = Array.isArray(data.businesses) ? data.businesses[0] : data.businesses;

  const base = (process.env.EXPO_PUBLIC_APP_URL ?? 'https://hazlocash.app').replace(/\/$/, '');

  return {
    codigo: data.codigo,
    negocio: negocio?.nombre ?? '',
    oferta: negocio?.oferta ?? null,
    shareUrl: `${base}/r/${data.codigo}`,
  };
}

// Mensaje listo para WhatsApp / compartir.
export function mensajeReferido(c: MiCodigo): string {
  const oferta = c.oferta ? ` ${c.oferta}.` : '';
  return `¡Te recomiendo ${c.negocio} en Hazlo Cash!${oferta} Usa mi código ${c.codigo} y aprovéchalo aquí: ${c.shareUrl}`;
}

export interface Reclamo {
  ok: boolean;
  folio: string | null;
  negocio: string | null;
  oferta: string | null;
  error: string | null;
}

// Extrae un código HAZLO-XXXX de texto suelto o de un link /r/CODE pegado.
function normalizarCodigo(entrada: string): string | null {
  const m = entrada.toUpperCase().match(/HAZLO-[A-Z0-9]{4}/);
  return m ? m[0] : null;
}

// El cliente en sesión reclama un código: registra la visita (referrals) y
// recibe un folio para mostrarlo al negocio. Queda 'pendiente' hasta que el
// negocio lo confirme. RLS (referral_insert_cliente) exige cliente_id = auth.uid().
export async function reclamarCodigo(entrada: string): Promise<Reclamo> {
  const fail = (error: string): Reclamo => ({ ok: false, folio: null, negocio: null, oferta: null, error });

  const codigo = normalizarCodigo(entrada);
  if (!codigo) return fail('Ese no parece un código válido. Debe verse como HAZLO-XXXX.');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail('Inicia sesión para reclamar una recomendación.');

  const { data: rc } = await supabase
    .from('referral_codes')
    .select('id, businesses(nombre, oferta)')
    .eq('codigo', codigo)
    .eq('activo', true)
    .maybeSingle();
  if (!rc) return fail('Ese código no existe o ya no está activo.');

  const { data: ref, error } = await supabase
    .from('referrals')
    .insert({ codigo_id: rc.id, cliente_id: user.id })
    .select('id')
    .single();
  if (error || !ref) return fail('No pudimos registrar tu visita. Intenta de nuevo.');

  const negocio = Array.isArray(rc.businesses) ? rc.businesses[0] : rc.businesses;
  return {
    ok: true,
    folio: ref.id.substring(0, 8).toUpperCase(),
    negocio: negocio?.nombre ?? null,
    oferta: negocio?.oferta ?? null,
    error: null,
  };
}

export interface VisitaNegocio {
  id: string;
  folio: string;
  codigo: string;
  estado: EstadoReferral;
  creada: string;
}

// Visitas (usos de código) del negocio en sesión. RLS (referral_select_negocio)
// garantiza que solo ve las de su propio negocio. No expone datos del cliente.
export async function getVisitasNegocio(): Promise<VisitaNegocio[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('id, estado, created_at, referral_codes(codigo)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al cargar solicitudes: ${error.message}`);

  return (data ?? []).map((r) => {
    const rc = Array.isArray(r.referral_codes) ? r.referral_codes[0] : r.referral_codes;
    return {
      id: r.id,
      folio: r.id.substring(0, 8).toUpperCase(),
      codigo: rc?.codigo ?? '—',
      estado: r.estado as EstadoReferral,
      creada: r.created_at,
    };
  });
}

// El negocio confirma o rechaza una visita pendiente.
// RLS (referral_update_negocio) garantiza que solo toca las suyas.
export async function resolverVisita(
  id: string,
  decision: 'confirmado' | 'rechazado',
): Promise<{ ok: boolean }> {
  const { data, error } = await supabase
    .from('referrals')
    .update({
      estado: decision,
      confirmado_at: decision === 'confirmado' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('estado', 'pendiente')
    .select('id');

  return { ok: !error && (data?.length ?? 0) > 0 };
}
