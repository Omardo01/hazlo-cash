import {
  DollarSignIcon,
  ChevronRightIcon,
  CreditCardIcon,
  WalletIcon,
  TrendingUpIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ADMIN_TABS } from "@/lib/adminNav";
import { cn } from "@/lib/utils";
import { money, fechaCorta } from "@/lib/format";
import { requireAdmin, getFinanzasAdmin } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminFinanzasPage() {
  const admin = await requireAdmin();
  const fin = await getFinanzasAdmin();

  return (
    <>
      <DashboardHeader
        title="Admin"
        tabs={ADMIN_TABS}
        userName={admin.nombre}
        userInitials={admin.iniciales}
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

          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
              <DollarSignIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">Finanzas & Pagos</h1>
              <p className="text-xs text-muted-foreground mt-1">Flujo de créditos y comisiones de la plataforma.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Recargas (ingresos)"
              value={money(fin.recargasTotal)}
              change="Créditos activados"
              changeType="positive"
              icon={TrendingUpIcon}
              iconColor="text-brand-teal"
              iconBg="bg-brand-teal/10"
            />
            <StatCard
              title="Comisiones pagadas"
              value={money(fin.comisionesPagadas)}
              change="A recomendadores"
              changeType="neutral"
              icon={DollarSignIcon}
              iconColor="text-[#FE7801]"
              iconBg="bg-[#FE7801]/10"
            />
            <StatCard
              title="Créditos en circulación"
              value={money(fin.creditosCirculando)}
              change="Saldo de negocios"
              changeType="neutral"
              icon={CreditCardIcon}
              iconColor="text-indigo-500"
              iconBg="bg-indigo-500/10"
            />
            <StatCard
              title="Por pagar"
              value={money(fin.porPagar)}
              change="En wallets"
              changeType="negative"
              icon={WalletIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/10"
            />
          </div>

          <div className="mt-2 rounded-2xl border border-border bg-white flex flex-col">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-bold">Historial transaccional</h3>
              <p className="text-[11px] text-muted-foreground">Recargas, comisiones y ajustes de saldo.</p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[140px_1fr_120px_120px] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Fecha</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Descripción</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Tipo</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Monto</span>
                </div>

                {fin.movimientos.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    Aún no hay movimientos financieros.
                  </div>
                )}

                {fin.movimientos.map((m) => {
                  // "positivo" = entra dinero (recarga o ajuste +). Comisión y ajuste − se muestran como salida.
                  const positivo = m.tipo === "ajuste" ? m.monto >= 0 : m.tipo === "recarga";
                  const label = m.tipo === "recarga" ? "Recarga" : m.tipo === "comision" ? "Comisión" : "Ajuste";
                  return (
                    <div
                      key={m.id}
                      className="grid grid-cols-[140px_1fr_120px_120px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors"
                    >
                      <span className="text-xs text-muted-foreground">{fechaCorta(m.fecha)}</span>
                      <span className="text-sm font-semibold text-foreground truncate">{m.desc}</span>
                      <div className="flex justify-center">
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                          positivo ? "bg-emerald-500/10 text-emerald-500" : "bg-brand-orange/10 text-brand-orange"
                        )}>
                          {positivo ? <ArrowDownRightIcon className="h-3 w-3" /> : <ArrowUpRightIcon className="h-3 w-3" />}
                          {label}
                        </span>
                      </div>
                      <span className={cn("text-right text-sm font-bold", positivo ? "text-emerald-500" : "text-foreground")}>
                        {positivo ? "+" : "−"}{money(Math.abs(m.monto))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
