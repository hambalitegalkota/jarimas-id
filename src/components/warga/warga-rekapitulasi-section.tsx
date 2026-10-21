import Link from "next/link";
import {
  Users,
  HeartPulse,
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Building2,
  TrendingUp,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import type { RekapitulasiWargaKomunitasResult } from "@/types/database";

interface WargaRekapitulasiSectionProps {
  rekap: RekapitulasiWargaKomunitasResult;
  isAuthenticated: boolean;
}

export function WargaRekapitulasiSection({
  rekap,
  isAuthenticated,
}: WargaRekapitulasiSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-5 shadow-sm">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION                                         */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-bold text-primary">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>REKAPITULASI WARGA &amp; KOMUNITAS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Partisipasi Warga &amp; Jejaring Komunitas
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Ringkasan data warga yang telah registrasi dan keaktifan masyarakat yang tergabung dalam Komunitas RT, Posyandu, Satuan PAUD, serta PKBM &amp; SKB Kota Tegal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/kabar?tab=percakapan"
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-sm cursor-pointer active:scale-98"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Pusat Percakapan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FIVE STATISTIC CARDS (REKAPITULASI DATA)               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {/* KARTU 1: WARGA REGISTRASI */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/40 p-4 space-y-3 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20 font-mono">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              Terverifikasi
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                {rekap.totalRegisteredUsers}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Warga
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">
              Warga Registrasi
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              Pengguna aktif terdaftar yang memiliki akses ke sistem layanan warga.
            </p>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
            <Link
              href="/kabar?tab=warga"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Daftar Warga</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* KARTU 2: WARGA KOMUNITAS RT */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card hover:border-sky-500/40 p-4 space-y-3 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/20 font-mono">
              {rekap.totalKomunitasRt ?? rekap.totalKomunitasWargaKita ?? 0} Lingkungan RT
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                {rekap.totalWargaRt ?? rekap.totalWargaWargaKita ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Warga RT
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">
              Komunitas RT
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              Warga dan pengurus rukun tetangga terhubung untuk aspirasi &amp; koordinasi.
            </p>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400">
            <Link
              href="/komunitas?tab=warga_kita"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Jelajahi RT</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* KARTU 3: WARGA KOMUNITAS POSYANDU */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card hover:border-rose-500/40 p-4 space-y-3 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold group-hover:scale-105 transition-transform">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 border border-rose-500/20 font-mono">
              {rekap.totalKomunitasPosyandu} Posyandu
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                {rekap.totalWargaPosyandu}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Kader/Warga
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">
              Posyandu
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              Kader kesehatan dan ibu balita dalam penimbangan dan pencegahan stunting.
            </p>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
            <Link
              href="/komunitas?tab=posyandu"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Jelajahi Posyandu</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* KARTU 4: WARGA KOMUNITAS PAUD */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/40 p-4 space-y-3 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-500/20 font-mono">
              {rekap.totalKomunitasPaud} Satuan PAUD
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                {rekap.totalWargaPaud}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Pendidik/Wali
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">
              Satuan PAUD
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              Guru, tenaga pendidik, dan wali murid untuk stimulasi tumbuh kembang anak.
            </p>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
            <Link
              href="/komunitas?tab=satuan_paud"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Jelajahi PAUD</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* KARTU 5: WARGA KOMUNITAS PKBM & SKB */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card hover:border-secondary/40 p-4 space-y-3 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/15 text-secondary-foreground font-bold group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">
              {rekap.totalKomunitasPkbmSkb ?? 0} PKBM &amp; SKB
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                {rekap.totalWargaPkbmSkb ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Pamong/Warga
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">
              PKBM &amp; SKB
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              Pamong belajar dan warga untuk pendidikan kesetaraan Paket A/B/C &amp; vokasi.
            </p>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Link
              href="/komunitas?tab=pkbm_skb"
              className="inline-flex items-center gap-1 hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Jelajahi PKBM</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. QUICK BANNER INFO & NAVIGASI CHAT SATU KOMUNITAS       */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-lg bg-muted/40 border border-border text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h5 className="font-bold text-foreground">
              Ingin Terhubung dengan Warga Satu Komunitas Anda?
            </h5>
            <p className="text-muted-foreground">
              Gunakan menu Percakapan dan Daftar Warga di Kabar untuk berinteraksi langsung dengan tetangga &amp; kader.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/kabar?tab=warga"
            className="flex-1 sm:flex-initial inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:bg-accent px-3 py-1.5 font-bold text-foreground transition-all cursor-pointer shadow-2xs text-center"
          >
            <span>Daftar Warga</span>
          </Link>
          <Link
            href="/komunitas"
            className="flex-1 sm:flex-initial inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 px-3.5 py-1.5 font-bold text-primary-foreground transition-all cursor-pointer shadow-2xs text-center"
          >
            <span>Gabung Komunitas</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
