"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon, WalletIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { ajustarSaldo } from "@/lib/actions/usuarios";
import type { UsuarioAdmin } from "@/lib/services/admin";
import type { Rol } from "@/lib/services/types";

const ROL_CLS: Record<Rol, string> = {
  cliente: "bg-slate-100 text-slate-500",
  embajador: "bg-[#FE7801]/10 text-[#FE7801]",
  negocio: "bg-brand-teal/10 text-brand-teal",
  admin: "bg-brand-dark/10 text-brand-dark",
};

const COLORS = ["bg-brand-dark", "bg-indigo-600", "bg-brand-teal", "bg-brand-orange", "bg-rose-500"];
const GRID = "grid-cols-[1fr_160px_70px_90px_100px_110px]";

export function UsuariosTabla({ usuarios }: { usuarios: UsuarioAdmin[] }) {
  const [query, setQuery] = useState("");
  const [gestion, setGestion] = useState<UsuarioAdmin | null>(null);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.roles.some((r) => r.includes(q))
    );
  }, [usuarios, query]);

  return (
    <div className="rounded-2xl border border-border bg-white flex flex-col">
      <div className="border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuario o rol..."
            className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm focus:outline-none focus:border-[#FE7801] focus:ring-1 focus:ring-[#FE7801]"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtrados.length} usuarios</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className={cn("grid gap-4 px-5 py-3 border-b border-border bg-secondary/30", GRID)}>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Usuario</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Roles</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-center">Ventas</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Ganado</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Saldo</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground text-right">Acción</span>
          </div>

          {filtrados.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No hay usuarios que coincidan.
            </div>
          )}

          {filtrados.map((u, i) => (
            <div
              key={u.id}
              className={cn("grid gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-colors", GRID)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white", COLORS[i % COLORS.length])}>
                  {u.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{u.nombre}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{u.id.substring(0, 8)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {u.roles.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">—</span>
                ) : (
                  u.roles.map((r) => (
                    <span key={r} className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase", ROL_CLS[r])}>
                      {r}
                    </span>
                  ))
                )}
              </div>
              <div className="text-center font-semibold text-sm">{u.ventas}</div>
              <div className="text-right font-bold text-sm text-[#FE7801]">{money(u.ganado)}</div>
              <div className="text-right font-semibold text-sm text-foreground">{money(u.saldo)}</div>
              <div className="flex justify-end">
                <button
                  onClick={() => setGestion(u)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  <SettingsIcon className="h-3.5 w-3.5" /> Gestionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {gestion && (
        <GestionSaldoModal usuario={gestion} onClose={() => setGestion(null)} />
      )}
    </div>
  );
}

// ── Modal: asignar / quitar saldo ──────────────────────────────────────────────
const PRESETS = [50, 100, 200, 500];

function GestionSaldoModal({ usuario, onClose }: { usuario: UsuarioAdmin; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [modo, setModo] = useState<"asignar" | "quitar">("asignar");
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const valor = parseFloat(monto.replace(",", ".")) || 0;
  const valido = valor > 0 && (modo === "asignar" || valor <= usuario.saldo);

  const aplicar = () => {
    setAviso(null);
    const signed = modo === "asignar" ? valor : -valor;
    startTransition(async () => {
      const r = await ajustarSaldo(usuario.id, signed, motivo);
      setAviso({ ok: r.ok, texto: r.mensaje });
      if (r.ok) {
        setMonto("");
        setMotivo("");
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FE7801]/10 text-[#FE7801]">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">{usuario.nombre}</h3>
              <p className="text-xs text-muted-foreground">Saldo actual: <span className="font-semibold text-foreground">{money(usuario.saldo)}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Segmented control asignar / quitar */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
          {(["asignar", "quitar"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setModo(m); setAviso(null); }}
              className={cn(
                "h-9 rounded-lg text-sm font-semibold capitalize transition-colors",
                modo === m
                  ? m === "asignar" ? "bg-brand-teal text-white" : "bg-brand-orange text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "asignar" ? "Asignar dinero" : "Quitar dinero"}
            </button>
          ))}
        </div>

        {/* Monto */}
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monto</label>
          <div className="mt-1.5 flex items-center rounded-xl border border-border px-3">
            <span className="text-lg font-bold text-muted-foreground">$</span>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              className="h-11 w-full bg-transparent px-2 text-lg font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="mt-2 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setMonto(String(p))}
                className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                ${p}
              </button>
            ))}
          </div>
        </div>

        {/* Motivo */}
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Motivo (opcional)</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Bono de bienvenida"
            className="mt-1.5 h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-[#FE7801]"
          />
        </div>

        {aviso && (
          <div className={cn("mt-4 rounded-xl px-3 py-2.5 text-xs font-medium", aviso.ok ? "bg-brand-teal/10 text-brand-teal" : "bg-rose-500/10 text-rose-600")}>
            {aviso.texto}
          </div>
        )}

        <button
          onClick={aplicar}
          disabled={!valido || pending}
          className={cn(
            "mt-5 h-12 w-full rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40",
            modo === "asignar" ? "bg-brand-teal" : "bg-brand-orange"
          )}
        >
          {pending ? "Aplicando…" : modo === "asignar" ? `Asignar $${valor.toFixed(2)}` : `Quitar $${valor.toFixed(2)}`}
        </button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          El movimiento queda registrado en Finanzas.
        </p>
      </div>
    </div>
  );
}
