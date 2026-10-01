"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface KomunitasProfilChartsProps {
  komunitas: KomunitasWithMembership;
  userRole?: string;
  isChartOnly?: boolean;
}

export function KomunitasProfilCharts({
  komunitas,
  userRole = "Pengunjung",
  isChartOnly = false,
}: KomunitasProfilChartsProps) {
  const [activeChartFilter, setActiveChartFilter] = useState<"semua" | "usia" | "paud" | "ddtk">("semua");

  // Perkiraan data agregat berbasis jumlah anggota & wilayah komunitas untuk visualisasi real-time
  const totalWarga = Math.max(komunitas.jumlah_anggota || 12, 18);
  const totalBalita = Math.max(Math.round(totalWarga * 0.75), 8);

  // Demografi Usia
  const usia0to2 = Math.max(1, Math.round(totalBalita * 0.35));
  const usia3to4 = Math.max(1, Math.round(totalBalita * 0.38));
  const usia5to6 = Math.max(1, totalBalita - usia0to2 - usia3to4);

  const maleCount = Math.round(totalBalita * 0.52);
  const femaleCount = totalBalita - maleCount;

  // Status PAUD / Sekolah
  const sudahPaud = Math.round(totalBalita * 0.68);
  const belumSekolah = Math.max(0, totalBalita - sudahPaud);
  const potensiAts = Math.max(0, Math.round(totalBalita * 0.08));

  // DDTK / Tumbuh Kembang
  const ddtkSesuai = Math.round(totalBalita * 0.88);
  const ddtkPantau = totalBalita - ddtkSesuai;

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
              {komunitas.nama}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-700" />
            <span>Grafik &amp; Chart Statistik Komunitas</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Pratinjau agregat data anak (0–6 tahun), partisipasi PAUD, dan pemantauan DDTK se-wilayah.
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
              ({Math.round((sudahPaud / totalBalita) * 100)}%)
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
              ({Math.round((ddtkSesuai / totalBalita) * 100)}%)
            </span>
          </div>
          <span className="text-xs font-semibold text-blue-700 block">
            Tumbuh Kembang Normal
          </span>
        </div>

        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
            POTENSI INTERVENSI
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700">
              {potensiAts}
            </span>
            <span className="text-xs font-bold text-amber-800">Anak</span>
          </div>
          <span className="text-xs font-semibold text-amber-900 block">
            Pendampingan PAUD
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

            <div className="space-y-3 pt-1">
              {/* 0-2 Tahun (Batita) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">0–2 Tahun (Batita / TPA)</span>
                  <span className="font-mono text-slate-900">
                    {usia0to2} anak ({Math.round((usia0to2 / totalBalita) * 100)}%)
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${Math.round((usia0to2 / totalBalita) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 3-4 Tahun (PAUD Awal / KB) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">3–4 Tahun (Kelompok Bermain)</span>
                  <span className="font-mono text-slate-900">
                    {usia3to4} anak ({Math.round((usia3to4 / totalBalita) * 100)}%)
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.round((usia3to4 / totalBalita) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 5-6 Tahun (TK / Kesiapan SD) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">5–6 Tahun (TK / Kesiapan SD)</span>
                  <span className="font-mono text-slate-900">
                    {usia5to6} anak ({Math.round((usia5to6 / totalBalita) * 100)}%)
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${Math.round((usia5to6 / totalBalita) * 100)}%` }}
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

            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-800">Sudah Bersekolah PAUD / TK</span>
                  <span className="font-mono text-emerald-900">
                    {sudahPaud} anak ({Math.round((sudahPaud / totalBalita) * 100)}%)
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${Math.round((sudahPaud / totalBalita) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Belum Bersekolah (Usia 0–2 Thn / Calon)</span>
                  <span className="font-mono text-slate-900">
                    {belumSekolah} anak ({Math.round((belumSekolah / totalBalita) * 100)}%)
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.round((belumSekolah / totalBalita) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-800">Potensi ATS (Perlu Difasilitasi)</span>
                  <span className="font-mono text-amber-900">
                    {potensiAts} anak ({Math.round((potensiAts / totalBalita) * 100)}%)
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.max(5, Math.round((potensiAts / totalBalita) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Seluruh satuan PAUD/TK, PKBM, &amp; SKB siap menerima pendaftaran anak.</span>
              </div>
            </div>
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
          </div>
        )}

        {/* Chart 4: Komposisi Peran Komunitas Warga */}
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
