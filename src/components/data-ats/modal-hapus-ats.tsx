"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { deleteDataAts } from "@/app/actions/data-ats";
import type { DataAtsItem } from "@/types/database";

interface ModalHapusAtsProps {
  isOpen: boolean;
  ats: DataAtsItem;
  komunitasId: string;
  onClose: () => void;
  onSuccess: (deletedAtsId: string) => void;
}

export function ModalHapusAts({
  isOpen,
  ats,
  komunitasId,
  onClose,
  onSuccess,
}: ModalHapusAtsProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteDataAts(ats.id, komunitasId);
      if (res.success) {
        onSuccess(ats.id);
      } else {
        setErrorMsg(res.message || "Gagal menghapus data ATS.");
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

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-rose-500/30 bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                HAPUS DATA ATS
              </h3>
              <p className="text-xs text-muted-foreground">
                Konfirmasi penghapusan data
              </p>
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-left">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md p-3 text-xs font-mono border border-destructive/40 bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            Apakah Anda yakin ingin menghapus data Anak Tidak Sekolah berikut?
          </p>

          {/* Child Information Card */}
          <div className="rounded-lg border border-border bg-background p-3.5 space-y-1.5 font-mono">
            <div className="text-xs font-bold text-foreground">
              {ats.nama_lengkap}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Wali: <span className="text-foreground">{ats.nama_orangtua}</span> ({ats.tinggal_bersama})
            </div>
            <div className="text-[11px] text-amber-400">
              Alasan: {ats.alasan_tidak_sekolah}
            </div>
          </div>

          <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-3 text-[11px] text-rose-400 font-mono leading-relaxed">
            ⚠️ <strong>Perhatian:</strong> Data yang dihapus tidak dapat dipulihkan. Seluruh riwayat pencatatan terkait anak ini akan dihapus dari sistem.
          </div>
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
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex h-9 items-center justify-center gap-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white px-4 text-xs font-mono font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>YA, HAPUS DATA ATS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
