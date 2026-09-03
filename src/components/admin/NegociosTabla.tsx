"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import type { NegocioAdmin } from "@/lib/services/admin";

const COLORS = ["bg-brand-orange", "bg-indigo-500", "bg-brand-dark", "bg-rose-500", "bg-emerald-500", "bg-brand-teal"];

export function NegociosTabla({ negocios }: { negocios: NegocioAdmin[] }) {
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return negocios;
    return negocios.filter(
      (n) => n.nombre.toLowerCase().includes(q) || n.categoria.toLowerCase().includes(q)
    );
  }, [negocios, query]);

  return (
    <div className="rounded-2xl border border-border bg-white flex flex-col">
      <div className="border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar negocio o categoría..."
            className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm focus:outline-none focus:border-[#FE7801] focus:ring-1 focus:ring-[#FE7801]"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtrados.length} negocios</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[780px]">
          <div className="grid grid-cols-[1fr_140px_110px_120px_80px_90px] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Negocio</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Dueño</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Créditos</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Comisión</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Ventas</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Estado</span>
          </div>

          {filtrados.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No hay negocios que coincidan.
            </div>
          )}

          {filtrados.map((n, i) => (
            <div
              key={n.id}
              className="grid grid-cols-[1fr_140px_110px_120px_80px_90px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white", COLORS[i % COLORS.length])}>
                  {n.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{n.nombre}</p>
                  <p className="text-[10px] text-muted-foreground">{n.categoria}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {n.dueno ?? <span className="text-brand-orange font-semibold">Sin dueño</span>}
              </div>
              <div className="text-right text-sm font-bold text-foreground">{money(n.creditos)}</div>
              <div className="text-center text-xs font-medium text-muted-foreground">
                {n.comisionTipo === "porcentaje" ? `${n.comisionValor}%` : money(n.comisionValor)}
              </div>
              <div className="text-center font-semibold text-sm">{n.ventas}</div>
              <div className="flex justify-center">
                <span className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                  n.activo ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200 text-slate-500"
                )}>
                  {n.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
