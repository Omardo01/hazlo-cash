import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { BG, C, F, FG, MUTED, R } from '../theme';
import { DOCUMENTOS_LEGALES, documentoLegal, type BloqueLegal, type DocumentoLegal } from './textos';

/**
 * /legal y /legal/[doc] — aviso de privacidad y contratos. Son públicas (sin
 * sesión): se abren desde el registro, desde el perfil o por link directo.
 */

function volver() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function BotonVolver({ texto }: { texto: string }) {
  return (
    <PressableScale
      onPress={volver}
      accessibilityRole="button"
      accessibilityLabel={texto}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 10 }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={18} color={FG} />
      </View>
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{texto}</Text>
    </PressableScale>
  );
}

export function irADocumentoLegal(slug: DocumentoLegal['slug']) {
  router.push({ pathname: '/legal/[doc]', params: { doc: slug } });
}

function Bloque({ bloque }: { bloque: BloqueLegal }) {
  if (bloque.tipo === 'lista') {
    return (
      <View style={{ marginBottom: 10, gap: 5 }}>
        {bloque.items.map((item) => (
          <View key={item} style={{ flexDirection: 'row', gap: 9, paddingLeft: 4 }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.primary, marginTop: 8 }} />
            <Text style={{ flex: 1, fontFamily: F.reg, fontSize: 13, lineHeight: 20, color: FG }}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  return <Text style={{ fontFamily: F.reg, fontSize: 13, lineHeight: 20, color: FG, marginBottom: 10 }}>{bloque.texto}</Text>;
}

export function DocumentoLegalScreen({ slug }: { slug: string }) {
  const doc = documentoLegal(slug);

  if (!doc) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
        <View style={{ padding: 20 }}>
          <BotonVolver texto="Volver" />
          <Fade desde={8} style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 16, color: FG }}>Ese documento no existe</Text>
            <PressableScale onPress={() => router.replace('/legal')} hitSlop={8} style={{ marginTop: 10 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary }}>Ver documentos legales</Text>
            </PressableScale>
          </Fade>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <BotonVolver texto="Volver" />

        <Fade desde={10} style={{ marginTop: 18, marginBottom: 18 }}>
          <Text style={{ fontFamily: F.semi, fontSize: 10.5, letterSpacing: 1.4, color: C.primary, textTransform: 'uppercase' }}>
            Hazlo Cash · Legal
          </Text>
          <Text style={{ fontFamily: F.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, color: FG, marginTop: 6 }}>{doc.titulo}</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 6 }}>Versión vigente desde el {doc.actualizado}</Text>
        </Fade>

        {doc.secciones.map((s, i) => (
          // Escalonado solo en las primeras: el resto ya está fuera de pantalla.
          <Fade key={`${s.titulo ?? 'intro'}-${i}`} delay={STAGGER * Math.min(i + 1, 6)} desde={10}>
            <View style={{ marginBottom: 8 }}>
              {s.titulo && (
                <Text style={{ fontFamily: F.semi, fontSize: 13.5, lineHeight: 19, color: FG, marginBottom: 8, marginTop: 6 }}>{s.titulo}</Text>
              )}
              {s.bloques.map((b, j) => (
                <Bloque key={j} bloque={b} />
              ))}
            </View>
          </Fade>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function IndiceLegalScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <BotonVolver texto="Volver" />
        <Fade desde={10} style={{ marginTop: 18, marginBottom: 18 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 24, letterSpacing: -0.5, color: FG }}>Legal</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 19 }}>
            Cómo cuidamos tus datos y las reglas para recomendadores y negocios.
          </Text>
        </Fade>
        {DOCUMENTOS_LEGALES.map((d, i) => (
          <Fade key={d.slug} delay={STAGGER * (i + 1)} desde={12}>
            <PressableScale
              onPress={() => irADocumentoLegal(d.slug)}
              accessibilityRole="link"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={d.slug === 'privacidad' ? 'shield-checkmark-outline' : 'document-text-outline'} size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{d.corto}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11.5, lineHeight: 16, color: MUTED, marginTop: 2 }}>{d.resumen}</Text>
              </View>
              <Icon name="chevR" size={16} color={MUTED} />
            </PressableScale>
          </Fade>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
