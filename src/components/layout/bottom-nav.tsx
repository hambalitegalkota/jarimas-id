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
  {
    label: "Market",
    href: "/market",
    icon: ShoppingBag,
    isActive: (pathname: string) => pathname.startsWith("/market"),
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-around px-2 sm:max-w-lg md:max-w-xl">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-full flex-1 flex-col items-center justify-center gap-1 px-1 py-1 transition-colors outline-none",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Minimal Top Border Indicator */}
              {active && (
                <span className="absolute top-0 h-0.5 w-8 bg-blue-600 dark:bg-sky-400 rounded-full" />
              )}

              {/* Icon Container */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    active ? "text-blue-600 dark:text-sky-400 stroke-[2.2px]" : "text-muted-foreground stroke-[1.75px]"
                  )}
                />
                {item.badge && (
                  <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-blue-600 dark:bg-sky-400 px-1 text-[9px] font-bold text-white dark:text-slate-950 font-mono">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label Text */}
              <span
                className={cn(
                  "text-[10px] font-medium tracking-tight transition-colors font-mono",
                  active ? "text-foreground font-semibold" : "text-muted-foreground"
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
