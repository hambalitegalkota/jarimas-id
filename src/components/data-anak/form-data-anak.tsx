"use client";

import { useState, useTransition } from "react";
import {
  Baby,
  Calendar,
  User,
  Phone,
  Home,
  MapPin,
  GraduationCap,
  Scale,
  Ruler,
  Activity,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
  Lock,
  FileText,
  Copy,
} from "lucide-react";
import { createDataAnak } from "@/app/actions/data-anak";
import { type JenisKomunitas } from "@/types/database";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { findPaudLocation, isKomunitasLayananPaud } from "@/lib/data-anak-helpers";
import {
  DAFTAR_KECAMATAN_TEGAL,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  getKelurahanByKecamatan,
  getRwListByKelurahan,
  getRtListByKelurahan,
  findOrGenerateKomunitasSeed,
} from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface FormDataAnakProps {
  komunitasId: string;
  komunitasNama: string;
  jenisKomunitas: JenisKomunitas | string;
  komunitas?: any;
  onSuccess?: () => void;
}

export const USIA_ANAK_OPTIONS = ["0", "1", "2", "3", "4", "5", "6"] as const;

export const ALASAN_SEKOLAH_PAUD = [
  "Sudah Usia PAUD",
  "Memberikan Pendidikan Terbaik Sejak Usia Dini",
  "Agar Mandiri",
  "Supaya Lebih Matang Emosional",
  "Persiapan Ke SD",
  "Mengembangkan Keterampilan Sosial & Bahasa",
  "Semua Kerabat, Tetangga Seusia Sekolah PAUD",
  "Orang Tua Bekerja",
];

export const ALASAN_BELUM_SEKOLAH = [
  "Belum Wajib (Masih Balita)",
  "Keterbatasan Ekonomi",
  "Jarak Sekolah Jauh",
  "Tidak Ada Yang Mengantar",
  "Anak Belum Siap Mental",
  "Anggapan PAUD Hanya Bermain",
  "Orangtua Belum Paham Manfaat PAUD",
  "Sekolah Terdekat Belum Berizin",
];

