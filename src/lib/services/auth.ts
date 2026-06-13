import { createClient } from "@/lib/supabase/server";
import type { Rol } from "./types";

export interface ResultadoLogin {
  ok: boolean;
  destino: string | null;
  error: string | null;
}

// Destino post-login según los roles del perfil.
function destinoPorRoles(roles: Rol[]): string {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("negocio")) return "/negocio";
  if (roles.includes("embajador")) return "/recomendador";
  return "/cliente";
}

export async function loginConEmail(
  email: string,
  password: string
): Promise<ResultadoLogin> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      destino: null,
      error: "Correo o contraseña incorrectos. Revisa tus datos.",
    };
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    ok: true,
    destino: destinoPorRoles((perfil?.roles as Rol[]) ?? []),
    error: null,
  };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
