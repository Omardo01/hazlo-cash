"use client";

import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { RecomendadorDashboardSkeleton } from "@/components/ui/skeletons";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { ReferralDistribution } from "@/components/dashboard/ReferralDistribution";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { ChevronRightIcon, PlusIcon, WalletIcon, UsersIcon, TrendingUpIcon, QrCodeIcon } from "lucide-react";

export default function AmbassadorDashboard() {
  const loading = useSimulatedLoading();
  if (loading) return <><DashboardHeader title="Dashboard" /><RecomendadorDashboardSkeleton /></>;

  return (
    <>
      <DashboardHeader title="Dashboard" />

      {/* Main layout: content + right panel */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* Left — main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb + profile name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
              <span className="text-[#FE7801]">Dashboard</span>
              <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Omar Domínguez</span>
            </div>
          </div>

          {/* Site / profile header */}
          <div className="flex items-center gap-3 -mt-1">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white text-lg font-black"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              H
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">Hazlo Cash</span>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors">
              <PlusIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Stats grid — 2 cols on mobile, 4 on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              title="Balance"
              value="$1,985"
              change="+$420 este mes"
              changeType="positive"
              icon={WalletIcon}
              iconColor="text-[#F5A623]"
              iconBg="bg-[#F5A623]/8"
            />
            <StatCard
              title="Referidos"
              value="12"
              change="+3 esta semana"
              changeType="positive"
              icon={UsersIcon}
              iconColor="text-[#FE7801]"
              iconBg="bg-[#FE7801]/8"
            />
            <StatCard
              title="Conversión"
              value="68%"
              change="+5% vs mes pasado"
              changeType="positive"
              icon={TrendingUpIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/8"
            />
            <StatCard
              title="Códigos activos"
              value="3"
              change="2 usados hoy"
              changeType="neutral"
              icon={QrCodeIcon}
              iconColor="text-[#1A1840]"
              iconBg="bg-[#1A1840]/8"
            />
          </div>

          {/* Area chart */}
          <EarningsChart />

          {/* Referral distribution + active % */}
          <ReferralDistribution />

          {/* Right panel — visible on mobile/tablet, hidden on lg (shown in sidebar) */}
          <div className="lg:hidden rounded-2xl border border-border bg-white p-5">
            <RightPanel />
          </div>
        </div>

        {/* Right panel — desktop only */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto">
          <div className="flex flex-col gap-1 p-5">
            <RightPanel />
          </div>
        </div>

      </div>
    </>
  );
}
