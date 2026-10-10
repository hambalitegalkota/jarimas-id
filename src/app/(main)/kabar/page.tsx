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
  }>;
}

export default async function KabarPage({ searchParams }: KabarPageProps) {
  const resolvedParams = await searchParams;
  const rawTab = resolvedParams.tab;
  const isExplicitlyClosed =
    rawTab === "closed" ||
    rawTab === "none" ||
    rawTab === "sembunyi" ||
    rawTab === "tutup";

  const currentTab: "kabar" | "percakapan" | "warga" | null = isExplicitlyClosed
    ? null
    : rawTab === "percakapan" || rawTab === "warga"
    ? rawTab
    : "kabar";
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
        .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
        .eq("id", currentUserId)
        .maybeSingle();

      isSuperAdmin = checkIsSuperAdmin({
        ...profile,
        id: currentUserId,
      });
    } catch {
      // Abaikan jika tabel profil belum ada
    }
  }

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
      activeColorBg: "bg-emerald-600 dark:bg-emerald-700",
      activeBorder: "border-emerald-500",
      badgeColor: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30",
      hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600",
      hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
    },
    {
      id: "percakapan" as const,
      title: "Pusat Percakapan Warga",
      subtitle: isSuperAdmin
        ? "Kirim pesan langsung ke siapa saja atau berdiskusi di ruang obrolan grup"
        : "Kirim pesan langsung ke sesama warga satu komunitas atau diskusi di grup",
      badgeText: totalUnreadChat > 0 ? `${totalUnreadChat} Pesan Baru` : `${convResult.conversations.length + groupRoomsResult.rooms.length} Obrolan`,
      icon: MessageCircle,
      activeColorBg: "bg-teal-600 dark:bg-teal-700",
      activeBorder: "border-teal-500",
      badgeColor: "bg-teal-500/20 text-teal-100 border-teal-400/30",
      hoverBorder: "hover:border-teal-400 dark:hover:border-teal-600",
      hoverBg: "hover:bg-teal-50/50 dark:hover:bg-teal-950/20",
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100 dark:bg-teal-950",
    },
    {
      id: "warga" as const,
      title: isSuperAdmin ? "Daftar Warga Terdaftar (Super Admin)" : "Daftar Warga Satu Komunitas",
      subtitle: isSuperAdmin
        ? "Melihat dan mengelola seluruh akun pengguna yang terdaftar di Jarimas-ID"
        : "Temukan teman, pantau pertemanan, dan perluas jejaring warga satu komunitas",
      badgeText: `${registeredUsersResult.totalCount} Warga`,
      icon: Users,
      activeColorBg: "bg-indigo-600 dark:bg-indigo-700",
      activeBorder: "border-indigo-500",
      badgeColor: "bg-indigo-500/20 text-indigo-100 border-indigo-400/30",
      hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-600",
      hoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-950",
    },
  ];

  // Urutkan kategori: Kartu yang terbuka posisinya otomatis berada di paling atas
  const sortedKabarCategories = [
    ...(currentTab ? kabarCategories.filter((c) => c.id === currentTab) : []),
    ...kabarCategories.filter((c) => c.id !== currentTab),
  ];

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
                  : currentTab === "warga"
                  ? "JEJARING WARGA & PERTEMANAN"
                  : "KABAR & INTERAKSI WARGA"}
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
                : currentTab === "warga"
                ? isSuperAdmin
                  ? "Daftar Warga Terdaftar (Super Admin)"
                  : "Daftar Warga Satu Komunitas"
                : "Kabar & Komunikasi Warga"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Jelajahi informasi publik seputar penimbangan posyandu, ruang percakapan warga, dan direktori pertemanan komunitas se-Kota Tegal.
            </p>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center min-w-[80px]">
                <span className="text-base sm:text-lg font-black block font-mono text-emerald-400">
                  {feedItems.length}
                </span>
                <span className="text-[10px] text-slate-300 uppercase font-bold">
                  Kabar Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/15 text-xs text-slate-300 font-medium">
          <Megaphone className="h-4 w-4 text-emerald-400 shrink-0" />
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
              className={`rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
                isOpen
                  ? `border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-2 sm:p-3 shadow-md`
                  : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs ${cat.hoverBorder}`
              }`}
            >
              {/* Accordion Header / Trigger */}
              {isOpen ? (
                <Link
                  href={createTabUrl("closed")}
                  title="Klik untuk menyembunyikan bagian ini"
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
                    <span className="text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                      Sembunyikan
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
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
                <div className="p-2 sm:p-4 animate-in fade-in-50 duration-300 space-y-4">
                  {cat.id === "kabar" && (
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
                        />
                      )}
                    </div>
                  )}

                  {/* Tombol Sembunyikan Bagian di Bawah Konten */}
                  <div className="flex justify-center pt-2 pb-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <Link
                      href={createTabUrl("closed")}
                      title="Klik untuk menyembunyikan bagian ini"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer active:scale-98"
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
