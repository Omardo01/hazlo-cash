import { useState } from 'react';
import { Text, View } from 'react-native';

import { useMisSugerencias } from '@/lib/datos/consultas';
import type { EstadoSugerencia, MiSugerencia } from '@/lib/types';
import { grupoPorSlug } from '../categorias/catalogo';
import { IconoGrupo } from '../categorias/piezas';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { SectionHeader } from '../ui';
import { hace } from './AdminNegocios';

const MORADO = '#2D2B8F';
const TEAL = '#00A896';
const VISIBLES = 3;

// `paso`: hasta dónde se llena la barra de 3 (−1: descartada, sin barra).
const ESTADOS: Record<EstadoSugerencia, { pill: string; color: string; nota: string; paso: number }> = {
  nueva: { pill: 'En revisión', color: C.primary, nota: 'Lo estamos revisando para invitarlo.', paso: 0 },
  contactada: { pill: 'Lo invitamos', color: MORADO, nota: 'Ya le escribimos para que se sume.', paso: 1 },
  sumada: { pill: '¡Ya se sumó!', color: TEAL, nota: 'Ya está en Hazlo Cash.', paso: 2 },
  descartada: { pill: 'No se sumó', color: MUTED, nota: 'Esta vez no fue posible sumarlo.', paso: -1 },
};

const PASOS = ['Recomendado', 'Invitado', 'En Hazlo Cash'];

function Tarjeta({ s }: { s: MiSugerencia }) {
  const grupo = grupoPorSlug(s.grupo);
  const e = ESTADOS[s.estado];

  return (
    <View style={{ padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {grupo && <IconoGrupo grupo={grupo} size={38} />}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14.5, color: FG }}>{s.nombre}</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>
            {s.giro} · {hace(s.created_at)}
          </Text>
        </View>
        <View style={{ paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, backgroundColor: `${e.color}1A` }}>
          <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: e.color }}>{e.pill}</Text>
        </View>
      </View>

      {e.paso >= 0 && (
        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {PASOS.map((p, i) => (
              <View key={p} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= e.paso ? e.color : 'rgba(13,13,13,0.08)' }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            {PASOS.map((p, i) => (
              <Text
                key={p}
                style={{ flex: 1, fontFamily: i === e.paso ? F.semi : F.reg, fontSize: 10, color: i <= e.paso ? FG : MUTED, textAlign: i === 0 ? 'left' : i === PASOS.length - 1 ? 'right' : 'center' }}>
                {p}
              </Text>
            ))}
          </View>
        </View>
      )}

      <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 10, lineHeight: 16 }}>
        {e.nota}
        {s.total > 1 && (
          <>
            {' '}Lo recomendaron {s.total} personas y tú fuiste la <Text style={{ fontFamily: F.semi, color: FG }}>#{s.lugar}</Text>.
          </>
        )}
      </Text>
    </View>
  );
}

/**
 * Descubre → los negocios que el usuario propuso sumar y en qué van
 * (en revisión → invitado → en Hazlo Cash). No se pinta sin sesión ni si
 * todavía no ha recomendado ninguno.
 */
export function TusRecomendaciones({ conSesion }: { conSesion: boolean }) {
  const { datos: mias = [] } = useMisSugerencias(conSesion);
  const [todas, setTodas] = useState(false);
  if (mias.length === 0) return null;

  const visibles = todas ? mias : mias.slice(0, VISIBLES);

  return (
    <Fade delay={STAGGER * 3} desde={10} style={{ marginBottom: 22 }}>
      <SectionHeader title={`Tus recomendaciones · ${mias.length}`} />
      <View style={{ gap: 10 }}>
        {visibles.map((s, i) => (
          <Fade key={s.id} delay={STAGGER * Math.min(i, 5)} desde={8}>
            <Tarjeta s={s} />
          </Fade>
        ))}
      </View>
      {mias.length > VISIBLES && (
        <PressableScale
          onPress={() => setTodas((t) => !t)}
          accessibilityRole="button"
          style={{ marginTop: 10, height: 40, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: C.primary }}>{todas ? 'Ver menos' : `Ver todas (${mias.length})`}</Text>
          <View style={{ transform: [{ rotate: todas ? '-90deg' : '90deg' }] }}>
            <Icon name="chevR" size={13} color={C.primary} sw={2.2} />
          </View>
        </PressableScale>
      )}
    </Fade>
  );
}
