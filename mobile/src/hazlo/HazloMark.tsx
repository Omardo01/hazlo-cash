import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { C, F } from './theme';

let __id = 0;

type MarkProps = { size?: number; primary?: string; secondary?: string };

// Mark oficial — 2 trazos con gradiente (viewBox 253×208), portado de brand.jsx
export function HazloMark({ size = 32, primary = C.primary, secondary = C.accent }: MarkProps) {
  const id = ++__id;
  const h = size;
  const w = size * (253 / 208);
  return (
    <Svg width={w} height={h} viewBox="0 0 253 208">
      <Defs>
        <LinearGradient id={`hz-a-${id}`} x1="143.5" y1="0" x2="88.5" y2="207.5" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primary} />
          <Stop offset="0.73" stopColor={secondary} />
        </LinearGradient>
        <LinearGradient id={`hz-b-${id}`} x1="228" y1="207" x2="232" y2="3.5" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primary} />
          <Stop offset="1" stopColor={secondary} />
        </LinearGradient>
      </Defs>
      <Path
        d="M122.287 0.378C138.481-0.421 160.634 0.286 177.075 0.348L177.038 207.333C160.524 207.266 142.89 207.707 126.595 207.284C125.303 160.83 127.376 112.691 126.264 66.196C126.221 64.419 124.053 63.585 122.821 64.865C107.434 80.851 90.49 97.456 74.965 113.308C70.208 118.102 65.148 123.051 60.517 128.082C58.678 130.079 58.496 133.078 60.059 135.298C68.379 147.114 78.219 158.992 86.766 171.03C88.976 174.143 88.553 178.377 85.874 181.097C77.466 189.635 69.218 198.33 61.134 207.176C53.611 198.565 40.331 179.638 32.793 169.93C27.595 163.237 8.547 138.914 1.946 128.543C0.636 126.484 0.83 123.905 2.403 122.039C6.135 117.611 11.745 112.13 15.17 108.607L40.193 82.911L87.315 34.776C94.398 27.5 115.51 4.237 122.287 0.378Z"
        fill={`url(#hz-a-${id})`}
      />
      <Path
        d="M202.705 0.294C219.158 0.203 235.61 0.211 252.057 0.318C252.706 21.467 252.149 44.481 252.137 65.777L252.143 207.455C247.52 207.364 243.025 207.299 238.458 206.852C215.729 204.632 201.934 184.317 202.724 162.422C202.852 158.737 202.699 154.355 202.699 150.563L202.693 119.816L202.705 0.294Z"
        fill={`url(#hz-b-${id})`}
      />
    </Svg>
  );
}

// Logotipo: mark + "Hazlo Cash"
export function HazloLogotype({ size = 28, fg = C.ink }: { size?: number; fg?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.28 }}>
      <HazloMark size={size * 1.1} />
      <Text style={{ fontFamily: F.bold, fontSize: size, letterSpacing: -size * 0.02, color: fg }}>
        Hazlo <Text style={{ color: C.primary }}>Cash</Text>
      </Text>
    </View>
  );
}
