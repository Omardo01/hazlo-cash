'use client'

import { useState, useEffect } from 'react'
import { DM_Sans } from 'next/font/google'
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid,
  XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
} from 'recharts'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

// ─── Tokens ───────────────────────────────────────────────────────────────────
const G   = 'linear-gradient(135deg, #2D2B8F 0%, #00A896 55%, #F5A623 100%)'
const G90 = 'linear-gradient(90deg,  #2D2B8F 0%, #00A896 50%, #F5A623 100%)'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 24,
  boxShadow: 'rgba(0,0,0,0.07) 0px 0px 8px 0px',
}

// ─── Data ────────────────────────────────────────────────────────────────────
const MONTHLY = [
  { mes: 'Nov', v: 820 },
  { mes: 'Dic', v: 1240 },
  { mes: 'Ene', v: 680 },
  { mes: 'Feb', v: 1580 },
  { mes: 'Mar', v: 1320 },
  { mes: 'Abr', v: 1985 },
]

const TRANSACTIONS = [
  { id: 'T001', neg: 'Tacos El Güero',   ini: 'TG', color: '#F5A623', cat: 'Comida',     fecha: 'Hoy, 14:32',   monto: 120,  com: 6,     est: 'confirmada' },
  { id: 'T002', neg: 'Estética Luna',    ini: 'EL', color: '#00A896', cat: 'Belleza',    fecha: 'Hoy, 11:20',   monto: 350,  com: 17.50, est: 'pendiente'  },
  { id: 'T003', neg: 'Plomería Express', ini: 'PE', color: '#2D2B8F', cat: 'Hogar',      fecha: 'Ayer, 18:05',  monto: 800,  com: 40,    est: 'pagada'     },
  { id: 'T004', neg: 'Mecánica Pérez',   ini: 'MP', color: '#1A1840', cat: 'Automotriz', fecha: 'Ayer, 10:48',  monto: 1200, com: 60,    est: 'pagada'     },
  { id: 'T005', neg: 'Tacos El Güero',   ini: 'TG', color: '#F5A623', cat: 'Comida',     fecha: '9 Abr, 20:15', monto: 90,   com: 4.50,  est: 'pagada'     },
  { id: 'T006', neg: 'Lavandería Clean', ini: 'LC', color: '#6366F1', cat: 'Servicios',  fecha: '8 Abr, 09:30', monto: 180,  com: 9,     est: 'confirmada' },
] as const

type Est = 'confirmada' | 'pendiente' | 'pagada'
type Filter = 'todos' | Est

const EST: Record<Est, { label: string; color: string; bg: string }> = {
  confirmada: { label: 'Confirmada', color: '#00A896', bg: 'rgba(0,168,150,0.08)'  },
  pendiente:  { label: 'Pendiente',  color: '#F5A623', bg: 'rgba(245,166,35,0.08)' },
  pagada:     { label: 'Pagada',     color: '#2D2B8F', bg: 'rgba(45,43,143,0.08)'  },
}

const NEGOCIOS = [
  { name: 'Tacos El Güero',   ini: 'TG', color: '#F5A623', refs: 48, pct: 38, monto: '$720'  },
  { name: 'Mecánica Pérez',   ini: 'MP', color: '#1A1840', refs: 19, pct: 28, monto: '$530'  },
  { name: 'Estética Luna',    ini: 'EL', color: '#00A896', refs: 31, pct: 21, monto: '$398'  },
  { name: 'Plomería Express', ini: 'PE', color: '#2D2B8F', refs: 27, pct: 13, monto: '$246'  },
]

const STATS = [
  { label: 'Balance',         value: '$1,985',  sub: '+$420 este mes',    accent: '#00A896' },
  { label: 'Referidos',       value: '12',      sub: '+3 esta semana',    accent: '#2D2B8F' },
  { label: 'Conversión',      value: '68%',     sub: '+5% vs mes pasado', accent: '#F5A623' },
  { label: 'Códigos activos', value: '3',       sub: '2 usados hoy',      accent: '#636363' },
]

