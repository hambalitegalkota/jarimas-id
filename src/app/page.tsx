import Link from "next/link";
import Image from "next/image";
import {
  HeartPulse,
  GraduationCap,
  Building2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getMarketProduk } from "@/app/actions/market";
import { getKabarFeed } from "@/app/actions/kabar";
import { getRekapitulasiWargaKomunitas } from "@/app/actions/pertemanan";
import { WargaRekapitulasiSection } from "@/components/warga/warga-rekapitulasi-section";
import { formatRupiah } from "@/lib/utils";
import { SHOW_MARKET_FEATURE } from "@/components/layout/bottom-nav";
import type { MarketProduk } from "@/types/database";

// Fallback data produk resmi Jarimas Market
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

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Ambil session user aktif
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("nama_lengkap, is_super_admin")
      .eq("id", user.id)
      .maybeSingle();
    profile = userProfile;
  }

  // 2. Ambil data produk resmi dari Jarimas Market
  const { data: dbProducts } = await getMarketProduk();
  const featuredProducts =
    dbProducts && dbProducts.length > 0
      ? dbProducts.slice(0, 4)
      : FALLBACK_SHOWCASE_PRODUCTS;

  // 3. Ambil 2 kabar terbaru sebagai preview feed
  const { data: recentKabar } = await getKabarFeed({
    sorting: "terbaru",
    filterVisibilitas: "semua",
  });
  const topKabarItems = (recentKabar || []).slice(0, 2);

  // 4. Ambil ringkasan rekapitulasi partisipasi warga & komunitas
  const rekapWargaKomunitas = await getRekapitulasiWargaKomunitas();


  return (
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 gap-6 sm:gap-10 max-w-5xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. TOP BRAND HEADER / QUICK BAR                          */}
      {/* ========================================================= */}
      <header className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-900 text-white font-extrabold shadow-md shadow-emerald-700/20 border-2 border-white dark:border-slate-800 shrink-0">
            <Sparkles className="h-6 w-6 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                JARIMAS<span className="text-emerald-600 dark:text-emerald-400">-ID</span>
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
                KOTA TEGAL
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Platform Kolaborasi Warga &amp; Posyandu
            </p>
          </div>
        </div>

        {/* Right Auth / Profile Button */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <Link
              href="/profil"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer active:scale-98 shadow-2xs"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="hidden sm:inline">
                {profile?.nama_lengkap || "Profil Saya"}
              </span>
              <span className="sm:hidden">Profil</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white transition-all cursor-pointer active:scale-98 shadow-xs"
            >
              <span>Masuk</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HORIZONTAL QUICK-ACTION STORY CHIPS (RATA KIRI KANAN) */}
      {/* ========================================================= */}
      <section className="flex items-center justify-between gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none w-full">
        <Link
          href="/komunitas?tab=posyandu"
          className="flex-1 min-w-max inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500 text-emerald-950 dark:text-emerald-200 text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs shrink-0 sm:shrink active:scale-95 text-center"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shrink-0">
            <HeartPulse className="h-3.5 w-3.5" />
          </div>
          <span>Posyandu &amp; DDTK</span>
        </Link>

        {SHOW_MARKET_FEATURE && (
          <Link
            href="/market"
            className="flex-1 min-w-max inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800/80 hover:border-blue-500 text-blue-950 dark:text-blue-200 text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs shrink-0 sm:shrink active:scale-95 text-center"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shrink-0">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
            <span>Jarimas Market</span>

          </Link>
        )}

        <Link
          href="/komunitas?tab=warga_kita"
          className="flex-1 min-w-max inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border-2 border-sky-200 dark:border-sky-800/80 hover:border-sky-500 text-sky-950 dark:text-sky-200 text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs shrink-0 sm:shrink active:scale-95 text-center"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-700 text-white font-bold shrink-0">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span>Warga RT / RW</span>
        </Link>

        <Link
          href="/kabar"
          className="flex-1 min-w-max inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500 text-emerald-950 dark:text-emerald-200 text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs shrink-0 sm:shrink active:scale-95 text-center"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold shrink-0">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <span>Kabar Warga</span>
        </Link>

        <Link
          href="/kabar?tab=warga"
          className="flex-1 min-w-max inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 border-2 border-teal-200 dark:border-teal-800/80 hover:border-teal-500 text-teal-950 dark:text-teal-200 text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs shrink-0 sm:shrink active:scale-95 text-center"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-700 text-white font-bold shrink-0">
            <HeartHandshake className="h-3.5 w-3.5" />
          </div>
          <span>Warga &amp; Teman</span>
        </Link>

        <Link
          href="/komunitas?tab=satuan_paud"
          className="flex-1 min-w-max inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-500 text-indigo-950 dark:text-indigo-200 text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs shrink-0 sm:shrink active:scale-95 text-center"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-700 text-white font-bold shrink-0">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <span>PAUD &amp; ATS</span>
        </Link>
      </section>

      {/* ========================================================= */}
      {/* 3. HERO SECTION - UNIFIED ROYAL NAVY & EMERALD MINT       */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl shadow-slate-950/30">
        {/* Background Decorative Gradient Orbs */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Badge Inovasi Kota Tegal */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md text-emerald-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            <span>INOVASI KOTA TEGAL • GENERASI SEHAT, BEBAS STUNTING &amp; ATS</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-black tracking-tight leading-snug">
              Wujudkan Masa Depan Anak Kota Tegal {" "}
              <span className="text-emerald-400 underline decoration-emerald-500 decoration-wavy decoration-2">
                Sehat &amp; Berdaya
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Ekosistem digital terpadu interkoneksi pemantauan tumbuh kembang anak (DDTK Posyandu), penanganan Anak Tidak Sekolah (ATS), serta kolaborasi antar warga RT, RW, Kelurahan, Kecamatan se Kota Tegal.
            </p>
          </div>

          {/* Hero Action Buttons - Harmonious Unified Hierarchy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/komunitas"
              className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl bg-white hover:bg-slate-100 px-6 text-sm font-extrabold text-slate-950 transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              <Users className="h-4 w-4 text-emerald-700" />
              <span>Jelajahi Komunitas Warga</span>
              <ArrowRight className="h-4 w-4 text-emerald-700" />
            </Link>

            {SHOW_MARKET_FEATURE ? (
              <Link
                href="/market"
                className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 text-sm font-extrabold text-white transition-all shadow-lg active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-white" />
                <span>Buka Jarimas Market</span>

              </Link>
            ) : (
              <Link
                href="/kabar"
                className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 text-sm font-extrabold text-white transition-all shadow-lg active:scale-98 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" />
                <span>Kabar &amp; Edukasi Warga</span>
              </Link>
            )}
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/15">
            <div className="rounded-xl bg-white/5 backdrop-blur-xs p-3 border border-white/10">
              <span className="text-lg sm:text-xl font-black text-emerald-400 block font-mono">
                4 Wilayah
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Kecamatan Tegal
              </span>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-xs p-3 border border-white/10">
              <span className="text-lg sm:text-xl font-black text-blue-300 block font-mono">
                27 Kelurahan
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Terhubung Digital
              </span>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-xs p-3 border border-white/10">
              <span className="text-lg sm:text-xl font-black text-emerald-400 block font-mono">
                100+ Posyandu
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Pemantauan DDTK
              </span>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-xs p-3 border border-white/10">
              <span className="text-lg sm:text-xl font-black text-teal-300 block font-mono">
                Zero Stunting
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Target Prioritas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. 6 PILAR UTAMA EKOSISTEM JARIMAS-ID (BENTO GRID)        */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            FITUR UTAMA
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Layanan Unggulan Warga &amp; Komunitas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Satu genggaman untuk mewujudkan perlindungan, gizi, dan pendidikan anak se-Kota Tegal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bento Card 1: Pendataan Anak Usia Dini (0 -6 Tahun) */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs hover:border-sky-500/50 transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white font-bold shadow-md shadow-sky-500/20">
                  <Baby className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  Data Balita &amp; PAUD
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pendataan Anak Usia Dini (0 -6 Tahun)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pencatatan profil balita dan anak usia dini terintegrasi berbasis domisili dan KK untuk akses layanan Posyandu, pemantauan gizi, dan PAUD.
                </p>
              </div>
            </div>

            <Link
              href="/data-anak"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 hover:text-sky-800 underline pt-2"
            >
              <span>Pantau Pendataan Anak Usia Dini</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bento Card 2: Pendataan Anak Tidak Sekolah (ATS) */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs hover:border-blue-500/50 transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Pendidikan Anak
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pendataan Anak Tidak Sekolah (ATS)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Validasi data anak putus sekolah atau belum sekolah berjenjang (RT, RW, Kelurahan) untuk intervensi kembali bersekolah atau program kesetaraan.
                </p>
              </div>
            </div>

            <Link
              href="/data-ats"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 underline pt-2"
            >
              <span>Pantau Hasil Pendataan ATS</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bento Card 3: Pemantauan Tumbuh Kembang & Antropometri */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs hover:border-emerald-500/50 transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  DDTK Posyandu
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pemantauan Tumbuh Kembang &amp; Antropometri
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pencatatan berkala berat badan, tinggi badan, lingkar kepala, dan deteksi dini risiko stunting dengan kurva pertumbuhan standar WHO.
                </p>
              </div>
            </div>

            <Link
              href="/komunitas?tab=posyandu"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 underline pt-2"
            >
              <span>Pantau di Komunitas Posyandu</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bento Card 4: Komunitas Warga Kita */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs hover:border-slate-400 transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 dark:bg-slate-700 text-white font-bold shadow-md shadow-slate-700/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  Domisili Warga
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Komunitas Warga Kita
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hierarki domisili cerdas yang otomatis menghubungkan akun warga ke RT, RW, Kelurahan, hingga Kecamatan tempat tinggal secara terverifikasi.
                </p>
              </div>
            </div>

            <Link
              href="/komunitas?tab=warga_kita"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 underline pt-2"
            >
              <span>Gabung dengan RT &amp; RW Anda</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bento Card 5: Pendidikan Anak Usia Dini */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs hover:border-amber-500/50 transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20">
                  <School className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Satuan PAUD &amp; PKBM
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pendidikan Anak Usi Dini
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Integrasi 219+ lembaga Satuan PAUD, TK, KB, SPS, TPA, dan PKBM se-Kota Tegal untuk pemerataan akses pembelajaran dini dan kesiapan bersekolah.
                </p>
              </div>
            </div>

            <Link
              href="/komunitas?tab=satuan_paud"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 underline pt-2"
            >
              <span>Eksplorasi Satuan PAUD &amp; PKBM</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bento Card 6: Kabar Warga & Berbagi Informasi */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs hover:border-emerald-500/50 transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Forum Terbuka
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Kabar Warga &amp; Berbagi Informasi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ruang berbagi informasi imunisasi posyandu, tanya jawab kesehatan anak, tips menu gizi seimbang, dan pengumuman lingkungan terkini.
                </p>
              </div>
            </div>

            <Link
              href="/kabar"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 underline pt-2"
            >
              <span>Baca Kabar &amp; Berbagi Informasi</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. PETA 4 WILAYAH KECAMATAN KOTA TEGAL                     */}
      {/* ========================================================= */}
      <section className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Jangkauan Wilayah Layanan Kota Tegal
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Cakup seluruh posyandu dan warga di 4 kecamatan dan 27 kelurahan Kota Tegal.
            </p>
          </div>

          <Link
            href="/komunitas"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Semua Wilayah</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card Tegal Timur */}
          <Link
            href="/komunitas?kecamatan=Tegal+Timur"
            className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 transition-all cursor-pointer group shadow-2xs"
          >
            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 transition-colors">
              Tegal Timur
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Mintaragen, Panggung, Slerok, Kejambon, Mangkukusuman.
            </p>
          </Link>

          {/* Card Tegal Barat */}
          <Link
            href="/komunitas?kecamatan=Tegal+Barat"
            className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 transition-all cursor-pointer group shadow-2xs"
          >
            <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 transition-colors">
              Tegal Barat
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tegalsari, Kraton, Pekauman, Muarareja, Kemandungan, dll.
            </p>
          </Link>

          {/* Card Tegal Selatan */}
          <Link
            href="/komunitas?kecamatan=Tegal+Selatan"
            className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/40 transition-all cursor-pointer group shadow-2xs"
          >
            <span className="text-[10px] font-black text-sky-700 dark:text-sky-400 block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 transition-colors">
              Tegal Selatan
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Randugunting, Bandung, Tunon, Debong Kulon, Kalinyamat Wetan, dll.
            </p>
          </Link>

          {/* Card Margadana */}
          <Link
            href="/komunitas?kecamatan=Margadana"
            className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 transition-all cursor-pointer group shadow-2xs"
          >
            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 block tracking-wider uppercase">
              KECAMATAN
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 transition-colors">
              Margadana
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Margadana, Kalinyamat Kulon, Sumurpanggang, Kaligangsa, Cabawan, dll.
            </p>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. REKAPITULASI WARGA & JEJARING KOMUNITAS               */}
      {/* ========================================================= */}
      <WargaRekapitulasiSection
        rekap={rekapWargaKomunitas}
        isAuthenticated={!!user}
      />

      {/* ========================================================= */}
      {/* 7. FEATURED SPOTLIGHT: JARIMAS MARKET (CONDITIONAL)       */}
      {/* ========================================================= */}
      {SHOW_MARKET_FEATURE && (
        <section className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-7 space-y-6 shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
                <span>JARIMAS MARKET</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Pasar UMKM, Sarana PAUD dan POSYANDU serta kebutuhan masyarakat lainnya
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Menggerakan ekonomi masyarakat, mengembangkan inovasi untuk kemajuan dan kesejahteraan warga Kota Tegal
              </p>
            </div>

            <Link
              href="/market"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white transition-all shadow-sm shrink-0 cursor-pointer active:scale-98"
            >
              <span>Buka Seluruh Katalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Featured Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((produk) => (
              <div
                key={produk.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:border-emerald-500 hover:shadow-md"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-xs backdrop-blur-xs">
                    <Tag className="h-3 w-3 text-emerald-600" />
                    <span>{produk.kategori}</span>
                  </div>

                  {/* Stock Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      <CheckCircle2 className="h-3 w-3" /> Tersedia
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {produk.nama}
                    </h3>
                    <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {produk.deskripsi}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Harga Resmi
                      </span>
                      <span className="text-sm font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                        {formatRupiah(produk.harga)}
                      </span>
                    </div>

                    <Link
                      href={produk.id.startsWith("sample-") ? "/market" : `/market/${produk.id}`}
                      className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-extrabold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <span>Pesan</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Value Props Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Standar Kemenkes RI
                </h4>
                <p className="text-[11px] text-slate-500">
                  Terkalibrasi &amp; presisi untuk posyandu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Pengiriman Kota Tegal
                </h4>
                <p className="text-[11px] text-slate-500">
                  Langsung ke Posyandu &amp; Satuan PAUD
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Transparan &amp; Resmi
                </h4>
                <p className="text-[11px] text-slate-500">
                  Dukungan Pemkot &amp; verifikasi QRIS
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 7. KABAR WARGA FEED PREVIEW                               */}
      {/* ========================================================= */}
      {topKabarItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Kabar &amp; Pengumuman Terkini
              </h2>
            </div>
            <Link
              href="/kabar"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>Lihat Semua Kabar</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topKabarItems.map((item) => (
              <Link
                key={item.id}
                href="/kabar"
                className="flex flex-col justify-between p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 transition-all shadow-2xs group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                      {item.komunitas?.nama || "Kabar Kota Tegal"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 transition-colors">
                    {item.konten}
                  </h3>
                </div>

                <div className="pt-3 mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 font-medium">
                  <span>Oleh {item.profiles?.nama_lengkap || "Warga"}</span>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                    Baca <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 8. BOTTOM CALL TO ACTION (CTA BANNER)                     */}
      {/* ========================================================= */}
      <section className="rounded-3xl border-2 border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 text-center sm:text-left shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Siap Terhubung dengan Posyandu, PAUD, RT, RW, Kelurahan &amp; Kecamatan Anda?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Daftarkan diri dan pantau tumbuh kembang balita Anda, dukung gerakan pengentasan stunting, dan terhubung bersama Posyandu, PAUD serta komunitas warga terdekat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/komunitas"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-5 text-xs sm:text-sm font-extrabold text-slate-950 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="h-4 w-4 text-emerald-800" />
            </Link>

            {SHOW_MARKET_FEATURE ? (
              <Link
                href="/market"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 text-xs sm:text-sm font-extrabold text-white transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-white" />
                <span>Jarimas Market</span>
              </Link>
            ) : (
              <Link
                href="/kabar"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 text-xs sm:text-sm font-extrabold text-white transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" />
                <span>Lihat Kabar Warga</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
