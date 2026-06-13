"use client";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarIcon, MoreHorizontalIcon } from "lucide-react";

const chartData = [
  { day: "1", thisMes: 90, mesPasado: 65 },
  { day: "5", thisMes: 155, mesPasado: 118 },
  { day: "10", thisMes: 240, mesPasado: 172 },
  { day: "13", thisMes: 325, mesPasado: 200 },
  { day: "15", thisMes: 298, mesPasado: 218 },
  { day: "20", thisMes: 358, mesPasado: 245 },
  { day: "25", thisMes: 310, mesPasado: 230 },
  { day: "30", thisMes: 420, mesPasado: 288 },
];

const chartConfig = {
  thisMes: { label: "Este mes", color: "#FE7801" },
  mesPasado: { label: "Mes pasado", color: "rgba(254,120,1,0.25)" },
} satisfies ChartConfig;

export function EarningsChart() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">Comisiones totales</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">Periodo</span>
          <div className="flex items-center gap-1.5 rounded border border-border bg-white px-2.5 py-1 text-xs font-medium text-foreground">
            Abr 2026
            <CalendarIcon className="h-3 w-3 text-muted-foreground ml-0.5" />
          </div>
          <button className="flex h-7 w-7 items-center justify-center rounded border border-border hover:bg-secondary transition-colors">
            <MoreHorizontalIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart data={chartData} margin={{ top: 8, right: 0, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id="gradThisMes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FE7801" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#FE7801" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradMesPasado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FE7801" stopOpacity={0.07} />
              <stop offset="95%" stopColor="#FE7801" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
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
            cursor={{ stroke: "#FE7801", strokeWidth: 1, strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const val = payload[0]?.value as number | undefined;
              return (
                <div className="rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-lg">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Este mes</p>
                  <p className="text-xl font-bold text-foreground leading-tight">
                    ${val?.toLocaleString("es-MX")} MXN
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Día {label}</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="mesPasado"
            stroke="rgba(254,120,1,0.22)"
            strokeWidth={2}
            fill="url(#gradMesPasado)"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="thisMes"
            stroke="#FE7801"
            strokeWidth={2.5}
            fill="url(#gradThisMes)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#FE7801",
              stroke: "white",
              strokeWidth: 3,
            }}
          />
        </AreaChart>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="h-[3px] w-6 rounded-full bg-[#FE7801]" />
          <span className="text-[11px] text-muted-foreground">Este mes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-[3px] w-6 rounded-full bg-[#FE7801]/20" />
          <span className="text-[11px] text-muted-foreground">Mes pasado</span>
        </div>
      </div>
    </div>
  );
}
