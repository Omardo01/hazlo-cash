import { useEffect, useState } from 'react';
import { Animated, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

import { usePerfil, useVisitasCliente } from '@/lib/datos/consultas';
import { useLive } from '@/lib/datos/realtime';
import { linkVisita } from '@/lib/services/referrals';
import type { EstadoReferral } from '@/lib/types';
import { ListaSkeleton, TarjetaSkeleton } from '../Skeleton';
import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import { Glass, SectionHeader } from '../ui';
import type { ScreenProps } from './types';

const ESTADO: Record<EstadoReferral, { label: string; color: string; bg: string; icon: IconName }> = {
  pendiente: { label: 'En proceso', color: '#B7791F', bg: 'rgba(245,166,35,0.15)', icon: 'send' },
  confirmado: { label: 'Compra confirmada', color: '#00A896', bg: 'rgba(0,168,150,0.15)', icon: 'check' },
  rechazado: { label: 'No procedió', color: MUTED, bg: 'rgba(13,13,13,0.06)', icon: 'arrowDown' },
};

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  const hoy = d.toDateString() === new Date().toDateString();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return hoy ? `Hoy · ${hora}` : `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${hora}`;
}

// Punto que late: refuerza la sensación de "en vivo".
function LiveDot() {
  const [a] = useState(() => new Animated.Value(0.35));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  return <Animated.View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#F5A623', opacity: a }} />;
}

type EstadoPaso = 'done' | 'activo' | 'pendiente';

// Un paso del timeline de la orden.
function Paso({ n, titulo, desc, estado, ultimo, dark }: { n: number; titulo: string; desc: string; estado: EstadoPaso; ultimo?: boolean; dark?: boolean }) {
  const fgTitle = dark ? '#fff' : FG;
  const fgDesc = dark ? 'rgba(255,255,255,0.6)' : MUTED;
  const lineCol = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)';
  const circle =
    estado === 'done'
      ? { bg: '#00A896', border: '#00A896' }
      : estado === 'activo'
        ? { bg: C.primary, border: C.primary }
        : { bg: 'transparent', border: lineCol };
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 26, height: 26, borderRadius: 999, backgroundColor: circle.bg, borderWidth: 1.5, borderColor: circle.border, alignItems: 'center', justifyContent: 'center' }}>
          {estado === 'done' ? (
            <Icon name="check" size={14} color="#fff" sw={2.6} />
          ) : (
            <Text style={{ fontFamily: F.bold, fontSize: 12, color: estado === 'activo' ? '#fff' : fgDesc }}>{n}</Text>
          )}
        </View>
        {!ultimo && <View style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: lineCol, marginVertical: 2 }} />}
      </View>
      <View style={{ flex: 1, paddingBottom: ultimo ? 0 : 14 }}>
        <Text style={{ fontFamily: F.semi, fontSize: 13.5, color: estado === 'pendiente' ? fgDesc : fgTitle }}>{titulo}</Text>
        <Text style={{ fontFamily: F.reg, fontSize: 11.5, color: fgDesc, marginTop: 1, lineHeight: 16 }}>{desc}</Text>
      </View>
    </View>
  );
}

