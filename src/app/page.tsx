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
  ClipboardCheck,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getMarketProduk } from "@/app/actions/market";
import { getKabarFeed } from "@/app/actions/kabar";
import { getRekapitulasiWargaKomunitas } from "@/app/actions/pertemanan";
import { WargaRekapitulasiSection } from "@/components/warga/warga-rekapitulasi-section";
import { KabarCard } from "@/components/kabar/kabar-card";
import { formatRupiah, isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
import { SHOW_MARKET_FEATURE } from "@/components/layout/bottom-nav";
import { PrintButton } from "@/components/ui/print-button";
import type { MarketProduk } from "@/types/database";

// Fallback data produk katalog Jarimas Market
const FALLBACK_SHOWCASE_PRODUCTS: MarketProduk[] = [
  {
    id: "sample-stadiometer-1",
    nama: "Stadiometer Portabel Presisi Posyandu",
    deskripsi:
      "Alat ukur tinggi badan presisi standar Kemenkes RI dengan baseboard kokoh dan mistar lipat untuk kader Posyandu.",
    kategori: "Peralatan Posyandu",
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
    kategori: "Peralatan Posyandu",
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
    id: "sample-modul-edukasi-4",
    nama: "Modul Edukasi Stimulasi Motorik Anak",
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

// Daftar Layanan & Fitur Utama Akses Cepat
// Konfigurasi dinamis: setiap penambahan item baru di sini otomatis tertata menjadi 2 baris rata kiri-kanan
const QUICK_ACCESS_FEATURES = [
  {
    id: "warga-kita",
    title: "Warga Kita",
    href: "/komunitas?tab=warga_kita",
    icon: Building2,
    cardBgClass:
      "bg-gradient-to-br from-white via-teal-50/90 to-teal-100/70 dark:from-teal-950/80 dark:via-teal-900/60 dark:to-slate-900/90 border-teal-200/90 dark:border-teal-700/60 text-teal-950 dark:text-teal-100 hover:border-teal-400 hover:shadow-teal-900/20",
    iconWrapperClass: "bg-teal-500 text-white shadow-2xs",
  },
  {
    id: "posyandu",
    title: "Posyandu",
    href: "/komunitas?tab=posyandu",
    icon: HeartPulse,
    cardBgClass:
      "bg-gradient-to-br from-white via-rose-50/90 to-rose-100/70 dark:from-rose-950/80 dark:via-rose-900/60 dark:to-slate-900/90 border-rose-200/90 dark:border-rose-700/60 text-rose-950 dark:text-rose-100 hover:border-rose-400 hover:shadow-rose-900/20",
    iconWrapperClass: "bg-rose-500 text-white shadow-2xs",
  },
  {
    id: "satuan-paud",
    title: "Satuan PAUD",
    href: "/komunitas?tab=satuan_paud",
    icon: GraduationCap,
    cardBgClass:
      "bg-gradient-to-br from-white via-indigo-50/90 to-indigo-100/70 dark:from-indigo-950/80 dark:via-indigo-900/60 dark:to-slate-900/90 border-indigo-200/90 dark:border-indigo-700/60 text-indigo-950 dark:text-indigo-100 hover:border-indigo-400 hover:shadow-indigo-900/20",
    iconWrapperClass: "bg-indigo-500 text-white shadow-2xs",
  },
  {
    id: "pkbm-skb",
    title: "PKBM & SKB",
    href: "/komunitas?tab=pkbm_skb",
    icon: School,
    cardBgClass:
      "bg-gradient-to-br from-white via-purple-50/90 to-purple-100/70 dark:from-purple-950/80 dark:via-purple-900/60 dark:to-slate-900/90 border-purple-200/90 dark:border-purple-700/60 text-purple-950 dark:text-purple-100 hover:border-purple-400 hover:shadow-purple-900/20",
    iconWrapperClass: "bg-purple-500 text-white shadow-2xs",
  },
  {
    id: "anak-0-6",
    title: "Anak 0-6 Tahun",
    href: "/data-anak",
    icon: Baby,
    cardBgClass:
      "bg-gradient-to-br from-white via-sky-50/90 to-sky-100/70 dark:from-sky-950/80 dark:via-sky-900/60 dark:to-slate-900/90 border-sky-200/90 dark:border-sky-700/60 text-sky-950 dark:text-sky-100 hover:border-sky-400 hover:shadow-sky-900/20",
    iconWrapperClass: "bg-sky-500 text-white shadow-2xs",
  },
  {
    id: "data-ats",
    title: "Data ATS",
    href: "/data-ats",
    icon: BookOpen,
    cardBgClass:
      "bg-gradient-to-br from-white via-amber-50/90 to-amber-100/70 dark:from-amber-950/80 dark:via-amber-900/60 dark:to-slate-900/90 border-amber-200/90 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 hover:border-amber-400 hover:shadow-amber-900/20",
    iconWrapperClass: "bg-amber-500 text-white shadow-2xs",
  },
  {
    id: "cek-progres",
    title: "Cek Progres",
    href: "/cek-progres",
    icon: ClipboardCheck,
    cardBgClass:
      "bg-gradient-to-br from-white via-blue-50/90 to-blue-100/70 dark:from-blue-950/80 dark:via-blue-900/60 dark:to-slate-900/90 border-blue-200/90 dark:border-blue-700/60 text-blue-950 dark:text-blue-100 hover:border-blue-400 hover:shadow-blue-900/20",
    iconWrapperClass: "bg-blue-500 text-white shadow-2xs",
  },
  {
    id: "perpustakaan",
    title: "Perpustakaan",
    href: "/perpustakaan",
    icon: BookOpen,
    cardBgClass:
      "bg-gradient-to-br from-white via-emerald-50/90 to-emerald-100/70 dark:from-emerald-950/80 dark:via-emerald-900/60 dark:to-slate-900/90 border-emerald-200/90 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 hover:border-emerald-400 hover:shadow-emerald-900/20",
    iconWrapperClass: "bg-emerald-500 text-white shadow-2xs",
  },
  {
    id: "market",
    title: "Market",
    href: "/market",
    icon: ShoppingBag,
    cardBgClass:
      "bg-gradient-to-br from-white via-orange-50/90 to-orange-100/70 dark:from-orange-950/80 dark:via-orange-900/60 dark:to-slate-900/90 border-orange-200/90 dark:border-orange-700/60 text-orange-950 dark:text-orange-100 hover:border-orange-400 hover:shadow-orange-900/20",
    iconWrapperClass: "bg-orange-500 text-white shadow-2xs",
  },
  {
    id: "kabar",
    title: "Kabar Warga",
    href: "/kabar",
    icon: MessageSquare,
    cardBgClass:
      "bg-gradient-to-br from-white via-cyan-50/90 to-cyan-100/70 dark:from-cyan-950/80 dark:via-cyan-900/60 dark:to-slate-900/90 border-cyan-200/90 dark:border-cyan-700/60 text-cyan-950 dark:text-cyan-100 hover:border-cyan-400 hover:shadow-cyan-900/20",
    iconWrapperClass: "bg-cyan-500 text-white shadow-2xs",
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
      limit: 10,
    }),
    getRekapitulasiWargaKomunitas(),
  ]);

  const featuredProducts =
    dbProducts && dbProducts.length > 0
      ? dbProducts.slice(0, 4)
      : FALLBACK_SHOWCASE_PRODUCTS;

  // Ambil cukup 1 kabar unggulan untuk beranda: utamakan yang terpopuler (interaksi tinggi) atau terbaru
  const allKabar = recentKabar || [];
  const topKabarItem =
    allKabar.length > 0
      ? [...allKabar].sort((a, b) => {
        const scoreA = (a.jumlah_reaksi || 0) * 2 + (a.jumlah_komentar || 0) * 3;
        const scoreB = (b.jumlah_reaksi || 0) * 2 + (b.jumlah_komentar || 0) * 3;
        if (scoreB !== scoreA) {
          return scoreB - scoreA; // paling banyak interaksi/populer
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // terbaru
      })[0]
      : null;

  const topKabarItems = topKabarItem ? [topKabarItem] : [];
  const isKabarPopular = Boolean(
    topKabarItem && ((topKabarItem.jumlah_reaksi || 0) > 0 || (topKabarItem.jumlah_komentar || 0) > 0)
  );

  // Informasi domisili pengguna aktif jika terdaftar
  const userLocationLabel = profile?.kelurahan
    ? `Kel. ${profile.kelurahan}${profile.kecamatan ? `, ${profile.kecamatan}` : ""}`
    : "Kota Tegal";

  // Pisahkan fitur menjadi 2 baris rata kiri-kanan secara otomatis
  const quickAccessMid = Math.ceil(QUICK_ACCESS_FEATURES.length / 2);
  const quickAccessRows = [
    QUICK_ACCESS_FEATURES.slice(0, quickAccessMid),
    QUICK_ACCESS_FEATURES.slice(quickAccessMid),
  ];

  return (
    <div className="flex flex-col flex-1 px-3.5 sm:px-6 md:px-8 py-3 sm:py-5 gap-5 sm:gap-7 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. TOP SUPER APP BAR (Brand, Domisili, & Profile)        */}
      {/* ========================================================= */}
      <header className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black shadow-sm shrink-0 overflow-hidden">
            <Image
              src="/logo.svg"
              alt="Logo JARIMAS.ID"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
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
                {user ? userLocationLabel : "Kolaborasi Lintas Warga"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons: Cetak, Notifikasi & Profil */}
        <div className="flex items-center gap-2 shrink-0">
          <PrintButton variant="outline" size="sm" hideTextOnMobile={true} />
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
                className="inline-flex min-h-[36px] sm:min-h-[40px] items-center justify-center rounded-lg border border-border bg-card hover:bg-muted px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all active:scale-95 shadow-xs"
              >
                <span>Masuk</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[36px] sm:min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-secondary hover:brightness-95 px-3 sm:px-4 py-1.5 text-xs font-bold text-secondary-foreground transition-all active:scale-95 shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Registrasi</span>
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
              Kolaborasi Lintas Warga untuk Tumbuh Kembang &amp; Pendidikan Anak{" "}
              <span className="text-amber-300">Kota Tegal</span>
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
              Akses cepat data riil pendataan anak usia dini (0-6 tahun), pemetaan Anak Tidak Sekolah (ATS), dan jejaring komunitas RT/RW se-Kota Tegal.
            </p>
          </div>

          {/* Akses Cepat Layanan & Fitur Utama (2 Baris Rata Kiri-Kanan) */}
          <div className="pt-2 sm:pt-2.5 border-t border-white/15 space-y-2">
            <div className="flex items-center justify-between max-w-3xl sm:max-w-4xl mx-auto w-full px-0.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-teal-200">
                Layanan &amp; Fitur Utama
              </span>
              <span className="text-[11px] font-semibold text-amber-300">
                Akses Cepat
              </span>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2 max-w-3xl sm:max-w-4xl mx-auto w-full">
              {quickAccessRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid gap-1.5 sm:gap-2.5 w-full"
                  style={{
                    gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl border shadow-xs hover:shadow-md transition-all text-center group active:scale-95 min-h-[62px] sm:min-h-[68px] ${item.cardBgClass}`}
                      >
                        <div
                          className={`flex h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-lg ${item.iconWrapperClass} group-hover:scale-105 transition-transform shrink-0`}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold leading-tight tracking-tight line-clamp-2">
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
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
                  {isKabarPopular ? "Kabar Terpopuler" : "Kabar Terbaru"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 text-[10px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Sorotan Utama
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
                  Anak 0-6 Tahun
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

          {/* Bento Card 3: Layanan & Komunitas Posyandu */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-rose-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800/60 shadow-xs">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Layanan Posyandu
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                  Komunitas Posyandu
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pemantauan berkala tumbuh kembang, penimbangan berat badan, imunisasi, dan nutrisi gizi balita terpadu di 209 Posyandu se-Kota Tegal.
                </p>
              </div>
            </div>

            <Link
              href="/komunitas?tab=posyandu"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline pt-1"
            >
              <span>Jelajahi Komunitas Posyandu</span>
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
