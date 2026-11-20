import { supabase } from '../supabase';

/** Algo que vende el negocio: un platillo, un servicio. El precio es opcional. */
export interface ItemMenu {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
}

export type ItemMenuNuevo = Omit<ItemMenu, 'id'>;

// RLS menu_select: cualquiera lee el menú de un negocio activo (también sin cuenta).
export async function getMenu(negocioId: string): Promise<ItemMenu[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, nombre, descripcion, precio')
    .eq('negocio_id', negocioId)
    .order('orden');
  if (error) throw new Error(`Error al cargar el menú: ${error.message}`);
  return (data ?? []).map((i) => ({ ...i, precio: i.precio === null ? null : Number(i.precio) })) as ItemMenu[];
}

// Reemplaza el menú completo. guardar_menu() valida que seas el dueño o admin.
export async function guardarMenu(negocioId: string, items: ItemMenuNuevo[]): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.rpc('guardar_menu', {
    p_negocio_id: negocioId,
    p_items: items.map((i) => ({ nombre: i.nombre.trim(), descripcion: i.descripcion?.trim() || null, precio: i.precio })),
  });
  if (!error) return { ok: true, error: null };
  if (error.code === '42501') return { ok: false, error: 'Solo el dueño o el administrador pueden editar este menú.' };
  return { ok: false, error: 'No se pudo guardar el menú. Revisa nombres y precios.' };
}
