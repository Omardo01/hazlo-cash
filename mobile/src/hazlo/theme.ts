// Tema Hazlo Cash — valores exactos del prototipo uis-movile (TWEAK_DEFAULTS)
// palette ["#FE7801","#EB4E00","#0D0D0D"], radius "medium", fontWeight "regular"

export const C = {
  primary: '#FE7801',
  accent: '#EB4E00',
  ink: '#0D0D0D',
} as const;

// radius "medium"
export const R = { sm: 12, md: 16, lg: 24 } as const;

// Modo claro (dark=false en el prototipo)
export const BG = '#F5F3F0';
export const FG = '#0D0D0D';
export const MUTED = 'rgba(13,13,13,0.55)';
export const HAIRLINE = 'rgba(0,0,0,0.05)';
export const CARD = '#fff';

// Poppins (fontWeight "regular": base 500, bold 600, hero 700)
export const F = {
  base: 'Poppins_500Medium',
  reg: 'Poppins_400Regular',
  semi: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

// color con alfa hex corto: `${C.primary}15` → primario al ~8%
export const alpha = (hex: string, a: string) => `${hex}${a}`;
