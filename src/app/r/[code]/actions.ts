"use server";

import { registrarUsoCodigo, type RegistroUso } from "@/lib/services/referrals";

export async function registrarVisita(codigo: string): Promise<RegistroUso> {
  return registrarUsoCodigo(codigo);
}
