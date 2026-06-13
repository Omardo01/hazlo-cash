import {
  ArrowUpRightIcon,
  PlusIcon,
  TrendingUpIcon,
  BellIcon,
  ShareIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  ZapIcon,
  GiftIcon,
} from "lucide-react";

const negocios = [
  { name: "Tacos El Güero", category: "Comida", initials: "TG", refs: 48, gradient: "from-[#FE7801] to-[#EB4E00]" },
  { name: "Estética Luna", category: "Belleza", initials: "EL", refs: 31, gradient: "from-[#F5A623] to-[#E68900]" },
  { name: "Plomería Express", category: "Hogar", initials: "PE", refs: 27, gradient: "from-[#00A896] to-[#007F70]" },
  { name: "Mecánica Pérez", category: "Auto", initials: "MP", refs: 19, gradient: "from-[#2D2B8F] to-[#1A1840]" },
  { name: "Café Nube", category: "Comida", initials: "CN", refs: 14, gradient: "from-[#6366F1] to-[#4338CA]" },
];

const actividad = [
  { type: "comision", amount: "+$45", from: "Tacos El Güero", desc: "María R. usó tu código", time: "12m", color: "#00A896" },
  { type: "referido", amount: null, from: "Nuevo referido", desc: "Tu código HAZLO-OD42 fue activado", time: "1h", color: "#FE7801" },
  { type: "nivel", amount: null, from: "¡Subiste de nivel!", desc: "Ahora eres Embajador Plata", time: "Ayer", color: "#F5A623" },
  { type: "retiro", amount: "-$1,200", from: "Retiro a CLABE", desc: "Enviado a ****4521", time: "3d", color: "#2D2B8F" },
];

