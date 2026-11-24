import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAtras } from '@/lib/atras';
import { hayUbicacion } from '@/lib/ubicacion';

import { Icon } from '../icons';
import { formatearDistancia } from '../mapa/datos';
import { TIERRA } from '../mapa/paleta';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { MapaLugares } from './MapaLugares';
import { ordenar, type Lugar } from './motor';
import { RegistrateParaVer } from './piezas';
import type { Buscador, PinLugar } from './useBuscador';

const SOMBRA = '0 2px 10px rgba(13,13,13,0.16)';
const ALTO_FICHA = 184;

/** Sin cuenta: qué es y en qué colonia. Ni menú, ni promociones, ni cómo llegar. */
function FichaLugar({ lugar, numero, metros, abajo, alRegistrarse }: { lugar: Lugar; numero?: number; metros: number | null; abajo: number; alRegistrarse: () => void }) {
  return (
    <Fade desde={28} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 18, paddingBottom: abajo + 18, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#fff', boxShadow: '0 -8px 28px rgba(13,13,13,0.14)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: `${C.accent}1C`, alignItems: 'center', justifyContent: 'center' }}>
          {numero ? <Text style={{ fontFamily: F.bold, fontSize: 17, color: C.accent }}>{numero}</Text> : <Ionicons name={lugar.grupo.icono} size={21} color={C.accent} />}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 18, letterSpacing: -0.4, color: FG }}>{lugar.nombre}</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 1 }}>{[lugar.giro, lugar.coloniaNombre ?? (lugar.punto ? null : 'Aún sin ubicación en el mapa')].filter(Boolean).join(' · ')}</Text>
        </View>
        {metros !== null && <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: FG }}>{formatearDistancia(metros)}</Text>}
      </View>
      <Fade delay={STAGGER} desde={6} style={{ marginTop: 14 }}>
        <RegistrateParaVer alTocar={alRegistrarse} />
      </Fade>
    </Fade>
  );
}

/** El minimapa a pantalla completa: se arrastra, se acerca y cada pin abre su lugar. */
export function MapaGrande({ buscador: b, inicial, alCerrar, alRegistrarse }: { buscador: Buscador; /** Lugar con el que se abre. */ inicial: string | null; alCerrar: () => void; alRegistrarse: () => void }) {
  const insets = useSafeAreaInsets();
  const quieto = useReduceMotion();
  const [activo, setActivo] = useState<string | null>(inicial);
  const p = useState(() => new Animated.Value(0))[0];
  const cerrando = useRef(false);

  useEffect(() => {
    if (quieto) p.setValue(1);
    else Animated.timing(p, { toValue: 1, duration: DUR.slow, easing: EASE.out, useNativeDriver: true }).start();
  }, [p, quieto]);

  const cerrar = useCallback(() => {
    if (cerrando.current) return;
    cerrando.current = true;
    if (quieto) alCerrar();
    else Animated.timing(p, { toValue: 0, duration: DUR.base, easing: EASE.in, useNativeDriver: true }).start(alCerrar);
  }, [p, quieto, alCerrar]);

  // Atrás cierra primero la ficha y luego el mapa.
  useAtras(true, cerrar);
  useAtras(!!activo && activo !== inicial, () => setActivo(null));

  const { geo, colonias, lugares } = b.indice;
  const lugar = lugares.find((l) => l.id === activo) ?? null;
  // El lugar abierto siempre lleva pin, aunque no esté entre los de la lista.
  const pines = useMemo<PinLugar[]>(() => {
    if (!lugar?.punto || b.pines.some((x) => x.lugar.id === lugar.id)) return b.pines;
    return [...b.pines, { lugar, fuera: false }];
  }, [b.pines, lugar]);
  const pin = pines.find((x) => x.lugar.id === activo);
  const metros = useMemo(() => {
    if (!lugar) return null;
    const { dentro, fuera } = b.resultados;
    const ya = [...dentro, ...fuera, ...b.cercanos].find((c) => c.lugar.id === lugar.id);
    return ya ? ya.metros : (ordenar(b.indice, [lugar], b.yo)[0]?.metros ?? null);
  }, [lugar, b.resultados, b.cercanos, b.indice, b.yo]);

  const resumen = [b.que?.etiqueta, b.colonia?.nombre].filter(Boolean).join(' · ') || (b.fase === 'escribe' ? [b.entendido.etiqueta, b.entendido.colonia?.nombre].filter(Boolean).join(' · ') : b.zona ? `Cerca de ${b.zona.nombre}` : 'Villahermosa');
  const arriba = insets.top + 64;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 20, backgroundColor: TIERRA, opacity: p, transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
      {geo && (
        <MapaLugares geo={geo} colonias={colonias} pines={pines} encuadrar={b.encuadrar} zona={b.zona} yo={b.yo} activo={activo} margenArriba={arriba} margenAbajo={lugar ? ALTO_FICHA + insets.bottom : 84 + insets.bottom} alTocarPin={setActivo} />
      )}

      <View style={{ position: 'absolute', left: 14, right: 14, top: insets.top + 10, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <PressableScale onPress={cerrar} accessibilityRole="button" accessibilityLabel="Cerrar el mapa" hitSlop={6} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: SOMBRA }}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name="chevR" size={17} color={FG} sw={2.3} />
          </View>
        </PressableScale>
        <View style={{ flex: 1, height: 46, borderRadius: 23, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#fff', boxShadow: SOMBRA }}>
          <Icon name="search" size={16} color={C.primary} sw={2.3} />
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: F.semi, fontSize: 13.5, color: FG }}>{resumen}</Text>
        </View>
        {hayUbicacion && (
          <PressableScale onPress={b.usarUbicacion} disabled={b.ubicando} accessibilityRole="button" accessibilityLabel="Ir a mi ubicación" style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: SOMBRA }}>
            {b.ubicando ? <ActivityIndicator size="small" color={FG} /> : <Ionicons name="locate" size={20} color={FG} />}
          </PressableScale>
        )}
      </View>

      {b.fallo && (
        <Fade key={b.fallo} desde={-6} style={{ position: 'absolute', left: 14, right: 14, top: arriba + 2, padding: 12, borderRadius: R.sm, backgroundColor: '#fff', boxShadow: SOMBRA }}>
          <Text style={{ fontFamily: F.base, fontSize: 12, lineHeight: 17, color: '#8A2E00' }}>{b.fallo}</Text>
        </Fade>
      )}

      {lugar ? (
        <FichaLugar key={lugar.id} lugar={lugar} numero={pin?.numero} metros={metros} abajo={insets.bottom} alRegistrarse={alRegistrarse} />
      ) : (
        <Fade key="ayuda" desde={8} style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 22, alignItems: 'center', pointerEvents: 'none' }}>
          <View style={{ paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999, backgroundColor: FG }}>
            <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: '#fff' }}>{pines.length === 0 ? 'Aún no hay lugares aquí' : `${pines.length === 1 ? '1 lugar' : `${pines.length} lugares`} · toca un pin`}</Text>
          </View>
        </Fade>
      )}
    </Animated.View>
  );
}
