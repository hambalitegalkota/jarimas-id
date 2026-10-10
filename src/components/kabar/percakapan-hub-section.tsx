"use client";

import { useState } from "react";
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  HeartPulse,
  GraduationCap,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  UserPlus,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { ChatDrawerModal } from "@/components/warga/chat-drawer-modal";
import { GroupChatModal } from "./group-chat-modal";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import {
  RecentConversationItem,
  GrupChatRoom,
  RegisteredUserItem,
  JARIMAS_BOT_ID,
  JARIMAS_BOT_NAME,
} from "@/types/database";

interface PercakapanHubSectionProps {
  conversations: RecentConversationItem[];
  rooms: GrupChatRoom[];
  allUsers: RegisteredUserItem[];
  currentUserId: string | null;
  isSuperAdmin?: boolean;
}

export function PercakapanHubSection({
  conversations,
  rooms,
  allUsers,
  currentUserId,
  isSuperAdmin = false,
}: PercakapanHubSectionProps) {
  const { onlineUserIds, isUserOnline } = useGlobalMessageNotification();
  const [subTab, setSubTab] = useState<"pribadi" | "grup">("pribadi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDirectUser, setSelectedDirectUser] = useState<RegisteredUserItem | null>(null);
  const [selectedGroupRoom, setSelectedGroupRoom] = useState<GrupChatRoom | null>(null);
  const [showNewChatSelector, setShowNewChatSelector] = useState(false);

  // Total unread pesan pribadi
  const totalUnreadDirect = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Filter 1-on-1 Conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.partnerName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      c.partnerCommunity?.toLowerCase().includes(q)
    );
  });

  // Filter Group Chat Rooms
  const filteredRooms = rooms.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      r.nama.toLowerCase().includes(q) ||
      r.kecamatan?.toLowerCase().includes(q) ||
      r.kelurahan?.toLowerCase().includes(q) ||
      r.jenis.toLowerCase().includes(q)
    );
  });

  // Filter New Chat Citizen Candidates (excluding current user) & Urutkan Pengguna Aktif di Posisi Atas
  const candidateCitizens = allUsers
    .filter((u) => u.id !== currentUserId)
    .filter((u) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        u.nama_lengkap.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.komunitas_list?.some((c) => c.nama.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // Prioritaskan pengguna yang sedang aktif online di web di barisan paling atas
      const aOnline = onlineUserIds.has(a.id) ? 1 : 0;
      const bOnline = onlineUserIds.has(b.id) ? 1 : 0;
      if (aOnline !== bOnline) {
        return bOnline - aOnline;
      }
      return a.nama_lengkap.localeCompare(b.nama_lengkap, "id-ID");
    });

  const onlineCandidatesCount = candidateCitizens.filter((u) =>
    onlineUserIds.has(u.id)
  ).length;

  const handleOpenDirectChatFromPartnerId = (partnerId: string) => {
    if (partnerId === JARIMAS_BOT_ID) {
      setSelectedDirectUser({
        id: JARIMAS_BOT_ID,
        nama_lengkap: JARIMAS_BOT_NAME,
        is_super_admin: false,
        created_at: new Date().toISOString(),
      });
      return;
    }

    const foundUser = allUsers.find((u) => u.id === partnerId);
    if (foundUser) {
      setSelectedDirectUser(foundUser);
    } else {
      const conv = conversations.find((c) => c.partnerId === partnerId);
      setSelectedDirectUser({
        id: partnerId,
        nama_lengkap: conv?.partnerName || "Warga Jarimas",
        avatar_url: conv?.partnerAvatar || null,
        is_super_admin: conv?.partnerRole === "Super Admin",
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* 1. SUB-TABS (PERCAKAPAN PRIBADI VS PERCAKAPAN GRUP)       */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700/80 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSubTab("pribadi");
              setShowNewChatSelector(false);
            }}
            className={`flex-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              subTab === "pribadi"
                ? "bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <span>Percakapan Pribadi</span>
            {totalUnreadDirect > 0 && (
              <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-mono font-black animate-pulse">
                {totalUnreadDirect}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab("grup");
              setShowNewChatSelector(false);
            }}
            className={`flex-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              subTab === "grup"
                ? "bg-white dark:bg-slate-900 text-indigo-800 dark:text-indigo-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Users className="h-4 w-4 text-indigo-600" />
            <span>Percakapan Grup Komunitas</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              subTab === "pribadi"
                ? "Cari nama kontak atau pesan..."
                : "Cari grup posyandu/RT/RW..."
            }
            className="w-full min-h-[42px] rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SUB-TAB KONTEN: PERCAKAPAN PRIBADI (1-ON-1 CHAT)       */}
      {/* ========================================================= */}
      {subTab === "pribadi" && (
        <div className="space-y-3.5">
          {/* Quick Action: Mulai Chat Baru */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-2 border-emerald-200/80 dark:border-emerald-900/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                  Ingin Memulai Obrolan Baru?
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kirim pesan pribadi langsung ke tetangga, kader posyandu, atau pengurus RT/RW.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewChatSelector(!showNewChatSelector)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 text-xs font-extrabold text-white transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{showNewChatSelector ? "Tutup" : "Pilih Kontak"}</span>
            </button>
          </div>

          {/* New Chat Contact Selector Grid (if opened) */}
          {showNewChatSelector && (
            <div className="p-4 sm:p-5 rounded-3xl border-2 border-emerald-400/80 dark:border-emerald-700 bg-white dark:bg-slate-900 space-y-3.5 shadow-md shadow-emerald-500/5 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    PILIH WARGA / KADER UNTUK MEMULAI CHAT
                  </span>
                  {onlineCandidatesCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 shadow-2xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span>{onlineCandidatesCount} Sedang Aktif di Web</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {candidateCitizens.length} Kontak Tersedia
                </span>
              </div>

              {/* Notifikasi Deteksi Pengunjung Aktif Realtime */}
              <div className="flex items-start sm:items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-300 dark:border-emerald-800/80 text-xs text-slate-800 dark:text-slate-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                    <span>Deteksi Pengunjung Aktif Realtime</span>
                    {onlineCandidatesCount > 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px]">
                        • {onlineCandidatesCount} warga sedang online saat ini
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px]">
                        • Siap mendeteksi warga yang sedang membuka web
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {onlineCandidatesCount > 0
                      ? "Pengguna yang sedang aktif mengunjungi website ditandai dengan lingkaran hijau bercahaya dan ditempatkan otomatis pada barisan paling atas."
                      : "Daftar diurutkan otomatis dengan memprioritaskan akun yang aktif. Belum ada pengguna lain yang sedang online saat ini."}
                  </p>
                </div>
              </div>

              {candidateCitizens.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  Belum ada kontak satu komunitas yang ditemukan. Bergabunglah dengan komunitas Posyandu, Satuan PAUD, atau Forum RT/RW untuk mulai menjalin percakapan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {candidateCitizens.map((userItem) => {
                    const isOnline = onlineUserIds.has(userItem.id);
                    return (
                      <button
                        key={userItem.id}
                        type="button"
                        onClick={() => {
                          setSelectedDirectUser(userItem);
                          setShowNewChatSelector(false);
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer group relative ${
                          isOnline
                            ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 shadow-xs ring-1 ring-emerald-400/40"
                            : "border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        {/* Avatar & Online status indicator */}
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                            {userItem.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={userItem.avatar_url}
                                alt={userItem.nama_lengkap}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <span>{userItem.nama_lengkap.charAt(0).toUpperCase()}</span>
                            )}
                          </div>

                          {/* Glowing Animated Online Dot */}
                          {isOnline ? (
                            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                            </span>
                          ) : (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                              {userItem.nama_lengkap}
                            </h5>
                            {isOnline && (
                              <span className="rounded-full bg-emerald-600 text-white px-1.5 py-0.2 text-[8px] font-black tracking-wider shrink-0 uppercase shadow-2xs animate-pulse">
                                Online
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[10px] truncate ${
                              isOnline
                                ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                                : "text-slate-400"
                            }`}
                          >
                            {isOnline
                              ? "🟢 Sedang Aktif di Web"
                              : userItem.komunitas_list?.[0]?.nama || "Warga Kota Tegal"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active 1-on-1 Conversations List */}
          {filteredConversations.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Belum Ada Percakapan Pribadi
                </h4>
                <p className="text-xs text-slate-500">
                  Mulai jalin silaturahmi dengan menekan tombol &quot;Pilih Kontak&quot; di atas atau melalui tab Daftar Warga.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((c) => {
                const initial = c.partnerName.charAt(0).toUpperCase();
                const isPartnerOnline = isUserOnline(c.partnerId);
                const timeStr = new Date(c.lastMessageAt).toLocaleDateString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "numeric",
                  month: "short",
                });

                return (
                  <button
                    key={c.partnerId}
                    type="button"
                    onClick={() => handleOpenDirectChatFromPartnerId(c.partnerId)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-white dark:bg-slate-900 hover:bg-emerald-50/20 dark:hover:bg-slate-800/70 transition-all cursor-pointer text-left shadow-2xs group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Avatar with Live Indicator */}
                      <div className="relative shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-800 text-white font-black text-base shadow-sm border border-white dark:border-slate-800">
                          {c.partnerAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.partnerAvatar}
                              alt={c.partnerName}
                              className="h-full w-full rounded-2xl object-cover"
                            />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>

                        {/* Glowing Online indicator if partner is active */}
                        {isPartnerOnline ? (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                          </span>
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" />
                        )}
                      </div>

                      {/* Partner Name & Last Message */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 transition-colors">
                              {c.partnerName}
                            </h4>
                            {isPartnerOnline && (
                              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 dark:text-emerald-300 shrink-0">
                                Online
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {timeStr}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          {c.isLastMessageMine && (
                            <span className="text-emerald-600 font-semibold text-[11px]">
                              Anda:
                            </span>
                          )}
                          <span className="truncate">{c.lastMessage}</span>
                        </p>
                      </div>
                    </div>

                    {/* Unread Badge */}
                    {c.unreadCount > 0 && (
                      <span className="ml-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-black text-white font-mono shadow-xs shrink-0 animate-pulse">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-TAB KONTEN: PERCAKAPAN GRUP KOMUNITAS              */}
      {/* ========================================================= */}
      {subTab === "grup" && (
        <div className="space-y-3">
          {filteredRooms.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tidak Ada Grup yang Sesuai
                </h4>
                <p className="text-xs text-slate-500">
                  Coba kata kunci pencarian lain atau jelajahi komunitas Posyandu dan RT/RW.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedGroupRoom(room)}
                  className="flex flex-col justify-between p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-900 hover:bg-indigo-50/20 dark:hover:bg-slate-800/70 transition-all cursor-pointer text-left shadow-2xs group"
                >
                  <div className="space-y-2.5 w-full">
                    {/* Header Group */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-800 text-white font-bold shadow-xs">
                          {room.jenis === "posyandu" ? (
                            <HeartPulse className="h-5 w-5" />
                          ) : room.jenis === "satuan_paud" ? (
                            <GraduationCap className="h-5 w-5" />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors truncate">
                            {room.nama}
                          </h4>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {room.jumlah_anggota} Anggota • {room.kelurahan || "Kota Tegal"}
                          </span>
                        </div>
                      </div>

                      {room.is_member && (
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[9px] font-black text-indigo-800 dark:text-indigo-300 shrink-0">
                          Anggota
                        </span>
                      )}
                    </div>

                    {/* Last Message Preview */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      {room.last_message ? (
                        <p className="line-clamp-1">
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                            {room.last_message.sender_name}:
                          </strong>{" "}
                          {room.last_message.pesan}
                        </p>
                      ) : (
                        <span className="italic text-slate-400">
                          Belum ada obrolan terbaru. Klik untuk memulai!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Forum Komunitas
                    </span>
                    <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      Buka Obrolan <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODALS (DIRECT & GROUP)                                */}
      {/* ========================================================= */}
      <ChatDrawerModal
        isOpen={!!selectedDirectUser}
        onClose={() => setSelectedDirectUser(null)}
        targetUser={selectedDirectUser}
        currentUserId={currentUserId}
      />

      <GroupChatModal
        isOpen={!!selectedGroupRoom}
        onClose={() => setSelectedGroupRoom(null)}
        room={selectedGroupRoom}
        currentUserId={currentUserId}
      />
    </div>
  );
}
