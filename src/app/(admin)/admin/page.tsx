"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  SearchIcon,
  MoonIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  UsersIcon,
  MapPinIcon,
  DollarSignIcon,
  ActivityIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ShieldAlertIcon,
  ArrowRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const revenueData = [
  { month: "Ene", revenue: 120000 },
  { month: "Feb", revenue: 155000 },
  { month: "Mar", revenue: 198000 },
  { month: "Abr", revenue: 245000 },
  { month: "May", revenue: 290000 },
  { month: "Jun", revenue: 380000 },
];

const chartConfig = {
  revenue: { label: "Ingresos (MXN)", color: "var(--brand-purple)" },
} satisfies ChartConfig;

const pendingActions = [
  { id: "A01", type: "negocio", title: "Aprobar 'El rincón del bife'", request: "Verificación de Domicilio", time: "Hace 10 min", status: "pending" },
  { id: "A02", type: "pago", title: "Payout Embajador HAZLO-OD42", request: "Liquidación $2,400 MXN", time: "Hace 1 hora", status: "pending" },
  { id: "A03", type: "fraude", title: "Alerta de múltiples referidos", request: "Cuenta HAZLO-MR18", time: "Hace 2 horas", status: "review" },
];

const recentActivity = [
  { id: "T1201", desc: "Pago procesado a embajador Ana L.", amount: "-$1,200", type: "payout", date: "Hoy, 10:24 AM" },
  { id: "T1202", desc: "Comisión plataforma 'Tacos El Güero'", amount: "+$350", type: "income", date: "Hoy, 09:12 AM" },
  { id: "T1203", desc: "Comisión plataforma 'Sushi Go'", amount: "+$890", type: "income", date: "Hoy, 08:30 AM" },
  { id: "T1204", desc: "Nuevo negocio activado 'La Pizzería'", amount: "N/A", type: "system", date: "Ayer, 16:45 PM" },
];

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const adminTabs = [
  { label: "Overview",  href: "/admin" },
  { label: "Usuarios",  href: "/admin/users" },
  { label: "Negocios",  href: "/admin/negocios" },
  { label: "Finanzas",  href: "/admin/finanzas" },
];

// ── Page Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <>
      <DashboardHeader
        title="Admin"
        tabs={adminTabs}
        userName="Super Admin"
        userInitials="SA"
        avatarColor="bg-brand-dark text-white"
        notificationColor="bg-brand-dark"
      />

      <div className="flex flex-1 min-h-0 gap-0 bg-[#fbfbfd]">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-dark">Control Panel</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Visión General</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-dark/10 text-brand-dark text-lg font-black">
              <ShieldAlertIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">Admin Workspace</h1>
              <p className="text-xs text-muted-foreground mt-1">Supervisa y controla toda la operativa de Hazlo Cash.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <StatCard
              title="Ingresos Plataforma"
              value="$380k"
              change="+22% mes pasado"
              changeType="positive"
              icon={DollarSignIcon}
              iconColor="text-brand-purple"
              iconBg="bg-brand-purple/10"
            />
            <StatCard
              title="Embajadores Activos"
              value="1,240"
              change="+145 esta semana"
              changeType="positive"
              icon={UsersIcon}
              iconColor="text-brand-teal"
              iconBg="bg-brand-teal/10"
            />
            <StatCard
              title="Negocios Afiliados"
              value="385"
              change="+34 pendientes"
              changeType="neutral"
              icon={MapPinIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/10"
            />
            <StatCard
              title="Salud del Sistema"
              value="99.9%"
              change="Todos los sist. operables"
              changeType="positive"
              icon={ActivityIcon}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-500/10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
            
            {/* Chart Section */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-4 sm:p-5 flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Crecimiento de Ingresos (Comisiones)</h3>
                  <p className="text-xs text-muted-foreground">Volumen neto retenido por Hazlo Cash</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                  <TrendingUpIcon className="h-4 w-4 text-foreground" />
                </div>
              </div>
              
              <div className="flex-1 mt-2 min-h-[220px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-purple)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--brand-purple)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(val) => `$${val/1000}k`} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-lg">
                            <p className="text-[10px] text-muted-foreground">{label}</p>
                            <p className="text-lg font-bold">${payload[0].value?.toLocaleString()} MXN</p>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--brand-purple)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>

            {/* Action Required Panel */}
            <div className="rounded-2xl border border-border bg-white flex flex-col">
              <div className="border-b border-border p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <AlertCircleIcon className="h-4 w-4 text-brand-dark" />
                    Requiere tu atención
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{pendingActions.length} tareas pendientes</p>
                </div>
                <button className="text-xs font-semibold text-brand-purple hover:underline">Ver todas</button>
              </div>
              <div className="flex flex-col p-2">
                {pendingActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-3 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer group">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      action.type === "negocio" ? "bg-brand-orange/10 text-brand-orange" :
                      action.type === "pago" ? "bg-brand-teal/10 text-brand-teal" :
                      "bg-brand-dark/10 text-brand-dark"
                    )}>
                      {action.type === "negocio" ? <MapPinIcon className="h-4 w-4" /> :
                       action.type === "pago" ? <DollarSignIcon className="h-4 w-4" /> :
                       <ShieldAlertIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">{action.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{action.request}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                      <span className="text-[9px] text-muted-foreground">{action.time}</span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRightIcon className="h-3 w-3 text-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto p-4 pt-1">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-semibold transition-colors">
                  Iniciar ciclo de revisión
                </button>
              </div>
            </div>

          </div>

          {/* System Activity Table */}
          <div className="mt-2 rounded-2xl border border-border bg-white flex flex-col overflow-hidden">
            <div className="border-b border-border p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Actividad Reciente del Sistema</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Movimientos financieros y altas en las últimas 24 hrs.</p>
              </div>
              <div className="flex gap-2">
                <button className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary">Filtros</button>
                <button className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary">Exportar</button>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-2.5 border-b border-border bg-secondary/30">
                <span className="text-[10px] uppercase font-bold text-muted-foreground w-16">ID</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Descripción</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground w-28 text-right">Monto</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground w-32 text-right">Fecha</span>
              </div>
              {recentActivity.map((act) => (
                <div key={act.id} className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto_auto] sm:gap-4 sm:items-center px-4 sm:px-5 py-3.5 border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <div className="flex justify-between items-center sm:block w-full sm:w-16">
                    <span className="font-mono text-[10px] font-medium text-muted-foreground">{act.id}</span>
                    <span className="sm:hidden text-[10px] text-muted-foreground">{act.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    {act.type === "income" ? <div className="h-1.5 w-1.5 rounded-full bg-brand-purple" /> :
                     act.type === "payout" ? <div className="h-1.5 w-1.5 rounded-full bg-brand-orange" /> :
                     <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                    <span className="text-xs font-semibold text-foreground">{act.desc}</span>
                  </div>
                  <div className="flex justify-between items-center sm:block mt-2 sm:mt-0 w-full sm:w-28 text-left sm:text-right">
                    <span className="sm:hidden text-[10px] uppercase text-muted-foreground">Monto</span>
                    <span className={cn(
                      "text-xs font-bold font-mono",
                      act.amount.startsWith("+") ? "text-brand-purple" : act.amount.startsWith("-") ? "text-foreground" : "text-muted-foreground"
                    )}>{act.amount}</span>
                  </div>
                  <div className="hidden sm:block w-32 text-right">
                    <span className="text-[11px] text-muted-foreground">{act.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
