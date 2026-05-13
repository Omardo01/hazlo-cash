"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  ChevronDownIcon,
  MoonIcon,
  ChevronRightIcon,
  SearchIcon,
  TrendingUpIcon,
  WalletIcon,
  UsersIcon,
  ZapIcon,
  StarIcon,
  ArrowRightIcon,
  ShareIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  CopyIcon,
  ExternalLinkIcon,
  AwardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types & Data ──────────────────────────────────────────────────────────────

type NivelKey = "bronce" | "plata" | "oro";

interface Embajador {
  id: string;
  codigo: string;
  iniciales: string;
  bg: string;
  nivel: NivelKey;
  referidos: number;
  completadas: number;
  comisionTotal: number;
  comisionMes: number;
  ultimaRef: string;
  activo: boolean;
}

const embajadoresData: Embajador[] = [
  { id: "e1", codigo: "HAZLO-OD42", iniciales: "OD", bg: "bg-brand-dark",    nivel: "oro",    referidos: 14, completadas: 12, comisionTotal: 2940, comisionMes: 560, ultimaRef: "Hoy",         activo: true  },
  { id: "e2", codigo: "HAZLO-MR18", iniciales: "MR", bg: "bg-brand-purple",  nivel: "plata",  referidos: 9,  completadas: 7,  comisionTotal: 1260, comisionMes: 320, ultimaRef: "Hoy",         activo: true  },
  { id: "e3", codigo: "HAZLO-LP05", iniciales: "LP", bg: "bg-brand-teal",    nivel: "plata",  referidos: 7,  completadas: 6,  comisionTotal: 1050, comisionMes: 280, ultimaRef: "Ayer",        activo: true  },
  { id: "e4", codigo: "HAZLO-JV29", iniciales: "JV", bg: "bg-indigo-500",    nivel: "bronce", referidos: 4,  completadas: 3,  comisionTotal: 480,  comisionMes: 80,  ultimaRef: "9 Abr",       activo: false },
  { id: "e5", codigo: "HAZLO-AG11", iniciales: "AG", bg: "bg-rose-500",      nivel: "bronce", referidos: 2,  completadas: 2,  comisionTotal: 200,  comisionMes: 0,   ultimaRef: "5 Abr",       activo: false },
  { id: "e6", codigo: "HAZLO-TS33", iniciales: "TS", bg: "bg-amber-500",     nivel: "bronce", referidos: 1,  completadas: 0,  comisionTotal: 0,    comisionMes: 0,   ultimaRef: "3 Abr",       activo: false },
];

const nivelConfig: Record<NivelKey, { label: string; color: string; bg: string; icon: string }> = {
  bronce: { label: "Bronce", color: "text-amber-600",   bg: "bg-amber-50",   icon: "🥉" },
  plata:  { label: "Plata",  color: "text-slate-500",   bg: "bg-slate-50",   icon: "🥈" },
  oro:    { label: "Oro",    color: "text-brand-orange", bg: "bg-brand-orange/8", icon: "🥇" },
};

const recentActivity = [
  { id: "a1", codigo: "HAZLO-OD42", evento: "Nuevo referido",      servicio: "Taco + Refresco",  monto: 120,  tiempo: "Hace 2h",  tipo: "nueva"      },
  { id: "a2", codigo: "HAZLO-MR18", evento: "Transacción completada", servicio: "Orden familiar", monto: 350,  tiempo: "Hace 5h",  tipo: "completada" },
  { id: "a3", codigo: "HAZLO-LP05", evento: "Transacción completada", servicio: "Catering x20",  monto: 1800, tiempo: "Ayer",     tipo: "completada" },
  { id: "a4", codigo: "HAZLO-OD42", evento: "Transacción completada", servicio: "Taco + Agua",   monto: 85,   tiempo: "Ayer",     tipo: "completada" },
  { id: "a5", codigo: "HAZLO-JV29", evento: "Nuevo referido",         servicio: "Orden familiar", monto: 320,  tiempo: "9 Abr",   tipo: "nueva"      },
];

