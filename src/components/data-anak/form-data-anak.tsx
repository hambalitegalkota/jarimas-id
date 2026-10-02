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
import { findPaudLocation } from "@/lib/data-anak-helpers";
import {
  DAFTAR_KECAMATAN_TEGAL,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  getKelurahanByKecamatan,
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

  const isPaud = jenisKomunitas === "satuan_paud";
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
    <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-bold shadow-xs animate-in fade-in ${
            feedback.type === "success"
              ? "border-2 border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-2 border-rose-300 bg-rose-50 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* SECTION 1: IDENTITAS ANAK */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-sm">
            1
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Identitas Anak (0–6 Tahun)
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Data dasar anak sesuai dokumen keluarga
            </p>
          </div>
        </div>

        {/* 1. Nama Lengkap Sesuai Akta Kelahiran */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 leading-snug block">
            Nama Lengkap Sesuai Akta Kelahiran <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Muhammad Bilal Al-Ghifari"
              className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 2. Jenis Kelamin */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 leading-snug block">
            Jenis Kelamin <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setJenisKelamin("L")}
              className={cn(
                "flex min-h-[50px] items-center justify-between rounded-xl border-2 px-4 py-3 text-base font-bold transition-all cursor-pointer text-left",
                jenisKelamin === "L"
                  ? "border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <span>Laki-laki (L)</span>
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  jenisKelamin === "L"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {jenisKelamin === "L" && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setJenisKelamin("P")}
              className={cn(
                "flex min-h-[50px] items-center justify-between rounded-xl border-2 px-4 py-3 text-base font-bold transition-all cursor-pointer text-left",
                jenisKelamin === "P"
                  ? "border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <span>Perempuan (P)</span>
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  jenisKelamin === "P"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {jenisKelamin === "P" && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
              </div>
            </button>
          </div>
        </div>

        {/* 3. Usia Anak & Jarak Rumah ke PAUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 leading-snug block">
              Usia Anak <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <select
                required
                value={usia}
                onChange={(e) => setUsia(e.target.value)}
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-10 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer"
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

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 leading-snug block">
              Jarak Rumah ke PAUD (km) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={jarakRumahKm}
                onChange={(e) => setJarakRumahKm(e.target.value)}
                placeholder="0.5"
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base font-mono text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 4. Nama Orang Tua / Wali */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 leading-snug block">
            Nama Orang Tua / Wali <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              required
              value={namaOrangtua}
              onChange={(e) => setNamaOrangtua(e.target.value)}
              placeholder="Contoh: Hendrawan & Maya"
              className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 5. Nomor WhatsApp & Status Tinggal Bersama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 leading-snug block">
              Nomor WhatsApp / HP <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="tel"
                required
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="081234567890"
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 leading-snug block">
              Status Tinggal Bersama <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Home className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <select
                value={tinggalBersama}
                onChange={(e) => setTinggalBersama(e.target.value)}
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-10 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer"
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
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-4 shadow-2xs mt-4">
          <div className="flex items-center gap-2 border-b border-blue-200 pb-2.5">
            <FileText className="h-5 w-5 text-blue-700" />
            <h4 className="text-base font-bold text-blue-950">
              Alamat Sesuai KK (Kartu Keluarga) <span className="text-rose-600">*</span>
            </h4>
          </div>

          {/* Kabupaten/Kota Sesuai KK */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 block">
              Kabupaten / Kota Sesuai KK
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setKkKabupatenChoice("kota_tegal")}
                className={cn(
                  "flex min-h-[46px] items-center justify-between rounded-xl border-2 py-2.5 px-4 text-sm font-bold transition-all cursor-pointer",
                  kkKabupatenChoice === "kota_tegal"
                    ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    kkKabupatenChoice === "kota_tegal"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {kkKabupatenChoice === "kota_tegal" && (
                    <Check className="h-3 w-3 stroke-[3px]" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setKkKabupatenChoice("luar_kota_tegal")}
                className={cn(
                  "flex min-h-[46px] items-center justify-between rounded-xl border-2 py-2.5 px-4 text-sm font-bold transition-all cursor-pointer",
                  kkKabupatenChoice === "luar_kota_tegal"
                    ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>Luar Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    kkKabupatenChoice === "luar_kota_tegal"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {kkKabupatenChoice === "luar_kota_tegal" && (
                    <Check className="h-3 w-3 stroke-[3px]" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {kkKabupatenChoice === "luar_kota_tegal" ? (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Nama Kabupaten / Kota Luar <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={kkKabupatenCustom}
                onChange={(e) => setKkKabupatenCustom(e.target.value)}
                placeholder="Contoh: Kabupaten Tegal, Brebes, Pemalang, dll."
                className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              {/* Kecamatan & Kelurahan KK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Kecamatan KK <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={kkKecamatan}
                    onChange={(e) => handleKkKecamatanChange(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Kelurahan KK <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={kkKelurahan}
                    onChange={(e) => setKkKelurahan(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {kkKelurahanOptions.map((kel) => (
                      <option key={kel} value={kel}>
                        {kel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RW (17) & RT (17) KK */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    RW Sesuai KK (01–17) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={kkRw}
                    onChange={(e) => setKkRw(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {DAFTAR_RW_TEGAL.map((rw) => (
                      <option key={rw} value={rw}>
                        RW {rw}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    RT Sesuai KK (01–17) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={kkRt}
                    onChange={(e) => setKkRt(e.target.value)}
                    className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {DAFTAR_RT_TEGAL.map((rt) => (
                      <option key={rt} value={rt}>
                        RT {rt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jalan KK */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Jalan / Alamat Sesuai KK <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kkJalan}
                  onChange={(e) => setKkJalan(e.target.value)}
                  placeholder="Contoh: Jl. Werkudoro No. 12, Gang Melati"
                  className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBSECTION B: ALAMAT DOMISILI */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-4 sm:p-5 space-y-4 shadow-2xs mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-700" />
              <h4 className="text-base font-bold text-emerald-950">
                Alamat Domisili (Tempat Tinggal Saat Ini) <span className="text-rose-600">*</span>
              </h4>
            </div>

            {/* Tombol Sinkronisasi Sama Dengan KK */}
            <button
              type="button"
              onClick={() => setIsDomisiliSameAsKk(!isDomisiliSameAsKk)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer w-fit",
                isDomisiliSameAsKk
                  ? "border-emerald-600 bg-emerald-100 text-emerald-900 shadow-2xs"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border",
                  isDomisiliSameAsKk
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-400 bg-white"
                )}
              >
                {isDomisiliSameAsKk && <Check className="h-3 w-3 stroke-[3px]" />}
              </div>
              <span>Sama dengan Alamat KK</span>
            </button>
          </div>

          {!isDomisiliSameAsKk ? (
            <div className="space-y-4 animate-in fade-in">
              {/* Kabupaten/Kota Domisili */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block">
                  Kabupaten / Kota Domisili
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDomisiliKabupatenChoice("kota_tegal")}
                    className={cn(
                      "flex min-h-[46px] items-center justify-between rounded-xl border-2 py-2.5 px-4 text-sm font-bold transition-all cursor-pointer",
                      domisiliKabupatenChoice === "kota_tegal"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span>Kota Tegal</span>
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        domisiliKabupatenChoice === "kota_tegal"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {domisiliKabupatenChoice === "kota_tegal" && (
                        <Check className="h-3 w-3 stroke-[3px]" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDomisiliKabupatenChoice("luar_kota_tegal")}
                    className={cn(
                      "flex min-h-[46px] items-center justify-between rounded-xl border-2 py-2.5 px-4 text-sm font-bold transition-all cursor-pointer",
                      domisiliKabupatenChoice === "luar_kota_tegal"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span>Luar Kota Tegal</span>
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        domisiliKabupatenChoice === "luar_kota_tegal"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {domisiliKabupatenChoice === "luar_kota_tegal" && (
                        <Check className="h-3 w-3 stroke-[3px]" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {domisiliKabupatenChoice === "luar_kota_tegal" ? (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nama Kabupaten / Kota Luar <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required={!isDomisiliSameAsKk}
                    value={domisiliKabupatenCustom}
                    onChange={(e) => setDomisiliKabupatenCustom(e.target.value)}
                    placeholder="Contoh: Kabupaten Tegal, Brebes, Pemalang, dll."
                    className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {/* Kecamatan & Kelurahan Domisili */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Kecamatan Domisili <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={domisiliKecamatan}
                        onChange={(e) => handleDomisiliKecamatanChange(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden cursor-pointer"
                      >
                        {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                          <option key={kec} value={kec}>
                            {kec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Kelurahan Domisili <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={domisiliKelurahan}
                        onChange={(e) => setDomisiliKelurahan(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden cursor-pointer"
                      >
                        {domisiliKelurahanOptions.map((kel) => (
                          <option key={kel} value={kel}>
                            {kel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* RW (17) & RT (17) Domisili */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        RW Domisili (01–17) <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={domisiliRw}
                        onChange={(e) => setDomisiliRw(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden cursor-pointer"
                      >
                        {DAFTAR_RW_TEGAL.map((rw) => (
                          <option key={rw} value={rw}>
                            RW {rw}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        RT Domisili (01–17) <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={domisiliRt}
                        onChange={(e) => setDomisiliRt(e.target.value)}
                        className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden cursor-pointer"
                      >
                        {DAFTAR_RT_TEGAL.map((rt) => (
                          <option key={rt} value={rt}>
                            RT {rt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Jalan Domisili */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Jalan / Alamat Domisili <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required={!isDomisiliSameAsKk}
                      value={domisiliJalan}
                      onChange={(e) => setDomisiliJalan(e.target.value)}
                      placeholder="Contoh: Jl. Melati No. 5, Lingkungan Warga"
                      className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300 bg-emerald-100/60 p-3.5 text-xs sm:text-sm font-semibold text-emerald-950 flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                Alamat domisili anak sama dengan Alamat Kartu Keluarga (KK):{" "}
                <strong className="font-bold">
                  {kkKabupatenChoice === "kota_tegal"
                    ? `${kkJalan || "Jl. ..."}, RT ${kkRt} / RW ${kkRw}, Kel. ${kkKelurahan}, Kec. ${kkKecamatan} (Kota Tegal)`
                    : `Luar Kota Tegal (${kkKabupatenCustom || "Nama Kab/Kota Belum Diisi"})`}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: STATUS & ALASAN SEKOLAH */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-sm">
            2
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Status Pendidikan PAUD / TK
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Kondisi partisipasi sekolah anak saat ini
            </p>
          </div>
        </div>

        {/* Status Bersekolah Sesuai Jenis Komunitas */}
        {isPaud ? (
          <>
            {/* Status Bersekolah Terkunci di Sudah Bersekolah untuk Komunitas PAUD */}
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 leading-snug block">
                Apakah Anak Sudah Bersekolah? <span className="text-rose-600">*</span>
              </label>
              <div className="flex min-h-[52px] items-center justify-between rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 px-4 py-3 shadow-xs ring-2 ring-emerald-600/20">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-5 w-5 text-emerald-700 shrink-0" />
                  <span className="text-base font-bold">Sudah Bersekolah</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-300">
                    Terkunci
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-600 text-white">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Nama Satuan PAUD / TK (Terkunci Otomatis Sesuai Komunitas yang Mengisi) */}
            <div className="space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-slate-900 leading-snug block">
                  Nama Satuan PAUD / TK <span className="text-rose-600">*</span>
                </label>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
                  Otomatis Terkunci
                </span>
              </div>
              <input
                type="text"
                required
                readOnly
                value={komunitasNama || "Satuan PAUD"}
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-slate-100/80 px-4 text-base font-bold text-slate-800 cursor-not-allowed select-none focus:outline-hidden"
              />
            </div>

            {/* Alasan Sekolah (Dropdown Dinamis) */}
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 leading-snug block">
                Alasan Mengikuti Pendidikan PAUD <span className="text-rose-600">*</span>
              </label>
              <select
                value={alasanSekolah}
                onChange={(e) => setAlasanSekolah(e.target.value)}
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
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
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 leading-snug block">
                Apakah Anak Sudah Bersekolah? <span className="text-rose-600">*</span>
              </label>
              <div className="flex min-h-[52px] items-center justify-between rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-950 px-4 py-3 shadow-xs ring-2 ring-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <Baby className="h-5 w-5 text-amber-700 shrink-0" />
                  <span className="text-base font-bold">Belum Bersekolah</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 border border-amber-300">
                    Terkunci
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-amber-600 bg-amber-600 text-white">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Pendaftaran data balita di komunitas non-PAUD (Posyandu / Warga Kita) terkunci pada status Belum Bersekolah.
              </p>
            </div>

            {/* Alasan Belum Bersekolah (Dropdown Dinamis) */}
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 leading-snug block">
                Alasan Belum Bersekolah PAUD <span className="text-rose-600">*</span>
              </label>
              <select
                value={alasanSekolah}
                onChange={(e) => setAlasanSekolah(e.target.value)}
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
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
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-sm">
              3
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Pengukuran DDTK Posyandu (Opsional)
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Antropometri &amp; tumbuh kembang balita
              </p>
            </div>
          </div>
          {!isPosyandu && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-300">
              <Lock className="h-3.5 w-3.5" />
              <span>Terkunci</span>
            </span>
          )}
        </div>

        {isPosyandu ? (
          <>
            <p className="text-sm text-slate-600 leading-relaxed">
              Masukkan hasil pengukuran terakhir jika anak baru saja ditimbang di Posyandu atau diperiksa Bidan.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Berat Badan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5 text-slate-400" />
                  BB (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(e.target.value)}
                  placeholder="12.5"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Tinggi Badan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5 text-slate-400" />
                  TB (CM)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(e.target.value)}
                  placeholder="88.0"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Panjang Badan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5 text-slate-400" />
                  PB (CM)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={panjangBadan}
                  onChange={(e) => setPanjangBadan(e.target.value)}
                  placeholder="88.0"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Lingkar Kepala */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-slate-400" />
                  LK (CM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={lingkarKepala}
                  onChange={(e) => setLingkarKepala(e.target.value)}
                  placeholder="47.0"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Catatan DDKS */}
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 leading-snug block">
                Catatan Kesehatan / Perkembangan
              </label>
              <input
                type="text"
                value={catatanDdks}
                onChange={(e) => setCatatanDdks(e.target.value)}
                placeholder="Contoh: Sudah bisa berjalan lancar, imunisasi campak lengkap."
                className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Locked Notice Banner */}
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50/90 p-4 sm:p-5 flex items-start gap-3.5 text-amber-950 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 border border-amber-400 text-amber-900">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>Data Belum Di Isi Oleh Posyandu</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Pengukuran antropometri DDTK (Berat Badan, Tinggi Badan, Panjang Badan, &amp; Lingkar Kepala) terkunci dan hanya dapat diisi oleh Kader di Komunitas Posyandu.
                </p>
              </div>
            </div>

            {/* Disabled Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 opacity-60 pointer-events-none select-none">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" />
                  BB (KG)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-200 bg-slate-100 px-3 text-center text-base font-mono font-bold text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5" />
                  TB (CM)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-200 bg-slate-100 px-3 text-center text-base font-mono font-bold text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5" />
                  PB (CM)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-200 bg-slate-100 px-3 text-center text-base font-mono font-bold text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  LK (CM)
                </label>
                <input
                  type="text"
                  disabled
                  value="-"
                  className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-200 bg-slate-100 px-3 text-center text-base font-mono font-bold text-slate-400 cursor-not-allowed"
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
          className="flex w-full min-h-[52px] h-13 items-center justify-center gap-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white px-6 text-base font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Menyimpan Data Anak...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Simpan &amp; Daftarkan Data Anak</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
