import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';

import { Icon } from '../icons';
import { Fade, PressableScale } from '../motion';
import { FG } from '../theme';
import { LandingScreen } from './Landing';
import { LoginScreen } from './Login';
import { RegistroScreen } from './Registro';
import { RegistroNegocioScreen } from './RegistroNegocio';

type Modo = 'landing' | 'login' | 'registro' | 'negocio';

// Puerta de entrada. Un solo contenedor alterna landing → login / registro: la
// `key` distinta por modo hace que el cambio entre de nuevo con fade en vez de
// aparecer de golpe (ver la sección de Movimiento en CLAUDE.md).
export function AuthScreen() {
  const [modo, setModo] = useState<Modo>('landing');

  // A dónde lleva el botón ‹ (y el atrás de Android): el registro de negocio
  // vuelve al registro; lo demás, al landing.
  const atras: Modo = modo === 'negocio' ? 'registro' : 'landing';

  useEffect(() => {
    if (modo === 'landing') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setModo(atras);
      return true;
    });
    return () => sub.remove();
  }, [modo, atras]);

  return (
    <View style={{ flex: 1 }}>
      <Fade key={modo} style={{ flex: 1 }} desde={8}>
        {modo === 'landing' ? (
          <LandingScreen onRegistrarse={() => setModo('registro')} onEntrar={() => setModo('login')} />
        ) : (
          <View style={{ flex: 1 }}>
            <View style={{ height: 52, paddingHorizontal: 16, justifyContent: 'center' }}>
              <PressableScale
                onPress={() => setModo(atras)}
                accessibilityRole="button"
                accessibilityLabel="Volver"
                hitSlop={8}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: 'rgba(13,13,13,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                  <Icon name="chevR" size={16} color={FG} sw={2.2} />
                </View>
              </PressableScale>
            </View>
            {modo === 'login' ? (
              <LoginScreen onCrearCuenta={() => setModo('registro')} />
            ) : modo === 'negocio' ? (
              <RegistroNegocioScreen conAreaSegura={false} />
            ) : (
              <RegistroScreen onEntrar={() => setModo('login')} onNegocio={() => setModo('negocio')} />
            )}
          </View>
        )}
      </Fade>
    </View>
  );
}
