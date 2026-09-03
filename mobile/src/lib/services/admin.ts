import { supabase } from '../supabase';
import { CONFIRMADO, PENDIENTE, type Rol } from '../types';

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  roles: Rol[];
  /** Vive en auth.users: sólo llega si la Edge Function está desplegada. */
  email: string | null;
  telefono: string | null;
  ultimoAcceso: string | null;
}

// Lista de usuarios (vista admin). Intenta primero la Edge Function
// `admin-usuarios`, que agrega el correo y el último acceso (datos de
// auth.users, invisibles para el cliente). Si no está desplegada, cae a la
// lectura por RLS (perfil_select_admin): se pierde el correo pero el panel
// sigue funcionando en vez de quedarse vacío.
export async function getUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const { data: rica } = await supabase.functions.invoke('admin-usuarios', {
    body: { accion: 'listar' },
  });

  const lista = (rica as { usuarios?: unknown[] } | null)?.usuarios;
  if (Array.isArray(lista)) {
    return lista.map((u) => {
      const x = u as Record<string, unknown>;
      return {
        id: String(x.id),
        nombre: (x.nombre as string) || '(sin nombre)',
        roles: (x.roles as Rol[]) ?? [],
        email: (x.email as string) ?? null,
        telefono: (x.telefono as string) ?? null,
        ultimoAcceso: (x.ultimoAcceso as string) ?? null,
      };
    });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, telefono, roles')
    .order('nombre');

  if (error) throw new Error(`Error al cargar usuarios: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre || '(sin nombre)',
    roles: (p.roles as Rol[]) ?? [],
    email: null,
    telefono: p.telefono ?? null,
    ultimoAcceso: null,
  }));
}

export interface NuevaCuenta {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  roles: Rol[];
}

// Alta de cuenta desde el panel admin. Pasa por la Edge Function (service
// role): nace con el correo ya confirmado y con los roles que el admin elija
// — incluidos 'negocio' y 'admin', que el registro público no puede dar.
export async function crearUsuarioAdmin(c: NuevaCuenta): Promise<{ ok: boolean; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('admin-usuarios', {
    body: {
      accion: 'crear',
      email: c.email,
      password: c.password,
      nombre: c.nombre,
      telefono: c.telefono ?? '',
      roles: c.roles,
    },
  });

  if (error) return { ok: false, error: errorFuncion(error.message) };
  const r = data as { error?: string } | null;
  if (r?.error) return { ok: false, error: r.error };
  return { ok: true, error: null };
}

// El admin fija una contraseña nueva (para soporte y para armar pruebas).
export async function cambiarPasswordAdmin(
  userId: string,
  password: string,
): Promise<{ ok: boolean; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('admin-usuarios', {
    body: { accion: 'password', userId, password },
  });

  if (error) return { ok: false, error: errorFuncion(error.message) };
  const r = data as { error?: string } | null;
  if (r?.error) return { ok: false, error: r.error };
  return { ok: true, error: null };
}

// Mensaje claro cuando la función todavía no se ha desplegado.
function errorFuncion(msg: string): string {
  return `No se pudo completar. ¿Está desplegada la función admin-usuarios? (${msg})`;
}

// Cambiar los roles de un usuario. Pasa por la Edge Function `admin-asignar-rol`
// (corre con service role y valida que quien llama es admin). El cliente NO
// puede tocar profiles.roles directo (ver seguridad-roles).
export async function asignarRol(
  userId: string,
  roles: Rol[],
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.functions.invoke('admin-asignar-rol', {
    body: { userId, roles },
  });
  if (error) {
    // Mensaje claro si la función aún no está desplegada.
    return {
      ok: false,
      error:
        'No se pudo cambiar el rol. ¿Está desplegada la función admin-asignar-rol? (' +
        error.message +
        ')',
    };
  }
  return { ok: true, error: null };
}

// =============================================================
// Panel admin — visión completa del loop.
// Todo pasa por RLS: las policies *_admin (ver migración 20260818) permiten
// leer negocios, órdenes, códigos y wallets solo si es_admin(). Confirmar una
// venta sigue siendo exclusivo de confirmar_venta(): el dinero no se calcula
// ni se mueve desde el cliente.
// =============================================================

export interface MetricasAdmin {
  negocios: number;
  negociosActivos: number;
  usuarios: number;
  embajadores: number;
  ordenes: number;
  pendientes: number;
  confirmadas: number;
  /** Suma de comisiones pagadas a recomendadores. */
  comisiones: number;
  /** Créditos que los negocios tienen cargados y sin gastar. */
  creditos: number;
  /** Saldo acumulado en los wallets de los recomendadores. */
  wallets: number;
}

export async function getMetricasAdmin(): Promise<MetricasAdmin> {
  const [negocios, perfiles, refs, comisiones, wallets] = await Promise.all([
    supabase.from('businesses').select('id, activo, creditos'),
    supabase.from('profiles').select('id, roles'),
    supabase.from('referrals').select('id, estado'),
    supabase.from('comisiones').select('monto'),
    supabase.from('wallets').select('saldo'),
  ]);

  const negs = negocios.data ?? [];
  const pfs = perfiles.data ?? [];
  const rs = refs.data ?? [];

  return {
    negocios: negs.length,
    negociosActivos: negs.filter((n) => n.activo).length,
    usuarios: pfs.length,
    embajadores: pfs.filter((p) => ((p.roles as Rol[]) ?? []).includes('embajador')).length,
    ordenes: rs.length,
    pendientes: rs.filter((r) => r.estado === PENDIENTE).length,
    confirmadas: rs.filter((r) => r.estado === CONFIRMADO).length,
    comisiones: (comisiones.data ?? []).reduce((s, c) => s + Number(c.monto), 0),
    creditos: negs.reduce((s, n) => s + Number(n.creditos ?? 0), 0),
    wallets: (wallets.data ?? []).reduce((s, w) => s + Number(w.saldo), 0),
  };
}

export interface OrdenAdmin {
  id: string;
  folio: string;
  codigo: string;
  negocio: string;
  negocioId: string;
  embajador: string;
  cliente: string;
  estado: string;
  comision: number | null;
  montoVenta: number | null;
  creada: string;
}

// Todas las órdenes de la plataforma, la más reciente primero.
export async function getOrdenesAdmin(): Promise<OrdenAdmin[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select(
      'id, estado, comision, monto_venta, created_at, cliente:profiles!referrals_cliente_id_fkey(nombre), referral_codes(codigo, businesses(id, nombre), embajador:profiles!referral_codes_embajador_id_fkey(nombre))',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(`Error al cargar órdenes: ${error.message}`);

  const uno = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

  return (data ?? []).map((r) => {
    const rc = uno(r.referral_codes as never) as
      | { codigo: string; businesses: unknown; embajador: unknown }
      | null;
    const negocio = rc ? (uno(rc.businesses as never) as { id: string; nombre: string } | null) : null;
    const embajador = rc ? (uno(rc.embajador as never) as { nombre: string } | null) : null;
    const cliente = uno(r.cliente as never) as { nombre: string } | null;

    return {
      id: r.id,
      folio: r.id.substring(0, 8).toUpperCase(),
      codigo: rc?.codigo ?? '—',
      negocio: negocio?.nombre ?? 'Negocio',
      negocioId: negocio?.id ?? '',
      embajador: embajador?.nombre || 'Sin nombre',
      cliente: cliente?.nombre || 'Sin nombre',
      estado: r.estado,
      comision: r.comision != null ? Number(r.comision) : null,
      montoVenta: r.monto_venta != null ? Number(r.monto_venta) : null,
      creada: r.created_at,
    };
  });
}

export interface CodigoAdmin {
  id: string;
  codigo: string;
  negocio: string;
  negocioId: string;
  embajador: string;
  embajadorId: string;
  activo: boolean;
}

// Códigos de referido vivos en la plataforma (para armar pruebas y auditar).
export async function getCodigosAdmin(): Promise<CodigoAdmin[]> {
  const { data, error } = await supabase
    .from('referral_codes')
    .select(
      'id, codigo, activo, negocio_id, embajador_id, businesses(nombre), embajador:profiles!referral_codes_embajador_id_fkey(nombre)',
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al cargar códigos: ${error.message}`);

  const uno = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

  return (data ?? []).map((c) => ({
    id: c.id,
    codigo: c.codigo,
    negocio: (uno(c.businesses as never) as { nombre: string } | null)?.nombre ?? 'Negocio',
    negocioId: c.negocio_id,
    embajador: (uno(c.embajador as never) as { nombre: string } | null)?.nombre || 'Sin nombre',
    embajadorId: c.embajador_id,
    activo: c.activo,
  }));
}

