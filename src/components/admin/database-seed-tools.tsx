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
} from "@/app/actions/komunitas";
import { cleanupNonSuperAdminDataAction } from "@/app/actions/admin";

export function DatabaseSeedTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPendingPosyandu, startPosyandu] = useTransition();
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
    isPendingPaud ||
    isPendingWargaFull ||
    isPendingCleanup;

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm transition-all duration-200">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Pengaturan &amp; Inisialisasi Master Database
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Sinkronisasi data 3 kategori Komunitas (Posyandu, Warga Kita, Sekolah) &amp; Pembersihan Data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
            {isOpen ? "Tutup Menu" : "Buka Menu"}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-muted/20 text-muted-foreground">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {/* Accordion Body Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-1 border-t border-border/60 space-y-5">
          {feedback && (
            <div
              className={`flex items-center gap-2.5 rounded-lg p-3 text-xs font-mono border ${
                feedback.type === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
              <span className="flex-1 leading-relaxed">{feedback.message}</span>
              <button
                onClick={() => setFeedback(null)}
                className="text-[10px] uppercase underline opacity-70 hover:opacity-100 font-mono shrink-0"
              >
                TUTUP
              </button>
            </div>
          )}

          {/* 3 Main Seed Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Inisialisasi Master 3 Komunitas
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                KOTA TEGAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Kategori 1: Posyandu */}
              <div className="flex flex-col justify-between p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Sparkles className="h-4 w-4" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                      1. Posyandu
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sinkronisasi <strong>230+ Posyandu Resmi</strong> yang tersebar di 4 Kecamatan &amp; 27 Kelurahan Kota Tegal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSeedPosyandu}
                  disabled={isBusy}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 active:scale-98 transition-all text-xs font-mono font-semibold disabled:opacity-50"
                >
                  {isPendingPosyandu ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      <span>Menyemai Posyandu...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Sinkronkan Posyandu</span>
                    </>
                  )}
                </button>
              </div>

              {/* Kategori 2: Komunitas Warga Kita */}
              <div className="flex flex-col justify-between p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30 transition-all space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Users className="h-4 w-4" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                      2. Warga Kita
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sinkronisasi pohon wilayah lengkap: <strong>4 Kec, 27 Kel, 459 RW, dan 7.803 RT</strong> se-Kota Tegal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSeedWarga}
                  disabled={isBusy}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 active:scale-98 transition-all text-xs font-mono font-semibold disabled:opacity-50"
                >
                  {isPendingWargaFull ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                      <span>Menyemai Warga (+RT)...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Sinkronkan Warga Kita</span>
                    </>
                  )}
                </button>
              </div>

              {/* Kategori 3: Sekolah & Lembaga Pendidikan */}
              <div className="flex flex-col justify-between p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 transition-all space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400">
                    <School className="h-4 w-4" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                      3. Sekolah &amp; PAUD
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sinkronisasi satuan <strong>PAUD, TK, KB, RA, SPS, PKBM &amp; SKB</strong> (siap ekspansi SD, SMP, SMA).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSeedSekolah}
                  disabled={isBusy}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 active:scale-98 transition-all text-xs font-mono font-semibold disabled:opacity-50"
                >
                  {isPendingPaud ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                      <span>Menyemai Sekolah...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                      <span>Sinkronkan Sekolah</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone: Pembersihan Data Pengguna Non-Super Admin */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-destructive">
                  Zona Bahaya: Pembersihan Data Pengguna
                </h4>
              </div>
              <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/20">
                TIDAK BISA DIBATALKAN
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Menghapus semua data pengguna terdaftar (postingan, komentar, reaksi, keanggotaan) selain akun Super Admin. Akun Super Admin akan tetap aman.
            </p>

            {!showConfirmCleanup ? (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowConfirmCleanup(true)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white transition-all text-xs font-mono font-medium disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Bersihkan Semua Pengguna Non-Super Admin</span>
                </button>
              </div>
            ) : (
              <div className="rounded-md border border-destructive/40 bg-card p-3.5 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Konfirmasi: Hapus semua pengguna selain Super Admin beserta postingan &amp; komunitasnya sekarang?
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCleanupNonSuperAdmin}
                    disabled={isPendingCleanup}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-white hover:bg-destructive/90 transition-all text-xs font-mono font-bold disabled:opacity-50"
                  >
                    {isPendingCleanup ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Membersihkan...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3" />
                        <span>Ya, Hapus Sekarang</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmCleanup(false)}
                    disabled={isPendingCleanup}
                    className="px-3 py-1.5 rounded-md border border-border bg-muted/40 text-muted-foreground hover:text-foreground text-xs font-mono transition-colors disabled:opacity-50"
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
