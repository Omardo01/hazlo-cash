"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BellIcon,
  ChevronDownIcon,
  MoonIcon,
  ChevronRightIcon,
  UsersIcon,
  ZapIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  ShieldCheckIcon,
  SearchIcon,
  ChevronUpIcon,
  XIcon,
  ArrowRightIcon,
  Loader2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisitaNegocio } from "@/lib/services/referrals";
import type { EstadoReferral } from "@/lib/services/types";
import { confirmarVisita, rechazarVisita } from "./actions";

// ── Config de estados (loop core: pendiente → confirmado | rechazado) ────────

const estadoConfig: Record<
  EstadoReferral,
  { label: string; icon: React.ElementType; text: string; bg: string; dot: string; border: string }
> = {
  pendiente:  { label: "Pendiente",  icon: ZapIcon,          text: "text-brand-orange", bg: "bg-brand-orange/10", dot: "bg-brand-orange", border: "border-brand-orange/30" },
  confirmado: { label: "Confirmada", icon: CheckCircle2Icon, text: "text-brand-teal",   bg: "bg-brand-teal/10",   dot: "bg-brand-teal",   border: "border-brand-teal/30"   },
  rechazado:  { label: "Rechazada",  icon: XCircleIcon,      text: "text-destructive",  bg: "bg-red-50",          dot: "bg-red-400",      border: "border-red-200"         },
};

const navTabs = [
  { label: "Inicio",      href: "/negocio"             },
  { label: "Solicitudes", href: "/negocio/solicitudes" },
  { label: "Embajadores", href: "/negocio/embajadores" },
  { label: "Mi Negocio",  href: "/negocio/perfil"      },
];

