"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  SearchIcon,
  BellIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  MoreHorizontalIcon,
  CheckCircle2Icon,
  ClockIcon,
  ChevronDownIcon,
  QrCodeIcon,
  StarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────────

const ingresos = [
  { id: 1, negocio: "Tacos El Güero",   ini: "TG", bg: "#F5A623", monto: "+$120.00", fecha: "Hoy, 14:32",    tipo: "Comisión"    },
  { id: 2, negocio: "Plomería Express", ini: "PE", bg: "#2D2B8F", monto: "+$40.00",  fecha: "Ayer, 18:05",   tipo: "Comisión"    },
  { id: 3, negocio: "Mecánica Pérez",   ini: "MP", bg: "#1A1840", monto: "+$60.00",  fecha: "Ayer, 10:48",   tipo: "Comisión"    },
  { id: 4, negocio: "Estética Luna",    ini: "EL", bg: "#00A896", monto: "+$22.50",  fecha: "9 Abr, 16:00",  tipo: "Comisión"    },
  { id: 5, negocio: "Lavandería Clean", ini: "LC", bg: "#6366F1", monto: "+$9.00",   fecha: "8 Abr, 09:30",  tipo: "Comisión"    },
];

const gastos = [
  { id: 6,  negocio: "Retiro BBVA",      ini: "BB", bg: "#1A1840", monto: "-$1,200.00", fecha: "1 Abr, 11:00",  tipo: "Retiro"   },
  { id: 7,  negocio: "Retiro BBVA",      ini: "BB", bg: "#1A1840", monto: "-$850.00",   fecha: "15 Mar, 09:15", tipo: "Retiro"   },
  { id: 8,  negocio: "Impuesto ISR",     ini: "IS", bg: "#EF4444", monto: "-$78.00",    fecha: "31 Mar, 23:59", tipo: "Fiscal"   },
];

