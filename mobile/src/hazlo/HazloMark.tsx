import { Text, View } from 'react-native';
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { C, F } from './theme';

let __id = 0;

type MarkProps = { size?: number; mono?: string };

// Mark oficial (2026-10) — 3 pastillas y un listón que las cruza. Trazado en vector
// a partir del arte: se dibuja con las pastillas horizontales y el grupo se gira 37°.
const VB = { x: 280, y: 302, w: 790, h: 828 };
const GIRO = 'rotate(-37 700 700)';
const GANCHO =
  'M900 382A102.5 102.5 0 0 1 900 587L655 587C615 563 565 552 515 559C475 565 450 584 418 584C378 584 352 550 352 505C352 445 395 403 450 398Z';
const LISTON =
  'M443.0 398.0C457.5 400.3 504.3 403.0 530.0 412.0C555.7 421.0 577.0 437.3 597.0 452.0C617.0 466.7 634.7 482.0 650.0 500.0C665.3 518.0 678.5 539.7 689.0 560.0C699.5 580.3 706.2 599.5 713.0 622.0C719.8 644.5 724.7 669.5 730.0 695.0C735.3 720.5 739.2 747.5 745.0 775.0C750.8 802.5 756.2 833.8 765.0 860.0C773.8 886.2 785.8 911.2 798.0 932.0C810.2 952.8 825.7 970.0 838.0 985.0C850.3 1000.0 866.3 1015.8 872.0 1022.0L846.0 1022.0C839.7 1019.7 821.0 1015.3 808.0 1008.0C795.0 1000.7 781.0 991.7 768.0 978.0C755.0 964.3 740.8 946.0 730.0 926.0C719.2 906.0 710.7 881.5 703.0 858.0C695.3 834.5 690.3 812.5 684.0 785.0C677.7 757.5 671.0 719.2 665.0 693.0C659.0 666.8 653.8 647.8 648.0 628.0C642.2 608.2 637.7 591.0 630.0 574.0C622.3 557.0 615.3 544.0 602.0 526.0C588.7 508.0 572.0 485.0 550.0 466.0C528.0 447.0 487.8 423.3 470.0 412.0C452.2 400.7 447.5 400.3 443.0 398.0Z';
const PASTILLAS = [
  { x: 297, y: 628, w: 727, h: 196 },
  { x: 363, y: 851, w: 597, h: 172 },
];
// sombra suave del listón: copias desplazadas, recortadas a las pastillas
const SOMBRA = [6, 12, 18, 24, 30, 38, 46];

// `mono` pinta el mark en un solo color (ej. blanco sobre fondo naranja)
export function HazloMark({ size = 32, mono }: MarkProps) {
  const id = ++__id;
  const h = size;
  const w = size * (VB.w / VB.h);
  const fill = (g: string) => mono ?? `url(#hz-${g}-${id})`;
  return (
    <Svg width={w} height={h} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
      <Defs>
        <LinearGradient id={`hz-t-${id}`} x1="352" y1="0" x2="1003" y2="0" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFB400" />
          <Stop offset="0.28" stopColor="#FF8A12" />
          <Stop offset="0.6" stopColor="#FF5622" />
          <Stop offset="1" stopColor="#FF6A0C" />
        </LinearGradient>
        <LinearGradient id={`hz-m-${id}`} x1="297" y1="0" x2="1024" y2="0" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FF5722" />
          <Stop offset="0.45" stopColor="#FF6A14" />
          <Stop offset="1" stopColor="#FFA208" />
        </LinearGradient>
        <LinearGradient id={`hz-b-${id}`} x1="363" y1="0" x2="960" y2="0" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FF6514" />
          <Stop offset="0.6" stopColor="#FF8E10" />
          <Stop offset="1" stopColor="#FFB40A" />
        </LinearGradient>
        <LinearGradient id={`hz-r-${id}`} x1="450" y1="400" x2="860" y2="1020" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FF8C14" />
          <Stop offset="0.35" stopColor="#FFA010" />
          <Stop offset="1" stopColor="#FFA60C" />
        </LinearGradient>
        <ClipPath id={`hz-c-${id}`}>
          <Path d={GANCHO} />
          {PASTILLAS.map((p, i) => (
            <Rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.h / 2} />
          ))}
        </ClipPath>
      </Defs>
      <G transform={GIRO}>
        <Path d={GANCHO} fill={fill('t')} opacity={mono ? 0.82 : 1} />
        {PASTILLAS.map((p, i) => (
          <Rect
            key={i}
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            rx={p.h / 2}
            fill={fill(i === 0 ? 'm' : 'b')}
            opacity={mono ? 0.82 : 1}
          />
        ))}
        <G clipPath={`url(#hz-c-${id})`} fill={mono ? '#000' : '#A82E00'}>
          {SOMBRA.map((o) => (
            <Path key={o} d={LISTON} transform={`translate(${-o} 2)`} opacity={mono ? 0.035 : 0.07} />
          ))}
        </G>
        <Path d={LISTON} fill={fill('r')} />
      </G>
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
