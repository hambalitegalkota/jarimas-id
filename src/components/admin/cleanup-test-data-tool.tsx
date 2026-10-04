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
  Baby,
  Users,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  cleanupAllDataAnakAction,
  cleanupAllKaderAndAnggotaAction,
  cleanupNonSuperAdminDataAction,
  cleanupAllTestDataAction,
} from "@/app/actions/admin";

type CleanupType = "anak" | "kader" | "users" | "all";

export function CleanupTestDataTool() {
  const router = useRouter();
  const [showAccordion, setShowAccordion] = useState(false);
  const [confirmType, setConfirmType] = useState<CleanupType | null>(null);
  const [isCleaning, startCleanup] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const executeCleanup = (type: CleanupType) => {
    setFeedback(null);
    setConfirmType(null);
    startCleanup(async () => {
      try {
        let res: { success: boolean; message: string };
        if (type === "anak") {
          res = await cleanupAllDataAnakAction();
        } else if (type === "kader") {
          res = await cleanupAllKaderAndAnggotaAction();
        } else if (type === "users") {
          res = await cleanupNonSuperAdminDataAction();
        } else {
          res = await cleanupAllTestDataAction();
        }

        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          router.refresh();
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err.message || "Terjadi kesalahan saat membersihkan data uji coba.",
        });
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Feedback Alert */}
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

      {/* Main Accordion Card */}
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
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pusat Pembersihan Data Uji Coba (Testing Clean-up)
                </h4>
                <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.2 text-[10px] font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Alat bantu reset dan pembersihan data uji coba (Data Anak, DDTK, Kader, Akun Test) secara selektif maupun menyeluruh.
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
              Pilih opsi pembersihan data di bawah ini untuk memastikan tidak ada data uji coba lama yang tertinggal dan memudahkan pemantauan data uji coba terbaru:
            </p>

            {/* Grid 3 Opsi Terarah */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Opsi 1: Data Anak & DDTK */}
              <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                    <Baby className="h-4 w-4" />
                    <span>1. Bersihkan Data Anak</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    Menghapus seluruh Data Anak (0-6 thn, Balita, PAUD, ATS) & riwayat pengukuran DDTK uji coba ke 0.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("anak")}
                  disabled={isCleaning}
                  className="w-full inline-flex min-h-[38px] items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset Data Anak</span>
                </button>
              </div>

              {/* Opsi 2: Data Kader & Anggota */}
              <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                    <Users className="h-4 w-4" />
                    <span>2. Bersihkan Data Kader</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    Menghapus seluruh keanggotaan kader, pengurus, dan warga uji coba di seluruh komunitas ke 0.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("kader")}
                  disabled={isCleaning}
                  className="w-full inline-flex min-h-[38px] items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset Data Kader</span>
                </button>
              </div>

              {/* Opsi 3: Akun Pengguna Non-Admin */}
              <div className="p-4 rounded-xl border-2 border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs">
                    <ShieldAlert className="h-4 w-4" />
                    <span>3. Akun Non-Admin</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    Menghapus seluruh akun profil pengguna non-Super Admin beserta postingan dan reaksinya.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("users")}
                  disabled={isCleaning}
                  className="w-full inline-flex min-h-[38px] items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Akun Non-Admin</span>
                </button>
              </div>
            </div>

            {/* Opsi 4: Pembersihan Total Menyeluruh */}
            <div className="pt-2">
              <div className="p-4 rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                    <Flame className="h-4 w-4" />
                    <span>Pembersihan Menyeluruh (Full Testing Reset)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Menghapus sekaligus: Semua Data Anak &amp; DDTK, Semua Data Kader &amp; Keanggotaan, Postingan Kabar Uji Coba, dan Akun Pengguna Non-Admin. Akun Super Admin tetap aman.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("all")}
                  disabled={isCleaning}
                  className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all disabled:opacity-50 cursor-pointer active:scale-98 shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Pembersihan Menyeluruh</span>
                </button>
              </div>
            </div>

            {/* Modal Dialog Konfirmasi */}
            {confirmType && (
              <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
                      Konfirmasi Penghapusan Permanen:
                    </span>
                    {confirmType === "anak" && (
                      <span>Apakah Anda yakin ingin menghapus seluruh Data Anak &amp; riwayat pengukuran DDTK uji coba?</span>
                    )}
                    {confirmType === "kader" && (
                      <span>Apakah Anda yakin ingin menghapus seluruh Data Kader &amp; keanggotaan komunitas uji coba?</span>
                    )}
                    {confirmType === "users" && (
                      <span>Apakah Anda yakin ingin menghapus seluruh akun pengguna selain Super Admin?</span>
                    )}
                    {confirmType === "all" && (
                      <span>Apakah Anda yakin ingin melakukan pembersihan MENYELURUH (Data Anak, DDTK, Kader, Postingan, dan Akun Non-Admin)?</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => executeCleanup(confirmType)}
                    disabled={isCleaning}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs cursor-pointer active:scale-98"
                  >
                    {isCleaning ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Sedang Membersihkan...</span>
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
                    onClick={() => setConfirmType(null)}
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
