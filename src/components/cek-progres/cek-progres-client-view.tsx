"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  MapPin,
  ExternalLink,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  UserX,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";
import { cn } from "@/lib/utils";
import type {
  ProgresPaudItem,
  CekProgresPaudSummary,
  KegiatanAdministratif,
  StatusPenyelesaianProgres,
} from "@/types/database";

interface CekProgresClientViewProps {
  kegiatan: KegiatanAdministratif;
  initialItems: ProgresPaudItem[];
  summary: CekProgresPaudSummary;
  userRoleLabel: string;
  adminScopeLabel: string;
}

type SortField = "persentase" | "nama" | "target" | "diperbarui" | "anggota";
type SortDirection = "asc" | "desc";

export function CekProgresClientView({
  kegiatan,
  initialItems,
  summary,
  userRoleLabel,
  adminScopeLabel,
}: CekProgresClientViewProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState<string>("semua");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [filterKeanggotaan, setFilterKeanggotaan] = useState<string>("semua");

  // Sorting States - Default: persentase DESC agar yang 100% atau progres tinggi di atas
  const [sortField, setSortField] = useState<SortField>("persentase");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Toggle sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filtered & Sorted Items
  const processedItems = useMemo(() => {
    let result = [...initialItems];

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.nama_paud.toLowerCase().includes(q) ||
          it.kecamatan.toLowerCase().includes(q) ||
          it.kelurahan.toLowerCase().includes(q) ||
          it.jenis_institusi.toLowerCase().includes(q)
      );
    }

    // 2. Filter Kecamatan
    if (filterKecamatan !== "semua") {
      result = result.filter((it) => it.kecamatan === filterKecamatan);
    }

    // 3. Filter Status
    if (filterStatus !== "semua") {
      result = result.filter((it) => it.status_penyelesaian === filterStatus);
    }

    // 4. Filter Keanggotaan
    if (filterKeanggotaan === "ada") {
      result = result.filter((it) => it.has_anggota);
    } else if (filterKeanggotaan === "belum") {
      result = result.filter((it) => !it.has_anggota);
    }

    // 5. Sorting
    result.sort((a, b) => {
      // Helper kesiapan akun guru
      const hasAccA = a.has_anggota || a.jumlah_anggota > 0 ? 1 : 0;
      const hasAccB = b.has_anggota || b.jumlah_anggota > 0 ? 1 : 0;

      if (sortField === "persentase") {
        if (sortDirection === "desc") {
          // 1. Utamakan Satuan PAUD yang SUDAH ADA akun gurunya terlebih dahulu
          if (hasAccB !== hasAccA) {
            return hasAccB - hasAccA;
          }
          // 2. Prosentase proses penyelesaian tertinggi
          if (b.persentase_selesai !== a.persentase_selesai) {
            return b.persentase_selesai - a.persentase_selesai;
          }
          // 3. Jumlah siswa yang telah diperbarui terbanyak
          if (b.total_diperbarui !== a.total_diperbarui) {
            return b.total_diperbarui - a.total_diperbarui;
          }
          // 4. Target siswa terbanyak
          if (b.total_peserta_didik !== a.total_peserta_didik) {
            return b.total_peserta_didik - a.total_peserta_didik;
          }
          // 5. Jumlah akun guru terbanyak
          if (b.jumlah_anggota !== a.jumlah_anggota) {
            return b.jumlah_anggota - a.jumlah_anggota;
          }
          // 6. Abjad nama PAUD
          return a.nama_paud.localeCompare(b.nama_paud);
        } else {
          // Ascending: dari persentase terendah
          if (a.persentase_selesai !== b.persentase_selesai) {
            return a.persentase_selesai - b.persentase_selesai;
          }
          if (hasAccA !== hasAccB) {
            return hasAccA - hasAccB;
          }
          return a.nama_paud.localeCompare(b.nama_paud);
        }
      } else if (sortField === "anggota") {
        if (sortDirection === "desc") {
          if (b.jumlah_anggota !== a.jumlah_anggota) {
            return b.jumlah_anggota - a.jumlah_anggota;
          }
          if (b.persentase_selesai !== a.persentase_selesai) {
            return b.persentase_selesai - a.persentase_selesai;
          }
          if (b.total_diperbarui !== a.total_diperbarui) {
            return b.total_diperbarui - a.total_diperbarui;
          }
          return a.nama_paud.localeCompare(b.nama_paud);
        } else {
          if (a.jumlah_anggota !== b.jumlah_anggota) {
            return a.jumlah_anggota - b.jumlah_anggota;
          }
          return a.nama_paud.localeCompare(b.nama_paud);
        }
      } else if (sortField === "target") {
        if (sortDirection === "desc") {
          if (b.total_peserta_didik !== a.total_peserta_didik) {
            return b.total_peserta_didik - a.total_peserta_didik;
          }
          if (hasAccB !== hasAccA) {
            return hasAccB - hasAccA;
          }
          return b.persentase_selesai - a.persentase_selesai;
        } else {
          if (a.total_peserta_didik !== b.total_peserta_didik) {
            return a.total_peserta_didik - b.total_peserta_didik;
          }
          return a.nama_paud.localeCompare(b.nama_paud);
        }
      } else if (sortField === "diperbarui") {
        if (sortDirection === "desc") {
          if (b.total_diperbarui !== a.total_diperbarui) {
            return b.total_diperbarui - a.total_diperbarui;
          }
          if (b.persentase_selesai !== a.persentase_selesai) {
            return b.persentase_selesai - a.persentase_selesai;
          }
          if (hasAccB !== hasAccA) {
            return hasAccB - hasAccA;
          }
          return a.nama_paud.localeCompare(b.nama_paud);
        } else {
          if (a.total_diperbarui !== b.total_diperbarui) {
            return a.total_diperbarui - b.total_diperbarui;
          }
          return a.nama_paud.localeCompare(b.nama_paud);
        }
      } else if (sortField === "nama") {
        const comp = a.nama_paud.localeCompare(b.nama_paud);
        return sortDirection === "asc" ? comp : -comp;
      }

      return 0;
    });

    return result;
  }, [
    initialItems,
    searchQuery,
    filterKecamatan,
    filterStatus,
    filterKeanggotaan,
    sortField,
    sortDirection,
  ]);

  // Donut Chart Segment Calculations
  const donutData = useMemo(() => {
    const total = summary.totalPaud || 1;
    const selesaiPct = (summary.paudSelesai / total) * 100;
    const progresPct = (summary.paudDalamProgres / total) * 100;
    const belumPct = (summary.paudBelumMulai / total) * 100;
    const kosongCount = Math.max(
      0,
      summary.totalPaud -
        (summary.paudSelesai + summary.paudDalamProgres + summary.paudBelumMulai)
    );
    const kosongPct = (kosongCount / total) * 100;

    return {
      selesaiCount: summary.paudSelesai,
      selesaiPct: Math.round(selesaiPct * 10) / 10,
      progresCount: summary.paudDalamProgres,
      progresPct: Math.round(progresPct * 10) / 10,
      belumCount: summary.paudBelumMulai,
      belumPct: Math.round(belumPct * 10) / 10,
      kosongCount,
      kosongPct: Math.round(kosongPct * 10) / 10,
    };
  }, [summary]);

  // Deskripsi urutan aktif yang jelas dan representatif
  const sortDescription = useMemo(() => {
    if (sortField === "persentase") {
      return sortDirection === "desc"
        ? "Akun Guru & Persentase Tertinggi"
        : "Persentase Terendah";
    }
    if (sortField === "nama") {
      return sortDirection === "asc" ? "Nama Satuan PAUD (A - Z)" : "Nama Satuan PAUD (Z - A)";
    }
    if (sortField === "anggota") {
      return sortDirection === "desc" ? "Jumlah Akun Guru (Terbanyak)" : "Jumlah Akun Guru (Tersedikit)";
    }
    if (sortField === "target") {
      return sortDirection === "desc" ? "Target Siswa (Terbanyak)" : "Target Siswa (Tersedikit)";
    }
    if (sortField === "diperbarui") {
      return sortDirection === "desc" ? "Siswa Diperbarui (Terbanyak)" : "Siswa Diperbarui (Tersedikit)";
    }
    return `${sortField} (${sortDirection === "asc" ? "Terkecil" : "Terbesar"})`;
  }, [sortField, sortDirection]);

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-6 max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. HERO BANNER CEK PROGRES                                 */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-5 sm:p-7 shadow-sm border border-teal-700/60">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-0.5 text-2xs font-bold text-teal-100 backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>PEMANTAUAN PROGRES KEGIATAN • KOTA TEGAL</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 text-2xs font-mono font-bold text-amber-300">
                <ShieldCheck className="h-3 w-3" />
                <span>{userRoleLabel}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
              {kegiatan.judul}
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              {kegiatan.deskripsi}
            </p>

            <div className="flex items-center gap-2 pt-1 text-2xs sm:text-xs text-teal-200/80 font-mono">
              <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>Wilayah Cakupan: <strong>{adminScopeLabel}</strong></span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <PrintButton variant="hero" size="sm" />
            <div className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md text-right hidden sm:block">
              <span className="text-xs font-semibold text-teal-200 block uppercase">
                Tingkat Capaian
              </span>
              <span className="text-2xl font-black font-mono text-amber-300">
                {summary.persentaseTotal}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. 4 KARTU METRIK UTAMA                                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Satuan PAUD */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Satuan PAUD
            </span>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {summary.totalPaud}
            </span>
            <span className="text-2xs text-muted-foreground font-semibold">
              Lembaga
            </span>
          </div>
          <p className="text-2xs text-muted-foreground border-t border-border pt-2 truncate">
            TK, KB, RA, SPS &amp; TPA Terpantau
          </p>
        </div>

        {/* Metric 2: Kesiapan Guru/Operator */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Guru Terhubung
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {summary.paudWithMembers}
            </span>
            <span className="text-2xs text-muted-foreground font-semibold">
              / {summary.totalPaud}
            </span>
          </div>
          <p className="text-2xs text-muted-foreground border-t border-border pt-2 truncate">
            {summary.paudWithoutMembers > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {summary.paudWithoutMembers} PAUD belum ada akun
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                100% PAUD memiliki operator
              </span>
            )}
          </p>
        </div>

        {/* Metric 3: Total Siswa Diperbarui */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Siswa Diperbarui
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
              {summary.totalDiperbarui}
            </span>
            <span className="text-2xs text-muted-foreground font-semibold">
              / {summary.totalPesertaDidik}
            </span>
          </div>
          <p className="text-2xs text-muted-foreground border-t border-border pt-2 truncate">
            Capaian <strong>{summary.persentaseTotal}%</strong> dari total sasaran
          </p>
        </div>

        {/* Metric 4: Satuan Selesai 100% */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tuntas 100%
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {summary.paudSelesai}
            </span>
            <span className="text-2xs text-muted-foreground font-semibold">
              PAUD Selesai
            </span>
          </div>
          <p className="text-2xs text-muted-foreground border-t border-border pt-2 truncate">
            {summary.paudDalamProgres} sedang progres, {summary.paudBelumMulai} belum
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. VISUAL CHARTS (DONUT STATISTIK + BAR CHART WILAYAH)    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Donut Status Penyelesaian */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <PieChartIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                Ringkasan Status Penyelesaian
              </h3>
              <p className="text-2xs text-muted-foreground font-medium">
                Komposisi satuan berdasarkan status tuntas seluruh peserta didik
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            {/* Custom SVG Donut Chart */}
            <div className="relative h-40 w-40 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-muted/60 stroke-current"
                  strokeWidth="3.8"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Selesai Ring (Emerald) */}
                <path
                  className="text-emerald-500 stroke-current transition-all duration-700"
                  strokeWidth="3.8"
                  strokeDasharray={`${donutData.selesaiPct}, 100`}
                  strokeDashoffset="0"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Dalam Progres Ring (Amber) */}
                <path
                  className="text-amber-500 stroke-current transition-all duration-700"
                  strokeWidth="3.8"
                  strokeDasharray={`${donutData.progresPct}, 100`}
                  strokeDashoffset={`-${donutData.selesaiPct}`}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Belum Mulai Ring (Rose) */}
                <path
                  className="text-rose-500 stroke-current transition-all duration-700"
                  strokeWidth="3.8"
                  strokeDasharray={`${donutData.belumPct}, 100`}
                  strokeDashoffset={`-${donutData.selesaiPct + donutData.progresPct}`}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-black font-mono text-foreground leading-none">
                  {summary.persentaseTotal}%
                </span>
                <span className="text-[10px] text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">
                  Capaian Kota
                </span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2.5 w-full sm:w-auto text-xs">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-foreground">Selesai 100%:</span>
                </div>
                <span className="font-mono font-bold text-foreground">
                  {donutData.selesaiCount} PAUD ({donutData.selesaiPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-foreground">Dalam Progres:</span>
                </div>
                <span className="font-mono font-bold text-foreground">
                  {donutData.progresCount} PAUD ({donutData.progresPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-semibold text-foreground">Belum Memulai:</span>
                </div>
                <span className="font-mono font-bold text-foreground">
                  {donutData.belumCount} PAUD ({donutData.belumPct}%)
                </span>
              </div>

              {donutData.kosongCount > 0 && (
                <div className="flex items-center justify-between sm:justify-start gap-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-muted-foreground/40 shrink-0" />
                    <span>Belum Ada Siswa:</span>
                  </div>
                  <span className="font-mono font-bold">
                    {donutData.kosongCount} PAUD
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart 2: Capaian Berdasarkan Kecamatan */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                Capaian Per Kecamatan
              </h3>
              <p className="text-2xs text-muted-foreground font-medium">
                Distribusi persentase pembaruan data murid di 4 wilayah kecamatan
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {summary.perKecamatan.map((kec) => (
              <div key={kec.kecamatan} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{kec.kecamatan}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-2xs text-muted-foreground">
                      {kec.totalDiperbarui} / {kec.totalPesertaDidik} murid ({kec.paudSelesai}/{kec.totalPaud} tuntas)
                    </span>
                    <span className="font-bold text-primary">{kec.persentase}%</span>
                  </div>
                </div>

                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      kec.persentase >= 100
                        ? "bg-emerald-500"
                        : kec.persentase > 50
                        ? "bg-teal-500"
                        : kec.persentase > 0
                        ? "bg-amber-500"
                        : "bg-muted-foreground/30"
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, kec.persentase))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. FILTER CONTROLS & SEARCH BAR                            */}
      {/* ========================================================= */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama PAUD, kelurahan, atau kecamatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 min-h-[42px] rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kecamatan */}
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="min-h-[42px] px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="semua">Semua Kecamatan</option>
              <option value="Tegal Timur">Tegal Timur</option>
              <option value="Tegal Barat">Tegal Barat</option>
              <option value="Tegal Selatan">Tegal Selatan</option>
              <option value="Margadana">Margadana</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-h-[42px] px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="SELESAI">Selesai (100%)</option>
              <option value="PROGRES">Dalam Progres</option>
              <option value="BELUM_MULAI">Belum Memulai</option>
              <option value="KOSONG">Belum Ada Siswa</option>
            </select>

            {/* Filter Keanggotaan */}
            <select
              value={filterKeanggotaan}
              onChange={(e) => setFilterKeanggotaan(e.target.value)}
              className="min-h-[42px] px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="semua">Semua Akun Guru</option>
              <option value="ada">Sudah Ada Akun</option>
              <option value="belum">Belum Ada Akun</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-2xs text-muted-foreground pt-1 border-t border-border/60">
          <span>
            Menampilkan <strong>{processedItems.length}</strong> dari {initialItems.length} Satuan PAUD
          </span>
          <span className="font-mono">
            Urutan: <strong>{sortDescription}</strong>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. TABEL INTERAKTIF SORTABLE                               */}
      {/* ========================================================= */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-bold select-none">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th
                  onClick={() => handleSort("nama")}
                  className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Satuan PAUD</span>
                    {sortField === "nama" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-3.5">Wilayah</th>
                <th
                  onClick={() => handleSort("anggota")}
                  className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Guru / Akun</span>
                    {sortField === "anggota" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("target")}
                  className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Target Siswa</span>
                    {sortField === "target" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("diperbarui")}
                  className="py-3 px-3.5 cursor-pointer hover:text-foreground transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Diperbarui</span>
                    {sortField === "diperbarui" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                {/* KOLOM SORTING PERSENTASE UTAMA */}
                <th
                  onClick={() => handleSort("persentase")}
                  className="py-3 px-4 cursor-pointer bg-primary/5 hover:bg-primary/10 text-primary transition-colors text-right min-w-[150px]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-extrabold">Persentase</span>
                    {sortField === "persentase" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <span>Tidak ada data satuan PAUD yang sesuai dengan filter pencarian.</span>
                  </td>
                </tr>
              ) : (
                processedItems.map((item, idx) => {
                  const isFinished = item.status_penyelesaian === "SELESAI";
                  const isInProgress = item.status_penyelesaian === "PROGRES";
                  const isNotStarted = item.status_penyelesaian === "BELUM_MULAI";

                  return (
                    <tr
                      key={item.komunitas_id}
                      className={cn(
                        "hover:bg-muted/40 transition-colors",
                        isFinished && "bg-emerald-50/30 dark:bg-emerald-950/10"
                      )}
                    >
                      {/* No */}
                      <td className="py-3 px-3.5 text-center text-muted-foreground font-mono">
                        {idx + 1}
                      </td>

                      {/* Nama PAUD & Institusi */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block">
                            {item.nama_paud}
                          </span>
                          <span className="inline-block px-1.5 py-0.2 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                            {item.jenis_institusi}
                          </span>
                        </div>
                      </td>

                      {/* Wilayah */}
                      <td className="py-3 px-3.5">
                        <span className="text-foreground block">{item.kelurahan}</span>
                        <span className="text-2xs text-muted-foreground">{item.kecamatan}</span>
                      </td>

                      {/* Operator / Anggota Guru */}
                      <td className="py-3 px-3.5 text-center">
                        {item.has_anggota ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-2xs border border-emerald-500/20">
                            <UserCheck className="h-3 w-3" />
                            <span>{item.jumlah_anggota} Akun</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold text-2xs border border-rose-500/20">
                            <UserX className="h-3 w-3" />
                            <span>Belum Ada</span>
                          </span>
                        )}
                      </td>

                      {/* Target Siswa */}
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-foreground">
                        {item.total_peserta_didik}
                      </td>

                      {/* Siswa Diperbarui */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground">
                        {item.total_diperbarui}
                      </td>

                      {/* Kolom Persentase */}
                      <td className="py-3 px-4 text-right bg-primary/5">
                        <div className="space-y-1">
                          <span
                            className={cn(
                              "font-mono font-black text-xs sm:text-sm",
                              isFinished
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isInProgress
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.persentase_selesai}%
                          </span>

                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                isFinished
                                  ? "bg-emerald-500"
                                  : isInProgress
                                  ? "bg-amber-500"
                                  : "bg-transparent"
                              )}
                              style={{ width: `${Math.min(100, item.persentase_selesai)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Penyelesaian */}
                      <td className="py-3 px-3.5 text-center">
                        {isFinished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold text-2xs border border-emerald-500/30">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>100% Selesai</span>
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-200 font-bold text-2xs border border-amber-500/30">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <span>Dalam Progres</span>
                          </span>
                        ) : isNotStarted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-200 font-bold text-2xs border border-rose-500/30">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                            <span>Belum Mulai</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-2xs">
                            Kosong
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3.5 text-center print:hidden">
                        <Link
                          href={`/komunitas/${item.komunitas_id}/data`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-2xs font-bold text-foreground transition-colors cursor-pointer shadow-2xs"
                          title="Buka Data Anak PAUD"
                        >
                          <span>Buka Data</span>
                          <ExternalLink className="h-3 w-3 text-primary" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
