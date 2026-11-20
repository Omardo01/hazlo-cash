import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

import { limpiarTodo } from './datos/cache';
import { supabase } from './supabase';

interface AuthState {
  session: Session | null;
  // loading = aún no sabemos si hay sesión guardada (primer chequeo en AsyncStorage).
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesión guardada (si la hay) al arrancar.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Reacciona a login / logout / refresh de token.
    // undefined = aún no sabemos quién es; null = sin sesión.
    let usuario: string | null | undefined;
    const { data: sub } = supabase.auth.onAuthStateChange((evento, nuevaSesion) => {
      // Cada vez que cambia la cuenta (cerrar sesión, entrar después de ver la
      // landing, cambiar de usuario) se tira la caché en memoria: nadie debe
      // ver un saldo de la anterior, ni un perfil «sin sesión» que ya no es
      // cierto (eso mandaba al admin fuera de /mapa al recién entrar).
      const nuevo = nuevaSesion?.user.id ?? null;
      if (evento === 'SIGNED_OUT' || (usuario !== undefined && nuevo !== usuario)) limpiarTodo();
      usuario = nuevo;
      setSession(nuevaSesion);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
