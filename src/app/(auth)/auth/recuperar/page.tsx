"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2, Phone } from "lucide-react";

type Etapa = "form" | "enviado";

export default function RecuperarPage() {
  const [etapa, setEtapa] = useState<Etapa>("form");
  const [loading, setLoading] = useState(false);
  const [metodo, setMetodo] = useState<"telefono" | "email">("telefono");
  const [valor, setValor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: enviar link/OTP de recuperación
    setTimeout(() => {
      setLoading(false);
      setEtapa("enviado");
    }, 1500);
  };

  if (etapa === "enviado") {
    return <PantallaEnviado metodo={metodo} valor={valor} />;
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft size={15} />
        Volver al inicio
      </Link>

      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
          Recupera tu cuenta
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Te enviamos un enlace para restablecer tu contraseña. Elige cómo quieres recibirlo.
        </p>
      </div>

      {/* Toggle método */}
      <div className="flex rounded-xl bg-white border border-border p-1 gap-1">
        <button
          type="button"
          onClick={() => setMetodo("telefono")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            metodo === "telefono"
              ? "bg-brand-dark text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone size={14} />
          SMS
        </button>
        <button
          type="button"
          onClick={() => setMetodo("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            metodo === "email"
              ? "bg-brand-dark text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail size={14} />
          Email
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {metodo === "telefono" ? (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Teléfono registrado
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-xl bg-white border border-border text-sm text-muted-foreground font-medium shrink-0 h-10">
                🇲🇽 +52
              </div>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="55 1234 5678"
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))}
                className="rounded-xl bg-white border-border flex-1"
                maxLength={10}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Te enviaremos un código por SMS para verificar tu identidad.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Correo electrónico
            </label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="rounded-xl bg-white border-border"
            />
            <p className="text-[11px] text-muted-foreground">
              Te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || valor.length < (metodo === "telefono" ? 10 : 5)}
          className="w-full h-12 rounded-xl bg-brand-dark hover:bg-brand-purple text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <LoadingDots />
          ) : (
            <>
              {metodo === "telefono" ? "Enviar código" : "Enviar enlace"}
              <ArrowRight size={17} />
            </>
          )}
        </Button>
      </form>

      {/* Link registro */}
      <p className="text-center text-[13px] text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link
          href="/auth/registro"
          className="text-brand-purple font-semibold hover:underline underline-offset-2"
        >
          Crear cuenta gratis
        </Link>
      </p>
    </div>
  );
}

// ── Pantalla de confirmación ──────────────────────────────────────────────────

function PantallaEnviado({ metodo, valor }: { metodo: "telefono" | "email"; valor: string }) {
  return (
    <div className="space-y-6 text-center">
      {/* Icono de éxito */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-brand-teal" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center">
            {metodo === "email" ? <Mail size={12} className="text-white" /> : <Phone size={12} className="text-white" />}
          </div>
        </div>
      </div>

      {/* Texto */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-brand-dark">
          {metodo === "email" ? "Revisa tu correo" : "Revisa tu SMS"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {metodo === "email" ? (
            <>
              Enviamos un enlace de recuperación a{" "}
              <span className="font-semibold text-foreground">{valor || "tu correo"}</span>.
              Expira en <span className="font-semibold">15 minutos</span>.
            </>
          ) : (
            <>
              Enviamos un código de verificación al número{" "}
              <span className="font-semibold text-foreground">+52 {valor}</span>.
            </>
          )}
        </p>
      </div>

      {/* Pasos siguientes */}
      <div className="bg-white border border-border rounded-2xl p-4 text-left space-y-3">
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
          Próximos pasos
        </p>
        {[
          metodo === "email"
            ? "Abre el correo de Hazlo Cash"
            : "Recibe el SMS con tu código",
          metodo === "email"
            ? "Haz clic en «Restablecer contraseña»"
            : "Ingrésalo en la pantalla de verificación",
          "Elige una nueva contraseña segura",
        ].map((paso, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-purple/10 text-brand-purple text-[11px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <span className="text-[13px] text-foreground">{paso}</span>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="space-y-3">
        <Link
          href="/auth/verificar"
          className="block w-full h-12 rounded-xl bg-brand-dark hover:bg-brand-purple text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2"
        >
          {metodo === "email" ? "Abrir correo" : "Ingresar código"}
          <ArrowRight size={17} />
        </Link>
        <Link
          href="/auth/login"
          className="block text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Volver al inicio de sesión
        </Link>
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
