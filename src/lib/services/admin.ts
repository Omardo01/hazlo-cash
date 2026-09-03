import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EstadoReferral, Rol } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────────
export function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "··";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

const num = (v: unknown) => (v == null ? 0 : Number(v));
// Las relaciones de supabase-js (sin tipos generados) llegan como objeto o array.
function one<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}
// Clave de agrupación por día local (evita colisiones entre meses).
const claveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export interface AdminInfo {
  id: string;
  nombre: string;
  iniciales: string;
}

// Candado de acceso: exige sesión con rol admin. Redirige si no.
// Se llama al inicio de cada página del panel (Server Component).
export async function requireAdmin(): Promise<AdminInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nombre, roles")
    .eq("id", user.id)
    .maybeSingle();

  const roles = (perfil?.roles as Rol[]) ?? [];
  if (!roles.includes("admin")) redirect("/auth/login");

  const nombre = perfil?.nombre || "Admin";
  return { id: user.id, nombre, iniciales: iniciales(nombre) };
}

// ── Resumen / KPIs del panel ──────────────────────────────────────────────────
export interface ResumenAdmin {
  usuarios: number;
  negocios: number;
  ventas: number; // ventas confirmadas
  gmv: number; // suma de montos de venta capturados
  comisionesPagadas: number;
  creditosCirculando: number;
  porPagar: number; // saldo acumulado en wallets de recomendadores
}

export async function getResumenAdmin(): Promise<ResumenAdmin> {
  const admin = createAdminClient();
  const [{ count: usuarios }, { count: negocios }, comis, negs, wallets, refs] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("businesses").select("*", { count: "exact", head: true }),
    admin.from("comisiones").select("monto"),
    admin.from("businesses").select("creditos"),
    admin.from("wallets").select("saldo"),
    admin.from("referrals").select("monto_venta, estado").eq("estado", "confirmado"),
  ]);

  const comisionesPagadas = (comis.data ?? []).reduce((s, c) => s + num(c.monto), 0);
  const creditosCirculando = (negs.data ?? []).reduce((s, n) => s + num(n.creditos), 0);
  const porPagar = (wallets.data ?? []).reduce((s, w) => s + num(w.saldo), 0);
  const ventas = (refs.data ?? []).length;
  const gmv = (refs.data ?? []).reduce((s, r) => s + num(r.monto_venta), 0);

  return {
    usuarios: usuarios ?? 0,
    negocios: negocios ?? 0,
    ventas,
    gmv,
    comisionesPagadas,
    creditosCirculando,
    porPagar,
  };
}

// ── Serie temporal de GMV (para la gráfica del Overview) ──────────────────────
export interface PuntoSerie {
  dia: string; // etiqueta corta, ej "12 jul"
  gmv: number;
  ventas: number;
}

export async function getSerieGmv(dias = 14): Promise<PuntoSerie[]> {
  const admin = createAdminClient();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const desde = new Date(hoy);
  desde.setDate(hoy.getDate() - (dias - 1));

  const { data } = await admin
    .from("referrals")
    .select("monto_venta, created_at")
    .eq("estado", "confirmado")
    .gte("created_at", desde.toISOString());

  // Buckets por día para que la serie no tenga huecos aunque no haya ventas.
  const buckets: PuntoSerie[] = [];
  const idx = new Map<string, number>();
  for (let i = 0; i < dias; i++) {
    const d = new Date(desde);
    d.setDate(desde.getDate() + i);
    idx.set(claveDia(d), buckets.length);
    buckets.push({
      dia: d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
      gmv: 0,
      ventas: 0,
    });
  }

  for (const r of data ?? []) {
    const i = idx.get(claveDia(new Date(r.created_at)));
    if (i != null) {
      buckets[i].gmv += num(r.monto_venta);
      buckets[i].ventas += 1;
    }
  }

  return buckets;
}

// ── Órdenes / Ventas ──────────────────────────────────────────────────────────
export interface OrdenAdmin {
  id: string;
  folio: string;
  codigo: string;
  negocio: string;
  recomendador: string;
  estado: EstadoReferral;
  monto: number | null;
  comision: number | null;
  fecha: string;
}

