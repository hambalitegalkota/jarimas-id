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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
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
                "group relative flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              {/* Active Indicator Top Pill */}
              {active && (
                <span className="absolute -top-1 h-1 w-8 rounded-full bg-primary transition-all duration-300 animate-in fade-in zoom-in-50" />
              )}

              {/* Icon Container with Touch Area & Badges */}
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full p-1 transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary scale-105"
                    : "group-hover:bg-muted text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200 group-active:scale-90",
                    active ? "stroke-[2.5px]" : "stroke-[1.8px]"
                  )}
                />
                {item.badge && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label Text */}
              <span
                className={cn(
                  "text-[11px] leading-tight tracking-tight transition-colors duration-200",
                  active ? "text-primary font-semibold" : "text-muted-foreground"
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
