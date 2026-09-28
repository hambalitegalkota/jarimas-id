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
import { ThemeToggle } from "@/components/theme-toggle";
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
    <div className="flex min-h-[calc(100vh-5rem)] flex-col justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header Branding & Theme Toggle */}
        <div className="relative text-center space-y-2">
          <div className="absolute right-0 top-0">
            <ThemeToggle variant="compact" />
          </div>
          <div className="flex justify-center">
            <span className="cyber-badge">JARIMAS REGISTRATION</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">
            Buat Akun Baru
          </h1>
          <p className="text-xs text-muted-foreground">
            Bergabunglah dengan ekosistem tumbuh kembang anak Kota Tegal
          </p>
        </div>

        {/* Success Alert */}
        {state.success ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-6 text-emerald-600 dark:text-emerald-400 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-bold text-sm font-mono uppercase">PENDAFTARAN BERHASIL</h3>
                <p className="text-xs leading-relaxed text-foreground">
                  {state.message ||
                    "Pendaftaran berhasil! Silakan periksa email Anda untuk melakukan konfirmasi akun."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all hover:opacity-90 border border-border"
                  >
                    <span>LANJUT KE HALAMAN MASUK</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="rounded-lg border border-border bg-card p-6 md:p-8 shadow-2xl">
            {/* Prominent Error Banner */}
            {state.message && !state.success && (
              <div
                role="alert"
                className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 p-3.5 text-destructive animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                  <div className="space-y-1 text-xs font-mono leading-relaxed">
                    <p className="font-bold uppercase">
                      PENDAFTARAN BELUM BERHASIL
                    </p>
                    <p className="text-destructive/90">
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
                  className="block text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Nama Lengkap Sesuai Identitas
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="namaLengkap"
                    name="namaLengkap"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring transition-all"
                  />
                </div>
                {state.errors?.namaLengkap && (
                  <p className="text-[11px] font-mono text-destructive mt-1">
                    {state.errors.namaLengkap[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring transition-all"
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-[11px] font-mono text-destructive mt-1">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Kata Sandi (Minimal 8 Karakter)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
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
                    className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-10 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    className="absolute inset-y-0 right-0 flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {state.errors?.password && (
                  <p className="text-[11px] font-mono text-destructive mt-1">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full h-10 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all active:scale-[0.99] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none border border-border"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>MEMPROSES PENDAFTARAN...</span>
                    </>
                  ) : (
                    <>
                      <span>DAFTAR AKUN</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Login Link */}
        <div className="text-center">
          <p className="text-xs font-mono text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-bold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              MASUK SEKARANG
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
