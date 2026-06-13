"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UsersIcon, ChevronRightIcon, SearchIcon, FilterIcon, MoreVerticalIcon } from "lucide-react";

const adminTabs = [
  { label: "Overview",  href: "/admin" },
  { label: "Usuarios",  href: "/admin/users" },
  { label: "Negocios",  href: "/admin/negocios" },
  { label: "Finanzas",  href: "/admin/finanzas" },
];
import { cn } from "@/lib/utils";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { AdminTableSkeleton } from "@/components/ui/skeletons";

const usersData = [
  { id: "USR-001", name: "Omar Domínguez", type: "Embajador", refCount: 14, earned: "$2,450", status: "active", iconBg: "bg-brand-dark" },
  { id: "USR-002", name: "Ana López", type: "Embajador", refCount: 32, earned: "$5,100", status: "active", iconBg: "bg-indigo-600" },
  { id: "USR-003", name: "Carlos Mendoza", type: "Embajador", refCount: 8, earned: "$980", status: "inactive", iconBg: "bg-brand-teal" },
  { id: "USR-004", name: "Luis Pérez", type: "Embajador", refCount: 104, earned: "$18,500", status: "banned", iconBg: "bg-red-500" },
  { id: "USR-005", name: "María Gómez", type: "Embajador", refCount: 22, earned: "$3,300", status: "active", iconBg: "bg-brand-orange" },
];

export default function AdminUsersPage() {
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
            <span className="text-muted-foreground">Usuarios</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 text-lg font-black">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">Directorio</h1>
                <p className="text-xs text-muted-foreground mt-1">Gestión de Embajadores y Usuarios del sistema.</p>
              </div>
            </div>
            <button className="hidden sm:flex h-10 px-4 items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
              + Agregar Usuario
            </button>
          </div>

          {/* Filters & Table */}
          <div className="rounded-2xl border border-border bg-white flex flex-col">
            <div className="border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar usuario, ID o correo..."
                  className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm focus:outline-none focus:border-[#FE7801] focus:ring-1 focus:ring-[#FE7801]"
                />
              </div>
              <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary">
                <FilterIcon className="h-3.5 w-3.5" />
                Filtros Avanzados
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[1fr_80px_100px_100px_100px_40px] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Usuario</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Referidos</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Ganancias</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Estado</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Rol</span>
                  <span></span>
                </div>

                {usersData.map((usr) => (
                  <div key={usr.id} className="grid grid-cols-[1fr_80px_100px_100px_100px_40px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white", usr.iconBg)}>
                        {usr.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{usr.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{usr.id}</p>
                      </div>
                    </div>
                    <div className="text-center font-semibold text-sm">{usr.refCount}</div>
                    <div className="text-right font-bold text-sm text-[#FE7801]">{usr.earned}</div>
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        usr.status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                        usr.status === "banned" ? "bg-red-500/10 text-red-500" :
                        "bg-slate-200 text-slate-500"
                      )}>
                        {usr.status === "active" ? "Activo" : usr.status === "banned" ? "Baneado" : "Inactivo"}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="px-2 py-1 rounded border border-border text-[10px] font-medium bg-white text-muted-foreground">
                        {usr.type}
                      </span>
                    </div>
                    <button className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary text-muted-foreground">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </button>
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