export default function RecomendadorV3() {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto bg-[#F5F5F8] scrollbar-none">

      {/* Top bar — status chips estilo Instagram stories */}
      <div className="sticky top-0 z-20 bg-[#F5F5F8]/80 backdrop-blur-xl px-5 pt-6 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-full p-[2px] bg-gradient-to-br from-[#FE7801] via-[#F5A623] to-[#00A896]">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[12px] font-black text-foreground">
                OD
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Buenas tardes</p>
              <p className="text-[14px] font-black tracking-tight text-foreground">Omar D.</p>
            </div>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-border">
            <BellIcon className="h-4 w-4 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FE7801] text-[9px] font-bold text-white">
              3
            </span>
          </button>
        </div>

        {/* Story-style segmented progress */}
        <div className="flex gap-1">
          {[
            { active: true, label: "Hoy", val: "$185" },
            { active: true, label: "Semana", val: "$420" },
            { active: true, label: "Mes", val: "$1.9k" },
            { active: false, label: "Año", val: "$8.4k" },
          ].map((s) => (
            <div key={s.label} className="flex-1">
              <div className={`h-1 rounded-full ${s.active ? "bg-[#FE7801]" : "bg-border"}`} />
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground">{s.label}</span>
                <span className={`text-[10px] font-bold ${s.active ? "text-foreground" : "text-muted-foreground"}`}>{s.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5 pb-32">

        {/* HERO Balance Card — full bleed gradient */}
        <div className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-[0_20px_50px_-12px_rgba(254,120,1,0.45)]"
          style={{ background: "linear-gradient(135deg, #1A1840 0%, #2D2B8F 45%, #FE7801 130%)" }}>
          {/* Decorative blurs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#F5A623]/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                Balance Hazlo Cash
              </p>
              <span className="flex h-6 items-center gap-1 rounded-full bg-white/15 backdrop-blur-md px-2.5 text-[10px] font-bold">
                <TrendingUpIcon className="h-2.5 w-2.5" />
                +26.8%
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[14px] font-semibold text-white/70">$</span>
              <span className="text-[52px] font-black tracking-tighter leading-none">
                1,985
              </span>
              <span className="text-[18px] font-bold text-white/70">.40</span>
              <span className="ml-1.5 text-[11px] text-white/60">MXN</span>
            </div>

            <p className="text-[11px] text-white/60 mb-6">
              Disponible para retirar a tu CLABE
            </p>

            {/* Mini wave decoration */}
            <svg viewBox="0 0 200 30" preserveAspectRatio="none" className="mb-5 h-6 w-full opacity-70">
              <path
                d="M0,15 Q25,5 50,15 T100,15 T150,15 T200,15"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="flex gap-2">
              <button className="flex-1 h-12 rounded-2xl bg-white text-foreground text-[13px] font-black hover:bg-white/95 transition flex items-center justify-center gap-2">
                <ArrowUpRightIcon className="h-4 w-4" />
                Retirar
              </button>
              <button className="h-12 px-5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-[13px] font-bold text-white hover:bg-white/25 transition flex items-center gap-2">
                <ShareIcon className="h-3.5 w-3.5" />
                Compartir
              </button>
            </div>
          </div>
        </div>

        {/* Quick action chips */}
        <div className="flex gap-2 -mx-1 px-1 overflow-x-auto scrollbar-none">
          {[
            { icon: ZapIcon, label: "Mi código", sub: "HAZLO-OD42" },
            { icon: GiftIcon, label: "Invitar amigo", sub: "Gana $50" },
            { icon: PlusIcon, label: "Nuevo código", sub: "2 disponibles" },
          ].map((c) => (
            <button
              key={c.label}
              className="shrink-0 flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 hover:border-foreground/30 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FE7801]/10">
                <c.icon className="h-4 w-4 text-[#FE7801]" />
              </div>
              <div className="text-left">
                <p className="text-[12px] font-bold text-foreground leading-tight">{c.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{c.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Stats row — solo 2, más respiración */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Referidos</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[32px] font-black tracking-tight leading-none text-foreground">12</span>
              <span className="text-[11px] font-bold text-[#00A896]">+3</span>
            </div>
            <div className="mt-3 flex h-1 gap-0.5">
              {[5, 8, 6, 9, 7, 11, 12].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-[#FE7801]"
                  style={{ opacity: 0.3 + (h / 12) * 0.7 }}
                />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Últimos 7 días</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Conversión</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[32px] font-black tracking-tight leading-none text-foreground">68%</span>
              <span className="text-[11px] font-bold text-[#00A896]">+5%</span>
            </div>
            {/* Ring chart inline */}
            <div className="mt-3 relative h-1 rounded-full bg-secondary overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FE7801] to-[#F5A623]" style={{ width: "68%" }} />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">vs. mes pasado</p>
          </div>
        </div>

        {/* Próximo nivel — gamificación */}
        <div className="rounded-2xl border border-border bg-white p-5 overflow-hidden relative">
          <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[#F5A623]/12 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tu nivel</p>
                <h3 className="text-[18px] font-black tracking-tight text-foreground">Plata → <span className="text-[#F5A623]">Oro</span></h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FE7801] text-white text-[20px] shadow-[0_8px_20px_-4px_rgba(245,166,35,0.5)]">
                👑
              </div>
            </div>

            <div className="mb-2 flex items-end justify-between">
              <span className="text-[11px] text-muted-foreground">8 / 12 referidos</span>
              <span className="text-[11px] font-bold text-foreground">68%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FE7801] to-[#F5A623] relative"
                style={{ width: "68%" }}
              >
                <div className="absolute inset-y-0 right-0 w-1 bg-white/60 rounded-full" />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">
              <CheckCircle2Icon className="inline h-3 w-3 mr-1 text-[#00A896]" />
              4 referidos más y tu comisión sube al <span className="font-bold text-foreground">15%</span>
            </p>
          </div>
        </div>

        {/* Mis negocios — horizontal scroll */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-[16px] font-black tracking-tight text-foreground">Mis negocios</h3>
            <button className="text-[11px] font-bold text-[#FE7801]">Ver todos</button>
          </div>

          <div className="flex gap-3 -mx-5 px-5 overflow-x-auto scrollbar-none pb-1">
            {negocios.map((neg) => (
              <div
                key={neg.name}
                className="shrink-0 w-[155px] rounded-2xl border border-border bg-white p-4 hover:border-foreground/20 transition"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${neg.gradient} text-white text-[13px] font-black mb-3 shadow-sm`}>
                  {neg.initials}
                </div>
                <p className="text-[12px] font-bold text-foreground leading-tight truncate">{neg.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{neg.category}</p>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Referidos</span>
                  <span className="text-[13px] font-black text-foreground">{neg.refs}</span>
                </div>
              </div>
            ))}

            {/* Add new business card */}
            <button className="shrink-0 w-[155px] rounded-2xl border-2 border-dashed border-border bg-transparent flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                <PlusIcon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold">Agregar negocio</span>
            </button>
          </div>
        </div>

        {/* Actividad reciente — feed conversacional */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-[16px] font-black tracking-tight text-foreground">Actividad</h3>
            <button className="text-[11px] font-bold text-[#FE7801]">Historial</button>
          </div>

          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            {actividad.map((act, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/40 transition border-b border-border last:border-0"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ background: act.color }}
                >
                  {act.type === "comision" && <ZapIcon className="h-4 w-4" />}
                  {act.type === "referido" && <PlusIcon className="h-4 w-4" />}
                  {act.type === "nivel" && <span className="text-base">👑</span>}
                  {act.type === "retiro" && <ArrowUpRightIcon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground leading-tight">{act.from}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{act.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  {act.amount && (
                    <p className={`text-[13px] font-black ${act.amount.startsWith("+") ? "text-[#00A896]" : "text-foreground"}`}>
                      {act.amount}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{act.time}</p>
                </div>
                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* CTA tip */}
        <div className="rounded-2xl border border-[#FE7801]/20 bg-gradient-to-br from-[#FE7801]/5 to-[#F5A623]/5 p-4 flex items-center gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-foreground leading-tight">
              Tip del día
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
              Comparte tu código en WhatsApp con un audio personal. Convierte 3× más que un texto.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
