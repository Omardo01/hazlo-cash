"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ── Donut data ──────────────────────────────────────────────────────────────
const donutData = [
  { name: "Comida", value: 3124213, color: "var(--brand-purple)" },
  { name: "Flujo recomendado", value: 1523151, color: "rgba(45,43,143,0.45)" },
  { name: "Otros", value: 948213, color: "rgba(45,43,143,0.15)" },
];

const totalDonut = donutData.reduce((s, d) => s + d.value, 0);

// ── Active % data ────────────────────────────────────────────────────────────
const activeUsers = 179;
const inactiveUsers = 394;
const totalActive = activeUsers + inactiveUsers;
const activePct = (activeUsers / totalActive) * 100;

// ── Legend item ──────────────────────────────────────────────────────────────
function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-[9px] h-[4px] w-[30px] shrink-0 rounded-full" style={{ background: color }} />
      <div className="flex flex-col gap-[3px]">
        <p className="text-sm text-muted-foreground leading-snug">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ReferralDistribution() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

      {/* ── Left: Referidos (Perpetual) ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-white p-5">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Referidos</h3>
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground select-none">
            i
          </span>
        </div>

        {/* Donut + legend side-by-side */}
        <div className="flex items-center gap-5">
          {/* Donut */}
          <div className="relative h-[130px] w-[130px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[15px] font-black leading-none text-foreground">
                {(totalDonut / 1_000_000).toFixed(1)}M
              </span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-4">
            {donutData.map((item) => (
              <LegendItem
                key={item.name}
                color={item.color}
                label={item.name}
                value={item.value.toLocaleString("es-MX")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Porcentaje Activo ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-white p-5">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Porcentaje Activo</h3>
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground select-none">
            i
          </span>
        </div>

        {/* Big number */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-[30px] font-black leading-[46px] text-foreground">
            {totalActive}
          </span>
          <span className="text-sm text-muted-foreground">Total</span>
        </div>

        {/* Progress bar */}
        <div className="relative mb-5 h-[4px] w-full overflow-hidden rounded-full bg-brand-purple/20">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-brand-purple transition-all duration-700"
            style={{ width: `${activePct}%` }}
          />
        </div>

        {/* Online / Offline */}
        <div className="flex items-start gap-10">
          <LegendItem
            color="var(--brand-purple)"
            label="Activos"
            value={`${activeUsers} ref.`}
          />
          <LegendItem
            color="rgba(45,43,143,0.2)"
            label="Inactivos"
            value={`${inactiveUsers} ref.`}
          />
        </div>
      </div>

    </div>
  );
}
