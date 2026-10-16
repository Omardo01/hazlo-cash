import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/lib/auth-context';
import { ES_MARCO_ESCRITORIO } from '@/lib/marco-web';
import { getMiPerfil } from '@/lib/services/auth';
import type { Profile } from '@/lib/types';
import { AdminApp } from '@/hazlo/AdminApp';
import { ClienteEmbajadorApp } from '@/hazlo/ClienteEmbajadorApp';
import { NegocioApp } from '@/hazlo/NegocioApp';
import { RoleSwitcher, type Experiencia } from '@/hazlo/RoleSwitcher';
import { Escritorio } from '@/hazlo/lab/Escritorio';
import { Splash } from '@/hazlo/Splash';
import { AuthScreen } from '@/hazlo/screens/Auth';
import { BG } from '@/hazlo/theme';

// Experiencias disponibles según los roles del perfil (prioridad: admin primero).
function experienciasDe(roles: string[]): Experiencia[] {
  const exps: Experiencia[] = [];
  if (roles.includes('admin')) exps.push({ key: 'admin', label: 'Admin', icon: 'settings' });
  if (roles.includes('negocio')) exps.push({ key: 'negocio', label: 'Negocio', icon: 'home' });
  if (roles.includes('cliente') || roles.includes('embajador')) exps.push({ key: 'cliente', label: 'Recomendador', icon: 'user' });
  return exps;
}

// En escritorio, / enseña la app dentro de un teléfono (ver lib/marco-web.ts).
export default function Raiz() {
  return ES_MARCO_ESCRITORIO ? <Escritorio /> : <HazloApp />;
}

// Router por rol: decide qué experiencia mostrar según los roles del perfil.
function HazloApp() {
  const { session, loading } = useAuth();
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [perfilCargado, setPerfilCargado] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [vistaSel, setVistaSel] = useState<string | null>(null);

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
          <AuthScreen />
        </SafeAreaView>
        {splash}
      </View>
    );
  }

  // Experiencia según rol (prioridad: admin > negocio > cliente/embajador).
  // Con varios roles, el RoleSwitcher permite alternar entre ellas (QA/demo).
  const roles = perfil?.roles ?? [];
  const exps = experienciasDe(roles);
  const vista = vistaSel ?? exps[0]?.key ?? 'cliente';
  const shell = vista === 'admin' ? <AdminApp /> : vista === 'negocio' ? <NegocioApp /> : <ClienteEmbajadorApp />;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {shell}
      {exps.length > 1 && <RoleSwitcher exps={exps} actual={vista} onChange={setVistaSel} />}
      {splash}
    </View>
  );
}
