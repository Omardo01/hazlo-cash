// splash.jsx — Hazlo Cash loading / splash variants
// Renders inside the iOS frame (absolute, fills the device).
// 4 variants: 'glow' | 'reveal' | 'liquid' | 'coins'
// Each is ~2.4s. Calls onDone after the animation completes.

const SPLASH_CSS = `
  @keyframes hzFadeIn { 0% { opacity: 0 } 100% { opacity: 1 } }
  @keyframes hzFadeOut { 0% { opacity: 1 } 100% { opacity: 0 } }
  @keyframes hzScaleIn {
    0%   { transform: scale(0.4); opacity: 0; filter: blur(8px); }
    60%  { transform: scale(1.06); opacity: 1; filter: blur(0); }
    100% { transform: scale(1); }
  }
  @keyframes hzScaleSubtle {
    0%   { transform: scale(0.92); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes hzPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50%      { transform: scale(1.12); opacity: 0.95; }
  }
  @keyframes hzAuraPulse {
    0%   { transform: scale(0.85); opacity: 0; }
    50%  { transform: scale(1.0);  opacity: 0.85; }
    100% { transform: scale(1.3);  opacity: 0; }
  }
  @keyframes hzSlideUp {
    0%   { transform: translateY(14px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes hzWordSpace {
    0%   { letter-spacing: -0.04em; opacity: 0; }
    100% { letter-spacing: 0.32em;  opacity: 1; }
  }
  @keyframes hzProgress {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }
  @keyframes hzDots {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }
  /* Mask-based "wipe up" reveal — works on filled SVG paths */
  @keyframes hzWipeA {
    0%   { clip-path: inset(100% 0 0 0); }
    100% { clip-path: inset(0 0 0 0); }
  }
  @keyframes hzWipeB {
    0%   { clip-path: inset(100% 0 0 0); }
    100% { clip-path: inset(0 0 0 0); }
  }
  .hz-mark-wipe-a { animation: hzWipeA 0.9s 0.1s cubic-bezier(0.7, 0, 0.2, 1) both; }
  .hz-mark-wipe-b { animation: hzWipeB 0.7s 0.55s cubic-bezier(0.7, 0, 0.2, 1) both; }

  @keyframes hzBlobMorph {
    0%, 100% { border-radius: 42% 58% 53% 47% / 47% 42% 58% 53%; transform: rotate(0deg) scale(1); }
    33%      { border-radius: 58% 42% 47% 53% / 53% 58% 42% 47%; transform: rotate(40deg) scale(1.05); }
    66%      { border-radius: 48% 52% 38% 62% / 62% 48% 52% 38%; transform: rotate(-30deg) scale(0.98); }
  }

  @keyframes hzCoinFall {
    0%   { transform: translateY(-80px) rotate(0deg); opacity: 0; }
    15%  { opacity: 1; }
    100% { transform: translateY(900px) rotate(720deg); opacity: 0; }
  }
`;

function SplashScreen({ variant = 'glow', theme, onDone, duration = 2400 }) {
  const { c, dark } = theme;
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), duration - 320);
    const t2 = setTimeout(() => onDone && onDone(), duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration, onDone]);

  // Background per variant
  const bg = (() => {
    if (variant === 'glow' || variant === 'reveal') {
      return dark ? '#0a0908' : '#fff';
    }
    if (variant === 'liquid') {
      return dark
        ? 'radial-gradient(ellipse at center, #1a0e07 0%, #0a0908 70%)'
        : 'radial-gradient(ellipse at center, #FFF6EE 0%, #F5F3F0 70%)';
    }
    if (variant === 'coins') {
      return `linear-gradient(180deg, ${c.primary} 0%, ${c.accent} 100%)`;
    }
  })();

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.32s ease',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <style>{SPLASH_CSS}</style>

      {variant === 'glow' && <SplashGlow theme={theme} />}
      {variant === 'reveal' && <SplashReveal theme={theme} />}
      {variant === 'liquid' && <SplashLiquid theme={theme} />}
      {variant === 'coins' && <SplashCoins theme={theme} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1) GLOW — pulsing aura behind the mark, tagline + dots
