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
      <div className={cn("inline-flex items-center gap-1 rounded-md border border-border bg-card p-1", className)}>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground transition-all hover:bg-muted cursor-pointer"
          title={`Tema Aktif: ${theme}. Klik untuk beralih mode.`}
          aria-label="Toggle tema light / dark"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4 text-sky-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-1 rounded-md border border-border bg-muted/40 p-1 font-mono text-xs",
        className
      )}
    >
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 font-medium transition-all cursor-pointer",
          theme === "light"
            ? "bg-card text-foreground font-bold border border-border shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
        )}
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span>LIGHT</span>
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 font-medium transition-all cursor-pointer",
          theme === "dark"
            ? "bg-card text-foreground font-bold border border-border shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
        )}
      >
        <Moon className="h-3.5 w-3.5 text-sky-400" />
        <span>DARK</span>
      </button>

      {/* System Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 font-medium transition-all cursor-pointer",
          theme === "system"
            ? "bg-card text-foreground font-bold border border-border shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
        )}
      >
        <Monitor className="h-3.5 w-3.5 text-blue-400" />
        <span>SYSTEM</span>
      </button>
    </div>
  );
}
