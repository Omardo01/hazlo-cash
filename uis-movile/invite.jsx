// invite.jsx — Animated code + QR generation sheet
// Triggered from the Profile screen. Phases:
//   1) Code scramble — chars cycle then lock one by one (~1.0s)
//   2) QR build — cells appear in a diagonal wave from top-left (~0.9s)
//   3) CTAs fade in
// Tap "Regenerar" to replay the full sequence.

const INVITE_CSS = `
  @keyframes inviteFadeIn { 0% { opacity: 0; transform: translateY(6px) } 100% { opacity: 1; transform: translateY(0) } }
  @keyframes inviteCellPop {
    0% { opacity: 0; transform: scale(0.2); }
    60% { transform: scale(1.15); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes inviteFinderPop {
    0% { opacity: 0; transform: scale(0.5) rotate(-6deg); }
    100% { opacity: 1; transform: scale(1) rotate(0); }
  }
  @keyframes inviteScanLine {
    0%   { transform: translateY(-100%); opacity: 0; }
    20%  { opacity: 1; }
    80%  { opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes inviteShimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes inviteCharFlip {
    0%   { transform: translateY(0); }
    50%  { transform: translateY(-100%); opacity: 0.4; }
    100% { transform: translateY(0); }
  }
`;

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
const FINAL_CODE = 'JAVI-2K4N';

// ── Deterministic QR-like pattern (not a real QR, just looks like one)
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildQR(seed, size = 25) {
  const rng = mulberry32(seed);
  const g = Array.from({ length: size }, () => Array(size).fill(null)); // null = data; true/false = fixed

  // 3 finder patterns (7x7)
  const finder = (rr, cc) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const inside = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        const ring = i === 0 || i === 6 || j === 0 || j === 6;
        g[rr + i][cc + j] = (ring || inside) ? 'F' : 'B'; // F = filled, B = empty but reserved
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  // Quiet zones around finders
  for (let i = 0; i < 8; i++) {
    if (g[7][i] == null) g[7][i] = 'B';
    if (g[i][7] == null) g[i][7] = 'B';
    if (g[7][size - 1 - i] == null) g[7][size - 1 - i] = 'B';
    if (g[i][size - 8] == null) g[i][size - 8] = 'B';
    if (g[size - 8][i] == null) g[size - 8][i] = 'B';
    if (g[size - 1 - i][7] == null) g[size - 1 - i][7] = 'B';
  }

  // Alignment pattern (5x5) bottom-right
  const align = (rr, cc) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const ring = i === 0 || i === 4 || j === 0 || j === 4;
        const center = i === 2 && j === 2;
        g[rr + i][cc + j] = (ring || center) ? 'F' : 'B';
      }
    }
  };
  align(size - 9, size - 9);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (g[6][i] == null) g[6][i] = i % 2 === 0 ? 'F' : 'B';
    if (g[i][6] == null) g[i][6] = i % 2 === 0 ? 'F' : 'B';
  }

  // Fill remaining data cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (g[r][c] == null) {
        g[r][c] = rng() > 0.5 ? 'D' : 'B';
      }
    }
  }
  return g;
}

