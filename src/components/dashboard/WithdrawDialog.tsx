"use client";

import { useEffect, useState, type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowDownToLineIcon,
  CheckIcon,
  Loader2Icon,
  BuildingIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const money = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Pasos de la simulación de dispersión (no hay backend real todavía).
const STEPS = ["Validando fondos", "Enviando a tu CLABE", "Confirmado"] as const;
const CLABE_MASK = "CLABE •• 4521";

type Stage = "amount" | "processing" | "success";

export function WithdrawDialog({
  saldo,
  trigger,
}: {
  saldo: number;
  trigger?: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("amount");
  const [amount, setAmount] = useState(saldo);
  const [step, setStep] = useState(0);

  // Al abrir, arrancamos siempre desde el monto con el saldo disponible.
  useEffect(() => {
    if (open) {
      setStage("amount");
      setStep(0);
      setAmount(saldo);
    }
  }, [open, saldo]);

  // Animación de la etapa "procesando": avanza un paso cada 900ms.
  useEffect(() => {
    if (stage !== "processing") return;
    if (step >= STEPS.length) {
      const done = setTimeout(() => setStage("success"), 500);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [stage, step]);

  const disponible = saldo;
  const montoValido = amount > 0 && amount <= disponible;
  const presets = [0.25, 0.5, 1];

  const progreso = Math.min(100, (step / STEPS.length) * 100);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <button
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              <ArrowDownToLineIcon className="h-4 w-4" />
              Retirar
            </button>
          )
        }
      />

      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0">
        {/* ── Etapa 1: elegir monto ── */}
        {stage === "amount" && (
          <div className="p-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-lg font-black tracking-tight">Retirar dinero</DialogTitle>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BuildingIcon className="h-3.5 w-3.5" />
                A tu cuenta {CLABE_MASK}
              </p>
            </DialogHeader>

            <div className="mt-6 flex flex-col items-center">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Cantidad</span>
              <div className="mt-1 flex items-baseline">
                <span className="text-2xl font-bold text-muted-foreground">$</span>
                <input
                  type="number"
                  value={amount === 0 ? "" : amount}
                  onChange={(e) => setAmount(Math.min(disponible, Math.max(0, Number(e.target.value))))}
                  className="w-[190px] bg-transparent text-center text-5xl font-black tracking-tight text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
              </div>
              <span className="mt-1 text-xs text-muted-foreground">Disponible: {money(disponible)}</span>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {presets.map((p) => {
                const val = Math.round(disponible * p * 100) / 100;
                const sel = amount === val;
                return (
                  <button
                    key={p}
                    onClick={() => setAmount(val)}
                    className={cn(
                      "h-9 rounded-full px-4 text-xs font-semibold transition-colors",
                      sel
                        ? "bg-[#FE7801] text-white"
                        : "border border-border text-foreground hover:bg-secondary"
                    )}
                  >
                    {p === 1 ? "Todo" : `${p * 100}%`}
                  </button>
                );
              })}
            </div>

            <button
              disabled={!montoValido}
              onClick={() => setStage("processing")}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              Retirar {money(amount)}
            </button>
            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Simulación · aún no hay dispersión bancaria real.
            </p>
          </div>
        )}

        {/* ── Etapa 2: procesando (animado) ── */}
        {stage === "processing" && (
          <div className="p-6">
            <DialogHeader className="space-y-1 text-center sm:text-center">
              <DialogTitle className="text-lg font-black tracking-tight">Procesando retiro</DialogTitle>
              <p className="text-xs text-muted-foreground">{money(amount)} → {CLABE_MASK}</p>
            </DialogHeader>

            {/* Barra de progreso */}
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${progreso}%`, background: "linear-gradient(90deg, #FE7801, #EB4E00)" }}
              />
            </div>

            {/* Pasos */}
            <div className="mt-6 space-y-3">
              {STEPS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                        done ? "bg-brand-teal text-white" : active ? "bg-[#FE7801]/10 text-[#FE7801]" : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {done ? (
                        <CheckIcon className="h-4 w-4" strokeWidth={3} />
                      ) : active ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="text-[11px] font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        done || active ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Etapa 3: éxito ── */}
        {stage === "success" && (
          <div className="flex flex-col items-center p-6 text-center">
            <DialogHeader className="sr-only">
              <DialogTitle>Retiro enviado</DialogTitle>
            </DialogHeader>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal/15">
              <CheckIcon className="h-8 w-8 text-brand-teal" strokeWidth={2.5} />
            </div>
            <h3 className="mt-4 text-xl font-black tracking-tight text-foreground">¡Retiro enviado!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {money(amount)} llegarán a tu {CLABE_MASK}
              <br />
              en 1–2 días hábiles.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)" }}
            >
              Listo
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
