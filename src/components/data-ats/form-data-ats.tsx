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
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Alert Feedback */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-md p-3.5 text-xs font-mono border",
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* BANNER WILAYAH WARGA */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
            <MapPin className="h-4 w-4" />
            <span>WILAYAH WARGA PENDATAAN ATS</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Kota Tegal
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-semibold text-foreground">Kecamatan:</span>
            <select
              value={kecamatan}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:border-amber-500 focus:outline-hidden"
            >
              {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-semibold text-foreground">Kelurahan:</span>
            <select
              value={kelurahan}
              onChange={(e) => setKelurahan(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:border-amber-500 focus:outline-hidden"
            >
              {kelurahanOptions.map((kel) => (
                <option key={kel} value={kel}>
                  {kel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: IDENTITAS ANAK TIDAK SEKOLAH (ATS) */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
            1. Identitas Anak Tidak Sekolah (ATS)
          </h3>
        </div>

        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Nama Lengkap Sesuai Akta / Identitas *
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Usia & Jenis Kelamin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Usia *
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <select
                required
                value={usia}
                onChange={(e) => setUsia(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-8 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden appearance-none"
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Jenis Kelamin *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJenisKelamin("L")}
                className={cn(
                  "flex h-10 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer",
                  jenisKelamin === "L"
                    ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Laki-laki (L)
              </button>
              <button
                type="button"
                onClick={() => setJenisKelamin("P")}
                className={cn(
                  "flex h-10 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer",
                  jenisKelamin === "P"
                    ? "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Perempuan (P)
              </button>
            </div>
          </div>
        </div>

        {/* Nama Orang Tua & Kontak HP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nama Orang Tua / Wali *
            </label>
            <input
              type="text"
              required
              value={namaOrangtua}
              onChange={(e) => setNamaOrangtua(e.target.value)}
              placeholder="Contoh: Joko Widodo"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nomor WhatsApp / HP Aktif *
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                required
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="081234567890"
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Status Tinggal Bersama */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Status Tinggal Bersama *
          </label>
          <div className="relative">
            <Home className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <select
              value={tinggalBersama}
              onChange={(e) => setTinggalBersama(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
            >
              <option value="Orang Tua">Tinggal Bersama Orang Tua</option>
              <option value="Wali / Kakek-Nenek">Tinggal Bersama Wali / Kakek-Nenek</option>
              <option value="Kerabat / Saudara">Tinggal Bersama Kerabat / Saudara</option>
              <option value="Mandiri / Sendiri">Mandiri / Sendiri</option>
              <option value="Panti / Lembaga Sosial">Panti / Lembaga Sosial</option>
            </select>
          </div>
        </div>

        {/* ALAMAT LENGKAP: Jalan / Gg / Blok / Nomor */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Alamat Lengkap (Jalan / Gg / Blok / Nomor Rumah) *</span>
          </label>
          <input
            type="text"
            required
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Contoh: Jl. Merpati No. 12, Gg. Kenanga 2 Blok B"
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        {/* RW dan RT */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              RW *
            </label>
            <select
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
            >
              {DAFTAR_RW_TEGAL.map((r) => (
                <option key={r} value={r}>
                  RW {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              RT *
            </label>
            <select
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <School className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Sekolah Sebelumnya</span>
            </label>
            <input
              type="text"
              value={sekolahSebelumnya}
              onChange={(e) => setSekolahSebelumnya(e.target.value)}
              placeholder="Contoh: SDN 3 Randugunting / Belum Pernah"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Kelas Terakhir Saat Berhenti</span>
            </label>
            <select
              value={kelasTerakhir}
              onChange={(e) => setKelasTerakhir(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
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

      {/* SECTION 2: STATUS PENDIDIKAN & ALASAN ATS */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <GraduationCap className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
            2. Status Pendidikan &amp; Alasan Tidak Sekolah
          </h3>
        </div>

        {/* 1. KEINGINAN UNTUK MELANJUTKAN SEKOLAH */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>KEINGINAN UNTUK MELANJUTKAN SEKOLAH *</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKeinginanSekolah("Masih Ada")}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer",
                keinginanSekolah === "Masih Ada"
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Masih Ada</span>
            </button>
            <button
              type="button"
              onClick={() => setKeinginanSekolah("Tidak Ada")}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer",
                keinginanSekolah === "Tidak Ada"
                  ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Tidak Ada</span>
            </button>
          </div>
        </div>

        {/* 2. ALASAN TIDAK SEKOLAH */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            ALASAN TIDAK SEKOLAH (PILIH SALAH SATU) *
          </label>
          <select
            value={alasanTidakSekolah}
            onChange={(e) => setAlasanTidakSekolah(e.target.value as AlasanTidakSekolah)}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
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
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>KETERANGAN (PERJELAS ALASAN TIDAK BERSEKOLAH)</span>
          </label>
          <textarea
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Tuliskan keterangan tambahan mengenai kondisi anak, rencana bimbingan, atau kebutuhan intervensi..."
            className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden leading-relaxed"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 pb-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full h-10 items-center justify-center gap-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white px-5 text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan Data ATS...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Simpan &amp; Daftarkan Data ATS</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
