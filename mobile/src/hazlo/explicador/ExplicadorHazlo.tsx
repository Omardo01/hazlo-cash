import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodigoScramble } from '../CodigoScramble';
import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { DUR, EASE, PressableScale, useReduceMotion } from '../motion';
import { C, F, R } from '../theme';

/**
 * "Así funciona Hazlo Cash" en 30 segundos, para el recomendador.
 *
 * Un solo reloj (`t`, de 0 a 30 000 ms, con native driver) mueve todo: cada
 * escena y cada elemento interpola su opacidad y posición a partir de él, así
 * no hay timers peleándose y todo queda sincronizado. Lo único que vive en JS
 * es lo que cambia texto (el código que gira y el contador del saldo), y se
 * monta solo cuando le toca su escena.
 */

const DURACION = 30_000;
const FADE = 450;
const CODIGO = 'HAZLO-K7Q2';
const NEGOCIO = 'Tacos El Güero';
const COMISION = 25;

interface Escena {
  ini: number;
  fin: number;
  paso: string;
  titulo: string;
  texto: string;
}

const ESCENAS: Escena[] = [
  { ini: 0, fin: 4500, paso: '', titulo: 'Así funciona Hazlo Cash', texto: 'Recomienda lo que te gusta y gana dinero real.' },
  { ini: 4500, fin: 9500, paso: '1', titulo: 'Elige un negocio', texto: 'Uno que ya conoces y que te encanta.' },
  { ini: 9500, fin: 15000, paso: '2', titulo: 'Genera tu QR', texto: 'Cada negocio tiene tu propio código.' },
  { ini: 15000, fin: 20000, paso: '3', titulo: 'Compártelo', texto: 'Mándalo por WhatsApp a quien le sirva.' },
  { ini: 20000, fin: 25000, paso: '4', titulo: 'Tu amigo compra', texto: 'El negocio escanea tu QR y confirma la venta.' },
  { ini: 25000, fin: DURACION, paso: '5', titulo: '¡Tú ganas!', texto: 'Tu comisión cae en tu saldo en cuanto se confirma.' },
];

type Valor = Animated.Value;

