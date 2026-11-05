import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { grupoPorSlug, type IconoGrupo } from '../categorias/catalogo';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED } from '../theme';
import { hueColors } from '../ui';
import { SIN_FILTRO, contarGiros, contarGrupos, type Filtro, type NegocioMapa } from './datosEjemplo';

const SOMBRA = '0 1px 6px rgba(13,13,13,0.13)';

function Chip({
  etiqueta,
  cuenta,
  icono,
  color,
  activo,
  indice,
  alTocar,
}: {
  etiqueta: string;
  cuenta?: number;
  icono?: IconoGrupo;
  color: string;
  activo: boolean;
  indice: number;
  alTocar: () => void;
}) {
  return (
    <Fade delay={Math.min(indice, 5) * STAGGER} desde={6}>
      <PressableScale
        onPress={alTocar}
        accessibilityRole="button"
        accessibilityState={{ selected: activo }}
        accessibilityLabel={cuenta === undefined ? etiqueta : `${etiqueta}, ${cuenta} negocios`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: activo ? color : '#fff', boxShadow: SOMBRA }}>
        {icono && <Ionicons name={icono} size={13} color={activo ? '#fff' : color} />}
        <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: activo ? '#fff' : FG }}>{etiqueta}</Text>
        {cuenta !== undefined && <Text style={{ fontFamily: F.base, fontSize: 10.5, color: activo ? 'rgba(255,255,255,0.8)' : MUTED }}>{cuenta}</Text>}
      </PressableScale>
    </Fade>
  );
}

/**
 * Giros sobre el mapa: primero los grupos del catálogo; al entrar a uno, sus
 * giros. Igual que Descubre, para que se recorra de la misma manera.
 */
export function FiltroGiros({ negocios, filtro, alCambiar }: { negocios: NegocioMapa[]; filtro: Filtro; alCambiar: (f: Filtro) => void }) {
  const grupo = filtro.grupo ? grupoPorSlug(filtro.grupo) : undefined;

  if (!grupo) {
    return (
      <Fade key="grupos">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 4, gap: 6 }}>
          <Chip etiqueta="Todos" cuenta={negocios.length} color={FG} activo indice={0} alTocar={() => alCambiar(SIN_FILTRO)} />
          {contarGrupos(negocios).map((c, i) => (
            <Chip key={c.grupo.slug} etiqueta={c.grupo.nombre} cuenta={c.negocios} icono={c.grupo.icono} color={hueColors(c.grupo.hue)[1]} activo={false} indice={i + 1} alTocar={() => alCambiar({ grupo: c.grupo.slug, giro: null })} />
          ))}
        </ScrollView>
      </Fade>
    );
  }

  const color = hueColors(grupo.hue)[1];
  const giros = contarGiros(negocios, grupo.slug);
  // Un giro que llegó por la búsqueda puede no tener negocios todavía.
  if (filtro.giro && !giros.some((g) => g.giro === filtro.giro)) giros.unshift({ giro: filtro.giro, negocios: 0 });

  return (
    <Fade key={grupo.slug}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 4, gap: 6 }}>
        <PressableScale
          onPress={() => alCambiar(SIN_FILTRO)}
          accessibilityRole="button"
          accessibilityLabel={`Quitar el filtro de ${grupo.nombre}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: filtro.giro ? '#fff' : color, boxShadow: SOMBRA }}>
          <Ionicons name="close" size={13} color={filtro.giro ? color : '#fff'} />
          <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: filtro.giro ? FG : '#fff' }}>{grupo.nombre}</Text>
        </PressableScale>
        <View style={{ width: 1, marginVertical: 6, backgroundColor: 'rgba(13,13,13,0.14)' }} />
        {giros.map((g, i) => (
          <Chip
            key={g.giro}
            etiqueta={g.giro}
            cuenta={g.negocios}
            color={color || C.primary}
            activo={filtro.giro === g.giro}
            indice={i}
            alTocar={() => alCambiar({ grupo: grupo.slug, giro: filtro.giro === g.giro ? null : g.giro })}
          />
        ))}
      </ScrollView>
    </Fade>
  );
}
