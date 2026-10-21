import Link from "next/link";
import Image from "next/image";
import {
  HeartPulse,
  GraduationCap,
  BookOpen,
  Building2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  Package,
  Award,
  ChevronRight,
  Tag,
  Star,
  Zap,
  Activity,
  Phone,
  Baby,
  Smile,
  Flame,
  School,
  HeartHandshake,
  UserPlus,
  Bell,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getMarketProduk } from "@/app/actions/market";
import { getKabarFeed } from "@/app/actions/kabar";
import { getRekapitulasiWargaKomunitas } from "@/app/actions/pertemanan";
import { WargaRekapitulasiSection } from "@/components/warga/warga-rekapitulasi-section";
import { KabarCard } from "@/components/kabar/kabar-card";
import { formatRupiah, isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
import { SHOW_MARKET_FEATURE } from "@/components/layout/bottom-nav";
import type { MarketProduk } from "@/types/database";

// Fallback data produk katalog Jarimas Market
const FALLBACK_SHOWCASE_PRODUCTS: MarketProduk[] = [
  {
    id: "sample-stadiometer-1",
    nama: "Stadiometer Portabel Presisi Posyandu",
    deskripsi:
      "Alat ukur tinggi badan presisi standar Kemenkes RI dengan baseboard kokoh dan mistar lipat untuk kader Posyandu.",
    kategori: "Antropometri",
    harga: 450000,
    stok: 15,
    gambar_url:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "sample-baby-scale-2",
    nama: "Baby Scale & Timbangan Digital 2-in-1",
    deskripsi:
      "Timbangan digital balita dengan tray lepas-pasang, akurasi 5 gram, fitur tare, dan pembacaan instan berlayar LCD.",
    kategori: "Antropometri",
    harga: 620000,
    stok: 12,
    gambar_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "sample-pmt-nutrisi-3",
    nama: "Paket PMT Biskuit Nutrisi Balita Sehat",
    deskripsi:
      "Makanan tambahan kaya protein hewani, zat besi, zinc, dan vitamin A & D untuk pemulihan gizi & pencegahan stunting.",
    kategori: "PMT & Nutrisi",
    harga: 185000,
    stok: 40,
    gambar_url:
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "sample-modul-ddtk-4",
    nama: "Modul Edukasi Stimulasi Motorik & DDTK",
    deskripsi:
      "Buku panduan stimulasi motorik kasar, halus, dan bicara usia 0-6 tahun lengkap dengan kartu stimulasi PAUD.",
    kategori: "Edukasi PAUD",
    harga: 125000,
    stok: 25,
    gambar_url:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
    is_active: true,
  },
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Ambil session user aktif & data profil jika sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const isSuperAdmin = checkIsSuperAdmin({
    ...profile,
    email: profile?.email || user?.email,
    id: user?.id,
  });

  // 2. Ambil data produk, kabar terbaru, dan rekapitulasi secara paralel
  const [
    { data: dbProducts },
    { data: recentKabar },
    rekapWargaKomunitas,
  ] = await Promise.all([
    getMarketProduk(),
    getKabarFeed({
      sorting: "terbaru",
      filterVisibilitas: "semua",
      limit: 3,
    }),
    getRekapitulasiWargaKomunitas(),
  ]);

  const featuredProducts =
    dbProducts && dbProducts.length > 0
      ? dbProducts.slice(0, 4)
      : FALLBACK_SHOWCASE_PRODUCTS;

  const topKabarItems = (recentKabar || []).slice(0, 2);

  // Informasi domisili pengguna aktif jika terdaftar
  const userLocationLabel = profile?.kelurahan
    ? `Kel. ${profile.kelurahan}${profile.kecamatan ? `, ${profile.kecamatan}` : ""}`
    : "Kota Tegal";

  return (
    <div className="flex flex-col flex-1 px-3.5 sm:px-6 md:px-8 py-3 sm:py-5 gap-5 sm:gap-7 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. TOP SUPER APP BAR (Brand, Domisili, & Profile)        */}
      {/* ========================================================= */}
      <header className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black shadow-sm shrink-0">
            <Sparkles className="h-5 w-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black tracking-tight text-foreground">
                JARIMAS<span className="text-primary">.ID</span>
              </span>
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                KOTA TEGAL
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-[280px]">
                {user ? userLocationLabel : "Gerakan Gotong Royong Warga"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons: Notifikasi & Profil */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/kabar"
            aria-label="Notifikasi Kabar Warga"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-all active:scale-95 shadow-sm relative"
          >
            <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-secondary ring-2 ring-card" />
          </Link>

          {user ? (
            <Link
              href="/profil"
              className="inline-flex min-h-[36px] sm:min-h-[40px] items-center gap-2 rounded-lg bg-card border border-border hover:bg-muted px-2.5 sm:px-3 py-1 text-xs font-bold text-foreground transition-all active:scale-95 shadow-sm"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-[11px]">
                {(profile?.nama_lengkap || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline truncate max-w-[120px]">
                {profile?.nama_lengkap || "Profil"}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="inline-flex min-h-[36px] sm:min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-secondary hover:brightness-95 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-secondary-foreground transition-all active:scale-95 shadow-sm"
              >
                <span>Masuk</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. COMMUNITY PULSE HERO CARD (TEAL & MUSTARD SUPER APP)   */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-5 sm:p-7 shadow-sm border border-teal-700/50">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-5">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-[11px] font-semibold text-teal-200 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>KOTA TEGAL • GENERASI SEHAT, BEBAS STUNTING &amp; ATS</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
              Gotong Royong Tumbuh Kembang &amp; Pendidikan Anak{" "}
              <span className="text-amber-300">Kota Tegal</span>
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
              Akses cepat data riil pemantauan DDTK Posyandu, pemetaan Anak Tidak Sekolah (ATS), dan jejaring komunitas RT/RW se-Kota Tegal.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <Link
              href="/komunitas"
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-secondary hover:brightness-95 px-5 text-xs sm:text-sm font-bold text-secondary-foreground transition-all shadow-sm active:scale-95"
            >
              <Users className="h-4 w-4" />
              <span>Jelajahi Komunitas Warga</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/data-anak"
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-4 text-xs sm:text-sm font-semibold text-white transition-all backdrop-blur-xs active:scale-95"
            >
              <Baby className="h-4 w-4 text-amber-300" />
              <span>Pantau Data Anak (0-6 Th)</span>
            </Link>
          </div>

          {/* Mini Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/15">
            <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
              <span className="text-base sm:text-lg font-black text-amber-300 block font-mono">
                4 Kecamatan
              </span>
              <span className="text-[11px] text-teal-100/80">Kota Tegal</span>
            </div>
            <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
              <span className="text-base sm:text-lg font-black text-teal-200 block font-mono">
                27 Kelurahan
              </span>
              <span className="text-[11px] text-teal-100/80">Terhubung</span>
            </div>
            <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
              <span className="text-base sm:text-lg font-black text-amber-300 block font-mono">
                209 Posyandu
              </span>
              <span className="text-[11px] text-teal-100/80">Layanan DDTK</span>
            </div>
            <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
              <span className="text-base sm:text-lg font-black text-teal-200 block font-mono">
                219 PAUD/PKBM
              </span>
              <span className="text-[11px] text-teal-100/80">Pendidikan Dini</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SUPER APP SERVICE GRID (8 IKON MENU CEPAT LAYANAN)     */}
      {/* ========================================================= */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Layanan &amp; Fitur Utama
          </h2>
          <span className="text-[11px] font-medium text-primary">Akses Cepat</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3">
          {/* 1. Warga Kita */}
          <Link
            href="/komunitas?tab=warga_kita"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              Warga Kita
            </span>
          </Link>

          {/* 2. Posyandu */}
          <Link
            href="/komunitas?tab=posyandu"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800/60 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              Posyandu
            </span>
          </Link>

          {/* 3. Satuan PAUD */}
          <Link
            href="/komunitas?tab=satuan_paud"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800/60 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              Satuan PAUD
            </span>
          </Link>

          {/* 4. Data Balita */}
          <Link
            href="/data-anak"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 border border-sky-200 dark:border-sky-800/60 group-hover:scale-105 transition-transform">
              <Baby className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              Data Balita
            </span>
          </Link>

          {/* 5. Cek ATS */}
          <Link
            href="/data-ats"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800/60 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              Data ATS
            </span>
          </Link>

          {/* 6. Jarimas Market */}
          <Link
            href="/market"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-secondary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950/60 text-secondary border border-secondary/30 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              Market
            </span>
          </Link>

          {/* 7. Kabar Warga */}
          <Link
            href="/kabar"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              Kabar Warga
            </span>
          </Link>

          {/* 8. PKBM & SKB */}
          <Link
            href="/komunitas?tab=pkbm_skb"
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center group active:scale-95 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200 dark:border-purple-800/60 group-hover:scale-105 transition-transform">
              <School className="h-5 w-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">
              PKBM &amp; SKB
            </span>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FORUM & KABAR WARGA TERKINI (POSISI TERBUKA)           */}
      {/* ========================================================= */}
      {topKabarItems.length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary font-bold">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Kabar &amp; Pengumuman Terkini
                </h2>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary font-mono">
                  {recentKabar?.length || topKabarItems.length} Kabar
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 text-[10px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Langsung Terbuka
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Informasi jadwal posyandu, nutrisi gizi balita, dan kabar lingkungan RT/RW se-Kota Tegal.
              </p>
            </div>

            <Link
              href="/kabar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition-all shrink-0 shadow-sm self-start sm:self-auto"
            >
              <span>Lihat Semua Kabar</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>

          <div className="space-y-3">
            {topKabarItems.map((item) => (
              <KabarCard
                key={item.id}
                kabar={item}
                currentUserId={user?.id}
                isSuperAdmin={isSuperAdmin}
              />
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 5. 6 PILAR UTAMA EKOSISTEM JARIMAS-ID (BENTO GRID)        */}
      {/* ========================================================= */}
      <section className="space-y-3 sm:space-y-4">
        <div className="space-y-1">
          <span className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            FITUR UNGGULAN
          </span>
          <h2 className="text-base sm:text-xl font-bold text-foreground tracking-tight">
            Layanan Terpadu Warga &amp; Komunitas
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Akses satu pintu untuk perlindungan anak, penanganan stunting, dan pendidikan dini se-Kota Tegal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Bento Card 1: Pendataan Anak Usia Dini (0 -6 Tahun) */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-primary border border-primary/20 shadow-xs">
                  <Baby className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Data Balita &amp; PAUD
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                  Pendataan Anak Usia Dini (0 - 6 Tahun)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pencatatan profil balita dan anak usia dini terintegrasi berbasis domisili dan KK untuk akses layanan Posyandu, pemantauan gizi, dan PAUD.
                </p>
              </div>
            </div>

            <Link
              href="/data-anak"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
            >
              <span>Pantau Pendataan Anak Usia Dini</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Bento Card 2: Pendataan Anak Tidak Sekolah (ATS) */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-secondary border border-secondary/30 shadow-xs">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Pendidikan Anak
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                  Pendataan Anak Tidak Sekolah (ATS)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Validasi data anak putus sekolah atau belum sekolah berjenjang (RT, RW, Kelurahan) untuk intervensi kembali bersekolah atau program kesetaraan.
                </p>
              </div>
            </div>

            <Link
              href="/data-ats"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline pt-1"
            >
              <span>Pantau Hasil Pendataan ATS</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Bento Card 3: Pemantauan Tumbuh Kembang & Antropometri */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 shadow-xs">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  DDTK Posyandu
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                  Pemantauan Tumbuh Kembang &amp; Antropometri
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pencatatan berkala berat badan, tinggi badan, lingkar kepala, dan deteksi dini risiko stunting dengan kurva pertumbuhan standar WHO.
                </p>
              </div>
            </div>

            <Link
              href="/komunitas?tab=posyandu"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
            >
              <span>Pantau di Komunitas Posyandu</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Bento Card 4: Komunitas Warga Kita */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border shadow-xs">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                  Domisili Warga
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                  Komunitas Warga Kita
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hierarki domisili cerdas yang otomatis menghubungkan akun warga ke RT, RW, Kelurahan, hingga Kecamatan tempat tinggal secara terverifikasi.
                </p>
              </div>
            </div>

            <Link
              href="/komunitas?tab=warga_kita"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
            >
              <span>Gabung melalui Komunitas RT Anda</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Bento Card 5: Pendidikan Anak Usia Dini */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                  <School className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Satuan PAUD &amp; PKBM
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                  Pendidikan Anak Usia Dini
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Integrasi 219+ lembaga Satuan PAUD, TK, KB, SPS, TPA, dan PKBM se-Kota Tegal untuk pemerataan akses pembelajaran dini dan kesiapan bersekolah.
                </p>
              </div>
            </div>

            <Link
              href="/komunitas?tab=satuan_paud"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
            >
              <span>Eksplorasi Satuan PAUD &amp; PKBM</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Bento Card 6: Kabar Warga & Berbagi Informasi */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Forum Terbuka
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                  Kabar Warga &amp; Berbagi Informasi
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ruang berbagi informasi imunisasi posyandu, tanya jawab kesehatan anak, tips menu gizi seimbang, dan pengumuman lingkungan terkini.
                </p>
              </div>
            </div>

            <Link
              href="/kabar"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
            >
              <span>Baca Kabar &amp; Berbagi Informasi</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PETA 4 WILAYAH KECAMATAN KOTA TEGAL                     */}
      {/* ========================================================= */}
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-card-foreground">
                Jangkauan Wilayah Layanan Kota Tegal
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Menghubungkan seluruh posyandu dan warga di 4 kecamatan dan 27 kelurahan se-Kota Tegal.
            </p>
          </div>

          <Link
            href="/komunitas"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Lihat Semua Wilayah</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card Tegal Timur */}
          <Link
            href="/komunitas?kecamatan=Tegal+Timur"
            className="p-3.5 rounded-lg border border-border hover:border-primary/50 bg-background/50 hover:bg-muted/40 transition-all group shadow-xs"
          >
            <span className="text-[10px] font-bold text-primary block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-sm sm:text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
              Tegal Timur
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Mintaragen, Panggung, Slerok, Kejambon, Mangkukusuman.
            </p>
          </Link>

          {/* Card Tegal Barat */}
          <Link
            href="/komunitas?kecamatan=Tegal+Barat"
            className="p-3.5 rounded-lg border border-border hover:border-primary/50 bg-background/50 hover:bg-muted/40 transition-all group shadow-xs"
          >
            <span className="text-[10px] font-bold text-primary block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-sm sm:text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
              Tegal Barat
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Tegalsari, Kraton, Pekauman, Muarareja, Pesurungan Kidul, Kemandungan, Debong Lor.
            </p>
          </Link>

          {/* Card Tegal Selatan */}
          <Link
            href="/komunitas?kecamatan=Tegal+Selatan"
            className="p-3.5 rounded-lg border border-border hover:border-primary/50 bg-background/50 hover:bg-muted/40 transition-all group shadow-xs"
          >
            <span className="text-[10px] font-bold text-primary block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-sm sm:text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
              Tegal Selatan
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Randugunting, Bandung, Tunon, Debong Kulon, Debong Tengah, Debong Kidul, Kalinyamat Wetan, Keturen.
            </p>
          </Link>

          {/* Card Margadana */}
          <Link
            href="/komunitas?kecamatan=Margadana"
            className="p-3.5 rounded-lg border border-border hover:border-primary/50 bg-background/50 hover:bg-muted/40 transition-all group shadow-xs"
          >
            <span className="text-[10px] font-bold text-primary block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-sm sm:text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
              Margadana
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Margadana, Kalinyamat Kulon, Sumurpanggang, Kaligangsa, Cabawan, Krandon, Pesurungan Lor.
            </p>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. REKAPITULASI WARGA & JEJARING KOMUNITAS               */}
      {/* ========================================================= */}
      <WargaRekapitulasiSection
        rekap={rekapWargaKomunitas}
        isAuthenticated={!!user}
      />

      {/* ========================================================= */}
      {/* 8. FEATURED SPOTLIGHT: JARIMAS MARKET (CONDITIONAL)       */}
      {/* ========================================================= */}
      {SHOW_MARKET_FEATURE && (
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-3.5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 text-xs font-bold text-secondary">
                <ShoppingBag className="h-3.5 w-3.5 text-secondary" />
                <span>JARIMAS MARKET</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-card-foreground tracking-tight">
                Pasar UMKM, Sarana PAUD &amp; Posyandu
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Menggerakkan ekonomi masyarakat dan sarana tumbuh kembang anak untuk kemajuan warga Kota Tegal.
              </p>
            </div>

            <Link
              href="/market"
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg bg-secondary hover:brightness-95 px-4 py-1.5 text-xs font-bold text-secondary-foreground transition-all shadow-sm shrink-0 active:scale-95"
            >
              <span>Buka Seluruh Katalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Featured Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {featuredProducts.map((produk) => (
              <div
                key={produk.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 shadow-sm"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                  <Image
                    src={
                      produk.gambar_url ||
                      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={produk.nama}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-card/90 border border-border px-2 py-0.5 text-[10px] font-bold text-card-foreground shadow-xs backdrop-blur-xs">
                    <Tag className="h-3 w-3 text-primary" />
                    <span>{produk.kategori}</span>
                  </div>

                  {/* Stock Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      <CheckCircle2 className="h-3 w-3" /> Tersedia
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-card-foreground leading-snug">
                      {produk.nama}
                    </h3>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                      {produk.deskripsi}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-border gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
                        Harga
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-primary">
                        {formatRupiah(produk.harga)}
                      </span>
                    </div>

                    <Link
                      href={produk.id.startsWith("sample-") ? "/market" : `/market/${produk.id}`}
                      className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-lg bg-secondary hover:brightness-95 px-3 py-1 text-xs font-bold text-secondary-foreground transition-all active:scale-95 shadow-xs"
                    >
                      <span>Pesan</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Value Props Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-border shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold border border-primary/20">
                <Award className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-card-foreground">
                  Standar Kemenkes RI
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Terkalibrasi &amp; presisi untuk posyandu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-border shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 font-bold border border-sky-200 dark:border-sky-800">
                <Package className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-card-foreground">
                  Pengiriman Kota Tegal
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Langsung ke Posyandu &amp; Satuan PAUD
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-border shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground font-bold border border-border">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-card-foreground">
                  Transparan &amp; Amanah
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Dari warga untuk warga &amp; pembayaran aman
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 9. BOTTOM CALL TO ACTION (CTA BANNER)                     */}
      {/* ========================================================= */}
      <section className="rounded-lg bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-5 sm:p-7 shadow-sm border border-teal-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-base sm:text-xl font-black tracking-tight">
              Siap Terhubung dengan Komunitas &amp; Posyandu Anda?
            </h2>
            <p className="text-xs text-teal-100/90 leading-relaxed">
              Daftarkan diri, pantau tumbuh kembang balita Anda, dukung pengentasan stunting, dan terhubung bersama Posyandu serta komunitas warga terdekat di Kota Tegal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Link
              href="/komunitas"
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-secondary hover:brightness-95 px-5 text-xs sm:text-sm font-bold text-secondary-foreground transition-all shadow-sm active:scale-95"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {SHOW_MARKET_FEATURE && (
              <Link
                href="/market"
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 px-4 text-xs sm:text-sm font-semibold text-white transition-all backdrop-blur-xs active:scale-95"
              >
                <ShoppingBag className="h-4 w-4 text-amber-300" />
                <span>Buka Pasar UMKM</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