// Crea una orden a nombre de un cliente cualquiera (policy referral_insert_admin).
// Sirve para armar el escenario de prueba sin pasar por los dos teléfonos.
export async function crearOrdenPrueba(
  codigoId: string,
  clienteId: string,
): Promise<{ ok: boolean; folio: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('referrals')
    .insert({ codigo_id: codigoId, cliente_id: clienteId })
    .select('id')
    .single();

  if (error || !data) return { ok: false, folio: null, error: error?.message ?? 'No se pudo crear la orden.' };
  return { ok: true, folio: data.id.substring(0, 8).toUpperCase(), error: null };
}

// Confirma la venta como admin. Pasa por la misma función que usa el negocio:
// calcula comisión, descuenta créditos y abona al wallet en una transacción.
export async function confirmarOrdenAdmin(
  referralId: string,
  montoVenta?: number,
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.rpc('confirmar_venta', {
    p_referral_id: referralId,
    p_monto_venta: montoVenta ?? null,
  });
  return error ? { ok: false, error: error.message } : { ok: true, error: null };
}

// Rechazar no mueve dinero, así que va por UPDATE directo (acotado por la
// policy referral_update_admin a 'pendiente'/'rechazado').
export async function rechazarOrdenAdmin(referralId: string): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.from('referrals').update({ estado: 'rechazado' }).eq('id', referralId);
  return error ? { ok: false, error: error.message } : { ok: true, error: null };
}

// Genera (o recupera) el código de un embajador para un negocio, sin necesidad
// de entrar con su cuenta.
export async function adminGenerarCodigo(
  negocioId: string,
  embajadorId: string,
): Promise<{ ok: boolean; codigo: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('admin_generar_codigo', {
    p_negocio_id: negocioId,
    p_embajador_id: embajadorId,
  });
  if (error) return { ok: false, codigo: null, error: error.message };
  const r = (data ?? {}) as { codigo?: string };
  return { ok: true, codigo: r.codigo ?? null, error: null };
}

// Borra una orden de prueba. La policy referral_delete_admin impide borrar
// órdenes confirmadas: esas ya movieron dinero y quedan como registro.
export async function eliminarOrdenAdmin(referralId: string): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.from('referrals').delete().eq('id', referralId);
  return error ? { ok: false, error: error.message } : { ok: true, error: null };
}
