"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserPlus,
} from "lucide-react";
import { registerUser } from "@/app/actions/auth";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import type { AuthActionState } from "@/types/database";

const initialState: AuthActionState = {
  success: false,
  message: "",
};

// Flag untuk mengaktifkan/menonaktifkan fitur Google OAuth (disembunyikan sementara)
export const SHOW_GOOGLE_AUTH = false;

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-center px-4 py-8 sm:px-6 max-w-md mx-auto w-full">
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="relative text-center space-y-2">
          <div className="flex justify-center">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-2xs font-bold text-primary border border-primary/20 uppercase tracking-wider">
              JARIMAS REGISTRATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Buat Akun Baru
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Bergabunglah dengan ekosistem tumbuh kembang anak Kota Tegal
          </p>
        </div>

        {/* Success Alert */}
        {state.success ? (
          <div className="rounded-lg border border-border bg-card p-6 sm:p-7 text-foreground shadow-xs animate-in fade-in zoom-in-95 space-y-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {state.message ||
                  "Pendaftaran berhasil! Silakan periksa email Anda untuk melakukan konfirmasi akun."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-all w-full"
              >
                <span>Lanjut ke Halaman Masuk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="rounded-lg border border-border bg-card p-6 sm:p-7 shadow-xs space-y-4">
            {/* Prominent Error Banner */}
            {state.message && !state.success && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs leading-relaxed">
                    <p className="font-bold">Pendaftaran Belum Berhasil</p>
                    <p className="opacity-90">{state.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Daftar dengan Google (Disembunyikan Sementara) */}
            {SHOW_GOOGLE_AUTH && (
              <>
                <GoogleAuthButton text="Daftar dengan Google" mode="register" />

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-2xs uppercase">
                    <span className="bg-card px-2.5 text-muted-foreground font-semibold">
                      atau daftar dengan formulir
                    </span>
                  </div>
                </div>
              </>
            )}

            <form action={formAction} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label
                  htmlFor="namaLengkap"
                  className="block text-xs font-semibold text-foreground leading-snug"
                >
                  Nama Lengkap Sesuai Identitas <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="namaLengkap"
                    name="namaLengkap"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>
                {state.errors?.namaLengkap && (
                  <p className="text-2xs font-semibold text-destructive mt-1">
                    {state.errors.namaLengkap[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-foreground leading-snug"
                >
                  Alamat Email <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-2xs font-semibold text-destructive mt-1">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground leading-snug"
                >
                  Kata Sandi (Minimal 8 Karakter) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-11 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    className="absolute inset-y-0 right-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {state.errors?.password && (
                  <p className="text-2xs font-semibold text-destructive mt-1">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-5 text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Daftar Akun Baru</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Login Link */}
        <div className="text-center pt-1">
          <p className="text-xs font-medium text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