const actividadConfig = {
  nueva:      { color: "bg-brand-orange/10 text-brand-orange", dot: "bg-brand-orange",  icon: ZapIcon          },
  completada: { color: "bg-brand-teal/10 text-brand-teal",     dot: "bg-brand-teal",    icon: CheckCircle2Icon },
  cancelada:  { color: "bg-red-50 text-red-500",               dot: "bg-red-400",       icon: XCircleIcon      },
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

// ── Embajador Row ──────────────────────────────────────────────────────────────

function EmbajadorRow({ emb, rank }: { emb: Embajador; rank: number }) {
  const [copied, setCopied] = useState(false);
  const nivel = nivelConfig[emb.nivel];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(emb.codigo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="grid sm:grid-cols-[40px_1fr_100px_90px_100px_100px_80px] gap-3 items-center px-5 py-3.5 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">

      {/* Rank */}
      <span className={cn(
        "text-sm font-black text-center",
        rank === 1 ? "text-brand-orange" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-amber-600" : "text-muted-foreground"
      )}>
        #{rank}
      </span>

      {/* Avatar + código */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-[12px] font-bold text-white", emb.bg)}>
            {emb.iniciales}
          </div>
          {emb.activo && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-teal border-2 border-white" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[12px] font-bold text-foreground">{emb.codigo}</p>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-brand-purple transition-colors"
            >
              {copied ? <CheckCircle2Icon className="h-3 w-3 text-brand-teal" /> : <CopyIcon className="h-3 w-3" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Último: {emb.ultimaRef}</p>
        </div>
      </div>

      {/* Nivel */}
      <div className={cn("hidden sm:flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", nivel.bg, nivel.color)}>
        <span>{nivel.icon}</span>
        {nivel.label}
      </div>

      {/* Referidos */}
      <div className="hidden sm:block text-center">
        <p className="text-sm font-black text-foreground">{emb.referidos}</p>
        <p className="text-[10px] text-muted-foreground">referidos</p>
      </div>

      {/* Completadas */}
      <div className="hidden sm:block text-center">
        <p className="text-sm font-black text-brand-teal">{emb.completadas}</p>
        <p className="text-[10px] text-muted-foreground">completadas</p>
      </div>

      {/* Comisión mes */}
      <div className="hidden sm:block text-center">
        <p className="text-sm font-black text-foreground">${emb.comisionMes.toLocaleString("es-MX")}</p>
        <p className="text-[10px] text-muted-foreground">este mes</p>
      </div>

      {/* Estado */}
      <div className="hidden sm:flex items-center justify-center">
        <span className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold",
          emb.activo ? "bg-brand-teal/10 text-brand-teal" : "bg-secondary text-muted-foreground"
        )}>
          {emb.activo ? "ON" : "—"}
        </span>
      </div>

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EmbajadoresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNivel, setFilterNivel] = useState<"todos" | NivelKey>("todos");

  const filtered = embajadoresData.filter((e) => {
    const matchNivel = filterNivel === "todos" || e.nivel === filterNivel;
    const matchSearch =
      searchQuery === "" ||
      e.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.iniciales.toLowerCase().includes(searchQuery.toLowerCase());
    return matchNivel && matchSearch;
  });

  const totalReferidos   = embajadoresData.reduce((a, e) => a + e.referidos, 0);
  const totalComisiones  = embajadoresData.reduce((a, e) => a + e.comisionTotal, 0);
  const activos          = embajadoresData.filter((e) => e.activo).length;
  const topEmbajador     = embajadoresData[0];

  return (
    <>
      <NegocioHeader activeHref="/negocio/embajadores" />

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-orange">Negocio</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Embajadores</span>
          </div>

          {/* Title */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-black text-foreground">Embajadores</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Las personas que recomiendan tu negocio en Hazlo Cash</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl bg-brand-orange text-white px-4 py-2 text-[12px] font-semibold hover:bg-brand-orange/90 transition-colors shadow-sm">
              <ShareIcon className="h-3.5 w-3.5" />
              Invitar embajador
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total embajadores",    value: embajadoresData.length, sub: `${activos} activos este mes`, icon: UsersIcon,     color: "text-brand-purple", bg: "bg-brand-purple/8" },
              { label: "Referidos totales",     value: totalReferidos,         sub: "Clientes traídos",            icon: TrendingUpIcon, color: "text-brand-teal",   bg: "bg-brand-teal/8"   },
              { label: "Comisiones pagadas",    value: `$${totalComisiones.toLocaleString("es-MX")}`, sub: "Acumulado histórico", icon: WalletIcon, color: "text-brand-orange", bg: "bg-brand-orange/8" },
              { label: "Nivel más alto",        value: "Oro 🥇",               sub: topEmbajador.codigo,           icon: AwardIcon,     color: "text-amber-500",    bg: "bg-amber-50"       },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-black leading-none">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", stat.bg)}>
                    <stat.icon className={cn("h-4.5 w-4.5", stat.color)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Embajadores table */}
          <div className="rounded-2xl border border-border bg-white">

            {/* Toolbar */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 flex-wrap">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary pl-8 pr-3 py-2 text-[12px] outline-none focus:border-brand-orange/50 focus:bg-white transition-all placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(["todos", "oro", "plata", "bronce"] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setFilterNivel(n)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold transition-all capitalize",
                      filterNivel === n
                        ? "bg-brand-orange text-white shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-border"
                    )}
                  >
                    {n === "todos" ? "Todos" : `${nivelConfig[n].icon} ${nivelConfig[n].label}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[40px_1fr_100px_90px_90px_100px_80px] gap-3 px-5 py-2.5 border-b border-border bg-secondary/40">
              {["#", "Embajador", "Nivel", "Referidos", "Completadas", "Comisión mes", "Estado"].map((h, i) => (
                <span key={i} className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", i > 1 && "text-center")}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length > 0 ? (
              filtered.map((emb, i) => (
                <EmbajadorRow key={emb.id} emb={emb} rank={i + 1} />
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mx-auto mb-3">
                  <UsersIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Sin embajadores</p>
                <p className="text-[12px] text-muted-foreground mt-1">No hay resultados con este filtro.</p>
              </div>
            )}

          </div>

          {/* How it works */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #1A1840 0%, #2D2B8F 100%)" }}
          >
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-orange mb-1">¿Cómo funciona?</p>
                <h3 className="text-base font-black text-white mb-2">Los embajadores te traen clientes sin que pagues publicidad</h3>
                <p className="text-[12px] text-white/60 leading-relaxed">
                  Cada embajador tiene un código único que comparte con sus contactos. Cuando un cliente llega por su recomendación y completa una transacción, el embajador recibe una comisión automáticamente — y tú ganas un cliente nuevo.
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {[
                  { step: "1", text: "Embajador comparte su código" },
                  { step: "2", text: "Cliente solicita tu servicio" },
                  { step: "3", text: "Confirmas y todos ganan" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-black">
                      {s.step}
                    </div>
                    <p className="text-[12px] text-white/80 font-medium">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto">
          <div className="flex flex-col gap-4 p-5">

            {/* Top embajador */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Top embajador</h3>
                <span className="text-[11px] text-brand-orange font-medium">Abril 2026</span>
              </div>
              <div
                className="rounded-2xl p-4 text-white"
                style={{ background: "linear-gradient(135deg, #F5A623 0%, #F5C842 100%)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-sm font-black">
                    {topEmbajador.iniciales}
                  </div>
                  <div>
                    <p className="font-mono text-sm font-black">{topEmbajador.codigo}</p>
                    <p className="text-[11px] text-white/75">Nivel Oro 🥇</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Referidos", value: topEmbajador.referidos },
                    { label: "Completas", value: topEmbajador.completadas },
                    { label: "Comisión", value: `$${topEmbajador.comisionMes}` },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-base font-black">{s.value}</p>
                      <p className="text-[10px] text-white/70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actividad reciente */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Actividad reciente</h3>
                <button className="text-[11px] text-brand-purple font-medium hover:underline flex items-center gap-0.5">
                  Ver todo <ExternalLinkIcon className="h-2.5 w-2.5" />
                </button>
              </div>
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                {recentActivity.map((act, i, arr) => {
                  const cfg = actividadConfig[act.tipo as keyof typeof actividadConfig];
                  const Icon = cfg.icon;
                  return (
                    <div key={act.id}>
                      <div className="flex items-start gap-3 px-4 py-3">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5", cfg.color)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[11px] font-bold text-brand-purple">{act.codigo}</p>
                          <p className="text-[11px] text-foreground font-medium leading-tight">{act.servicio}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{act.tiempo}</span>
                            <span className="text-[11px] font-bold text-foreground">${act.monto.toLocaleString("es-MX")}</span>
                          </div>
                        </div>
                      </div>
                      {i < arr.length - 1 && <div className="mx-4 h-px bg-border" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comisiones por nivel */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Comisiones por nivel</h3>
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                {([
                  { nivel: "bronce" as NivelKey, pct: "8%",  desc: "1-9 referidos/mes" },
                  { nivel: "plata"  as NivelKey, pct: "10%", desc: "10-24 referidos/mes" },
                  { nivel: "oro"    as NivelKey, pct: "12%", desc: "25+ referidos/mes"  },
                ]).map((row, i, arr) => {
                  const n = nivelConfig[row.nivel];
                  return (
                    <div key={row.nivel}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{n.icon}</span>
                          <div>
                            <p className={cn("text-[12px] font-bold", n.color)}>{n.label}</p>
                            <p className="text-[10px] text-muted-foreground">{row.desc}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-foreground">{row.pct}</span>
                      </div>
                      {i < arr.length - 1 && <div className="mx-4 h-px bg-border" />}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 px-1">
                % de comisión sobre cada transacción completada via Hazlo Cash.
              </p>
            </div>

            {/* Invitar */}
            <div className="rounded-2xl border border-dashed border-brand-purple/30 bg-brand-purple/3 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10 mx-auto mb-2">
                <ShareIcon className="h-4 w-4 text-brand-purple" />
              </div>
              <p className="text-[12px] font-semibold text-foreground mb-1">¿Conoces a alguien?</p>
              <p className="text-[11px] text-muted-foreground mb-3">Invita a más embajadores y crece tu red de recomendaciones.</p>
              <button className="w-full rounded-xl bg-brand-purple text-white py-2 text-[12px] font-semibold hover:bg-brand-purple/90 transition-colors flex items-center justify-center gap-1.5">
                <ShareIcon className="h-3.5 w-3.5" />
                Invitar embajador
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
