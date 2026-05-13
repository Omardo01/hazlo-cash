"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  BellIcon,
  SearchIcon,
  ChevronDownIcon,
  MoonIcon,
  StarIcon,
  ChevronRightIcon,
  UsersIcon,
  TrendingUpIcon,
  WalletIcon,
  ShieldCheckIcon,
  ZapIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EditIcon,
  ExternalLinkIcon,
  ScanLineIcon,
  XIcon,
  GiftIcon,
  AlertCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────────

const weeklyData = [
  { semana: "S1",  ventas: 2400 },
  { semana: "S2",  ventas: 3800 },
  { semana: "S3",  ventas: 3100 },
  { semana: "S4",  ventas: 5200, current: true },
];

const chartConfig = {
  ventas: { label: "Ventas", color: "var(--brand-orange)" },
} satisfies ChartConfig;

const solicitudes = [
  { id: "S001", cliente: "Cliente #247", servicio: "Taco + Refresco",   monto: 120,  fecha: "Hoy, 13:45",   estado: "nueva",      embajador: "HAZLO-OD42" },
  { id: "S002", cliente: "Cliente #183", servicio: "Orden familiar",    monto: 350,  fecha: "Hoy, 11:10",   estado: "en_proceso",  embajador: "HAZLO-MR18" },
  { id: "S003", cliente: "Ana R.",       servicio: "Catering x20 pax",  monto: 1800, fecha: "Ayer, 19:30",  estado: "completada",  embajador: "HAZLO-LP05" },
  { id: "S004", cliente: "Cliente #391", servicio: "Taco + Agua",       monto: 85,   fecha: "Ayer, 14:20",  estado: "completada",  embajador: "HAZLO-OD42" },
  { id: "S005", cliente: "Carlos M.",    servicio: "Orden familiar",    monto: 320,  fecha: "9 Abr, 20:00", estado: "completada",  embajador: "HAZLO-JV29" },
  { id: "S006", cliente: "Cliente #522", servicio: "Taco + Refresco",   monto: 110,  fecha: "9 Abr, 13:00", estado: "cancelada",   embajador: "HAZLO-MR18" },
] as const;

type EstadoKey = "nueva" | "en_proceso" | "completada" | "cancelada";

const estadoConfig: Record<EstadoKey, { label: string; icon: React.ElementType; text: string; bg: string; dot: string }> = {
  nueva:       { label: "Nueva",      icon: ZapIcon,          text: "text-brand-orange", bg: "bg-brand-orange/10", dot: "bg-brand-orange"  },
  en_proceso:  { label: "En proceso", icon: ClockIcon,        text: "text-brand-purple", bg: "bg-brand-purple/10", dot: "bg-brand-purple"  },
  completada:  { label: "Completada", icon: CheckCircle2Icon, text: "text-brand-teal",   bg: "bg-brand-teal/10",   dot: "bg-brand-teal"    },
  cancelada:   { label: "Cancelada",  icon: XCircleIcon,      text: "text-destructive",  bg: "bg-red-50",          dot: "bg-red-400"        },
};

const embajadores = [
  { codigo: "HAZLO-OD42", ini: "OD", bg: "bg-brand-dark",   refs: 14, ganado: "$280", activo: true  },
  { codigo: "HAZLO-MR18", ini: "MR", bg: "bg-brand-purple", refs: 9,  ganado: "$180", activo: true  },
  { codigo: "HAZLO-LP05", ini: "LP", bg: "bg-brand-teal",   refs: 7,  ganado: "$140", activo: true  },
  { codigo: "HAZLO-JV29", ini: "JV", bg: "bg-indigo-500",   refs: 4,  ganado: "$80",  activo: false },
];

// ── Header ────────────────────────────────────────────────────────────────────

const navTabs = [
  { label: "Inicio",      href: "/negocio"              },
  { label: "Solicitudes", href: "/negocio/solicitudes"  },
  { label: "Embajadores", href: "/negocio/embajadores"  },
  { label: "Mi Negocio",  href: "/negocio/perfil"       },
];

function NegocioHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-[62px] shrink-0 items-center bg-white border-b border-border gap-0">
      {/* Spacer for fixed mobile hamburger button */}
      <div className="w-16 shrink-0 md:hidden" />

      {/* Nav tabs — scrollable on mobile */}
      <nav className="flex items-center h-full overflow-x-auto scrollbar-none flex-nowrap flex-1 min-w-0">
        {navTabs.map((tab) => {
          const isActive = tab.href === "/negocio";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex h-full shrink-0 items-center px-3 sm:px-4 text-sm transition-colors",
                isActive
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-brand-orange" />
              )}
            </Link>
          );
        })}
        <div className="mx-1 h-5 w-px bg-border shrink-0" />
        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <SearchIcon className="h-4 w-4" />
        </button>
      </nav>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pr-3 sm:pr-5">
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

