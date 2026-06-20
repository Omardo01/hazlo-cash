import { supabase } from '../supabase';

// Saldo acumulado del recomendador en sesión. RLS (wallet_select_propio).
// Devuelve 0 si aún no tiene wallet (no ha ganado su primera comisión).
export async function getMiSaldo(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('wallets')
    .select('saldo')
    .eq('user_id', user.id)
    .maybeSingle();

  return data ? Number(data.saldo) : 0;
}

export interface ComisionItem {
  id: string;
  negocio: string;
  monto: number;
  creada: string;
}

// Historial de comisiones ganadas por el recomendador. RLS (comision_select_embajador).
export async function getMisComisiones(): Promise<ComisionItem[]> {
  const { data, error } = await supabase
    .from('comisiones')
    .select('id, monto, created_at, businesses(nombre)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al cargar comisiones: ${error.message}`);

  return (data ?? []).map((c) => {
    const n = Array.isArray(c.businesses) ? c.businesses[0] : c.businesses;
    return {
      id: c.id,
      negocio: n?.nombre ?? 'Negocio',
      monto: Number(c.monto),
      creada: c.created_at,
    };
  });
}
