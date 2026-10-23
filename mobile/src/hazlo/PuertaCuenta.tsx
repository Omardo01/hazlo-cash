import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAtras } from '@/lib/atras';
import { HazloMark } from './HazloMark';
import { Icon, type IconName } from './icons';
import { DUR, EASE, Fade, PressableScale, STAGGER } from './motion';
import { SheetShell } from './sheets';
import { C, F, FG, MUTED, R } from './theme';

/** Qué tocó el invitado: cambia el ícono y el texto de la hoja. */
export type MotivoCuenta =
  | { k: 'inicio' }
  | { k: 'recomendar' }
  | { k: 'actividad' }
  | { k: 'perfil' }
  | { k: 'promo'; negocio?: string };

const TEXTOS: Record<MotivoCuenta['k'], { icono: IconName; titulo: string; texto: string }> = {
  inicio: { icono: 'home', titulo: 'Tu panel de recomendador', texto: 'Ve cuánto llevas ganado, tus códigos y quién usó tus recomendaciones.' },
  recomendar: { icono: 'send', titulo: 'Recomienda y gana', texto: 'Comparte un negocio que te guste y cobra cada vez que alguien llegue con tu código.' },
  actividad: { icono: 'activity', titulo: 'Tus ganancias', texto: 'Aquí verás cada comisión que entra y podrás retirar tu dinero.' },
  perfil: { icono: 'user', titulo: 'Tu perfil', texto: 'Crea tu cuenta para tener tu código personal y tu QR.' },
  promo: { icono: 'gift', titulo: 'Promociones exclusivas', texto: 'Las promos de los negocios son solo para quien tiene cuenta en Hazlo Cash.' },
};

const BENEFICIOS = ['Es gratis y toma un minuto', 'Desbloquea todas las promociones', 'Gana dinero por recomendar'];

/**
 * Hoja llamativa que aparece cuando alguien sin cuenta toca algo que requiere
 * entrar: pestañas del menú, el botón + o una promoción bloqueada. Lleva a
 * registrarse o a entrar. Se monta al abrir y anima su salida antes de
 * desmontarse (mismo patrón que `Sheet`).
 */
export function PuertaCuenta({
  motivo,
  onClose,
  onRegistrarse,
  onEntrar,
}: {
  motivo: MotivoCuenta;
  onClose: () => void;
  onRegistrarse: () => void;
  onEntrar: () => void;
}) {
  const progreso = useState(() => new Animated.Value(0))[0];
  const cerrando = useRef(false);
  const t = TEXTOS[motivo.k];
  const titulo = motivo.k === 'promo' && motivo.negocio ? `La promo de ${motivo.negocio} te espera` : t.titulo;

  useEffect(() => {
    Animated.timing(progreso, { toValue: 1, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
  }, [progreso]);

  const cerrar = useCallback(
    (despues?: () => void) => {
      if (cerrando.current) return;
      cerrando.current = true;
      Animated.timing(progreso, { toValue: 0, duration: DUR.fast + 50, easing: EASE.in, useNativeDriver: true }).start(() => {
        onClose();
        despues?.();
      });
    },
    [progreso, onClose],
  );

  // Atrás del navegador cierra la hoja, no la pantalla de abajo.
  useAtras(true, () => cerrar());

  return (
    <SheetShell progreso={progreso} onCerrar={() => cerrar()}>
      <Fade desde={10}>
        <View style={{ borderRadius: R.lg, overflow: 'hidden', padding: 20, marginBottom: 18 }}>
          <LinearGradient colors={['#1A1A1A', '#000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[`${C.primary}55`, `${C.primary}00`]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.3, y: 0.8 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <HazloMark size={20} />
              <Text style={{ fontFamily: F.bold, fontSize: 13, color: '#fff' }}>
                Hazlo <Text style={{ color: C.primary }}>Cash</Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Icon name="lock" size={11} color="rgba(255,255,255,0.85)" sw={2.2} />
              <Text style={{ fontFamily: F.semi, fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.4 }}>CON CUENTA</Text>
            </View>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            {/* En un View: en web el SVG suelto queda debajo del degradado. */}
            <View>
              <Icon name={t.icono} size={22} color="#fff" sw={2.2} />
            </View>
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 21, lineHeight: 26, color: '#fff', letterSpacing: -0.4 }}>{titulo}</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.72)', marginTop: 6 }}>{t.texto}</Text>
        </View>
      </Fade>

      <View style={{ gap: 9, marginBottom: 20, paddingHorizontal: 4 }}>
        {BENEFICIOS.map((b, i) => (
          <Fade key={b} delay={(1 + i) * STAGGER} desde={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={12} color={C.primary} sw={2.6} />
            </View>
            <Text style={{ fontFamily: F.base, fontSize: 13.5, color: FG }}>{b}</Text>
          </Fade>
        ))}
      </View>

      <Fade delay={STAGGER * 4} desde={8}>
        <PressableScale
          onPress={() => cerrar(onRegistrarse)}
          accessibilityRole="button"
          style={{ borderRadius: R.md, shadowColor: C.accent, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }}>
          <LinearGradient
            colors={[C.primary, C.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 52, borderRadius: R.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Crear cuenta gratis</Text>
            <Icon name="chevR" size={15} color="#fff" sw={2.4} />
          </LinearGradient>
        </PressableScale>
        <PressableScale
          onPress={() => cerrar(onEntrar)}
          accessibilityRole="button"
          style={{ marginTop: 10, height: 50, borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(13,13,13,0.1)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>
            Ya tengo cuenta · <Text style={{ color: C.primary }}>Entrar</Text>
          </Text>
        </PressableScale>
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, textAlign: 'center', marginTop: 12 }}>
          Puedes seguir viendo el catálogo sin cuenta.
        </Text>
      </Fade>
    </SheetShell>
  );
}
