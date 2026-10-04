"use client";

import { useState, useTransition } from "react";
import {
  User,
  Calendar,
  Phone,
  Home,
  MapPin,
  GraduationCap,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Pencil,
  Check,
  FileText,
} from "lucide-react";
import { updateDataAnak } from "@/app/actions/data-anak";
import {
  ALASAN_SEKOLAH_PAUD,
  USIA_ANAK_OPTIONS,
} from "./form-data-anak";
import {
  DAFTAR_KECAMATAN_TEGAL,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  getKelurahanByKecamatan,
} from "@/lib/constants/tegal-data";
import type { DataAnakItem, JenisKomunitas } from "@/types/database";
import { cn } from "@/lib/utils";

interface ModalEditDataAnakProps {
  isOpen: boolean;
  anak: DataAnakItem;
  komunitasId: string;
  komunitasNama?: string;
  jenisKomunitas?: JenisKomunitas | string;
  onClose: () => void;
  onSuccess: (updatedChild: DataAnakItem) => void;
}

function getUsiaAnakNumber(birthDateString?: string | null): string {
  if (!birthDateString) return "3";
  const str = birthDateString.trim();
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    return num >= 0 && num <= 6 ? String(num) : "3";
  }
  try {
    let birthDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split("-").map(Number);
      birthDate = new Date(y, m - 1, d);
    } else {
      birthDate = new Date(str);
    }
    if (isNaN(birthDate.getTime())) return "3";
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const months = now.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
    }
    const clamped = Math.max(0, Math.min(6, years));
    return String(clamped);
  } catch {
    return "3";
  }
}

