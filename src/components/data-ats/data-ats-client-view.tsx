"use client";

import { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  Plus,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  BookOpen,
  Filter,
  Layers,
  Baby,
  School,
  HeartHandshake,
  Printer,
} from "lucide-react";
import { CardDataAts } from "./card-data-ats";
import { FormDataAts } from "./form-data-ats";
import { GrafikFilterAts } from "./grafik-filter-ats";
import { DiagramChartFilterAts } from "./diagram-chart-filter-ats";
import { PrintLaporanAts } from "./print-laporan-ats";
import {
  getJenjangAts,
  getWilayahScopeInfo,
  JENJANG_ATS_CONFIG,
  type JenjangAtsId,
} from "@/lib/ats-helpers";
import {
  ALASAN_TIDAK_SEKOLAH_LIST,
  type KomunitasWithMembership,
  type DataAtsItem,
} from "@/types/database";
import { cn } from "@/lib/utils";

interface DataAtsClientViewProps {
  komunitas: KomunitasWithMembership;
  initialAts: DataAtsItem[];
  canValidate: boolean;
  canEditDdtk: boolean;
  canManage?: boolean;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
}

export function DataAtsClientView({
  komunitas,
  initialAts,
  canValidate,
  canEditDdtk,
  canManage = false,
  currentUserId = null,
  isSuperAdmin = false,
}: DataAtsClientViewProps) {
  const [atsList, setAtsList] = useState<DataAtsItem[]>(initialAts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenjang, setSelectedJenjang] = useState<JenjangAtsId>("semua");
  const [selectedKeinginan, setSelectedKeinginan] = useState<"semua" | "Masih Ada" | "Tidak Ada">("semua");
  const [selectedAlasan, setSelectedAlasan] = useState<string>("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | "approved" | "pending">("semua");
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "info" | "error";
    message: string;
  } | null>(null);

  const scopeInfo = getWilayahScopeInfo(komunitas);

  const totalAts = atsList.length;
  const totalApproved = atsList.filter(
    (c) => c.status_approval === "approved"
  ).length;
  const totalPending = totalAts - totalApproved;

  // Hitung jumlah per jenjang pendidikan
  const countByJenjang = {
    semua: atsList.length,
    sd: atsList.filter((c) => getJenjangAts(c).id === "sd").length,
    smp: atsList.filter((c) => getJenjangAts(c).id === "smp").length,
    sma: atsList.filter((c) => getJenjangAts(c).id === "sma").length,
    dewasa: atsList.filter((c) => getJenjangAts(c).id === "dewasa").length,
  };

  // Hitung jumlah per keinginan untuk bersekolah
  const countByKeinginan = {
    semua: atsList.length,
    masihAda: atsList.filter(
      (c) => (c.keinginan_sekolah === "Tidak Ada" ? "Tidak Ada" : "Masih Ada") === "Masih Ada"
    ).length,
    tidakAda: atsList.filter(
      (c) => c.keinginan_sekolah === "Tidak Ada"
    ).length,
  };

  // Daftar alasan unik (standar + custom jika ada)
  const dynamicAlasanList = Array.from(
    new Set([
      ...ALASAN_TIDAK_SEKOLAH_LIST,
      ...atsList
        .map((c) => (c.alasan_tidak_sekolah || "").trim())
        .filter(Boolean),
    ])
  );

  // Hitung jumlah per alasan
  const countByAlasan: Record<string, number> = {
    semua: atsList.length,
  };
  dynamicAlasanList.forEach((alasan) => {
    countByAlasan[alasan] = atsList.filter(
      (c) => (c.alasan_tidak_sekolah || "").trim().toLowerCase() === alasan.toLowerCase()
    ).length;
  });

  const filteredAts = atsList.filter((c) => {
    const matchesSearch =
      c.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nama_orangtua.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.alasan_tidak_sekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.kelurahan && c.kelurahan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.alamat && c.alamat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesJenjang =
      selectedJenjang === "semua" || getJenjangAts(c).id === selectedJenjang;

    const childKeinginan = c.keinginan_sekolah === "Tidak Ada" ? "Tidak Ada" : "Masih Ada";
    const matchesKeinginan =
      selectedKeinginan === "semua" || childKeinginan === selectedKeinginan;

    const matchesAlasan =
      selectedAlasan === "semua" ||
      (c.alasan_tidak_sekolah || "").trim().toLowerCase() === selectedAlasan.toLowerCase();

    const matchesStatus =
      statusFilter === "semua" || c.status_approval === statusFilter;

    return matchesSearch && matchesJenjang && matchesKeinginan && matchesAlasan && matchesStatus;
  });

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  const handleUpdateItem = (updatedItem: DataAtsItem) => {
    setAtsList((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    showToast(`Data ATS ${updatedItem.nama_lengkap} berhasil diperbarui.`);
  };

  const handleDeleteItem = (deletedId: string) => {
    const target = atsList.find((item) => item.id === deletedId);
    setAtsList((prev) => prev.filter((item) => item.id !== deletedId));
    showToast(`Data ATS ${target ? target.nama_lengkap : ""} berhasil dihapus dari sistem.`);
  };

  const handleKembaliSekolah = (atsId: string, namaSekolah: string) => {
    const target = atsList.find((item) => item.id === atsId);
    // Remove from ATS list since child is now officially re-enrolled in school
    setAtsList((prev) => prev.filter((item) => item.id !== atsId));
    showToast(
      `🎉 Selamat! ${target?.nama_lengkap || "Anak"} telah berhasil difasilitasi kembali bersekolah di ${namaSekolah} dan dialihkan ke Data Anak aktif.`,
      "success"
    );
  };

  const jenjangTabs: { id: JenjangAtsId; label: string; count: number; colorClass: string }[] = [
    {
      id: "semua",
      label: "Semua Jenjang",
      count: countByJenjang.semua,
      colorClass: "text-foreground",
    },
    {
      id: "sd",
      label: "SD / Paket A (7-12 Thn)",
      count: countByJenjang.sd,
      colorClass: "text-emerald-400",
    },
    {
      id: "smp",
      label: "SMP / Paket B (13-15 Thn)",
      count: countByJenjang.smp,
      colorClass: "text-sky-400",
    },
    {
      id: "sma",
      label: "SMA / SMK / Paket C (16-18 Thn)",
      count: countByJenjang.sma,
      colorClass: "text-amber-400",
    },
    {
      id: "dewasa",
      label: "19-24+ Thn",
      count: countByJenjang.dewasa,
      colorClass: "text-purple-400",
    },
  ];

  const keinginanTabs: {
    id: "semua" | "Masih Ada" | "Tidak Ada";
    label: string;
    count: number;
    activeClass: string;
  }[] = [
    {
      id: "semua",
      label: "Semua Keinginan",
      count: countByKeinginan.semua,
      activeClass: "bg-amber-600 border-amber-500 text-white shadow-sm ring-1 ring-amber-500",
    },
    {
      id: "Masih Ada",
      label: "Masih Ada",
      count: countByKeinginan.masihAda,
      activeClass: "bg-emerald-600 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500",
    },
    {
      id: "Tidak Ada",
      label: "Tidak Ada",
      count: countByKeinginan.tidakAda,
      activeClass: "bg-rose-600 border-rose-500 text-white shadow-sm ring-1 ring-rose-500",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Toast Notification Banner */}
      {feedbackToast && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs font-mono text-emerald-300 shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast.message}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 1. WILAYAH SCOPE BANNER */}
      {scopeInfo.isWargaKita && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs font-mono">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/15 text-amber-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  CAKUPAN WILAYAH: {scopeInfo.scopeTitle}
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  {scopeInfo.badgeLabel}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                {scopeInfo.tierLevel === "RT" &&
                  `Menampilkan data Anak ATS khusus di wilayah ${scopeInfo.scopeTitle}, ${scopeInfo.scopeSubtitle}.`}
                {scopeInfo.tierLevel === "RW" &&
                  `Menampilkan data Anak ATS di seluruh RT dalam ${scopeInfo.scopeTitle}, ${scopeInfo.scopeSubtitle}.`}
                {scopeInfo.tierLevel === "Kelurahan" &&
                  `Menampilkan data Anak ATS di seluruh RW & RT dalam ${scopeInfo.scopeTitle}, ${scopeInfo.scopeSubtitle}.`}
                {scopeInfo.tierLevel === "Kecamatan" &&
                  `Menampilkan data seluruh Anak ATS di wilayah ${scopeInfo.scopeTitle}, ${scopeInfo.scopeSubtitle}.`}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-amber-400/90 shrink-0 self-start sm:self-center font-bold">
            Filter Terkoneksi Otomatis
          </div>
        </div>
      )}

      {/* 2. STATISTIC METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="rounded-md border border-border bg-card p-3.5 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-muted-foreground block">
            TOTAL DATA ATS
          </span>
          <span className="text-2xl font-black font-mono text-foreground">
            {totalAts}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground block">
            Anak Tidak Sekolah
          </span>
        </div>

        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-emerald-400 block">
            TERVERIFIKASI
          </span>
          <span className="text-2xl font-black font-mono text-emerald-400">
            {totalApproved}
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80 block">
            Tervalidasi oleh Kader/Admin
          </span>
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3.5 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-amber-400 block">
            MENUNGGU VALIDASI
          </span>
          <span className="text-2xl font-black font-mono text-amber-400">
            {totalPending}
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 block">
            Perlu Verifikasi Lapangan
          </span>
        </div>
      </div>

      {/* 3. JENJANG PENDIDIKAN DISTRIBUTION CARDS */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono font-bold uppercase text-foreground">
              DISTRIBUSI JENJANG PENDIDIKAN ATS
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Klik jenjang untuk memfilter
          </span>
        </div>

        {/* Jenjang Filter Pill Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {jenjangTabs.map((tab) => {
            const isSelected = selectedJenjang === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedJenjang(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer border",
                  isSelected
                    ? "bg-amber-600 border-amber-500 text-white shadow-sm ring-1 ring-amber-500"
                    : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold",
                    isSelected
                      ? "bg-black/30 text-white"
                      : "bg-muted text-foreground border border-border"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3b. KEINGINAN UNTUK BERSEKOLAH FILTER CARD */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-mono font-bold uppercase text-foreground">
              KEINGINAN UNTUK BERSEKOLAH
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Klik status untuk memfilter
          </span>
        </div>

        {/* Keinginan Filter Pill Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {keinginanTabs.map((tab) => {
            const isSelected = selectedKeinginan === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedKeinginan(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer border",
                  isSelected
                    ? tab.activeClass
                    : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold",
                    isSelected
                      ? "bg-black/30 text-white"
                      : "bg-muted text-foreground border border-border"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3c. ALASAN TIDAK SEKOLAH FILTER CARD */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono font-bold uppercase text-foreground">
              ALASAN TIDAK SEKOLAH
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Klik alasan untuk memfilter
          </span>
        </div>

        {/* Alasan Filter Pill Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedAlasan("semua")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer border",
              selectedAlasan === "semua"
                ? "bg-amber-600 border-amber-500 text-white shadow-sm ring-1 ring-amber-500"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Semua Alasan</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold",
                selectedAlasan === "semua"
                  ? "bg-black/30 text-white"
                  : "bg-muted text-foreground border border-border"
              )}
            >
              {atsList.length}
            </span>
          </button>

          {dynamicAlasanList.map((alasan) => {
            const isSelected = selectedAlasan === alasan;
            const count = countByAlasan[alasan] || 0;
            return (
              <button
                key={alasan}
                type="button"
                onClick={() => setSelectedAlasan(alasan)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer border",
                  isSelected
                    ? "bg-amber-600 border-amber-500 text-white shadow-sm ring-1 ring-amber-500"
                    : count > 0
                    ? "bg-background border-border text-foreground hover:bg-muted"
                    : "bg-background/40 border-border/60 text-muted-foreground hover:bg-muted/50"
                )}
              >
                <span>{alasan}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold",
                    isSelected
                      ? "bg-black/30 text-white"
                      : count > 0
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SEARCH & STATUS FILTER & ADD BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anak ATS, orang tua, alasan, kelurahan..."
            className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-md shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter("semua")}
            className={cn(
              "px-2.5 py-1.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer",
              statusFilter === "semua"
                ? "bg-muted text-foreground font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Semua Status
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={cn(
              "px-2.5 py-1.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer",
              statusFilter === "approved"
                ? "bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/40"
                : "text-muted-foreground hover:text-emerald-400"
            )}
          >
            Terverifikasi
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "px-2.5 py-1.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer",
              statusFilter === "pending"
                ? "bg-amber-500/20 text-amber-400 font-black border border-amber-500/40"
                : "text-muted-foreground hover:text-amber-400"
            )}
          >
            Menunggu
          </button>
        </div>

        {/* Tombol Cetak PDF A4 & Tambah ATS */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-card hover:bg-muted border border-border hover:border-amber-500/50 text-foreground px-3.5 text-xs font-mono font-bold tracking-wider shadow-xs transition-all shrink-0 cursor-pointer"
            title="Cetak Laporan Format PDF / Kertas A4"
          >
            <Printer className="h-4 w-4 text-amber-500" />
            <span>CETAK PDF (A4)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white px-4 text-xs font-mono font-bold uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5px]" />
            <span>TAMBAH ATS</span>
          </button>
        </div>
      </div>

      {/* 5. LIST DATA ATS */}
      <div className="space-y-3">
        {filteredAts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <GraduationCap className="h-6 w-6 stroke-[1.5px] text-amber-500" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                {selectedJenjang !== "semua" || selectedKeinginan !== "semua" || selectedAlasan !== "semua" || statusFilter !== "semua" || searchQuery
                  ? "TIDAK ADA DATA ATS SESUAI FILTER"
                  : "BELUM ADA DATA ANAK TIDAK SEKOLAH (ATS)"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedJenjang !== "semua" || selectedKeinginan !== "semua" || selectedAlasan !== "semua" || statusFilter !== "semua" || searchQuery
                  ? "Tidak ditemukan data ATS yang cocok dengan filter atau kata kunci pencarian yang dipilih."
                  : "Daftarkan data Anak Tidak Sekolah di wilayah Anda untuk pemantauan, verifikasi alasan, dan fasilitasi kembali bersekolah."}
              </p>
            </div>
          </div>
        ) : (
          filteredAts.map((child) => (
            <CardDataAts
              key={child.id}
              ats={child}
              komunitasId={komunitas.id}
              komunitasNama={komunitas.nama}
              canValidate={canValidate}
              canEditDdtk={canEditDdtk}
              canManage={canManage}
              currentUserId={currentUserId}
              isSuperAdmin={isSuperAdmin}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              onKembaliSekolah={handleKembaliSekolah}
            />
          ))
        )}
      </div>

      {/* 6. GRAFIK & ANALITIK HASIL FILTER */}
      <GrafikFilterAts
        filteredAts={filteredAts}
        totalAllAts={totalAts}
        activeFilters={{
          jenjang: selectedJenjang,
          keinginan: selectedKeinginan,
          alasan: selectedAlasan,
          status: statusFilter,
          search: searchQuery,
        }}
      />

      {/* 7. DIAGRAM CHART HASIL FILTER (PIE / DONUT & BAR COLUMNS) */}
      <div className="pb-16">
        <DiagramChartFilterAts
          filteredAts={filteredAts}
          totalAllAts={totalAts}
        />
      </div>

      {/* 8. DOKUMEN CETAK / PDF LAPORAN A4 (HANYA TAMPIL SAAT PRINT) */}
      <PrintLaporanAts
        komunitas={komunitas}
        filteredAts={filteredAts}
        totalAllAts={totalAts}
        activeFilters={{
          jenjang: selectedJenjang,
          keinginan: selectedKeinginan,
          alasan: selectedAlasan,
          status: statusFilter,
          search: searchQuery,
        }}
      />

      {/* 9. MODAL POPUP PENDATAAN ATS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                    PENDATAAN ATS (ANAK TIDAK SEKOLAH)
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {komunitas.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-5 pb-10 sm:pb-12 overflow-y-auto flex-1 overscroll-contain">
              <FormDataAts
                komunitasId={komunitas.id}
                komunitasNama={komunitas.nama}
                komunitas={komunitas}
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
