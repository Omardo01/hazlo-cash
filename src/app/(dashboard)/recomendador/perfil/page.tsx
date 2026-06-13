"use client";

import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LevelProgress } from "@/components/dashboard/LevelProgress";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  EditIcon,
  CopyIcon,
  CheckIcon,
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
  ZapIcon,
  SmartphoneIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareCodeDialog } from "@/components/dashboard/ShareCodeDialog";
import QRCode from "react-qr-code";

// ── Data ──────────────────────────────────────────────────────────────────────

const personalFields = [
  { icon: UserIcon,   label: "Nombre completo", value: "Omar Domínguez"         },
  { icon: PhoneIcon,  label: "Teléfono",         value: "+52 993 123 4567"       },
  { icon: MailIcon,   label: "Correo",            value: "omar@hazlocash.mx"     },
  { icon: MapPinIcon, label: "Ciudad",            value: "Villahermosa, Tabasco" },
];

const bankFields = [
  { label: "Titular", value: "Omar Domínguez"   },
  { label: "Banco",   value: "BBVA Bancomer"    },
  { label: "Tipo",    value: "Cuenta corriente" },
];

const securityItems = [
  { icon: LockIcon,        label: "Cambiar NIP",         sub: "Último cambio: 3 meses",       danger: false },
  { icon: SmartphoneIcon,  label: "Verificación 2 pasos",sub: "Activado · SMS",               danger: false },
  { icon: ShieldCheckIcon, label: "Verificar identidad", sub: "INE o pasaporte requerido",    danger: false },
  { icon: LogOutIcon,      label: "Cerrar sesión",        sub: "Todas las sesiones activas",   danger: true  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [shareOpen, setShareOpen]           = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [codeTab, setCodeTab]               = useState<"codigo" | "qr">("codigo");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("HAZLO-OD42");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <>
      <DashboardHeader title="Mi Perfil" />
      <ShareCodeDialog open={shareOpen} onOpenChange={setShareOpen} />

      <div className="flex flex-1 min-h-0">

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto" style={{ background: "#F5F5F7" }}>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <span style={{ color: "#FE7801" }}>Recomendador</span>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Mi Perfil</span>
          </div>

          {/* ── Profile hero ── */}
          <div className="rounded-2xl border border-[#E5E5EA] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden shrink-0">
            {/* Orange accent bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FE7801, #F5A623)" }} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 flex-wrap">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 100%)" }}
                >
                  OD
                </div>
                <div
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white"
                  style={{ background: "#FE7801" }}
                >
                  <CheckIcon className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-black" style={{ color: "#1A1840" }}>Omar Domínguez</h2>
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #FE7801, #EB4E00)" }}
                  >
                    <StarIcon className="h-2.5 w-2.5 fill-white" />
                    BRONCE
                  </span>
                </div>
                <p className="text-[12px] text-[#8E8E93]">Embajador · Villahermosa, Tabasco</p>
                <p className="text-[11px] text-[#C7C7CC] mt-0.5">Miembro desde Enero 2026</p>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-[#E5E5EA] sm:pl-5">
                {[
                  { label: "Referidos",  value: "12"     },
                  { label: "Este mes",   value: "$1,985" },
                  { label: "Total",      value: "$7,625" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center">
                    <p className="text-[16px] font-black" style={{ color: "#1A1840" }}>{s.value}</p>
                    <p className="text-[10px] text-[#8E8E93] font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Code stripe */}
            <div className="flex items-center gap-3 border-t border-[#F2F2F7] px-5 py-3">
              <QrCodeIcon className="h-3.5 w-3.5 shrink-0" style={{ color: "#FE7801" }} />
              <span className="font-mono text-sm font-bold tracking-wider" style={{ color: "#1A1840" }}>HAZLO-OD42</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
                style={{ background: "rgba(254,120,1,0.10)", color: "#FE7801" }}
              >
                {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
              <button
                onClick={() => setShareOpen(true)}
                className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #FE7801, #EB4E00)" }}
              >
                <ShareIcon className="h-3 w-3" />
                Compartir
              </button>
            </div>
          </div>

          {/* ── Código / QR — solo mobile ── */}
          <div className="lg:hidden rounded-2xl border border-[#E5E5EA] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#1A1840" }}>
                Mi código
              </h3>
              <div className="flex items-center rounded-lg overflow-hidden border border-[#E5E5EA]">
                {([["codigo", ZapIcon, "Código"], ["qr", QrCodeIcon, "QR"]] as const).map(([key, Icon, label]) => (
                  <button
                    key={key}
                    onClick={() => setCodeTab(key)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold transition-all"
                    style={{
                      background: codeTab === key ? "#FE7801" : "transparent",
                      color:      codeTab === key ? "white"   : "#8E8E93",
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5">
              {codeTab === "codigo" ? (
                <div>
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
                    style={{ background: "rgba(254,120,1,0.07)", border: "1px solid rgba(254,120,1,0.2)" }}
                  >
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#FE7801" }}>Tu código</p>
                      <p className="text-[20px] font-black tracking-widest leading-none" style={{ color: "#1A1840" }}>HAZLO-OD42</p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                      style={{ background: copied ? "rgba(254,120,1,0.15)" : "rgba(254,120,1,0.10)" }}
                    >
                      {copied
                        ? <CheckIcon className="h-4 w-4" style={{ color: "#FE7801" }} />
                        : <CopyIcon  className="h-4 w-4" style={{ color: "#FE7801" }} />}
                    </button>
                  </div>
                  <button
                    onClick={() => setShareOpen(true)}
                    className="w-full rounded-xl py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #FE7801, #EB4E00)" }}
                  >
                    Compartir código →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm border border-[#E5E5EA]">
                    <QRCode value="https://hazlocash.mx/r/HAZLO-OD42" size={148} level="H" />
                  </div>
                  <p className="text-[11px] text-[#8E8E93] text-center leading-relaxed">
                    Escanea con la cámara para abrir el perfil de recomendación
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Two-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Datos personales */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#1A1840" }}>
                  Datos personales
                </h3>
                <button className="flex items-center gap-1 text-[11px] font-semibold hover:opacity-75 transition-opacity" style={{ color: "#FE7801" }}>
                  <EditIcon className="h-3 w-3" />
                  Editar
                </button>
              </div>
              <div className="divide-y divide-[#F2F2F7]">
                {personalFields.map((field) => (
                  <div key={field.label} className="flex items-center gap-3 py-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "rgba(254,120,1,0.08)" }}
                    >
                      <field.icon className="h-3.5 w-3.5" style={{ color: "#FE7801" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#8E8E93] font-medium uppercase tracking-wide">{field.label}</p>
                      <p className="text-[13px] font-semibold truncate" style={{ color: "#1A1840" }}>{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cuenta bancaria */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="h-4 w-4" style={{ color: "#FE7801" }} />
                  <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#1A1840" }}>
                    Cuenta bancaria
                  </h3>
                </div>
                <button className="flex items-center gap-1 text-[11px] font-semibold hover:opacity-75 transition-opacity" style={{ color: "#FE7801" }}>
                  <EditIcon className="h-3 w-3" />
                  Editar
                </button>
              </div>

              {/* Bank card */}
              <div
                className="rounded-xl p-4 text-white mb-4"
                style={{ background: "linear-gradient(135deg, #1A1840 0%, #0D0D24 100%)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-2">CLABE Interbancaria</p>
                <p className="text-sm font-mono font-bold tracking-[0.18em] break-all">0156 0010 0100 00482 1</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-white/60">BBVA Bancomer</p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(254,120,1,0.20)", color: "#FE7801" }}>
                    Verificada ✓
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#F2F2F7]">
                {bankFields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between py-2.5">
                    <p className="text-[11px] text-[#8E8E93]">{f.label}</p>
                    <p className="text-[12px] font-semibold" style={{ color: "#1A1840" }}>{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-[#E5E5EA] overflow-auto" style={{ background: "#F5F5F7" }}>
          <div className="flex flex-col gap-4 p-5">

            {/* Wallet card */}
            <div className="flex flex-col items-center">
              {/* Ambassador ID card (tilted, peeking above wallet) */}
              <div
                className="relative z-10 w-[88%] mb-[-32px] rounded-2xl px-4 py-3.5 shadow-[0_8px_28px_rgba(26,24,64,0.4)]"
                style={{
                  background: "linear-gradient(135deg, #1A1840 0%, #0D0D24 100%)",
                  transform: "rotate(-2deg)",
                  transformOrigin: "center bottom",
                }}
              >
                <div
                  className="absolute top-2.5 right-3 h-9 w-9 rounded-full"
                  style={{ background: "conic-gradient(from 0deg, #FE7801, #F5A623, #E55000, #EB4E00, #FE7801)", opacity: 0.9 }}
                />
                <div className="absolute top-3.5 right-4 h-7 w-7 rounded-full bg-white/10" />
                <p className="text-[12px] font-bold text-white mb-0.5">Omar Domínguez</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-white/50 tracking-widest">•••• •••• HAZLO</span>
                  <EyeIcon className="h-3 w-3 text-white/30" />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <QrCodeIcon className="h-2.5 w-2.5 text-white/30" />
                  <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: "#FE7801" }}>HAZLO-OD42</span>
                  <span className="ml-auto flex items-center gap-1">
                    <StarIcon className="h-2.5 w-2.5 fill-[#F5A623] text-[#F5A623]" />
                    <span className="text-[9px] font-bold text-[#F5A623]">BRONCE</span>
                  </span>
                </div>
              </div>

              {/* Orange wallet body */}
              <div
                className="relative w-full rounded-[22px] overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #FE7801 0%, #EB4E00 55%, #C83A00 100%)",
                  boxShadow: "0 16px 48px rgba(254,120,1,0.4), 0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <div className="absolute inset-[8px] rounded-[16px] border-[1.5px] border-dashed border-white/25 pointer-events-none" />
                {["top-[12px] left-[12px]","top-[12px] right-[12px]","bottom-[12px] left-[12px]","bottom-[12px] right-[12px]"].map((pos) => (
                  <div key={pos} className={`absolute ${pos} h-2.5 w-2.5 rounded-full border-2 border-white/25`} style={{ background: "#C83A00" }} />
                ))}
                <div className="px-4 pt-10 pb-5">
                  <p className="text-[11px] text-white/60 font-medium mb-2">Balance disponible</p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <span className="text-sm font-black text-white">$</span>
                    </div>
                    {balanceVisible ? (
                      <span className="text-[26px] font-black text-white tracking-tight leading-none">1,985.00</span>
                    ) : (
                      <span className="text-[26px] font-black text-white tracking-[0.25em] leading-none">••••••</span>
                    )}
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
                          : <EyeIcon    className="h-3.5 w-3.5 text-white/70" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">Comisiones acumuladas</p>
                </div>
              </div>
            </div>

            {/* Level progress */}
            <LevelProgress />

            {/* Security */}
            <div className="rounded-2xl border border-[#E5E5EA] bg-white overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-4 border-b border-[#F2F2F7]">
                <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#1A1840" }}>Seguridad</h3>
              </div>
              {securityItems.map((item, i, arr) => (
                <div key={item.label}>
                  <button className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#F5F5F7] transition-colors group">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: item.danger ? "rgba(239,68,68,0.08)" : "rgba(26,24,64,0.07)" }}
                    >
                      <item.icon
                        className="h-3.5 w-3.5"
                        style={{ color: item.danger ? "#EF4444" : "#1A1840" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold" style={{ color: item.danger ? "#EF4444" : "#1A1840" }}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-[#8E8E93]">{item.sub}</p>
                    </div>
                    <ChevronRightIcon className="h-3.5 w-3.5 text-[#C7C7CC] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  {i < arr.length - 1 && <div className="mx-5 h-px bg-[#F2F2F7]" />}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
