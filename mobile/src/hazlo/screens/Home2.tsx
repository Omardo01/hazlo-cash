import { useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useComisiones, usePerfil, useRetiros, useSaldo, useVisitasCliente } from '@/lib/datos/consultas';
import { ListaSkeleton } from '../Skeleton';
import { Icon, IconName } from '../icons';
import { Fade, PressableScale, STAGGER } from '../motion';
import { C, F, FG, MUTED, R } from '../theme';
import type { ScreenProps } from './types';

// Estilo "fintech oscuro": bloque negro arriba con el dinero y las acciones,
// historial sobre fondo claro. Es una alternativa de Inicio en evaluación —
// convive con la actual hasta decidir cuál se queda.

const CARD = '#0D0D0D';
const CARD_SOFT = 'rgba(255,255,255,0.08)';

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return '¡Buenos días!';
  if (h < 19) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '··';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

function fechaLarga(iso: string): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' });
  return dia.charAt(0).toUpperCase() + dia.slice(1);
}

// Monto con los centavos en gris, como en la referencia.
function Monto({ valor, size, claro }: { valor: number; size: number; claro?: boolean }) {
  const [ent, dec] = valor.toFixed(2).split('.');
  const miles = Number(ent).toLocaleString('es-MX');
  return (
    <Text style={{ fontFamily: F.bold, fontSize: size, color: claro ? '#fff' : FG, letterSpacing: -size * 0.04 }}>
      ${miles}
      <Text style={{ color: claro ? 'rgba(255,255,255,0.42)' : 'rgba(13,13,13,0.4)' }}>.{dec}</Text>
    </Text>
  );
}

function Accion({
  icon,
  label,
  onPress,
  principal,
  delay,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  principal?: boolean;
  delay: number;
}) {
  return (
    <Fade delay={delay} desde={10} style={{ alignItems: 'center' }}>
      <PressableScale
        onPress={onPress}
        style={{
          width: principal ? 64 : 54,
          height: principal ? 64 : 54,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: principal ? '#fff' : CARD_SOFT,
        }}>
        <Icon name={icon} size={principal ? 24 : 20} color={principal ? CARD : '#fff'} sw={2} />
      </PressableScale>
      <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff', marginTop: 8 }}>{label}</Text>
    </Fade>
  );
}

