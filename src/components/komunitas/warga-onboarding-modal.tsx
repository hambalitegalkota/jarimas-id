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
  getRwListByKelurahan,
  getRtListByKelurahan,
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

  const kkRwOptions = useMemo(() => {
    return getRwListByKelurahan(kkKelurahan);
  }, [kkKelurahan]);

  const kkRtOptions = useMemo(() => {
    return getRtListByKelurahan(kkKelurahan, kkRw);
  }, [kkKelurahan, kkRw]);

  const domisiliRwOptions = useMemo(() => {
    return getRwListByKelurahan(effectiveDomisiliKelurahan);
  }, [effectiveDomisiliKelurahan]);

  const domisiliRtOptions = useMemo(() => {
    return getRtListByKelurahan(effectiveDomisiliKelurahan, effectiveDomisiliRw);
  }, [effectiveDomisiliKelurahan, effectiveDomisiliRw]);

  if (!isOpen) return null;

  // 3. Kalkulasi Identifikasi Peran Sesuai Ketentuan User:
  // - KK Luar Kota Tegal & Domisili Luar Kota Tegal -> Pengunjung
  // - KK Kota Tegal & Domisili Kota Tegal -> Penduduk
  // - KK Kota Tegal & Domisili Luar Kota Tegal -> Penduduk Berdomisili Luar Kota
  // - KK Luar Kota Tegal & Domisili Kota Tegal -> Pendatang
  let identifiedRole = "Pengunjung";
  let roleBadgeColor = "bg-muted text-muted-foreground border-border";
  let roleCardColor = "bg-muted/40 border-border";
  let roleExplanation =
    "Pengguna tetap sebagai Pengunjung. Anda hanya dapat melihat visualisasi Grafik dan Chart Data Komunitas ini.";

  if (kkType === "kota_tegal" && effectiveDomisiliType === "kota_tegal") {
    identifiedRole = "Penduduk";
    roleBadgeColor = "bg-primary/10 text-primary border-primary/20";
    roleCardColor = "bg-primary/5 border-primary/20";
    roleExplanation = komunitas.hasAdmin
      ? "Pengguna teridentifikasi sebagai Penduduk. Anda dapat mengakses seluruh Profil Data Komunitas ini."
      : "Pengguna teridentifikasi sebagai Penduduk. Anda dapat mengakses seluruh Profil Data dan berhak mengajukan diri sebagai Admin jika posisi Admin masih kosong.";
  } else if (kkType === "kota_tegal" && effectiveDomisiliType === "luar_kota_tegal") {
    identifiedRole = "Penduduk Berdomisili Luar Kota";
    roleBadgeColor = "bg-sky-100 text-sky-800 border-sky-300";
    roleCardColor = "bg-sky-50/70 border-sky-200";
    roleExplanation =
      "Pengguna teridentifikasi sebagai Penduduk Berdomisili Luar Kota. Anda dapat mengakses seluruh Profil Data.";
  } else if (kkType === "luar_kota_tegal" && effectiveDomisiliType === "kota_tegal") {
    identifiedRole = "Pendatang";
    roleBadgeColor = "bg-secondary/15 text-secondary border-secondary/30";
    roleCardColor = "bg-secondary/5 border-secondary/20";
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
      // Tentukan wilayah sasaran berdasarkan pilihan domisili (atau KK jika domisili di luar Kota Tegal)
      const targetKecamatan =
        effectiveDomisiliType === "kota_tegal"
          ? effectiveDomisiliKecamatan
          : kkType === "kota_tegal"
          ? kkKecamatan
          : komunitas.kecamatan;

      const targetKelurahan =
        effectiveDomisiliType === "kota_tegal"
          ? effectiveDomisiliKelurahan
          : kkType === "kota_tegal"
          ? kkKelurahan
          : komunitas.kelurahan;

      const targetRw =
        effectiveDomisiliType === "kota_tegal"
          ? effectiveDomisiliRw
          : kkType === "kota_tegal"
          ? kkRw
          : komunitas.rw;

      const targetRt =
        effectiveDomisiliType === "kota_tegal"
          ? effectiveDomisiliRt
          : kkType === "kota_tegal"
          ? kkRt
          : komunitas.rt;

      const res = await joinKomunitasWargaWithSurvey({
        komunitasId: komunitas.id,
        nama: komunitas.nama,
        kecamatan: targetKecamatan,
        kelurahan: targetKelurahan,
        rw: targetRw,
        rt: targetRt,
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-lg sm:rounded-lg border border-border bg-card shadow-xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 pb-3.5 border-b border-border text-center space-y-2 shrink-0 bg-card">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-2xs font-extrabold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FORMULIR BERGABUNG</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Bergabung ke Komunitas Warga
          </h2>

          {/* Info Komunitas yang Dipilih */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-left flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{komunitas.nama}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">
                  {[komunitas.kelurahan, komunitas.kecamatan, "Kota Tegal"].filter(Boolean).join(", ")}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Isian Alamat KK & Domisili */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 pb-6 overflow-y-auto flex-1 space-y-4 bg-muted/20 text-sm">
          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SEKSI ALAMAT SESUAI KK */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <FileText className="h-4 w-4 text-primary" />
              <label className="text-xs sm:text-sm font-bold text-foreground">
                Alamat Sesuai KK (Kartu Keluarga) <span className="text-destructive">*</span>
              </label>
            </div>

            {/* Pilihan Kab/Kota KK */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Kabupaten / Kota Sesuai KK:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKkType("kota_tegal")}
                  className={cn(
                    "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                    kkType === "kota_tegal"
                      ? "border-primary bg-primary/5 text-primary shadow-2xs"
                      : "border-border bg-background text-foreground hover:bg-muted/40"
                  )}
                >
                  <span>Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      kkType === "kota_tegal"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    )}
                  >
                    {kkType === "kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setKkType("luar_kota_tegal")}
                  className={cn(
                    "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                    kkType === "luar_kota_tegal"
                      ? "border-primary bg-primary/5 text-primary shadow-2xs"
                      : "border-border bg-background text-foreground hover:bg-muted/40"
                  )}
                >
                  <span>Luar Kota Tegal</span>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      kkType === "luar_kota_tegal"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
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
                    <label className="text-2xs font-bold text-muted-foreground block mb-1">
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
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                    >
                      {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                        <option key={kec} value={kec}>
                          {kec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-2xs font-bold text-muted-foreground block mb-1">
                      Kelurahan
                    </label>
                    <select
                      value={kkKelurahan}
                      onChange={(e) => setKkKelurahan(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
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
                    <label className="text-2xs font-bold text-muted-foreground block mb-1">
                      RW
                    </label>
                    <select
                      value={kkRw}
                      onChange={(e) => setKkRw(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                    >
                      {kkRwOptions.map((rwNum) => (
                        <option key={rwNum} value={rwNum}>
                          {rwNum.includes("Belum") ? rwNum : `RW ${rwNum}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-2xs font-bold text-muted-foreground block mb-1">
                      RT
                    </label>
                    <select
                      value={kkRt}
                      onChange={(e) => setKkRt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                    >
                      {kkRtOptions.map((rtNum) => (
                        <option key={rtNum} value={rtNum}>
                          {rtNum.includes("Belum") ? rtNum : `RT ${rtNum}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-2xs font-bold text-muted-foreground block mb-1">
                    Jalan / Alamat KK
                  </label>
                  <input
                    type="text"
                    value={kkJalan}
                    onChange={(e) => setKkJalan(e.target.value)}
                    placeholder="Contoh: Jl. Werkudoro No. 12"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 pt-1">
                <label className="text-2xs font-bold text-muted-foreground block">
                  Nama Kabupaten / Kota Asal Sesuai KK:
                </label>
                <input
                  type="text"
                  value={kkLuarKotaNama}
                  onChange={(e) => setKkLuarKotaNama(e.target.value)}
                  placeholder="Contoh: Kabupaten Brebes, Kabupaten Tegal, Jakarta..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 2. SEKSI ALAMAT SESUAI DOMISILI */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Home className="h-4 w-4 text-primary" />
              <label className="text-xs sm:text-sm font-bold text-foreground">
                Alamat Sesuai Domisili (Tempat Tinggal Saat Ini) <span className="text-destructive">*</span>
              </label>
            </div>

            {/* Pilihan: Apakah Alamat Domisili Sama dengan Alamat KK? */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground block">
                Apakah alamat domisili saat ini sama dengan alamat KK?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsDomisiliSameAsKk(true)}
                  className={cn(
                    "flex min-h-[42px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                    isDomisiliSameAsKk
                      ? "border-primary bg-primary/5 text-primary shadow-2xs"
                      : "border-border bg-background text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-2 text-left truncate">
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isDomisiliSameAsKk ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="truncate">Ya, Sama dengan KK</span>
                  </div>
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      isDomisiliSameAsKk
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    )}
                  >
                    {isDomisiliSameAsKk && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSetDomisiliDifferent}
                  className={cn(
                    "flex min-h-[42px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                    !isDomisiliSameAsKk
                      ? "border-primary bg-primary/5 text-primary shadow-2xs"
                      : "border-border bg-background text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-2 text-left truncate">
                    <MapPin
                      className={cn(
                        "h-4 w-4 shrink-0",
                        !isDomisiliSameAsKk ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="truncate">Tidak (Berbeda)</span>
                  </div>
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      !isDomisiliSameAsKk
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    )}
                  >
                    {!isDomisiliSameAsKk && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Jika Sama: Tampilkan Info Ringkas Sinkronisasi */}
            {isDomisiliSameAsKk ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Alamat Domisili Otomatis Sama dengan KK:</span>
                </div>
                <p className="text-2xs text-muted-foreground pl-5 font-medium leading-relaxed">
                  {kkType === "kota_tegal"
                    ? `${kkJalan ? kkJalan + ", " : ""}RT ${kkRt} / RW ${kkRw}, Kelurahan ${kkKelurahan}, Kecamatan ${kkKecamatan}, Kota Tegal`
                    : `Luar Kota Tegal (${kkLuarKotaNama || "Luar Kota"})`}
                </p>
              </div>
            ) : (
              /* Jika Berbeda: Tampilkan Formulir Pengisian Lengkap */
              <div className="space-y-3.5 pt-2 border-t border-border animate-in fade-in duration-200">
                <div className="flex items-start gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Silakan isi alamat domisili tempat tinggal Anda saat ini jika berbeda (meskipun hanya berbeda jenjang RT/RW).
                  </span>
                </div>

                {/* Pilihan Kab/Kota Domisili */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Kabupaten / Kota Tempat Tinggal:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDomisiliType("kota_tegal")}
                      className={cn(
                        "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                        domisiliType === "kota_tegal"
                          ? "border-primary bg-primary/5 text-primary shadow-2xs"
                          : "border-border bg-background text-foreground hover:bg-muted/40"
                      )}
                    >
                      <span>Kota Tegal</span>
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border",
                          domisiliType === "kota_tegal"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        )}
                      >
                        {domisiliType === "kota_tegal" && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDomisiliType("luar_kota_tegal")}
                      className={cn(
                        "flex min-h-[40px] h-10 items-center justify-between rounded-lg border px-3 text-xs font-bold transition-all cursor-pointer",
                        domisiliType === "luar_kota_tegal"
                          ? "border-primary bg-primary/5 text-primary shadow-2xs"
                          : "border-border bg-background text-foreground hover:bg-muted/40"
                      )}
                    >
                      <span>Luar Kota Tegal</span>
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border",
                          domisiliType === "luar_kota_tegal"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
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
                        <label className="text-2xs font-bold text-muted-foreground block mb-1">
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
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        >
                          {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                            <option key={kec} value={kec}>
                              {kec}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-muted-foreground block mb-1">
                          Kelurahan Domisili
                        </label>
                        <select
                          value={domisiliKelurahan}
                          onChange={(e) => setDomisiliKelurahan(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
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
                        <label className="text-2xs font-bold text-muted-foreground block mb-1">
                          RW Domisili
                        </label>
                        <select
                          value={domisiliRw}
                          onChange={(e) => setDomisiliRw(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        >
                          {domisiliRwOptions.map((rwNum) => (
                            <option key={rwNum} value={rwNum}>
                              {rwNum.includes("Belum") ? rwNum : `RW ${rwNum}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-2xs font-bold text-muted-foreground block mb-1">
                          RT Domisili
                        </label>
                        <select
                          value={domisiliRt}
                          onChange={(e) => setDomisiliRt(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        >
                          {domisiliRtOptions.map((rtNum) => (
                            <option key={rtNum} value={rtNum}>
                              {rtNum.includes("Belum") ? rtNum : `RT ${rtNum}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-2xs font-bold text-muted-foreground block mb-1">
                        Jalan / Alamat Domisili
                      </label>
                      <input
                        type="text"
                        value={domisiliJalan}
                        onChange={(e) => setDomisiliJalan(e.target.value)}
                        placeholder="Contoh: Jl. Werkudoro No. 12"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-2xs font-bold text-muted-foreground block">
                      Nama Kabupaten / Kota Domisili:
                    </label>
                    <input
                      type="text"
                      value={domisiliLuarKotaNama}
                      onChange={(e) => setDomisiliLuarKotaNama(e.target.value)}
                      placeholder="Contoh: Kabupaten Brebes, Semarang, Bandung..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. HASIL IDENTIFIKASI PERAN & HAK AKSES */}
          <div className={cn("rounded-lg border p-3.5 sm:p-4 space-y-2 transition-all shadow-2xs", roleCardColor)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status Teridentifikasi:
                </span>
              </div>
              <span className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold border", roleBadgeColor)}>
                <Check className="h-3 w-3 stroke-[3px]" />
                {identifiedRole.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
              {roleExplanation}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 px-4 rounded-lg border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-[40px] h-10 items-center justify-center gap-2 px-5 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-primary-foreground shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
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
