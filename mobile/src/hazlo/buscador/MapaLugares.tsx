import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useCamara } from '../mapa/camara';
import type { ZonaBase } from '../mapa/datos';
import { Flotante, PuntoYo, Rotulo, SuperficieMapa, ZonaResaltada, escalasSinChoque } from '../mapa/Lienzo';
import { CapasConTrazo } from '../mapa/SelectorUbicacion';
import type { Geometria } from '../mapa/tipos';
import { DUR, EASE, Fade, STAGGER, useReduceMotion } from '../motion';
import { C, F } from '../theme';
import type { Punto } from './motor';
import type { PinLugar } from './useBuscador';

const ESCALA_MAX = 6;
const FUERA = '#4A4540';

/** La gota: la punta queda justo en el lugar. */
function Gota({ pin, activa, demora }: { pin: PinLugar; activa: boolean; demora: number }) {
  const p = useState(() => new Animated.Value(activa ? 1 : 0))[0];
  const quieto = useReduceMotion();
  useEffect(() => {
    if (quieto) p.setValue(activa ? 1 : 0);
    else Animated.timing(p, { toValue: activa ? 1 : 0, duration: activa ? DUR.slow : DUR.base, easing: activa ? EASE.out : EASE.in, useNativeDriver: true }).start();
  }, [activa, p, quieto]);
  const tam = 30;
  return (
    <Fade delay={demora} desde={-10}>
      {/* Crece desde la punta: el ancla va en (0, 0). */}
      <Animated.View
        style={{
          position: 'absolute',
          left: -tam / 2,
          top: -tam * 1.24,
          width: tam,
          height: tam * 1.24,
          transformOrigin: 'center bottom',
          transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
        }}>
        <View
          style={{
            width: tam,
            height: tam,
            borderTopLeftRadius: tam / 2,
            borderTopRightRadius: tam / 2,
            borderBottomRightRadius: tam / 2,
            borderBottomLeftRadius: 3,
            transform: [{ rotate: '-45deg' }],
            backgroundColor: pin.fuera ? FUERA : C.accent,
            borderWidth: 2,
            borderColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-2px 3px 7px rgba(13,13,13,0.28)',
          }}>
          <View style={{ transform: [{ rotate: '45deg' }] }}>
            {pin.numero ? <Text style={{ fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: '#fff' }}>{pin.numero}</Text> : <Ionicons name={pin.lugar.grupo.icono} size={14} color="#fff" />}
          </View>
        </View>
      </Animated.View>
    </Fade>
  );
}

/**
 * El mapa del buscador, chico o grande: pinta los lugares y vuela a donde estén
 * cada vez que cambian. Es el mismo lienzo del mapa de la ciudad, sin repintarlo.
 */
