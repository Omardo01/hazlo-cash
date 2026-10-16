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

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

// Etapa de pruebas (2026-10): el registro crea cuentas ya confirmadas desde la
// Edge Function `registro-prueba` — sin correo de verificación y aceptando
// correos inventados. Para volver al alta normal con verificación: false.
export const REGISTRO_DE_PRUEBA = true;

// Alta de una cuenta nueva. Por ahora todo el que se registra es recomendador:
// nace sólo con 'embajador'. El perfil lo crea el trigger `handle_new_user`
// (security definer) leyendo este metadata y saneando los roles server-side —
// 'negocio' y 'admin' los asigna un administrador.
export async function registrarConEmail(d: DatosRegistro): Promise<ResultadoLogin> {
  if (REGISTRO_DE_PRUEBA) return registrarCuentaDePrueba(d);

  const roles = ['embajador'];

  const { data, error } = await supabase.auth.signUp({
    email: d.email.trim().toLowerCase(),
    password: d.password,
    options: {
      data: {
        nombre: d.nombre.trim(),
        telefono: d.telefono?.trim() || null,
        roles,
      },
    },
  });

  if (error) return { ok: false, error: mensajeRegistro(error.message) };

  // Con la confirmación de correo apagada, signUp ya devuelve sesión y el
  // AuthProvider cambia de pantalla solo. Si alguien la vuelve a encender en
  // Supabase, no hay sesión y hay que avisar en vez de dejar la pantalla muda.
  if (!data.session) {
    return { ok: false, error: 'Te enviamos un correo para confirmar tu cuenta. Ábrelo y vuelve a entrar.' };
  }

  return { ok: true, error: null };
}

// La función crea la cuenta ya confirmada; después se entra con la misma
// contraseña y el AuthProvider cambia de pantalla solo.
async function registrarCuentaDePrueba(d: DatosRegistro): Promise<ResultadoLogin> {
  const email = d.email.trim().toLowerCase();
  const { data, error } = await supabase.functions.invoke('registro-prueba', {
    body: {
      nombre: d.nombre.trim(),
      email,
      password: d.password,
      telefono: d.telefono?.trim() ?? '',
    },
  });

  if (error) return { ok: false, error: 'No pudimos crear tu cuenta. Revisa tu conexión e inténtalo de nuevo.' };
  const r = data as { ok?: boolean; codigo?: string; error?: string } | null;
  if (!r?.ok) {
    if (r?.codigo === 'datos' || r?.codigo === 'ya_existe') return { ok: false, error: r.error ?? 'Revisa tus datos.' };
    return { ok: false, error: 'No pudimos crear tu cuenta. Inténtalo de nuevo.' };
  }

  const entrar = await supabase.auth.signInWithPassword({ email, password: d.password });
  if (entrar.error) {
    return { ok: false, error: 'Tu cuenta quedó creada, pero no pudimos entrar. Usa «Entrar» con tu correo.' };
  }
  return { ok: true, error: null };
}

// Traducción de los errores de Supabase al tono de la app (claro y amigable).
function mensajeRegistro(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'Ese correo ya tiene una cuenta. Intenta entrar o usa otro.';
  }
  if (m.includes('password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('invalid') && m.includes('email')) return 'Ese correo no parece válido. Revísalo.';
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Demasiados intentos seguidos. Espera un momento y vuelve a probar.';
  }
  return 'No pudimos crear tu cuenta. Inténtalo de nuevo.';
}

// Actualiza los datos editables del perfil propio. Los `roles` NO se tocan
// desde el cliente (grants por columna, ver migración 20260613_seguridad_roles).
export async function actualizarMiPerfil(
  cambios: { nombre?: string; telefono?: string | null },
): Promise<{ ok: boolean; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No hay sesión activa.' };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (cambios.nombre !== undefined) payload.nombre = cambios.nombre.trim();
  if (cambios.telefono !== undefined) payload.telefono = cambios.telefono?.trim() || null;

  const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
