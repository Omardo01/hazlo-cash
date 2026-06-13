"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  SearchIcon,
  ChevronDownIcon,
  MoonIcon,
} from "lucide-react";

interface NavTab {
  label: string;
  href: string;
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  tabs?: NavTab[];
  userName?: string;
  userInitials?: string;
  avatarColor?: string;
  notificationColor?: string;
}

const defaultTabs: NavTab[] = [
  { label: "Dashboard",  href: "/recomendador"            },
  { label: "Comisiones", href: "/recomendador/comisiones" },
  { label: "Mi Perfil",  href: "/recomendador/perfil"     },
];

export function DashboardHeader({
  tabs = defaultTabs,
  userName = "Omar M.",
  userInitials = "OM",
  avatarColor = "bg-[#FE7801]/10 text-[#FE7801]",
  notificationColor = "bg-brand-orange",
}: DashboardHeaderProps) {
  const pathname = usePathname();

  // Determine the base path from the first tab to match active state correctly
  const basePath = tabs[0]?.href ?? "/";

  return (
    <header className="sticky top-0 z-10 flex h-[62px] shrink-0 items-center bg-white border-b border-border gap-3">
      {/* Spacer for mobile hamburger button (fixed positioned) */}
      <div className="w-16 shrink-0 md:hidden" />

      {/* Nav tabs — scrollable on mobile */}
      <nav className="flex items-center h-full overflow-x-auto scrollbar-none flex-nowrap flex-1 min-w-0 pl-0 md:pl-5">
        {tabs.map((tab) => {
          const isActive = tab.href === basePath
            ? pathname === basePath
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex h-full shrink-0 items-center px-3 text-sm transition-colors ${
                isActive
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-foreground" />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border shrink-0" />

        {/* Search */}
        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <SearchIcon className="h-4 w-4" />
        </button>
      </nav>

      {/* Right — user + dark mode */}
      <div className="flex items-center gap-2.5 shrink-0 pr-4 sm:pr-5">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <BellIcon className="h-[17px] w-[17px]" />
          <span className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${notificationColor}`} />
        </button>

        <span className="hidden sm:block text-sm font-semibold text-foreground">
          {userName}
        </span>

        <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold ${avatarColor}`}>
          {userInitials}
        </div>

        <ChevronDownIcon className="h-3 w-3 text-muted-foreground hidden sm:block" />

        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <MoonIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