// Fecha determinista server/cliente (evita mismatch de hidratación).
function formatFecha(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

// ── Header ────────────────────────────────────────────────────────────────────

function NegocioHeader({ activeHref }: { activeHref: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-[62px] shrink-0 items-center bg-white border-b border-border px-4 sm:px-5 gap-3">
      <nav className="flex items-center gap-1 h-full">
        {navTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex h-full items-center px-3 text-sm transition-colors",
              tab.href === activeHref
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.href === activeHref && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-brand-orange" />
            )}
          </Link>
        ))}
      </nav>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 shrink-0">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <BellIcon className="h-[17px] w-[17px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-orange" />
        </button>
        <span className="hidden sm:block text-sm font-semibold text-foreground">Tacos El Güero</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange text-[11px] font-bold">
          TG
        </div>
        <ChevronDownIcon className="h-3 w-3 text-muted-foreground hidden sm:block" />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <MoonIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function MiniStat({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-black leading-none", color)}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function VisitaRow({
  v,
  isExpanded,
  isPending,
  onToggle,
  onAction,
}: {
  v: VisitaNegocio;
  isExpanded: boolean;
  isPending: boolean;
  onToggle: () => void;
  onAction: (id: string, decision: "confirmado" | "rechazado") => void;
}) {
  const cfg = estadoConfig[v.estado];
  const StateIcon = cfg.icon;

  return (
    <div className={cn("border-b border-border last:border-0 transition-colors", isExpanded && "bg-secondary/30")}>
      <button
        onClick={onToggle}
        className="w-full grid sm:grid-cols-[1fr_130px_140px_130px_32px] gap-3 items-center px-5 py-3.5 text-left hover:bg-secondary/20 transition-colors"
      >
        {/* Cliente */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <UsersIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Cliente Hazlo Cash</p>
            <p className="text-[11px] text-muted-foreground">{formatFecha(v.creada)}</p>
          </div>
        </div>
        {/* Folio */}
        <span className="font-mono text-[11px] font-bold text-foreground hidden sm:block">{v.folio}</span>
        {/* Código embajador */}
        <span className="font-mono text-[11px] text-[#FE7801] font-semibold hidden sm:block">{v.codigo}</span>
        {/* Estado */}
        <div className={cn("flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border", cfg.bg, cfg.text, cfg.border)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
          <StateIcon className="h-3 w-3" />
          {cfg.label}
        </div>
        <div className="hidden sm:flex items-center justify-center text-muted-foreground">
          {isExpanded ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-4 space-y-3">
          <div className="rounded-xl bg-white border border-border p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <p className="text-muted-foreground mb-0.5">Folio</p>
                <p className="font-mono font-bold text-foreground">{v.folio}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Código embajador</p>
                <p className="font-mono font-semibold text-[#FE7801]">{v.codigo}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Visita registrada</p>
                <p className="font-semibold text-foreground">{formatFecha(v.creada)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Confirmada</p>
                <p className="font-semibold text-foreground">{v.confirmada ? formatFecha(v.confirmada) : "—"}</p>
              </div>
            </div>

            {v.estado === "pendiente" && (
              <>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => onAction(v.id, "confirmado")}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-teal text-white px-3.5 py-2 text-[12px] font-semibold hover:bg-brand-teal/90 transition-colors disabled:opacity-60"
                  >
                    {isPending ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2Icon className="h-3.5 w-3.5" />}
                    Confirmar visita
                  </button>
                  <button
                    onClick={() => onAction(v.id, "rechazado")}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-xl bg-secondary text-muted-foreground px-3.5 py-2 text-[12px] font-semibold hover:bg-border transition-colors disabled:opacity-60"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                    Rechazar
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-[#FE7801]/5 border border-[#FE7801]/15 px-3 py-2">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-[#FE7801] shrink-0" />
                  <p className="text-[11px] text-[#FE7801]">
                    Pide al cliente el folio de su pantalla «Mostrar al negocio» y verifica que coincida antes de confirmar.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── View ──────────────────────────────────────────────────────────────────────

export function SolicitudesView({ visitas: visitasIniciales }: { visitas: VisitaNegocio[] }) {
  const [filterEstado, setFilterEstado] = useState<"todas" | EstadoReferral>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visitas, setVisitas] = useState<VisitaNegocio[]>(visitasIniciales);
  const [actingId, setActingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleAction = (id: string, decision: "confirmado" | "rechazado") => {
    setActingId(id);
    startTransition(async () => {
      const accion = decision === "confirmado" ? confirmarVisita : rechazarVisita;
      const { ok } = await accion(id);
      if (ok) {
        setVisitas((prev) =>
          prev.map((v) =>
            v.id === id
              ? {
                  ...v,
                  estado: decision,
                  confirmada: decision === "confirmado" ? new Date().toISOString() : null,
                }
              : v
          )
        );
        setExpandedId(null);
      }
      setActingId(null);
    });
  };

  const filtered = visitas.filter((v) => {
    const matchEstado = filterEstado === "todas" || v.estado === filterEstado;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      q === "" || v.folio.toLowerCase().includes(q) || v.codigo.toLowerCase().includes(q);
    return matchEstado && matchSearch;
  });

  const counts = {
    pendientes:  visitas.filter((v) => v.estado === "pendiente").length,
    confirmadas: visitas.filter((v) => v.estado === "confirmado").length,
    rechazadas:  visitas.filter((v) => v.estado === "rechazado").length,
    total:       visitas.length,
  };

  const pendientesAccion = visitas.filter((v) => v.estado === "pendiente");

  return (
    <>
      <NegocioHeader activeHref="/negocio/solicitudes" />

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-orange">Negocio</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Solicitudes</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-xl font-black text-foreground">Visitas Hazlo Cash</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Confirma las visitas que llegan con código de embajador
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat label="Pendientes" value={counts.pendientes} sub="Requieren acción" color="text-brand-orange" />
            <MiniStat label="Confirmadas" value={counts.confirmadas} sub="Visitas válidas" color="text-brand-teal" />
            <MiniStat label="Rechazadas" value={counts.rechazadas} sub="No procedieron" color="text-destructive" />
            <MiniStat label="Total" value={counts.total} sub="Desde el inicio" color="text-foreground" />
          </div>

          {/* Tabla */}
          <div className="rounded-2xl border border-border bg-white flex-1">

            {/* Toolbar */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 flex-wrap">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por folio o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary pl-8 pr-3 py-2 text-[12px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["todas", "pendiente", "confirmado", "rechazado"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterEstado(f)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                      filterEstado === f
                        ? "bg-brand-orange text-white shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-border"
                    )}
                  >
                    {f === "todas" ? `Todas (${counts.total})` : estadoConfig[f].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Anti-bypass notice */}
            <div className="flex items-center gap-2 bg-[#FE7801]/5 border-b border-border px-5 py-2.5">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[#FE7801] shrink-0" />
              <p className="text-[11px] text-[#FE7801]">
                Anti-bypass activo — Confirma solo visitas con folio verificado. La reputación de tu negocio se construye con transacciones dentro de Hazlo Cash.
              </p>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_130px_140px_130px_32px] gap-3 px-5 py-2.5 border-b border-border bg-secondary/40">
              {["Cliente", "Folio", "Embajador", "Estado", ""].map((h, i) => (
                <span key={i} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length > 0 ? (
              filtered.map((v) => (
                <VisitaRow
                  key={v.id}
                  v={v}
                  isExpanded={expandedId === v.id}
                  isPending={actingId === v.id}
                  onToggle={() => setExpandedId(expandedId === v.id ? null : v.id)}
                  onAction={handleAction}
                />
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mx-auto mb-3">
                  <ClockIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Sin visitas</p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Cuando un cliente llegue con código de embajador, aparecerá aquí.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto">
          <div className="flex flex-col gap-4 p-5">

            {/* Pendientes de acción */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Requieren acción</h3>
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  pendientesAccion.length > 0 ? "bg-brand-orange text-white" : "bg-secondary text-muted-foreground"
                )}>
                  {pendientesAccion.length}
                </span>
              </div>
              {pendientesAccion.length > 0 ? (
                <div className="rounded-2xl border border-border bg-white overflow-hidden">
                  {pendientesAccion.map((v, i, arr) => (
                    <div key={v.id}>
                      <button
                        onClick={() => setExpandedId(v.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[9px] font-bold bg-brand-orange/10 text-brand-orange font-mono">
                          {v.folio.substring(0, 4)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground truncate">Folio {v.folio}</p>
                          <p className="text-[10px] text-muted-foreground">{v.codigo} · {formatFecha(v.creada)}</p>
                        </div>
                        <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                      {i < arr.length - 1 && <div className="mx-4 h-px bg-border" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-white p-4 text-center">
                  <CheckCircle2Icon className="h-8 w-8 text-brand-teal mx-auto mb-2" />
                  <p className="text-[12px] font-semibold text-foreground">¡Todo al día!</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sin visitas pendientes.</p>
                </div>
              )}
            </div>

            {/* Distribución de estados */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Distribución</h3>
              <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
                {(["confirmado", "pendiente", "rechazado"] as const).map((estado) => {
                  const count = visitas.filter((v) => v.estado === estado).length;
                  const pct = visitas.length > 0 ? Math.round((count / visitas.length) * 100) : 0;
                  const cfg = estadoConfig[estado];
                  return (
                    <div key={estado} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={cn("font-semibold", cfg.text)}>{cfg.label}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className={cn("h-full rounded-full", cfg.dot)} style={{ width: `${pct}%` }} />
                      </div>
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
