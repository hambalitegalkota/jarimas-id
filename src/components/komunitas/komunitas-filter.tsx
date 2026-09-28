"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MapPin, Filter, RotateCcw, Search, X, Loader2 } from "lucide-react";
import {
  DAFTAR_KECAMATAN_TEGAL,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  getKelurahanByKecamatan,
} from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface KomunitasFilterProps {
  currentSearch?: string;
  currentKecamatan?: string;
  currentKelurahan?: string;
  currentRw?: string;
  currentRt?: string;
}

export function KomunitasFilter({
  currentSearch = "",
  currentKecamatan = "semua",
  currentKelurahan = "semua",
  currentRw = "semua",
  currentRt = "semua",
}: KomunitasFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if URL search param changes from outside (e.g. browser back/forward)
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const availableKelurahan =
    currentKecamatan && currentKecamatan !== "semua"
      ? getKelurahanByKecamatan(currentKecamatan)
      : [];

  const updateUrlParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset to page 1 whenever filters or search query change
    updater(params);

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateUrlParams((params) => {
        if (val.trim()) {
          params.set("search", val.trim());
        } else {
          params.delete("search");
        }
      });
    }, 450);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateUrlParams((params) => {
      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }
    });
  };

  const handleClearSearch = () => {
    setSearchValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateUrlParams((params) => {
      params.delete("search");
    });
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    updateUrlParams((params) => {
      if (val === "semua") {
        params.delete("kecamatan");
        params.delete("kelurahan");
        params.delete("rw");
        params.delete("rt");
      } else {
        params.set("kecamatan", val);
        params.delete("kelurahan");
        params.delete("rw");
        params.delete("rt");
      }
    });
  };

  const handleKelurahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    updateUrlParams((params) => {
      if (val === "semua") {
        params.delete("kelurahan");
        params.delete("rw");
        params.delete("rt");
      } else {
        params.set("kelurahan", val);
      }
    });
  };

  const handleRwChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    updateUrlParams((params) => {
      if (val === "semua") {
        params.delete("rw");
        params.delete("rt");
      } else {
        params.set("rw", val);
      }
    });
  };

  const handleRtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    updateUrlParams((params) => {
      if (val === "semua") {
        params.delete("rt");
      } else {
        params.set("rt", val);
      }
    });
  };

  const handleReset = () => {
    setSearchValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateUrlParams((params) => {
      params.delete("search");
      params.delete("kecamatan");
      params.delete("kelurahan");
      params.delete("rw");
      params.delete("rt");
    });
  };

  const hasFilter =
    Boolean(currentSearch) ||
    currentKecamatan !== "semua" ||
    currentKelurahan !== "semua" ||
    currentRw !== "semua" ||
    currentRt !== "semua";

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* 1. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Cari nama posyandu, PAUD, atau kelurahan..."
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-20 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring font-sans"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Hapus kata kunci"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex h-7 items-center justify-center rounded-md bg-foreground px-2.5 text-xs font-mono font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cari"}
            </button>
          </div>
        </div>
      </form>

      {/* 2. Filter Header & Reset Button */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-foreground">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span>FILTER WILAYAH</span>
          {isPending && (
            <span className="text-[11px] text-muted-foreground animate-pulse">
              (memuat...)
            </span>
          )}
        </div>
        {hasFilter && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            <span>[RESET]</span>
          </button>
        )}
      </div>

      {/* 3. Dropdowns Filter Wilayah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Dropdown Kecamatan */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted-foreground uppercase">
            Kecamatan
          </label>
          <div className="relative">
            <select
              value={currentKecamatan}
              onChange={handleKecamatanChange}
              disabled={isPending}
              className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring appearance-none font-mono"
            >
              <option value="semua">Semua Kecamatan</option>
              {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                <option key={kec} value={kec}>
                  Kec. {kec}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Dropdown Kelurahan */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted-foreground uppercase">
            Kelurahan
          </label>
          <div className="relative">
            <select
              value={currentKelurahan}
              onChange={handleKelurahanChange}
              disabled={
                isPending ||
                !currentKecamatan ||
                currentKecamatan === "semua" ||
                availableKelurahan.length === 0
              }
              className={cn(
                "h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring appearance-none font-mono",
                (!currentKecamatan || currentKecamatan === "semua") &&
                  "opacity-60 cursor-not-allowed"
              )}
            >
              <option value="semua">
                {currentKecamatan && currentKecamatan !== "semua"
                  ? "Semua Kelurahan"
                  : "Pilih Kecamatan"}
              </option>
              {availableKelurahan.map((kel) => (
                <option key={kel} value={kel}>
                  Kel. {kel}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Dropdown Rukun Warga (RW) */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted-foreground uppercase">
            RW (s/d 17)
          </label>
          <div className="relative">
            <select
              value={currentRw}
              onChange={handleRwChange}
              disabled={isPending}
              className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring appearance-none font-mono"
            >
              <option value="semua">Semua RW</option>
              {DAFTAR_RW_TEGAL.map((rwNum) => (
                <option key={rwNum} value={rwNum}>
                  RW {rwNum}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Dropdown Rukun Tetangga (RT) */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted-foreground uppercase">
            RT (s/d 17)
          </label>
          <div className="relative">
            <select
              value={currentRt}
              onChange={handleRtChange}
              disabled={isPending}
              className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring appearance-none font-mono"
            >
              <option value="semua">Semua RT</option>
              {DAFTAR_RT_TEGAL.map((rtNum) => (
                <option key={rtNum} value={rtNum}>
                  RT {rtNum}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
