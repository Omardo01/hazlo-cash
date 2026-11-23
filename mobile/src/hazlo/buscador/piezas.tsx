import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';

export type IconoIon = ComponentProps<typeof Ionicons>['name'];

/** Un renglón del panel: ícono o número, dos líneas y algo a la derecha. */
export function Renglon({
  indice,
  icono,
  numero,
  color,
  titulo,
  detalle,
  derecha,
  etiqueta,
  alTocar,
}: {
  indice: number;
  icono?: IconoIon;
  numero?: number;
  color: string;
  titulo: ReactNode;
  detalle: string;
  /** Distancia. */
  derecha?: string | null;
  /** Qué es: Giro, Negocio o Colonia. */
  etiqueta?: string;
  alTocar: () => void;
}) {
  return (
    <Fade delay={Math.min(indice, 6) * STAGGER} desde={6}>
      <PressableScale
        onPress={alTocar}
        accessibilityRole="button"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderTopWidth: indice === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(13,13,13,0.08)' }}>
        <View style={{ width: 40, height: 40, borderRadius: 13, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          {/* El color del grupo viene en HSL: se aclara con opacidad, no con alfa. */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: 0.13 }]} />
          {numero ? <Text style={{ fontFamily: F.bold, fontSize: 15, color }}>{numero}</Text> : icono ? <Ionicons name={icono} size={19} color={color} /> : null}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14.5, letterSpacing: -0.2, color: FG }}>{titulo}</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 1 }}>{detalle}</Text>
        </View>
        {derecha ? <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG }}>{derecha}</Text> : null}
        {etiqueta ? (
          <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(13,13,13,0.06)' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: MUTED }}>{etiqueta}</Text>
          </View>
        ) : null}
      </PressableScale>
    </Fade>
  );
}

export function Titulo({ children, cuenta, demora = 0 }: { children: ReactNode; cuenta?: number; demora?: number }) {
  return (
    <Fade delay={demora} desde={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16, marginBottom: 6 }}>
      <Text style={{ flexShrink: 1, fontFamily: F.semi, fontSize: 12.5, color: MUTED }}>{children}</Text>
      {cuenta !== undefined && (
        <View style={{ paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, backgroundColor: `${C.primary}24` }}>
          <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.accent }}>{cuenta}</Text>
        </View>
      )}
    </Fade>
  );
}

/** Sin cuenta se ve el lugar; su menú y su promoción, no. */
export function RegistrateParaVer({ alTocar }: { alTocar: () => void }) {
  return (
    <PressableScale
      onPress={alTocar}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: R.md, backgroundColor: `${C.primary}14`, borderWidth: StyleSheet.hairlineWidth, borderColor: `${C.primary}44` }}>
      <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={15} color="#fff" sw={2.2} />
      </View>
      <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 13.5, lineHeight: 18, color: FG }}>
        Regístrate gratis <Text style={{ fontFamily: F.reg, color: 'rgba(13,13,13,0.72)' }}>para ver las promociones</Text>
      </Text>
      <Icon name="chevR" size={15} color={C.accent} sw={2.4} />
    </PressableScale>
  );
}
