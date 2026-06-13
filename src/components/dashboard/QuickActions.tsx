"use client";

import { QrCodeIcon, ShareIcon, CopyIcon } from "lucide-react";

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="text-sm font-semibold mb-4">Acciones rápidas</h3>

      <div className="space-y-2">
        {/* Primary CTA — neumorphic */}
        <button
          className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-white transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #FE7801 0%, #EB4E00 73%)",
            boxShadow: "0 4px 14px rgba(254, 120, 1, 0.3)",
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <QrCodeIcon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Mostrar mi QR</p>
            <p className="text-[11px] text-white/60">Para escaneo presencial</p>
          </div>
        </button>

        {/* Secondary — flat with hover */}
        <button className="flex w-full items-center gap-3 rounded-xl border border-border p-3.5 transition-all hover:bg-secondary active:scale-[0.98]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal/8">
            <ShareIcon className="h-4 w-4 text-brand-teal" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Compartir código</p>
            <p className="text-[11px] text-muted-foreground">WhatsApp, redes, SMS</p>
          </div>
        </button>

        <button className="flex w-full items-center gap-3 rounded-xl border border-border p-3.5 transition-all hover:bg-secondary active:scale-[0.98]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/8">
            <CopyIcon className="h-4 w-4 text-brand-orange" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Copiar link</p>
            <p className="text-[11px] text-muted-foreground">Enlace directo</p>
          </div>
        </button>
      </div>

      {/* Referral code — pill neumorphic */}
      <div
        className="mt-4 flex items-center justify-center gap-3 rounded-full py-3.5 px-5"
        style={{
          background: "var(--secondary)",
          boxShadow: "var(--shadow-neu-inset)",
        }}
      >
        <span className="text-[11px] font-medium text-muted-foreground">Tu código</span>
        <span className="text-lg font-black tracking-[0.15em] text-[#FE7801]">
          HAZLO-0M4R
        </span>
      </div>
    </div>
  );
}