// Aparece en `ini` (con recorrido desde abajo) y, si tiene `fin`, se va antes de él.
function entrada(t: Valor, ini: number, fin: number | null, quieto: boolean, desde = 22) {
  const f = quieto ? 1 : FADE;
  const salida = fin ?? DURACION + 2 * f + 2;
  return {
    opacity: t.interpolate({ inputRange: [ini, ini + f, salida - f, salida], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' }),
    transform: [
      {
        translateY: t.interpolate({
          inputRange: [ini, ini + f, salida - f, salida],
          outputRange: quieto ? [0, 0, 0, 0] : [desde, 0, 0, -14],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
}

// Pop con un poco de rebote (sube, se pasa tantito y asienta).
function pop(t: Valor, ini: number, quieto: boolean) {
  const f = quieto ? 1 : 380;
  return {
    opacity: t.interpolate({ inputRange: [ini, ini + f * 0.4], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      { scale: quieto ? 1 : t.interpolate({ inputRange: [ini, ini + f * 0.6, ini + f], outputRange: [0.6, 1.08, 1], extrapolate: 'clamp' }) },
    ],
  };
}

function Titulo({ t, e, quieto }: { t: Valor; e: Escena; quieto: boolean }) {
  const ultima = e.fin === DURACION;
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center' }, entrada(t, e.ini, ultima ? null : e.fin, quieto, 14)]}>
      {e.paso ? (
        <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: `${C.primary}30`, marginBottom: 10 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary, letterSpacing: 1.2 }}>PASO {e.paso}</Text>
        </View>
      ) : null}
      <Text style={{ fontFamily: F.bold, fontSize: 27, lineHeight: 31, color: '#fff', textAlign: 'center', letterSpacing: -0.6 }}>{e.titulo}</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.68)', textAlign: 'center', marginTop: 8, maxWidth: 290 }}>{e.texto}</Text>
    </Animated.View>
  );
}

// ── Escenas (lo visual de cada paso) ──────────────────────────────────────────

function EscenaIntro({ t, quieto }: { t: Valor; quieto: boolean }) {
  const e = ESCENAS[0];
  const aura = quieto ? 1 : t.interpolate({ inputRange: [0, 1200, 2400, 3600, 4500], outputRange: [0.85, 1.15, 0.95, 1.15, 1], extrapolate: 'clamp' });
  return (
    <Animated.View style={[styles.escena, entrada(t, e.ini, e.fin, quieto, 0)]}>
      <Animated.View style={{ position: 'absolute', width: 230, height: 230, borderRadius: 999, backgroundColor: `${C.primary}1C`, transform: [{ scale: aura }] }} />
      <Animated.View style={pop(t, 200, quieto)}>
        <HazloMark size={92} />
      </Animated.View>
    </Animated.View>
  );
}

const NEGOCIOS = [
  { nombre: 'Café Aroma', tipo: 'Cafetería', hue: '#6B8BB8' },
  { nombre: NEGOCIO, tipo: 'Tacos de asada', hue: '#C2704A' },
  { nombre: 'Estética Luna', tipo: 'Belleza', hue: '#B5658E' },
];

function EscenaElegir({ t, quieto }: { t: Valor; quieto: boolean }) {
  const e = ESCENAS[1];
  const toque = e.ini + 2300;
  return (
    <Animated.View style={[styles.escena, entrada(t, e.ini, e.fin, quieto)]}>
      <View style={{ width: 280, gap: 10 }}>
        {NEGOCIOS.map((n, i) => {
          const elegido = n.nombre === NEGOCIO;
          const resalte = t.interpolate({ inputRange: [toque, toque + 250], outputRange: [0, 1], extrapolate: 'clamp' });
          const hunde = quieto ? 1 : t.interpolate({ inputRange: [toque - 120, toque, toque + 200], outputRange: [1, 0.95, 1], extrapolate: 'clamp' });
          return (
            <Animated.View key={n.nombre} style={entrada(t, e.ini + 300 + i * 160, null, quieto, 16)}>
              <Animated.View style={{ transform: [{ scale: elegido ? hunde : 1 }] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  {elegido && (
                    <Animated.View style={[StyleSheet.absoluteFill, { opacity: resalte }]}>
                      <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                    </Animated.View>
                  )}
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: n.hue, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: F.bold, fontSize: 16, color: '#fff' }}>{n.nombre.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>{n.nombre}</Text>
                    <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{n.tipo}</Text>
                  </View>
                  {elegido && (
                    <Animated.View style={pop(t, toque + 150, quieto)}>
                      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={14} color={C.accent} sw={3} />
                      </View>
                    </Animated.View>
                  )}
                </View>
              </Animated.View>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

function EscenaQr({ t, quieto, activa }: { t: Valor; quieto: boolean; activa: boolean }) {
  const e = ESCENAS[2];
  // El código "llega" del servidor a medio giro, como en Recomienda.
  const [final, setFinal] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (!activa) return;
    setFinal(null);
    setListo(false);
    const tm = setTimeout(() => setFinal(CODIGO), 900);
    return () => clearTimeout(tm);
  }, [activa]);

  return (
    <Animated.View style={[styles.escena, entrada(t, e.ini, e.fin, quieto)]}>
      <View style={{ padding: 14, borderRadius: R.lg, backgroundColor: '#fff' }}>
        <View style={{ width: 150, height: 150 }}>
          <Animated.View style={pop(t, e.ini + 2700, quieto)}>
            <QRCode value={`https://hazlocash.app/r/${CODIGO}`} size={150} color="#0D0D0D" backgroundColor="#fff" ecl="H" />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', left: 54, top: 54, width: 42, height: 42, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }, pop(t, e.ini + 3400, quieto)]}>
            <HazloMark size={20} />
          </Animated.View>
        </View>
      </View>
      <View style={{ marginTop: 18, height: 34, justifyContent: 'center' }}>
        {activa && <CodigoScramble molde="HAZLO-0000" final={final} genKey={1} listo={listo} onListo={() => setListo(true)} oscuro tamano={20} />}
      </View>
      <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{NEGOCIO}</Text>
    </Animated.View>
  );
}

function EscenaCompartir({ t, quieto }: { t: Valor; quieto: boolean }) {
  const e = ESCENAS[3];
  return (
    <Animated.View style={[styles.escena, entrada(t, e.ini, e.fin, quieto)]}>
      <View style={{ width: 290, borderRadius: R.lg, backgroundColor: '#0B141A', padding: 14, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#fff' }}>A</Text>
          </View>
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Ana</Text>
        </View>
        {/* Tu mensaje con el QR */}
        <Animated.View style={[{ alignSelf: 'flex-end', maxWidth: 220, borderRadius: 14, borderTopRightRadius: 4, backgroundColor: '#005C4B', padding: 8 }, entrada(t, e.ini + 700, null, quieto, 30)]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <View style={{ padding: 3, borderRadius: 6, backgroundColor: '#fff' }}>
              <QRCode value={`https://hazlocash.app/r/${CODIGO}`} size={40} color="#0D0D0D" backgroundColor="#fff" />
            </View>
            <View>
              <Text style={{ fontFamily: F.semi, fontSize: 12, color: '#fff' }}>{NEGOCIO}</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 10.5, color: 'rgba(255,255,255,0.7)' }}>{CODIGO}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: '#fff', marginTop: 6, lineHeight: 17 }}>¡Prueba estos tacos! Ve de mi parte y te dan un refresco.</Text>
        </Animated.View>
        {/* Respuesta */}
        <Animated.View style={[{ alignSelf: 'flex-start', borderRadius: 14, borderTopLeftRadius: 4, backgroundColor: '#202C33', paddingHorizontal: 10, paddingVertical: 7 }, entrada(t, e.ini + 2300, null, quieto, 20)]}>
          <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: '#fff' }}>¡Va, voy hoy! 🌮</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function EscenaCompra({ t, quieto }: { t: Valor; quieto: boolean }) {
  const e = ESCENAS[4];
  const ini = e.ini + 600;
  // La línea del escáner baja y sube dos veces antes de confirmar.
  const linea = quieto
    ? 0
    : t.interpolate({ inputRange: [ini, ini + 700, ini + 1400, ini + 2100, ini + 2400], outputRange: [0, 150, 0, 150, 75], extrapolate: 'clamp' });
  const confirma = ini + 2500;
  return (
    <Animated.View style={[styles.escena, entrada(t, e.ini, e.fin, quieto)]}>
      <View style={{ width: 190, height: 190, alignItems: 'center', justifyContent: 'center' }}>
        {/* Esquinas del visor */}
        {[0, 1, 2, 3].map((k) => (
          <View
            key={k}
            style={{
              position: 'absolute',
              width: 30,
              height: 30,
              borderColor: C.primary,
              ...(k < 2 ? { top: 0, borderTopWidth: 3 } : { bottom: 0, borderBottomWidth: 3 }),
              ...(k % 2 === 0 ? { left: 0, borderLeftWidth: 3, borderTopLeftRadius: k === 0 ? 10 : 0, borderBottomLeftRadius: k === 2 ? 10 : 0 } : { right: 0, borderRightWidth: 3, borderTopRightRadius: k === 1 ? 10 : 0, borderBottomRightRadius: k === 3 ? 10 : 0 }),
            }}
          />
        ))}
        <View style={{ padding: 8, borderRadius: 12, backgroundColor: '#fff' }}>
          <QRCode value={`https://hazlocash.app/r/${CODIGO}`} size={134} color="#0D0D0D" backgroundColor="#fff" ecl="H" />
        </View>
        <Animated.View style={{ position: 'absolute', left: 14, right: 14, top: 18, height: 3, borderRadius: 2, backgroundColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.9, shadowRadius: 8, transform: [{ translateY: linea }], opacity: t.interpolate({ inputRange: [confirma - 100, confirma], outputRange: [1, 0], extrapolate: 'clamp' }) }} />
        {/* Venta confirmada */}
        <Animated.View style={[{ position: 'absolute', width: 190, height: 190, borderRadius: 18, backgroundColor: 'rgba(0,168,150,0.92)', alignItems: 'center', justifyContent: 'center' }, pop(t, confirma, quieto)]}>
          <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={32} color="#fff" sw={2.8} />
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 17, color: '#fff', marginTop: 10 }}>Venta confirmada</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{NEGOCIO}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// El saldo sube de 0 a la comisión. Componente aparte: cambia de texto ~30
// veces y no debe repintar el resto.
function Contador({ activo, quieto }: { activo: boolean; quieto: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!activo) return setN(0);
    if (quieto) return setN(COMISION);
    const ini = Date.now() + 500;
    const id = setInterval(() => {
      const p = Math.min(1, Math.max(0, (Date.now() - ini) / 1300));
      const suave = 1 - Math.pow(1 - p, 3);
      setN(Math.round(COMISION * suave * 100) / 100);
      if (p >= 1) clearInterval(id);
    }, 33);
    return () => clearInterval(id);
  }, [activo, quieto]);
  return <Text style={{ fontFamily: F.bold, fontSize: 52, color: '#fff', letterSpacing: -1.6 }}>+${n.toFixed(2)}</Text>;
}

function EscenaGanas({ t, quieto, activa, onRecomendar, onRepetir }: { t: Valor; quieto: boolean; activa: boolean; onRecomendar: () => void; onRepetir: () => void }) {
  const e = ESCENAS[5];
  return (
    // Las escenas están encimadas: esta (con botones) queda arriba, así que no
    // recibe toques hasta que le toca.
    <Animated.View pointerEvents={activa ? 'box-none' : 'none'} style={[styles.escena, entrada(t, e.ini, null, quieto)]}>
      <Animated.View style={pop(t, e.ini + 300, quieto)}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(0,168,150,0.2)', alignSelf: 'center' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: '#3FE0CC' }}>Comisión recibida</Text>
        </View>
      </Animated.View>
      <View style={{ marginTop: 10 }}>
        <Contador activo={activa} quieto={quieto} />
      </View>
      <Animated.Text style={[{ fontFamily: F.semi, fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.6)', marginTop: 6, textTransform: 'uppercase' }, entrada(t, e.ini + 1600, null, quieto, 10)]}>
        Recomienda · Conecta · Gana
      </Animated.Text>
      <Animated.View style={[{ marginTop: 26, width: 260, gap: 10 }, entrada(t, e.ini + 2300, null, quieto, 16)]}>
        <PressableScale onPress={onRecomendar} accessibilityRole="button" style={{ borderRadius: R.md, overflow: 'hidden' }}>
          <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="send" size={17} color="#fff" />
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Recomendar ahora</Text>
          </LinearGradient>
        </PressableScale>
        <PressableScale onPress={onRepetir} accessibilityRole="button" style={{ height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
          <Icon name="refresh" size={14} color="rgba(255,255,255,0.75)" sw={2} />
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Ver de nuevo</Text>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );
}

// ── Reproductor ───────────────────────────────────────────────────────────────

/**
 * Pantalla completa sobre la app (no un Modal: así no hay ventana nativa que
 * abrir y cerrar). Entra con escala + fundido y sale antes de desmontarse.
 */
export function ExplicadorHazlo({ visible, onCerrar, onRecomendar }: { visible: boolean; onCerrar: () => void; onRecomendar: () => void }) {
  const [montado, setMontado] = useState(visible);
  const [vuelta, setVuelta] = useState(0);
  const [escena, setEscena] = useState(0);
  const quieto = useReduceMotion();
  const insets = useSafeAreaInsets();
  const t = useRef(new Animated.Value(0)).current;
  const capa = useRef(new Animated.Value(0)).current;

  // Entrada / salida de la capa completa.
  useEffect(() => {
    if (visible) {
      setMontado(true);
      Animated.timing(capa, { toValue: 1, duration: quieto ? 0 : DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
    } else if (montado) {
      Animated.timing(capa, { toValue: 0, duration: quieto ? 0 : DUR.base, easing: EASE.in, useNativeDriver: true }).start(() => setMontado(false));
    }
  }, [visible, montado, capa, quieto]);

  // Reloj de 30 s y marcas de escena (para montar lo que vive en JS).
  useEffect(() => {
    if (!visible) return;
    t.setValue(0);
    setEscena(0);
    const reloj = Animated.timing(t, { toValue: DURACION, duration: DURACION, easing: Easing.linear, useNativeDriver: true });
    reloj.start();
    const marcas = ESCENAS.map((e, i) => setTimeout(() => setEscena(i), e.ini));
    return () => {
      reloj.stop();
      marcas.forEach(clearTimeout);
    };
  }, [visible, vuelta, t]);

  if (!montado) return null;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 50, backgroundColor: '#0A0A0A', opacity: capa, transform: [{ scale: capa.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1] }) }] },
      ]}>
      {/* Fondo: negro con un calor de marca muy tenue hacia abajo. */}
      <LinearGradient pointerEvents="none" colors={['#0A0A0A', '#0A0A0A', '#2A1307']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

      <View style={{ flex: 1, paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24, paddingHorizontal: 22 }}>
        {/* Progreso por escena, estilo historias */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
            {ESCENAS.map((e) => (
              <View key={e.ini} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
                <Animated.View
                  style={{
                    height: 3,
                    backgroundColor: '#fff',
                    transformOrigin: 'left',
                    transform: [{ scaleX: t.interpolate({ inputRange: [e.ini, e.fin], outputRange: [0, 1], extrapolate: 'clamp' }) }],
                  }}
                />
              </View>
            ))}
          </View>
          <PressableScale
            onPress={onCerrar}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={8}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={16} color="#fff" sw={2.2} />
          </PressableScale>
        </View>

        {/* Títulos: uno por escena, encimados en el mismo lugar */}
        <View style={{ height: 118, marginTop: 34 }}>
          {ESCENAS.map((e) => (
            <Titulo key={e.ini} t={t} e={e} quieto={quieto} />
          ))}
        </View>

        {/* Escenario (un poco arriba del centro: abajo quedan los botones del final) */}
        <View style={{ flex: 1, marginBottom: 48 }}>
          <EscenaIntro t={t} quieto={quieto} />
          <EscenaElegir t={t} quieto={quieto} />
          <EscenaQr t={t} quieto={quieto} activa={escena === 2} />
          <EscenaCompartir t={t} quieto={quieto} />
          <EscenaCompra t={t} quieto={quieto} />
          <EscenaGanas t={t} quieto={quieto} activa={escena === 5} onRecomendar={onRecomendar} onRepetir={() => setVuelta((v) => v + 1)} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  escena: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
});
