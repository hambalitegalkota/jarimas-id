"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  School,
  BookOpen,
  Users,
  UserCheck,
  ShieldCheck,
  HeartHandshake,
  User,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Copy,
  Check,
  RotateCw,
  Building2,
  MapPin,
  ExternalLink,
  Eye,
  Info,
  Sparkles,
  Award,
  Baby,
} from "lucide-react";
import {
  getPaudKomunitasRekapTableAction,
  type PaudKomunitasMemberSummary,
  type PaudKomunitasRekapTableData,
} from "@/app/actions/komunitas";
import { KOTA_TEGAL_DATA } from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface PaudKomunitasTableRekapSectionProps {
  initialKecamatan?: string;
  initialKelurahan?: string;
  initialBentuk?: string;
}

export function PaudKomunitasTableRekapSection({
  initialKecamatan = "semua",
  initialKelurahan = "semua",
  initialBentuk = "semua",
}: PaudKomunitasTableRekapSectionProps) {
  const [data, setData] = useState<PaudKomunitasRekapTableData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Filter States
  const [activeStatusTab, setActiveStatusTab] = useState<
    "semua" | "sudah_beranggota" | "belum_beranggota"
  >("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedKecamatan, setSelectedKecamatan] =
    useState<string>(initialKecamatan);
  const [selectedKelurahan, setSelectedKelurahan] =
    useState<string>(initialKelurahan);
  const [selectedJenisInstitusi, setSelectedJenisInstitusi] =
    useState<string>(initialBentuk);
  const [sortBy, setSortBy] = useState<string>("anggota_desc");

  useEffect(() => {
    if (initialKecamatan) setSelectedKecamatan(initialKecamatan);
  }, [initialKecamatan]);

  useEffect(() => {
    if (initialKelurahan) setSelectedKelurahan(initialKelurahan);
  }, [initialKelurahan]);

  useEffect(() => {
    if (initialBentuk) setSelectedJenisInstitusi(initialBentuk);
  }, [initialBentuk]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Modal Detail Anggota
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<PaudKomunitasMemberSummary | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Fetch Data Function
  const fetchData = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getPaudKomunitasRekapTableAction();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Gagal memuat rekap data komunitas PAUD.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update filter kelurahan saat kecamatan berubah
  const availableKelurahans = useMemo(() => {
    if (selectedKecamatan === "semua" || !KOTA_TEGAL_DATA[selectedKecamatan]) {
      // Seluruh 27 Kelurahan di Kota Tegal
      const allKels: string[] = [];
      Object.values(KOTA_TEGAL_DATA).forEach((kec) => {
        allKels.push(...Object.keys(kec.kelurahan));
      });
      return Array.from(new Set(allKels)).sort((a, b) => a.localeCompare(b));
    }
    return Object.keys(KOTA_TEGAL_DATA[selectedKecamatan].kelurahan).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [selectedKecamatan]);

  // Handle Kecamatan Change
  const handleKecamatanChange = (kec: string) => {
    setSelectedKecamatan(kec);
    setSelectedKelurahan("semua");
    setCurrentPage(1);
  };

  // Reset Semua Filter
  const handleResetFilters = () => {
    setActiveStatusTab("semua");
    setSearchQuery("");
    setSelectedKecamatan("semua");
    setSelectedKelurahan("semua");
    setSelectedJenisInstitusi("semua");
    setSortBy("anggota_desc");
    setCurrentPage(1);
  };

  const isFilterActive =
    activeStatusTab !== "semua" ||
    searchQuery.trim() !== "" ||
    selectedKecamatan !== "semua" ||
    selectedKelurahan !== "semua" ||
    selectedJenisInstitusi !== "semua" ||
    sortBy !== "anggota_desc";

  // Filtered & Sorted Data Items
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    let items = [...data.items];

    // 1. Filter Status Anggota
    if (activeStatusTab === "sudah_beranggota") {
      items = items.filter((i) => i.statusKeanggotaan === "sudah_beranggota");
    } else if (activeStatusTab === "belum_beranggota") {
      items = items.filter((i) => i.statusKeanggotaan === "belum_beranggota");
    }

    // 2. Filter Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.nama.toLowerCase().includes(q) ||
          (i.npsn && i.npsn.toLowerCase().includes(q)) ||
          i.kecamatan.toLowerCase().includes(q) ||
          i.kelurahan.toLowerCase().includes(q) ||
          i.jenisInstitusi.toLowerCase().includes(q) ||
          i.lokasi.toLowerCase().includes(q)
      );
    }

    // 3. Filter Kecamatan
    if (selectedKecamatan !== "semua") {
      const kecTarget = selectedKecamatan.toLowerCase().trim();
      items = items.filter(
        (i) => i.kecamatan.toLowerCase().trim() === kecTarget
      );
    }

    // 4. Filter Kelurahan
    if (selectedKelurahan !== "semua") {
      const kelTarget = selectedKelurahan.toLowerCase().trim();
      items = items.filter(
        (i) => i.kelurahan.toLowerCase().trim() === kelTarget
      );
    }

    // 5. Filter Jenis Institusi
    if (selectedJenisInstitusi !== "semua") {
      items = items.filter(
        (i) =>
          i.jenisInstitusi.toUpperCase() ===
          selectedJenisInstitusi.toUpperCase()
      );
    }

    // 6. Sorting
    items.sort((a, b) => {
      if (sortBy === "anggota_desc") {
        return b.totalAnggota - a.totalAnggota || a.nama.localeCompare(b.nama);
      }
      if (sortBy === "anggota_asc") {
        return a.totalAnggota - b.totalAnggota || a.nama.localeCompare(b.nama);
      }
      if (sortBy === "nama_asc") {
        return a.nama.localeCompare(b.nama);
      }
      if (sortBy === "nama_desc") {
        return b.nama.localeCompare(a.nama);
      }
      if (sortBy === "guru_desc") {
        return b.jumlahGuru - a.jumlahGuru || b.totalAnggota - a.totalAnggota;
      }
      if (sortBy === "kepsek_desc") {
        return (
          b.jumlahKepalaSekolah - a.jumlahKepalaSekolah ||
          b.totalAnggota - a.totalAnggota
        );
      }
      if (sortBy === "wilayah") {
        return (
          a.kecamatan.localeCompare(b.kecamatan) ||
          a.kelurahan.localeCompare(b.kelurahan) ||
          a.nama.localeCompare(b.nama)
        );
      }
      return 0;
    });

    return items;
  }, [
    data,
    activeStatusTab,
    searchQuery,
    selectedKecamatan,
    selectedKelurahan,
    selectedJenisInstitusi,
    sortBy,
  ]);

  // Hitung ringkasan dinamis untuk data yang sedang difilter
  const filteredSummary = useMemo(() => {
    const totalLembaga = filteredItems.length;
    const sudahBeranggota = filteredItems.filter(
      (i) => i.statusKeanggotaan === "sudah_beranggota"
    ).length;
    const belumBeranggota = totalLembaga - sudahBeranggota;
    const totalAnggota = filteredItems.reduce(
      (sum, i) => sum + i.totalAnggota,
      0
    );
    const totalKepsek = filteredItems.reduce(
      (sum, i) => sum + i.jumlahKepalaSekolah,
      0
    );
    const totalGuru = filteredItems.reduce((sum, i) => sum + i.jumlahGuru, 0);
    const totalOrangTua = filteredItems.reduce(
      (sum, i) => sum + i.jumlahOrangTua,
      0
    );
    const totalKomite = filteredItems.reduce(
      (sum, i) => sum + i.jumlahKomite,
      0
    );
    const totalLainnya = filteredItems.reduce(
      (sum, i) => sum + i.jumlahLainnya,
      0
    );

    return {
      totalLembaga,
      sudahBeranggota,
      belumBeranggota,
      totalAnggota,
      totalKepsek,
      totalGuru,
      totalOrangTua,
      totalKomite,
      totalLainnya,
    };
  }, [filteredItems]);

  // Paginasi
  const totalPages =
    pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = useMemo(() => {
    if (pageSize === -1) return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const startIndex =
    filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex =
    pageSize === -1
      ? filteredItems.length
      : Math.min(currentPage * pageSize, filteredItems.length);

  // Helper Export CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;

    const headers = [
      "No",
      "Nama Satuan PAUD / PKBM",
      "NPSN",
      "Jenis Lembaga",
      "Kecamatan",
      "Kelurahan",
      "Total Anggota",
      "Kepala Sekolah",
      "Guru PAUD",
      "Orang Tua / Wali",
      "Komite Sekolah",
      "Peran Lainnya",
      "Status Keanggotaan",
      "Admin / Pengurus",
      "Alamat Lokasi",
    ];

    const rows = filteredItems.map((item, idx) => [
      idx + 1,
      `"${item.nama.replace(/"/g, '""')}"`,
      item.npsn || "-",
      item.jenisInstitusi,
      `"${item.kecamatan}"`,
      `"${item.kelurahan}"`,
      item.totalAnggota,
      item.jumlahKepalaSekolah,
      item.jumlahGuru,
      item.jumlahOrangTua,
      item.jumlahKomite,
      item.jumlahLainnya,
      item.statusKeanggotaan === "sudah_beranggota"
        ? "Sudah Beranggota"
        : "Belum Beranggota",
      item.adminName ? `"${item.adminName.replace(/"/g, '""')}"` : "-",
      `"${(item.lokasi || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rekap_satuan_paud_pkbm_tegal_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Salin Ringkasan
  const handleCopySummary = () => {
    if (!data?.summary) return;
    const s = filteredSummary;
    const text = `📊 RINGKASAN DATA KOMUNITAS SATUAN PAUD & PKBM KOTA TEGAL
📍 Total Satuan PAUD & PKBM: ${s.totalLembaga} Lembaga
✅ Sudah Beranggota: ${s.sudahBeranggota} Lembaga (${s.totalAnggota} Total Anggota)
⏳ Belum Beranggota: ${s.belumBeranggota} Lembaga
👥 Rincian Peran:
• Kepala Sekolah / Pengelola: ${s.totalKepsek} orang
• Guru PAUD / Pendidik: ${s.totalGuru} orang
• Orang Tua / Wali Murid: ${s.totalOrangTua} orang
• Komite Sekolah: ${s.totalKomite} orang
• Lainnya: ${s.totalLainnya} orang
🌐 Sumber: Jarimas Kota Tegal (${new Date().toLocaleDateString("id-ID")})`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Badge Warna Jenis Institusi
  const getJenisBadgeColor = (jenis: string) => {
    switch (jenis.toUpperCase()) {
      case "TK":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      case "KB":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "RA":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "PKBM":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "SPS":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "TPA":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "SKB":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <section
      className={cn(
        "rounded-2xl sm:rounded-3xl border-2 border-indigo-200/90 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-4 sm:p-5 shadow-xs transition-all",
        isOpen ? "space-y-5 shadow-md" : "space-y-0"
      )}
    >
      {/* ========================================================= */}
      {/* 1. HEADER SECTION & CONTROLS                              */}
      {/* ========================================================= */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all",
          isOpen ? "border-b border-indigo-100 dark:border-slate-800 pb-3.5" : ""
        )}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xs border border-indigo-500">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Tabel Komunitas Satuan PAUD &amp; PKBM
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 shadow-2xs">
                {data?.summary.totalLembaga || 219} Lembaga
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Pantau rincian keanggotaan berdasarkan peran (Kepala Sekolah, Guru PAUD, Orang Tua/Wali &amp; Komite).
            </p>
          </div>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {isOpen && (
            <>
              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={isRefreshing || loading}
                title="Muat Ulang Data"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RotateCw
                  className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-indigo-600")}
                />
                <span className="hidden sm:inline">Perbarui</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                title="Download CSV"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                title="Salin Ringkasan Teks"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Salin Info</span>
                  </>
                )}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>{isOpen ? "Sembunyikan Tabel" : "Lihat Tabel Rincian"}</span>
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* ========================================================= */}
          {/* 2. STATISTIK RINGKASAN METRIK PERAN (6 PILL CARDS)        */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* Metric 1: Total Lembaga */}
            <div className="rounded-2xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Total Satuan
                </span>
                <School className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {data?.summary.totalLembaga ?? 219}
                </span>
                <span className="text-[10px] block font-semibold text-slate-500">
                  TK, KB, RA, PKBM dll
                </span>
              </div>
            </div>

            {/* Metric 2: Sudah Beranggota */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Beranggota
                </span>
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {data?.summary.totalSudahBeranggota ?? 0}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                    Lembaga
                  </span>
                </div>
                <span className="text-[10px] block font-bold text-emerald-700 dark:text-emerald-300">
                  {data?.summary.totalSeluruhAnggota ?? 0} Total Anggota
                </span>
              </div>
            </div>

            {/* Metric 3: Belum Beranggota */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Belum Ada
                </span>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300 font-mono">
                    {data?.summary.totalBelumBeranggota ?? 219}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Lembaga
                  </span>
                </div>
                <span className="text-[10px] block font-semibold text-slate-400">
                  0 Anggota terdaftar
                </span>
              </div>
            </div>

            {/* Metric 4: Kepala Sekolah */}
            <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Kepala Sekolah
                </span>
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">
                  {data?.summary.totalKepalaSekolah ?? 0}
                </span>
                <span className="text-[10px] block font-semibold text-slate-500">
                  Kepala / Pengelola
                </span>
              </div>
            </div>

            {/* Metric 5: Guru PAUD & Pendidik */}
            <div className="rounded-2xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Guru PAUD
                </span>
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
                  {data?.summary.totalGuru ?? 0}
                </span>
                <span className="text-[10px] block font-semibold text-slate-500">
                  Guru / Pendidik
                </span>
              </div>
            </div>

            {/* Metric 6: Orang Tua & Komite */}
            <div className="rounded-2xl border border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Orangtua &amp; Komite
                </span>
                <HeartHandshake className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 font-mono">
                  {(data?.summary.totalOrangTua ?? 0) +
                    (data?.summary.totalKomite ?? 0)}
                </span>
                <span className="text-[10px] block font-semibold text-slate-500">
                  Wali Murid ({data?.summary.totalOrangTua ?? 0}), Komite (
                  {data?.summary.totalKomite ?? 0})
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. FILTER TABS & SEARCH BAR                               */}
          {/* ========================================================= */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            {/* 3.1. Segmented Tabs Filter Keanggotaan */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 gap-1 w-full sm:w-auto">
                {/* Tab: Semua */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatusTab("semua");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeStatusTab === "semua"
                      ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs font-black border border-slate-200/80 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <span>Semua</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 font-mono">
                    {data?.summary.totalLembaga || 219}
                  </span>
                </button>

                {/* Tab: Sudah Beranggota */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatusTab("sudah_beranggota");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeStatusTab === "sudah_beranggota"
                      ? "bg-emerald-600 text-white shadow-xs font-black"
                      : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sudah Beranggota</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold",
                      activeStatusTab === "sudah_beranggota"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                    )}
                  >
                    {data?.summary.totalSudahBeranggota || 0}
                  </span>
                </button>

                {/* Tab: Belum Beranggota */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatusTab("belum_beranggota");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeStatusTab === "belum_beranggota"
                      ? "bg-slate-800 dark:bg-slate-700 text-white shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <span>Belum Beranggota</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold",
                      activeStatusTab === "belum_beranggota"
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {data?.summary.totalBelumBeranggota || 219}
                  </span>
                </button>
              </div>

              {/* Reset Filter Button */}
              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-auto"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* 3.2. Search Input & Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
              {/* Search Box */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama PAUD, KB, TK, PKBM, NPSN..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown Kecamatan */}
              <div>
                <select
                  value={selectedKecamatan}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  className="w-full py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="semua">Semua Kecamatan</option>
                  <option value="Tegal Timur">Kec. Tegal Timur</option>
                  <option value="Tegal Barat">Kec. Tegal Barat</option>
                  <option value="Tegal Selatan">Kec. Tegal Selatan</option>
                  <option value="Margadana">Kec. Margadana</option>
                </select>
              </div>

              {/* Dropdown Kelurahan */}
              <div>
                <select
                  value={selectedKelurahan}
                  onChange={(e) => {
                    setSelectedKelurahan(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="semua">
                    {selectedKecamatan !== "semua"
                      ? `Semua Kel. di ${selectedKecamatan}`
                      : "Semua Kelurahan"}
                  </option>
                  {availableKelurahans.map((kel) => (
                    <option key={kel} value={kel}>
                      Kel. {kel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Jenis Institusi */}
              <div>
                <select
                  value={selectedJenisInstitusi}
                  onChange={(e) => {
                    setSelectedJenisInstitusi(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="semua">Semua Jenis Lembaga</option>
                  <option value="TK">TK (Taman Kanak-Kanak)</option>
                  <option value="KB">KB (Kelompok Bermain)</option>
                  <option value="RA">RA (Raudhatul Athfal)</option>
                  <option value="PKBM">PKBM (Pusat Kegiatan Belajar)</option>
                  <option value="SPS">SPS / Pos PAUD</option>
                  <option value="TPA">TPA (Taman Penitipan Anak)</option>
                  <option value="SKB">SKB (Sanggar Kegiatan Belajar)</option>
                </select>
              </div>
            </div>

            {/* 3.3. Sort Option & Summary Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="anggota_desc">Anggota Terbanyak (Tinggi ke Rendah)</option>
                  <option value="anggota_asc">Anggota Tersedikit (Rendah ke Tinggi)</option>
                  <option value="guru_desc">Guru PAUD Terbanyak</option>
                  <option value="kepsek_desc">Kepala Sekolah Terdaftar</option>
                  <option value="nama_asc">Nama Lembaga (A - Z)</option>
                  <option value="nama_desc">Nama Lembaga (Z - A)</option>
                  <option value="wilayah">Kecamatan &amp; Kelurahan</option>
                </select>
              </div>

              <div className="text-slate-600 dark:text-slate-400 font-semibold">
                Ditemukan:{" "}
                <strong className="text-slate-900 dark:text-slate-100 font-mono">
                  {filteredItems.length}
                </strong>{" "}
                Lembaga{" "}
                {filteredSummary.totalAnggota > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ({filteredSummary.totalAnggota} Anggota)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. TABEL UTAMA (DESKTOP & TABLET VIEW)                     */}
          {/* ========================================================= */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <RotateCw className="h-8 w-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Memuat data 219 Satuan PAUD &amp; PKBM se-Kota Tegal...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Tidak Ada Satuan PAUD yang Cocok
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Tidak ada data yang sesuai dengan filter atau kata kunci &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table View */}
              <div className="hidden md:block overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    {/* Header Table */}
                    <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-black uppercase text-[11px] tracking-wider border-b-2 border-slate-200 dark:border-slate-700 sticky top-0">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">No</th>
                        <th className="py-3 px-4">Satuan PAUD &amp; PKBM</th>
                        <th className="py-3 px-3 text-center">Total Anggota</th>
                        <th className="py-3 px-2.5 text-center" title="Kepala Sekolah / Pengelola">
                          Kepsek
                        </th>
                        <th className="py-3 px-2.5 text-center" title="Guru PAUD & Pendidik">
                          Guru
                        </th>
                        <th className="py-3 px-2.5 text-center" title="Orang Tua & Wali Murid">
                          Wali Murid
                        </th>
                        <th className="py-3 px-2.5 text-center" title="Komite Sekolah">
                          Komite
                        </th>
                        <th className="py-3 px-2.5 text-center" title="Alumni, Pengunjung, Pengurus Lainnya">
                          Lainnya
                        </th>
                      </tr>
                    </thead>

                    {/* Body Table */}
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {pagedItems.map((item, index) => {
                        const globalIndex = startIndex + index;
                        const hasMembers = item.totalAnggota > 0;

                        return (
                          <tr
                            key={item.rawId || item.id}
                            className={cn(
                              "transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20",
                              hasMembers
                                ? "bg-emerald-50/20 dark:bg-emerald-950/10"
                                : ""
                            )}
                          >
                            {/* No */}
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                              {globalIndex}
                            </td>

                            {/* Nama Satuan PAUD & Wilayah */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={`/komunitas/${item.id}`}
                                    className="font-extrabold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors text-xs"
                                  >
                                    {item.nama}
                                  </Link>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded-md font-black text-[10px] border",
                                      getJenisBadgeColor(item.jenisInstitusi)
                                    )}
                                  >
                                    {item.jenisInstitusi}
                                  </span>
                                  {item.npsn && (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                      NPSN: {item.npsn}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                                  <span className="inline-flex items-center gap-0.5">
                                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                    Kel. {item.kelurahan}, Kec. {item.kecamatan}
                                  </span>
                                  {item.adminName && (
                                    <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold">
                                      &bull; Pengurus: {item.adminName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Total Anggota */}
                            <td className="py-3.5 px-3 text-center">
                              {hasMembers ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDetailItem(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-black text-xs hover:scale-105 transition-all cursor-pointer shadow-2xs"
                                  title="Klik untuk melihat rincian anggota"
                                >
                                  <Users className="h-3 w-3" />
                                  <span>{item.totalAnggota}</span>
                                </button>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs">
                                  0
                                </span>
                              )}
                            </td>

                            {/* Kepsek */}
                            <td className="py-3.5 px-2.5 text-center">
                              {item.jumlahKepalaSekolah > 0 ? (
                                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-black text-xs font-mono">
                                  {item.jumlahKepalaSekolah}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-bold">
                                  -
                                </span>
                              )}
                            </td>

                            {/* Guru PAUD */}
                            <td className="py-3.5 px-2.5 text-center">
                              {item.jumlahGuru > 0 ? (
                                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-black text-xs font-mono">
                                  {item.jumlahGuru}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-bold">
                                  -
                                </span>
                              )}
                            </td>

                            {/* Wali Murid */}
                            <td className="py-3.5 px-2.5 text-center">
                              {item.jumlahOrangTua > 0 ? (
                                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-black text-xs font-mono">
                                  {item.jumlahOrangTua}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-bold">
                                  -
                                </span>
                              )}
                            </td>

                            {/* Komite */}
                            <td className="py-3.5 px-2.5 text-center">
                              {item.jumlahKomite > 0 ? (
                                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-black text-xs font-mono">
                                  {item.jumlahKomite}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-bold">
                                  -
                                </span>
                              )}
                            </td>

                            {/* Lainnya */}
                            <td className="py-3.5 px-2.5 text-center">
                              {item.jumlahLainnya > 0 ? (
                                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs font-mono">
                                  {item.jumlahLainnya}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-bold">
                                  -
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Table Footer Totals */}
                    <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-black text-slate-900 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700 text-xs">
                      <tr>
                        <td colSpan={2} className="py-3 px-4">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span>TOTAL ({filteredItems.length} Lembaga Difilter)</span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {filteredSummary.sudahBeranggota} Beranggota &bull; {filteredSummary.belumBeranggota} Belum
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                          {filteredSummary.totalAnggota}
                        </td>
                        <td className="py-3 px-2.5 text-center font-mono text-blue-700 dark:text-blue-400">
                          {filteredSummary.totalKepsek}
                        </td>
                        <td className="py-3 px-2.5 text-center font-mono text-indigo-700 dark:text-indigo-400">
                          {filteredSummary.totalGuru}
                        </td>
                        <td className="py-3 px-2.5 text-center font-mono text-purple-700 dark:text-purple-400">
                          {filteredSummary.totalOrangTua}
                        </td>
                        <td className="py-3 px-2.5 text-center font-mono text-amber-700 dark:text-amber-400">
                          {filteredSummary.totalKomite}
                        </td>
                        <td className="py-3 px-2.5 text-center font-mono text-slate-700 dark:text-slate-300">
                          {filteredSummary.totalLainnya}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Mobile Card Grid View */}
              <div className="md:hidden space-y-3">
                {pagedItems.map((item, index) => {
                  const globalIndex = startIndex + index;
                  const hasMembers = item.totalAnggota > 0;

                  return (
                    <div
                      key={item.rawId || item.id}
                      className={cn(
                        "p-4 rounded-2xl border-2 bg-white dark:bg-slate-900 space-y-3 shadow-2xs transition-all",
                        hasMembers
                          ? "border-emerald-300/80 dark:border-emerald-800"
                          : "border-slate-200 dark:border-slate-800"
                      )}
                    >
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              #{globalIndex}
                            </span>
                            <span
                              className={cn(
                                "px-1.5 py-0.2 rounded-md font-black text-[10px] border",
                                getJenisBadgeColor(item.jenisInstitusi)
                              )}
                            >
                              {item.jenisInstitusi}
                            </span>
                            {item.npsn && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {item.npsn}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/komunitas/${item.id}`}
                            className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 block"
                          >
                            {item.nama}
                          </Link>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            Kel. {item.kelurahan}, Kec. {item.kecamatan}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {hasMembers ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 font-black text-xs">
                              <Users className="h-3 w-3" />
                              <span>{item.totalAnggota} Anggota</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold text-[11px]">
                              0 Anggota
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rincian Peran Grid */}
                      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            Kepsek
                          </span>
                          <span className="text-xs font-black text-blue-700 dark:text-blue-400 font-mono">
                            {item.jumlahKepalaSekolah}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            Guru
                          </span>
                          <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 font-mono">
                            {item.jumlahGuru}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            Wali
                          </span>
                          <span className="text-xs font-black text-purple-700 dark:text-purple-400 font-mono">
                            {item.jumlahOrangTua}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">
                            Komite
                          </span>
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono">
                            {item.jumlahKomite}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        {hasMembers ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Lihat Anggota ({item.totalAnggota})</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum ada anggota bergabung
                          </span>
                        )}

                        <Link
                          href={`/komunitas/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Kunjungi</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ========================================================= */}
              {/* 5. PAGINATION CONTROLS                                    */}
              {/* ========================================================= */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
                {/* Info Display */}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span>
                    Menampilkan {startIndex}–{endIndex} dari {filteredItems.length} Lembaga
                  </span>
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-slate-400 font-normal">Per halaman:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={-1}>Semua Data</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                {pageSize !== -1 && totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                    >
                      <span className="hidden sm:inline">Berikutnya</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* 6. MODAL RINCIAN ANGGOTA LEMBAGA (POPUP DETAIL)           */}
          {/* ========================================================= */}
          {selectedDetailItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="relative w-full max-w-lg rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85dvh] overflow-y-auto">
                {/* Header Modal */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md font-black text-[10px] border",
                          getJenisBadgeColor(selectedDetailItem.jenisInstitusi)
                        )}
                      >
                        {selectedDetailItem.jenisInstitusi}
                      </span>
                      {selectedDetailItem.npsn && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          NPSN: {selectedDetailItem.npsn}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                      {selectedDetailItem.nama}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Kel. {selectedDetailItem.kelurahan}, Kec.{" "}
                      {selectedDetailItem.kecamatan}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDetailItem(null)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Ringkasan Peran di Lembaga ini */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 block">
                      Kepsek
                    </span>
                    <span className="text-base font-black text-blue-800 dark:text-blue-200 font-mono">
                      {selectedDetailItem.jumlahKepalaSekolah}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block">
                      Guru
                    </span>
                    <span className="text-base font-black text-indigo-800 dark:text-indigo-200 font-mono">
                      {selectedDetailItem.jumlahGuru}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block">
                      Wali Murid
                    </span>
                    <span className="text-base font-black text-purple-800 dark:text-purple-200 font-mono">
                      {selectedDetailItem.jumlahOrangTua}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">
                      Komite
                    </span>
                    <span className="text-base font-black text-amber-800 dark:text-amber-200 font-mono">
                      {selectedDetailItem.jumlahKomite}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">
                      Total
                    </span>
                    <span className="text-base font-black text-emerald-800 dark:text-emerald-200 font-mono">
                      {selectedDetailItem.totalAnggota}
                    </span>
                  </div>
                </div>

                {/* List Sampel Anggota Terdaftar */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Daftar Anggota Terverifikasi ({selectedDetailItem.totalAnggota})
                  </h4>

                  {selectedDetailItem.sampleMembers &&
                  selectedDetailItem.sampleMembers.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedDetailItem.sampleMembers.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                              {m.nama.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-slate-100 block">
                                {m.nama}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Anggota Terdaftar
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                            {m.peran}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">
                      Belum ada rincian profil anggota yang dapat ditampilkan.
                    </p>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailItem(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                  >
                    Tutup
                  </button>
                  <Link
                    href={`/komunitas/${selectedDetailItem.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>Buka Halaman Komunitas</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
