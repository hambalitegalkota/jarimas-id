"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home, MessageSquare } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught in boundary:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 text-rose-600 shadow-xs">
        <AlertCircle className="h-8 w-8 stroke-[2px]" />
      </div>

      <div className="space-y-2 max-w-sm mx-auto">
        <span className="inline-flex items-center rounded-full border-2 border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
          KENDALA SISTEM
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Terjadi Kendala Teknis
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Mohon maaf, halaman tidak dapat dimuat dengan sempurna. Sistem telah mencatat kendala ini.
        </p>
        {error?.message && (
          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 text-xs font-mono text-rose-600 dark:text-rose-400 text-left line-clamp-3">
            Error: {error.message}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 text-base font-bold shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Coba Muat Ulang</span>
        </button>

        <Link
          href="/"
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Home className="h-4 w-4 text-blue-600" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
