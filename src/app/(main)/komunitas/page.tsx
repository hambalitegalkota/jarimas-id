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
  MapPin,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { getKomunitasList } from "@/app/actions/komunitas";
import { KomunitasFilter } from "@/components/komunitas/komunitas-filter";
import { KomunitasCard } from "@/components/komunitas/komunitas-card";
import { KomunitasRekapSection } from "@/components/komunitas/komunitas-rekap-section";
import { PaudKomunitasTableRekapSection } from "@/components/komunitas/paud-komunitas-table-rekap-section";
import { SpmKomunitasSection } from "@/components/komunitas/spm-komunitas-section";
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
  const currentBentuk = currentTab === "satuan_paud" ? resolvedParams.bentuk || "semua" : "semua";
  const currentRw = currentTab === "warga_kita" ? resolvedParams.rw || "semua" : "semua";
  const currentRt = currentTab === "warga_kita" ? resolvedParams.rt || "semua" : "semua";
  const currentPage = Math.max(1, Number(resolvedParams.page) || 1);
  const pageSize = 20;

  const komunitasResult = await getKomunitasList({
    jenis: currentTab || "semua",
    kecamatan: currentKecamatan,
    kelurahan: currentKelurahan,
    rw: currentRw,
    rt: currentRt,
    bentuk: currentBentuk,
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
    if (currentBentuk !== "semua") params.set("bentuk", currentBentuk);
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
    if (targetTab === "satuan_paud" && currentBentuk !== "semua") params.set("bentuk", currentBentuk);
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

  // Definisi metadata ketiga kategori accordion
  const accordionCategories = [
    {
      id: "posyandu" as JenisKomunitas,
      title: "Posyandu",
      subtitle: "Layanan Pemantauan Tumbuh Kembang, Gizi & Imunisasi Balita",
      badgeText: "209 Posyandu",
      icon: HeartPulse,
      activeColorBg: "bg-emerald-600 dark:bg-emerald-700",
      activeBorder: "border-emerald-500",
      badgeColor: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30",
      hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600",
      hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
    },
    {
      id: "warga_kita" as JenisKomunitas,
      title: "Komunitas Warga Kita",
      subtitle: "Struktur Komunitas 4 Tingkat: RT, RW, Kelurahan & Kecamatan",
      badgeText: "7.800+ RT/RW",
      icon: Users,
      activeColorBg: "bg-blue-600 dark:bg-blue-700",
      activeBorder: "border-blue-500",
      badgeColor: "bg-blue-500/20 text-blue-100 border-blue-400/30",
      hoverBorder: "hover:border-blue-400 dark:hover:border-blue-600",
      hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      id: "satuan_paud" as JenisKomunitas,
      title: "Satuan PAUD & Kesetaraan",
      subtitle: "Lembaga KB, TK, TPA, SPS, PKBM & SKB Mitra Kota Tegal",
      badgeText: "PAUD & PKBM",
      icon: GraduationCap,
      activeColorBg: "bg-indigo-600 dark:bg-indigo-700",
      activeBorder: "border-indigo-500",
      badgeColor: "bg-indigo-500/20 text-indigo-100 border-indigo-400/30",
      hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-600",
      hoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-950",
    },
    {
      id: "bidang_spm" as JenisKomunitas,
      title: "Komunitas 6 Bidang SPM",
      subtitle: "Standar Pelayanan Minimal 6 Bidang Urusan Pemerintahan Wajib Kota Tegal",
      badgeText: "6 Bidang SPM",
      icon: ShieldCheck,
      activeColorBg: "bg-teal-700 dark:bg-teal-800",
      activeBorder: "border-teal-500",
      badgeColor: "bg-teal-500/20 text-teal-100 border-teal-400/30",
      hoverBorder: "hover:border-teal-400 dark:hover:border-teal-600",
      hoverBg: "hover:bg-teal-50/50 dark:hover:bg-teal-950/20",
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100 dark:bg-teal-950",
    },
  ];

  // Urutkan kategori: Kartu yang terbuka posisinya otomatis berada di paling atas
  const sortedCategories = [
    ...(currentTab ? accordionCategories.filter((c) => c.id === currentTab) : []),
    ...accordionCategories.filter((c) => c.id !== currentTab),
  ];

  // Render konten di dalam Accordion yang aktif
  const renderActiveAccordionContent = (activeCatId: JenisKomunitas) => {
    if (activeCatId === "bidang_spm") {
      return (
        <SpmKomunitasSection
          komunitasList={listKomunitas}
          currentUserId={currentUserId}
          initialSearch={currentSearch}
        />
      );
    }

    return (
      <div className="space-y-6 pt-2">
        {/* 1. REKAP JUMLAH KOMUNITAS PER KECAMATAN & KELURAHAN BESERTA BENTUK SATUAN */}
      <KomunitasRekapSection
        currentTab={activeCatId}
        currentKecamatan={currentKecamatan}
        currentKelurahan={currentKelurahan}
        currentBentuk={currentBentuk}
      />

      {/* 2. KHUSUS TAB PAUD: TABEL KOMUNITAS BERDASARKAN ANGGOTA */}
      {activeCatId === "satuan_paud" && (
        <PaudKomunitasTableRekapSection
          initialKecamatan={currentKecamatan}
          initialKelurahan={currentKelurahan}
          initialBentuk={currentBentuk}
        />
      )}

      {/* 3. FILTER DROPDOWN & SEARCH WILAYAH */}
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

      {/* 4. LIST KOMUNITAS STREAM */}
      <main className="space-y-4 pb-4">
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
  };

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
              Eksplorasi Komunitas Kota Tegal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Jelajahi 209 Posyandu, Satuan PAUD &amp; Kesetaraan, Komunitas Warga 4 Tingkat, dan 6 Bidang SPM se-Kota Tegal.
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
      {/* 2. COLLAPSIBLE / ACCORDION KATEGORI KOMUNITAS            */}
      {/* ========================================================= */}
      <div className="space-y-3.5 transition-all duration-500 ease-in-out">
        {sortedCategories.map((cat) => {
          const isOpen = currentTab === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              className={`rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
                isOpen
                  ? `border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-2 sm:p-3 shadow-md`
                  : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs ${cat.hoverBorder}`
              }`}
            >
              {/* Accordion Header / Trigger */}
              {isOpen ? (
                <Link
                  href="/komunitas"
                  title="Klik untuk menutup bagian ini"
                  className={`flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl text-white ${cat.activeColorBg} shadow-sm cursor-pointer transition-all hover:opacity-95 group`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black tracking-tight truncate">
                          {cat.title}
                        </h2>
                        <span
                          className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${cat.badgeColor}`}
                        >
                          {cat.badgeText}
                        </span>
                        <span className="inline-flex items-center gap-1 text-2xs font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white">
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
                    <span className="hidden sm:inline-block text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                      Tutup Bagian
                    </span>
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs group-hover:bg-white/30 transition-colors">
                      <ChevronDown className="h-5 w-5 transform rotate-180 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href={createTabUrl(cat.id)}
                  className={`flex items-center justify-between gap-3 p-4 sm:p-5 text-slate-800 dark:text-slate-100 transition-all cursor-pointer group ${cat.hoverBg}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cat.title}
                        </h2>
                        <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      Buka Bagian
                    </span>
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                      <ChevronDown className="h-5 w-5 transform rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Accordion Body Content */}
              {isOpen && (
                <div className="p-2 sm:p-4 animate-in fade-in-50 duration-300">
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
