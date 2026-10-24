"use client";

import React, { useState, useMemo } from "react";
import {
  Baby,
  GraduationCap,
  HeartHandshake,
  Users,
  Building2,
  MapPin,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  Filter,
  School,
  Eye,
  EyeOff,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WilayahRekapItem,
  SchoolTypeBreakdown,
  ReasonCount,
} from "@/app/actions/rekap-data-anak";

export interface KomunitasRekapGrafikViewProps {
  scopeRekapItem: WilayahRekapItem;
  subTierItems: WilayahRekapItem[];
  subTierTitle: string;
  subTierColumnLabel: string;
  scopeType: "kota" | "kecamatan" | "kelurahan" | "rw" | "rt" | "paud" | "posyandu";
  komunitasNama: string;
}

const JENJANG_COLORS: Record<
  keyof SchoolTypeBreakdown,
  { bg: string; text: string; fill: string; border: string; label: string; shortLabel: string }
> = {
  tk: {
    bg: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
    fill: "#0284c7",
    border: "border-sky-300",
    label: "TK (Taman Kanak-Kanak)",
    shortLabel: "TK",
  },
  ra: {
    bg: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    fill: "#059669",
    border: "border-emerald-300",
    label: "RA (Raudhatul Athfal)",
    shortLabel: "RA",
  },
  kb: {
    bg: "bg-indigo-500",
    text: "text-indigo-700 dark:text-indigo-400",
    fill: "#4f46e5",
    border: "border-indigo-300",
    label: "KB (Kelompok Bermain)",
    shortLabel: "KB",
  },
  sps: {
    bg: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    fill: "#d97706",
    border: "border-amber-300",
    label: "SPS / Pos PAUD / TPQ",
    shortLabel: "SPS",
  },
  tpa: {
    bg: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-400",
    fill: "#e11d48",
    border: "border-rose-300",
    label: "TPA (Tempat Penitipan Anak)",
    shortLabel: "TPA",
  },
  skb: {
    bg: "bg-purple-500",
    text: "text-purple-700 dark:text-purple-400",
    fill: "#7e22ce",
    border: "border-purple-300",
    label: "SKB (Sanggar Kegiatan Belajar)",
    shortLabel: "SKB",
  },
  pkbm: {
    bg: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-400",
    fill: "#0d9488",
    border: "border-teal-300",
    label: "PKBM (Pendidikan Kesetaraan)",
    shortLabel: "PKBM",
  },
};

