"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "segmented" | "compact";
  className?: string;
}

export function ThemeToggle({
  variant = "segmented",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-10 rounded-md border border-border bg-muted/30 animate-pulse",
          variant === "compact" ? "w-10" : "w-full",
          className
        )}
      />
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-1 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs", className)}>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title={`Tema Aktif: ${theme}. Klik untuk beralih mode.`}
          aria-label="Toggle tema light / dark"
        >
          {theme === "dark" ? (
            <Moon className="h-5 w-5 text-blue-400" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 text-xs",
        className
      )}
    >
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 py-2 font-bold transition-all cursor-pointer",
          theme === "light"
            ? "bg-white text-blue-700 font-bold border-2 border-blue-600 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/50"
        )}
      >
        <Sun className="h-4 w-4 text-amber-500" />
        <span>Terang</span>
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 py-2 font-bold transition-all cursor-pointer",
          theme === "dark"
            ? "bg-slate-800 text-blue-400 font-bold border-2 border-blue-500 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        )}
      >
        <Moon className="h-4 w-4 text-blue-400" />
        <span>Gelap</span>
      </button>

      {/* System Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={cn(
          "flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 py-2 font-bold transition-all cursor-pointer",
          theme === "system"
            ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold border-2 border-blue-600 dark:border-blue-500 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/50"
        )}
      >
        <Monitor className="h-4 w-4 text-slate-500" />
        <span>Sistem</span>
      </button>
    </div>
  );
}
