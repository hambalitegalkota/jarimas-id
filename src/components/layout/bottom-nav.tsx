"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isActive: (pathname: string) => boolean;
}

// Flag status fitur Market (Set ke `true` jika fitur Market siap diluncurkan ke publik)
export const SHOW_MARKET_FEATURE = false;

const NAV_ITEMS: NavItem[] = [
  {
    label: "Kabar",
    href: "/",
    icon: Home,
    isActive: (pathname: string) => pathname === "/" || pathname.startsWith("/kabar"),
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
      className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-slate-200 bg-white shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-3 sm:max-w-lg md:max-w-xl">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-full flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 transition-all outline-none",
                active
                  ? "text-blue-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              )}
            >
              {/* Active Top Bar Indicator */}
              {active && (
                <span className="absolute top-0 h-1 w-12 bg-blue-700 rounded-full" />
              )}

              {/* Icon Container */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all",
                    active
                      ? "text-blue-700 stroke-[2.5px] scale-105"
                      : "text-slate-600 stroke-[2px]"
                  )}
                />
                {item.badge && (
                  <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold text-white font-mono">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label Text */}
              <span
                className={cn(
                  "text-xs tracking-tight transition-colors",
                  active
                    ? "text-blue-700 font-bold"
                    : "text-slate-600 font-semibold"
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
