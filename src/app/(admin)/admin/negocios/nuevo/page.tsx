"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  BuildingIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  CreditCardIcon,
  PercentIcon,
  MapPinIcon,
  ChevronDownIcon,
  CheckIcon,
  StarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const adminTabs = [
  { label: "Overview", href: "/admin" },
  { label: "Usuarios", href: "/admin/users" },
  { label: "Negocios", href: "/admin/negocios" },
  { label: "Finanzas", href: "/admin/finanzas" },
];

const CATEGORIAS = [
  "Comida",
  "Restaurante",
  "Servicios",
  "Salud",
  "Belleza",
  "Mecánica",
  "Electricidad",
  "Plomería",
  "Educación",
  "Otro",
];

const CATEGORIA_EMOJI: Record<string, string> = {
  Comida: "🌮", Restaurante: "🍽️", Servicios: "🔧", Salud: "💊",
  Belleza: "✂️", Mecánica: "🚗", Electricidad: "⚡", Plomería: "🔩",
  Educación: "📚", Otro: "📦",
};

const PASOS = [
  { n: 1, label: "Negocio",  desc: "Nombre y categoría" },
  { n: 2, label: "Contacto", desc: "Responsable y datos" },
  { n: 3, label: "Pagos",    desc: "CLABE y comisión" },
];

type FormState = {
  nombre: string;
  categoria: string;
  ciudad: string;
  descripcion: string;
  responsable: string;
  telefono: string;
  email: string;
  clabe: string;
  comision: string;
};

const empty: FormState = {
  nombre: "", categoria: "", ciudad: "", descripcion: "",
  responsable: "", telefono: "", email: "", clabe: "", comision: "10",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
      {children}
    </label>
  );
}

function FieldIcon({ icon, error, children }: {
  icon: React.ReactNode;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </div>
      <div className={cn(
        "overflow-hidden rounded-xl border transition-colors focus-within:ring-2",
        error
          ? "border-red-400 focus-within:ring-red-300"
          : "border-border focus-within:border-[#FE7801] focus-within:ring-[#FE7801]/20"
      )}>
        {children}
      </div>
    </div>
  );
}

function inputCls(error?: boolean) {
  return cn(
    "h-10 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none transition-colors",
    error
      ? "border-red-400"
      : "border-border"
  );
}

