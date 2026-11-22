"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Loader2,
  LogIn,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import type { AuthActionState } from "@/types/database";

const initialState: AuthActionState = {
  success: false,
  message: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const isGmail = emailValue.trim().toLowerCase().endsWith("@gmail.com");

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-center px-4 py-8 sm:px-6 max-w-md mx-auto w-full">
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="relative text-center space-y-2">
          <div className="flex justify-center">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-2xs font-bold text-primary border border-primary/20 uppercase tracking-wider">
              JARIMAS AUTHENTICATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Masuk ke Akun
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Akses interkoneksi data anak &amp; komunitas warga Kota Tegal
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border border-border bg-card p-6 sm:p-7 shadow-xs space-y-5">
          {/* Prominent Error Banner */}
          {state.message && !state.success && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs leading-relaxed">
                  <p className="font-bold">Gagal Masuk</p>
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
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                />
              </div>

              {/* Notifikasi Cerdas Khusus Akun Gmail */}
              {isGmail && (
                <div className="flex items-center gap-1.5 pt-1 text-2xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Akun Gmail terdeteksi. Anda dapat langsung masuk tanpa kata sandi!</span>
                </div>
              )}

              {state.errors?.email && (
                <p className="text-2xs font-semibold text-destructive mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password (Optional for Gmail & Registered Passwordless) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground leading-snug"
                >
                  Kata Sandi{" "}
                  <span className="text-2xs font-normal text-muted-foreground">
                    (Opsional untuk akun Gmail / terdaftar)
                  </span>
                </label>
                <Link
                  href="/lupa-password"
                  className="text-2xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder={
                    isGmail
                      ? "Boleh dikosongkan untuk masuk langsung"
                      : "•••••••• (opsional untuk akun Gmail)"
                  }
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-11 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
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
                    <span>Memverifikasi &amp; Menghubungkan...</span>
                  </>
                ) : isGmail || !passwordValue ? (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Masuk Cepat dengan Email</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Info Box */}
          <div className="rounded-md border border-border bg-muted/40 p-3 text-2xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">💡 Info Masuk: </span>
            Jika Anda sudah terdaftar menggunakan akun Gmail, cukup tuliskan email dan klik{" "}
            <strong>Masuk Cepat</strong> tanpa perlu mengingat kata sandi. Komunitas Anda akan langsung terbuka otomatis.
          </div>
        </div>

        {/* Footer Register Link */}
        <div className="text-center pt-1">
          <p className="text-xs font-medium text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
