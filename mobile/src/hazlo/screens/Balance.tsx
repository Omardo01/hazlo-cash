import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon, IconName } from '../icons';
import { C, F, FG, MUTED, R } from '../theme';
import { Glass, SectionHeader, Sparkline } from '../ui';
import type { ScreenProps } from './types';

const tx: { kind: string; when: string; amt: string; icon: IconName; from: string; negative?: boolean }[] = [
  { kind: 'Recomendación', when: 'Hoy', amt: '+$5.20', icon: 'send', from: '@pame_co recomendó Café Central' },
  { kind: 'Recomendación', when: 'Ayer', amt: '+$3.10', icon: 'send', from: '@luism probó La Terraza' },
  { kind: 'Retiro', when: '11 May', amt: '-$20.00', icon: 'arrowDown', from: 'A cuenta BBVA •• 4421', negative: true },
  { kind: 'Recomendación', when: '11 May', amt: '+$2.50', icon: 'send', from: '@andreav probó Verde Bistró' },
  { kind: 'Bono mensual', when: '01 May', amt: '+$10.00', icon: 'gift', from: 'Recompensa por 20 recomendaciones' },
  { kind: 'Recomendación', when: '28 Abr', amt: '+$4.40', icon: 'send', from: '@danir probó Brew House' },
];

export function BalanceScreen({ openSheet }: ScreenProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}>
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
          $245<Text style={{ fontSize: 30, color: 'rgba(13,13,13,0.6)' }}>.80</Text>
        </Text>
        <View style={{ marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingLeft: 6, paddingRight: 10, borderRadius: 999, backgroundColor: `${C.primary}15` }}>
          <Icon name="arrowUp" size={13} color={C.primary} sw={2.4} />
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.primary }}>+$120.50 este mes</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 22 }}>
        <Pressable
          onPress={() => openSheet('withdraw')}
          style={{
            flex: 1,
            height: 48,
            borderRadius: R.md,
            backgroundColor: C.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: C.primary,
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}>
          <Icon name="arrowDown" size={17} color="#fff" />
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: '#fff' }}>Retirar</Text>
        </Pressable>
        <Pressable
          style={{ flex: 1, height: 48, borderRadius: R.md, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="chart" size={17} color={FG} />
          <Text style={{ fontFamily: F.semi, fontSize: 14, color: FG }}>Reporte</Text>
        </Pressable>
      </View>

      {/* Mini chart */}
      <View style={{ borderRadius: R.md, padding: 16, marginBottom: 22, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <View>
            <Text style={{ fontFamily: F.base, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.44 }}>Ganancias · 7 días</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 20, color: FG, letterSpacing: -0.4, marginTop: 2 }}>+$28.40</Text>
          </View>
          <Text style={{ fontFamily: F.semi, fontSize: 11, color: C.primary }}>+18%</Text>
        </View>
        <Sparkline color={C.primary} />
      </View>

      {/* Activity */}
      <SectionHeader title="Actividad reciente" action="Ver todo" />
      <View style={{ borderRadius: R.md, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' }}>
        {tx.map((t, i) => (
          <View
            key={i}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i < tx.length - 1 ? 0.5 : 0, borderColor: 'rgba(0,0,0,0.05)' }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: t.negative ? '#F2F4F7' : `${C.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={t.icon} size={17} color={t.negative ? MUTED : C.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontFamily: F.semi, fontSize: 13, color: FG }}>{t.kind}</Text>
                <Text style={{ fontFamily: F.bold, fontSize: 13, color: t.negative ? FG : C.primary }}>{t.amt}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.reg, fontSize: 11, color: MUTED, flex: 1, paddingRight: 6 }}>{t.from}</Text>
                <Text style={{ fontFamily: F.reg, fontSize: 11, color: MUTED }}>{t.when}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
