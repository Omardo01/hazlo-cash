"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, ClipboardList, User } from "lucide-react";

const tabs = [
  { href: "/cliente", icon: Home, label: "Inicio" },
  { href: "/cliente/buscar", icon: Search, label: "Buscar" },
  { href: "/cliente/solicitudes", icon: ClipboardList, label: "Solicitudes" },
  { href: "/cliente/perfil", icon: User, label: "Perfil" },
];

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    /* Desktop: fondo gris con el "teléfono" centrado. Mobile: full screen */
    <div className="min-h-screen bg-zinc-200 flex items-center justify-center md:py-8">
      {/* Phone shell */}
      <div
        className="
          relative flex flex-col bg-[#F5F5F8] overflow-hidden
          w-full h-screen
          md:w-[390px] md:h-[844px] md:rounded-[44px] md:shadow-2xl md:border md:border-zinc-300
        "
      >
        {/* Notch simulado — solo desktop */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 z-50 w-[126px] h-[34px] bg-black rounded-b-[18px] items-center justify-center gap-2 px-4">
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="flex-1 h-[3px] rounded-full bg-zinc-800" />
        </div>

        {/* Status bar simulada */}
        <div className="hidden md:flex items-center justify-between px-8 pt-3 pb-1 text-[11px] font-semibold text-foreground/70 shrink-0 mt-[34px]">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-[2px] items-end h-3">
              {[2, 3, 4, 5].map((h) => (
                <div key={h} className="w-[3px] rounded-sm bg-foreground/60" style={{ height: `${h * 2}px` }} />
              ))}
            </div>
            <svg className="w-3.5 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.5 8.5C5.7 4.3 10.8 2 12 2s6.3 2.3 10.5 6.5l-1.5 1.5C17.2 6.2 13.2 4 12 4s-5.2 2.2-9 6L1.5 8.5z" />
              <path d="M4.5 11.5C7.5 8.5 10 7 12 7s4.5 1.5 7.5 4.5L18 13c-2.4-2.4-4.4-4-6-4s-3.6 1.6-6 4l-1.5-1.5z" />
              <path d="M7.5 14.5C9 13 10.5 12 12 12s3 1 4.5 2.5L15 16c-1-1-2-2-3-2s-2 1-3 2l-1.5-1.5z" />
              <circle cx="12" cy="19" r="2" />
            </svg>
            <svg className="w-6 h-3" viewBox="0 0 25 12" fill="currentColor">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" fill="none" />
              <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
              <path d="M23 4v4a2 2 0 000-4z" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Bottom navigation */}
        <div className="shrink-0 border-t border-border bg-white/90 backdrop-blur-md">
          <nav className="flex items-center">
            {tabs.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                >
                  <Icon
                    size={22}
                    className={active ? "text-[#FE7801]" : "text-muted-foreground"}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  <span
                    className={`text-[10px] font-semibold tracking-wide ${
                      active ? "text-[#FE7801]" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                  {active && (
                    <div className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#FE7801]" />
                  )}
                </Link>
              );
            })}
          </nav>
          {/* Home indicator (iOS) */}
          <div className="hidden md:flex justify-center pb-2 pt-0.5">
            <div className="w-32 h-1 rounded-full bg-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