export async function getOrdenesAdmin(limite?: number): Promise<OrdenAdmin[]> {
  const admin = createAdminClient();
  let q = admin
    .from("referrals")
    .select(
      "id, estado, created_at, monto_venta, comision, referral_codes(codigo, businesses(nombre), profiles(nombre))"
    )
    .order("created_at", { ascending: false });
  if (limite) q = q.limit(limite);

  const { data, error } = await q;
  if (error) throw new Error(`Error al cargar órdenes: ${error.message}`);

  return (data ?? []).map((r) => {
    const rc = one(r.referral_codes) as
      | { codigo?: string; businesses?: unknown; profiles?: unknown }
      | null;
    const neg = one(rc?.businesses) as { nombre?: string } | null;
    const emb = one(rc?.profiles) as { nombre?: string } | null;
    return {
      id: r.id,
      folio: r.id.substring(0, 8).toUpperCase(),
      codigo: rc?.codigo ?? "—",
      negocio: neg?.nombre ?? "—",
      recomendador: emb?.nombre ?? "—",
      estado: r.estado as EstadoReferral,
      monto: r.monto_venta != null ? num(r.monto_venta) : null,
      comision: r.comision != null ? num(r.comision) : null,
      fecha: r.created_at,
    };
  });
}

// ── Códigos activos (para crear órdenes de prueba) ────────────────────────────
export interface CodigoActivo {
  id: string;
  codigo: string;
  negocio: string;
  recomendador: string;
}

export async function getCodigosActivos(): Promise<CodigoActivo[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("referral_codes")
    .select("id, codigo, businesses(nombre), profiles(nombre)")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => {
    const neg = one(c.businesses) as { nombre?: string } | null;
    const emb = one(c.profiles) as { nombre?: string } | null;
    return {
      id: c.id,
      codigo: c.codigo,
      negocio: neg?.nombre ?? "—",
      recomendador: emb?.nombre ?? "—",
    };
  });
}

// Usuarios mínimos (para elegir el cliente de una orden de prueba).
export interface UsuarioMin {
  id: string;
  nombre: string;
}

export async function getUsuariosMin(): Promise<UsuarioMin[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id, nombre").order("nombre");
  return (data ?? []).map((p) => ({ id: p.id, nombre: p.nombre || "(sin nombre)" }));
}

// Candidatos a dueño de negocio: usuarios con rol 'negocio'.
export async function getCandidatosDueno(): Promise<UsuarioMin[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id, nombre, roles").order("nombre");
  return (data ?? [])
    .filter((p) => ((p.roles as string[]) ?? []).includes("negocio"))
    .map((p) => ({ id: p.id, nombre: p.nombre || "(sin nombre)" }));
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
export interface UsuarioAdmin {
  id: string;
  nombre: string;
  telefono: string | null;
  roles: Rol[];
  ventas: number; // ventas que generó como recomendador
  ganado: number; // comisiones acumuladas
  saldo: number; // saldo actual en su wallet (comisiones + ajustes − retiros)
}

export async function getUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const admin = createAdminClient();
  const [{ data: perfiles, error }, { data: comis }, { data: wallets }] = await Promise.all([
    admin.from("profiles").select("id, nombre, telefono, roles").order("nombre"),
    admin.from("comisiones").select("embajador_id, monto"),
    admin.from("wallets").select("user_id, saldo"),
  ]);
  if (error) throw new Error(`Error al cargar usuarios: ${error.message}`);

  const porEmbajador = new Map<string, { ventas: number; ganado: number }>();
  for (const c of comis ?? []) {
    const acc = porEmbajador.get(c.embajador_id) ?? { ventas: 0, ganado: 0 };
    acc.ventas += 1;
    acc.ganado += num(c.monto);
    porEmbajador.set(c.embajador_id, acc);
  }
  const saldoPorUser = new Map((wallets ?? []).map((w) => [w.user_id, num(w.saldo)]));

  return (perfiles ?? []).map((p) => {
    const agg = porEmbajador.get(p.id) ?? { ventas: 0, ganado: 0 };
    return {
      id: p.id,
      nombre: p.nombre || "(sin nombre)",
      telefono: p.telefono ?? null,
      roles: (p.roles as Rol[]) ?? [],
      ventas: agg.ventas,
      ganado: agg.ganado,
      saldo: saldoPorUser.get(p.id) ?? 0,
    };
  });
}

// ── Negocios ──────────────────────────────────────────────────────────────────
export interface NegocioAdmin {
  id: string;
  nombre: string;
  categoria: string;
  activo: boolean;
  creditos: number;
  comisionTipo: "fijo" | "porcentaje";
  comisionValor: number;
  ownerId: string | null;
  dueno: string | null;
  ventas: number;
  comisionesPagadas: number;
}

