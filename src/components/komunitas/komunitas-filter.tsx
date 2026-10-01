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
  Home,
  FileText,
  ShieldCheck,
  Check,
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

  // State untuk pertanyaan Alamat Sesuai KK dan Alamat Domisili (tab Warga Kita)
  const initialKk = searchParams.get("kk") === "luar" ? "luar_kota_tegal" : "kota_tegal";
  const initialDomisili = searchParams.get("domisili") === "luar" ? "luar_kota_tegal" : "kota_tegal";

  const [kkChoice, setKkChoice] = useState<"kota_tegal" | "luar_kota_tegal">(initialKk);
  const [domisiliChoice, setDomisiliChoice] = useState<"kota_tegal" | "luar_kota_tegal">(initialDomisili);

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

  const handleKkChange = (choice: "kota_tegal" | "luar_kota_tegal") => {
    setKkChoice(choice);
    updateUrlParams((params) => {
      if (choice === "luar_kota_tegal") {
        params.set("kk", "luar");
      } else {
        params.delete("kk");
      }
    });
  };

  const handleDomisiliChange = (choice: "kota_tegal" | "luar_kota_tegal") => {
    setDomisiliChoice(choice);
    updateUrlParams((params) => {
      if (choice === "luar_kota_tegal") {
        params.set("domisili", "luar");
      } else {
        params.delete("domisili");
      }
    });
  };

  // Kalkulasi Status Warga Kita:
  // 1. KK Kota Tegal & Domisili Kota Tegal -> Penduduk
  // 2. KK Kota Tegal & Domisili Luar Kota Tegal -> Penduduk Domisili Di Luar
  // 3. KK Luar Kota Tegal & Domisili Kota Tegal -> Pendatang
  // 4. KK Luar Kota Tegal & Domisili Luar Kota Tegal -> Pengunjung
  let identifiedStatus = "Pengunjung";
  let statusBadgeColor = "bg-slate-100 text-slate-800 border-slate-300";
  let statusCardColor = "bg-slate-50 border-slate-200";
  let statusExplanation =
    "Sebagai Pengunjung, Hak Akses Anda di Profil Data dibatasi hanya untuk melihat visualisasi Grafik dan Chart.";

  if (kkChoice === "kota_tegal" && domisiliChoice === "kota_tegal") {
    identifiedStatus = "Penduduk";
    statusBadgeColor = "bg-emerald-100 text-emerald-900 border-emerald-300";
    statusCardColor = "bg-emerald-50/70 border-emerald-200";
    statusExplanation =
      "Sebagai Penduduk, Anda memiliki Hak Akses Penuh ke seluruh unsur di Profil Data (Data Anak, Data ATS, penambahan & validasi data, serta informasi operasional wilayah).";
  } else if (kkChoice === "kota_tegal" && domisiliChoice === "luar_kota_tegal") {
    identifiedStatus = "Penduduk Domisili Di Luar";
    statusBadgeColor = "bg-blue-100 text-blue-900 border-blue-300";
    statusCardColor = "bg-blue-50/70 border-blue-200";
    statusExplanation =
      "Sebagai Penduduk Domisili Di Luar, Anda memiliki Hak Akses Penuh ke seluruh unsur di Profil Data (Data Anak, Data ATS, penambahan & validasi data, serta informasi operasional wilayah).";
  } else if (kkChoice === "luar_kota_tegal" && domisiliChoice === "kota_tegal") {
    identifiedStatus = "Pendatang";
    statusBadgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    statusCardColor = "bg-amber-50/70 border-amber-200";
    statusExplanation =
      "Sebagai Pendatang, Hak Akses Anda di Profil Data dibatasi hanya untuk melihat visualisasi Grafik dan Chart statistik agregat.";
  }

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
    setKkChoice("kota_tegal");
    setDomisiliChoice("kota_tegal");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateUrlParams((params) => {
      params.delete("search");
      params.delete("kk");
      params.delete("domisili");
      params.delete("kecamatan");
      params.delete("kelurahan");
      params.delete("rw");
      params.delete("rt");
    });
  };

  const hasFilter =
    Boolean(currentSearch) ||
    (isWargaKita && (kkChoice !== "kota_tegal" || domisiliChoice !== "kota_tegal")) ||
    currentKecamatan !== "semua" ||
    currentKelurahan !== "semua" ||
    (isWargaKita && (currentRw !== "semua" || currentRt !== "semua"));

  const searchPlaceholder =
    activeTab === "posyandu"
      ? "Cari nama posyandu atau kelurahan..."
      : "Cari nama PAUD, KB, TK, PKBM, atau kelurahan...";

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
      {/* 1. Kondisional: Pertanyaan Alamat KK & Domisili untuk Warga Kita, ATAU Search Bar untuk Posyandu / PAUD */}
      {isWargaKita ? (
        <div className="space-y-4 rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-blue-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Identifikasi Status &amp; Alamat Warga
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Tentukan peran &amp; hak akses Profil Data di seluruh jenjang (Kecamatan, Kelurahan, RW, RT)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Pertanyaan 1: Alamat Sesuai KK */}
            <div className="space-y-2 rounded-xl bg-white p-4 border-2 border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-700" />
                <label className="text-sm font-bold text-slate-900">
                  Alamat Sesuai KK
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleKkChange("kota_tegal")}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer text-left",
                    kkChoice === "kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      kkChoice === "kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {kkChoice === "kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleKkChange("luar_kota_tegal")}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer text-left",
                    kkChoice === "luar_kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Luar Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      kkChoice === "luar_kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {kkChoice === "luar_kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Pertanyaan 2: Alamat Domisili */}
            <div className="space-y-2 rounded-xl bg-white p-4 border-2 border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-700" />
                <label className="text-sm font-bold text-slate-900">
                  Alamat Domisili
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDomisiliChange("kota_tegal")}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer text-left",
                    domisiliChoice === "kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      domisiliChoice === "kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {domisiliChoice === "kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDomisiliChange("luar_kota_tegal")}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer text-left",
                    domisiliChoice === "luar_kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Luar Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      domisiliChoice === "luar_kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {domisiliChoice === "luar_kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Kotak Hasil Identifikasi Status Real-time */}
          <div className={cn("rounded-xl border-2 p-4 space-y-1.5", statusCardColor)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status Teridentifikasi:
                </span>
                <span className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase border", statusBadgeColor)}>
                  {identifiedStatus}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono">
                BERLAKU DI SELURUH JENJANG (KECAMATAN, KELURAHAN, RW, RT)
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
              {statusExplanation}
            </p>
          </div>
        </div>
      ) : (
        /* 1. Search Bar untuk Posyandu & Satuan PAUD */
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="min-h-[50px] h-13 w-full rounded-2xl border-2 border-slate-300 bg-white pl-12 pr-24 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  title="Hapus kata kunci"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="flex min-h-[38px] h-10 items-center justify-center rounded-xl bg-blue-700 hover:bg-blue-800 px-4 text-sm font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. Filter Header & Reset Button */}
      <div className="flex items-center justify-between border-t-2 border-slate-100 pt-3.5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Filter className="h-4 w-4 text-blue-700" />
          <span>FILTER WILAYAH</span>
          {isPending && (
            <span className="text-xs font-semibold text-slate-500 animate-pulse">
              (memuat...)
            </span>
          )}
        </div>
        {hasFilter && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {isWargaKita && (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/70 p-3.5 text-sm font-semibold text-blue-900 flex items-center justify-between gap-2">
          <span>💡 Tip: Cukup bergabung di 1 Komunitas RT, Anda otomatis terhubung ke RW, Kelurahan, &amp; Kecamatan terkait.</span>
        </div>
      )}

      {/* 3. Dropdowns Filter Wilayah */}
      <div
        className={cn(
          "grid grid-cols-1 gap-3",
          isWargaKita
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-2"
        )}
      >
        {/* Dropdown Kecamatan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Kecamatan
          </label>
          <div className="relative">
            <select
              value={currentKecamatan}
              onChange={handleKecamatanChange}
              disabled={isPending}
              className="min-h-[48px] h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 pr-9 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer"
            >
              <option value="semua">Semua Kecamatan</option>
              {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                <option key={kec} value={kec}>
                  Kec. {kec}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Dropdown Kelurahan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
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
                "min-h-[48px] h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 pr-9 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer",
                (!currentKecamatan || currentKecamatan === "semua") &&
                  "opacity-50 cursor-not-allowed bg-slate-50"
              )}
            >
              <option value="semua">
                {currentKecamatan && currentKecamatan !== "semua"
                  ? "Semua Kelurahan"
                  : "Pilih Kecamatan Dahulu"}
              </option>
              {availableKelurahan.map((kel) => (
                <option key={kel} value={kel}>
                  Kel. {kel}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Dropdown RW & RT hanya muncul jika tab yang aktif adalah Warga Kita */}
        {isWargaKita && (
          <>
            {/* Dropdown Rukun Warga (RW) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                RW (Rukun Warga)
              </label>
              <div className="relative">
                <select
                  value={currentRw}
                  onChange={handleRwChange}
                  disabled={isPending}
                  className="min-h-[48px] h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 pr-9 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer"
                >
                  <option value="semua">Semua RW</option>
                  {DAFTAR_RW_TEGAL.map((rwNum) => (
                    <option key={rwNum} value={rwNum}>
                      RW {rwNum}
                    </option>
                  ))}
                </select>
                <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Dropdown Rukun Tetangga (RT) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                RT (Rukun Tetangga)
              </label>
              <div className="relative">
                <select
                  value={currentRt}
                  onChange={handleRtChange}
                  disabled={isPending}
                  className="min-h-[48px] h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 pr-9 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer"
                >
                  <option value="semua">Semua RT</option>
                  {DAFTAR_RT_TEGAL.map((rtNum) => (
                    <option key={rtNum} value={rtNum}>
                      RT {rtNum}
                    </option>
                  ))}
                </select>
                <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
