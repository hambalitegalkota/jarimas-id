"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Printer,
  Search,
  Filter,
  Eye,
  GraduationCap,
  HeartPulse,
  Wrench,
  Home,
  ShieldCheck,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Building2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  getLaporanKaderSpmWilayahAction,
  deleteLaporanKaderSpmAction,
} from "@/app/actions/laporan-kader";
import { ModalPrintLaporanSpm } from "@/components/komunitas/modal-print-laporan-spm";
import type {
  KomunitasWithMembership,
  LaporanKaderSpmItem,
  BidangSpmType,
} from "@/types/database";
import { cn } from "@/lib/utils";

interface RekapLaporanKaderWilayahCardProps {
  komunitas: KomunitasWithMembership;
  isAdminOrKader: boolean;
  currentUserId?: string | null;
}

const BIDANG_FILTER_TABS: { label: string; value: string; icon: any }[] = [
  { label: "Semua Bidang", value: "semua", icon: Sparkles },
  { label: "Pendidikan", value: "Pendidikan", icon: GraduationCap },
  { label: "Kesehatan", value: "Kesehatan", icon: HeartPulse },
  { label: "Pekerjaan Umum", value: "Pekerjaan Umum", icon: Wrench },
  { label: "Perumahan Rakyat", value: "Perumahan Rakyat", icon: Home },
  { label: "Trantibum Linmas", value: "Trantibum Linmas", icon: ShieldCheck },
  { label: "Sosial", value: "Sosial", icon: Users },
];

const BULAN_LIST = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const TAHUN_OPTIONS = [2025, 2026, 2027, 2028, 2029, 2030];

