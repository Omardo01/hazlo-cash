// Edge Function: admin-usuarios
// Operaciones de administración de cuentas que NO pueden hacerse desde el
// cliente: el correo vive en auth.users (invisible para la app) y crear
// usuarios o cambiar contraseñas exige la service role.
//
// Seguridad: corre con SERVICE ROLE pero sólo actúa si quien llama está
// autenticado y tiene rol 'admin' (mismo patrón que admin-asignar-rol).
//
// POST { accion: 'listar' }
// POST { accion: 'crear', email, password, nombre?, telefono?, roles? }
// POST { accion: 'password', userId, password }

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ROLES_VALIDOS = ['cliente', 'embajador', 'negocio', 'admin'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 1) Identificar a quien llama por su JWT.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Falta autorización' }, 401);

  const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return json({ error: 'No autenticado' }, 401);

  // 2) Verificar que es admin (lectura confiable con service role).
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: perfil } = await admin.from('profiles').select('roles').eq('id', user.id).maybeSingle();
  if (!perfil?.roles?.includes('admin')) return json({ error: 'Requiere rol admin' }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const accion = String(body.accion ?? '');
  const texto = (k: string) => String(body[k] ?? '').trim();

  // -----------------------------------------------------------
  // listar — perfiles con su correo y fecha de alta.
  // -----------------------------------------------------------
  if (accion === 'listar') {
    const { data: cuentas, error: errAuth } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (errAuth) return json({ error: errAuth.message }, 500);

    const { data: perfiles, error: errPerf } = await admin
      .from('profiles')
      .select('id, nombre, telefono, roles, created_at');
    if (errPerf) return json({ error: errPerf.message }, 500);

    const porId = new Map(cuentas.users.map((u) => [u.id, u]));
    const usuarios = (perfiles ?? []).map((p) => {
      const cuenta = porId.get(p.id);
      return {
        id: p.id,
        nombre: p.nombre || '',
        telefono: p.telefono ?? null,
        roles: p.roles ?? [],
        email: cuenta?.email ?? null,
        creado: p.created_at,
        ultimoAcceso: cuenta?.last_sign_in_at ?? null,
      };
    });

    usuarios.sort((a, b) => (a.nombre || 'zzz').localeCompare(b.nombre || 'zzz', 'es'));
    return json({ usuarios });
  }

  // -----------------------------------------------------------
  // crear — alta de cuenta desde el panel, ya confirmada.
  // A diferencia del registro público, aquí sí se pueden asignar los roles
  // 'negocio' y 'admin': quien llama ya demostró ser administrador.
  // -----------------------------------------------------------
  if (accion === 'crear') {
    const email = texto('email').toLowerCase();
    const password = String(body.password ?? '');
    const nombre = texto('nombre');
    const telefono = texto('telefono');
    const roles = Array.isArray(body.roles) && body.roles.length ? (body.roles as string[]) : ['cliente'];

    if (!email.includes('@')) return json({ error: 'Correo inválido' }, 400);
    if (password.length < 6) return json({ error: 'La contraseña necesita al menos 6 caracteres' }, 400);
    if (roles.some((r) => !ROLES_VALIDOS.includes(r))) {
      return json({ error: `Roles válidos: ${ROLES_VALIDOS.join(', ')}` }, 400);
    }

    const { data: creado, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, telefono: telefono || null },
    });
    if (error || !creado.user) return json({ error: error?.message ?? 'No se pudo crear la cuenta' }, 500);

    // El trigger handle_new_user ya creó el perfil (con roles saneados a
    // cliente/embajador); aquí se fijan los definitivos y el teléfono.
    const { error: errPerfil } = await admin
      .from('profiles')
      .update({ nombre, telefono: telefono || null, roles })
      .eq('id', creado.user.id);
    if (errPerfil) return json({ error: errPerfil.message }, 500);

    return json({ ok: true, userId: creado.user.id, email, roles });
  }

  // -----------------------------------------------------------
  // password — el admin fija una contraseña nueva (soporte / demos).
  // -----------------------------------------------------------
  if (accion === 'password') {
    const userId = texto('userId');
    const password = String(body.password ?? '');
    if (!userId) return json({ error: 'Falta userId' }, 400);
    if (password.length < 6) return json({ error: 'La contraseña necesita al menos 6 caracteres' }, 400);

    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, userId });
  }

  return json({ error: `Acción no reconocida: ${accion}` }, 400);
}

if (import.meta.main) Deno.serve(handler);
