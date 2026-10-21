"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
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
  DAFTAR_BENTUK_PENDIDIKAN,
  getKelurahanByKecamatan,
  getRwListByKelurahan,
  getRtListByKelurahan,
  getJumlahRwByKelurahan,
  getJumlahRtPerRwByKelurahan,
} from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface KomunitasFilterProps {
  currentTab?: string;
  currentSearch?: string;
  currentKecamatan?: string;
  currentKelurahan?: string;
  currentRw?: string;
  currentRt?: string;
  currentBentuk?: string;
}

export function KomunitasFilter({
  currentTab,
  currentSearch = "",
  currentKecamatan = "semua",
  currentKelurahan = "semua",
  currentRw = "semua",
  currentRt = "semua",
  currentBentuk = "semua",
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
    currentKecamatan && currentKecamatan !== "semua" && currentKecamatan !== "Kota Tegal"
      ? getKelurahanByKecamatan(currentKecamatan)
      : [];

  // Daftar RW dan RT dinamis sesuai kelurahan terpilih
  const availableRwList = useMemo(() => {
    return getRwListByKelurahan(currentKelurahan);
  }, [currentKelurahan]);

  const availableRtList = useMemo(() => {
    return getRtListByKelurahan(currentKelurahan, currentRw);
  }, [currentKelurahan, currentRw]);

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
        const maxRw = getJumlahRwByKelurahan(val);
        const rwNum = parseInt(currentRw, 10);
        if (!isNaN(rwNum) && rwNum > maxRw) {
          params.delete("rw");
          params.delete("rt");
        } else {
          const maxRt = getJumlahRtPerRwByKelurahan(val);
          const rtNum = parseInt(currentRt, 10);
          if (!isNaN(rtNum) && rtNum > maxRt) {
            params.delete("rt");
          }
        }
      }
    });
  };

  const handleBentukChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    updateUrlParams((params) => {
      if (val === "semua") {
        params.delete("bentuk");
      } else {
        params.set("bentuk", val);
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
        const maxRt = getJumlahRtPerRwByKelurahan(currentKelurahan);
        const rtNum = parseInt(currentRt, 10);
        if (!isNaN(rtNum) && rtNum > maxRt) {
          params.delete("rt");
        }
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
      params.delete("bentuk");
      params.delete("kecamatan");
      params.delete("kelurahan");
      params.delete("rw");
      params.delete("rt");
    });
  };

  const isPaudTab = activeTab === "satuan_paud";
  const isPkbmTab = activeTab === "pkbm_skb";

  const hasFilter =
    Boolean(currentSearch) ||
    currentKecamatan !== "semua" ||
    currentKelurahan !== "semua" ||
    ((isPaudTab || isPkbmTab) && currentBentuk !== "semua") ||
    (isWargaKita && (currentRw !== "semua" || currentRt !== "semua"));

  const searchPlaceholder = isWargaKita
    ? "Cari nama komunitas wilayah, kelurahan, atau jalan..."
    : activeTab === "posyandu"
    ? "Cari nama posyandu atau kelurahan..."
    : isPkbmTab
    ? "Cari nama PKBM, SKB, atau kelurahan..."
    : "Cari nama PAUD, KB, TK, SPS, RA, TPA...";

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm text-card-foreground">
      {/* 1. Header Khusus Tab Warga Kita sesuai Permintaan Pengguna */}
      {isWargaKita && (
        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3.5 sm:p-4 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Selamat Datang Di Komunitas Warga Kita
              </h2>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                STRUKTUR WILAYAH KOTA TEGAL
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Saat ini terdapat <strong className="text-foreground">1 Komunitas Kota Tegal</strong>, <strong className="text-foreground">4 Komunitas Kecamatan</strong>, <strong className="text-foreground">27 Komunitas Kelurahan</strong>, <strong className="text-foreground">167 Komunitas RW</strong> dan <strong className="text-foreground">1.712 Komunitas RT</strong>.
          </p>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Komunitas mana yang akan anda kunjungi, silakan cari di sini atau gunakan filter di bawah ini.
          </p>
        </div>
      )}

      {/* 2. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="block w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-10 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* 3. Filter Dropdowns Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Filter Wilayah &amp; Kategori</span>
          </div>

          {hasFilter && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div
          className={cn(
            "grid gap-2.5 sm:gap-3",
            isWargaKita
              ? "grid-cols-2 sm:grid-cols-4"
              : isPaudTab || isPkbmTab
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {/* Filter Bentuk Satuan Pendidikan (Khusus Satuan PAUD) */}
          {isPaudTab && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                Bentuk Satuan
              </label>
              <div className="relative">
                <select
                  value={currentBentuk}
                  onChange={handleBentukChange}
                  disabled={isPending}
                  className="w-full min-h-[42px] h-10 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 cursor-pointer"
                >
                  <option value="semua">Semua Bentuk (208)</option>
                  <option value="TK">TK - Taman Kanak-Kanak (75)</option>
                  <option value="KB">KB - Kelompok Bermain (58)</option>
                  <option value="SPS">SPS - Pos PAUD / SPS (51)</option>
                  <option value="RA">RA - Raudhatul Athfal (18)</option>
                  <option value="TPA">TPA - Taman Penitipan Anak (4)</option>
                  <option value="PKBM">PKBM - Star of Tomorrow (1)</option>
                  <option value="SKB">SKB - Sanggar Kegiatan Belajar (1)</option>
                </select>
              </div>
            </div>
          )}

          {/* Filter Bentuk Lembaga Kesetaraan (Khusus PKBM & SKB) */}
          {isPkbmTab && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                Bentuk Lembaga
              </label>
              <div className="relative">
                <select
                  value={currentBentuk}
                  onChange={handleBentukChange}
                  disabled={isPending}
                  className="w-full min-h-[42px] h-10 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 cursor-pointer"
                >
                  <option value="semua">Semua Bentuk (13)</option>
                  <option value="PKBM">PKBM - Pusat Kegiatan Belajar (12)</option>
                  <option value="SKB">SKB - Sanggar Kegiatan Belajar (1)</option>
                </select>
              </div>
            </div>
          )}

          {/* Filter Kecamatan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-muted-foreground block">
              Kecamatan
            </label>
            <div className="relative">
              <select
                value={currentKecamatan}
                onChange={handleKecamatanChange}
                disabled={isPending}
                className="w-full min-h-[42px] h-10 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 cursor-pointer"
              >
                <option value="semua">Semua Kecamatan</option>
                {isWargaKita && (
                  <option value="Kota Tegal">🏙️ Tingkat Kota Tegal (Seluruh Kota)</option>
                )}
                {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                  <option key={kec} value={kec}>
                    Kecamatan {kec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Kelurahan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-muted-foreground block">
              Kelurahan
            </label>
            <div className="relative">
              <select
                value={currentKelurahan}
                onChange={handleKelurahanChange}
                disabled={isPending || currentKecamatan === "semua" || currentKecamatan === "Kota Tegal"}
                className="w-full min-h-[42px] h-10 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50 cursor-pointer"
              >
                <option value="semua">
                  {currentKecamatan === "semua"
                    ? "Pilih Kecamatan Dahulu"
                    : currentKecamatan === "Kota Tegal"
                    ? "Mencakup Seluruh Kelurahan"
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
              <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                RW
              </label>
              <div className="relative">
                <select
                  value={currentRw}
                  onChange={handleRwChange}
                  disabled={isPending || currentKecamatan === "Kota Tegal"}
                  className="w-full min-h-[42px] h-10 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 cursor-pointer"
                >
                  <option value="semua">
                    {currentKecamatan === "Kota Tegal"
                      ? "Mencakup Seluruh RW"
                      : "Semua RW"}
                  </option>
                  {availableRwList.map((rwNum) => (
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
              <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                RT
              </label>
              <div className="relative">
                <select
                  value={currentRt}
                  onChange={handleRtChange}
                  disabled={isPending || currentKecamatan === "Kota Tegal"}
                  className="w-full min-h-[42px] h-10 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60 cursor-pointer"
                >
                  <option value="semua">
                    {currentKecamatan === "Kota Tegal"
                      ? "Mencakup Seluruh RT"
                      : "Semua RT"}
                  </option>
                  {availableRtList.map((rtNum) => (
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
        <div className="flex items-center justify-center gap-2 pt-1 text-xs font-bold text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memperbarui data komunitas...</span>
        </div>
      )}
    </div>
  );
}
