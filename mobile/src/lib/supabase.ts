import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
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
