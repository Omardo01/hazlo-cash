import { createBrowserClient } from "@supabase/ssr";

// Cliente para componentes con "use client".
// Usa solo la anon key — RLS protege los datos.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
