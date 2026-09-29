import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";
import {
  getKomunitasList,
  getUserJoinedKomunitas,
} from "@/app/actions/komunitas";
import { KomunitasFilter } from "@/components/komunitas/komunitas-filter";
import { KomunitasCard } from "@/components/komunitas/komunitas-card";
import { KomunitasSayaSection } from "@/components/komunitas/komunitas-saya-section";
import { ThemeToggle } from "@/components/theme-toggle";
import type { JenisKomunitas } from "@/types/database";

interface KomunitasPageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    kecamatan?: string;
    kelurahan?: string;
    rw?: string;
    rt?: string;
    page?: string;
  }>;
}

export default async function KomunitasPage({
  searchParams,
}: KomunitasPageProps) {
  const resolvedParams = await searchParams;
  const currentTab = (resolvedParams.tab as JenisKomunitas) || "posyandu";
  const currentSearch = resolvedParams.search?.trim() || "";
  const currentKecamatan = resolvedParams.kecamatan || "semua";
  const currentKelurahan = resolvedParams.kelurahan || "semua";
  const currentRw = resolvedParams.rw || "semua";
  const currentRt = resolvedParams.rt || "semua";
  const currentPage = Math.max(1, Number(resolvedParams.page) || 1);
  const pageSize = 20;

  const [komunitasResult, userJoinedResult] = await Promise.all([
    getKomunitasList({
      jenis: currentTab,
      kecamatan: currentKecamatan,
      kelurahan: currentKelurahan,
      rw: currentRw,
      rt: currentRt,
      searchQuery: currentSearch,
      page: currentPage,
      limit: pageSize,
    }),
    getUserJoinedKomunitas(),
  ]);

  const { data: listKomunitas, currentUserId, pagination } = komunitasResult;
  const userJoinedList = userJoinedResult.data || [];

  // Helper untuk membuat URL dengan parameter yang konsisten
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (currentTab) params.set("tab", currentTab);
    if (currentSearch) params.set("search", currentSearch);
    if (currentKecamatan !== "semua") params.set("kecamatan", currentKecamatan);
    if (currentKelurahan !== "semua") params.set("kelurahan", currentKelurahan);
    if (currentRw !== "semua") params.set("rw", currentRw);
    if (currentRt !== "semua") params.set("rt", currentRt);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/komunitas${qs ? `?${qs}` : ""}`;
  };

  const createTabUrl = (targetTab: string) => {
    const params = new URLSearchParams();
    params.set("tab", targetTab);
    if (currentSearch) params.set("search", currentSearch);
    if (currentKecamatan !== "semua") params.set("kecamatan", currentKecamatan);
    if (currentKelurahan !== "semua") params.set("kelurahan", currentKelurahan);
    if (currentRw !== "semua") params.set("rw", currentRw);
    if (currentRt !== "semua") params.set("rt", currentRt);
    const qs = params.toString();
    return `/komunitas?${qs}`;
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.totalCount);

  return (
    <div className="flex flex-col flex-1 px-4 py-8 gap-8">
      {/* Header Banner - Superlist Maximalist Headline */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="cyber-badge font-mono text-[10px]">
              <Compass className="h-3 w-3" />
              JARIMAS_EXPLORER
            </span>
            <span className="text-xs font-mono text-muted-foreground">KOTA TEGAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">
            Eksplorasi Komunitas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Akses 230+ Posyandu, PAUD &amp; Kesetaraan (TK, KB, RA, PKBM, SKB), dan RT/RW se-Kota Tegal dalam satu jaringan terpadu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle variant="compact" />
        </div>
      </header>

      {/* Komunitas yang Telah Diikuti oleh Pengguna */}
      <KomunitasSayaSection
        userJoinedList={userJoinedList}
        currentUserId={currentUserId}
      />

      {/* 3 Tab Kategori Utama (Posyandu, Warga Kita, PAUD & Kesetaraan) */}
      <div className="flex rounded-md bg-muted/40 p-1 border border-border">
        <Link
          href={createTabUrl("posyandu")}
          className={`flex flex-1 h-9 items-center justify-center gap-1.5 rounded text-xs font-mono font-medium transition-colors ${
            currentTab === "posyandu"
              ? "bg-card text-foreground border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>POSYANDU</span>
        </Link>

        <Link
          href={createTabUrl("warga_kita")}
          className={`flex flex-1 h-9 items-center justify-center gap-1.5 rounded text-xs font-mono font-medium transition-colors ${
            currentTab === "warga_kita"
              ? "bg-card text-foreground border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5 text-emerald-400" />
          <span>WARGA_KITA</span>
        </Link>

        <Link
          href={createTabUrl("satuan_paud")}
          className={`flex flex-1 h-9 items-center justify-center gap-1.5 rounded text-xs font-mono font-medium transition-colors ${
            currentTab === "satuan_paud"
              ? "bg-card text-foreground border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-3.5 w-3.5 text-amber-400" />
          <span>PAUD_KESETARAAN</span>
        </Link>
      </div>

      {/* Filter Dropdown & Search Wilayah */}
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-muted/40 border border-border" />}>
        <KomunitasFilter
          currentSearch={currentSearch}
          currentKecamatan={currentKecamatan}
          currentKelurahan={currentKelurahan}
          currentRw={currentRw}
          currentRt={currentRt}
        />
      </Suspense>

      {/* List Komunitas Stream */}
      <main className="space-y-4 pb-12">
        {/* Subheader Hasil & Paginasi Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase text-foreground">
              Daftar Komunitas
            </span>
            {currentSearch && (
              <span className="cyber-badge-cyan text-[10px]">
                Q: &ldquo;{currentSearch}&rdquo;
              </span>
            )}
          </div>
          <span>
            {pagination.totalCount > 0
              ? `[${startIndex}–${endIndex} / ${pagination.totalCount}]`
              : "[0 data]"}
          </span>
        </div>

        {listKomunitas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Tidak Ada Komunitas yang Cocok
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm font-mono">
                {currentSearch
                  ? `Tidak ditemukan hasil untuk "${currentSearch}". Coba kata kunci lain atau reset filter.`
                  : "Ubah pilihan kecamatan, kelurahan, atau RT/RW untuk melihat data lainnya."}
              </p>
            </div>
            {(currentSearch || currentKecamatan !== "semua" || currentKelurahan !== "semua") && (
              <Link
                href={`/komunitas?tab=${currentTab}`}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-mono font-medium text-foreground hover:bg-muted"
              >
                Reset Semua Filter
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
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
          <div className="flex items-center justify-between border-t border-border pt-4 font-mono text-xs">
            <div>
              {pagination.page > 1 ? (
                <Link
                  href={createPageUrl(pagination.page - 1)}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-3 text-foreground hover:bg-muted"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Sebelumnya</span>
                </Link>
              ) : (
                <span className="inline-flex h-8 items-center gap-1 rounded-md border border-border/40 bg-muted/20 px-3 text-muted-foreground/40 cursor-not-allowed">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Sebelumnya</span>
                </span>
              )}
            </div>

            <span className="text-muted-foreground">
              Halaman {pagination.page} dari {pagination.totalPages}
            </span>

            <div>
              {pagination.hasMore ? (
                <Link
                  href={createPageUrl(pagination.page + 1)}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-3 text-foreground hover:bg-muted"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex h-8 items-center gap-1 rounded-md border border-border/40 bg-muted/20 px-3 text-muted-foreground/40 cursor-not-allowed">
                  <span>Berikutnya</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
