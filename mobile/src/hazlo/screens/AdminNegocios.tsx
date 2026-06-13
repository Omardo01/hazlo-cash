import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { getNegociosAdmin, setNegocioActivo } from '@/lib/services/businesses';
import type { Business } from '@/lib/types';
import { AdminAltaNegocio } from '../AdminAltaNegocio';
import { Icon } from '../icons';
import { C, F, FG, MUTED, R } from '../theme';

export function AdminNegociosScreen() {
  const [negocios, setNegocios] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [altaVisible, setAltaVisible] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setNegocios(await getNegociosAdmin());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const toggle = async (n: Business) => {
    setToggling(n.id);
    const { ok } = await setNegocioActivo(n.id, !n.activo);
    if (ok) setNegocios((prev) => prev.map((b) => (b.id === n.id ? { ...b, activo: !b.activo } : b)));
    setToggling(null);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={cargar} tintColor={C.primary} />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44 }}>Negocios</Text>
        <Pressable
          onPress={() => setAltaVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 999, backgroundColor: C.primary }}>
          <Icon name="plus" size={16} color="#fff" sw={2.4} />
          <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Nuevo</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      )}

      {!loading && error && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>No se pudieron cargar. Desliza para reintentar.</Text>
      )}

      {!loading && !error && (
        <View style={{ gap: 12 }}>
          {negocios.map((n) => (
            <View key={n.id} style={{ borderRadius: R.md, padding: 14, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                  <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>{n.nombre}</Text>
                  <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{n.categoria}</Text>
                  {n.oferta && (
                    <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: C.primary, marginTop: 4 }}>{n.oferta}</Text>
                  )}
                </View>
                <Pressable
                  onPress={() => toggle(n)}
                  disabled={toggling === n.id}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: n.activo ? 'rgba(0,168,150,0.15)' : 'rgba(13,13,13,0.06)', minWidth: 86, alignItems: 'center' }}>
                  {toggling === n.id ? (
                    <ActivityIndicator size="small" color={MUTED} />
                  ) : (
                    <Text style={{ fontFamily: F.semi, fontSize: 11, color: n.activo ? '#00A896' : MUTED }}>
                      {n.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <AdminAltaNegocio
        visible={altaVisible}
        onClose={() => {
          setAltaVisible(false);
          cargar();
        }}
      />
    </ScrollView>
  );
}
