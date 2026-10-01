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
import { getKomunitasList } from "@/app/actions/komunitas";
import { KomunitasFilter } from "@/components/komunitas/komunitas-filter";
import { KomunitasCard } from "@/components/komunitas/komunitas-card";
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
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 gap-6 max-w-4xl mx-auto w-full">
      {/* Header Banner - Coursera Mobile Style */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              JARIMAS EXPLORER
            </span>
            <span className="text-xs font-bold text-slate-500">KOTA TEGAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Eksplorasi Komunitas
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Akses 230+ Posyandu, PAUD &amp; Kesetaraan (TK, KB, RA, PKBM, SKB), dan RT/RW se-Kota Tegal.
          </p>
        </div>
      </header>

      {/* 3 Tab Kategori Utama (Posyandu, Warga Kita, PAUD & Kesetaraan) - Coursera Mobile Touch Pills */}
      <div className="flex rounded-2xl bg-white p-1.5 border-2 border-slate-200 gap-2 shadow-xs">
        <Link
          href={createTabUrl("posyandu")}
          className={`flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
            currentTab === "posyandu"
              ? "bg-blue-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>POSYANDU</span>
        </Link>

        <Link
          href={createTabUrl("warga_kita")}
          className={`flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
            currentTab === "warga_kita"
              ? "bg-blue-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>WARGA KITA</span>
        </Link>

        <Link
          href={createTabUrl("satuan_paud")}
          className={`flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
            currentTab === "satuan_paud"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>PAUD</span>
        </Link>
      </div>

      {/* Filter Dropdown & Search Wilayah */}
      <Suspense fallback={<div className="min-h-[100px] animate-pulse rounded-2xl bg-slate-100 border-2 border-slate-200" />}>
        <KomunitasFilter
          currentTab={currentTab}
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
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-slate-900">
              Daftar Komunitas
            </span>
            {currentSearch && (
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                Pencarian: &ldquo;{currentSearch}&rdquo;
              </span>
            )}
          </div>
          <span className="font-mono text-slate-700 font-bold">
            {pagination.totalCount > 0
              ? `${startIndex}–${endIndex} dari ${pagination.totalCount} data`
              : "0 data"}
          </span>
        </div>

        {listKomunitas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-slate-900">
                Tidak Ada Komunitas yang Cocok
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {currentSearch
                  ? `Tidak ditemukan hasil untuk "${currentSearch}". Coba kata kunci lain atau reset filter.`
                  : "Ubah pilihan kecamatan, kelurahan, atau RT/RW untuk melihat data lainnya."}
              </p>
            </div>
            {(currentSearch || currentKecamatan !== "semua" || currentKelurahan !== "semua") && (
              <Link
                href={`/komunitas?tab=${currentTab}`}
                className="inline-flex min-h-[44px] h-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Reset Semua Filter
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
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
          <div className="flex items-center justify-between border-t-2 border-slate-200 pt-4 text-sm font-bold">
            <div>
              {pagination.page > 1 ? (
                <Link
                  href={createPageUrl(pagination.page - 1)}
                  className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Sebelumnya</span>
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-slate-400 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Sebelumnya</span>
                </span>
              )}
            </div>

            <span className="text-slate-600">
              Halaman {pagination.page} dari {pagination.totalPages}
            </span>

            <div>
              {pagination.hasMore ? (
                <Link
                  href={createPageUrl(pagination.page + 1)}
                  className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-slate-400 cursor-not-allowed">
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
