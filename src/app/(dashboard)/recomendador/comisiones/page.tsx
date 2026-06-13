"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  WalletIcon,
  TrendingUpIcon,
  ArrowDownToLineIcon,
  ClockIcon,
  CheckCircle2Icon,
  DownloadIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { ComisionesSkeleton } from "@/components/ui/skeletons";

// ── Data ──────────────────────────────────────────────────────────────────────

const monthlyData = [
  { mes: "Nov", ganado: 820 },
  { mes: "Dic", ganado: 1240 },
  { mes: "Ene", ganado: 680 },
  { mes: "Feb", ganado: 1580 },
  { mes: "Mar", ganado: 1320 },
  { mes: "Abr", ganado: 1985, current: true },
];

const chartConfig = {
  ganado: { label: "Ganado", color: "#FE7801" },
} satisfies ChartConfig;

const transactions = [
  { id: "T001", negocio: "Tacos El Güero",   iniciales: "TG", bg: "bg-brand-orange",  categoria: "Comida",      fecha: "Hoy, 14:32",       monto: 120,  comision: 6,     estado: "confirmada" },
  { id: "T002", negocio: "Estética Luna",    iniciales: "EL", bg: "bg-[#F5A623]",     categoria: "Belleza",     fecha: "Hoy, 11:20",       monto: 350,  comision: 17.50, estado: "pendiente"  },
  { id: "T003", negocio: "Plomería Express", iniciales: "PE", bg: "bg-brand-dark",    categoria: "Hogar",       fecha: "Ayer, 18:05",      monto: 800,  comision: 40,    estado: "pagada"     },
  { id: "T004", negocio: "Mecánica Pérez",   iniciales: "MP", bg: "bg-brand-dark",    categoria: "Automotriz",  fecha: "Ayer, 10:48",      monto: 1200, comision: 60,    estado: "pagada"     },
  { id: "T005", negocio: "Tacos El Güero",   iniciales: "TG", bg: "bg-brand-orange",  categoria: "Comida",      fecha: "9 Abr, 20:15",     monto: 90,   comision: 4.50,  estado: "pagada"     },
  { id: "T006", negocio: "Lavandería Clean", iniciales: "LC", bg: "bg-[#E55000]",     categoria: "Servicios",   fecha: "8 Abr, 09:30",     monto: 180,  comision: 9,     estado: "confirmada" },
  { id: "T007", negocio: "Estética Luna",    iniciales: "EL", bg: "bg-[#F5A623]",     categoria: "Belleza",     fecha: "7 Abr, 16:00",     monto: 450,  comision: 22.50, estado: "pendiente"  },
  { id: "T008", negocio: "Mecánica Pérez",   iniciales: "MP", bg: "bg-brand-dark",    categoria: "Automotriz",  fecha: "5 Abr, 12:10",     monto: 650,  comision: 32.50, estado: "pagada"     },
] as const;

type EstadoKey = "confirmada" | "pendiente" | "pagada";
type Filter = "todos" | EstadoKey;

const estadoConfig: Record<EstadoKey, { label: string; dot: string; text: string; bg: string }> = {
  confirmada: { label: "Confirmada", dot: "bg-[#F5A623]",     text: "text-[#E55000]",    bg: "bg-[#F5A623]/10"    },
  pendiente:  { label: "Pendiente",  dot: "bg-brand-orange", text: "text-brand-orange", bg: "bg-brand-orange/10" },
  pagada:     { label: "Pagada",     dot: "bg-[#1A1840]",    text: "text-[#1A1840]",    bg: "bg-[#1A1840]/8"     },
};

const ingresosPorNegocio = [
  { neg: "Tacos El Güero",   bg: "bg-brand-orange",  ini: "TG", pct: 38, monto: "$720"  },
  { neg: "Mecánica Pérez",   bg: "bg-brand-dark",    ini: "MP", pct: 28, monto: "$530"  },
  { neg: "Estética Luna",    bg: "bg-[#F5A623]",     ini: "EL", pct: 21, monto: "$398"  },
  { neg: "Plomería Express", bg: "bg-brand-dark",    ini: "PE", pct: 13, monto: "$246"  },
];