export function MapaLugares({
  geo,
  colonias,
  pines,
  encuadrar,
  zona,
  yo,
  activo = null,
  interactivo = false,
  margenArriba = 0,
  margenAbajo = 0,
  alTocarPin,
}: {
  geo: Geometria;
  colonias: ZonaBase[];
  pines: PinLugar[];
  /** Cuántos pines, desde el primero, deben caber. */
  encuadrar: number;
  zona: ZonaBase | null;
  yo: Punto | null;
  /** Id del lugar elegido: crece y el mapa se centra en él. */
  activo?: string | null;
  interactivo?: boolean;
  /** Lo que tapan la barra y la ficha del mapa grande. */
  margenArriba?: number;
  margenAbajo?: number;
  alTocarPin?: (id: string | null) => void;
}) {
  const camara = useCamara(geo.ANCHO_MAPA, geo.ALTO_MAPA, ESCALA_MAX);
  const quieto = useReduceMotion();
  const [tam, setTam] = useState({ w: 0, h: 0 });
  const alMedir = useCallback(
    (w: number, h: number) => {
      camara.medir(w, h);
      setTam((t) => (t.w === w && t.h === h ? t : { w, h }));
    },
    [camara],
  );

  // Qué tiene que caber: la zona, los primeros lugares y uno mismo.
  const vista = useMemo(() => {
    const w = tam.w;
    const h = tam.h - margenArriba - margenAbajo;
    if (w === 0 || h <= 0) return null;
    const elegido = pines.find((p) => p.lugar.id === activo)?.lugar.punto;
    if (elegido) return { x: elegido.x, y: elegido.y, escala: 3.4 };
    const puntos: Punto[] = [];
    for (const p of pines.slice(0, encuadrar)) if (p.lugar.punto) puntos.push(p.lugar.punto);
    if (yo) puntos.push(yo);
    if (zona) puntos.push({ x: zona.caja.x0, y: zona.caja.y0 }, { x: zona.caja.x1, y: zona.caja.y1 });
    if (puntos.length === 0) for (const c of colonias) puntos.push({ x: c.x, y: c.y });
    const x0 = Math.min(...puntos.map((p) => p.x));
    const x1 = Math.max(...puntos.map((p) => p.x));
    const y0 = Math.min(...puntos.map((p) => p.y));
    const y1 = Math.max(...puntos.map((p) => p.y));
    // Aire para que las gotas no se corten: arriba más, porque crecen hacia allá.
    const escala = Math.max(0.4, Math.min(3.6, (w - 56) / Math.max(1, x1 - x0), (h - 62) / Math.max(1, y1 - y0)));
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 - 14 / escala, escala };
  }, [tam, margenArriba, margenAbajo, pines, encuadrar, activo, zona, yo, colonias]);

  const primera = useRef(true);
  useEffect(() => {
    if (!vista) return;
    camara.volarA(vista.x, vista.y, vista.escala, margenArriba, tam.h - margenAbajo, !primera.current && !quieto);
    primera.current = false;
  }, [vista, camara, margenArriba, margenAbajo, tam.h, quieto]);

  const alTocar = useCallback(
    (x: number, y: number, escala: number) => {
      if (!alTocarPin) return;
      let mejor: string | null = null;
      let distancia = 30;
      for (const p of pines) {
        if (!p.lugar.punto) continue;
        // El cuerpo de la gota está unos 20 px arriba de su punta.
        const d = Math.hypot((p.lugar.punto.x - x) * escala, (p.lugar.punto.y - y) * escala - 20);
        if (d < distancia) {
          mejor = p.lugar.id;
          distancia = d;
        }
      }
      alTocarPin(mejor);
    },
    [pines, alTocarPin],
  );

  const escalaColonia = useMemo(() => escalasSinChoque(colonias, 10, 1), [colonias]);

  return (
    <View style={{ flex: 1, pointerEvents: interactivo ? 'auto' : 'none' }}>
      <SuperficieMapa
        camara={camara}
        ancho={geo.ANCHO_MAPA}
        alto={geo.ALTO_MAPA}
        alMedir={alMedir}
        alTocar={alTocar}
        capa={
          <View style={StyleSheet.absoluteFill}>
            <CapasConTrazo geo={geo} colonias={null} camara={camara} />
            <ZonaResaltada zona={zona} grosor={0.5} />
          </View>
        }
        encima={
          <>
            {interactivo &&
              colonias.map((z) => (
                <Flotante key={z.id} camara={camara} x={z.x} y={z.y} desde={escalaColonia.get(z) ?? 1.2}>
                  <Rotulo texto={z.nombre} peso={F.base} tam={10} color="rgba(13,13,13,0.66)" />
                </Flotante>
              ))}
            {/* Al revés: el más cercano queda encima si dos gotas se tocan. */}
            {[...pines].reverse().map((p) =>
              p.lugar.punto ? (
                <Flotante key={`${p.lugar.id}-${p.numero ?? ''}-${p.fuera ? 'f' : 'd'}`} camara={camara} x={p.lugar.punto.x} y={p.lugar.punto.y} desde={0.01} arriba={p.lugar.id === activo}>
                  <Gota pin={p} activa={p.lugar.id === activo} demora={Math.min(p.numero ?? 1, 6) * STAGGER} />
                </Flotante>
              ) : null,
            )}
            {/* Uno mismo nunca queda tapado. */}
            {yo && (
              <Flotante camara={camara} x={yo.x} y={yo.y} desde={0.01}>
                <Fade>
                  <PuntoYo />
                </Fade>
              </Flotante>
            )}
          </>
        }
      />
      <Text style={{ position: 'absolute', right: 8, bottom: 4 + margenAbajo, fontFamily: F.reg, fontSize: 8, color: 'rgba(13,13,13,0.45)', pointerEvents: 'none' }}>© OpenStreetMap</Text>
    </View>
  );
}
