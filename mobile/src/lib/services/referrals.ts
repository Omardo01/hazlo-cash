import { Platform } from 'react-native';

import { supabase } from '../supabase';
import { CONFIRMADO, PENDIENTE, type EstadoReferral } from '../types';

export interface MiCodigo {
  codigo: string;
  negocio: string;
  oferta: string | null;
  // Link de referido que codifica el QR y se manda por WhatsApp (/r/CODE).
  shareUrl: string;
}

// Dominio de los links públicos. En web, el mismo de donde se abrió la app
// (hazlocash.com, un preview de Vercel o localhost): así el link siempre abre
// una página que existe. En el teléfono, el de la config o hazlocash.com.
function baseApp(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  return (process.env.EXPO_PUBLIC_APP_URL ?? 'https://hazlocash.com').replace(/\/$/, '');
}

// Link público de referido (/r/CODE) que codifica el QR del embajador.
export function linkReferido(codigo: string): string {
  return `${baseApp()}/r/${codigo}`;
}

// QR de la VISITA que el cliente presenta en el negocio. Codifica el id del
// referido para que el negocio lo escanee y confirme esa venta exacta.
export function linkVisita(referralId: string): string {
  return `${baseApp()}/v/${referralId}`;
}

// Extrae el id del referido de un QR escaneado. Tolerante: acepta la URL
// /v/<uuid> o el uuid pegado directo. Devuelve null si no encuentra uno válido.
export function extraerReferralId(texto: string): string | null {
  const m = texto.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m ? m[0].toLowerCase() : null;
}

// Qué codifica un QR escaneado por el negocio:
//  - 'codigo': QR del recomendador (/r/HAZLO-XXXX) → registra la venta directo.
//  - 'visita': QR de una visita ya reclamada (/v/<uuid>) → confirma esa visita.
export type QrVenta = { tipo: 'codigo'; codigo: string } | { tipo: 'visita'; id: string };

export function interpretarQr(texto: string): QrVenta | null {
  const cod = texto.toUpperCase().match(/HAZLO-[A-Z0-9]{4}/);
  if (cod) return { tipo: 'codigo', codigo: cod[0] };
  const id = extraerReferralId(texto);
  if (id) return { tipo: 'visita', id };
  return null;
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

  return {
    codigo: data.codigo,
    negocio: negocio?.nombre ?? '',
    oferta: negocio?.oferta ?? null,
    shareUrl: linkReferido(data.codigo),
  };
}

// ¿Ya se usó este código? Cada QR sirve para una sola venta: al registrarse,
// queda inactivo. RLS (codigo_select_embajador) solo deja leer los propios.
export interface EstadoCodigo {
  activo: boolean;
  usadoAt: string | null;
}

export async function getEstadoCodigo(codigo: string): Promise<EstadoCodigo | null> {
  const { data, error } = await supabase.from('referral_codes').select('activo, usado_at').eq('codigo', codigo).maybeSingle();
  if (error) throw new Error(`Error al revisar tu código: ${error.message}`);
  return data ? { activo: data.activo, usadoAt: data.usado_at } : null;
}

// Lo que ve quien abre un link /r/CODE: el negocio recomendado y su oferta.
// Funciona sin sesión: RLS deja leer códigos y negocios activos
// (codigo_select_activos, negocio_select_activos). null = código que no
// existe, que se desactivó o cuyo negocio ya no está activo.
export interface CodigoPublico {
  codigo: string;
  negocio: string;
  categoria: string;
  direccion: string | null;
  oferta: string | null;
  shareUrl: string;
}

export async function getCodigoPublico(entrada: string): Promise<CodigoPublico | null> {
  const codigo = normalizarCodigo(entrada);
  if (!codigo) return null;

  const { data, error } = await supabase
    .from('referral_codes')
    .select('codigo, businesses(nombre, categoria, direccion, oferta)')
    .eq('codigo', codigo)
    .eq('activo', true)
    .maybeSingle();

  if (error) throw new Error(`Error al buscar el código: ${error.message}`);
  // Sin tipos generados de la BD, supabase-js infiere la relación como array.
  const negocio = data && (Array.isArray(data.businesses) ? data.businesses[0] : data.businesses);
  if (!data || !negocio) return null;

  return {
    codigo: data.codigo,
    negocio: negocio.nombre,
    categoria: negocio.categoria,
    direccion: negocio.direccion ?? null,
    oferta: negocio.oferta ?? null,
    shareUrl: linkReferido(data.codigo),
  };
}

