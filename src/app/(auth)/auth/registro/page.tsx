"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Star,
  Users,
  Building2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Rol = "embajador" | "cliente" | "negocio";

const roles: { id: Rol; icon: React.ElementType; titulo: string; desc: string; color: string; bg: string }[] = [
  {
    id: "embajador",
    icon: Star,
    titulo: "Embajador",
    desc: "Recomienda negocios y gana comisión por cada servicio contratado.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10 border-brand-orange/30",
  },
  {
    id: "cliente",
    icon: Users,
    titulo: "Cliente",
    desc: "Encuentra y contrata servicios recomendados por gente de confianza.",
    color: "text-brand-teal",
    bg: "bg-brand-teal/10 border-brand-teal/30",
  },
  {
    id: "negocio",
    icon: Building2,
    titulo: "Negocio",
    desc: "Recibe clientes nuevos por recomendación real, solo pagas por resultados.",
    color: "text-brand-purple",
    bg: "bg-brand-purple/10 border-brand-purple/30",
  },
];

const PASOS = ["Datos", "Tu rol", "Contraseña"];

export default function RegistroPage() {
  const [paso, setPaso] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<Rol[]>([]);

  const progreso = ((paso + 1) / PASOS.length) * 100;

  const toggleRol = (rol: Rol) => {
    setRolesSeleccionados((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paso < PASOS.length - 1) {
      setPaso((p) => p + 1);
      return;
    }
    setLoading(true);
    // TODO: conectar con Supabase auth
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          {paso === 0 && "Empieza con tus datos básicos."}
          {paso === 1 && "¿Cómo vas a usar Hazlo Cash? Puedes elegir más de uno."}
          {paso === 2 && "Elige una contraseña segura para proteger tu cuenta."}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between">
          {PASOS.map((label, i) => (
            <span
              key={label}
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider transition-colors",
                i === paso ? "text-brand-purple" : i < paso ? "text-brand-teal" : "text-muted-foreground"
              )}
            >
              {i < paso ? <Check size={12} className="inline mr-0.5" /> : null}
              {label}
            </span>
          ))}
        </div>
        <Progress value={progreso} className="h-1.5 bg-border" />
      </div>

      {/* Formulario por paso */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {paso === 0 && <PasoDatos />}
        {paso === 1 && (
          <PasoRoles
            seleccionados={rolesSeleccionados}
            onToggle={toggleRol}
          />
        )}
        {paso === 2 && (
          <PasoPassword
            showPass={showPass}
            setShowPass={setShowPass}
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
          />
        )}

        {/* Botones de navegación */}
        <div className={cn("flex gap-3", paso > 0 ? "flex-row" : "flex-col")}>
          {paso > 0 && (
            <Button
              type="button"
              onClick={() => setPaso((p) => p - 1)}
              className="h-12 px-5 rounded-xl bg-white border border-border text-foreground hover:bg-gray-50 font-semibold"
            >
              <ArrowLeft size={17} />
            </Button>
          )}
          <Button
            type="submit"
            disabled={paso === 1 && rolesSeleccionados.length === 0}
            className="flex-1 h-12 rounded-xl bg-brand-dark hover:bg-brand-purple text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <LoadingDots />
            ) : paso < PASOS.length - 1 ? (
              <>Continuar <ArrowRight size={17} /></>
            ) : (
              <>Crear cuenta <ArrowRight size={17} /></>
            )}
          </Button>
        </div>
      </form>

      {/* Link login */}
      <p className="text-center text-[13px] text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/login"
          className="text-brand-purple font-semibold hover:underline underline-offset-2"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

// ── Paso 1: Datos básicos ─────────────────────────────────────────────────────

function PasoDatos() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Nombre</label>
          <Input placeholder="Ana" className="rounded-xl bg-white border-border" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium">Apellido</label>
          <Input placeholder="García" className="rounded-xl bg-white border-border" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Teléfono</label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 rounded-xl bg-white border border-border text-sm text-muted-foreground font-medium shrink-0 h-10">
            🇲🇽 +52
          </div>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="55 1234 5678"
            className="rounded-xl bg-white border-border flex-1"
            maxLength={10}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Te enviaremos un código para verificar tu número.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">
          Correo electrónico{" "}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <Input
          type="email"
          placeholder="tu@email.com"
          className="rounded-xl bg-white border-border"
        />
      </div>
    </div>
  );
}

// ── Paso 2: Selector de rol ───────────────────────────────────────────────────

function PasoRoles({
  seleccionados,
  onToggle,
}: {
  seleccionados: Rol[];
  onToggle: (r: Rol) => void;
}) {
  return (
    <div className="space-y-3">
      {roles.map(({ id, icon: Icon, titulo, desc, color, bg }) => {
        const activo = seleccionados.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={cn(
              "w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200",
              activo
                ? `${bg} border-current`
                : "bg-white border-border hover:border-border/80"
            )}
          >
            <div
              className={cn(
                "mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                activo ? `${color} bg-current/10` : "bg-muted text-muted-foreground"
              )}
            >
              <Icon size={20} className={activo ? color : ""} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn("font-semibold text-[14px]", activo ? color : "text-foreground")}>
                {titulo}
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                {desc}
              </div>
            </div>
            <div
              className={cn(
                "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                activo ? "border-current bg-current" : "border-border"
              )}
            >
              {activo && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
          </button>
        );
      })}

      <p className="text-[11px] text-muted-foreground text-center">
        Puedes cambiar o agregar roles en cualquier momento desde tu perfil.
      </p>
    </div>
  );
}

// ── Paso 3: Contraseña ────────────────────────────────────────────────────────

function PasoPassword({
  showPass,
  setShowPass,
  showConfirm,
  setShowConfirm,
}: {
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
}) {
  const [pass, setPass] = useState("");

  const requisitos = [
    { label: "Al menos 8 caracteres", ok: pass.length >= 8 },
    { label: "Una letra mayúscula", ok: /[A-Z]/.test(pass) },
    { label: "Un número", ok: /\d/.test(pass) },
  ];

  const fortaleza = requisitos.filter((r) => r.ok).length;
  const fortalezaColor = fortaleza === 0 ? "bg-border" : fortaleza === 1 ? "bg-red-400" : fortaleza === 2 ? "bg-brand-orange" : "bg-brand-teal";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Contraseña</label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="rounded-xl bg-white border-border pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Barra de fortaleza */}
        {pass.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-all duration-300",
                    n <= fortaleza ? fortalezaColor : "bg-border"
                  )}
                />
              ))}
            </div>
            <div className="space-y-1">
              {requisitos.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors",
                      r.ok ? "bg-brand-teal" : "bg-border"
                    )}
                  >
                    {r.ok && <Check size={8} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn("text-[11px]", r.ok ? "text-brand-teal" : "text-muted-foreground")}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium">Confirmar contraseña</label>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="rounded-xl bg-white border-border pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
