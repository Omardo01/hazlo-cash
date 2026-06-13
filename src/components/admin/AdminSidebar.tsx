"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  UsersIcon,
  MapPinIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ActivityIcon,
  CreditCardIcon,
  MessageSquareIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Top quick-access icons (3 items, like ambassador & negocio) ──
const quickItems = [
  { icon: ShieldAlertIcon,  label: "Panel",    href: "/admin",          bg: "bg-brand-dark"   },
  { icon: UsersIcon,        label: "Usuarios", href: "/admin/users",    bg: "bg-[#FE7801]"    },
  { icon: CreditCardIcon,   label: "Finanzas", href: "/admin/finanzas", bg: "bg-brand-teal"   },
];

// ── Middle nav group ──
const navItems = [
  { icon: LayoutDashboardIcon, label: "Overview",       href: "/admin"           },
  { icon: MapPinIcon,          label: "Negocios",       href: "/admin/negocios"  },
  { icon: CreditCardIcon,     label: "Pagos & Finanzas", href: "/admin/finanzas" },
  { icon: ActivityIcon,        label: "Auditoría",      href: "/admin/audit"     },
  { icon: SettingsIcon,        label: "Configuración",  href: "/admin/settings"  },
];

// Bottom nav items (mobile)
const bottomNavItems = [
  { icon: LayoutDashboardIcon, label: "Inicio",   href: "/admin"           },
  { icon: UsersIcon,           label: "Usuarios", href: "/admin/users"     },
  { icon: MapPinIcon,          label: "Negocios", href: "/admin/negocios"  },
  { icon: SettingsIcon,        label: "Ajustes",  href: "/admin/settings"  },
];

function Separator() {
  return (
    <div className="flex h-[15px] w-full items-center justify-center px-[10px]">
      <div className="h-px w-full rounded-full bg-gradient-to-r from-transparent via-[#EBEBF0] to-transparent" />
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const activeNav = navItems.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  const sidebarContent = (
    <>
      {/* ── Logo / Close ── */}
      <div className="flex h-20 w-full items-center justify-center shrink-0">
        <button
          onClick={() => setMobileOpen(false)}
          className="flex flex-col items-center gap-1.5 md:hidden"
        >
          <Image src="/hazlo.svg" alt="Hazlo Cash" width={28} height={23} />
          <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="hidden md:flex items-center justify-center">
          <Image src="/hazlo.svg" alt="Hazlo Cash" width={28} height={23} />
        </div>
      </div>

      <Separator />

      {/* ── Top colored icons ── */}
      <div className="flex flex-col items-center gap-0">
        {quickItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger>
              <Link href={item.href} className="flex h-[66px] w-20 items-center justify-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] text-white transition-transform hover:scale-105 active:scale-95 ${item.bg}`}>
                  <item.icon className="h-[18px] w-[18px]" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Separator />

      {/* ── Middle nav group ── */}
      <div className="mt-3 flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 rounded-[15px] bg-[#f8f9fe] p-[3px]">
          {navItems.map((item) => {
            const isActive = activeNav?.href === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center rounded-[13px] p-[13px] transition-all ${
                      isActive
                        ? "bg-white shadow-[0px_4px_8px_rgba(50,50,71,0.08),0px_4px_4px_rgba(0,0,0,0.06)] border border-[#f2f2f7]"
                        : "hover:bg-white/60"
                    }`}
                  >
                    <item.icon
                      className={`h-[14px] w-[14px] ${isActive ? "text-[#FE7801]" : "text-muted-foreground"}`}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bottom: messages ── */}
      <Separator />
      <div className="mb-4 mt-3 flex flex-col items-center">
        <div className="flex flex-col items-center rounded-[15px] bg-[#f8f9fe] p-[3px]">
          <Tooltip>
            <TooltipTrigger>
              <Link
                href="/admin/mensajes"
                className={`flex items-center justify-center rounded-[13px] p-[13px] transition-all ${
                  pathname === "/admin/mensajes"
                    ? "bg-white shadow-[0px_4px_8px_rgba(50,50,71,0.08)] border border-[#f2f2f7]"
                    : "hover:bg-white/60"
                }`}
              >
                <MessageSquareIcon
                  className={`h-[14px] w-[14px] ${
                    pathname === "/admin/mensajes"
                      ? "text-brand-dark"
                      : "text-muted-foreground"
                  }`}
                />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Mensajes
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex h-screen w-20 shrink-0 flex-col items-center bg-white border-r border-border overflow-hidden">
        {sidebarContent}
      </aside>

      {/* ── Mobile: hamburger trigger ── */}
      <button
        id="mobile-admin-sidebar-trigger"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3.5 left-4 z-40 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors bg-white border border-border shadow-sm"
        aria-label="Abrir menú"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-20 flex flex-col items-center bg-white border-r border-border overflow-hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile bottom nav bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white border-t border-border px-2 pb-safe">
        {bottomNavItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2.5 px-3 min-w-0">
              <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-[#FE7801]" : "text-muted-foreground"}`} />
              <span className={`text-[9px] font-semibold leading-none ${isActive ? "text-[#FE7801]" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
