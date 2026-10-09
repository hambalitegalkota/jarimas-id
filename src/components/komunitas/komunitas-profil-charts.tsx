"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Baby,
  GraduationCap,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  ArrowRight,
  Clock,
  BookOpen,
} from "lucide-react";
import type { KomunitasWithMembership, DataAnakItem, DataAtsItem } from "@/types/database";
import { normalizeKeinginanSekolah } from "@/lib/ats-helpers";
import { cn } from "@/lib/utils";

interface KomunitasProfilChartsProps {
  komunitas: KomunitasWithMembership;
  dataAnakList?: DataAnakItem[];
  dataAtsList?: DataAtsItem[];
  userRole?: string;
  isChartOnly?: boolean;
}

export function KomunitasProfilCharts({
  komunitas,
  dataAnakList = [],
  dataAtsList = [],
  userRole = "Pengunjung",
  isChartOnly = false,
}: KomunitasProfilChartsProps) {
  const [activeChartFilter, setActiveChartFilter] = useState<"semua" | "usia" | "paud" | "ats" | "ddtk">("semua");

  // Perhitungan data agregat 100% NYATA berbasis data_anak & data_ats aktual
  const totalWarga = komunitas.jumlah_anggota || 0;
  const totalBalita = dataAnakList.length;
  const totalAts = dataAtsList.length;

  let usia0to2 = 0;
  let usia3to4 = 0;
  let usia5to6 = 0;
  let maleCount = 0;
  let femaleCount = 0;
  let sudahPaud = 0;
  let belumSekolah = 0;
  let potensiAts = 0;
  let ddtkSesuai = 0;
  let ddtkPantau = 0;

  dataAnakList.forEach((child) => {
    // 1. Jenis Kelamin
    if (child.jenis_kelamin === "L") {
      maleCount++;
    } else {
      femaleCount++;
    }

    // 2. Kelompok Umur
    let age = 0;
    if (child.tanggal_lahir) {
      const birthDate = new Date(child.tanggal_lahir);
      if (!isNaN(birthDate.getTime())) {
        const diffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(diffMs);
        age = Math.max(0, Math.abs(ageDate.getUTCFullYear() - 1970));
      }
    }

    if (age <= 2) {
      usia0to2++;
    } else if (age <= 4) {
      usia3to4++;
    } else {
      usia5to6++;
    }

    // 3. Status Sekolah / PAUD
    const lowerSekolah = (child.nama_sekolah || "").toLowerCase();
    const isEnrolled = child.is_sekolah || (lowerSekolah && !lowerSekolah.includes("belum"));
    if (isEnrolled) {
      sudahPaud++;
    } else {
      belumSekolah++;
      if (age >= 4) {
        potensiAts++;
      }
    }

    // 4. Status DDTK
    if (child.latest_ddks) {
      ddtkSesuai++;
    } else {
      ddtkPantau++;
    }
  });

  // Statistik ATS Khusus
  let atsApproved = 0;
  let atsPending = 0;
  let atsInginSekolah = 0;
  let atsTidakIngin = 0;

  dataAtsList.forEach((ats) => {
    if (ats.status_approval === "approved") {
      atsApproved++;
    } else {
      atsPending++;
    }

    if (normalizeKeinginanSekolah(ats.keinginan_sekolah) === "Masih Ada") {
      atsInginSekolah++;
    } else {
      atsTidakIngin++;
    }
  });

  const combinedAtsCount = totalAts > 0 ? totalAts : potensiAts;
  const pctPaud = totalBalita > 0 ? Math.round((sudahPaud / totalBalita) * 100) : 0;
  const pctDdtk = totalBalita > 0 ? Math.round((ddtkSesuai / totalBalita) * 100) : 0;
  const pct0to2 = totalBalita > 0 ? Math.round((usia0to2 / totalBalita) * 100) : 0;
  const pct3to4 = totalBalita > 0 ? Math.round((usia3to4 / totalBalita) * 100) : 0;
  const pct5to6 = totalBalita > 0 ? Math.round((usia5to6 / totalBalita) * 100) : 0;
  const pctBelum = totalBalita > 0 ? Math.round((belumSekolah / totalBalita) * 100) : 0;
  const pctPotensiAts = totalBalita > 0 ? Math.round((combinedAtsCount / totalBalita) * 100) : 0;

  let displayKomNama = komunitas.nama;
  if (komunitas.jenis === "posyandu") {
    const cleanName = (komunitas.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
    displayKomNama = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
  }

  return (
    <div className="space-y-5">
      {/* Header Visualisasi Grafik & Chart */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200 uppercase">
              VISUALISASI DATA WILAYAH
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">
              {displayKomNama}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-700" />
            <span>Grafik &amp; Chart Statistik Komunitas</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Rekapitulasi data anak usia dini (0–6 tahun), partisipasi PAUD, pemantauan DDTK, dan pendataan ATS se-wilayah.
          </p>
        </div>

        {/* Filter Tab Kategori Chart */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveChartFilter("semua")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeChartFilter === "semua"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setActiveChartFilter("usia")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeChartFilter === "usia"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Kelompok Usia
          </button>
          <button
            type="button"
            onClick={() => setActiveChartFilter("paud")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeChartFilter === "paud"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Partisipasi PAUD
          </button>
          <button
            type="button"
            onClick={() => setActiveChartFilter("ats")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeChartFilter === "ats"
                ? "bg-white text-amber-700 shadow-xs border border-slate-200 font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Data ATS
          </button>
          <button
            type="button"
            onClick={() => setActiveChartFilter("ddtk")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeChartFilter === "ddtk"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200 font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Tumbuh Kembang
          </button>
        </div>
      </div>

      {/* Ringkasan Metrik Angka Kunci */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            TOTAL ANAK (0–6 THN)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalBalita}
            </span>
            <span className="text-xs font-bold text-slate-500">Jiwa</span>
          </div>
          <span className="text-xs font-semibold text-blue-700 block">
            Populasi Terdata
          </span>
        </div>

        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            SUDAH BER-PAUD
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
              {sudahPaud}
            </span>
            <span className="text-xs font-bold text-emerald-800">
              ({pctPaud}%)
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 block">
            Akses Pendidikan
          </span>
        </div>

        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
            DDTK SESUAI USIA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-700">
              {ddtkSesuai}
            </span>
            <span className="text-xs font-bold text-blue-800">
              ({pctDdtk}%)
            </span>
          </div>
          <span className="text-xs font-semibold text-blue-700 block">
            Tumbuh Kembang Normal
          </span>
        </div>

        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
            ANAK TIDAK SEKOLAH &amp; ATS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700">
              {combinedAtsCount}
            </span>
            <span className="text-xs font-bold text-amber-800">
              {totalAts > 0 ? "Anak ATS Terdata" : "Anak"}
            </span>
          </div>
          <span className="text-xs font-semibold text-amber-900 block">
            {totalAts > 0 ? "Data ATS Terverifikasi" : "Pendampingan PAUD / ATS"}
          </span>
        </div>
      </div>

      {/* Grid Kartu Grafik & Chart Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Distribusi Kelompok Usia (0–6 Tahun) */}
        {(activeChartFilter === "semua" || activeChartFilter === "usia") && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Baby className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Distribusi Kelompok Usia (0–6 Thn)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Sebaran kelompok umur balita sesuai rentang PAUD
                  </p>
                </div>
              </div>
            </div>

            {totalBalita === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                <Baby className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Belum Ada Data Usia Anak</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Tambahkan data balita di menu Data Anak untuk melihat sebaran kelompok umur dan rasio gender.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* 0-2 Tahun (Batita) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">0–2 Tahun (Batita / TPA)</span>
                    <span className="font-mono text-slate-900">
                      {usia0to2} anak ({pct0to2}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${pct0to2}%` }}
                    />
                  </div>
                </div>

                {/* 3-4 Tahun (PAUD Awal / KB) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">3–4 Tahun (Kelompok Bermain)</span>
                    <span className="font-mono text-slate-900">
                      {usia3to4} anak ({pct3to4}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${pct3to4}%` }}
                    />
                  </div>
                </div>

                {/* 5-6 Tahun (TK / Kesiapan SD) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">5–6 Tahun (TK / Kesiapan SD)</span>
                    <span className="font-mono text-slate-900">
                      {usia5to6} anak ({pct5to6}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${pct5to6}%` }}
                    />
                  </div>
                </div>

                {/* Rasio Jenis Kelamin */}
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
                    Laki-laki: <strong className="text-slate-900 font-mono">{maleCount}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Perempuan: <strong className="text-slate-900 font-mono">{femaleCount}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart 2: Status Partisipasi PAUD & ATS */}
        {(activeChartFilter === "semua" || activeChartFilter === "paud") && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Partisipasi Pendidikan PAUD / TK
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Status keikutsertaan anak pada satuan pendidikan usia dini
                  </p>
                </div>
              </div>
            </div>

            {totalBalita === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                <GraduationCap className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Belum Ada Data Partisipasi PAUD</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Status anak yang sudah ber-PAUD atau belum bersekolah akan otomatis dianalisis dari data anak terdaftar.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-800">Sudah Bersekolah PAUD / TK</span>
                    <span className="font-mono text-emerald-900">
                      {sudahPaud} anak ({pctPaud}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${pctPaud}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Belum Bersekolah (Usia 0–2 Thn / Calon)</span>
                    <span className="font-mono text-slate-900">
                      {belumSekolah} anak ({pctBelum}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${pctBelum}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-800">Potensi ATS (Perlu Difasilitasi)</span>
                    <span className="font-mono text-amber-900">
                      {potensiAts} anak ({pctPotensiAts}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${pctPotensiAts}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Seluruh satuan PAUD/TK, PKBM, &amp; SKB siap menerima pendaftaran anak.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart 3: Indikator Tumbuh Kembang (DDTK) */}
        {(activeChartFilter === "semua" || activeChartFilter === "ddtk") && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Pemantauan Tumbuh Kembang (DDTK)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Hasil skrining berkala berat/tinggi badan &amp; stimulasi
                  </p>
                </div>
              </div>
            </div>

            {totalBalita === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                <HeartPulse className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Belum Ada Riwayat DDTK</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Pencatatan pengukuran berkala berat/tinggi badan balita oleh Kader Posyandu/Nakes akan terakumulasi di sini.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-3.5 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Sesuai Usia (Normal)</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-700">
                      {ddtkSesuai}
                    </div>
                    <p className="text-xs font-medium text-emerald-800">
                      Tumbuh Kembang Optimal
                    </p>
                  </div>

                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-3.5 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-amber-900 font-bold text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Pantauan Berkala</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-amber-700">
                      {ddtkPantau}
                    </div>
                    <p className="text-xs font-medium text-amber-900">
                      Stimulasi &amp; Gizi
                    </p>
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  💡 Posyandu &amp; PAUD melakukan deteksi dini berkala untuk memastikan stimulasi motorik &amp; kognitif anak terpenuhi.
                </div>
              </>
            )}
          </div>
        )}

        {/* Chart 4: Statistik Anak Tidak Sekolah (ATS) */}
        {(activeChartFilter === "semua" || activeChartFilter === "ats") && komunitas.jenis !== "satuan_paud" && (
          <div className="rounded-2xl border-2 border-amber-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Statistik Anak Tidak Sekolah (ATS)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Hasil pendataan &amp; verifikasi anak tidak sekolah di wilayah
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                {totalAts} Terdata
              </span>
            </div>

            {totalAts === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-6 text-center space-y-2">
                <GraduationCap className="h-8 w-8 text-amber-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Tidak Ada Kasus ATS Terdata</p>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  {potensiAts > 0
                    ? `Terdeteksi ${potensiAts} anak usia 4–6 tahun belum terdaftar di PAUD/TK (Potensi ATS).`
                    : "Seluruh anak di wilayah ini terpantau telah mendapatkan akses pendidikan atau belum usia wajib."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                    <span className="text-[11px] font-bold text-emerald-800 block">TERVERIFIKASI RT</span>
                    <span className="text-xl font-black font-mono text-emerald-700">{atsApproved}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">Validitas Sesuai</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-0.5">
                    <span className="text-[11px] font-bold text-amber-900 block">MENUNGGU VERIFIKASI</span>
                    <span className="text-xl font-black font-mono text-amber-700">{atsPending}</span>
                    <span className="text-[10px] text-amber-700 font-semibold block">Proses Verifikasi</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Minat Ingin Kembali Bersekolah</span>
                    <span className="font-mono text-emerald-800">
                      {atsInginSekolah} dari {totalAts} anak ({totalAts > 0 ? Math.round((atsInginSekolah / totalAts) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${totalAts > 0 ? Math.round((atsInginSekolah / totalAts) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Diagram Batang Usia ATS 6 - 18 Tahun */}
                {(() => {
                  const USIA_LIST_6_18 = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
                  const ageCountMap: Record<number, number> = {};
                  USIA_LIST_6_18.forEach((u) => { ageCountMap[u] = 0; });

                  dataAtsList.forEach((ats) => {
                    const age = ats.usia ? parseInt(String(ats.usia), 10) : 14;
                    if (ageCountMap[age] !== undefined) {
                      ageCountMap[age]++;
                    }
                  });

                  const maxAgeVal = Math.max(...Object.values(ageCountMap), 1);

                  return (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Diagram Batang: Usia ATS (6 – 18 Tahun)
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          6–18 Thn
                        </span>
                      </div>

                      <div className="h-28 w-full flex items-end justify-between gap-1 px-1 pt-4 pb-1 border-b border-slate-200 bg-white rounded-lg">
                        {USIA_LIST_6_18.map((u) => {
                          const count = ageCountMap[u] || 0;
                          const heightPct = count > 0 ? Math.max(12, Math.round((count / maxAgeVal) * 100)) : 0;
                          let barColor = "bg-emerald-500";
                          if (u >= 13 && u <= 15) barColor = "bg-sky-500";
                          else if (u >= 16) barColor = "bg-amber-500";

                          return (
                            <div key={u} className="flex-1 flex flex-col items-center justify-end h-full">
                              <span className="text-[9px] font-bold font-mono text-slate-700 mb-0.5">
                                {count > 0 ? count : ""}
                              </span>
                              <div className="w-full max-w-[18px] h-16 flex items-end justify-center">
                                <div
                                  className={cn("w-full rounded-t-sm transition-all duration-500", count > 0 ? barColor : "bg-slate-100 h-1")}
                                  style={{ height: count > 0 ? `${heightPct}%` : "2px" }}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-slate-600 font-mono mt-1">
                                {u}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Diagram Batang Alasan Terbanyak ke Tersedikit */}
                {(() => {
                  const reasonMap: Record<string, number> = {};
                  dataAtsList.forEach((ats) => {
                    const r = (ats.alasan_tidak_sekolah || "Lainnya").trim();
                    reasonMap[r] = (reasonMap[r] || 0) + 1;
                  });
                  const sorted = Object.entries(reasonMap)
                    .map(([alasan, count]) => ({ alasan, count }))
                    .sort((a, b) => b.count - a.count);
                  const maxVal = Math.max(...sorted.map((s) => s.count), 1);

                  return (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Diagram Batang: Alasan ATS (Terbanyak ke Tersedikit)
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Peringkat
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {sorted.map((item, idx) => {
                          const widthPct = item.count > 0 ? Math.max(5, Math.round((item.count / maxVal) * 100)) : 0;
                          return (
                            <div key={item.alasan} className="space-y-1 bg-white p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-800 truncate max-w-[70%]">
                                  <span className="text-rose-600 mr-1">#{idx + 1}</span> {item.alasan}
                                </span>
                                <span className="text-slate-900 font-mono font-black">{item.count} Anak</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all duration-500", idx === 0 ? "bg-amber-500" : "bg-rose-500")}
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className="text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span>💡 Rekomendasi intervensi disalurkan ke PKBM / SKB Kota Tegal.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart 5: Komposisi Peran Komunitas Warga */}
        {activeChartFilter === "semua" && komunitas.jenis === "warga_kita" && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Kategori Warga &amp; Hak Akses
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Ketentuan status kependudukan di seluruh jenjang
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-950">1. Penduduk (KK &amp; Domisili Kota Tegal)</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-2xs">
                  AKSES PENUH
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-950">2. Penduduk Domisili Di Luar (KK Tegal, Domisili Luar)</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-2xs">
                  AKSES PENUH
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-950">3. Pendatang (KK Luar, Domisili Kota Tegal)</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-2xs">
                  GRAFIK &amp; CHART
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800">4. Pengunjung (KK Luar, Domisili Luar)</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-2xs">
                  GRAFIK &amp; CHART
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
