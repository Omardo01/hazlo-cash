// Edge Function: enviar-push
// Entrega avisos Web Push a los teléfonos suscritos de un usuario (la app web
// instalada como PWA). Se despliega con --no-verify-jwt porque la llamada
// principal no trae sesión; la autenticación se hace aquí:
//
// 1. Desde la base (disparadores de comisiones, créditos y recargas, vía
//    pg_net): header `x-push-secreto` igual al secreto PUSH_SECRETO.
//    POST { user_id, titulo, cuerpo, url? }
// 2. Prueba desde la app: un usuario con sesión (Authorization: Bearer <jwt>)
//    solo puede mandarse un aviso de prueba a sí mismo. POST {}
//
// Las suscripciones que el servicio de push da por muertas (404/410) se
// borran. Secretos: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
// PUSH_SECRETO.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

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

interface Aviso {
  titulo: string;
  cuerpo: string;
  url: string;
}

const PRUEBA: Aviso = {
  titulo: '¡Avisos activados!',
  cuerpo: 'Así te vamos a avisar cuando pase algo con tu dinero en Hazlo Cash.',
  url: '/',
};

// Comparación sin atajos para no filtrar el secreto por tiempos de respuesta.
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const secreto = Deno.env.get('PUSH_SECRETO') ?? '';
  const publica = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
  const privada = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
  if (!secreto || !publica || !privada) return json({ error: 'Faltan llaves de push en la función' }, 500);
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'https://hazlocash.com', publica, privada);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  let destino: string;
  let aviso: Aviso;
  const firmado = req.headers.get('x-push-secreto');

  if (firmado !== null) {
    if (!iguales(firmado, secreto)) return json({ error: 'No autorizado' }, 401);
    const b = await req.json().catch(() => ({}));
    destino = texto(b.user_id, 64);
    aviso = { titulo: texto(b.titulo, 80), cuerpo: texto(b.cuerpo, 200), url: texto(b.url, 200) || '/' };
    if (!destino || !aviso.titulo) return json({ error: 'Faltan datos del aviso' }, 400);
  } else {
    const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data, error } = await admin.auth.getUser(jwt);
    if (error || !data.user) return json({ error: 'No autorizado' }, 401);
    destino = data.user.id;
    aviso = PRUEBA;
  }

  const { data: subs, error } = await admin
    .from('push_suscripciones')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', destino);
  if (error) return json({ error: error.message }, 500);

  const payload = JSON.stringify({ title: aviso.titulo, body: aviso.cuerpo, url: aviso.url });
  const resultados = await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
          TTL: 60 * 60 * 24,
          urgency: 'high',
        });
        return 'enviado';
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from('push_suscripciones').delete().eq('id', s.id);
          return 'vencida';
        }
        return `error ${status ?? (e as Error).message}`;
      }
    }),
  );

  return json({ ok: true, enviados: resultados.filter((r) => r === 'enviado').length, resultados });
}

if (import.meta.main) Deno.serve(handler);
