import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import type { NegocioCatalogo } from '@/lib/types';

import { girosDeNegocio, grupoDeCategoria } from '../categorias/grupoDeNegocio';
import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { hueColors } from '../ui';
import { MenuNegocio } from './MenuNegocio';

/**
 * Lo que ves al abrir un negocio en Descubre: de qué es, su beneficio Hazlo
 * Cash, su menú y el botón para recomendarlo (que lleva directo a su QR).
 * Sin cuenta, el beneficio no viaja al teléfono y recomendar pide entrar.
 */
export function FichaNegocio({ negocio, invitado, onRecomendar }: { negocio: NegocioCatalogo; invitado: boolean; onRecomendar: () => void }) {
  const grupo = grupoDeCategoria(negocio.categoria);
  const giros = girosDeNegocio(negocio);
  const [a, b, c] = hueColors(grupo.hue);

  return (
    <>
      <Fade desde={12}>
        <View style={{ borderRadius: 22, overflow: 'hidden', padding: 18, minHeight: 150, justifyContent: 'flex-end' }}>
          <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', right: -16, top: -10, opacity: 0.15 }}>
            <Ionicons name={grupo.icono} size={130} color="#fff" />
          </View>
          <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)', marginBottom: 10 }}>
            <Ionicons name={grupo.icono} size={13} color="#fff" />
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: '#fff' }}>{grupo.nombre}</Text>
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 26, color: '#fff', letterSpacing: -0.6 }}>{negocio.nombre}</Text>
          {giros.length > 0 && <Text numberOfLines={2} style={{ fontFamily: F.reg, fontSize: 12.5, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{giros.join(' · ')}</Text>}
        </View>
      </Fade>

      {(negocio.descripcion || negocio.direccion) && (
        <Fade delay={STAGGER} desde={8} style={{ marginTop: 12, gap: 8 }}>
          {negocio.descripcion && <Text style={{ fontFamily: F.reg, fontSize: 13, lineHeight: 19, color: FG }}>{negocio.descripcion}</Text>}
          {negocio.direccion && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location-outline" size={15} color={MUTED} />
              <Text numberOfLines={2} style={{ flex: 1, fontFamily: F.reg, fontSize: 12, color: MUTED }}>{negocio.direccion}</Text>
            </View>
          )}
        </Fade>
      )}

      <Fade delay={STAGGER * 2} desde={8} style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.md, backgroundColor: `${C.primary}12`, borderWidth: StyleSheet.hairlineWidth, borderColor: `${C.primary}40` }}>
          <HazloMark size={22} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>Beneficio para quien llega recomendado</Text>
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG, marginTop: 2 }}>{invitado ? 'Entra para ver el beneficio' : (negocio.oferta ?? 'Pregunta en el negocio')}</Text>
          </View>
        </View>
      </Fade>

      <Fade delay={STAGGER * 3} desde={8} style={{ marginTop: 12 }}>
        <PressableScale onPress={onRecomendar} accessibilityRole="button" accessibilityLabel={`Recomendar ${negocio.nombre}`} style={{ height: 54, borderRadius: R.md, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {/* En su propia View: en web el ícono suelto queda debajo del degradado. */}
          <View>
            <Icon name="qr" size={19} color="#fff" sw={2} />
          </View>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Recomendar y ganar</Text>
        </PressableScale>
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, textAlign: 'center', marginTop: 8 }}>
          {invitado ? 'Crea tu cuenta para generar tu QR de recomendación.' : 'Generamos tu QR para este negocio y lo mandas por WhatsApp.'}
        </Text>
      </Fade>

      <Fade delay={STAGGER * 4} desde={8}>
        <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG, marginTop: 22, marginBottom: 10 }}>Menú</Text>
      </Fade>
      <MenuNegocio negocioId={negocio.id} delay={STAGGER * 4} />
    </>
  );
}
