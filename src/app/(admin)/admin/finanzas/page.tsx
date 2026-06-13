"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DollarSignIcon, ChevronRightIcon, TrendingUpIcon, FileTextIcon, DownloadIcon, ArrowUpRightIcon, ArrowDownRightIcon } from "lucide-react";

const adminTabs = [
  { label: "Overview",  href: "/admin" },
  { label: "Usuarios",  href: "/admin/users" },
  { label: "Negocios",  href: "/admin/negocios" },
  { label: "Finanzas",  href: "/admin/finanzas" },
];
import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { AdminTableSkeleton } from "@/components/ui/skeletons";

const transacciones = [
  { id: "TX-9901", date: "15 Abr, 10:24", desc: "Pago a Embajador Ana L.", type: "out", amount: "$1,200.00", fee: "$0.00" },
  { id: "TX-9902", date: "15 Abr, 09:12", desc: "Comisión Tacos El Güero", type: "in", amount: "$350.00", fee: "$350.00" },
  { id: "TX-9903", date: "15 Abr, 08:30", desc: "Comisión Sushi Go", type: "in", amount: "$890.00", fee: "$890.00" },
  { id: "TX-9904", date: "14 Abr, 16:45", desc: "Liquidación pendiente Carlos M.", type: "pending", amount: "$980.00", fee: "$0.00" },
  { id: "TX-9905", date: "14 Abr, 11:20", desc: "Comisión BarberShop X", type: "in", amount: "$120.00", fee: "$120.00" },
];

export default function AdminFinanzasPage() {
  const loading = useSimulatedLoading();
  if (loading) return (
    <>
      <DashboardHeader title="Admin" tabs={adminTabs} userName="Super Admin" userInitials="SA" avatarColor="bg-brand-dark text-white" notificationColor="bg-brand-dark" />
      <div className="flex flex-1 min-h-0 gap-0 bg-[#fbfbfd]"><AdminTableSkeleton /></div>
    </>
  );

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

          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-dark">Admin</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Finanzas</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal text-lg font-black">
                <DollarSignIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">Finanzas & Pagos</h1>
                <p className="text-xs text-muted-foreground mt-1">Control de liquidez, cuentas por pagar y retenciones.</p>
              </div>
            </div>
            <button className="hidden sm:flex h-10 px-4 items-center justify-center gap-2 rounded-xl border border-border bg-white text-foreground text-sm font-semibold hover:bg-secondary transition-colors">
              <DownloadIcon className="h-4 w-4" /> Exportar Reporte
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
            <StatCard
              title="Balance General"
              value="$1,245,000"
              change="Liq. Disponible"
              changeType="positive"
              icon={DollarSignIcon}
              iconColor="text-brand-teal"
              iconBg="bg-brand-teal/10"
            />
            <StatCard
              title="Pendiente de Pago"
              value="$45,200"
              change="24 embajadores"
              changeType="negative"
              icon={ArrowUpRightIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/10"
            />
            <StatCard
              title="Ingresos (Mes)"
              value="$380,450"
              change="+14% vs anterior"
              changeType="positive"
              icon={TrendingUpIcon}
              iconColor="text-[#FE7801]"
              iconBg="bg-[#FE7801]/10"
            />
            <StatCard
              title="Facturas / Docs"
              value="12"
              change="Archivos procesados"
              changeType="neutral"
              icon={FileTextIcon}
              iconColor="text-slate-500"
              iconBg="bg-slate-500/10"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-white flex flex-col">
            <div className="border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold">Historial Transaccional</h3>
                <p className="text-[11px] text-muted-foreground">Flujos de efectivo entrantes y salientes.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[80px_120px_1fr_100px_100px_100px] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Tx ID</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Fecha</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Descripción</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Tipo</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Comisión</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Neto</span>
                </div>

                {transacciones.map((tx) => (
                  <div key={tx.id} className="grid grid-cols-[80px_120px_1fr_100px_100px_100px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <span className="text-[11px] font-mono font-medium text-muted-foreground">{tx.id}</span>
                    <span className="text-xs text-muted-foreground">{tx.date}</span>
                    <span className="text-sm font-semibold text-foreground">{tx.desc}</span>
                    <div className="flex justify-center">
                      <span className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        tx.type === "in" ? "bg-emerald-500/10 text-emerald-500" :
                        tx.type === "out" ? "bg-red-500/10 text-red-500" :
                        "bg-brand-orange/10 text-brand-orange"
                      )}>
                        {tx.type === "in" ? <ArrowDownRightIcon className="h-3 w-3" /> :
                         tx.type === "out" ? <ArrowUpRightIcon className="h-3 w-3" /> : null}
                         {tx.type === "in" ? "Ingreso" : tx.type === "out" ? "Egreso" : "Pendiente"}
                      </span>
                    </div>
                    <span className="text-right text-xs text-muted-foreground font-medium">{tx.fee}</span>
                    <span className={cn(
                      "text-right text-sm font-bold",
                      tx.type === "in" ? "text-emerald-500" : tx.type === "out" ? "text-foreground" : "text-brand-orange"
                    )}>
                      {tx.type === "out" ? "-" : ""}{tx.amount}
                    </span>
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
