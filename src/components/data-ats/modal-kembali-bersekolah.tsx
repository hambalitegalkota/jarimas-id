"use client";

import { useState, useTransition } from "react";
import {
  GraduationCap,
  School,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
} from "lucide-react";
import { kembaliBersekolah } from "@/app/actions/data-ats";
import type { DataAtsItem } from "@/types/database";
import { cn } from "@/lib/utils";

interface ModalKembaliBersekolahProps {
  isOpen: boolean;
  ats: DataAtsItem;
  komunitasId: string;
  onClose: () => void;
  onSuccess: (updatedAtsId: string, namaSekolah: string) => void;
}

const JENJANG_OPTIONS = [
  "SD / MI (Sekolah Dasar / Madrasah Ibtidaiyah)",
  "SMP / MTs (Sekolah Menengah Pertama / MTs)",
  "SMA / SMK / MA (Tingkat Menengah Atas / Kejuruan)",
  "PKBM - Paket A (Setara SD)",
  "PKBM - Paket B (Setara SMP)",
  "PKBM - Paket C (Setara SMA)",
  "Pondok Pesantren",
  "LKP / Kursus Keterampilan",
  "Lainnya",
];

const INTERVENSI_OPTIONS = [
  "Bantuan Biaya / Beasiswa Pendidikan",
  "Bantuan Perlengkapan Sekolah (Seragam, Tas, Buku)",
  "Pendidikan Kesetaraan (Paket A/B/C di PKBM)",
  "Advokasi & Pendampingan Kader / Tokoh Warga",
  "Penyelesaian Masalah Sosial / Keluarga",
  "Fasilitasi Sekolah Terbuka / Inklusi",
  "Lainnya",
];

export function ModalKembaliBersekolah({
  isOpen,
  ats,
  komunitasId,
  onClose,
  onSuccess,
}: ModalKembaliBersekolahProps) {
  const [isPending, startTransition] = useTransition();
  const [namaSekolah, setNamaSekolah] = useState("");
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [bentukIntervensi, setBentukIntervensi] = useState(INTERVENSI_OPTIONS[0]);
  const [catatan, setCatatan] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!namaSekolah.trim()) {
      setErrorMsg("Nama sekolah / lembaga pendidikan baru wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await kembaliBersekolah(ats.id, {
        namaSekolah: namaSekolah.trim(),
        jenjang,
        bentukIntervensi,
        catatan: catatan.trim(),
        komunitasId,
      });

      if (res.success) {
        onSuccess(ats.id, namaSekolah.trim());
      } else {
        setErrorMsg(res.message || "Gagal memproses intervensi kembali bersekolah.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg max-h-[min(92dvh,calc(100dvh-2rem))] flex flex-col rounded-xl border border-emerald-500/30 bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  INTERVENSI ATS
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                KEMBALI BERSEKOLAH
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
          {/* Target Child Summary Card */}
          <div className="rounded-lg border border-border bg-background p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Profil Anak
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Alasan Awal: {ats.alasan_tidak_sekolah}
              </span>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground">
                {ats.nama_lengkap}
              </h4>
              <p className="text-xs font-mono text-muted-foreground">
                Wali: <span className="text-foreground">{ats.nama_orangtua}</span> ({ats.tinggal_bersama}) • Kontak: {ats.nomor_hp || "-"}
              </p>
            </div>
          </div>

          {/* Error Feedback */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md p-3 text-xs font-mono border border-destructive/40 bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="form-kembali-bersekolah" onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* 1. Nama Sekolah Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono text-foreground flex items-center gap-1.5">
                <School className="h-3.5 w-3.5 text-emerald-400" />
                <span>NAMA SEKOLAH / PKBM / LEMBAGA TUJUAN *</span>
              </label>
              <input
                type="text"
                required
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                placeholder="Contoh: SDN 1 Mintaragen / PKBM Harapan Bangsa"
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* 2. Jenjang Pendidikan */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Jenjang Pendidikan</span>
              </label>
              <select
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-emerald-500 focus:outline-hidden"
              >
                {JENJANG_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Bentuk Intervensi */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Bentuk Fasilitasi / Intervensi</span>
              </label>
              <select
                value={bentukIntervensi}
                onChange={(e) => setBentukIntervensi(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-emerald-500 focus:outline-hidden"
              >
                {INTERVENSI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Catatan Tindak Lanjut */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Catatan Tambahan / Tanggal Masuk (Opsional)</span>
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan tanggal mulai belajar, pendamping dari kader/kelurahan, atau nomor induk siswa bila ada..."
                className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Info notice */}
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-emerald-400/90 leading-relaxed font-mono">
              💡 <strong>Dampak:</strong> Data anak akan otomatis dialihkan dari daftar Anak Tidak Sekolah (ATS) menjadi peserta didik aktif di <strong>Data Anak Komunitas</strong>.
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 rounded-md border border-border bg-background text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-kembali-bersekolah"
            disabled={isPending}
            className="flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-mono font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>KONFIRMASI KEMBALI BERSEKOLAH</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
