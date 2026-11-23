import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Ubicacion } from '@/lib/types';

import { Fade, PressableScale } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { aLienzo, armarZonas, coloniaEn, type ZonaBase } from './datos';
import { CapaBase } from './Lienzo';
import { TIERRA } from './paleta';
import type { Geometria } from './tipos';

/**
 * Vista previa fija de dónde está un negocio: un recorte de la ciudad con el
 * pin al centro y su colonia marcada. No se arrastra; tocarla abre el selector.
 */

// A 5× una unidad del lienzo (~22 m) mide 5 px: se ve la cuadra y sus alrededores (~1.5 km).
const ESCALA = 5;
const GROSOR = 0.4;

// La geometría pesa: se pide una vez y queda para todas las vistas previas.
let geoGuardada: Geometria | null = null;
let coloniasGuardadas: ZonaBase[] | null = null;

/** `activo` en false no la pide todavía. */
export function useGeometria(activo = true): Geometria | null {
  const [geo, setGeo] = useState(geoGuardada);
  useEffect(() => {
    if (geo || !activo) return;
    let vivo = true;
    import('./geometria')
      .then((g) => {
        geoGuardada = g;
        if (vivo) setGeo(g);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [geo, activo]);
  return geo;
}

function coloniasDe(geo: Geometria): ZonaBase[] {
  coloniasGuardadas ??= armarZonas(geo, []).colonias;
  return coloniasGuardadas;
}

export function MiniMapa({
  ubicacion,
  alto = 150,
  onPress,
  accion = 'Mover pin',
}: {
  ubicacion: Ubicacion;
  alto?: number;
  onPress?: () => void;
  accion?: string;
}) {
  const geo = useGeometria();
  const [ancho, setAncho] = useState(0);

  const vista = useMemo(() => {
    if (!geo || ancho === 0) return null;
    const { x, y } = aLienzo(geo, ubicacion.lat, ubicacion.lng);
    const w = ancho / ESCALA;
    const h = alto / ESCALA;
    const colonia = coloniaEn(coloniasDe(geo), x, y);
    return { geo, recorte: { x0: x - w / 2, y0: y - h / 2, w, h, ancho, alto }, colonia };
  }, [geo, ancho, alto, ubicacion.lat, ubicacion.lng]);

  const contenido = (
    <View onLayout={(e) => setAncho(Math.round(e.nativeEvent.layout.width))} style={{ height: alto, borderRadius: R.md, overflow: 'hidden', backgroundColor: TIERRA }}>
      {vista && (
        // La key cambia con el pin: al moverlo, el recorte nuevo entra con su fade.
        <Fade key={`${ubicacion.lat},${ubicacion.lng}`} style={StyleSheet.absoluteFill}>
          <CapaBase geo={vista.geo} grosor={GROSOR} recorte={vista.recorte} />
          {vista.colonia && (
            <Svg
              width={ancho}
              height={alto}
              viewBox={`${vista.recorte.x0} ${vista.recorte.y0} ${vista.recorte.w} ${vista.recorte.h}`}
              style={StyleSheet.absoluteFill}>
              <Path d={vista.colonia.d} fill={`${C.accent}12`} fillRule="evenodd" stroke={`${C.accent}88`} strokeWidth={0.35} strokeLinejoin="round" />
            </Svg>
          )}
        </Fade>
      )}

      {vista && (
        <Fade key={`pin-${ubicacion.lat},${ubicacion.lng}`} delay={90} desde={-10} style={{ position: 'absolute', left: ancho / 2 - 17, top: alto / 2 - 34, width: 34, height: 34, alignItems: 'center', pointerEvents: 'none' }}>
          <Ionicons name="location" size={34} color={C.accent} />
        </Fade>
      )}

      {vista?.colonia && (
        <Fade delay={140} desde={6} style={{ position: 'absolute', left: 10, bottom: 10, maxWidth: ancho - 120, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.94)' }}>
          <Ionicons name="location-outline" size={12} color={C.accent} />
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.semi, fontSize: 11, color: FG }}>
            {vista.colonia.nombre}
          </Text>
        </Fade>
      )}

      {onPress && vista && (
        <Fade delay={140} desde={6} style={{ position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: FG }}>
          <Ionicons name="move-outline" size={12} color="#fff" />
          <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#fff' }}>{accion}</Text>
        </Fade>
      )}

      {!vista && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>Cargando mapa…</Text>
        </View>
      )}
    </View>
  );

  if (!onPress) return contenido;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={vista?.colonia ? `Ubicado en ${vista.colonia.nombre}. ${accion}` : accion}>
      {contenido}
    </PressableScale>
  );
}
