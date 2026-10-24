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
          className={`flex items-center gap-3 rounded-lg p-3.5 text-xs font-semibold border transition-all shadow-xs ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
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
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowAccordion(!showAccordion)}
          className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-muted/50 cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Pusat Pembersihan Data Uji Coba (Testing Clean-up)
                </h4>
                <span className="inline-flex items-center rounded-md bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5">
                Alat bantu reset dan pembersihan data uji coba (Data Anak, Kader, Akun Test) secara selektif maupun menyeluruh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showAccordion ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {showAccordion && (
          <div className="p-4 pt-3 border-t border-border space-y-4 bg-muted/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pilih opsi pembersihan data di bawah ini untuk memastikan tidak ada data uji coba lama yang tertinggal dan memudahkan pemantauan data uji coba terbaru:
            </p>

            {/* Grid 3 Opsi Terarah */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Opsi 1: Data Anak */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                    <Baby className="h-4 w-4" />
                    <span>1. Bersihkan Data Anak</span>
                  </div>
                  <p className="text-2xs text-muted-foreground leading-relaxed">
                    Menghapus seluruh Data Anak (0-6 thn, Balita, PAUD, ATS) uji coba ke 0.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("anak")}
                  disabled={isCleaning}
                  className="w-full inline-flex min-h-[44px] h-11 items-center justify-center gap-1.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-98"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset Data Anak</span>
                </button>
              </div>

              {/* Opsi 2: Data Kader & Anggota */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-secondary font-semibold text-xs">
                    <Users className="h-4 w-4" />
                    <span>2. Bersihkan Data Kader</span>
                  </div>
                  <p className="text-2xs text-muted-foreground leading-relaxed">
                    Menghapus seluruh keanggotaan kader, pengurus, dan warga uji coba di seluruh komunitas ke 0.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("kader")}
                  disabled={isCleaning}
                  className="w-full inline-flex min-h-[44px] h-11 items-center justify-center gap-1.5 px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-98"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset Data Kader</span>
                </button>
              </div>

              {/* Opsi 3: Akun Pengguna Non-Admin */}
              <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                    <ShieldAlert className="h-4 w-4" />
                    <span>3. Akun Non-Admin</span>
                  </div>
                  <p className="text-2xs text-muted-foreground leading-relaxed">
                    Menghapus seluruh akun profil pengguna non-Super Admin beserta postingan dan reaksinya.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("users")}
                  disabled={isCleaning}
                  className="w-full inline-flex min-h-[44px] h-11 items-center justify-center gap-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-98"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Akun Non-Admin</span>
                </button>
              </div>
            </div>

            {/* Opsi 4: Pembersihan Total Menyeluruh */}
            <div className="pt-1">
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-destructive font-bold text-xs">
                    <Flame className="h-4 w-4" />
                    <span>Pembersihan Menyeluruh (Full Testing Reset)</span>
                  </div>
                  <p className="text-2xs text-muted-foreground leading-relaxed">
                    Menghapus sekaligus: Semua Data Anak, Semua Data Kader &amp; Keanggotaan, Postingan Kabar Uji Coba, dan Akun Pengguna Non-Admin. Akun Super Admin tetap aman.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmType("all")}
                  disabled={isCleaning}
                  className="inline-flex min-h-[44px] h-11 shrink-0 items-center justify-center gap-2 px-4 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer active:scale-98 shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Pembersihan Menyeluruh</span>
                </button>
              </div>
            </div>

            {/* Modal Dialog Konfirmasi */}
            {confirmType && (
              <div className="rounded-lg border border-destructive/30 bg-card p-4 space-y-3 animate-in fade-in zoom-in-95 shadow-lg">
                <div className="flex items-start gap-2.5 text-xs text-foreground">
                  <AlertTriangle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-destructive block mb-0.5">
                       Konfirmasi Penghapusan Permanen:
                    </span>
                    {confirmType === "anak" && (
                      <span className="text-muted-foreground">Apakah Anda yakin ingin menghapus seluruh Data Anak uji coba?</span>
                    )}
                    {confirmType === "kader" && (
                      <span className="text-muted-foreground">Apakah Anda yakin ingin menghapus seluruh Data Kader &amp; keanggotaan komunitas uji coba?</span>
                    )}
                    {confirmType === "users" && (
                      <span className="text-muted-foreground">Apakah Anda yakin ingin menghapus seluruh akun pengguna selain Super Admin?</span>
                    )}
                    {confirmType === "all" && (
                      <span className="text-muted-foreground">Apakah Anda yakin ingin melakukan pembersihan MENYELURUH (Data Anak, Kader, Postingan, dan Akun Non-Admin)?</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => executeCleanup(confirmType)}
                    disabled={isCleaning}
                    className="inline-flex min-h-[44px] h-11 items-center gap-1.5 px-4 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold text-xs cursor-pointer shadow-xs active:scale-98"
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
                    className="inline-flex min-h-[44px] h-11 items-center px-4 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
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
