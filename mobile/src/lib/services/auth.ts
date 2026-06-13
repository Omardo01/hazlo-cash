import { supabase } from '../supabase';
import type { Profile, Rol } from '../types';

export interface ResultadoLogin {
  ok: boolean;
  error: string | null;
}

// Login con correo y contraseña. La sesión la persiste el cliente de Supabase
// en AsyncStorage; el AuthProvider reacciona vía onAuthStateChange.
export async function loginConEmail(
  email: string,
  password: string,
): Promise<ResultadoLogin> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return { ok: false, error: 'Correo o contraseña incorrectos. Revisa tus datos.' };
  }

  return { ok: true, error: null };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// Perfil del usuario en sesión (RLS: solo puede leer el suyo).
export async function getMiPerfil(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, nombre, telefono, avatar_url, roles')
    .eq('id', user.id)
    .maybeSingle();

  if (!data) return null;
  return { ...data, roles: (data.roles as Rol[]) ?? [] } as Profile;
}
