"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { money, fechaCorta } from "@/lib/format";
import type { OrdenAdmin } from "@/lib/services/admin";

const ESTADO: Record<OrdenAdmin["estado"], { label: string; cls: string }> = {
  pendiente: { label: "En proceso", cls: "bg-brand-orange/10 text-brand-orange" },
  confirmado: { label: "Confirmada", cls: "bg-emerald-500/10 text-emerald-500" },
  rechazado: { label: "Rechazada", cls: "bg-slate-200 text-slate-500" },
};

export function OrdenesTabla({ ordenes }: { ordenes: OrdenAdmin[] }) {
  const [query, setQuery] = useState("");

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordenes;
    return ordenes.filter(
      (o) =>
        o.negocio.toLowerCase().includes(q) ||
        o.recomendador.toLowerCase().includes(q) ||
        o.codigo.toLowerCase().includes(q) ||
        o.folio.toLowerCase().includes(q)
    );
  }, [ordenes, query]);

  return (
    <div className="rounded-2xl border border-border bg-white flex flex-col">
      <div className="border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar negocio, recomendador, código o folio..."
            className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm focus:outline-none focus:border-[#FE7801] focus:ring-1 focus:ring-[#FE7801]"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtradas.length} órdenes</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[110px_1fr_1fr_100px_100px_110px_120px] gap-4 px-5 py-3 border-b border-border bg-secondary/30">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Folio</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Negocio</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Recomendador</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Monto</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Comisión</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Estado</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Fecha</span>
          </div>

          {filtradas.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No hay órdenes que coincidan.
            </div>
          )}

          {filtradas.map((o) => {
            const e = ESTADO[o.estado];
            return (
              <div
                key={o.id}
                className="grid grid-cols-[110px_1fr_1fr_100px_100px_110px_120px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors"
              >
                <div>
                  <p className="text-xs font-mono font-bold text-foreground">{o.folio}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{o.codigo}</p>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">{o.negocio}</span>
                <span className="text-sm text-muted-foreground truncate">{o.recomendador}</span>
                <span className="text-right text-sm text-foreground">
                  {o.monto != null ? money(o.monto) : "—"}
                </span>
                <span className="text-right text-sm font-bold text-[#FE7801]">
                  {o.comision != null ? money(o.comision) : "—"}
                </span>
                <div className="flex justify-center">
                  <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase", e.cls)}>
                    {e.label}
                  </span>
                </div>
                <span className="text-right text-xs text-muted-foreground">{fechaCorta(o.fecha)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
