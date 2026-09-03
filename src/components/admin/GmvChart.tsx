"use client";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUpIcon } from "lucide-react";
import type { PuntoSerie } from "@/lib/services/admin";

const chartConfig = {
  gmv: { label: "GMV", color: "#FE7801" },
} satisfies ChartConfig;

const compact = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`;

export function GmvChart({ data }: { data: PuntoSerie[] }) {
  const total = data.reduce((s, p) => s + p.gmv, 0);
  const ventas = data.reduce((s, p) => s + p.ventas, 0);

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Ventas (GMV)</h3>
          <p className="text-[11px] text-muted-foreground">Últimos 14 días</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-[#FE7801]/10 px-2.5 py-1 text-xs font-semibold text-[#FE7801]">
          <TrendingUpIcon className="h-3.5 w-3.5" />
          {ventas} {ventas === 1 ? "venta" : "ventas"}
        </div>
      </div>

      {/* Estado vacío: sin ventas en el periodo */}
      {total === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
          <TrendingUpIcon className="h-7 w-7 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">Aún no hay ventas en el periodo</p>
          <p className="text-xs text-muted-foreground">Las ventas confirmadas aparecerán aquí día a día.</p>
        </div>
      ) : (
      /* Chart */
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id="gradGmv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FE7801" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#FE7801" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="dia"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fontSize: 11, fill: "#8B8BA3" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 11, fill: "#8B8BA3" }}
            tickFormatter={compact}
          />
          <ChartTooltip
            cursor={{ stroke: "#FE7801", strokeWidth: 1, strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const punto = payload[0]?.payload as PuntoSerie | undefined;
              return (
                <div className="rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-lg">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                  <p className="text-xl font-bold text-foreground leading-tight">
                    ${(punto?.gmv ?? 0).toLocaleString("es-MX")} MXN
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {punto?.ventas ?? 0} {punto?.ventas === 1 ? "venta" : "ventas"}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="gmv"
            stroke="#FE7801"
            strokeWidth={2.5}
            fill="url(#gradGmv)"
            dot={false}
            activeDot={{ r: 5, fill: "#FE7801", stroke: "white", strokeWidth: 3 }}
          />
        </AreaChart>
      </ChartContainer>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-[3px] w-6 rounded-full bg-[#FE7801]" />
          <span className="text-[11px] text-muted-foreground">GMV por día</span>
        </div>
        <span className="text-[11px] font-semibold text-foreground">
          Total: ${total.toLocaleString("es-MX")} MXN
        </span>
      </div>
    </div>
  );
}
