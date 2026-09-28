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
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8 stroke-[1.5px]" />
      </div>

      <div className="space-y-2">
        <span className="cyber-badge text-destructive border-destructive/40 bg-destructive/10">
          SYSTEM ERROR
        </span>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          TERJADI KENDALA TEKNIS
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Mohon maaf, halaman tidak dapat dimuat dengan sempurna. Sistem telah mencatat kendala ini.
        </p>
        {error?.message && (
          <div className="mt-3 rounded-md bg-background border border-border p-3 text-[11px] font-mono text-destructive text-left line-clamp-3">
            Error: {error.message}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground border border-border px-4 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all hover:opacity-90"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          <span>COBA MUAT ULANG</span>
        </button>

        <Link
          href="/"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-mono font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>KEMBALI KE BERANDA KABAR</span>
        </Link>
      </div>
    </div>
  );
}
