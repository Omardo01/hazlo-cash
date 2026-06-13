// brand.jsx — Hazlo Cash logo, icons, placeholders

// ── Logo: official Hazlo Cash mark (2 strokes, gradient)
let __hzId = 0;
function HazloMark({ size = 32, primary = '#FE7801', secondary = '#EB4E00', style = {}, splitClassA, splitClassB }) {
  const id = React.useMemo(() => ++__hzId, []);
  const h = size;
  const w = size * (253 / 208);
  return (
    <svg width={w} height={h} viewBox="0 0 253 208" style={{ display: 'block', overflow: 'visible', ...style }} aria-label="Hazlo Cash">
      <defs>
        <linearGradient id={`hz-a-${id}`} x1="143.5" y1="0" x2="88.5" y2="207.5" gradientUnits="userSpaceOnUse">
          <stop stopColor={primary} />
          <stop offset="0.73" stopColor={secondary} />
        </linearGradient>
        <linearGradient id={`hz-b-${id}`} x1="228" y1="207" x2="232" y2="3.5" gradientUnits="userSpaceOnUse">
          <stop stopColor={primary} />
          <stop offset="1" stopColor={secondary} />
        </linearGradient>
      </defs>
      <path
        className={splitClassA}
        d="M122.287 0.378C138.481-0.421 160.634 0.286 177.075 0.348L177.038 207.333C160.524 207.266 142.89 207.707 126.595 207.284C125.303 160.83 127.376 112.691 126.264 66.196C126.221 64.419 124.053 63.585 122.821 64.865C107.434 80.851 90.49 97.456 74.965 113.308C70.208 118.102 65.148 123.051 60.517 128.082C58.678 130.079 58.496 133.078 60.059 135.298C68.379 147.114 78.219 158.992 86.766 171.03C88.976 174.143 88.553 178.377 85.874 181.097C77.466 189.635 69.218 198.33 61.134 207.176C53.611 198.565 40.331 179.638 32.793 169.93C27.595 163.237 8.547 138.914 1.946 128.543C0.636 126.484 0.83 123.905 2.403 122.039C6.135 117.611 11.745 112.13 15.17 108.607L40.193 82.911L87.315 34.776C94.398 27.5 115.51 4.237 122.287 0.378Z"
        fill={`url(#hz-a-${id})`}
      />
      <path
        className={splitClassB}
        d="M202.705 0.294C219.158 0.203 235.61 0.211 252.057 0.318C252.706 21.467 252.149 44.481 252.137 65.777L252.143 207.455C247.52 207.364 243.025 207.299 238.458 206.852C215.729 204.632 201.934 184.317 202.724 162.422C202.852 158.737 202.699 154.355 202.699 150.563L202.693 119.816L202.705 0.294Z"
        fill={`url(#hz-b-${id})`}
      />
    </svg>
  );
}

function HazloLogotype({ size = 28, primary = '#FF6A00', secondary = '#FFB347', mono = false, fg = '#0D0D0D' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28 }}>
      <HazloMark size={size * 1.1} primary={mono ? fg : primary} secondary={mono ? fg : secondary} />
      <span style={{
        fontFamily: 'Poppins, system-ui, sans-serif',
        fontSize: size, fontWeight: 700, letterSpacing: '-0.02em', color: fg, lineHeight: 1,
      }}>
        Hazlo <span style={{ color: mono ? fg : primary }}>Cash</span>
      </span>
    </div>
  );
}

