"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LevelProgress } from "@/components/dashboard/LevelProgress";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  EditIcon,
  CopyIcon,
  BanknoteIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  LockIcon,
  LogOutIcon,
  ShareIcon,
  EyeIcon,
  EyeOffIcon,
  QrCodeIcon,
  StarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareCodeDialog } from "@/components/dashboard/ShareCodeDialog";

// ── QR Code visual (simplified SVG pattern) ──────────────────────────────────

function QRPattern() {
  // 11×11 simplified QR pattern
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1],
    [1,0,1,1,1,0,1,0,1,0,0],
    [1,0,0,0,0,0,1,1,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,1],
    [0,0,0,1,0,0,0,0,1,1,0],
    [1,0,1,1,0,1,1,0,1,1,1],
    [0,1,0,0,1,0,0,1,0,1,0],
    [1,0,1,0,0,1,1,0,1,0,1],
  ];
  const size = 11;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-[88px] w-[88px]"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="var(--brand-dark)" />
          ) : null
        )
      )}
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const personalFields = [
  { icon: UserIcon,   label: "Nombre completo", value: "Omar Domínguez"        },
  { icon: PhoneIcon,  label: "Teléfono",         value: "+52 993 123 4567"      },
  { icon: MailIcon,   label: "Correo",            value: "omar@hazlocash.mx"    },
  { icon: MapPinIcon, label: "Ciudad",            value: "Villahermosa, Tabasco"},
];

const bankFields = [
  { label: "Titular", value: "Omar Domínguez"    },
  { label: "Banco",   value: "BBVA Bancomer"     },
  { label: "Tipo",    value: "Cuenta corriente"  },
];

const securityItems = [
  { icon: LockIcon,        label: "Cambiar NIP",          sub: "Último cambio: 3 meses"         },
  { icon: ShieldCheckIcon, label: "Verificar identidad",  sub: "INE o pasaporte requerido"      },
  { icon: LogOutIcon,      label: "Cerrar sesión",         sub: "Todas las sesiones activas",    danger: true },
];

