"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Star, MapPin, Clock, Shield, Share2,
  Heart, Phone, MessageCircle, CheckCircle2,
  ChevronRight, Sparkles, Calendar, Info,
} from "lucide-react";
import Link from "next/link";

/* ─── Mock data ─────────────────────────────────────── */
const negocio = {
  nombre: "Tacos El Güero",
  categoria: "Comida",
  descripcion: "Los mejores tacos de suadero, carnitas y canasta de la colonia. Más de 15 años de experiencia dando sabor a Villahermosa.",
  emoji: "🌮",
  color: "#EF4444",
  rating: 4.9,
  reviews: 128,
  distancia: "350 m",
  tiempo: "10 min",
  precio: "$$",
  embajador: "Ana R.",
  embajadorAvatar: "AR",
  oferta: "1 refresco gratis con tu primer pedido vía Hazlo Cash",
  verificado: true,
  horario: "Lun–Dom: 8:00 AM – 4:00 PM",
  ubicacion: "Col. Tamulté, Villahermosa, Tab.",
  servicios: [
    { nombre: "Taco de suadero", precio: "$18", popular: true },
    { nombre: "Taco de carnitas", precio: "$18", popular: true },
    { nombre: "Taco de canasta", precio: "$12", popular: false },
    { nombre: "Orden de 5 tacos", precio: "$80", popular: false },
    { nombre: "Refresco", precio: "$20", popular: false },
  ],
  reseñas: [
    { nombre: "Miguel H.", avatar: "MH", rating: 5, texto: "Los mejores tacos de la ciudad, siempre frescos y a buen precio.", fecha: "Hace 2 días" },
    { nombre: "Laura P.", avatar: "LP", rating: 5, texto: "El suadero está increíble. Ana me los recomendó y no me arrepiento.", fecha: "Hace 1 semana" },
    { nombre: "Roberto S.", avatar: "RS", rating: 4, texto: "Muy buena atención y precios justos. El taco de canasta es el mejor.", fecha: "Hace 2 semanas" },
  ],
};

type Tab = "info" | "servicios" | "reseñas";

