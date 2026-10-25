import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  GraduationCap,
  BookOpen,
  Filter,
} from "lucide-react";
import { getKomunitasList } from "@/app/actions/komunitas";
import { KomunitasFilter } from "@/components/komunitas/komunitas-filter";
import { KomunitasCard } from "@/components/komunitas/komunitas-card";
import { PrintButton } from "@/components/ui/print-button";
import { cn } from "@/lib/utils";
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
  // Default tab adalah "warga_kita" sehingga Warga Kita selalu terbuka secara default
  const currentTab = (resolvedParams.tab as JenisKomunitas) || "warga_kita";
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

  // Helper untuk membuat URL pagination dengan parameter yang konsisten
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

  // Helper untuk navigasi tab satu baris (bersih & fokus per tab)
  const createTabUrl = (targetTab: string) => {
    const params = new URLSearchParams();
    params.set("tab", targetTab);
    return `/komunitas?${params.toString()}`;
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.totalCount);

  // Definisi metadata baris tab dalam urutan yang diminta pengguna:
  // 1. Warga Kita (terbuka secara default)
  // 2. Posyandu
  // 3. PAUD
  // 4. PKBM & SKB
  const tabCategories = [
    {
      id: "warga_kita" as JenisKomunitas,
      title: "Warga Kita",
      badgeText: "167 RW • 1.712 RT",
      icon: Users,
      activeClass: "bg-sky-600 text-white border-sky-600 shadow-sm",
      badgeActive: "bg-white/20 text-white border-white/30",
      badgeInactive: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
      iconInactive: "text-sky-600 dark:text-sky-400",
    },
    {
      id: "posyandu" as JenisKomunitas,
      title: "Posyandu",
      badgeText: "209 Posyandu",
      icon: HeartPulse,
      activeClass: "bg-teal-700 text-white border-teal-700 shadow-sm",
      badgeActive: "bg-white/20 text-white border-white/30",
      badgeInactive: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
      iconInactive: "text-teal-600 dark:text-teal-400",
    },
    {
      id: "satuan_paud" as JenisKomunitas,
      title: "PAUD",
      badgeText: "208 Satuan PAUD",
      icon: GraduationCap,
      activeClass: "bg-emerald-700 text-white border-emerald-700 shadow-sm",
      badgeActive: "bg-white/20 text-white border-white/30",
      badgeInactive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      iconInactive: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "pkbm_skb" as JenisKomunitas,
      title: "PKBM & SKB",
      badgeText: "12 PKBM • 1 SKB",
      icon: BookOpen,
      activeClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
      badgeActive: "bg-white/20 text-white border-white/30",
      badgeInactive: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      iconInactive: "text-amber-600 dark:text-amber-400",
    },
  ];

  const categoryTotalLabels: Record<string, string | number> = {
    warga_kita: "167 RW • 1.712 RT",
    posyandu: 209,
    satuan_paud: 208,
    pkbm_skb: 13,
  };
  const totalDisplay = hasActiveFilter
    ? pagination.totalCount
    : currentTab && categoryTotalLabels[currentTab]
    ? categoryTotalLabels[currentTab]
    : "460+";

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

          <div className="shrink-0 flex items-center gap-2">
            <PrintButton variant="hero" size="sm" hideTextOnMobile={true} />
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
      </section>

      {/* ========================================================= */}
      {/* 2. SATU BARIS TAB NAVIGASI KOMUNITAS                      */}
      {/* Urutan: Warga Kita (default terbuka), Posyandu, PAUD, PKBM & SKB */}
      {/* ========================================================= */}
      <nav
        aria-label="Kategori Komunitas"
        className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 p-1.5 bg-muted/60 dark:bg-muted/30 rounded-xl border border-border"
      >
        {tabCategories.map((cat) => {
          const isActive = currentTab === cat.id;
          const Icon = cat.icon;

          return (
            <Link
              key={cat.id}
              href={createTabUrl(cat.id)}
              className={cn(
                "flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg text-left transition-all cursor-pointer border relative overflow-hidden group",
                isActive
                  ? cat.activeClass
                  : "bg-card text-foreground border-border hover:bg-muted/80 hover:border-border/80"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-2xs transition-transform group-hover:scale-105",
                  isActive
                    ? "bg-white/20 text-white"
                    : cn("bg-muted", cat.iconInactive)
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {cat.title}
                  </span>
                  {isActive && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </div>
                <span
                  className={cn(
                    "inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 border leading-tight",
                    isActive ? cat.badgeActive : cat.badgeInactive
                  )}
                >
                  {cat.badgeText}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ========================================================= */}
      {/* 3. KONTEN KOMUNITAS: FILTER, PENCARIAN & DAFTAR          */}
      {/* (Langsung ke Selamat Datang di Komunitas tanpa Rekap Jumlah) */}
      {/* ========================================================= */}
      <div className="space-y-4">
        {/* Filter Dropdown & Search Wilayah dengan Header Selamat Datang Terpadu */}
        <Suspense
          fallback={
            <div className="min-h-[140px] animate-pulse rounded-lg bg-card border border-border" />
          }
        >
          <KomunitasFilter
            currentTab={currentTab}
            currentSearch={currentSearch}
            currentKecamatan={currentKecamatan}
            currentKelurahan={currentKelurahan}
            currentRw={currentRw}
            currentRt={currentRt}
            currentBentuk={currentBentuk}
          />
        </Suspense>

        {/* Daftar Komunitas: Disembunyikan secara default, ditampilkan setelah filter dipilih */}
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
                Daftar komunitas disembunyikan secara default. Silakan pilih Kecamatan, Kelurahan,{" "}
                {currentTab === "satuan_paud" || currentTab === "pkbm_skb"
                  ? "Bentuk Lembaga, "
                  : currentTab === "warga_kita"
                  ? "RW/RT, "
                  : ""}
                atau gunakan kolom pencarian di atas untuk menampilkan nama-nama komunitas.
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
    </div>
  );
}
