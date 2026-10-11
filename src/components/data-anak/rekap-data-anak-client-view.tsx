"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  BookOpen,
  School,
  Activity,
  Layers,
  HelpCircle,
  AlertCircle,
  Printer,
  ChevronDown,
  BarChart2,
  Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RekapDataAnakUsiaDiniResult,
  WilayahRekapItem,
  SchoolTypeBreakdown,
  ReasonCount,
} from "@/app/actions/rekap-data-anak";
import { KartuDaftarNamaAnakRekap } from "./kartu-daftar-nama-anak-rekap";

interface RekapDataAnakClientViewProps {
  initialData: RekapDataAnakUsiaDiniResult;
  canAccessDaftarNamaAnak?: boolean;
  userPeran?: string;
}

const JENJANG_COLORS: Record<keyof SchoolTypeBreakdown, { bg: string; text: string; fill: string; border: string; label: string }> = {
  tk: { bg: "bg-sky-500", text: "text-sky-700 dark:text-sky-400", fill: "#0284c7", border: "border-sky-300", label: "TK (Taman Kanak-Kanak)" },
  ra: { bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", fill: "#059669", border: "border-emerald-300", label: "RA (Raudhatul Athfal)" },
  kb: { bg: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-400", fill: "#4f46e5", border: "border-indigo-300", label: "KB (Kelompok Bermain)" },
  sps: { bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", fill: "#d97706", border: "border-amber-300", label: "SPS / Pos PAUD / TPQ" },
  tpa: { bg: "bg-rose-500", text: "text-rose-700 dark:text-rose-400", fill: "#e11d48", border: "border-rose-300", label: "TPA (Tempat Penitipan Anak)" },
  skb: { bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-400", fill: "#7e22ce", border: "border-purple-300", label: "SKB (Sanggar Kegiatan Belajar)" },
  pkbm: { bg: "bg-teal-500", text: "text-teal-700 dark:text-teal-400", fill: "#0d9488", border: "border-teal-300", label: "PKBM (Pendidikan Kesetaraan)" },
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

const RENTANG_USIA_LIST = [
  { age: 0, label: "0 Tahun", sub: "Bayi", hint: "Rentang Usia 0–11 Bulan (TPA / Bayi)" },
  { age: 1, label: "1 Tahun", sub: "Toddler Awal", hint: "Rentang Usia 12–23 Bulan (TPA / Toddler)" },
  { age: 2, label: "2 Tahun", sub: "Toddler / KB", hint: "Rentang Usia 24–35 Bulan (TPA / KB Awal)" },
  { age: 3, label: "3 Tahun", sub: "KB Awal", hint: "Rentang Usia 36–47 Bulan (Kelompok Bermain)" },
  { age: 4, label: "4 Tahun", sub: "KB / TK A", hint: "Rentang Usia 48–59 Bulan (KB Lanjutan / TK Awal)" },
  { age: 5, label: "5 Tahun", sub: "TK B / RA", hint: "Rentang Usia 60–71 Bulan (TK B / RA)" },
  { age: 6, label: "6 Tahun", sub: "Kesiapan SD", hint: "Rentang Usia 72–83 Bulan (Kesiapan Masuk SD)" },
];

export function RekapDataAnakClientView({
  initialData,
  canAccessDaftarNamaAnak = false,
  userPeran,
}: RekapDataAnakClientViewProps) {
  // State Filter Berjenjang
  const [selectedTingkat, setSelectedTingkat] = useState<"kota" | "kecamatan" | "kelurahan">("kota");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("Tegal Timur");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Kejambon");
  const [activeTabSection, setActiveTabSection] = useState<"semua" | "bersekolah" | "tidak_sekolah" | "tabel">("semua");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [viewModeDiagramUsia, setViewModeDiagramUsia] = useState<"diagram" | "matriks">("diagram");
  const [activeHoverBar, setActiveHoverBar] = useState<{ age: number; key: keyof SchoolTypeBreakdown; val: number } | null>(null);

  // Daftar opsi kecamatan & kelurahan
  const daftarKecamatan = useMemo(() => {
    return initialData.kecamatanList.map((k) => k.nama);
  }, [initialData]);

  const daftarKelurahanInSelectedKecamatan = useMemo(() => {
    return initialData.kelurahanList.filter((k) => k.kecamatan === selectedKecamatan);
  }, [initialData, selectedKecamatan]);

  // Target Item Wilayah yang sedang aktif
  const currentWilayahData = useMemo<WilayahRekapItem>(() => {
    if (selectedTingkat === "kota") {
      return initialData.kota;
    }
    if (selectedTingkat === "kecamatan") {
      const match = initialData.kecamatanList.find((k) => k.nama === selectedKecamatan);
      return match || initialData.kecamatanList[0] || initialData.kota;
    }
    // Kelurahan
    const match = initialData.kelurahanList.find((k) => k.nama === selectedKelurahan);
    return match || initialData.kelurahanList[0] || initialData.kota;
  }, [selectedTingkat, selectedKecamatan, selectedKelurahan, initialData]);

  // Data Tabel Komparatif yang difilter
  const filteredTableRows = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    if (!q) return initialData.kelurahanList;
    return initialData.kelurahanList.filter(
      (k) =>
        k.nama.toLowerCase().includes(q) ||
        (k.kecamatan && k.kecamatan.toLowerCase().includes(q))
    );
  }, [initialData, tableSearch]);

  // SVG Donut calculation helper for Jenjang Sekolah
  const jenjangEntries = useMemo(() => {
    const j = currentWilayahData.bersekolahJenjang;
    const total = currentWilayahData.totalBersekolah || 1;
    const entries: { key: keyof SchoolTypeBreakdown; count: number; pct: number }[] = [
      { key: "tk", count: j.tk, pct: Math.round((j.tk / total) * 100) },
      { key: "ra", count: j.ra, pct: Math.round((j.ra / total) * 100) },
      { key: "kb", count: j.kb, pct: Math.round((j.kb / total) * 100) },
      { key: "sps", count: j.sps, pct: Math.round((j.sps / total) * 100) },
      { key: "tpa", count: j.tpa, pct: Math.round((j.tpa / total) * 100) },
      { key: "skb", count: j.skb, pct: Math.round((j.skb / total) * 100) },
      { key: "pkbm", count: j.pkbm, pct: Math.round((j.pkbm / total) * 100) },
    ];
    return entries;
  }, [currentWilayahData]);

  // Nilai maksimum untuk skala diagram batang tegak usia x jenjang
  const maxBarValue = useMemo(() => {
    let maxVal = 1;
    RENTANG_USIA_LIST.forEach(({ age }) => {
      DAFTAR_SATUAN_PAUD_KEYS.forEach(({ key }) => {
        const val = currentWilayahData.bersekolahUsiaJenjang?.[age]?.[key] || 0;
        if (val > maxVal) maxVal = val;
      });
    });
    return maxVal;
  }, [currentWilayahData]);

  return (
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 gap-6 sm:gap-8 max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. BREADCRUMB & TOP HERO HEADER                           */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <span>Beranda</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-slate-200 font-bold">
            Pantau Pendataan Anak Usia Dini
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-950/10 border border-slate-700/50 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-black text-emerald-300 tracking-wide uppercase">
                BERJENJANG KOTA TEGAL
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Pembaruan: {initialData.lastUpdated}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
              Rekapitulasi Hasil Pendataan Anak Usia Dini (0–6 Tahun)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pemantauan berjenjang tingkat Kota Tegal, 4 Kecamatan, dan 27 Kelurahan mencakup sebaran anak bersekolah (TK, RA, KB, SPS, TPA, SKB, PKBM), kelompok umur, jenis kelamin, serta analisis alasan bersekolah dan tidak bersekolah.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md active:scale-98 shadow-sm"
            >
              <Printer className="h-4 w-4 text-teal-300" />
              <span>Cetak Rekap</span>
            </button>
            <div className="text-2xs text-slate-400 font-medium hidden md:block">
              {initialData.totalLiveRecords} data tercatat di database
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. LEVEL SELECTOR CONTROLS (KOTA / KECAMATAN / KELURAHAN) */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Level Hierarchy Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mr-1 flex items-center gap-1 shrink-0">
              <Layers className="h-4 w-4" />
              <span>Tingkat:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedTingkat("kota")}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 border-2",
                selectedTingkat === "kota"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              )}
            >
              🏢 Kota Tegal (Agregat)
            </button>

            <button
              type="button"
              onClick={() => setSelectedTingkat("kecamatan")}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 border-2",
                selectedTingkat === "kecamatan"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              )}
            >
              🏛️ Tingkat Kecamatan
            </button>

            <button
              type="button"
              onClick={() => setSelectedTingkat("kelurahan")}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 border-2",
                selectedTingkat === "kelurahan"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              )}
            >
              🏘️ Tingkat Kelurahan
            </button>
          </div>

          {/* Sub-Filters for Kecamatan & Kelurahan */}
          <div className="flex flex-wrap items-center gap-3">
            {selectedTingkat !== "kota" && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">Kecamatan:</label>
                <select
                  value={selectedKecamatan}
                  onChange={(e) => {
                    const newKec = e.target.value;
                    setSelectedKecamatan(newKec);
                    // Sesuaikan kelurahan default
                    const firstKel = initialData.kelurahanList.find((k) => k.kecamatan === newKec);
                    if (firstKel) setSelectedKelurahan(firstKel.nama);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {daftarKecamatan.map((kec) => (
                    <option key={kec} value={kec}>
                      Kec. {kec}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedTingkat === "kelurahan" && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">Kelurahan:</label>
                <select
                  value={selectedKelurahan}
                  onChange={(e) => setSelectedKelurahan(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  {daftarKelurahanInSelectedKecamatan.map((kel) => (
                    <option key={kel.nama} value={kel.nama}>
                      Kel. {kel.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Selected Wilayah Indicator Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-500 dark:text-slate-400">Wilayah Aktif:</span>
            <strong className="text-sm font-black text-slate-900 dark:text-slate-100">
              {currentWilayahData.tingkat === "kota" && "Seluruh Wilayah Kota Tegal"}
              {currentWilayahData.tingkat === "kecamatan" && `Kecamatan ${currentWilayahData.nama}, Kota Tegal`}
              {currentWilayahData.tingkat === "kelurahan" && `Kelurahan ${currentWilayahData.nama}, Kec. ${currentWilayahData.kecamatan}, Kota Tegal`}
            </strong>
          </div>

          <div className="flex items-center gap-2 text-2xs font-bold text-slate-500">
            <span>Cakupan: 4 Kecamatan (27 Kelurahan)</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. KEY SUMMARY METRIC CARDS                               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Anak Usia Dini */}
        <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-slate-500 uppercase tracking-wider">
              TOTAL ANAK (0–6 THN)
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Baby className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
              {currentWilayahData.totalAnak.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-slate-500">Jiwa</span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>Laki-laki: {currentWilayahData.bersekolahGender.lakiLaki + currentWilayahData.tidakBersekolahGender.lakiLaki}</span>
            <span>Perempuan: {currentWilayahData.bersekolahGender.perempuan + currentWilayahData.tidakBersekolahGender.perempuan}</span>
          </div>
        </div>

        {/* Card 2: Anak Bersekolah */}
        <div className="rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-2 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              ANAK BERSEKOLAH (PAUD)
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              {currentWilayahData.totalBersekolah.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              ({currentWilayahData.persenBersekolah}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-emerald-800 dark:text-emerald-300 border-t border-emerald-100 dark:border-emerald-900/40 pt-2">
            <span>L: {currentWilayahData.bersekolahGender.lakiLaki}</span>
            <span>P: {currentWilayahData.bersekolahGender.perempuan}</span>
            <span>TK/RA/KB/SPS</span>
          </div>
        </div>

        {/* Card 3: Belum / Tidak Bersekolah */}
        <div className="rounded-3xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-5 space-y-2 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              BELUM / TIDAK BERSEKOLAH
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-700 dark:text-blue-400">
              {currentWilayahData.totalTidakBersekolah.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
              ({currentWilayahData.persenTidakBersekolah}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-blue-800 dark:text-blue-300 border-t border-blue-100 dark:border-blue-900/40 pt-2">
            <span>L: {currentWilayahData.tidakBersekolahGender.lakiLaki}</span>
            <span>P: {currentWilayahData.tidakBersekolahGender.perempuan}</span>
            <span>Didominasi Balita &lt;3 Thn</span>
          </div>
        </div>

        {/* Card 4: Angka Partisipasi PAUD */}
        <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-2 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              ANGKA PARTISIPASI PAUD
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700 dark:text-amber-400">
              {currentWilayahData.persenBersekolah}%
            </span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Cakupan</span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-amber-900 dark:text-amber-300 border-t border-amber-100 dark:border-amber-900/40 pt-2">
            <span>Target Kota: &gt;75%</span>
            <span className={cn(
              "font-extrabold",
              currentWilayahData.totalAnak === 0
                ? "text-slate-500"
                : currentWilayahData.persenBersekolah >= 75
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            )}>
              {currentWilayahData.totalAnak === 0 ? "Belum Ada Data" : currentWilayahData.persenBersekolah >= 75 ? "Optimal" : "Cukup"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. NAVIGATION SECTION TABS                                */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTabSection("semua")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
            activeTabSection === "semua"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          📊 Ringkasan Visual Lengkap
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("bersekolah")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
            activeTabSection === "bersekolah"
              ? "bg-emerald-600 text-white shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          🎓 Anak Bersekolah (TK/RA/KB/SPS/TPA/SKB/PKBM)
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("tidak_sekolah")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
            activeTabSection === "tidak_sekolah"
              ? "bg-blue-600 text-white shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          🏠 Anak Belum / Tidak Bersekolah
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("tabel")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
            activeTabSection === "tabel"
              ? "bg-slate-900 text-white dark:bg-slate-700 shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          📑 Tabel Rekapitulasi Berjenjang (27 Kelurahan)
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. SECTION: ANAK BERSEKOLAH DETAIL                        */}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "bersekolah") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <School className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Rekapitulasi Data Anak Bersekolah PAUD
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Sebaran satuan pendidikan TK, RA, KB, SPS, TPA, SKB, PKBM, jenis kelamin, kelompok umur, dan alasan bersekolah.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Total: {currentWilayahData.totalBersekolah} Anak
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 5.1 Grafik Distribusi Jenjang Institusi PAUD */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Distribusi Satuan Pendidikan Usia Dini
                  </h3>
                </div>
                <span className="text-2xs font-bold text-slate-500 uppercase">
                  TK • RA • KB • SPS • TPA • SKB • PKBM
                </span>
              </div>

              {/* Jenjang Bars Breakdown */}
              <div className="space-y-3">
                {jenjangEntries.map((item) => {
                  const conf = JENJANG_COLORS[item.key];
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span className={cn("inline-block h-2.5 w-2.5 rounded-full", conf.bg)} />
                          <span>{conf.label}</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-900 dark:text-slate-100 font-black">
                            {item.count.toLocaleString("id-ID")}
                          </span>
                          <span className="text-2xs text-slate-500">
                            ({item.pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 p-0.5">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", conf.bg)}
                          style={{ width: `${Math.max(2, item.pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Jenjang Strip Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-2xs font-black text-slate-400 uppercase tracking-wider block">
                  KOMPOSISI KONTRIBUSI JENJANG
                </span>
                <div className="h-4 w-full flex rounded-xl overflow-hidden shadow-inner">
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

            {/* 5.2 Grafik Kelompok Umur & Gender Anak Bersekolah */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Kelompok Umur &amp; Jenis Kelamin (Bersekolah)
                  </h3>
                </div>
                <span className="text-2xs font-bold text-slate-500 uppercase">
                  Rentang 0–6 Tahun
                </span>
              </div>

              {/* Gender Comparison Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    Laki-laki: {currentWilayahData.bersekolahGender.lakiLaki} Anak (
                    {Math.round((currentWilayahData.bersekolahGender.lakiLaki / (currentWilayahData.totalBersekolah || 1)) * 100)}%)
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Perempuan: {currentWilayahData.bersekolahGender.perempuan} Anak (
                    {Math.round((currentWilayahData.bersekolahGender.perempuan / (currentWilayahData.totalBersekolah || 1)) * 100)}%)
                  </span>
                </div>
                <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <div
                    className="bg-sky-500 h-full transition-all"
                    style={{
                      width: `${Math.round((currentWilayahData.bersekolahGender.lakiLaki / (currentWilayahData.totalBersekolah || 1)) * 100)}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{
                      width: `${Math.round((currentWilayahData.bersekolahGender.perempuan / (currentWilayahData.totalBersekolah || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Age Histogram Breakdown */}
              <div className="space-y-2.5">
                <span className="text-2xs font-black text-slate-400 uppercase tracking-wider block">
                  DISTRIBUSI KELOMPOK UMUR ANAK BERSEKOLAH
                </span>

                {[
                  { label: "0–1 Tahun (TPA / Penitipan Bayi)", count: currentWilayahData.bersekolahUsia.age0_1, color: "bg-teal-500" },
                  { label: "2 Tahun (TPA / Toddler)", count: currentWilayahData.bersekolahUsia.age2, color: "bg-teal-600" },
                  { label: "3 Tahun (Kelompok Bermain Awal)", count: currentWilayahData.bersekolahUsia.age3, color: "bg-emerald-500" },
                  { label: "4 Tahun (Kelompok Bermain / TK A)", count: currentWilayahData.bersekolahUsia.age4, color: "bg-emerald-600" },
                  { label: "5 Tahun (TK B / RA)", count: currentWilayahData.bersekolahUsia.age5, color: "bg-sky-600" },
                  { label: "6 Tahun (Kesiapan Masuk SD)", count: currentWilayahData.bersekolahUsia.age6, color: "bg-indigo-600" },
                ].map((ageRow, idx) => {
                  const pct = Math.round((ageRow.count / (currentWilayahData.totalBersekolah || 1)) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{ageRow.label}</span>
                        <span className="font-mono text-slate-900 dark:text-slate-100">
                          {ageRow.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", ageRow.color)}
                          style={{ width: `${Math.max(1, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DIAGRAM BATANG TEGAK PANJANG: SEBARAN SATUAN PAUD         */}
          {/* PER RENTANG USIA 0 - 6 TAHUN (TK, RA, KB, SPS, TPA, DLL) */}
          {/* ========================================================= */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xs">
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Sebaran Satuan PAUD per Rentang Usia (0–6 Tahun)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Diagram batang tegak rincian jumlah data anak di tiap rentang usia (0–6 tahun) pada satuan TK, RA, KB, SPS, TPA, PKBM, dan SKB.
                  </p>
                </div>
              </div>

              {/* View Switcher: Diagram vs Matriks Tabel */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewModeDiagramUsia("diagram")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                    viewModeDiagramUsia === "diagram"
                      ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Diagram Batang Tegak
                </button>
                <button
                  type="button"
                  onClick={() => setViewModeDiagramUsia("matriks")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                    viewModeDiagramUsia === "matriks"
                      ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  Tabel Matriks
                </button>
              </div>
            </div>

            {/* Interactive Legend Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xs font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Bentuk Satuan PAUD:
              </span>
              {DAFTAR_SATUAN_PAUD_KEYS.map((s) => {
                const totalSatuan = [0, 1, 2, 3, 4, 5, 6].reduce((acc, age) => {
                  return acc + (currentWilayahData.bersekolahUsiaJenjang?.[age]?.[s.key] || 0);
                }, 0);

                return (
                  <div
                    key={s.key}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", s.bg)} />
                    <span className="text-slate-700 dark:text-slate-300">
                      {s.shortLabel} ({s.label})
                    </span>
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-2xs font-mono font-black text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                      {totalSatuan.toLocaleString("id-ID")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* View Mode 1: DIAGRAM BATANG TEGAK */}
            {viewModeDiagramUsia === "diagram" && (
              <div className="space-y-4">
                {/* Visual Canvas Container */}
                <div className="relative rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-6 overflow-x-auto">
                  {/* Grid Background Lines */}
                  <div className="absolute inset-x-6 top-6 bottom-20 flex flex-col justify-between pointer-events-none opacity-30">
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                    <div className="border-b border-dashed border-slate-300 dark:border-slate-600 w-full" />
                  </div>

                  {/* 7 Columns for Ages 0 to 6 */}
                  <div className="relative min-w-[720px] grid grid-cols-7 gap-3 sm:gap-4 items-end h-72 pb-16">
                    {RENTANG_USIA_LIST.map(({ age, label, sub, hint }) => {
                      const dataAge = currentWilayahData.bersekolahUsiaJenjang?.[age] || {
                        tk: 0,
                        ra: 0,
                        kb: 0,
                        sps: 0,
                        tpa: 0,
                        skb: 0,
                        pkbm: 0,
                      };

                      const totalAge = DAFTAR_SATUAN_PAUD_KEYS.reduce((sum, s) => sum + (dataAge[s.key] || 0), 0);

                      return (
                        <div
                          key={age}
                          className="h-full flex flex-col justify-end items-center relative group"
                        >
                          {/* Bars Cluster */}
                          <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-48 px-1 pb-1 border-b-2 border-slate-200 dark:border-slate-700">
                            {DAFTAR_SATUAN_PAUD_KEYS.map((s) => {
                              const val = dataAge[s.key] || 0;
                              const heightPct = maxBarValue > 0 ? (val / maxBarValue) * 100 : 0;
                              const isHovered =
                                activeHoverBar?.age === age && activeHoverBar?.key === s.key;

                              return (
                                <div
                                  key={s.key}
                                  className="relative flex-1 flex flex-col items-center justify-end h-full"
                                  onMouseEnter={() => setActiveHoverBar({ age, key: s.key, val })}
                                  onMouseLeave={() => setActiveHoverBar(null)}
                                >
                                  {/* Value tooltip/number on top of bar */}
                                  {val > 0 && (
                                    <div
                                      className={cn(
                                        "mb-1 text-2xs font-black font-mono px-1 py-0.5 rounded shadow-xs transition-all pointer-events-none",
                                        isHovered
                                          ? "scale-110 bg-slate-900 text-white dark:bg-white dark:text-slate-900 z-20"
                                          : "text-slate-700 dark:text-slate-300"
                                      )}
                                    >
                                      {val}
                                    </div>
                                  )}

                                  {/* The Vertical Bar */}
                                  <div
                                    className={cn(
                                      "w-full rounded-t-md transition-all duration-500 cursor-pointer",
                                      s.bg,
                                      val > 0
                                        ? "hover:brightness-110 shadow-xs"
                                        : "opacity-25",
                                      isHovered && "ring-2 ring-slate-900 dark:ring-white ring-offset-1"
                                    )}
                                    style={{
                                      height: val > 0 ? `${Math.max(10, heightPct)}%` : "3px",
                                    }}
                                    title={`${s.shortLabel} (${s.label}) - Usia ${age} Tahun: ${val} Anak`}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          {/* Age Column Footer */}
                          <div className="w-full text-center pt-2.5 space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-xs font-black text-slate-800 dark:text-slate-200">
                              {label}
                            </span>
                            <span className="block text-2xs font-semibold text-slate-400 truncate" title={hint}>
                              {sub}
                            </span>
                            <div className="font-mono text-2xs font-bold text-slate-600 dark:text-slate-400">
                              Total: <span className="text-slate-900 dark:text-slate-100 font-extrabold">{totalAge}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tooltip Card Info Bar when hovering */}
                {activeHoverBar && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-xs font-bold text-indigo-950 dark:text-indigo-200 animate-in fade-in">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                      <span>
                        Kelompok Usia {activeHoverBar.age} Tahun •{" "}
                        {DAFTAR_SATUAN_PAUD_KEYS.find((k) => k.key === activeHoverBar.key)?.label || activeHoverBar.key.toUpperCase()}
                      </span>
                    </span>
                    <span className="font-mono text-sm font-black text-indigo-700 dark:text-indigo-300">
                      {activeHoverBar.val.toLocaleString("id-ID")} Anak
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* View Mode 2: TABEL MATRIKS CROSS-TABULATION */}
            {viewModeDiagramUsia === "matriks" && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-2xs tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Rentang Usia</th>
                      <th className="py-3 px-3 text-center">TK</th>
                      <th className="py-3 px-3 text-center">RA</th>
                      <th className="py-3 px-3 text-center">KB</th>
                      <th className="py-3 px-3 text-center">SPS</th>
                      <th className="py-3 px-3 text-center">TPA</th>
                      <th className="py-3 px-3 text-center">PKBM</th>
                      <th className="py-3 px-3 text-center">SKB</th>
                      <th className="py-3 px-4 text-right">Total Anak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {RENTANG_USIA_LIST.map(({ age, label, sub }) => {
                      const dataAge = currentWilayahData.bersekolahUsiaJenjang?.[age] || {
                        tk: 0,
                        ra: 0,
                        kb: 0,
                        sps: 0,
                        tpa: 0,
                        skb: 0,
                        pkbm: 0,
                      };
                      const totalAge =
                        dataAge.tk + dataAge.ra + dataAge.kb + dataAge.sps + dataAge.tpa + dataAge.skb + dataAge.pkbm;

                      return (
                        <tr key={age} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {label} <span className="text-2xs text-slate-400 font-normal">({sub})</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {dataAge.tk || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {dataAge.ra || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {dataAge.kb || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {dataAge.sps || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {dataAge.tpa || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {dataAge.pkbm || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {dataAge.skb || "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                            {totalAge} Anak
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-black border-t-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">Total Keseluruhan</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-900 dark:text-slate-100">
                        {currentWilayahData.bersekolahJenjang.tk}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-900 dark:text-slate-100">
                        {currentWilayahData.bersekolahJenjang.ra}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-indigo-600 dark:text-indigo-400">
                        {currentWilayahData.bersekolahJenjang.kb}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-900 dark:text-slate-100">
                        {currentWilayahData.bersekolahJenjang.sps}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-900 dark:text-slate-100">
                        {currentWilayahData.bersekolahJenjang.tpa}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-900 dark:text-slate-100">
                        {currentWilayahData.bersekolahJenjang.pkbm}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-900 dark:text-slate-100">
                        {currentWilayahData.bersekolahJenjang.skb}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {currentWilayahData.totalBersekolah} Anak
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* 5.3 Grafik / Chart Alasan Anak Bersekolah */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Analisis Alasan Utama Anak Bersekolah PAUD
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Faktor motivasi dan tujuan orang tua menyekolahkan anak di jenjang usia dini
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {currentWilayahData.bersekolahAlasan.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2 text-xs font-bold">
                    <span className="text-emerald-950 dark:text-emerald-200 leading-snug">
                      {idx + 1}. {r.alasan}
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 shrink-0 font-black">
                      {r.jumlah} anak ({r.persentase}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-emerald-200/50 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${Math.max(2, r.persentase)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KARTU DAFTAR NAMA ANAK BERSEKOLAH (KHUSUS ADMIN KOMUNITAS & SUPER ADMIN) */}
          <KartuDaftarNamaAnakRekap
            kategori="bersekolah"
            tingkat={selectedTingkat}
            selectedKecamatan={selectedKecamatan}
            selectedKelurahan={selectedKelurahan}
            currentWilayahNama={currentWilayahData.nama}
            totalCount={currentWilayahData.totalBersekolah}
            canAccess={canAccessDaftarNamaAnak}
            userPeran={userPeran}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SECTION: ANAK BELUM / TIDAK BERSEKOLAH DETAIL          */}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "tidak_sekolah") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Rekapitulasi Data Anak Belum Bersekolah PAUD
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Analisis sebaran umur, jenis kelamin, serta faktor penyebab belum mengikuti pendidikan formal PAUD.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Total: {currentWilayahData.totalTidakBersekolah} Anak
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 6.1 Kelompok Umur Anak Belum Bersekolah */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Sebaran Usia Anak Belum Bersekolah
                  </h3>
                </div>
                <span className="text-2xs font-bold text-slate-500 uppercase">
                  Kelompok 0–6 Tahun
                </span>
              </div>

              {/* Gender comparison for Non-enrolled */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    Laki-laki: {currentWilayahData.tidakBersekolahGender.lakiLaki} Anak (
                    {Math.round((currentWilayahData.tidakBersekolahGender.lakiLaki / (currentWilayahData.totalTidakBersekolah || 1)) * 100)}%)
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Perempuan: {currentWilayahData.tidakBersekolahGender.perempuan} Anak (
                    {Math.round((currentWilayahData.tidakBersekolahGender.perempuan / (currentWilayahData.totalTidakBersekolah || 1)) * 100)}%)
                  </span>
                </div>
                <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <div
                    className="bg-sky-500 h-full transition-all"
                    style={{
                      width: `${Math.round((currentWilayahData.tidakBersekolahGender.lakiLaki / (currentWilayahData.totalTidakBersekolah || 1)) * 100)}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{
                      width: `${Math.round((currentWilayahData.tidakBersekolahGender.perempuan / (currentWilayahData.totalTidakBersekolah || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Age Breakdown Bars */}
              <div className="space-y-2.5">
                {[
                  { label: "0–1 Tahun (Bayi / Masih Belum Wajib)", count: currentWilayahData.tidakBersekolahUsia.age0_1, color: "bg-blue-500" },
                  { label: "2 Tahun (Batita / Pola Asuh Rumah)", count: currentWilayahData.tidakBersekolahUsia.age2, color: "bg-blue-600" },
                  { label: "3 Tahun (Usia Mulai PAUD / Perlu Edukasi)", count: currentWilayahData.tidakBersekolahUsia.age3, color: "bg-indigo-500" },
                  { label: "4 Tahun (Usia KB / Potensi ATS)", count: currentWilayahData.tidakBersekolahUsia.age4, color: "bg-amber-500" },
                  { label: "5 Tahun (Usia TK / Perlu Intervensi)", count: currentWilayahData.tidakBersekolahUsia.age5, color: "bg-amber-600" },
                  { label: "6 Tahun (Usia Pra-SD / Prioritas Intervensi)", count: currentWilayahData.tidakBersekolahUsia.age6, color: "bg-rose-600" },
                ].map((ageRow, idx) => {
                  const pct = Math.round((ageRow.count / (currentWilayahData.totalTidakBersekolah || 1)) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{ageRow.label}</span>
                        <span className="font-mono text-slate-900 dark:text-slate-100">
                          {ageRow.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", ageRow.color)}
                          style={{ width: `${Math.max(1, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6.2 Alasan Tidak / Belum Bersekolah */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Alasan Belum / Tidak Bersekolah
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Penyebab anak belum terdaftar di lembaga PAUD/TK
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {currentWilayahData.tidakBersekolahAlasan.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs font-bold">
                      <span className="text-blue-950 dark:text-blue-200 leading-snug">
                        {idx + 1}. {r.alasan}
                      </span>
                      <span className="font-mono text-blue-700 dark:text-blue-400 shrink-0 font-black">
                        {r.jumlah} anak ({r.persentase}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-blue-200/50 dark:bg-blue-900/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.max(2, r.persentase)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KARTU DAFTAR NAMA ANAK BELUM BERSEKOLAH (KHUSUS ADMIN KOMUNITAS & SUPER ADMIN) */}
          <KartuDaftarNamaAnakRekap
            kategori="tidak_sekolah"
            tingkat={selectedTingkat}
            selectedKecamatan={selectedKecamatan}
            selectedKelurahan={selectedKelurahan}
            currentWilayahNama={currentWilayahData.nama}
            totalCount={currentWilayahData.totalTidakBersekolah}
            canAccess={canAccessDaftarNamaAnak}
            userPeran={userPeran}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TABEL KOMPARATIF BERJENJANG (27 KELURAHAN SE-KOTA TEGAL)*/}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "tabel") && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Tabel Rekapitulasi Berjenjang per Kelurahan &amp; Kecamatan
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Rincian komparatif jumlah anak bersekolah per satuan PAUD &amp; belum sekolah se-Kota Tegal
                </p>
              </div>
            </div>

            {/* Table Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Cari Kelurahan / Kecamatan..."
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black">
                    <th className="py-3.5 px-4">No</th>
                    <th className="py-3.5 px-4">Kelurahan</th>
                    <th className="py-3.5 px-4">Kecamatan</th>
                    <th className="py-3.5 px-4 text-center">Total Anak (0-6 Thn)</th>
                    <th className="py-3.5 px-4 text-center">Bersekolah</th>
                    <th className="py-3.5 px-3 text-center">TK</th>
                    <th className="py-3.5 px-3 text-center">RA</th>
                    <th className="py-3.5 px-3 text-center">KB</th>
                    <th className="py-3.5 px-3 text-center">SPS</th>
                    <th className="py-3.5 px-3 text-center">TPA</th>
                    <th className="py-3.5 px-3 text-center">SKB</th>
                    <th className="py-3.5 px-3 text-center">PKBM</th>
                    <th className="py-3.5 px-4 text-center">Belum Sekolah</th>
                    <th className="py-3.5 px-4 text-center">Cakupan PAUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredTableRows.map((kel, idx) => {
                    const isSelected = selectedKelurahan === kel.nama && selectedTingkat === "kelurahan";
                    return (
                      <tr
                        key={kel.nama}
                        onClick={() => {
                          setSelectedTingkat("kelurahan");
                          if (kel.kecamatan) setSelectedKecamatan(kel.kecamatan);
                          setSelectedKelurahan(kel.nama);
                        }}
                        className={cn(
                          "transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
                          isSelected ? "bg-emerald-50/70 dark:bg-emerald-950/30 font-bold" : ""
                        )}
                      >
                        <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 dark:text-slate-100">{kel.nama}</strong>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{kel.kecamatan}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                          {kel.totalAnak}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {kel.totalBersekolah}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.bersekolahJenjang.tk}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.bersekolahJenjang.ra}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.bersekolahJenjang.kb}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.bersekolahJenjang.sps}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.bersekolahJenjang.tpa}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.bersekolahJenjang.skb}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.bersekolahJenjang.pkbm}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-blue-700 dark:text-blue-400">
                          {kel.totalTidakBersekolah}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded-full font-black text-2xs font-mono",
                              kel.persenBersekolah >= 70
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : kel.persenBersekolah >= 50
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            )}
                          >
                            {kel.persenBersekolah}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Menampilkan {filteredTableRows.length} kelurahan se-Kota Tegal</span>
              <span>Klik pada baris kelurahan untuk memfokuskan grafik di atas.</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. FOOTER CALL-TO-ACTION & LINK TO ATS / POSYANDU         */}
      {/* ========================================================= */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
            Ingin Mendaftarkan Balita atau Menemukan Anak Tidak Sekolah?
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Kader Posyandu, Pengurus RT/RW, dan Guru PAUD dapat melakukan input data anak langsung di Komunitas masing-masing.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/komunitas?tab=posyandu"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Pendaftaran Posyandu
          </Link>
          <Link
            href="/komunitas?tab=satuan_paud"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Lembaga PAUD
          </Link>
        </div>
      </div>
    </div>
  );
}
