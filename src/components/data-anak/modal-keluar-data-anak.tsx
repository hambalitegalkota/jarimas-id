"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Baby,
} from "lucide-react";
import { deleteDataAnak } from "@/app/actions/data-anak";
import type { DataAnakItem } from "@/types/database";

interface ModalKeluarDataAnakProps {
  isOpen: boolean;
  anak: DataAnakItem;
  komunitasId: string;
  komunitasNama?: string;
  onClose: () => void;
  onSuccess: (deletedChildId: string) => void;
}

export function ModalKeluarDataAnak({
  isOpen,
  anak,
  komunitasId,
  komunitasNama = "Satuan PAUD",
  onClose,
  onSuccess,
}: ModalKeluarDataAnakProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = () => {
    setErrorMsg(null);

    startTransition(async () => {
      const res = await deleteDataAnak(anak.id, komunitasId);

      if (res.success) {
        onSuccess(anak.id);
        onClose();
      } else {
        setErrorMsg(res.message || "Gagal menghapus data anak dari sistem.");
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
      <div className="relative w-full max-w-md rounded-2xl border-2 border-rose-200 dark:border-rose-900/40 bg-white dark:bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-rose-50/70 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-foreground leading-tight">
                Hapus Data Anak
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground line-clamp-1">
                {komunitasNama}
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-left">
          {/* Error Feedback */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-semibold border-2 border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-sm font-semibold text-slate-800 dark:text-foreground leading-relaxed">
            Apakah Anda yakin ingin menghapus data anak ini dari sistem?
          </p>

          {/* Child Identity Card */}
          <div className="rounded-xl border-2 border-slate-200 dark:border-border bg-slate-50/50 dark:bg-background/60 p-3.5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                <Baby className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-foreground truncate">
                  {anak.nama_lengkap}
                </h4>
                <p className="text-xs text-slate-600 dark:text-muted-foreground truncate">
                  Orang Tua / Wali: <span className="font-medium text-slate-800 dark:text-foreground">{anak.nama_orangtua || "-"}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-border/60 text-xs text-slate-600 dark:text-muted-foreground flex flex-col gap-1">
              <div>
                Satuan PAUD: <span className="font-semibold text-slate-800 dark:text-foreground">{komunitasNama || anak.nama_sekolah || "-"}</span>
              </div>
              {anak.tinggal_bersama && (
                <div>
                  Tinggal Bersama: <span className="text-slate-800 dark:text-foreground">{anak.tinggal_bersama}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Notice */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/40 p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Perhatian:</strong> Data yang dihapus akan dibersihkan secara permanen dari sistem dan tidak dapat dipulihkan kembali.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-card flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-10 px-4 rounded-xl border-2 border-slate-200 dark:border-border bg-white dark:bg-background text-xs font-bold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white px-5 text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
