"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
  School,
  Layers,
  AlertCircle,
  Printer,
  HeartHandshake,
  CheckCircle2,
  HelpCircle,
  Compass,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RekapDataAtsResult,
  WilayahRekapAtsItem,
  AtsCategoryBreakdown,
  AtsJenjangAsalBreakdown,
} from "@/app/actions/rekap-data-ats";

interface RekapDataAtsClientViewProps {
  initialData: RekapDataAtsResult;
}

export function RekapDataAtsClientView({ initialData }: RekapDataAtsClientViewProps) {
  // State Filter Berjenjang
  const [selectedTingkat, setSelectedTingkat] = useState<"kota" | "kecamatan" | "kelurahan">("kota");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("Tegal Timur");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Kejambon");
  const [activeTabSection, setActiveTabSection] = useState<"semua" | "kategori" | "jenjang_usia" | "intervensi" | "tabel">("semua");
  const [tableSearch, setTableSearch] = useState<string>("");

  // Daftar opsi kecamatan & kelurahan
  const daftarKecamatan = useMemo(() => {
    return initialData.kecamatanList.map((k) => k.nama);
  }, [initialData]);

  const daftarKelurahanInSelectedKecamatan = useMemo(() => {
    return initialData.kelurahanList.filter((k) => k.kecamatan === selectedKecamatan);
  }, [initialData, selectedKecamatan]);

  // Target Item Wilayah yang sedang aktif
  const currentWilayahData = useMemo<WilayahRekapAtsItem>(() => {
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

  const kategoriEntries = useMemo(() => {
    const k = currentWilayahData.kategori;
    const total = currentWilayahData.totalAts || 1;
    return [
      {
        key: "putusSekolah",
        label: "Putus Sekolah (DO / Drop Out)",
        count: k.putusSekolah,
        pct: Math.round((k.putusSekolah / total) * 100),
        color: "bg-rose-500",
        textColor: "text-rose-700 dark:text-rose-400",
        desc: "Anak yang berhenti sebelum menyelesaikan jenjang pendidikannya",
      },
      {
        key: "lulusTidakLanjut",
        label: "Lulus Tidak Melanjutkan (LTM)",
        count: k.lulusTidakLanjut,
        pct: Math.round((k.lulusTidakLanjut / total) * 100),
        color: "bg-amber-500",
        textColor: "text-amber-700 dark:text-amber-400",
        desc: "Telah lulus jenjang sebelumnya (SD/SMP) namun tidak melanjutkan",
      },
      {
        key: "belumPernahSekolah",
        label: "Belum Pernah Sekolah (BPS)",
        count: k.belumPernahSekolah,
        pct: Math.round((k.belumPernahSekolah / total) * 100),
        color: "bg-blue-500",
        textColor: "text-blue-700 dark:text-blue-400",
        desc: "Usia wajib sekolah yang belum pernah mengenyam bangku sekolah",
      },
    ];
  }, [currentWilayahData]);

  const jenjangEntries = useMemo(() => {
    const j = currentWilayahData.jenjangAsal;
    const total = currentWilayahData.totalAts || 1;
    return [
      { label: "SMP / MTs (Putus Tingkat SMP)", count: j.smpMts, pct: Math.round((j.smpMts / total) * 100), color: "bg-indigo-600" },
      { label: "SD / MI (Putus / Lulus Tidak Lanjut)", count: j.sdMi, pct: Math.round((j.sdMi / total) * 100), color: "bg-blue-600" },
      { label: "SMA / SMK / MA (Putus Tingkat SMA)", count: j.smaSmk, pct: Math.round((j.smaSmk / total) * 100), color: "bg-teal-600" },
      { label: "Belum Pernah Sekolah (Usia Sekolah)", count: j.belumSekolah, pct: Math.round((j.belumSekolah / total) * 100), color: "bg-rose-500" },
      { label: "PAUD / TK (Putus Sebelum SD)", count: j.paudTk, pct: Math.round((j.paudTk / total) * 100), color: "bg-amber-500" },
    ];
  }, [currentWilayahData]);

  return (
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 gap-6 sm:gap-8 max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. BREADCRUMB & HERO HEADER                               */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <span>Beranda</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-slate-200 font-bold">
            Pantau Hasil Pendataan ATS
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-950/10 border border-slate-700/50 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs font-black text-blue-300 tracking-wide uppercase">
                PENDATAAN ANAK TIDAK SEKOLAH (ATS)
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Pembaruan: {initialData.lastUpdated}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
              Hasil Pendataan Anak Tidak Sekolah (ATS)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dashboard rekapitulasi penanganan ATS berjenjang Kota Tegal, 4 Kecamatan, dan 27 Kelurahan. Menampilkan kategori putus sekolah, lulus tidak melanjutkan, belum pernah sekolah, kesiapan kembali bersekolah, serta jalur intervensi program kesetaraan (PKBM &amp; SKB).
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md active:scale-98 shadow-sm"
            >
              <Printer className="h-4 w-4 text-blue-300" />
              <span>Cetak Rekap ATS</span>
            </button>
            <div className="text-2xs text-slate-400 font-medium hidden md:block">
              {initialData.totalLiveRecords} data valid di database
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
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
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
                  className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
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
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold text-slate-500 dark:text-slate-400">Wilayah Rekap ATS:</span>
            <strong className="text-sm font-black text-slate-900 dark:text-slate-100">
              {currentWilayahData.tingkat === "kota" && "Seluruh Wilayah Kota Tegal"}
              {currentWilayahData.tingkat === "kecamatan" && `Kecamatan ${currentWilayahData.nama}, Kota Tegal`}
              {currentWilayahData.tingkat === "kelurahan" && `Kelurahan ${currentWilayahData.nama}, Kec. ${currentWilayahData.kecamatan}, Kota Tegal`}
            </strong>
          </div>

          <div className="flex items-center gap-2 text-2xs font-bold text-slate-500">
            <span>Intervensi Kesetaraan: SKB Kota Tegal &amp; PKBM Mitra</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. KEY SUMMARY METRIC CARDS                               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total ATS */}
        <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-slate-500 uppercase tracking-wider">
              TOTAL TERDATA ATS
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
              {currentWilayahData.totalAts.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-slate-500">Jiwa</span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>L: {currentWilayahData.gender.lakiLaki}</span>
            <span>P: {currentWilayahData.gender.perempuan}</span>
            <span>Target Intervensi</span>
          </div>
        </div>

        {/* Card 2: Ingin Sekolah Kembali (Siap Diintervensi) */}
        <div className="rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-2 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              INGIN SEKOLAH KEMBALI
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              {currentWilayahData.keinginan.masihAda.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              ({currentWilayahData.persenInginSekolah}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-emerald-800 dark:text-emerald-300 border-t border-emerald-100 dark:border-emerald-900/40 pt-2">
            <span>Siap Didaftarkan</span>
            <span className="font-extrabold">Paket A/B/C</span>
          </div>
        </div>

        {/* Card 3: Putus Sekolah (Drop Out) */}
        <div className="rounded-3xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 p-5 space-y-2 shadow-xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              PUTUS SEKOLAH (DO)
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-rose-700 dark:text-rose-400">
              {currentWilayahData.kategori.putusSekolah.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
              ({currentWilayahData.persenPutusSekolah}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-rose-800 dark:text-rose-300 border-t border-rose-100 dark:border-rose-900/40 pt-2">
            <span>Mayoritas SMP &amp; SD</span>
            <span>Perlu Pendampingan</span>
          </div>
        </div>

        {/* Card 4: LTM & Belum Pernah Sekolah */}
        <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-2 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              LTM &amp; BELUM SEKOLAH
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700 dark:text-amber-400">
              {(currentWilayahData.kategori.lulusTidakLanjut + currentWilayahData.kategori.belumPernahSekolah).toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Anak</span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-amber-900 dark:text-amber-300 border-t border-amber-100 dark:border-amber-900/40 pt-2">
            <span>LTM: {currentWilayahData.kategori.lulusTidakLanjut}</span>
            <span>BPS: {currentWilayahData.kategori.belumPernahSekolah}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. SECTION NAVIGATION TABS                                */}
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
          📊 Ringkasan Visual ATS
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("kategori")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
            activeTabSection === "kategori"
              ? "bg-blue-600 text-white shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          🎯 Kategori &amp; Keinginan Sekolah
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("jenjang_usia")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
            activeTabSection === "jenjang_usia"
              ? "bg-indigo-600 text-white shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          📚 Jenjang Asal &amp; Kelompok Usia
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("intervensi")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
            activeTabSection === "intervensi"
              ? "bg-emerald-600 text-white shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          💡 Jalur Intervensi &amp; Rekomendasi
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
      {/* 5. SECTION: KATEGORI & KEINGINAN BERSEKOLAH               */}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "kategori") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <PieChartIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Kategori ATS &amp; Kesiapan Kembali Bersekolah
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Status putus sekolah, lulus tidak melanjutkan, serta kemauan anak untuk kembali belajar.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Total: {currentWilayahData.totalAts} Anak
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 5.1 Kategori ATS Breakdown */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Distribusi Kategori ATS
                  </h3>
                </div>
                <span className="text-2xs font-bold text-slate-500 uppercase">
                  DO • LTM • BPS
                </span>
              </div>

              <div className="space-y-4">
                {kategoriEntries.map((item) => (
                  <div key={item.key} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className={cn("inline-block h-2.5 w-2.5 rounded-full", item.color)} />
                        <span>{item.label}</span>
                      </span>
                      <span className="font-mono font-black text-slate-900 dark:text-slate-100">
                        {item.count} Anak ({item.pct}%)
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 font-medium pl-4">
                      {item.desc}
                    </p>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", item.color)}
                        style={{ width: `${Math.max(2, item.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-2xs font-black text-slate-400 uppercase tracking-wider block">
                  STRUKTUR KATEGORI ATS
                </span>
                <div className="h-4 w-full flex rounded-xl overflow-hidden shadow-inner">
                  {kategoriEntries.map((item) => {
                    if (item.pct <= 0) return null;
                    return (
                      <div
                        key={item.key}
                        className={cn("h-full transition-all", item.color)}
                        style={{ width: `${item.pct}%` }}
                        title={`${item.label}: ${item.count} (${item.pct}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5.2 Keinginan Bersekolah Kembali & Rasio Gender */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Keinginan Bersekolah &amp; Rasio Gender
                  </h3>
                </div>
                <span className="text-2xs font-bold text-slate-500 uppercase">
                  Kesiapan Intervensi
                </span>
              </div>

              {/* Keinginan Kembali Bersekolah Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                  <span className="text-2xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase block">
                    MASIH ADA KEINGINAN
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                    {currentWilayahData.keinginan.masihAda}
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    ({currentWilayahData.persenInginSekolah}%) Siap Lanjut
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <span className="text-2xs font-extrabold text-slate-600 dark:text-slate-400 uppercase block">
                    TIDAK INGIN / RAGU
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-700 dark:text-slate-300">
                    {currentWilayahData.keinginan.tidakAda}
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    ({100 - currentWilayahData.persenInginSekolah}%) Perlu Konseling
                  </span>
                </div>
              </div>

              {/* Rasio Gender ATS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    Laki-laki: {currentWilayahData.gender.lakiLaki} Anak (
                    {Math.round((currentWilayahData.gender.lakiLaki / (currentWilayahData.totalAts || 1)) * 100)}%)
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Perempuan: {currentWilayahData.gender.perempuan} Anak (
                    {Math.round((currentWilayahData.gender.perempuan / (currentWilayahData.totalAts || 1)) * 100)}%)
                  </span>
                </div>
                <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <div
                    className="bg-sky-500 h-full transition-all"
                    style={{
                      width: `${Math.round((currentWilayahData.gender.lakiLaki / (currentWilayahData.totalAts || 1)) * 100)}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{
                      width: `${Math.round((currentWilayahData.gender.perempuan / (currentWilayahData.totalAts || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs font-medium text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Anak dengan motivasi belajar tinggi segera difasilitasi ke PKBM terdekat.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SECTION: JENJANG ASAL, KELOMPOK USIA & ALASAN ATS     */}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "jenjang_usia") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Jenjang Sekolah Asal, Kelompok Usia &amp; Alasan Tidak Sekolah
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Rincian tingkatan sekolah terakhir, distribusi rentang umur, dan faktor penyebab putus sekolah.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 6.1 Jenjang Sekolah Asal */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Jenjang Sekolah Sebelumnya / Asal
                  </h3>
                </div>
                <span className="text-2xs font-bold text-slate-500 uppercase">
                  Riwayat Pendidikan
                </span>
              </div>

              <div className="space-y-3">
                {jenjangEntries.map((jItem, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{jItem.label}</span>
                      <span className="font-mono text-slate-900 dark:text-slate-100 font-black">
                        {jItem.count} ({jItem.pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", jItem.color)}
                        style={{ width: `${Math.max(2, jItem.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6.2 Distribusi Kelompok Usia ATS */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Distribusi Kelompok Usia ATS
                  </h3>
                </div>
                <span className="text-2xs font-bold text-slate-500 uppercase">
                  Rentang 4–&gt;18 Tahun
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "4–6 Tahun (Usia Pra-SD / Perlu Intervensi PAUD)", count: currentWilayahData.usia.age4_6, color: "bg-teal-500" },
                  { label: "7–12 Tahun (Usia Wajib Belajar SD / MI)", count: currentWilayahData.usia.age7_12, color: "bg-blue-500" },
                  { label: "13–15 Tahun (Usia Wajib Belajar SMP / MTs)", count: currentWilayahData.usia.age13_15, color: "bg-indigo-600" },
                  { label: "16–18 Tahun (Usia Wajib Belajar SMA / SMK)", count: currentWilayahData.usia.age16_18, color: "bg-amber-500" },
                  { label: ">18 Tahun (Usia Dewasa / Kesetaraan Paket C)", count: currentWilayahData.usia.ageAbove18, color: "bg-rose-500" },
                ].map((uRow, idx) => {
                  const pct = Math.round((uRow.count / (currentWilayahData.totalAts || 1)) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{uRow.label}</span>
                        <span className="font-mono text-slate-900 dark:text-slate-100">
                          {uRow.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", uRow.color)}
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6.3 Analisis Alasan Utama Tidak Sekolah */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Faktor Penyebab &amp; Alasan Tidak Sekolah
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Hasil pendataan alasan tidak bersekolah oleh Kader RT/RW dan Kelurahan
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {currentWilayahData.alasanList.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2 text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200 leading-snug">
                      {idx + 1}. {r.alasan}
                    </span>
                    <span className="font-mono text-rose-700 dark:text-rose-400 shrink-0 font-black">
                      {r.jumlah} anak ({r.persentase}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full transition-all"
                      style={{ width: `${Math.max(2, r.persentase)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. SECTION: JALUR INTERVENSI & REKOMENDASI SOLUSI         */}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "intervensi") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Rekomendasi Jalur Intervensi &amp; Tindak Lanjut
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Pemetaan target intervensi program pendidikan kesetaraan, beasiswa, dan pelatihan vokasi.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWilayahData.rekomendasiList.map((rek, idx) => (
              <div
                key={idx}
                className="rounded-3xl border-2 border-emerald-200/80 dark:border-emerald-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-extrabold uppercase">
                      Target: {rek.jumlahTarget} Anak ({rek.persentase}%)
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">#0{idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {rek.jalur}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rek.deskripsi}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-2xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{rek.lembagaTujuan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. TABEL KOMPARATIF BERJENJANG (27 KELURAHAN SE-KOTA TEGAL)*/}
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
                  Tabel Rekapitulasi Berjenjang ATS per Kelurahan
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Rincian komparatif jumlah ATS, kategori DO/LTM/BPS, dan kesiapan sekolah kembali se-Kota Tegal
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
                    <th className="py-3.5 px-4 text-center">Total ATS</th>
                    <th className="py-3.5 px-3 text-center">Putus Sekolah (DO)</th>
                    <th className="py-3.5 px-3 text-center">Lulus Tdk Lanjut (LTM)</th>
                    <th className="py-3.5 px-3 text-center">Belum Pernah (BPS)</th>
                    <th className="py-3.5 px-4 text-center">Ingin Sekolah Kembali</th>
                    <th className="py-3.5 px-3 text-center">Laki-laki</th>
                    <th className="py-3.5 px-3 text-center">Perempuan</th>
                    <th className="py-3.5 px-4 text-center">Prioritas Intervensi</th>
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
                          isSelected ? "bg-blue-50/70 dark:bg-blue-950/30 font-bold" : ""
                        )}
                      >
                        <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 dark:text-slate-100">{kel.nama}</strong>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{kel.kecamatan}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                          {kel.totalAts}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-rose-600 font-bold">{kel.kategori.putusSekolah}</td>
                        <td className="py-3 px-3 text-center font-mono text-amber-600 font-bold">{kel.kategori.lulusTidakLanjut}</td>
                        <td className="py-3 px-3 text-center font-mono text-blue-600 font-bold">{kel.kategori.belumPernahSekolah}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {kel.keinginan.masihAda} ({kel.persenInginSekolah}%)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.gender.lakiLaki}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{kel.gender.perempuan}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              "inline-block px-2.5 py-0.5 rounded-full font-black text-2xs font-mono uppercase",
                              kel.totalAts >= 25
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : kel.totalAts >= 15
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            )}
                          >
                            {kel.totalAts >= 25 ? "Prioritas Tinggi" : kel.totalAts >= 15 ? "Prioritas Sedang" : "Terkendali"}
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
      {/* 9. FOOTER CALL-TO-ACTION & LINK TO ATS / PKBM             */}
      {/* ========================================================= */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
            Kader RT/RW Menemukan Anak Putus Sekolah di Lingkungan Anda?
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Daftarkan dan validasi data ATS langsung di Komunitas Warga Kita tingkat RT/RW untuk segera diintervensi oleh Dinas Pendidikan dan PKBM.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/komunitas?tab=warga_kita"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Input ATS di Warga Kita
          </Link>
          <Link
            href="/komunitas?tab=satuan_paud"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Lembaga PKBM / SKB
          </Link>
        </div>
      </div>
    </div>
  );
}
