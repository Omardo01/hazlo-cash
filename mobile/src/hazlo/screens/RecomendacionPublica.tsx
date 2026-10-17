import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { useCodigoPublico } from '@/lib/datos/consultas';
import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { TarjetaSkeleton } from '../Skeleton';
import { BG, C, F, FG, MUTED, R } from '../theme';

/**
 * Lo que abre el link del mensaje de WhatsApp (/r/HAZLO-XXXX), sin sesión:
 * a quién te recomendaron, tu promo y el QR para enseñarlo al pagar. El QR es
 * el mismo de la foto que mandó el recomendador: el escáner del negocio saca
 * el código de ahí y registra la venta (modelo taquería).
 */
export function RecomendacionPublica({ codigo }: { codigo: string }) {
  const { datos, cargando, error, refrescar } = useCodigoPublico(codigo);
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 36, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 440 }}>
          <Fade desde={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <HazloMark size={24} />
            <Text style={{ fontFamily: F.bold, fontSize: 17, color: FG, letterSpacing: -0.3 }}>
              Hazlo <Text style={{ color: C.primary }}>Cash</Text>
            </Text>
          </Fade>

          {cargando ? (
            <Fade>
              <TarjetaSkeleton h={460} />
            </Fade>
          ) : error ? (
            <Aviso
              titulo="No pudimos cargar tu recomendación"
              texto="Revisa tu conexión e intenta de nuevo."
              boton="Reintentar"
              onPress={() => refrescar()}
            />
          ) : !datos ? (
            <Aviso
              titulo="Este QR ya se usó o no está activo"
              texto="Cada QR sirve para una sola compra. Pídele a quien te lo mandó uno nuevo."
              boton="Conocer Hazlo Cash"
              onPress={() => router.replace('/')}
            />
          ) : (
            <>
              {/* Lo mismo que trae la foto del QR, en grande para enseñarlo en caja. */}
              <Fade desde={14} style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#0D0D0D', overflow: 'hidden' }}>
                <View style={{ position: 'absolute', right: -44, bottom: -44, opacity: 0.4 }}>
                  <HazloMark size={200} />
                </View>
                <Text style={{ fontFamily: F.semi, fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.9, textTransform: 'uppercase' }}>
                  Te recomendaron
                </Text>
                <Text style={{ fontFamily: F.bold, fontSize: 28, color: '#fff', letterSpacing: -0.6, marginTop: 4 }}>{datos.negocio}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }} numberOfLines={2}>
                  {[datos.categoria, datos.direccion].filter(Boolean).join(' · ')}
                </Text>

                {datos.oferta ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: `${C.primary}26` }}>
                    <Icon name="gift" size={16} color={C.primary} sw={2} />
                    <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary, flexShrink: 1 }}>{datos.oferta}</Text>
                  </View>
                ) : null}

                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <View style={{ padding: 16, borderRadius: R.lg, backgroundColor: '#fff' }}>
                    <QRCode value={datos.shareUrl} size={208} color="#0D0D0D" backgroundColor="#fff" ecl="H" />
                    <View style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -22, marginTop: -22, width: 44, height: 44, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
                      <HazloMark size={22} />
                    </View>
                  </View>
                  <Text style={{ fontFamily: F.bold, fontSize: 24, color: '#fff', letterSpacing: 1.4, marginTop: 16 }}>{datos.codigo}</Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Enséñalo al pagar</Text>
                </View>
              </Fade>

              <Fade delay={STAGGER * 2} desde={12} style={{ marginTop: 14, borderRadius: R.lg, padding: 18, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', gap: 14 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Cómo usarlo</Text>
                <Paso n={1} texto={`Ve a ${datos.negocio}${datos.direccion ? ` (${datos.direccion})` : ''}.`} />
                <Paso n={2} texto={`Al pagar, enseña este QR o di tu código ${datos.codigo}.`} />
                <Paso n={3} texto={datos.oferta ? 'El negocio lo escanea y te aplica tu promo.' : 'El negocio lo escanea y registra tu visita.'} />
              </Fade>

              <Fade delay={STAGGER * 3} desde={12} style={{ marginTop: 14, borderRadius: R.lg, padding: 18, backgroundColor: `${C.primary}12`, borderWidth: 1, borderColor: `${C.primary}33` }}>
                <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>¿Tú también conoces lugares buenos?</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 19 }}>
                  Recomiéndalos con Hazlo Cash y gana dinero cada vez que alguien use tu código.
                </Text>
                <PressableScale
                  onPress={() => router.replace('/')}
                  accessibilityRole="button"
                  style={{ marginTop: 14, height: 46, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Quiero recomendar</Text>
                  <Icon name="chevR" size={15} color="#fff" sw={2.4} />
                </PressableScale>
              </Fade>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Paso({ n, texto }: { n: number; texto: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: F.bold, fontSize: 12, color: '#fff' }}>{n}</Text>
      </View>
      <Text style={{ flex: 1, fontFamily: F.reg, fontSize: 13.5, color: FG, lineHeight: 20, marginTop: 2 }}>{texto}</Text>
    </View>
  );
}

function Aviso({ titulo, texto, boton, onPress }: { titulo: string; texto: string; boton: string; onPress: () => void }) {
  return (
    <Fade desde={12} style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', alignItems: 'flex-start' }}>
      <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG }}>{titulo}</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>{texto}</Text>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        style={{ marginTop: 16, height: 44, paddingHorizontal: 18, borderRadius: R.md, backgroundColor: FG, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>{boton}</Text>
      </PressableScale>
    </Fade>
  );
}
