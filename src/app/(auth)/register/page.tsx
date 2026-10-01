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
    <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-center px-4 py-8 sm:px-6 max-w-md mx-auto w-full">
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="relative text-center space-y-2">
          <div className="flex justify-center">
            <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
              JARIMAS REGISTRATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Bergabunglah dengan ekosistem tumbuh kembang anak Kota Tegal
          </p>
        </div>

        {/* Success Alert */}
        {state.success ? (
          <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-6 sm:p-8 text-emerald-900 shadow-xs animate-in fade-in zoom-in-95 space-y-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-900">Pendaftaran Berhasil!</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {state.message ||
                  "Pendaftaran berhasil! Silakan periksa email Anda untuk melakukan konfirmasi akun."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white shadow-xs transition-all w-full"
              >
                <span>Lanjut ke Halaman Masuk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            {/* Prominent Error Banner */}
            {state.message && !state.success && (
              <div
                role="alert"
                className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-rose-900 animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
                  <div className="space-y-1 text-sm leading-relaxed">
                    <p className="font-bold">
                      Pendaftaran Belum Berhasil
                    </p>
                    <p className="text-rose-800">
                      {state.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form action={formAction} className="space-y-5">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label
                  htmlFor="namaLengkap"
                  className="block text-base font-bold text-slate-900 leading-snug"
                >
                  Nama Lengkap Sesuai Identitas <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="namaLengkap"
                    name="namaLengkap"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden transition-all"
                  />
                </div>
                {state.errors?.namaLengkap && (
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    {state.errors.namaLengkap[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-base font-bold text-slate-900 leading-snug"
                >
                  Alamat Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden transition-all"
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-base font-bold text-slate-900 leading-snug"
                >
                  Kata Sandi (Minimal 8 Karakter) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
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
                    className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    className="absolute inset-y-0 right-0 flex h-12 w-12 items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {state.errors?.password && (
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full min-h-[52px] h-13 items-center justify-center gap-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white px-6 text-base font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Memproses Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>Daftar Akun Baru</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm font-semibold text-slate-600">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-4"
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
