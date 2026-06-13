// screens.jsx — Hazlo Cash app screens
// Reads theme from props passed by App: { c (colors), r (radii), font, glass }

// ── Glass utility — a translucent surface with backdrop blur
function Glass({ children, style = {}, blur = 18, dark = false, tint = 0.78 }) {
  return (
    <div style={{
      background: dark ? `rgba(20,18,16,${tint})` : `rgba(255,255,255,${tint})`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
      backdropFilter: `blur(${blur}px) saturate(160%)`,
      border: dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(255,255,255,0.7)',
      boxShadow: dark
        ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 32px rgba(0,0,0,0.35)'
        : '0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 24px rgba(0,0,0,0.06)',
      ...style,
    }}>{children}</div>
  );
}

// ── Section header
function SectionHeader({ title, action, dark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '0 4px', marginBottom: 10,
    }}>
      <h3 style={{
        margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em',
        color: dark ? '#fff' : '#0D0D0D',
      }}>{title}</h3>
      {action && <button style={{
        background: 'none', border: 0, padding: 0, fontSize: 13, fontWeight: 500,
        color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
        fontFamily: 'inherit', cursor: 'default',
      }}>{action}</button>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME (Inicio) — quick balance + featured + popular
// ─────────────────────────────────────────────────────────────
function HomeScreen({ theme, onNav, onShare }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';

  return (
    <div style={{ padding: '4px 20px 120px', color: fg }}>
      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, color: muted, fontWeight: 500 }}>Hola, Javier</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>¿Qué recomiendas hoy?</div>
        </div>
        <Glass dark={dark} style={{ width: 40, height: 40, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.bell size={19} stroke={fg} />
        </Glass>
      </div>

      {/* Hero balance card */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: r.lg, padding: 20, marginBottom: 22,
        background: `linear-gradient(135deg, ${c.primary} 0%, ${c.accent} 100%)`,
        boxShadow: `0 18px 40px -16px ${c.primary}80`,
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.18 }}>
          <HazloMark size={180} primary="#fff" secondary="#fff" />
        </div>
        <div style={{ position: 'relative', color: '#fff' }}>
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Tu saldo</div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 2, lineHeight: 1 }}>$245.80</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.arrowUp size={13} stroke="#fff" sw={2.4} /> +$120.50 este mes
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button onClick={() => onNav('balance')} style={{
              flex: 1, height: 40, borderRadius: r.md, border: 0, cursor: 'default',
              background: 'rgba(255,255,255,0.95)', color: c.primary,
              fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
            }}>Retirar dinero</button>
            <button onClick={onShare} style={{
              flex: 1, height: 40, borderRadius: r.md, border: '1px solid rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'default',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
              backdropFilter: 'blur(8px)',
            }}>Recomendar</button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 26 }}>
        {[
          { v: '23', l: 'Recomendaciones', icon: 'send' },
          { v: '12', l: 'Amigos activos', icon: 'user' },
          { v: '4.9', l: 'Rating', icon: 'star' },
        ].map((s) => (
          <Glass key={s.l} dark={dark} style={{ padding: 12, borderRadius: r.md }}>
            <div style={{ color: c.primary, marginBottom: 6 }}>{Icons[s.icon]({ size: 18, stroke: c.primary })}</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: fg }}>{s.v}</div>
            <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>{s.l}</div>
          </Glass>
        ))}
      </div>

      {/* Featured recommendation */}
      <SectionHeader title="Recomendación destacada" action="Ver todo" dark={dark} />
      <div style={{
        borderRadius: r.lg, overflow: 'hidden', marginBottom: 22,
        background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
        boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
        border: dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.04)',
      }}>
        <FoodTile name="" type="" height={150} radius={0} hue={28} />
        <div style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: fg, letterSpacing: '-0.01em' }}>Café Central</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Cafetería · $$</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.primary, fontSize: 13, fontWeight: 600 }}>
              <Icons.star size={14} stroke={c.primary} fill={c.primary} sw={1} /> 4.8
            </div>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>P</div>
              <span style={{ fontSize: 12, color: muted }}>Recomendado por <span style={{ color: fg, fontWeight: 500 }}>@pame_co</span></span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: c.primary, background: `${c.primary}15`, padding: '4px 8px', borderRadius: 999 }}>+$5.20</span>
          </div>
        </div>
      </div>

      {/* Popular */}
      <SectionHeader title="Popular esta semana" action="Ver más" dark={dark} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { name: 'La Terraza', type: 'Comida', rating: '4.7', hue: 22 },
          { name: 'Brew House', type: 'Café', rating: '4.9', hue: 35 },
          { name: 'Sushi Kō', type: 'Japonés', rating: '4.6', hue: 12 },
          { name: 'Verde Bistró', type: 'Saludable', rating: '4.8', hue: 130 },
        ].map((t) => (
          <FoodTile key={t.name} {...t} radius={r.md} height={150} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DESCUBRE — search + categories + feed
// ─────────────────────────────────────────────────────────────
function DiscoverScreen({ theme }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';
  const [cat, setCat] = React.useState('Todo');
  const cats = ['Todo', 'Comida', 'Café', 'Viajes', 'Estilo de vida', 'Servicios'];

  return (
    <div style={{ padding: '4px 20px 120px', color: fg }}>
      <h1 style={{ margin: '0 0 14px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }}>Descubre</h1>

      {/* Search */}
      <Glass dark={dark} style={{ borderRadius: r.md, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Icons.search size={18} stroke={muted} />
        <input placeholder="Buscar lugares, productos, personas..." style={{
          flex: 1, border: 0, background: 'transparent', outline: 'none',
          fontFamily: 'inherit', fontSize: 13, color: fg,
        }} />
      </Glass>

      {/* Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 18, padding: '2px 0' }}>
        {cats.map((cc) => {
          const active = cat === cc;
          return (
            <button key={cc} onClick={() => setCat(cc)} style={{
              flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 999,
              border: active ? 0 : `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`,
              background: active ? c.primary : (dark ? 'rgba(255,255,255,0.05)' : '#fff'),
              color: active ? '#fff' : fg,
              fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'default',
              transition: 'all 0.2s',
            }}>{cc}</button>
          );
        })}
      </div>

      {/* Trending top */}
      <SectionHeader title="Tendencias" dark={dark} />
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', marginBottom: 22, paddingBottom: 4 }}>
        {[
          { name: 'Café Central', type: 'Cafetería · 5.5km', rating: '4.8', hue: 28 },
          { name: 'Brew House', type: 'Café · 3.1km', rating: '4.9', hue: 35 },
          { name: 'Tacos del Rey', type: 'Mexicano', rating: '4.7', hue: 18 },
        ].map((t) => (
          <div key={t.name} style={{ flexShrink: 0, width: 200 }}>
            <FoodTile {...t} radius={r.md} height={180} />
          </div>
        ))}
      </div>

      {/* Feed */}
      <SectionHeader title="Recomendaciones cercanas" dark={dark} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { who: 'María', handle: '@mariarz', what: 'La Terraza', type: 'Comida · $$', rating: '4.7', reward: '+$3.20', hue: 22 },
          { who: 'Carlos', handle: '@carlosm', what: 'Verde Bistró', type: 'Saludable · $', rating: '4.8', reward: '+$2.50', hue: 130 },
          { who: 'Andrea', handle: '@andreav', what: 'Sushi Kō', type: 'Japonés · $$$', rating: '4.6', reward: '+$5.80', hue: 12 },
        ].map((f) => (
          <div key={f.what} style={{
            display: 'flex', gap: 12, padding: 10, borderRadius: r.md,
            background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
            border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{ width: 72, height: 72, flexShrink: 0 }}>
              <FoodTile hue={f.hue} radius={14} height={72} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: muted }}>
                <div style={{ width: 16, height: 16, borderRadius: 999, background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
                <span><b style={{ color: fg, fontWeight: 600 }}>{f.who}</b> recomienda</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: fg, marginTop: 4, letterSpacing: '-0.01em' }}>{f.what}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>{f.type} · ★ {f.rating}</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: c.primary, background: `${c.primary}18`, padding: '3px 7px', borderRadius: 999 }}>{f.reward}</span>
                <span style={{ fontSize: 10, color: muted }}>al probarlo</span>
              </div>
            </div>
            <button style={{
              alignSelf: 'flex-start', border: 0, background: 'transparent', cursor: 'default', padding: 4,
            }}><Icons.bookmark size={18} stroke={muted} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BALANCE — central wallet
// ─────────────────────────────────────────────────────────────
function BalanceScreen({ theme, onWithdraw }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';

  const tx = [
    { kind: 'Recomendación', when: 'Hoy', amt: '+$5.20', icon: 'send', from: '@pame_co recomendó Café Central' },
    { kind: 'Recomendación', when: 'Ayer', amt: '+$3.10', icon: 'send', from: '@luism probó La Terraza' },
    { kind: 'Retiro', when: '11 May', amt: '-$20.00', icon: 'arrowDown', from: 'A cuenta BBVA •• 4421', negative: true },
    { kind: 'Recomendación', when: '11 May', amt: '+$2.50', icon: 'send', from: '@andreav probó Verde Bistró' },
    { kind: 'Bono mensual', when: '01 May', amt: '+$10.00', icon: 'gift', from: 'Recompensa por 20 recomendaciones' },
    { kind: 'Recomendación', when: '28 Abr', amt: '+$4.40', icon: 'send', from: '@danir probó Brew House' },
  ];

  return (
    <div style={{ padding: '4px 20px 120px', color: fg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Balance</h1>
        <Glass dark={dark} style={{ width: 38, height: 38, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.user size={18} stroke={fg} />
        </Glass>
      </div>

      {/* Balance hero */}
      <div style={{ textAlign: 'left', padding: '8px 0 14px' }}>
        <div style={{ fontSize: 13, color: muted, fontWeight: 500 }}>Tu saldo disponible</div>
        <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 4, color: fg, fontVariantNumeric: 'tabular-nums' }}>
          $245<span style={{ fontSize: 30, opacity: 0.6 }}>.80</span>
        </div>
        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 6px', borderRadius: 999, background: `${c.primary}15`, color: c.primary, fontSize: 12, fontWeight: 600 }}>
          <Icons.arrowUp size={13} stroke={c.primary} sw={2.4} /> +$120.50 este mes
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, marginBottom: 22 }}>
        <button onClick={onWithdraw} style={{
          height: 48, borderRadius: r.md, border: 0, cursor: 'default',
          background: c.primary, color: '#fff',
          fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 8px 20px -8px ${c.primary}`,
        }}><Icons.arrowDown size={17} stroke="#fff" /> Retirar</button>
        <button style={{
          height: 48, borderRadius: r.md, cursor: 'default',
          background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
          color: fg,
          border: dark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.06)',
          fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}><Icons.chart size={17} stroke={fg} /> Reporte</button>
      </div>

      {/* Mini chart */}
      <div style={{
        borderRadius: r.md, padding: 16, marginBottom: 22,
        background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
        border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: muted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ganancias · 7 días</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>+$28.40</div>
          </div>
          <div style={{ fontSize: 11, color: c.primary, fontWeight: 600 }}>+18%</div>
        </div>
        <Sparkline color={c.primary} />
      </div>

      {/* Activity */}
      <SectionHeader title="Actividad reciente" action="Ver todo" dark={dark} />
      <div style={{
        borderRadius: r.md, overflow: 'hidden',
        background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
        border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)',
      }}>
        {tx.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderBottom: i < tx.length - 1 ? `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: t.negative ? (dark ? 'rgba(255,255,255,0.08)' : '#F2F4F7') : `${c.primary}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{Icons[t.icon]({ size: 17, stroke: t.negative ? muted : c.primary })}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: fg }}>{t.kind}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.negative ? fg : c.primary, fontVariantNumeric: 'tabular-nums' }}>{t.amt}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                <div style={{ fontSize: 11, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>{t.from}</div>
                <div style={{ fontSize: 11, color: muted, flexShrink: 0 }}>{t.when}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ color }) {
  const points = [22, 18, 28, 24, 36, 30, 44];
  const max = Math.max(...points);
  const w = 320, h = 70;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - (p / max) * h}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 70, display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkfill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => i === points.length - 1 && (
        <circle key={i} cx={i * step} cy={h - (p / max) * h} r="4" fill={color} />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARE — referral / link
// ─────────────────────────────────────────────────────────────
function ShareScreen({ theme }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';
  const [copied, setCopied] = React.useState(false);
  const link = 'hazlocash.com/javierp';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const steps = [
    { t: 'Recomienda', d: 'Comparte tu link con tus amigos.', icon: 'send' },
    { t: 'Ellos prueban', d: 'Usan tu recomendación en algo que les guste.', icon: 'heart' },
    { t: 'Tú ganas', d: 'Recibes dinero real en tu balance.', icon: 'dollar' },
  ];

  return (
    <div style={{ padding: '4px 20px 120px', color: fg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Recomienda</h1>
        <Glass dark={dark} style={{ width: 38, height: 38, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.qr size={18} stroke={fg} />
        </Glass>
      </div>

      {/* Hero share card */}
      <div style={{
        borderRadius: r.lg, padding: 22, marginBottom: 22,
        background: dark ? '#1a1410' : '#0D0D0D',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.5 }}>
          <HazloMark size={220} primary={c.primary} secondary={c.accent} />
        </div>
        <div style={{ position: 'relative', color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tu link</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1.15 }}>
            Comparte lo<br/>que te gusta.
          </div>
          <div style={{ marginTop: 18, padding: '10px 12px', borderRadius: r.sm, background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icons.share size={15} stroke="rgba(255,255,255,0.8)" />
            <span style={{ flex: 1, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</span>
            <button onClick={handleCopy} style={{
              border: 0, background: 'transparent', color: c.primary, padding: 4, cursor: 'default',
              display: 'flex', alignItems: 'center',
            }}>{copied ? <Icons.check size={17} stroke={c.primary} /> : <Icons.copy size={16} stroke={c.primary} />}</button>
          </div>
          <button onClick={handleCopy} style={{
            width: '100%', height: 46, borderRadius: r.md, marginTop: 12, border: 0, cursor: 'default',
            background: c.primary, color: '#fff',
            fontFamily: 'inherit', fontWeight: 600, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}><Icons.share size={17} stroke="#fff" /> Compartir</button>
        </div>
      </div>

      {/* Earnings overview */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22,
      }}>
        <div style={{ padding: 14, borderRadius: r.md, background: dark ? 'rgba(255,255,255,0.04)' : '#fff', border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 11, color: muted, fontWeight: 500 }}>Por recomendación</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.primary, letterSpacing: '-0.02em', marginTop: 2 }}>$2.50 <span style={{ fontSize: 12, color: muted, fontWeight: 500 }}>– $8</span></div>
        </div>
        <div style={{ padding: 14, borderRadius: r.md, background: dark ? 'rgba(255,255,255,0.04)' : '#fff', border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 11, color: muted, fontWeight: 500 }}>Total ganado</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: fg, letterSpacing: '-0.02em', marginTop: 2 }}>$487.30</div>
        </div>
      </div>

      {/* How it works */}
      <SectionHeader title="Cómo funciona" dark={dark} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={s.t} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14, borderRadius: r.md,
            background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
            border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 999,
              background: `${c.primary}15`, color: c.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontFamily: 'Poppins', fontWeight: 700, fontSize: 14,
              position: 'relative',
            }}>
              {Icons[s.icon]({ size: 18, stroke: c.primary })}
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 999, background: c.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: fg, letterSpacing: '-0.01em' }}>{s.t}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2, lineHeight: 1.4 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Share channels */}
      <div style={{ marginTop: 22 }}>
        <SectionHeader title="Compartir por" dark={dark} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {['WhatsApp', 'Instagram', 'X', 'TikTok'].map((ch) => (
            <button key={ch} style={{
              padding: '12px 6px', borderRadius: r.md, border: 0, cursor: 'default',
              background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
              boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
              fontFamily: 'inherit', fontSize: 11, fontWeight: 500, color: fg,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${c.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.primary }}>
                <Icons.share size={16} stroke={c.primary} />
              </div>
              {ch}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────
function ProfileScreen({ theme, onInvite }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';

  const settings = [
    { t: 'Cuenta y verificación', icon: 'user' },
    { t: 'Métodos de pago', icon: 'wallet' },
    { t: 'Notificaciones', icon: 'bell' },
    { t: 'Privacidad', icon: 'settings' },
    { t: 'Programa de embajadores', icon: 'gift', badge: 'Nuevo' },
  ];

  return (
    <div style={{ padding: '4px 20px 120px', color: fg }}>
      <h1 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Perfil</h1>

      {/* Profile card */}
      <div style={{
        borderRadius: r.lg, padding: 20, marginBottom: 14,
        background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
        border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 999,
          background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'Poppins', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em',
        }}>JP</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Javier Pérez</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 1 }}>@javierp</div>
          <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: `${c.primary}15`, color: c.primary, fontSize: 11, fontWeight: 600 }}>
            <Icons.star size={11} stroke={c.primary} fill={c.primary} sw={1} /> Embajador nivel 2
          </div>
        </div>
      </div>

      {/* Invite CTA — animated code + QR */}
      <button onClick={onInvite} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 16,
        borderRadius: r.lg, marginBottom: 22, cursor: 'default',
        background: dark ? '#1a1410' : '#0D0D0D',
        border: 0, textAlign: 'left', color: '#fff',
        fontFamily: 'inherit',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -10, opacity: 0.7 }}>
          <HazloMark size={90} primary={c.primary} secondary={c.accent} />
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '0.5px solid rgba(255,255,255,0.15)',
        }}>
          <Icons.qr size={22} stroke="#fff" />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Mi código de invitación</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
            Genera tu QR y gana <span style={{ color: c.primary, fontWeight: 600 }}>$5</span> por amigo
          </div>
        </div>
        <Icons.chevR size={16} stroke="rgba(255,255,255,0.5)" />
      </button>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
        {[
          { v: '23', l: 'Recos' }, { v: '12', l: 'Amigos' }, { v: '$487', l: 'Total' },
        ].map((s) => (
          <div key={s.l} style={{
            padding: '12px 10px', borderRadius: r.md, textAlign: 'center',
            background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
            border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.v}</div>
            <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <SectionHeader title="Ajustes" dark={dark} />
      <div style={{
        borderRadius: r.md, overflow: 'hidden',
        background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
        border: dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.05)',
      }}>
        {settings.map((s, i) => (
          <div key={s.t} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px',
            borderBottom: i < settings.length - 1 ? `0.5px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${c.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {Icons[s.icon]({ size: 16, stroke: c.primary })}
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: fg }}>{s.t}</div>
            {s.badge && <span style={{ fontSize: 10, fontWeight: 600, color: c.primary, background: `${c.primary}18`, padding: '3px 7px', borderRadius: 999 }}>{s.badge}</span>}
            <Icons.chevR size={16} stroke={muted} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: muted }}>
        Hazlo Cash · v2.4.1
      </div>
    </div>
  );
}

Object.assign(window, { Glass, SectionHeader, HomeScreen, DiscoverScreen, BalanceScreen, ShareScreen, ProfileScreen, Sparkline });