/* ─── Componentes ────────────────────────────────────── */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rating ? "text-brand-orange" : "text-border"}
          fill={s <= rating ? "#F5A623" : "none"}
        />
      ))}
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────── */
export default function NegocioPerfilPage() {
  const [tab, setTab] = useState<Tab>("info");
  const [liked, setLiked] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [solicitado, setSolicitado] = useState(false);

  function handleSolicitar() {
    setSolicitando(true);
    setTimeout(() => {
      setSolicitando(false);
      setSolicitado(true);
    }, 1400);
  }

  return (
    <div className="flex flex-col min-h-full pb-4">
      {/* ── Cover ── */}
      <div className="relative">
        <div
          className="h-52 flex items-center justify-center"
          style={{
            background: `linear-gradient(160deg, ${negocio.color}33 0%, ${negocio.color}66 100%)`,
          }}
        >
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl"
          >
            {negocio.emoji}
          </motion.span>
        </div>

        {/* Back + actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/cliente"
            className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </Link>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <Share2 size={16} className="text-white" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart
                size={16}
                className={liked ? "text-red-400" : "text-white"}
                fill={liked ? "#F87171" : "none"}
              />
            </button>
          </div>
        </div>

        {/* Oferta badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
            <Sparkles size={14} className="text-brand-orange shrink-0" />
            <span className="text-[11px] font-semibold text-foreground flex-1">{negocio.oferta}</span>
          </div>
        </div>
      </div>

      {/* ── Info header ── */}
      <div className="px-5 pt-4 pb-3 bg-white border-b border-border">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h1 className="text-[20px] font-bold text-foreground leading-tight">{negocio.nombre}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="rounded-full px-2 py-0.5"
                style={{ background: `${negocio.color}18` }}
              >
                <span className="text-[10px] font-bold" style={{ color: negocio.color }}>
                  {negocio.categoria}
                </span>
              </div>
              {negocio.verificado && (
                <div className="flex items-center gap-1">
                  <Shield size={10} style={{ color: "#FE7801" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#FE7801" }}>Verificado</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Star size={14} fill="#F5A623" className="text-brand-orange" />
            <span className="text-[14px] font-bold">{negocio.rating}</span>
            <span className="text-[12px] text-muted-foreground">({negocio.reviews} reseñas)</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={12} />
            <span className="text-[12px]">{negocio.distancia}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={12} />
            <span className="text-[12px]">{negocio.tiempo}</span>
          </div>
        </div>

        {/* Embajador */}
        <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-[#FE7801]/8">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}>
            <span className="text-[10px] font-bold text-white">{negocio.embajadorAvatar}</span>
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-muted-foreground">Recomendado por </span>
            <span className="text-[11px] font-bold text-foreground">{negocio.embajador}</span>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-white border-b border-border sticky top-0 z-10">
        {(["info", "servicios", "reseñas"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[12px] font-semibold capitalize relative transition-colors ${
              tab === t ? "text-brand-purple" : "text-muted-foreground"
            }`}
          >
            {t === "info" ? "Información" : t === "servicios" ? "Servicios" : "Reseñas"}
            {tab === t && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-brand-orange"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Contenido del tab ── */}
      <div className="flex-1 px-5 pt-4">
        <AnimatePresence mode="wait">
          {tab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-4 border border-border space-y-3">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-foreground/60 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{negocio.descripcion}</p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Calendar size={15} style={{ color: "#FE7801" }} className="shrink-0" />
                  <span className="text-[12px] text-foreground font-medium">{negocio.horario}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={15} className="text-brand-orange shrink-0" />
                  <span className="text-[12px] text-foreground font-medium">{negocio.ubicacion}</span>
                </div>
              </div>

              {/* Mapa placeholder */}
              <div className="rounded-2xl overflow-hidden border border-border h-36 bg-gradient-to-br from-brand-teal/10 to-brand-purple/10 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={28} className="text-brand-purple mx-auto mb-1" />
                  <p className="text-[12px] font-semibold text-muted-foreground">Ver en mapa</p>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "servicios" && (
            <motion.div
              key="servicios"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {negocio.servicios.map((s, i) => (
                <motion.div
                  key={s.nombre}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-4 border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {s.popular && (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                    )}
                    <span className="text-[13px] font-semibold text-foreground">{s.nombre}</span>
                    {s.popular && (
                      <span className="text-[9px] font-bold text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] font-bold text-foreground">{s.precio}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "reseñas" && (
            <motion.div
              key="reseñas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {negocio.reseñas.map((r, i) => (
                <motion.div
                  key={r.nombre}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-4 border border-border space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}>
                      <span className="text-[10px] font-bold text-white">{r.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-foreground">{r.nombre}</p>
                      <StarRow rating={r.rating} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{r.fecha}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{r.texto}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CTA fijo ── */}
      <div className="px-5 pt-4 pb-2">
        {solicitado ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-teal rounded-2xl p-4 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} className="text-white" />
            <span className="text-white font-bold text-[15px]">¡Solicitud enviada!</span>
          </motion.div>
        ) : (
          <button
            onClick={handleSolicitar}
            disabled={solicitando}
            className="w-full rounded-2xl py-4 font-bold text-[15px] text-white transition-all active:scale-[0.98] disabled:opacity-70"
            style={{
              background: solicitando
                ? "#8B8BA3"
                : "linear-gradient(135deg, #2D2B8F 0%, #00A896 100%)",
            }}
          >
            {solicitando ? "Enviando solicitud..." : "Solicitar servicio"}
          </button>
        )}

        {/* Acciones secundarias */}
        <div className="flex gap-3 mt-3">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 border border-border bg-white">
            <Phone size={15} className="text-brand-purple" />
            <span className="text-[12px] font-semibold text-foreground">Llamar</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 border border-border bg-white">
            <MessageCircle size={15} className="text-brand-teal" />
            <span className="text-[12px] font-semibold text-foreground">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
