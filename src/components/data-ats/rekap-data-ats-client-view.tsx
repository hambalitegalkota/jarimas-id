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
import { KartuDaftarNamaAtsRekap } from "./kartu-daftar-nama-ats-rekap";

interface RekapDataAtsClientViewProps {
  initialData: RekapDataAtsResult;
  canAccessDaftarNamaAts?: boolean;
  userPeran?: string;
}

export function RekapDataAtsClientView({
  initialData,
  canAccessDaftarNamaAts = false,
  userPeran,
}: RekapDataAtsClientViewProps) {
  // State Filter Berjenjang
  const [selectedTingkat, setSelectedTingkat] = useState<"kota" | "kecamatan" | "kelurahan">("kota");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("Tegal Timur");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Kejambon");
  const [activeTabSection, setActiveTabSection] = useState<"semua" | "kategori" | "jenjang_usia" | "tabel">("semua");
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
        label: "Belum Pernah Bersekolah (BPB)",
        count: k.belumPernahSekolah,
        pct: Math.round((k.belumPernahSekolah / total) * 100),
        color: "bg-blue-500",
        textColor: "text-blue-700 dark:text-blue-400",
        desc: "Usia wajib sekolah (6–18 tahun) yang belum pernah mengenyam bangku sekolah",
      },
    ];
  }, [currentWilayahData]);

  const jenjangEntries = useMemo(() => {
    const j = currentWilayahData.jenjangAsal;
    const total = currentWilayahData.totalAts || 1;
    return [
      { label: "Belum Pernah Bersekolah", count: j.belumSekolah, pct: Math.round((j.belumSekolah / total) * 100), color: "bg-blue-600" },
      { label: "SD / MI / Paket A Putus Sekolah / DO", count: j.sdPutus, pct: Math.round((j.sdPutus / total) * 100), color: "bg-rose-500" },
      { label: "SD / MI / Paket A Lulus Tidak Melanjutkan", count: j.sdLulus, pct: Math.round((j.sdLulus / total) * 100), color: "bg-amber-500" },
      { label: "SMP / MTs / Paket B Putus Sekolah / DO", count: j.smpPutus, pct: Math.round((j.smpPutus / total) * 100), color: "bg-rose-600" },
      { label: "SMP / MTs / Paket B Lulus Tidak Melanjutkan", count: j.smpLulus, pct: Math.round((j.smpLulus / total) * 100), color: "bg-amber-600" },
      { label: "SMA / SMK / MA / Paket C Putus Sekolah", count: j.smaPutus, pct: Math.round((j.smaPutus / total) * 100), color: "bg-teal-600" },
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
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Distribusi Kategori ATS
                    </h3>
                    <p className="text-2xs text-slate-500 font-medium">
                      Total Data ATS: <strong className="text-slate-900 dark:text-slate-100 font-bold">{currentWilayahData.totalAts} Anak</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 font-mono shadow-2xs">
                    Total: {currentWilayahData.totalAts} Anak
                  </span>
                  <span className="text-2xs font-bold text-slate-500 uppercase hidden sm:inline">
                    DO • LTM • BPB
                  </span>
                </div>
              </div>

              {/* Rasio Gender ATS (Laki-laki & Perempuan) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
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
                <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
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
            </div>

            {/* 5.2 Keinginan Bersekolah Kembali & Rasio Gender */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Keinginan Bersekolah &amp; Rasio Gender
                    </h3>
                    <p className="text-2xs text-slate-500 font-medium">
                      Total Data ATS: <strong className="text-slate-900 dark:text-slate-100 font-bold">{currentWilayahData.totalAts} Anak</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-mono shadow-2xs">
                    Total: {currentWilayahData.totalAts} Anak
                  </span>
                  <span className="text-2xs font-bold text-slate-500 uppercase hidden sm:inline">
                    Kesiapan Intervensi
                  </span>
                </div>
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
            {/* 6.1 Diagram Batang: Jenjang Sekolah Asal / Kelas Terakhir ATS */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Diagram Batang: Jenjang &amp; Kelas Terakhir ATS
                    </h3>
                    <p className="text-2xs text-slate-500 font-medium">
                      Rincian tingkat kelas putus sekolah (DO), lulus tidak lanjut (LTM), dan belum sekolah
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                  15 Kategori
                </span>
              </div>

              {/* Bar Chart Grafik Batang 15 Kategori Kelas */}
              {(() => {
                const kelasList = currentWilayahData.kelasPerJenjang || [];
                const maxKelasCount = Math.max(
                  ...kelasList.map((k) => k.jumlah),
                  1
                );

                // Hitung total ringkasan jenjang
                const countBPB = kelasList.find((k) => k.key === "bpb")?.jumlah || 0;
                const countSD = kelasList
                  .filter((k) => k.jenjang === "SD")
                  .reduce((acc, curr) => acc + curr.jumlah, 0);
                const countSMP = kelasList
                  .filter((k) => k.jenjang === "SMP")
                  .reduce((acc, curr) => acc + curr.jumlah, 0);
                const countSMA = kelasList
                  .filter((k) => k.jenjang === "SMA")
                  .reduce((acc, curr) => acc + curr.jumlah, 0);

                return (
                  <div className="space-y-4 pt-1">
                    <div className="h-48 sm:h-52 w-full flex items-end justify-between gap-0.5 sm:gap-1 px-1.5 pt-6 pb-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl overflow-hidden">
                      {kelasList.map((kItem) => {
                        const heightPct =
                          kItem.jumlah > 0
                            ? Math.max(12, Math.round((kItem.jumlah / maxKelasCount) * 100))
                            : 0;

                        // Color coding by Kategori / Jenjang
                        let barGradient = "from-blue-600 to-indigo-500";
                        let textBadge = "text-blue-700 dark:text-blue-400";

                        if (kItem.jenjang === "SD") {
                          if (kItem.key === "sd6_ltm") {
                            barGradient = "from-amber-500 to-yellow-400";
                            textBadge = "text-amber-700 dark:text-amber-400";
                          } else {
                            barGradient = "from-emerald-500 to-teal-400";
                            textBadge = "text-emerald-700 dark:text-emerald-400";
                          }
                        } else if (kItem.jenjang === "SMP") {
                          if (kItem.key === "smp9_ltm") {
                            barGradient = "from-orange-500 to-amber-400";
                            textBadge = "text-orange-700 dark:text-orange-400";
                          } else {
                            barGradient = "from-sky-500 to-blue-400";
                            textBadge = "text-sky-700 dark:text-sky-400";
                          }
                        } else if (kItem.jenjang === "SMA") {
                          barGradient = "from-purple-500 to-pink-500";
                          textBadge = "text-purple-700 dark:text-purple-400";
                        }

                        return (
                          <div
                            key={kItem.key}
                            className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                            title={`${kItem.label}: ${kItem.jumlah} Anak (${kItem.persentase}%)`}
                          >
                            {/* Hover Tooltip Floating */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-2 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                              {kItem.label}: {kItem.jumlah} Anak ({kItem.persentase}%)
                            </div>

                            {/* Value Count Label on Top of Bar */}
                            <span
                              className={cn(
                                "text-[8.5px] sm:text-[10px] font-black font-mono mb-1 transition-all",
                                kItem.jumlah > 0 ? textBadge : "text-slate-300 dark:text-slate-600"
                              )}
                            >
                              {kItem.jumlah}
                            </span>

                            {/* Bar Column (Slimmer & Responsive) */}
                            <div className="w-full max-w-[12px] sm:max-w-[15px] h-20 sm:h-24 flex items-end justify-center">
                              <div
                                className={cn(
                                  "w-full rounded-t-sm sm:rounded-t-md transition-all duration-700 shadow-2xs group-hover:brightness-110",
                                  kItem.jumlah > 0
                                    ? `bg-gradient-to-t ${barGradient}`
                                    : "bg-slate-200 dark:bg-slate-700/50 h-1"
                                )}
                                style={{
                                  height: kItem.jumlah > 0 ? `${heightPct}%` : "3px",
                                }}
                              />
                            </div>

                            {/* Class X-Axis Label (Miring Menanjak -45 Derajat) */}
                            <div className="h-7 w-full flex items-start justify-center mt-1.5 overflow-visible">
                              <span className="text-[7.5px] sm:text-[8.5px] font-bold font-mono text-slate-600 dark:text-slate-300 transform -rotate-45 origin-top-left whitespace-nowrap leading-none block select-none group-hover:text-indigo-600 group-hover:font-black transition-colors">
                                {kItem.shortLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ringkasan Jenjang Asal Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-blue-800 dark:text-blue-300 uppercase block truncate">
                          Belum Sekolah
                        </span>
                        <div className="text-xs sm:text-sm font-black font-mono text-blue-700 dark:text-blue-400">
                          {countBPB} Anak
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase block truncate">
                          SD / MI (1–6)
                        </span>
                        <div className="text-xs sm:text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">
                          {countSD} Anak
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-sky-800 dark:text-sky-300 uppercase block truncate">
                          SMP / MTs (7–9)
                        </span>
                        <div className="text-xs sm:text-sm font-black font-mono text-sky-700 dark:text-sky-400">
                          {countSMP} Anak
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-purple-800 dark:text-purple-300 uppercase block truncate">
                          SMA / SMK (10–12)
                        </span>
                        <div className="text-xs sm:text-sm font-black font-mono text-purple-700 dark:text-purple-400">
                          {countSMA} Anak
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 6.2 Diagram Batang: Distribusi Usia ATS (6 - 18 Tahun) */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Diagram Batang: Usia ATS (6 – 18 Tahun)
                    </h3>
                    <p className="text-2xs text-slate-500 font-medium">
                      Jumlah anak tidak sekolah pada setiap kelompok umur usia wajib belajar
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                  6–18 Thn
                </span>
              </div>

              {/* Bar Chart Grafik Batang 6-18 Tahun */}
              {(() => {
                const maxAgeCount = Math.max(
                  ...(currentWilayahData.usiaPerTahun || []).map((u) => u.jumlah),
                  1
                );
                return (
                  <div className="space-y-4 pt-1">
                    <div className="h-44 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl">
                      {(currentWilayahData.usiaPerTahun || []).map((uItem) => {
                        const heightPct =
                          uItem.jumlah > 0
                            ? Math.max(12, Math.round((uItem.jumlah / maxAgeCount) * 100))
                            : 0;

                        // Color coding by Jenjang Wajib Belajar
                        let barGradient = "from-emerald-500 to-teal-400";
                        let textBadge = "text-emerald-700 dark:text-emerald-400";
                        if (uItem.usia >= 13 && uItem.usia <= 15) {
                          barGradient = "from-sky-500 to-blue-400";
                          textBadge = "text-sky-700 dark:text-sky-400";
                        } else if (uItem.usia >= 16) {
                          barGradient = "from-amber-500 to-orange-400";
                          textBadge = "text-amber-700 dark:text-amber-400";
                        }

                        return (
                          <div
                            key={uItem.usia}
                            className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                            title={`Usia ${uItem.usia} Tahun: ${uItem.jumlah} Anak (${uItem.persentase}%)`}
                          >
                            {/* Hover Tooltip Floating */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-2 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                              {uItem.usia} Thn: {uItem.jumlah} Anak ({uItem.persentase}%)
                            </div>

                            {/* Value Count Label on Top of Bar */}
                            <span
                              className={cn(
                                "text-[10px] sm:text-xs font-black font-mono mb-1 transition-all",
                                uItem.jumlah > 0 ? textBadge : "text-slate-300 dark:text-slate-600"
                              )}
                            >
                              {uItem.jumlah}
                            </span>

                            {/* Bar Column */}
                            <div className="w-full max-w-[28px] h-28 flex items-end justify-center">
                              <div
                                className={cn(
                                  "w-full rounded-t-md transition-all duration-700 shadow-2xs group-hover:brightness-110",
                                  uItem.jumlah > 0
                                    ? `bg-gradient-to-t ${barGradient}`
                                    : "bg-slate-200 dark:bg-slate-700/50 h-1"
                                )}
                                style={{
                                  height: uItem.jumlah > 0 ? `${heightPct}%` : "4px",
                                }}
                              />
                            </div>

                            {/* Age X-Axis Label */}
                            <div className="mt-2 text-center">
                              <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 block font-mono">
                                {uItem.usia}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ringkasan Jenjang Usia Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                        <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase block">
                          SD (6–12 Thn)
                        </span>
                        <div className="text-base sm:text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                          {currentWilayahData.usia.age7_12} Anak
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center">
                        <span className="text-[10px] font-extrabold text-sky-800 dark:text-sky-300 uppercase block">
                          SMP (13–15 Thn)
                        </span>
                        <div className="text-base sm:text-lg font-black font-mono text-sky-700 dark:text-sky-400">
                          {currentWilayahData.usia.age12_15} Anak
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                        <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase block">
                          SMA (16–18 Thn)
                        </span>
                        <div className="text-base sm:text-lg font-black font-mono text-amber-700 dark:text-amber-400">
                          {currentWilayahData.usia.age15_18} Anak
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 6.3 Diagram Batang Faktor Penyebab & Alasan Tidak Sekolah (Urutan Terbanyak s/d Tersedikit) */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Diagram Batang: Alasan Menjadi ATS (Urutan Terbanyak ke Tersedikit)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Grafik peringkat faktor pemicu anak tidak bersekolah dari data pendataan lapangan
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-mono self-start sm:self-center">
                Ranking Terbanyak
              </span>
            </div>

            {(() => {
              const sortedReasons = [...(currentWilayahData.alasanList || [])].sort(
                (a, b) => b.jumlah - a.jumlah
              );
              const maxReasonCount = Math.max(...sortedReasons.map((r) => r.jumlah), 1);

              return (
                <div className="space-y-3 pt-1">
                  {sortedReasons.map((r, idx) => {
                    const isTop1 = idx === 0 && r.jumlah > 0;
                    const isTop2 = idx === 1 && r.jumlah > 0;
                    const isTop3 = idx === 2 && r.jumlah > 0;
                    const barWidthPct =
                      r.jumlah > 0
                        ? Math.max(4, Math.round((r.jumlah / maxReasonCount) * 100))
                        : 0;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-3.5 rounded-2xl border transition-all space-y-2",
                          isTop1
                            ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-xs"
                            : isTop2 || isTop3
                            ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                            : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/80"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3 text-xs font-bold">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Ranking Badge */}
                            <span
                              className={cn(
                                "flex items-center justify-center h-5 w-5 rounded-full text-2xs font-black shrink-0 font-mono",
                                isTop1
                                  ? "bg-amber-500 text-white shadow-2xs"
                                  : isTop2
                                  ? "bg-slate-400 text-white"
                                  : isTop3
                                  ? "bg-amber-700 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                              )}
                            >
                              #{idx + 1}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-extrabold truncate">
                              {r.alasan}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-slate-900 dark:text-slate-100 font-black text-xs sm:text-sm">
                              {r.jumlah} Anak
                            </span>
                            <span
                              className={cn(
                                "text-2xs font-bold px-2 py-0.5 rounded-lg font-mono",
                                isTop1
                                  ? "bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              )}
                            >
                              {r.persentase}%
                            </span>
                          </div>
                        </div>

                        {/* Diagram Batang Horizontal */}
                        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              isTop1
                                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                                : isTop2 || isTop3
                                ? "bg-gradient-to-r from-rose-500 to-amber-500"
                                : "bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600"
                            )}
                            style={{ width: `${barWidthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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
                  Rincian komparatif jumlah ATS, kategori DO/LTM/BPB, dan kesiapan sekolah kembali se-Kota Tegal
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
                    <th className="py-3.5 px-3 text-center">Belum Pernah (BPB)</th>
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
                              kel.totalAts === 0
                                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                : kel.totalAts >= 25
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : kel.totalAts >= 15
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            )}
                          >
                            {kel.totalAts === 0 ? "0 ATS" : kel.totalAts >= 25 ? "Prioritas Tinggi" : kel.totalAts >= 15 ? "Prioritas Sedang" : "Terkendali"}
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
      {/* 8.5 KARTU DAFTAR ANAK TIDAK SEKOLAH (ATS)                 */}
      {/* ========================================================= */}
      <KartuDaftarNamaAtsRekap
        tingkat={selectedTingkat}
        selectedKecamatan={selectedKecamatan}
        selectedKelurahan={selectedKelurahan}
        currentWilayahNama={
          selectedTingkat === "kota"
            ? "Seluruh Kota Tegal"
            : selectedTingkat === "kecamatan"
            ? `Kec. ${selectedKecamatan}`
            : `Kel. ${selectedKelurahan}`
        }
        totalAts={currentWilayahData.totalAts}
        canAccess={canAccessDaftarNamaAts}
        userPeran={userPeran}
      />

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
