"use client";

import { useMemo } from "react";
import {
  BarChart3,
  GraduationCap,
  HeartHandshake,
  Users,
  AlertCircle,
} from "lucide-react";
import {
  getJenjangAts,
  normalizeKeinginanSekolah,
  getNumericAgeAts,
  type JenjangAtsId,
} from "@/lib/ats-helpers";
import type { DataAtsItem } from "@/types/database";
import { cn } from "@/lib/utils";

const USIA_LIST_6_18 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

interface GrafikFilterAtsProps {
  filteredAts: DataAtsItem[];
  allAts?: DataAtsItem[];
  totalAllAts: number;
  activeFilters: {
    jenjang: string;
    keinginan: string;
    alasan: string;
    status: string;
    search: string;
    age?: number | null;
    gender?: string;
  };
  onSelectJenjang?: (jenjang: JenjangAtsId) => void;
  onSelectAge?: (age: number | null) => void;
  onSelectKeinginan?: (keinginan: "semua" | "Masih Ada" | "Tidak Ada") => void;
  onSelectAlasan?: (alasan: string) => void;
  onSelectGender?: (gender: "semua" | "L" | "P") => void;
  onSelectStatus?: (status: "semua" | "approved" | "pending") => void;
  onResetFilters?: () => void;
}

export function GrafikFilterAts({
  filteredAts,
  allAts,
  totalAllAts,
  activeFilters,
  onSelectJenjang,
  onSelectAge,
  onSelectKeinginan,
  onSelectAlasan,
  onSelectGender,
  onSelectStatus,
  onResetFilters,
}: GrafikFilterAtsProps) {
  const totalFiltered = filteredAts.length;
  const baseList = allAts || filteredAts;

  // 1. Distribusi Jenjang
  const jenjangStats = useMemo(() => {
    const counts: Record<string, number> = {
      sd: 0,
      smp: 0,
      sma: 0,
      dewasa: 0,
    };
    baseList.forEach((item) => {
      const jenjang = getJenjangAts(item).id;
      if (counts[jenjang] !== undefined) {
        counts[jenjang]++;
      }
    });

    return [
      {
        id: "sd" as JenjangAtsId,
        label: "SD / Paket A (6-12 Thn)",
        count: counts.sd,
        pct: baseList.length > 0 ? Math.round((counts.sd / baseList.length) * 100) : 0,
        color: "bg-emerald-500",
        textColor: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
      },
      {
        id: "smp" as JenjangAtsId,
        label: "SMP / Paket B (13-15 Thn)",
        count: counts.smp,
        pct: baseList.length > 0 ? Math.round((counts.smp / baseList.length) * 100) : 0,
        color: "bg-sky-500",
        textColor: "text-sky-400",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
      },
      {
        id: "sma" as JenjangAtsId,
        label: "SMA / SMK / Paket C (16-18 Thn)",
        count: counts.sma,
        pct: baseList.length > 0 ? Math.round((counts.sma / baseList.length) * 100) : 0,
        color: "bg-amber-500",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
      },
      {
        id: "dewasa" as JenjangAtsId,
        label: "19-24+ Thn (Dewasa)",
        count: counts.dewasa,
        pct: baseList.length > 0 ? Math.round((counts.dewasa / baseList.length) * 100) : 0,
        color: "bg-purple-500",
        textColor: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
      },
    ];
  }, [baseList]);

  // 1.5 Distribusi Usia per Tahun (6 - 18 Tahun)
  const usiaPerTahunStats = useMemo(() => {
    const ageMap: Record<number, number> = {};
    USIA_LIST_6_18.forEach((u) => {
      ageMap[u] = 0;
    });

    baseList.forEach((item) => {
      const age = getNumericAgeAts(item);
      if (ageMap[age] !== undefined) {
        ageMap[age]++;
      }
    });

    const maxVal = Math.max(...Object.values(ageMap), 1);

    return {
      items: USIA_LIST_6_18.map((u) => ({
        usia: u,
        count: ageMap[u] || 0,
        pct: baseList.length > 0 ? Math.round(((ageMap[u] || 0) / baseList.length) * 100) : 0,
      })),
      maxVal,
    };
  }, [baseList]);

  // 2. Distribusi Keinginan Sekolah
  const keinginanStats = useMemo(() => {
    const masihAda = baseList.filter(
      (c) => normalizeKeinginanSekolah(c.keinginan_sekolah) === "Masih Ada"
    ).length;
    const tidakAda = baseList.filter(
      (c) => normalizeKeinginanSekolah(c.keinginan_sekolah) === "Tidak Ada"
    ).length;

    return {
      masihAda,
      tidakAda,
      masihAdaPct: baseList.length > 0 ? Math.round((masihAda / baseList.length) * 100) : 0,
      tidakAdaPct: baseList.length > 0 ? Math.round((tidakAda / baseList.length) * 100) : 0,
    };
  }, [baseList]);

  // 3. Distribusi Gender
  const genderStats = useMemo(() => {
    const laki = baseList.filter(
      (c) => c.jenis_kelamin === "L" || c.jenis_kelamin?.toLowerCase().startsWith("l")
    ).length;
    const perempuan = baseList.filter(
      (c) => c.jenis_kelamin === "P" || c.jenis_kelamin?.toLowerCase().startsWith("p")
    ).length;

    return {
      laki,
      perempuan,
      lakiPct: baseList.length > 0 ? Math.round((laki / baseList.length) * 100) : 0,
      perempuanPct: baseList.length > 0 ? Math.round((perempuan / baseList.length) * 100) : 0,
    };
  }, [baseList]);

  // 4. Distribusi Status Validasi
  const statusStats = useMemo(() => {
    const approved = baseList.filter((c) => c.status_approval === "approved").length;
    const pending = baseList.length - approved;

    return {
      approved,
      pending,
      approvedPct: baseList.length > 0 ? Math.round((approved / baseList.length) * 100) : 0,
      pendingPct: baseList.length > 0 ? Math.round((pending / baseList.length) * 100) : 0,
    };
  }, [baseList]);

  // 5. Distribusi Alasan Tidak Sekolah (Urutan Terbanyak ke Tersedikit)
  const alasanStats = useMemo(() => {
    const reasonMap: Record<string, number> = {};
    baseList.forEach((item) => {
      const reason = (item.alasan_tidak_sekolah || "Lainnya").trim();
      reasonMap[reason] = (reasonMap[reason] || 0) + 1;
    });

    return Object.entries(reasonMap)
      .map(([alasan, count]) => ({
        alasan,
        count,
        pct: baseList.length > 0 ? Math.round((count / baseList.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [baseList]);

  const hasActiveFilters =
    activeFilters.jenjang !== "semua" ||
    activeFilters.keinginan !== "semua" ||
    activeFilters.alasan !== "semua" ||
    activeFilters.status !== "semua" ||
    (activeFilters.age !== null && activeFilters.age !== undefined) ||
    (activeFilters.gender !== undefined && activeFilters.gender !== "semua") ||
    activeFilters.search.trim() !== "";

  if (totalAllAts === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-6 shadow-xs break-inside-avoid print:bg-white print:border-gray-300 print:text-black">
      {/* Header Grafik & Petunjuk Interaktif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                GRAFIK &amp; ANALITIK HASIL FILTER
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sentuh/klik bagian diagram untuk menyaring dan melihat daftar nama anak secara otomatis
              </p>
            </div>
          </div>
        </div>

        {/* Filter Badges & Reset Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {hasActiveFilters ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeFilters.age !== null && activeFilters.age !== undefined && (
                  <button
                    type="button"
                    onClick={() => onSelectAge?.(null)}
                    className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-2xs font-mono font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Usia: {activeFilters.age} Thn</span>
                    <span className="text-indigo-500 font-black">×</span>
                  </button>
                )}
                {activeFilters.jenjang !== "semua" && (
                  <button
                    type="button"
                    onClick={() => onSelectJenjang?.("semua")}
                    className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-2xs font-mono font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Jenjang: {activeFilters.jenjang.toUpperCase()}</span>
                    <span className="text-emerald-500 font-black">×</span>
                  </button>
                )}
                {activeFilters.alasan !== "semua" && (
                  <button
                    type="button"
                    onClick={() => onSelectAlasan?.("semua")}
                    className="rounded-lg bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-2xs font-mono font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors flex items-center gap-1 max-w-[180px] truncate cursor-pointer"
                  >
                    <span className="truncate">{activeFilters.alasan}</span>
                    <span className="text-rose-500 font-black">×</span>
                  </button>
                )}
                {activeFilters.keinginan !== "semua" && (
                  <button
                    type="button"
                    onClick={() => onSelectKeinginan?.("semua")}
                    className="rounded-lg bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 text-2xs font-mono font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Keinginan: {activeFilters.keinginan}</span>
                    <span className="text-sky-500 font-black">×</span>
                  </button>
                )}
                {activeFilters.gender && activeFilters.gender !== "semua" && (
                  <button
                    type="button"
                    onClick={() => onSelectGender?.("semua")}
                    className="rounded-lg bg-pink-50 dark:bg-pink-950/60 px-2.5 py-1 text-2xs font-mono font-bold text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Gender: {activeFilters.gender === "L" ? "Laki-laki" : "Perempuan"}</span>
                    <span className="text-pink-500 font-black">×</span>
                  </button>
                )}
                {activeFilters.status !== "semua" && (
                  <button
                    type="button"
                    onClick={() => onSelectStatus?.("semua")}
                    className="rounded-lg bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 text-2xs font-mono font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Status: {activeFilters.status === "approved" ? "Terverifikasi" : "Menunggu"}</span>
                    <span className="text-purple-500 font-black">×</span>
                  </button>
                )}
              </div>

              {onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-2xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </>
          ) : (
            <span className="text-2xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Total {totalAllAts} Anak
            </span>
          )}
        </div>
      </div>

      {/* Grid Grafik Interaktif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. GRAFIK BATANG USIA ATS (6 - 18 TAHUN) */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3.5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <span className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-100">
                  Diagram Batang: Usia ATS (6 – 18 Tahun)
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Klik kolom umur untuk memfilter daftar nama anak usia tersebut
                </p>
              </div>
            </div>
            {activeFilters.age ? (
              <button
                type="button"
                onClick={() => onSelectAge?.(null)}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700"
              >
                Usia {activeFilters.age} Thn Aktif ✕
              </button>
            ) : (
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                Rentang 6–18 Thn
              </span>
            )}
          </div>

          <div className="space-y-4 pt-1">
            <div className="h-44 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl shadow-2xs">
              {usiaPerTahunStats.items.map((uItem) => {
                const heightPct =
                  uItem.count > 0
                    ? Math.max(12, Math.round((uItem.count / usiaPerTahunStats.maxVal) * 100))
                    : 0;

                const isSelected = activeFilters.age === uItem.usia;

                let barColor = "bg-emerald-500";
                let textBadge = "text-emerald-700 dark:text-emerald-400";
                if (uItem.usia >= 13 && uItem.usia <= 15) {
                  barColor = "bg-sky-500";
                  textBadge = "text-sky-700 dark:text-sky-400";
                } else if (uItem.usia >= 16) {
                  barColor = "bg-amber-500";
                  textBadge = "text-amber-700 dark:text-amber-400";
                }

                return (
                  <button
                    key={uItem.usia}
                    type="button"
                    onClick={() => onSelectAge?.(isSelected ? null : uItem.usia)}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer transition-all rounded-lg p-0.5",
                      isSelected
                        ? "bg-indigo-100/70 dark:bg-indigo-950/80 ring-2 ring-indigo-500 shadow-xs"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                    title={`Usia ${uItem.usia} Tahun: ${uItem.count} Anak (${uItem.pct}%) - Klik untuk filter`}
                  >
                    {/* Hover Floating Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-2 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                      {uItem.usia} Thn: {uItem.count} Anak ({uItem.pct}%)
                    </div>

                    {/* Count Label */}
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-black font-mono mb-1 transition-all",
                        isSelected
                          ? "text-indigo-700 dark:text-indigo-300 font-black scale-110"
                          : uItem.count > 0
                          ? textBadge
                          : "text-slate-300 dark:text-slate-600"
                      )}
                    >
                      {uItem.count}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[28px] h-28 flex items-end justify-center">
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all duration-500 group-hover:brightness-110",
                          isSelected
                            ? "bg-indigo-600 ring-2 ring-indigo-400"
                            : uItem.count > 0
                            ? barColor
                            : "bg-slate-200 dark:bg-slate-800 h-1"
                        )}
                        style={{
                          height: uItem.count > 0 ? `${heightPct}%` : "3px",
                        }}
                      />
                    </div>

                    {/* Age X-Axis */}
                    <div className="mt-1.5 text-center">
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-black font-mono block",
                          isSelected
                            ? "text-indigo-700 dark:text-indigo-300 underline"
                            : "text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {uItem.usia}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Jenjang Badges Sub-summary (Clickable buttons to filter by Jenjang) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSelectJenjang?.(activeFilters.jenjang === "sd" ? "semua" : "sd")}
                className={cn(
                  "p-2.5 rounded-xl border-2 transition-all text-center cursor-pointer",
                  activeFilters.jenjang === "sd"
                    ? "bg-emerald-100 border-emerald-600 shadow-xs ring-2 ring-emerald-600/30"
                    : "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50"
                )}
              >
                <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                  SD (6–12 Thn)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {jenjangStats.find((j) => j.id === "sd")?.count || 0} Anak
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectJenjang?.(activeFilters.jenjang === "smp" ? "semua" : "smp")}
                className={cn(
                  "p-2.5 rounded-xl border-2 transition-all text-center cursor-pointer",
                  activeFilters.jenjang === "smp"
                    ? "bg-sky-100 border-sky-600 shadow-xs ring-2 ring-sky-600/30"
                    : "bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-800/60 hover:bg-sky-50"
                )}
              >
                <span className="text-[10px] font-mono font-bold text-sky-800 dark:text-sky-300 uppercase block">
                  SMP (13–15 Thn)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-sky-700 dark:text-sky-400">
                  {jenjangStats.find((j) => j.id === "smp")?.count || 0} Anak
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectJenjang?.(activeFilters.jenjang === "sma" ? "semua" : "sma")}
                className={cn(
                  "p-2.5 rounded-xl border-2 transition-all text-center cursor-pointer",
                  activeFilters.jenjang === "sma"
                    ? "bg-amber-100 border-amber-600 shadow-xs ring-2 ring-amber-600/30"
                    : "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60 hover:bg-amber-50"
                )}
              >
                <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 uppercase block">
                  SMA (16–18 Thn)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-700 dark:text-amber-400">
                  {jenjangStats.find((j) => j.id === "sma")?.count || 0} Anak
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. GRAFIK DISTRIBUSI ALASAN TIDAK SEKOLAH (URUTAN TERBANYAK KE TERSEDIAKIT) */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3.5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <div>
                <span className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-100">
                  Diagram Batang: Alasan Menjadi ATS (Urutan Terbanyak ke Tersedikit)
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Sentuh baris alasan untuk langsung menyaring daftar nama anak
                </p>
              </div>
            </div>
            {activeFilters.alasan !== "semua" ? (
              <button
                type="button"
                onClick={() => onSelectAlasan?.("semua")}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white cursor-pointer hover:bg-rose-700"
              >
                Filter Aktif ✕
              </button>
            ) : (
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                {alasanStats.length} Kategori
              </span>
            )}
          </div>

          {(() => {
            const maxReasonCount = Math.max(...alasanStats.map((r) => r.count), 1);
            return (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {alasanStats.map((item, idx) => {
                  const isSelected =
                    activeFilters.alasan.toLowerCase() === item.alasan.toLowerCase();
                  const isTop1 = idx === 0 && item.count > 0;
                  const isTop2 = idx === 1 && item.count > 0;
                  const isTop3 = idx === 2 && item.count > 0;
                  const widthPct =
                    item.count > 0
                      ? Math.max(4, Math.round((item.count / maxReasonCount) * 100))
                      : 0;

                  return (
                    <button
                      key={item.alasan}
                      type="button"
                      onClick={() => onSelectAlasan?.(isSelected ? "semua" : item.alasan)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border-2 transition-all space-y-1.5 cursor-pointer block group",
                        isSelected
                          ? "bg-rose-100/90 dark:bg-rose-950/80 border-rose-600 shadow-xs ring-2 ring-rose-600/30"
                          : isTop1
                          ? "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700 hover:bg-amber-50/50"
                          : isTop2 || isTop3
                          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                          : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shrink-0",
                              isSelected
                                ? "bg-rose-600 text-white"
                                : isTop1
                                ? "bg-amber-500 text-white"
                                : isTop2
                                ? "bg-slate-400 text-white"
                                : isTop3
                                ? "bg-amber-700 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            #{idx + 1}
                          </span>
                          <span
                            className={cn(
                              "font-bold truncate max-w-[70%]",
                              isSelected
                                ? "text-rose-950 dark:text-rose-100 font-black"
                                : "text-slate-800 dark:text-slate-200"
                            )}
                            title={item.alasan}
                          >
                            {item.alasan}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "font-bold font-mono",
                              isSelected ? "text-rose-700 font-black" : "text-slate-900 dark:text-slate-100"
                            )}
                          >
                            {item.count} Anak
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono w-9 text-right font-bold">
                            {item.pct}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Horizontal */}
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isSelected
                              ? "bg-rose-600"
                              : isTop1
                              ? "bg-amber-500"
                              : isTop2 || isTop3
                              ? "bg-rose-500"
                              : "bg-slate-400 dark:bg-slate-600"
                          )}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* 3. GRAFIK JENJANG PENDIDIKAN */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-100">
                Distribusi Jenjang Pendidikan
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              {baseList.length} Anak
            </span>
          </div>

          <div className="space-y-2.5">
            {jenjangStats.map((item) => {
              const isSelected = activeFilters.jenjang === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectJenjang?.(isSelected ? "semua" : item.id)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl border-2 transition-all space-y-1.5 cursor-pointer block",
                    isSelected
                      ? "bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-600 shadow-xs ring-2 ring-emerald-600/30"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                      <span className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.count}</span>
                      <span className="text-[11px] text-slate-500 w-9 text-right font-bold">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-500 rounded-full", item.color)}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. GRAFIK KEINGINAN BERSEKOLAH */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-100">
                Keinginan Melanjutkan Sekolah
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              {baseList.length} Anak
            </span>
          </div>

          {/* Dual Segment Visual Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex p-0.5 border border-slate-300 dark:border-slate-600">
              {keinginanStats.masihAda > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onSelectKeinginan?.(activeFilters.keinginan === "Masih Ada" ? "semua" : "Masih Ada")
                  }
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500 cursor-pointer hover:brightness-110"
                  style={{ width: `${keinginanStats.masihAdaPct}%` }}
                  title={`Masih Ada: ${keinginanStats.masihAda} anak (${keinginanStats.masihAdaPct}%)`}
                />
              )}
              {keinginanStats.tidakAda > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onSelectKeinginan?.(activeFilters.keinginan === "Tidak Ada" ? "semua" : "Tidak Ada")
                  }
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-500 cursor-pointer hover:brightness-110"
                  style={{ width: `${keinginanStats.tidakAdaPct}%` }}
                  title={`Tidak Ada: ${keinginanStats.tidakAda} anak (${keinginanStats.tidakAdaPct}%)`}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
              <span>Masih Ada ({keinginanStats.masihAdaPct}%)</span>
              <span>Tidak Ada ({keinginanStats.tidakAdaPct}%)</span>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() =>
                onSelectKeinginan?.(activeFilters.keinginan === "Masih Ada" ? "semua" : "Masih Ada")
              }
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all cursor-pointer",
                activeFilters.keinginan === "Masih Ada"
                  ? "bg-emerald-100 border-emerald-600 shadow-xs ring-2 ring-emerald-600/30"
                  : "bg-emerald-50/70 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/50"
              )}
            >
              <span className="text-[10px] font-mono font-black uppercase text-emerald-800 dark:text-emerald-300 block">
                MASIH ADA KEINGINAN
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {keinginanStats.masihAda}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {keinginanStats.masihAdaPct}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                Prioritas Fasilitasi
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectKeinginan?.(activeFilters.keinginan === "Tidak Ada" ? "semua" : "Tidak Ada")
              }
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all cursor-pointer",
                activeFilters.keinginan === "Tidak Ada"
                  ? "bg-rose-100 border-rose-600 shadow-xs ring-2 ring-rose-600/30"
                  : "bg-rose-50/70 border-rose-200 dark:border-rose-800 hover:bg-rose-100/50"
              )}
            >
              <span className="text-[10px] font-mono font-black uppercase text-rose-800 dark:text-rose-300 block">
                TIDAK ADA KEINGINAN
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black font-mono text-rose-700 dark:text-rose-400">
                  {keinginanStats.tidakAda}
                </span>
                <span className="text-xs font-mono font-bold text-rose-700">
                  {keinginanStats.tidakAdaPct}%
                </span>
              </div>
              <span className="text-[10px] text-rose-700 font-medium block mt-0.5">
                Perlu Konseling
              </span>
            </button>
          </div>
        </div>

        {/* 5. GRAFIK DEMOGRAFI GENDER & VALIDASI */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-100">
                Profil Gender &amp; Verifikasi (Klik untuk Filter)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              Demografi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender Split */}
            <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Jenis Kelamin</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">
                  L: {genderStats.laki} | P: {genderStats.perempuan}
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-slate-200">
                {genderStats.laki > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectGender?.(activeFilters.gender === "L" ? "semua" : "L")}
                    className={cn(
                      "h-full rounded-l-full transition-all duration-500 cursor-pointer hover:brightness-110",
                      activeFilters.gender === "L" ? "bg-sky-600 ring-2 ring-sky-300" : "bg-sky-500"
                    )}
                    style={{ width: `${genderStats.lakiPct}%` }}
                    title={`Laki-laki: ${genderStats.laki} anak`}
                  />
                )}
                {genderStats.perempuan > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectGender?.(activeFilters.gender === "P" ? "semua" : "P")}
                    className={cn(
                      "h-full rounded-r-full transition-all duration-500 cursor-pointer hover:brightness-110",
                      activeFilters.gender === "P" ? "bg-pink-600 ring-2 ring-pink-300" : "bg-pink-500"
                    )}
                    style={{ width: `${genderStats.perempuanPct}%` }}
                    title={`Perempuan: ${genderStats.perempuan} anak`}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => onSelectGender?.(activeFilters.gender === "L" ? "semua" : "L")}
                  className={cn(
                    "font-bold cursor-pointer hover:underline",
                    activeFilters.gender === "L" ? "text-sky-700 underline font-black" : "text-sky-600"
                  )}
                >
                  Laki-laki: {genderStats.lakiPct}% ({genderStats.laki})
                </button>
                <button
                  type="button"
                  onClick={() => onSelectGender?.(activeFilters.gender === "P" ? "semua" : "P")}
                  className={cn(
                    "font-bold cursor-pointer hover:underline",
                    activeFilters.gender === "P" ? "text-pink-700 underline font-black" : "text-pink-600"
                  )}
                >
                  Perempuan: {genderStats.perempuanPct}% ({genderStats.perempuan})
                </button>
              </div>
            </div>

            {/* Verifikasi Split */}
            <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Status Validasi</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">
                  {statusStats.approved} Disetujui
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-slate-200">
                {statusStats.approved > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onSelectStatus?.(activeFilters.status === "approved" ? "semua" : "approved")
                    }
                    className={cn(
                      "h-full rounded-l-full transition-all duration-500 cursor-pointer hover:brightness-110",
                      activeFilters.status === "approved"
                        ? "bg-emerald-600 ring-2 ring-emerald-300"
                        : "bg-emerald-500"
                    )}
                    style={{ width: `${statusStats.approvedPct}%` }}
                    title={`Terverifikasi: ${statusStats.approved} anak`}
                  />
                )}
                {statusStats.pending > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onSelectStatus?.(activeFilters.status === "pending" ? "semua" : "pending")
                    }
                    className={cn(
                      "h-full rounded-r-full transition-all duration-500 cursor-pointer hover:brightness-110",
                      activeFilters.status === "pending"
                        ? "bg-amber-600 ring-2 ring-amber-300"
                        : "bg-amber-500"
                    )}
                    style={{ width: `${statusStats.pendingPct}%` }}
                    title={`Menunggu Validasi: ${statusStats.pending} anak`}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() =>
                    onSelectStatus?.(activeFilters.status === "approved" ? "semua" : "approved")
                  }
                  className={cn(
                    "font-bold cursor-pointer hover:underline",
                    activeFilters.status === "approved"
                      ? "text-emerald-700 underline font-black"
                      : "text-emerald-600"
                  )}
                >
                  Terverifikasi: {statusStats.approvedPct}%
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSelectStatus?.(activeFilters.status === "pending" ? "semua" : "pending")
                  }
                  className={cn(
                    "font-bold cursor-pointer hover:underline",
                    activeFilters.status === "pending"
                      ? "text-amber-700 underline font-black"
                      : "text-amber-600"
                  )}
                >
                  Menunggu: {statusStats.pendingPct}%
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
