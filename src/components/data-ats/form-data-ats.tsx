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
  Lock,
  ShieldCheck,
} from "lucide-react";
import { createDataAts } from "@/app/actions/data-ats";
import {
  ALASAN_TIDAK_SEKOLAH_LIST,
  type AlasanTidakSekolah,
  USIA_ATS_OPTIONS,
  JENJANG_SEKOLAH_ASAL_OPTIONS,
} from "@/types/database";
import {
  DAFTAR_KECAMATAN_TEGAL,
  getKelurahanByKecamatan,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  getRwListByKelurahan,
  getRtListByKelurahan,
} from "@/lib/constants/tegal-data";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import {
  getPosyanduCakupanRw,
  getPosyanduCakupanWilayah,
  normalizeWilayah,
  normalizeRtRwNum,
} from "@/lib/data-anak-helpers";
import type {
  KomunitasWithMembership,
  DataAtsItem,
} from "@/types/database";
import { cn } from "@/lib/utils";

interface FormDataAtsProps {
  komunitasId: string;
  komunitasNama: string;
  komunitas?: KomunitasWithMembership;
  onSuccess?: (newItem?: DataAtsItem) => void;
}

export const KELAS_TERAKHIR_OPTIONS = [
  "Belum Pernah Sekolah",
  "Kelas 1 SD/MI/Paket A DO",
  "Kelas 2 SD/MI/Paket A DO",
  "Kelas 3 SD/MI/Paket A DO",
  "Kelas 4 SD/MI/Paket A DO",
  "Kelas 5 SD/MI/Paket A DO",
  "Kelas 6 SD/MI/Paket A DO",
  "Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan",
  "Kelas 7 SMP/MTs/Paket B DO",
  "Kelas 8 SMP/MTs/Paket B DO",
  "Kelas 9 SMP/MTs/Paket B DO",
  "Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan",
  "Kelas 10 SMA/SMK/MA/Paket C DO",
  "Kelas 11 SMA/SMK/MA/Paket C DO",
  "Kelas 12 SMA/SMK/MA/Paket C DO",
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
    meta.rawKec && meta.rawKec !== "Kota Tegal" && meta.rawKec !== "Semua Kecamatan"
      ? meta.rawKec
      : "Tegal Selatan";
  const initialKelurahan =
    meta.rawKel && meta.rawKel !== "Semua Kelurahan" && meta.rawKel !== "Semua"
      ? meta.rawKel
      : (getKelurahanByKecamatan(initialKecamatan)[0] || "Randugunting");
  const isPosyandu = komunitas?.jenis === "posyandu";
  const posyanduCakupan = getPosyanduCakupanWilayah(komunitas);
  const posyanduCakupanRw = posyanduCakupan?.rw || getPosyanduCakupanRw(komunitas);
  const initialRw = posyanduCakupanRw || meta.rawRw || "Belum Tahu";
  const initialRt =
    (posyanduCakupan?.rtList?.[0] ? posyanduCakupan.rtList[0].padStart(2, "0") : null) ||
    meta.rawRt ||
    "Belum Tahu";

  const getAvailableRtOptions = (kel: string, rwVal: string) => {
    if (isPosyandu && posyanduCakupan?.rtList && posyanduCakupan.rtList.length > 0) {
      const isSameKel = normalizeWilayah(kel) === normalizeWilayah(initialKelurahan);
      const isSameRw = normalizeRtRwNum(rwVal) === normalizeRtRwNum(posyanduCakupan.rw);
      if (isSameKel && isSameRw) {
        const uniqueRts = [...new Set(posyanduCakupan.rtList.map((r) => r.padStart(2, "0")))];
        return [...uniqueRts, "Belum Tahu"];
      }
    }
    return getRtListByKelurahan(kel, rwVal);
  };

  // Status Terkunci Sesuai Wilayah Komunitas (Hanya Kecamatan & Kelurahan yang terkunci sesuai wilayah komunitas, RW & RT selalu terbuka untuk pendataan ATS)
  const isLockedKecamatan = Boolean(
    meta.rawKec &&
      meta.rawKec !== "Kota Tegal" &&
      meta.rawKec !== "Semua Kecamatan"
  );
  const isLockedKelurahan = Boolean(
    meta.hasKel &&
      meta.rawKel &&
      meta.rawKel !== "Semua Kelurahan" &&
      meta.rawKel !== "Semua"
  );
  const isLockedRw = false;
  const isLockedRt = false;

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
  const [jenjangAsal, setJenjangAsal] = useState<string>(JENJANG_SEKOLAH_ASAL_OPTIONS[0]);
  const [sekolahSebelumnya, setSekolahSebelumnya] = useState("");
  const [kelasTerakhir, setKelasTerakhir] = useState<string>(KELAS_TERAKHIR_OPTIONS[0]);

  // Status Pendidikan ATS
  const [keinginanSekolah, setKeinginanSekolah] = useState<"Masih Ada" | "Tidak Ada">("Masih Ada");
  const [alasanTidakSekolah, setAlasanTidakSekolah] = useState<AlasanTidakSekolah>(
    ALASAN_TIDAK_SEKOLAH_LIST[0]
  );
  const [keterangan, setKeterangan] = useState("");

  const kelurahanOptions = isLockedKelurahan
    ? [initialKelurahan]
    : getKelurahanByKecamatan(kecamatan);

  const handleKecamatanChange = (newKec: string) => {
    if (isLockedKecamatan) return;
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
    formData.append("jenjangAsal", jenjangAsal);
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
        // Reset form input fields
        setNamaLengkap("");
        setUsia("10");
        setJenisKelamin("L");
        setNamaOrangtua("");
        setNomorHp("");
        setTinggalBersama("Orang Tua");
        setAlamat("");
        setSekolahSebelumnya("");
        setKeterangan("");

        // Segera panggil onSuccess dengan data ATS yang baru dibuat
        onSuccess?.(res.data);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal menyimpan data ATS. Silakan periksa kembali input formulir.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-4 sm:space-y-5 text-left">
      {/* Alert Feedback */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-3 text-xs sm:text-sm font-semibold border shadow-2xs",
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-50 text-emerald-900"
              : "border-rose-500/20 bg-rose-50 text-rose-900"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* BANNER WILAYAH WARGA */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <span>Wilayah Pendataan ATS</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {(isLockedKecamatan || isLockedKelurahan) && (
              <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span>Terkunci</span>
              </span>
            )}
            <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              Kota Tegal
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                Kecamatan
              </label>
              {isLockedKecamatan && (
                <span className="text-2xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Terkunci</span>
                </span>
              )}
            </div>
            {isLockedKecamatan ? (
              <div className="flex items-center justify-between min-h-[44px] h-11 bg-muted/50 border border-border rounded-lg px-3 text-xs sm:text-sm font-bold text-foreground cursor-not-allowed select-none">
                <span>Kecamatan {kecamatan}</span>
                <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Terkunci
                </span>
              </div>
            ) : (
              <select
                value={kecamatan}
                onChange={(e) => handleKecamatanChange(e.target.value)}
                className="w-full min-h-[44px] h-11 bg-background border border-border rounded-lg px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                  <option key={kec} value={kec}>
                    Kecamatan {kec}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                Kelurahan
              </label>
              {isLockedKelurahan && (
                <span className="text-2xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Terkunci</span>
                </span>
              )}
            </div>
            {isLockedKelurahan ? (
              <div className="flex items-center justify-between min-h-[44px] h-11 bg-muted/50 border border-border rounded-lg px-3 text-xs sm:text-sm font-bold text-foreground cursor-not-allowed select-none">
                <span>Kelurahan {kelurahan}</span>
                <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Terkunci
                </span>
              </div>
            ) : (
              <select
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full min-h-[44px] h-11 bg-background border border-border rounded-lg px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                {kelurahanOptions.map((kel) => (
                  <option key={kel} value={kel}>
                    Kelurahan {kel}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: IDENTITAS ANAK TIDAK SEKOLAH (ATS) */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0">
            1
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-tight">
              Identitas Anak Tidak Sekolah (ATS)
            </h3>
            <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
              Isi data identitas diri dan orang tua / wali anak
            </p>
          </div>
        </div>

        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground block">
            Nama Lengkap Anak (Sesuai Akta) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Ketik nama lengkap anak..."
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Usia & Jenis Kelamin */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground block">
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
                  -- Pilih Usia --
                </option>
                {USIA_ATS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "25>" ? "25> (Lebih dari 25 Tahun)" : `${opt} Tahun`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground block">
              Jenis Kelamin <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setJenisKelamin("L")}
                className={cn(
                  "flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-lg border text-xs sm:text-sm font-bold transition-all cursor-pointer",
                  jenisKelamin === "L"
                    ? "border-primary bg-primary/5 text-primary shadow-2xs"
                    : "border-border bg-background text-foreground hover:bg-muted/40"
                )}
              >
                <span>Laki-laki (L)</span>
              </button>
              <button
                type="button"
                onClick={() => setJenisKelamin("P")}
                className={cn(
                  "flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-lg border text-xs sm:text-sm font-bold transition-all cursor-pointer",
                  jenisKelamin === "P"
                    ? "border-primary bg-primary/5 text-primary shadow-2xs"
                    : "border-border bg-background text-foreground hover:bg-muted/40"
                )}
              >
                <span>Perempuan (P)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nama Orang Tua & Kontak HP */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground block">
              Nama Orang Tua / Wali <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={namaOrangtua}
              onChange={(e) => setNamaOrangtua(e.target.value)}
              placeholder="Contoh: Budi Susanto"
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground block">
              Nomor WhatsApp / HP <span className="text-2xs font-normal text-muted-foreground">(Opsional)</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="081234567890"
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-xs sm:text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Status Tinggal Bersama */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground block">
            Status Tinggal Bersama <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Home className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <select
              value={tinggalBersama}
              onChange={(e) => setTinggalBersama(e.target.value)}
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-8 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
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
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Alamat Rumah (Jalan / Gg / Blok / Nomor) <span className="text-destructive">*</span></span>
          </label>
          <input
            type="text"
            required
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Contoh: Jl. Merpati No. 12, Gg. Kenanga 2"
            className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* RW dan RT */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">
              RW <span className="text-destructive">*</span>
            </label>
            <select
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              {getRwListByKelurahan(kelurahan).map((r) => (
                <option key={r} value={r}>
                  {r.includes("Belum") ? r : `RW ${r}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">
              RT <span className="text-destructive">*</span>
            </label>
            <select
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-mono font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              {getAvailableRtOptions(kelurahan, rw).map((t) => (
                <option key={t} value={t}>
                  {t.includes("Belum") ? t : `RT ${t}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* JENJANG SEKOLAH ASAL, SEKOLAH SEBELUMNYA & KELAS TERAKHIR */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Jenjang Sekolah Sebelumnya / Asal <span className="text-destructive">*</span></span>
            </label>
            <select
              value={jenjangAsal}
              onChange={(e) => setJenjangAsal(e.target.value)}
              className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              {JENJANG_SEKOLAH_ASAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <School className="h-4 w-4 text-muted-foreground" />
                <span>Nama Sekolah Sebelumnya (Opsional)</span>
              </label>
              <input
                type="text"
                value={sekolahSebelumnya}
                onChange={(e) => setSekolahSebelumnya(e.target.value)}
                placeholder="Contoh: SDN 3 Kejambon"
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Kelas Terakhir Berhenti</span>
              </label>
              <select
                value={kelasTerakhir}
                onChange={(e) => setKelasTerakhir(e.target.value)}
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
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
      </div>

      {/* SECTION 2: STATUS PENDIDIKAN & ALASAN ATS */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0">
            2
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-tight">
              Minat &amp; Alasan Tidak Sekolah
            </h3>
            <p className="text-2xs sm:text-xs text-muted-foreground font-medium">
              Pilih opsi yang paling sesuai dengan kondisi anak saat ini
            </p>
          </div>
        </div>

        {/* 1. KEINGINAN UNTUK MELANJUTKAN SEKOLAH */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>Apakah anak masih memiliki keinginan kembali sekolah? <span className="text-destructive">*</span></span>
          </label>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setKeinginanSekolah("Masih Ada")}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer",
                keinginanSekolah === "Masih Ada"
                  ? "border-primary bg-primary/5 text-primary shadow-2xs"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    keinginanSekolah === "Masih Ada"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {keinginanSekolah === "Masih Ada" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-foreground">Masih Ada Keinginan</div>
                  <div className="text-2xs sm:text-xs text-muted-foreground">
                    Anak bersedia dan berminat kembali bersekolah / ikut program pendidikan
                  </div>
                </div>
              </div>
              <CheckCircle2
                className={cn(
                  "h-4 w-4 shrink-0",
                  keinginanSekolah === "Masih Ada" ? "text-primary" : "text-transparent"
                )}
              />
            </button>

            <button
              type="button"
              onClick={() => setKeinginanSekolah("Tidak Ada")}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer",
                keinginanSekolah === "Tidak Ada"
                  ? "border-secondary bg-secondary/10 text-secondary shadow-2xs"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    keinginanSekolah === "Tidak Ada"
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {keinginanSekolah === "Tidak Ada" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary-foreground" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-foreground">Tidak Ada Keinginan</div>
                  <div className="text-2xs sm:text-xs text-muted-foreground">
                    Anak belum/tidak berminat kembali bersekolah formal saat ini
                  </div>
                </div>
              </div>
              <AlertCircle
                className={cn(
                  "h-4 w-4 shrink-0",
                  keinginanSekolah === "Tidak Ada" ? "text-secondary" : "text-transparent"
                )}
              />
            </button>
          </div>
        </div>

        {/* 2. ALASAN TIDAK SEKOLAH */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground block">
            Alasan Utama Tidak Sekolah <span className="text-destructive">*</span>
          </label>
          <select
            value={alasanTidakSekolah}
            onChange={(e) => setAlasanTidakSekolah(e.target.value as AlasanTidakSekolah)}
            className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
          >
            {ALASAN_TIDAK_SEKOLAH_LIST.map((alasan) => (
              <option key={alasan} value={alasan}>
                {alasan}
              </option>
            ))}
          </select>
        </div>

        {/* 3. KETERANGAN */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            <span>Keterangan / Catatan Lapangan</span>
          </label>
          <textarea
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Tuliskan catatan tambahan mengenai kondisi anak, rencana bimbingan kader, atau kebutuhan intervensi..."
            className="w-full rounded-lg border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-1 pb-6 space-y-3">
        {feedback && feedback.type === "error" && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive shadow-2xs animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="leading-snug">{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground px-5 text-xs sm:text-sm font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan Data ATS...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Simpan &amp; Daftarkan Data ATS</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
