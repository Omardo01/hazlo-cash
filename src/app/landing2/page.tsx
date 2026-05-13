'use client'

import { useState, useEffect, useRef } from 'react'
import { DM_Sans } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const G = 'linear-gradient(135deg, #2D2B8F 0%, #00A896 55%, #F5A623 100%)'
const G90 = 'linear-gradient(90deg, #2D2B8F 0%, #00A896 50%, #F5A623 100%)'

type CategoryKey = 'Taquerías' | 'Plomeros' | 'Estilistas' | 'Mecánicos' | 'Electricistas'

const CATEGORIES: Record<
  CategoryKey,
  { emoji: string; headline: string; description: string; benefit: string; code: string; name: string }
> = {
  Taquerías: {
    emoji: '🌮',
    headline: 'Para negocios de comida',
    description:
      'Tu taquería favorita ahora premia a quien la recomienda. Cada amigo que lleves vale dinero real en tu bolsillo.',
    benefit: 'Clientes nuevos sin publicidad pagada',
    code: 'HAZLO-TG04',
    name: 'Tacos El Güero',
  },
  Plomeros: {
    emoji: '🔧',
    headline: 'Para servicios del hogar',
    description:
      'Plomeros, albañiles, pintores — tu trabajo habla por ti. Hazlo Cash hace que tus clientes hablen por ti.',
    benefit: 'Reputación digital desde el primer trabajo',
    code: 'HAZLO-PL12',
    name: 'Plomería Ramírez',
  },
  Estilistas: {
    emoji: '✂️',
    headline: 'Para belleza y cuidado personal',
    description:
      'Salones, barberos, estilistas. Tus clientes ya te recomiendan en WhatsApp. Con Hazlo Cash, eso tiene precio.',
    benefit: 'Comisión automática por cada referido',
    code: 'HAZLO-ES07',
    name: 'Estética Lorena',
  },
  Mecánicos: {
    emoji: '🚗',
    headline: 'Para servicios automotrices',
    description:
      'La confianza es todo en la mecánica. Construye tu reputación verificada y llega a más clientes en tu zona.',
    benefit: 'Reviews verificados solo por trabajo real',
    code: 'HAZLO-ME03',
    name: 'Mecánica Don Pepe',
  },
  Electricistas: {
    emoji: '⚡',
    headline: 'Para servicios técnicos',
    description:
      'Electricistas, técnicos de refrigeración, instaladores. Tu experiencia merece llegar a más hogares.',
    benefit: 'Crece por recomendación, no por publicidad',
    code: 'HAZLO-EL09',
    name: 'Electro Servicios MX',
  },
}

const STEPS = [
  {
    step: '01', role: 'Embajador',
    title: 'Recomienda negocios que conoces',
    description: 'Tienes un código único y un QR personal. Compártelo con quien quieras para recomendar negocios en los que confías.',
    accent: '#2D2B8F', bg: 'rgba(45,43,143,0.06)',
  },
  {
    step: '02', role: 'Cliente',
    title: 'Encuentra servicios de confianza',
    description: 'Ves el perfil del negocio recomendado, solicitas el servicio dentro de la plataforma, y pagas de forma segura.',
    accent: '#00A896', bg: 'rgba(0,168,150,0.06)',
  },
  {
    step: '03', role: 'Todos ganan',
    title: 'Comisiones automáticas al confirmar',
    description: 'Al completarse el servicio, el embajador recibe su comisión automáticamente. Sin trámites, sin esperas.',
    accent: '#F5A623', bg: 'rgba(245,166,35,0.06)',
  },
]

const BENEFITS = [
  {
    icon: '🤝', title: 'Para el Embajador',
    points: ['Código único y QR personal para compartir', 'Comisiones automáticas al confirmar el servicio', 'Dashboard con tus ingresos en tiempo real', 'Sube de nivel: Bronce → Plata → Oro'],
    color: '#2D2B8F',
  },
  {
    icon: '🏪', title: 'Para el Negocio',
    points: ['Clientes nuevos sin invertir en publicidad', 'Solo pagas comisión por resultados reales', 'Reputación verificada que crece con cada servicio', 'Dashboard: ventas y ROI de embajadores'],
    color: '#00A896',
  },
  {
    icon: '👤', title: 'Para el Cliente',
    points: ['Servicios recomendados por personas reales', 'Pagos protegidos — liberas el dinero al confirmar', 'Chat directo con el negocio dentro de la app', 'Reseñas verificadas solo por trabajo real'],
    color: '#F5A623',
  },
]

