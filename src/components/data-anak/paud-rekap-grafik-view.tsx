"use client";

import React, { useState, useMemo } from "react";
import {
  School,
  GraduationCap,
  Users,
  MapPin,
  Baby,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  PieChart as PieChartIcon,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateAgeFromBirthDate } from "@/lib/rekap-data-anak-shared";
import type { DataAnakItem } from "@/types/database";

export interface PaudRekapGrafikViewProps {
  childrenList: DataAnakItem[];
  komunitasNama: string;
}

// 27 Kelurahan Resmi se-Kota Tegal
export const DAFTAR_27_KELURAHAN_TEGAL: Array<{
  kelurahan: string;
  kecamatan: "Tegal Timur" | "Tegal Barat" | "Tegal Selatan" | "Margadana";
}> = [
  // Tegal Timur (5)
  { kelurahan: "Kejambon", kecamatan: "Tegal Timur" },
  { kelurahan: "Panggung", kecamatan: "Tegal Timur" },
  { kelurahan: "Slerok", kecamatan: "Tegal Timur" },
  { kelurahan: "Mintaragen", kecamatan: "Tegal Timur" },
  { kelurahan: "Mangkukusuman", kecamatan: "Tegal Timur" },

  // Tegal Barat (7)
  { kelurahan: "Kraton", kecamatan: "Tegal Barat" },
  { kelurahan: "Tegalsari", kecamatan: "Tegal Barat" },
  { kelurahan: "Kemandungan", kecamatan: "Tegal Barat" },
  { kelurahan: "Pekauman", kecamatan: "Tegal Barat" },
  { kelurahan: "Muarareja", kecamatan: "Tegal Barat" },
  { kelurahan: "Pesurungan Kidul", kecamatan: "Tegal Barat" },
  { kelurahan: "Debong Lor", kecamatan: "Tegal Barat" },

  // Tegal Selatan (8)
  { kelurahan: "Bandung", kecamatan: "Tegal Selatan" },
  { kelurahan: "Debong Kidul", kecamatan: "Tegal Selatan" },
  { kelurahan: "Debong Kulon", kecamatan: "Tegal Selatan" },
  { kelurahan: "Debong Tengah", kecamatan: "Tegal Selatan" },
  { kelurahan: "Kalinyamat Wetan", kecamatan: "Tegal Selatan" },
  { kelurahan: "Keturen", kecamatan: "Tegal Selatan" },
  { kelurahan: "Randugunting", kecamatan: "Tegal Selatan" },
  { kelurahan: "Tunon", kecamatan: "Tegal Selatan" },

  // Margadana (7)
  { kelurahan: "Margadana", kecamatan: "Margadana" },
  { kelurahan: "Cabawan", kecamatan: "Margadana" },
  { kelurahan: "Kaligangsa", kecamatan: "Margadana" },
  { kelurahan: "Kalinyamat Kulon", kecamatan: "Margadana" },
  { kelurahan: "Krandon", kecamatan: "Margadana" },
  { kelurahan: "Pesurungan Lor", kecamatan: "Margadana" },
  { kelurahan: "Sumurpanggang", kecamatan: "Margadana" },
];

const KECAMATAN_PALETTE: Record<string, { bg: string; fill: string; text: string; border: string }> = {
  "Kecamatan Tegal Timur": {
    bg: "bg-sky-500",
    fill: "#0284c7",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-300 dark:border-sky-800",
  },
  "Kecamatan Tegal Barat": {
    bg: "bg-emerald-500",
    fill: "#10b981",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800",
  },
  "Kecamatan Tegal Selatan": {
    bg: "bg-indigo-500",
    fill: "#6366f1",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-800",
  },
  "Kecamatan Margadana": {
    bg: "bg-amber-500",
    fill: "#f59e0b",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-800",
  },
  "Luar Kota": {
    bg: "bg-rose-500",
    fill: "#f43f5e",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-800",
  },
};