const ultimosRetiros = [
  { fecha: "1 Abr",  monto: "$1,200", estado: "Acreditado" },
  { fecha: "15 Mar", monto: "$850",   estado: "Acreditado" },
  { fecha: "28 Feb", monto: "$1,500", estado: "Acreditado" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComisionesPage() {
  const loading = useSimulatedLoading();
  const [filter, setFilter] = useState<Filter>("todos");

  const filteredTx = filter === "todos"
    ? transactions
    : transactions.filter((t) => t.estado === filter);

  if (loading) return <><DashboardHeader title="Comisiones" /><ComisionesSkeleton /></>;

  return (
    <>
      <DashboardHeader title="Comisiones" />

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-[#FE7801]">Recomendador</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Comisiones</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              title="Total ganado"
              value="$7,625"
              change="+18% vs año pasado"
              changeType="positive"
              icon={WalletIcon}
              iconColor="text-[#F5A623]"
              iconBg="bg-[#F5A623]/8"
            />
            <StatCard
              title="Pendiente"
              value="$285"
              change="3 transacciones"
              changeType="neutral"
              icon={ClockIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/8"
            />
            <StatCard
              title="Retirado"
              value="$5,355"
              change="Último: 1 Abr"
              changeType="neutral"
              icon={ArrowDownToLineIcon}
              iconColor="text-[#FE7801]"
              iconBg="bg-[#FE7801]/8"
            />
            <StatCard
              title="Este mes"
              value="$1,985"
              change="+$420 vs mes anterior"
              changeType="positive"
              icon={TrendingUpIcon}
              iconColor="text-[#1A1840]"
              iconBg="bg-[#1A1840]/8"
            />
          </div>

          {/* Monthly bar chart */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Ingresos mensuales</h3>
              <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
            </div>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart
                data={monthlyData}
                barSize={32}
                margin={{ top: 4, right: 0, bottom: 0, left: -14 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#8B8BA3" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#8B8BA3" }}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const val = payload[0]?.value as number;
                    return (
                      <div className="rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-lg">
                        <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-xl font-bold text-foreground">
                          ${val?.toLocaleString("es-MX")} MXN
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="ganado" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((entry) => (
                    <Cell
                      key={entry.mes}
                      fill={entry.current ? "#FE7801" : "rgba(254,120,1,0.15)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          {/* Transaction list */}
          <div className="rounded-2xl border border-border bg-white">

            {/* Table toolbar */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["todos", "pendiente", "confirmada", "pagada"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                      filter === f
                        ? "text-white shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-border"
                    )}
                    style={filter === f ? { background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" } : {}}
                  >
                    {f === "todos" ? "Todos" : estadoConfig[f].label}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                <DownloadIcon className="h-3.5 w-3.5" />
                Exportar
              </button>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 border-b border-border">
              {["Negocio", "Venta", "Comisión", "Estado"].map((h) => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filteredTx.map((tx, i) => (
              <div key={tx.id}>
                <div className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white", tx.bg)}>
                      {tx.iniciales}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{tx.negocio}</p>
                      <p className="text-[11px] text-muted-foreground">{tx.categoria} · {tx.fecha}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    ${tx.monto.toLocaleString("es-MX")}
                  </span>
                  <span className="text-xs font-bold text-[#FE7801]">
                    +${tx.comision.toFixed(2)}
                  </span>
                  <div className={cn(
                    "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    estadoConfig[tx.estado].bg,
                    estadoConfig[tx.estado].text
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", estadoConfig[tx.estado].dot)} />
                    {estadoConfig[tx.estado].label}
                  </div>
                </div>
                {i < filteredTx.length - 1 && <div className="mx-5 h-px bg-border" />}
              </div>
            ))}

            {filteredTx.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Sin transacciones en este estado.
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto">
          <div className="flex flex-col gap-4 p-5">

            {/* Withdraw card */}
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
                Disponible para retirar
              </p>
              <p className="text-3xl font-black mb-0.5">$1,700</p>
              <p className="text-xs text-white/50">CLABE ···· 4821 · BBVA</p>
              <div className="mt-4 h-px bg-white/10" />
              <button className="mt-4 w-full rounded-xl bg-white/15 hover:bg-white/25 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]">
                Retirar saldo →
              </button>
            </div>

            {/* Last withdrawals */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Últimos retiros</h3>
              {ultimosRetiros.map((r) => (
                <div
                  key={r.fecha}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{r.monto}</p>
                    <p className="text-[11px] text-muted-foreground">{r.fecha} · {r.estado}</p>
                  </div>
                  <CheckCircle2Icon className="h-4 w-4 text-[#FE7801] shrink-0" />
                </div>
              ))}
            </div>

            {/* Income by business */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Por negocio</h3>
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                {ingresosPorNegocio.map((b, i, arr) => (
                  <div key={b.neg}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white", b.bg)}>
                        {b.ini}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">{b.neg}</p>
                        <div className="mt-1.5 h-1 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${b.pct}%`,
                              background: "linear-gradient(90deg, #FE7801, #EB4E00)",
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#FE7801] shrink-0">{b.monto}</span>
                    </div>
                    {i < arr.length - 1 && <div className="mx-4 h-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
