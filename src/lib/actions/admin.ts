"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/services/admin";

export interface ResultadoAccion {
  ok: boolean;
  mensaje: string;
}

function refrescarAdmin() {
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin");
  revalidatePath("/admin/finanzas");
  revalidatePath("/admin/negocios");
  revalidatePath("/admin/users");
}

// Crea una orden de prueba: registra un uso de código (referral pendiente),
// como si un cliente lo reclamara. Sirve para auditar el flujo end-to-end.
export async function crearOrdenPrueba(
  codigoId: string,
  clienteId: string | null
): Promise<ResultadoAccion> {
  await requireAdmin();
  if (!codigoId) return { ok: false, mensaje: "Elige un código de referido." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("referrals")
    .insert({ codigo_id: codigoId, cliente_id: clienteId || null });

  if (error) return { ok: false, mensaje: error.message };
  refrescarAdmin();
  return { ok: true, mensaje: "Orden de prueba creada (pendiente)." };
}

// Confirma una orden (como lo haría el negocio al escanear). Mueve dinero:
// usa la sesión del admin → confirmar_venta() lo permite por es_admin().
export async function confirmarOrden(
  referralId: string,
  monto?: number
): Promise<ResultadoAccion> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirmar_venta", {
    p_referral_id: referralId,
    p_monto_venta: monto ?? null,
  });

  if (error) return { ok: false, mensaje: error.message };
  refrescarAdmin();
  const r = (data ?? {}) as { comision?: number };
  return {
    ok: true,
    mensaje: r.comision != null ? `Venta confirmada · $${Number(r.comision).toFixed(2)} de comisión.` : "Venta confirmada.",
  };
}

// Rechaza una orden pendiente (no mueve dinero).
export async function rechazarOrden(referralId: string): Promise<ResultadoAccion> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("referrals")
    .update({ estado: "rechazado", confirmado_at: null })
    .eq("id", referralId)
    .eq("estado", "pendiente");

  if (error) return { ok: false, mensaje: error.message };
  refrescarAdmin();
  return { ok: true, mensaje: "Orden rechazada." };
}