function StatCard({
  title, value, change, changePositive, icon: Icon, iconColor, iconBg,
}: {
  title: string; value: string; change: string; changePositive?: boolean;
  icon: React.ElementType; iconColor: string; iconBg: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none">{value}</p>
          <p className={cn("text-[11px] font-medium", changePositive ? "text-brand-teal" : "text-muted-foreground")}>
            {change}
          </p>
        </div>
        <div className={cn("flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl shrink-0", iconBg)}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}

// ── Right Panel (Inline for mobile/tablet) ────────────────────────────────────

function NegocioRightPanel({ perfilPct }: { perfilPct: number }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Profile completeness */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Perfil del negocio</h3>
          <span className="text-xs font-bold text-brand-orange">{perfilPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${perfilPct}%`,
              background: "linear-gradient(90deg, var(--brand-orange), #F5C842)",
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          {[
            { label: "Foto de portada",    done: false },
            { label: "Menú / servicios",   done: false },
            { label: "Horarios",           done: true  },
            { label: "Descripción",        done: true  },
            { label: "Teléfono verificado",done: true  },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <div className={cn(
                "h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-[9px]",
                item.done ? "bg-brand-teal/15 text-brand-teal" : "bg-border text-muted-foreground"
              )}>
                {item.done ? "✓" : "·"}
              </div>
              <span className={cn("text-[11px]", item.done ? "text-muted-foreground line-through" : "text-foreground font-medium")}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-xl bg-brand-orange/10 hover:bg-brand-orange/20 py-2 text-[12px] font-semibold text-brand-orange transition-all">
          Completar perfil →
        </button>
      </div>

      {/* Active offer */}
      <div
        className="rounded-2xl p-4 text-white"
        style={{ background: "linear-gradient(135deg, var(--brand-orange) 0%, #F5C842 100%)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ZapIcon className="h-3.5 w-3.5" />
          <p className="text-[11px] font-bold uppercase tracking-wider">Oferta activa</p>
        </div>
        <p className="text-sm font-black leading-tight mb-1">1 Coca gratis</p>
        <p className="text-[11px] text-white/75">Para clientes que lleguen por Hazlo Cash</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-white/60">Vence: 30 Abr</span>
          <button className="text-[11px] font-semibold bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1 transition-all">
            Editar
          </button>
        </div>
      </div>

      {/* Top ambassadors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Top embajadores</h3>
          <button className="text-[11px] text-brand-purple font-medium hover:underline flex items-center gap-0.5">
            Ver todos <ExternalLinkIcon className="h-2.5 w-2.5" />
          </button>
        </div>
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {embajadores.map((emb, i, arr) => (
            <div key={emb.codigo}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white", emb.bg)}>
                  {emb.ini}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[11px] font-bold text-foreground">{emb.codigo}</p>
                  <p className="text-[10px] text-muted-foreground">{emb.refs} referidos · {emb.ganado}</p>
                </div>
                <span className={cn("h-2 w-2 rounded-full shrink-0", emb.activo ? "bg-brand-teal" : "bg-border")} />
              </div>
              {i < arr.length - 1 && <div className="mx-4 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {/* Comisiones pagadas */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold">Comisiones pagadas</h3>
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground cursor-help">i</span>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10">
            <WalletIcon className="h-5 w-5 text-brand-teal" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-black text-foreground">$1,894</p>
            <p className="text-[11px] text-muted-foreground">Pagado a embajadores este mes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// ── Mock: códigos válidos para el demo ────────────────────────────────────────
const CODIGOS_VALIDOS: Record<string, { recomendador: string; oferta: string; comision: number }> = {
  "HAZLO-OD42": { recomendador: "Omar D.",  oferta: "1 Coca gratis",              comision: 6  },
  "HAZLO-MR18": { recomendador: "Mario R.", oferta: "10% descuento en tu visita", comision: 12 },
  "HAZLO-LP05": { recomendador: "Luis P.",  oferta: "Postre gratis",              comision: 9  },
  "HAZLO-JV29": { recomendador: "Jorge V.", oferta: "Agua fresca gratis",         comision: 5  },
};

type VentaState = "idle" | "validando" | "valido" | "invalido" | "aplicada";

// ── Componente verificador ────────────────────────────────────────────────────

function VerificarCodigoDialog({
  open,
  onClose,
  onVentaAplicada,
}: {
  open: boolean;
  onClose: () => void;
  onVentaAplicada: (codigo: string, recomendador: string, comision: number) => void;
}) {
  const [input, setInput] = useState("");
  const [state, setState] = useState<VentaState>("idle");
  const [codigoInfo, setCodigoInfo] = useState<typeof CODIGOS_VALIDOS[string] | null>(null);

  function reset() {
    setInput("");
    setState("idle");
    setCodigoInfo(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleVerificar() {
    const normalizado = input.trim().toUpperCase();
    setState("validando");
    setTimeout(() => {
      const info = CODIGOS_VALIDOS[normalizado];
      if (info) {
        setCodigoInfo(info);
        setState("valido");
      } else {
        setState("invalido");
      }
    }, 700);
  }

  function handleAplicar() {
    if (!codigoInfo) return;
    setState("aplicada");
    const normalizado = input.trim().toUpperCase();
    setTimeout(() => {
      onVentaAplicada(normalizado, codigoInfo.recomendador, codigoInfo.comision);
      handleClose();
    }, 1800);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange/10">
              <ScanLineIcon className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Verificar código</h2>
              <p className="text-[11px] text-muted-foreground">Ingresa el código del cliente</p>
            </div>
          </div>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <XIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Input */}
          <div className="relative">
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value.toUpperCase()); setState("idle"); setCodigoInfo(null); }}
              onKeyDown={(e) => e.key === "Enter" && state === "idle" && input.trim() && handleVerificar()}
              placeholder="HAZLO-XXXX"
              maxLength={10}
              className={cn(
                "h-14 w-full rounded-2xl border-2 bg-secondary/30 px-4 text-center text-xl font-black tracking-widest font-mono focus:outline-none transition-colors",
                state === "valido"   ? "border-emerald-400 bg-emerald-50 text-emerald-700" :
                state === "invalido" ? "border-red-400 bg-red-50 text-red-600" :
                state === "aplicada" ? "border-brand-teal bg-brand-teal/5 text-brand-teal" :
                "border-border focus:border-brand-orange"
              )}
            />
          </div>

          {/* Estado: validando */}
          {state === "validando" && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-4 w-4 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">Verificando...</span>
            </div>
          )}

          {/* Estado: inválido */}
          {state === "invalido" && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircleIcon className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 font-medium">Código no encontrado o no válido para este negocio.</p>
            </div>
          )}

          {/* Estado: válido */}
          {state === "valido" && codigoInfo && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-700">Código válido</span>
                </div>
                <div className="flex flex-col gap-1 text-[12px] text-emerald-700">
                  <span>Recomendador: <strong>{codigoInfo.recomendador}</strong></span>
                  <span>Comisión generada: <strong>${codigoInfo.comision} MXN</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-brand-orange/40 bg-brand-orange/5 px-4 py-3">
                <GiftIcon className="h-4 w-4 text-brand-orange shrink-0" />
                <p className="text-sm font-semibold text-foreground">{codigoInfo.oferta}</p>
              </div>
            </div>
          )}

          {/* Estado: aplicada */}
          {state === "aplicada" && (
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10">
                <CheckCircle2Icon className="h-6 w-6 text-brand-teal" />
              </div>
              <p className="text-sm font-black text-brand-teal">¡Venta aplicada!</p>
              <p className="text-xs text-muted-foreground text-center">La comisión fue acreditada al recomendador.</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            {state === "idle" || state === "invalido" ? (
              <>
                <button onClick={handleClose} className="flex-1 h-11 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleVerificar}
                  disabled={!input.trim()}
                  className="flex-1 h-11 rounded-2xl bg-brand-orange text-white text-sm font-semibold disabled:opacity-40 hover:bg-brand-orange/90 transition-colors"
                >
                  Verificar
                </button>
              </>
            ) : state === "valido" ? (
              <>
                <button onClick={reset} className="flex-1 h-11 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleAplicar}
                  className="flex-1 h-11 rounded-2xl bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal/90 transition-colors"
                >
                  Aplicar venta ✓
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NegocioDashboard() {
  const [filterEstado, setFilterEstado] = useState<"todas" | EstadoKey>("todas");
  const [verificarOpen, setVerificarOpen] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState<{ codigo: string; recomendador: string; comision: number } | null>(null);

  const filteredSolicitudes = filterEstado === "todas"
    ? solicitudes
    : solicitudes.filter((s) => s.estado === filterEstado);

  const calificacion = 4.8;
  const completadas = solicitudes.filter((s) => s.estado === "completada").length;
  const perfilPct = 75;

  function handleVentaAplicada(codigo: string, recomendador: string, comision: number) {
    setUltimaVenta({ codigo, recomendador, comision });
    setTimeout(() => setUltimaVenta(null), 5000);
  }

  return (
    <>
      <NegocioHeader />

      {/* ── Toast de venta aplicada ── */}
      {ultimaVenta && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-brand-teal text-white px-5 py-3.5 shadow-xl shadow-brand-teal/20 animate-in slide-in-from-top-2 fade-in duration-300">
          <CheckCircle2Icon className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-black">¡Venta registrada!</p>
            <p className="text-[11px] text-white/80">{ultimaVenta.codigo} · Comisión +${ultimaVenta.comision} para {ultimaVenta.recomendador}</p>
          </div>
        </div>
      )}

      <VerificarCodigoDialog
        open={verificarOpen}
        onClose={() => setVerificarOpen(false)}
        onVentaAplicada={handleVentaAplicada}
      />

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb + botón verificar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
              <span className="text-brand-orange">Negocio</span>
              <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Tacos El Güero</span>
            </div>
            <button
              onClick={() => setVerificarOpen(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-brand-orange text-white text-[12px] font-bold hover:bg-brand-orange/90 transition-colors shadow-sm shadow-brand-orange/20"
            >
              <ScanLineIcon className="h-3.5 w-3.5" />
              Verificar código
            </button>
          </div>

          {/* Business header */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1A1840 0%, #2D2B8F 60%, #F5A623 200%)" }}
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center gap-4 sm:gap-5">
              {/* Logo */}
              <div className="relative shrink-0">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-brand-orange flex items-center justify-center text-xl font-black text-white">
                  TG
                </div>
                <span className="absolute -bottom-1.5 -right-1 rounded-full bg-brand-teal px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                  ✓ VER
                </span>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Tacos El Güero</h2>
                  <span className="rounded-full bg-brand-orange/25 px-2.5 py-0.5 text-[10px] font-bold text-brand-orange">
                    Comida · Villahermosa
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <StarIcon
                        key={s}
                        className={cn("h-3 w-3", s <= Math.floor(calificacion) ? "fill-brand-orange text-brand-orange" : "text-white/30")}
                      />
                    ))}
                    <span className="text-xs font-bold text-white ml-1">{calificacion}</span>
                  </div>
                  <span className="text-[11px] text-white/40">·</span>
                  <span className="text-[11px] text-white/60">124 reseñas</span>
                  <span className="hidden sm:inline text-[11px] text-white/40">·</span>
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-white/60">
                    <MapPinIcon className="h-3 w-3" />
                    Av. Méndez 245, Col. Centro
                  </div>
                </div>
              </div>

              {/* Quick stats — row in sm, hidden in xs */}
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                {[
                  { label: "Ventas/mes",  value: "$18,450" },
                  { label: "Clientes",    value: "24"      },
                  { label: "Embajadores", value: "7"       },
                ].map((s) => (
                  <div key={s.label} className="text-center flex-1 sm:flex-none">
                    <p className="text-base sm:text-lg font-black text-white">{s.value}</p>
                    <p className="text-[10px] sm:text-[11px] text-white/50">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom stripe */}
            <div className="flex items-center gap-3 sm:gap-4 border-t border-white/10 px-4 sm:px-6 py-2.5 flex-wrap">
              <PhoneIcon className="h-3 w-3 text-white/40 shrink-0" />
              <span className="text-[11px] text-white/50">+52 993 456 7890</span>
              <span className="text-white/20 hidden sm:inline">·</span>
              <span className="text-[11px] text-white/50 hidden sm:inline">hazlocash.mx/b/tacos-el-guero</span>
              <button className="ml-auto flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white transition-all">
                <EditIcon className="h-3 w-3" />
                Editar perfil
              </button>
            </div>
          </div>

          {/* Stats — 2 cols mobile, 4 cols sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              title="Ventas del mes"
              value="$18,450"
              change="+$3,200 vs mes pasado"
              changePositive
              icon={WalletIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/8"
            />
            <StatCard
              title="Clientes nuevos"
              value="24"
              change="+8 esta semana"
              changePositive
              icon={UsersIcon}
              iconColor="text-brand-teal"
              iconBg="bg-brand-teal/8"
            />
            <StatCard
              title="Embajadores"
              value="7"
              change="4 activos este mes"
              icon={TrendingUpIcon}
              iconColor="text-brand-purple"
              iconBg="bg-brand-purple/8"
            />
            <StatCard
              title="Calificación"
              value="4.8 ★"
              change="124 reseñas totales"
              changePositive
              icon={StarIcon}
              iconColor="text-brand-orange"
              iconBg="bg-brand-orange/8"
            />
          </div>

          {/* Weekly chart */}
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Ventas semanales</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Abril 2026</span>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs font-semibold text-brand-teal">
                  {completadas} transacciones completadas
                </span>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[160px] w-full">
              <BarChart data={weeklyData} barSize={48} margin={{ top: 4, right: 0, bottom: 0, left: -14 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="semana" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8B8BA3" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8B8BA3" }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const val = payload[0]?.value as number;
                    return (
                      <div className="rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-lg">
                        <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-xl font-bold">${val?.toLocaleString("es-MX")} MXN</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="ventas" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry) => (
                    <Cell
                      key={entry.semana}
                      fill={entry.current ? "var(--brand-orange)" : "rgba(245,166,35,0.18)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          {/* Solicitudes */}
          <div className="rounded-2xl border border-border bg-white">

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-3.5 gap-3 flex-wrap">
              <h3 className="text-sm font-semibold">Solicitudes recientes</h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["todas", "nueva", "en_proceso", "completada", "cancelada"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterEstado(f)}
                    className={cn(
                      "rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold transition-all capitalize",
                      filterEstado === f
                        ? "bg-brand-orange text-white shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-border"
                    )}
                  >
                    {f === "todas" ? "Todas" : estadoConfig[f].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Anti-bypass notice */}
            <div className="flex items-center gap-2 bg-brand-purple/5 border-b border-border px-4 sm:px-5 py-2.5">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-purple shrink-0" />
              <p className="text-[11px] text-brand-purple">
                Los datos del cliente se revelan solo al confirmar la transacción dentro de Hazlo Cash.
              </p>
            </div>

            {/* Column headers — desktop table */}
            <div className="hidden sm:grid sm:grid-cols-[1.5fr_1fr_100px_100px_100px] gap-4 px-5 py-2 border-b border-border">
              {["Cliente", "Servicio", "Monto", "Embajador", "Estado"].map((h) => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows — desktop: grid / mobile: cards */}
            {filteredSolicitudes.map((s, i) => {
              const cfg = estadoConfig[s.estado];
              return (
                <div key={s.id}>
                  {/* ── Mobile card view (< sm) ── */}
                  <div className="sm:hidden px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                          <UsersIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{s.cliente}</p>
                          <p className="text-[11px] text-muted-foreground">{s.fecha}</p>
                        </div>
                      </div>
                      <div className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", cfg.bg, cfg.text)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between pl-12">
                      <div>
                        <p className="text-[11px] text-muted-foreground">{s.servicio}</p>
                        <p className="font-mono text-[11px] text-brand-purple font-semibold">{s.embajador}</p>
                      </div>
                      <span className="text-sm font-black text-foreground">${s.monto.toLocaleString("es-MX")}</span>
                    </div>
                  </div>

                  {/* ── Desktop table row (sm+) ── */}
                  <div className="hidden sm:grid sm:grid-cols-[1.5fr_1fr_100px_100px_100px] gap-4 items-center px-5 py-3.5">
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
                    <span className="text-xs text-foreground">{s.servicio}</span>
                    {/* Monto */}
                    <span className="text-xs font-bold text-foreground">${s.monto.toLocaleString("es-MX")}</span>
                    {/* Embajador */}
                    <span className="font-mono text-[11px] text-brand-purple font-semibold">{s.embajador}</span>
                    {/* Estado */}
                    <div className={cn("flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", cfg.bg, cfg.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </div>
                  </div>

                  {i < filteredSolicitudes.length - 1 && <div className="mx-4 sm:mx-5 h-px bg-border" />}
                </div>
              );
            })}

            {filteredSolicitudes.length === 0 && (
              <div className="py-14 text-center text-sm text-muted-foreground">
                Sin solicitudes en este estado.
              </div>
            )}
          </div>

          {/* Right panel — inline on mobile/tablet */}
          <div className="lg:hidden">
            <NegocioRightPanel perfilPct={perfilPct} />
          </div>

        </div>

        {/* ── Right panel — desktop only ── */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto">
          <div className="flex flex-col gap-4 p-5">
            <NegocioRightPanel perfilPct={perfilPct} />
          </div>
        </div>

      </div>
    </>
  );
}
