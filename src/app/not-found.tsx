import Link from "next/link";
import { Compass, Home, Users } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs">
        <Compass className="h-8 w-8 text-blue-700 dark:text-blue-400 stroke-[2px]" />
      </div>

      <div className="space-y-2">
        <span className="text-4xl font-extrabold font-mono tracking-tight text-blue-700 dark:text-blue-400 block">
          404
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
          Halaman yang Anda tuju tidak tersedia atau tautan telah dipindahkan.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 text-base font-bold shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Ke Beranda Kabar</span>
        </Link>

        <Link
          href="/komunitas"
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Users className="h-4 w-4 text-blue-600" />
          <span>Jelajahi Komunitas</span>
        </Link>
      </div>
    </div>
  );
}
