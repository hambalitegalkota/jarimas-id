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
      <div className="flex rounded-2xl bg-muted/70 p-1 border border-border/80">
        <button
          onClick={() => updateFilters("sort", "terbaru")}
          disabled={isPending}
          className={cn(
            "flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all active:scale-95",
            currentSort === "terbaru"
              ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Terbaru</span>
        </button>

        <button
          onClick={() => updateFilters("sort", "terpopuler")}
          disabled={isPending}
          className={cn(
            "flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all active:scale-95",
            currentSort === "terpopuler"
              ? "bg-card text-accent shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Flame className="h-4 w-4 text-accent" />
          <span>Terpopuler</span>
        </button>
      </div>

      {/* 2. Visibility Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Semua */}
        <button
          onClick={() => updateFilters("visibility", "semua")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95",
            currentVisibility === "semua"
              ? "bg-primary text-white shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Semua Kabar</span>
        </button>

        {/* Publik */}
        <button
          onClick={() => updateFilters("visibility", "publik")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95",
            currentVisibility === "publik"
              ? "bg-primary text-white shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Publik</span>
        </button>

        {/* Teman */}
        <button
          onClick={() => updateFilters("visibility", "teman")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95",
            currentVisibility === "teman"
              ? "bg-primary text-white shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Hanya Teman</span>
        </button>

        {/* Komunitas */}
        <button
          onClick={() => updateFilters("visibility", "komunitas")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95",
            currentVisibility === "komunitas"
              ? "bg-primary text-white shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Komunitas Saya</span>
        </button>
      </div>
    </div>
  );
}
