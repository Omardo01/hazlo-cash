"use server";

import { loginConEmail, type ResultadoLogin } from "@/lib/services/auth";

export async function login(
  email: string,
  password: string
): Promise<ResultadoLogin> {
  return loginConEmail(email, password);
}
