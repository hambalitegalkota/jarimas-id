import Link from "next/link";
import {
  Users,
  HeartPulse,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Building2,
  TrendingUp,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import type { RekapitulasiWargaKomunitasResult } from "@/types/database";

interface WargaRekapitulasiSectionProps {
  rekap: RekapitulasiWargaKomunitasResult;
  isAuthenticated: boolean;
}

export function WargaRekapitulasiSection({
  rekap,
  isAuthenticated,
}: WargaRekapitulasiSectionProps) {
  return (
    <section className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-6 shadow-sm">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION                                         */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>REKAPITULASI WARGA &amp; KOMUNITAS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Partisipasi Warga &amp; Jejaring Komunitas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Ringkasan data warga yang telah registrasi dan keaktifan masyarakat yang tergabung dalam Komunitas Posyandu serta Satuan PAUD Kota Tegal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/kabar?tab=percakapan"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-extrabold text-white transition-all shadow-sm cursor-pointer active:scale-98"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Pusat Percakapan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THREE STATISTIC CARDS (REKAPITULASI DATA)              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KARTU 1: WARGA REGISTRASI */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-5 space-y-4 shadow-2xs hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Terverifikasi
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {rekap.totalRegisteredUsers}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">
                Warga
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Warga Telah Registrasi
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pengguna aktif terdaftar yang memiliki akses ke sistem layanan dan koordinasi warga.
            </p>
          </div>

          <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Link
              href="/kabar?tab=warga"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Buka Daftar Warga</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* KARTU 2: WARGA KOMUNITAS POSYANDU */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/30 p-5 space-y-4 shadow-2xs hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white font-black shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 text-[10px] font-black text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-mono">
              {rekap.totalKomunitasPosyandu} Posyandu
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {rekap.totalWargaPosyandu}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">
                Warga / Kader
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Tergabung di Posyandu
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Kader kesehatan, ibu balita, dan masyarakat yang terhubung di forum penimbangan &amp; pemantauan gizi.
            </p>
          </div>

          <div className="pt-3 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
            <Link
              href="/komunitas?tab=posyandu"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Jelajahi Posyandu</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* KARTU 3: WARGA KOMUNITAS PAUD */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-5 space-y-4 shadow-2xs hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-black text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 font-mono">
              {rekap.totalKomunitasPaud} Satuan PAUD
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {rekap.totalWargaPaud}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">
                Pendidik / Wali
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Tergabung di Satuan PAUD
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Guru, tenaga pendidik, dan wali murid yang terhubung untuk stimulasi tumbuh kembang usia dini.
            </p>
          </div>

          <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-xs font-bold text-indigo-800 dark:text-indigo-300">
            <Link
              href="/komunitas?tab=paud"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Jelajahi Satuan PAUD</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. QUICK BANNER INFO & NAVIGASI CHAT SATU KOMUNITAS       */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-900 dark:text-slate-100">
              Ingin Terhubung dengan Warga Satu Komunitas Anda?
            </h5>
            <p className="text-slate-500 dark:text-slate-400">
              Gunakan menu Percakapan dan Daftar Warga di Kabar untuk berinteraksi langsung dengan tetangga &amp; kader.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/kabar?tab=warga"
            className="flex-1 sm:flex-initial inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 font-extrabold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs text-center"
          >
            <span>Daftar Warga</span>
          </Link>
          <Link
            href="/komunitas"
            className="flex-1 sm:flex-initial inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 font-extrabold text-white transition-all cursor-pointer shadow-xs text-center"
          >
            <span>Gabung Komunitas</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
