import { createClient } from "@/lib/supabase/server";
import type { Business } from "./types";

// Catálogo público de negocios activos (vista Cliente).
export async function getNegociosActivos(): Promise<Business[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id, nombre, categoria, descripcion, direccion, oferta, activo")
    .eq("activo", true)
    .order("nombre");

  if (error) throw new Error(`Error al cargar negocios: ${error.message}`);
  return data ?? [];
}