// ── Preview card ──────────────────────────────────────────────────────────────
function PreviewCard({ form }: { form: FormState }) {
  const initials = form.nombre.trim()
    ? form.nombre.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";
  const emoji = form.categoria ? CATEGORIA_EMOJI[form.categoria] ?? "📦" : null;

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
      {/* Header gradient */}
      <div
        className="h-24 w-full"
        style={{ background: "linear-gradient(135deg, #1A1840 0%, #0A0A0A 60%, #1A1000 100%)" }}
      />
      {/* Avatar */}
      <div className="px-5 -mt-7 flex items-end gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white text-lg font-black border-2 border-white shadow-md"
          style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
        >
          {initials}
        </div>
        <div className="pb-1 min-w-0">
          <p className="text-sm font-black text-foreground truncate leading-tight">
            {form.nombre.trim() || <span className="text-muted-foreground font-normal italic">Nombre del negocio</span>}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {emoji && <span className="text-[11px]">{emoji}</span>}
            <span className="text-[11px] text-muted-foreground">
              {form.categoria || "Categoría"}
            </span>
            {form.ciudad && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground">{form.ciudad}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {form.descripcion.trim() && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {form.descripcion}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Rating", value: "—", icon: <StarIcon className="h-3 w-3 text-brand-orange fill-brand-orange" /> },
            { label: "Referidos", value: "0" },
            { label: "Volumen", value: "$0" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[#f8f9fe] p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-sm font-black text-foreground">
                {s.icon}
                {s.value}
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Contact info */}
        {(form.responsable || form.telefono || form.email) && (
          <div className="rounded-xl border border-border bg-[#fbfbfd] p-3 flex flex-col gap-1.5">
            {form.responsable && (
              <div className="flex items-center gap-2 text-xs">
                <UserIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-foreground font-medium">{form.responsable}</span>
              </div>
            )}
            {form.telefono && (
              <div className="flex items-center gap-2 text-xs">
                <PhoneIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-foreground">{form.telefono}</span>
              </div>
            )}
            {form.email && (
              <div className="flex items-center gap-2 text-xs">
                <MailIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-foreground truncate">{form.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Commission badge */}
        <div className="flex items-center gap-2 rounded-xl bg-[#FE7801]/8 px-3 py-2">
          <PercentIcon className="h-3.5 w-3.5 text-[#FE7801] shrink-0" />
          <span className="text-xs font-semibold text-[#FE7801]">
            Comisión: {form.comision || "—"}%
          </span>
          <span className="ml-auto">
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-600">Pendiente</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ form, onReset }: { form: FormState; onReset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center max-w-sm mx-auto">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
      >
        <CheckIcon className="h-10 w-10 text-white stroke-[2.5]" />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">¡Negocio registrado!</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          <span className="font-semibold text-foreground">{form.nombre}</span> fue creado con estado{" "}
          <span className="font-semibold text-amber-600">Pendiente</span>. El equipo lo verificará antes de activarlo.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={() => router.push("/admin/negocios")}
          className="h-11 w-full rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
        >
          Ver en lista de negocios
        </button>
        <button
          onClick={onReset}
          className="h-11 w-full rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          + Registrar otro negocio
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NuevoNegocioPage() {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [done, setDone] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validatePaso(n: number): boolean {
    const e: Partial<FormState> = {};
    if (n === 1) {
      if (!form.nombre.trim())   e.nombre    = "Campo requerido";
      if (!form.categoria)       e.categoria = "Selecciona una categoría";
      if (!form.ciudad.trim())   e.ciudad    = "Campo requerido";
    }
    if (n === 2) {
      if (!form.responsable.trim()) e.responsable = "Campo requerido";
      if (!form.telefono.trim())    e.telefono    = "Campo requerido";
      if (!form.email.trim())       e.email       = "Campo requerido";
    }
    if (n === 3) {
      if (form.clabe.trim() && form.clabe.replace(/\D/g, "").length !== 18)
        e.clabe = "La CLABE debe tener 18 dígitos";
      const c = parseFloat(form.comision);
      if (isNaN(c) || c < 1 || c > 30) e.comision = "Entre 1 y 30%";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function siguiente() {
    if (!validatePaso(paso)) return;
    if (paso < 3) setPaso((p) => p + 1);
    else setDone(true);
  }

  function anterior() {
    setErrors({});
    setPaso((p) => p - 1);
  }

  function reset() {
    setForm(empty);
    setErrors({});
    setPaso(1);
    setDone(false);
  }

  const progress = Math.round((paso / 3) * 100);

  return (
    <>
      <DashboardHeader
        title="Admin"
        tabs={adminTabs}
        userName="Super Admin"
        userInitials="SA"
        avatarColor="bg-brand-dark text-white"
        notificationColor="bg-brand-dark"
      />

      <div className="flex flex-1 min-h-0 bg-[#fbfbfd]">
        <div className="flex flex-1 flex-col min-w-0 overflow-auto">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
              <span className="text-brand-dark">Admin</span>
              <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
              <Link href="/admin/negocios" className="text-muted-foreground hover:text-foreground transition-colors">
                Negocios
              </Link>
              <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-[#FE7801]">Dar de Alta</span>
            </div>

            {/* Page title */}
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
              >
                <BuildingIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">
                  Dar de Alta Negocio
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Completa los 3 pasos para registrar un nuevo proveedor en la plataforma.
                </p>
              </div>
            </div>

            {done ? (
              <SuccessScreen form={form} onReset={reset} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

                {/* ── Form panel ── */}
                <div className="flex flex-col gap-5">

                  {/* Steps header */}
                  <div className="rounded-2xl border border-border bg-white p-5">
                    <div className="flex items-center gap-0 mb-4">
                      {PASOS.map((p, i) => (
                        <div key={p.n} className="flex items-center flex-1 last:flex-none">
                          <button
                            onClick={() => {
                              if (p.n < paso) { setErrors({}); setPaso(p.n); }
                            }}
                            disabled={p.n > paso}
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all",
                              p.n < paso
                                ? "cursor-pointer text-white"
                                : p.n === paso
                                ? "text-white ring-2 ring-[#FE7801]/30"
                                : "bg-secondary text-muted-foreground cursor-not-allowed"
                            )}
                            style={p.n <= paso ? { background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" } : {}}
                          >
                            {p.n < paso ? <CheckIcon className="h-3.5 w-3.5 stroke-[3]" /> : p.n}
                          </button>
                          <div className="ml-2 hidden sm:block">
                            <p className={cn(
                              "text-xs font-bold leading-none",
                              p.n === paso ? "text-foreground" : "text-muted-foreground"
                            )}>{p.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
                          </div>
                          {i < PASOS.length - 1 && (
                            <div className="flex-1 mx-3 h-px bg-border" />
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: "linear-gradient(90deg, #FE7801, #EB4E00)",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
                      Paso {paso} de 3
                    </p>
                  </div>

                  {/* ── Step 1: Datos del negocio ── */}
                  {paso === 1 && (
                    <div className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FE7801]/10">
                          <BuildingIcon className="h-3.5 w-3.5 text-[#FE7801]" />
                        </div>
                        <p className="text-sm font-black text-foreground">Datos del Negocio</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* Nombre */}
                        <div>
                          <Label>Nombre del Negocio *</Label>
                          <FieldIcon icon={<BuildingIcon className="h-3.5 w-3.5" />} error={!!errors.nombre}>
                            <input
                              value={form.nombre}
                              onChange={(e) => set("nombre", e.target.value)}
                              placeholder="Ej. Tacos El Güero"
                              className="h-10 w-full bg-white pl-10 pr-3 text-sm outline-none"
                            />
                          </FieldIcon>
                          {errors.nombre && <p className="mt-1 text-[11px] text-red-500">{errors.nombre}</p>}
                        </div>

                        {/* Categoría + Ciudad */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Categoría *</Label>
                            <div className={cn(
                              "relative rounded-xl border transition-colors focus-within:ring-2",
                              errors.categoria
                                ? "border-red-400 focus-within:ring-red-300"
                                : "border-border focus-within:border-[#FE7801] focus-within:ring-[#FE7801]/20"
                            )}>
                              <select
                                value={form.categoria}
                                onChange={(e) => set("categoria", e.target.value)}
                                className="h-10 w-full appearance-none rounded-xl bg-white pl-3 pr-8 text-sm outline-none"
                              >
                                <option value="">Seleccionar…</option>
                                {CATEGORIAS.map((c) => (
                                  <option key={c} value={c}>
                                    {CATEGORIA_EMOJI[c]} {c}
                                  </option>
                                ))}
                              </select>
                              <ChevronDownIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                            {errors.categoria && <p className="mt-1 text-[11px] text-red-500">{errors.categoria}</p>}
                          </div>

                          <div>
                            <Label>Ciudad *</Label>
                            <FieldIcon icon={<MapPinIcon className="h-3.5 w-3.5" />} error={!!errors.ciudad}>
                              <input
                                value={form.ciudad}
                                onChange={(e) => set("ciudad", e.target.value)}
                                placeholder="Villahermosa"
                                className="h-10 w-full bg-white pl-10 pr-3 text-sm outline-none"
                              />
                            </FieldIcon>
                            {errors.ciudad && <p className="mt-1 text-[11px] text-red-500">{errors.ciudad}</p>}
                          </div>
                        </div>

                        {/* Descripción */}
                        <div>
                          <Label>Descripción (opcional)</Label>
                          <textarea
                            value={form.descripcion}
                            onChange={(e) => set("descripcion", e.target.value)}
                            placeholder="Breve descripción del negocio o servicio que ofrece…"
                            rows={3}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FE7801] focus:ring-2 focus:ring-[#FE7801]/20 resize-none transition-colors"
                          />
                          <p className="mt-1 text-[11px] text-muted-foreground text-right">
                            {form.descripcion.length}/300
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Contacto ── */}
                  {paso === 2 && (
                    <div className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FE7801]/10">
                          <UserIcon className="h-3.5 w-3.5 text-[#FE7801]" />
                        </div>
                        <p className="text-sm font-black text-foreground">Información de Contacto</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* Responsable */}
                        <div>
                          <Label>Nombre del Responsable *</Label>
                          <FieldIcon icon={<UserIcon className="h-3.5 w-3.5" />} error={!!errors.responsable}>
                            <input
                              value={form.responsable}
                              onChange={(e) => set("responsable", e.target.value)}
                              placeholder="Juan Pérez"
                              className="h-10 w-full bg-white pl-10 pr-3 text-sm outline-none"
                            />
                          </FieldIcon>
                          {errors.responsable && <p className="mt-1 text-[11px] text-red-500">{errors.responsable}</p>}
                        </div>

                        {/* Teléfono + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Teléfono *</Label>
                            <FieldIcon icon={<PhoneIcon className="h-3.5 w-3.5" />} error={!!errors.telefono}>
                              <input
                                value={form.telefono}
                                onChange={(e) => set("telefono", e.target.value)}
                                placeholder="993 123 4567"
                                className="h-10 w-full bg-white pl-10 pr-3 text-sm outline-none"
                              />
                            </FieldIcon>
                            {errors.telefono && <p className="mt-1 text-[11px] text-red-500">{errors.telefono}</p>}
                          </div>

                          <div>
                            <Label>Correo Electrónico *</Label>
                            <FieldIcon icon={<MailIcon className="h-3.5 w-3.5" />} error={!!errors.email}>
                              <input
                                type="email"
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                placeholder="negocio@email.com"
                                className="h-10 w-full bg-white pl-10 pr-3 text-sm outline-none"
                              />
                            </FieldIcon>
                            {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                          </div>
                        </div>

                        {/* Info box */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 flex gap-3">
                          <ShieldCheckIcon className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-700 leading-relaxed">
                            Los datos de contacto son <strong>privados</strong>. Los clientes solo pueden comunicarse a través del chat in-app de Hazlo Cash.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Pagos ── */}
                  {paso === 3 && (
                    <div className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FE7801]/10">
                          <CreditCardIcon className="h-3.5 w-3.5 text-[#FE7801]" />
                        </div>
                        <p className="text-sm font-black text-foreground">Pagos y Comisiones</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* CLABE */}
                        <div>
                          <Label>CLABE Interbancaria (opcional)</Label>
                          <FieldIcon icon={<CreditCardIcon className="h-3.5 w-3.5" />} error={!!errors.clabe}>
                            <input
                              value={form.clabe}
                              onChange={(e) => set("clabe", e.target.value.replace(/\D/g, "").slice(0, 18))}
                              placeholder="18 dígitos"
                              maxLength={18}
                              className="h-10 w-full bg-white pl-10 pr-3 text-sm font-mono tracking-wider outline-none"
                            />
                          </FieldIcon>
                          {errors.clabe
                            ? <p className="mt-1 text-[11px] text-red-500">{errors.clabe}</p>
                            : (
                              <div className="mt-1.5 flex items-center justify-between">
                                <p className="text-[11px] text-muted-foreground">Para dispersión de pagos al negocio</p>
                                <p className={cn(
                                  "text-[11px] font-semibold tabular-nums",
                                  form.clabe.length === 18 ? "text-emerald-500" : "text-muted-foreground"
                                )}>
                                  {form.clabe.length}/18
                                </p>
                              </div>
                            )
                          }
                        </div>

                        {/* Comisión */}
                        <div>
                          <Label>Comisión para Hazlo Cash (%) *</Label>
                          <FieldIcon icon={<PercentIcon className="h-3.5 w-3.5" />} error={!!errors.comision}>
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={form.comision}
                              onChange={(e) => set("comision", e.target.value)}
                              className="h-10 w-full bg-white pl-10 pr-3 text-sm outline-none"
                            />
                          </FieldIcon>
                          {errors.comision
                            ? <p className="mt-1 text-[11px] text-red-500">{errors.comision}</p>
                            : <p className="mt-1 text-[11px] text-muted-foreground">Porcentaje que Hazlo Cash retiene por transacción completada (1–30%).</p>
                          }
                        </div>

                        {/* Commission scale reference */}
                        <div className="rounded-xl bg-[#f8f9fe] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                            Referencia de comisiones por categoría
                          </p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                            {[
                              ["Comida / Restaurante", "8–12%"],
                              ["Belleza / Estética", "10–15%"],
                              ["Servicios del hogar", "12–18%"],
                              ["Mecánica / Auto", "10–14%"],
                              ["Salud / Bienestar", "8–12%"],
                              ["Educación", "6–10%"],
                            ].map(([cat, range]) => (
                              <div key={cat} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-muted-foreground">{cat}</span>
                                <span className="text-[11px] font-semibold text-[#FE7801]">{range}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Resumen del registro
                          </p>
                          {[
                            { label: "Negocio", val: form.nombre || "—" },
                            { label: "Categoría", val: form.categoria || "—" },
                            { label: "Ciudad", val: form.ciudad || "—" },
                            { label: "Responsable", val: form.responsable || "—" },
                            { label: "Teléfono", val: form.telefono || "—" },
                            { label: "Email", val: form.email || "—" },
                          ].map(({ label, val }) => (
                            <div key={label} className="flex items-center justify-between gap-4">
                              <span className="text-xs text-muted-foreground">{label}</span>
                              <span className="text-xs font-semibold text-foreground truncate max-w-[160px] text-right">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3">
                    {paso > 1 ? (
                      <button
                        onClick={anterior}
                        className="flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Anterior
                      </button>
                    ) : (
                      <Link
                        href="/admin/negocios"
                        className="flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                      >
                        Cancelar
                      </Link>
                    )}
                    <button
                      onClick={siguiente}
                      className="flex flex-1 items-center justify-center gap-2 h-11 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
                    >
                      {paso < 3 ? (
                        <>
                          Siguiente
                          <ArrowRightIcon className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-4 w-4" />
                          Dar de Alta
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Preview panel (desktop only) ── */}
                <div className="hidden lg:flex flex-col gap-4">
                  <div className="sticky top-6">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      Vista previa en tiempo real
                    </p>
                    <PreviewCard form={form} />
                    <div className="mt-3 rounded-xl border border-dashed border-[#FE7801]/30 bg-[#FE7801]/5 px-4 py-3 flex items-start gap-2">
                      <SparklesIcon className="h-3.5 w-3.5 text-[#FE7801] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#FE7801] leading-relaxed">
                        La vista previa se actualiza conforme llenas el formulario.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