// Helper normalisasi kecamatan & penentuan Luar Kota
function categorizeWilayah(kec?: string | null, kab?: string | null): string {
  const kabStr = (kab || "").toLowerCase().trim();
  const kecStr = (kec || "").toLowerCase().trim();

  // Jika nama kabupaten bukan Kota Tegal (misal Brebes, Kab. Tegal, Pemalang, Luar Kota)
  if (
    kabStr &&
    (kabStr.includes("kab") ||
      kabStr.includes("brebes") ||
      kabStr.includes("pemalang") ||
      kabStr.includes("slawi") ||
      kabStr.includes("luar") ||
      (!kabStr.includes("tegal") && kabStr !== "kota tegal"))
  ) {
    return "Luar Kota";
  }

  if (kecStr.includes("timur")) return "Kecamatan Tegal Timur";
  if (kecStr.includes("barat")) return "Kecamatan Tegal Barat";
  if (kecStr.includes("selatan")) return "Kecamatan Tegal Selatan";
  if (kecStr.includes("marga")) return "Kecamatan Margadana";

  if (kecStr.includes("luar")) return "Luar Kota";
  return "Kecamatan Tegal Timur"; // default wilayah utama jika tidak terdefinisi
}

export function PaudRekapGrafikView({
  childrenList,
  komunitasNama,
}: PaudRekapGrafikViewProps) {
  const [viewModeUsia, setViewModeUsia] = useState<"diagram" | "matriks">("diagram");
  const [tableSearch, setTableSearch] = useState("");
  const [filterKecamatanTable, setFilterKecamatanTable] = useState<string>("semua");
  const [onlyShowWithStudents, setOnlyShowWithStudents] = useState(false);

  // 1. Perhitungan Dasar
  const totalMurid = childrenList.length;

  // 2. Jenis Kelamin
  const genderStats = useMemo(() => {
    let l = 0;
    let p = 0;
    childrenList.forEach((c) => {
      const g = (c.jenis_kelamin || "").toUpperCase().trim();
      if (g === "L" || g.includes("LAKI")) {
        l++;
      } else {
        p++;
      }
    });
    const pctL = totalMurid > 0 ? Math.round((l / totalMurid) * 100) : 0;
    const pctP = totalMurid > 0 ? Math.round((p / totalMurid) * 100) : 0;
    return { l, p, pctL, pctP };
  }, [childrenList, totalMurid]);

  // 3. Luar Kota vs Dalam Kota Menurut Alamat KK
  const kkKotaStats = useMemo(() => {
    let dalamKota = 0;
    let luarKota = 0;

    childrenList.forEach((c) => {
      const kat = categorizeWilayah(c.kk_kecamatan, c.kk_kabupaten);
      if (kat === "Luar Kota") {
        luarKota++;
      } else {
        dalamKota++;
      }
    });

    const pctDalam = totalMurid > 0 ? Math.round((dalamKota / totalMurid) * 100) : 0;
    const pctLuar = totalMurid > 0 ? Math.round((luarKota / totalMurid) * 100) : 0;
    return { dalamKota, luarKota, pctDalam, pctLuar };
  }, [childrenList, totalMurid]);

  // 4. Sebaran 5 Kategori Alamat KK (Luar Kota + 4 Kecamatan)
  const breakdownKk5 = useMemo(() => {
    const categories = [
      "Kecamatan Tegal Timur",
      "Kecamatan Tegal Barat",
      "Kecamatan Tegal Selatan",
      "Kecamatan Margadana",
      "Luar Kota",
    ];

    const map: Record<string, { total: number; l: number; p: number; pct: number }> = {};
    categories.forEach((cat) => {
      map[cat] = { total: 0, l: 0, p: 0, pct: 0 };
    });

    childrenList.forEach((c) => {
      const cat = categorizeWilayah(c.kk_kecamatan, c.kk_kabupaten);
      const isL = (c.jenis_kelamin || "").toUpperCase().startsWith("L");
      if (map[cat]) {
        map[cat].total++;
        if (isL) map[cat].l++;
        else map[cat].p++;
      }
    });

    categories.forEach((cat) => {
      map[cat].pct = totalMurid > 0 ? Math.round((map[cat].total / totalMurid) * 100) : 0;
    });

    return categories.map((cat) => ({
      nama: cat,
      ...map[cat],
      palette: KECAMATAN_PALETTE[cat],
    }));
  }, [childrenList, totalMurid]);

  // 5. Sebaran 5 Kategori Alamat Domisili (Luar Kota + 4 Kecamatan)
  const breakdownDomisili5 = useMemo(() => {
    const categories = [
      "Kecamatan Tegal Timur",
      "Kecamatan Tegal Barat",
      "Kecamatan Tegal Selatan",
      "Kecamatan Margadana",
      "Luar Kota",
    ];

    const map: Record<string, { total: number; l: number; p: number; pct: number }> = {};
    categories.forEach((cat) => {
      map[cat] = { total: 0, l: 0, p: 0, pct: 0 };
    });

    childrenList.forEach((c) => {
      const cat = categorizeWilayah(c.domisili_kecamatan, c.domisili_kabupaten);
      const isL = (c.jenis_kelamin || "").toUpperCase().startsWith("L");
      if (map[cat]) {
        map[cat].total++;
        if (isL) map[cat].l++;
        else map[cat].p++;
      }
    });

    categories.forEach((cat) => {
      map[cat].pct = totalMurid > 0 ? Math.round((map[cat].total / totalMurid) * 100) : 0;
    });

    return categories.map((cat) => ({
      nama: cat,
      ...map[cat],
      palette: KECAMATAN_PALETTE[cat],
    }));
  }, [childrenList, totalMurid]);

  // 6. Sebaran Menurut Usia (Usia 0 s/d 6 Tahun)
  const usiaEntries = useMemo(() => {
    const ages = [0, 1, 2, 3, 4, 5, 6];
    let max = 1;

    const list = ages.map((age) => {
      let l = 0;
      let p = 0;
      childrenList.forEach((c) => {
        const a = calculateAgeFromBirthDate(c.tanggal_lahir);
        if (a === age) {
          const isL = (c.jenis_kelamin || "").toUpperCase().startsWith("L");
          if (isL) l++;
          else p++;
        }
      });
      const tot = l + p;
      if (tot > max) max = tot;
      const pct = totalMurid > 0 ? Math.round((tot / totalMurid) * 100) : 0;
      return {
        age,
        label: `Usia ${age} Tahun`,
        l,
        p,
        total: tot,
        pct,
      };
    });

    return { list, max };
  }, [childrenList, totalMurid]);

  // 7. Alasan / Motivasi Bersekolah PAUD
  const motivasiEntries = useMemo(() => {
    const countMap: Record<string, number> = {};
    childrenList.forEach((c) => {
      let r = (c.alasan_sekolah || "").trim();
      if (!r) {
        r = "Stimulasi Tumbuh Kembang Sejak Dini";
      }
      countMap[r] = (countMap[r] || 0) + 1;
    });

    // Default jika belum ada data variasi alasan
    const defaults = [
      "Stimulasi Tumbuh Kembang Sejak Dini",
      "Persiapan Masuk Sekolah Dasar (SD)",
      "Sosialisasi & Interaksi Teman Sebaya",
      "Melatih Kemandirian dan Keberanian Anak",
      "Mengembangkan Karakter & Budi Pekerti",
    ];
    defaults.forEach((d) => {
      if (!countMap[d]) countMap[d] = 0;
    });

    const entries = Object.entries(countMap)
      .map(([alasan, jumlah]) => ({
        alasan,
        jumlah,
        persentase: totalMurid > 0 ? Math.round((jumlah / totalMurid) * 100) : 0,
      }))
      .sort((a, b) => b.jumlah - a.jumlah);

    return entries;
  }, [childrenList, totalMurid]);

  // 8. Tabel Sebaran 27 Kelurahan Alamat KK
  const kelurahanTableData = useMemo(() => {
    const list: Array<{
      no: number;
      kelurahan: string;
      kecamatan: string;
      l: number;
      p: number;
      total: number;
      pct: number;
    }> = [];

    // Inisialisasi 27 Kelurahan Kota Tegal
    DAFTAR_27_KELURAHAN_TEGAL.forEach((item, idx) => {
      list.push({
        no: idx + 1,
        kelurahan: item.kelurahan,
        kecamatan: item.kecamatan,
        l: 0,
        p: 0,
        total: 0,
        pct: 0,
      });
    });

    // Baris Khusus Luar Kota Tegal
    let luarKotaL = 0;
    let luarKotaP = 0;

    childrenList.forEach((c) => {
      const isL = (c.jenis_kelamin || "").toUpperCase().startsWith("L");
      const isLuar = categorizeWilayah(c.kk_kecamatan, c.kk_kabupaten) === "Luar Kota";

      if (isLuar) {
        if (isL) luarKotaL++;
        else luarKotaP++;
        return;
      }

      const kelStr = (c.kk_kelurahan || "").toLowerCase().trim();
      const target = list.find(
        (k) =>
          k.kelurahan.toLowerCase() === kelStr ||
          kelStr.includes(k.kelurahan.toLowerCase()) ||
          k.kelurahan.toLowerCase().includes(kelStr)
      );

      if (target) {
        target.total++;
        if (isL) target.l++;
        else target.p++;
      } else {
        // Jika tidak cocok dengan kelurahan yang mana pun di Tegal, masukkan ke Luar Kota
        if (isL) luarKotaL++;
        else luarKotaP++;
      }
    });

    // Hitung persentase untuk masing-masing kelurahan
    list.forEach((item) => {
      item.pct = totalMurid > 0 ? Math.round((item.total / totalMurid) * 100) : 0;
    });

    // Tambahkan baris Luar Kota Tegal jika ada
    if (luarKotaL + luarKotaP > 0) {
      list.push({
        no: list.length + 1,
        kelurahan: "Luar Kota Tegal",
        kecamatan: "Luar Kota",
        l: luarKotaL,
        p: luarKotaP,
        total: luarKotaL + luarKotaP,
        pct: totalMurid > 0 ? Math.round(((luarKotaL + luarKotaP) / totalMurid) * 100) : 0,
      });
    }

    return list;
  }, [childrenList, totalMurid]);

  // Filter Tabel Kelurahan
  const filteredKelurahanRows = useMemo(() => {
    return kelurahanTableData.filter((item) => {
      // Filter teks pencarian
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const match =
          item.kelurahan.toLowerCase().includes(q) ||
          item.kecamatan.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Filter kecamatan
      if (filterKecamatanTable !== "semua") {
        if (item.kecamatan !== filterKecamatanTable) return false;
      }
      // Filter hanya yang ada muridnya
      if (onlyShowWithStudents && item.total === 0) {
        return false;
      }
      return true;
    });
  }, [kelurahanTableData, tableSearch, filterKecamatanTable, onlyShowWithStudents]);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION RESMI STATISTIK PAUD                   */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 sm:p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <School className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                STATISTIK LEMBAGA RESMI
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-foreground tracking-tight mt-0.5">
              Statistik &amp; Grafik {komunitasNama}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Profil peserta didik PAUD menurut jenis kelamin, KK, domisili, sebaran usia, dan motivasi bersekolah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-right">
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 block">
              TOTAL PESERTA DIDIK
            </span>
            <span className="text-lg font-black font-mono text-teal-700 dark:text-teal-300">
              {totalMurid.toLocaleString("id-ID")} Murid
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TOP METRIC CARDS (4 KARTU RINGKASAN PAUD)              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Murid */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
              TOTAL MURID (0–6 THN)
            </span>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Baby className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {totalMurid.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-muted-foreground">Siswa</span>
          </div>
          <div className="flex items-center justify-between text-2xs font-bold text-muted-foreground border-t border-border pt-2">
            <span className="text-sky-600 dark:text-sky-400">L: {genderStats.l} Siswa</span>
            <span className="text-rose-600 dark:text-rose-400">P: {genderStats.p} Siswa</span>
          </div>
        </div>

        {/* Card 2: Dalam Kota Tegal (KK) */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
              DALAM KOTA (KK)
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {kkKotaStats.dalamKota.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              ({kkKotaStats.pctDalam}%)
            </span>
          </div>
          <p className="text-2xs text-muted-foreground font-medium border-t border-border pt-2 truncate">
            Alamat KK berada di Kota Tegal
          </p>
        </div>

        {/* Card 3: Luar Kota Tegal (KK) */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
              LUAR KOTA (KK)
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {kkKotaStats.luarKota.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-rose-600 font-mono">
              ({kkKotaStats.pctLuar}%)
            </span>
          </div>
          <p className="text-2xs text-muted-foreground font-medium border-t border-border pt-2 truncate">
            Alamat KK di luar Kota Tegal
          </p>
        </div>

        {/* Card 4: Usia Dominan */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
              STATUS LEMBAGA
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              100% Aktif
            </span>
          </div>
          <p className="text-2xs text-muted-foreground font-medium border-t border-border pt-2 truncate">
            Peserta Didik Bersekolah Resmi
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ROW 1: JENIS KELAMIN & KOMPARASI KK DALAM/LUAR KOTA     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 3.1 Jumlah Murid Berdasarkan Jenis Kelamin */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                Jumlah Murid Berdasarkan Jenis Kelamin
              </h3>
              <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
                Komposisi rasio gender peserta didik di {komunitasNama}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 text-center space-y-1">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                Laki-laki
              </span>
              <div className="text-3xl font-black font-mono text-foreground">
                {genderStats.l}
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {genderStats.pctL}% dari total
              </span>
            </div>

            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center space-y-1">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Perempuan
              </span>
              <div className="text-3xl font-black font-mono text-foreground">
                {genderStats.p}
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {genderStats.pctP}% dari total
              </span>
            </div>
          </div>

          {/* Progress bar komparasi gender */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-2xs font-bold text-muted-foreground">
              <span>Laki-laki ({genderStats.pctL}%)</span>
              <span>Perempuan ({genderStats.pctP}%)</span>
            </div>
            <div className="h-3 w-full flex rounded-full overflow-hidden bg-muted">
              <div
                className="h-full bg-sky-500 transition-all duration-500"
                style={{ width: `${genderStats.pctL}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${genderStats.pctP}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3.2 Jumlah Murid Luar Kota dan Dalam Kota Menurut Alamat KK */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                Murid Luar Kota &amp; Dalam Kota (Alamat KK)
              </h3>
              <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
                Proporsi kepemilikan Kartu Keluarga Kota Tegal vs Luar Kota
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Dalam Kota Tegal
              </span>
              <div className="text-3xl font-black font-mono text-foreground">
                {kkKotaStats.dalamKota}
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {kkKotaStats.pctDalam}% dari total
              </span>
            </div>

            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center space-y-1">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Luar Kota Tegal
              </span>
              <div className="text-3xl font-black font-mono text-foreground">
                {kkKotaStats.luarKota}
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {kkKotaStats.pctLuar}% dari total
              </span>
            </div>
          </div>

          {/* Progress bar komparasi KK */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-2xs font-bold text-muted-foreground">
              <span>Dalam Kota ({kkKotaStats.pctDalam}%)</span>
              <span>Luar Kota ({kkKotaStats.pctLuar}%)</span>
            </div>
            <div className="h-3 w-full flex rounded-full overflow-hidden bg-muted">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${kkKotaStats.pctDalam}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${kkKotaStats.pctLuar}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. ROW 2: ALAMAT KK vs ALAMAT DOMISILI (5 KATEGORI)       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 4.1 Jumlah Murid Berdasarkan Alamat KK */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                  Jumlah Murid Berdasarkan Alamat KK
                </h3>
                <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
                  Sebaran wilayah asal Kartu Keluarga siswa
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              5 Kategori
            </span>
          </div>

          <div className="space-y-3">
            {breakdownKk5.map((item) => (
              <div key={item.nama} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", item.palette.bg)} />
                    <span>{item.nama}</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground text-2xs">
                      (L:{item.l} P:{item.p})
                    </span>
                    <span className="text-foreground font-black">
                      {item.total} Siswa
                    </span>
                    <span className="text-2xs text-muted-foreground">
                      ({item.pct}%)
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", item.palette.bg)}
                    style={{ width: `${item.total > 0 ? Math.max(3, item.pct) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4.2 Jumlah Murid Berdasarkan Alamat Domisili */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                  Jumlah Murid Berdasarkan Alamat Domisili
                </h3>
                <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
                  Sebaran tempat tinggal nyata peserta didik saat ini
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              5 Kategori
            </span>
          </div>

          <div className="space-y-3">
            {breakdownDomisili5.map((item) => (
              <div key={item.nama} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", item.palette.bg)} />
                    <span>{item.nama}</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground text-2xs">
                      (L:{item.l} P:{item.p})
                    </span>
                    <span className="text-foreground font-black">
                      {item.total} Siswa
                    </span>
                    <span className="text-2xs text-muted-foreground">
                      ({item.pct}%)
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", item.palette.bg)}
                    style={{ width: `${item.total > 0 ? Math.max(3, item.pct) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. ROW 3: JUMLAH MURID MENURUT USIA (0 - 6 TAHUN)         */}
      {/* ========================================================= */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Baby className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                Jumlah Murid Menurut Usia (Usia 0 s/d 6 Tahun)
              </h3>
              <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
                Sebaran usia tunggal siswa dari Usia 0, 1, 2, 3, 4, 5, hingga 6 Tahun
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewModeUsia("diagram")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                viewModeUsia === "diagram"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Diagram Grafik
            </button>
            <button
              type="button"
              onClick={() => setViewModeUsia("matriks")}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                viewModeUsia === "matriks"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Tabel Matriks
            </button>
          </div>
        </div>

        {viewModeUsia === "diagram" ? (
          <div className="space-y-3.5">
            {usiaEntries.list.map((item) => {
              const barHeightPct =
                usiaEntries.max > 0 ? Math.round((item.total / usiaEntries.max) * 100) : 0;

              return (
                <div key={item.age} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground w-28 truncate">{item.label}</span>
                    <div className="flex items-center gap-2.5 font-mono">
                      <span className="text-sky-600 dark:text-sky-400 text-2xs">
                        L: {item.l}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 text-2xs">
                        P: {item.p}
                      </span>
                      <span className="text-foreground font-black">
                        {item.total} Siswa
                      </span>
                      <span className="text-2xs text-muted-foreground">
                        ({item.pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted flex overflow-hidden">
                    {item.total > 0 ? (
                      <>
                        <div
                          className="h-full bg-sky-500 transition-all duration-500"
                          style={{
                            width: `${item.total > 0 ? (item.l / item.total) * barHeightPct : 0}%`,
                          }}
                          title={`Laki-laki: ${item.l}`}
                        />
                        <div
                          className="h-full bg-rose-500 transition-all duration-500"
                          style={{
                            width: `${item.total > 0 ? (item.p / item.total) * barHeightPct : 0}%`,
                          }}
                          title={`Perempuan: ${item.p}`}
                        />
                      </>
                    ) : (
                      <div className="h-full w-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground border-b border-border font-bold">
                  <th className="p-2.5 text-left">Kelompok Umur</th>
                  <th className="p-2.5 text-sky-600 dark:text-sky-400">Laki-laki (L)</th>
                  <th className="p-2.5 text-rose-600 dark:text-rose-400">Perempuan (P)</th>
                  <th className="p-2.5 text-foreground">Total Siswa</th>
                  <th className="p-2.5 text-foreground">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usiaEntries.list.map((item) => (
                  <tr key={item.age} className="hover:bg-muted/40 transition-colors">
                    <td className="p-2.5 text-left font-bold text-foreground">
                      {item.label}
                    </td>
                    <td className="p-2.5 font-mono text-sky-600 dark:text-sky-400 font-bold">
                      {item.l}
                    </td>
                    <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {item.p}
                    </td>
                    <td className="p-2.5 font-mono font-black text-foreground">
                      {item.total}
                    </td>
                    <td className="p-2.5 font-mono text-muted-foreground">
                      {item.pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/60 font-black border-t-2 border-border">
                  <td className="p-2.5 text-left">TOTAL KESELURUHAN</td>
                  <td className="p-2.5 text-sky-600 dark:text-sky-400 font-mono">
                    {genderStats.l}
                  </td>
                  <td className="p-2.5 text-rose-600 dark:text-rose-400 font-mono">
                    {genderStats.p}
                  </td>
                  <td className="p-2.5 font-mono text-teal-700 dark:text-teal-300">
                    {totalMurid}
                  </td>
                  <td className="p-2.5 font-mono">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. ROW 4: ALASAN / MOTIVASI BERSEKOLAH PAUD               */}
      {/* ========================================================= */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-foreground">
              Alasan / Motivasi Bersekolah PAUD
            </h3>
            <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
              Faktor pendorong orang tua mendaftarkan anak bersekolah di {komunitasNama}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {motivasiEntries.map((item, idx) => (
            <div key={item.alasan} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-black">
                    {idx + 1}
                  </span>
                  <span>{item.alasan}</span>
                </span>
                <span className="font-mono text-muted-foreground font-bold">
                  {item.jumlah} Siswa ({item.persentase}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.jumlah > 0 ? Math.max(3, item.persentase) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. ROW 5: TABEL JUMLAH MURID BERDASARKAN ALAMAT KK DARI   */}
      {/*    27 KELURAHAN SE-KOTA TEGAL                            */}
      {/* ========================================================= */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                Tabel Jumlah Murid Berdasarkan Alamat KK (27 Kelurahan)
              </h3>
              <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
                Rincian sebaran asal Kartu Keluarga murid dari 27 Kelurahan di Kota Tegal dan Luar Kota
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-mono">
            {filteredKelurahanRows.length} Wilayah Ditampilkan
          </span>
        </div>

        {/* Filter Bar Tabel */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama kelurahan atau kecamatan..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterKecamatanTable}
              onChange={(e) => setFilterKecamatanTable(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="semua">Semua Kecamatan</option>
              <option value="Tegal Timur">Tegal Timur</option>
              <option value="Tegal Barat">Tegal Barat</option>
              <option value="Tegal Selatan">Tegal Selatan</option>
              <option value="Margadana">Margadana</option>
              <option value="Luar Kota">Luar Kota</option>
            </select>

            <button
              type="button"
              onClick={() => setOnlyShowWithStudents(!onlyShowWithStudents)}
              className={cn(
                "h-9 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer",
                onlyShowWithStudents
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Ada Murid</span>
            </button>
          </div>
        </div>

        {/* Tabel Data Kelurahan */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground border-b border-border font-bold">
                <th className="p-2.5 text-center w-12">No</th>
                <th className="p-2.5">Kelurahan</th>
                <th className="p-2.5">Kecamatan</th>
                <th className="p-2.5 text-center text-sky-600 dark:text-sky-400">Laki-laki (L)</th>
                <th className="p-2.5 text-center text-rose-600 dark:text-rose-400">Perempuan (P)</th>
                <th className="p-2.5 text-center text-foreground font-black">Total Murid</th>
                <th className="p-2.5 text-center text-foreground">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredKelurahanRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    Tidak ada kelurahan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredKelurahanRows.map((row, idx) => (
                  <tr
                    key={row.kelurahan}
                    className={cn(
                      "transition-colors",
                      row.total > 0
                        ? "bg-teal-500/5 hover:bg-teal-500/10 font-medium"
                        : "hover:bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <td className="p-2.5 text-center font-mono">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-foreground flex items-center gap-1.5">
                      {row.total > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                      )}
                      <span>{row.kelurahan}</span>
                    </td>
                    <td className="p-2.5 font-medium">{row.kecamatan}</td>
                    <td className="p-2.5 text-center font-mono text-sky-600 dark:text-sky-400 font-bold">
                      {row.l > 0 ? row.l : "-"}
                    </td>
                    <td className="p-2.5 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {row.p > 0 ? row.p : "-"}
                    </td>
                    <td className="p-2.5 text-center font-mono font-black text-foreground">
                      {row.total > 0 ? `${row.total} Siswa` : "0"}
                    </td>
                    <td className="p-2.5 text-center font-mono font-semibold">
                      {row.pct > 0 ? `${row.pct}%` : "0%"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-muted/70 font-black border-t-2 border-border">
                <td colSpan={3} className="p-2.5 text-left uppercase">
                  TOTAL KESELURUHAN MURID
                </td>
                <td className="p-2.5 text-center font-mono text-sky-600 dark:text-sky-400">
                  {genderStats.l}
                </td>
                <td className="p-2.5 text-center font-mono text-rose-600 dark:text-rose-400">
                  {genderStats.p}
                </td>
                <td className="p-2.5 text-center font-mono text-teal-700 dark:text-teal-300">
                  {totalMurid} Siswa
                </td>
                <td className="p-2.5 text-center font-mono">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
