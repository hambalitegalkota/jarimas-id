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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* 1. Sorting Toggle (Terbaru vs Terpopuler) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => updateFilters("sort", "terbaru")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 text-xs font-black transition-all cursor-pointer",
              currentSort === "terbaru"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Terbaru</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("sort", "terpopuler")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 text-xs font-black transition-all cursor-pointer",
              currentSort === "terpopuler"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Flame className="h-3.5 w-3.5 text-blue-600" />
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
              "inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "semua"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            <span>Semua</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("visibility", "publik")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "publik"
                ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span>Publik</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("visibility", "komunitas")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "komunitas"
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Posyandu &amp; RT/RW</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters("visibility", "teman")}
            disabled={isPending}
            className={cn(
              "inline-flex min-h-[34px] items-center gap-1 rounded-xl px-3 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0",
              currentVisibility === "teman"
                ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-200"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Users className="h-3.5 w-3.5 text-sky-600" />
            <span>Teman</span>
          </button>
        </div>
      </div>
    </div>
  );
}
