"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onDone: () => void;
  duration?: number;
}

export default function SplashScreen({ onDone, duration = 2400 }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), duration - 320);
    const t2 = setTimeout(() => onDone(), duration);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration, onDone]);

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white overflow-hidden"
      style={{
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.32s ease",
      }}
    >
      {/* Aura exterior */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(254,120,1,0.30) 0%, rgba(254,120,1,0) 60%)",
          animation: "hz-aura-pulse 2.2s ease-out infinite",
        }}
      />

      {/* Aura interior */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle, rgba(235,78,0,0.45) 0%, rgba(235,78,0,0) 70%)",
          animation: "hz-pulse 1.8s ease-in-out infinite",
        }}
      />

      {/* Logo */}
      <div className="relative hz-scale-in">
        <Image
          src="/hazlo.svg"
          alt="Hazlo Cash"
          width={96}
          height={96}
          priority
          className="w-24 h-24"
        />
      </div>

      {/* Wordmark */}
      <div className="mt-8 text-[28px] font-black tracking-tight text-brand-dark hz-slide-up-1">
        Hazlo <span className="text-brand-gradient">Cash</span>
      </div>

      {/* Tagline */}
      <div
        className="mt-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.28em] hz-slide-up-2"
      >
        Recomienda · Conecta · Gana
      </div>

      {/* Dots de carga */}
      <div className="absolute bottom-16 flex gap-2 hz-fade-dots">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-purple"
            style={{
              animation: `hz-dots 1.2s ${i * 0.16}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
