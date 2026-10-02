"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cleanupNonSuperAdminDataAction } from "@/app/actions/admin";

export function CleanupTestDataTool() {
  const router = useRouter();
  const [showAccordion, setShowAccordion] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCleaning, startCleanup] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCleanup = () => {
    setFeedback(null);
    setShowConfirm(false);
    startCleanup(async () => {
      try {
        const res = await cleanupNonSuperAdminDataAction();
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          router.refresh();
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err.message || "Terjadi kesalahan saat membersihkan data.",
        });
      }
    });
  };

  return (
    <div className="space-y-3">
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold border-2 transition-all shadow-xs ${
            feedback.type === "success"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          )}
          <span className="flex-1 leading-relaxed">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs uppercase tracking-wider underline hover:opacity-80 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowAccordion(!showAccordion)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pembersihan Data Uji Coba (Testing Clean-up)
              </h4>
              <p className="text-[11px] text-slate-500">
                Alat bantu pembersihan data pengguna non-Super Admin saat persiapan peluncuran.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showAccordion ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {showAccordion && (
          <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-rose-50/20 dark:bg-rose-950/10">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Menghapus semua data akun pengguna uji (postingan, komentar, reaksi, keanggotaan) selain akun Super Admin. Akun Super Admin akan tetap aman.
            </p>

            {!showConfirm ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isCleaning}
                className="inline-flex min-h-[42px] items-center gap-2 px-4 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all text-xs cursor-pointer active:scale-98"
              >
                <Trash2 className="h-4 w-4" />
                <span>Bersihkan Data Pengguna Non-Super Admin</span>
              </button>
            ) : (
              <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Konfirmasi: Hapus semua pengguna selain Super Admin beserta datanya sekarang?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCleanup}
                    disabled={isCleaning}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs cursor-pointer active:scale-98"
                  >
                    {isCleaning ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Membersihkan...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Ya, Hapus Sekarang</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isCleaning}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
