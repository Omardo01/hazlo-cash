"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Search, Bell, MapPin, Star, ChevronRight,
  Zap, Droplets, UtensilsCrossed, Scissors,
  Wrench, HardHat, Car, Sparkles, Shield, Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* ─── Mock data ─────────────────────────────────────── */
const categorias = [
  { id: "todos",        label: "Todos",        icon: Sparkles,        color: "#FE7801" },
  { id: "electricidad", label: "Electricidad", icon: Zap,             color: "#F5A623" },
  { id: "plomeria",     label: "Plomería",     icon: Droplets,        color: "#0EA5E9" },
  { id: "comida",       label: "Comida",       icon: UtensilsCrossed, color: "#EF4444" },
  { id: "belleza",      label: "Belleza",      icon: Scissors,        color: "#EC4899" },
  { id: "mecanica",     label: "Mecánica",     icon: Car,             color: "#8B5CF6" },
  { id: "construccion", label: "Construcción", icon: HardHat,         color: "#D97706" },
  { id: "reparaciones", label: "Reparaciones", icon: Wrench,          color: "#64748B" },
];

const negocios = [
  {
    id: 1,
    nombre: "Tacos El Güero",
    categoria: "comida",
    categoriaLabel: "Comida",
    descripcion: "Los mejores tacos de suadero de la colonia",
    rating: 4.9,
    reviews: 128,
    distancia: "350 m",
    tiempo: "10 min",
    precio: "$$",
    embajador: "Ana R.",
    embajadorAvatar: "AR",
    oferta: "1 refresco gratis",
    color: "#EF4444",
    emoji: "🌮",
  },
  {
    id: 2,
    nombre: "Electricidad Pro",
    categoria: "electricidad",
    categoriaLabel: "Electricidad",
    descripcion: "Instalaciones y reparaciones eléctricas",
    rating: 4.8,
    reviews: 64,
    distancia: "1.2 km",
    tiempo: "30 min",
    precio: "$$$",
    embajador: "Luis M.",
    embajadorAvatar: "LM",
    oferta: "15% de descuento",
    color: "#F5A623",
    emoji: "⚡",
  },
  {
    id: 3,
    nombre: "Estética Vanessa",
    categoria: "belleza",
    categoriaLabel: "Belleza",
    descripcion: "Cortes, tintes y tratamientos capilares",
    rating: 5.0,
    reviews: 212,
    distancia: "800 m",
    tiempo: "20 min",
    precio: "$$",
    embajador: "María G.",
    embajadorAvatar: "MG",
    oferta: "Tratamiento gratis",
    color: "#EC4899",
    emoji: "✂️",
  },
  {
    id: 4,
    nombre: "Plomería Rápida",
    categoria: "plomeria",
    categoriaLabel: "Plomería",
    descripcion: "Fugas, instalaciones y mantenimiento",
    rating: 4.7,
    reviews: 89,
    distancia: "600 m",
    tiempo: "15 min",
    precio: "$$",
    embajador: "Carlos B.",
    embajadorAvatar: "CB",
    oferta: "Diagnóstico gratis",
    color: "#0EA5E9",
    emoji: "🔧",
  },
];