export async function getNegociosAdmin(): Promise<NegocioAdmin[]> {
  const admin = createAdminClient();
  const [{ data: negs, error }, { data: comis }, { data: perfiles }] = await Promise.all([
    admin
      .from("businesses")
      .select("id, nombre, categoria, activo, creditos, comision_tipo, comision_valor, owner_id")
      .order("nombre"),
    admin.from("comisiones").select("negocio_id, monto"),
    admin.from("profiles").select("id, nombre"),
  ]);
  if (error) throw new Error(`Error al cargar negocios: ${error.message}`);

  const nombrePorId = new Map((perfiles ?? []).map((p) => [p.id, p.nombre as string]));
  const porNegocio = new Map<string, { ventas: number; pagado: number }>();
  for (const c of comis ?? []) {
    const acc = porNegocio.get(c.negocio_id) ?? { ventas: 0, pagado: 0 };
    acc.ventas += 1;
    acc.pagado += num(c.monto);
    porNegocio.set(c.negocio_id, acc);
  }

  return (negs ?? []).map((n) => {
    const agg = porNegocio.get(n.id) ?? { ventas: 0, pagado: 0 };
    return {
      id: n.id,
      nombre: n.nombre,
      categoria: n.categoria,
      activo: n.activo,
      creditos: num(n.creditos),
      comisionTipo: (n.comision_tipo as "fijo" | "porcentaje") ?? "fijo",
      comisionValor: num(n.comision_valor),
      ownerId: n.owner_id ?? null,
      dueno: n.owner_id ? nombrePorId.get(n.owner_id) ?? null : null,
      ventas: agg.ventas,
      comisionesPagadas: agg.pagado,
    };
  });
}

// ── Finanzas ──────────────────────────────────────────────────────────────────
export interface MovimientoFinanciero {
  id: string;
  fecha: string;
  tipo: "comision" | "recarga" | "ajuste";
  desc: string;
  monto: number;
}

export interface FinanzasAdmin {
  comisionesPagadas: number;
  recargasTotal: number;
  creditosCirculando: number;
  porPagar: number;
  movimientos: MovimientoFinanciero[];
}

export async function getFinanzasAdmin(): Promise<FinanzasAdmin> {
  const admin = createAdminClient();
  const [{ data: comis }, { data: recargas }, { data: ajustes }, { data: negs }, { data: wallets }, { data: perfiles }] =
    await Promise.all([
      admin.from("comisiones").select("id, monto, created_at, embajador_id, businesses(nombre)").order("created_at", { ascending: false }),
      admin.from("recargas").select("id, monto, created_at, businesses(nombre)").order("created_at", { ascending: false }),
      admin.from("ajustes_saldo").select("id, monto, motivo, created_at, user_id").order("created_at", { ascending: false }),
      admin.from("businesses").select("creditos"),
      admin.from("wallets").select("saldo"),
      admin.from("profiles").select("id, nombre"),
    ]);

  const nombrePorId = new Map((perfiles ?? []).map((p) => [p.id, p.nombre as string]));

  const movComis: MovimientoFinanciero[] = (comis ?? []).map((c) => {
    const neg = one(c.businesses) as { nombre?: string } | null;
    return {
      id: `C-${c.id.substring(0, 8)}`,
      fecha: c.created_at,
      tipo: "comision",
      desc: `Comisión a ${nombrePorId.get(c.embajador_id) ?? "recomendador"} · ${neg?.nombre ?? ""}`.trim(),
      monto: num(c.monto),
    };
  });
  const movRecargas: MovimientoFinanciero[] = (recargas ?? []).map((r) => {
    const neg = one(r.businesses) as { nombre?: string } | null;
    return {
      id: `R-${r.id.substring(0, 8)}`,
      fecha: r.created_at,
      tipo: "recarga",
      desc: `Recarga de créditos · ${neg?.nombre ?? ""}`.trim(),
      monto: num(r.monto),
    };
  });
  const movAjustes: MovimientoFinanciero[] = (ajustes ?? []).map((a) => {
    const nombre = nombrePorId.get(a.user_id) ?? "usuario";
    const signo = num(a.monto) >= 0 ? "Asignación" : "Retiro manual";
    return {
      id: `A-${a.id.substring(0, 8)}`,
      fecha: a.created_at,
      tipo: "ajuste",
      desc: `${signo} de saldo · ${nombre}${a.motivo ? ` · ${a.motivo}` : ""}`,
      monto: num(a.monto),
    };
  });

  const movimientos = [...movComis, ...movRecargas, ...movAjustes].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return {
    comisionesPagadas: movComis.reduce((s, m) => s + m.monto, 0),
    recargasTotal: movRecargas.reduce((s, m) => s + m.monto, 0),
    creditosCirculando: (negs ?? []).reduce((s, n) => s + num(n.creditos), 0),
    porPagar: (wallets ?? []).reduce((s, w) => s + num(w.saldo), 0),
    movimientos,
  };
}
