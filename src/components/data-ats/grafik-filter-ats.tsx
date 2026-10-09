"use client";

import { useMemo } from "react";
import {
  BarChart3,
  GraduationCap,
  HeartHandshake,
  Users,
  AlertCircle,
} from "lucide-react";
import { getJenjangAts, normalizeKeinginanSekolah, getNumericAgeAts } from "@/lib/ats-helpers";
import type { DataAtsItem } from "@/types/database";
import { cn } from "@/lib/utils";

const USIA_LIST_6_18 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

interface GrafikFilterAtsProps {
  filteredAts: DataAtsItem[];
  totalAllAts: number;
  activeFilters: {
    jenjang: string;
    keinginan: string;
    alasan: string;
    status: string;
    search: string;
  };
}

export function GrafikFilterAts({
  filteredAts,
  totalAllAts,
  activeFilters,
}: GrafikFilterAtsProps) {
  const totalFiltered = filteredAts.length;

  // 1. Distribusi Jenjang
  const jenjangStats = useMemo(() => {
    const counts: Record<string, number> = {
      sd: 0,
      smp: 0,
      sma: 0,
      dewasa: 0,
    };
    filteredAts.forEach((item) => {
      const jenjang = getJenjangAts(item).id;
      if (counts[jenjang] !== undefined) {
        counts[jenjang]++;
      }
    });

    return [
      {
        id: "sd",
        label: "SD / Paket A (6-12 Thn)",
        count: counts.sd,
        pct: totalFiltered > 0 ? Math.round((counts.sd / totalFiltered) * 100) : 0,
        color: "bg-emerald-500",
        textColor: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
      },
      {
        id: "smp",
        label: "SMP / Paket B (13-15 Thn)",
        count: counts.smp,
        pct: totalFiltered > 0 ? Math.round((counts.smp / totalFiltered) * 100) : 0,
        color: "bg-sky-500",
        textColor: "text-sky-400",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
      },
      {
        id: "sma",
        label: "SMA / SMK / Paket C (16-18 Thn)",
        count: counts.sma,
        pct: totalFiltered > 0 ? Math.round((counts.sma / totalFiltered) * 100) : 0,
        color: "bg-amber-500",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
      },
      {
        id: "dewasa",
        label: "19-24+ Thn (Dewasa)",
        count: counts.dewasa,
        pct: totalFiltered > 0 ? Math.round((counts.dewasa / totalFiltered) * 100) : 0,
        color: "bg-purple-500",
        textColor: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
      },
    ];
  }, [filteredAts, totalFiltered]);

  // 1.5 Distribusi Usia per Tahun (6 - 18 Tahun)
  const usiaPerTahunStats = useMemo(() => {
    const ageMap: Record<number, number> = {};
    USIA_LIST_6_18.forEach((u) => {
      ageMap[u] = 0;
    });

    filteredAts.forEach((item) => {
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
        pct: totalFiltered > 0 ? Math.round(((ageMap[u] || 0) / totalFiltered) * 100) : 0,
      })),
      maxVal,
    };
  }, [filteredAts, totalFiltered]);

  // 2. Distribusi Keinginan Sekolah
  const keinginanStats = useMemo(() => {
    const masihAda = filteredAts.filter(
      (c) => normalizeKeinginanSekolah(c.keinginan_sekolah) === "Masih Ada"
    ).length;
    const tidakAda = filteredAts.filter(
      (c) => normalizeKeinginanSekolah(c.keinginan_sekolah) === "Tidak Ada"
    ).length;

    return {
      masihAda,
      tidakAda,
      masihAdaPct: totalFiltered > 0 ? Math.round((masihAda / totalFiltered) * 100) : 0,
      tidakAdaPct: totalFiltered > 0 ? Math.round((tidakAda / totalFiltered) * 100) : 0,
    };
  }, [filteredAts, totalFiltered]);

  // 3. Distribusi Gender
  const genderStats = useMemo(() => {
    const laki = filteredAts.filter(
      (c) => c.jenis_kelamin === "L" || c.jenis_kelamin?.toLowerCase().startsWith("l")
    ).length;
    const perempuan = filteredAts.filter(
      (c) => c.jenis_kelamin === "P" || c.jenis_kelamin?.toLowerCase().startsWith("p")
    ).length;

    return {
      laki,
      perempuan,
      lakiPct: totalFiltered > 0 ? Math.round((laki / totalFiltered) * 100) : 0,
      perempuanPct: totalFiltered > 0 ? Math.round((perempuan / totalFiltered) * 100) : 0,
    };
  }, [filteredAts, totalFiltered]);

  // 4. Distribusi Status Validasi
  const statusStats = useMemo(() => {
    const approved = filteredAts.filter((c) => c.status_approval === "approved").length;
    const pending = totalFiltered - approved;

    return {
      approved,
      pending,
      approvedPct: totalFiltered > 0 ? Math.round((approved / totalFiltered) * 100) : 0,
      pendingPct: totalFiltered > 0 ? Math.round((pending / totalFiltered) * 100) : 0,
    };
  }, [filteredAts, totalFiltered]);

  // 5. Distribusi Alasan Tidak Sekolah (Urutan Terbanyak ke Tersedikit)
  const alasanStats = useMemo(() => {
    const reasonMap: Record<string, number> = {};
    filteredAts.forEach((item) => {
      const reason = (item.alasan_tidak_sekolah || "Lainnya").trim();
      reasonMap[reason] = (reasonMap[reason] || 0) + 1;
    });

    return Object.entries(reasonMap)
      .map(([alasan, count]) => ({
        alasan,
        count,
        pct: totalFiltered > 0 ? Math.round((count / totalFiltered) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAts, totalFiltered]);

  const hasActiveFilters =
    activeFilters.jenjang !== "semua" ||
    activeFilters.keinginan !== "semua" ||
    activeFilters.alasan !== "semua" ||
    activeFilters.status !== "semua" ||
    activeFilters.search.trim() !== "";

  if (totalFiltered === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xs p-4 sm:p-6 space-y-6 shadow-sm break-inside-avoid print:bg-white print:border-gray-300 print:text-black">
      {/* Header Grafik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold tracking-tight text-foreground font-mono uppercase">
              GRAFIK & ANALITIK HASIL FILTER
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Menampilkan statistik visual dari{" "}
            <span className="font-bold text-foreground font-mono">{totalFiltered}</span> dari total{" "}
            <span className="font-bold text-foreground font-mono">{totalAllAts}</span> anak ATS
            terdata.
          </p>
        </div>

        {/* Filter Badges info */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <span className="text-[10px] font-mono text-muted-foreground uppercase mr-1">
              Filter Aktif:
            </span>
            {activeFilters.jenjang !== "semua" && (
              <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                Jenjang: {activeFilters.jenjang.toUpperCase()}
              </span>
            )}
            {activeFilters.keinginan !== "semua" && (
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                Keinginan: {activeFilters.keinginan}
              </span>
            )}
            {activeFilters.alasan !== "semua" && (
              <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-400 border border-sky-500/30 max-w-[160px] truncate">
                {activeFilters.alasan}
              </span>
            )}
            {activeFilters.status !== "semua" && (
              <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-400 border border-purple-500/30">
                Status: {activeFilters.status}
              </span>
            )}
            {activeFilters.search.trim() !== "" && (
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono font-bold text-foreground border border-border">
                &ldquo;{activeFilters.search}&rdquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. GRAFIK BATANG USIA ATS (6 - 18 TAHUN) */}
        <div className="rounded-lg border border-border bg-background p-4 space-y-3.5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <div>
                <span className="text-xs font-mono font-bold uppercase text-foreground">
                  Diagram Batang: Usia ATS (6 – 18 Tahun)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Distribusi jumlah anak tidak sekolah pada setiap kelompok umur usia wajib belajar
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground font-bold">
              Rentang 6–18 Thn
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div className="h-40 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 pt-6 pb-2 border-b border-border bg-muted/20 rounded-lg">
              {usiaPerTahunStats.items.map((uItem) => {
                const heightPct =
                  uItem.count > 0
                    ? Math.max(12, Math.round((uItem.count / usiaPerTahunStats.maxVal) * 100))
                    : 0;

                let barColor = "bg-emerald-500";
                let textBadge = "text-emerald-400";
                if (uItem.usia >= 13 && uItem.usia <= 15) {
                  barColor = "bg-sky-500";
                  textBadge = "text-sky-400";
                } else if (uItem.usia >= 16) {
                  barColor = "bg-amber-500";
                  textBadge = "text-amber-400";
                }

                return (
                  <div
                    key={uItem.usia}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    title={`Usia ${uItem.usia} Tahun: ${uItem.count} Anak (${uItem.pct}%)`}
                  >
                    {/* Hover Floating Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-2 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                      {uItem.usia} Thn: {uItem.count} Anak ({uItem.pct}%)
                    </div>

                    {/* Count Label */}
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-black font-mono mb-1 transition-all",
                        uItem.count > 0 ? textBadge : "text-muted-foreground/40"
                      )}
                    >
                      {uItem.count}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[28px] h-24 flex items-end justify-center">
                      <div
                        className={cn(
                          "w-full rounded-t-sm transition-all duration-500 group-hover:brightness-125",
                          uItem.count > 0 ? barColor : "bg-muted h-1"
                        )}
                        style={{
                          height: uItem.count > 0 ? `${heightPct}%` : "3px",
                        }}
                      />
                    </div>

                    {/* Age X-Axis */}
                    <div className="mt-1.5 text-center">
                      <span className="text-[10px] sm:text-xs font-bold text-foreground font-mono">
                        {uItem.usia}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Jenjang Badges Sub-summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-center">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                  SD (6–12 Thn)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                  {jenjangStats.find((j) => j.id === "sd")?.count || 0} Anak
                </span>
              </div>
              <div className="p-2 rounded-md border border-sky-500/30 bg-sky-500/10 text-center">
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase block">
                  SMP (13–15 Thn)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-sky-400">
                  {jenjangStats.find((j) => j.id === "smp")?.count || 0} Anak
                </span>
              </div>
              <div className="p-2 rounded-md border border-amber-500/30 bg-amber-500/10 text-center">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                  SMA (16–18 Thn)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-400">
                  {jenjangStats.find((j) => j.id === "sma")?.count || 0} Anak
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. GRAFIK DISTRIBUSI ALASAN TIDAK SEKOLAH (URUTAN TERBANYAK KE TERSEDIAKIT) */}
        <div className="rounded-lg border border-border bg-background p-4 space-y-3.5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Diagram Batang: Alasan Menjadi ATS (Urutan Terbanyak ke Tersedikit)
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground font-bold">
              {alasanStats.length} Kategori
            </span>
          </div>

          {(() => {
            const maxReasonCount = Math.max(...alasanStats.map((r) => r.count), 1);
            return (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {alasanStats.map((item, idx) => {
                  const isTop1 = idx === 0 && item.count > 0;
                  const isTop2 = idx === 1 && item.count > 0;
                  const isTop3 = idx === 2 && item.count > 0;
                  const widthPct =
                    item.count > 0
                      ? Math.max(4, Math.round((item.count / maxReasonCount) * 100))
                      : 0;

                  return (
                    <div
                      key={item.alasan}
                      className={cn(
                        "p-2.5 rounded-lg border transition-all space-y-1.5",
                        isTop1
                          ? "bg-amber-500/10 border-amber-500/30"
                          : isTop2 || isTop3
                          ? "bg-muted/40 border-border"
                          : "bg-background border-border/60"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shrink-0",
                              isTop1
                                ? "bg-amber-500 text-white"
                                : isTop2
                                ? "bg-slate-400 text-white"
                                : isTop3
                                ? "bg-amber-700 text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            #{idx + 1}
                          </span>
                          <span className="text-foreground truncate max-w-[70%]" title={item.alasan}>
                            {item.alasan}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-foreground">{item.count} Anak</span>
                          <span className="text-[11px] text-muted-foreground w-9 text-right font-bold">
                            {item.pct}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Horizontal */}
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isTop1
                              ? "bg-amber-500"
                              : isTop2 || isTop3
                              ? "bg-rose-500"
                              : "bg-slate-400 dark:bg-slate-600"
                          )}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* 3. GRAFIK JENJANG PENDIDIKAN */}
        <div className="rounded-lg border border-border bg-background p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Distribusi Jenjang Pendidikan
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground font-bold">
              {totalFiltered} Anak
            </span>
          </div>

          <div className="space-y-3">
            {jenjangStats.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", item.color)} />
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{item.count}</span>
                    <span className="text-[11px] text-muted-foreground w-9 text-right font-bold">
                      {item.pct}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500 rounded-full", item.color)}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. GRAFIK KEINGINAN BERSEKOLAH */}
        <div className="rounded-lg border border-border bg-background p-4 space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Keinginan Melanjutkan Sekolah
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground font-bold">
              {totalFiltered} Anak
            </span>
          </div>

          {/* Dual Segment Visual Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex p-0.5 border border-border">
              {keinginanStats.masihAda > 0 && (
                <div
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                  style={{ width: `${keinginanStats.masihAdaPct}%` }}
                  title={`Masih Ada: ${keinginanStats.masihAda} anak (${keinginanStats.masihAdaPct}%)`}
                />
              )}
              {keinginanStats.tidakAda > 0 && (
                <div
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${keinginanStats.tidakAdaPct}%` }}
                  title={`Tidak Ada: ${keinginanStats.tidakAda} anak (${keinginanStats.tidakAdaPct}%)`}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>Masih Ada ({keinginanStats.masihAdaPct}%)</span>
              <span>Tidak Ada ({keinginanStats.tidakAdaPct}%)</span>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                MASIH ADA KEINGINAN
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-emerald-400">
                  {keinginanStats.masihAda}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400/80">
                  {keinginanStats.masihAdaPct}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-300/70 block">
                Prioritas Fasilitasi Kembali
              </span>
            </div>

            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-rose-400 block">
                TIDAK ADA KEINGINAN
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-rose-400">
                  {keinginanStats.tidakAda}
                </span>
                <span className="text-xs font-mono font-bold text-rose-400/80">
                  {keinginanStats.tidakAdaPct}%
                </span>
              </div>
              <span className="text-[10px] text-rose-300/70 block">
                Perlu Konseling & Edukasi
              </span>
            </div>
          </div>
        </div>

        {/* 5. GRAFIK DEMOGRAFI GENDER & VALIDASI */}
        <div className="rounded-lg border border-border bg-background p-4 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Profil Gender & Verifikasi
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground font-bold">
              Demografi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender Split */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Jenis Kelamin</span>
                <span className="text-foreground font-bold">
                  L: {genderStats.laki} | P: {genderStats.perempuan}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex p-0.5 border border-border">
                {genderStats.laki > 0 && (
                  <div
                    className="h-full bg-sky-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${genderStats.lakiPct}%` }}
                  />
                )}
                {genderStats.perempuan > 0 && (
                  <div
                    className="h-full bg-pink-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${genderStats.perempuanPct}%` }}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="text-sky-400 font-bold">Laki-laki: {genderStats.lakiPct}%</span>
                <span className="text-pink-400 font-bold">Perempuan: {genderStats.perempuanPct}%</span>
              </div>
            </div>

            {/* Verifikasi Split */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Status Validasi Lapangan</span>
                <span className="text-foreground font-bold">
                  Terverifikasi: {statusStats.approved}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex p-0.5 border border-border">
                {statusStats.approved > 0 && (
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${statusStats.approvedPct}%` }}
                  />
                )}
                {statusStats.pending > 0 && (
                  <div
                    className="h-full bg-amber-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${statusStats.pendingPct}%` }}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="text-emerald-400 font-bold">Terverifikasi: {statusStats.approvedPct}%</span>
                <span className="text-amber-400 font-bold">Menunggu Validasi: {statusStats.pendingPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
