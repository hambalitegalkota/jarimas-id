import { Suspense } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquarePlus,
  HeartHandshake,
  ShieldCheck,
  Megaphone,
  HeartPulse,
  Users,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { getKabarFeed } from "@/app/actions/kabar";
import {
  getRegisteredUsers,
  getRecentConversations,
  getGroupChatRooms,
} from "@/app/actions/pertemanan";
import { createClient } from "@/utils/supabase/server";
import { KabarCard } from "@/components/kabar/kabar-card";
import { KabarFilter } from "@/components/kabar/kabar-filter";
import { PercakapanHubSection } from "@/components/kabar/percakapan-hub-section";
import { DaftarWargaKabarSection } from "@/components/kabar/daftar-warga-kabar-section";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { WargaLockedCard } from "@/components/warga/warga-locked-card";
import { isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
import type { SortingKabar, VisibilitasKabar } from "@/types/database";

interface KabarPageProps {
  searchParams: Promise<{
    tab?: string;
    sort?: string;
    visibility?: string;
    groupId?: string;
    room?: string;
  }>;
}

export default async function KabarPage({ searchParams }: KabarPageProps) {
  const resolvedParams = await searchParams;
  const rawTab = resolvedParams.tab;
  const targetGroupId = resolvedParams.groupId || resolvedParams.room || null;
  const isExplicitlyClosed =
    rawTab === "closed" ||
    rawTab === "none" ||
    rawTab === "sembunyi" ||
    rawTab === "tutup";

  const currentTab: "kabar" | "percakapan" | "warga" | null = isExplicitlyClosed
    ? null
    : rawTab === "percakapan" || Boolean(targetGroupId)
    ? "percakapan"
    : rawTab === "warga"
    ? "warga"
    : "kabar";
  const currentSort = (resolvedParams.sort as SortingKabar) || "terbaru";
  const currentVisibility =
    (resolvedParams.visibility as "semua" | VisibilitasKabar) || "semua";

  // 1. Ambil feed kabar utama dan daftar warga terdaftar secara paralel
  const [
    feedResult,
    registeredUsersResult,
    convResult,
    groupRoomsResult,
  ] = await Promise.all([
    getKabarFeed({
      sorting: currentSort,
      filterVisibilitas: currentVisibility,
      limit: 30,
    }),
    getRegisteredUsers(),
    currentTab === "percakapan" || Boolean(targetGroupId)
      ? getRecentConversations()
      : Promise.resolve({ conversations: [] }),
    currentTab === "percakapan" || Boolean(targetGroupId)
      ? getGroupChatRooms()
      : Promise.resolve({ rooms: [] }),
  ]);

  const feedItems = feedResult.data;
  const currentUserId = feedResult.currentUserId || registeredUsersResult.currentUserId;
  const isSuperAdmin = Boolean(feedResult.isSuperAdmin ?? registeredUsersResult.isSuperAdmin);
  const isAdminPusat = Boolean(registeredUsersResult.isAdminPusat ?? (groupRoomsResult as any)?.isAdminPusat);
  const canManageGrupKegiatan = Boolean(currentUserId);

  const totalUnreadChat = (convResult.conversations || []).reduce(
    (acc, c) => acc + c.unreadCount,
    0
  );

  const createTabUrl = (targetTab: string) => {
    const params = new URLSearchParams();
    params.set("tab", targetTab);
    if (currentSort !== "terbaru") params.set("sort", currentSort);
    if (currentVisibility !== "semua") params.set("visibility", currentVisibility);
    const qs = params.toString();
    return `/kabar?${qs}`;
  };

  const kabarCategories = [
    {
      id: "kabar" as const,
      title: "Forum & Kabar Warga",
      subtitle: "Ruang interaksi publik seputar jadwal posyandu, nutrisi gizi balita, dan info RT/RW",
      badgeText: `${feedItems.length} Kabar`,
      icon: Megaphone,
      activeColorBg: "bg-primary",
      activeBorder: "border-primary",
      badgeColor: "bg-white/20 text-white border-white/30",
      hoverBorder: "hover:border-primary/50",
      hoverBg: "hover:bg-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      id: "percakapan" as const,
      title: "Pusat Percakapan Warga",
      subtitle: isSuperAdmin
        ? "Kirim pesan langsung ke siapa saja atau berdiskusi di ruang obrolan grup"
        : "Kirim pesan langsung ke sesama warga satu komunitas atau diskusi di grup",
      badgeText: totalUnreadChat > 0 ? `${totalUnreadChat} Pesan Baru` : undefined,
      icon: MessageCircle,
      activeColorBg: "bg-primary",
      activeBorder: "border-primary",
      badgeColor: "bg-white/20 text-white border-white/30",
      hoverBorder: "hover:border-primary/50",
      hoverBg: "hover:bg-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      id: "warga" as const,
      title: isSuperAdmin ? "Daftar Warga Terdaftar (Super Admin)" : "Daftar Warga Satu Komunitas",
      subtitle: isSuperAdmin
        ? "Melihat dan mengelola seluruh akun pengguna yang terdaftar di Jarimas-ID"
        : "Temukan teman, pantau pertemanan, dan perluas jejaring warga satu komunitas",
      badgeText: `${registeredUsersResult.totalCount} Warga`,
      icon: Users,
      activeColorBg: "bg-primary",
      activeBorder: "border-primary",
      badgeColor: "bg-white/20 text-white border-white/30",
      hoverBorder: "hover:border-primary/50",
      hoverBg: "hover:bg-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  // Urutkan kategori: Kartu yang terbuka posisinya otomatis berada di paling atas
  const sortedKabarCategories = [
    ...(currentTab ? kabarCategories.filter((c) => c.id === currentTab) : []),
    ...kabarCategories.filter((c) => c.id !== currentTab),
  ];

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. HEADER BANNER KABAR & PERCAKAPAN WARGA                 */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                {currentTab === "kabar"
                  ? "FORUM & KABAR WARGA"
                  : currentTab === "percakapan"
                  ? "PERCAKAPAN PRIBADI & GRUP"
                  : currentTab === "warga"
                  ? "JEJARING WARGA & PERTEMANAN"
                  : "KABAR & INTERAKSI WARGA"}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground font-mono">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                KOTA TEGAL
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {currentTab === "kabar"
                ? "Kabar Jarimas"
                : currentTab === "percakapan"
                ? "Pusat Percakapan Warga"
                : currentTab === "warga"
                ? isSuperAdmin
                  ? "Daftar Warga Terdaftar (Super Admin)"
                  : "Daftar Warga Satu Komunitas"
                : "Kabar & Komunikasi Warga"}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Jelajahi informasi publik seputar penimbangan posyandu, ruang percakapan warga, dan direktori pertemanan komunitas se-Kota Tegal.
            </p>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-lg bg-background border border-border text-center min-w-[76px] shadow-2xs">
                <span className="text-base sm:text-lg font-black block font-mono text-primary">
                  {feedItems.length}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Kabar Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground font-medium">
          <Megaphone className="h-4 w-4 text-primary shrink-0" />
          <span>
            Pilih salah satu bagian di bawah untuk melihat kabar, membuka ruang percakapan, atau melihat daftar warga.
          </span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. COLLAPSIBLE / ACCORDION KATEGORI KABAR                 */}
      {/* ========================================================= */}
      <div className="space-y-3.5 transition-all duration-500 ease-in-out">
        {sortedKabarCategories.map((cat) => {
          const isOpen = currentTab === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              className={`rounded-lg border transition-all overflow-hidden ${
                isOpen
                  ? `border-border bg-card p-2 sm:p-2.5 shadow-sm`
                  : `border-border bg-card shadow-2xs hover:shadow-xs ${cat.hoverBorder}`
              }`}
            >
              {/* Accordion Header / Trigger */}
              {isOpen ? (
                <Link
                  href={createTabUrl("closed")}
                  title="Klik untuk menyembunyikan bagian ini"
                  className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-lg text-white ${cat.activeColorBg} shadow-xs cursor-pointer transition-all hover:opacity-95 group`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-xs shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-black tracking-tight truncate">
                          {cat.title}
                        </h2>
                        <span
                          className={`text-2xs font-extrabold px-2 py-0.5 rounded-md border backdrop-blur-xs ${cat.badgeColor}`}
                        >
                          {cat.badgeText}
                        </span>
                        <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Aktif Terbuka
                        </span>
                      </div>
                      <p className="text-xs text-white/90 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                      {cat.id === "warga" && registeredUsersResult.rekapKomunitas && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-medium text-white/90">
                          <span className="font-bold text-white">Sebaran:</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20">
                            Kota Tegal: {registeredUsersResult.rekapKomunitas.kotaTegal}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20">
                            Kecamatan: {registeredUsersResult.rekapKomunitas.kecamatan}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20">
                            Kelurahan: {registeredUsersResult.rekapKomunitas.kelurahan}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20">
                            RW: {registeredUsersResult.rekapKomunitas.rw}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20">
                            RT: {registeredUsersResult.rekapKomunitas.rt}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20">
                            Komunitas Lain: {registeredUsersResult.rekapKomunitas.komunitasLain}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-white/90 group-hover:text-white transition-colors hidden sm:inline">
                      Sembunyikan
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-xs group-hover:bg-white/30 transition-colors">
                      <ChevronDown className="h-4 w-4 transform rotate-180 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href={createTabUrl(cat.id)}
                  className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 text-foreground transition-all cursor-pointer group ${cat.hoverBg}`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {cat.title}
                        </h2>
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                      {cat.id === "warga" && registeredUsersResult.rekapKomunitas && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-medium">
                          <span className="font-bold text-foreground">Sebaran:</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            Kota Tegal: {registeredUsersResult.rekapKomunitas.kotaTegal}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            Kecamatan: {registeredUsersResult.rekapKomunitas.kecamatan}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            Kelurahan: {registeredUsersResult.rekapKomunitas.kelurahan}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            RW: {registeredUsersResult.rekapKomunitas.rw}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            RT: {registeredUsersResult.rekapKomunitas.rt}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            Komunitas Lain: {registeredUsersResult.rekapKomunitas.komunitasLain}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      Buka Bagian
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-muted group-hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-colors">
                      <ChevronDown className="h-4 w-4 transform rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Accordion Body Content */}
              {isOpen && (
                <div className="p-2 sm:p-3 animate-in fade-in-50 duration-300 space-y-4">
                  {cat.id === "kabar" && (
                    <div className="space-y-4">
                      <Suspense fallback={<div className="h-12 animate-pulse bg-muted rounded-lg" />}>
                        <KabarFilter
                          currentSort={currentSort}
                          currentVisibility={currentVisibility}
                        />
                      </Suspense>

                      <main className="space-y-4">
                        {feedItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 sm:p-12 text-center space-y-3 shadow-xs">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                              <MessageSquarePlus className="h-6 w-6 stroke-[1.5px]" />
                            </div>
                            <div className="space-y-1 max-w-sm">
                              <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                                Belum Ada Kabar di Kategori Ini
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Jadilah yang pertama membagikan pengumuman posyandu, tips gizi balita, atau kabar lingkungan sekitar.
                              </p>
                            </div>
                          </div>
                        ) : (
                          feedItems.map((kabar) => (
                            <KabarCard
                              key={kabar.id}
                              kabar={kabar}
                              currentUserId={currentUserId}
                              isSuperAdmin={isSuperAdmin}
                            />
                          ))
                        )}
                      </main>

                      {/* Floating Action Button & Modal Buat Kabar */}
                      <CreateKabarModal currentUserId={currentUserId} />
                    </div>
                  )}

                  {cat.id === "percakapan" && (
                    <div className="space-y-4">
                      {!currentUserId ? (
                        <WargaLockedCard totalUsersCount={registeredUsersResult.totalCount} />
                      ) : (
                        <PercakapanHubSection
                          conversations={convResult.conversations || []}
                          rooms={groupRoomsResult.rooms || []}
                          allUsers={registeredUsersResult.users || []}
                          currentUserId={currentUserId}
                          isSuperAdmin={isSuperAdmin}
                          isAdminPusat={isAdminPusat}
                          canManageGrupKegiatan={canManageGrupKegiatan}
                          initialGroupId={targetGroupId}
                        />
                      )}
                    </div>
                  )}

                  {cat.id === "warga" && (
                    <div className="space-y-4">
                      {!currentUserId ? (
                        <WargaLockedCard totalUsersCount={registeredUsersResult.totalCount} />
                      ) : (
                        <DaftarWargaKabarSection
                          initialUsers={registeredUsersResult.users || []}
                          currentUserId={currentUserId}
                          rekapKomunitas={registeredUsersResult.rekapKomunitas}
                          isSuperAdmin={isSuperAdmin}
                        />
                      )}
                    </div>
                  )}

                  {/* Tombol Sembunyikan Bagian di Bawah Konten */}
                  <div className="flex justify-center pt-2 pb-1 border-t border-border">
                    <Link
                      href={createTabUrl("closed")}
                      title="Klik untuk menyembunyikan bagian ini"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground bg-background hover:bg-muted transition-all border border-border shadow-2xs cursor-pointer active:scale-98"
                    >
                      <ChevronDown className="h-3.5 w-3.5 transform rotate-180" />
                      <span>Sembunyikan Bagian Ini</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
