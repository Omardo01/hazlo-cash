import Link from "next/link";
import {
  ChevronRightIcon,
  ReceiptIcon,
  DollarSignIcon,
  WalletIcon,
  CreditCardIcon,
  ArrowRightIcon,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrdenesTabla } from "@/components/admin/OrdenesTabla";
import { GmvChart } from "@/components/admin/GmvChart";
import { ADMIN_TABS } from "@/lib/adminNav";
import { money } from "@/lib/format";
import { requireAdmin, getResumenAdmin, getOrdenesAdmin, getSerieGmv } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const [resumen, ordenes, serie] = await Promise.all([
    getResumenAdmin(),
    getOrdenesAdmin(8),
    getSerieGmv(),
  ]);

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
            <span className="text-muted-foreground">Overview</span>
          </div>

          {/* Hero estilo móvil */}
          <div
            className="relative shrink-0 overflow-hidden rounded-3xl p-6 text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #1A1840 0%, #2D2B8F 60%, #F5A623 200%)" }}
          >
            <div className="relative z-10">
              <p className="text-[11px] uppercase tracking-wider text-white/80">Hola, {admin.nombre.split(" ")[0]}</p>
              <p className="mt-1 text-xs text-white/85">
                {resumen.usuarios} usuarios · {resumen.negocios} negocios
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-wider text-white/80">Volumen de ventas (GMV)</p>
              <p className="text-4xl font-black tracking-tight">{money(resumen.gmv)}</p>
              <p className="mt-1 text-xs text-white/85">{resumen.ventas} ventas confirmadas</p>
            </div>
            <DollarSignIcon className="absolute -right-3 -bottom-4 h-28 w-28 text-white/10" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Ventas confirmadas"
              value={String(resumen.ventas)}
              change={`GMV ${money(resumen.gmv)}`}
              changeType="positive"
              icon={ReceiptIcon}
              iconColor="text-[#FE7801]"
              iconBg="bg-[#FE7801]/10"
            />
            <StatCard
              title="Comisiones pagadas"
              value={money(resumen.comisionesPagadas)}
              change="A recomendadores"
              changeType="neutral"
              icon={DollarSignIcon}
              iconColor="text-brand-teal"
              iconBg="bg-brand-teal/10"
            />
            <StatCard
              title="Créditos en circulación"
              value={money(resumen.creditosCirculando)}
              change="Saldo de negocios"
              changeType="neutral"
              icon={CreditCardIcon}
              iconColor="text-indigo-500"
              iconBg="bg-indigo-500/10"
            />
            <StatCard
              title="Por pagar"
              value={money(resumen.porPagar)}
              change="En wallets"
              changeType="negative"
              icon={WalletIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/10"
            />
          </div>

          <GmvChart data={serie} />

          <div className="flex items-center justify-between mt-2">
            <h2 className="text-sm font-bold text-foreground">Últimas órdenes</h2>
            <Link href="/admin/ordenes" className="flex items-center gap-1 text-xs font-semibold text-[#FE7801] hover:opacity-80">
              Ver todas <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <OrdenesTabla ordenes={ordenes} />
        </div>
      </div>
    </>
  );
}
