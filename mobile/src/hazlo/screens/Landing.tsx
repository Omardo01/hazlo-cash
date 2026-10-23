import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View, type LayoutRectangle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HazloMark } from '../HazloMark';
import { Icon, type IconName } from '../icons';
import { INTERNO_VISIBLE } from '../interno/SoloInterno';
import { FondoLanding, VisorFondos } from '../landing/FondoLanding';
import { useFondoLanding, type Zonas } from '../landing/fondos';
import { Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, R } from '../theme';

// Punto del badge: late como el "en vivo" del landing web.
function PuntoVivo() {
  const p = useState(() => new Animated.Value(0))[0];
  const quieto = useReduceMotion();

  useEffect(() => {
    if (quieto) return;
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [p, quieto]);

  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  return <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F5A623', transform: [{ scale }] }} />;
}

// Lo que se mide del landing para que el fondo sepa dónde quedan los huecos.
type Pieza = 'cuadro' | 'logo' | 'centro' | 'bloque' | 'boton';

function zonasDe(m: Partial<Record<Pieza, LayoutRectangle>>): Zonas | null {
  const { cuadro, logo, centro, bloque, boton } = m;
  if (!cuadro || !logo || !centro || !bloque || !boton) return null;
  const arriba = centro.y + bloque.y;
  return {
    w: cuadro.width,
    h: cuadro.height,
    arriba: [logo.y + logo.height + 8, arriba - 6],
    abajo: [arriba + bloque.height + 6, boton.y - 10],
  };
}

const igual = (a: LayoutRectangle | undefined, b: LayoutRectangle) =>
  !!a && Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y) && Math.round(a.width) === Math.round(b.width) && Math.round(a.height) === Math.round(b.height);