// El usuario en sesión se vuelve embajador de un negocio: genera (o recupera)
// su código de referido. Pasa por generar_codigo_referido() — idempotente y con
// código único garantizado server-side.
export async function crearCodigoReferido(
  negocioId: string,
): Promise<{ ok: boolean; codigo: MiCodigo | null; error: string | null }> {
  const { data, error } = await supabase.rpc('generar_codigo_referido', { p_negocio_id: negocioId });
  if (error) return { ok: false, codigo: null, error: error.message };

  const r = (data ?? {}) as { codigo: string; negocio: string; oferta: string | null };
  return {
    ok: true,
    codigo: { codigo: r.codigo, negocio: r.negocio, oferta: r.oferta ?? null, shareUrl: linkReferido(r.codigo) },
    error: null,
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

export interface VisitaCliente {
  id: string;
  folio: string;
  negocio: string;
  oferta: string | null;
  estado: EstadoReferral;
  creada: string;
}

// Visitas que el CLIENTE en sesión ha reclamado (su recorrido de compra).
// Filtra por cliente_id para no mezclar con lo que reclamó como embajador.
// RLS (referral_select_cliente) ya restringe, pero el .eq lo deja explícito.
export async function getMisVisitasCliente(): Promise<VisitaCliente[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('referrals')
    .select('id, estado, created_at, referral_codes(businesses(nombre, oferta))')
    .eq('cliente_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al cargar tus visitas: ${error.message}`);

  return (data ?? []).map((r) => {
    const rc = Array.isArray(r.referral_codes) ? r.referral_codes[0] : r.referral_codes;
    const b = rc ? (Array.isArray(rc.businesses) ? rc.businesses[0] : rc.businesses) : null;
    return {
      id: r.id,
      folio: r.id.substring(0, 8).toUpperCase(),
      negocio: b?.nombre ?? 'Negocio',
      oferta: b?.oferta ?? null,
      estado: r.estado as EstadoReferral,
      creada: r.created_at,
    };
  });
}

export interface VisitaNegocio {
  id: string;
  folio: string;
  codigo: string;
  estado: EstadoReferral;
  creada: string;
  comision: number | null; // comisión pagada (sólo cuando está confirmada)
}

// Visitas (usos de código) del negocio en sesión. RLS (referral_select_negocio)
// garantiza que solo ve las de su propio negocio. No expone datos del cliente.
export async function getVisitasNegocio(): Promise<VisitaNegocio[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('id, estado, created_at, comision, referral_codes(codigo)')
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
      comision: r.comision != null ? Number(r.comision) : null,
    };
  });
}

export interface ResultadoConfirmacion {
  ok: boolean;
  comision: number | null;
  creditosRestantes: number | null;
  error: string | null;
}

// El negocio confirma una venta. Pasa por confirmar_venta() (atómica): calcula
// la comisión, descuenta créditos del negocio y abona al recomendador.
// En modo 'porcentaje' hay que pasar el monto de la venta.
export async function confirmarVenta(id: string, montoVenta?: number): Promise<ResultadoConfirmacion> {
  const { data, error } = await supabase.rpc('confirmar_venta', {
    p_referral_id: id,
    p_monto_venta: montoVenta ?? null,
  });
  if (error) return { ok: false, comision: null, creditosRestantes: null, error: error.message };

  const r = (data ?? {}) as { comision?: number; creditos_restantes?: number };
  return {
    ok: true,
    comision: r.comision != null ? Number(r.comision) : null,
    creditosRestantes: r.creditos_restantes != null ? Number(r.creditos_restantes) : null,
    error: null,
  };
}

// El negocio escaneó el QR del recomendador (código): registra la venta al
// instante. Pasa por registrar_venta_por_codigo() (atómica). En modo
// 'porcentaje' hay que pasar el monto de la venta.
export async function registrarVentaPorCodigo(codigo: string, montoVenta?: number): Promise<ResultadoConfirmacion> {
  const { data, error } = await supabase.rpc('registrar_venta_por_codigo', {
    p_codigo: codigo,
    p_monto_venta: montoVenta ?? null,
  });
  if (error) return { ok: false, comision: null, creditosRestantes: null, error: error.message };

  const r = (data ?? {}) as { comision?: number; creditos_restantes?: number };
  return {
    ok: true,
    comision: r.comision != null ? Number(r.comision) : null,
    creditosRestantes: r.creditos_restantes != null ? Number(r.creditos_restantes) : null,
    error: null,
  };
}

// El negocio rechaza una visita pendiente (no mueve dinero).
// RLS (referral_update_negocio) garantiza que solo toca las suyas.
export async function rechazarVisita(id: string): Promise<{ ok: boolean }> {
  const { data, error } = await supabase
    .from('referrals')
    .update({ estado: 'rechazado', confirmado_at: null })
    .eq('id', id)
    .eq('estado', 'pendiente')
    .select('id');

  return { ok: !error && (data?.length ?? 0) > 0 };
}

