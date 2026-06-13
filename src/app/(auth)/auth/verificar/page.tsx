"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const LONGITUD = 6;
const REENVIO_SEGUNDOS = 60;

export default function VerificarPage() {
  const [codigo, setCodigo] = useState<string[]>(Array(LONGITUD).fill(""));
  const [loading, setLoading] = useState(false);
  const [segundos, setSegundos] = useState(REENVIO_SEGUNDOS);
  const [error, setError] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown reenvío
  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...codigo];
    next[i] = char;
    setCodigo(next);
    setError(false);
    if (char && i < LONGITUD - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codigo[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  // Pegar código completo
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LONGITUD);
    if (text.length === LONGITUD) {
      setCodigo(text.split(""));
      inputs.current[LONGITUD - 1]?.focus();
    }
  };

  const completo = codigo.every((c) => c !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completo) return;
    setLoading(true);
    // TODO: verificar OTP con Supabase
    setTimeout(() => {
      // Simular error para demo
      setError(true);
      setLoading(false);
      setCodigo(Array(LONGITUD).fill(""));
      inputs.current[0]?.focus();
    }, 1500);
  };

  const handleReenviar = () => {
    setSegundos(REENVIO_SEGUNDOS);
    setCodigo(Array(LONGITUD).fill(""));
    setError(false);
    inputs.current[0]?.focus();
    // TODO: reenviar OTP con Supabase
  };

  return (
    <div className="space-y-6">
      {/* Icono */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
          <Phone size={28} className="text-brand-purple" />
        </div>
      </div>

      {/* Encabezado */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
          Verifica tu número
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enviamos un código de 6 dígitos a{" "}
          <span className="font-semibold text-foreground">+52 55 1234 5678</span>.{" "}
          <Link href="/auth/registro" className="text-brand-purple hover:underline underline-offset-2 text-[13px]">
            Cambiar
          </Link>
        </p>
      </div>

      {/* Form OTP */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center gap-2.5">
          {codigo.map((val, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={cn(
                "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white outline-none transition-all duration-150",
                "focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20",
                error
                  ? "border-red-400 bg-red-50 text-red-600 shake"
                  : val
                  ? "border-brand-purple text-brand-dark"
                  : "border-border text-foreground"
              )}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-[13px] text-red-500 font-medium">
            Código incorrecto. Inténtalo de nuevo.
          </p>
        )}

        <Button
          type="submit"
          disabled={!completo || loading}
          className="w-full h-12 rounded-xl bg-brand-dark hover:bg-brand-purple text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <LoadingDots />
          ) : (
            <>Verificar <ArrowRight size={17} /></>
          )}
        </Button>
      </form>

      {/* Reenviar */}
      <div className="text-center space-y-2">
        {segundos > 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Reenviar código en{" "}
            <span className="font-semibold tabular-nums text-foreground">
              0:{String(segundos).padStart(2, "0")}
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleReenviar}
            className="flex items-center justify-center gap-2 mx-auto text-[13px] text-brand-purple font-semibold hover:underline underline-offset-2"
          >
            <RotateCcw size={13} />
            Reenviar código
          </button>
        )}
        <p className="text-[11px] text-muted-foreground">
          ¿No llegó? Revisa tu bandeja de SMS o{" "}
          <button type="button" className="underline underline-offset-2 hover:text-foreground transition-colors">
            solicita una llamada
          </button>
          .
        </p>
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