const BAR_HEIGHTS = [0.6, 0.8, 0.45, 0.9, 0.7, 0.85, 1]

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 30,
  padding: 32,
  boxShadow: 'rgba(0,0,0,0.08) 0px 0px 8px 0px',
}

// ─── Hook: activa clase .in cuando el elemento entra al viewport ───────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function Landing2() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('Taquerías')
  const [barsVisible, setBarsVisible] = useState(false)
  const barsRef = useRef<HTMLDivElement>(null)

  useScrollReveal()

  // Activa la animación de barras cuando el showcase entra al viewport
  useEffect(() => {
    if (!barsRef.current) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBarsVisible(true) },
      { threshold: 0.3 }
    )
    io.observe(barsRef.current)
    return () => io.disconnect()
  }, [])

  // Reinicia barras al cambiar categoría
  useEffect(() => {
    setBarsVisible(false)
    const t = setTimeout(() => setBarsVisible(true), 80)
    return () => clearTimeout(t)
  }, [activeCategory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  const cat = CATEGORIES[activeCategory]

  return (
    <div className={dmSans.className} style={{ background: '#F8F8F8', minHeight: '100vh', color: '#000' }}>

      {/* ─── CSS ANIMATIONS ─────────────────────────────────── */}
      <style>{`
        /* Hero entrance — staggered */
        .h-pill  { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
        .h-sub   { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .h-title { animation: fadeUp 0.70s cubic-bezier(0.22,1,0.36,1) 0.34s both; }
        .h-body  { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.50s both; }
        .h-ctas  { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.60s both; }

        /* Scroll reveal */
        .reveal        { opacity: 0; transform: translateY(28px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .reveal.in     { opacity: 1; transform: none; }
        .reveal.d1     { transition-delay: 0.10s; }
        .reveal.d2     { transition-delay: 0.20s; }
        .reveal.d3     { transition-delay: 0.30s; }
        .reveal.d4     { transition-delay: 0.40s; }
        .reveal.d5     { transition-delay: 0.50s; }

        /* Keyframes */
        @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn  { from { opacity:0; }                              to { opacity:1; } }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.07; transform: translateX(-50%) scale(1); }
          50%       { opacity: 0.14; transform: translateX(-50%) scale(1.08); }
        }
        @keyframes glowPulseCenter {
          0%, 100% { opacity: 0.04; }
          50%       { opacity: 0.09; }
        }
        @keyframes glowPulseAbs {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.12; }
        }
        @keyframes stripShimmer {
          0%   { background-position: -100% center; }
          100% { background-position: 200%  center; }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes tabFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes lockBounce {
          0%,100% { transform: translateY(0); }
          40%      { transform: translateY(-6px); }
          60%      { transform: translateY(-2px); }
        }

        /* Ambient glows */
        .glow-hero   { animation: glowPulse       6s ease-in-out infinite; }
        .glow-center { animation: glowPulseCenter  7s ease-in-out infinite; }
        .glow-abs    { animation: glowPulseAbs     5s ease-in-out infinite; }

        /* Gradient strip */
        .grad-strip {
          background-size: 200% auto;
          animation: stripShimmer 4s linear infinite;
        }

        /* Card hover lift */
        .card-lift { transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s ease; cursor: default; }
        .card-lift:hover { transform: translateY(-5px); box-shadow: rgba(0,0,0,0.13) 0px 12px 28px; }

        /* Bar chart */
        .bar { transform-origin: bottom; }
        .bar.grow { animation: barGrow 0.55s cubic-bezier(0.22,1,0.36,1) var(--d, 0s) both; }

        /* Category content transition */
        .cat-content { animation: tabFade 0.35s cubic-bezier(0.22,1,0.36,1) both; }

        /* Lock icon subtle bounce on hover */
        .lock-icon:hover { animation: lockBounce 0.6s cubic-bezier(0.22,1,0.36,1); }

        /* Input focus ring animation */
        .email-input:focus { outline: none; border-color: #2D2B8F !important; box-shadow: 0 0 0 3px rgba(45,43,143,0.12); }
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(239,239,239,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>H</span>
            </div>
            <span style={{ fontWeight: 500, fontSize: 15, letterSpacing: '-0.3px' }}>Hazlo Cash</span>
          </div>

          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {['Cómo funciona', 'Para negocios', 'Para embajadores'].map((link) => (
              <a key={link} href="#" style={{ fontSize: 14, fontWeight: 400, color: '#000', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#636363')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#000')}
              >{link}</a>
            ))}
          </nav>

          <a href="#waitlist" style={{ background: '#2D2B8F', color: '#fff', fontSize: 14, fontWeight: 500, padding: '8px 20px', borderRadius: 30, textDecoration: 'none', transition: 'opacity 0.2s ease', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >Únete gratis</a>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        <div className="h-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.04)', borderRadius: 16, padding: '6px 16px', fontSize: 13, color: '#636363', marginBottom: 36 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A896', display: 'inline-block', flexShrink: 0 }} />
          Abriendo lista de espera en México · Mayo 2025
        </div>

        <p className="h-sub" style={{ fontSize: 18, fontWeight: 400, color: '#636363', marginBottom: 20, letterSpacing: '-0.01em' }}>
          El marketplace que premia la confianza
        </p>

        <h1 className="h-title" style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 300, lineHeight: 1.11, letterSpacing: '-0.04em', color: '#000', marginBottom: 32, maxWidth: 820, marginLeft: 'auto', marginRight: 'auto' }}>
          Recomienda negocios.
          <br />
          <span style={{ background: G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Gana dinero real.
          </span>
        </h1>

        <p className="h-body" style={{ fontSize: 18, fontWeight: 400, color: '#636363', maxWidth: 540, margin: '0 auto 44px', lineHeight: 1.6 }}>
          Hazlo Cash conecta clientes con negocios locales a través de recomendaciones verificadas — y paga a quien las hace.
        </p>

        <div className="h-ctas" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#waitlist" style={{ background: '#2D2B8F', color: '#fff', fontSize: 15, fontWeight: 500, padding: '13px 30px', borderRadius: 30, textDecoration: 'none', transition: 'opacity 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >Quiero ser embajador</a>
          <a href="#como-funciona" style={{ background: '#D9D9D9', color: 'rgba(0,0,0,0.85)', fontSize: 15, fontWeight: 400, padding: '13px 30px', borderRadius: 30, textDecoration: 'none', transition: 'background 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#c8c8c8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#D9D9D9')}
          >Ver cómo funciona</a>
        </div>

        {/* Glow ambiental pulsante */}
        <div aria-hidden className="glow-hero" style={{ position: 'absolute', bottom: -60, left: '50%', width: '65%', height: 240, background: G, filter: 'blur(90px)', borderRadius: '50%', pointerEvents: 'none' }} />
      </section>

      {/* ─── STRIP DE GRADIENTE (animado) ────────────────────── */}
      <div className="grad-strip" style={{ width: '100%', height: 3, background: G90, backgroundSize: '200% auto' }} />

      {/* ─── CÓMO FUNCIONA ───────────────────────────────────── */}
      <section id="como-funciona" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#959595', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>El flujo</p>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.17, color: '#000', marginBottom: 16 }}>
            Así funciona Hazlo Cash
          </h2>
          <p style={{ fontSize: 16, color: '#636363', maxWidth: 460, margin: '0 auto' }}>
            Tres roles, un solo flujo. Todos ganan cuando la recomendación funciona.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {STEPS.map((item, i) => (
            <div key={item.step} className={`reveal card-lift d${i + 1}`} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: item.accent, background: item.bg, padding: '4px 10px', borderRadius: 9999, letterSpacing: '0.04em' }}>{item.step}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#959595', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.role}</span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 500, color: '#000', letterSpacing: '-0.44px', lineHeight: 1.25, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: '#636363', lineHeight: 1.6 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HAZLO ES PARA... ────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 300, letterSpacing: '-0.04em', color: '#000' }}>
            Hazlo Cash es para...
          </h2>
        </div>

        {/* Tabs */}
        <div className="reveal" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
            <button key={key} onClick={() => setActiveCategory(key)} style={{ background: activeCategory === key ? '#000' : 'transparent', color: activeCategory === key ? '#fff' : 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeCategory === key ? 500 : 400, padding: '7px 16px', borderRadius: 9999, transition: 'all 0.2s ease', fontFamily: 'inherit' }}>
              {CATEGORIES[key].emoji} {key}
            </button>
          ))}
        </div>

        {/* Card showcase */}
        <div className="reveal" style={{ ...card, borderRadius: 40, padding: 'clamp(28px, 4vw, 48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden className="glow-abs" style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, background: G, filter: 'blur(70px)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Texto — se reanima en cada cambio de categoría */}
          <div key={activeCategory} className="cat-content" style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#959595', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              {cat.emoji} {activeCategory}
            </p>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.2, color: '#000', marginBottom: 16 }}>
              {cat.headline}
            </h3>
            <p style={{ fontSize: 15, color: '#636363', lineHeight: 1.65, marginBottom: 24 }}>{cat.description}</p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,168,150,0.08)', padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 500, color: '#00A896' }}>
              ✓ {cat.benefit}
            </span>
          </div>

          {/* Mock visual */}
          <div ref={barsRef} style={{ background: '#F8F8F8', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Negocio card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: 'rgba(0,0,0,0.06) 0 0 6px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: G, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#000', margin: 0 }}>{cat.name}</p>
                <p style={{ fontSize: 11, color: '#959595', margin: 0 }}>Código: {cat.code}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#00A896', background: 'rgba(0,168,150,0.1)', padding: '3px 8px', borderRadius: 9999, whiteSpace: 'nowrap' }}>Activo</span>
            </div>

            {/* Ingresos card con barras animadas */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: 'rgba(0,0,0,0.06) 0 0 6px' }}>
              <p style={{ fontSize: 11, color: '#959595', margin: '0 0 4px' }}>Ganaste esta semana</p>
              <p style={{ fontSize: 28, fontWeight: 300, color: '#000', letterSpacing: '-0.04em', margin: '0 0 12px' }}>
                $340 <span style={{ fontSize: 13, color: '#959595', fontWeight: 400 }}>MXN</span>
              </p>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 36 }}>
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={`${activeCategory}-${i}`}
                    className={`bar${barsVisible ? ' grow' : ''}`}
                    style={{
                      flex: 1,
                      height: `${h * 100}%`,
                      background: i === 6 ? '#2D2B8F' : '#EFEFEF',
                      borderRadius: 4,
                      ['--d' as string]: `${i * 0.06}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Nivel card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: 'rgba(0,0,0,0.06) 0 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, color: '#959595', margin: '0 0 2px' }}>Tu nivel</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#000', margin: 0 }}>🥈 Plata</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#959595', margin: '0 0 4px' }}>Progreso a Oro</p>
                <div style={{ width: 80, height: 4, background: '#EFEFEF', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: '62%', height: '100%', background: G90, borderRadius: 9999 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS GRID ───────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 300, letterSpacing: '-0.04em', color: '#000' }}>
            Una plataforma, tres ganadores
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
          {BENEFITS.map((item, i) => (
            <div key={item.title} className={`reveal card-lift d${i + 1}`} style={card}>
              <div style={{ fontSize: 30, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.44px', color: '#000', marginBottom: 20 }}>{item.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {item.points.map((point) => (
                  <li key={point} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, color: '#636363', lineHeight: 1.5 }}>
                    <span style={{ color: item.color, marginTop: 2, flexShrink: 0, fontWeight: 500 }}>✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRUST ───────────────────────────────────────────── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
        <div aria-hidden className="glow-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', height: '100%', background: G, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="reveal lock-icon" style={{ width: 48, height: 48, borderRadius: 14, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 22 }}>🔒</div>

        <h2 className="reveal d1" style={{ fontSize: 'clamp(26px, 4vw, 54px)', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.17, color: '#000', marginBottom: 20 }}>
          Diseñado para que nadie se salte la plataforma
        </h2>
        <p className="reveal d2" style={{ fontSize: 16, color: '#636363', lineHeight: 1.75, marginBottom: 16 }}>
          El teléfono del cliente solo se revela al negocio una vez confirmada la transacción. Las reseñas son verificadas. Los pagos son protegidos. La reputación solo crece dentro del sistema.
        </p>
        <p className="reveal d3" style={{ fontSize: 16, color: '#636363', lineHeight: 1.75 }}>
          No es un accidente — es cómo garantizamos que todos los incentivos estén alineados.{' '}
          <a href="#" style={{ color: '#000', textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.3)', transition: 'text-decoration-color 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = 'rgba(0,0,0,0.9)')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = 'rgba(0,0,0,0.3)')}
          >Leer sobre el modelo de confianza →</a>
        </p>
      </section>

      {/* ─── WAITLIST ────────────────────────────────────────── */}
      <section id="waitlist" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 100px', position: 'relative' }}>
        <div aria-hidden className="glow-hero" style={{ position: 'absolute', top: '50%', left: '50%', width: '60%', height: 400, background: G, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="reveal" style={{ ...card, borderRadius: 40, padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#959595', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Lista de espera</p>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.17, color: '#000', marginBottom: 16 }}>
            Sé de los primeros<br />en usar Hazlo Cash
          </h2>
          <p style={{ fontSize: 18, color: '#636363', maxWidth: 440, margin: '0 auto 44px', lineHeight: 1.55 }}>
            Lanzamos pronto en México. Regístrate y accede primero con beneficios de fundador.
          </p>

          {submitted ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,168,150,0.08)', borderRadius: 16, padding: '16px 28px', fontSize: 16, color: '#00A896', fontWeight: 500, animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
              ✓ ¡Listo! Te avisamos cuando abramos.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 500, margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="email-input"
                style={{ flex: 1, minWidth: 220, padding: '13px 20px', borderRadius: 30, border: '1.5px solid #E8E8E8', background: '#F8F8F8', fontSize: 15, color: '#000', fontFamily: 'inherit', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
              />
              <button type="submit" style={{ background: '#2D2B8F', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 500, padding: '13px 28px', borderRadius: 30, transition: 'opacity 0.2s ease', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >Unirse</button>
            </form>
          )}

          <p style={{ fontSize: 13, color: '#AEAEAE', marginTop: 20 }}>
            Sin spam. Sin compromisos. Solo te avisamos cuando abramos.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 40 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>H</span>
              </div>
              <span style={{ fontWeight: 500, fontSize: 14 }}>Hazlo Cash</span>
            </div>
            <p style={{ fontSize: 14, color: '#636363', maxWidth: 200, lineHeight: 1.65 }}>
              Recomienda. Gana. Crece.<br />México, 2025.
            </p>
          </div>

          {[
            { title: 'Producto', links: ['Cómo funciona', 'Para embajadores', 'Para negocios', 'Precios'] },
            { title: 'Empresa', links: ['Nosotros', 'Blog', 'Prensa', 'Trabaja con nosotros'] },
            { title: 'Legal', links: ['Términos de uso', 'Privacidad', 'Cookies'] },
          ].map((col) => (
            <div key={col.title}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#000', marginBottom: 14 }}>{col.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: 14, color: '#636363', textDecoration: 'none', transition: 'color 0.2s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#636363')}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 48, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#AEAEAE' }}>© 2025 Hazlo Cash. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Instagram', 'TikTok', 'WhatsApp'].map((s) => (
              <a key={s} href="#" style={{ fontSize: 13, color: '#AEAEAE', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#636363')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#AEAEAE')}
              >{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
