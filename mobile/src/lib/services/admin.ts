import { supabase } from '../supabase';
import type { Rol } from '../types';

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  roles: Rol[];
}

// Lista de usuarios (vista admin). RLS perfil_select_admin permite al admin
// leer todos los perfiles. El email vive en auth.users (no accesible desde el
// cliente); aquí mostramos nombre + roles, suficiente para gestionar roles.
export async function getUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, roles')
    .order('nombre');

  if (error) throw new Error(`Error al cargar usuarios: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre || '(sin nombre)',
    roles: (p.roles as Rol[]) ?? [],
  }));
}

// Cambiar los roles de un usuario. Pasa por la Edge Function `admin-asignar-rol`
// (corre con service role y valida que quien llama es admin). El cliente NO
// puede tocar profiles.roles directo (ver seguridad-roles).
export async function asignarRol(
  userId: string,
  roles: Rol[],
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.functions.invoke('admin-asignar-rol', {
    body: { userId, roles },
  });
  if (error) {
    // Mensaje claro si la función aún no está desplegada.
    return {
      ok: false,
      error:
        'No se pudo cambiar el rol. ¿Está desplegada la función admin-asignar-rol? (' +
        error.message +
        ')',
    };
  }
  return { ok: true, error: null };
}
