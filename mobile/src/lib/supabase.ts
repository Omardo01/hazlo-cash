import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { ES_MARCO_ESCRITORIO } from './marco-web';

// Cliente Supabase para React Native. Mismo proyecto que la app web.
// La sesión se persiste en AsyncStorage (no cookies/SSR como en web).
// Solo usa la anon key — RLS protege los datos.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Revisa mobile/.env.local',
  );
}

// Solo web: el Laboratorio (/lab) monta varios teléfonos como iframes del mismo
// origen, y todos compartirían el mismo localStorage — una sola sesión. Con
// `?sesion=negocio` cada iframe guarda la suya bajo su propia llave. La página
// del laboratorio en sí no debe tener sesión (abriría Realtime y avisos), y
// tampoco el marco de escritorio de / (ver lib/marco-web.ts).
function llaveSesionWeb(): string | undefined {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
  if (window.location.pathname.startsWith('/lab') || ES_MARCO_ESCRITORIO) return 'hazlo-lab-sin-sesion';
  const slot = new URLSearchParams(window.location.search).get('sesion');
  return slot ? `hazlo-lab-${slot.replace(/[^a-z0-9-]/gi, '')}` : undefined;
}

// Ojo: `storageKey: undefined` explícito pisa la llave por defecto de Supabase
// y cierra todas las sesiones guardadas; solo se pasa cuando hay una.
const llaveWeb = llaveSesionWeb();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    ...(llaveWeb ? { storageKey: llaveWeb } : {}),
    autoRefreshToken: true,
    persistSession: true,
    // En móvil no hay URL de redirección que parsear (eso es para web/OAuth).
    detectSessionInUrl: false,
  },
});

// Refresca el token solo mientras la app está en primer plano. Patrón
// recomendado por Supabase para RN: evita refrescos en background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
