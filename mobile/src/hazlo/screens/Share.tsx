import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

import { escribir, invalidar } from '@/lib/datos/cache';
import { K, useEstadoCodigo, useMiCodigo, useNegocios } from '@/lib/datos/consultas';
import { crearCodigoReferido, mensajeReferido, type MiCodigo } from '@/lib/services/referrals';
import type { Business } from '@/lib/types';
import { CodigoScramble } from '../CodigoScramble';
import { esCancelacion, fotoDeTarjeta, puedeCompartirFoto } from '../fotoQrWeb';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { QrShareCard, SHARE_CARD_WIDTH } from '../QrShareCard';
import { C, F, FG, MUTED, R } from '../theme';
import { Glass, SectionHeader } from '../ui';

const steps: { t: string; d: string; icon: IconName }[] = [
  { t: 'Recomienda', d: 'Comparte tu código con tus amigos.', icon: 'send' },
  { t: 'Ellos prueban', d: 'Usan tu recomendación en algo que les guste.', icon: 'heart' },
  { t: 'Tú ganas', d: 'Recibes dinero real en tu balance.', icon: 'dollar' },
];

export function ShareScreen() {
  const [negocios, setNegocios] = useState<Business[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [codigo, setCodigo] = useState<MiCodigo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // Se muestra tras compartir la foto: el mensaje queda en el portapapeles
  // porque WhatsApp no acepta imagen + texto prellenado en el mismo intent.
  const [pegarHint, setPegarHint] = useState(false);
  const cardRef = useRef<View>(null);
  // Web: la foto del QR ya lista para compartir (ver fotoQrWeb.ts).
  const fotoWeb = useRef<File | null>(null);
  // Generación animada, igual que el código de invitación: 0 el código gira
  // mientras el servidor lo genera, 1 aparece el QR, 2 listo (botones activos).
  // genKey 0 = el código vino de la caché al abrir: se muestra ya listo.
  const [fase, setFase] = useState<0 | 1 | 2>(2);
  const [genKey, setGenKey] = useState(0);
  const [generandoPara, setGenerandoPara] = useState<string | null>(null);

  // Catálogo y código propio salen de la caché compartida: volver a esta
  // pantalla ya no vuelve a pedirlos.
  const { datos: negociosCache = [], cargando: cargandoNegocios } = useNegocios();
  const { datos: mio, cargando: cargandoCodigo } = useMiCodigo();
  // Cada QR sirve para una sola venta: si el que está en pantalla ya se usó,
  // en vez de mandarlo otra vez se ofrece uno nuevo.
  const { datos: estadoCodigo } = useEstadoCodigo(fase >= 2 && codigo ? codigo.codigo : null);
  const usado = estadoCodigo?.activo === false;

  useEffect(() => {
    setNegocios(negociosCache);
    // Una vez que se generó algo aquí, la pantalla manda (no la caché).
    if (mio && genKey === 0) {
      setCodigo(mio);
      setSel(negociosCache.find((n) => n.nombre === mio.negocio)?.id ?? null);
    }
  }, [negociosCache, mio, genKey]);

  const alTerminarCodigo = useCallback(() => setFase(1), []);
  useEffect(() => {
    if (fase !== 1) return;
    const t = setTimeout(() => setFase(2), 900);
    return () => clearTimeout(t);
  }, [fase]);

  useEffect(() => {
    setLoading(cargandoNegocios || cargandoCodigo);
  }, [cargandoNegocios, cargandoCodigo]);

  // Web: en cuanto el QR está completo se prepara la foto, para que el toque
  // en "Enviar" abra el menú de compartir sin esperar la captura.
  useEffect(() => {
    if (Platform.OS !== 'web' || fase < 2 || !codigo) return;
    fotoWeb.current = null;
    let vivo = true;
    // Un momento para que la tarjeta oculta termine de pintarse.
    const t = setTimeout(async () => {
      const foto = await fotoDeTarjeta(cardRef, `hazlo-cash-${codigo.codigo}.png`);
      if (vivo) fotoWeb.current = foto;
    }, 200);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [fase, codigo]);

  const seleccionar = async (negocio: Business) => {
    if (generando) return;
    setError(null);
    setSel(negocio.id);
    setCodigo(null);
    setGenerandoPara(negocio.nombre);
    setFase(0);
    setGenKey((k) => k + 1);
    setGenerando(true);
    const r = await crearCodigoReferido(negocio.id);
    setGenerando(false);
    if (r.ok && r.codigo) {
      // Al llegar, las letras que giran se fijan en el código real y sigue el QR.
      setCodigo(r.codigo);
      // El código nuevo pasa a ser el de la caché: sin esto, volver a esta
      // pantalla mostraría el anterior hasta que expirara.
      escribir(K.miCodigo, r.codigo);
      // Un negocio nuevo recomendado aparece en "Tus recomendaciones" del Inicio.
      invalidar(K.misRecomendaciones);
    } else {
      setCodigo(null);
      setGenerandoPara(null);
      setFase(2);
      setError(r.error ?? 'No se pudo generar tu código.');
    }
  };

  const copiar = async () => {
    if (!codigo) return;
    await Clipboard.setStringAsync(codigo.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // Exporta la tarjeta oculta (QR + negocio + código) como PNG temporal.
  const capturarTarjeta = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      return await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
    } catch {
      return null;
    }
  };

  // Comparte la FOTO del QR. Ni wa.me ni el intent de WhatsApp aceptan imagen y
  // texto a la vez, así que la tarjeta se basta sola y el mensaje se deja en el
  // portapapeles para pegarlo como descripción. Si la captura falla, cae al
  // enlace wa.me de siempre (solo texto) para no dejar al usuario sin salida.
  const enviarWhatsApp = async () => {
    if (!codigo || enviando) return;
    const mensaje = mensajeReferido(codigo);
    if (Platform.OS === 'web') return enviarDesdeWeb(mensaje);
    setEnviando(true);
    try {
      const uri = await capturarTarjeta();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Clipboard.setStringAsync(mensaje);
        setPegarHint(true);
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
          dialogTitle: 'Enviar mi recomendación',
        });
      } else {
        await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(mensaje)}`);
      }
    } catch {
      setError('No pudimos preparar tu QR. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  // Web: foto + mensaje juntos con el menú de compartir del teléfono (en
  // Android WhatsApp toma el texto como descripción de la foto). Sin compartir
  // archivos —una compu, o si la foto no se pudo preparar— abre WhatsApp con el
  // texto, que trae el link a la página del QR.
  const enviarDesdeWeb = async (mensaje: string) => {
    const foto = fotoWeb.current;
    if (!puedeCompartirFoto(foto)) {
      window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
      return;
    }
    // Respaldo por si la app elegida se queda solo con la foto. Sin await: el
    // menú tiene que abrirse dentro del toque.
    Clipboard.setStringAsync(mensaje).catch(() => {});
    setPegarHint(true);
    try {
      await navigator.share({ files: [foto], text: mensaje });
    } catch (e) {
      if (!esCancelacion(e)) setError('No pudimos abrir el menú para compartir. Intenta de nuevo.');
    }
  };

  // Solo texto: útil para pegar el código en un chat o correo.
  const compartir = async () => {
    if (!codigo) return;
    const mensaje = mensajeReferido(codigo);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
      return;
    }
    try {
      await Share.share({ message: mensaje });
    } catch (e) {
      if (!esCancelacion(e)) setError('No pudimos abrir el menú para compartir. Intenta de nuevo.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Tarjeta que se exporta como foto. Vive fuera del viewport (no oculta
          con opacity: Android no captura vistas invisibles). */}
      {codigo && (
        <View style={{ position: 'absolute', left: -SHARE_CARD_WIDTH - 40, top: 0 }} pointerEvents="none">
          <QrShareCard ref={cardRef} codigo={codigo} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
        <Fade desde={8} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>Recomienda</Text>
          <Glass style={{ width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="qr" size={18} color={FG} />
          </Glass>
        </Fade>

        {loading && (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator color={C.primary} />
          </View>
        )}

        {!loading && (
          <>
            {/* Selector de negocio a recomendar */}
            <Text style={{ fontFamily: F.semi, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>¿Qué negocio recomiendas?</Text>
            {negocios.length === 0 ? (
              <View style={{ borderRadius: R.md, padding: 18, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 20 }}>
                <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, lineHeight: 19 }}>Aún no hay negocios disponibles para recomendar.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 18, paddingRight: 4 }}>
                {negocios.map((n) => {
                  const on = sel === n.id;
                  return (
                    <PressableScale
                      key={n.id}
                      onPress={() => seleccionar(n)}
                      style={{ paddingHorizontal: 16, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: on ? C.primary : '#fff' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 13, color: on ? '#fff' : FG }}>{n.nombre}</Text>
                    </PressableScale>
                  );
                })}
              </ScrollView>
            )}

            {error && (
              <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 }}>
                <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
              </View>
            )}

            {!generando && !codigo && negocios.length > 0 && (
              <View style={{ borderRadius: R.lg, padding: 22, marginBottom: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Elige un negocio</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
                  Toca un negocio de arriba y generaremos tu QR para recomendarlo. Cada QR sirve para una compra.
                </Text>
              </View>
            )}

            {(generando || codigo) && (
              <>
                {/* Hero: QR real + código. Al generar, se arma como el código de
                    invitación: las letras giran, se fijan, entra el QR y al final
                    la marca al centro. El alto del QR se reserva desde el inicio. */}
                <Fade key={`hero-${genKey}`} desde={14} style={{ borderRadius: R.lg, padding: 22, marginBottom: 16, backgroundColor: '#0D0D0D', overflow: 'hidden', alignItems: 'center' }}>
                  <View style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.45 }}>
                    <HazloMark size={200} />
                  </View>

                  <Text style={{ fontFamily: F.semi, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.88, textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                    {fase === 0 ? 'Generando tu QR…' : usado ? 'Este QR ya se usó' : 'Tu QR de recomendación'}
                  </Text>

                  <View style={{ marginTop: 16, padding: 16, borderRadius: R.lg, backgroundColor: '#fff' }}>
                    <View style={{ width: 188, height: 188 }}>
                      {codigo && fase >= 1 && (
                        <Fade key={`qr-${genKey}`}>
                          <QRCode value={codigo.shareUrl} size={188} color="#0D0D0D" backgroundColor="#fff" ecl="H" />
                        </Fade>
                      )}
                      {usado && (
                        <Fade
                          key={`usado-${codigo?.codigo}`}
                          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 2, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="check" size={24} color="#fff" sw={2.6} />
                          </View>
                          <Text style={{ fontFamily: F.bold, fontSize: 15, color: FG }}>Ya se usó</Text>
                          <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, textAlign: 'center', paddingHorizontal: 16 }}>Tu comisión ya está en tu saldo.</Text>
                        </Fade>
                      )}
                      {codigo && fase >= 2 && (
                        <Fade
                          key={`marca-${genKey}`}
                          style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -21, marginTop: -21, width: 42, height: 42, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
                          <HazloMark size={21} />
                        </Fade>
                      )}
                    </View>
                  </View>

                  <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {genKey === 0 && codigo ? (
                      <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff', letterSpacing: 1.2 }}>{codigo.codigo}</Text>
                    ) : (
                      <CodigoScramble molde="HAZLO-0000" final={codigo?.codigo ?? null} genKey={genKey} listo={fase >= 1} onListo={alTerminarCodigo} oscuro tamano={20} />
                    )}
                    {/* El botón de copiar ocupa su lugar desde el inicio: si apareciera
                        de golpe, el código brincaría a la izquierda. */}
                    {fase >= 2 && codigo ? (
                      <Fade key={`copiar-${genKey}`}>
                        <PressableScale onPress={copiar} hitSlop={8} style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={copied ? 'check' : 'copy'} size={16} color={copied ? C.primary : '#fff'} sw={copied ? 2.4 : 1.8} />
                        </PressableScale>
                      </Fade>
                    ) : (
                      <View style={{ width: 34, height: 34 }} />
                    )}
                  </View>
                  <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{codigo?.negocio ?? generandoPara}</Text>
                </Fade>

                {usado ? (
                  <Fade key={`nuevo-${codigo?.codigo}`} desde={8} style={{ marginBottom: 22 }}>
                    <PressableScale
                      onPress={() => {
                        const negocio = negocios.find((n) => n.id === sel);
                        if (negocio) seleccionar(negocio);
                      }}
                      style={{ height: 52, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <Icon name="refresh" size={18} color="#fff" />
                      <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Generar QR nuevo</Text>
                    </PressableScale>
                    <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 16 }}>
                      Cada QR sirve para una compra. Genera otro para tu siguiente amigo.
                    </Text>
                  </Fade>
                ) : (
                /* Los botones se activan cuando el QR ya está completo. */
                <View style={{ opacity: fase >= 2 && codigo ? 1 : 0.4 }} pointerEvents={fase >= 2 && codigo ? 'auto' : 'none'}>
                  <PressableScale
                    onPress={enviarWhatsApp}
                    disabled={enviando}
                    style={{ height: 52, borderRadius: R.md, backgroundColor: '#25D366', opacity: enviando ? 0.7 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {enviando ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Icon name="send" size={18} color="#fff" />
                        <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Enviar mi QR por WhatsApp</Text>
                      </>
                    )}
                  </PressableScale>

                  {pegarHint && (
                    <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 16 }}>
                      {Platform.OS === 'web'
                        ? 'Tu mensaje también quedó copiado, por si no llegó con la foto.'
                        : 'Copiamos tu mensaje: pégalo como descripción de la foto.'}
                    </Text>
                  )}

                  <PressableScale
                    onPress={compartir}
                    style={{ height: 48, borderRadius: R.md, marginTop: 10, marginBottom: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Icon name="share" size={16} color={FG} />
                    <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Compartir solo el texto</Text>
                  </PressableScale>
                </View>
                )}
              </>
            )}
          </>
        )}

        {/* How it works */}
        <SectionHeader title="Cómo funciona" />
        <View style={{ gap: 10 }}>
          {steps.map((s, i) => (
            <Fade key={s.t} delay={i * STAGGER} desde={12} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <View style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={18} color={C.primary} />
                <View style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 999, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 10 }}>{i + 1}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{s.t}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 17 }}>{s.d}</Text>
              </View>
            </Fade>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