const DAFTAR_SATUAN_PAUD_KEYS: Array<{
  key: keyof SchoolTypeBreakdown;
  shortLabel: string;
  label: string;
  bg: string;
  text: string;
}> = [
  { key: "tk", shortLabel: "TK", label: "Taman Kanak-Kanak", bg: "bg-sky-500", text: "text-sky-700 dark:text-sky-300" },
  { key: "ra", shortLabel: "RA", label: "Raudhatul Athfal", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
  { key: "kb", shortLabel: "KB", label: "Kelompok Bermain", bg: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-300" },
  { key: "sps", shortLabel: "SPS", label: "Satuan PAUD Sejenis", bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  { key: "tpa", shortLabel: "TPA", label: "Tempat Penitipan Anak", bg: "bg-rose-500", text: "text-rose-700 dark:text-rose-300" },
  { key: "pkbm", shortLabel: "PKBM", label: "Pendidikan Kesetaraan", bg: "bg-teal-500", text: "text-teal-700 dark:text-teal-300" },
  { key: "skb", shortLabel: "SKB", label: "Sanggar Kegiatan Belajar", bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-300" },
];

export type RekapSortColumn =
  | "default"
  | "nama"
  | "totalAnak"
  | "totalBersekolah"
  | "totalTidakBersekolah"
  | "persenBersekolah";

export function KomunitasRekapGrafikView({
  scopeRekapItem,
  subTierItems,
  subTierTitle,
  subTierColumnLabel,
  scopeType,
  komunitasNama,
}: KomunitasRekapGrafikViewProps) {
  const [activeTabSection, setActiveTabSection] = useState<
    "semua" | "bersekolah" | "tidak_sekolah" | "tabel"
  >("semua");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<RekapSortColumn>("default");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewModeDiagramUsia, setViewModeDiagramUsia] = useState<"diagram" | "matriks">("diagram");
  const [hiddenCharts, setHiddenCharts] = useState<Record<string, boolean>>({});
  const [isAllHidden, setIsAllHidden] = useState<boolean>(false);

  const toggleChart = (chartId: string) => {
    setHiddenCharts((prev) => ({ ...prev, [chartId]: !prev[chartId] }));
  };

  const toggleAll = () => {
    const next = !isAllHidden;
    setIsAllHidden(next);
    setHiddenCharts({
      satuan_paud: next,
      diagram_usia: next,
      gender_bersekolah: next,
      alasan_bersekolah: next,
      gender_tidak_sekolah: next,
      usia_tidak_sekolah: next,
      alasan_tidak_sekolah: next,
    });
  };

  // Jenjang Breakdown
  const jenjangEntries = useMemo(() => {
    const list: Array<{ key: keyof SchoolTypeBreakdown; count: number; pct: number }> = [];
    const total = scopeRekapItem.totalBersekolah;
    for (const item of DAFTAR_SATUAN_PAUD_KEYS) {
      const count = scopeRekapItem.bersekolahJenjang[item.key] || 0;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      list.push({ key: item.key, count, pct });
    }
    return list;
  }, [scopeRekapItem.bersekolahJenjang, scopeRekapItem.totalBersekolah]);

  // Usia Bersekolah
  const maxUsiaVal = useMemo(() => {
    let m = 1;
    for (let age = 0; age <= 6; age++) {
      const bObj = scopeRekapItem.bersekolahUsiaJenjang[age];
      let sum = 0;
      if (bObj) {
        sum = Object.values(bObj).reduce((a, b) => a + b, 0);
      }
      if (sum > m) m = sum;
    }
    return m;
  }, [scopeRekapItem.bersekolahUsiaJenjang]);

  // Table Filter & Sort
  const filteredSubTierItems = useMemo(() => {
    let list = [...subTierItems];
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      list = list.filter((item) => item.nama.toLowerCase().includes(q));
    }

    if (sortColumn !== "default") {
      list.sort((a, b) => {
        let valA: any = a[sortColumn as keyof WilayahRekapItem];
        let valB: any = b[sortColumn as keyof WilayahRekapItem];

        if (typeof valA === "string") {
          const comp = valA.localeCompare(valB as string);
          return sortDirection === "asc" ? comp : -comp;
        }

        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      });
    }

    return list;
  }, [subTierItems, tableSearch, sortColumn, sortDirection]);

  const handleSort = (column: RekapSortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. KEY SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Anak Usia Dini */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-2 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
              TOTAL ANAK (0–6 THN)
            </span>
            <div className="h-8 w-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <Baby className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {scopeRekapItem.totalAnak.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-muted-foreground">Jiwa</span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-muted-foreground border-t border-border pt-2">
            <span>
              Laki-laki:{" "}
              {scopeRekapItem.bersekolahGender.lakiLaki +
                scopeRekapItem.tidakBersekolahGender.lakiLaki}
            </span>
            <span>
              Perempuan:{" "}
              {scopeRekapItem.bersekolahGender.perempuan +
                scopeRekapItem.tidakBersekolahGender.perempuan}
            </span>
          </div>
        </div>

        {/* Card 2: Anak Bersekolah */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-primary uppercase tracking-wider">
              BERSEKOLAH (PAUD)
            </span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-primary">
              {scopeRekapItem.totalBersekolah.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-primary/80">
              ({scopeRekapItem.persenBersekolah}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-primary/80 border-t border-primary/15 pt-2">
            <span>L: {scopeRekapItem.bersekolahGender.lakiLaki}</span>
            <span>P: {scopeRekapItem.bersekolahGender.perempuan}</span>
            <span>TK/RA/KB/SPS</span>
          </div>
        </div>

        {/* Card 3: Belum / Tidak Bersekolah */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-2 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
              BELUM BERSEKOLAH
            </span>
            <div className="h-8 w-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {scopeRekapItem.totalTidakBersekolah.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              ({scopeRekapItem.persenTidakBersekolah}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-muted-foreground border-t border-border pt-2">
            <span>L: {scopeRekapItem.tidakBersekolahGender.lakiLaki}</span>
            <span>P: {scopeRekapItem.tidakBersekolahGender.perempuan}</span>
            <span>Balita Terdata</span>
          </div>
        </div>

        {/* Card 4: Cakupan / Partisipasi */}
        <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4 sm:p-5 space-y-2 shadow-sm hover:border-secondary/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-secondary-foreground uppercase tracking-wider">
              CAKUPAN PAUD WILAYAH
            </span>
            <div className="h-8 w-8 rounded-lg bg-secondary/15 text-secondary-foreground flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-secondary-foreground">
              {scopeRekapItem.persenBersekolah}%
            </span>
            <span className="text-xs font-bold text-muted-foreground">Cakupan</span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-muted-foreground border-t border-secondary/20 pt-2">
            <span>Target Wilayah: &gt;75%</span>
            <span
              className={cn(
                "font-extrabold",
                scopeRekapItem.totalAnak === 0
                  ? "text-muted-foreground"
                  : scopeRekapItem.persenBersekolah >= 75
                  ? "text-primary"
                  : "text-secondary-foreground"
              )}
            >
              {scopeRekapItem.totalAnak === 0
                ? "Belum Ada Data"
                : scopeRekapItem.persenBersekolah >= 75
                ? "Optimal"
                : "Perlu Peningkatan"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION SUBTABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-muted/60 p-1.5 rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setActiveTabSection("semua")}
          className={cn(
            "px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "semua"
              ? "bg-card text-foreground border-border shadow-xs font-black"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          📊 Ringkasan Visual Lengkap
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("bersekolah")}
          className={cn(
            "px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "bersekolah"
              ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          🎓 Anak Bersekolah ({scopeRekapItem.totalBersekolah})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("tidak_sekolah")}
          className={cn(
            "px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "tidak_sekolah"
              ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          🏠 Belum Bersekolah ({scopeRekapItem.totalTidakBersekolah})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("tabel")}
          className={cn(
            "px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "tabel"
              ? "bg-card text-foreground border-border shadow-xs font-black"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          📑 Tabel Rekapitulasi Menyesuaikan Jenjang ({subTierItems.length})
        </button>
      </div>

      {/* 3. SECTION: GRAFIK ANAK BERSEKOLAH */}
      {(activeTabSection === "semua" || activeTabSection === "bersekolah") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <School className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Statistik &amp; Grafik Anak Bersekolah PAUD
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Sebaran jenjang satuan pendidikan (TK, RA, KB, SPS, TPA, SKB, PKBM), kelompok umur, dan alasan bersekolah di {komunitasNama}.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 3.1 Grafik Distribusi Jenjang PAUD */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <PieChartIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold text-foreground truncate">
                      Distribusi Satuan Pendidikan Usia Dini
                    </h4>
                    <p className="text-2xs sm:text-xs text-muted-foreground font-medium truncate">
                      TK, RA, KB, SPS, TPA, SKB, &amp; PKBM
                    </p>
                  </div>
                </div>
                <span className="text-2xs sm:text-xs font-black px-2.5 py-1 rounded-md bg-secondary/10 text-secondary-foreground border border-secondary/30 font-mono">
                  7 Satuan
                </span>
              </div>

              {/* Jenjang Bars Breakdown */}
              <div className="space-y-3">
                {jenjangEntries.map((item) => {
                  const conf = JENJANG_COLORS[item.key];
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-2 text-foreground">
                          <span className={cn("inline-block h-2.5 w-2.5 rounded-full", conf.bg)} />
                          <span>{conf.label}</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-foreground font-black">
                            {item.count.toLocaleString("id-ID")}
                          </span>
                          <span className="text-2xs text-muted-foreground">({item.pct}%)</span>
                        </div>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted p-0.5">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", conf.bg)}
                          style={{ width: `${item.count > 0 ? Math.max(2, item.pct) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Jenjang Proportion Strip */}
              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-2xs font-black text-muted-foreground uppercase tracking-wider block">
                  KOMPOSISI KONTRIBUSI JENJANG
                </span>
                <div className="h-4 w-full flex rounded-md overflow-hidden shadow-xs">
                  {jenjangEntries.map((item) => {
                    const conf = JENJANG_COLORS[item.key];
                    if (item.pct <= 0) return null;
                    return (
                      <div
                        key={item.key}
                        className={cn("h-full transition-all", conf.bg)}
                        style={{ width: `${item.pct}%` }}
                        title={`${conf.label}: ${item.count} (${item.pct}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3.2 Grafik Distribusi Usia Tunggal Anak Bersekolah */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold text-foreground truncate">
                      Distribusi Usia Anak Bersekolah (0–6 Thn)
                    </h4>
                    <p className="text-2xs sm:text-xs text-muted-foreground font-medium truncate">
                      Rentang usia tunggal peserta didik PAUD
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setViewModeDiagramUsia("diagram")}
                    className={cn(
                      "px-2 py-1 rounded-md text-2xs font-extrabold transition-all cursor-pointer",
                      viewModeDiagramUsia === "diagram"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Grafik
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewModeDiagramUsia("matriks")}
                    className={cn(
                      "px-2 py-1 rounded-md text-2xs font-extrabold transition-all cursor-pointer",
                      viewModeDiagramUsia === "matriks"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Matriks
                  </button>
                </div>
              </div>

              {viewModeDiagramUsia === "diagram" ? (
                <div className="space-y-2.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((age) => {
                    const breakdown = scopeRekapItem.bersekolahUsiaJenjang[age] || {
                      tk: 0,
                      ra: 0,
                      kb: 0,
                      sps: 0,
                      tpa: 0,
                      skb: 0,
                      pkbm: 0,
                    };
                    const totalAge = Object.values(breakdown).reduce((a, b) => a + b, 0);
                    const pctOfSchool =
                      scopeRekapItem.totalBersekolah > 0
                        ? Math.round((totalAge / scopeRekapItem.totalBersekolah) * 100)
                        : 0;

                    return (
                      <div key={age} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-foreground">Usia {age} Tahun</span>
                          <span className="font-mono text-muted-foreground">
                            <strong className="text-foreground">{totalAge}</strong> anak ({pctOfSchool}%)
                          </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                          {DAFTAR_SATUAN_PAUD_KEYS.map((item) => {
                            const val = breakdown[item.key] || 0;
                            if (val <= 0) return null;
                            const barPct = totalAge > 0 ? (val / totalAge) * 100 : 0;
                            return (
                              <div
                                key={item.key}
                                className={cn("h-full", item.bg)}
                                style={{ width: `${barPct}%` }}
                                title={`${item.shortLabel}: ${val}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                        <th className="p-1.5 text-left font-bold">Usia</th>
                        {DAFTAR_SATUAN_PAUD_KEYS.map((k) => (
                          <th key={k.key} className="p-1.5 font-bold">
                            {k.shortLabel}
                          </th>
                        ))}
                        <th className="p-1.5 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3, 4, 5, 6].map((age) => {
                        const b = scopeRekapItem.bersekolahUsiaJenjang[age] || {
                          tk: 0,
                          ra: 0,
                          kb: 0,
                          sps: 0,
                          tpa: 0,
                          skb: 0,
                          pkbm: 0,
                        };
                        const tot = Object.values(b).reduce((x, y) => x + y, 0);
                        return (
                          <tr key={age} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-1.5 text-left font-semibold">Usia {age} Thn</td>
                            {DAFTAR_SATUAN_PAUD_KEYS.map((k) => (
                              <td key={k.key} className="p-1.5 font-mono">
                                {b[k.key] || "-"}
                              </td>
                            ))}
                            <td className="p-1.5 font-bold font-mono text-primary">{tot}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3.3 Distribusi Gender Anak Bersekolah */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
                <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                    Distribusi Jenis Kelamin Anak Bersekolah
                  </h4>
                  <p className="text-2xs sm:text-xs text-muted-foreground">
                    Perbandingan siswa Laki-laki dan Perempuan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-4 text-center space-y-1">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    Laki-laki
                  </span>
                  <div className="text-2xl font-black font-mono text-foreground">
                    {scopeRekapItem.bersekolahGender.lakiLaki}
                  </div>
                  <span className="text-2xs text-muted-foreground">
                    {scopeRekapItem.totalBersekolah > 0
                      ? Math.round(
                          (scopeRekapItem.bersekolahGender.lakiLaki /
                            scopeRekapItem.totalBersekolah) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center space-y-1">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    Perempuan
                  </span>
                  <div className="text-2xl font-black font-mono text-foreground">
                    {scopeRekapItem.bersekolahGender.perempuan}
                  </div>
                  <span className="text-2xs text-muted-foreground">
                    {scopeRekapItem.totalBersekolah > 0
                      ? Math.round(
                          (scopeRekapItem.bersekolahGender.perempuan /
                            scopeRekapItem.totalBersekolah) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* 3.4 Alasan Bersekolah */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                    Alasan / Motivasi Bersekolah PAUD
                  </h4>
                  <p className="text-2xs sm:text-xs text-muted-foreground">
                    Faktor pendorong orang tua mendaftarkan anak ke PAUD
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {scopeRekapItem.bersekolahAlasan.map((r) => (
                  <div key={r.alasan} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">{r.alasan}</span>
                      <span className="font-mono text-muted-foreground">
                        {r.jumlah} ({r.persentase}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${r.persentase}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION: GRAFIK ANAK BELUM BERSEKOLAH */}
      {(activeTabSection === "semua" || activeTabSection === "tidak_sekolah") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Statistik &amp; Grafik Anak Belum Bersekolah
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Rincian anak usia dini yang belum mengikuti layanan PAUD beserta analisis faktor alasannya di {komunitasNama}.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 4.1 Distribusi Usia Belum Bersekolah */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Baby className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                    Distribusi Usia Anak Belum Bersekolah
                  </h4>
                  <p className="text-2xs sm:text-xs text-muted-foreground">
                    Sebagian besar belum sekolah adalah usia balita &lt; 3 tahun
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "Usia 0–1 Tahun (Bayi/Baduta)", count: scopeRekapItem.tidakBersekolahUsia.age0_1 },
                  { label: "Usia 2 Tahun", count: scopeRekapItem.tidakBersekolahUsia.age2 },
                  { label: "Usia 3 Tahun", count: scopeRekapItem.tidakBersekolahUsia.age3 },
                  { label: "Usia 4 Tahun", count: scopeRekapItem.tidakBersekolahUsia.age4 },
                  { label: "Usia 5 Tahun", count: scopeRekapItem.tidakBersekolahUsia.age5 },
                  { label: "Usia 6 Tahun", count: scopeRekapItem.tidakBersekolahUsia.age6 },
                ].map((row) => {
                  const pct =
                    scopeRekapItem.totalTidakBersekolah > 0
                      ? Math.round((row.count / scopeRekapItem.totalTidakBersekolah) * 100)
                      : 0;
                  return (
                    <div key={row.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-foreground">{row.label}</span>
                        <span className="font-mono text-muted-foreground">
                          {row.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4.2 Alasan Belum Bersekolah */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Filter className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                    Analisis Alasan Belum Bersekolah
                  </h4>
                  <p className="text-2xs sm:text-xs text-muted-foreground">
                    Faktor penyebab anak belum mengikuti pendidikan PAUD
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {scopeRekapItem.tidakBersekolahAlasan.map((r) => (
                  <div key={r.alasan} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">{r.alasan}</span>
                      <span className="font-mono text-muted-foreground">
                        {r.jumlah} ({r.persentase}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${r.persentase}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION: TABEL REKAPITULASI YANG SUDAH MENYESUAIKAN JENJANG */}
      {(activeTabSection === "semua" || activeTabSection === "tabel") && (
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-2xs font-bold uppercase">
                  Tabel Rekapitulasi Berjenjang
                </span>
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  {subTierItems.length} Baris
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-1">
                {subTierTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                Rekapitulasi proporsi bersekolah, jenis satuan PAUD, belum sekolah, dan persentase cakupan per {subTierColumnLabel}.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder={`Cari nama ${subTierColumnLabel.toLowerCase()}...`}
                className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground font-extrabold uppercase text-[11px] tracking-wider">
                  <th className="p-3 text-center w-10">No</th>
                  <th
                    className="p-3 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("nama")}
                  >
                    <div className="flex items-center gap-1">
                      <span>{subTierColumnLabel}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3 text-right cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("totalAnak")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Anak</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3 text-right cursor-pointer hover:text-foreground text-primary"
                    onClick={() => handleSort("totalBersekolah")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Bersekolah</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-2.5 text-center text-sky-700 dark:text-sky-400">TK</th>
                  <th className="p-2.5 text-center text-emerald-700 dark:text-emerald-400">RA</th>
                  <th className="p-2.5 text-center text-indigo-700 dark:text-indigo-400">KB</th>
                  <th className="p-2.5 text-center text-amber-700 dark:text-amber-400">SPS</th>
                  <th className="p-2.5 text-center text-rose-700 dark:text-rose-400">TPA</th>
                  <th className="p-2.5 text-center text-teal-700 dark:text-teal-400">PKBM</th>
                  <th className="p-2.5 text-center text-purple-700 dark:text-purple-400">SKB</th>
                  <th
                    className="p-3 text-right cursor-pointer hover:text-foreground text-amber-900 dark:text-amber-200"
                    onClick={() => handleSort("totalTidakBersekolah")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Belum Sekolah</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3 text-right cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("persenBersekolah")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Cakupan (%)</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSubTierItems.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-muted-foreground">
                      Tidak ada data yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredSubTierItems.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 text-center font-mono text-muted-foreground font-semibold">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        {row.nama}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {row.totalAnak.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-primary">
                        {row.totalBersekolah.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2.5 text-center font-mono text-muted-foreground">
                        {row.bersekolahJenjang.tk || "-"}
                      </td>
                      <td className="p-2.5 text-center font-mono text-muted-foreground">
                        {row.bersekolahJenjang.ra || "-"}
                      </td>
                      <td className="p-2.5 text-center font-mono text-muted-foreground">
                        {row.bersekolahJenjang.kb || "-"}
                      </td>
                      <td className="p-2.5 text-center font-mono text-muted-foreground">
                        {row.bersekolahJenjang.sps || "-"}
                      </td>
                      <td className="p-2.5 text-center font-mono text-muted-foreground">
                        {row.bersekolahJenjang.tpa || "-"}
                      </td>
                      <td className="p-2.5 text-center font-mono text-muted-foreground">
                        {row.bersekolahJenjang.pkbm || "-"}
                      </td>
                      <td className="p-2.5 text-center font-mono text-muted-foreground">
                        {row.bersekolahJenjang.skb || "-"}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-900 dark:text-amber-200">
                        {row.totalTidakBersekolah.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-xs font-bold",
                            row.persenBersekolah >= 75
                              ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          )}
                        >
                          {row.persenBersekolah}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
