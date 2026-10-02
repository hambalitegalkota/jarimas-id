"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Clock, Flame, Globe, Users, Building2, Sparkles, Filter } from "lucide-react";
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
    <div className="space-y-3.5">
      {/* 1. Sorting Tabs (Terbaru vs Terpopuler) - Mobile Touch Pills */}
      <div className="flex rounded-2xl bg-white dark:bg-slate-900 p-1.5 border-2 border-slate-200 dark:border-slate-800 gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => updateFilters("sort", "terbaru")}
          disabled={isPending}
          className={cn(
            "flex flex-1 min-h-[46px] h-11 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-98",
            currentSort === "terbaru"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>TERBARU</span>
        </button>

        <button
          type="button"
          onClick={() => updateFilters("sort", "terpopuler")}
          disabled={isPending}
          className={cn(
            "flex flex-1 min-h-[46px] h-11 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-98",
            currentSort === "terpopuler"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Flame className="h-4 w-4 text-blue-200" />
          <span>TERPOPULER</span>
        </button>
      </div>

      {/* 2. Visibility Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Semua */}
        <button
          type="button"
          onClick={() => updateFilters("visibility", "semua")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-2 cursor-pointer shrink-0 active:scale-95",
            currentVisibility === "semua"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 shadow-2xs"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Globe className="h-4 w-4 text-emerald-600" />
          <span>Semua Kabar</span>
        </button>

        {/* Publik */}
        <button
          type="button"
          onClick={() => updateFilters("visibility", "publik")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-2 cursor-pointer shrink-0 active:scale-95",
            currentVisibility === "publik"
              ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-200 shadow-2xs"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Globe className="h-4 w-4 text-blue-600" />
          <span>Publik &amp; Kota</span>
        </button>

        {/* Komunitas */}
        <button
          type="button"
          onClick={() => updateFilters("visibility", "komunitas")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-2 cursor-pointer shrink-0 active:scale-95",
            currentVisibility === "komunitas"
              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-2xs"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Building2 className="h-4 w-4 text-indigo-600" />
          <span>Posyandu &amp; Warga</span>
        </button>

        {/* Teman */}
        <button
          type="button"
          onClick={() => updateFilters("visibility", "teman")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-2 cursor-pointer shrink-0 active:scale-95",
            currentVisibility === "teman"
              ? "bg-sky-50 dark:bg-sky-950/60 border-sky-600 text-sky-900 dark:text-sky-200 shadow-2xs"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <Users className="h-4 w-4 text-sky-600" />
          <span>Jejaring Teman</span>
        </button>
      </div>
    </div>
  );
}
