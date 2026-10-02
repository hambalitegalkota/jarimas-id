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
  HeartPulse,
  GraduationCap,
  MapPin,
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
  const currentRw = currentTab === "warga_kita" ? resolvedParams.rw || "semua" : "semua";
  const currentRt = currentTab === "warga_kita" ? resolvedParams.rt || "semua" : "semua";
  const currentPage = Math.max(1, Number(resolvedParams.page) || 1);
  const pageSize = 20;

  const komunitasResult = await getKomunitasList({
    jenis: currentTab,
    kecamatan: currentKecamatan,
    kelurahan: currentKelurahan,
    rw: currentRw,
    rt: currentRt,
    searchQuery: currentSearch,
    page: currentPage,
    limit: pageSize,
  });

  const { data: listKomunitas, currentUserId, pagination } = komunitasResult;

  // Helper untuk membuat URL dengan parameter yang konsisten
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (currentTab) params.set("tab", currentTab);
    if (currentSearch) params.set("search", currentSearch);
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

  return (
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 gap-6 max-w-4xl mx-auto w-full pb-20">
      {/* ========================================================= */}
      {/* 1. HEADER BANNER EKSPLORASI KOMUNITAS                     */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-lg shadow-slate-950/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-bold text-emerald-300 backdrop-blur-xs">
                KOMUNITAS JARIMAS
              </span>
              <span className="text-xs font-bold text-slate-300 font-mono">
                KOTA TEGAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Eksplorasi Komunitas di Kota Tegal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Jelajahi 230+ Posyandu Balita, Satuan PAUD &amp; Kesetaraan, dan Komunitas Warga 4 Tingkat (RT/RW/Kelurahan) se-Kota Tegal.
            </p>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center">
                <span className="text-base sm:text-lg font-black block font-mono text-emerald-400">
                  {pagination.totalCount}
                </span>
                <span className="text-[10px] text-slate-300 uppercase font-bold">
                  Komunitas
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. 3 TAB KATEGORI UTAMA (COLOR CODED)                     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-3 rounded-2xl bg-white dark:bg-slate-900 p-1.5 border-2 border-slate-200 dark:border-slate-800 gap-1.5 shadow-2xs">
        {/* Tab 1: Posyandu */}
        <Link
          href={createTabUrl("posyandu")}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-98 ${
            currentTab === "posyandu"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <HeartPulse className="h-4 w-4 shrink-0" />
          <span>POSYANDU</span>
        </Link>

        {/* Tab 2: Warga Kita */}
        <Link
          href={createTabUrl("warga_kita")}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-98 ${
            currentTab === "warga_kita"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span>WARGA KITA</span>
        </Link>

        {/* Tab 3: PAUD */}
        <Link
          href={createTabUrl("satuan_paud")}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-98 ${
            currentTab === "satuan_paud"
              ? "bg-indigo-600 text-white font-black shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <GraduationCap className="h-4 w-4 shrink-0" />
          <span>PAUD</span>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 2.5. REKAP JUMLAH KOMUNITAS PER KECAMATAN & KELURAHAN     */}
      {/* ========================================================= */}
      <KomunitasRekapSection
        currentTab={currentTab}
        currentKecamatan={currentKecamatan}
        currentKelurahan={currentKelurahan}
      />

      {/* ========================================================= */}
      {/* 3. FILTER DROPDOWN & SEARCH WILAYAH                       */}
      {/* ========================================================= */}
      <Suspense fallback={<div className="min-h-[100px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800" />}>
        <KomunitasFilter
          currentTab={currentTab}
          currentSearch={currentSearch}
          currentKecamatan={currentKecamatan}
          currentKelurahan={currentKelurahan}
          currentRw={currentRw}
          currentRt={currentRt}
        />
      </Suspense>

      {/* ========================================================= */}
      {/* 4. LIST KOMUNITAS STREAM                                  */}
      {/* ========================================================= */}
      <main className="space-y-4 pb-12">
        {/* Subheader Hasil & Paginasi Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Daftar Komunitas
            </span>
            {currentSearch && (
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Pencarian: &ldquo;{currentSearch}&rdquo;
              </span>
            )}
          </div>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-xs">
            {pagination.totalCount > 0
              ? `${startIndex}–${endIndex} dari ${pagination.totalCount} data`
              : "0 data"}
          </span>
        </div>

        {listKomunitas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400">
              <Search className="h-7 w-7" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tidak Ada Komunitas yang Cocok
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentSearch
                  ? `Tidak ditemukan hasil untuk "${currentSearch}". Coba kata kunci lain atau reset filter.`
                  : "Ubah pilihan kecamatan, kelurahan, atau RT/RW untuk melihat data lainnya."}
              </p>
            </div>
            {(currentSearch || currentKecamatan !== "semua" || currentKelurahan !== "semua") && (
              <Link
                href={`/komunitas?tab=${currentTab}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Reset Semua Filter
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
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
          <div className="flex items-center justify-between border-t-2 border-slate-200 dark:border-slate-800 pt-4 text-xs sm:text-sm font-bold">
            <div>
              {pagination.page > 1 ? (
                <Link
                  href={createPageUrl(pagination.page - 1)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Sebelumnya</span>
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 text-slate-400 dark:text-slate-600 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Sebelumnya</span>
                </span>
              )}
            </div>

            <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">
              Halaman {pagination.page} dari {pagination.totalPages}
            </span>

            <div>
              {pagination.hasMore ? (
                <Link
                  href={createPageUrl(pagination.page + 1)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 text-slate-400 dark:text-slate-600 cursor-not-allowed">
                  <span>Berikutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
