import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Path, Stop } from 'react-native-svg';

import { F, FG, MUTED } from './theme';

// ── Glass: superficie translúcida (aprox. del liquid glass del prototipo) ──────
export function Glass({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.glass, style]}>{children}</View>;
}

// ── Section header ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

// Aproximación de los gradientes oklch del FoodTile usando hsl por "hue"
export function hueColors(hue: number): [string, string, string] {
  return [`hsl(${hue}, 48%, 60%)`, `hsl(${hue + 8}, 52%, 43%)`, `hsl(${hue - 12}, 44%, 27%)`];
}

// ── FoodTile: placeholder con gradiente (sin ilustraciones) ────────────────────
export function FoodTile({
  name,
  type,
  rating,
  height = 140,
  radius = 20,
  hue = 28,
}: {
  name?: string;
  type?: string;
  rating?: string;
  height?: number;
  radius?: number;
  hue?: number;
}) {
  const [a, b, c] = hueColors(hue);
  return (
    <View style={{ height, borderRadius: radius, overflow: 'hidden' }}>
      <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {/* brillo superior izquierdo */}
      <LinearGradient
        colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.7, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      {name ? (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 10 }}>
          <Text style={{ color: '#fff', fontFamily: F.semi, fontSize: 14 }}>{name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: F.reg, fontSize: 11 }}>{type}</Text>
            {rating ? (
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: F.reg, fontSize: 11 }}>· ★ {rating}</Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ── Sparkline (7 días) ─────────────────────────────────────────────────────────
export function Sparkline({ color }: { color: string }) {
  const points = [22, 18, 28, 24, 36, 30, 44];
  const max = Math.max(...points);
  const w = 320;
  const h = 70;
  const step = w / (points.length - 1);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - (p / max) * h}`).join(' ');
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const last = points.length - 1;
  return (
    <Svg viewBox={`0 0 ${w} ${h}`} width="100%" height={70} preserveAspectRatio="none">
      <Defs>
        <SvgGrad id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.3} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </SvgGrad>
      </Defs>
      <Path d={area} fill="url(#sparkfill)" />
      <Path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last * step} cy={h - (points[last] / max) * h} r={4} fill={color} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: F.semi, fontSize: 17, letterSpacing: -0.17, color: FG },
  sectionAction: { fontFamily: F.base, fontSize: 13, color: MUTED },
});
