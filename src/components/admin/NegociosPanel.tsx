"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  StoreIcon,
  WalletIcon,
  SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import type { NegocioAdmin, UsuarioMin } from "@/lib/services/admin";
import {
  recargarCreditos,
  setComisionNegocio,
  asignarDuenoNegocio,
  setNegocioActivo,
  crearNegocio,
  type ResultadoAccion,
} from "@/lib/actions/negocios";

const GRAD = "linear-gradient(135deg, #1A1840 0%, #2D2B8F 60%, #F5A623 200%)";
const ATAJOS = [50, 100, 200, 500];
const CATEGORIAS = ["Comida", "Restaurante", "Servicios", "Salud", "Belleza", "Mecánica", "Electricidad", "Plomería", "Educación", "Otro"];

type Aviso = { ok: boolean; msg: string } | null;

function iniciales(n: string) {
  const p = n.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

function comisionLabel(n: NegocioAdmin) {
  return n.comisionTipo === "porcentaje" ? `${n.comisionValor}% / venta` : `${money(n.comisionValor)} / venta`;
}

// ── Modal genérico ─────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function NegociosPanel({ negocios, candidatos }: { negocios: NegocioAdmin[]; candidatos: UsuarioMin[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<Aviso>(null);
  const [query, setQuery] = useState("");
  const [gestionId, setGestionId] = useState<string | null>(null);
  const [abrirAlta, setAbrirAlta] = useState(false);

  const run = (fn: () => Promise<ResultadoAccion>, onOk?: () => void) =>
    startTransition(async () => {
      const r = await fn();
      setAviso({ ok: r.ok, msg: r.mensaje });
      if (r.ok) {
        router.refresh();
        onOk?.();
      }
    });

  const activos = negocios.filter((n) => n.activo).length;
  const creditos = negocios.reduce((s, n) => s + n.creditos, 0);
  const negocioGestion = negocios.find((n) => n.id === gestionId) ?? null;

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return negocios;
    return negocios.filter((n) => n.nombre.toLowerCase().includes(q) || n.categoria.toLowerCase().includes(q));
  }, [negocios, query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="relative shrink-0 overflow-hidden rounded-3xl p-6 text-white shadow-lg" style={{ background: GRAD }}>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/80">Negocios en la plataforma</p>
            <p className="mt-1 text-5xl font-black tracking-tight">{negocios.length}</p>
            <p className="mt-1 text-xs text-white/85">{activos} activos · {money(creditos)} en créditos</p>
          </div>
          <button
            onClick={() => setAbrirAlta(true)}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-brand-dark transition-transform hover:scale-[1.03] active:scale-95"
          >
            <PlusIcon className="h-4 w-4" /> Nuevo
          </button>
        </div>
        <StoreIcon className="absolute -right-4 -bottom-5 h-32 w-32 text-white/10" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: String(negocios.length), l: "Total" },
          { v: String(activos), l: "Activos" },
          { v: money(creditos), l: "Créditos" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-white p-4">
            <p className="text-lg font-black tracking-tight text-brand-dark">{s.v}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      {aviso && (
        <div className={cn("flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium", aviso.ok ? "bg-brand-teal/10 text-brand-teal" : "bg-red-500/10 text-red-500")}>
          {aviso.ok ? <CheckIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
          {aviso.msg}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar negocio o categoría…"
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm focus:border-[#FE7801] focus:outline-none focus:ring-1 focus:ring-[#FE7801]"
      />

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl border border-border bg-white px-5 py-10 text-center text-sm text-muted-foreground">
            No hay negocios que coincidan.
          </div>
        )}
        {filtrados.map((n) => (
          <div key={n.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white" style={{ background: n.activo ? "linear-gradient(135deg,#FE7801,#EB4E00)" : "linear-gradient(135deg,#C9C9C9,#A8A8A8)" }}>
              {iniciales(n.nombre)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{n.nombre}</p>
              <p className="truncate text-[11px] text-muted-foreground">{n.categoria} · {comisionLabel(n)}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn("text-[11px] font-semibold", n.creditos > 0 ? "text-[#FE7801]" : "text-muted-foreground")}>{money(n.creditos)} créditos</span>
                {!n.ownerId && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-red-500">Sin dueño</span>}
                {!n.activo && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500">Inactivo</span>}
              </div>
            </div>
            <button
              onClick={() => { setAviso(null); setGestionId(n.id); }}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-dark px-4 text-sm font-semibold text-white hover:opacity-90"
            >
              <SettingsIcon className="h-4 w-4" /> Gestionar
            </button>
          </div>
        ))}
      </div>

      {/* Modal Gestionar */}
      {negocioGestion && (
        <GestionModal
          negocio={negocioGestion}
          candidatos={candidatos}
          pending={pending}
          aviso={aviso}
          run={run}
          onClose={() => setGestionId(null)}
        />
      )}

      {/* Modal Alta */}
      {abrirAlta && (
        <AltaModal pending={pending} aviso={aviso} run={run} onClose={() => setAbrirAlta(false)} />
      )}
    </div>
  );
}

// ── Modal Gestionar ────────────────────────────────────────────────────────────
function GestionModal({
  negocio,
  candidatos,
  pending,
  aviso,
  run,
  onClose,
}: {
  negocio: NegocioAdmin;
  candidatos: UsuarioMin[];
  pending: boolean;
  aviso: Aviso;
  run: (fn: () => Promise<ResultadoAccion>, onOk?: () => void) => void;
  onClose: () => void;
}) {
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState(negocio.comisionTipo);
  const [valor, setValor] = useState(String(negocio.comisionValor));

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#FE7801,#EB4E00)" }}>
          {iniciales(negocio.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black tracking-tight">{negocio.nombre}</p>
          <p className="text-xs text-muted-foreground">{negocio.categoria}</p>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"><XIcon className="h-5 w-5" /></button>
      </div>

      {/* Saldo */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: GRAD }}>
        <p className="text-[11px] uppercase tracking-wider text-white/80">Créditos disponibles</p>
        <p className="mt-1 text-3xl font-black tracking-tight">{money(negocio.creditos)}</p>
        <WalletIcon className="absolute -right-2 -bottom-2 h-20 w-20 text-white/10" />
      </div>

      {aviso && (
        <div className={cn("mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium", aviso.ok ? "bg-brand-teal/10 text-brand-teal" : "bg-red-500/10 text-red-500")}>
          {aviso.ok ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}{aviso.msg}
        </div>
      )}

      {/* Recargar */}
      <p className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Activar créditos</p>
      <div className="mb-2 flex gap-2">
        {ATAJOS.map((a) => (
          <button key={a} onClick={() => setMonto(String(a))} className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold hover:bg-secondary">${a}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={monto} onChange={(e) => setMonto(e.target.value)} inputMode="decimal" placeholder="$0.00" className="h-11 flex-1 rounded-xl border border-border bg-secondary/40 px-3 text-sm focus:border-[#FE7801] focus:outline-none" />
        <button
          onClick={() => run(() => recargarCreditos(negocio.id, parseFloat(monto.replace(",", ".")) || 0), () => setMonto(""))}
          disabled={pending}
          className="flex h-11 items-center gap-1.5 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#FE7801,#EB4E00)" }}
        >
          {pending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />} Activar
        </button>
      </div>

      {/* Comisión */}
      <p className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Comisión al recomendador</p>
      <div className="mb-2 flex gap-2">
        {(["fijo", "porcentaje"] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)} className={cn("flex-1 rounded-xl py-2.5 text-sm font-semibold", tipo === t ? "bg-brand-dark text-white" : "border border-border")}>
            {t === "fijo" ? "Monto fijo" : "Porcentaje"}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex h-11 flex-1 items-center rounded-xl border border-border bg-secondary/40 px-3">
          {tipo === "fijo" && <span className="mr-1 text-sm text-muted-foreground">$</span>}
          <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" className="h-full flex-1 bg-transparent text-sm focus:outline-none" />
          {tipo === "porcentaje" && <span className="ml-1 text-sm text-muted-foreground">%</span>}
        </div>
        <button onClick={() => run(() => setComisionNegocio(negocio.id, tipo, parseFloat(valor.replace(",", ".")) || 0))} disabled={pending} className="h-11 rounded-xl border border-border px-5 text-sm font-semibold hover:bg-secondary disabled:opacity-60">Guardar</button>
      </div>

      {/* Dueño */}
      <p className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Dueño del negocio</p>
      {candidatos.length === 0 ? (
        <p className="rounded-xl border border-border p-3 text-xs text-muted-foreground">No hay cuentas con rol Negocio. Asigna el rol Negocio a un usuario primero.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {candidatos.map((u) => {
            const sel = negocio.ownerId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => run(() => asignarDuenoNegocio(negocio.id, sel ? null : u.id))}
                disabled={pending}
                className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm disabled:opacity-60", sel ? "border-[#FE7801] bg-[#FE7801]/5" : "border-border")}
              >
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-white", sel ? "bg-[#FE7801]" : "bg-slate-200")}>
                  {sel && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
                <span className="flex-1 font-semibold">{u.nombre}</span>
                {sel && <span className="text-[11px] font-bold text-[#FE7801]">Dueño</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Activo */}
      <button
        onClick={() => run(() => setNegocioActivo(negocio.id, !negocio.activo))}
        disabled={pending}
        className={cn("mt-5 h-11 w-full rounded-xl text-sm font-semibold disabled:opacity-60", negocio.activo ? "bg-red-500/10 text-red-500" : "bg-brand-teal/10 text-brand-teal")}
      >
        {negocio.activo ? "Desactivar negocio" : "Activar negocio"}
      </button>
    </Modal>
  );
}

// ── Modal Alta ─────────────────────────────────────────────────────────────────
function AltaModal({
  pending,
  aviso,
  run,
  onClose,
}: {
  pending: boolean;
  aviso: Aviso;
  run: (fn: () => Promise<ResultadoAccion>, onOk?: () => void) => void;
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [direccion, setDireccion] = useState("");
  const [oferta, setOferta] = useState("");
  const [tipo, setTipo] = useState<"fijo" | "porcentaje">("fijo");
  const [valor, setValor] = useState("10");

  const guardar = () =>
    run(
      () =>
        crearNegocio({
          nombre,
          categoria,
          direccion,
          oferta,
          comisionTipo: tipo,
          comisionValor: parseFloat(valor.replace(",", ".")) || 0,
        }),
      onClose
    );

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight">Dar de alta negocio</h3>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"><XIcon className="h-5 w-5" /></button>
      </div>

      {aviso && !aviso.ok && (
        <div className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500">{aviso.msg}</div>
      )}

      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Nombre *</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Tacos El Güero" className="mb-3 h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm focus:border-[#FE7801] focus:outline-none" />

      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Categoría *</label>
      <div className="mb-3 flex flex-wrap gap-2">
        {CATEGORIAS.map((c) => (
          <button key={c} onClick={() => setCategoria(c)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium", categoria === c ? "bg-brand-dark text-white" : "border border-border")}>{c}</button>
        ))}
      </div>

      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Dirección / Ciudad</label>
      <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Villahermosa, Tabasco" className="mb-3 h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm focus:border-[#FE7801] focus:outline-none" />

      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Oferta Hazlo Cash</label>
      <input value={oferta} onChange={(e) => setOferta(e.target.value)} placeholder="Ej. Refresco gratis con tu primer pedido" className="mb-3 h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm focus:border-[#FE7801] focus:outline-none" />

      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Comisión al recomendador</label>
      <div className="mb-2 flex gap-2">
        {(["fijo", "porcentaje"] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)} className={cn("flex-1 rounded-xl py-2.5 text-sm font-semibold", tipo === t ? "bg-brand-dark text-white" : "border border-border")}>{t === "fijo" ? "Monto fijo" : "Porcentaje"}</button>
        ))}
      </div>
      <div className="mb-5 flex h-11 items-center rounded-xl border border-border bg-secondary/40 px-3">
        {tipo === "fijo" && <span className="mr-1 text-sm text-muted-foreground">$</span>}
        <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" className="h-full flex-1 bg-transparent text-sm focus:outline-none" />
        {tipo === "porcentaje" && <span className="ml-1 text-sm text-muted-foreground">%</span>}
      </div>

      <button onClick={guardar} disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg,#FE7801,#EB4E00)" }}>
        {pending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />} Dar de alta
      </button>
    </Modal>
  );
}
