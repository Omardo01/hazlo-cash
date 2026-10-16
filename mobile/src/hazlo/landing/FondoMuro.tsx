import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../icons';
import { bucle } from '../motion';
import { C, F } from '../theme';
import type { FondoProps } from './fondos';

/**
 * "En vivo": un muro inclinado de actividad que no para —gente ganando,
 * recomendando y negocios confirmando ventas—. Tres columnas corren en
 * sentidos y velocidades distintas; cada una es su lista repetida dos veces
 * que se desliza con translateY en bucle (native driver), así no se repinta
 * nada. Un velo oscuro deja el titular limpio en medio.
 */

type Tarjeta =
  | { tipo: 'gano'; quien: string; color: string; monto: number; donde: string; emoji: string }
  | { tipo: 'recomendo'; quien: string; color: string; donde: string; emoji: string }
  | { tipo: 'venta'; donde: string; emoji: string };

const COLUMNAS: Tarjeta[][] = [
  [
    { tipo: 'gano', quien: 'Ana', color: '#FE7801', monto: 25, donde: 'Tacos El Güero', emoji: '🌮' },
    { tipo: 'venta', donde: 'Taller Ruiz', emoji: '🔧' },
    { tipo: 'recomendo', quien: 'Beto', color: '#00A896', donde: 'Paletas La Ceiba', emoji: '🍦' },
    { tipo: 'gano', quien: 'Mariana', color: '#7B61FF', monto: 60, donde: 'Taller Ruiz', emoji: '🔧' },
    { tipo: 'gano', quien: 'Raúl', color: '#E5484D', monto: 18, donde: 'Café Don Chepe', emoji: '☕' },
    { tipo: 'venta', donde: 'Estética Glam', emoji: '💇' },
  ],
  [
    { tipo: 'recomendo', quien: 'Luis', color: '#2D9CDB', donde: 'Barbería Don Pepe', emoji: '💈' },
    { tipo: 'gano', quien: 'Sofi', color: '#F5A623', monto: 35, donde: 'Estética Glam', emoji: '💇' },
    { tipo: 'venta', donde: 'Tacos El Güero', emoji: '🌮' },
    { tipo: 'gano', quien: 'Jorge', color: '#00A896', monto: 40, donde: 'Barbería Don Pepe', emoji: '💈' },
    { tipo: 'recomendo', quien: 'Paty', color: '#E5484D', donde: 'Plomería Express', emoji: '🚰' },
    { tipo: 'gano', quien: 'Toño', color: '#7B61FF', monto: 22, donde: 'Pollos El Tabasqueño', emoji: '🍗' },
  ],
  [
    { tipo: 'gano', quien: 'Paty', color: '#E5484D', monto: 50, donde: 'Plomería Express', emoji: '🚰' },
    { tipo: 'recomendo', quien: 'Ana', color: '#FE7801', donde: 'Café Don Chepe', emoji: '☕' },
    { tipo: 'gano', quien: 'Luis', color: '#2D9CDB', monto: 15, donde: 'Paletas La Ceiba', emoji: '🍦' },
    { tipo: 'venta', donde: 'Barbería Don Pepe', emoji: '💈' },
    { tipo: 'gano', quien: 'Beto', color: '#00A896', monto: 30, donde: 'Tacos El Güero', emoji: '🌮' },
    { tipo: 'recomendo', quien: 'Sofi', color: '#F5A623', donde: 'Taller Ruiz', emoji: '🔧' },
  ],
];

// Puntos por segundo de cada columna; negativo = baja.
const VELOCIDAD = [16, -12, 19];
const ALTO = 66;
const ESPACIO = 10;
const INCLINACION = -9;

function Avatar({ inicial, color }: { inicial: string; color: string }) {
  return (
    <View style={[s.avatar, { backgroundColor: color }]}>
      <Text style={s.avatarTxt}>{inicial}</Text>
    </View>
  );
}

function TarjetaMuro({ t }: { t: Tarjeta }) {
  if (t.tipo === 'venta') {
    return (
      <View style={s.tarjeta}>
        <View style={[s.avatar, { backgroundColor: 'rgba(52,199,89,0.18)' }]}>
          <Icon name="check" size={15} color="#4ADE80" sw={2.4} />
        </View>
        <View style={s.texto}>
          <Text style={s.titulo} numberOfLines={1}>Venta confirmada</Text>
          <Text style={s.detalle} numberOfLines={1}>{t.emoji} {t.donde}</Text>
        </View>
      </View>
    );
  }
  if (t.tipo === 'recomendo') {
    return (
      <View style={s.tarjeta}>
        <Avatar inicial={t.quien[0]} color={t.color} />
        <View style={s.texto}>
          <Text style={s.titulo} numberOfLines={1}>{t.quien} recomendó</Text>
          <Text style={s.detalle} numberOfLines={1}>{t.emoji} {t.donde}</Text>
        </View>
        <Icon name="send" size={13} color="rgba(255,255,255,0.4)" sw={2} />
      </View>
    );
  }
  return (
    <View style={[s.tarjeta, s.tarjetaGano]}>
      <Avatar inicial={t.quien[0]} color={t.color} />
      <View style={s.texto}>
        <Text style={s.titulo} numberOfLines={1}>{t.quien} ganó</Text>
        <Text style={s.detalle} numberOfLines={1}>{t.emoji} {t.donde}</Text>
      </View>
      <Text style={s.monto}>+${t.monto}</Text>
    </View>
  );
}

