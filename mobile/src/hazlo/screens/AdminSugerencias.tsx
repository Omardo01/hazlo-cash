import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ActivityIndicator, Animated, Linking, Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mutar } from '@/lib/datos/cache';
import { K, useAdminSugerencias } from '@/lib/datos/consultas';
import { linkRegistroNegocio, resolverSugerencia } from '@/lib/services/sugerencias';
import type { EstadoSugerencia, NegocioSugerido } from '@/lib/types';
import { grupoPorSlug } from '../categorias/catalogo';
import { IconoGrupo } from '../categorias/piezas';
import { HazloMark } from '../HazloMark';
import { Icon } from '../icons';
import { DUR, EASE, Fade, PressableScale, STAGGER, useReduceMotion } from '../motion';
import { ListaSkeleton } from '../Skeleton';
import { C, F, FG, MUTED, R } from '../theme';
import { hace } from './AdminNegocios';

const TEAL = '#00A896';

const FILTROS: { k: EstadoSugerencia; label: string; vacio: string }[] = [
  { k: 'nueva', label: 'Nuevas', vacio: 'Cuando alguien recomiende un negocio desde Descubre, aparecerá aquí.' },
  { k: 'contactada', label: 'Contactadas', vacio: 'Los negocios que ya contactaste esperan aquí a que se sumen.' },
  { k: 'sumada', label: 'Sumadas', vacio: 'Aquí quedan los negocios recomendados que ya están en Hazlo Cash.' },
  { k: 'descartada', label: 'Descartadas', vacio: 'Nada descartado por ahora.' },
];

// El paso que sigue en el embudo: nueva → contactada → sumada.
const SIGUIENTE: Partial<Record<EstadoSugerencia, { estado: EstadoSugerencia; label: string }>> = {
  nueva: { estado: 'contactada', label: 'Ya lo contacté' },
  contactada: { estado: 'sumada', label: 'Ya se sumó' },
};

const telefono = (t: string) => `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}`;

// "Ana", "Ana y Luis", "Ana, Luis y 3 más".
function quienes(nombres: string[]): string {
  if (nombres.length <= 2) return nombres.join(' y ');
  return `${nombres.slice(0, 2).join(', ')} y ${nombres.length - 2} más`;
}

// Abre WhatsApp con el negocio: la invitación y el link al registro ya
// lleno con lo que contaron quienes lo recomendaron.
function invitarPorWhatsApp(s: NegocioSugerido) {
  const texto = [
    'En Hazlo Cash apostamos por ti y por tu negocio.',
    'Te regalamos $100 de saldo inicial para que pruebes nuestra plataforma.',
    'Aquí no pagas publicidad ni cuotas por adelantado.',
    'Solo pagas cuando vendes.',
    '«Porque Hazlo Cash, primero vendes y luego pagas».',
    '',
    `Registra ${s.nombre} aquí, ya con los datos que nos compartieron:`,
    linkRegistroNegocio(s.id),
  ].join('\n');
  const url = `https://wa.me/52${s.contacto}?text=${encodeURIComponent(texto)}`;
  if (Platform.OS === 'web') window.open(url, '_blank');
  else Linking.openURL(url);
}

function Avatar({ slug }: { slug: string }) {
  const grupo = grupoPorSlug(slug);
  if (grupo) return <IconoGrupo grupo={grupo} size={42} />;
  return (
    <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: `${C.primary}14`, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="home" size={18} color={C.primary} />
    </View>
  );
}

