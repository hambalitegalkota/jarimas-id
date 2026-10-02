"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ShoppingBag, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isActive: (pathname: string) => boolean;
}

// Flag status fitur Market (Set ke `true` jika fitur Market siap diluncurkan ke publik)
export const SHOW_MARKET_FEATURE = true;

const NAV_ITEMS: NavItem[] = [
  {
    label: "Beranda",
    href: "/",
    icon: Home,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    label: "Komunitas",
    href: "/komunitas",
    icon: Users,
    isActive: (pathname: string) => pathname.startsWith("/komunitas"),
  },
  ...(SHOW_MARKET_FEATURE
    ? [
        {
          label: "Market",
          href: "/market",
          icon: ShoppingBag,
          isActive: (pathname: string) => pathname.startsWith("/market"),
        },
      ]
    : []),
  {
    label: "Kabar",
    href: "/kabar",
    icon: MessageSquare,
    isActive: (pathname: string) => pathname.startsWith("/kabar"),
  },
  {
    label: "Profil",
    href: "/profil",
    icon: User,
    isActive: (pathname: string) => pathname.startsWith("/profil"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Jangan render navbar di halaman auth fullscreen tertentu jika diperlukan
  const hideOnPaths = ["/login", "/register"];
  const shouldHide = hideOnPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <nav
      aria-label="Navigasi Utama Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-2 sm:max-w-lg md:max-w-xl">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-full flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5 transition-all outline-none",
                active
                  ? "text-emerald-700 dark:text-emerald-400 font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
              )}
            >
              {/* Active Top Bar Indicator */}
              {active && (
                <span className="absolute top-0 h-1 w-10 bg-emerald-600 dark:bg-emerald-400 rounded-full shadow-xs shadow-emerald-500/50" />
              )}

              {/* Icon Container */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 transition-all",
                    active
                      ? "text-emerald-700 dark:text-emerald-400 stroke-[2.5px] scale-105"
                      : "text-slate-500 dark:text-slate-400 stroke-[2px]"
                  )}
                />
                {item.badge && (
                  <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white font-mono shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label Text */}
              <span
                className={cn(
                  "text-[11px] sm:text-xs tracking-tight transition-colors",
                  active
                    ? "text-emerald-700 dark:text-emerald-400 font-black"
                    : "text-slate-500 dark:text-slate-400 font-semibold"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
