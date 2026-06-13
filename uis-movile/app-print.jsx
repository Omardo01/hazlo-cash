// app-print.jsx — Static print layout: all main screens laid out as iPhone frames

const PRINT_THEME = {
  c: { primary: '#FE7801', accent: '#EB4E00', ink: '#0D0D0D' },
  r: { sm: 12, md: 16, lg: 24 },
  dark: false,
  glassBlur: 22,
};

function PhoneCard({ label, children }) {
  return (
    <div className="phone-card">
      <div className="phone-label">{label}</div>
      <div className="phone-wrap">
        <IOSDevice width={390} height={844} dark={false}>
          <div style={{ position: 'relative', height: '100%' }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 56 }}>
              {children}
            </div>
            <PrintTabBar theme={PRINT_THEME} />
          </div>
        </IOSDevice>
      </div>
    </div>
  );
}

function PrintTabBar({ theme }) {
  const { c } = theme;
  const muted = 'rgba(13,13,13,0.45)';
  const tabs = [
    { k: 'home',     label: 'Inicio',    icon: 'home',     active: true },
    { k: 'discover', label: 'Descubre',  icon: 'search' },
    { k: 'plus',     label: '',          icon: 'plus', isPlus: true },
    { k: 'balance',  label: 'Actividad', icon: 'activity' },
    { k: 'profile',  label: 'Perfil',    icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 26, left: 16, right: 16, zIndex: 30,
      borderRadius: 28,
      background: 'rgba(255,255,255,0.92)',
      border: '0.5px solid rgba(255,255,255,0.6)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 28px rgba(0,0,0,0.08)',
      padding: '8px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {tabs.map((tb) => {
        if (tb.isPlus) {
          return (
            <div key={tb.k} style={{
              width: 48, height: 48, borderRadius: 999,
              background: c.primary, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px -2px ${c.primary}cc, 0 0 0 4px rgba(255,255,255,0.7)`,
              transform: 'translateY(-12px)',
            }}>
              <Icons.plus size={22} stroke="#fff" sw={2.4} />
            </div>
          );
        }
        const color = tb.active ? c.primary : muted;
        return (
          <div key={tb.k} style={{
            flex: 1, height: 48, color,
            fontFamily: 'inherit', fontSize: 9.5, fontWeight: 600,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            {Icons[tb.icon]({ size: 22, stroke: color, sw: tb.active ? 2.2 : 1.8 })}
            {tb.label}
          </div>
        );
      })}
    </div>
  );
}

function InvitePreview({ theme }) {
  const { c, r } = theme;
  const fg = '#0D0D0D';
  const muted = 'rgba(13,13,13,0.55)';
  const QR_SIZE = 25, cellPx = 8;
  const seed = 1234;
  // local helper
  const mulberry32 = (a) => () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const buildQR = (seed, size) => {
    const rng = mulberry32(seed);
    const g = Array.from({ length: size }, () => Array(size).fill(null));
    const finder = (rr, cc) => {
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
        const inside = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        const ring = i === 0 || i === 6 || j === 0 || j === 6;
        g[rr + i][cc + j] = (ring || inside) ? 'F' : 'B';
      }
    };
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
    for (let i = 8; i < size - 8; i++) {
      if (g[6][i] == null) g[6][i] = i % 2 === 0 ? 'F' : 'B';
      if (g[i][6] == null) g[i][6] = i % 2 === 0 ? 'F' : 'B';
    }
    for (let r = 0; r < size; r++) for (let cc = 0; cc < size; cc++)
      if (g[r][cc] == null) g[r][cc] = rng() > 0.5 ? 'D' : 'B';
    return g;
  };
  const grid = buildQR(seed, QR_SIZE);
  const qrPx = QR_SIZE * cellPx;
  const code = 'JAVI-2K4N';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        background: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '12px 22px 50px', width: '100%',
      }}>
        <div style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(0,0,0,0.18)', margin: '0 auto 16px' }} />
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: fg, letterSpacing: '-0.02em' }}>Tu código de invitación</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>
            Gana <span style={{ color: c.primary, fontWeight: 600 }}>$5</span> cuando un amigo se une.
          </div>
        </div>
        <div style={{
          position: 'relative', margin: '0 auto', width: 'fit-content',
          padding: 18, borderRadius: r.lg, background: '#FAFAFA',
          border: '0.5px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{
            position: 'relative', width: qrPx, height: qrPx,
            display: 'grid',
            gridTemplateColumns: `repeat(${QR_SIZE}, ${cellPx}px)`,
            gridTemplateRows: `repeat(${QR_SIZE}, ${cellPx}px)`,
          }}>
            {grid.map((row, rr) => row.map((cell, cc) => {
              const isFinder = (rr < 7 && cc < 7) || (rr < 7 && cc >= QR_SIZE - 7) || (rr >= QR_SIZE - 7 && cc < 7);
              const filled = cell === 'F' || cell === 'D';
              if (!filled || isFinder) return <div key={`${rr}-${cc}`} />;
              return <div key={`${rr}-${cc}`} style={{ width: cellPx, height: cellPx, background: '#0D0D0D', borderRadius: 1 }} />;
            }))}
            {[{ r: 0, c: 0 }, { r: 0, c: QR_SIZE - 7 }, { r: QR_SIZE - 7, c: 0 }].map((f, i) => (
              <div key={i} style={{
                position: 'absolute', left: f.c * cellPx, top: f.r * cellPx,
                width: 7 * cellPx, height: 7 * cellPx, borderRadius: 6,
                border: `${cellPx}px solid #0D0D0D`, boxSizing: 'border-box',
              }}>
                <div style={{
                  width: 3 * cellPx, height: 3 * cellPx, background: '#0D0D0D', borderRadius: 2,
                  position: 'absolute', left: cellPx, top: cellPx,
                }} />
              </div>
            ))}
            <div style={{
              position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: 40, height: 40, borderRadius: 10, background: '#fff',
              border: '2px solid #0D0D0D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HazloMark size={20} primary={c.primary} secondary={c.accent} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 8 }}>Tu código</div>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 4,
            fontFamily: 'ui-monospace, monospace', fontSize: 22, fontWeight: 700, letterSpacing: '0.04em',
          }}>
            {code.split('').map((ch, i) => ch === '-' ? (
              <span key={i} style={{ color: muted, fontWeight: 400 }}>–</span>
            ) : (
              <span key={i} style={{
                color: c.primary, background: `${c.primary}12`,
                borderRadius: 6, padding: '2px 4px', minWidth: '0.7em', textAlign: 'center',
              }}>{ch}</span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button style={{
            height: 48, borderRadius: r.md, border: 0, background: '#F2F4F7', color: fg,
            fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
          }}>Copiar código</button>
          <button style={{
            height: 48, borderRadius: r.md, border: 0, background: c.primary, color: '#fff',
            fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
          }}>Compartir</button>
        </div>
      </div>
    </div>
  );
}

function SplashPreview({ theme }) {
  const { c } = theme;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', width: 240, height: 240, borderRadius: 999,
          background: `radial-gradient(circle, ${c.primary}55 0%, ${c.primary}00 60%)`,
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: 999,
          background: `radial-gradient(circle, ${c.primary}88 0%, ${c.primary}00 70%)`,
        }} />
        <div style={{ position: 'relative' }}>
          <HazloMark size={100} primary={c.primary} secondary={c.accent} />
        </div>
      </div>
      <div style={{ marginTop: 36, fontSize: 28, fontWeight: 700, color: '#0D0D0D', letterSpacing: '-0.025em' }}>
        Hazlo <span style={{ color: c.primary }}>Cash</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 500, color: 'rgba(13,13,13,0.5)', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
        Recomienda · Conecta · Gana
      </div>
    </div>
  );
}

