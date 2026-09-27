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
    <div className="container mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300">
      <div className="mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-destructive/10 text-destructive shadow-xs">
        <AlertCircle className="h-9 w-9" />
      </div>

      <div className="space-y-2 mb-6">
        <h1 className="text-xl font-black text-foreground">
          Terjadi Kendala Teknis
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Mohon maaf, halaman tidak dapat dimuat dengan sempurna. Sistem telah
          mencatat kendala ini.
        </p>
        {error?.message && (
          <div className="mt-3 rounded-2xl bg-muted/60 p-3 text-[11px] font-mono text-muted-foreground text-left line-clamp-3">
            Error: {error.message}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-98"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Coba Muat Ulang</span>
        </button>

        <Link
          href="/"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-xs font-bold text-foreground hover:bg-muted active:scale-98"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Beranda Kabar</span>
        </Link>
      </div>
    </div>
  );
}
