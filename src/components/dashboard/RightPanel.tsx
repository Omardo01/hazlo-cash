"use client";

import { ExternalLinkIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const negocios = [
  { name: "Tacos El Güero",    category: "Comida",     initials: "TG", bg: "bg-brand-orange", refs: "48 ref." },
  { name: "Estética Luna",     category: "Belleza",    initials: "EL", bg: "bg-[#F5A623]",    refs: "31 ref." },
  { name: "Plomería Express",  category: "Hogar",      initials: "PE", bg: "bg-brand-dark",   refs: "27 ref." },
  { name: "Mecánica Pérez",    category: "Automotriz", initials: "MP", bg: "bg-brand-dark",   refs: "19 ref." },
];

// Mini donut for "Mis Ingresos" — 46% filled
const ingresosPct = 46;
const donutMini = [
  { v: ingresosPct },
  { v: 100 - ingresosPct },
];

export function RightPanel() {
  return (
    <div className="flex flex-col gap-4">

      {/* ── Heading ── */}
      <div className="flex items-center gap-2 pt-1">
        <h3 className="text-sm font-semibold text-foreground">Negocios Activos</h3>
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground cursor-help select-none">i</span>
      </div>

      {/* ── Featured business card ── */}
      <div className="rounded-2xl overflow-hidden border border-transparent bg-brand-dark shadow-[0px_8px_16px_rgba(26,24,64,0.18)]">
        <div className="px-4 py-4">
          <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1">Negocio top</p>
          <p className="text-base font-bold text-white leading-tight">Tacos El Güero</p>
          <p className="text-xs text-white/50 mt-0.5">48 referidos · Comida</p>
        </div>
        <div className="h-px bg-white/[0.07]" />
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-[11px] text-white/60">Comisión acumulada</span>
          <span className="ml-auto text-sm font-bold text-[#FE7801]">+$720 MXN</span>
        </div>
      </div>

      {/* ── Link ── */}
      <button className="flex items-center gap-1.5 text-[12px] text-[#FE7801] font-medium hover:underline transition-colors -mt-1 w-fit">
        <ExternalLinkIcon className="h-3 w-3" />
        Ver perfil del negocio
      </button>

      {/* ── Business list ── */}
      <div className="rounded-2xl border border-border bg-white shadow-[0px_8px_16px_rgba(50,50,71,0.06)] overflow-hidden">
        {negocios.map((neg, i) => (
          <div key={neg.name}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white ${neg.bg}`}>
                {neg.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground leading-tight">{neg.category}</p>
                <p className="text-xs font-semibold text-foreground">{neg.name}</p>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">{neg.refs}</span>
            </div>
            {i < negocios.length - 1 && <div className="mx-4 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* ── My Income heading ── */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Mis Ingresos</h3>
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground cursor-help select-none">i</span>
      </div>

      {/* ── Mini income card — fondo blanco + ring púrpura adentro (Figma: Chart 02) ── */}
      <div className="relative h-[80px] rounded-2xl bg-white shadow-[0px_8px_8px_rgba(50,50,71,0.08),0px_8px_16px_rgba(50,50,71,0.06)]">
        {/* Ring 60×60 centrado verticalmente, anclado al lado izquierdo del card */}
        <div
          className="pointer-events-none absolute h-[60px] w-[60px]"
          style={{ left: "25px", top: "10px" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutMini}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={28}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="v"
                strokeWidth={0}
              >
                <Cell fill="#FE7801" />
                <Cell fill="rgba(120,114,128,0.16)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* % dentro del ring */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold" style={{ color: "#1A1840" }}>{ingresosPct}%</span>
          </div>
        </div>

        {/* Texto — empieza después del ring (ring termina en ~85px desde izquierda) */}
        <div className="flex h-full items-center justify-between pl-[96px] pr-5">
          <span className="text-sm" style={{ color: "rgba(60,60,67,0.6)" }}>Meta mensual</span>
          <span className="text-[13px] font-semibold" style={{ color: "#FE7801" }}>+25%</span>
        </div>
      </div>

    </div>
  );
}