// ── Animations ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const walletVariants = {
  hidden:  { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: -20, rotate: -3 },
  visible: { opacity: 1, y: 0,   rotate: -2, transition: { duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const } },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerfilWallet() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [tab, setTab] = useState<"ingresos" | "gastos">("ingresos");
  const txList = tab === "ingresos" ? ingresos : gastos;

  // ── Level card (reutilizable) ────────────────────────────────────────────────
  const LevelCard = () => (
    <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Tu nivel</p>
          <p className="text-xl font-black text-brand-purple">Bronce</p>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3].map((s) => (
            <StarIcon key={s} className={cn("h-5 w-5", s === 1 ? "fill-brand-orange text-brand-orange" : "text-border fill-border")} />
          ))}
        </div>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[#F0F0F5] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "48%" }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--brand-purple), #6366F1)" }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] mt-1.5">
        <span className="text-muted-foreground">12 / 25 referidos para Plata</span>
        <span className="font-bold text-brand-purple">48%</span>
      </div>
    </>
  );

  // ── Wallet column (shared between mobile and desktop) ──────────────────────
  const WalletColumn = (
    <div className="flex flex-col w-full">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between pt-6 pb-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm text-sm font-bold text-brand-dark">
            OD
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Perfil</p>
            <div className="flex items-center gap-1">
              <p className="text-base font-bold text-foreground leading-tight">Omar Domínguez</p>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-muted-foreground hover:text-foreground transition-colors">
            <SearchIcon className="h-4 w-4" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-muted-foreground hover:text-foreground transition-colors">
            <BellIcon className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-orange border-2 border-white" />
          </button>
        </div>
      </motion.div>

      {/* Wallet hero */}
      <div className="relative mt-6 mb-5">

        {/* Ambassador card peeking from top */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -6, rotate: -4, transition: { duration: 0.25 } }}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
          style={{ width: "82%", transformOrigin: "center bottom" }}
        >
          <div
            className="rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(26,24,64,0.45)]"
            style={{ background: "linear-gradient(135deg, #1A1840 0%, #2D2B8F 100%)" }}
          >
            <div className="absolute top-3 right-3 h-10 w-10 rounded-full"
              style={{ background: "conic-gradient(from 0deg, #7459D9, #00A896, #F5A623, #7459D9)", opacity: 0.85 }}
            />
            <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm" />
            <p className="text-xs font-bold text-white mb-1">Omar Domínguez</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-[13px] text-white/60 tracking-widest">•••• •••• HAZLO</p>
              <EyeIcon className="h-3.5 w-3.5 text-white/40" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <QrCodeIcon className="h-3 w-3 text-white/40" />
              <span className="font-mono text-[11px] font-bold text-brand-teal tracking-widest">HAZLO-OD42</span>
              <span className="ml-auto flex items-center gap-1">
                <StarIcon className="h-3 w-3 fill-brand-orange text-brand-orange" />
                <span className="text-[10px] font-bold text-brand-orange">BRONCE</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Wallet body */}
        <motion.div
          variants={walletVariants}
          initial="hidden"
          animate="visible"
          className="relative pt-16 rounded-[28px] overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #4A7FE8 0%, #2D5FD4 50%, #1E4BC4 100%)",
            boxShadow: "0 20px 60px rgba(45, 95, 212, 0.45), 0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="px-5 pb-6 pt-4"
          >
            <div className="absolute inset-[10px] rounded-[20px] border-2 border-dashed border-white/25 pointer-events-none" />
            {["top-[14px] left-[14px]","top-[14px] right-[14px]","bottom-[14px] left-[14px]","bottom-[14px] right-[14px]"].map((pos) => (
              <div key={pos} className={`absolute ${pos} h-3 w-3 rounded-full bg-[#1E4BC4] border-2 border-white/30`} />
            ))}
            <div className="mt-4">
              <p className="text-sm text-white/70 font-medium mb-2">Balance disponible</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                  <span className="text-lg font-black text-white">$</span>
                </div>
                <AnimatePresence mode="wait">
                  {balanceVisible ? (
                    <motion.p key="v" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                      className="text-[34px] font-black text-white tracking-tight leading-none">1,985.00</motion.p>
                  ) : (
                    <motion.p key="h" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                      className="text-[34px] font-black text-white tracking-[0.3em] leading-none">••••••</motion.p>
                  )}
                </AnimatePresence>
                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5">
                    <span className="text-[12px] font-bold text-white">MXN</span>
                    <ChevronDownIcon className="h-3 w-3 text-white/60" />
                  </div>
                  <button onClick={() => setBalanceVisible((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all">
                    {balanceVisible ? <EyeOffIcon className="h-4 w-4 text-white/70" /> : <EyeIcon className="h-4 w-4 text-white/70" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-white/50 mt-1.5">Comisiones acumuladas · HAZLO-OD42</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Retirar",   icon: ArrowUpRightIcon   },
          { label: "Compartir", icon: ArrowDownLeftIcon  },
          { label: "Más",       icon: MoreHorizontalIcon },
        ].map(({ label, icon: Icon }) => (
          <motion.button key={label} whileTap={{ scale: 0.95 }} whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            className="flex flex-col items-center gap-2.5 rounded-2xl bg-white py-5 shadow-sm transition-shadow">
            <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
            <span className="text-[13px] font-semibold text-foreground">{label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Level (solo en mobile, en desktop va en columna derecha) */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="lg:hidden rounded-3xl bg-white shadow-sm p-5">
        <LevelCard />
      </motion.div>

    </div>
  );

  // ── Transactions + Level column ──────────────────────────────────────────────
  const RightColumn = (
    <div className="flex flex-col gap-4 w-full lg:max-w-[420px]">

      {/* Spacer en desktop para alinear con wallet */}
      <div className="hidden lg:block h-[62px]" />

      {/* Transactions */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-3xl bg-white shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-lg font-black text-foreground">Últimas transacciones</h2>
        </div>
        <div className="px-5 mb-4">
          <div className="flex rounded-2xl bg-[#F0F0F5] p-1">
            {(["ingresos", "gastos"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className="relative flex-1 py-2.5 text-sm font-semibold transition-colors">
                <span className={cn("relative z-10", tab === t ? "text-foreground" : "text-muted-foreground")}>
                  {t === "ingresos" ? "Ingresos" : "Gastos"}
                </span>
                {tab === t && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 rounded-xl bg-white shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "ingresos" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "ingresos" ? 16 : -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {txList.map((tx, i) => (
                <motion.div key={tx.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  className={cn("flex items-center gap-3.5 py-3.5", i < txList.length - 1 && "border-b border-[#F0F0F5]")}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[12px] font-bold text-white"
                    style={{ backgroundColor: tx.bg }}>{tx.ini}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{tx.negocio}</p>
                    <p className="text-[11px] text-muted-foreground">{tx.tipo} · {tx.fecha}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-[14px] font-bold", tx.monto.startsWith("+") ? "text-brand-teal" : "text-destructive")}>{tx.monto}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Confirmado</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.button whileTap={{ scale: 0.98 }}
          className="w-full border-t border-[#F0F0F5] py-3.5 text-[13px] font-semibold text-brand-purple hover:bg-brand-purple/5 transition-colors">
          Ver todas las transacciones
        </motion.button>
      </motion.div>

      {/* Level (solo en desktop) */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
        className="hidden lg:block rounded-3xl bg-white shadow-sm p-5">
        <LevelCard />
      </motion.div>

    </div>
  );

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto bg-[#F0F0F5]">

      {/* Mobile: single column centered */}
      <div className="lg:hidden mx-auto w-full max-w-[390px] flex flex-col pb-10 px-5">
        {WalletColumn}
        <div className="mt-4">{RightColumn}</div>
      </div>

      {/* Desktop: two columns — wallet fija + transacciones flexibles */}
      <div className="hidden lg:grid w-full grid-cols-[360px_1fr] gap-8 px-8 pb-10 min-w-0">
        <div className="px-2">{WalletColumn}</div>
        <div className="pt-2 min-w-0">{RightColumn}</div>
      </div>

    </div>
  );
}
