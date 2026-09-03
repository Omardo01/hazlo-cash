"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  SendIcon,
  Loader2Icon,
  ReceiptIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { money, fechaCorta } from "@/lib/format";
import type { OrdenAdmin, CodigoActivo, UsuarioMin } from "@/lib/services/admin";
import { crearOrdenPrueba, confirmarOrden, rechazarOrden } from "@/lib/actions/admin";

const GRAD = "linear-gradient(135deg, #1A1840 0%, #2D2B8F 60%, #F5A623 200%)";

const ESTADO: Record<OrdenAdmin["estado"], { label: string; cls: string; dot: string }> = {
  pendiente: { label: "En proceso", cls: "bg-brand-orange/10 text-brand-orange", dot: "bg-brand-orange" },
  confirmado: { label: "Confirmada", cls: "bg-brand-teal/10 text-brand-teal", dot: "bg-brand-teal" },
  rechazado: { label: "Rechazada", cls: "bg-slate-200 text-slate-500", dot: "bg-slate-400" },
};

export function OrdenesPanel({
  ordenes,
  codigos,
  clientes,
}: {
  ordenes: OrdenAdmin[];
  codigos: CodigoActivo[];
  clientes: UsuarioMin[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<{ ok: boolean; msg: string } | null>(null);
  const [query, setQuery] = useState("");

  // Form de crear orden de prueba
  const [abrirForm, setAbrirForm] = useState(false);
  const [codigoId, setCodigoId] = useState("");
  const [clienteId, setClienteId] = useState("");

  // Confirmación con monto (para comisión %)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [montoConfirm, setMontoConfirm] = useState("");

  const pendientes = ordenes.filter((o) => o.estado === "pendiente").length;
  const confirmadas = ordenes.filter((o) => o.estado === "confirmado").length;
  const comisionesTotal = ordenes.reduce((s, o) => s + (o.comision ?? 0), 0);

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

  const ejecutar = (fn: () => Promise<{ ok: boolean; mensaje: string }>) => {
    startTransition(async () => {
      const r = await fn();
      setAviso({ ok: r.ok, msg: r.mensaje });
      if (r.ok) router.refresh();
    });
  };

  const crear = () => {
    if (!codigoId) return setAviso({ ok: false, msg: "Elige un código de referido." });
    ejecutar(async () => {
      const r = await crearOrdenPrueba(codigoId, clienteId || null);
      if (r.ok) {
        setAbrirForm(false);
        setCodigoId("");
        setClienteId("");
      }
      return r;
    });
  };

  const confirmar = (id: string) => {
    const monto = montoConfirm ? parseFloat(montoConfirm.replace(",", ".")) : undefined;
    ejecutar(async () => {
      const r = await confirmarOrden(id, monto && monto > 0 ? monto : undefined);
      if (r.ok) {
        setConfirmandoId(null);
        setMontoConfirm("");
      }
      return r;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero estilo móvil */}
      <div className="relative shrink-0 overflow-hidden rounded-3xl p-6 text-white shadow-lg" style={{ background: GRAD }}>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/80">Órdenes en la plataforma</p>
            <p className="mt-1 text-5xl font-black tracking-tight">{ordenes.length}</p>
            <p className="mt-1 text-xs text-white/85">
              {pendientes} en proceso · {confirmadas} confirmadas
            </p>
          </div>
          <button
            onClick={() => setAbrirForm((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-brand-dark transition-transform hover:scale-[1.03] active:scale-95"
          >
            <PlusIcon className="h-4 w-4" /> Orden de prueba
          </button>
        </div>
        <ReceiptIcon className="absolute -right-4 -bottom-5 h-32 w-32 text-white/10" />
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: String(pendientes), l: "Pendientes", c: "text-brand-orange" },
          { v: String(confirmadas), l: "Confirmadas", c: "text-brand-teal" },
          { v: money(comisionesTotal), l: "Comisiones", c: "text-[#FE7801]" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-white p-4">
            <p className={cn("text-lg font-black tracking-tight", s.c)}>{s.v}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Aviso */}
      {aviso && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium",
            aviso.ok ? "bg-brand-teal/10 text-brand-teal" : "bg-red-500/10 text-red-500"
          )}
        >
          {aviso.ok ? <CheckIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
          {aviso.msg}
        </div>
      )}

      {/* Form crear orden de prueba */}
      {abrirForm && (
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-[#FE7801]" />
            <h3 className="text-sm font-bold">Crear orden de prueba</h3>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            Simula que un cliente reclama un código. Quedará pendiente para que la confirmes y audites el flujo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Código de referido</span>
              <select
                value={codigoId}
                onChange={(e) => setCodigoId(e.target.value)}
                className="h-11 rounded-xl border border-border bg-secondary/40 px-3 text-sm focus:border-[#FE7801] focus:outline-none"
              >
                <option value="">Elige un código…</option>
                {codigos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} · {c.negocio} ({c.recomendador})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Cliente (opcional)</span>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="h-11 rounded-xl border border-border bg-secondary/40 px-3 text-sm focus:border-[#FE7801] focus:outline-none"
              >
                <option value="">Anónimo</option>
                {clientes.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={crear}
              disabled={pending}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              {pending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
              Crear orden
            </button>
            <button
              onClick={() => setAbrirForm(false)}
              className="h-11 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar negocio, recomendador, código o folio…"
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm focus:border-[#FE7801] focus:outline-none focus:ring-1 focus:ring-[#FE7801]"
      />

      {/* Lista de órdenes (cards) */}
      <div className="flex flex-col gap-3">
        {filtradas.length === 0 && (
          <div className="rounded-2xl border border-border bg-white px-5 py-10 text-center text-sm text-muted-foreground">
            No hay órdenes que coincidan.
          </div>
        )}

        {filtradas.map((o) => {
          const e = ESTADO[o.estado];
          const confirmando = confirmandoId === o.id;
          return (
            <div key={o.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", e.cls)}>
                  <ReceiptIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-bold text-foreground">{o.folio}</p>
                    <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", e.cls)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", e.dot)} />
                      {e.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {o.negocio} · {o.recomendador} · {fechaCorta(o.fecha)}
                  </p>
                </div>
                <div className="text-right">
                  {o.comision != null && <p className="text-sm font-bold text-[#FE7801]">{money(o.comision)}</p>}
                  {o.monto != null && <p className="text-[11px] text-muted-foreground">venta {money(o.monto)}</p>}
                </div>
              </div>

              {o.estado === "pendiente" && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  {confirmando ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={montoConfirm}
                        onChange={(ev) => setMontoConfirm(ev.target.value)}
                        placeholder="Monto de venta (si comisión %)"
                        className="h-10 flex-1 rounded-xl border border-border bg-secondary/40 px-3 text-sm focus:border-[#FE7801] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmar(o.id)}
                          disabled={pending}
                          className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-teal px-4 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {pending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
                          Confirmar
                        </button>
                        <button
                          onClick={() => { setConfirmandoId(null); setMontoConfirm(""); }}
                          className="h-10 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => ejecutar(() => rechazarOrden(o.id))}
                        disabled={pending}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary disabled:opacity-60"
                      >
                        <XIcon className="h-4 w-4" /> Rechazar
                      </button>
                      <button
                        onClick={() => { setConfirmandoId(o.id); setMontoConfirm(""); }}
                        disabled={pending}
                        className="flex h-10 flex-[2] items-center justify-center gap-1.5 rounded-xl bg-brand-dark text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                      >
                        <CheckIcon className="h-4 w-4" /> Confirmar venta
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
