"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  GraduationCap,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  School,
  Building2,
  RefreshCw,
} from "lucide-react";
import {
  seedAllPosyanduTegalAction,
  seedAllPaudTegalAction,
  seedAllWargaKitaTegalAction,
  cleanupDuplicatePosyanduAction,
} from "@/app/actions/komunitas";
import { cleanupNonSuperAdminDataAction } from "@/app/actions/admin";

export function DatabaseSeedTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPendingPosyandu, startPosyandu] = useTransition();
  const [isPendingDeduplicate, startDeduplicate] = useTransition();
  const [isPendingPaud, startPaud] = useTransition();
  const [isPendingWargaFull, startWargaFull] = useTransition();
  const [isPendingCleanup, startCleanup] = useTransition();
  const [showConfirmCleanup, setShowConfirmCleanup] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSeedPosyandu = () => {
    setFeedback(null);
    startPosyandu(async () => {
      const res = await seedAllPosyanduTegalAction();
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const handleCleanupDuplicatePosyandu = () => {
    setFeedback(null);
    startDeduplicate(async () => {
      const res = await cleanupDuplicatePosyanduAction();
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const handleSeedSekolah = () => {
    setFeedback(null);
    startPaud(async () => {
      const res = await seedAllPaudTegalAction();
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const handleSeedWarga = () => {
    setFeedback(null);
    startWargaFull(async () => {
      const res = await seedAllWargaKitaTegalAction({ includeRt: true });
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const handleCleanupNonSuperAdmin = () => {
    setFeedback(null);
    setShowConfirmCleanup(false);
    startCleanup(async () => {
      const res = await cleanupNonSuperAdminDataAction();
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const isBusy =
    isPendingPosyandu ||
    isPendingDeduplicate ||
    isPendingPaud ||
    isPendingWargaFull ||
    isPendingCleanup;

  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Accordion Trigger Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pengaturan Master Database &amp; Wilayah
              </h3>
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-xs font-bold">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinkronisasi data 3 kategori Komunitas (Posyandu, Warga Kita, Sekolah)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            {isOpen ? "Tutup" : "Buka Menu"}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
      </button>

      {/* Accordion Body Content */}
      {isOpen && (
        <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-5">
          {feedback && (
            <div
              className={`flex items-center gap-3 rounded-xl p-4 text-sm font-bold border-2 ${
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
                onClick={() => setFeedback(null)}
                className="text-xs uppercase underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* 3 Main Seed Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Inisialisasi Master 3 Komunitas
              </span>
              <span className="text-xs font-mono text-slate-400">
                KOTA TEGAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kategori 1: Posyandu */}
              <div className="flex flex-col justify-between p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Sparkles className="h-5 w-5" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">
                      1. Posyandu
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Sinkronisasi <strong>230+ Posyandu Resmi</strong> yang tersebar di 4 Kecamatan &amp; 27 Kelurahan Kota Tegal.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSeedPosyandu}
                    disabled={isBusy}
                    className="w-full flex min-h-[48px] items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold active:scale-98 transition-all text-sm disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isPendingPosyandu ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyemai Posyandu...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Sinkronkan Posyandu</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCleanupDuplicatePosyandu}
                    disabled={isBusy}
                    className="w-full flex min-h-[40px] items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 font-bold active:scale-98 transition-all text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isPendingDeduplicate ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Memeriksa Duplikat...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Bersihkan Posyandu Duplikat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Kategori 2: Komunitas Warga Kita */}
              <div className="flex flex-col justify-between p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Users className="h-5 w-5" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">
                      2. Warga Kita
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Sinkronisasi pohon wilayah lengkap: <strong>4 Kec, 27 Kel, 459 RW, dan 7.803 RT</strong> se-Kota Tegal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSeedWarga}
                  disabled={isBusy}
                  className="w-full flex min-h-[48px] items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold active:scale-98 transition-all text-sm disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isPendingWargaFull ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyemai Warga (+RT)...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Sinkronkan Warga Kita</span>
                    </>
                  )}
                </button>
              </div>

              {/* Kategori 3: Sekolah & Lembaga Pendidikan */}
              <div className="flex flex-col justify-between p-5 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <School className="h-5 w-5" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">
                      3. Sekolah &amp; PAUD
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Sinkronisasi satuan <strong>PAUD, TK, KB, RA, SPS, PKBM &amp; SKB</strong> (siap ekspansi SD, SMP, SMA).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSeedSekolah}
                  disabled={isBusy}
                  className="w-full flex min-h-[48px] items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold active:scale-98 transition-all text-sm disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isPendingPaud ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyemai Sekolah...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Sinkronkan Sekolah</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone: Pembersihan Data Pengguna Non-Super Admin */}
          <div className="rounded-2xl border-2 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Zona Khusus: Pembersihan Data Uji
                </h4>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                PERMANEN
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Menghapus semua data pengguna uji (postingan, komentar, reaksi, keanggotaan) selain akun Super Admin. Akun Super Admin akan tetap aman.
            </p>

            {!showConfirmCleanup ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmCleanup(true)}
                  disabled={isBusy}
                  className="inline-flex min-h-[48px] items-center gap-2 px-5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all text-sm disabled:opacity-50 cursor-pointer active:scale-98 shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Bersihkan Semua Pengguna Non-Super Admin</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-sm text-slate-900 dark:text-slate-100">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Konfirmasi: Hapus semua pengguna selain Super Admin beserta postingan &amp; komunitasnya sekarang?
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCleanupNonSuperAdmin}
                    disabled={isPendingCleanup}
                    className="inline-flex min-h-[44px] items-center gap-2 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all text-sm font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {isPendingCleanup ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Membersihkan...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Ya, Hapus Sekarang</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmCleanup(false)}
                    disabled={isPendingCleanup}
                    className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
