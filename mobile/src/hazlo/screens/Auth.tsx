import { useState } from 'react';
import { View } from 'react-native';

import { useAtras } from '@/lib/atras';
import { ExplorarInvitado } from '../ExplorarInvitado';
import { Icon } from '../icons';
import { Fade, PressableScale } from '../motion';
import { PuertaCuenta } from '../PuertaCuenta';
import { FG } from '../theme';
import { LandingScreen } from './Landing';
import { LoginScreen } from './Login';
import { RegistroScreen } from './Registro';
import { RegistroNegocioScreen } from './RegistroNegocio';

type Modo = 'landing' | 'explorar' | 'login' | 'registro' | 'negocio';

// Lo más hondo que se llega: landing → explorar → registro → negocio.
const MAX_PASOS = 4;

// Puerta de entrada. Un solo contenedor alterna landing → explorar / login /
// registro: la `key` distinta por modo hace que el cambio entre de nuevo con
// fade en vez de aparecer de golpe (ver la sección de Movimiento en CLAUDE.md).
export function AuthScreen() {
  // Camino recorrido: el botón ‹ y el atrás (Android o navegador) regresan a
  // la pantalla anterior, no al landing.
  const [pasos, setPasos] = useState<Modo[]>(['landing']);
  const modo = pasos[pasos.length - 1];
  // Con qué búsqueda se abre el catálogo: el negocio elegido en el landing.
  const [busquedaInicial, setBusquedaInicial] = useState('');
  // Hoja "Invita a un negocio": para invitar hay que registrarse o entrar.
  const [invitando, setInvitando] = useState(false);

  const ir = (m: Modo) => setPasos((p) => (p.length < MAX_PASOS ? [...p, m] : [...p.slice(0, -1), m]));
  // Login ↔ registro se reemplazan entre sí: ir y venir no apila pasos.
  const cambiar = (m: Modo) => setPasos((p) => [...p.slice(0, -1), m]);
  const atras = () => setPasos((p) => (p.length > 1 ? p.slice(0, -1) : p));

  // Una entrada de historial por cada paso encima del landing.
  useAtras(pasos.length > 1, atras);
  useAtras(pasos.length > 2, atras);
  useAtras(pasos.length > 3, atras);

  const registrarse = () => (modo === 'login' ? cambiar('registro') : ir('registro'));
  const entrar = () => (modo === 'registro' ? cambiar('login') : ir('login'));
  const explorar = (busqueda: string) => {
    setBusquedaInicial(busqueda);
    ir('explorar');
  };

  return (
    <View style={{ flex: 1 }}>
      <Fade key={modo} style={{ flex: 1 }} desde={8}>
        {modo === 'landing' ? (
          <LandingScreen
            onRecomendar={() => ir('registro')}
            onBuscar={() => explorar('')}
            onAbrirNegocio={(negocio) => explorar(negocio.nombre)}
            onInvitar={() => setInvitando(true)}
            onEntrar={() => ir('login')}
          />
        ) : modo === 'explorar' ? (
          <ExplorarInvitado busquedaInicial={busquedaInicial} onVolver={atras} onRegistrarse={registrarse} onEntrar={entrar} />
        ) : (
          <View style={{ flex: 1 }}>
            <View style={{ height: 52, paddingHorizontal: 16, justifyContent: 'center' }}>
              <PressableScale
                onPress={atras}
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
              <LoginScreen onCrearCuenta={registrarse} />
            ) : modo === 'negocio' ? (
              <RegistroNegocioScreen conAreaSegura={false} />
            ) : (
              <RegistroScreen onEntrar={entrar} onNegocio={() => ir('negocio')} />
            )}
          </View>
        )}
      </Fade>
      {invitando && <PuertaCuenta motivo={{ k: 'invitar' }} onClose={() => setInvitando(false)} onRegistrarse={registrarse} onEntrar={entrar} />}
    </View>
  );
}
