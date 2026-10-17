import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import type { MiCodigo } from '@/lib/services/referrals';
import { HazloMark } from './HazloMark';
import { C, F, R } from './theme';

// Ancho en puntos de la tarjeta que se exporta como imagen. La captura sale a
// la densidad del dispositivo (≈3x en la mayoría), así que el PNG queda ~960px.
export const SHARE_CARD_WIDTH = 320;

/**
 * Tarjeta de recomendación lista para compartir como foto (WhatsApp, etc.).
 * Se renderiza fuera de pantalla y se captura con react-native-view-shot.
 * Debe bastarse sola: quien la recibe ve el QR, el negocio, la oferta y el
 * código aunque el mensaje de texto no llegue con la imagen.
 */
export const QrShareCard = forwardRef<View, { codigo: MiCodigo }>(function QrShareCard({ codigo }, ref) {
  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width: SHARE_CARD_WIDTH, padding: 24, backgroundColor: '#0D0D0D', borderRadius: R.lg, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ position: 'absolute', right: -46, bottom: -46, opacity: 0.4 }}>
        <HazloMark size={190} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
        <HazloMark size={16} />
        <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#fff', letterSpacing: 1.2 }}>HAZLO CASH</Text>
      </View>

      <Text style={{ fontFamily: F.reg, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 18, alignSelf: 'flex-start' }}>
        Te recomiendo
      </Text>
      <Text style={{ fontFamily: F.bold, fontSize: 24, color: '#fff', letterSpacing: -0.5, alignSelf: 'flex-start', marginTop: 2 }} numberOfLines={2}>
        {codigo.negocio}
      </Text>

      {codigo.oferta ? (
        <View style={{ alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: `${C.primary}22` }}>
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }} numberOfLines={2}>
            {codigo.oferta}
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: 18, padding: 14, borderRadius: R.lg, backgroundColor: '#fff' }}>
        <QRCode value={codigo.shareUrl} size={196} color="#0D0D0D" backgroundColor="#fff" ecl="M" />
      </View>

      <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff', letterSpacing: 1.4, marginTop: 16 }}>{codigo.codigo}</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 6, textAlign: 'center', lineHeight: 17 }}>
        Enséñalo al pagar o escanéalo{'\n'}para ver tu promo en hazlocash.com
      </Text>
    </View>
  );
});
