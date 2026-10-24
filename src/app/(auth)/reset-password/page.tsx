"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { resetPasswordUser } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import type { AuthActionState } from "@/types/database";

const initialState: AuthActionState = {
  success: false,
  message: "",
};

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordUser,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    // Verifikasi keberadaan sesi autentikasi dari tautan pemulihan
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
        } else {
          // Tangkap event pemulihan password jika token dikirim via hash fragment
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === "PASSWORD_RECOVERY" || session) {
                setHasValidSession(true);
              }
            }
          );
          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.warn("Gagal membaca sesi pemulihan:", err);
      } finally {
        setIsVerifyingSession(false);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-center px-4 py-8 sm:px-6 max-w-md mx-auto w-full">
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="relative text-center space-y-2">
          <div className="flex justify-center">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-2xs font-bold text-primary border border-primary/20 uppercase tracking-wider">
              JARIMAS SECURITY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Atur Ulang Kata Sandi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Buat kata sandi baru yang kuat dan aman untuk akun JARIMAS Anda
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
                Kata Sandi Berhasil Diperbarui!
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {state.message ||
                  "Kata sandi Anda telah berhasil diubah. Silakan masuk menggunakan kata sandi baru."}
              </p>
            </div>
            <div className="pt-3">
              <Link
                href="/login"
                className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-all w-full"
              >
                <span>Masuk dengan Kata Sandi Baru</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="rounded-lg border border-border bg-card p-6 sm:p-7 shadow-xs space-y-4">
            {/* Warning jika sesi belum terdeteksi (hanya jika verifikasi selesai dan tidak ada sesi) */}
            {!isVerifyingSession && !hasValidSession && !state.message && (
              <div
                role="alert"
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-700 dark:text-amber-400 animate-in fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs leading-relaxed">
                    <p className="font-bold">Verifikasi Tautan Pemulihan</p>
                    <p className="opacity-90">
                      Pastikan Anda membuka halaman ini dari tautan resmi yang dikirim ke email Anda. Jika tautan kedaluwarsa, silakan ajukan ulang melalui halaman Lupa Kata Sandi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prominent Error Banner */}
            {state.message && !state.success && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs leading-relaxed">
                    <p className="font-bold">Gagal Memperbarui Kata Sandi</p>
                    <p className="opacity-90">{state.message}</p>
                  </div>
                </div>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Password Baru */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground leading-snug"
                >
                  Kata Sandi Baru (Minimal 8 Karakter) <span className="text-destructive">*</span>
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
                      showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
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

              {/* Konfirmasi Password Baru */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-foreground leading-snug"
                >
                  Konfirmasi Kata Sandi Baru <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-11 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan konfirmasi kata sandi"
                        : "Tampilkan konfirmasi kata sandi"
                    }
                    className="absolute inset-y-0 right-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {state.errors?.confirmPassword && (
                  <p className="text-2xs font-semibold text-destructive mt-1">
                    {state.errors.confirmPassword[0]}
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
                      <span>Menyimpan Kata Sandi Baru...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Simpan Kata Sandi Baru</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center pt-1">
          <p className="text-xs font-medium text-muted-foreground">
            Batal atur ulang?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Kembali ke Halaman Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
