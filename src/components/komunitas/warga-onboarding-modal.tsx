"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Home,
  FileText,
  ShieldCheck,
  Check,
  X,
  Info,
} from "lucide-react";
import { joinKomunitasWargaWithSurvey } from "@/app/actions/komunitas";
import {
  DAFTAR_KECAMATAN_TEGAL,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  getKelurahanByKecamatan,
} from "@/lib/constants/tegal-data";
import type { KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface WargaOnboardingModalProps {
  komunitas: KomunitasWithMembership;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (membership: any, peranDiajukan?: string | null) => void;
  currentUserId?: string | null;
}

export function WargaOnboardingModal({
  komunitas,
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
}: WargaOnboardingModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 1. Alamat Sesuai KK State
  const [kkType, setKkType] = useState<"kota_tegal" | "luar_kota_tegal">("kota_tegal");
  const [kkKecamatan, setKkKecamatan] = useState(
    komunitas.kecamatan || DAFTAR_KECAMATAN_TEGAL[0]
  );
  const [kkKelurahan, setKkKelurahan] = useState(komunitas.kelurahan || "Kejambon");
  const [kkRw, setKkRw] = useState(komunitas.rw || "01");
  const [kkRt, setKkRt] = useState(komunitas.rt || "01");
  const [kkJalan, setKkJalan] = useState("");
  const [kkLuarKotaNama, setKkLuarKotaNama] = useState("");

  // 2. Alamat Sesuai Domisili State
  const [isDomisiliSameAsKk, setIsDomisiliSameAsKk] = useState(true);
  const [domisiliType, setDomisiliType] = useState<"kota_tegal" | "luar_kota_tegal">("kota_tegal");
  const [domisiliKecamatan, setDomisiliKecamatan] = useState(
    komunitas.kecamatan || DAFTAR_KECAMATAN_TEGAL[0]
  );
  const [domisiliKelurahan, setDomisiliKelurahan] = useState(komunitas.kelurahan || "Kejambon");
  const [domisiliRw, setDomisiliRw] = useState(komunitas.rw || "01");
  const [domisiliRt, setDomisiliRt] = useState(komunitas.rt || "01");
  const [domisiliJalan, setDomisiliJalan] = useState("");
  const [domisiliLuarKotaNama, setDomisiliLuarKotaNama] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Nilai efektif domisili (sinkron otomatis jika sama dengan KK)
  const effectiveDomisiliType = isDomisiliSameAsKk ? kkType : domisiliType;
  const effectiveDomisiliKecamatan = isDomisiliSameAsKk ? kkKecamatan : domisiliKecamatan;
  const effectiveDomisiliKelurahan = isDomisiliSameAsKk ? kkKelurahan : domisiliKelurahan;
  const effectiveDomisiliRw = isDomisiliSameAsKk ? kkRw : domisiliRw;
  const effectiveDomisiliRt = isDomisiliSameAsKk ? kkRt : domisiliRt;
  const effectiveDomisiliJalan = isDomisiliSameAsKk ? kkJalan : domisiliJalan;
  const effectiveDomisiliLuarKotaNama = isDomisiliSameAsKk ? kkLuarKotaNama : domisiliLuarKotaNama;

  const handleSetDomisiliDifferent = () => {
    setIsDomisiliSameAsKk(false);
    // Inisialisasi data domisili awal dengan nilai KK agar mempermudah jika hanya beda RT/RW
    setDomisiliType(kkType);
    setDomisiliKecamatan(kkKecamatan);
    setDomisiliKelurahan(kkKelurahan);
    setDomisiliRw(kkRw);
    setDomisiliRt(kkRt);
    setDomisiliJalan(kkJalan);
    setDomisiliLuarKotaNama(kkLuarKotaNama);
  };

  // Available Kelurahan dropdown options
  const kkKelurahanOptions = useMemo(() => {
    return getKelurahanByKecamatan(kkKecamatan);
  }, [kkKecamatan]);

  const domisiliKelurahanOptions = useMemo(() => {
    return getKelurahanByKecamatan(effectiveDomisiliKecamatan);
  }, [effectiveDomisiliKecamatan]);

  if (!isOpen) return null;

  // 3. Kalkulasi Identifikasi Peran Sesuai Ketentuan User:
  // - KK Luar Kota Tegal & Domisili Luar Kota Tegal -> Pengunjung
  // - KK Kota Tegal & Domisili Kota Tegal -> Penduduk
  // - KK Kota Tegal & Domisili Luar Kota Tegal -> Penduduk Berdomisili Luar Kota
  // - KK Luar Kota Tegal & Domisili Kota Tegal -> Pendatang
  let identifiedRole = "Pengunjung";
  let roleBadgeColor = "bg-slate-100 text-slate-800 border-slate-300";
  let roleCardColor = "bg-slate-50 border-slate-200";
  let roleExplanation =
    "Pengguna tetap sebagai Pengunjung. Anda hanya dapat melihat visualisasi Grafik dan Chart Data Komunitas ini.";

  if (kkType === "kota_tegal" && effectiveDomisiliType === "kota_tegal") {
    identifiedRole = "Penduduk";
    roleBadgeColor = "bg-emerald-100 text-emerald-900 border-emerald-300";
    roleCardColor = "bg-emerald-50/70 border-emerald-200";
    roleExplanation =
      "Pengguna teridentifikasi sebagai Penduduk. Anda dapat mengakses seluruh Profil Data dan berhak mengajukan diri sebagai Admin jika posisi Admin masih kosong.";
  } else if (kkType === "kota_tegal" && effectiveDomisiliType === "luar_kota_tegal") {
    identifiedRole = "Penduduk Berdomisili Luar Kota";
    roleBadgeColor = "bg-blue-100 text-blue-900 border-blue-300";
    roleCardColor = "bg-blue-50/70 border-blue-200";
    roleExplanation =
      "Pengguna teridentifikasi sebagai Penduduk Berdomisili Luar Kota. Anda dapat mengakses seluruh Profil Data.";
  } else if (kkType === "luar_kota_tegal" && effectiveDomisiliType === "kota_tegal") {
    identifiedRole = "Pendatang";
    roleBadgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    roleCardColor = "bg-amber-50/70 border-amber-200";
    roleExplanation =
      "Pengguna teridentifikasi sebagai Pendatang. Anda hanya dapat melihat visualisasi Grafik dan Chart.";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      router.push(`/login?redirectTo=/komunitas/${komunitas.id}`);
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await joinKomunitasWargaWithSurvey({
        komunitasId: komunitas.id,
        nama: komunitas.nama,
        kecamatan: komunitas.kecamatan,
        kelurahan: komunitas.kelurahan,
        rw: komunitas.rw,
        rt: komunitas.rt,
        lokasi: komunitas.lokasi,
        deskripsi: komunitas.deskripsi,
        berdomisili: effectiveDomisiliType === "kota_tegal",
        kkTerdaftar: kkType === "kota_tegal",
        peran: identifiedRole,
      });

      if (res.success) {
        if (onSuccess) {
          onSuccess(res.membership, res.peranDiajukan);
        }
        onClose();
        router.refresh();
      } else {
        setErrorMessage(res.message || "Gagal bergabung ke komunitas.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 pb-4 border-b-2 border-slate-100 text-center space-y-2 shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
              <Sparkles className="h-4 w-4 text-blue-700" />
              <span>FORMULIR BERGABUNG</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Bergabung ke Komunitas Warga
          </h2>

          {/* Info Komunitas yang Dipilih */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-left flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">{komunitas.nama}</h3>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {[komunitas.kelurahan, komunitas.kecamatan, "Kota Tegal"].filter(Boolean).join(", ")}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Isian Alamat KK & Domisili */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 pb-8 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          {errorMessage && (
            <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SEKSI ALAMAT SESUAI KK */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="h-4 w-4 text-blue-700" />
              <label className="text-sm font-bold text-slate-900">
                Alamat Sesuai KK (Kartu Keluarga) <span className="text-rose-500">*</span>
              </label>
            </div>

            {/* Pilihan Kab/Kota KK */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Kabupaten / Kota Sesuai KK:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKkType("kota_tegal")}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                    kkType === "kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      kkType === "kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {kkType === "kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setKkType("luar_kota_tegal")}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                    kkType === "luar_kota_tegal"
                      ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>Luar Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      kkType === "luar_kota_tegal"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {kkType === "luar_kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Isian Wilayah KK jika Kota Tegal */}
            {kkType === "kota_tegal" ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Kecamatan
                    </label>
                    <select
                      value={kkKecamatan}
                      onChange={(e) => {
                        const newKec = e.target.value;
                        setKkKecamatan(newKec);
                        const kels = getKelurahanByKecamatan(newKec);
                        if (kels.length > 0) setKkKelurahan(kels[0]);
                      }}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                    >
                      {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                        <option key={kec} value={kec}>
                          {kec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Kelurahan
                    </label>
                    <select
                      value={kkKelurahan}
                      onChange={(e) => setKkKelurahan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                    >
                      {kkKelurahanOptions.map((kel) => (
                        <option key={kel} value={kel}>
                          {kel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      RW
                    </label>
                    <select
                      value={kkRw}
                      onChange={(e) => setKkRw(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                    >
                      {DAFTAR_RW_TEGAL.map((rwNum) => (
                        <option key={rwNum} value={rwNum}>
                          RW {rwNum}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      RT
                    </label>
                    <select
                      value={kkRt}
                      onChange={(e) => setKkRt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                    >
                      {DAFTAR_RT_TEGAL.map((rtNum) => (
                        <option key={rtNum} value={rtNum}>
                          RT {rtNum}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Jalan / Alamat KK
                  </label>
                  <input
                    type="text"
                    value={kkJalan}
                    onChange={(e) => setKkJalan(e.target.value)}
                    placeholder="Contoh: Jl. Werkudoro No. 12"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Nama Kabupaten / Kota Asal Sesuai KK:
                </label>
                <input
                  type="text"
                  value={kkLuarKotaNama}
                  onChange={(e) => setKkLuarKotaNama(e.target.value)}
                  placeholder="Contoh: Kabupaten Brebes, Kabupaten Tegal, Jakarta..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 2. SEKSI ALAMAT SESUAI DOMISILI */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Home className="h-4 w-4 text-blue-700" />
              <label className="text-sm font-bold text-slate-900">
                Alamat Sesuai Domisili (Tempat Tinggal Saat Ini) <span className="text-rose-500">*</span>
              </label>
            </div>

            {/* Pilihan: Apakah Alamat Domisili Sama dengan Alamat KK? */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">
                Apakah alamat domisili saat ini sama dengan alamat KK?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsDomisiliSameAsKk(true)}
                  className={cn(
                    "flex min-h-[46px] items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                    isDomisiliSameAsKk
                      ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isDomisiliSameAsKk ? "text-emerald-600" : "text-slate-400"
                      )}
                    />
                    <span>Ya, Sama dengan KK</span>
                  </div>
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                      isDomisiliSameAsKk
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isDomisiliSameAsKk && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSetDomisiliDifferent}
                  className={cn(
                    "flex min-h-[46px] items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                    !isDomisiliSameAsKk
                      ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2 text-left">
                    <MapPin
                      className={cn(
                        "h-4 w-4 shrink-0",
                        !isDomisiliSameAsKk ? "text-blue-600" : "text-slate-400"
                      )}
                    />
                    <span>Tidak (Berbeda Alamat)</span>
                  </div>
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                      !isDomisiliSameAsKk
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {!isDomisiliSameAsKk && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Jika Sama: Tampilkan Info Ringkas Sinkronisasi */}
            {isDomisiliSameAsKk ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Alamat Domisili Otomatis Sama dengan KK:</span>
                </div>
                <p className="text-[11px] text-emerald-700 pl-5 font-medium leading-relaxed">
                  {kkType === "kota_tegal"
                    ? `${kkJalan ? kkJalan + ", " : ""}RT ${kkRt} / RW ${kkRw}, Kelurahan ${kkKelurahan}, Kecamatan ${kkKecamatan}, Kota Tegal`
                    : `Luar Kota Tegal (${kkLuarKotaNama || "Luar Kota"})`}
                </p>
              </div>
            ) : (
              /* Jika Berbeda: Tampilkan Formulir Pengisian Lengkap */
              <div className="space-y-3.5 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                <div className="flex items-start gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Silakan isi alamat domisili tempat tinggal Anda saat ini jika berbeda (meskipun hanya berbeda jenjang RT/RW).
                  </span>
                </div>

                {/* Pilihan Kab/Kota Domisili */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600">
                    Kabupaten / Kota Tempat Tinggal:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDomisiliType("kota_tegal")}
                      className={cn(
                        "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                        domisiliType === "kota_tegal"
                          ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span>Kota Tegal</span>
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border-2",
                          domisiliType === "kota_tegal"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {domisiliType === "kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDomisiliType("luar_kota_tegal")}
                      className={cn(
                        "flex min-h-[44px] items-center justify-between rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                        domisiliType === "luar_kota_tegal"
                          ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span>Luar Kota Tegal</span>
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border-2",
                          domisiliType === "luar_kota_tegal"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {domisiliType === "luar_kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Isian Wilayah Domisili jika Kota Tegal */}
                {domisiliType === "kota_tegal" ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Kecamatan Domisili
                        </label>
                        <select
                          value={domisiliKecamatan}
                          onChange={(e) => {
                            const newKec = e.target.value;
                            setDomisiliKecamatan(newKec);
                            const kels = getKelurahanByKecamatan(newKec);
                            if (kels.length > 0) setDomisiliKelurahan(kels[0]);
                          }}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                        >
                          {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                            <option key={kec} value={kec}>
                              {kec}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Kelurahan Domisili
                        </label>
                        <select
                          value={domisiliKelurahan}
                          onChange={(e) => setDomisiliKelurahan(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                        >
                          {domisiliKelurahanOptions.map((kel) => (
                            <option key={kel} value={kel}>
                              {kel}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          RW Domisili
                        </label>
                        <select
                          value={domisiliRw}
                          onChange={(e) => setDomisiliRw(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                        >
                          {DAFTAR_RW_TEGAL.map((rwNum) => (
                            <option key={rwNum} value={rwNum}>
                              RW {rwNum}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          RT Domisili
                        </label>
                        <select
                          value={domisiliRt}
                          onChange={(e) => setDomisiliRt(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                        >
                          {DAFTAR_RT_TEGAL.map((rtNum) => (
                            <option key={rtNum} value={rtNum}>
                              RT {rtNum}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Jalan / Alamat Domisili
                      </label>
                      <input
                        type="text"
                        value={domisiliJalan}
                        onChange={(e) => setDomisiliJalan(e.target.value)}
                        placeholder="Contoh: Jl. Werkudoro No. 12"
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Nama Kabupaten / Kota Domisili:
                    </label>
                    <input
                      type="text"
                      value={domisiliLuarKotaNama}
                      onChange={(e) => setDomisiliLuarKotaNama(e.target.value)}
                      placeholder="Contoh: Kabupaten Brebes, Semarang, Bandung..."
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. HASIL IDENTIFIKASI PERAN & HAK AKSES */}
          <div className={cn("rounded-2xl border-2 p-4 sm:p-5 space-y-2.5 transition-all shadow-xs", roleCardColor)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status Teridentifikasi:
                </span>
              </div>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold border-2", roleBadgeColor)}>
                <Check className="h-3 w-3 stroke-[3px]" />
                {identifiedRole.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {roleExplanation}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-[48px] px-5 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-sm font-bold text-white shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan &amp; Bergabung</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
