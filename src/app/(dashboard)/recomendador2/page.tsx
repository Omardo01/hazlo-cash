import {
  ArrowUpRightIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  QrCodeIcon,
  WalletIcon,
  CrownIcon,
  ZapIcon,
  ChevronRightIcon,
} from "lucide-react";

const negocios = [
  { name: "Tacos El Güero", category: "Comida", refs: 48, earned: 720, hue: "#FE7801" },
  { name: "Estética Luna", category: "Belleza", refs: 31, earned: 465, hue: "#F5A623" },
  { name: "Plomería Express", category: "Hogar", refs: 27, earned: 405, hue: "#00A896" },
  { name: "Mecánica Pérez", category: "Auto", refs: 19, earned: 285, hue: "#2D2B8F" },
];

const sparkPath = "M0,28 L10,24 L20,26 L30,18 L40,20 L50,12 L60,14 L70,8 L80,10 L90,4 L100,6";

export default function RecomendadorV2() {
  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Mesh gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#FE7801]/15 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[#2D2B8F]/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#00A896]/10 blur-3xl" />
      </div>

      {/* Editorial header */}
      <header className="flex items-center justify-between px-6 sm:px-10 pt-8 pb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-1">
            Lunes, 19 de mayo
          </p>
          <h1 className="text-[28px] sm:text-[34px] font-black tracking-tight leading-none text-foreground">
            Hola, <span className="text-brand-gradient">Omar</span>.
          </h1>
        </div>
        <button className="flex h-10 items-center gap-2 rounded-full border border-white/40 bg-white/60 backdrop-blur-xl px-4 text-[12px] font-semibold text-foreground shadow-sm hover:bg-white transition">
          <SparklesIcon className="h-3.5 w-3.5 text-[#FE7801]" />
          Compartir mi código
        </button>
      </header>

      {/* Bento grid */}
      <div className="flex-1 overflow-auto px-6 sm:px-10 pb-10">
        <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(0,auto)]">

          {/* HERO — Balance (col-span-7) */}
          <div className="col-span-12 lg:col-span-7 row-span-2 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-7 sm:p-9 overflow-hidden relative">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[#FE7801]/8 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Balance disponible
                </p>
                <span className="flex h-7 items-center gap-1 rounded-full bg-[#00A896]/12 px-2.5 text-[10px] font-bold text-[#00A896]">
                  <TrendingUpIcon className="h-3 w-3" />
                  +26.8%
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[13px] font-medium text-muted-foreground">$</span>
                <span className="text-[64px] sm:text-[88px] font-black tracking-tighter leading-none text-foreground">
                  1,985
                </span>
                <span className="text-[20px] font-bold text-muted-foreground">.40</span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Equivalente a <span className="font-semibold text-foreground">12 referidos</span> activos este mes
              </p>

              {/* Mini sparkline */}
              <div className="mt-6 h-12 w-full">
                <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-full w-full">
                  <defs>
                    <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FE7801" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#FE7801" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${sparkPath} L100,32 L0,32 Z`} fill="url(#sparkfill)" />
                  <path d={sparkPath} fill="none" stroke="#FE7801" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mt-6 flex gap-2.5">
                <button className="flex-1 h-11 rounded-2xl bg-brand-dark text-white text-[12px] font-bold tracking-wide hover:bg-foreground transition">
                  Retirar a CLABE
                </button>
                <button className="h-11 px-5 rounded-2xl border border-border bg-white text-[12px] font-semibold text-foreground hover:bg-secondary transition">
                  Historial
                </button>
              </div>
            </div>
          </div>

          {/* Level card (col-span-5) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-5 rounded-3xl border border-white/60 bg-gradient-to-br from-[#1A1840] to-[#2D2B8F] p-7 text-white overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#FE7801]/30 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <CrownIcon className="h-4 w-4 text-[#F5A623]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Nivel Plata</p>
              </div>

              <p className="text-[12px] text-white/60 mb-1">Próximo: Oro</p>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-4xl font-black tracking-tight">68%</span>
                <span className="text-[11px] text-white/60">/ 100%</span>
              </div>

              {/* Segmented progress */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${i < 7 ? "bg-[#F5A623]" : "bg-white/15"}`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-white/60">
                Te faltan <span className="font-bold text-white">4 referidos</span> para subir
              </p>
            </div>
          </div>

          {/* Mini stat — Referidos */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-5">
            <UsersIcon className="h-4 w-4 text-[#FE7801] mb-3" />
            <p className="text-[28px] font-black tracking-tight leading-none text-foreground">12</p>
            <p className="text-[11px] text-muted-foreground mt-1">Referidos</p>
            <p className="text-[10px] font-semibold text-[#00A896] mt-2">+3 esta semana</p>
          </div>

          {/* Mini stat — Conversión */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-5">
            <TrendingUpIcon className="h-4 w-4 text-brand-orange mb-3" />
            <p className="text-[28px] font-black tracking-tight leading-none text-foreground">68%</p>
            <p className="text-[11px] text-muted-foreground mt-1">Conversión</p>
            <p className="text-[10px] font-semibold text-[#00A896] mt-2">+5% vs mes pasado</p>
          </div>

          {/* Mini stat — Códigos */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-white">
              <QrCodeIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground">Códigos activos</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-foreground">3</span>
                <span className="text-[11px] text-muted-foreground">/ 5</span>
              </div>
            </div>
            <ArrowUpRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>

          {/* Top negocios — wide card */}
          <div className="col-span-12 lg:col-span-7 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-7">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Top negocios
                </p>
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  Donde más ganas
                </h3>
              </div>
              <button className="text-[11px] font-semibold text-[#FE7801] hover:underline">
                Ver todos →
              </button>
            </div>

            <div className="space-y-1">
              {negocios.map((neg, i) => {
                const pct = (neg.earned / 720) * 100;
                return (
                  <div key={neg.name} className="group flex items-center gap-4 py-3 border-b border-border last:border-0">
                    <span className="w-5 text-[11px] font-black text-muted-foreground tabular-nums">
                      0{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-foreground truncate">{neg.name}</p>
                      <p className="text-[11px] text-muted-foreground">{neg.category} · {neg.refs} ref.</p>
                    </div>
                    <div className="hidden sm:block w-28 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: neg.hue }}
                      />
                    </div>
                    <span className="text-[13px] font-black text-foreground tabular-nums w-16 text-right">
                      ${neg.earned}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick action — Compartir */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-5 rounded-3xl border border-white/60 bg-[#FE7801] p-7 text-white overflow-hidden relative">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/15 blur-xl" />
            <div className="relative">
              <ZapIcon className="h-5 w-5 mb-4" />
              <h3 className="text-xl font-black tracking-tight leading-tight mb-2">
                Comparte tu código
                <br />y gana hasta <span className="underline decoration-2 underline-offset-2">$50</span> por referido
              </h3>
              <p className="text-[12px] text-white/80 mb-5">
                Cada vez que alguien usa tu código, ganas comisión al instante.
              </p>

              <div className="flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-md p-2.5 border border-white/20">
                <code className="flex-1 px-2 text-[13px] font-bold tracking-wide">HAZLO-OD42</code>
                <button className="h-8 px-4 rounded-xl bg-white text-[#FE7801] text-[11px] font-bold hover:bg-white/90 transition">
                  Copiar
                </button>
              </div>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="col-span-12 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-7">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Actividad
                </p>
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  Lo último que pasó
                </h3>
              </div>
              <button className="text-[11px] font-semibold text-[#FE7801] hover:underline">
                Ver historial →
              </button>
            </div>

            <div className="relative space-y-5">
              <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" />

              {[
                { icon: WalletIcon, color: "#00A896", title: "Nueva comisión", desc: "$45 de Tacos El Güero · referido María R.", time: "Hace 12 min" },
                { icon: UsersIcon, color: "#FE7801", title: "Nuevo referido", desc: "Alguien usó tu código HAZLO-OD42", time: "Hace 1 h" },
                { icon: CrownIcon, color: "#F5A623", title: "Subiste de nivel", desc: "Ahora eres Embajador Plata", time: "Ayer" },
                { icon: WalletIcon, color: "#00A896", title: "Retiro completado", desc: "$1,200 enviados a tu CLABE ****4521", time: "Hace 3 días" },
              ].map((item, i) => (
                <div key={i} className="relative flex items-start gap-4 pl-1">
                  <div
                    className="relative z-10 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full ring-4 ring-white"
                    style={{ background: item.color }}
                  >
                    <item.icon className="h-2 w-2 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <p className="text-[13px] font-bold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
