import Link from "next/link";
import { Compass, Home, ShoppingBag, Users } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[75vh] max-w-md flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-xs">
        <Compass className="h-10 w-10 animate-bounce" />
      </div>

      <div className="space-y-2 mb-8">
        <span className="text-4xl font-black text-primary">404</span>
        <h1 className="text-xl font-black text-foreground">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Halaman yang Anda tuju tidak tersedia atau tautan telah dipindahkan.
          Gunakan tombol di bawah untuk kembali menjelajah.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <Link
          href="/"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-98"
        >
          <Home className="h-4 w-4" />
          <span>Ke Beranda Kabar Jarimas</span>
        </Link>

        <Link
          href="/komunitas"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-xs font-bold text-foreground hover:bg-muted active:scale-98"
        >
          <Users className="h-4 w-4" />
          <span>Jelajahi Komunitas</span>
        </Link>

        <Link
          href="/market"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-xs font-bold text-foreground hover:bg-muted active:scale-98"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Buka Jarimas Market</span>
        </Link>
      </div>
    </div>
  );
}