export interface StatsEmbajador {
  /** Visitas generadas por sus códigos (todas, en cualquier estado). */
  recomendaciones: number;
  confirmadas: number;
  pendientes: number;
  /** Personas distintas que usaron alguno de sus códigos. */
  clientes: number;
  /** Negocios para los que tiene código activo. */
  negocios: number;
}

// Resumen de la actividad del embajador en sesión, para su perfil.
// RLS (referral_select_embajador) ya limita a los referidos de sus códigos;
// el filtro por embajador_id lo deja explícito.
export async function getStatsEmbajador(): Promise<StatsEmbajador> {
  const vacio: StatsEmbajador = { recomendaciones: 0, confirmadas: 0, pendientes: 0, clientes: 0, negocios: 0 };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return vacio;

  const [{ data: refs }, { data: codigos }] = await Promise.all([
    supabase
      .from('referrals')
      .select('id, estado, cliente_id, referral_codes!inner(embajador_id)')
      .eq('referral_codes.embajador_id', user.id),
    supabase.from('referral_codes').select('negocio_id').eq('embajador_id', user.id).eq('activo', true),
  ]);

  const lista = refs ?? [];
  return {
    recomendaciones: lista.length,
    confirmadas: lista.filter((r) => r.estado === CONFIRMADO).length,
    pendientes: lista.filter((r) => r.estado === PENDIENTE).length,
    clientes: new Set(lista.map((r) => r.cliente_id)).size,
    negocios: new Set((codigos ?? []).map((c) => c.negocio_id)).size,
  };
}

export interface RecomendacionItem {
  codigo: string;
  negocio: string;
  oferta: string | null;
  /** Visitas generadas con este código (cualquier estado). */
  usos: number;
  confirmadas: number;
  /** Comisiones cobradas por este negocio. */
  ganado: number;
  creada: string;
}

// Un renglón por negocio que el recomendador en sesión ha recomendado (un
// código por negocio), con lo que ha rendido. RLS ya limita cada tabla a lo
// suyo; los filtros por embajador_id lo dejan explícito.
export async function getMisRecomendaciones(): Promise<RecomendacionItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [codigos, refs, comisiones] = await Promise.all([
    supabase
      .from('referral_codes')
      .select('id, codigo, negocio_id, created_at, businesses(nombre, oferta)')
      .eq('embajador_id', user.id)
      .eq('activo', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('referrals')
      .select('codigo_id, estado, referral_codes!inner(embajador_id)')
      .eq('referral_codes.embajador_id', user.id),
    supabase.from('comisiones').select('negocio_id, monto').eq('embajador_id', user.id),
  ]);

  if (codigos.error) throw new Error(`Error al cargar tus recomendaciones: ${codigos.error.message}`);

  return (codigos.data ?? []).map((c) => {
    const n = Array.isArray(c.businesses) ? c.businesses[0] : c.businesses;
    const usos = (refs.data ?? []).filter((r) => r.codigo_id === c.id);
    return {
      codigo: c.codigo,
      negocio: n?.nombre ?? 'Negocio',
      oferta: n?.oferta ?? null,
      usos: usos.length,
      confirmadas: usos.filter((r) => r.estado === CONFIRMADO).length,
      ganado: (comisiones.data ?? []).filter((m) => m.negocio_id === c.negocio_id).reduce((t, m) => t + Number(m.monto), 0),
      creada: c.created_at,
    };
  });
}

export type NivelEmbajador = 'Bronce' | 'Plata' | 'Oro';

export interface Nivel {
  nivel: NivelEmbajador;
  /** Ventas confirmadas que faltan para el siguiente nivel (0 si ya es Oro). */
  faltan: number;
  /** Avance dentro del nivel actual, 0–1. */
  progreso: number;
  siguiente: NivelEmbajador | null;
}

// Escalones por ventas confirmadas. Los rangos viven aquí (no en la UI) para
// que web y móvil muestren lo mismo cuando se conecte el sistema de niveles.
const ESCALONES: { nivel: NivelEmbajador; desde: number }[] = [
  { nivel: 'Bronce', desde: 0 },
  { nivel: 'Plata', desde: 5 },
  { nivel: 'Oro', desde: 15 },
];

export function calcularNivel(confirmadas: number): Nivel {
  const i = ESCALONES.reduce((acc, e, idx) => (confirmadas >= e.desde ? idx : acc), 0);
  const actual = ESCALONES[i];
  const siguiente = ESCALONES[i + 1] ?? null;

  if (!siguiente) return { nivel: actual.nivel, faltan: 0, progreso: 1, siguiente: null };

  const tramo = siguiente.desde - actual.desde;
  return {
    nivel: actual.nivel,
    faltan: siguiente.desde - confirmadas,
    progreso: Math.min(1, (confirmadas - actual.desde) / tramo),
    siguiente: siguiente.nivel,
  };
}
