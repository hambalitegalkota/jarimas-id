import { Loader2, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <h2 className="text-base font-bold text-foreground">
          Memuat Data Jarimas...
        </h2>
        <p className="text-xs text-muted-foreground">
          Menyiapkan informasi terkini untuk Anda. Mohon tunggu sejenak.
        </p>
      </div>

      {/* Shimmer skeleton bars */}
      <div className="mt-8 w-full max-w-sm space-y-3">
        <div className="h-20 w-full rounded-2xl bg-muted/60 animate-pulse" />
        <div className="h-28 w-full rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    </div>
  );
}