export function RekapLaporanKaderWilayahCard({
  komunitas,
  isAdminOrKader,
  currentUserId,
}: RekapLaporanKaderWilayahCardProps) {
  const [dataList, setDataList] = useState<LaporanKaderSpmItem[]>([]);
  const [summary, setSummary] = useState<{
    totalLaporan: number;
    byBidang: Record<string, number>;
    byBulan: Record<string, number>;
    totalPosyandu: number;
  }>({
    totalLaporan: 0,
    byBidang: {},
    byBulan: {},
    totalPosyandu: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false); // Default sembunyi agar rapi

  // Filters
  const [activeBidang, setActiveBidang] = useState<string>("semua");
  const [selectedBulan, setSelectedBulan] = useState<string>("semua");
  const [selectedTahun, setSelectedTahun] = useState<number>(2026);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Print PDF
  const [selectedPrintLaporan, setSelectedPrintLaporan] =
    useState<LaporanKaderSpmItem | null>(null);

  // Tentukan Level Wilayah
  const isTingkatKota =
    !komunitas.kecamatan ||
    komunitas.kecamatan === "Kota Tegal" ||
    komunitas.id === "kom-warga-kota-tegal";
  const isTingkatKecamatan =
    Boolean(komunitas.kecamatan) &&
    (!komunitas.kelurahan ||
      komunitas.kelurahan === "Semua Kelurahan" ||
      komunitas.kelurahan === "Semua");
  const isTingkatKelurahan =
    Boolean(komunitas.kelurahan) &&
    komunitas.kelurahan !== "Semua Kelurahan" &&
    komunitas.kelurahan !== "Semua";

  const fetchWilayahData = async () => {
    setLoading(true);
    try {
      const res = await getLaporanKaderSpmWilayahAction({
        kelurahan: isTingkatKelurahan ? komunitas.kelurahan : undefined,
        kecamatan:
          isTingkatKecamatan || isTingkatKelurahan
            ? komunitas.kecamatan
            : undefined,
        bidang: activeBidang !== "semua" ? activeBidang : undefined,
        bulan: selectedBulan !== "semua" ? selectedBulan : undefined,
        tahun: selectedTahun,
        searchQuery: searchQuery.trim() || undefined,
      });

      if (res.success && res.data) {
        setDataList(res.data);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      console.error("Error fetching wilayah laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWilayahData();
  }, [
    komunitas.id,
    activeBidang,
    selectedBulan,
    selectedTahun,
    searchQuery,
  ]);

  // Hanya Admin, Pengurus, Kader, atau Super Admin yang dapat melihat
  if (!isAdminOrKader) {
    return null;
  }

  const getBidangBadgeColor = (bidang: string) => {
    switch (bidang) {
      case "Pendidikan":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Kesehatan":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Pekerjaan Umum":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Perumahan Rakyat":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "Trantibum Linmas":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Sosial":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <section className="rounded-3xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 p-4 sm:p-6 shadow-xs space-y-5 transition-all">
      {/* ========================================================= */}
      {/* 1. HEADER REKAPITULASI WILAYAH                            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-slate-800 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xs border border-indigo-500">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Rekap Laporan Kader Posyandu 6 Bidang SPM
              </h3>
              <span className="rounded-full bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-2xs">
                Khusus Admin Wilayah
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Distribusi laporan tugas kader (Pendataan, Verval, Edukasi, Aspirasi) se-
              {isTingkatKota
                ? "Kota Tegal"
                : isTingkatKecamatan
                ? `Kecamatan ${komunitas.kecamatan}`
                : `Kelurahan ${komunitas.kelurahan}`}
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 hover:bg-indigo-50 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>{isOpen ? "Sembunyikan Laporan" : "Lihat Laporan Kader Masuk"}</span>
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
          {/* 2. STATISTIK RINGKASAN WILAYAH (3 CARDS)                  */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  TOTAL LAPORAN MASUK
                </span>
                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
                  {summary.totalLaporan}
                </span>
              </div>
              <FileText className="h-8 w-8 text-indigo-200" />
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  POSYANDU SUDAH MELAPOR
                </span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {summary.totalPosyandu}
                </span>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-200" />
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  STANDAR PELAYANAN MINIMAL
                </span>
                <span className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">
                  6 Bidang
                </span>
              </div>
              <Sparkles className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. TABS FILTER SESUAI 6 BIDANG SPM                        */}
          {/* ========================================================= */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div>
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block mb-2">
                Pilih Tampilan Sesuai Bidang SPM:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BIDANG_FILTER_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeBidang === tab.value;
                  const count =
                    tab.value === "semua"
                      ? summary.totalLaporan
                      : summary.byBidang[tab.value] || 0;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveBidang(tab.value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isActive
                          ? "bg-indigo-600 text-white shadow-2xs font-black"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-md font-mono",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Bulan, Tahun, dan Pencarian */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Posyandu, nama kader, narasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Bulan */}
              <div>
                <select
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="semua">Semua Bulan Laporan</option>
                  {BULAN_LIST.map((b) => (
                    <option key={b} value={b}>
                      Bulan {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun */}
              <div>
                <select
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {TAHUN_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      Tahun {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. DAFTAR KARTU LAPORAN KADER YANG MASUK                  */}
          {/* ========================================================= */}
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RotateCw className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Memuat data laporan kader se-wilayah...</span>
            </div>
          ) : dataList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Belum ada laporan kader yang sesuai dengan filter.
              </p>
              <p>Laporan yang dikirim oleh kader Posyandu akan tampil secara real-time di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dataList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-indigo-300 transition-all space-y-3.5"
                >
                  {/* Top Bar Laporan Item */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                          {item.posyandu_nama}
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full font-bold text-[10px] border",
                            getBidangBadgeColor(item.bidang)
                          )}
                        >
                          Bidang {item.bidang}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {item.bulan} {item.tahun}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                        <span>
                          📍 Kel. {item.kelurahan}, Kec. {item.kecamatan}
                        </span>
                        <span>&bull;</span>
                        <span>
                          Kader: <strong>{item.nama_kader}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          {new Date(item.tanggal_laporan || item.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedPrintLaporan(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Cetak / Print PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Narasi 4 Butir Tugas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {item.narasi_pendataan && (
                      <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-0.5">
                        <strong className="text-blue-900 dark:text-blue-300 font-bold block text-[11px]">
                          1. Pendataan:
                        </strong>
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                          {item.narasi_pendataan}
                        </p>
                      </div>
                    )}

                    {item.narasi_verifikasi_validasi && (
                      <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-0.5">
                        <strong className="text-emerald-900 dark:text-emerald-300 font-bold block text-[11px]">
                          2. Verifikasi &amp; Validasi:
                        </strong>
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                          {item.narasi_verifikasi_validasi}
                        </p>
                      </div>
                    )}

                    {item.narasi_penyuluhan_edukasi && (
                      <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 space-y-0.5">
                        <strong className="text-purple-900 dark:text-purple-300 font-bold block text-[11px]">
                          3. Penyuluhan &amp; Edukasi:
                        </strong>
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                          {item.narasi_penyuluhan_edukasi}
                        </p>
                      </div>
                    )}

                    {item.narasi_penyaluran_aspirasi && (
                      <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-0.5">
                        <strong className="text-amber-900 dark:text-amber-300 font-bold block text-[11px]">
                          4. Penyaluran Aspirasi:
                        </strong>
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                          {item.narasi_penyaluran_aspirasi}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Print Preview Format PDF */}
      <ModalPrintLaporanSpm
        laporan={selectedPrintLaporan}
        isOpen={Boolean(selectedPrintLaporan)}
        onClose={() => setSelectedPrintLaporan(null)}
      />
    </section>
  );
}
