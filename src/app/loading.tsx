import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700 dark:text-blue-400" />
      </div>

      <div className="space-y-2 max-w-xs">
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            MEMUAT DATA
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Menyiapkan Informasi...
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Menghubungkan ke layanan interkoneksi data Posyandu &amp; PAUD Kota Tegal.
        </p>
      </div>

      {/* Shimmer skeleton bars */}
      <div className="mt-4 w-full max-w-sm space-y-3">
        <div className="h-20 w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        <div className="h-28 w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
      </div>
    </div>
  );
}
