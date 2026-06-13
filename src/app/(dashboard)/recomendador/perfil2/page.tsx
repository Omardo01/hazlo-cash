"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "react-qr-code";
import {
  WalletIcon,
  UsersIcon,
  TrendingUpIcon,
  CalendarIcon,
  CopyIcon,
  CheckIcon,
  QrCodeIcon,
  ZapIcon,
  StarIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  BanknoteIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  LockIcon,
  CheckCircle2Icon,
  ClockIcon,
  PencilIcon,
  KeyRoundIcon,
  SmartphoneIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────────

const topStats = [
  {
    label: "Balance disponible",
    value: "$1,985",
    change: "+$420 este mes",
    up: true,
    icon: WalletIcon,
    iconColor: "#FE7801",
    iconBg: "rgba(254,120,1,0.10)",
  },
  {
    label: "Referidos totales",
    value: "127",
    change: "+8 esta semana",
    up: true,
    icon: UsersIcon,
    iconColor: "#E55000",
    iconBg: "rgba(229,80,0,0.10)",
  },
  {
    label: "Comisiones ganadas",
    value: "$7,625",
    change: "+18% vs año ant.",
    up: true,
    icon: TrendingUpIcon,
    iconColor: "#F5A623",
    iconBg: "rgba(245,166,35,0.12)",
  },
  {
    label: "Meta del mes",
    value: "79%",
    change: "$1,985 de $2,500",
    up: null,
    icon: CalendarIcon,
    iconColor: "#1A1840",
    iconBg: "rgba(26,24,64,0.08)",
  },
];

const transactions = [
  { id: 1, negocio: "Tacos El Güero",   ini: "TG", bg: "#F5A623", monto: "+$120.00",   fecha: "Hoy",    hora: "14:32", tipo: "Comisión", estado: "confirmada" },
  { id: 2, negocio: "Plomería Express", ini: "PE", bg: "#1A1840", monto: "+$40.00",    fecha: "Hoy",    hora: "11:05", tipo: "Comisión", estado: "pendiente"  },
  { id: 3, negocio: "Mecánica Pérez",   ini: "MP", bg: "#1A1840", monto: "+$60.00",    fecha: "Ayer",   hora: "10:48", tipo: "Comisión", estado: "confirmada" },
  { id: 4, negocio: "Estética Luna",    ini: "EL", bg: "#F5A623", monto: "+$22.50",    fecha: "Ayer",   hora: "16:00", tipo: "Comisión", estado: "confirmada" },
  { id: 5, negocio: "Lavandería Clean", ini: "LC", bg: "#E55000", monto: "+$9.00",     fecha: "9 Abr",  hora: "09:30", tipo: "Comisión", estado: "confirmada" },
  { id: 6, negocio: "Retiro BBVA",      ini: "BB", bg: "#1A1840", monto: "-$1,200.00", fecha: "1 Abr",  hora: "11:00", tipo: "Retiro",   estado: "pagado"     },
];

const grouped = transactions.reduce<Record<string, typeof transactions>>((acc, tx) => {
  if (!acc[tx.fecha]) acc[tx.fecha] = [];
  acc[tx.fecha].push(tx);
  return acc;
}, {});

const negocios = [
  { name: "Tacos El Güero",   pct: 38, refs: 48, ini: "TG", bg: "#F5A623" },
  { name: "Mecánica Pérez",   pct: 28, refs: 31, ini: "MP", bg: "#1A1840" },
  { name: "Estética Luna",    pct: 21, refs: 27, ini: "EL", bg: "#F5A623" },
  { name: "Plomería Express", pct: 13, refs: 19, ini: "PE", bg: "#1A1840" },
];

const estadoMap = {
  confirmada: { label: "Confirmada", dot: "#F5A623",  text: "#B46A00" },
  pendiente:  { label: "Pendiente",  dot: "#FE7801",  text: "#FE7801" },
  pagado:     { label: "Pagado",     dot: "#1A1840",  text: "#1A1840" },
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-[#E5E5EA] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[13px] font-bold text-[#1A1840] uppercase tracking-wider">{children}</h2>;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(254,120,1,0.08)" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: "#FE7801" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#8E8E93] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13px] font-semibold text-[#1A1840] truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const [codeTab, setCodeTab] = useState<"codigo" | "qr">("codigo");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("HAZLO-OD42");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto" style={{ background: "#F5F5F7" }}>
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* ── Profile hero ─────────────────────────────────────────────────── */}
        <SectionCard className="overflow-hidden">
          {/* Orange top accent line */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FE7801, #F5A623)" }} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-black text-white shadow-md"
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
                <h1 className="text-xl font-black text-[#1A1840]">Omar Domínguez</h1>
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FE7801, #EB4E00)" }}
                >
                  <StarIcon className="h-2.5 w-2.5 fill-white" />
                  BRONCE
                </span>
              </div>
              <p className="text-[12px] text-[#8E8E93]">Embajador · Villahermosa, Tab. · Miembro desde Ene 2025</p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-[#E5E5EA] sm:pl-5">
              {[
                { v: "127",  l: "Referidos" },
                { v: "4",    l: "Negocios"  },
                { v: "4.9★", l: "Rating"    },
              ].map(({ v, l }) => (
                <div key={l} className="flex flex-col items-center">
                  <span className="text-[16px] font-black text-[#1A1840]">{v}</span>
                  <span className="text-[10px] text-[#8E8E93] font-medium">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {topStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionCard className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#8E8E93] leading-tight">{s.label}</p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: s.iconBg }}>
                    <s.icon className="h-4 w-4" style={{ color: s.iconColor }} />
                  </div>
                </div>
                <div>
                  <p className="text-[22px] font-black text-[#1A1840] leading-none">{s.value}</p>
                  <p className={cn("text-[11px] font-medium mt-1", s.up === true ? "text-[#FE7801]" : "text-[#8E8E93]")}>
                    {s.up === true && "↑ "}{s.change}
                  </p>
                </div>
              </SectionCard>
            </motion.div>
          ))}
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-5 min-w-0">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5 flex-1 min-w-0">

            {/* Transactions */}
            <SectionCard>
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <SectionTitle>Transacciones recientes</SectionTitle>
                <button className="text-[12px] font-semibold text-[#FE7801] hover:opacity-75 transition-opacity flex items-center gap-1">
                  Ver todas <ChevronRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-0">
                {Object.entries(grouped).map(([fecha, txs]) => (
                  <div key={fecha}>
                    <p className="text-[10px] font-bold text-[#C7C7CC] uppercase tracking-widest py-2">{fecha}</p>
                    {txs.map((tx, i) => {
                      const est = estadoMap[tx.estado as keyof typeof estadoMap];
                      const isIncome = tx.monto.startsWith("+");
                      return (
                        <div
                          key={tx.id}
                          className={cn(
                            "flex items-center gap-3 py-3",
                            i < txs.length - 1 && "border-b border-[#F2F2F7]"
                          )}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white"
                            style={{ backgroundColor: tx.bg }}
                          >
                            {tx.ini}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A1840] truncate">{tx.negocio}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5"
                                style={{
                                  background: `${est.dot}18`,
                                  color: est.text,
                                }}
                              >
                                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: est.dot }} />
                                {est.label}
                              </span>
                              <span className="text-[10px] text-[#C7C7CC]">{tx.hora} · {tx.tipo}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className="text-[14px] font-bold"
                              style={{ color: isIncome ? "#FE7801" : "#EF4444" }}
                            >
                              {tx.monto}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Level progress */}
            <SectionCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Nivel de embajador</SectionTitle>
                <span className="text-[11px] font-semibold text-[#FE7801]">48% → Plata</span>
              </div>

              {/* Level row */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm shrink-0"
                  style={{ background: "linear-gradient(135deg, #FE7801, #EB4E00)" }}
                >
                  <ZapIcon className="h-6 w-6 fill-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[15px] font-black text-[#1A1840]">Bronce</p>
                    <p className="text-[11px] text-[#8E8E93]">12 / 25 referidos</p>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#F2F2F7" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "48%" }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #FE7801, #F5A623)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Next levels */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { nivel: "Bronce", refs: "0+",  pct: 0,   active: true  },
                  { nivel: "Plata",  refs: "25+", pct: 100, active: false },
                  { nivel: "Oro",    refs: "75+", pct: 100, active: false },
                ].map((lv) => (
                  <div
                    key={lv.nivel}
                    className="rounded-xl p-3 flex flex-col items-center gap-1"
                    style={{
                      background: lv.active ? "rgba(254,120,1,0.08)" : "#F2F2F7",
                      border: lv.active ? "1px solid rgba(254,120,1,0.25)" : "1px solid transparent",
                    }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: lv.active ? "#FE7801" : "#8E8E93" }}>
                      {lv.nivel}
                    </span>
                    <span className="text-[9px] text-[#C7C7CC]">{lv.refs} ref.</span>
                  </div>
                ))}
              </div>

              {/* Negocios breakdown */}
              <div className="mt-5 border-t border-[#F2F2F7] pt-4">
                <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mb-3">Ingresos por negocio</p>
                <div className="flex flex-col gap-2.5">
                  {negocios.map((n) => (
                    <div key={n.name} className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white"
                        style={{ backgroundColor: n.bg }}
                      >
                        {n.ini}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-semibold text-[#1A1840] truncate">{n.name}</p>
                          <span className="text-[10px] text-[#8E8E93] shrink-0 ml-2">{n.refs} ref.</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#F2F2F7" }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${n.pct}%`, background: "linear-gradient(90deg, #FE7801, #EB4E00)" }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: "#FE7801" }}>{n.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5 w-full lg:w-[300px] xl:w-[320px] shrink-0">

            {/* Referral code card */}
            <SectionCard className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>Mi código</SectionTitle>
                  {/* Tab toggle */}
                  <div className="flex items-center rounded-lg overflow-hidden border border-[#E5E5EA]">
                    {([["codigo", ZapIcon], ["qr", QrCodeIcon]] as const).map(([key, Icon]) => (
                      <button
                        key={key}
                        onClick={() => setCodeTab(key)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold transition-all"
                        style={{
                          background: codeTab === key ? "#FE7801" : "transparent",
                          color: codeTab === key ? "white" : "#8E8E93",
                        }}
                      >
                        <Icon className="h-3 w-3" />
                        {key === "codigo" ? "Código" : "QR"}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {codeTab === "codigo" ? (
                    <motion.div
                      key="codigo"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      {/* Code display */}
                      <div
                        className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
                        style={{ background: "rgba(254,120,1,0.07)", border: "1px solid rgba(254,120,1,0.2)" }}
                      >
                        <div>
                          <p className="text-[9px] font-bold text-[#FE7801] uppercase tracking-widest mb-0.5">Tu código</p>
                          <p className="text-[20px] font-black text-[#1A1840] tracking-widest leading-none">HAZLO-OD42</p>
                        </div>
                        <button
                          onClick={handleCopy}
                          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                          style={{
                            background: copied ? "rgba(254,120,1,0.15)" : "rgba(254,120,1,0.10)",
                          }}
                        >
                          {copied ? (
                            <CheckIcon className="h-4 w-4" style={{ color: "#FE7801" }} />
                          ) : (
                            <CopyIcon className="h-4 w-4" style={{ color: "#FE7801" }} />
                          )}
                        </button>
                      </div>

                      {/* Share button */}
                      <button
                        className="w-full rounded-xl py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg, #FE7801, #EB4E00)" }}
                      >
                        Compartir código →
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="rounded-2xl bg-white p-3 shadow-sm border border-[#E5E5EA]">
                        <QRCode value="https://hazlocash.mx/r/HAZLO-OD42" size={148} level="H" />
                      </div>
                      <p className="text-[11px] text-[#8E8E93] text-center leading-relaxed">
                        Escanea con la cámara para abrir el perfil de recomendación
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 border-t border-[#F2F2F7]">
                {[
                  { l: "Usos hoy",    v: "3"  },
                  { l: "Total usos",  v: "127" },
                ].map(({ l, v }, i) => (
                  <div
                    key={l}
                    className={cn("flex flex-col items-center py-3", i === 0 && "border-r border-[#F2F2F7]")}
                  >
                    <span className="text-[18px] font-black text-[#1A1840]">{v}</span>
                    <span className="text-[10px] text-[#8E8E93] font-medium">{l}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Personal info */}
            <SectionCard className="p-5">
              <div className="flex items-center justify-between mb-1">
                <SectionTitle>Datos personales</SectionTitle>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[#F2F2F7]">
                  <PencilIcon className="h-3.5 w-3.5 text-[#8E8E93]" />
                </button>
              </div>
              <div className="divide-y divide-[#F2F2F7]">
                <InfoRow icon={UserIcon}    label="Nombre completo" value="Omar Domínguez Ruiz" />
                <InfoRow icon={PhoneIcon}   label="Teléfono"        value="+52 993 456 7890"   />
                <InfoRow icon={MailIcon}    label="Correo"          value="omar@hazlocash.mx"  />
                <InfoRow icon={MapPinIcon}  label="Ciudad"          value="Villahermosa, Tab." />
              </div>
            </SectionCard>

            {/* Bank account */}
            <SectionCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <SectionTitle>Cuenta bancaria</SectionTitle>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[#F2F2F7]">
                  <PencilIcon className="h-3.5 w-3.5 text-[#8E8E93]" />
                </button>
              </div>

              <div
                className="flex items-center gap-3 rounded-xl p-3.5"
                style={{ background: "#F2F2F7" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white"
                  style={{ background: "#1A1840" }}
                >
                  BB
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#1A1840]">BBVA México</p>
                  <p className="text-[11px] text-[#8E8E93] font-mono">CLABE ···· ···· ···· 4821</p>
                </div>
                <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ background: "rgba(254,120,1,0.10)" }}>
                  <CheckCircle2Icon className="h-3 w-3" style={{ color: "#FE7801" }} />
                  <span className="text-[10px] font-bold" style={{ color: "#FE7801" }}>Verificada</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[12px]">
                <span className="text-[#8E8E93]">Último retiro</span>
                <span className="font-semibold text-[#1A1840]">$1,200 · 1 Abr</span>
              </div>
            </SectionCard>

            {/* Security */}
            <SectionCard className="p-5">
              <div className="mb-3">
                <SectionTitle>Seguridad</SectionTitle>
              </div>
              <div className="flex flex-col gap-1">
                {[
                  {
                    icon: LockIcon,
                    label: "Contraseña",
                    sub: "Actualizada hace 30 días",
                    action: "Cambiar",
                  },
                  {
                    icon: SmartphoneIcon,
                    label: "Verificación en 2 pasos",
                    sub: "Activado · SMS",
                    action: "Gestionar",
                  },
                  {
                    icon: ShieldCheckIcon,
                    label: "Sesiones activas",
                    sub: "2 dispositivos",
                    action: "Ver",
                  },
                ].map(({ icon: Icon, label, sub, action }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[#F2F2F7] cursor-pointer"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "rgba(26,24,64,0.07)" }}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#1A1840]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#1A1840]">{label}</p>
                      <p className="text-[10px] text-[#8E8E93]">{sub}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#FE7801] shrink-0">{action}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

          </div>
        </div>

      </div>
    </div>
  );
}
