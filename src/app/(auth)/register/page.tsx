"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { registerUser } from "@/app/actions/auth";
import type { AuthActionState } from "@/types/database";

const initialState: AuthActionState = {
  success: false,
  message: "",
};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-muted-foreground">
            Bergabunglah dengan ekosistem parenting &amp; pemantauan tumbuh kembang{" "}
            <span className="font-semibold text-primary">JARIMAS-ID</span>
          </p>
        </div>

        {/* Success Alert */}
        {state.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-900 shadow-sm backdrop-blur-sm dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base">Pendaftaran Berhasil!</h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {state.message ||
                    "Pendaftaran berhasil! Silakan periksa email Anda untuk melakukan konfirmasi akun."}
                </p>
                <div className="pt-3">
                  <Link
                    href="/login"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-transform active:scale-95 hover:brightness-105"
                  >
                    Lanjut ke Halaman Masuk
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 dark:shadow-black/20">
            {/* Prominent Error Banner */}
            {state.message && !state.success && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive shadow-sm animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-destructive" />
                  <div className="space-y-1 text-sm leading-relaxed">
                    <p className="font-semibold text-destructive">
                      Pendaftaran Belum Berhasil
                    </p>
                    <p className="text-xs sm:text-sm text-destructive/90">
                      {state.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label
                  htmlFor="namaLengkap"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Nama Lengkap Sesuai Kartu Identitas
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="namaLengkap"
                    name="namaLengkap"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full min-h-[48px] rounded-xl border border-input bg-background/50 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {state.errors?.namaLengkap && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {state.errors.namaLengkap[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full min-h-[48px] rounded-xl border border-input bg-background/50 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Kata Sandi (Minimal 8 Karakter)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full min-h-[48px] rounded-xl border border-input bg-background/50 pl-11 pr-12 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    className="absolute inset-y-0 right-0 flex min-h-[48px] min-w-[48px] items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {state.errors?.password && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Memproses Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
