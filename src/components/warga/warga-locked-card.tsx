import Link from "next/link";
import { Lock, Users, MessageSquare, UserPlus, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";

export function WargaLockedCard({ totalUsersCount = 0 }: { totalUsersCount?: number }) {
  return (
    <div
      id="warga-terdaftar"
      className="relative overflow-hidden rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-800/80 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 p-6 sm:p-8 shadow-md shadow-emerald-500/5 space-y-6"
    >
      {/* Background Decorative Circles */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-3.5 py-1 text-xs font-black text-emerald-900 dark:text-emerald-300 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>JARINGAN WARGA &amp; PERTEMANAN JARIMAS-ID</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Daftar Pengguna &amp; Warga Terdaftar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Eksplorasi sesama warga Kota Tegal, pengurus RT/RW, kader Posyandu, dan pendidik PAUD. Bangun jaringan pertemanan dan jalin percakapan pribadi langsung.
          </p>
        </div>

        {totalUsersCount > 0 && (
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Total Terdaftar
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {totalUsersCount} Pengguna
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Locked Teaser Banner */}
      <div className="relative rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-white/80 dark:bg-slate-950/60 backdrop-blur-sm p-6 sm:p-8 text-center space-y-4 shadow-inner">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30">
          <Lock className="h-8 w-8 text-emerald-100 animate-pulse" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
            Akses Terbatas Khusus Pengguna Terdaftar
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Daftar lengkap pengguna, profil kader Posyandu, fitur penambahan teman, dan fitur percakapan pribadi (chat) hanya dapat diakses setelah Anda masuk ke akun terverifikasi.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800">
            <HeartHandshake className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tambah &amp; Kelola Teman
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-50/70 dark:bg-slate-900 border border-teal-200 dark:border-slate-800">
            <MessageSquare className="h-5 w-5 text-teal-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Percakapan Pribadi (Chat)
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50/70 dark:bg-slate-900 border border-sky-200 dark:border-slate-800">
            <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Terverifikasi &amp; Aman
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white transition-all shadow-md shadow-emerald-700/20 active:scale-98 cursor-pointer"
          >
            <span>Masuk ke Akun Anda</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 transition-all active:scale-98 cursor-pointer shadow-2xs"
          >
            <UserPlus className="h-4 w-4 text-emerald-600" />
            <span>Daftar Akun Baru</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