function PrintPage1() {
  return (
    <div className="page">
      <div className="page-header">
        <HazloLogotype size={20} primary="#FE7801" secondary="#EB4E00" fg="#0D0D0D" />
        <div className="page-meta">Prototipo · Mayo 2026 · Página 1 de 3</div>
      </div>
      <h1 className="page-title">Onboarding & Inicio</h1>
      <div className="phone-row">
        <PhoneCard label="01 · Splash"><SplashPreview theme={PRINT_THEME} /></PhoneCard>
        <PhoneCard label="02 · Inicio"><HomeScreen theme={PRINT_THEME} onNav={() => {}} onShare={() => {}} /></PhoneCard>
        <PhoneCard label="03 · Descubre"><DiscoverScreen theme={PRINT_THEME} /></PhoneCard>
      </div>
    </div>
  );
}

function PrintPage2() {
  return (
    <div className="page">
      <div className="page-header">
        <HazloLogotype size={20} primary="#FE7801" secondary="#EB4E00" fg="#0D0D0D" />
        <div className="page-meta">Prototipo · Mayo 2026 · Página 2 de 3</div>
      </div>
      <h1 className="page-title">Balance & Compartir</h1>
      <div className="phone-row">
        <PhoneCard label="04 · Balance"><BalanceScreen theme={PRINT_THEME} onWithdraw={() => {}} /></PhoneCard>
        <PhoneCard label="05 · Recomienda"><ShareScreen theme={PRINT_THEME} /></PhoneCard>
        <PhoneCard label="06 · Perfil"><ProfileScreen theme={PRINT_THEME} onInvite={() => {}} /></PhoneCard>
      </div>
    </div>
  );
}

function PrintPage3() {
  return (
    <div className="page">
      <div className="page-header">
        <HazloLogotype size={20} primary="#FE7801" secondary="#EB4E00" fg="#0D0D0D" />
        <div className="page-meta">Prototipo · Mayo 2026 · Página 3 de 3</div>
      </div>
      <h1 className="page-title">Generación de código + QR</h1>
      <div className="phone-row centered">
        <PhoneCard label="07 · Código + QR">
          <ProfileScreen theme={PRINT_THEME} onInvite={() => {}} />
          <InvitePreview theme={PRINT_THEME} />
        </PhoneCard>
        <div className="notes">
          <h2>Animación de generación</h2>
          <ol>
            <li><b>Scramble del código</b> (≈1.0s) — letras random ciclan a 55ms y se van fijando una a una con stagger; cada char fijo salta a naranja con píldora.</li>
            <li><b>Construcción del QR</b> (≈0.9s) — celdas pop-in en oleada diagonal desde la esquina superior izquierda, mientras una scan line naranja barre la zona. Los 3 finder patterns aparecen con su propia animación de pop.</li>
            <li><b>Estado final</b> — logo Hazlo Cash aparece en el centro del QR; CTAs (Copiar / Compartir) y opción Regenerar fade-in.</li>
          </ol>
          <h2>Notas técnicas</h2>
          <ul>
            <li>QR 25×25 con finder patterns en 3 esquinas y timing patterns. Estructura visual de QR válido (no codifica el código).</li>
            <li>Patrón determinista vía seed — mismo código siempre produce mismo QR.</li>
            <li>Respeta paleta, modo oscuro y radios del panel de Tweaks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PrintApp() {
  return (
    <>
      <PrintPage1 />
      <PrintPage2 />
      <PrintPage3 />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PrintApp />);

// Auto-print after fonts + Babel parsed
window.addEventListener('load', () => {
  document.fonts.ready.then(() => {
    setTimeout(() => window.print(), 800);
  });
});
