"use client";

import { useState } from "react";
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
  FilterIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  XIcon,
  WalletIcon,
  TrendingUpIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Data ──────────────────────────────────────────────────────────────

type EstadoKey = "nueva" | "en_proceso" | "completada" | "cancelada";

interface Solicitud {
  id: string;
  cliente: string;
  servicio: string;
  monto: number;
  fecha: string;
  estado: EstadoKey;
  embajador: string;
  nota?: string;
}

const solicitudesData: Solicitud[] = [
  { id: "S001", cliente: "Cliente #247", servicio: "Taco + Refresco",    monto: 120,  fecha: "Hoy, 13:45",    estado: "nueva",       embajador: "HAZLO-OD42" },
  { id: "S002", cliente: "Cliente #183", servicio: "Orden familiar",     monto: 350,  fecha: "Hoy, 11:10",    estado: "en_proceso",  embajador: "HAZLO-MR18", nota: "Sin cebolla por favor" },
  { id: "S003", cliente: "Ana R.",       servicio: "Catering x20 pax",   monto: 1800, fecha: "Ayer, 19:30",   estado: "completada",  embajador: "HAZLO-LP05" },
  { id: "S004", cliente: "Cliente #391", servicio: "Taco + Agua",        monto: 85,   fecha: "Ayer, 14:20",   estado: "completada",  embajador: "HAZLO-OD42" },
  { id: "S005", cliente: "Carlos M.",    servicio: "Orden familiar",     monto: 320,  fecha: "9 Abr, 20:00",  estado: "completada",  embajador: "HAZLO-JV29" },
  { id: "S006", cliente: "Cliente #522", servicio: "Taco + Refresco",    monto: 110,  fecha: "9 Abr, 13:00",  estado: "cancelada",   embajador: "HAZLO-MR18", nota: "No contestó" },
  { id: "S007", cliente: "Cliente #601", servicio: "Orden familiar",     monto: 340,  fecha: "8 Abr, 19:15",  estado: "completada",  embajador: "HAZLO-OD42" },
  { id: "S008", cliente: "Lupe G.",      servicio: "Catering x10 pax",   monto: 900,  fecha: "8 Abr, 12:00",  estado: "completada",  embajador: "HAZLO-LP05" },
  { id: "S009", cliente: "Cliente #712", servicio: "Taco + Refresco",    monto: 120,  fecha: "7 Abr, 20:45",  estado: "completada",  embajador: "HAZLO-MR18" },
  { id: "S010", cliente: "Cliente #489", servicio: "Orden individual",   monto: 95,   fecha: "7 Abr, 13:30",  estado: "cancelada",   embajador: "HAZLO-JV29" },
];

const estadoConfig: Record<EstadoKey, {
  label: string; icon: React.ElementType; text: string; bg: string; dot: string; border: string;
}> = {
  nueva:      { label: "Nueva",      icon: ZapIcon,          text: "text-brand-orange", bg: "bg-brand-orange/10", dot: "bg-brand-orange",  border: "border-brand-orange/30" },
  en_proceso: { label: "En proceso", icon: ClockIcon,        text: "text-brand-purple", bg: "bg-brand-purple/10", dot: "bg-brand-purple",  border: "border-brand-purple/30" },
  completada: { label: "Completada", icon: CheckCircle2Icon, text: "text-brand-teal",   bg: "bg-brand-teal/10",   dot: "bg-brand-teal",    border: "border-brand-teal/30"   },
  cancelada:  { label: "Cancelada",  icon: XCircleIcon,      text: "text-destructive",  bg: "bg-red-50",          dot: "bg-red-400",       border: "border-red-200"         },
};

const navTabs = [
  { label: "Inicio",      href: "/negocio"              },
  { label: "Solicitudes", href: "/negocio/solicitudes"  },
  { label: "Embajadores", href: "/negocio/embajadores"  },
  { label: "Mi Negocio",  href: "/negocio/perfil"       },
];

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
        <div className="mx-1 h-5 w-px bg-border" />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <SearchIcon className="h-4 w-4" />
        </button>
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

// ── Row expanded detail ───────────────────────────────────────────────────────