// Un negocio sugerido. Al moverlo de estado sale de la lista con un fade
// corto antes de desmontarse (sale más rápido de lo que entró).
function TarjetaSugerencia({ s, onMovida }: { s: NegocioSugerido; onMovida: (estado: EstadoSugerencia) => void }) {
  const [enviando, setEnviando] = useState<EstadoSugerencia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const salida = useState(() => new Animated.Value(0))[0];
  const reduce = useReduceMotion();
  const grupo = grupoPorSlug(s.grupo);
  const siguiente = SIGUIENTE[s.estado];
  const abierta = s.estado === 'nueva' || s.estado === 'contactada';
  const veces = s.recomendadores.length;
  const [copiado, setCopiado] = useState(false);

  // Para mandarlo por otro lado (o cuando nadie dio teléfono).
  const copiarLink = async () => {
    await Clipboard.setStringAsync(linkRegistroNegocio(s.id));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const mover = async (estado: EstadoSugerencia) => {
    setEnviando(estado);
    setError(null);
    const res = await resolverSugerencia(s.id, estado);
    if (!res.ok) {
      setEnviando(null);
      return setError(res.error ?? 'No se pudo actualizar.');
    }
    if (reduce) return onMovida(estado);
    Animated.timing(salida, { toValue: 1, duration: DUR.fast, easing: EASE.in, useNativeDriver: true }).start(() => onMovida(estado));
  };

  return (
    <Animated.View
      style={{
        opacity: salida.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ translateX: salida.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }) }],
      }}>
      <View style={{ padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar slug={s.grupo} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>{s.nombre}</Text>
            <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 1 }}>
              {s.giro}
              {grupo ? ` · ${grupo.nombre}` : ''}
            </Text>
          </View>
          {/* Cuántas personas lo recomendaron: lo primero que decide a quién contactar. */}
          <View
            accessibilityLabel={`${veces} ${veces === 1 ? 'recomendación' : 'recomendaciones'}`}
            style={{ alignSelf: 'flex-start', alignItems: 'center', minWidth: 46, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 12, backgroundColor: veces > 1 ? `${C.primary}18` : 'rgba(13,13,13,0.05)' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 17, color: veces > 1 ? C.primary : FG, letterSpacing: -0.3 }}>{veces}</Text>
            <Text style={{ fontFamily: F.semi, fontSize: 8.5, color: veces > 1 ? C.primary : MUTED, marginTop: -2 }}>{veces === 1 ? 'vez' : 'veces'}</Text>
          </View>
        </View>

        <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: FG, marginTop: 12, lineHeight: 18 }}>{s.direccion}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {s.contacto ? (
            <PressableScale
              onPress={() => invitarPorWhatsApp(s)}
              accessibilityRole="link"
              accessibilityLabel={`Escribir por WhatsApp a ${s.nombre}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(0,168,150,0.12)' }}>
              <Ionicons name="logo-whatsapp" size={14} color={TEAL} />
              <Text style={{ fontFamily: F.semi, fontSize: 12, color: TEAL }}>{telefono(s.contacto)}</Text>
            </PressableScale>
          ) : (
            <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(13,13,13,0.05)' }}>
              <Text style={{ fontFamily: F.base, fontSize: 11.5, color: MUTED }}>Sin teléfono</Text>
            </View>
          )}
          {abierta && (
            <PressableScale
              onPress={copiarLink}
              accessibilityRole="button"
              accessibilityLabel={`Copiar link de registro para ${s.nombre}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: `${C.primary}12` }}>
              <Fade key={copiado ? 'si' : 'no'} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name={copiado ? 'check' : 'copy'} size={13} color={C.primary} sw={2.2} />
                <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>{copiado ? '¡Copiado!' : 'Copiar link'}</Text>
              </Fade>
            </PressableScale>
          )}
        </View>

        <Text numberOfLines={2} style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED, marginTop: 10, lineHeight: 16 }}>
          {veces === 1 ? 'Lo recomendó ' : 'Lo recomendaron '}
          <Text style={{ fontFamily: F.semi, color: FG }}>{quienes(s.recomendadores)}</Text>
          {veces > 1 ? ` · la última ${hace(s.ultima)}` : ` · ${hace(s.primera)}`}
        </Text>

        {error && (
          <Fade key={error} desde={4}>
            <Text style={{ fontFamily: F.base, fontSize: 11.5, color: C.accent, marginTop: 10 }}>{error}</Text>
          </Fade>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {abierta ? (
            <>
              <PressableScale
                onPress={() => mover('descartada')}
                disabled={enviando !== null}
                style={{ flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,13,13,0.05)' }}>
                {enviando === 'descartada' ? <ActivityIndicator size="small" color={MUTED} /> : <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: C.accent }}>Descartar</Text>}
              </PressableScale>
              {siguiente && (
                <PressableScale
                  onPress={() => mover(siguiente.estado)}
                  disabled={enviando !== null}
                  style={{ flex: 1.6, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: siguiente.estado === 'sumada' ? TEAL : FG }}>
                  {enviando === siguiente.estado ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: '#fff' }}>{siguiente.label}</Text>
                  )}
                </PressableScale>
              )}
            </>
          ) : (
            <>
              <View style={{ flex: 1, height: 40, justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: MUTED }}>
                  {s.estado === 'sumada' ? 'Se sumó' : 'Descartada'} {s.resuelta_en ? hace(s.resuelta_en) : ''}
                </Text>
              </View>
              <PressableScale
                onPress={() => mover('nueva')}
                disabled={enviando !== null}
                style={{ height: 40, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,13,13,0.05)' }}>
                {enviando === 'nueva' ? <ActivityIndicator size="small" color={MUTED} /> : <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: FG }}>Reabrir</Text>}
              </PressableScale>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Admin → Sugerencias: los negocios que los usuarios recomendaron sumar desde
 * Descubre. El admin los lleva de nueva → contactada → sumada, o los descarta.
 */
