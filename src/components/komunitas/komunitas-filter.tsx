"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  MapPin,
  Filter,
  RotateCcw,
  Search,
  X,
  Loader2,
  Users,
  Sparkles,
} from "lucide-react";
import {
  DAFTAR_KECAMATAN_TEGAL,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  getKelurahanByKecamatan,
} from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface KomunitasFilterProps {
  currentTab?: string;
  currentSearch?: string;
  currentKecamatan?: string;
  currentKelurahan?: string;
  currentRw?: string;
  currentRt?: string;
}

export function KomunitasFilter({
  currentTab,
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

  const activeTab = currentTab || searchParams.get("tab") || "posyandu";
  const isWargaKita = activeTab === "warga_kita";

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
    (isWargaKita && (currentRw !== "semua" || currentRt !== "semua"));

  const searchPlaceholder = isWargaKita
    ? "Cari nama komunitas wilayah, kelurahan, atau jalan..."
    : activeTab === "posyandu"
    ? "Cari nama posyandu atau kelurahan..."
    : "Cari nama PAUD, KB, TK, PKBM, atau kelurahan...";

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
      {/* 1. Header Khusus Tab Warga Kita sesuai Permintaan Pengguna */}
      {isWargaKita && (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-blue-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                Selamat Datang Di Komunitas Warga Kita
              </h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                STRUKTUR WILAYAH KOTA TEGAL
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Saat ini terdapat <strong>1 Komunitas Kota Tegal</strong>, <strong>4 Komunitas Kecamatan</strong>, <strong>27 Komunitas Kelurahan</strong>, <strong>459 Komunitas RW</strong> dan <strong>7.803 Komunitas RT</strong>.
          </p>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Komunitas mana yang akan anda kunjungi, silahkan cari disini atau gunakan filter di bawah ini.
          </p>
        </div>
      )}

      {/* 2. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="block w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-200 bg-white pl-11 pr-20 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* 3. Filter Dropdowns Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Filter Wilayah</span>
          </div>

          {hasFilter && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div
          className={cn(
            "grid gap-3",
            isWargaKita ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {/* Filter Kecamatan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 block">
              Kecamatan
            </label>
            <div className="relative">
              <select
                value={currentKecamatan}
                onChange={handleKecamatanChange}
                disabled={isPending}
                className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none disabled:opacity-60 cursor-pointer"
              >
                <option value="semua">Semua Kecamatan</option>
                {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                  <option key={kec} value={kec}>
                    {kec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Kelurahan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 block">
              Kelurahan
            </label>
            <div className="relative">
              <select
                value={currentKelurahan}
                onChange={handleKelurahanChange}
                disabled={isPending || currentKecamatan === "semua"}
                className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                <option value="semua">
                  {currentKecamatan === "semua"
                    ? "Pilih Kecamatan Dahulu"
                    : "Semua Kelurahan"}
                </option>
                {availableKelurahan.map((kel) => (
                  <option key={kel} value={kel}>
                    {kel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter RW (Hanya untuk Warga Kita) */}
          {isWargaKita && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 block">
                RW
              </label>
              <div className="relative">
                <select
                  value={currentRw}
                  onChange={handleRwChange}
                  disabled={isPending}
                  className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none disabled:opacity-60 cursor-pointer"
                >
                  <option value="semua">Semua RW</option>
                  {DAFTAR_RW_TEGAL.map((rwNum) => (
                    <option key={rwNum} value={rwNum}>
                      RW {rwNum}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Filter RT (Hanya untuk Warga Kita) */}
          {isWargaKita && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 block">
                RT
              </label>
              <div className="relative">
                <select
                  value={currentRt}
                  onChange={handleRtChange}
                  disabled={isPending}
                  className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none disabled:opacity-60 cursor-pointer"
                >
                  <option value="semua">Semua RT</option>
                  {DAFTAR_RT_TEGAL.map((rtNum) => (
                    <option key={rtNum} value={rtNum}>
                      RT {rtNum}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 pt-1 text-xs font-bold text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memperbarui data komunitas...</span>
        </div>
      )}
    </div>
  );
}
