"use client";

import { useState, useTransition } from "react";
import {
  ArrowRightLeft,
  School,
  X,
  Loader2,
  AlertCircle,
  Baby,
  Calendar,
  FileText,
  MapPin,
} from "lucide-react";
import { mutasiDataAnak } from "@/app/actions/data-anak";
import type { DataAnakItem } from "@/types/database";

interface ModalMutasiDataAnakProps {
  isOpen: boolean;
  anak: DataAnakItem;
  komunitasId: string;
  komunitasNama?: string;
  onClose: () => void;
  onSuccess: (updatedChild: DataAnakItem) => void;
}

export function ModalMutasiDataAnak({
  isOpen,
  anak,
  komunitasId,
  komunitasNama = "Satuan PAUD",
  onClose,
  onSuccess,
}: ModalMutasiDataAnakProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultSekolahAsal =
    anak.nama_sekolah && !anak.nama_sekolah.toLowerCase().includes("belum")
      ? anak.nama_sekolah
      : komunitasNama && !komunitasNama.toLowerCase().includes("warga") && !komunitasNama.toLowerCase().includes("posyandu")
      ? komunitasNama
      : "Satuan PAUD Asal";

  const [sekolahAsal, setSekolahAsal] = useState(defaultSekolahAsal);
  const [sekolahTujuan, setSekolahTujuan] = useState("");
  const [jenisMutasi, setJenisMutasi] = useState("Pindah Satuan PAUD / Sekolah");
  const [tanggalMutasi, setTanggalMutasi] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [catatan, setCatatan] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sekolahTujuan.trim()) {
      setErrorMsg("Nama sekolah atau satuan tujuan mutasi wajib diisi.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await mutasiDataAnak(anak.id, {
        sekolahAsal: sekolahAsal.trim(),
        sekolahTujuan: sekolahTujuan.trim(),
        jenisMutasi,
        tanggalMutasi,
        catatan: catatan.trim(),
        komunitasId,
      });

      if (res.success) {
        const nowIso = new Date().toISOString();
        const updatedChild: DataAnakItem = {
          ...anak,
          status_approval: "mutasi",
          mutasi_at: nowIso,
          mutasi_asal: sekolahAsal.trim(),
          mutasi_tujuan: sekolahTujuan.trim(),
          terakhir_diperbarui_at: nowIso,
        };
        onSuccess(updatedChild);
        onClose();
      } else {
        setErrorMsg(res.message || "Gagal mencatat mutasi data anak.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={!isPending ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/40 bg-white dark:bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-indigo-50/70 dark:bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-foreground leading-tight">
                Mutasi Siswa / Pindah Sekolah
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground line-clamp-1">
                Catat perpindahan peserta didik dari sekolah asal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-border text-slate-400 hover:bg-slate-100 dark:hover:bg-muted hover:text-slate-700 dark:hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-semibold border-2 border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Child Identity Card */}
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Baby className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{anak.nama_lengkap}</span>
              <span className="text-muted-foreground font-normal">
                ({anak.jenis_kelamin === "L" || anak.jenis_kelamin === "Laki-laki" ? "Laki-laki" : "Perempuan"})
              </span>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-2 text-[11px]">
              <span>Orang Tua: <strong className="text-foreground">{anak.nama_orangtua || "-"}</strong></span>
              <span>• Alamat: <strong className="text-foreground">RT {anak.domisili_rt || "-"} / RW {anak.domisili_rw || "-"}, {anak.domisili_kelurahan || "-"}</strong></span>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Sekolah Asal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <School className="h-3.5 w-3.5 text-indigo-600" />
                <span>Satuan PAUD / Sekolah Asal</span>
              </label>
              <input
                type="text"
                value={sekolahAsal}
                onChange={(e) => setSekolahAsal(e.target.value)}
                placeholder="Nama satuan PAUD / sekolah asal anak..."
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:border-indigo-600 focus:outline-hidden"
                required
              />
            </div>

            {/* Sekolah / Satuan Tujuan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                <span>Sekolah / Satuan PAUD Baru (Tujuan Mutasi)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={sekolahTujuan}
                onChange={(e) => setSekolahTujuan(e.target.value)}
                placeholder="Contoh: TK Pembina 1 Kota Tegal / Pindah Domisili ke Brebes..."
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:border-indigo-600 focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Jenis Mutasi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Jenis / Alasan Mutasi
                </label>
                <select
                  value={jenisMutasi}
                  onChange={(e) => setJenisMutasi(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="Pindah Satuan PAUD / Sekolah">Pindah Satuan PAUD / Sekolah</option>
                  <option value="Pindah Domisili Tempat Tinggal">Pindah Domisili Tempat Tinggal</option>
                  <option value="Melanjutkan ke Jenjang SD/MI">Melanjutkan ke Jenjang SD/MI</option>
                  <option value="Mengikuti Orang Tua">Mengikuti Orang Tua</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Tanggal Mutasi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Tanggal Mutasi</span>
                </label>
                <input
                  type="date"
                  value={tanggalMutasi}
                  onChange={(e) => setTanggalMutasi(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:border-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Catatan / Keterangan Tambahan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Catatan Tambahan (Opsional)</span>
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Keterangan nomor surat mutasi, alasan khusus, atau catatan pendukung..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:border-indigo-600 focus:outline-hidden resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 px-4 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Simpan Mutasi Siswa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
