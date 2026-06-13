import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Business, EstadoReferral } from "./types";

export interface CodigoConNegocio {
  codigo: string;
  recomendador: string | null;
  negocio: Pick<
    Business,
    "id" | "nombre" | "categoria" | "descripcion" | "direccion" | "oferta"
  >;
}

// Resuelve un código HAZLO-XXXX al negocio, su oferta y quién recomienda.
// Es la consulta del deep link /r/[code] — funciona sin sesión (RLS lo permite).
export async function getCodigoConNegocio(
  codigo: string
): Promise<CodigoConNegocio | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("referral_codes")
    .select(
      "codigo, embajador_id, businesses(id, nombre, categoria, descripcion, direccion, oferta)"
    )
    .eq("codigo", codigo.toUpperCase())
    .eq("activo", true)
    .maybeSingle();

  if (error || !data) return null;

  // Sin tipos generados de la BD, supabase-js infiere la relación como array.
  const negocio = Array.isArray(data.businesses)
    ? data.businesses[0]
    : data.businesses;
  if (!negocio) return null;

  // Los perfiles no son legibles de forma anónima (RLS). El nombre del
  // recomendador se lee server-side con el admin client, solo ese campo.
  let recomendador: string | null = null;
  if (data.embajador_id) {
    const admin = createAdminClient();
    const { data: perfil } = await admin
      .from("profiles")
      .select("nombre")
      .eq("id", data.embajador_id)
      .maybeSingle();
    recomendador = perfil?.nombre ?? null;
  }

  return { codigo: data.codigo, recomendador, negocio };
}

export interface RegistroUso {
  ok: boolean;
  folio: string | null;
}

// Registra un uso del código (el cliente presenta la pantalla al negocio).
// Corre server-side con admin client: el cliente puede ser anónimo en el MVP
// (cliente_id null) o, si hay sesión, el uso queda ligado a su cuenta.
// Queda en estado 'pendiente' hasta que el negocio lo confirme.
export async function registrarUsoCodigo(codigo: string): Promise<RegistroUso> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: codigoRow } = await admin
    .from("referral_codes")
    .select("id")
    .eq("codigo", codigo.toUpperCase())
    .eq("activo", true)
    .maybeSingle();

  if (!codigoRow) return { ok: false, folio: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: referral, error } = await admin
    .from("referrals")
    .insert({ codigo_id: codigoRow.id, cliente_id: user?.id ?? null })
    .select("id")
    .single();

  if (error || !referral) return { ok: false, folio: null };

  // Folio corto legible para mostrar al negocio.
  return { ok: true, folio: referral.id.substring(0, 8).toUpperCase() };
}

export interface VisitaNegocio {
  id: string;
  folio: string;
  codigo: string;
  estado: EstadoReferral;
  creada: string;
  confirmada: string | null;
}

// Visitas (usos de código) del negocio del usuario en sesión.
// RLS garantiza que solo ve las de su propio negocio.
// Devuelve null si no hay sesión.
export async function getVisitasDelNegocio(): Promise<VisitaNegocio[] | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("referrals")
    .select("id, estado, created_at, confirmado_at, referral_codes(codigo)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al cargar visitas: ${error.message}`);

  return (data ?? []).map((r) => {
    const rc = Array.isArray(r.referral_codes)
      ? r.referral_codes[0]
      : r.referral_codes;
    return {
      id: r.id,
      folio: r.id.substring(0, 8).toUpperCase(),
      codigo: rc?.codigo ?? "—",
      estado: r.estado as EstadoReferral,
      creada: r.created_at,
      confirmada: r.confirmado_at,
    };
  });
}

// El negocio confirma o rechaza una visita pendiente.
// RLS (referral_update_negocio) garantiza que solo puede tocar las suyas.
export async function resolverVisita(
  id: string,
  decision: "confirmado" | "rechazado"
): Promise<{ ok: boolean }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("referrals")
    .update({
      estado: decision,
      confirmado_at: decision === "confirmado" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("estado", "pendiente")
    .select("id");

  return { ok: !error && (data?.length ?? 0) > 0 };
}