export function HomeScreen({ go, openSheet, reloadKey }: ScreenProps) {
  // Ambas salen de la caché: al volver a esta pestaña se pintan al instante y
  // se revalidan calladas si ya están viejas.
  const { datos: visitas = [], cargando, refrescar } = useVisitasCliente();
  const { datos: perfil } = usePerfil();
  const nombre = perfil?.nombre?.split(' ')[0] ?? '';

  const [celebrarId, setCelebrarId] = useState<string | null>(null);

  // Reclamar un código crea una orden nueva que el canal no ve (la insertó
  // este mismo usuario), así que ahí sí se pide de nuevo.
  useEffect(() => {
    if (reloadKey) refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // El negocio confirmó: el canal global ya parchó el estado en la caché y
  // aquí solo se decide a quién se le celebra.
  const { aviso } = useLive();
  useEffect(() => {
    if (aviso?.tipo === 'confirmada') setCelebrarId(aviso.referralId);
  }, [aviso]);

  const pendiente = visitas.find((v) => v.estado === 'pendiente') ?? null;
  const celebrada = celebrarId ? visitas.find((v) => v.id === celebrarId && v.estado === 'confirmado') ?? null : null;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
      {/* Saludo */}
      <Fade desde={8}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Hola{nombre ? `, ${nombre}` : ''}</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginTop: 2 }}>
            {celebrada ? '¡Compra confirmada!' : pendiente ? 'Tu orden en curso' : '¿Listo para ahorrar?'}
          </Text>
        </View>
          <Glass style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bell" size={19} color={FG} />
          </Glass>
        </View>
      </Fade>

      {cargando ? (
        // Solo la primerísima vez: después siempre hay algo en caché que pintar.
        <TarjetaSkeleton h={210} style={{ marginBottom: 18 }} />
      ) : celebrada ? (
        // Confirmación en vivo: el negocio escaneó y la venta se completó.
        <Fade key="celebrada" desde={16} style={{ borderRadius: R.lg, padding: 24, marginBottom: 18, overflow: 'hidden', position: 'relative' }}>
          <LinearGradient colors={['#00A896', '#007F71']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ position: 'absolute', right: -34, bottom: -34, opacity: 0.18 }}>
            <HazloMark size={180} primary="#fff" secondary="#fff" />
          </View>
          <View style={{ width: 64, height: 64, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon name="check" size={34} color="#fff" sw={2.6} />
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: '#fff', letterSpacing: -0.44 }}>¡Venta confirmada!</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13.5, color: 'rgba(255,255,255,0.92)', marginTop: 6, lineHeight: 20 }}>
            <Text style={{ fontFamily: F.semi }}>{celebrada.negocio}</Text> confirmó tu compra. Tu recomendador acaba de recibir su comisión. 🎉
          </Text>
          <PressableScale
            onPress={() => setCelebrarId(null)}
            style={{ marginTop: 18, alignSelf: 'flex-start', height: 44, paddingHorizontal: 22, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#007F71' }}>Listo</Text>
          </PressableScale>
        </Fade>
      ) : pendiente ? (
        // Orden en curso: QR en vivo + timeline de estatus.
        <Fade key="pendiente" desde={14}>
          <View style={{ borderRadius: R.lg, padding: 22, marginBottom: 12, backgroundColor: '#0D0D0D', overflow: 'hidden', alignItems: 'center' }}>
            <View style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.4 }}>
              <HazloMark size={200} />
            </View>
            <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6 }}>ORDEN #{pendiente.folio}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(245,166,35,0.16)' }}>
                <LiveDot />
                <Text style={{ fontFamily: F.semi, fontSize: 10.5, color: '#F5A623', letterSpacing: 0.5 }}>EN VIVO</Text>
              </View>
            </View>

            <Text style={{ fontFamily: F.reg, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 16, textAlign: 'center' }}>Muestra este QR en</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 19, color: '#fff', marginTop: 2, textAlign: 'center' }}>{pendiente.negocio}</Text>

            <View style={{ marginTop: 16, padding: 16, borderRadius: R.lg, backgroundColor: '#fff' }}>
              <QRCode value={linkVisita(pendiente.id)} size={168} color="#0D0D0D" backgroundColor="#fff" ecl="M" />
            </View>

            {pendiente.oferta && (
              <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: `${C.primary}22` }}>
                <Icon name="gift" size={14} color={C.primary} />
                <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>{pendiente.oferta}</Text>
              </View>
            )}
          </View>

          {/* Timeline de estatus */}
          <View style={{ borderRadius: R.md, padding: 18, marginBottom: 18, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
            <Paso n={1} estado="done" titulo="Orden creada" desc="Tu recomendación quedó registrada." />
            <Paso n={2} estado="activo" titulo="Esperando en el negocio" desc="Cuando escaneen tu QR, la venta se confirma al instante." />
            <Paso n={3} estado="pendiente" titulo="Venta confirmada" desc="Tu recomendador recibe su comisión." ultimo />
          </View>
        </Fade>
      ) : (
        // Sin orden activa: invitación a generar una.
        <Fade key="sin-orden" desde={14} style={{ borderRadius: R.lg, padding: 22, marginBottom: 18, overflow: 'hidden', position: 'relative' }}>
          <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ position: 'absolute', right: -30, top: -30, opacity: 0.18 }}>
            <HazloMark size={170} primary="#fff" secondary="#fff" />
          </View>
          <Text style={{ fontFamily: F.bold, fontSize: 20, color: '#fff', letterSpacing: -0.4 }}>¿Te recomendaron un lugar?</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 6, lineHeight: 19 }}>
            Genera tu orden con el código que te compartieron y sigue tu compra en vivo.
          </Text>
          <PressableScale
            onPress={() => openSheet('claim')}
            style={{ marginTop: 16, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, height: 42, paddingHorizontal: 18, borderRadius: 999, backgroundColor: '#fff' }}>
            <Icon name="qr" size={16} color={C.primary} />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary }}>Generar orden</Text>
          </PressableScale>
        </Fade>
      )}

      {/* Acciones rápidas */}
      <Fade delay={STAGGER * 2} desde={10}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
          <PressableScale
            onPress={() => openSheet('claim')}
            style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="qr" size={17} color={FG} />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Nueva orden</Text>
          </PressableScale>
          <PressableScale
            onPress={() => go('share')}
            style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="send" size={17} color="#fff" />
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Recomendar</Text>
          </PressableScale>
        </View>
      </Fade>

      {/* Historial */}
      <SectionHeader title="Tus órdenes" />

      {cargando && <ListaSkeleton filas={3} />}

      {!cargando && visitas.length === 0 && (
        <Fade key="vacio" desde={12} style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Aún no tienes órdenes</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
            Cuando reclames una recomendación, aquí seguirás tu compra en vivo hasta que el negocio la confirme.
          </Text>
        </Fade>
      )}

      {visitas.length > 0 && (
        <View style={{ gap: 12 }}>
          {visitas.map((v, i) => {
            const e = ESTADO[v.estado];
            return (
              <Fade key={v.id} delay={i * STAGGER} desde={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: e.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={e.icon} size={19} color={e.color} sw={2} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{v.negocio}</Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>Orden #{v.folio} · {fechaCorta(v.creada)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: e.bg }}>
                  {v.estado === 'pendiente' && <LiveDot />}
                  <Text style={{ fontFamily: F.semi, fontSize: 11, color: e.color }}>{e.label}</Text>
                </View>
              </Fade>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
