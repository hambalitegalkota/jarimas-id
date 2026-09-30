"use client";

import { useState, useTransition } from "react";
import {
  User,
  Calendar,
  Phone,
  Home,
  GraduationCap,
  Activity,
  Scale,
  Ruler,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
} from "lucide-react";
import { createDataAts } from "@/app/actions/data-ats";
import { ALASAN_TIDAK_SEKOLAH_LIST, type AlasanTidakSekolah } from "@/types/database";
import { cn } from "@/lib/utils";

interface FormDataAtsProps {
  komunitasId: string;
  komunitasNama: string;
  onSuccess?: () => void;
}

export function FormDataAts({
  komunitasId,
  komunitasNama,
  onSuccess,
}: FormDataAtsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Identitas Anak
  const [namaLengkap, setNamaLengkap] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">("L");
  const [namaOrangtua, setNamaOrangtua] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [tinggalBersama, setTinggalBersama] = useState("Orang Tua");

  // Status Pendidikan ATS
  const [keinginanSekolah, setKeinginanSekolah] = useState<"Masih Ada" | "Tidak Ada">("Masih Ada");
  const [alasanTidakSekolah, setAlasanTidakSekolah] = useState<AlasanTidakSekolah>(ALASAN_TIDAK_SEKOLAH_LIST[0]);
  const [keterangan, setKeterangan] = useState("");

  // DDTK Awal (Opsional)
  const [beratBadan, setBeratBadan] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [lingkarKepala, setLingkarKepala] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("komunitasId", komunitasId);
    formData.append("komunitasNama", komunitasNama);
    formData.append("namaLengkap", namaLengkap);
    formData.append("tanggalLahir", tanggalLahir);
    formData.append("jenisKelamin", jenisKelamin);
    formData.append("namaOrangtua", namaOrangtua);
    formData.append("nomorHp", nomorHp);
    formData.append("tinggalBersama", tinggalBersama);

    formData.append("keinginanSekolah", keinginanSekolah);
    formData.append("alasanTidakSekolah", alasanTidakSekolah);
    formData.append("keterangan", keterangan);

    if (beratBadan) formData.append("beratBadan", beratBadan);
    if (tinggiBadan) formData.append("tinggiBadan", tinggiBadan);
    if (lingkarKepala) formData.append("lingkarKepala", lingkarKepala);

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

      {/* SECTION 1: IDENTITAS ANAK */}
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

        {/* Tanggal Lahir & Jenis Kelamin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Tanggal Lahir *
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                required
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs font-mono text-foreground focus:border-amber-500 focus:outline-hidden"
              />
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

        {/* Tinggal Bersama */}
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

      {/* SECTION 3: PENGUKURAN DDTK AWAL (OPSIONAL) */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Activity className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
            3. Pengukuran DDTK &amp; Antropometri Awal (Opsional)
          </h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Catatan fisik / penimbangan kesehatan anak jika tersedia.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Scale className="h-3 w-3 text-muted-foreground" />
              BB (KG)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={beratBadan}
              onChange={(e) => setBeratBadan(e.target.value)}
              placeholder="25.0"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Ruler className="h-3 w-3 text-muted-foreground" />
              TB (CM)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={tinggiBadan}
              onChange={(e) => setTinggiBadan(e.target.value)}
              placeholder="120.0"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              LK (CM)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={lingkarKepala}
              onChange={(e) => setLingkarKepala(e.target.value)}
              placeholder="50.0"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
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