function InviteSheet({ theme, onClose, ctaShape }) {
  const { c, r, dark } = theme;
  const fg = dark ? '#fff' : '#0D0D0D';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,13,13,0.55)';
  const ctaRadius = ctaShape === 'pill' ? 999 : r.md;

  const [genKey, setGenKey] = React.useState(0); // regenerate trigger
  const [phase, setPhase] = React.useState(0);   // 0=code, 1=qr, 2=done
  const [chars, setChars] = React.useState(Array(FINAL_CODE.length).fill(''));
  const [settled, setSettled] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const QR_SIZE = 25;
  const qrSeed = 1234 + genKey * 13;
  const grid = React.useMemo(() => buildQR(qrSeed, QR_SIZE), [qrSeed]);

  // Phase 0 — code scramble
  React.useEffect(() => {
    setPhase(0);
    setSettled(0);
    setChars(Array(FINAL_CODE.length).fill(''));

    const scrambleInterval = setInterval(() => {
      setChars((prev) => prev.map((_, i) =>
        FINAL_CODE[i] === '-' ? '-' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      ));
    }, 55);

    const settleTimers = [];
    for (let i = 0; i < FINAL_CODE.length; i++) {
      settleTimers.push(setTimeout(() => {
        setSettled((s) => s + 1);
      }, 350 + i * 95));
    }

    const toQR = setTimeout(() => {
      clearInterval(scrambleInterval);
      setChars(FINAL_CODE.split(''));
      setPhase(1);
    }, 350 + FINAL_CODE.length * 95 + 120);

    const toDone = setTimeout(() => {
      setPhase(2);
    }, 350 + FINAL_CODE.length * 95 + 120 + 900);

    return () => {
      clearInterval(scrambleInterval);
      settleTimers.forEach(clearTimeout);
      clearTimeout(toQR);
      clearTimeout(toDone);
    };
  }, [genKey]);

  // Merge scramble + settled chars for render
  const displayChars = chars.map((ch, i) => i < settled ? FINAL_CODE[i] : ch);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // QR cell size
  const cellPx = 8;
  const qrPx = QR_SIZE * cellPx;
  const cellDelay = (rr, cc) => (rr + cc) * 16; // diagonal wave

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.5)',
      WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadein 0.2s ease',
    }}>
      <style>{INVITE_CSS}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: dark ? '#15110d' : '#fff',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '12px 22px 50px',
        width: '100%',
        animation: 'slideup 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{ width: 36, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)', margin: '0 auto 16px' }} />

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: fg, letterSpacing: '-0.02em' }}>Tu código de invitación</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>
            Gana <span style={{ color: c.primary, fontWeight: 600 }}>$5</span> cuando un amigo se une.
          </div>
        </div>

        {/* QR card */}
        <div style={{
          position: 'relative', margin: '0 auto', width: 'fit-content',
          padding: 18,
          borderRadius: r.lg,
          background: dark ? 'rgba(255,255,255,0.05)' : '#FAFAFA',
          border: dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          {/* QR grid */}
          <div style={{
            position: 'relative', width: qrPx, height: qrPx,
            display: 'grid',
            gridTemplateColumns: `repeat(${QR_SIZE}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${QR_SIZE}, ${cellPx}px)`,
          }}>
            {/* scan line during qr build */}
            {phase === 1 && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: 0, height: 18,
                background: `linear-gradient(180deg, transparent, ${c.primary}66 40%, ${c.primary} 50%, ${c.primary}66 60%, transparent)`,
                animation: 'inviteScanLine 0.9s linear forwards',
                zIndex: 5,
                pointerEvents: 'none',
                filter: 'blur(2px)',
              }} />
            )}

            {grid.map((row, rr) => row.map((cell, cc) => {
              const isFinder = (
                (rr < 7 && cc < 7) ||
                (rr < 7 && cc >= QR_SIZE - 7) ||
                (rr >= QR_SIZE - 7 && cc < 7)
              );
              const filled = cell === 'F' || cell === 'D';
              if (!filled && phase < 2) return <div key={`${rr}-${cc}`} />;
              if (!filled) return <div key={`${rr}-${cc}`} />;

              // Don't render finder pattern cells individually — handled by overlay
              if (isFinder) return <div key={`${rr}-${cc}`} />;

              const visible = phase >= 1;
              return (
                <div key={`${rr}-${cc}`} style={{
                  width: cellPx, height: cellPx,
                  background: dark ? '#fff' : '#0D0D0D',
                  borderRadius: 1,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0.2)',
                  animation: visible ? `inviteCellPop 0.35s ${cellDelay(rr, cc)}ms cubic-bezier(0.2, 0.8, 0.2, 1) both` : 'none',
                }} />
              );
            }))}

            {/* Finder patterns — pop in last with the wave */}
            {[
              { r: 0, c: 0 },
              { r: 0, c: QR_SIZE - 7 },
              { r: QR_SIZE - 7, c: 0 },
            ].map((f, i) => {
              const visible = phase >= 1;
              const dl = cellDelay(f.r, f.c) + 80;
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: f.c * cellPx, top: f.r * cellPx,
                  width: 7 * cellPx, height: 7 * cellPx,
                  borderRadius: 6,
                  border: `${cellPx}px solid ${dark ? '#fff' : '#0D0D0D'}`,
                  boxSizing: 'border-box',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0.4)',
                  animation: visible ? `inviteFinderPop 0.4s ${dl}ms cubic-bezier(0.2, 0.8, 0.2, 1) both` : 'none',
                }}>
                  <div style={{
                    width: 3 * cellPx, height: 3 * cellPx,
                    background: dark ? '#fff' : '#0D0D0D',
                    borderRadius: 2,
                    position: 'absolute', left: cellPx, top: cellPx,
                  }} />
                </div>
              );
            })}

            {/* Logo overlay in QR center, once done */}
            {phase >= 2 && (
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 40, height: 40, borderRadius: 10,
                background: dark ? '#15110d' : '#fff',
                border: dark ? '2px solid #fff' : '2px solid #0D0D0D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'inviteFinderPop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
              }}>
                <HazloMark size={20} primary={c.primary} secondary={c.accent} />
              </div>
            )}
          </div>
        </div>

        {/* Code display */}
        <div style={{ marginTop: 18 }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 8,
          }}>
            {phase === 0 ? 'Generando código…' : 'Tu código'}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 4,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 22, fontWeight: 700, letterSpacing: '0.04em',
            color: fg,
          }}>
            {displayChars.map((ch, i) => {
              const isSettled = i < settled;
              const isDash = ch === '-';
              if (isDash) {
                return <span key={i} style={{ color: muted, fontWeight: 400 }}>–</span>;
              }
              return (
                <span key={i} style={{
                  display: 'inline-block', minWidth: '0.7em', textAlign: 'center',
                  color: isSettled ? c.primary : (phase >= 1 ? c.primary : fg),
                  transition: 'color 0.2s',
                  background: isSettled ? `${c.primary}12` : 'transparent',
                  borderRadius: 6, padding: '2px 4px',
                  transform: isSettled ? 'scale(1.0)' : 'scale(0.95)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{ch || '·'}</span>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        <div style={{
          marginTop: 22,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s, transform 0.4s',
          pointerEvents: phase >= 2 ? 'auto' : 'none',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={handleCopy} style={{
              height: 48, borderRadius: ctaRadius, border: 0, cursor: 'default',
              background: dark ? 'rgba(255,255,255,0.06)' : '#F2F4F7',
              color: fg, fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {copied ? <Icons.check size={16} stroke={c.primary} sw={2.4} /> : <Icons.copy size={15} stroke={fg} />}
              {copied ? 'Copiado' : 'Copiar código'}
            </button>
            <button style={{
              height: 48, borderRadius: ctaRadius, border: 0, cursor: 'default',
              background: c.primary, color: '#fff',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 8px 20px -8px ${c.primary}`,
            }}><Icons.share size={15} stroke="#fff" /> Compartir</button>
          </div>

          <button onClick={() => setGenKey((k) => k + 1)} style={{
            width: '100%', marginTop: 12, height: 38,
            border: 'none', background: 'transparent', cursor: 'default',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
            </svg>
            Regenerar código
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InviteSheet });