function Resumen({ icon, label, valor, color, delay }: { icon: IconName; label: string; valor: number; color: string; delay: number }) {
  return (
    <Fade delay={delay} desde={12} style={{ flex: 1 }}>
      <View style={{ borderRadius: R.lg, padding: 14, backgroundColor: CARD_SOFT }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 26, height: 26, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={13} color={color} sw={2.4} />
          </View>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{label}</Text>
        </View>
        <View style={{ marginTop: 14 }}>
          <Monto valor={valor} size={20} claro />
        </View>
      </View>
    </Fade>
  );
}

// Comisiones y retiros mezclados en una sola línea de tiempo.
type Movimiento = { id: string; titulo: string; sub: string; monto: number; entra: boolean; fecha: string; icon: IconName };

export function Home2Screen({ go, openSheet, reloadKey }: ScreenProps) {
  // Comparte la caché con el Inicio clásico y con Actividad: cambiar entre
  // ellos no vuelve a consultar nada mientras los datos sigan frescos.
  const { datos: perfil } = usePerfil();
  const { datos: saldo = 0, cargando: cargandoSaldo, refrescar: refSaldo } = useSaldo();
  const { datos: comisiones = [], cargando: cargandoComisiones, refrescar: refComisiones } = useComisiones();
  const { datos: retiros = [], refrescar: refRetiros } = useRetiros();
  const { datos: visitas = [], refrescar: refVisitas } = useVisitasCliente();

  const nombre = perfil?.nombre ?? '';
  const cargando = cargandoSaldo || cargandoComisiones;

  const refrescar = () => {
    refSaldo();
    refComisiones();
    refRetiros();
    refVisitas();
  };

  // Tras reclamar un código hay una orden nueva propia que el canal no anuncia.
  useEffect(() => {
    if (reloadKey) refVisitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const ganado = comisiones.reduce((t, c) => t + c.monto, 0);
  const retirado = retiros.reduce((t, r) => t + r.monto, 0);
  const disponible = Math.max(0, saldo - retirado);
  const pendientes = visitas.filter((v) => v.estado === 'pendiente').length;

  const movimientos: Movimiento[] = [
    ...comisiones.map((c) => ({
      id: `c-${c.id}`,
      titulo: `Comisión · ${c.negocio}`,
      sub: 'Recibida',
      monto: c.monto,
      entra: true,
      fecha: c.creada,
      icon: 'send' as IconName,
    })),
    ...retiros.map((r) => ({
      id: `r-${r.id}`,
      titulo: `Retiro a ${r.cuenta}`,
      sub: 'Enviado',
      monto: r.monto,
      entra: false,
      fecha: r.creada,
      icon: 'wallet' as IconName,
    })),
  ]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 8);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refrescar} tintColor={C.primary} />}>
      {/* Bloque oscuro */}
      <View style={{ marginHorizontal: 12, borderRadius: 34, backgroundColor: CARD, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 22, overflow: 'hidden' }}>
        <Fade desde={8}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.bold, fontSize: 15, color: '#fff' }}>{iniciales(nombre || 'Hazlo Cash')}</Text>
            </LinearGradient>
            <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 17, color: '#fff' }} numberOfLines={1}>
              {saludo()}
            </Text>
            <PressableScale
              onPress={() => go('balance')}
              style={{ width: 42, height: 42, borderRadius: 999, backgroundColor: CARD_SOFT, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bell" size={19} color="#fff" />
              {pendientes > 0 && (
                <View style={{ position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 999, backgroundColor: C.primary, borderWidth: 2, borderColor: CARD }} />
              )}
            </PressableScale>
          </View>
        </Fade>

        {/* Saldo */}
        <Fade delay={STAGGER} desde={12} style={{ alignItems: 'center', marginTop: 26 }}>
          <Text style={{ fontFamily: F.base, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Saldo disponible</Text>
          <View style={{ marginTop: 6, minHeight: 54, justifyContent: 'center' }}>
            {cargando ? <ActivityIndicator color={C.primary} /> : <Monto valor={disponible} size={46} claro />}
          </View>
        </Fade>

        {/* Acciones */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 34, marginTop: 22 }}>
          <Accion icon="qr" label="Reclamar" onPress={() => openSheet('claim')} delay={STAGGER * 2} />
          <Accion icon="send" label="Recomendar" principal onPress={() => go('share')} delay={STAGGER * 3} />
          <Accion icon="wallet" label="Retirar" onPress={() => openSheet('withdraw')} delay={STAGGER * 4} />
        </View>

        {/* Entradas y salidas */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 26 }}>
          <Resumen icon="arrowDown" label="Ganado" valor={ganado} color="#00A896" delay={STAGGER * 5} />
          <Resumen icon="arrowUp" label="Retirado" valor={retirado} color={C.primary} delay={STAGGER * 6} />
        </View>
      </View>

      {/* Crear orden a recomendar */}
      <Fade delay={STAGGER * 7} desde={14}>
        <PressableScale
          onPress={() => go('share')}
          style={{ marginHorizontal: 12, marginTop: 16, borderRadius: R.lg, padding: 16, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={22} color="#fff" sw={2.4} />
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Crear una recomendación</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 17 }}>
              Elige un negocio y genera tu código y QR para compartir.
            </Text>
          </View>
          <Icon name="chevR" size={18} color={MUTED} />
        </PressableScale>
      </Fade>

      {/* Historial */}
      <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
        <Fade delay={STAGGER * 8}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Text style={{ fontFamily: F.semi, fontSize: 17, color: FG, letterSpacing: -0.2 }}>Movimientos</Text>
            <PressableScale onPress={() => go('balance')} hitSlop={8}>
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary }}>Ver todo</Text>
            </PressableScale>
          </View>
        </Fade>

        {cargando && (
          <View style={{ borderRadius: R.md, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
            <ListaSkeleton filas={3} />
          </View>
        )}

        {!cargando && movimientos.length === 0 && (
          <Fade delay={STAGGER * 9} desde={12}>
            <View style={{ borderRadius: R.md, padding: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <Text style={{ fontFamily: F.semi, fontSize: 14.5, color: FG }}>Todavía no hay movimientos</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 12.5, color: MUTED, marginTop: 5, lineHeight: 18 }}>
                Cuando un negocio confirme una venta que recomendaste, verás tu comisión aquí.
              </Text>
            </View>
          </Fade>
        )}

        {movimientos.map((m, i) => (
          <Fade key={m.id} delay={STAGGER * 9 + i * STAGGER} desde={12}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 }}>
              <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: m.entra ? 'rgba(0,168,150,0.12)' : `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={m.icon} size={18} color={m.entra ? '#00A896' : C.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 14.5, color: FG }}>{m.titulo}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2 }}>{fechaLarga(m.fecha)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14.5, color: FG }}>
                  {m.entra ? '+' : '−'}${m.monto.toFixed(2)}
                </Text>
                <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2 }}>{m.sub}</Text>
              </View>
            </View>
          </Fade>
        ))}
      </View>
    </ScrollView>
  );
}
