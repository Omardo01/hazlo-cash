import { useEffect, useState } from 'react';
import { Animated, Easing, Keyboard, Pressable, StyleSheet, Text, useWindowDimensions, View, type LayoutRectangle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAtras } from '@/lib/atras';
import type { NegocioCatalogo } from '@/lib/types';

import { HazloMark } from '../HazloMark';
import { Icon, type IconName } from '../icons';
import { BuscadorLanding } from '../landing/BuscadorLanding';
import { FondoCiclo, type Zonas } from '../landing/FondoCiclo';
import { bucle, DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
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

// «box-none» solo funciona en web dentro de StyleSheet.create: escrito directo en
// el estilo el navegador lo ignora y la caja se traga los toques.
const S = StyleSheet.create({ pasaToques: { pointerEvents: 'box-none' } });

// Lo que se mide del landing para que el fondo sepa dónde quedan los huecos.
type Pieza = 'cuadro' | 'logo' | 'centro' | 'bloque' | 'caja' | 'boton';

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

// Destello que cruza el botón principal cada tanto: lo señala sin distraer.
function Destello() {
  const p = useState(() => new Animated.Value(0))[0];
  const quieto = useReduceMotion();

  useEffect(() => {
    if (quieto) return;
    const a = bucle(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(p, { toValue: 1, duration: 900, easing: EASE.inOut, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [p, quieto]);

  if (quieto) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -20,
        bottom: -20,
        left: 0,
        width: 70,
        transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: [-110, 420] }) }, { rotate: '18deg' }],
        pointerEvents: 'none',
      }}>
      <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

// Una de las dos puertas del landing. Una sola lectura por botón: qué hace a la
// izquierda y a dónde lleva a la derecha, en todo el ancho para el pulgar. La
// principal (registrarse) manda; la otra se queda atrás, en vidrio.
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
        { height: principal ? 68 : 60, borderRadius: R.md + 2, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 14 },
        principal
          ? { boxShadow: '0 10px 26px rgba(235,78,0,0.45)' }
          : { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
      ]}>
      {principal && <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      {principal && <Destello />}
      {/* En Views: en web el degradado absoluto taparía a los SVG sueltos. */}
      <View style={{ width: principal ? 44 : 38, height: principal ? 44 : 38, borderRadius: 13, backgroundColor: principal ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icono} size={principal ? 20 : 17} color="#fff" sw={2.2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: principal ? 17 : 15, color: '#fff', letterSpacing: -0.3 }}>{titulo}</Text>
        <Text numberOfLines={1} style={{ fontFamily: F.base, fontSize: 12, color: principal ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.68)', marginTop: 1 }}>{detalle}</Text>
      </View>
      <View>
        <Icon name="chevR" size={18} color="#fff" sw={2.4} />
      </View>
    </PressableScale>
  );
}

/**
 * Landing: la primera pantalla sin sesión. Un cuadro negro con un fondo
 * animado que cuenta qué es Hazlo Cash, el titular, una caja para buscar
 * negocios sin cuenta y dos puertas: registrarse para recomendar o invitar a
 * un negocio. Quien ya tiene cuenta entra con el enlace de abajo. El fondo se
 * dibuja en los huecos de arriba y abajo del titular, que se miden aquí.
 */
