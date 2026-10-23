"use client";

import { useActionState, useTransition } from "react";
import Image from "next/image";
import {
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  ArrowRight,
  LogOut,
  Info,
  CheckCircle2,
} from "lucide-react";
import { completeUserProfile, logoutUser } from "@/app/actions/auth";
import type { AuthActionState } from "@/types/database";

interface LengkapiProfilClientFormProps {
  userEmail: string;
  avatarUrl: string | null;
  googleName: string;
}

const initialState: AuthActionState = {
  success: false,
  message: "",
};

export function LengkapiProfilClientForm({
  userEmail,
  avatarUrl,
  googleName,
}: LengkapiProfilClientFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeUserProfile,
    initialState
  );
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Branding */}
      <div className="relative text-center space-y-2">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-2xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/25 uppercase tracking-wider">
            <ShieldAlert className="h-3.5 w-3.5" />
            Langkah Terakhir Onboarding
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Lengkapi Nama Asli Anda
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Akun Google Anda berhasil terhubung. Demi validitas interkoneksi data
          kependudukan dan komunitas warga, mohon konfirmasi nama resmi Anda.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-7 shadow-sm space-y-5">
        {/* Connected Google Account Indicator */}
        <div className="flex items-center gap-3.5 rounded-lg border border-border/80 bg-muted/40 p-3.5">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Google Avatar"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20"
                unoptimized
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {userEmail.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xs border border-border"
              title="Terhubung dengan Google"
            >
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-semibold text-primary uppercase tracking-wide">
                Akun Google Terhubung
              </span>
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {userEmail}
            </p>
            {googleName && (
              <p className="text-2xs text-muted-foreground truncate">
                Nama di profil Google:{" "}
                <span className="font-medium text-foreground">{googleName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs leading-relaxed text-foreground">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-primary">
              Mengapa nama asli diwajibkan?
            </p>
            <p className="text-muted-foreground text-2xs sm:text-xs">
              Platform JARIMAS terintegrasi dengan pencatatan tumbuh kembang
              anak, pelaporan kader Posyandu, verifikasi ATS, dan keanggotaan
              komunitas RT/RW Kota Tegal. Nama akun Google sering berupa nama
              panggilan atau alias sehingga tidak valid untuk administrasi resmi.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {state.message && !state.success && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs leading-relaxed">
                <p className="font-bold">Gagal Menyimpan</p>
                <p className="opacity-90">{state.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Input */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="namaLengkap"
              className="block text-xs font-semibold text-foreground leading-snug"
            >
              Nama Lengkap Asli (Sesuai KTP / KK / Akta){" "}
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <UserCheck className="h-4 w-4" />
              </div>
              <input
                id="namaLengkap"
                name="namaLengkap"
                type="text"
                required
                autoFocus
                defaultValue={googleName || ""}
                placeholder="Contoh: Siti Rahmawati atau Budi Prasetyo, S.Pd."
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
              />
            </div>
            {state.errors?.namaLengkap && (
              <p className="text-2xs font-semibold text-destructive mt-1">
                {state.errors.namaLengkap[0]}
              </p>
            )}
            <p className="text-2xs text-muted-foreground">
              Pastikan ejaan nama Anda benar. Nama ini akan tercantum di seluruh
              layanan komunitas dan data anak.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || isLoggingOut}
              className="flex w-full min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-5 text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Nama Asli...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Simpan &amp; Lanjutkan ke Aplikasi</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer Switch Account Option */}
      <div className="text-center pt-1">
        <p className="text-xs text-muted-foreground">
          Bukan akun Google Anda?{" "}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending || isLoggingOut}
            className="inline-flex items-center gap-1 font-semibold text-destructive hover:underline transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Keluar...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3 w-3" />
                <span>Keluar / Ganti Akun</span>
              </>
            )}
          </button>
        </p>
      </div>
    </div>
  );
}
