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
} from "lucide-react";
import { createDataAnak } from "@/app/actions/data-anak";
import type { JenisKomunitas } from "@/types/database";
import { cn } from "@/lib/utils";

interface FormDataAnakProps {
  komunitasId: string;
  komunitasNama: string;
  jenisKomunitas: JenisKomunitas | string;
  onSuccess?: () => void;
}

const ALASAN_SEKOLAH_PAUD = [
  "Sudah Usia PAUD",
  "Agar Mandiri",
  "Supaya Lebih Matang Emosional",
  "Persiapan Ke SD",
  "Mengembangkan Keterampilan Sosial & Bahasa",
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
  const isPaud = jenisKomunitas === "satuan_paud";

  const [namaLengkap, setNamaLengkap] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">("L");
  const [namaOrangtua, setNamaOrangtua] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [tinggalBersama, setTinggalBersama] = useState("Orang Tua");
  const [jarakRumahKm, setJarakRumahKm] = useState("0.5");

  // Sekolah State
  const [isSekolah, setIsSekolah] = useState<boolean>(isPaud);
  const [namaSekolah, setNamaSekolah] = useState(
    isPaud ? komunitasNama : "Belum Sekolah"
  );
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
    formData.append("tanggalLahir", tanggalLahir);
    formData.append("jenisKelamin", jenisKelamin);
    formData.append("namaOrangtua", namaOrangtua);
    formData.append("nomorHp", nomorHp);
    formData.append("tinggalBersama", tinggalBersama);
    formData.append("jarakRumahKm", jarakRumahKm);

    formData.append("isSekolah", isSekolah ? "true" : "false");
    formData.append("namaSekolah", isSekolah ? namaSekolah : "Belum Sekolah");
    formData.append("alasanSekolah", alasanSekolah);

    if (beratBadan) formData.append("beratBadan", beratBadan);
    if (tinggiBadan) formData.append("tinggiBadan", tinggiBadan);
    if (panjangBadan) formData.append("panjangBadan", panjangBadan);
    if (lingkarKepala) formData.append("lingkarKepala", lingkarKepala);
    if (catatanDdks) formData.append("catatanDdks", catatanDdks);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-start gap-2.5 rounded-md p-3.5 text-xs font-semibold animate-in fade-in ${
            feedback.type === "success"
              ? "border border-emerald-800 bg-emerald-950/40 text-emerald-300"
              : "border border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* SECTION 1: IDENTITAS ANAK */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Baby className="h-4 w-4 text-foreground" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
            1. Identitas Anak (0–7 Tahun)
          </h3>
        </div>

        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Nama Lengkap Sesuai Akta Kelahiran *
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Muhammad Bilal Al-Ghifari"
              className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
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
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs font-mono text-foreground focus:border-zinc-500 focus:outline-hidden"
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
                    ? "border-emerald-500 bg-emerald-950/20 text-emerald-400"
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
                    ? "border-cyan-500 bg-cyan-950/20 text-cyan-400"
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
              placeholder="Contoh: Hendrawan & Maya"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nomor HP / WhatsApp *
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                required
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="081234567890"
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Tinggal Bersama & Jarak Rumah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Status Tinggal Bersama *
            </label>
            <div className="relative">
              <Home className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <select
                value={tinggalBersama}
                onChange={(e) => setTinggalBersama(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-8 text-xs font-medium text-foreground focus:border-zinc-500 focus:outline-hidden appearance-none"
              >
                <option value="Orang Tua">Orang Tua Kandung</option>
                <option value="Kakek / Nenek">Kakek / Nenek</option>
                <option value="Wali / Saudara">Wali / Saudara</option>
                <option value="Panti Asuhan">Panti Asuhan / Pengasuh</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Jarak Rumah ke Posyandu / PAUD (KM) *
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
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-xs font-mono text-foreground focus:border-zinc-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATUS & ALASAN SEKOLAH (LOGIKA DINAMIS LINTAS KOMUNITAS) */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <GraduationCap className="h-4 w-4 text-foreground" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
            2. Status Pendidikan Anak
          </h3>
        </div>

        {/* Toggle Status Sekolah */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Apakah Anak Sudah Bersekolah di PAUD / TK?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSekolah(true);
                if (!namaSekolah || namaSekolah === "Belum Sekolah") {
                  setNamaSekolah(isPaud ? komunitasNama : "Satuan PAUD Terdaftar");
                }
                setAlasanSekolah(ALASAN_SEKOLAH_PAUD[0]);
              }}
              className={cn(
                "flex h-10 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer",
                isSekolah
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              Sudah Bersekolah (PAUD/TK)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSekolah(false);
                setNamaSekolah("Belum Sekolah");
                setAlasanSekolah(ALASAN_BELUM_SEKOLAH[0]);
              }}
              className={cn(
                "flex h-10 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer",
                !isSekolah
                  ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              Belum Bersekolah
            </button>
          </div>
        </div>

        {/* Nama Sekolah (Jika Bersekolah) */}
        {isSekolah && (
          <div className="space-y-1.5 animate-in fade-in">
            <label className="text-xs font-medium text-muted-foreground">
              Nama Satuan PAUD / TK *
            </label>
            <input
              type="text"
              required
              value={namaSekolah}
              onChange={(e) => setNamaSekolah(e.target.value)}
              placeholder="Contoh: RA Sakila Kerti Panggung"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
            />
          </div>
        )}

        {/* Alasan Sekolah (Dropdown Dinamis) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {isSekolah
              ? "Alasan Mengikuti Pendidikan PAUD *"
              : "Alasan Belum Mengikuti PAUD *"}
          </label>
          <select
            value={alasanSekolah}
            onChange={(e) => setAlasanSekolah(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-zinc-500 focus:outline-hidden"
          >
            {(isSekolah ? ALASAN_SEKOLAH_PAUD : ALASAN_BELUM_SEKOLAH).map(
              (alasan) => (
                <option key={alasan} value={alasan}>
                  {alasan}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* SECTION 3: PENGUKURAN DDTK AWAL (OPSIONAL) */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
            3. Pengukuran DDTK &amp; Antropometri Awal (Opsional)
          </h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Masukkan hasil pengukuran terakhir jika anak baru saja ditimbang di Posyandu atau diperiksa Bidan.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Berat Badan */}
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
              placeholder="12.5"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
            />
          </div>

          {/* Tinggi Badan */}
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
              placeholder="88.0"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
            />
          </div>

          {/* Panjang Badan */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Ruler className="h-3 w-3 text-muted-foreground" />
              PB (CM)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={panjangBadan}
              onChange={(e) => setPanjangBadan(e.target.value)}
              placeholder="88.0"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
            />
          </div>

          {/* Lingkar Kepala */}
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
              placeholder="47.0"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Catatan DDKS */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Catatan Kesehatan / Perkembangan
          </label>
          <input
            type="text"
            value={catatanDdks}
            onChange={(e) => setCatatanDdks(e.target.value)}
            placeholder="Contoh: Sudah bisa berjalan lancar, imunisasi campak lengkap."
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-5 text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan Data Anak...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Simpan &amp; Daftarkan Data Anak</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
