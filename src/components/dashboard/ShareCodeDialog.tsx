"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  CopyIcon,
  CheckIcon,
  ShareIcon,
  XIcon,
  ZapIcon,
  QrCodeIcon,
} from "lucide-react";

// ── OTP-style code display ──────────────────────────────────────────────────

function CodeDigits({ code }: { code: string }) {
  const chars = code.replace("HAZLO-", "").split("");

  return (
    <div className="flex items-center justify-center gap-3">
      {chars.map((char, i) => (
        <div
          key={i}
          className="flex h-[60px] w-[52px] items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          style={{
            animationDelay: `${i * 80}ms`,
            animation: "fadeInUp 0.4s ease-out both",
          }}
        >
          <span className="text-2xl font-bold text-white">{char}</span>
        </div>
      ))}
    </div>
  );
}

// ── Share actions ───────────────────────────────────────────────────────────

function ShareActions({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const shareUrl = `https://hazlocash.mx/r/${code}`;
  const shareText = `¡Usa mi código ${code} en Hazlo Cash y obtén beneficios exclusivos! 🎉`;

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
      "_blank"
    );
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Hazlo Cash", text: shareText, url: shareUrl });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-2">
      {/* Copy */}
      <button
        onClick={onCopy}
        className="flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 text-[13px] font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-brand-teal" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
        {copied ? "¡Copiado!" : "Copiar"}
      </button>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/30"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {/* Native share */}
      {"share" in (typeof navigator !== "undefined" ? navigator : {}) && (
        <button
          onClick={handleNativeShare}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ── Main dialog ─────────────────────────────────────────────────────────────

export function ShareCodeDialog({
  open,
  onOpenChange,
  code = "HAZLO-OD42",
  userName = "Omar",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code?: string;
  userName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"codigo" | "qr">("codigo");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const qrValue = typeof window !== "undefined"
    ? `${window.location.origin}/r/${code}`
    : `https://hazlocash.mx/r/${code}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* Aurora overlay */}
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-300"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(120,80,220,0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(60,80,220,0.6) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(140,60,200,0.4) 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, rgba(200,180,255,0.3) 0%, transparent 40%), #0a0818",
          }}
        />

        {/* Aurora streaks */}
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full opacity-40 blur-[120px]" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #06b6d4 100%)", top: "-10%", left: "-10%", animation: "auroraFloat1 8s ease-in-out infinite" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]" style={{ background: "linear-gradient(225deg, #a855f7 0%, #6366f1 50%, #2563eb 100%)", bottom: "-15%", right: "-10%", animation: "auroraFloat2 10s ease-in-out infinite" }} />
        </div>

        {/* Card */}
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-[380px] -translate-x-1/2 -translate-y-1/2 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-200">
          <div
            className="relative rounded-3xl border border-white/15 p-8 shadow-2xl"
            style={{
              background: "linear-gradient(160deg, rgba(30,20,60,0.85) 0%, rgba(15,10,40,0.9) 50%, rgba(20,30,80,0.85) 100%)",
              backdropFilter: "blur(40px) saturate(1.5)",
              boxShadow: "0 0 80px rgba(120,80,220,0.15), 0 0 30px rgba(60,80,200,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <DialogPrimitive.Close className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all">
              <XIcon className="h-4 w-4" />
            </DialogPrimitive.Close>

            {/* Icono */}
            <div className="flex justify-center mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(120,80,220,0.3) 0%, rgba(60,130,246,0.3) 100%)", boxShadow: "0 0 30px rgba(120,80,220,0.2)" }}>
                <ZapIcon className="h-7 w-7 text-white fill-white" />
              </div>
            </div>

            <DialogTitle className="text-center text-[22px] font-bold text-white mb-1">
              Comparte tu código
            </DialogTitle>
            <p className="text-center text-[13px] text-white/50 mb-5">
              Gana comisiones cada vez que alguien lo use
            </p>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 mb-5">
              {([["codigo", ZapIcon, "Código"], ["qr", QrCodeIcon, "QR"]] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] font-semibold transition-all ${
                    tab === key
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Código */}
            {tab === "codigo" && (
              <div className="mb-2">
                <p className="text-center text-[11px] text-white/30 font-medium tracking-widest uppercase mb-3">Tu código</p>
                <CodeDigits code={code} />
              </div>
            )}

            {/* Tab: QR */}
            {tab === "qr" && (
              <div className="flex flex-col items-center gap-3 mb-2">
                <div className="relative rounded-2xl bg-white p-4 shadow-lg">
                  <QRCode value={qrValue} size={180} level="H" />
                  {/* Logo centrado */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rounded-xl bg-white p-1.5 shadow-sm">
                      <Image src="/hazlo.svg" alt="Hazlo Cash" width={32} height={32} className="h-8 w-8" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 text-center">
                  Escanea con la cámara para abrir la página del negocio
                </p>
              </div>
            )}

            {/* Share actions */}
            <div className="mt-5">
              <ShareActions code={code} onCopy={handleCopy} copied={copied} />
            </div>

            <p className="text-center text-[11px] text-white/25 mt-5 leading-relaxed">
              Al compartir, aceptas nuestros{" "}
              <span className="underline underline-offset-2 hover:text-white/40 cursor-pointer">Términos de Servicio</span>{" "}
              y{" "}
              <span className="underline underline-offset-2 hover:text-white/40 cursor-pointer">Política de Privacidad</span>
            </p>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes auroraFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes auroraFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.15); }
        }
        @keyframes auroraFloat3 {
          0%, 100% { transform: rotate(-20deg) translateY(0); opacity: 0.15; }
          50% { transform: rotate(-15deg) translateY(-30px); opacity: 0.25; }
        }
      `}</style>
    </Dialog>
  );
}
