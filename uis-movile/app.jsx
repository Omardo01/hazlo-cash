// app.jsx — Hazlo Cash interactive prototype
// Pulls in Brand, Icons, Screens. Sets up tab navigation, action sheet, withdraw sheet,
// and exposes the Tweaks panel for live design editing.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#FE7801", "#EB4E00", "#0D0D0D"],
  "dark": false,
  "radius": "medium",
  "fontWeight": "regular",
  "glassBlur": 22,
  "logoStyle": "duo",
  "tabStyle": "glass",
  "ctaShape": "rounded",
  "splash": "glow"
}/*EDITMODE-END*/;

const PALETTES = [
  ['#FE7801', '#EB4E00', '#0D0D0D'], // signature (from the SVG)
  ['#FF6A00', '#FFB347', '#0D0D0D'], // mockup naranja
  ['#FFBA00', '#FFD27A', '#0D0D0D'], // amber (etiqueta del brand guide)
  ['#E63946', '#F8A8AE', '#1A1A1A'], // coral
  ['#2A6FDB', '#7BA8EE', '#0F1B2D'], // cobalt
  ['#1F8A5B', '#7ED5A8', '#0E1F18'], // forest
  ['#7A5AE0', '#C2B0F5', '#15102B'], // violet
];

const RADII = {
  small:  { sm: 8,  md: 12, lg: 18 },
  medium: { sm: 12, md: 16, lg: 24 },
  large:  { sm: 16, md: 22, lg: 32 },
};

