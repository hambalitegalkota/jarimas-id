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
import { KabarMainTabs } from "@/components/kabar/kabar-main-tabs";
import { PercakapanHubSection } from "@/components/kabar/percakapan-hub-section";
import { DaftarWargaKabarSection } from "@/components/kabar/daftar-warga-kabar-section";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { WargaLockedCard } from "@/components/warga/warga-locked-card";
import type { SortingKabar, VisibilitasKabar } from "@/types/database";

interface KabarPageProps {
  searchParams: Promise<{
    tab?: string;
    sort?: string;
    visibility?: string;
  }>;
}

export default async function KabarPage({ searchParams }: KabarPageProps) {
  const resolvedParams = await searchParams;
  const currentTab =
    (resolvedParams.tab as "kabar" | "percakapan" | "warga") || "kabar";
  const currentSort = (resolvedParams.sort as SortingKabar) || "terbaru";
  const currentVisibility =
    (resolvedParams.visibility as "semua" | VisibilitasKabar) || "semua";

  // 1. Ambil data feed kabar
  const { data: feedItems, currentUserId } = await getKabarFeed({
    sorting: currentSort,
    filterVisibilitas: currentVisibility,
  });

  // 2. Ambil data pengguna terdaftar & pertemanan
  const registeredUsersResult = await getRegisteredUsers();

  // 3. Ambil riwayat percakapan terbaru & ruang obrolan grup
  const [convResult, groupRoomsResult] = await Promise.all([
    getRecentConversations(),
    getGroupChatRooms(),
  ]);

  const totalUnreadChat = (convResult.conversations || []).reduce(
    (acc, c) => acc + c.unreadCount,
    0
  );

  // 4. Periksa hak akses Super Admin jika user terautentikasi
  let isSuperAdmin = false;
  if (currentUserId) {
    try {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", currentUserId)
        .maybeSingle();
      isSuperAdmin = profile?.is_super_admin === true;
    } catch {
      // Abaikan jika tabel profil belum ada
    }
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 gap-6 max-w-4xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. HEADER BANNER KABAR & PERCAKAPAN WARGA                 */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-lg shadow-slate-950/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-bold text-emerald-300 backdrop-blur-xs">
                {currentTab === "kabar"
                  ? "FORUM & KABAR WARGA"
                  : currentTab === "percakapan"
                  ? "PERCAKAPAN PRIBADI & GRUP"
                  : "JEJARING WARGA & PERTEMANAN"}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-300 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                KOTA TEGAL
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentTab === "kabar"
                ? "Kabar Jarimas"
                : currentTab === "percakapan"
                ? "Pusat Percakapan Warga"
                : isSuperAdmin
                ? "Daftar Warga Terdaftar (Super Admin)"
                : "Daftar Warga Satu Komunitas"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {currentTab === "kabar"
                ? "Ruang interaksi publik seputar jadwal penimbangan posyandu, edukasi nutrisi gizi balita, dan info penting lingkungan RT/RW se-Kota Tegal."
                : currentTab === "percakapan"
                ? isSuperAdmin
                  ? "Kirim pesan langsung ke siapa saja atau berdiskusi di seluruh ruang obrolan grup komunitas."
                  : "Kirim pesan langsung ke sesama warga satu komunitas atau berdiskusi di grup komunitas yang Anda ikuti."
                : isSuperAdmin
                ? "Melihat dan mengelola seluruh akun pengguna yang telah melakukan registrasi di sistem Jarimas-ID."
                : "Temukan teman, pantau permintaan pertemanan, dan perluas jejaring dengan sesama warga yang berada di komunitas yang sama."}
            </p>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center min-w-[80px]">
                <span className="text-base sm:text-lg font-black block font-mono text-emerald-400">
                  {currentTab === "kabar"
                    ? feedItems.length
                    : currentTab === "percakapan"
                    ? convResult.conversations.length + groupRoomsResult.rooms.length
                    : registeredUsersResult.totalCount}
                </span>
                <span className="text-[10px] text-slate-300 uppercase font-bold">
                  {currentTab === "kabar"
                    ? "Kabar Aktif"
                    : currentTab === "percakapan"
                    ? "Obrolan"
                    : isSuperAdmin
                    ? "Semua Warga"
                    : "Warga Komunitas"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/15 text-xs text-slate-300 font-medium">
          <Megaphone className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            {currentTab === "kabar"
              ? "Bagikan kabar atau tips kesehatan dengan menekan tombol buat postingan di pojok bawah."
              : currentTab === "percakapan"
              ? isSuperAdmin
                ? "Akses Super Admin: Anda dapat melakukan percakapan dengan siapa saja yang terdaftar."
                : "Percakapan terenkripsi aman antar warga yang berada dalam satu komunitas."
              : isSuperAdmin
              ? "Akses Super Admin: Menampilkan seluruh pengguna yang telah registrasi di Jarimas-ID."
              : "Hanya menampilkan akun pengguna yang bergabung dalam komunitas yang sama dengan Anda."}
          </span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. TOP 3 MAIN TABS NAVIGATION                             */}
      {/* ========================================================= */}
      <Suspense fallback={<div className="h-14 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />}>
        <KabarMainTabs
          currentTab={currentTab}
          totalFeedCount={feedItems.length}
          totalUnreadChat={totalUnreadChat}
          totalCitizensCount={registeredUsersResult.totalCount}
        />
      </Suspense>

      {/* ========================================================= */}
      {/* 3. KONTEN TAB SESUAI PILIHAN                              */}
      {/* ========================================================= */}

      {/* ----------------- TAB 1: KABAR WARGA -------------------- */}
      {currentTab === "kabar" && (
        <div className="space-y-4">
          <Suspense fallback={<div className="h-14 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />}>
            <KabarFilter
              currentSort={currentSort}
              currentVisibility={currentVisibility}
            />
          </Suspense>

          <main className="space-y-4">
            {feedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4 shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400">
                  <MessageSquarePlus className="h-7 w-7 stroke-[1.5px]" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Belum Ada Kabar di Kategori Ini
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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

      {/* ------------ TAB 2 (TENGAH): PERCAKAPAN ----------------- */}
      {currentTab === "percakapan" && (
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
            />
          )}
        </div>
      )}

      {/* ----------------- TAB 3: DAFTAR WARGA ------------------- */}
      {currentTab === "warga" && (
        <div className="space-y-4">
          {!currentUserId ? (
            <WargaLockedCard totalUsersCount={registeredUsersResult.totalCount} />
          ) : (
            <DaftarWargaKabarSection
              initialUsers={registeredUsersResult.users || []}
              currentUserId={currentUserId}
            />
          )}
        </div>
      )}
    </div>
  );
}