const Columna = memo(function Columna({ tarjetas, ancho, alto, velocidad, quieto }: { tarjetas: Tarjeta[]; ancho: number; alto: number; velocidad: number; quieto: boolean }) {
  const p = useState(() => new Animated.Value(0))[0];
  const tramo = tarjetas.length * (ALTO + ESPACIO);
  // Copias de la lista para cubrir el alto visible más un tramo de recorrido.
  const copias = Math.ceil(alto / tramo) + 1;

  useEffect(() => {
    if (quieto) return;
    const a = bucle(
      Animated.timing(p, { toValue: 1, duration: (tramo / Math.abs(velocidad)) * 1000, easing: Easing.linear, useNativeDriver: true }),
    );
    a.start();
    return () => a.stop();
  }, [p, tramo, velocidad, quieto]);

  // La lista va repetida: al recorrer un tramo entero la segunda copia queda
  // exactamente donde empezó la primera y el bucle empata sin brinco.
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: velocidad > 0 ? [0, -tramo] : [-tramo, 0] });

  return (
    <Animated.View style={{ width: ancho, gap: ESPACIO, transform: [{ translateY }] }}>
      {Array.from({ length: copias }, () => tarjetas).flat().map((t, i) => (
        <TarjetaMuro key={i} t={t} />
      ))}
    </Animated.View>
  );
});

export function FondoMuro({ z, quieto }: FondoProps) {
  // El muro va inclinado y más grande que la tarjeta para tapar las esquinas.
  const ancho = z.w * 1.5;
  const columna = (ancho - ESPACIO * 2) / 3;
  const alto = z.h * 1.4;

  // Velo: deja ver el muro en los huecos y oscurece el logo, el titular y el
  // botón. Los cortes se fuerzan crecientes por si los huecos son chicos.
  const cortes: [number, string][] = [
    [0, 'rgba(0,0,0,0.85)'],
    [z.arriba[0] / z.h - 0.01, 'rgba(0,0,0,0.78)'],
    [z.arriba[0] / z.h + 0.06, 'rgba(0,0,0,0.22)'],
    [z.arriba[1] / z.h - 0.08, 'rgba(0,0,0,0.22)'],
    [z.arriba[1] / z.h + 0.02, 'rgba(0,0,0,0.88)'],
    [z.abajo[0] / z.h - 0.02, 'rgba(0,0,0,0.88)'],
    [z.abajo[0] / z.h + 0.08, 'rgba(0,0,0,0.22)'],
    [z.abajo[1] / z.h - 0.02, 'rgba(0,0,0,0.3)'],
    [1, 'rgba(0,0,0,0.85)'],
  ];
  let previo = 0;
  const locations = cortes.map(([l]) => (previo = Math.min(1, Math.max(previo, l))));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          left: (z.w - ancho) / 2,
          top: (z.h - alto) / 2,
          width: ancho,
          height: alto,
          flexDirection: 'row',
          gap: ESPACIO,
          overflow: 'hidden',
          transform: [{ rotate: `${INCLINACION}deg` }],
        }}>
        {COLUMNAS.map((tarjetas, i) => (
          <View key={i} style={{ marginTop: i === 1 ? -ALTO / 2 : 0 }}>
            <Columna tarjetas={tarjetas} ancho={columna} alto={alto} velocidad={VELOCIDAD[i]} quieto={quieto} />
          </View>
        ))}
      </View>
      <LinearGradient
        colors={cortes.map(([, c]) => c) as [string, string, ...string[]]}
        locations={locations as [number, number, ...number[]]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const s = StyleSheet.create({
  tarjeta: {
    height: ALTO,
    borderRadius: 16,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tarjetaGano: { backgroundColor: 'rgba(254,120,1,0.1)', borderColor: 'rgba(254,120,1,0.28)' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: F.semi, fontSize: 12, color: '#fff' },
  texto: { flex: 1, minWidth: 0 },
  titulo: { fontFamily: F.semi, fontSize: 11.5, color: 'rgba(255,255,255,0.88)' },
  detalle: { fontFamily: F.reg, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  monto: { fontFamily: F.bold, fontSize: 14, color: C.primary },
});
