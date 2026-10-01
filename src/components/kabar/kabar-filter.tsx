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
      {/* 1. Sorting Tabs (Terbaru vs Terpopuler) - Coursera Mobile Touch Pills */}
      <div className="flex rounded-2xl bg-white p-1.5 border-2 border-slate-200 gap-2 shadow-xs">
        <button
          onClick={() => updateFilters("sort", "terbaru")}
          disabled={isPending}
          className={cn(
            "flex flex-1 min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
            currentSort === "terbaru"
              ? "bg-blue-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>TERBARU</span>
        </button>

        <button
          onClick={() => updateFilters("sort", "terpopuler")}
          disabled={isPending}
          className={cn(
            "flex flex-1 min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
            currentSort === "terpopuler"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Flame className="h-4 w-4" />
          <span>TERPOPULER</span>
        </button>
      </div>

      {/* 2. Visibility Horizontal Buttons (Min 44px height tap targets) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Semua */}
        <button
          onClick={() => updateFilters("visibility", "semua")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[44px] h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold whitespace-nowrap transition-all border-2 cursor-pointer",
            currentVisibility === "semua"
              ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          )}
        >
          <Globe className="h-4 w-4 text-blue-700" />
          <span>Semua Kabar</span>
        </button>

        {/* Publik */}
        <button
          onClick={() => updateFilters("visibility", "publik")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[44px] h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold whitespace-nowrap transition-all border-2 cursor-pointer",
            currentVisibility === "publik"
              ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          )}
        >
          <Globe className="h-4 w-4 text-emerald-600" />
          <span>Publik</span>
        </button>

        {/* Teman */}
        <button
          onClick={() => updateFilters("visibility", "teman")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[44px] h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold whitespace-nowrap transition-all border-2 cursor-pointer",
            currentVisibility === "teman"
              ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          )}
        >
          <Users className="h-4 w-4 text-blue-600" />
          <span>Teman</span>
        </button>

        {/* Komunitas */}
        <button
          onClick={() => updateFilters("visibility", "komunitas")}
          disabled={isPending}
          className={cn(
            "inline-flex min-h-[44px] h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold whitespace-nowrap transition-all border-2 cursor-pointer",
            currentVisibility === "komunitas"
              ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          )}
        >
          <Building2 className="h-4 w-4 text-amber-600" />
          <span>Komunitas</span>
        </button>
      </div>
    </div>
  );
}