const QR_PATTERN = [
  [1,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,0],
  [1,0,1,1,1,0,1,0,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1],
  [1,0,1,1,1,0,1,0,1,0,0],
  [1,0,0,0,0,0,1,1,0,1,0],
  [1,1,1,1,1,1,1,0,1,0,1],
  [0,0,0,1,0,0,0,0,1,1,0],
  [1,0,1,1,0,1,1,0,1,1,1],
  [0,1,0,0,1,0,0,1,0,1,0],
  [1,0,1,0,0,1,1,0,1,0,1],
]

const TABS = ['Dashboard', 'Comisiones', 'Referidos', 'Perfil']

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '10px 14px', boxShadow: 'rgba(0,0,0,0.1) 0 4px 16px', fontSize: 12 }}>
      <p style={{ color: '#959595', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 500, color: '#000', fontSize: 16 }}>${payload[0].value.toLocaleString('es-MX')} MXN</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Ambassador2() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [filter, setFilter] = useState<Filter>('todos')
  const [balanceVisible, setBalanceVisible] = useState(true)

  useScrollReveal()

  const txFiltered = filter === 'todos'
    ? TRANSACTIONS
    : TRANSACTIONS.filter((t) => t.est === filter)

  return (
    <div className={dmSans.className} style={{ background: '#F8F8F8', minHeight: '100vh', color: '#000' }}>

      {/* ─── ANIMATIONS ───────────────────────────────────── */}
      <style>{`
        .h-in  { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .h-in2 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .h-in3 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
        .h-in4 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
        .h-in5 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
        .h-in6 { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.5s both; }

        .reveal     { opacity:0; transform:translateY(22px); transition:opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1); }
        .reveal.in  { opacity:1; transform:none; }
        .reveal.d1  { transition-delay:.08s; }
        .reveal.d2  { transition-delay:.16s; }
        .reveal.d3  { transition-delay:.24s; }
        .reveal.d4  { transition-delay:.32s; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes glowPulse { 0%,100%{opacity:.06} 50%{opacity:.12} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .glow-bg { animation: glowPulse 6s ease-in-out infinite; }
        .card-lift { transition: transform .25s cubic-bezier(0.22,1,0.36,1), box-shadow .25s ease; }
        .card-lift:hover { transform:translateY(-4px); box-shadow:rgba(0,0,0,0.12) 0 10px 24px; }

        .tab-btn { transition:all .2s ease; border:none; background:transparent; cursor:pointer; font-family:inherit; }
        .filter-btn { transition:all .2s ease; border:none; cursor:pointer; font-family:inherit; }

        .tx-row { transition: background .15s ease; }
        .tx-row:hover { background:rgba(0,0,0,0.02); }

        .row-fade { animation: fadeIn .3s ease both; }
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(239,239,239,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', gap: 32 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>H</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.3px' }}>Hazlo Cash</span>
          </div>

          {/* Tabs */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {TABS.map((t) => (
              <button key={t} className="tab-btn" onClick={() => setActiveTab(t)}
                style={{ fontSize: 13, fontWeight: activeTab === t ? 500 : 400, color: activeTab === t ? '#000' : '#636363', padding: '5px 12px', borderRadius: 9999, background: activeTab === t ? 'rgba(0,0,0,0.06)' : 'transparent' }}
              >{t}</button>
            ))}
          </nav>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 13, color: '#636363', fontWeight: 400 }}>Omar Domínguez</div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff' }}>OD</div>
          </div>
        </div>
      </header>

      {/* ─── MAIN LAYOUT ─────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── LEFT / MAIN CONTENT ────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile hero */}
          <div className="h-in" style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {/* Top gradient strip */}
            <div style={{ height: 4, background: G90 }} />

            <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, color: '#fff' }}>OD</div>
                <span style={{ position: 'absolute', bottom: -6, right: -6, background: '#F5A623', color: '#fff', fontSize: 8, fontWeight: 500, padding: '2px 6px', borderRadius: 9999, letterSpacing: '0.04em' }}>BRONCE</span>
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.44px', color: '#000', marginBottom: 2 }}>Omar Domínguez</h1>
                <p style={{ fontSize: 13, color: '#636363' }}>Embajador · Villahermosa, Tabasco · Miembro desde Ene 2026</p>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 32, flexShrink: 0 }}>
                {[{ v: '12', l: 'Referidos' }, { v: '$1,985', l: 'Este mes' }, { v: '$7,625', l: 'Total ganado' }].map((s) => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.04em', color: '#000', marginBottom: 2 }}>{s.v}</p>
                    <p style={{ fontSize: 11, color: '#959595' }}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Code pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8F8F8', borderRadius: 12, padding: '10px 16px', flexShrink: 0 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 500, letterSpacing: '0.06em', color: '#000' }}>HAZLO-OD42</span>
                <button style={{ fontSize: 11, fontWeight: 500, color: '#2D2B8F', background: 'rgba(45,43,143,0.08)', border: 'none', padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Copiar</button>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="h-in2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {STATS.map((s, i) => (
              <div key={s.label} className={`card-lift reveal d${i + 1}`} style={{ ...card, borderRadius: 20, padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#959595', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.04em', color: '#000', marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: s.accent, fontWeight: 500 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Earnings chart */}
          <div className="reveal" style={{ ...card, padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#959595', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ingresos mensuales</p>
                <p style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.44px', color: '#000' }}>$7,625 <span style={{ fontSize: 13, color: '#959595', fontWeight: 400 }}>últimos 6 meses</span></p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#00A896', background: 'rgba(0,168,150,0.08)', padding: '4px 12px', borderRadius: 9999 }}>+18% vs año pasado</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MONTHLY} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D2B8F" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#2D2B8F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#959595' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#959595' }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="v" stroke="#2D2B8F" strokeWidth={2} fill="url(#aGrad)" dot={false} activeDot={{ r: 4, fill: '#2D2B8F', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Referral distribution */}
          <div className="reveal" style={{ ...card, padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.2px', color: '#000' }}>Ingresos por negocio</p>
              <span style={{ fontSize: 12, color: '#959595' }}>Abril 2025</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {NEGOCIOS.map((n) => (
                <div key={n.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: '#fff', flexShrink: 0 }}>{n.ini}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: '#000', fontWeight: 400 }}>{n.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#00A896' }}>{n.monto}</span>
                    </div>
                    <div style={{ height: 4, background: '#EFEFEF', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${n.pct}%`, background: G90, borderRadius: 9999, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#959595', flexShrink: 0, minWidth: 32, textAlign: 'right' }}>{n.refs} ref.</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comisiones table */}
          <div className="reveal" style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.2px', color: '#000' }}>Comisiones</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['todos', 'pendiente', 'confirmada', 'pagada'] as Filter[]).map((f) => (
                  <button key={f} className="filter-btn" onClick={() => setFilter(f)}
                    style={{ fontSize: 12, fontWeight: filter === f ? 500 : 400, color: filter === f ? '#000' : '#636363', padding: '5px 12px', borderRadius: 9999, background: filter === f ? 'rgba(0,0,0,0.07)' : 'transparent', fontFamily: 'inherit' }}
                  >
                    {f === 'todos' ? 'Todos' : EST[f].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 16, padding: '10px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              {['Negocio', 'Venta', 'Comisión', 'Estado'].map((h) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 500, color: '#AEAEAE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {txFiltered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 14, color: '#959595' }}>Sin transacciones en este estado.</div>
            ) : (
              txFiltered.map((tx, i) => (
                <div key={tx.id} className="tx-row row-fade" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: i < txFiltered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: '#fff', flexShrink: 0 }}>{tx.ini}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.neg}</p>
                      <p style={{ fontSize: 11, color: '#959595' }}>{tx.cat} · {tx.fecha}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: '#000', whiteSpace: 'nowrap' }}>${tx.monto.toLocaleString('es-MX')}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#00A896', whiteSpace: 'nowrap' }}>+${tx.com.toFixed(2)}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: EST[tx.est].color, background: EST[tx.est].bg, padding: '4px 10px', borderRadius: 9999, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: EST[tx.est].color, flexShrink: 0 }} />
                    {EST[tx.est].label}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────── */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 72 }}>

          {/* Balance card */}
          <div className="h-in3" style={{ ...card, borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: 3, background: G90 }} />
            <div style={{ padding: '20px 20px 16px', position: 'relative' }}>
              {/* Glow */}
              <div aria-hidden className="glow-bg" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: G, opacity: 0.08, filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#959595', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Disponible</p>
                <button onClick={() => setBalanceVisible((v) => !v)} style={{ fontSize: 11, color: '#AEAEAE', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {balanceVisible ? '🙈 Ocultar' : '👁 Ver'}
                </button>
              </div>

              <p style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', color: '#000', marginBottom: 2 }}>
                {balanceVisible ? '$1,700' : '••••'}
              </p>
              <p style={{ fontSize: 12, color: '#959595', marginBottom: 20 }}>CLABE ···· 4821 · BBVA</p>

              <button style={{ width: '100%', background: '#2D2B8F', color: '#fff', border: 'none', borderRadius: 14, padding: '11px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Retirar saldo →
              </button>
            </div>
          </div>

          {/* QR Code card */}
          <div className="h-in4" style={{ ...card, borderRadius: 24, padding: '20px' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#959595', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Tu código QR</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#F8F8F8', borderRadius: 12, padding: 10, flexShrink: 0 }}>
                <svg viewBox="0 0 11 11" width={72} height={72} shapeRendering="crispEdges">
                  {QR_PATTERN.map((row, y) =>
                    row.map((cell, x) =>
                      cell ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#000" /> : null
                    )
                  )}
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: '#000', marginBottom: 6 }}>HAZLO-OD42</p>
                <p style={{ fontSize: 11, color: '#636363', lineHeight: 1.5, marginBottom: 10 }}>Comparte este código para ganar comisiones</p>
                <button style={{ fontSize: 11, fontWeight: 500, color: '#2D2B8F', background: 'rgba(45,43,143,0.08)', border: 'none', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Compartir →
                </button>
              </div>
            </div>
          </div>

          {/* Level progress card */}
          <div className="h-in5" style={{ ...card, borderRadius: 24, padding: '20px' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#959595', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Tu nivel</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              {[
                { label: 'Bronce', color: '#F5A623', active: true  },
                { label: 'Plata',  color: '#AEAEAE', active: false },
                { label: 'Oro',    color: '#F5A623', active: false },
              ].map((lvl) => (
                <div key={lvl.label} style={{ textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: lvl.active ? lvl.color : '#F8F8F8', border: `2px solid ${lvl.active ? lvl.color : '#EFEFEF'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 14 }}>
                    {lvl.active ? '🥉' : lvl.label === 'Plata' ? '🥈' : '🥇'}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: lvl.active ? 500 : 400, color: lvl.active ? '#000' : '#AEAEAE' }}>{lvl.label}</p>
                </div>
              ))}
            </div>

            <div style={{ height: 5, background: '#EFEFEF', borderRadius: 9999, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: '28%', background: G90, borderRadius: 9999 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#959595' }}>12 referidos</span>
              <span style={{ fontSize: 11, color: '#636363' }}>Plata en 31 más</span>
            </div>
          </div>

          {/* Top negocios */}
          <div className="h-in6" style={{ ...card, borderRadius: 24, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#000' }}>Mis negocios</p>
            </div>
            {NEGOCIOS.map((n, i) => (
              <div key={n.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < NEGOCIOS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: '#fff', flexShrink: 0 }}>{n.ini}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.name}</p>
                  <p style={{ fontSize: 10, color: '#959595' }}>{n.refs} referidos</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#00A896', flexShrink: 0 }}>{n.monto}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
