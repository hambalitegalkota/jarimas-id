"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Clock, Flame, Globe, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisibilitasKabar, SortingKabar } from "@/types/database";

interface KabarFilterProps {
  currentSort?: SortingKabar;
  currentVisibility?: "semua" | VisibilitasKabar;
}

export function KabarFilter({
  currentSort = "terbaru",
  currentVisibility = "semua",
}: KabarFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "semua" || (key === "sort" && value === "terbaru")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <div className="space-y-3">
      {/* 1. Sorting Tabs (Terbaru vs Terpopuler) */}
      <div className="flex rounded-md bg-muted/40 p-1 border border-border">
        <button
          onClick={() => updateFilters("sort", "terbaru")}
          disabled={isPending}
          className={cn(
            "flex flex-1 h-8 items-center justify-center gap-1.5 rounded text-xs font-mono font-medium transition-colors",
            currentSort === "terbaru"
              ? "bg-card text-foreground border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>TERBARU</span>
        </button>

        <button
          onClick={() => updateFilters("sort", "terpopuler")}
          disabled={isPending}
          className={cn(
            "flex flex-1 h-8 items-center justify-center gap-1.5 rounded text-xs font-mono font-medium transition-colors",
            currentSort === "terpopuler"
              ? "bg-card text-foreground border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>TERPOPULER</span>
        </button>
      </div>

      {/* 2. Visibility Horizontal Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar font-mono text-xs">
        {/* Semua */}
        <button
          onClick={() => updateFilters("visibility", "semua")}
          disabled={isPending}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer",
            currentVisibility === "semua"
              ? "bg-blue-600 text-white font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Globe className="h-3 w-3" />
          <span>SEMUA</span>
        </button>

        {/* Publik */}
        <button
          onClick={() => updateFilters("visibility", "publik")}
          disabled={isPending}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer",
            currentVisibility === "publik"
              ? "bg-emerald-600 text-white font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Globe className="h-3 w-3" />
          <span>PUBLIK</span>
        </button>

        {/* Teman */}
        <button
          onClick={() => updateFilters("visibility", "teman")}
          disabled={isPending}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer",
            currentVisibility === "teman"
              ? "bg-cyan-600 text-white font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Users className="h-3 w-3" />
          <span>TEMAN</span>
        </button>

        {/* Komunitas */}
        <button
          onClick={() => updateFilters("visibility", "komunitas")}
          disabled={isPending}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs whitespace-nowrap transition-colors cursor-pointer",
            currentVisibility === "komunitas"
              ? "bg-amber-600 text-white font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Building2 className="h-3 w-3" />
          <span>KOMUNITAS</span>
        </button>
      </div>
    </div>
  );
}
