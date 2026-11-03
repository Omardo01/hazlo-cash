// Edge Function: registro-negocio
// Alta pública de un negocio con su cuenta dueña (decisión de Omar,
// 2026-10-27). Crea, con service role:
//   1) la cuenta (ya confirmada, como registro-prueba) con rol 'negocio';
//   2) la fila en businesses con owner_id = esa cuenta, activo = false y
//      por_aprobar = true: no sale en el catálogo hasta que el admin la active.
//
// El rol 'negocio' sólo se da aquí, en el servidor: el trigger handle_new_user
// sigue saneando los roles del metadata y el perfil nace 'cliente'; luego esta
// función lo cambia a 'negocio'. Sin activar y con 0 créditos, la cuenta no
// puede confirmar ventas ni mover dinero.
//
// Responsable y teléfono van al perfil del dueño (privado, anti-bypass), no a
// columnas de businesses que lee el catálogo. La aceptación del contrato para
// negocios y del aviso de privacidad se guarda en app_metadata.legal con la
// hora del servidor.
//
// Si llega `sugerencia` (el id del link /registro-negocio?s=… que el admin
// mandó por WhatsApp), el negocio nuevo se liga con todas las
// recomendaciones de ese negocio y quedan como sumadas. Si eso falla, el
// registro sigue: el admin lo puede ligar después.
//
// POST { negocio: { nombre, descripcion?, grupo, giros[], direccion, ciudad,
//        oferta }, responsable, telefono, email, password, legal?, sugerencia? }
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

const MAX_GIROS = 5;

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return falla('datos', 'JSON inválido');
  }

  const n = (body.negocio ?? {}) as Record<string, unknown>;
  const texto = (o: Record<string, unknown>, k: string, max: number) => String(o[k] ?? '').trim().slice(0, max);

  const nombre = texto(n, 'nombre', 80);
  const descripcion = texto(n, 'descripcion', 140);
  const grupo = texto(n, 'grupo', 40);
  const giros = (Array.isArray(n.giros) ? n.giros : [])
    .map((g) => String(g).trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, MAX_GIROS);
  const direccion = texto(n, 'direccion', 160);
  const ciudad = texto(n, 'ciudad', 80);
  const oferta = texto(n, 'oferta', 60);
  const responsable = texto(body, 'responsable', 80);
  const telefono = texto(body, 'telefono', 20).replace(/\D/g, '');
  const email = texto(body, 'email', 120).toLowerCase();
  const password = String(body.password ?? '');
  const legal = body.legal as Record<string, unknown> | undefined;
  const version = (k: string) => String(legal?.[k] ?? '').slice(0, 20);
  const sugerencia = String(body.sugerencia ?? '');
  const esUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sugerencia);

  if (nombre.length < 2) return falla('datos', 'Escribe el nombre del negocio.');
  if (!grupo || giros.length === 0) return falla('datos', 'Elige a qué se dedica tu negocio.');
  if (!direccion || !ciudad) return falla('datos', 'Escribe la dirección y la ciudad.');
  if (oferta.length < 3) return falla('datos', 'Escribe el beneficio para quien llega recomendado.');
  if (!responsable) return falla('datos', 'Escribe quién atiende el negocio.');
  if (telefono.length < 10) return falla('datos', 'El teléfono debe tener 10 dígitos.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return falla('datos', 'Escribe un correo válido.');
  if (password.length < 6) return falla('datos', 'La contraseña necesita al menos 6 caracteres.');
  if (!legal) return falla('datos', 'Acepta el contrato y el aviso de privacidad.');

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: creado, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: responsable, telefono },
    app_metadata: {
      // Etapa de pruebas: igual que registro-prueba, para poder limpiarlas.
      cuenta_prueba: true,
      legal: {
        contrato_negocios: version('contrato_negocios'),
        aviso_privacidad: version('aviso_privacidad'),
        aceptado_en: new Date().toISOString(),
      },
    },
  });

  if (error || !creado.user) {
    const m = (error?.message ?? '').toLowerCase();
    if (m.includes('already') || m.includes('exists')) {
      return falla('ya_existe', 'Ese correo ya tiene una cuenta. Usa otro o entra con él.');
    }
    return falla('error', error?.message ?? 'No se pudo crear la cuenta');
  }
  const userId = creado.user.id;

  // Si algo de aquí en adelante falla, se borra la cuenta: no debe quedar un
  // dueño sin negocio ni un negocio a medias.
  const deshacer = async (motivo: string) => {
    await admin.auth.admin.deleteUser(userId);
    return falla('error', motivo);
  };

  const perfil = await admin.from('profiles').update({ roles: ['negocio'] }).eq('id', userId);
  if (perfil.error) return deshacer(perfil.error.message);

  const negocio = await admin.from('businesses').insert({
    owner_id: userId,
    nombre,
    categoria: grupo,
    giros,
    descripcion: descripcion || null,
    direccion: `${direccion}, ${ciudad}`,
    oferta,
    activo: false,
    por_aprobar: true,
  }).select('id').single();
  if (negocio.error) return deshacer(negocio.error.message);

  if (esUuid) {
    const liga = await admin.rpc('vincular_sugerencia_negocio', {
      p_sugerencia_id: sugerencia,
      p_negocio_id: negocio.data.id,
    });
    if (liga.error) console.error('vincular_sugerencia_negocio', liga.error.message);
  }

  return json({ ok: true });
}

if (import.meta.main) Deno.serve(handler);
