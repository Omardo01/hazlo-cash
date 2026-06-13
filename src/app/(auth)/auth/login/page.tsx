"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import SplashScreen from "@/components/SplashScreen";
import { login } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [method, setMethod] = useState<"telefono" | "email">("telefono");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [destino, setDestino] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === "telefono") {
      setError("Por ahora inicia sesión con tu correo. El acceso por teléfono llega pronto.");
      return;
    }

    setLoading(true);
    const resultado = await login(email, password);

    if (resultado.ok) {
      setDestino(resultado.destino);
      setShowSplash(true);
    } else {
      setError(resultado.error);
      setLoading(false);
    }
  };

  const handleSplashDone = () => {
    router.push(destino ?? "/recomendador");
    router.refresh();
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

      <div className="space-y-6">
        {/* Encabezado */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa a tu cuenta para continuar ganando.
          </p>
        </div>

        {/* Toggle método */}
        <div className="flex rounded-xl bg-white border border-border p-1 gap-1">
          <button
            type="button"
            onClick={() => setMethod("telefono")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              method === "telefono"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone size={14} />
            Teléfono
          </button>
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              method === "email"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base leading-none">@</span>
            Email
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "telefono" ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">
                Teléfono
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 rounded-xl bg-white border border-border text-sm text-muted-foreground font-medium shrink-0">
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
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                className="rounded-xl bg-white border-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-foreground">
                Contraseña
              </label>
              <Link
                href="/auth/recuperar"
                className="text-[12px] text-brand-purple hover:underline underline-offset-2 font-medium"
              >
                ¿La olvidaste?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="rounded-xl bg-white border-border pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={method === "email"}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[13px] font-medium text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-brand-dark hover:bg-brand-purple text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <LoadingDots />
            ) : (
              <>
                Entrar <ArrowRight size={17} />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-muted-foreground font-medium">
            o continúa con
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social login */}
        <div className="grid grid-cols-2 gap-3">
          <SocialButton icon="google" label="Google" />
          <SocialButton icon="whatsapp" label="WhatsApp" />
        </div>

        {/* Link registro */}
        <p className="text-center text-[13px] text-muted-foreground">
          ¿Primera vez en Hazlo Cash?{" "}
          <Link
            href="/auth/registro"
            className="text-brand-purple font-semibold hover:underline underline-offset-2"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </>
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

function SocialButton({
  icon,
  label,
}: {
  icon: "google" | "whatsapp";
  label: string;
}) {
  const icons = {
    google: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
    whatsapp: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  };

  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2.5 h-11 rounded-xl bg-white border border-border text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors"
    >
      {icons[icon]}
      {label}
    </button>
  );
}
