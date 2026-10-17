import { Platform } from 'react-native';

import { supabase } from '../supabase';

/**
 * Avisos push de la app web (PWA), con Web Push estándar.
 *
 * La base de datos dispara los avisos (comisión, créditos bajos, recarga) y la
 * Edge Function `enviar-push` los entrega a las suscripciones guardadas en
 * `push_suscripciones`. Aquí vive lo del teléfono: pedir permiso, suscribir
 * este navegador y guardarlo a nombre de la cuenta en sesión.
 *
 * En iPhone solo funciona con la app instalada (Compartir → Agregar a
 * inicio, iOS 16.4+): en una pestaña de Safari o Chrome no existe PushManager.
 * En la app nativa no aplica (eso sería expo-notifications).
 */

// Llave pública VAPID: es pública por diseño. La privada vive solo en los
// secretos de la función enviar-push.
const VAPID_PUBLICA = 'BG3gv3a03h1n5cgqKQQHTY5J6ImegVzKV2T9rGfZeCtZq33pEfggQ9SGKL3kGMY2Lze_U4J6Uqh5Dq7rSsxYFrY';

export type EstadoAvisos =
  /** App nativa: este flujo no aplica. */
  | 'nativa'
  /** iPhone en el navegador: primero hay que instalar la app. */
  | 'instalar'
  /** Navegador sin Web Push. */
  | 'no-soportado'
  /** El usuario dijo que no: solo se cambia en los ajustes del teléfono. */
  | 'bloqueado'
  | 'apagado'
  | 'activo';

const esIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function soportaPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** Se llama al arrancar la app en web: deja listo el service worker. */
export function registrarServiceWorker() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

async function suscripcionActual(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration('/');
  return (await reg?.pushManager.getSubscription()) ?? null;
}

export async function estadoAvisos(): Promise<EstadoAvisos> {
  if (Platform.OS !== 'web') return 'nativa';
  if (!soportaPush()) return esIOS() ? 'instalar' : 'no-soportado';
  if (Notification.permission === 'denied') return 'bloqueado';
  if (Notification.permission !== 'granted') return 'apagado';
  return (await suscripcionActual()) ? 'activo' : 'apagado';
}

function llaveEnBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const relleno = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Pide permiso, suscribe este navegador y lo guarda en la cuenta en sesión.
 * Llamarla directo desde el toque: iPhone solo enseña el permiso si la
 * petición sale de un toque, así que lo primero que hace es pedirlo.
 */
export async function activarAvisos(): Promise<{ ok: boolean; estado: EstadoAvisos; error: string | null }> {
  if (Platform.OS !== 'web' || !soportaPush()) return { ok: false, estado: await estadoAvisos(), error: null };

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    return { ok: false, estado: permiso === 'denied' ? 'bloqueado' : 'apagado', error: null };
  }

  try {
    await navigator.serviceWorker.register('/sw.js');
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: llaveEnBytes(VAPID_PUBLICA) }));

    const { endpoint, keys } = sub.toJSON();
    const { error } = await supabase.rpc('guardar_suscripcion_push', {
      p_endpoint: endpoint,
      p_p256dh: keys?.p256dh,
      p_auth: keys?.auth,
      p_agente: navigator.userAgent,
    });
    if (error) throw error;
    return { ok: true, estado: 'activo', error: null };
  } catch {
    return { ok: false, estado: 'apagado', error: 'No pudimos activar los avisos. Intenta de nuevo.' };
  }
}

/** Deja de avisar a este teléfono (la cuenta sigue avisando a los demás). */
export async function apagarAvisos(): Promise<void> {
  if (Platform.OS !== 'web' || !soportaPush()) return;
  const sub = await suscripcionActual();
  if (!sub) return;
  await supabase.from('push_suscripciones').delete().eq('endpoint', sub.endpoint);
  await sub.unsubscribe().catch(() => {});
}

/** Al cerrar sesión: que este teléfono deje de recibir avisos de esa cuenta. */
export async function olvidarEsteTelefono(): Promise<void> {
  try {
    await apagarAvisos();
  } catch {
    // Cerrar sesión no debe fallar por esto.
  }
}

/** Manda un aviso de prueba a los teléfonos de la cuenta en sesión. */
export async function avisoDePrueba(): Promise<{ ok: boolean; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('enviar-push', { body: {} });
  if (error || !data?.ok) return { ok: false, error: 'No pudimos mandar la prueba. Intenta de nuevo.' };
  if (!data.enviados) return { ok: false, error: 'Este teléfono no quedó suscrito. Apaga y vuelve a activar los avisos.' };
  return { ok: true, error: null };
}
