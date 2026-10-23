"use client";

import { useState, useTransition, useMemo } from "react";
import {
  GraduationCap,
  School,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Building2,
  MapPin,
  Check,
} from "lucide-react";
import { kembaliBersekolah } from "@/app/actions/data-ats";
import type { DataAtsItem } from "@/types/database";
import { cn } from "@/lib/utils";

interface ModalKembaliBersekolahProps {
  isOpen: boolean;
  ats: DataAtsItem;
  komunitasId: string;
  onClose: () => void;
  onSuccess: (updatedAtsId: string, namaSekolah: string) => void;
}

export type KategoriTempatBersekolah = "pkbm_skb" | "formal_tegal" | "luar_tegal";

/**
 * Daftar Resmi 13 Lembaga PKBM dan SKB di Kota Tegal
 */
export const DAFTAR_PKBM_SKB_TEGAL = [
  {
    nama: "UPTD SPNF Sanggar Kegiatan Belajar (SKB) Kota Tegal",
    jenis: "SKB",
    wilayah: "Kraton, Kec. Tegal Barat",
    npsn: "P9959977",
  },
  {
    nama: "PKBM Sakila Kerti",
    jenis: "PKBM",
    wilayah: "Panggung, Kec. Tegal Timur",
    npsn: "P9962779",
  },
  {
    nama: "PKBM Citra Mandiri",
    jenis: "PKBM",
    wilayah: "Panggung, Kec. Tegal Timur",
    npsn: "P9970222",
  },
  {
    nama: "PKBM Star of Tomorrow",
    jenis: "PKBM",
    wilayah: "Tegalsari, Kec. Tegal Barat",
    npsn: "P9984920",
  },
  {
    nama: "PKBM Sarana Maju",
    jenis: "PKBM",
    wilayah: "Kemandungan, Kec. Tegal Barat",
    npsn: "P2960682",
  },
  {
    nama: "PKBM Transisi Anilo",
    jenis: "PKBM",
    wilayah: "Kemandungan, Kec. Tegal Barat",
    npsn: "P9970281",
  },
  {
    nama: "PKBM Bina Harapan",
    jenis: "PKBM",
    wilayah: "Pekauman, Kec. Tegal Barat",
    npsn: "P9962778",
  },
  {
    nama: "PKBM Budi Luhur",
    jenis: "PKBM",
    wilayah: "Pekauman, Kec. Tegal Barat",
    npsn: "P9970221",
  },
  {
    nama: "PKBM Mutiara Shahabat Pekauman",
    jenis: "PKBM",
    wilayah: "Pekauman, Kec. Tegal Barat",
    npsn: "P9984905",
  },
  {
    nama: "PKBM Maju Bersama",
    jenis: "PKBM",
    wilayah: "Pesurungan Lor, Kec. Margadana",
    npsn: "P9984904",
  },
  {
    nama: "PKBM Mekar",
    jenis: "PKBM",
    wilayah: "Kaligangsa, Kec. Margadana",
    npsn: "P9970280",
  },
  {
    nama: "PKBM Arum Indah",
    jenis: "PKBM",
    wilayah: "Randugunting, Kec. Tegal Selatan",
    npsn: "P9984903",
  },
  {
    nama: "PKBM Ki Hajar Dewantara",
    jenis: "PKBM",
    wilayah: "Kalinyamat Kulon, Kec. Margadana",
    npsn: "P9984902",
  },
];

// Opsi Jenjang PKBM & SKB (Pendidikan Kesetaraan)
const JENJANG_PKBM_OPTIONS = [
  "Paket A (Setara SD)",
  "Paket B (Setara SMP)",
  "Paket C (Setara SMA)",
  "PAUD Kesetaraan / Pendidikan Usia Dini",
  "Kursus / Pelatihan Keterampilan (LKP)",
];

// Opsi Jenjang Sekolah Formal Kota Tegal
const JENJANG_FORMAL_OPTIONS = [
  "SD / MI (Sekolah Dasar / Madrasah Ibtidaiyah)",
  "SMP / MTs (Sekolah Menengah Pertama / MTs)",
  "SMA / MA (Sekolah Menengah Atas / MA)",
  "SMK (Sekolah Menengah Kejuruan)",
  "SLB (Sekolah Luar Biasa)",
  "PAUD / TK (Pendidikan Anak Usia Dini Formal)",
];