// ── Striped placeholder for imagery — keep things honest, no SVG illustrations
function Placeholder({ label, height = 120, radius = 18, tone = '#E8EAF0' }) {
  return (
    <div style={{
      height, borderRadius: radius, overflow: 'hidden', position: 'relative',
      background: `repeating-linear-gradient(135deg, ${tone} 0 10px, color-mix(in srgb, ${tone} 88%, #000) 10px 11px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 11, color: 'rgba(0,0,0,0.45)', letterSpacing: '0.04em',
    }}>
      <span style={{ background: '#fff', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.06)' }}>{label}</span>
    </div>
  );
}

// ── Photo placeholder using gradient + emoji-free composition
function FoodTile({ name, type, rating, height = 140, radius = 20, hue = 28 }) {
  return (
    <div style={{
      height, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg,
        oklch(0.72 0.12 ${hue}) 0%,
        oklch(0.55 0.14 ${hue + 8}) 60%,
        oklch(0.34 0.10 ${hue - 12}) 100%)`,
    }}>
      {/* subtle texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35), transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(0,0,0,0.25), transparent 60%)',
      }} />
      {name && (
        <div style={{
          position: 'absolute', left: 12, right: 12, bottom: 10, color: '#fff',
          fontFamily: 'Poppins, sans-serif',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.15 }}>{name}</div>
          <div style={{ fontSize: 11, opacity: 0.85, display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <span>{type}</span>
            {rating && <><span>·</span><span>★ {rating}</span></>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Icon set — outline style matching the brand guide
function I({ d, size = 22, stroke = 'currentColor', fill = 'none', sw = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      {d}
    </svg>
  );
}

const Icons = {
  home: (p) => <I {...p} d={<><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></>} />,
  search: (p) => <I {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>} />,
  plus: (p) => <I {...p} d={<><path d="M12 5v14M5 12h14" /></>} sw={2.2} />,
  activity: (p) => <I {...p} d={<><path d="M3 17l5-6 4 4 5-8 4 7" /></>} />,
  user: (p) => <I {...p} d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></>} />,
  heart: (p) => <I {...p} d={<><path d="M12 21s-7-4.5-9-9.5C1.5 7.5 5 4 8 5c2 0.7 3.2 2.2 4 3.5C12.8 7.2 14 5.7 16 5c3-1 6.5 2.5 5 6.5-2 5-9 9.5-9 9.5z" /></>} />,
  share: (p) => <I {...p} d={<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" /></>} />,
  bell: (p) => <I {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></>} />,
  gift: (p) => <I {...p} d={<><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 13h18" /><path d="M12 8s-3-4-5-2 1 4 5 2zM12 8s3-4 5-2-1 4-5 2z" /></>} />,
  dollar: (p) => <I {...p} d={<><path d="M12 3v18" /><path d="M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H8" /></>} />,
  chart: (p) => <I {...p} d={<><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></>} />,
  send: (p) => <I {...p} d={<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>} />,
  star: (p) => <I {...p} d={<><path d="M12 3l2.7 5.7 6.3 0.9-4.6 4.4 1.1 6.3L12 17.3 6.5 20.3l1.1-6.3L3 9.6l6.3-0.9z" /></>} />,
  bookmark: (p) => <I {...p} d={<><path d="M6 3h12v18l-6-4-6 4z" /></>} />,
  shareNode: (p) => <I {...p} d={<><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" /></>} />,
  wallet: (p) => <I {...p} d={<><rect x="2.5" y="6" width="19" height="13" rx="3" /><path d="M16 13h3" /><path d="M5 6V5a2 2 0 0 1 2-2h9l1 3" /></>} />,
  menu: (p) => <I {...p} d={<><path d="M4 7h16M4 12h16M4 17h16" /></>} />,
  check: (p) => <I {...p} d={<><path d="M5 12l4.5 4.5L19 7" /></>} sw={2.2} />,
  chevR: (p) => <I {...p} d={<><path d="M9 6l6 6-6 6" /></>} />,
  copy: (p) => <I {...p} d={<><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>} />,
  qr: (p) => <I {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3M20 14v3M14 17v4M17 20h4" /></>} />,
  arrowUp: (p) => <I {...p} d={<><path d="M12 19V5M5 12l7-7 7 7" /></>} />,
  arrowDown: (p) => <I {...p} d={<><path d="M12 5v14M5 12l7 7 7-7" /></>} />,
  settings: (p) => <I {...p} d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>} />,
};

Object.assign(window, { HazloMark, HazloLogotype, Placeholder, FoodTile, Icons });
