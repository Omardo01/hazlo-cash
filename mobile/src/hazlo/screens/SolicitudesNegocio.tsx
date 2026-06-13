import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { getVisitasNegocio, resolverVisita, type VisitaNegocio } from '@/lib/services/referrals';
import type { EstadoReferral } from '@/lib/types';
import { Icon } from '../icons';
import { C, F, FG, MUTED, R } from '../theme';

const ESTILO_ESTADO: Record<EstadoReferral, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#B7791F', bg: 'rgba(245,166,35,0.15)' },
  confirmado: { label: 'Confirmada', color: '#00A896', bg: 'rgba(0,168,150,0.15)' },
  rechazado: { label: 'Rechazada', color: MUTED, bg: 'rgba(13,13,13,0.06)' },
};

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  const hoy = new Date();
  const mismoDia = d.toDateString() === hoy.toDateString();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (mismoDia) return `Hoy · ${hora}`;
  return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${hora}`;
}

export function SolicitudesNegocioScreen() {
  const [visitas, setVisitas] = useState<VisitaNegocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolviendo, setResolviendo] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setVisitas(await getVisitasNegocio());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const resolver = async (id: string, decision: 'confirmado' | 'rechazado') => {
    setResolviendo(id);
    const { ok } = await resolverVisita(id, decision);
    if (ok) {
      setVisitas((prev) => prev.map((v) => (v.id === id ? { ...v, estado: decision } : v)));
    }
    setResolviendo(null);
  };

  const pendientes = visitas.filter((v) => v.estado === 'pendiente').length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginBottom: 4 }}>Solicitudes</Text>
      <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginBottom: 18 }}>
        {pendientes > 0 ? `${pendientes} por confirmar` : 'Todo al día'}
      </Text>

      {loading && (
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      )}

      {!loading && error && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>
          No pudimos cargar las solicitudes. Desliza para reintentar.
        </Text>
      )}

      {!loading && !error && visitas.length === 0 && (
        <View style={{ borderRadius: R.lg, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Aún no hay solicitudes</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
            Cuando un cliente reclame una recomendación de tu negocio, aparecerá aquí para que la confirmes.
          </Text>
        </View>
      )}

      {!loading && !error && visitas.length > 0 && (
        <View style={{ gap: 12 }}>
          {visitas.map((v) => {
            const e = ESTILO_ESTADO[v.estado];
            return (
              <View key={v.id} style={{ borderRadius: R.md, padding: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontFamily: F.bold, fontSize: 17, color: FG, letterSpacing: 1 }}>{v.folio}</Text>
                    <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 2 }}>
                      Código {v.codigo} · {fechaCorta(v.creada)}
                    </Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: e.bg }}>
                    <Text style={{ fontFamily: F.semi, fontSize: 11, color: e.color }}>{e.label}</Text>
                  </View>
                </View>

                {v.estado === 'pendiente' && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <Pressable
                      onPress={() => resolver(v.id, 'rechazado')}
                      disabled={resolviendo === v.id}
                      style={{ flex: 1, height: 44, borderRadius: R.sm, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: F.semi, fontSize: 13, color: MUTED }}>Rechazar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => resolver(v.id, 'confirmado')}
                      disabled={resolviendo === v.id}
                      style={{ flex: 2, height: 44, borderRadius: R.sm, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: resolviendo === v.id ? 0.7 : 1 }}>
                      {resolviendo === v.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Icon name="check" size={16} color="#fff" sw={2.4} />
                          <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Confirmar visita</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
