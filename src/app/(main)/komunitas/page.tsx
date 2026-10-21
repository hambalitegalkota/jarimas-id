import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  HeartPulse,
  GraduationCap,
  BookOpen,
  MapPin,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { getKomunitasList } from "@/app/actions/komunitas";
import { KomunitasFilter } from "@/components/komunitas/komunitas-filter";
import { KomunitasCard } from "@/components/komunitas/komunitas-card";
import { KomunitasRekapSection } from "@/components/komunitas/komunitas-rekap-section";
import type { JenisKomunitas } from "@/types/database";

interface KomunitasPageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    kecamatan?: string;
    kelurahan?: string;
    rw?: string;
    rt?: string;
    bentuk?: string;
    page?: string;
  }>;
}

export default async function KomunitasPage({
  searchParams,
}: KomunitasPageProps) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab ? (resolvedParams.tab as JenisKomunitas) : null;
  const currentSearch = resolvedParams.search?.trim() || "";
  const currentKecamatan = resolvedParams.kecamatan || "semua";
  const currentKelurahan = resolvedParams.kelurahan || "semua";
  const isEducationalTab = currentTab === "satuan_paud" || currentTab === "pkbm_skb";
  const currentBentuk = isEducationalTab ? resolvedParams.bentuk || "semua" : "semua";
  const currentRw = currentTab === "warga_kita" ? resolvedParams.rw || "semua" : "semua";
  const currentRt = currentTab === "warga_kita" ? resolvedParams.rt || "semua" : "semua";
  const currentPage = Math.max(1, Number(resolvedParams.page) || 1);
  const pageSize = 20;

  // Cek apakah filter wilayah atau pencarian telah dipilih pengguna
  const hasActiveFilter = Boolean(
    currentSearch ||
    currentKecamatan !== "semua" ||
    currentKelurahan !== "semua" ||
    (isEducationalTab && currentBentuk !== "semua") ||
    (currentTab === "warga_kita" && (currentRw !== "semua" || currentRt !== "semua"))
  );

  let listKomunitas: any[] = [];
  let currentUserId: string | null = null;
  let pagination = {
    page: 1,
    limit: pageSize,
    totalCount: 0,
    totalPages: 0,
    hasMore: false,
  };

  // Hanya ambil data komunitas dari database jika filter atau pencarian telah dipilih
  if (hasActiveFilter && currentTab) {
    const komunitasResult = await getKomunitasList({
      jenis: currentTab,
      kecamatan: currentKecamatan,
      kelurahan: currentKelurahan,
      rw: currentRw,
      rt: currentRt,
      bentuk: currentBentuk,
      searchQuery: currentSearch,
      page: currentPage,
      limit: pageSize,
    });
    listKomunitas = komunitasResult.data;
    currentUserId = komunitasResult.currentUserId || null;
    pagination = komunitasResult.pagination;
  }

  // Helper untuk membuat URL dengan parameter yang konsisten
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (currentTab) params.set("tab", currentTab);
    if (currentSearch) params.set("search", currentSearch);
    if (currentBentuk !== "semua" && (currentTab === "satuan_paud" || currentTab === "pkbm_skb")) {
      params.set("bentuk", currentBentuk);
    }
    if (currentKecamatan !== "semua") params.set("kecamatan", currentKecamatan);
    if (currentKelurahan !== "semua") params.set("kelurahan", currentKelurahan);
    if (currentTab === "warga_kita") {
      if (currentRw !== "semua") params.set("rw", currentRw);
      if (currentRt !== "semua") params.set("rt", currentRt);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/komunitas${qs ? `?${qs}` : ""}`;
  };

  const createTabUrl = (targetTab: string) => {
    const params = new URLSearchParams();
    params.set("tab", targetTab);
    if (currentSearch) params.set("search", currentSearch);
    if ((targetTab === "satuan_paud" || targetTab === "pkbm_skb") && currentBentuk !== "semua") {
      params.set("bentuk", currentBentuk);
    }
    if (currentKecamatan !== "semua") params.set("kecamatan", currentKecamatan);
    if (currentKelurahan !== "semua") params.set("kelurahan", currentKelurahan);
    if (targetTab === "warga_kita") {
      if (currentRw !== "semua") params.set("rw", currentRw);
      if (currentRt !== "semua") params.set("rt", currentRt);
    }
    const qs = params.toString();
    return `/komunitas?${qs}`;
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.totalCount);

  // Definisi metadata keempat kategori accordion
  const accordionCategories = [
    {
      id: "posyandu" as JenisKomunitas,
      title: "Posyandu",
      subtitle: "Layanan Pemantauan Tumbuh Kembang, Gizi & Imunisasi Balita",
      badgeText: "209 Posyandu",
      icon: HeartPulse,
      activeColorBg: "bg-primary text-primary-foreground",
      activeBorder: "border-primary",
      badgeColor: "bg-white/20 text-white border-white/30",
      hoverBorder: "hover:border-primary/40",
      hoverBg: "hover:bg-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      id: "warga_kita" as JenisKomunitas,
      title: "Komunitas Warga Kita",
      subtitle: "Struktur Komunitas 5 Tingkat: RT, RW, Kelurahan, Kecamatan & Kota Tegal",
      badgeText: "167 RW • 1.712 RT",
      icon: Users,
      activeColorBg: "bg-sky-600 text-white",
      activeBorder: "border-sky-500",
      badgeColor: "bg-white/20 text-white border-white/30",
      hoverBorder: "hover:border-sky-500/40",
      hoverBg: "hover:bg-sky-500/5",
      iconColor: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-500/10",
    },
    {
      id: "satuan_paud" as JenisKomunitas,
      title: "Komunitas PAUD",
      subtitle: "Lembaga TK, KB, TPA, SPS, RA, PKBM Star of Tomorrow & SKB Mitra Kota Tegal",
      badgeText: "208 Satuan PAUD",
      icon: GraduationCap,
      activeColorBg: "bg-teal-700 text-white",
      activeBorder: "border-teal-600",
      badgeColor: "bg-white/20 text-white border-white/30",
      hoverBorder: "hover:border-teal-500/40",
      hoverBg: "hover:bg-teal-500/5",
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-500/10",
    },
    {
      id: "pkbm_skb" as JenisKomunitas,
      title: "PKBM dan SKB",
      subtitle: "Pusat Kegiatan Belajar Masyarakat (Paket A, B, C) & Sanggar Kegiatan Belajar Kota Tegal",
      badgeText: "12 PKBM • 1 SKB",
      icon: BookOpen,
      activeColorBg: "bg-secondary text-secondary-foreground",
      activeBorder: "border-secondary",
      badgeColor: "bg-black/10 dark:bg-white/20 text-secondary-foreground border-secondary-foreground/20",
      hoverBorder: "hover:border-secondary/40",
      hoverBg: "hover:bg-secondary/5",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-secondary/15",
    },
  ];

  // Urutkan kategori: Kartu yang terbuka posisinya otomatis berada di paling atas
  const sortedCategories = [
    ...(currentTab ? accordionCategories.filter((c) => c.id === currentTab) : []),
    ...accordionCategories.filter((c) => c.id !== currentTab),
  ];

  const categoryTotalLabels: Record<string, string | number> = {
    posyandu: 209,
    warga_kita: "167 RW • 1.712 RT",
    satuan_paud: 208,
    pkbm_skb: 13,
  };
  const totalDisplay = hasActiveFilter
    ? pagination.totalCount
    : currentTab && categoryTotalLabels[currentTab]
    ? categoryTotalLabels[currentTab]
    : "460+";

  // Render konten di dalam Accordion yang aktif
  const renderActiveAccordionContent = (activeCatId: JenisKomunitas) => {
    return (
      <div className="space-y-6 pt-2">
        {/* 1. REKAP JUMLAH KOMUNITAS PER KECAMATAN & KELURAHAN BESERTA BENTUK SATUAN */}
        <KomunitasRekapSection
          currentTab={activeCatId}
          currentKecamatan={currentKecamatan}
          currentKelurahan={currentKelurahan}
          currentBentuk={currentBentuk}
        />

        {/* 2. FILTER DROPDOWN & SEARCH WILAYAH */}
        <Suspense fallback={<div className="min-h-[100px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800" />}>
          <KomunitasFilter
            currentTab={activeCatId}
            currentSearch={currentSearch}
            currentKecamatan={currentKecamatan}
            currentKelurahan={currentKelurahan}
            currentRw={currentRw}
            currentRt={currentRt}
            currentBentuk={currentBentuk}
          />
        </Suspense>

        {/* 3. DAFTAR KOMUNITAS STREAM (SEMBUNYIKAN SECARA DEFAULT, TAMPILKAN SETELAH FILTER DIPILIH) */}
        {!hasActiveFilter ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-6 sm:p-10 text-center space-y-3 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Filter className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-foreground">
                Pilih Filter Wilayah Terlebih Dahulu
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daftar komunitas disembunyikan secara default. Silakan pilih Kecamatan, Kelurahan, {activeCatId === "satuan_paud" || activeCatId === "pkbm_skb" ? "Bentuk Lembaga, " : activeCatId === "warga_kita" ? "RW/RT, " : ""}atau gunakan kolom pencarian di atas untuk menampilkan nama-nama komunitas.
              </p>
            </div>
          </div>
        ) : (
          <main className="space-y-3.5 pb-4">
            {/* Subheader Hasil & Paginasi Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-foreground">
                  Daftar Komunitas
                </span>
                {currentSearch && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary border border-primary/20">
                    Pencarian: &ldquo;{currentSearch}&rdquo;
                  </span>
                )}
              </div>
              <span className="font-mono text-muted-foreground font-medium text-xs">
                {pagination.totalCount > 0
                  ? `${startIndex}–${endIndex} dari ${pagination.totalCount} data`
                  : "0 data"}
              </span>
            </div>

            {listKomunitas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 sm:p-10 text-center space-y-3 shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Search className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-foreground">
                    Tidak Ada Komunitas yang Cocok
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentSearch
                      ? `Tidak ditemukan hasil untuk "${currentSearch}". Coba kata kunci lain atau reset filter.`
                      : "Ubah pilihan kecamatan, kelurahan, atau RT/RW untuk melihat data lainnya."}
                  </p>
                </div>
                {(currentSearch || currentKecamatan !== "semua" || currentKelurahan !== "semua") && (
                  <Link
                    href={`/komunitas?tab=${currentTab}`}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-accent transition-colors"
                  >
                    Reset Semua Filter
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {listKomunitas.map((kom) => (
                  <KomunitasCard
                    key={kom.id}
                    komunitas={kom}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}

            {/* Navigasi Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-semibold">
                <div>
                  {pagination.page > 1 ? (
                    <Link
                      href={createPageUrl(pagination.page - 1)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-foreground hover:bg-accent transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Sebelumnya</span>
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3.5 text-muted-foreground/50 cursor-not-allowed">
                      <ChevronLeft className="h-4 w-4" />
                      <span>Sebelumnya</span>
                    </span>
                  )}
                </div>

                <span className="text-muted-foreground font-mono text-xs">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </span>

                <div>
                  {pagination.hasMore ? (
                    <Link
                      href={createPageUrl(pagination.page + 1)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-foreground hover:bg-accent transition-colors"
                    >
                      <span>Berikutnya</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3.5 text-muted-foreground/50 cursor-not-allowed">
                      <span>Berikutnya</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. HEADER BANNER EKSPLORASI KOMUNITAS                     */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 text-white p-5 sm:p-6 shadow-sm space-y-3.5 border border-teal-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-bold text-teal-100">
                KOMUNITAS JARIMAS
              </span>
              <span className="text-[11px] font-bold text-teal-200 font-mono">
                KOTA TEGAL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Eksplorasi Komunitas Kota Tegal
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-lg leading-relaxed">
              Jelajahi 209 Posyandu, 208 Satuan PAUD, 13 PKBM &amp; SKB, dan Komunitas Warga 4 Tingkat se-Kota Tegal.
            </p>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-lg bg-white/15 border border-white/20 backdrop-blur-xs text-center">
                <span className="text-base sm:text-lg font-black block font-mono text-amber-300">
                  {totalDisplay}
                </span>
                <span className="text-[10px] text-teal-100 uppercase font-bold">
                  {hasActiveFilter ? "Ditemukan" : "Komunitas"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. COLLAPSIBLE / ACCORDION KATEGORI KOMUNITAS            */}
      {/* ========================================================= */}
      <div className="space-y-3 transition-all duration-300 ease-in-out">
        {sortedCategories.map((cat) => {
          const isOpen = currentTab === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              className={`rounded-lg border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? `border-primary/40 bg-card p-1.5 sm:p-2 shadow-sm`
                  : `border-border bg-card shadow-xs hover:border-primary/30 ${cat.hoverBorder}`
              }`}
            >
              {/* Accordion Header / Trigger */}
              {isOpen ? (
                <Link
                  href="/komunitas"
                  title="Klik untuk menutup bagian ini"
                  className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-lg text-white ${cat.activeColorBg} shadow-xs cursor-pointer transition-all hover:opacity-95 group`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">
                          {cat.title}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.badgeColor}`}
                        >
                          {cat.badgeText}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/20 text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Aktif Terbuka
                        </span>
                      </div>
                      <p className="text-xs text-white/90 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                      Tutup
                    </span>
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                      <ChevronDown className="h-4 w-4 transform rotate-180 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href={createTabUrl(cat.id)}
                  className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 text-card-foreground transition-all cursor-pointer group ${cat.hoverBg}`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {cat.title}
                        </h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Buka
                    </span>
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-muted group-hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors">
                      <ChevronDown className="h-4 w-4 transform rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Accordion Body Content */}
              {isOpen && (
                <div className="p-2 sm:p-3 animate-in fade-in-50 duration-300">
                  {renderActiveAccordionContent(cat.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
