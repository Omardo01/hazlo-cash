import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con service role — IGNORA RLS. Solo para uso en servidor:
// motor de comisiones, webhooks de pagos, tareas administrativas.
// JAMÁS importar desde un componente cliente.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
