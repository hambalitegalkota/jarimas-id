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
} from "lucide-react";
import { createDataAnak } from "@/app/actions/data-anak";
import { type JenisKomunitas } from "@/types/database";
import { cn } from "@/lib/utils";

interface FormDataAnakProps {
  komunitasId: string;
  komunitasNama: string;
  jenisKomunitas: JenisKomunitas | string;
  onSuccess?: () => void;
}

export const USIA_ANAK_OPTIONS = ["0", "1", "2", "3", "4", "5", "6"] as const;

const ALASAN_SEKOLAH_PAUD = [
  "Sudah Usia PAUD",
  "Agar Mandiri",
  "Supaya Lebih Matang Emosional",
  "Persiapan Ke SD",
  "Mengembangkan Keterampilan Sosial & Bahasa",
  "Semua Kerabat, Tetangga Seusia Sekolah PAUD",
];

const ALASAN_BELUM_SEKOLAH = [
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
  onSuccess,
}: FormDataAnakProps) {
  const [namaLengkap, setNamaLengkap] = useState("");
  const [usia, setUsia] = useState("3");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">("L");
  const [namaOrangtua, setNamaOrangtua] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [tinggalBersama, setTinggalBersama] = useState("Orang Tua");
  const [jarakRumahKm, setJarakRumahKm] = useState("0.5");

  const isPaud = jenisKomunitas === "satuan_paud";
  const isPosyandu = jenisKomunitas === "posyandu";

  // Sekolah State
  // Jika Komunitas PAUD: isSekolah = true (Sudah Bersekolah), namaSekolah = komunitasNama || "Satuan PAUD"
  // Selain Komunitas PAUD: isSekolah = false (Belum Bersekolah), namaSekolah = "Belum Sekolah"
  const isSekolah = isPaud;
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

        {/* 1. Nama Lengkap Sesuai Akta Kelahiran (Memanjang) */}
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

        {/* 2. Jenis Kelamin (Dibawah Nama Lengkap) */}
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

        {/* 3. Usia Anak & Jarak Rumah ke PAUD (Berdampingan) */}
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

        {/* 4. Nama Orang Tua / Wali (Memanjang Seperti Nama Lengkap) */}
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

        {/* 5. Nomor WhatsApp & Status Tinggal Bersama (Berdampingan) */}
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
