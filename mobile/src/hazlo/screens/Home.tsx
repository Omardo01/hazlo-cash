import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { HazloMark } from '../HazloMark';
import { Icon, IconName } from '../icons';
import { C, F, FG, MUTED, R } from '../theme';
import { FoodTile, Glass, SectionHeader } from '../ui';
import type { ScreenProps } from './types';

const stats: { v: string; l: string; icon: IconName }[] = [
  { v: '23', l: 'Recomendaciones', icon: 'send' },
  { v: '12', l: 'Amigos activos', icon: 'user' },
  { v: '4.9', l: 'Rating', icon: 'star' },
];

const popular = [
  { name: 'La Terraza', type: 'Comida', rating: '4.7', hue: 22 },
  { name: 'Brew House', type: 'Café', rating: '4.9', hue: 35 },
  { name: 'Sushi Kō', type: 'Japonés', rating: '4.6', hue: 12 },
  { name: 'Verde Bistró', type: 'Saludable', rating: '4.8', hue: 130 },
];

export function HomeScreen({ go }: ScreenProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
      {/* Greeting */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <View>
          <Text style={{ fontFamily: F.base, fontSize: 13, color: MUTED }}>Hola, Javier</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 22, color: FG, letterSpacing: -0.44, marginTop: 2 }}>
            ¿Qué recomiendas hoy?
          </Text>
        </View>
        <Glass style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bell" size={19} color={FG} />
        </Glass>
      </View>

      {/* Hero balance card */}
      <View
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: R.lg,
          padding: 20,
          marginBottom: 22,
          shadowColor: C.primary,
          shadowOpacity: 0.5,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 18 },
          elevation: 8,
        }}>
        <LinearGradient
          colors={[C.primary, C.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={{ position: 'absolute', right: -30, top: -30, opacity: 0.18 }}>
          <HazloMark size={180} primary="#fff" secondary="#fff" />
        </View>
        <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.24, textTransform: 'uppercase' }}>
          Tu saldo
        </Text>
        <Text style={{ fontFamily: F.bold, fontSize: 38, color: '#fff', letterSpacing: -1.14, marginTop: 2 }}>$245.80</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <Icon name="arrowUp" size={13} color="#fff" sw={2.4} />
          <Text style={{ fontFamily: F.base, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>+$120.50 este mes</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
          <Pressable
            onPress={() => go('balance')}
            style={{ flex: 1, height: 40, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary }}>Retirar dinero</Text>
          </Pressable>
          <Pressable
            onPress={() => go('share')}
            style={{
              flex: 1,
              height: 40,
              borderRadius: R.md,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontFamily: F.semi, fontSize: 13, color: '#fff' }}>Recomendar</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
        {stats.map((s) => (
          <Glass key={s.l} style={{ flex: 1, padding: 12, borderRadius: R.md }}>
            <View style={{ marginBottom: 6 }}>
              <Icon name={s.icon} size={18} color={C.primary} />
            </View>
            <Text style={{ fontFamily: F.bold, fontSize: 18, color: FG, letterSpacing: -0.36 }}>{s.v}</Text>
            <Text style={{ fontFamily: F.reg, fontSize: 10, color: MUTED, marginTop: 1 }}>{s.l}</Text>
          </Glass>
        ))}
      </View>

      {/* Featured */}
      <SectionHeader title="Recomendación destacada" action="Ver todo" />
      <View
        style={{
          borderRadius: R.lg,
          overflow: 'hidden',
          marginBottom: 22,
          backgroundColor: '#fff',
          borderWidth: 0.5,
          borderColor: 'rgba(0,0,0,0.04)',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        }}>
        <FoodTile height={150} radius={0} hue={28} />
        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontFamily: F.semi, fontSize: 15, color: FG }}>Café Central</Text>
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED, marginTop: 2 }}>Cafetería · $$</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="star" size={14} color={C.primary} fill={C.primary} sw={1} />
              <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.primary }}>4.8</Text>
            </View>
          </View>
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.08)', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LinearGradient colors={[C.primary, C.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: 10 }}>P</Text>
              </LinearGradient>
              <Text style={{ fontFamily: F.reg, fontSize: 12, color: MUTED }}>
                Recomendado por <Text style={{ color: FG, fontFamily: F.base }}>@pame_co</Text>
              </Text>
            </View>
            <View style={{ backgroundColor: `${C.primary}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>+$5.20</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Popular */}
      <SectionHeader title="Popular esta semana" action="Ver más" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {popular.map((t) => (
          <View key={t.name} style={{ width: '47.6%', flexGrow: 1 }}>
            <FoodTile {...t} radius={R.md} height={150} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