export function ModalEditDataAnak({
  isOpen,
  anak,
  komunitasId,
  komunitasNama = "Satuan PAUD",
  jenisKomunitas = "satuan_paud",
  onClose,
  onSuccess,
}: ModalEditDataAnakProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form Fields - Identitas
  const [namaLengkap, setNamaLengkap] = useState(anak.nama_lengkap || "");
  const [usia, setUsia] = useState(getUsiaAnakNumber(anak.tanggal_lahir));
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">(
    anak.jenis_kelamin === "P" || anak.jenis_kelamin === "Perempuan" ? "P" : "L"
  );
  const [namaOrangtua, setNamaOrangtua] = useState(anak.nama_orangtua || "");
  const [nomorHp, setNomorHp] = useState(anak.nomor_hp || "");
  const [tinggalBersama, setTinggalBersama] = useState(
    anak.tinggal_bersama || "Orang Tua"
  );
  const [jarakRumahKm, setJarakRumahKm] = useState(
    anak.jarak_rumah_km ? String(anak.jarak_rumah_km) : "0.5"
  );
  const [alasanSekolah, setAlasanSekolah] = useState(
    anak.alasan_sekolah || ALASAN_SEKOLAH_PAUD[0]
  );

  // Alamat Sesuai KK
  const initialKkIsLuar =
    anak.kk_kabupaten &&
    anak.kk_kabupaten.toLowerCase() !== "kota tegal" &&
    anak.kk_kabupaten.trim() !== "";
  const [kkKabupatenChoice, setKkKabupatenChoice] = useState<
    "kota_tegal" | "luar_kota_tegal"
  >(initialKkIsLuar ? "luar_kota_tegal" : "kota_tegal");
  const [kkKabupatenCustom, setKkKabupatenCustom] = useState(
    initialKkIsLuar ? anak.kk_kabupaten || "" : ""
  );
  const [kkKecamatan, setKkKecamatan] = useState<string>(
    anak.kk_kecamatan || DAFTAR_KECAMATAN_TEGAL[0] || "Tegal Timur"
  );
  const [kkKelurahan, setKkKelurahan] = useState<string>(
    anak.kk_kelurahan ||
      getKelurahanByKecamatan(anak.kk_kecamatan || DAFTAR_KECAMATAN_TEGAL[0])[0] ||
      "Kejambon"
  );
  const [kkRw, setKkRw] = useState(anak.kk_rw || "01");
  const [kkRt, setKkRt] = useState(anak.kk_rt || "01");
  const [kkJalan, setKkJalan] = useState(anak.kk_jalan || "");

  // Alamat Domisili
  const initialDomIsLuar =
    anak.domisili_kabupaten &&
    anak.domisili_kabupaten.toLowerCase() !== "kota tegal" &&
    anak.domisili_kabupaten.trim() !== "";
  const [isDomisiliSameAsKk, setIsDomisiliSameAsKk] = useState(
    !anak.domisili_jalan && !anak.domisili_kelurahan
      ? true
      : anak.domisili_jalan === anak.kk_jalan &&
        anak.domisili_kelurahan === anak.kk_kelurahan &&
        anak.domisili_rt === anak.kk_rt &&
        anak.domisili_rw === anak.kk_rw
  );
  const [domisiliKabupatenChoice, setDomisiliKabupatenChoice] = useState<
    "kota_tegal" | "luar_kota_tegal"
  >(initialDomIsLuar ? "luar_kota_tegal" : "kota_tegal");
  const [domisiliKabupatenCustom, setDomisiliKabupatenCustom] = useState(
    initialDomIsLuar ? anak.domisili_kabupaten || "" : ""
  );
  const [domisiliKecamatan, setDomisiliKecamatan] = useState<string>(
    anak.domisili_kecamatan || DAFTAR_KECAMATAN_TEGAL[0] || "Tegal Timur"
  );
  const [domisiliKelurahan, setDomisiliKelurahan] = useState<string>(
    anak.domisili_kelurahan ||
      getKelurahanByKecamatan(
        anak.domisili_kecamatan || DAFTAR_KECAMATAN_TEGAL[0]
      )[0] ||
      "Kejambon"
  );
  const [domisiliRw, setDomisiliRw] = useState(anak.domisili_rw || "01");
  const [domisiliRt, setDomisiliRt] = useState(anak.domisili_rt || "01");
  const [domisiliJalan, setDomisiliJalan] = useState(anak.domisili_jalan || "");

  if (!isOpen) return null;

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
    formData.append("jenisKomunitas", String(jenisKomunitas));
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

    formData.append("isSekolah", "true");
    formData.append("namaSekolah", komunitasNama);
    formData.append("alasanSekolah", alasanSekolah || ALASAN_SEKOLAH_PAUD[0]);

    startTransition(async () => {
      const res = await updateDataAnak(anak.id, formData);
      if (res.success && res.data) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setTimeout(() => {
          onSuccess(res.data!);
          onClose();
        }, 800);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal memperbarui data anak.",
        });
      }
    });
  };

  const kkKelurahanOptions = getKelurahanByKecamatan(kkKecamatan);
  const domisiliKelurahanOptions = getKelurahanByKecamatan(domisiliKecamatan);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Edit Data Anak (0–6 Tahun)
              </h3>
              <p className="text-sm font-medium text-slate-500 line-clamp-1">
                {komunitasNama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 pb-10 overflow-y-auto flex-1 space-y-5 overscroll-contain bg-slate-50/50"
        >
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

          {/* 1. IDENTITAS ANAK */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Identitas Anak
            </h4>

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">
                Nama Lengkap Sesuai Akta <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama Lengkap Anak"
                  className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">
                Jenis Kelamin <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setJenisKelamin("L")}
                  className={cn(
                    "flex min-h-[46px] items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-sm font-bold transition-all cursor-pointer",
                    jenisKelamin === "L"
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Laki-laki (L)</span>
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2",
                      jenisKelamin === "L"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {jenisKelamin === "L" && <Check className="h-3 w-3 stroke-[3px]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setJenisKelamin("P")}
                  className={cn(
                    "flex min-h-[46px] items-center justify-between rounded-xl border-2 px-3.5 py-2.5 text-sm font-bold transition-all cursor-pointer",
                    jenisKelamin === "P"
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Perempuan (P)</span>
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2",
                      jenisKelamin === "P"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {jenisKelamin === "P" && <Check className="h-3 w-3 stroke-[3px]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Usia & Jarak Rumah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900">
                  Usia Anak <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    required
                    value={usia}
                    onChange={(e) => setUsia(e.target.value)}
                    className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white pl-11 pr-8 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    {USIA_ANAK_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {`${opt} Tahun`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900">
                  Jarak ke PAUD (km) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={jarakRumahKm}
                    onChange={(e) => setJarakRumahKm(e.target.value)}
                    placeholder="0.5"
                    className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white pl-11 pr-4 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Nama Orang Tua */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">
                Nama Orang Tua / Wali <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={namaOrangtua}
                  onChange={(e) => setNamaOrangtua(e.target.value)}
                  placeholder="Nama Orang Tua / Wali"
                  className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Nomor HP & Tinggal Bersama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900">
                  Nomor HP / WhatsApp <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white pl-11 pr-4 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900">
                  Tinggal Bersama <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Home className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={tinggalBersama}
                    onChange={(e) => setTinggalBersama(e.target.value)}
                    className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white pl-11 pr-8 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden appearance-none cursor-pointer"
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

          {/* SUBSECTION A: ALAMAT SESUAI KK */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-blue-200 pb-2.5">
              <FileText className="h-5 w-5 text-blue-700" />
              <h4 className="text-base font-bold text-blue-950">
                Alamat Sesuai KK (Kartu Keluarga) <span className="text-rose-600">*</span>
              </h4>
            </div>

            {/* Kabupaten/Kota KK */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 block">
                Kabupaten / Kota Sesuai KK
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setKkKabupatenChoice("kota_tegal")}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer",
                    kkKabupatenChoice === "kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs ring-2 ring-blue-600/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      kkKabupatenChoice === "kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
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
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer",
                    kkKabupatenChoice === "luar_kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs ring-2 ring-blue-600/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Luar Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      kkKabupatenChoice === "luar_kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
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

                {/* RW & RT KK */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      RW KK (01–17) <span className="text-rose-600">*</span>
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
                      RT KK (01–17) <span className="text-rose-600">*</span>
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
                    placeholder="Contoh: Jl. Werkudoro No. 12"
                    className="w-full min-h-[44px] h-11 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SUBSECTION B: ALAMAT DOMISILI */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-700" />
                <h4 className="text-base font-bold text-emerald-950">
                  Alamat Domisili <span className="text-rose-600">*</span>
                </h4>
              </div>

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
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDomisiliKabupatenChoice("kota_tegal")}
                      className={cn(
                        "flex min-h-[44px] items-center justify-between rounded-xl border-2 py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer",
                        domisiliKabupatenChoice === "kota_tegal"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs ring-2 ring-emerald-600/20"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span>Kota Tegal</span>
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border-2",
                          domisiliKabupatenChoice === "kota_tegal"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white"
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
                        "flex min-h-[44px] items-center justify-between rounded-xl border-2 py-2 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer",
                        domisiliKabupatenChoice === "luar_kota_tegal"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs ring-2 ring-emerald-600/20"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span>Luar Kota Tegal</span>
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border-2",
                          domisiliKabupatenChoice === "luar_kota_tegal"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white"
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

                    {/* RW & RT Domisili */}
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
                        placeholder="Contoh: Jl. Melati No. 5"
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

          {/* 2. STATUS PENDIDIKAN PAUD */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Status Pendidikan PAUD
            </h4>

            {/* Status Bersekolah Terkunci */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">
                Apakah Anak Sudah Bersekolah? <span className="text-rose-600">*</span>
              </label>
              <div className="flex min-h-[46px] items-center justify-between rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 px-3.5 py-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="text-sm font-bold">Sudah Bersekolah</span>
                </div>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-300">
                  Terkunci
                </span>
              </div>
            </div>

            {/* Nama Satuan PAUD */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">
                Nama Satuan PAUD / TK <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={komunitasNama}
                className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-slate-100/80 px-3.5 text-sm font-bold text-slate-800 cursor-not-allowed select-none focus:outline-hidden"
              />
            </div>

            {/* Alasan Sekolah */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">
                Alasan Mengikuti PAUD <span className="text-rose-600">*</span>
              </label>
              <select
                value={alasanSekolah}
                onChange={(e) => setAlasanSekolah(e.target.value)}
                className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
              >
                {ALASAN_SEKOLAH_PAUD.map((alasan) => (
                  <option key={alasan} value={alasan}>
                    {alasan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-[46px] h-11 px-5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-100 text-sm font-bold text-slate-700 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex min-h-[46px] h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white px-6 text-sm font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
