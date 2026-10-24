"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { forgotPasswordUser } from "@/app/actions/auth";
import type { AuthActionState } from "@/types/database";

const initialState: AuthActionState = {
  success: false,
  message: "",
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordUser,
    initialState
  );

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-center px-4 py-8 sm:px-6 max-w-md mx-auto w-full">
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="relative text-center space-y-2">
          <div className="flex justify-center">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-2xs font-bold text-primary border border-primary/20 uppercase tracking-wider">
              JARIMAS RECOVERY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Lupa Kata Sandi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Masukkan email terdaftar Anda untuk menerima tautan aman pengaturan ulang kata sandi
          </p>
        </div>

        {/* Success Alert */}
        {state.success ? (
          <div className="rounded-lg border border-border bg-card p-6 sm:p-7 text-foreground shadow-xs animate-in fade-in zoom-in-95 space-y-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-foreground">
                Tautan Atur Ulang Terkirim!
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {state.message}
              </p>
            </div>

            <div className="pt-3 space-y-2">
              <Link
                href="/login"
                className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-all w-full"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Halaman Masuk</span>
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
                    <p className="font-bold">Permintaan Belum Berhasil</p>
                    <p className="opacity-90">{state.message}</p>
                  </div>
                </div>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-foreground leading-snug"
                >
                  Alamat Email Terdaftar <span className="text-destructive">*</span>
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
                      <span>Mengirim Tautan...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Kirim Tautan Atur Ulang</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Navigation Links */}
        <div className="flex flex-col items-center gap-2 text-center pt-1 text-xs">
          <p className="text-muted-foreground">
            Ingat kata sandi Anda?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Masuk Sekarang
            </Link>
          </p>
          <p className="text-muted-foreground">
            Belum memiliki akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Daftar Akun Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
