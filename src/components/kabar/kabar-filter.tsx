"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Clock, Flame, Globe, Users, Building2, Filter } from "lucide-react";
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
    <div className="space-y-2.5">
      {/* Unified Filter Bar: Sort & Visibility in one cohesive row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-1.5 sm:p-2 rounded-lg bg-card border border-border shadow-xs">
        {/* 1. Sorting Toggle (Terbaru vs Terpopuler) */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-muted shrink-0">
          <button
            type="button"
            onClick={() => updateFilters("sort", "terbaru")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all cursor-pointer",
              currentSort === "terbaru"
                ? "bg-card text-primary font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Terbaru</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("sort", "terpopuler")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all cursor-pointer",
              currentSort === "terpopuler"
                ? "bg-card text-secondary font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flame className="h-3.5 w-3.5 text-secondary" />
            <span>Terpopuler</span>
          </button>
        </div>

        {/* 2. Visibility Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <button
            type="button"
            onClick={() => updateFilters("visibility", "semua")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "semua"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>Semua</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("visibility", "publik")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "publik"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>Publik</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("visibility", "komunitas")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "komunitas"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Posyandu &amp; RT/RW</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("visibility", "teman")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "teman"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Teman</span>
          </button>
        </div>
      </div>
    </div>
  );
}
