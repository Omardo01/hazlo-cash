import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Set de iconos outline — portado 1:1 de brand.jsx (Icons)
export type IconName =
  | 'home' | 'search' | 'plus' | 'activity' | 'user' | 'heart' | 'share'
  | 'bell' | 'gift' | 'dollar' | 'chart' | 'send' | 'star' | 'bookmark'
  | 'wallet' | 'check' | 'chevR' | 'copy' | 'qr' | 'arrowUp' | 'arrowDown'
  | 'settings' | 'refresh';

type P = { color: string; sw: number; fill: string };

const paths: Record<IconName, (p: P) => React.ReactNode> = {
  home: ({ color, sw }) => (
    <>
      <Path d="M3 11.5 12 4l9 7.5" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M5 10v10h14V10" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  search: ({ color, sw }) => (
    <>
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M20 20l-3.5-3.5" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  plus: ({ color }) => <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.2} fill="none" />,
  activity: ({ color, sw }) => <Path d="M3 17l5-6 4 4 5-8 4 7" stroke={color} strokeWidth={sw} fill="none" />,
  user: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  heart: ({ color, sw, fill }) => (
    <Path
      d="M12 21s-7-4.5-9-9.5C1.5 7.5 5 4 8 5c2 0.7 3.2 2.2 4 3.5C12.8 7.2 14 5.7 16 5c3-1 6.5 2.5 5 6.5-2 5-9 9.5-9 9.5z"
      stroke={color}
      strokeWidth={sw}
      fill={fill}
    />
  ),
  share: ({ color, sw }) => (
    <>
      <Circle cx={18} cy={5} r={3} stroke={color} strokeWidth={sw} fill="none" />
      <Circle cx={6} cy={12} r={3} stroke={color} strokeWidth={sw} fill="none" />
      <Circle cx={18} cy={19} r={3} stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  bell: ({ color, sw }) => (
    <>
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M10 21a2 2 0 0 0 4 0" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  gift: ({ color, sw }) => (
    <>
      <Rect x={3} y={8} width={18} height={13} rx={2} stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M12 8v13M3 13h18" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M12 8s-3-4-5-2 1 4 5 2zM12 8s3-4 5-2-1 4-5 2z" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  dollar: ({ color, sw }) => (
    <>
      <Path d="M12 3v18" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H8" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  chart: ({ color, sw }) => <Path d="M4 20V10M10 20V4M16 20v-8M22 20H2" stroke={color} strokeWidth={sw} fill="none" />,
  send: ({ color, sw }) => (
    <>
      <Path d="M22 2 11 13" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M22 2 15 22l-4-9-9-4z" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  star: ({ color, sw, fill }) => (
    <Path
      d="M12 3l2.7 5.7 6.3 0.9-4.6 4.4 1.1 6.3L12 17.3 6.5 20.3l1.1-6.3L3 9.6l6.3-0.9z"
      stroke={color}
      strokeWidth={sw}
      fill={fill}
    />
  ),
  bookmark: ({ color, sw }) => <Path d="M6 3h12v18l-6-4-6 4z" stroke={color} strokeWidth={sw} fill="none" />,
  wallet: ({ color, sw }) => (
    <>
      <Rect x={2.5} y={6} width={19} height={13} rx={3} stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M16 13h3" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M5 6V5a2 2 0 0 1 2-2h9l1 3" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  check: ({ color }) => <Path d="M5 12l4.5 4.5L19 7" stroke={color} strokeWidth={2.2} fill="none" />,
  chevR: ({ color, sw }) => <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={sw} fill="none" />,
  copy: ({ color, sw }) => (
    <>
      <Rect x={8} y={8} width={12} height={12} rx={2.5} stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  qr: ({ color, sw }) => (
    <>
      <Rect x={3} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={14} y={3} width={7} height={7} rx={1.5} stroke={color} strokeWidth={sw} fill="none" />
      <Rect x={3} y={14} width={7} height={7} rx={1.5} stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M14 14h3M20 14v3M14 17v4M17 20h4" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
  arrowUp: ({ color, sw }) => <Path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth={sw} fill="none" />,
  arrowDown: ({ color, sw }) => <Path d="M12 5v14M5 12l7 7 7-7" stroke={color} strokeWidth={sw} fill="none" />,
  settings: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={sw} fill="none" />
      <Path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
        stroke={color}
        strokeWidth={sw}
        fill="none"
      />
    </>
  ),
  refresh: ({ color, sw }) => (
    <>
      <Path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" stroke={color} strokeWidth={sw} fill="none" />
    </>
  ),
};

export function Icon({
  name,
  size = 22,
  color = '#0D0D0D',
  sw = 1.8,
  fill = 'none',
}: {
  name: IconName;
  size?: number;
  color?: string;
  sw?: number;
  fill?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]({ color, sw, fill })}
    </Svg>
  );
}
