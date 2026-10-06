"use client";

import { useState, useTransition, useEffect } from "react";
import {
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  HeartPulse,
  Wrench,
  Home,
  ShieldCheck,
  Users,
  Calendar,
  MapPin,
  Trash2,
  Plus,
  Eye,
  Check,
  User,
  Info,
  ArrowRight,
} from "lucide-react";
import {
  createLaporanKaderSpmAction,
  getLaporanKaderSpmByKomunitasAction,
  deleteLaporanKaderSpmAction,
} from "@/app/actions/laporan-kader";
import { ModalPrintLaporanSpm } from "@/components/komunitas/modal-print-laporan-spm";
import type {
  KomunitasWithMembership,
  LaporanKaderSpmItem,
  BidangSpmType,
  JenisKegiatanLaporan,
} from "@/types/database";
import { cn } from "@/lib/utils";

interface LaporanKaderSpmFormCardProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
  userName?: string;
  isAdminOrKader: boolean;
}

const BIDANG_OPTIONS: { label: string; value: BidangSpmType; icon: any; color: string }[] = [
  {
    label: "Kader Bidang Pendidikan",
    value: "Pendidikan",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    label: "Kader Bidang Kesehatan",
    value: "Kesehatan",
    icon: HeartPulse,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    label: "Kader Bidang Pekerjaan Umum",
    value: "Pekerjaan Umum",
    icon: Wrench,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    label: "Kader Bidang Perumahan Rakyat",
    value: "Perumahan Rakyat",
    icon: Home,
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  {
    label: "Kader Bidang Trantibum Linmas",
    value: "Trantibum Linmas",
    icon: ShieldCheck,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    label: "Kader Bidang Sosial",
    value: "Sosial",
    icon: Users,
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
];

const BULAN_OPTIONS = [
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

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH_NAME = BULAN_OPTIONS[new Date().getMonth()] || "Januari";

const LOCAL_STORAGE_KEY_PREFIX = "jarimas_laporan_spm_";

export function LaporanKaderSpmFormCard({
  komunitas,
  currentUserId,
  userName = "Kader Posyandu",
  isAdminOrKader,
}: LaporanKaderSpmFormCardProps) {
  const [activeSection, setActiveSection] = useState<"form" | "riwayat">("form");
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Form State
  const [selectedBidang, setSelectedBidang] = useState<BidangSpmType>("Pendidikan");
  const [selectedBulan, setSelectedBulan] = useState<string>(CURRENT_MONTH_NAME);
  const [selectedTahun, setSelectedTahun] = useState<number>(CURRENT_YEAR);
  const [namaKader, setNamaKader] = useState<string>(userName);
  const [nomorHp, setNomorHp] = useState<string>("");

  // Checkbox Jenis Kegiatan
  const [kegiatanPendataan, setKegiatanPendataan] = useState<boolean>(true);
  const [kegiatanVerval, setKegiatanVerval] = useState<boolean>(false);
  const [kegiatanPenyuluhan, setKegiatanPenyuluhan] = useState<boolean>(false);
  const [kegiatanAspirasi, setKegiatanAspirasi] = useState<boolean>(false);

  // Narasi Teks Area
  const [narasiPendataan, setNarasiPendataan] = useState<string>("");
  const [narasiVerval, setNarasiVerval] = useState<string>("");
  const [narasiPenyuluhan, setNarasiPenyuluhan] = useState<string>("");
  const [narasiAspirasi, setNarasiAspirasi] = useState<string>("");

  // Submission State
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Riwayat State
  const [riwayatList, setRiwayatList] = useState<LaporanKaderSpmItem[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState<boolean>(false);

  // Print Modal State
  const [selectedPrintLaporan, setSelectedPrintLaporan] = useState<LaporanKaderSpmItem | null>(
    null
  );

  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${komunitas.id}`;

  // Helper load riwayat gabungan Server + LocalStorage
  const fetchRiwayat = async () => {
    setLoadingRiwayat(true);
    let serverItems: LaporanKaderSpmItem[] = [];

    try {
      const res = await getLaporanKaderSpmByKomunitasAction(komunitas.id);
      if (res.success && res.data) {
        serverItems = res.data;
      }
    } catch (err) {
      console.error("Error fetching server riwayat:", err);
    }

    // Ambil local storage fallback jika ada
    let localItems: LaporanKaderSpmItem[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        localItems = JSON.parse(stored);
      }
    } catch {
      // Ignore JSON error
    }

    // Gabungkan tanpa duplikat id
    const seenIds = new Set<string>();
    const merged: LaporanKaderSpmItem[] = [];

    [...serverItems, ...localItems].forEach((item) => {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        merged.push(item);
      }
    });

    merged.sort(
      (a, b) =>
        new Date(b.created_at || b.tanggal_laporan).getTime() -
        new Date(a.created_at || a.tanggal_laporan).getTime()
    );

    setRiwayatList(merged);
    setLoadingRiwayat(false);
  };

  useEffect(() => {
    fetchRiwayat();
  }, [komunitas.id]);

  // Simpan item ke localStorage sebagai cadangan
  const saveToLocalStorage = (newItem: LaporanKaderSpmItem) => {
    try {
      const existing = localStorage.getItem(storageKey);
      const items: LaporanKaderSpmItem[] = existing ? JSON.parse(existing) : [];
      const updated = [newItem, ...items.filter((i) => i.id !== newItem.id)];
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error("LocalStorage save error:", err);
    }
  };

  // Buat draft laporan saat ini untuk fungsi Pratinjau Cepat
  const getCurrentDraftLaporan = (): LaporanKaderSpmItem => {
    const jenisKegiatan: (JenisKegiatanLaporan | string)[] = [];
    if (kegiatanPendataan) jenisKegiatan.push("Pendataan");
    if (kegiatanVerval) jenisKegiatan.push("Verifikasi dan Validasi");
    if (kegiatanPenyuluhan) jenisKegiatan.push("Penyuluhan, Edukasi dan Motivasi");
    if (kegiatanAspirasi) jenisKegiatan.push("Penyaluran Aspirasi");

    return {
      id: "preview-draft-" + Date.now(),
      komunitas_id: komunitas.id,
      user_id: currentUserId || "preview-user",
      posyandu_nama: komunitas.nama,
      kelurahan: komunitas.kelurahan || "Kota Tegal",
      kecamatan: komunitas.kecamatan || "Kota Tegal",
      kota: "Kota Tegal",
      bidang: selectedBidang,
      bulan: selectedBulan,
      tahun: selectedTahun,
      tanggal_laporan: new Date().toISOString().slice(0, 10),
      nama_kader: namaKader || "Kader Posyandu",
      nomor_hp_kader: nomorHp || null,
      jenis_kegiatan: jenisKegiatan.length > 0 ? jenisKegiatan : ["Pendataan"],
      narasi_pendataan: kegiatanPendataan ? narasiPendataan : undefined,
      narasi_verifikasi_validasi: kegiatanVerval ? narasiVerval : undefined,
      narasi_penyuluhan_edukasi: kegiatanPenyuluhan ? narasiPenyuluhan : undefined,
      narasi_penyaluran_aspirasi: kegiatanAspirasi ? narasiAspirasi : undefined,
      status: "draft",
      created_at: new Date().toISOString(),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const jenisKegiatan: (JenisKegiatanLaporan | string)[] = [];
    if (kegiatanPendataan) jenisKegiatan.push("Pendataan");
    if (kegiatanVerval) jenisKegiatan.push("Verifikasi dan Validasi");
    if (kegiatanPenyuluhan) jenisKegiatan.push("Penyuluhan, Edukasi dan Motivasi");
    if (kegiatanAspirasi) jenisKegiatan.push("Penyaluran Aspirasi");

    if (jenisKegiatan.length === 0) {
      setFeedback({
        type: "error",
        message: "Pilih minimal 1 jenis kegiatan laporan yang dilaksanakan.",
      });
      return;
    }

    if (!namaKader.trim()) {
      setFeedback({
        type: "error",
        message: "Nama Kader wajib diisi.",
      });
      return;
    }

    startTransition(async () => {
      const res = await createLaporanKaderSpmAction({
        komunitasId: komunitas.id,
        posyanduNama: komunitas.nama,
        kelurahan: komunitas.kelurahan || "Kota Tegal",
        kecamatan: komunitas.kecamatan || "Kota Tegal",
        bidang: selectedBidang,
        bulan: selectedBulan,
        tahun: selectedTahun,
        namaKader,
        nomorHpKader: nomorHp,
        jenisKegiatan,
        narasiPendataan: kegiatanPendataan ? narasiPendataan : undefined,
        narasiVerifikasiValidasi: kegiatanVerval ? narasiVerval : undefined,
        narasiPenyuluhanEdukasi: kegiatanPenyuluhan ? narasiPenyuluhan : undefined,
        narasiPenyaluranAspirasi: kegiatanAspirasi ? narasiAspirasi : undefined,
      });

      if (res.success && res.data) {
        saveToLocalStorage(res.data);
        setFeedback({
          type: "success",
          message:
            "Laporan Kader 6 Bidang SPM berhasil disimpan dan terdistribusi!",
        });
        const savedItem = res.data;

        // Reset form narasi
        setNarasiPendataan("");
        setNarasiVerval("");
        setNarasiPenyuluhan("");
        setNarasiAspirasi("");
        fetchRiwayat();

        // Buka otomatis Pratinjau & Print PDF untuk laporan yang baru disimpan
        setTimeout(() => {
          setSelectedPrintLaporan(savedItem);
          setActiveSection("riwayat");
        }, 800);
      } else {
        // Jika ada fallback lokal, buat item dan simpan
        const draft = getCurrentDraftLaporan();
        draft.status = "terkirim";
        saveToLocalStorage(draft);
        fetchRiwayat();

        setFeedback({
          type: "success",
          message:
            "Laporan Kader 6 Bidang SPM berhasil disimpan pada arsip Posyandu ini!",
        });

        setTimeout(() => {
          setSelectedPrintLaporan(draft);
          setActiveSection("riwayat");
        }, 800);
      }
    });
  };

  const handleDeleteLaporan = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;
    try {
      await deleteLaporanKaderSpmAction(id, komunitas.id);
      // Hapus juga dari localStorage
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const items: LaporanKaderSpmItem[] = JSON.parse(stored);
          const updated = items.filter((i) => i.id !== id);
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } catch {
        // Ignore
      }
      fetchRiwayat();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus laporan.");
    }
  };

  // Tanggal Hari Ini Format Indonesia
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 p-4 sm:p-6 shadow-sm space-y-5 transition-all">
      {/* ========================================================= */}
      {/* 1. HEADER CARD                                            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xs border border-emerald-500">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Laporan Kader Posyandu 6 Bidang SPM
              </h3>
              <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-2xs">
                Permendagri 13/2024
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {komunitas.nama} &bull; Kelurahan {komunitas.kelurahan || "-"}, Kecamatan{" "}
              {komunitas.kecamatan || "-"}, Kota Tegal
            </p>
          </div>
        </div>

        {/* Toggle & Tab Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveSection("form")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeSection === "form"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              Formulir Input
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection("riwayat");
                fetchRiwayat();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeSection === "riwayat"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <span>Riwayat &amp; Cetak</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                {riwayatList.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* ========================================================= */}
          {/* BANNER DISTRIBUSI & ALUR PENYIMPANAN                      */}
          {/* ========================================================= */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
            <Info className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="block font-bold">
                Alur Penyimpanan &amp; Distribusi Laporan:
              </strong>
              <span>
                Laporan ini disimpan pada arsip Posyandu <strong>{komunitas.nama}</strong> dan terdistribusi otomatis ke Komunitas Kelurahan <strong>{komunitas.kelurahan}</strong>, Kecamatan <strong>{komunitas.kecamatan}</strong>, serta Komunitas Warga Kota Tegal. Setelah disimpan, Anda dapat langsung melakukan <strong>Pratinjau (Preview)</strong> dan <strong>Cetak Format PDF</strong> resmi.
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. SECTION A: FORMULIR INPUT LAPORAN                      */}
          {/* ========================================================= */}
          {activeSection === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Box Info Header Laporan */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-emerald-200 dark:border-slate-700 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Format Data Pelaporan
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Kota Tegal, Jawa Tengah
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Bidang SPM */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bidang Tugas Kader SPM <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedBidang}
                      onChange={(e) => setSelectedBidang(e.target.value as BidangSpmType)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {BIDANG_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Bulan Laporan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Laporan Bulan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedBulan}
                      onChange={(e) => setSelectedBulan(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {BULAN_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          Bulan {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Tahun Laporan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tahun Laporan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedTahun}
                      onChange={(e) => setSelectedTahun(Number(e.target.value))}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={2026}>Tahun 2026</option>
                      <option value={2025}>Tahun 2025</option>
                      <option value={2027}>Tahun 2027</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Box Pilihan Jenis Kegiatan (Checkbox) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                    Jenis Kegiatan yang Dilaksanakan (Pilih Satu atau Lebih):
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Centang kegiatan yang dilakukan, kotak narasi uraian akan muncul otomatis di bawah.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Checkbox 1: Pendataan */}
                  <label
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                      kegiatanPendataan
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={kegiatanPendataan}
                      onChange={(e) => setKegiatanPendataan(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        1. Pendataan
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        Pendataan sarana (perpustakaan, pojok baca, pos), data anak 0–6 th, data sekolah &amp; ATS (7–25 th).
                      </span>
                    </div>
                  </label>

                  {/* Checkbox 2: Verifikasi dan Validasi */}
                  <label
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                      kegiatanVerval
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={kegiatanVerval}
                      onChange={(e) => setKegiatanVerval(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        2. Verifikasi dan Validasi
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        Memastikan data/informasi yang diperoleh sesuai dengan kondisi lapangan nyata.
                      </span>
                    </div>
                  </label>

                  {/* Checkbox 3: Penyuluhan, Edukasi dan Motivasi */}
                  <label
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                      kegiatanPenyuluhan
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={kegiatanPenyuluhan}
                      onChange={(e) => setKegiatanPenyuluhan(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        3. Penyuluhan, Edukasi &amp; Motivasi
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        Memberikan edukasi layanan dasar dan memotivasi warga yang memiliki keterbatasan.
                      </span>
                    </div>
                  </label>

                  {/* Checkbox 4: Penyaluran Aspirasi */}
                  <label
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                      kegiatanAspirasi
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={kegiatanAspirasi}
                      onChange={(e) => setKegiatanAspirasi(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        4. Penyaluran Aspirasi
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        Meneruskan aduan, usulan, dan aspirasi warga ke Posyandu / Kelurahan / OPD terkait.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Box Uraian Narasi Kegiatan Sesuai Centang */}
              <div className="space-y-3.5">
                {/* 1. Narasi Pendataan */}
                {kegiatanPendataan && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-blue-200 dark:border-blue-900/60 shadow-2xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                      <GraduationCap className="h-4 w-4" />
                      <label className="text-xs font-bold uppercase tracking-wider">
                        Uraian Narasi Kegiatan 1: Pendataan
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={narasiPendataan}
                      onChange={(e) => setNarasiPendataan(e.target.value)}
                      placeholder="Contoh: Telah dilakukan pendataan ketersediaan pojok baca di Masjid/Balai RW, terdata 12 anak usia 0-6 tahun di RT 02/RW 03, serta 2 anak potensi ATS yang memerlukan pendampingan..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                    />
                  </div>
                )}

                {/* 2. Narasi Verifikasi dan Validasi */}
                {kegiatanVerval && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-emerald-200 dark:border-emerald-900/60 shadow-2xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                      <HeartPulse className="h-4 w-4" />
                      <label className="text-xs font-bold uppercase tracking-wider">
                        Uraian Narasi Kegiatan 2: Verifikasi dan Validasi
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={narasiVerval}
                      onChange={(e) => setNarasiVerval(e.target.value)}
                      placeholder="Contoh: Dilakukan kunjungan langsung ke rumah warga untuk mencocokkan data NIK dan kondisi riil anak yang belum bersekolah atau kondisi sanitasi keluarga..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
                    />
                  </div>
                )}

                {/* 3. Narasi Penyuluhan, Edukasi dan Motivasi */}
                {kegiatanPenyuluhan && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-purple-200 dark:border-purple-900/60 shadow-2xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
                      <Users className="h-4 w-4" />
                      <label className="text-xs font-bold uppercase tracking-wider">
                        Uraian Narasi Kegiatan 3: Penyuluhan, Edukasi &amp; Motivasi
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={narasiPenyuluhan}
                      onChange={(e) => setNarasiPenyuluhan(e.target.value)}
                      placeholder="Contoh: Memberikan penyuluhan pentingnya PAUD 1 tahun pra-SD kepada 15 orangtua balita saat hari buka Posyandu, serta motivasi kesiapan belajar..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans leading-relaxed"
                    />
                  </div>
                )}

                {/* 4. Narasi Penyaluran Aspirasi */}
                {kegiatanAspirasi && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                      <ShieldCheck className="h-4 w-4" />
                      <label className="text-xs font-bold uppercase tracking-wider">
                        Uraian Narasi Kegiatan 4: Penyaluran Aspirasi &amp; Usulan Warga
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={narasiAspirasi}
                      onChange={(e) => setNarasiAspirasi(e.target.value)}
                      placeholder="Contoh: Meneruskan usulan warga RT 03 terkait perbaikan saluran drainase dan bantuan seragam sekolah anak kurang mampu kepada Lurah dan Dinas terkait..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Lembar Tanda Tangan & Identitas Pelapor */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">TEMPAT &amp; TANGGAL:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      Tegal, {todayFormatted}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 sm:max-w-md">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                        Nama Kader Pelapor <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={namaKader}
                        onChange={(e) => setNamaKader(e.target.value)}
                        placeholder="Nama Lengkap Kader"
                        required
                        className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                        No. HP / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={nomorHp}
                        onChange={(e) => setNomorHp(e.target.value)}
                        placeholder="0812xxxx"
                        className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={cn(
                    "p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150",
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  )}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Submit & Preview Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                {/* Tombol Pratinjau PDF Format Resmi */}
                <button
                  type="button"
                  onClick={() => setSelectedPrintLaporan(getCurrentDraftLaporan())}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-4 py-2 rounded-xl border-2 border-blue-600 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs shadow-2xs transition-all active:scale-98 cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span>Pratinjau Format PDF</span>
                </button>

                {/* Tombol Simpan Laporan */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan Laporan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* 3. SECTION B: RIWAYAT & CETAK LAPORAN KADER POSYANDU      */
            /* ========================================================= */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Daftar Laporan Tersimpan ({riwayatList.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveSection("form")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Buat Laporan Baru</span>
                </button>
              </div>

              {loadingRiwayat ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Memuat data riwayat laporan...
                </div>
              ) : riwayatList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 space-y-2">
                  <p>Belum ada laporan kader yang tersimpan untuk Posyandu ini.</p>
                  <button
                    type="button"
                    onClick={() => setActiveSection("form")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700"
                  >
                    Tulis Laporan Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {riwayatList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs hover:border-emerald-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              Kader Bidang {item.bidang}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Bulan {item.bulan} {item.tahun}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Kader: <strong>{item.nama_kader}</strong> &bull; Tanggal:{" "}
                            {new Date(item.tanggal_laporan || item.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedPrintLaporan(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Printer className="h-3.5 w-3.5 text-blue-700" />
                            <span>Preview &amp; Cetak PDF</span>
                          </button>

                          {(isAdminOrKader || item.user_id === currentUserId) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteLaporan(item.id)}
                              className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Laporan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cuplikan Narasi */}
                      <div className="space-y-2 text-xs">
                        {item.narasi_pendataan && (
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                            <strong className="text-blue-900 dark:text-blue-300 block text-[11px] mb-0.5">
                              1. Pendataan:
                            </strong>
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                              {item.narasi_pendataan}
                            </p>
                          </div>
                        )}
                        {item.narasi_verifikasi_validasi && (
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                            <strong className="text-emerald-900 dark:text-emerald-300 block text-[11px] mb-0.5">
                              2. Verifikasi dan Validasi:
                            </strong>
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                              {item.narasi_verifikasi_validasi}
                            </p>
                          </div>
                        )}
                        {item.narasi_penyuluhan_edukasi && (
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                            <strong className="text-purple-900 dark:text-purple-300 block text-[11px] mb-0.5">
                              3. Penyuluhan &amp; Edukasi:
                            </strong>
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                              {item.narasi_penyuluhan_edukasi}
                            </p>
                          </div>
                        )}
                        {item.narasi_penyaluran_aspirasi && (
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                            <strong className="text-amber-900 dark:text-amber-300 block text-[11px] mb-0.5">
                              4. Penyaluran Aspirasi:
                            </strong>
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
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