/* ─── Componentes internos ───────────────────────────── */
function CategoriaChip({
  cat,
  active,
  onClick,
}: {
  cat: (typeof categorias)[0];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = cat.icon;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 shrink-0 transition-all ${
        active ? "scale-105" : "opacity-60"
      }`}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
        style={{
          background: active
            ? `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}CC 100%)`
            : "#fff",
          border: active ? "none" : "1px solid #EBEBF0",
          boxShadow: active ? `0 4px 12px ${cat.color}44` : "none",
        }}
      >
        <Icon size={22} color={active ? "#fff" : cat.color} strokeWidth={2} />
      </div>
      <span
        className="text-[10px] font-semibold tracking-wide"
        style={{ color: active ? cat.color : "#8B8BA3" }}
      >
        {cat.label}
      </span>
    </button>
  );
}

function NegocioCard({ negocio, delay }: { negocio: (typeof negocios)[0]; delay: number }) {
  return (
    <Link href="/cliente/negocio">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
      >
        {/* Cover */}
        <div
          className="h-32 flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${negocio.color}18 0%, ${negocio.color}38 100%)`,
          }}
        >
          <span className="text-5xl">{negocio.emoji}</span>

          {/* Badge oferta */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <Sparkles size={10} style={{ color: "#FE7801" }} />
            <span className="text-[10px] font-bold" style={{ color: "#FE7801" }}>{negocio.oferta}</span>
          </div>

          {/* Badge categoría */}
          <div
            className="absolute top-3 right-3 rounded-full px-2.5 py-1"
            style={{ background: negocio.color }}
          >
            <span className="text-[10px] font-bold text-white">{negocio.categoriaLabel}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-[15px] text-foreground leading-tight">{negocio.nombre}</h3>
              <p className="text-muted-foreground text-[12px] mt-0.5">{negocio.descripcion}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1" />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1">
              <Star size={12} fill="#FE7801" style={{ color: "#FE7801" }} />
              <span className="text-[12px] font-bold">{negocio.rating}</span>
              <span className="text-[11px] text-muted-foreground">({negocio.reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={11} />
              <span className="text-[11px]">{negocio.distancia}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={11} />
              <span className="text-[11px]">{negocio.tiempo}</span>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground ml-auto">{negocio.precio}</span>
          </div>

          {/* Embajador */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-border">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              <span className="text-[8px] font-bold text-white">{negocio.embajadorAvatar}</span>
            </div>
            <span className="text-[11px] text-muted-foreground flex-1 min-w-0 truncate">
              Recomendado por <span className="font-semibold text-foreground">{negocio.embajador}</span>
            </span>
            <Shield size={10} style={{ color: "#FE7801" }} />
            <span className="text-[10px] font-semibold" style={{ color: "#FE7801" }}>Verificado</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Página principal ───────────────────────────────── */
export default function ClienteHomePage() {
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [query, setQuery] = useState("");

  const negociosFiltrados = negocios.filter((n) => {
    const matchCat = categoriaActiva === "todos" || n.categoria === categoriaActiva;
    const matchQuery =
      query === "" ||
      n.nombre.toLowerCase().includes(query.toLowerCase()) ||
      n.descripcion.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="flex flex-col pb-4">
      {/* ── Header oscuro ── */}
      <div
        className="px-5 pt-5 pb-7 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #1C0800 100%)" }}
      >
        {/* Glow de fondo */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30"
          style={{ background: "#FE7801" }}
        />

        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Image src="/hazlo.svg" alt="Hazlo Cash" width={28} height={28} className="h-7 w-auto" />
            <div className="leading-none">
              <p className="text-white/50 text-[11px] font-medium">¡Hola de nuevo!</p>
              <h1 className="text-white text-[18px] font-bold leading-tight">Carlos 👋</h1>
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <Bell size={17} className="text-white" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-[#0A0A0A]"
              style={{ background: "#FE7801" }}
            />
          </button>
        </div>

        {/* Location */}
        <div className="relative flex items-center gap-1.5 mb-4">
          <MapPin size={12} style={{ color: "#FE7801" }} />
          <span className="text-white/60 text-[12px]">Villahermosa, Tab.</span>
          <ChevronRight size={12} className="text-white/30" />
        </div>

        {/* Search bar */}
        <div className="relative flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué servicio necesitas?"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground text-foreground"
          />
        </div>
      </div>

      {/* ── Banner referido activo ── */}
      <div className="px-5 -mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
          >
            <span className="text-xl">🎁</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground">Código activo: HAZLO-ANA1</p>
            <p className="text-[11px] text-muted-foreground truncate">
              Ana R. te recomendó — accede a ofertas exclusivas
            </p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* ── Categorías ── */}
      <div className="mt-5 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-foreground">Categorías</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {categorias.map((cat) => (
            <CategoriaChip
              key={cat.id}
              cat={cat}
              active={categoriaActiva === cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Solicitud activa ── */}
      <div className="mt-5 px-5">
        <div
          className="rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #1C0800 100%)" }}
        >
          <div
            className="pointer-events-none absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-40"
            style={{ background: "#FE7801" }}
          />
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-xl">🌮</span>
          </div>
          <div className="flex-1 relative">
            <p className="text-white font-bold text-[13px]">Solicitud en curso</p>
            <p className="text-white/50 text-[11px]">Tacos El Güero · Esperando confirmación</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#FE7801" }} />
              <span className="text-[10px] font-semibold" style={{ color: "#FE7801" }}>En proceso</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/30 relative" />
        </div>
      </div>

      {/* ── Negocios recomendados ── */}
      <div className="mt-5 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-foreground">
            {categoriaActiva === "todos" ? "Cerca de ti" : categorias.find(c => c.id === categoriaActiva)?.label}
          </h2>
          <button
            className="text-[12px] font-semibold"
            style={{ color: "#FE7801" }}
          >
            Ver todos
          </button>
        </div>

        {negociosFiltrados.length > 0 ? (
          <div className="space-y-3">
            {negociosFiltrados.map((negocio, i) => (
              <NegocioCard key={negocio.id} negocio={negocio} delay={i * 0.07} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-[14px] font-semibold text-foreground">Sin resultados</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Intenta con otra categoría o búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
