"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ShoppingBag, MessageSquare, User, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "danger" | "emerald" | "amber";
  isActive: (pathname: string) => boolean;
}

// Flag status fitur Market (Set ke `true` jika fitur Market siap diluncurkan ke publik)
export const SHOW_MARKET_FEATURE = true;

export function BottomNav() {
  const pathname = usePathname();
  const { totalUnreadCount } = useGlobalMessageNotification();
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      badge:
        totalUnreadCount > 0
          ? totalUnreadCount > 99
            ? "99+"
            : totalUnreadCount
          : undefined,
      badgeVariant: "danger",
      isActive: (pathname: string) => pathname.startsWith("/kabar"),
    },
    {
      label: "Profil",
      href: "/profil",
      icon: User,
      isActive: (pathname: string) => pathname.startsWith("/profil"),
    },
  ];

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Tutup navbar setelah navigasi ke rute baru
  useEffect(() => {
    setIsVisible(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // Jangan render navbar di halaman auth fullscreen tertentu jika diperlukan
  const hideOnPaths = ["/login", "/register"];
  const shouldHide = hideOnPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 group pointer-events-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sensor Hover & Floating Peek Tab di Bagian Bawah */}
      <div
        className={cn(
          "w-full flex flex-col items-center pointer-events-auto transition-all duration-300",
          isVisible ? "opacity-0 pointer-events-none translate-y-3" : "opacity-100 translate-y-0"
        )}
      >
        {/* Invisible Hover Sensor Strip yang melebar di bawah layar */}
        <div 
          className="w-full h-4 sm:h-5 cursor-pointer bg-transparent"
          onMouseEnter={handleMouseEnter}
          aria-hidden="true"
        />

        {/* Minimalist Peek Handle Pill */}
        <button
          type="button"
          onClick={() => setIsVisible(true)}
          onMouseEnter={handleMouseEnter}
          onFocus={handleMouseEnter}
          aria-label="Tampilkan Menu Navigasi"
          className="group/handle mb-1 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-lg hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer select-none"
        >
          {/* Indicator Bar */}
          <span className="w-8 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover/handle:bg-emerald-500 transition-colors" />
          
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/handle:text-emerald-600 dark:group-hover/handle:text-emerald-400 group-hover/handle:-translate-y-0.5 transition-all" />

          {/* Unread dot indicator on handle when collapsed */}
          {totalUnreadCount > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
            </span>
          )}
        </button>
      </div>

      {/* Main Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi Utama Mobile"
        className={cn(
          "pointer-events-auto border-t-2 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl pb-[env(safe-area-inset-bottom,0px)] transition-all duration-300 ease-out transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-2 sm:max-w-lg md:max-w-xl">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            const hasBadge = item.badge !== undefined && item.badge !== null && item.badge !== 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  // Tutup navbar setelah klik menu
                  if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                  hideTimerRef.current = setTimeout(() => {
                    setIsVisible(false);
                  }, 150);
                }}
                className={cn(
                  "group relative flex h-full flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5 transition-all outline-none",
                  active
                    ? "text-emerald-700 dark:text-emerald-400 font-extrabold"
                    : hasBadge
                    ? "text-slate-700 dark:text-slate-200 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
                )}
              >
                {/* Active Top Bar Indicator */}
                {active && (
                  <span className="absolute top-0 h-1 w-10 bg-emerald-600 dark:bg-emerald-400 rounded-full shadow-xs shadow-emerald-500/50" />
                )}

                {/* Icon Container with Radiant Badge */}
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={cn(
                      "h-5 w-5 sm:h-6 sm:w-6 transition-all",
                      active
                        ? "text-emerald-700 dark:text-emerald-400 stroke-[2.5px] scale-105"
                        : hasBadge
                        ? "text-slate-800 dark:text-slate-100 stroke-[2.2px]"
                        : "text-slate-500 dark:text-slate-400 stroke-[2px]"
                    )}
                  />

                  {/* Prominent High-Visibility Notification Badge */}
                  {hasBadge && (
                    <span className="absolute -top-1.5 -right-3 flex items-center justify-center pointer-events-none z-10">
                      {/* Animated Ping Radar Wave */}
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />

                      {/* Gradient Notification Pill */}
                      <span className="relative flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 px-1 text-[10px] font-black text-white font-mono shadow-md shadow-rose-500/40 ring-2 ring-white dark:ring-slate-900 leading-none">
                        {item.badge}
                      </span>
                    </span>
                  )}
                </div>

                {/* Label Text */}
                <span
                  className={cn(
                    "text-[11px] sm:text-xs tracking-tight transition-colors flex items-center gap-1",
                    active
                      ? "text-emerald-700 dark:text-emerald-400 font-black"
                      : hasBadge
                      ? "text-rose-600 dark:text-rose-400 font-black"
                      : "text-slate-500 dark:text-slate-400 font-semibold"
                  )}
                >
                  {item.label}
                  {hasBadge && !active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse sm:hidden" />
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default BottomNav;

