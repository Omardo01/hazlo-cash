"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  MapPinIcon,
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  StarIcon,
  PlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { AdminTableSkeleton } from "@/components/ui/skeletons";

const adminTabs = [
  { label: "Overview",  href: "/admin" },
  { label: "Usuarios",  href: "/admin/users" },
  { label: "Negocios",  href: "/admin/negocios" },
  { label: "Finanzas",  href: "/admin/finanzas" },
];

type Negocio = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  rev: string;
  status: "verified" | "pending" | "rejected";
  iconBg: string;
};

const ICON_COLORS = [
  "bg-brand-orange",
  "bg-indigo-500",
  "bg-brand-dark",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-indigo-600",
  "bg-brand-teal",
];

const initialData: Negocio[] = [
  { id: "NEG-01", name: "Tacos El Güero",  category: "Comida",      city: "Villahermosa", rating: 4.8, rev: "$18,450", status: "verified", iconBg: "bg-brand-orange" },
  { id: "NEG-02", name: "Sushi Go",         category: "Restaurante", city: "Monterrey",    rating: 4.5, rev: "$42,100", status: "verified", iconBg: "bg-indigo-500"   },
  { id: "NEG-03", name: "BarberShop X",     category: "Servicios",   city: "CDMX",         rating: 4.9, rev: "$12,300", status: "pending",  iconBg: "bg-brand-dark"   },
  { id: "NEG-04", name: "Pizzería Roma",    category: "Comida",      city: "Guadalajara",  rating: 4.2, rev: "$8,900",  status: "verified", iconBg: "bg-rose-500"     },
  { id: "NEG-05", name: "Gym Fit Life",     category: "Salud",       city: "Puebla",       rating: 4.7, rev: "$25,000", status: "rejected", iconBg: "bg-emerald-500"  },
];

export default function AdminNegociosPage() {
  const loading = useSimulatedLoading();
  const [negocios] = useState<Negocio[]>(initialData);
  const [query, setQuery] = useState("");

  const filtered = negocios.filter(
    (n) =>
      n.name.toLowerCase().includes(query.toLowerCase()) ||
      n.id.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return (
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
        <AdminTableSkeleton />
      </div>
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

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-dark">Admin</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Negocios</span>
          </div>

          {/* Page header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">Negocios</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {negocios.length} proveedores registrados
                </p>
              </div>
            </div>
            <Link
              href="/admin/negocios/nuevo"
              className="flex items-center gap-2 h-10 px-4 rounded-xl text-white text-[12px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dar de Alta Negocio</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </div>

          {/* Table card */}
          <div className="rounded-2xl border border-border bg-white flex flex-col">
            <div className="border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar nombre o ID..."
                  className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm focus:outline-none focus:border-[#FE7801] focus:ring-1 focus:ring-[#FE7801]"
                />
              </div>
              <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary">
                <FilterIcon className="h-3.5 w-3.5" />
                Filtrar por Estado
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[1fr_120px_100px_100px_100px_40px] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Negocio</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Ubicación</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Calificación</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Volumen</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Estado</span>
                  <span></span>
                </div>

                {filtered.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No se encontraron negocios.
                  </div>
                )}

                {filtered.map((neg) => (
                  <div
                    key={neg.id}
                    className="grid grid-cols-[1fr_120px_100px_100px_100px_40px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white", neg.iconBg)}>
                        {neg.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{neg.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{neg.id} · {neg.category}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{neg.city}</div>
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                      {neg.rating > 0 ? (
                        <>
                          <StarIcon className="h-3 w-3 text-brand-orange fill-brand-orange" />
                          {neg.rating}
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="text-right font-bold text-sm text-foreground">{neg.rev}</div>
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        neg.status === "verified" ? "bg-emerald-500/10 text-emerald-500" :
                        neg.status === "rejected" ? "bg-red-500/10 text-red-500" :
                        "bg-brand-orange/10 text-brand-orange"
                      )}>
                        {neg.status === "verified" ? "Verificado" : neg.status === "rejected" ? "Rechazado" : "Pendiente"}
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