const FONT_WEIGHTS = {
  light:   { base: 400, bold: 600, hero: 700 },
  regular: { base: 500, bold: 600, hero: 700 },
  heavy:   { base: 500, bold: 700, hero: 800 },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const [sheet, setSheet] = React.useState(null); // 'action' | 'withdraw' | null
  const [splashKey, setSplashKey] = React.useState(1); // bump to replay
  const [showSplash, setShowSplash] = React.useState(true);

  const c = {
    primary: t.palette[0],
    accent:  t.palette[1] || t.palette[0],
    ink:     t.palette[2] || '#0D0D0D',
  };
  const r = RADII[t.radius] || RADII.medium;
  const theme = { c, r, dark: t.dark, glassBlur: t.glassBlur };

  // body bg
  React.useEffect(() => {
    document.body.style.background = t.dark ? '#0a0908' : '#F5F3F0';
    document.body.style.fontWeight = FONT_WEIGHTS[t.fontWeight].base;
  }, [t.dark, t.fontWeight]);

  const renderScreen = () => {
    switch (tab) {
      case 'home':     return <HomeScreen     theme={theme} onNav={setTab} onShare={() => setTab('share')} />;
      case 'discover': return <DiscoverScreen theme={theme} />;
      case 'balance':  return <BalanceScreen  theme={theme} onWithdraw={() => setSheet('withdraw')} />;
      case 'share':    return <ShareScreen    theme={theme} />;
      case 'profile':  return <ProfileScreen  theme={theme} onInvite={() => setSheet('invite')} />;
      default:         return <HomeScreen     theme={theme} onNav={setTab} onShare={() => setTab('share')} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      background: t.dark
        ? 'radial-gradient(ellipse at top, #1a1208 0%, #0a0908 60%)'
        : `radial-gradient(ellipse at top right, ${c.primary}12 0%, #F5F3F0 50%)`,
      fontFamily: 'Poppins, -apple-system, system-ui, sans-serif',
      transition: 'background 0.4s ease',
    }}>
      {/* Header chip - brand & current tab */}
      <div style={{
        position: 'fixed', top: 20, left: 20, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <HazloLogotype size={18} primary={c.primary} secondary={c.accent} fg={t.dark ? '#fff' : '#0D0D0D'} />
      </div>

      {/* Phone */}
      <div style={{ position: 'relative' }}>
        <IOSDevice width={390} height={844} dark={t.dark}>
          <div style={{ position: 'relative', height: '100%' }}>
            <div style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto', overflowX: 'hidden',
              paddingTop: 56,
              scrollbarWidth: 'none',
            }} key={tab}>
              <style>{`div::-webkit-scrollbar{display:none}`}</style>
              {renderScreen()}
            </div>

            {/* Tab bar */}
            <TabBar tab={tab} setTab={setTab} theme={theme} onPlus={() => setSheet('action')} style={t.tabStyle} />

            {/* Sheets */}
            {sheet === 'action' && <ActionSheet theme={theme} onClose={() => setSheet(null)} onNav={(x) => { setTab(x); setSheet(null); }} />}
            {sheet === 'withdraw' && <WithdrawSheet theme={theme} onClose={() => setSheet(null)} ctaShape={t.ctaShape} />}
            {sheet === 'invite' && <InviteSheet theme={theme} onClose={() => setSheet(null)} ctaShape={t.ctaShape} />}

            {/* Splash overlay */}
            {showSplash && (
              <SplashScreen
                key={splashKey}
                variant={t.splash}
                theme={theme}
                onDone={() => setShowSplash(false)}
              />
            )}
          </div>
        </IOSDevice>
      </div>

      <TweaksPanel>
        <TweakSection label="Marca" />
        <TweakColor label="Paleta" value={t.palette}
                    options={PALETTES}
                    onChange={(v) => setTweak('palette', v)} />

        <TweakSection label="Tema" />
        <TweakToggle label="Modo oscuro" value={t.dark}
                     onChange={(v) => setTweak('dark', v)} />
        <TweakRadio label="Radios" value={t.radius}
                    options={['small', 'medium', 'large']}
                    onChange={(v) => setTweak('radius', v)} />
        <TweakRadio label="Peso tipográfico" value={t.fontWeight}
                    options={['light', 'regular', 'heavy']}
                    onChange={(v) => setTweak('fontWeight', v)} />

        <TweakSection label="Liquid Glass" />
        <TweakSlider label="Intensidad del blur" value={t.glassBlur}
                     min={0} max={40} step={2} unit="px"
                     onChange={(v) => setTweak('glassBlur', v)} />
        <TweakRadio label="Tab bar" value={t.tabStyle}
                    options={['glass', 'solid']}
                    onChange={(v) => setTweak('tabStyle', v)} />

        <TweakSection label="Componentes" />
        <TweakRadio label="Forma del CTA" value={t.ctaShape}
                    options={['rounded', 'pill']}
                    onChange={(v) => setTweak('ctaShape', v)} />

        <TweakSection label="Splash / Loading" />
        <TweakRadio label="Variante" value={t.splash}
                    options={['glow', 'reveal', 'liquid', 'coins']}
                    onChange={(v) => { setTweak('splash', v); setShowSplash(true); setSplashKey((k) => k + 1); }} />
        <TweakButton label="▶ Reproducir splash" onClick={() => { setShowSplash(true); setSplashKey((k) => k + 1); }} />
        <TweakButton label="📱 Abrir código + QR" onClick={() => { setTab('profile'); setSheet('invite'); }} />

        <TweakSection label="Navegación" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[['home','Inicio'],['discover','Descubre'],['balance','Balance'],['share','Recomienda'],['profile','Perfil']].map(([k, label]) => (
            <TweakButton key={k} label={label} onClick={() => setTab(k)} active={tab === k} />
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab bar — glass or solid
// ─────────────────────────────────────────────────────────────
function TabBar({ tab, setTab, theme, onPlus, style = 'glass' }) {
  const { c, r, dark, glassBlur } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.5)' : 'rgba(13,13,13,0.45)';

  const tabs = [
    { k: 'home',     label: 'Inicio',    icon: 'home' },
    { k: 'discover', label: 'Descubre',  icon: 'search' },
    { k: 'plus',     label: '',          icon: 'plus', isPlus: true },
    { k: 'balance',  label: 'Actividad', icon: 'activity' },
    { k: 'profile',  label: 'Perfil',    icon: 'user' },
  ];

  const isGlass = style === 'glass';

  return (
    <div style={{
      position: 'absolute', bottom: 26, left: 16, right: 16, zIndex: 30,
      borderRadius: 28,
      background: isGlass
        ? (dark ? 'rgba(20,18,16,0.55)' : 'rgba(255,255,255,0.72)')
        : (dark ? '#15110d' : '#fff'),
      WebkitBackdropFilter: isGlass ? `blur(${glassBlur}px) saturate(180%)` : 'none',
      backdropFilter: isGlass ? `blur(${glassBlur}px) saturate(180%)` : 'none',
      border: isGlass
        ? (dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(255,255,255,0.6)')
        : (dark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.04)'),
      boxShadow: dark
        ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.5)'
        : '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 28px rgba(0,0,0,0.08)',
      padding: '8px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {tabs.map((tb) => {
        if (tb.isPlus) {
          return (
            <button key={tb.k} onClick={onPlus} style={{
              width: 48, height: 48, borderRadius: 999, border: 0, cursor: 'default',
              background: c.primary, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px -2px ${c.primary}cc, 0 0 0 4px ${dark ? 'rgba(20,18,16,0.6)' : 'rgba(255,255,255,0.7)'}`,
              transform: 'translateY(-12px)',
            }}>
              <Icons.plus size={22} stroke="#fff" sw={2.4} />
            </button>
          );
        }
        const active = tab === tb.k;
        return (
          <button key={tb.k} onClick={() => setTab(tb.k)} style={{
            flex: 1, height: 48, borderRadius: 18, border: 0, cursor: 'default',
            background: 'transparent',
            color: active ? c.primary : muted,
            fontFamily: 'inherit', fontSize: 9.5, fontWeight: 600,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            {Icons[tb.icon]({ size: 22, stroke: active ? c.primary : muted, sw: active ? 2.2 : 1.8 })}
            {tb.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Action sheet — fired by + button
// ─────────────────────────────────────────────────────────────
function ActionSheet({ theme, onClose, onNav }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';

  const actions = [
    { t: 'Nueva recomendación', d: 'Comparte un lugar o producto', icon: 'send', to: 'share' },
    { t: 'Escanear QR',         d: 'Reclama una recomendación',    icon: 'qr',   to: 'discover' },
    { t: 'Invitar amigos',      d: 'Comparte tu link personal',    icon: 'gift', to: 'share' },
    { t: 'Retirar dinero',      d: 'Transfiere a tu cuenta',       icon: 'wallet', to: 'balance' },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.4)',
      WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadein 0.2s ease',
    }}>
      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideup { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: dark ? '#15110d' : '#fff',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '12px 20px 96px',
        width: '100%',
        animation: 'slideup 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{ width: 36, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)', margin: '0 auto 18px' }} />
        <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Acciones rápidas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {actions.map((a) => (
            <button key={a.t} onClick={() => onNav(a.to)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: r.md,
              background: 'transparent', border: 0, cursor: 'default', textAlign: 'left',
              fontFamily: 'inherit', color: fg,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${c.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons[a.icon]({ size: 20, stroke: c.primary })}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.t}</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 1 }}>{a.d}</div>
              </div>
              <Icons.chevR size={16} stroke={muted} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Withdraw sheet
// ─────────────────────────────────────────────────────────────
function WithdrawSheet({ theme, onClose, ctaShape }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';
  const [amt, setAmt] = React.useState('100.00');
  const [stage, setStage] = React.useState('amount'); // amount | success

  const ctaRadius = ctaShape === 'pill' ? 999 : r.md;
  const presets = ['25', '50', '100', '245.80'];

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.45)',
      WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadein 0.2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: dark ? '#15110d' : '#fff',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '12px 20px 96px',
        width: '100%',
        animation: 'slideup 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{ width: 36, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)', margin: '0 auto 18px' }} />

        {stage === 'amount' ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: fg, letterSpacing: '-0.02em', marginBottom: 4 }}>Retirar dinero</div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 22 }}>A tu cuenta BBVA •• 4421</div>

            <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
              <div style={{ fontSize: 12, color: muted, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Cantidad</div>
              <div style={{ fontSize: 56, fontWeight: 700, color: fg, letterSpacing: '-0.04em', marginTop: 4, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                <span style={{ color: muted, fontSize: 32 }}>$</span>{amt}
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>Disponible: $245.80</div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '18px 0' }}>
              {presets.map((p) => (
                <button key={p} onClick={() => setAmt(parseFloat(p).toFixed(2))} style={{
                  height: 34, padding: '0 14px', borderRadius: 999,
                  border: amt === parseFloat(p).toFixed(2) ? 0 : `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                  background: amt === parseFloat(p).toFixed(2) ? c.primary : 'transparent',
                  color: amt === parseFloat(p).toFixed(2) ? '#fff' : fg,
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'default',
                }}>${p === '245.80' ? 'Todo' : p}</button>
              ))}
            </div>

            <button onClick={() => setStage('success')} style={{
              width: '100%', height: 52, borderRadius: ctaRadius, border: 0, cursor: 'default',
              background: c.primary, color: '#fff',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 15,
              marginTop: 6, boxShadow: `0 10px 24px -8px ${c.primary}`,
            }}>Retirar ${amt}</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 999, margin: '0 auto 18px',
              background: `${c.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.check size={36} stroke={c.primary} sw={2.4} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: fg, letterSpacing: '-0.02em' }}>¡Retiro enviado!</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 6, lineHeight: 1.5 }}>
              ${amt} llegarán a tu cuenta<br/>en 1–2 días hábiles.
            </div>
            <button onClick={onClose} style={{
              marginTop: 24, width: '100%', height: 52, borderRadius: ctaRadius, border: 0, cursor: 'default',
              background: c.primary, color: '#fff',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 15,
            }}>Listo</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { App, TabBar, ActionSheet, WithdrawSheet });

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
