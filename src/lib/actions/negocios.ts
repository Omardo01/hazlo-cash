"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/services/admin";

export interface ResultadoAccion {
  ok: boolean;
  mensaje: string;
}

function refrescar() {
  revalidatePath("/admin/negocios");
  revalidatePath("/admin");
  revalidatePath("/admin/finanzas");
  revalidatePath("/admin/ordenes");
}

// Recargar créditos: pasa por la RPC (valida es_admin con la sesión del admin).
export async function recargarCreditos(negocioId: string, monto: number): Promise<ResultadoAccion> {
  await requireAdmin();
  if (!negocioId || !(monto > 0)) return { ok: false, mensaje: "Escribe un monto mayor a 0." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_recargar_creditos", {
    p_negocio_id: negocioId,
    p_monto: monto,
  });
  if (error) return { ok: false, mensaje: error.message };
  refrescar();
  return { ok: true, mensaje: `Créditos activados. Nuevo saldo $${Number(data).toFixed(2)}.` };
}

export async function setComisionNegocio(
  negocioId: string,
  tipo: "fijo" | "porcentaje",
  valor: number
): Promise<ResultadoAccion> {
  await requireAdmin();
  if (!(valor >= 0)) return { ok: false, mensaje: "Comisión inválida." };
  if (tipo === "porcentaje" && valor > 100) return { ok: false, mensaje: "El porcentaje no puede ser mayor a 100." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("businesses")
    .update({ comision_tipo: tipo, comision_valor: valor })
    .eq("id", negocioId);
  if (error) return { ok: false, mensaje: error.message };
  refrescar();
  return { ok: true, mensaje: "Comisión actualizada." };
}

export async function asignarDuenoNegocio(
  negocioId: string,
  ownerId: string | null
): Promise<ResultadoAccion> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("businesses").update({ owner_id: ownerId }).eq("id", negocioId);
  if (error) return { ok: false, mensaje: error.message };
  refrescar();
  return { ok: true, mensaje: ownerId ? "Dueño asignado. Ya puede operar el negocio." : "Se quitó el dueño." };
}

export async function setNegocioActivo(negocioId: string, activo: boolean): Promise<ResultadoAccion> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("businesses").update({ activo }).eq("id", negocioId);
  if (error) return { ok: false, mensaje: error.message };
  refrescar();
  return { ok: true, mensaje: activo ? "Negocio activado." : "Negocio desactivado." };
}

export interface NuevoNegocioInput {
  nombre: string;
  categoria: string;
  direccion?: string;
  oferta?: string;
  descripcion?: string;
  comisionTipo: "fijo" | "porcentaje";
  comisionValor: number;
}

export async function crearNegocio(n: NuevoNegocioInput): Promise<ResultadoAccion> {
  await requireAdmin();
  if (!n.nombre.trim()) return { ok: false, mensaje: "Escribe el nombre del negocio." };
  if (!n.categoria) return { ok: false, mensaje: "Selecciona una categoría." };
  const admin = createAdminClient();
  const { error } = await admin.from("businesses").insert({
    nombre: n.nombre.trim(),
    categoria: n.categoria,
    direccion: n.direccion?.trim() || null,
    oferta: n.oferta?.trim() || null,
    descripcion: n.descripcion?.trim() || null,
    comision_tipo: n.comisionTipo,
    comision_valor: n.comisionValor,
    owner_id: null,
  });
  if (error) return { ok: false, mensaje: error.message };
  refrescar();
  return { ok: true, mensaje: `"${n.nombre.trim()}" dado de alta.` };
}
