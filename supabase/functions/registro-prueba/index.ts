// Edge Function: registro-prueba
// Alta pública de cuentas de PRUEBA, ya confirmadas: sin correo de
// verificación y aceptando correos inventados. El signup normal de Supabase
// exige confirmar el correo (está encendido) y rechaza dominios que no existen,
// lo que estorba para probar con varias cuentas.
//
// Es temporal, para la etapa de pruebas (2026-10). Para volver al alta normal:
// REGISTRO_DE_PRUEBA = false en mobile/src/lib/services/auth.ts.
//
// Por ahora todo el que se registra es recomendador (decisión de Omar,
// 2026-10-15): nace sólo con 'embajador'. Seguridad igual que el registro
// público: el trigger handle_new_user vuelve a sanear los roles del metadata y
// 'negocio' / 'admin' siguen siendo cosa de un administrador. Cada cuenta
// queda marcada en app_metadata.cuenta_prueba (el usuario no puede editarlo)
// para poder limpiarlas después.
//
// POST { nombre, email, password, telefono? }
// → { ok: true } | { ok: false, codigo: 'datos' | 'ya_existe' | 'error', error }
// Los errores esperados vuelven con 200 para que la app los lea en `data`.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

const falla = (codigo: string, error: string) => json({ ok: false, codigo, error });

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return falla('datos', 'JSON inválido');
  }

  const texto = (k: string) => String(body[k] ?? '').trim();
  const nombre = texto('nombre').slice(0, 80);
  const email = texto('email').toLowerCase();
  const telefono = texto('telefono').slice(0, 20);
  const password = String(body.password ?? '');
  const roles = ['embajador'];

  if (!nombre) return falla('datos', 'Escribe tu nombre.');
  // Correo inventado vale, pero con forma de correo: es el usuario para entrar.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return falla('datos', 'Escribe un correo con forma de correo (puede ser inventado).');
  }
  if (password.length < 6) return falla('datos', 'La contraseña necesita al menos 6 caracteres.');

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, telefono: telefono || null, roles },
    app_metadata: { cuenta_prueba: true },
  });

  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes('already') || m.includes('exists')) {
      return falla('ya_existe', 'Ese correo ya tiene una cuenta. Intenta entrar o usa otro.');
    }
    return falla('error', error.message);
  }

  return json({ ok: true });
}

if (import.meta.main) Deno.serve(handler);