export function AdminSugerenciasScreen() {
  const { datos: sugerencias = [], cargando, error, refrescar } = useAdminSugerencias();
  const [filtro, setFiltro] = useState<EstadoSugerencia>('nueva');

  const cuenta = (e: EstadoSugerencia) => sugerencias.filter((s) => s.estado === e).length;
  const totalRecomendaciones = sugerencias.reduce((n, s) => n + s.recomendadores.length, 0);
  const lista = sugerencias.filter((s) => s.estado === filtro);
  const vacio = FILTROS.find((f) => f.k === filtro)?.vacio ?? '';

  // La respuesta del servidor fue ok: se parcha la caché sin volver a consultar.
  const alMover = (s: NegocioSugerido, estado: EstadoSugerencia) =>
    mutar<NegocioSugerido[]>(K.adminSugerencias, (prev) =>
      prev.map((x) => (x.clave === s.clave ? { ...x, estado, resuelta_en: estado === 'nueva' ? null : new Date().toISOString() } : x)),
    );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
      <Fade desde={8}>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Panel admin</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginTop: 2 }}>Sugerencias</Text>
        </View>
      </Fade>

      <Fade delay={STAGGER} desde={12}>
        <View style={{ position: 'relative', overflow: 'hidden', borderRadius: R.lg, padding: 20, marginBottom: 20, shadowColor: '#1A1840', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 8 }}>
          <LinearGradient colors={['#1A1840', '#2D2B8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ position: 'absolute', right: -30, top: -30, opacity: 0.16 }}>
            <HazloMark size={180} mono="#fff" />
          </View>
          <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.24, textTransform: 'uppercase' }}>Por revisar</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 44, color: '#fff', letterSpacing: -1.5, marginTop: 2 }}>{cuenta('nueva')}</Text>
          <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2, lineHeight: 17 }}>
            Negocios que los usuarios quieren ver en Hazlo Cash · {totalRecomendaciones}{' '}
            {totalRecomendaciones === 1 ? 'recomendación' : 'recomendaciones'} · {cuenta('sumada')} ya se sumaron
          </Text>
        </View>
      </Fade>

      {/* Los chips llegan al borde de la pantalla para que se note que hay más. */}
      <Fade delay={STAGGER * 2} desde={10} style={{ marginHorizontal: -20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 16 }}>
          {FILTROS.map((f) => {
            const sel = f.k === filtro;
            const n = cuenta(f.k);
            return (
              <PressableScale
                key={f.k}
                onPress={() => setFiltro(f.k)}
                accessibilityRole="tab"
                accessibilityState={{ selected: sel }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 14, borderRadius: 999, backgroundColor: sel ? FG : '#fff', borderWidth: 0.5, borderColor: sel ? FG : 'rgba(0,0,0,0.08)' }}>
                <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: sel ? '#fff' : FG }}>{f.label}</Text>
                {n > 0 && <Text style={{ fontFamily: F.semi, fontSize: 11.5, color: sel ? 'rgba(255,255,255,0.7)' : MUTED }}>{n}</Text>}
              </PressableScale>
            );
          })}
        </ScrollView>
      </Fade>

      {cargando && (
        <View style={{ borderRadius: R.md, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <ListaSkeleton filas={3} />
        </View>
      )}

      {!cargando && error && sugerencias.length === 0 && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>No se pudieron cargar. Desliza para reintentar.</Text>
      )}

      {!cargando && !(error && sugerencias.length === 0) && lista.length === 0 && (
        <Fade key={`vacio-${filtro}`} desde={8}>
          <View style={{ alignItems: 'center', paddingVertical: 30, paddingHorizontal: 24, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${C.primary}14`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="send" size={20} color={C.primary} />
            </View>
            <Text style={{ fontFamily: F.semi, fontSize: 14.5, color: FG, marginTop: 12 }}>Nada por aquí</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 4, textAlign: 'center', lineHeight: 18 }}>{vacio}</Text>
          </View>
        </Fade>
      )}

      {!cargando && lista.length > 0 && (
        <View style={{ gap: 10 }}>
          {lista.map((s, i) => (
            <Fade key={s.clave} delay={STAGGER * Math.min(i, 6)} desde={10}>
              <TarjetaSugerencia s={s} onMovida={(estado) => alMover(s, estado)} />
            </Fade>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
