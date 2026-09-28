import { Loader2, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300 space-y-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="space-y-2 max-w-xs">
        <div className="flex justify-center">
          <span className="cyber-badge">MEMUAT SISTEM</span>
        </div>
        <h2 className="text-base font-bold tracking-tight text-foreground font-mono">
          MENYIAPKAN DATA...
        </h2>
        <p className="text-xs text-muted-foreground">
          Menghubungkan ke layanan interkoneksi data Kota Tegal.
        </p>
      </div>

      {/* Shimmer skeleton bars */}
      <div className="mt-4 w-full max-w-sm space-y-3">
        <div className="h-16 w-full rounded-md border border-border bg-muted animate-pulse" />
        <div className="h-24 w-full rounded-md border border-border bg-muted/60 animate-pulse" />
      </div>
    </div>
  );
}