export function LandingScreen({
  onRecomendar,
  onBuscar,
  onAbrirNegocio,
  onInvitar,
  onEntrar,
}: {
  onRecomendar: () => void;
  /** Abre el catálogo completo, sin cuenta. */
  onBuscar: () => void;
  /** Abre el catálogo con ese negocio ya buscado. */
  onAbrirNegocio: (negocio: NegocioCatalogo) => void;
  onInvitar: () => void;
  onEntrar: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // El fondo necesita unos 85 puntos arriba y otros tantos abajo del titular. En
  // pantallas bajas se quita texto antes que encimar las estaciones con los botones.
  const sinParrafo = height < 780;
  const sinInsignia = height < 620;
  // "Tu recomendación" en una sola línea: mide ~9.3 × el tamaño de letra y el
  // cuadro deja 72 puntos de márgenes. De 33 en un SE a 38 en pantallas grandes.
  const titulo = Math.max(28, Math.min(38, Math.floor((width - 72) / 9.3)));
  const [medidas, setMedidas] = useState<Partial<Record<Pieza, LayoutRectangle>>>({});
  const zonas = zonasDe(medidas);
  const medir = (p: Pieza) => (e: { nativeEvent: { layout: LayoutRectangle } }) => {
    const l = e.nativeEvent.layout;
    setMedidas((m) => (igual(m[p], l) ? m : { ...m, [p]: l }));
  };

  // Al buscar, la caja sube bajo el logo para que el teclado no tape la lista, y
  // el resto se desvanece. Solo se animan transform y opacidad.
  const [buscando, setBuscando] = useState(false);
  const progreso = useState(() => new Animated.Value(0))[0];
  const quieto = useReduceMotion();
  useEffect(() => {
    const destino = buscando ? 1 : 0;
    if (quieto) progreso.setValue(destino);
    else Animated.timing(progreso, { toValue: destino, duration: buscando ? DUR.slow : DUR.base, easing: buscando ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [buscando, progreso, quieto]);

  const cerrarBusqueda = () => {
    Keyboard.dismiss();
    setBuscando(false);
  };
  useAtras(buscando, cerrarBusqueda);

  const { cuadro, logo, centro, bloque, caja } = medidas;
  const topeCaja = logo ? logo.y + logo.height + 14 : 0;
  const subir = centro && bloque && caja ? topeCaja - (centro.y + bloque.y + caja.y) : 0;
  // Lo que queda debajo de la caja ya subida: alto del cuadro menos caja (48 + 8) y orillas.
  const altoLista = cuadro ? Math.min(380, cuadro.height - topeCaja - 56 - 28 - 16) : 280;
  const resto = progreso.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const soloSinBuscar = buscando ? ('none' as const) : ('auto' as const);

  return (
    <View style={{ flex: 1, padding: 10, paddingBottom: 10 + insets.bottom }}>
      <Fade style={{ flex: 1 }}>
        <View onLayout={medir('cuadro')} style={{ flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: '#000' }}>
          {/* Hasta tener las zonas medidas no pinta nada (el cuadro es negro igual). */}
          {zonas && (
            <Fade style={StyleSheet.absoluteFill}>
              <FondoCiclo z={zonas} />
            </Fade>
          )}

          {/* Tocar fuera de la caja cierra la búsqueda. */}
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.62)', opacity: progreso, pointerEvents: buscando ? 'auto' : 'none' }]}>
            <Pressable onPress={cerrarBusqueda} accessibilityLabel="Cerrar la búsqueda" style={{ flex: 1 }} />
          </Animated.View>

          <View style={[S.pasaToques, { flex: 1, paddingHorizontal: 26, paddingTop: 28, paddingBottom: 26 }]}>
            <View onLayout={medir('logo')}>
              <Fade delay={STAGGER} desde={10}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                    <HazloMark size={26} />
                    <Text style={{ fontFamily: F.bold, fontSize: 17, color: '#fff', letterSpacing: -0.3 }}>
                      Hazlo <Text style={{ color: C.primary }}>Cash</Text>
                    </Text>
                  </View>
                  <PressableScale
                    onPress={onEntrar}
                    accessibilityRole="button"
                    accessibilityLabel="Iniciar sesión"
                    hitSlop={8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      height: 34,
                      paddingLeft: 11,
                      paddingRight: 14,
                      borderRadius: 999,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.18)',
                    }}>
                    <Icon name="user" size={14} color="#fff" sw={2.2} />
                    <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: '#fff' }}>Iniciar sesión</Text>
                  </PressableScale>
                </View>
              </Fade>
            </View>

            {/* zIndex: la lista de resultados flota sobre las tarjetas de abajo. */}
            <View onLayout={medir('centro')} style={[S.pasaToques, { flex: 1, justifyContent: 'center', alignItems: 'stretch', zIndex: 5 }]}>
              <View onLayout={medir('bloque')} style={[S.pasaToques, { alignItems: 'center' }]}>
                <Animated.View style={{ alignItems: 'center', opacity: resto, pointerEvents: soloSinBuscar }}>
                  {!sinInsignia && (
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
                  )}

                  <Fade delay={STAGGER * 3} desde={14}>
                    <Text style={{ fontFamily: F.bold, fontSize: titulo, lineHeight: titulo * 1.12, letterSpacing: -titulo * 0.034, color: '#fff', textAlign: 'center' }}>
                      Tu recomendación{'\n'}
                      <Text style={{ color: C.primary, textShadowColor: 'rgba(254,120,1,0.55)', textShadowRadius: 22, textShadowOffset: { width: 0, height: 0 } }}>
                        vale dinero
                      </Text>
                    </Text>
                  </Fade>

                  {!sinParrafo && (
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
                        Recomienda tus negocios favoritos, comparte tu código y{' '}
                        <Text style={{ fontFamily: F.semi, color: '#fff' }}>gana dinero cada vez que alguien lo utilice.</Text>
                      </Text>
                    </Fade>
                  )}

                </Animated.View>

                {/* Se sube la caja completa: abajo no queda un hueco que se trague los toques. */}
                <Animated.View
                  onLayout={medir('caja')}
                  style={{ alignSelf: 'stretch', marginTop: 20, transform: [{ translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [0, subir] }) }] }}>
                  <Fade delay={STAGGER * 5} desde={14}>
                    <BuscadorLanding
                      abierto={buscando}
                      progreso={progreso}
                      altoLista={altoLista}
                      onAbrir={() => setBuscando(true)}
                      onCerrar={cerrarBusqueda}
                      onElegir={onAbrirNegocio}
                      onVerTodos={onBuscar}
                      onInvitar={onInvitar}
                    />
                  </Fade>
                </Animated.View>
              </View>
            </View>

            <Animated.View onLayout={medir('boton')} style={{ opacity: resto, pointerEvents: soloSinBuscar }}>
              <Fade delay={STAGGER * 5} desde={14}>
                <Text style={{ fontFamily: F.semi, fontSize: 10.5, letterSpacing: 1.6, color: 'rgba(255,255,255,0.6)', textAlign: 'center', textTransform: 'uppercase', marginBottom: 12 }}>
                  ¿Qué quieres hacer?
                </Text>
              </Fade>
              <View style={{ gap: 10 }}>
                <Fade delay={STAGGER * 6} desde={14}>
                  <OpcionLanding titulo="Regístrate gratis" detalle="para recomendar" icono="user" principal onPress={onRecomendar} />
                </Fade>
                <Fade delay={STAGGER * 7} desde={14}>
                  <OpcionLanding titulo="Invita a un negocio" detalle="a ser parte de Hazlo Cash" icono="home" onPress={onInvitar} />
                </Fade>
              </View>

              <Fade delay={STAGGER * 8}>
                <Pressable onPress={onEntrar} hitSlop={10} accessibilityRole="link">
                  <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 18 }}>
                    ¿Ya tienes cuenta? <Text style={{ fontFamily: F.semi, color: C.primary }}>Entrar</Text>
                  </Text>
                </Pressable>
              </Fade>
            </Animated.View>
          </View>
        </View>
      </Fade>
    </View>
  );
}
