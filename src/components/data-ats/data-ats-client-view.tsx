"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  X,
  Search,
  AlertCircle,
  Sparkles,
  MapPin,
  Printer,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { CardDataAts } from "./card-data-ats";
import { FormDataAts } from "./form-data-ats";
import { GrafikFilterAts } from "./grafik-filter-ats";
import { DiagramChartFilterAts } from "./diagram-chart-filter-ats";
import {
  getJenjangAts,
  getWilayahScopeInfo,
  normalizeKeinginanSekolah,
  getNumericAgeAts,
  classifyKelasAts,
  DAFTAR_15_KELAS_ATS,
  type JenjangAtsId,
} from "@/lib/ats-helpers";
import type { KomunitasWithMembership, DataAtsItem } from "@/types/database";
import { cn, hasFullProfilDataAccess, isRoleAdmin } from "@/lib/utils";

interface DataAtsClientViewProps {
  komunitas: KomunitasWithMembership;
  initialAts: DataAtsItem[];
  canValidate: boolean;
  canEditDdtk: boolean;
  canManage?: boolean;
  canAccessDaftarNama?: boolean;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
}

export function DataAtsClientView({
  komunitas,
  initialAts,
  canValidate,
  canEditDdtk,
  canManage = false,
  canAccessDaftarNama: initialCanAccessDaftarNama,
  currentUserId = null,
  isSuperAdmin = false,
}: DataAtsClientViewProps) {
  const router = useRouter();
  const [atsList, setAtsList] = useState<DataAtsItem[]>(initialAts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenjang, setSelectedJenjang] = useState<JenjangAtsId>("semua");
  const [selectedKeinginan, setSelectedKeinginan] = useState<"semua" | "Masih Ada" | "Tidak Ada">("semua");
  const [selectedAlasan, setSelectedAlasan] = useState<string>("semua");
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [selectedKelasAts, setSelectedKelasAts] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<"semua" | "L" | "P">("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | "approved" | "pending">("semua");
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "info" | "error";
    message: string;
  } | null>(null);

  const userPeran = komunitas.currentUserMembership?.peran || "Pengunjung";
  const isWargaKita = komunitas.jenis === "warga_kita";
  const isApprovedMember = komunitas.currentUserMembership?.status === "approved";
  const userPeranLower = userPeran.toLowerCase();
  const isPenduduk = userPeranLower.includes("penduduk");
  const isAdminOrPengurus =
    isRoleAdmin(userPeranLower) ||
    userPeranLower.includes("admin") ||
    userPeranLower.includes("pengurus") ||
    userPeranLower.includes("kader") ||
    userPeranLower.includes("ketua");

  // Hanya Admin Komunitas, Pengurus, dan Penduduk di Komunitas tersebut yang berhak membuka daftar rincian nama anak
  const canAccessDaftarNama = Boolean(
    initialCanAccessDaftarNama ??
    (isSuperAdmin || canManage || (isApprovedMember && (isPenduduk || isAdminOrPengurus)))
  );

  const hasFullAccess = canAccessDaftarNama;

  const scopeInfo = getWilayahScopeInfo(komunitas);

  const totalAts = atsList.length;
  const totalApproved = atsList.filter(
    (c) => c.status_approval === "approved"
  ).length;
  const totalPending = totalAts - totalApproved;

  const filteredAts = atsList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (c.nama_lengkap || "").toLowerCase().includes(q) ||
      (c.nama_orangtua || "").toLowerCase().includes(q) ||
      (c.alasan_tidak_sekolah || "").toLowerCase().includes(q) ||
      (c.kelurahan || "").toLowerCase().includes(q) ||
      (c.alamat || "").toLowerCase().includes(q);

    const matchesJenjang =
      selectedJenjang === "semua" || getJenjangAts(c).id === selectedJenjang;

    const childKeinginan = normalizeKeinginanSekolah(c.keinginan_sekolah);
    const matchesKeinginan =
      selectedKeinginan === "semua" || childKeinginan === selectedKeinginan;

    const matchesAlasan =
      selectedAlasan === "semua" ||
      (c.alasan_tidak_sekolah || "").trim().toLowerCase() === selectedAlasan.toLowerCase();

    const matchesAge =
      selectedAge === null || getNumericAgeAts(c) === selectedAge;

    const matchesKelasAts =
      selectedKelasAts === null ||
      classifyKelasAts(c.jenjang_asal || undefined, c.kelas_terakhir || undefined) === selectedKelasAts;

    const rawGender = (c.jenis_kelamin || "").trim().toUpperCase();
    const matchesGender =
      selectedGender === "semua" ||
      (selectedGender === "L" && (rawGender === "L" || rawGender.startsWith("L"))) ||
      (selectedGender === "P" && (rawGender === "P" || rawGender.startsWith("P")));

    const matchesStatus =
      statusFilter === "semua" || c.status_approval === statusFilter;

    return (
      matchesSearch &&
      matchesJenjang &&
      matchesKeinginan &&
      matchesAlasan &&
      matchesAge &&
      matchesKelasAts &&
      matchesGender &&
      matchesStatus
    );
  });

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  useEffect(() => {
    setAtsList((prev) => {
      const initialIds = new Set((initialAts || []).map((item) => item.id));
      const newlyAddedLocally = prev.filter((item) => !initialIds.has(item.id));
      return [...newlyAddedLocally, ...(initialAts || [])];
    });
  }, [initialAts]);

  const handleAddItem = (newItem?: DataAtsItem) => {
    setIsAddModalOpen(false);
    if (newItem) {
      if (statusFilter === "approved") {
        setStatusFilter("semua");
      }
      setSelectedJenjang("semua");
      setSelectedKeinginan("semua");
      setSelectedAlasan("semua");
      setSelectedAge(null);
      setSelectedKelasAts(null);
      setSelectedGender("semua");
      setSearchQuery("");
      setIsListExpanded(true);

      setAtsList((prev) => [newItem, ...prev.filter((item) => item.id !== newItem.id)]);
      showToast(`Data ATS ${newItem.nama_lengkap} berhasil didaftarkan dan langsung masuk ke daftar.`);
    } else {
      showToast("Data ATS berhasil didaftarkan.");
    }
    router.refresh();
  };

  const handleUpdateItem = (updatedItem: DataAtsItem) => {
    setAtsList((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    showToast(`Data ATS ${updatedItem.nama_lengkap} berhasil diperbarui.`);
  };

  const handleDeleteItem = (deletedId: string) => {
    setAtsList((prev) => prev.filter((item) => item.id !== deletedId));
    showToast(`Data ATS berhasil dihapus dari sistem.`);
  };

  const handleKembaliSekolah = (atsId: string, namaSekolah: string) => {
    const target = atsList.find((item) => item.id === atsId);
    setAtsList((prev) => prev.filter((item) => item.id !== atsId));
    showToast(
      `🎉 Selamat! ${target?.nama_lengkap || "Anak"} telah berhasil difasilitasi kembali bersekolah di ${namaSekolah} dan dialihkan ke Data Anak aktif.`,
      "success"
    );
  };

  // Interactive handler callbacks
  const handleSelectJenjang = (jenjang: JenjangAtsId) => {
    setSelectedJenjang((prev) => (prev === jenjang ? "semua" : jenjang));
    if (canAccessDaftarNama) {
      setIsListExpanded(true);
    }
  };

  const handleSelectAge = (age: number | null) => {
    setSelectedAge((prev) => (prev === age ? null : age));
    if (canAccessDaftarNama) {
      setIsListExpanded(true);
    }
  };

  const handleSelectKelasAts = (kelasKey: string | null) => {
    setSelectedKelasAts((prev) => (prev === kelasKey ? null : kelasKey));
    if (canAccessDaftarNama) {
      setIsListExpanded(true);
    }
  };

  const handleSelectKeinginan = (keinginan: "semua" | "Masih Ada" | "Tidak Ada") => {
    setSelectedKeinginan((prev) => (prev === keinginan ? "semua" : keinginan));
    if (canAccessDaftarNama) {
      setIsListExpanded(true);
    }
  };

  const handleSelectAlasan = (alasan: string) => {
    setSelectedAlasan((prev) =>
      prev.trim().toLowerCase() === alasan.trim().toLowerCase() ? "semua" : alasan
    );
    if (canAccessDaftarNama) {
      setIsListExpanded(true);
    }
  };

  const handleSelectGender = (gender: "semua" | "L" | "P") => {
    setSelectedGender((prev) => (prev === gender ? "semua" : gender));
    if (canAccessDaftarNama) {
      setIsListExpanded(true);
    }
  };

  const handleSelectStatus = (status: "semua" | "approved" | "pending") => {
    setStatusFilter((prev) => (prev === status ? "semua" : status));
    if (canAccessDaftarNama) {
      setIsListExpanded(true);
    }
  };

  const handleResetFilters = () => {
    setSelectedJenjang("semua");
    setSelectedKeinginan("semua");
    setSelectedAlasan("semua");
    setSelectedAge(null);
    setSelectedKelasAts(null);
    setSelectedGender("semua");
    setStatusFilter("semua");
    setSearchQuery("");
  };

  const tanggalCetakLengkap = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const tanggalSimple = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const filterDetails = [
    selectedAge !== null ? `Usia: ${selectedAge} Tahun` : null,
    selectedKelasAts !== null ? `Kelas: ${DAFTAR_15_KELAS_ATS.find((k) => k.key === selectedKelasAts)?.label || selectedKelasAts}` : null,
    selectedJenjang !== "semua" ? `Jenjang: ${selectedJenjang.toUpperCase()}` : null,
    selectedKeinginan !== "semua" ? `Keinginan: ${selectedKeinginan}` : null,
    selectedAlasan !== "semua" ? `Alasan: ${selectedAlasan}` : null,
    selectedGender !== "semua" ? `Gender: ${selectedGender === "L" ? "Laki-laki" : "Perempuan"}` : null,
    statusFilter !== "semua" ? `Status: ${statusFilter === "approved" ? "Terverifikasi" : "Menunggu"}` : null,
    searchQuery.trim() ? `Pencarian: "${searchQuery}"` : null,
  ]
    .filter(Boolean)
    .join(" | ") || "Semua Data ATS";

  return (
    <div className="space-y-6">
      {/* 0. KOP DOKUMEN RESMI A4 (HANYA MUNCUL SAAT CETAK KE PDF / KERTAS A4) */}
      <div className="hidden print:block border-b-2 border-black pb-3 mb-4 text-center">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Cap Left */}
          <div className="w-14 h-14 border-2 border-black rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[9px] font-bold font-mono leading-none text-center">TEGAL</span>
            <span className="text-[7px] font-mono leading-none mt-1 text-center">BAHARI</span>
          </div>

          {/* Kop Center */}
          <div className="flex-1 text-center space-y-0.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider font-mono">
              PEMERINTAH KOTA TEGAL
            </h2>
            <h1 className="text-sm sm:text-base font-black uppercase tracking-tight">
              LAPORAN DATA &amp; PEMETAAN ANAK TIDAK SEKOLAH (ATS)
            </h1>
            <p className="text-[10px] font-semibold">
              JARIMAS-ID • Jaringan Informasi &amp; Layanan Anak Kota Tegal
            </p>
            <p className="text-[9px] text-gray-700">
              Wilayah: <span className="font-bold">{komunitas.nama}</span> • Cakupan:{" "}
              {scopeInfo.scopeTitle} ({scopeInfo.scopeSubtitle})
            </p>
          </div>

          {/* Logo Cap Right */}
          <div className="w-14 h-14 border-2 border-black rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[9px] font-bold font-mono leading-none text-center">JARIMAS</span>
            <span className="text-[7px] font-mono leading-none mt-1 text-center">ATS-2026</span>
          </div>
        </div>

        <div className="border-t border-black mt-2 pt-1.5 flex items-center justify-between text-[9px] font-mono text-gray-800">
          <div className="text-left">
            <span className="font-bold">Kriteria Filter: </span>
            <span>{filterDetails}</span>
          </div>
          <div className="text-right shrink-0">
            <span suppressHydrationWarning>
              Dicetak: <b suppressHydrationWarning>{tanggalCetakLengkap}</b> ({filteredAts.length} anak)
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {feedbackToast && (
        <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 shadow-sm animate-in slide-in-from-top-2 duration-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{feedbackToast.message}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. WILAYAH SCOPE BANNER (Coursera Card Style) */}
      {scopeInfo.isWargaKita && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs break-inside-avoid print:bg-white print:border-gray-400 print:text-black">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 print:bg-gray-100 print:text-black">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-slate-900 print:text-black">
                  Cakupan Wilayah: {scopeInfo.scopeTitle}
                </span>
                <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200 print:border-black print:text-black">
                  {scopeInfo.badgeLabel}
                </span>
              </div>
              <p className="text-slate-600 print:text-gray-700 text-sm leading-relaxed">
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
          <div className="text-xs text-blue-700 print:text-gray-800 shrink-0 self-start sm:self-center font-bold px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
            Terhubung Otomatis
          </div>
        </div>
      )}

      {/* Notice Banner jika Warga Kita dan Bukan Penduduk / Penduduk Domisili Di Luar */}
      {isWargaKita && !hasFullAccess && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex items-start gap-3 text-amber-950 shadow-xs print:hidden">
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold">
              Hak Akses Terbatas ({userPeran.toUpperCase()}): Hanya Melihat Grafik &amp; Statistik ATS
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Sesuai ketentuan, status {userPeran} memiliki akses ke visualisasi Grafik dan Chart statistik agregat ATS. Penambahan &amp; modifikasi data ATS hanya dapat dilakukan oleh Penduduk atau Penduduk Domisili Di Luar.
            </p>
          </div>
        </div>
      )}

      {/* 2. STATISTIC METRIC CARDS (High-Contrast Coursera Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 break-inside-avoid">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 text-center space-y-1.5 shadow-xs print:bg-white print:border-gray-400 print:text-black">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-gray-600 block">
            TOTAL DATA ATS
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 print:text-black">
            {totalAts}
          </span>
          <span className="text-sm font-semibold text-slate-600 print:text-gray-600 block">
            Anak Tidak Sekolah
          </span>
        </div>

        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5 text-center space-y-1.5 shadow-xs print:bg-white print:border-gray-400 print:text-black">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 print:text-emerald-700 block">
            TERVERIFIKASI
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-700 print:text-emerald-700">
            {totalApproved}
          </span>
          <span className="text-sm font-semibold text-emerald-800 print:text-gray-600 block">
            Tervalidasi Kader / Admin
          </span>
        </div>

        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 text-center space-y-1.5 shadow-xs print:bg-white print:border-gray-400 print:text-black">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 print:text-amber-700 block">
            MENUNGGU VALIDASI
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-amber-700 print:text-amber-700">
            {totalPending}
          </span>
          <span className="text-sm font-semibold text-amber-900 print:text-gray-600 block">
            Perlu Verifikasi Lapangan
          </span>
        </div>
      </div>

      {/* 3. GRAFIK & ANALITIK HASIL FILTER (NAIK KE ATAS MENGGANTIKAN 3 KARTU LAMA) */}
      <GrafikFilterAts
        filteredAts={filteredAts}
        allAts={atsList}
        totalAllAts={totalAts}
        activeFilters={{
          jenjang: selectedJenjang,
          keinginan: selectedKeinginan,
          alasan: selectedAlasan,
          status: statusFilter,
          search: searchQuery,
          age: selectedAge,
          gender: selectedGender,
          kelasAts: selectedKelasAts,
        }}
        onSelectJenjang={handleSelectJenjang}
        onSelectAge={handleSelectAge}
        onSelectKelasAts={handleSelectKelasAts}
        onSelectKeinginan={handleSelectKeinginan}
        onSelectAlasan={handleSelectAlasan}
        onSelectGender={handleSelectGender}
        onSelectStatus={handleSelectStatus}
        onResetFilters={handleResetFilters}
      />

      {/* 3b. DIAGRAM CHART HASIL FILTER (PIE / DONUT & BAR COLUMNS) */}
      <DiagramChartFilterAts
        filteredAts={filteredAts}
        totalAllAts={totalAts}
      />

      {/* 4. SEARCH & STATUS FILTER & TAMBAH ATS (HANYA UNTUK ADMIN, PENGURUS, DAN PENDUDUK KOMUNITAS) */}
      {canAccessDaftarNama && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 print:hidden">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setIsListExpanded(true);
                }
              }}
              placeholder="Cari nama anak ATS, orang tua, alasan, kelurahan..."
              className="w-full min-h-[50px] h-13 rounded-2xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-white border-2 border-slate-200 p-1.5 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => handleSelectStatus("semua")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
                statusFilter === "semua"
                  ? "bg-blue-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => handleSelectStatus("approved")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              Terverifikasi
            </button>
            <button
              type="button"
              onClick={() => handleSelectStatus("pending")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              Menunggu
            </button>
          </div>

          {/* Tombol Tambah ATS (Hanya jika memiliki akses penuh) */}
          {hasFullAccess && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex min-h-[50px] h-13 items-center justify-center gap-2 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white px-6 text-base font-bold shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>TAMBAH ATS</span>
            </button>
          )}
        </div>
      )}

      {/* 5. LIST DATA ATS (DEFAULT TERSEMBUNYI / DAPAT DIBUKA DENGAN MENYENTUH DIAGRAM ATAU TOMBOL) */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs sm:text-sm font-mono font-black uppercase text-slate-900 dark:text-slate-100 print:text-black flex items-center gap-2">
              <span>DAFTAR RINCIAN NAMA ANAK</span>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-mono font-bold">
                {filteredAts.length} Anak
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {canAccessDaftarNama ? (
              <button
                type="button"
                onClick={() => setIsListExpanded((prev) => !prev)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer border-2",
                  isListExpanded
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                )}
              >
                {isListExpanded ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Sembunyikan Daftar Nama</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Tampilkan {filteredAts.length} Nama Anak</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Akses Terkunci</span>
              </span>
            )}
          </div>
        </div>

        {/* Banner informasi perlindungan privasi atau status collapse */}
        {!canAccessDaftarNama ? (
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-6 sm:p-7 text-center space-y-4 print:hidden shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Lock className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Daftar Rincian Nama Anak Terkunci
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sesuai ketentuan perlindungan privasi dan keamanan data anak, daftar rincian identitas &amp; nama anak hanya dapat dibuka oleh <strong>Admin Komunitas</strong>, <strong>Pengurus</strong>, dan <strong>Penduduk</strong> di {komunitas.nama}.
              </p>
            </div>

            {!currentUserId ? (
              <div className="pt-2 max-w-sm mx-auto space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Silakan masuk atau buat akun untuk mengakses data komunitas:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/login?redirect=/komunitas/${komunitas.id}/ats`}
                    className="flex-1 inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk ke Akun</span>
                  </Link>
                  <Link
                    href={`/register?redirect=/komunitas/${komunitas.id}/ats`}
                    className="flex-1 inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Daftar Akun</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-2 max-w-md mx-auto space-y-2.5 bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span>Status akun Anda saat ini:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                    {userPeran}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Untuk melihat daftar rincian nama anak, pastikan Anda terdaftar resmi sebagai <em>Penduduk</em> atau <em>Pengurus / Admin</em> di komunitas ini.
                </p>
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className="inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 text-xs font-bold shadow-xs transition-all"
                >
                  <span>Buka Halaman Komunitas &amp; Ajukan Keanggotaan</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        ) : !isListExpanded ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-6 text-center space-y-3 print:hidden">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <EyeOff className="h-5 w-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Daftar Nama Anak Tersembunyi (Fokus Analitik)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sentuh/klik bagian diagram batang usia, alasan, jenjang, atau status di atas untuk membuka daftar rincian {filteredAts.length} nama anak yang sesuai secara otomatis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsListExpanded(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>Buka Daftar {filteredAts.length} Nama Anak</span>
            </button>
          </div>
        ) : null}

        {/* Konten Daftar Nama (Hanya tampil jika memiliki izin dan sedang dibuka) */}
        {canAccessDaftarNama && isListExpanded && (
          <div className="space-y-2.5 print:block print:space-y-2.5">
          {filteredAts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-card p-12 text-center space-y-4 print:bg-white print:border-gray-400 print:text-black">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600">
                <GraduationCap className="h-6 w-6 stroke-[1.5px] text-amber-500" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-bold tracking-tight text-foreground font-mono print:text-black">
                  {selectedJenjang !== "semua" ||
                  selectedKeinginan !== "semua" ||
                  selectedAlasan !== "semua" ||
                  statusFilter !== "semua" ||
                  selectedAge !== null ||
                  selectedGender !== "semua" ||
                  searchQuery
                    ? "TIDAK ADA DATA ATS SESUAI FILTER"
                    : "BELUM ADA DATA ANAK TIDAK SEKOLAH (ATS)"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed print:text-gray-600">
                  {selectedJenjang !== "semua" ||
                  selectedKeinginan !== "semua" ||
                  selectedAlasan !== "semua" ||
                  statusFilter !== "semua" ||
                  selectedAge !== null ||
                  selectedGender !== "semua" ||
                  searchQuery
                    ? "Tidak ditemukan data ATS yang cocok dengan kriteria filter yang dipilih. Silakan klik Reset Filter pada diagram."
                    : "Daftarkan data Anak Tidak Sekolah di wilayah Anda untuk pemantauan, verifikasi alasan, dan fasilitasi kembali bersekolah."}
                </p>
                {(selectedJenjang !== "semua" ||
                  selectedKeinginan !== "semua" ||
                  selectedAlasan !== "semua" ||
                  statusFilter !== "semua" ||
                  selectedAge !== null ||
                  selectedGender !== "semua" ||
                  searchQuery) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                )}
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
      )}
    </div>

      {/* TANDA TANGAN & PENGESAHAN DOKUMEN CETAK A4 (HANYA MUNCUL SAAT PRINT) */}
      <div className="hidden print:grid grid-cols-2 text-center text-[10px] font-sans break-inside-avoid mt-8 pt-4 border-t border-black">
        <div className="space-y-12">
          <p>
            Mengetahui,
            <br />
            <span className="font-bold uppercase">
              Ketua RT / RW / Tokoh Masyarakat
            </span>
          </p>
          <p className="font-bold underline uppercase">( ........................................ )</p>
        </div>

        <div className="space-y-12">
          <p suppressHydrationWarning>
            Kota Tegal, <span suppressHydrationWarning>{tanggalSimple}</span>
            <br />
            <span className="font-bold uppercase">
              Kader Pendata / Pengurus Jarimas
            </span>
          </p>
          <p className="font-bold underline uppercase">( ........................................ )</p>
        </div>
      </div>

      <div className="hidden print:flex mt-4 pt-1 border-t border-gray-400 text-[8px] font-mono text-gray-500 justify-between">
        <span>JARIMAS-ID • Dicetak otomatis sesuai tampilan layar dan filter aktif</span>
        <span>Dokumen Sah Pemkot Tegal (A4)</span>
      </div>

      {/* 6. MENU CETAK PDF DATA ATS (HANYA 1 MENU, DI PALING BAWAH HALAMAN) */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs print:hidden">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <Printer className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900">
                Cetak / Simpan PDF Data ATS
              </h4>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                A4 Resmi
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {canAccessDaftarNama
                ? `Mencetak seluruh data, statistik, dan grafik ATS yang tampil di layar (${filteredAts.length} anak) ke dalam berkas PDF ukuran A4.`
                : "Mencetak ringkasan statistik dan grafik pemetaan analitik ATS ke dalam berkas PDF ukuran A4."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto flex min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white px-6 text-base font-bold shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Printer className="h-5 w-5" />
          <span>CETAK PDF (A4)</span>
        </button>
      </div>

      {/* 7. MODAL POPUP PENDATAAN ATS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200 print:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Pendataan ATS (Anak Tidak Sekolah)
                  </h3>
                  <p className="text-sm font-medium text-slate-600 line-clamp-1">
                    {komunitas.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 pb-12 overflow-y-auto flex-1 overscroll-contain bg-slate-50/50">
              <FormDataAts
                komunitasId={komunitas.id}
                komunitasNama={komunitas.nama}
                komunitas={komunitas}
                onSuccess={handleAddItem}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