export default function PerfilPage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <DashboardHeader title="Mi Perfil" />
      <ShareCodeDialog open={shareOpen} onOpenChange={setShareOpen} />

      <div className="flex flex-1 min-h-0 gap-0">

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-brand-purple">Ambassador</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Mi Perfil</span>
          </div>

          {/* Profile hero */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, var(--brand-dark) 0%, #3D3AA8 60%, var(--brand-purple) 100%)" }}
          >
            <div className="px-6 py-6 flex items-center gap-5 flex-wrap">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-white/15 border-2 border-white/25 flex items-center justify-center text-2xl font-black text-white">
                  OD
                </div>
                <span className="absolute -bottom-1.5 -right-1 rounded-full bg-brand-orange px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                  BRONCE
                </span>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-white leading-tight">Omar Domínguez</h2>
                <p className="text-sm text-white/60">Embajador · Villahermosa, Tabasco</p>
                <p className="text-xs text-white/40 mt-0.5">Miembro desde Enero 2026</p>
              </div>

              {/* Quick stats */}
              <div className="hidden sm:flex items-center gap-6 shrink-0">
                {[
                  { label: "Referidos",  value: "12"     },
                  { label: "Este mes",   value: "$1,985" },
                  { label: "Total",      value: "$7,625" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-black text-white">{s.value}</p>
                    <p className="text-[11px] text-white/50">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom stripe */}
            <div className="flex items-center gap-4 border-t border-white/10 px-6 py-3">
              <span className="text-[11px] text-white/40">Código</span>
              <span className="font-mono text-sm font-bold text-white tracking-wider">HAZLO-OD42</span>
              <button
                onClick={() => setShareOpen(true)}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white transition-all"
              >
                <ShareIcon className="h-3 w-3" />
                Compartir
              </button>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Datos personales */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Datos personales</h3>
                <button className="flex items-center gap-1 text-[11px] text-brand-purple font-medium hover:underline transition-colors">
                  <EditIcon className="h-3 w-3" />
                  Editar
                </button>
              </div>
              {personalFields.map((field, i, arr) => (
                <div key={field.label}>
                  <div className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <field.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground">{field.label}</p>
                      <p className="text-xs font-semibold text-foreground">{field.value}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-border" />}
                </div>
              ))}
            </div>

            {/* Cuenta bancaria */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="h-4 w-4 text-brand-teal" />
                  <h3 className="text-sm font-semibold">Cuenta bancaria</h3>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-brand-purple font-medium hover:underline transition-colors">
                  <EditIcon className="h-3 w-3" />
                  Editar
                </button>
              </div>

              {/* Bank card visual */}
              <div
                className="rounded-xl p-4 text-white mb-4"
                style={{ background: "linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-purple) 100%)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-2">
                  CLABE Interbancaria
                </p>
                <p className="text-sm font-mono font-bold tracking-[0.18em] break-all">
                  0156 0010 0100 00482 1
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-white/60">BBVA Bancomer</p>
                  <span className="text-[10px] bg-brand-teal/30 text-brand-teal rounded-full px-2 py-0.5 font-semibold">
                    Verificada ✓
                  </span>
                </div>
              </div>

              {bankFields.map((f, i, arr) => (
                <div key={f.label}>
                  <div className="flex items-center justify-between py-2.5">
                    <p className="text-[11px] text-muted-foreground">{f.label}</p>
                    <p className="text-xs font-semibold text-foreground">{f.value}</p>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-border" />}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto">
          <div className="flex flex-col gap-4 p-5">

            {/* ── Wallet visual ── */}
            <div className="flex flex-col items-center">

              {/* Dark recomendador card — in normal flow, overlaps wallet below */}
              <div
                className="relative z-10 w-[88%] mb-[-32px] rounded-2xl px-4 py-3.5 shadow-[0_8px_28px_rgba(26,24,64,0.5)]"
                style={{
                  background: "linear-gradient(135deg, #111827 0%, #1e1b4b 100%)",
                  transform: "rotate(-2deg)",
                  transformOrigin: "center bottom",
                }}
              >
                {/* Holographic chip */}
                <div
                  className="absolute top-2.5 right-3 h-9 w-9 rounded-full shadow-inner"
                  style={{
                    background: "conic-gradient(from 0deg, #7459D9, #00A896, #F5A623, #60a5fa, #7459D9)",
                    opacity: 0.9,
                  }}
                />
                <div className="absolute top-3.5 right-4 h-7 w-7 rounded-full bg-white/10 backdrop-blur-sm" />

                <p className="text-[12px] font-bold text-white mb-0.5">Omar Domínguez</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-white/50 tracking-widest">•••• •••• HAZLO</span>
                  <EyeIcon className="h-3 w-3 text-white/30" />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <QrCodeIcon className="h-2.5 w-2.5 text-white/30" />
                  <span className="font-mono text-[10px] font-bold text-brand-teal tracking-widest">HAZLO-OD42</span>
                  <span className="ml-auto flex items-center gap-1">
                    <StarIcon className="h-2.5 w-2.5 fill-brand-orange text-brand-orange" />
                    <span className="text-[9px] font-bold text-brand-orange">BRONCE</span>
                  </span>
                </div>
              </div>

              {/* Blue wallet body */}
              <div
                className="relative w-full rounded-[22px] overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #4A7FE8 0%, #2D5FD4 55%, #1E4BC4 100%)",
                  boxShadow: "0 16px 48px rgba(45,95,212,0.45), 0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {/* Dashed stitching border */}
                <div className="absolute inset-[8px] rounded-[16px] border-[1.5px] border-dashed border-white/30 pointer-events-none" />

                {/* Corner studs */}
                {[
                  "top-[12px] left-[12px]",
                  "top-[12px] right-[12px]",
                  "bottom-[12px] left-[12px]",
                  "bottom-[12px] right-[12px]",
                ].map((pos) => (
                  <div
                    key={pos}
                    className={`absolute ${pos} h-2.5 w-2.5 rounded-full border-2 border-white/30`}
                    style={{ background: "#1E4BC4" }}
                  />
                ))}

                {/* Content */}
                <div className="px-4 pt-10 pb-5">
                  <p className="text-[11px] text-white/60 font-medium mb-2">Balance disponible</p>

                  <div className="flex items-center gap-2">
                    {/* $ icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <span className="text-sm font-black text-white">$</span>
                    </div>

                    {/* Amount */}
                    {balanceVisible ? (
                      <span className="text-[26px] font-black text-white tracking-tight leading-none">
                        1,985.00
                      </span>
                    ) : (
                      <span className="text-[26px] font-black text-white tracking-[0.25em] leading-none">
                        ••••••
                      </span>
                    )}

                    {/* Currency + eye */}
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1">
                        <span className="text-[11px] font-bold text-white">MXN</span>
                      </div>
                      <button
                        onClick={() => setBalanceVisible((v) => !v)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
                      >
                        {balanceVisible
                          ? <EyeOffIcon className="h-3.5 w-3.5 text-white/70" />
                          : <EyeIcon className="h-3.5 w-3.5 text-white/70" />
                        }
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/40 mt-1">Comisiones acumuladas</p>
                </div>
              </div>
            </div>

            {/* Code chip — debajo de la wallet */}
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-white border border-border px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="h-4 w-4 text-brand-purple shrink-0" />
                <span className="font-mono text-sm font-bold text-foreground tracking-wider">HAZLO-OD42</span>
              </div>
              <button className="flex items-center gap-1 rounded-lg bg-brand-purple/10 hover:bg-brand-purple/20 px-2.5 py-1.5 text-[11px] font-semibold text-brand-purple transition-all">
                <CopyIcon className="h-3 w-3" />
                Copiar
              </button>
            </div>

            {/* Level progress */}
            <LevelProgress />

            {/* Security */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Seguridad</h3>
              </div>
              {securityItems.map((item, i, arr) => (
                <div key={item.label}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-secondary/50 transition-colors group",
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      item.danger ? "bg-red-50" : "bg-secondary"
                    )}>
                      <item.icon className={cn(
                        "h-3.5 w-3.5",
                        item.danger ? "text-destructive" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold", item.danger ? "text-destructive" : "text-foreground")}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                    </div>
                    <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  {i < arr.length - 1 && <div className="mx-5 h-px bg-border" />}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
