import { Suspense } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquarePlus,
  HeartHandshake,
  ShieldCheck,
  Megaphone,
  HeartPulse,
  MessageCircle,
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
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { KabarUnreadBanner } from "@/components/kabar/kabar-unread-banner";
import { WargaLockedCard } from "@/components/warga/warga-locked-card";
import { PrintButton } from "@/components/ui/print-button";
import { isSuperAdmin as checkIsSuperAdmin, cn } from "@/lib/utils";
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
  const currentSort = (resolvedParams.sort as SortingKabar) || "terbaru";
  const currentVisibility =
    (resolvedParams.visibility as "semua" | VisibilitasKabar) || "semua";

  // 1. Ambil feed kabar utama dan daftar percakapan secara paralel
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
    getRecentConversations(),
    getGroupChatRooms(),
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

  // Tab aktif: Kabar atau Percakapan (default Kabar)
  const currentTab: "kabar" | "percakapan" =
    rawTab === "percakapan" || Boolean(targetGroupId)
      ? "percakapan"
      : "kabar";

  const createTabUrl = (targetTab: "kabar" | "percakapan") => {
    const params = new URLSearchParams();
    if (targetTab === "percakapan") {
      params.set("tab", "percakapan");
    }
    if (currentSort !== "terbaru") params.set("sort", currentSort);
    if (currentVisibility !== "semua") params.set("visibility", currentVisibility);
    const qs = params.toString();
    return qs ? `/kabar?${qs}` : "/kabar";
  };

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. HEADER BANNER KABAR & PERCAKAPAN WARGA                 */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                {currentTab === "kabar" ? "KABAR WARGA" : "PERCAKAPAN WARGA"}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground font-mono">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                KOTA TEGAL
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {currentTab === "kabar" ? "Kabar & Komunikasi Warga" : "Pusat Percakapan Warga"}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Jelajahi informasi publik seputar penimbangan posyandu, ruang percakapan warga, dan interaksi komunitas se-Kota Tegal.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <PrintButton variant="outline" size="sm" hideTextOnMobile={true} />
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

        {/* Quick Tips Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground font-medium">
          <Megaphone className="h-4 w-4 text-primary shrink-0" />
          <span>
            Pilih salah satu tab di bawah untuk melihat kabar atau membuka ruang percakapan warga.
          </span>
        </div>
      </section>

      {/* Realtime Unread Notification Alert Banner */}
      <KabarUnreadBanner currentTab={currentTab} />

      {/* ========================================================= */}
      {/* 2. DUA TAB DALAM SATU BARIS (KABAR & PERCAKAPAN)          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-card border border-border shadow-xs">
        {/* Tab 1: Kabar */}
        <Link
          href={createTabUrl("kabar")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all text-center cursor-pointer",
            currentTab === "kabar"
              ? "bg-primary text-primary-foreground shadow-xs font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-muted font-semibold"
          )}
        >
          <Megaphone className="h-4 w-4 shrink-0" />
          <span>Kabar</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-2xs font-mono font-bold",
              currentTab === "kabar"
                ? "bg-white/20 text-white"
                : "bg-muted-foreground/10 text-muted-foreground"
            )}
          >
            {feedItems.length}
          </span>
        </Link>

        {/* Tab 2: Percakapan */}
        <Link
          href={createTabUrl("percakapan")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all text-center cursor-pointer relative",
            currentTab === "percakapan"
              ? "bg-primary text-primary-foreground shadow-xs font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-muted font-semibold"
          )}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span>Percakapan</span>
          {totalUnreadChat > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-amber-500 text-white shadow-xs animate-pulse">
              {totalUnreadChat} Pesan
            </span>
          ) : (
            <span
              className={cn(
                "hidden sm:inline-flex px-2 py-0.5 rounded-full text-2xs font-mono font-bold",
                currentTab === "percakapan"
                  ? "bg-white/20 text-white"
                  : "bg-muted-foreground/10 text-muted-foreground"
              )}
            >
              Aktif
            </span>
          )}
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 3. KONTEN TAB AKTIF (KABAR ATAU PERCAKAPAN)               */}
      {/* ========================================================= */}
      {currentTab === "kabar" && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
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

      {currentTab === "percakapan" && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
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
    </div>
  );
}
