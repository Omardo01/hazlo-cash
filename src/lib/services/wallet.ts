import { createClient } from "@/lib/supabase/client";

// Saldo acumulado del recomendador en sesión. RLS (wallet_select_propio).
// Devuelve null si no hay sesión (la vista cae a un valor de demo).
export async function getMiSaldo(): Promise<number | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("wallets")
    .select("saldo")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? Number(data.saldo) : 0;
}
