"use client";

import { useState, use } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon,
  StarIcon,
  GiftIcon,
  ChevronRightIcon,
  XIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react";

// ── Mock data — en el futuro esto vendrá de la BD por el código ──
const MOCK_DATA: Record<string, {
  negocio: string;
  categoria: string;
  ciudad: string;
  rating: number;
  reseñas: number;
  oferta: string;
  recomendador: string;
  color: string;
  initials: string;
}> = {
  "HAZLO-OD42": {
    negocio: "Tacos El Güero",
    categoria: "Comida · Tacos",
    ciudad: "Villahermosa, Tab.",
    rating: 4.8,
    reseñas: 143,
    oferta: "🥤 Una coca gratis en tu primera visita",
    recomendador: "Omar D.",
    color: "#F5A623",
    initials: "TG",
  },
  "HAZLO-MR18": {
    negocio: "BarberShop X",
    categoria: "Servicios · Barbería",
    ciudad: "CDMX",
    rating: 4.9,
    reseñas: 98,
    oferta: "✂️ 10% de descuento en tu primer corte",
    recomendador: "Mario R.",
    color: "#2D2B8F",
    initials: "BX",
  },
};

const FALLBACK = {
  negocio: "Negocio no encontrado",
  categoria: "—",
  ciudad: "—",
  rating: 0,
  reseñas: 0,
  oferta: "Código inválido o expirado",
  recomendador: "—",
  color: "#888",
  initials: "?",
};

export default function ReferralPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();
  const data = MOCK_DATA[code] ?? FALLBACK;
  const valid = !!MOCK_DATA[code];

  const [mode, setMode] = useState<"info" | "presentar">("info");

  return (
    <main className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-start">
      {/* Nav mínima */}
      <header className="w-full flex items-center justify-between px-5 py-4 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <Image src="/hazlo.svg" alt="Hazlo Cash" width={28} height={28} className="h-7 w-7" />
          <span className="text-sm font-black text-brand-dark">Hazlo Cash</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-white border border-border px-2.5 py-1 rounded-full">
          {code}
        </span>
      </header>

      <div className="w-full max-w-md mx-auto px-4 pb-10 flex flex-col gap-4">

        {/* Card del negocio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white border border-gray-200/80 overflow-hidden shadow-sm"
        >
          {/* Header con color */}
          <div
            className="h-24 flex items-end px-6 pb-0 relative"
            style={{ background: `linear-gradient(135deg, ${data.color}25, ${data.color}10)` }}
          >
            <div
              className="absolute bottom-0 translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-2xl text-white text-xl font-black shadow-lg"
              style={{ backgroundColor: data.color }}
            >
              {data.initials}
            </div>
          </div>

          <div className="px-6 pt-10 pb-6">
            <h1 className="text-xl font-black text-brand-dark">{data.negocio}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{data.categoria}</p>

            <div className="flex items-center gap-3 mt-3">
              {data.rating > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                  <span className="text-sm font-bold text-foreground">{data.rating}</span>
                  <span className="text-xs text-muted-foreground">({data.reseñas})</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon className="h-3 w-3" />
                {data.ciudad}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Oferta */}
        {valid && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border-2 border-dashed p-4 flex items-center gap-3"
            style={{ borderColor: `${data.color}50`, backgroundColor: `${data.color}08` }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: `${data.color}20` }}
            >
              <GiftIcon className="h-5 w-5" style={{ color: data.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: data.color }}>
                Tu beneficio
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{data.oferta}</p>
            </div>
          </motion.div>
        )}

        {/* Quién te recomendó */}
        {valid && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white border border-gray-200/80 px-4 py-3 flex items-center gap-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-white text-[11px] font-black">
              {data.recomendador.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Recomendado por</p>
              <p className="text-sm font-bold text-foreground">{data.recomendador}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
              <CheckCircle2Icon className="h-3.5 w-3.5" />
              Verificado
            </div>
          </motion.div>
        )}

        {/* Instrucciones */}
        {valid && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white border border-gray-200/80 px-4 py-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Cómo canjearlo</p>
            {[
              "Llega al negocio",
              "Toca «Mostrar al negocio»",
              "El negocio escanea o ingresa tu código",
              "¡Recibe tu beneficio!",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5">
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                  style={{ backgroundColor: data.color }}
                >
                  {i + 1}
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        {valid && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            onClick={() => setMode("presentar")}
            className="w-full h-14 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 shadow-lg"
            style={{
              backgroundColor: data.color,
              boxShadow: `0 8px 24px ${data.color}40`,
            }}
          >
            Mostrar al negocio
            <ChevronRightIcon className="h-5 w-5" />
          </motion.button>
        )}

        {!valid && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-center">
            <p className="text-sm font-semibold text-red-600">{data.oferta}</p>
          </div>
        )}
      </div>

      {/* ── Pantalla de presentación full-screen ── */}
      <AnimatePresence>
        {mode === "presentar" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(160deg, ${data.color}18 0%, white 40%, ${data.color}10 100%)`,
            }}
          >
            <button
              onClick={() => setMode("info")}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
            >
              <XIcon className="h-5 w-5 text-foreground" />
            </button>

            <div className="flex flex-col items-center gap-6 px-8 text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-white text-3xl font-black shadow-xl"
                style={{
                  backgroundColor: data.color,
                  boxShadow: `0 16px 40px ${data.color}50`,
                }}
              >
                {data.initials}
              </div>

              <div>
                <p className="text-sm text-muted-foreground font-medium">Código de recomendación</p>
                <h1 className="text-5xl font-black tracking-widest mt-2" style={{ color: data.color }}>
                  {code.replace("HAZLO-", "")}
                </h1>
                <p className="text-xs font-mono text-muted-foreground mt-1">{code}</p>
              </div>

              <div
                className="rounded-2xl border-2 px-6 py-4 w-full max-w-xs"
                style={{ borderColor: `${data.color}40`, backgroundColor: `${data.color}08` }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: data.color }}>
                  Tu beneficio
                </p>
                <p className="text-base font-bold text-foreground">{data.oferta}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ClockIcon className="h-3.5 w-3.5" />
                Muestra esta pantalla al cajero
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
