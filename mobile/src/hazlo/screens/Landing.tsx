import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Pressable, ScrollView, StyleSheet, Text, View, type LayoutRectangle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAtras } from '@/lib/atras';
import { useVentanaApp } from '@/lib/columna-web';
import type { NegocioCatalogo } from '@/lib/types';

import { HazloMark } from '../HazloMark';
import { Icon, type IconName } from '../icons';
import { BuscadorLanding } from '../landing/BuscadorLanding';
import { ESTILO_INICIAL, ESTILOS, FondoLanding, HeroLanding, TEMAS, useEstiloLanding, type EstiloLanding, type MarcoLanding } from '../landing/EstilosLanding';
import { bucle, DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';

// «box-none» solo funciona en web dentro de StyleSheet.create: escrito directo en
// el estilo el navegador lo ignora y la caja se traga los toques.
const S = StyleSheet.create({ pasaToques: { pointerEvents: 'box-none' } });

// Lo que se mide del landing para subir la caja de búsqueda bajo el logo.
type Pieza = 'cuadro' | 'logo' | 'centro' | 'bloque' | 'caja';

// Lo menos que necesita el diseño bajo (un SE deja ~647) para no encimarse.
const ALTO_MINIMO = 640;

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
// principal (registrarse) manda; la otra se queda atrás: vidrio sobre fondo
// oscuro, tarjeta blanca sobre fondo claro.
function OpcionLanding({
  titulo,
  detalle,
  icono,
  principal = false,
  negro = false,
  claro = false,
  onPress,
}: {
  titulo: string;
  detalle: string;
  icono: IconName;
  principal?: boolean;
  /** Sobre fondos que ya son naranjas: el principal va en negro. */
  negro?: boolean;
  claro?: boolean;
  onPress: () => void;
}) {
  const texto = principal || !claro ? '#fff' : FG;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo} ${detalle}`}
      style={[
        { height: principal ? 68 : 60, borderRadius: R.md + 2, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 14 },
        principal
          ? { boxShadow: negro ? '0 10px 24px rgba(80,20,0,0.32)' : '0 10px 26px rgba(235,78,0,0.45)' }
          : claro
            ? { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(13,13,13,0.1)', boxShadow: '0 2px 10px rgba(13,13,13,0.05)' }
            : { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
      ]}>
      {principal && <LinearGradient colors={negro ? ['#1A1614', '#100D0C'] : [C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      {principal && <Destello />}
      {/* En Views: en web el degradado absoluto taparía a los SVG sueltos. */}
      <View
        style={{
          width: principal ? 44 : 38,
          height: principal ? 44 : 38,
          borderRadius: 13,
          backgroundColor: principal ? (negro ? C.primary : 'rgba(255,255,255,0.22)') : claro ? `${C.primary}1F` : 'rgba(255,255,255,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={icono} size={principal ? 20 : 17} color={principal || !claro ? '#fff' : C.accent} sw={2.2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: principal ? 17 : 15, color: texto, letterSpacing: -0.3 }}>{titulo}</Text>
        <Text numberOfLines={1} style={{ fontFamily: F.base, fontSize: 12, color: principal ? 'rgba(255,255,255,0.92)' : claro ? MUTED : negro ? '#fff' : 'rgba(255,255,255,0.68)', marginTop: 1 }}>
          {detalle}
        </Text>
      </View>
      <View>
        <Icon name="chevR" size={18} color={texto} sw={2.4} />
      </View>
    </PressableScale>
  );
}

/** Píldora de la barra de arriba (sesión y diseño): vidrio en oscuro, blanca en claro. */
const pildora = (oscuro: boolean) =>
  ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: oscuro ? 'rgba(255,255,255,0.1)' : '#fff',
    borderColor: oscuro ? 'rgba(255,255,255,0.18)' : 'rgba(13,13,13,0.1)',
    boxShadow: oscuro ? undefined : '0 2px 8px rgba(13,13,13,0.06)',
  }) as const;

/**
 * Landing: la primera pantalla sin sesión. Arriba el logo, el botón de diseño y
 * «Iniciar sesión»; luego «Recomienda y gana» y una caja para buscar negocios
 * sin cuenta; abajo las dos puertas: registrarse para recomendar o invitar a un
 * negocio. Nada más: el fondo es lo único que cambia con el diseño (y si el
 * título y la caja van arriba o al centro).
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
  const { width, height } = useVentanaApp();
  // Pantallas bajas (SE y parecidas): menos aire y título más chico.
  const bajo = height < 760;
  // Logo, diseño e «Iniciar sesión» en un renglón: en 375 o menos se aprietan.
  const angosta = width < 390;
  // En 360 el logo completo vale más que el ícono de la sesión.
  const muyAngosta = width < 370;
  // «Recomienda» mide ~6.1 × el tamaño de letra y el cuadro deja 72 de márgenes.
  const titulo = Math.max(38, Math.min(bajo ? 46 : 52, Math.floor((width - 72) / 6.3)));
  const [medidas, setMedidas] = useState<Partial<Record<Pieza, LayoutRectangle>>>({});
  const medir = (p: Pieza) => (e: { nativeEvent: { layout: LayoutRectangle } }) => {
    const l = e.nativeEvent.layout;
    setMedidas((m) => (igual(m[p], l) ? m : { ...m, [p]: l }));
  };

  // ── Diseño en prueba ──
  const [estilo, setEstilo] = useEstiloLanding();
  const tema = TEMAS[estilo ?? ESTILO_INICIAL];
  const claro = !tema.oscuro;
  const quieto = useReduceMotion();
  // Lo que cambia sale con fade antes de cambiar; lo nuevo entra con sus Fade.
  const salida = useState(() => new Animated.Value(1))[0];
  // La caja solo se va cuando el otro diseño la pone en otro lado.
  const salidaCaja = useState(() => new Animated.Value(1))[0];
  const cambiando = useRef(false);
  // El nombre del diseño aparece un momento bajo la barra al cambiarlo.
  const [nombre, setNombre] = useState<string | null>(null);
  const aviso = useState(() => new Animated.Value(0))[0];

  const siguienteEstilo = () => {
    if (!estilo || cambiando.current) return;
    const i = ESTILOS.findIndex((e) => e.k === estilo);
    const otro: EstiloLanding = ESTILOS[(i + 1) % ESTILOS.length].k;
    const cambiar = () => {
      setEstilo(otro);
      salida.setValue(1);
      salidaCaja.setValue(1);
      cambiando.current = false;
      setNombre(ESTILOS.find((e) => e.k === otro)?.nombre ?? null);
      aviso.stopAnimation();
      aviso.setValue(0);
      if (quieto) aviso.setValue(1);
      Animated.sequence([
        Animated.timing(aviso, { toValue: 1, duration: quieto ? 0 : DUR.base, easing: EASE.out, useNativeDriver: true }),
        Animated.delay(1300),
        Animated.timing(aviso, { toValue: 0, duration: quieto ? 0 : DUR.fast, easing: EASE.in, useNativeDriver: true }),
      ]).start();
    };
    cambiando.current = true;
    if (quieto) return cambiar();
    const irse = (v: Animated.Value) => Animated.timing(v, { toValue: 0, duration: DUR.fast, easing: EASE.in, useNativeDriver: true });
    Animated.parallel(TEMAS[otro].arriba === tema.arriba ? [irse(salida)] : [irse(salida), irse(salidaCaja)]).start(cambiar);
  };

  // Al buscar, la caja sube bajo el logo para que el teclado no tape la lista, y
  // el resto se desvanece. Solo se animan transform y opacidad.
  const [buscando, setBuscando] = useState(false);
  const desliza = useRef<ScrollView>(null);
  const abrirBusqueda = () => {
    // La caja sube según su lugar sin deslizar: primero se regresa arriba.
    desliza.current?.scrollTo({ y: 0, animated: false });
    setBuscando(true);
  };
  const progreso = useState(() => new Animated.Value(0))[0];
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
  // El lugar del bloque se calcula: en web onLayout avisa cuando algo cambia de
  // tamaño, no cuando solo se mueve (al cambiar de diseño o girar la pantalla).
  const aire = tema.arriba ? (bajo ? 18 : 32) : bajo ? 20 : 40;
  const yBloque = centro && bloque ? centro.y + aire + (tema.arriba ? 0 : (centro.height - aire - bloque.height) / 2) : 0;
  const yCaja = bloque && caja ? yBloque + bloque.height - caja.height : 0;
  const subir = centro && bloque && caja ? topeCaja - yCaja : 0;
  // Lo que queda debajo de la caja ya subida: alto del cuadro menos caja (48 + 8) y orillas.
  const altoLista = cuadro ? Math.min(380, cuadro.height - topeCaja - 56 - 28 - 16) : 280;
  const resto = progreso.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const soloSinBuscar = buscando ? ('none' as const) : ('auto' as const);
  // Dónde quedó lo fijo: con eso se acomoda el fondo.
  const marco: MarcoLanding | null =
    cuadro && centro && bloque && caja
      ? {
          ancho: cuadro.width,
          alto: cuadro.height,
          titulo: yBloque,
          caja: yCaja,
          hueco: { y: yCaja + caja.height, alto: Math.max(0, centro.y + centro.height - yCaja - caja.height) },
        }
      : null;

  const textoMarca = tema.oscuro ? '#fff' : FG;
  const textoBarra = tema.oscuro ? '#fff' : FG;
  const indice = estilo ? ESTILOS.findIndex((e) => e.k === estilo) : 0;

  return (
    <View style={{ flex: 1, padding: 10, paddingBottom: 10 + insets.bottom }}>
      <Fade style={{ flex: 1 }}>
        <View style={{ flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: tema.fondo }}>
          {/* Pantallas muy bajas (iPhone Duo acostado: 585; su pantalla de
              afuera acostada: 368): el diseño conserva su alto y se desliza,
              en vez de encimar el centro con los botones. */}
          <ScrollView
            ref={desliza}
            scrollEnabled={!buscando}
            bounces={false}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, minHeight: ALTO_MINIMO }}>
            <View onLayout={medir('cuadro')} style={{ flex: 1 }}>
              {estilo && marco && (
                <Animated.View key={estilo} style={[StyleSheet.absoluteFill, { opacity: salida }]}>
                  <FondoLanding estilo={estilo} marco={marco} />
                </Animated.View>
              )}

              {/* Tocar fuera de la caja cierra la búsqueda. */}
              <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.62)', opacity: progreso, pointerEvents: buscando ? 'auto' : 'none' }]}>
                <Pressable onPress={cerrarBusqueda} accessibilityLabel="Cerrar la búsqueda" style={{ flex: 1 }} />
              </Animated.View>

              <View style={[S.pasaToques, { flex: 1, paddingHorizontal: 26, paddingTop: 28, paddingBottom: 26 }]}>
                <View onLayout={medir('logo')} style={{ zIndex: 6 }}>
                  <Fade delay={STAGGER} desde={10}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: angosta ? 6 : 8 }}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: angosta ? 7 : 9 }}>
                        <HazloMark size={angosta ? 24 : 26} mono={tema.logo} />
                        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.bold, fontSize: angosta ? 15.5 : 17, color: textoMarca, letterSpacing: -0.3 }}>
                          Hazlo <Text style={{ color: tema.cash }}>Cash</Text>
                        </Text>
                      </View>
                      {/* Diseño del landing en prueba: cada toque pasa al siguiente. */}
                      <PressableScale
                        onPress={siguienteEstilo}
                        accessibilityRole="button"
                        accessibilityLabel={`Cambiar el diseño. Ahora: ${ESTILOS[indice].nombre}, ${indice + 1} de ${ESTILOS.length}`}
                        hitSlop={8}
                        style={[pildora(tema.oscuro), { width: 34, justifyContent: 'center' }]}>
                        <Ionicons name="color-palette-outline" size={16} color={textoBarra} />
                        {/* Qué diseño es, del 1 al 5. */}
                        <View style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, backgroundColor: tema.logo ? FG : C.primary, borderWidth: 2, borderColor: tema.fondo, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontFamily: F.bold, fontSize: 9, lineHeight: 11, color: '#fff' }}>{indice + 1}</Text>
                        </View>
                      </PressableScale>
                      <PressableScale onPress={onEntrar} accessibilityRole="button" accessibilityLabel="Iniciar sesión" hitSlop={8} style={[pildora(tema.oscuro), { paddingLeft: muyAngosta ? 12 : angosta ? 10 : 11, paddingRight: angosta ? 12 : 14 }]}>
                        {!muyAngosta && <Icon name="user" size={14} color={textoBarra} sw={2.2} />}
                        <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: textoBarra }}>Iniciar sesión</Text>
                      </PressableScale>
                    </View>
                  </Fade>
                  {nombre && (
                    <Animated.View
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 42,
                        opacity: aviso,
                        transform: [{ translateY: aviso.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
                        pointerEvents: 'none',
                      }}>
                      <View style={{ paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: FG, boxShadow: '0 6px 16px rgba(13,13,13,0.25)' }}>
                        <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: '#fff' }}>{nombre}</Text>
                      </View>
                    </Animated.View>
                  )}
                </View>

                {/* zIndex: la lista de resultados flota sobre los botones de abajo. */}
                <View onLayout={medir('centro')} style={[S.pasaToques, { flex: 1, justifyContent: tema.arriba ? 'flex-start' : 'center', alignItems: 'stretch', zIndex: 5, paddingTop: aire }]}>
                  <View onLayout={medir('bloque')} style={[S.pasaToques, { alignItems: 'center' }]}>
                    {estilo && (
                      <Animated.View key={estilo} style={{ alignSelf: 'stretch', alignItems: 'center', opacity: Animated.multiply(resto, salida), pointerEvents: soloSinBuscar }}>
                        <HeroLanding estilo={estilo} titulo={titulo} />
                      </Animated.View>
                    )}

                    {/* Se sube la caja completa: abajo no queda un hueco que se trague los toques. */}
                    <Animated.View
                      onLayout={medir('caja')}
                      style={{ alignSelf: 'stretch', marginTop: 22, opacity: salidaCaja, transform: [{ translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [0, subir] }) }] }}>
                      {/* Con otra llave entra de nuevo en su nuevo lugar. */}
                      <Fade key={tema.arriba ? 'arriba' : 'centro'} delay={STAGGER * 3} desde={14}>
                        <BuscadorLanding
                          claro={claro}
                          abierto={buscando}
                          progreso={progreso}
                          altoLista={altoLista}
                          onAbrir={abrirBusqueda}
                          onCerrar={cerrarBusqueda}
                          onElegir={onAbrirNegocio}
                          onVerTodos={onBuscar}
                          onInvitar={onInvitar}
                        />
                      </Fade>
                    </Animated.View>
                  </View>
                </View>

                <Animated.View style={{ opacity: resto, pointerEvents: soloSinBuscar }}>
                  <Fade delay={STAGGER * 5} desde={14}>
                    <Text
                      style={{
                        fontFamily: F.semi,
                        fontSize: 10.5,
                        letterSpacing: 1.6,
                        color: tema.pregunta,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        marginBottom: 12,
                      }}>
                      ¿Qué quieres hacer?
                    </Text>
                  </Fade>
                  <View style={{ gap: 10 }}>
                    <Fade delay={STAGGER * 6} desde={14}>
                      <OpcionLanding titulo="Regístrate gratis" detalle="para recomendar" icono="user" principal negro={tema.principalNegro} onPress={onRecomendar} />
                    </Fade>
                    <Fade delay={STAGGER * 7} desde={14}>
                      <OpcionLanding titulo="Invita a un negocio" detalle="a ser parte de Hazlo Cash" icono="home" negro={tema.principalNegro} claro={claro} onPress={onInvitar} />
                    </Fade>
                  </View>

                  <Fade delay={STAGGER * 8}>
                    <Pressable onPress={onEntrar} hitSlop={10} accessibilityRole="link">
                      <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: tema.pie, textAlign: 'center', marginTop: 18 }}>
                        ¿Ya tienes cuenta? <Text style={{ fontFamily: F.semi, color: tema.liga }}>Entrar</Text>
                      </Text>
                    </Pressable>
                  </Fade>
                </Animated.View>
              </View>

              {tema.credito && (
                <Text style={{ position: 'absolute', left: 0, right: 0, bottom: 7, textAlign: 'center', fontFamily: F.reg, fontSize: 8.5, color: tema.oscuro ? 'rgba(255,255,255,0.4)' : 'rgba(13,13,13,0.4)', pointerEvents: 'none' }}>
                  Mapa © OpenStreetMap
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </Fade>
    </View>
  );
}