// ─────────────────────────────────────────────────────────────
function SplashGlow({ theme }) {
  const { c, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.5)' : 'rgba(13,13,13,0.5)';

  return (
    <>
      {/* logo + aura stack */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* outer aura */}
        <div style={{
          position: 'absolute', width: 280, height: 280, borderRadius: 999,
          background: `radial-gradient(circle, ${c.primary}55 0%, ${c.primary}00 60%)`,
          animation: 'hzAuraPulse 2.2s ease-out infinite',
        }} />
        {/* inner aura */}
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: 999,
          background: `radial-gradient(circle, ${c.primary}88 0%, ${c.primary}00 70%)`,
          animation: 'hzPulse 1.8s ease-in-out infinite',
        }} />
        {/* mark */}
        <div style={{ position: 'relative', animation: 'hzScaleIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
          <HazloMark size={100} primary={c.primary} secondary={c.accent} />
        </div>
      </div>

      {/* wordmark */}
      <div style={{
        marginTop: 36, fontSize: 28, fontWeight: 700, color: fg, letterSpacing: '-0.025em',
        animation: 'hzSlideUp 0.7s 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>
        Hazlo <span style={{ color: c.primary }}>Cash</span>
      </div>
      <div style={{
        marginTop: 8, fontSize: 11, fontWeight: 500, color: muted, letterSpacing: '0.28em', textTransform: 'uppercase',
        animation: 'hzSlideUp 0.7s 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>
        Recomienda · Conecta · Gana
      </div>

      {/* loader dots */}
      <div style={{
        position: 'absolute', bottom: 70, display: 'flex', gap: 8,
        animation: 'hzFadeIn 0.6s 1s both',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 999, background: c.primary,
            animation: `hzDots 1.2s ${i * 0.16}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 2) REVEAL — strokes wipe up in sequence, wordmark slides in
// ─────────────────────────────────────────────────────────────
function SplashReveal({ theme }) {
  const { c, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.45)' : 'rgba(13,13,13,0.45)';
  const baseLine = dark ? 'rgba(255,255,255,0.08)' : 'rgba(13,13,13,0.06)';

  return (
    <>
      {/* subtle horizon line */}
      <div style={{
        position: 'absolute', left: 40, right: 40, top: '52%',
        height: 1, background: baseLine,
        animation: 'hzFadeIn 0.5s both',
      }} />

      {/* mark with wipe animation */}
      <div style={{ position: 'relative', marginBottom: 24, transform: 'translateY(-8px)' }}>
        <HazloMark size={120} primary={c.primary} secondary={c.accent}
                   splitClassA="hz-mark-wipe-a" splitClassB="hz-mark-wipe-b" />
      </div>

      {/* wordmark with letter-spacing animation */}
      <div style={{
        position: 'absolute', top: '60%', textAlign: 'center', width: '100%',
      }}>
        <div style={{
          fontSize: 24, fontWeight: 700, color: fg, letterSpacing: '-0.025em',
          animation: 'hzSlideUp 0.6s 1.05s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}>
          Hazlo <span style={{ color: c.primary }}>Cash</span>
        </div>
        <div style={{
          marginTop: 16, fontSize: 10, fontWeight: 600, color: muted, textTransform: 'uppercase', display: 'inline-block',
          animation: 'hzWordSpace 1.4s 1.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}>
          Recomienda. Conecta. Gana.
        </div>
      </div>

      {/* thin progress bar at bottom */}
      <div style={{
        position: 'absolute', bottom: 80, left: 60, right: 60, height: 2, borderRadius: 999,
        background: baseLine, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: '100%',
          background: `linear-gradient(90deg, ${c.primary}, ${c.accent})`,
          transformOrigin: '0 50%',
          animation: 'hzProgress 2.1s 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }} />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 3) LIQUID — morphing orange blob with glassy logo on top
// ─────────────────────────────────────────────────────────────
function SplashLiquid({ theme }) {
  const { c, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';

  return (
    <>
      {/* morphing blob */}
      <div style={{
        position: 'absolute', width: 320, height: 320,
        background: `linear-gradient(135deg, ${c.primary} 0%, ${c.accent} 100%)`,
        animation: 'hzBlobMorph 6s ease-in-out infinite, hzFadeIn 0.6s both',
        filter: 'blur(2px)',
      }} />
      {/* secondary highlight */}
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), transparent 60%)',
        animation: 'hzFadeIn 0.8s 0.2s both',
        mixBlendMode: 'overlay',
      }} />
      {/* glass card */}
      <div style={{
        position: 'relative', padding: '28px 36px',
        borderRadius: 32,
        background: dark ? 'rgba(20,18,16,0.4)' : 'rgba(255,255,255,0.35)',
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        backdropFilter: 'blur(22px) saturate(180%)',
        border: dark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 20px 60px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        animation: 'hzScaleIn 0.9s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>
        <HazloMark size={72} primary="#fff" secondary="#fff" />
        <div style={{
          fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}>Hazlo Cash</div>
      </div>

      {/* tagline below the blob */}
      <div style={{
        position: 'absolute', bottom: 90, fontSize: 11, fontWeight: 600, color: fg, opacity: 0.7,
        letterSpacing: '0.28em', textTransform: 'uppercase',
        animation: 'hzSlideUp 0.7s 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>Recomienda · Conecta · Gana</div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 4) COINS — full-bleed orange with falling $ pills, logo center
// ─────────────────────────────────────────────────────────────
function SplashCoins({ theme }) {
  const { c, dark } = theme;
  const coins = React.useMemo(() => (
    Array.from({ length: 14 }, (_, i) => ({
      x: Math.random() * 100,
      delay: Math.random() * 2,
      size: 18 + Math.random() * 22,
      dur: 2.6 + Math.random() * 1.2,
      char: Math.random() > 0.55 ? '$' : '★',
    }))
  ), []);

  return (
    <>
      {/* falling coins */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {coins.map((co, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: `${co.x}%`, width: co.size, height: co.size,
            borderRadius: 999, background: 'rgba(255,255,255,0.95)',
            color: c.primary, fontFamily: 'Poppins', fontWeight: 700, fontSize: co.size * 0.55,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18), 0 0 0 2px rgba(255,255,255,0.4) inset',
            animation: `hzCoinFall ${co.dur}s ${co.delay}s linear infinite`,
          }}>{co.char}</div>
        ))}
      </div>

      {/* center vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at center, transparent 0%, ${c.primary}33 70%, ${c.primary}66 100%)`,
      }} />

      {/* logo */}
      <div style={{ position: 'relative', animation: 'hzScaleIn 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
        <div style={{
          padding: 28, borderRadius: 36,
          background: 'rgba(255,255,255,0.18)',
          WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,0.4)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 20px 50px rgba(0,0,0,0.2)',
        }}>
          <HazloMark size={88} primary="#fff" secondary="#fff" />
        </div>
      </div>
      <div style={{
        position: 'relative', marginTop: 22, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
        animation: 'hzSlideUp 0.7s 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        textShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        Hazlo Cash
      </div>
      <div style={{
        position: 'relative', marginTop: 6, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.28em', textTransform: 'uppercase',
        animation: 'hzSlideUp 0.7s 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      }}>
        Recomienda · Conecta · Gana
      </div>
    </>
  );
}

Object.assign(window, { SplashScreen });
