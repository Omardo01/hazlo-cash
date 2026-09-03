"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/services/admin";

export interface ResultadoAccion {
  ok: boolean;
  mensaje: string;
}

// Admin ajusta el saldo de un usuario: monto > 0 asigna, monto < 0 quita.
// Pasa por la RPC (valida es_admin y registra el movimiento server-side).
export async function ajustarSaldo(
  userId: string,
  monto: number,
  motivo: string
): Promise<ResultadoAccion> {
  await requireAdmin();
  if (!userId) return { ok: false, mensaje: "Usuario inválido." };
  if (!monto || monto === 0) return { ok: false, mensaje: "Escribe un monto distinto de 0." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_ajustar_saldo", {
    p_user_id: userId,
    p_monto: monto,
    p_motivo: motivo || null,
  });
  if (error) return { ok: false, mensaje: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/finanzas");

  const verbo = monto > 0 ? "asignados" : "retirados";
  return {
    ok: true,
    mensaje: `$${Math.abs(monto).toFixed(2)} ${verbo}. Nuevo saldo $${Number(data).toFixed(2)}.`,
  };
}
