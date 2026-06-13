import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getNegociosActivos } from '@/lib/services/businesses';
import type { Business } from '@/lib/types';
import { Icon } from '../icons';
import { C, F, FG, MUTED, R } from '../theme';
import { FoodTile, Glass, SectionHeader } from '../ui';

const cats = ['Todo', 'Comida', 'Café', 'Viajes', 'Estilo de vida', 'Servicios'];

const trending = [
  { name: 'Café Central', type: 'Cafetería · 5.5km', rating: '4.8', hue: 28 },
  { name: 'Brew House', type: 'Café · 3.1km', rating: '4.9', hue: 35 },
  { name: 'Tacos del Rey', type: 'Mexicano', rating: '4.7', hue: 18 },
];

// Hue estable por negocio para que los tiles se vean variados sin foto real.
function hueDeId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

export function DiscoverScreen() {
  const [cat, setCat] = useState('Todo');
  const [negocios, setNegocios] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    getNegociosActivos()
      .then((data) => {
        if (activo) setNegocios(data);
      })
      .catch((e: unknown) => {
        if (activo) setError(e instanceof Error ? e.message : 'Error al cargar negocios');
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const visibles = cat === 'Todo' ? negocios : negocios.filter((n) => n.categoria === cat);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      <Text style={{ fontFamily: F.bold, fontSize: 28, color: FG, letterSpacing: -0.7, marginBottom: 14 }}>Descubre</Text>

      {/* Search */}
      <Glass style={{ borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Icon name="search" size={18} color={MUTED} />
        <TextInput
          placeholder="Buscar lugares, productos, personas..."
          placeholderTextColor={MUTED}
          style={{ flex: 1, fontFamily: F.reg, fontSize: 13, color: FG, padding: 0 }}
        />
      </Glass>

      {/* Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }} style={{ marginBottom: 18 }}>
        {cats.map((cc) => {
          const active = cat === cc;
          return (
            <Pressable
              key={cc}
              onPress={() => setCat(cc)}
              style={{
                height: 34,
                paddingHorizontal: 14,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: active ? 0 : 1,
                borderColor: 'rgba(0,0,0,0.08)',
                backgroundColor: active ? C.primary : '#fff',
              }}>
              <Text style={{ fontFamily: F.base, fontSize: 12, color: active ? '#fff' : FG }}>{cc}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Trending */}
      <SectionHeader title="Tendencias" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }} style={{ marginBottom: 22 }}>
        {trending.map((t) => (
          <View key={t.name} style={{ width: 200 }}>
            <FoodTile {...t} radius={R.md} height={180} />
          </View>
        ))}
      </ScrollView>

      {/* Negocios reales en Hazlo Cash */}
      <SectionHeader title="Negocios en Hazlo Cash" />

      {loading && (
        <View style={{ paddingVertical: 28, alignItems: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      )}

      {!loading && error && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>
          No pudimos cargar los negocios. Intenta de nuevo más tarde.
        </Text>
      )}

      {!loading && !error && visibles.length === 0 && (
        <Text style={{ fontFamily: F.reg, fontSize: 13, color: MUTED, paddingVertical: 16 }}>
          Aún no hay negocios en esta categoría.
        </Text>
      )}

      {!loading && !error && visibles.length > 0 && (
        <View style={{ gap: 12 }}>
          {visibles.map((n) => (
            <View
              key={n.id}
              style={{ flexDirection: 'row', gap: 12, padding: 10, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
              <View style={{ width: 72, height: 72 }}>
                <FoodTile hue={hueDeId(n.id)} radius={14} height={72} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>{n.nombre}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, marginTop: 1 }}>{n.categoria}</Text>
                {n.oferta && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 16, height: 16, borderRadius: 999 }} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>{n.oferta}</Text>
                    </View>
                  </View>
                )}
              </View>
              <Icon name="bookmark" size={18} color={MUTED} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