export function FormDataAnak({
  komunitasId,
  komunitasNama,
  jenisKomunitas,
  komunitas,
  onSuccess,
}: FormDataAnakProps) {
  // Ekstraksi Metadata Komunitas & Lokasi PAUD untuk default alamat awal
  const meta = extractKomunitasMetadata(
    komunitas ||
      findOrGenerateKomunitasSeed(komunitasId) || {
        id: komunitasId,
        nama: komunitasNama,
        jenis: jenisKomunitas,
      }
  );
  const paudLoc =
    jenisKomunitas === "satuan_paud" || meta.jenis === "satuan_paud"
      ? findPaudLocation(komunitasNama || komunitasId)
      : null;

  const initialKec =
    paudLoc?.kecamatan ||
    (meta.rawKec && meta.rawKec !== "Kota Tegal" && meta.rawKec !== "semua"
      ? meta.rawKec
      : null) ||
    DAFTAR_KECAMATAN_TEGAL[0] ||
    "Tegal Timur";

  const initialKel =
    paudLoc?.kelurahan ||
    (meta.rawKel && meta.rawKel !== "Semua Kelurahan" && meta.rawKel !== "semua"
      ? meta.rawKel
      : null) ||
    getKelurahanByKecamatan(initialKec)[0] ||
    "Kejambon";

  const initialRw = meta.rawRw || "01";
  const initialRt = meta.rawRt || "01";

  // Identitas Dasar Anak
  const [namaLengkap, setNamaLengkap] = useState("");
  const [usia, setUsia] = useState("3");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">("L");
  const [namaOrangtua, setNamaOrangtua] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [tinggalBersama, setTinggalBersama] = useState("Orang Tua");
  const [jarakRumahKm, setJarakRumahKm] = useState("0.5");

  // Alamat Sesuai KK
  const [kkKabupatenChoice, setKkKabupatenChoice] = useState<
    "kota_tegal" | "luar_kota_tegal"
  >("kota_tegal");
  const [kkKabupatenCustom, setKkKabupatenCustom] = useState("");
  const [kkKecamatan, setKkKecamatan] = useState<string>(initialKec);
  const [kkKelurahan, setKkKelurahan] = useState<string>(initialKel);
  const [kkRw, setKkRw] = useState(initialRw);
  const [kkRt, setKkRt] = useState(initialRt);
  const [kkJalan, setKkJalan] = useState("");

  // Alamat Domisili
  const [isDomisiliSameAsKk, setIsDomisiliSameAsKk] = useState(true);
  const [domisiliKabupatenChoice, setDomisiliKabupatenChoice] = useState<
    "kota_tegal" | "luar_kota_tegal"
  >("kota_tegal");
  const [domisiliKabupatenCustom, setDomisiliKabupatenCustom] = useState("");
  const [domisiliKecamatan, setDomisiliKecamatan] = useState<string>(initialKec);
  const [domisiliKelurahan, setDomisiliKelurahan] = useState<string>(initialKel);
  const [domisiliRw, setDomisiliRw] = useState(initialRw);
  const [domisiliRt, setDomisiliRt] = useState(initialRt);
  const [domisiliJalan, setDomisiliJalan] = useState("");

  const isPaud = isKomunitasLayananPaud(komunitas, komunitasNama, String(jenisKomunitas));
  const isPosyandu = jenisKomunitas === "posyandu";

  // Sekolah State
  const [alasanSekolah, setAlasanSekolah] = useState(
    isPaud ? ALASAN_SEKOLAH_PAUD[0] : ALASAN_BELUM_SEKOLAH[0]
  );

  // DDKS State
  const [beratBadan, setBeratBadan] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [panjangBadan, setPanjangBadan] = useState("");
  const [lingkarKepala, setLingkarKepala] = useState("");
  const [catatanDdks, setCatatanDdks] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleKkKecamatanChange = (kec: string) => {
    setKkKecamatan(kec);
    const kels = getKelurahanByKecamatan(kec);
    if (kels.length > 0) {
      setKkKelurahan(kels[0]);
    }
  };

  const handleDomisiliKecamatanChange = (kec: string) => {
    setDomisiliKecamatan(kec);
    const kels = getKelurahanByKecamatan(kec);
    if (kels.length > 0) {
      setDomisiliKelurahan(kels[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("komunitasId", komunitasId);
    formData.append("jenisKomunitas", jenisKomunitas);
    formData.append("komunitasNama", komunitasNama);

    formData.append("namaLengkap", namaLengkap);
    formData.append("usia", usia);
    formData.append("jenisKelamin", jenisKelamin);
    formData.append("namaOrangtua", namaOrangtua);
    formData.append("nomorHp", nomorHp);
    formData.append("tinggalBersama", tinggalBersama);
    formData.append("jarakRumahKm", jarakRumahKm);

    // Alamat KK
    const isKkLuar = kkKabupatenChoice === "luar_kota_tegal";
    const finalKkKab =
      !isKkLuar
        ? "Kota Tegal"
        : kkKabupatenCustom.trim() || "Luar Kota Tegal";
    formData.append("kkKabupaten", finalKkKab);
    formData.append("kkKecamatan", isKkLuar ? "" : kkKecamatan);
    formData.append("kkKelurahan", isKkLuar ? "" : kkKelurahan);
    formData.append("kkRw", isKkLuar ? "" : kkRw);
    formData.append("kkRt", isKkLuar ? "" : kkRt);
    formData.append("kkJalan", isKkLuar ? "" : kkJalan);

    // Alamat Domisili
    if (isDomisiliSameAsKk) {
      formData.append("domisiliKabupaten", finalKkKab);
      formData.append("domisiliKecamatan", isKkLuar ? "" : kkKecamatan);
      formData.append("domisiliKelurahan", isKkLuar ? "" : kkKelurahan);
      formData.append("domisiliRw", isKkLuar ? "" : kkRw);
      formData.append("domisiliRt", isKkLuar ? "" : kkRt);
      formData.append("domisiliJalan", isKkLuar ? "" : kkJalan);
    } else {
      const isDomLuar = domisiliKabupatenChoice === "luar_kota_tegal";
      const finalDomKab =
        !isDomLuar
          ? "Kota Tegal"
          : domisiliKabupatenCustom.trim() || "Luar Kota Tegal";
      formData.append("domisiliKabupaten", finalDomKab);
      formData.append("domisiliKecamatan", isDomLuar ? "" : domisiliKecamatan);
      formData.append("domisiliKelurahan", isDomLuar ? "" : domisiliKelurahan);
      formData.append("domisiliRw", isDomLuar ? "" : domisiliRw);
      formData.append("domisiliRt", isDomLuar ? "" : domisiliRt);
      formData.append("domisiliJalan", isDomLuar ? "" : domisiliJalan);
    }

    const finalNamaSekolah = isPaud
      ? komunitasNama || "Satuan PAUD"
      : "Belum Sekolah";
    const finalAlasanSekolah =
      alasanSekolah || (isPaud ? ALASAN_SEKOLAH_PAUD[0] : ALASAN_BELUM_SEKOLAH[0]);

    formData.append("isSekolah", isPaud ? "true" : "false");
    formData.append("namaSekolah", finalNamaSekolah);
    formData.append("alasanSekolah", finalAlasanSekolah);

    // Pengukuran DDTK hanya dikirim jika pendaftaran dilakukan di Komunitas Posyandu
    if (isPosyandu) {
      if (beratBadan) formData.append("beratBadan", beratBadan);
      if (tinggiBadan) formData.append("tinggiBadan", tinggiBadan);
      if (panjangBadan) formData.append("panjangBadan", panjangBadan);
      if (lingkarKepala) formData.append("lingkarKepala", lingkarKepala);
      if (catatanDdks) formData.append("catatanDdks", catatanDdks);
    }

    startTransition(async () => {
      const res = await createDataAnak(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const kkKelurahanOptions = getKelurahanByKecamatan(kkKecamatan);
  const domisiliKelurahanOptions = getKelurahanByKecamatan(domisiliKecamatan);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-4 sm:space-y-5">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg p-3 text-xs sm:text-sm font-semibold shadow-2xs animate-in fade-in border",
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-50 text-emerald-900"
              : "border-rose-500/20 bg-rose-50 text-rose-900"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* SECTION 1: IDENTITAS ANAK */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
            1
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
              Identitas Anak (0–6 Tahun)
            </h3>
            <p className="text-2xs sm:text-xs font-medium text-muted-foreground">
              Data dasar anak sesuai dokumen keluarga
            </p>
          </div>
        </div>

        {/* 1. Nama Lengkap Sesuai Akta Kelahiran */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
            Nama Lengkap Sesuai Akta Kelahiran <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Muhammad Bilal Al-Ghifari"
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Jenis Kelamin */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
            Jenis Kelamin <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setJenisKelamin("L")}
              className={cn(
                "flex min-h-[44px] h-11 items-center justify-between rounded-lg border px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer text-left",
                jenisKelamin === "L"
                  ? "border-primary bg-primary/5 text-primary shadow-2xs"
                  : "border-border bg-background text-foreground hover:bg-muted/40"
              )}
            >
              <span>Laki-laki (L)</span>
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full border",
                  jenisKelamin === "L"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {jenisKelamin === "L" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setJenisKelamin("P")}
              className={cn(
                "flex min-h-[44px] h-11 items-center justify-between rounded-lg border px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer text-left",
                jenisKelamin === "P"
                  ? "border-primary bg-primary/5 text-primary shadow-2xs"
                  : "border-border bg-background text-foreground hover:bg-muted/40"
              )}
            >
              <span>Perempuan (P)</span>
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full border",
                  jenisKelamin === "P"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {jenisKelamin === "P" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
              </div>
            </button>
          </div>
        </div>

        {/* 3. Usia Anak & Jarak Rumah ke PAUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
              Usia Anak <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <select
                required
                value={usia}
                onChange={(e) => setUsia(e.target.value)}
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-8 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  -- Pilih Usia Anak (0-6 Tahun) --
                </option>
                {USIA_ANAK_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {`${opt} Tahun`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
              Jarak Rumah ke PAUD (km) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={jarakRumahKm}
                onChange={(e) => setJarakRumahKm(e.target.value)}
                placeholder="0.5"
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-xs sm:text-sm font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Nama Orang Tua / Wali */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
            Nama Orang Tua / Wali <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={namaOrangtua}
              onChange={(e) => setNamaOrangtua(e.target.value)}
              placeholder="Contoh: Hendrawan & Maya"
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 5. Nomor WhatsApp & Status Tinggal Bersama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
              Nomor WhatsApp / HP <span className="text-2xs font-normal text-muted-foreground">(Opsional)</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="081234567890"
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
              Status Tinggal Bersama <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Home className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <select
                value={tinggalBersama}
                onChange={(e) => setTinggalBersama(e.target.value)}
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-8 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="Orang Tua">Orang Tua Kandung</option>
                <option value="Orang Tua Tunggal">Orang Tua Tunggal</option>
                <option value="Kakek / Nenek">Kakek / Nenek</option>
                <option value="Wali / Saudara">Wali / Saudara</option>
                <option value="Panti Asuhan">Panti Asuhan / Pengasuh</option>
              </select>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBSECTION A: ALAMAT SESUAI KK */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-lg border border-border bg-muted/20 p-3.5 sm:p-4 space-y-3.5 shadow-2xs mt-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Alamat Sesuai KK (Kartu Keluarga) <span className="text-destructive">*</span>
            </h4>
          </div>

          {/* Kabupaten/Kota Sesuai KK */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              Kabupaten / Kota Sesuai KK
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKkKabupatenChoice("kota_tegal")}
                className={cn(
                  "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                  kkKabupatenChoice === "kota_tegal"
                    ? "border-primary bg-primary/5 text-primary shadow-2xs"
                    : "border-border bg-background text-foreground hover:bg-muted/40"
                )}
              >
                <span>Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    kkKabupatenChoice === "kota_tegal"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {kkKabupatenChoice === "kota_tegal" && (
                    <Check className="h-2.5 w-2.5 stroke-[3px]" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setKkKabupatenChoice("luar_kota_tegal")}
                className={cn(
                  "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                  kkKabupatenChoice === "luar_kota_tegal"
                    ? "border-primary bg-primary/5 text-primary shadow-2xs"
                    : "border-border bg-background text-foreground hover:bg-muted/40"
                )}
              >
                <span>Luar Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    kkKabupatenChoice === "luar_kota_tegal"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {kkKabupatenChoice === "luar_kota_tegal" && (
                    <Check className="h-2.5 w-2.5 stroke-[3px]" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {kkKabupatenChoice === "luar_kota_tegal" ? (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                Nama Kabupaten / Kota Luar <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={kkKabupatenCustom}
                onChange={(e) => setKkKabupatenCustom(e.target.value)}
                placeholder="Contoh: Kabupaten Tegal, Brebes, Pemalang, dll."
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in">
              {/* Kecamatan & Kelurahan KK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                    Kecamatan KK <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={kkKecamatan}
                    onChange={(e) => handleKkKecamatanChange(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                    Kelurahan KK <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={kkKelurahan}
                    onChange={(e) => setKkKelurahan(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {kkKelurahanOptions.map((kel) => (
                      <option key={kel} value={kel}>
                        {kel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RW & RT KK */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                    RW Sesuai KK <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={kkRw}
                    onChange={(e) => setKkRw(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {getRwListByKelurahan(kkKelurahan).map((rw) => (
                      <option key={rw} value={rw}>
                        RW {rw}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                    RT Sesuai KK <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={kkRt}
                    onChange={(e) => setKkRt(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {getRtListByKelurahan(kkKelurahan, kkRw).map((rt) => (
                      <option key={rt} value={rt}>
                        RT {rt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jalan KK */}
              <div className="space-y-1">
                <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Jalan / Alamat Sesuai KK <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kkJalan}
                  onChange={(e) => setKkJalan(e.target.value)}
                  placeholder="Contoh: Jl. Werkudoro No. 12, Gang Melati"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBSECTION B: ALAMAT DOMISILI */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-lg border border-border bg-muted/20 p-3.5 sm:p-4 space-y-3.5 shadow-2xs mt-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Alamat Domisili (Tempat Tinggal Saat Ini) <span className="text-destructive">*</span>
              </h4>
            </div>

            {/* Tombol Sinkronisasi Sama Dengan KK */}
            <button
              type="button"
              onClick={() => setIsDomisiliSameAsKk(!isDomisiliSameAsKk)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold transition-all cursor-pointer w-fit",
                isDomisiliSameAsKk
                  ? "border-primary bg-primary/10 text-primary shadow-2xs"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded border",
                  isDomisiliSameAsKk
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {isDomisiliSameAsKk && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
              </div>
              <span>Sama dengan KK</span>
            </button>
          </div>

          {!isDomisiliSameAsKk ? (
            <div className="space-y-3 animate-in fade-in">
              {/* Kabupaten/Kota Domisili */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Kabupaten / Kota Domisili
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDomisiliKabupatenChoice("kota_tegal")}
                    className={cn(
                      "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                      domisiliKabupatenChoice === "kota_tegal"
                        ? "border-primary bg-primary/5 text-primary shadow-2xs"
                        : "border-border bg-background text-foreground hover:bg-muted/40"
                    )}
                  >
                    <span>Kota Tegal</span>
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        domisiliKabupatenChoice === "kota_tegal"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {domisiliKabupatenChoice === "kota_tegal" && (
                        <Check className="h-2.5 w-2.5 stroke-[3px]" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDomisiliKabupatenChoice("luar_kota_tegal")}
                    className={cn(
                      "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                      domisiliKabupatenChoice === "luar_kota_tegal"
                        ? "border-primary bg-primary/5 text-primary shadow-2xs"
                        : "border-border bg-background text-foreground hover:bg-muted/40"
                    )}
                  >
                    <span>Luar Kota Tegal</span>
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border",
                        domisiliKabupatenChoice === "luar_kota_tegal"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {domisiliKabupatenChoice === "luar_kota_tegal" && (
                        <Check className="h-2.5 w-2.5 stroke-[3px]" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {domisiliKabupatenChoice === "luar_kota_tegal" ? (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                    Nama Kabupaten / Kota Luar <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required={!isDomisiliSameAsKk}
                    value={domisiliKabupatenCustom}
                    onChange={(e) => setDomisiliKabupatenCustom(e.target.value)}
                    placeholder="Contoh: Kabupaten Tegal, Brebes, Pemalang, dll."
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in">
                  {/* Kecamatan & Kelurahan Domisili */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                        Kecamatan Domisili <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={domisiliKecamatan}
                        onChange={(e) => handleDomisiliKecamatanChange(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                      >
                        {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                          <option key={kec} value={kec}>
                            {kec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                        Kelurahan Domisili <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={domisiliKelurahan}
                        onChange={(e) => setDomisiliKelurahan(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                      >
                        {domisiliKelurahanOptions.map((kel) => (
                          <option key={kel} value={kel}>
                            {kel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* RW & RT Domisili */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                        RW Domisili <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={domisiliRw}
                        onChange={(e) => setDomisiliRw(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                      >
                        {getRwListByKelurahan(domisiliKelurahan).map((rw) => (
                          <option key={rw} value={rw}>
                            RW {rw}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                        RT Domisili <span className="text-destructive">*</span>
                      </label>
                      <select
                        value={domisiliRt}
                        onChange={(e) => setDomisiliRt(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                      >
                        {getRtListByKelurahan(domisiliKelurahan, domisiliRw).map((rt) => (
                          <option key={rt} value={rt}>
                            RT {rt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Jalan Domisili */}
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Jalan / Alamat Domisili <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required={!isDomisiliSameAsKk}
                      value={domisiliJalan}
                      onChange={(e) => setDomisiliJalan(e.target.value)}
                      placeholder="Contoh: Jl. Melati No. 5, Lingkungan Warga"
                      className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>
                Alamat domisili anak sama dengan Alamat Kartu Keluarga (KK):{" "}
                <strong className="font-bold text-primary">
                  {kkKabupatenChoice === "kota_tegal"
                    ? `${kkJalan || "Jl. ..."}, RT ${kkRt} / RW ${kkRw}, Kel. ${kkKelurahan}, Kec. ${kkKecamatan}`
                    : `Luar Kota Tegal (${kkKabupatenCustom || "Belum Diisi"})`}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: STATUS & ALASAN SEKOLAH */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
            2
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
              Status Pendidikan PAUD / TK
            </h3>
            <p className="text-2xs sm:text-xs font-medium text-muted-foreground">
              Kondisi partisipasi sekolah anak saat ini
            </p>
          </div>
        </div>

        {/* Status Bersekolah Sesuai Jenis Komunitas */}
        {isPaud ? (
          <>
            {/* Status Bersekolah Terkunci di Sudah Bersekolah untuk Komunitas PAUD */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
                Apakah Anak Sudah Bersekolah? <span className="text-destructive">*</span>
              </label>
              <div className="flex min-h-[44px] h-11 items-center justify-between rounded-lg border border-primary/30 bg-primary/5 text-primary px-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">Sudah Bersekolah</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-2xs font-extrabold text-primary border border-primary/20">
                    Terkunci
                  </span>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground">
                    <Check className="h-2.5 w-2.5 stroke-[3px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Nama Satuan PAUD / TK (Terkunci Otomatis Sesuai Komunitas yang Mengisi) */}
            <div className="space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
                  Nama Satuan PAUD / TK <span className="text-destructive">*</span>
                </label>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-2xs font-extrabold text-muted-foreground border border-border">
                  Otomatis
                </span>
              </div>
              <input
                type="text"
                required
                readOnly
                value={komunitasNama || "Satuan PAUD"}
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-muted/50 px-3 text-xs sm:text-sm font-bold text-foreground cursor-not-allowed select-none focus:outline-none"
              />
            </div>

            {/* Alasan Sekolah (Dropdown Dinamis) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
                Alasan Mengikuti PAUD <span className="text-destructive">*</span>
              </label>
              <select
                value={alasanSekolah}
                onChange={(e) => setAlasanSekolah(e.target.value)}
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {ALASAN_SEKOLAH_PAUD.map((alasan) => (
                  <option key={alasan} value={alasan}>
                    {alasan}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Status Bersekolah Terkunci di Belum Bersekolah untuk Selain Komunitas PAUD */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
                Apakah Anak Sudah Bersekolah? <span className="text-destructive">*</span>
              </label>
              <div className="flex min-h-[44px] h-11 items-center justify-between rounded-lg border border-secondary/30 bg-secondary/10 text-secondary px-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Baby className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">Belum Bersekolah</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-secondary/15 px-1.5 py-0.5 text-2xs font-extrabold text-secondary border border-secondary/30">
                    Terkunci
                  </span>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-secondary bg-secondary text-secondary-foreground">
                    <Check className="h-2.5 w-2.5 stroke-[3px]" />
                  </div>
                </div>
              </div>
              <p className="text-2xs text-muted-foreground font-medium">
                Pendaftaran peserta didik PAUD aktif (sudah bersekolah) hanya dapat dilakukan oleh Satuan PAUD, PKBM Star of Tomorrow, atau SKB Kota Tegal. Di komunitas wilayah/posyandu, anak dicatat sebagai belum bersekolah.
              </p>
            </div>

            {/* Alasan Belum Bersekolah (Dropdown Dinamis) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
                Alasan Belum Bersekolah PAUD <span className="text-destructive">*</span>
              </label>
              <select
                value={alasanSekolah}
                onChange={(e) => setAlasanSekolah(e.target.value)}
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {ALASAN_BELUM_SEKOLAH.map((alasan) => (
                  <option key={alasan} value={alasan}>
                    {alasan}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* SECTION 3: PENGUKURAN DDTK AWAL (OPSIONAL) */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                Pengukuran DDTK Posyandu (Opsional)
              </h3>
              <p className="text-2xs sm:text-xs font-medium text-muted-foreground">
                Antropometri &amp; tumbuh kembang balita
              </p>
            </div>
          </div>
          {!isPosyandu && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2 py-0.5 text-2xs font-extrabold text-secondary border border-secondary/30">
              <Lock className="h-3 w-3" />
              <span>Terkunci</span>
            </span>
          )}
        </div>

        {isPosyandu ? (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Masukkan hasil pengukuran terakhir jika anak baru saja ditimbang di Posyandu atau diperiksa Bidan.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Berat Badan */}
              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Scale className="h-3 w-3 text-primary" />
                  BB (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(e.target.value)}
                  placeholder="12.5"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Tinggi Badan */}
              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-primary" />
                  TB (CM)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(e.target.value)}
                  placeholder="88.0"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Panjang Badan */}
              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-primary" />
                  PB (CM)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={panjangBadan}
                  onChange={(e) => setPanjangBadan(e.target.value)}
                  placeholder="88.0"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Lingkar Kepala */}
              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3 text-primary" />
                  LK (CM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={lingkarKepala}
                  onChange={(e) => setLingkarKepala(e.target.value)}
                  placeholder="47.0"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Catatan DDKS */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-foreground leading-snug block">
                Catatan Kesehatan / Perkembangan
              </label>
              <input
                type="text"
                value={catatanDdks}
                onChange={(e) => setCatatanDdks(e.target.value)}
                placeholder="Contoh: Sudah bisa berjalan lancar, imunisasi campak lengkap."
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {/* Locked Notice Banner */}
            <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3.5 flex items-start gap-3 text-foreground shadow-2xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                <Lock className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Data Belum Diisi Oleh Posyandu</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pengukuran antropometri DDTK (Berat Badan, Tinggi Badan, Panjang Badan, &amp; Lingkar Kepala) terkunci dan hanya dapat diisi oleh Kader di Komunitas Posyandu.
                </p>
              </div>
            </div>

            {/* Disabled Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 opacity-60 pointer-events-none select-none">
              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  BB (KG)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-muted px-3 text-center text-xs sm:text-sm font-mono font-bold text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  TB (CM)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-muted px-3 text-center text-xs sm:text-sm font-mono font-bold text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  PB (CM)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-muted px-3 text-center text-xs sm:text-sm font-mono font-bold text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  LK (CM)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-muted px-3 text-center text-xs sm:text-sm font-mono font-bold text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2 pb-6">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground px-5 text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan Data Anak...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Simpan &amp; Daftarkan Data Anak</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