// Opsi Jenjang Sekolah Luar Kota Tegal
const JENJANG_LUAR_OPTIONS = [
  "SD / MI (Sekolah Dasar / Madrasah Ibtidaiyah)",
  "SMP / MTs (Sekolah Menengah Pertama / MTs)",
  "SMA / SMK / MA (Tingkat Menengah Atas / Kejuruan)",
  "PKBM - Paket A (Setara SD)",
  "PKBM - Paket B (Setara SMP)",
  "PKBM - Paket C (Setara SMA)",
  "Pondok Pesantren",
  "Lainnya",
];

const INTERVENSI_OPTIONS = [
  "Bantuan Biaya / Beasiswa Pendidikan",
  "Bantuan Perlengkapan Sekolah (Seragam, Tas, Buku)",
  "Pendidikan Kesetaraan (Paket A/B/C di PKBM)",
  "Advokasi & Pendampingan Kader / Tokoh Warga",
  "Penyelesaian Masalah Sosial / Keluarga",
  "Fasilitasi Sekolah Terbuka / Inklusi",
  "Lainnya",
];

export function ModalKembaliBersekolah({
  isOpen,
  ats,
  komunitasId,
  onClose,
  onSuccess,
}: ModalKembaliBersekolahProps) {
  const [isPending, startTransition] = useTransition();

  // Kategori Pilihan Tempat Kembali Bersekolah
  const [kategori, setKategori] = useState<KategoriTempatBersekolah>("pkbm_skb");

  // 1. State PKBM & SKB
  const [selectedPkbm, setSelectedPkbm] = useState(DAFTAR_PKBM_SKB_TEGAL[0].nama);
  const [isCustomPkbm, setIsCustomPkbm] = useState(false);
  const [customPkbmNama, setCustomPkbmNama] = useState("");
  const [jenjangPkbm, setJenjangPkbm] = useState(() => {
    const rawJenjang = (ats.jenjang_asal || "").toLowerCase();
    const rawKelas = (ats.kelas_terakhir || "").toLowerCase();
    if (rawJenjang.includes("smp") || rawKelas.includes("smp") || rawJenjang.includes("paket b")) {
      return "Paket B (Setara SMP)";
    }
    if (rawJenjang.includes("sma") || rawKelas.includes("sma") || rawJenjang.includes("smk") || rawJenjang.includes("paket c")) {
      return "Paket C (Setara SMA)";
    }
    return "Paket A (Setara SD)";
  });

  // 2. State Sekolah Formal Kota Tegal
  const [namaSekolahFormal, setNamaSekolahFormal] = useState("");
  const [jenjangFormal, setJenjangFormal] = useState(() => {
    const rawJenjang = (ats.jenjang_asal || "").toLowerCase();
    const rawKelas = (ats.kelas_terakhir || "").toLowerCase();
    if (rawJenjang.includes("smp") || rawKelas.includes("smp")) {
      return "SMP / MTs (Sekolah Menengah Pertama / MTs)";
    }
    if (rawJenjang.includes("sma") || rawKelas.includes("sma") || rawJenjang.includes("smk")) {
      return "SMA / MA (Sekolah Menengah Atas / MA)";
    }
    return "SD / MI (Sekolah Dasar / Madrasah Ibtidaiyah)";
  });

  // 3. State Sekolah Luar Kota Tegal
  const [kabupatenLuar, setKabupatenLuar] = useState("");
  const [namaSekolahLuar, setNamaSekolahLuar] = useState("");
  const [jenjangLuar, setJenjangLuar] = useState("SD / MI (Sekolah Dasar / Madrasah Ibtidaiyah)");

  // State Umum
  const [bentukIntervensi, setBentukIntervensi] = useState(INTERVENSI_OPTIONS[0]);
  const [catatan, setCatatan] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let finalNamaSekolah = "";
    let finalJenjang = "";
    let kategoriLabel = "";

    if (kategori === "pkbm_skb") {
      kategoriLabel = "PKBM & SKB Kota Tegal";
      finalNamaSekolah = isCustomPkbm ? customPkbmNama.trim() : selectedPkbm.trim();
      finalJenjang = jenjangPkbm;

      if (!finalNamaSekolah) {
        setErrorMsg("Nama PKBM atau SKB tempat kembali bersekolah wajib dipilih / diisi.");
        return;
      }
    } else if (kategori === "formal_tegal") {
      kategoriLabel = "Sekolah Formal Kota Tegal";
      if (!namaSekolahFormal.trim()) {
        setErrorMsg("Nama Sekolah Formal di Kota Tegal wajib diisi.");
        return;
      }
      finalNamaSekolah = `${namaSekolahFormal.trim()} (Kota Tegal)`;
      finalJenjang = jenjangFormal;
    } else if (kategori === "luar_tegal") {
      kategoriLabel = "Sekolah Luar Kota Tegal";
      if (!namaSekolahLuar.trim()) {
        setErrorMsg("Nama Sekolah / Lembaga di Luar Kota Tegal wajib diisi.");
        return;
      }
      const wilayah = kabupatenLuar.trim() || "Luar Kota Tegal";
      finalNamaSekolah = `${namaSekolahLuar.trim()} (${wilayah})`;
      finalJenjang = jenjangLuar;
    }

    startTransition(async () => {
      const res = await kembaliBersekolah(ats.id, {
        namaSekolah: finalNamaSekolah,
        jenjang: finalJenjang,
        kategoriSekolah: kategoriLabel,
        bentukIntervensi,
        catatan: catatan.trim(),
        komunitasId,
      });

      if (res.success) {
        onSuccess(ats.id, finalNamaSekolah);
      } else {
        setErrorMsg(res.message || "Gagal memproses intervensi kembali bersekolah.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl max-h-[min(94dvh,calc(100dvh-2rem))] flex flex-col rounded-xl border border-emerald-500/30 bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border shrink-0 bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  INTERVENSI ATS
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground font-mono">
                CATAT KEMBALI BERSEKOLAH
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
          {/* Target Child Summary Card */}
          <div className="rounded-lg border border-border bg-background/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Profil Anak Penerima Intervensi
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Alasan Awal: {ats.alasan_tidak_sekolah || "Tidak Bersekolah"}
              </span>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground">
                {ats.nama_lengkap}
              </h4>
              <p className="text-xs font-mono text-muted-foreground">
                Wali: <span className="text-foreground">{ats.nama_orangtua}</span> ({ats.tinggal_bersama}) • Kontak: {ats.nomor_hp || "-"}
              </p>
              {ats.kelas_terakhir && (
                <p className="text-2xs text-muted-foreground">
                  Jenjang / Riwayat Terakhir: <strong className="text-foreground">{ats.kelas_terakhir}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Error Feedback */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md p-3 text-xs font-mono border border-destructive/40 bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="form-kembali-bersekolah" onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* PILIHAN KATEGORI TEMPAT KEMBALI BERSEKOLAH */}
            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-foreground flex items-center gap-1.5">
                <School className="h-3.5 w-3.5 text-emerald-400" />
                <span>PILIH TEMPAT KEMBALI BERSEKOLAH *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. PKBM & SKB Kota Tegal */}
                <button
                  type="button"
                  onClick={() => setKategori("pkbm_skb")}
                  className={cn(
                    "flex flex-col items-start justify-between rounded-lg border p-3 text-left transition-all cursor-pointer",
                    kategori === "pkbm_skb"
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/30"
                      : "border-border bg-card hover:bg-muted/60 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Building2 className={cn("h-4 w-4", kategori === "pkbm_skb" ? "text-emerald-400" : "text-muted-foreground")} />
                    <div
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border flex items-center justify-center",
                        kategori === "pkbm_skb"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-muted-foreground/40 bg-transparent"
                      )}
                    >
                      {kategori === "pkbm_skb" && <Check className="h-2 w-2 stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight text-foreground">
                      PKBM & SKB
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Kota Tegal (Kesetaraan)
                    </div>
                  </div>
                </button>

                {/* 2. Sekolah Formal Kota Tegal */}
                <button
                  type="button"
                  onClick={() => setKategori("formal_tegal")}
                  className={cn(
                    "flex flex-col items-start justify-between rounded-lg border p-3 text-left transition-all cursor-pointer",
                    kategori === "formal_tegal"
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/30"
                      : "border-border bg-card hover:bg-muted/60 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <School className={cn("h-4 w-4", kategori === "formal_tegal" ? "text-emerald-400" : "text-muted-foreground")} />
                    <div
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border flex items-center justify-center",
                        kategori === "formal_tegal"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-muted-foreground/40 bg-transparent"
                      )}
                    >
                      {kategori === "formal_tegal" && <Check className="h-2 w-2 stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight text-foreground">
                      Sekolah Formal
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Kota Tegal (SD/SMP/SMA)
                    </div>
                  </div>
                </button>

                {/* 3. Sekolah Luar Kota Tegal */}
                <button
                  type="button"
                  onClick={() => setKategori("luar_tegal")}
                  className={cn(
                    "flex flex-col items-start justify-between rounded-lg border p-3 text-left transition-all cursor-pointer",
                    kategori === "luar_tegal"
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/30"
                      : "border-border bg-card hover:bg-muted/60 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <MapPin className={cn("h-4 w-4", kategori === "luar_tegal" ? "text-emerald-400" : "text-muted-foreground")} />
                    <div
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border flex items-center justify-center",
                        kategori === "luar_tegal"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-muted-foreground/40 bg-transparent"
                      )}
                    >
                      {kategori === "luar_tegal" && <Check className="h-2 w-2 stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight text-foreground">
                      Sekolah Luar
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Kabupaten / Luar Kota
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* FORM SPESIFIK SESUAI KATEGORI YANG DIPILIH */}
            {/* OPSI 1: PKBM & SKB KOTA TEGAL */}
            {kategori === "pkbm_skb" && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-3 animate-in fade-in">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Nama Satuan PKBM / SKB di Kota Tegal *</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">13 Lembaga Resmi</span>
                  </div>
                  <select
                    value={isCustomPkbm ? "custom" : selectedPkbm}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomPkbm(true);
                      } else {
                        setIsCustomPkbm(false);
                        setSelectedPkbm(e.target.value);
                      }
                    }}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    {DAFTAR_PKBM_SKB_TEGAL.map((item) => (
                      <option key={item.nama} value={item.nama}>
                        [{item.jenis}] {item.nama} ({item.wilayah})
                      </option>
                    ))}
                    <option value="custom">+ PKBM / SKB Lainnya di Kota Tegal (Input Manual)</option>
                  </select>
                </div>

                {isCustomPkbm && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                      Tulis Nama PKBM / SKB Lainnya <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customPkbmNama}
                      onChange={(e) => setCustomPkbmNama(e.target.value)}
                      placeholder="Contoh: PKBM Baru Kota Tegal"
                      className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Jenjang PKBM */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Jenjang Program Pendidikan Kesetaraan *</span>
                  </label>
                  <select
                    value={jenjangPkbm}
                    onChange={(e) => setJenjangPkbm(e.target.value)}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    {JENJANG_PKBM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* OPSI 2: SEKOLAH FORMAL KOTA TEGAL */}
            {kategori === "formal_tegal" && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-3 animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5 text-primary" />
                    <span>Nama Sekolah Formal di Kota Tegal *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaSekolahFormal}
                    onChange={(e) => setNamaSekolahFormal(e.target.value)}
                    placeholder="Contoh: SDN 1 Mintaragen, SMPN 1 Kota Tegal, SMAN 1 Tegal, dll."
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tuliskan nama lengkap sekolah formal tempat anak diterima kembali belajar di Kota Tegal.
                  </p>
                </div>

                {/* Jenjang Sekolah Formal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>Jenjang Sekolah Formal *</span>
                  </label>
                  <select
                    value={jenjangFormal}
                    onChange={(e) => setJenjangFormal(e.target.value)}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
                  >
                    {JENJANG_FORMAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* OPSI 3: SEKOLAH LUAR KOTA TEGAL */}
            {kategori === "luar_tegal" && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                      <span>Kabupaten / Kota Lembaga *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={kabupatenLuar}
                      onChange={(e) => setKabupatenLuar(e.target.value)}
                      placeholder="Contoh: Kab. Tegal, Brebes, Pemalang"
                      className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <School className="h-3.5 w-3.5 text-amber-400" />
                      <span>Nama Sekolah / Lembaga *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={namaSekolahLuar}
                      onChange={(e) => setNamaSekolahLuar(e.target.value)}
                      placeholder="Contoh: SDN 2 Dukuhturi / SMPN 1 Jatibarang"
                      className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Jenjang Sekolah Luar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                    <span>Jenjang Pendidikan *</span>
                  </label>
                  <select
                    value={jenjangLuar}
                    onChange={(e) => setJenjangLuar(e.target.value)}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    {JENJANG_LUAR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* BENTUK INTERVENSI */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Bentuk Fasilitasi / Intervensi</span>
              </label>
              <select
                value={bentukIntervensi}
                onChange={(e) => setBentukIntervensi(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-emerald-500 focus:outline-hidden"
              >
                {INTERVENSI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* CATATAN TAMBAHAN */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Catatan Tambahan / Tanggal Masuk (Opsional)</span>
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan tanggal mulai belajar, pendamping dari kader/kelurahan, nomor induk siswa bila ada..."
                className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Info notice */}
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-emerald-400/90 leading-relaxed font-mono">
              💡 <strong>Hasil:</strong> Status anak akan tercatat <strong>Kembali Bersekolah</strong>, terdata pada riwayat penuntasan ATS, dan berpindah ke <strong>Data Anak aktif</strong>.
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 rounded-md border border-border bg-background text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-kembali-bersekolah"
            disabled={isPending}
            className="flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-mono font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>KONFIRMASI KEMBALI BERSEKOLAH</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
