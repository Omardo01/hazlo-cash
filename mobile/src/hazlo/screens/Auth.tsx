import { useState } from 'react';
import { View } from 'react-native';

import { Fade } from '../motion';
import { LoginScreen } from './Login';
import { RegistroScreen } from './Registro';

type Modo = 'login' | 'registro';

// Puerta de entrada. Un solo contenedor alterna login ↔ registro: la `key`
// distinta por modo hace que el cambio entre de nuevo con fade en vez de
// aparecer de golpe (ver la sección de Movimiento en CLAUDE.md).
export function AuthScreen() {
  const [modo, setModo] = useState<Modo>('login');

  return (
    <View style={{ flex: 1 }}>
      <Fade key={modo} style={{ flex: 1 }} desde={8}>
        {modo === 'login' ? (
          <LoginScreen onCrearCuenta={() => setModo('registro')} />
        ) : (
          <RegistroScreen onVolver={() => setModo('login')} />
        )}
      </Fade>
    </View>
  );
}