function SolicitudRow({
  s,
  isExpanded,
  onToggle,
  onAction,
}: {
  s: Solicitud;
  isExpanded: boolean;
  onToggle: () => void;
  onAction: (id: string, action: "aceptar" | "confirmar" | "cancelar") => void;
}) {
  const cfg = estadoConfig[s.estado];
  const StateIcon = cfg.icon;

  return (
    <div className={cn("border-b border-border last:border-0 transition-colors", isExpanded && "bg-secondary/30")}>
      {/* Main row */}
      <button
        onClick={onToggle}
        className="w-full grid sm:grid-cols-[1fr_180px_90px_130px_120px_32px] gap-3 items-center px-5 py-3.5 text-left hover:bg-secondary/20 transition-colors"
      >
        {/* Cliente */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <UsersIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{s.cliente}</p>
            <p className="text-[11px] text-muted-foreground">{s.fecha}</p>
          </div>
        </div>
        {/* Servicio */}
        <span className="text-xs text-foreground hidden sm:block">{s.servicio}</span>
        {/* Monto */}
        <span className="text-xs font-bold text-foreground hidden sm:block">${s.monto.toLocaleString("es-MX")}</span>
        {/* Embajador */}
        <span className="font-mono text-[11px] text-brand-purple font-semibold hidden sm:block">{s.embajador}</span>
        {/* Estado */}
        <div className={cn("flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border", cfg.bg, cfg.text, cfg.border)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
          <StateIcon className="h-3 w-3" />
          {cfg.label}
        </div>
        {/* Chevron */}
        <div className="hidden sm:flex items-center justify-center text-muted-foreground">
          {isExpanded ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-5 pb-4 space-y-3">
          <div className="rounded-xl bg-white border border-border p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <p className="text-muted-foreground mb-0.5">ID solicitud</p>
                <p className="font-mono font-bold text-foreground">{s.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Servicio</p>
                <p className="font-semibold text-foreground">{s.servicio}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Monto</p>
                <p className="font-bold text-foreground text-sm">${s.monto.toLocaleString("es-MX")} MXN</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Fecha</p>
                <p className="font-semibold text-foreground">{s.fecha}</p>
              </div>
            </div>

            {s.nota && (
              <div className="rounded-lg bg-brand-orange/5 border border-brand-orange/20 px-3 py-2 text-[11px] text-foreground">
                <span className="font-semibold text-brand-orange">Nota del cliente: </span>
                {s.nota}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {s.estado === "nueva" && (
                <>
                  <button
                    onClick={() => onAction(s.id, "aceptar")}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-orange text-white px-3.5 py-2 text-[12px] font-semibold hover:bg-brand-orange/90 transition-colors"
                  >
                    <CheckCircle2Icon className="h-3.5 w-3.5" />
                    Aceptar solicitud
                  </button>
                  <button
                    onClick={() => onAction(s.id, "cancelar")}
                    className="flex items-center gap-1.5 rounded-xl bg-secondary text-muted-foreground px-3.5 py-2 text-[12px] font-semibold hover:bg-border transition-colors"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                    Rechazar
                  </button>
                </>
              )}
              {s.estado === "en_proceso" && (
                <button
                  onClick={() => onAction(s.id, "confirmar")}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-teal text-white px-3.5 py-2 text-[12px] font-semibold hover:bg-brand-teal/90 transition-colors"
                >
                  <CheckCircle2Icon className="h-3.5 w-3.5" />
                  Confirmar servicio completado
                </button>
              )}
              <button className="flex items-center gap-1.5 rounded-xl bg-secondary text-muted-foreground px-3.5 py-2 text-[12px] font-semibold hover:bg-border transition-colors">
                <MessageSquareIcon className="h-3.5 w-3.5" />
                Ver chat
              </button>
            </div>

            {(s.estado === "nueva" || s.estado === "en_proceso") && (
              <div className="flex items-center gap-2 rounded-lg bg-brand-purple/5 border border-brand-purple/15 px-3 py-2">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-purple shrink-0" />
                <p className="text-[11px] text-brand-purple">
                  Los datos de contacto del cliente se revelan solo al confirmar la transacción.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SolicitudesPage() {
  const [filterEstado, setFilterEstado] = useState<"todas" | EstadoKey>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(solicitudesData);

  const handleAction = (id: string, action: "aceptar" | "confirmar" | "cancelar") => {
    setSolicitudes((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (action === "aceptar") return { ...s, estado: "en_proceso" as EstadoKey };
        if (action === "confirmar") return { ...s, estado: "completada" as EstadoKey };
        if (action === "cancelar") return { ...s, estado: "cancelada" as EstadoKey };
        return s;
      })
    );
    setExpandedId(null);
  };

  const filtered = solicitudes.filter((s) => {
    const matchEstado = filterEstado === "todas" || s.estado === filterEstado;
    const matchSearch =
      searchQuery === "" ||
      s.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.embajador.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.servicio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchEstado && matchSearch;
  });

  const counts = {
    nuevas:     solicitudes.filter((s) => s.estado === "nueva").length,
    en_proceso: solicitudes.filter((s) => s.estado === "en_proceso").length,
    completadas: solicitudes.filter((s) => s.estado === "completada").length,
    total:      solicitudes.length,
  };

  const ingresosDia = solicitudes
    .filter((s) => s.estado === "completada" && s.fecha.startsWith("Hoy"))
    .reduce((acc, s) => acc + s.monto, 0);

  const pendientesAccion = solicitudes.filter(
    (s) => s.estado === "nueva" || s.estado === "en_proceso"
  );

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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-black text-foreground">Solicitudes</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Gestiona todas las solicitudes de tus clientes</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-border px-3.5 py-2 text-[12px] font-semibold text-muted-foreground transition-colors">
                <CalendarIcon className="h-3.5 w-3.5" />
                Abril 2026
              </button>
              <button className="flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-border px-3.5 py-2 text-[12px] font-semibold text-muted-foreground transition-colors">
                <FilterIcon className="h-3.5 w-3.5" />
                Filtros
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat label="Nuevas" value={counts.nuevas} sub="Requieren acción" color="text-brand-orange" />
            <MiniStat label="En proceso" value={counts.en_proceso} sub="En curso hoy" color="text-brand-purple" />
            <MiniStat label="Completadas" value={counts.completadas} sub="Este mes" color="text-brand-teal" />
            <MiniStat
              label="Ingresos hoy"
              value={ingresosDia > 0 ? `$${ingresosDia.toLocaleString("es-MX")}` : "$0"}
              sub="Transacciones confirmadas"
              color="text-foreground"
            />
          </div>

          {/* Solicitudes table */}
          <div className="rounded-2xl border border-border bg-white flex-1">

            {/* Toolbar */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary pl-8 pr-3 py-2 text-[12px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all placeholder:text-muted-foreground"
                />
              </div>
              {/* Filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["todas", "nueva", "en_proceso", "completada", "cancelada"] as const).map((f) => (
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
                    {f === "todas" ? `Todas (${counts.total})` : `${estadoConfig[f].label}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Anti-bypass notice */}
            <div className="flex items-center gap-2 bg-brand-purple/5 border-b border-border px-5 py-2.5">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-purple shrink-0" />
              <p className="text-[11px] text-brand-purple">
                Anti-bypass activo — Los datos de contacto del cliente se revelan solo al confirmar la transacción dentro de Hazlo Cash.
              </p>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_180px_90px_130px_120px_32px] gap-3 px-5 py-2.5 border-b border-border bg-secondary/40">
              {["Cliente", "Servicio", "Monto", "Embajador", "Estado", ""].map((h, i) => (
                <span key={i} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <SolicitudRow
                  key={s.id}
                  s={s}
                  isExpanded={expandedId === s.id}
                  onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  onAction={handleAction}
                />
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mx-auto mb-3">
                  <ClockIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Sin solicitudes</p>
                <p className="text-[12px] text-muted-foreground mt-1">No hay solicitudes con este filtro.</p>
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
                  {pendientesAccion.map((s, i, arr) => {
                    const cfg = estadoConfig[s.estado];
                    return (
                      <div key={s.id}>
                        <button
                          onClick={() => setExpandedId(s.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold", cfg.bg, cfg.text)}>
                            {s.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-foreground truncate">{s.cliente}</p>
                            <p className="text-[10px] text-muted-foreground">{s.servicio} · ${s.monto}</p>
                          </div>
                          <ArrowRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                        {i < arr.length - 1 && <div className="mx-4 h-px bg-border" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-white p-4 text-center">
                  <CheckCircle2Icon className="h-8 w-8 text-brand-teal mx-auto mb-2" />
                  <p className="text-[12px] font-semibold text-foreground">¡Todo al día!</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sin solicitudes pendientes.</p>
                </div>
              )}
            </div>

            {/* Ingresos resumen */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Ingresos del mes</h3>
              <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
                {[
                  { label: "Ventas totales",   value: "$18,450", icon: WalletIcon,     color: "text-brand-orange", bg: "bg-brand-orange/8"  },
                  { label: "Comisiones pagadas", value: "$1,894", icon: TrendingUpIcon, color: "text-brand-teal",   bg: "bg-brand-teal/8"    },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", item.bg)}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-black text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-1 border-t border-border">
                  <Link href="/negocio" className="flex items-center justify-center gap-1 text-[11px] font-semibold text-brand-orange hover:underline">
                    Ver dashboard completo <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Distribución de estados */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Distribución del mes</h3>
              <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
                {(["completada", "en_proceso", "nueva", "cancelada"] as const).map((estado) => {
                  const count = solicitudes.filter((s) => s.estado === estado).length;
                  const pct = Math.round((count / solicitudes.length) * 100);
                  const cfg = estadoConfig[estado];
                  return (
                    <div key={estado} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={cn("font-semibold", cfg.text)}>{cfg.label}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", cfg.dot)}
                          style={{ width: `${pct}%` }}
                        />
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
