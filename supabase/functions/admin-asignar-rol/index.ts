// Edge Function: admin-asignar-rol
// Capa de admin server-side. Asignar/quitar roles a un usuario.
//
// Seguridad: el cliente NO puede tocar profiles.roles (ver migración
// 20260613_seguridad_roles). Esta función corre con SERVICE ROLE, pero
// SOLO actúa si quien la llama está autenticado y tiene rol 'admin'.
//
// Llamada (desde la app/web, con la sesión del admin):
//   POST  { email: string, roles: string[] }
//   Header: Authorization: Bearer <access_token del admin>

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

  // 1) Identificar a quien llama por su JWT (Supabase verifica la firma).
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Falta autorización' }, 401);

  const caller = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return json({ error: 'No autenticado' }, 401);

  // 2) Verificar que el que llama es admin (con service role, lectura confiable).
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: perfilLlamante } = await admin
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .maybeSingle();
  if (!perfilLlamante?.roles?.includes('admin')) {
    return json({ error: 'Requiere rol admin' }, 403);
  }

  // 3) Validar input. Se acepta userId (preferido) o email.
  let body: { userId?: string; email?: string; roles?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }
  const userId = (body.userId ?? '').toString().trim();
  const email = (body.email ?? '').toString().trim().toLowerCase();
  const roles = body.roles;
  if (!userId && !email) return json({ error: 'Falta userId o email' }, 400);
  if (!Array.isArray(roles) || roles.length === 0 || roles.some((r) => !ROLES_VALIDOS.includes(r))) {
    return json({ error: `roles debe ser un arreglo no vacío de: ${ROLES_VALIDOS.join(', ')}` }, 400);
  }

  // 4) Resolver el usuario destino (por id directo o buscándolo por email).
  let destinoId = userId;
  if (!destinoId) {
    const { data: lista, error: errLista } = await admin.auth.admin.listUsers();
    if (errLista) return json({ error: errLista.message }, 500);
    const destino = lista.users.find((u) => u.email?.toLowerCase() === email);
    if (!destino) return json({ error: 'Usuario no encontrado' }, 404);
    destinoId = destino.id;
  }

  // 5) Asignar roles (privilegiado, server-side).
  const { error } = await admin.from('profiles').update({ roles }).eq('id', destinoId);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, userId: destinoId, roles, por: user.email });
}

if (import.meta.main) Deno.serve(handler);
