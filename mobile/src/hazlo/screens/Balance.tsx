import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { getMisComisiones, getMiSaldo, type ComisionItem } from '@/lib/services/wallet';
import { Icon } from '../icons';
import { C, F, FG, MUTED, R } from '../theme';
import { Glass, SectionHeader, Sparkline } from '../ui';
import type { ScreenProps } from './types';

function partesMonto(n: number): [string, string] {
  const [ent, dec] = n.toFixed(2).split('.');
  return [ent, dec];
}

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return 'Hoy';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

export function BalanceScreen({ openSheet }: ScreenProps) {
  const [saldo, setSaldo] = useState(0);
  const [comisiones, setComisiones] = useState<ComisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([getMiSaldo(), getMisComisiones()]);
      setSaldo(s);
      setComisiones(c);
    } catch {
      // RLS/errores de red: dejamos los valores actuales.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ahora = new Date();
  const esteMes = comisiones
    .filter((c) => {
      const d = new Date(c.creada);
      return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
    })
    .reduce((s, c) => s + c.monto, 0);

  const [ent, dec] = partesMonto(saldo);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>Balance</Text>
        <Glass style={{ width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={18} color={FG} />
        </Glass>
      </View>

      {/* Hero */}
      <View style={{ paddingVertical: 8 }}>
        <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Tu saldo disponible</Text>
        <Text style={{ fontFamily: F.bold, fontSize: 52, color: FG, letterSpacing: -2.08, marginTop: 4 }}>
          ${ent}<Text style={{ fontSize: 30, color: 'rgba(13,13,13,0.6)' }}>.{dec}</Text>
        </Text>
        {esteMes > 0 && (
          <View style={{ marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingLeft: 6, paddingRight: 10, borderRadius: 999, backgroundColor: `${C.primary}15` }}>
            <Icon name="arrowUp" size={13} color={C.primary} sw={2.4} />
            <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>+${esteMes.toFixed(2)} este mes</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 22 }}>
        <Pressable
          onPress={() => openSheet('withdraw')}
          style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: C.primary, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
          <Icon name="arrowDown" size={17} color="#fff" />
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Retirar</Text>
        </Pressable>
        <Pressable style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="chart" size={17} color={FG} />
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Reporte</Text>
        </Pressable>
      </View>

      {/* Mini chart */}
      <View style={{ borderRadius: R.md, padding: 16, marginBottom: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <View>
            <Text style={{ fontFamily: F.base, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.44 }}>Comisiones · este mes</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4, marginTop: 2 }}>+${esteMes.toFixed(2)}</Text>
          </View>
          <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>{comisiones.length} ventas</Text>
        </View>
        <Sparkline color={C.primary} />
      </View>

      {/* Activity */}
      <SectionHeader title="Actividad reciente" />

      {loading && (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      )}

      {!loading && comisiones.length === 0 && (
        <View style={{ borderRadius: R.md, padding: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Aún no tienes comisiones</Text>
          <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 19 }}>
            Comparte tu código. Cuando un negocio confirme una venta que recomendaste, tu comisión aparecerá aquí.
          </Text>
        </View>
      )}

      {!loading && comisiones.length > 0 && (
        <View style={{ borderRadius: R.md, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
          {comisiones.map((c, i) => (
            <View
              key={c.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i < comisiones.length - 1 ? 0.5 : 0, borderColor: 'rgba(0,0,0,0.05)' }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="send" size={17} color={C.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>Comisión</Text>
                  <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.primary }}>+${c.monto.toFixed(2)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 1 }}>
                  <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, flex: 1, paddingRight: 6 }}>{c.negocio}</Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{fechaCorta(c.creada)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
