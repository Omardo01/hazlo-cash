import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/lib/auth-context';
import { RealtimeProvider } from '@/lib/datos/realtime';
import { registrarServiceWorker } from '@/lib/services/push';
import { AvisoLive } from '@/hazlo/AvisoLive';
import { BG } from '@/hazlo/theme';

SplashScreen.preventAutoHideAsync();

// Web: el navegador pinta su propio anillo de foco en cada campo, un recuadro
// ajeno al diseño. Los campos ya marcan el foco con su borde (CajaCampo).
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const estilo = document.createElement('style');
  estilo.textContent = 'input:focus, textarea:focus { outline: none; }';
  document.head.appendChild(estilo);
}

// Web: el service worker de los avisos push (solo avisos, sin caché).
registrarServiceWorker();

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* Un solo canal de Realtime para toda la app y un solo banner de
              avisos encima: así el evento llega esté donde esté el usuario. */}
          <RealtimeProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG } }} />
            <AvisoLive />
          </RealtimeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
