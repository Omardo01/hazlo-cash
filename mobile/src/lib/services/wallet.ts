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

export interface AjusteItem {
  id: string;
  /** Positivo = Hazlo Cash le sumó saldo; negativo = se lo quitó. */
  monto: number;
  motivo: string | null;
  creada: string;
}

// Ajustes manuales de saldo que hizo un admin (admin_ajustar_saldo). Forman
// parte del saldo del wallet, así que sin ellos "Ganado" no cuadra con el saldo.
// RLS (ajuste_select_propio); el filtro por user_id evita que un admin vea los
// de todos en su propia pantalla.
export async function getMisAjustes(): Promise<AjusteItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ajustes_saldo')
    .select('id, monto, motivo, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al cargar ajustes: ${error.message}`);

  return (data ?? []).map((a) => ({
    id: a.id,
    monto: Number(a.monto),
    motivo: a.motivo,
    creada: a.created_at,
  }));
}
