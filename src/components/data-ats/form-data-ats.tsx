"use client";

import { useState, useTransition } from "react";
import {
  User,
  Calendar,
  Phone,
  Home,
  GraduationCap,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  MapPin,
  Building2,
  School,
  BookOpen,
} from "lucide-react";
import { createDataAts } from "@/app/actions/data-ats";
import {
  ALASAN_TIDAK_SEKOLAH_LIST,
  type AlasanTidakSekolah,
  USIA_ATS_OPTIONS,
} from "@/types/database";
import {
  DAFTAR_KECAMATAN_TEGAL,
  getKelurahanByKecamatan,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
} from "@/lib/constants/tegal-data";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import type { KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface FormDataAtsProps {
  komunitasId: string;
  komunitasNama: string;
  komunitas?: KomunitasWithMembership;
  onSuccess?: () => void;
}

export const KELAS_TERAKHIR_OPTIONS = [
  "Belum Pernah Sekolah",
  "Kelas 1 SD / MI",
  "Kelas 2 SD / MI",
  "Kelas 3 SD / MI",
  "Kelas 4 SD / MI",
  "Kelas 5 SD / MI",
  "Kelas 6 SD / MI (Lulus / Putus)",
  "Kelas 7 SMP / MTs (Kelas 1 SMP)",
  "Kelas 8 SMP / MTs (Kelas 2 SMP)",
  "Kelas 9 SMP / MTs (Lulus / Putus)",
  "Kelas 10 SMA / SMK / MA (Kelas 1 SMA)",
  "Kelas 11 SMA / SMK / MA (Kelas 2 SMA)",
  "Kelas 12 SMA / SMK / MA (Lulus / Putus)",
  "PKBM - Paket A (Setara SD)",
  "PKBM - Paket B (Setara SMP)",
  "PKBM - Paket C (Setara SMA)",
  "Pondok Pesantren",
  "Lainnya",
] as const;

export function FormDataAts({
  komunitasId,
  komunitasNama,
  komunitas,
  onSuccess,
}: FormDataAtsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Wilayah Warga (Auto-detect from Komunitas Metadata)
  const meta = extractKomunitasMetadata(
    komunitas || { id: komunitasId, nama: komunitasNama }
  );
  const initialKecamatan =
    meta.rawKec && meta.rawKec !== "Kota Tegal"
      ? meta.rawKec
      : "Tegal Selatan";
  const initialKelurahan = meta.rawKel || "Randugunting";
  const initialRw = meta.rawRw || "01";
  const initialRt = meta.rawRt || "01";

  const [kecamatan, setKecamatan] = useState(initialKecamatan);
  const [kelurahan, setKelurahan] = useState(initialKelurahan);
  const [rt, setRt] = useState(initialRt);
  const [rw, setRw] = useState(initialRw);
  const [alamat, setAlamat] = useState("");

  // Identitas Anak
  const [namaLengkap, setNamaLengkap] = useState("");
  const [usia, setUsia] = useState("10");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">("L");
  const [namaOrangtua, setNamaOrangtua] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [tinggalBersama, setTinggalBersama] = useState("Orang Tua");

  // Riwayat Pendidikan Sebelumnya
  const [sekolahSebelumnya, setSekolahSebelumnya] = useState("");
  const [kelasTerakhir, setKelasTerakhir] = useState<string>(KELAS_TERAKHIR_OPTIONS[0]);

  // Status Pendidikan ATS
  const [keinginanSekolah, setKeinginanSekolah] = useState<"Masih Ada" | "Tidak Ada">("Masih Ada");
  const [alasanTidakSekolah, setAlasanTidakSekolah] = useState<AlasanTidakSekolah>(
    ALASAN_TIDAK_SEKOLAH_LIST[0]
  );
  const [keterangan, setKeterangan] = useState("");

  const kelurahanOptions = getKelurahanByKecamatan(kecamatan);

  const handleKecamatanChange = (newKec: string) => {
    setKecamatan(newKec);
    const kels = getKelurahanByKecamatan(newKec);
    if (kels.length > 0) {
      setKelurahan(kels[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("komunitasId", komunitasId);
    formData.append("komunitasNama", komunitasNama);
    formData.append("namaLengkap", namaLengkap);
    formData.append("usia", usia);
    formData.append("jenisKelamin", jenisKelamin);
    formData.append("namaOrangtua", namaOrangtua);
    formData.append("nomorHp", nomorHp);
    formData.append("tinggalBersama", tinggalBersama);

    // Alamat, RT/RW, Wilayah
    formData.append("alamat", alamat);
    formData.append("rt", rt);
    formData.append("rw", rw);
    formData.append("kelurahan", kelurahan);
    formData.append("kecamatan", kecamatan);

    // Sekolah Sebelumnya & Kelas Terakhir
    formData.append("sekolahSebelumnya", sekolahSebelumnya);
    formData.append("kelasTerakhir", kelasTerakhir);

    // Status ATS
    formData.append("keinginanSekolah", keinginanSekolah);
    formData.append("alasanTidakSekolah", alasanTidakSekolah);
    formData.append("keterangan", keterangan);

    startTransition(async () => {
      const res = await createDataAts(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Data ATS berhasil disimpan!",
        });
        setTimeout(() => {
          onSuccess?.();
        }, 800);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal menyimpan data ATS.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-6 text-left">
      {/* Alert Feedback */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl p-4 text-base font-semibold border-2",
            feedback.type === "success"
              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
              : "border-red-600 bg-red-50 text-red-900"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
          )}
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* BANNER WILAYAH WARGA (Coursera Card Style) */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5 text-base font-bold text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <MapPin className="h-5 w-5" />
            </div>
            <span>Wilayah Pendataan ATS</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
            Kota Tegal
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-base font-bold text-slate-800">
              Kecamatan
            </label>
            <select
              value={kecamatan}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className="w-full min-h-[48px] h-12 bg-slate-50 border-2 border-slate-300 rounded-xl px-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            >
              {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-base font-bold text-slate-800">
              Kelurahan
            </label>
            <select
              value={kelurahan}
              onChange={(e) => setKelurahan(e.target.value)}
              className="w-full min-h-[48px] h-12 bg-slate-50 border-2 border-slate-300 rounded-xl px-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            >
              {kelurahanOptions.map((kel) => (
                <option key={kel} value={kel}>
                  Kelurahan {kel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: IDENTITAS ANAK TIDAK SEKOLAH (ATS) */}
      <div className="space-y-5 rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">
            1
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Identitas Anak Tidak Sekolah (ATS)
            </h3>
            <p className="text-sm text-slate-600">
              Isi data identitas diri dan orang tua / wali anak
            </p>
          </div>
        </div>

        {/* Nama Lengkap */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 block">
            Nama Lengkap Anak (Sesuai Akta) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-500" />
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Ketik nama lengkap anak..."
              className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Usia & Jenis Kelamin (Vertical Single Column on Mobile) */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              Usia Anak <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <select
                required
                value={usia}
                onChange={(e) => setUsia(e.target.value)}
                className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-8 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none"
              >
                <option value="" disabled>
                  -- Pilih Usia --
                </option>
                {USIA_ATS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "24>" ? "24> (Lebih dari 24 Tahun)" : `${opt} Tahun`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setJenisKelamin("L")}
                className={cn(
                  "flex min-h-[52px] h-13 items-center justify-center gap-2 rounded-xl border-2 text-base font-bold transition-all cursor-pointer",
                  jenisKelamin === "L"
                    ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/30 font-extrabold shadow-xs"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>Laki-laki (L)</span>
              </button>
              <button
                type="button"
                onClick={() => setJenisKelamin("P")}
                className={cn(
                  "flex min-h-[52px] h-13 items-center justify-center gap-2 rounded-xl border-2 text-base font-bold transition-all cursor-pointer",
                  jenisKelamin === "P"
                    ? "border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-600/30 font-extrabold shadow-xs"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>Perempuan (P)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nama Orang Tua & Kontak HP */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              Nama Orang Tua / Wali <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaOrangtua}
              onChange={(e) => setNamaOrangtua(e.target.value)}
              placeholder="Contoh: Budi Susanto"
              className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              Nomor WhatsApp / HP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <input
                type="tel"
                required
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="081234567890"
                className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Status Tinggal Bersama */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 block">
            Status Tinggal Bersama <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Home className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-500" />
            <select
              value={tinggalBersama}
              onChange={(e) => setTinggalBersama(e.target.value)}
              className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              <option value="Orang Tua">Tinggal Bersama Orang Tua</option>
              <option value="Wali / Kakek-Nenek">Tinggal Bersama Wali / Kakek-Nenek</option>
              <option value="Kerabat / Saudara">Tinggal Bersama Kerabat / Saudara</option>
              <option value="Mandiri / Sendiri">Mandiri / Sendiri</option>
              <option value="Panti / Lembaga Sosial">Panti / Lembaga Sosial</option>
            </select>
          </div>
        </div>

        {/* ALAMAT LENGKAP */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-600" />
            <span>Alamat Rumah (Jalan / Gg / Blok / Nomor) <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            required
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Contoh: Jl. Merpati No. 12, Gg. Kenanga 2"
            className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Kecamatan & Kelurahan */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              Kecamatan <span className="text-red-500">*</span>
            </label>
            <select
              value={kecamatan}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              {DAFTAR_KECAMATAN_TEGAL.map((k) => (
                <option key={k} value={k}>
                  Kec. {k}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              Kelurahan <span className="text-red-500">*</span>
            </label>
            <select
              value={kelurahan}
              onChange={(e) => setKelurahan(e.target.value)}
              className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              {kelurahanOptions.map((kel) => (
                <option key={kel} value={kel}>
                  Kel. {kel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RW dan RT */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              RW <span className="text-red-500">*</span>
            </label>
            <select
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              {DAFTAR_RW_TEGAL.map((r) => (
                <option key={r} value={r}>
                  RW {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 block">
              RT <span className="text-red-500">*</span>
            </label>
            <select
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              {DAFTAR_RT_TEGAL.map((t) => (
                <option key={t} value={t}>
                  RT {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SEKOLAH SEBELUMNYA & KELAS TERAKHIR */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 pt-3 border-t-2 border-slate-100">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 flex items-center gap-2">
              <School className="h-5 w-5 text-slate-600" />
              <span>Sekolah Sebelumnya</span>
            </label>
            <input
              type="text"
              value={sekolahSebelumnya}
              onChange={(e) => setSekolahSebelumnya(e.target.value)}
              placeholder="Contoh: SDN 3 Kejambon / Belum Pernah"
              className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-600" />
              <span>Kelas Terakhir Berhenti</span>
            </label>
            <select
              value={kelasTerakhir}
              onChange={(e) => setKelasTerakhir(e.target.value)}
              className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
            >
              {KELAS_TERAKHIR_OPTIONS.map((kls) => (
                <option key={kls} value={kls}>
                  {kls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATUS PENDIDIKAN & ALASAN ATS (COURSERA QUIZ STYLE) */}
      <div className="space-y-5 rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">
            2
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Minat &amp; Alasan Tidak Sekolah
            </h3>
            <p className="text-sm text-slate-600">
              Pilih opsi yang paling sesuai dengan kondisi anak saat ini
            </p>
          </div>
        </div>

        {/* 1. KEINGINAN UNTUK MELANJUTKAN SEKOLAH (Quiz Multi-Choice Style) */}
        <div className="space-y-2.5">
          <label className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-700" />
            <span>Apakah anak masih memiliki keinginan kembali sekolah? <span className="text-red-500">*</span></span>
          </label>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setKeinginanSekolah("Masih Ada")}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all cursor-pointer",
                keinginanSekolah === "Masih Ada"
                  ? "border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-600/30 shadow-xs"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    keinginanSekolah === "Masih Ada"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-400 bg-white"
                  )}
                >
                  {keinginanSekolah === "Masih Ada" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="text-base font-bold">Masih Ada Keinginan</div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    Anak bersedia dan berminat kembali bersekolah / ikut program pendidikan
                  </div>
                </div>
              </div>
              <CheckCircle2
                className={cn(
                  "h-5 w-5 shrink-0",
                  keinginanSekolah === "Masih Ada" ? "text-blue-600" : "text-transparent"
                )}
              />
            </button>

            <button
              type="button"
              onClick={() => setKeinginanSekolah("Tidak Ada")}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all cursor-pointer",
                keinginanSekolah === "Tidak Ada"
                  ? "border-amber-600 bg-amber-50/70 text-amber-950 ring-2 ring-amber-600/30 shadow-xs"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    keinginanSekolah === "Tidak Ada"
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-slate-400 bg-white"
                  )}
                >
                  {keinginanSekolah === "Tidak Ada" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="text-base font-bold">Tidak Ada Keinginan</div>
                  <div className="text-xs sm:text-sm text-slate-600">
                    Anak belum/tidak berminat kembali bersekolah formal saat ini
                  </div>
                </div>
              </div>
              <AlertCircle
                className={cn(
                  "h-5 w-5 shrink-0",
                  keinginanSekolah === "Tidak Ada" ? "text-amber-600" : "text-transparent"
                )}
              />
            </button>
          </div>
        </div>

        {/* 2. ALASAN TIDAK SEKOLAH */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 block">
            Alasan Utama Tidak Sekolah <span className="text-red-500">*</span>
          </label>
          <select
            value={alasanTidakSekolah}
            onChange={(e) => setAlasanTidakSekolah(e.target.value as AlasanTidakSekolah)}
            className="w-full min-h-[52px] h-13 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
          >
            {ALASAN_TIDAK_SEKOLAH_LIST.map((alasan) => (
              <option key={alasan} value={alasan}>
                {alasan}
              </option>
            ))}
          </select>
        </div>

        {/* 3. KETERANGAN */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <span>Keterangan / Catatan Lapangan</span>
          </label>
          <textarea
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Tuliskan catatan tambahan mengenai kondisi anak, rencana bimbingan kader, atau kebutuhan intervensi..."
            className="w-full rounded-xl border-2 border-slate-300 bg-white p-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden leading-relaxed"
          />
        </div>
      </div>

      {/* Submit Button (Full Width Mobile Bottom Anchored) */}
      <div className="pt-2 pb-6">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full min-h-[56px] h-14 items-center justify-center gap-3 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white px-6 text-base sm:text-lg font-extrabold transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Menyimpan Data ATS...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Simpan &amp; Daftarkan Data ATS</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
