import Link from "next/link";
import { Compass, Home, ShoppingBag, Users } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
        <Compass className="h-8 w-8 animate-pulse text-emerald-600 dark:text-emerald-400 stroke-[1.5px]" />
      </div>

      <div className="space-y-2">
        <span className="text-4xl font-black font-mono tracking-tight text-foreground block">
          404
        </span>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          HALAMAN TIDAK DITEMUKAN
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Halaman yang Anda tuju tidak tersedia atau tautan telah dipindahkan.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <Link
          href="/"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground border border-border px-4 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all hover:opacity-90"
        >
          <Home className="h-3.5 w-3.5" />
          <span>KE BERANDA KABAR</span>
        </Link>

        <Link
          href="/komunitas"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-mono font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <Users className="h-3.5 w-3.5" />
          <span>JELAJAHI KOMUNITAS</span>
        </Link>

        <Link
          href="/market"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-mono font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>BUKA JARIMAS MARKET</span>
        </Link>
      </div>
    </div>
  );
}