// Una de las dos puertas del landing. La principal (recomendar) va en el
// degradado de marca; la otra, en vidrio sobre el fondo negro.
function OpcionLanding({
  titulo,
  detalle,
  icono,
  principal = false,
  onPress,
}: {
  titulo: string;
  detalle: string;
  icono: IconName;
  principal?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo} ${detalle}`}
      style={[
        { height: 96, borderRadius: R.md, overflow: 'hidden', padding: 14, justifyContent: 'space-between' },
        principal
          ? { shadowColor: C.accent, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } }
          : { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
      ]}>
      {principal && <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: principal ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icono} size={15} color="#fff" sw={2.2} />
        </View>
        <Icon name="chevR" size={15} color="rgba(255,255,255,0.8)" sw={2.4} />
      </View>
      <View>
        <Text style={{ fontFamily: F.semi, fontSize: 16, color: '#fff', letterSpacing: -0.2 }}>{titulo}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: principal ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)' }}>{detalle}</Text>
      </View>
    </PressableScale>
  );
}

/**
 * Landing: la primera pantalla sin sesión. Un cuadro negro con un fondo
 * animado que cuenta qué es Hazlo Cash, el titular y la pregunta de qué
 * quiere hacer: recomendar (registro) o buscar (catálogo sin cuenta).
 * Quien ya tiene cuenta entra con el enlace de abajo. El fondo se dibuja en
 * los huecos de arriba y abajo del titular, que se miden aquí.
 */
export function LandingScreen({ onRecomendar, onBuscar, onEntrar }: { onRecomendar: () => void; onBuscar: () => void; onEntrar: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // "Tu recomendación" en una sola línea: mide ~9.3 × el tamaño de letra y el
  // cuadro deja 72 puntos de márgenes. De 33 en un SE a 38 en pantallas grandes.
  const titulo = Math.max(28, Math.min(38, Math.floor((width - 72) / 9.3)));
  const fondo = useFondoLanding();
  const [medidas, setMedidas] = useState<Partial<Record<Pieza, LayoutRectangle>>>({});
  const medir = (p: Pieza) => (e: { nativeEvent: { layout: LayoutRectangle } }) => {
    const l = e.nativeEvent.layout;
    setMedidas((m) => (igual(m[p], l) ? m : { ...m, [p]: l }));
  };

  return (
    <View style={{ flex: 1, padding: 10, paddingBottom: 10 + insets.bottom }}>
      <Fade style={{ flex: 1 }}>
        <View onLayout={medir('cuadro')} style={{ flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: '#000' }}>
          <FondoLanding id={fondo.id} z={zonasDe(medidas)} />

          <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: 28, paddingBottom: 26 }}>
            <View onLayout={medir('logo')}>
              <Fade delay={STAGGER} desde={10}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                    <HazloMark size={26} />
                    <Text style={{ fontFamily: F.bold, fontSize: 17, color: '#fff', letterSpacing: -0.3 }}>
                      Hazlo <Text style={{ color: C.primary }}>Cash</Text>
                    </Text>
                  </View>
                  {INTERNO_VISIBLE && <VisorFondos />}
                </View>
              </Fade>
            </View>

            <View onLayout={medir('centro')} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View onLayout={medir('bloque')} style={{ alignItems: 'center' }}>
                <Fade delay={STAGGER * 2} desde={14}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      alignSelf: 'center',
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.18)',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      marginBottom: 22,
                    }}>
                    <PuntoVivo />
                    <Text style={{ fontFamily: F.semi, fontSize: 10.5, letterSpacing: 1.6, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>
                      Recomienda y gana
                    </Text>
                  </View>
                </Fade>

                <Fade delay={STAGGER * 3} desde={14}>
                  <Text style={{ fontFamily: F.bold, fontSize: titulo, lineHeight: titulo * 1.12, letterSpacing: -titulo * 0.034, color: '#fff', textAlign: 'center' }}>
                    Tu recomendación{'\n'}
                    <Text style={{ color: C.primary, textShadowColor: 'rgba(254,120,1,0.55)', textShadowRadius: 22, textShadowOffset: { width: 0, height: 0 } }}>
                      vale dinero
                    </Text>
                  </Text>
                </Fade>

                <Fade delay={STAGGER * 4} desde={14}>
                  <Text
                    style={{
                      fontFamily: F.reg,
                      fontSize: 14,
                      lineHeight: 22,
                      color: 'rgba(255,255,255,0.7)',
                      textAlign: 'center',
                      marginTop: 16,
                      maxWidth: 300,
                    }}>
                    Hazlo Cash convierte el boca en boca en ingresos reales. Recomienda negocios que ya conoces: cada vez que alguien use tu código,{' '}
                    <Text style={{ fontFamily: F.semi, color: '#fff' }}>tú cobras.</Text>
                  </Text>
                </Fade>
              </View>
            </View>

            <View onLayout={medir('boton')}>
              <Fade delay={STAGGER * 5} desde={14}>
                <Text style={{ fontFamily: F.semi, fontSize: 10.5, letterSpacing: 1.6, color: 'rgba(255,255,255,0.6)', textAlign: 'center', textTransform: 'uppercase', marginBottom: 12 }}>
                  ¿Qué quieres hacer?
                </Text>
              </Fade>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Fade delay={STAGGER * 6} desde={14} style={{ flex: 1 }}>
                  <OpcionLanding
                    titulo="Recomendar"
                    detalle="y ganar dinero"
                    icono="send"
                    principal
                    onPress={onRecomendar}
                  />
                </Fade>
                <Fade delay={STAGGER * 7} desde={14} style={{ flex: 1 }}>
                  <OpcionLanding titulo="Buscar" detalle="negocios y servicios" icono="search" onPress={onBuscar} />
                </Fade>
              </View>

              <Fade delay={STAGGER * 8}>
                <Pressable onPress={onEntrar} hitSlop={10} accessibilityRole="link">
                  <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 18 }}>
                    ¿Ya tienes cuenta? <Text style={{ fontFamily: F.semi, color: C.primary }}>Entrar</Text>
                  </Text>
                </Pressable>
              </Fade>
            </View>
          </View>
        </View>
      </Fade>
    </View>
  );
}
