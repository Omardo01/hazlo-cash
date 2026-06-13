import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/lib/auth-context';
import { getMiPerfil } from '@/lib/services/auth';
import type { Profile } from '@/lib/types';
import { AdminApp } from '@/hazlo/AdminApp';
import { ClienteEmbajadorApp } from '@/hazlo/ClienteEmbajadorApp';
import { NegocioApp } from '@/hazlo/NegocioApp';
import { Splash } from '@/hazlo/Splash';
import { LoginScreen } from '@/hazlo/screens/Login';
import { BG } from '@/hazlo/theme';

// Router por rol: decide qué experiencia mostrar según los roles del perfil.
export default function HazloApp() {
  const { session, loading } = useAuth();
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [perfilCargado, setPerfilCargado] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!session) {
      setPerfil(null);
      setPerfilCargado(true);
      return;
    }
    setPerfilCargado(false);
    let activo = true;
    getMiPerfil().then((p) => {
      if (activo) {
        setPerfil(p);
        setPerfilCargado(true);
      }
    });
    return () => {
      activo = false;
    };
  }, [session]);

  const splash = showSplash ? <Splash onDone={() => setShowSplash(false)} /> : null;

  // Verificando sesión guardada, o ya hay sesión pero aún cargando el perfil
  // (evita un parpadeo de la experiencia equivocada antes de saber el rol).
  if (loading || (session && !perfilCargado)) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <StatusBar style="dark" />
        {splash}
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <LoginScreen />
        </SafeAreaView>
        {splash}
      </View>
    );
  }

  // Experiencia según rol (prioridad: admin > negocio > cliente/embajador).
  const roles = perfil?.roles ?? [];
  const shell = roles.includes('admin') ? (
    <AdminApp />
  ) : roles.includes('negocio') ? (
    <NegocioApp />
  ) : (
    <ClienteEmbajadorApp />
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {shell}
      {splash}
    </View>
  );
}
