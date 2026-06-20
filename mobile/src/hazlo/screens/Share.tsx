import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

import { getNegociosActivos } from '@/lib/services/businesses';
import { crearCodigoReferido, getMiCodigo, mensajeReferido, type MiCodigo } from '@/lib/services/referrals';
import type { Business } from '@/lib/types';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
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

  useEffect(() => {
    let activo = true;
    (async () => {
      const [negs, mio] = await Promise.all([getNegociosActivos().catch(() => []), getMiCodigo()]);
      if (!activo) return;
      setNegocios(negs);
      if (mio) {
        setCodigo(mio);
        setSel(negs.find((n) => n.nombre === mio.negocio)?.id ?? null);
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  const seleccionar = async (negocio: Business) => {
    if (generando) return;
    setError(null);
    setSel(negocio.id);
    setGenerando(true);
    const r = await crearCodigoReferido(negocio.id);
    setGenerando(false);
    if (r.ok && r.codigo) {
      setCodigo(r.codigo);
    } else {
      setCodigo(null);
      setError(r.error ?? 'No se pudo generar tu código.');
    }
  };

  const copiar = async () => {
    if (!codigo) return;
    await Clipboard.setStringAsync(codigo.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // Abre WhatsApp con el mensaje prellenado. wa.me funciona sin whitelisting de
  // esquemas (Expo Go) y cae al navegador si WhatsApp no está instalado.
  const enviarWhatsApp = async () => {
    if (!codigo) return;
    await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(mensajeReferido(codigo))}`);
  };

  const compartir = async () => {
    if (!codigo) return;
    await Share.share({ message: mensajeReferido(codigo) });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>Recomienda</Text>
        <Glass style={{ width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="qr" size={18} color={FG} />
        </Glass>
      </View>

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
                  <Pressable
                    key={n.id}
                    onPress={() => seleccionar(n)}
                    style={{ paddingHorizontal: 16, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: on ? 0 : 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: on ? C.primary : '#fff' }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 13, color: on ? '#fff' : FG }}>{n.nombre}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {error && (
            <View style={{ backgroundColor: 'rgba(235,78,0,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 }}>
              <Text style={{ fontFamily: F.base, fontSize: 12.5, color: C.accent }}>{error}</Text>
            </View>
          )}

          {generando && (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color={C.primary} />
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 10 }}>Generando tu código…</Text>
            </View>
          )}

          {!generando && !codigo && negocios.length > 0 && (
            <View style={{ borderRadius: R.lg, padding: 22, marginBottom: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Elige un negocio</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
                Toca un negocio de arriba y generaremos tu código y tu QR personal para recomendarlo.
              </Text>
            </View>
          )}

          {!generando && codigo && (
            <>
              {/* Hero: QR real + código */}
              <View style={{ borderRadius: R.lg, padding: 22, marginBottom: 16, backgroundColor: '#0D0D0D', overflow: 'hidden', alignItems: 'center' }}>
                <View style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.45 }}>
                  <HazloMark size={200} />
                </View>

                <Text style={{ fontFamily: F.semi, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.88, textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                  Tu QR de recomendación
                </Text>

                <View style={{ marginTop: 16, padding: 16, borderRadius: R.lg, backgroundColor: '#fff' }}>
                  <QRCode value={codigo.shareUrl} size={188} color="#0D0D0D" backgroundColor="#fff" ecl="M" />
                </View>

                <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff', letterSpacing: 1.2 }}>{codigo.codigo}</Text>
                  <Pressable onPress={copiar} hitSlop={8} style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={copied ? 'check' : 'copy'} size={16} color={copied ? C.primary : '#fff'} sw={copied ? 2.4 : 1.8} />
                  </Pressable>
                </View>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{codigo.negocio}</Text>
              </View>

              <Pressable
                onPress={enviarWhatsApp}
                style={{ height: 52, borderRadius: R.md, backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Icon name="send" size={18} color="#fff" />
                <Text style={{ fontFamily: F.semi, fontSize: 15, color: '#fff' }}>Enviar por WhatsApp</Text>
              </Pressable>
              <Pressable
                onPress={compartir}
                style={{ height: 48, borderRadius: R.md, marginTop: 10, marginBottom: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="share" size={16} color={FG} />
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Compartir por otra app</Text>
              </Pressable>
            </>
          )}
        </>
      )}

      {/* How it works */}
      <SectionHeader title="Cómo funciona" />
      <View style={{ gap: 10 }}>
        {steps.map((s, i) => (
          <View key={s.t} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
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
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
