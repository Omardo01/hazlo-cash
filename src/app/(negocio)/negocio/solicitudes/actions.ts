"use server";

import { resolverVisita } from "@/lib/services/referrals";

export async function confirmarVisita(id: string) {
  return resolverVisita(id, "confirmado");
}

export async function rechazarVisita(id: string) {
  return resolverVisita(id, "rechazado");
}
