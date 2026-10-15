"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Calendar,
  Settings,
  Trash2,
  UserCheck,
} from "lucide-react";
import { ChatDrawerModal } from "@/components/warga/chat-drawer-modal";
import { GroupChatModal } from "./group-chat-modal";
import { CreateGrupKegiatanModal } from "./create-grup-kegiatan-modal";
import { ManageGrupMembersModal } from "./manage-grup-members-modal";
import { deleteGrupKegiatan } from "@/app/actions/grup-kegiatan";
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
  isAdminPusat?: boolean;
  canManageGrupKegiatan?: boolean;
}

export function PercakapanHubSection({
  conversations,
  rooms,
  allUsers,
  currentUserId,
  isSuperAdmin = false,
  isAdminPusat = false,
  canManageGrupKegiatan = false,
}: PercakapanHubSectionProps) {
  const router = useRouter();
  const { onlineUserIds, isUserOnline } = useGlobalMessageNotification();
  const [subTab, setSubTab] = useState<"pribadi" | "grup">("pribadi");
  const [grupFilterTab, setGrupFilterTab] = useState<"semua" | "kegiatan" | "komunitas">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDirectUser, setSelectedDirectUser] = useState<RegisteredUserItem | null>(null);
  const [selectedGroupRoom, setSelectedGroupRoom] = useState<GrupChatRoom | null>(null);
  const [showNewChatSelector, setShowNewChatSelector] = useState(false);

  // Modal State untuk Grup Kegiatan
  const [isCreateGrupModalOpen, setIsCreateGrupModalOpen] = useState(false);
  const [managingMembersRoom, setManagingMembersRoom] = useState<GrupChatRoom | null>(null);

  const canManage = isSuperAdmin || isAdminPusat || canManageGrupKegiatan;

  // Hitung jumlah grup berdasarkan jenis
  const kegiatanRoomsCount = rooms.filter((r) => r.is_kegiatan || r.jenis === "kegiatan").length;
  const komunitasRoomsCount = rooms.filter((r) => !r.is_kegiatan && r.jenis !== "kegiatan").length;

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
  const filteredRooms = rooms
    .filter((r) => {
      if (grupFilterTab === "kegiatan") return r.is_kegiatan || r.jenis === "kegiatan";
      if (grupFilterTab === "komunitas") return !r.is_kegiatan && r.jenis !== "kegiatan";
      return true;
    })
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        r.nama.toLowerCase().includes(q) ||
        r.kecamatan?.toLowerCase().includes(q) ||
        r.kelurahan?.toLowerCase().includes(q) ||
        r.jenis.toLowerCase().includes(q) ||
        r.creator_name?.toLowerCase().includes(q)
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

  const handleDeleteKegiatanRoom = async (e: React.MouseEvent, room: GrupChatRoom) => {
    e.stopPropagation();
    const confirm = window.confirm(
      `Apakah Anda yakin ingin menghapus grup percakapan kegiatan "${room.nama}"? Seluruh riwayat obrolan di grup ini akan dihapus permanen.`
    );
    if (!confirm) return;

    try {
      const res = await deleteGrupKegiatan(room.id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.message || "Gagal menghapus grup kegiatan.");
      }
    } catch (err: any) {
      alert(err?.message || "Terjadi kesalahan.");
    }
  };

  const handleOpenManageMembers = (e: React.MouseEvent, room: GrupChatRoom) => {
    e.stopPropagation();
    setManagingMembersRoom(room);
  };

  const handleNewGroupCreated = (newGroupId: string) => {
    router.refresh();
    const created = rooms.find((r) => r.id === newGroupId);
    if (created) {
      setSelectedGroupRoom(created);
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
            <span>Percakapan Grup</span>
            {kegiatanRoomsCount > 0 && (
              <span className="rounded-full bg-emerald-600 text-white px-1.5 py-0.2 text-[10px] font-mono font-black">
                {rooms.length}
              </span>
            )}
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
                : "Cari grup posyandu/kegiatan/RT/RW..."
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

              {/* Citizen Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {candidateCitizens.map((citizen) => {
                  const isOnline = onlineUserIds.has(citizen.id);
                  const initial = (citizen.nama_lengkap || "W")[0].toUpperCase();

                  return (
                    <button
                      key={citizen.id}
                      type="button"
                      onClick={() => {
                        setSelectedDirectUser(citizen);
                        setShowNewChatSelector(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-slate-800 transition-all cursor-pointer text-left group"
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-xs">
                          {citizen.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={citizen.avatar_url}
                              alt={citizen.nama_lengkap}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white dark:border-slate-900" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate block">
                          {citizen.nama_lengkap}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {citizen.komunitas_list && citizen.komunitas_list.length > 0
                            ? citizen.komunitas_list[0].nama
                            : citizen.email || "Warga Jarimas"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Chat Conversations Feed */}
          {filteredConversations.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Belum Ada Riwayat Percakapan
                </h4>
                <p className="text-xs text-slate-500">
                  Gunakan tombol &quot;Pilih Kontak&quot; di atas untuk memulai obrolan dengan tetangga atau kader.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((c) => {
                const isPartnerOnline = isUserOnline(c.partnerId);
                const initial = (c.partnerName || "W")[0].toUpperCase();
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
      {/* 3. SUB-TAB KONTEN: PERCAKAPAN GRUP                        */}
      {/* ========================================================= */}
      {subTab === "grup" && (
        <div className="space-y-4">
          {/* ======================================================= */}
          {/* BANNER UTAMA BUAT GRUP KEGIATAN (ADMIN PUSAT / SUPER)   */}
          {/* ======================================================= */}
          {canManage && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 dark:border-emerald-600/30 bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-indigo-600/15 p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                        Percakapan Grup Kegiatan
                      </h3>
                      <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-black tracking-wider uppercase font-mono shadow-2xs">
                        FITUR ADMIN
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                      Buat ruang percakapan kegiatan baru (penanganan ATS, rakor posyandu, pelatihan kader)
                      dan undang pengguna terpilih secara langsung tanpa perlu konfirmasi manual.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateGrupModalOpen(true)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Grup Kegiatan Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* Filter Pills Kategori Grup (Semua / Kegiatan / Komunitas) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => setGrupFilterTab("semua")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                grupFilterTab === "semua"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              Semua Grup ({rooms.length})
            </button>

            <button
              type="button"
              onClick={() => setGrupFilterTab("kegiatan")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                grupFilterTab === "kegiatan"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Grup Kegiatan ({kegiatanRoomsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setGrupFilterTab("komunitas")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                grupFilterTab === "komunitas"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Grup Komunitas & Posyandu ({komunitasRoomsCount})</span>
            </button>
          </div>

          {/* Group Card Grid */}
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
                  {canManage
                    ? "Klik tombol 'Buat Grup Kegiatan Baru' di atas untuk memulai koordinasi kegiatan."
                    : "Coba kata kunci pencarian lain atau jelajahi komunitas Posyandu dan RT/RW."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredRooms.map((room) => {
                const isKegiatan = room.is_kegiatan || room.jenis === "kegiatan";

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedGroupRoom(room)}
                    className={`flex flex-col justify-between p-4 rounded-3xl border-2 transition-all cursor-pointer text-left shadow-2xs group relative ${
                      isKegiatan
                        ? "border-emerald-300/80 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5"
                        : "border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-900 hover:bg-indigo-50/20 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="space-y-3 w-full">
                      {/* Top Badges & Meta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isKegiatan ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                              <Sparkles className="h-3 w-3" />
                              GRUP KEGIATAN
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                              {room.jenis.replace("_", " ")}
                            </span>
                          )}

                          {room.is_member && (
                            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[9px] font-black text-indigo-800 dark:text-indigo-300">
                              Tergabung
                            </span>
                          )}
                        </div>

                        {/* Admin Action Shortcut for Kegiatan Room */}
                        {isKegiatan && canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenManageMembers(e, room)}
                              title="Kelola & Tambah Anggota"
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteKegiatanRoom(e, room)}
                              title="Hapus Grup Kegiatan"
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Header Title & Icon */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold shadow-xs ${
                            isKegiatan
                              ? "bg-gradient-to-tr from-amber-600 via-emerald-600 to-teal-700"
                              : room.jenis === "posyandu"
                              ? "bg-gradient-to-tr from-rose-600 to-pink-700"
                              : room.jenis === "satuan_paud"
                              ? "bg-gradient-to-tr from-blue-600 to-indigo-800"
                              : "bg-gradient-to-tr from-indigo-600 to-indigo-800"
                          }`}
                        >
                          {isKegiatan ? (
                            <Sparkles className="h-5 w-5" />
                          ) : room.jenis === "posyandu" ? (
                            <HeartPulse className="h-5 w-5" />
                          ) : room.jenis === "satuan_paud" ? (
                            <GraduationCap className="h-5 w-5" />
                          ) : (
                            <Building2 className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {room.nama}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {room.jumlah_anggota} Pengguna Tergabung •{" "}
                            {room.creator_name ? `Oleh ${room.creator_name}` : room.kelurahan || "Kota Tegal"}
                          </p>
                        </div>
                      </div>

                      {/* Room Description Preview */}
                      {room.deskripsi && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic leading-relaxed">
                          &quot;{room.deskripsi}&quot;
                        </p>
                      )}

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
                            Belum ada pesan terbaru. Klik untuk memulai obrolan!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {isKegiatan ? "Forum Kegiatan" : "Forum Komunitas"}
                      </span>
                      <span
                        className={`font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 ${
                          isKegiatan
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        Buka Obrolan <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODALS (DIRECT, GROUP, CREATE KEGIATAN, KELOLA ANGGOTA) */}
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
        allUsers={allUsers}
        canManage={canManage}
      />

      {/* Modal Buat Percakapan Grup Kegiatan (Admin Pusat / Super Admin) */}
      <CreateGrupKegiatanModal
        isOpen={isCreateGrupModalOpen}
        onClose={() => setIsCreateGrupModalOpen(false)}
        allUsers={allUsers}
        currentUserId={currentUserId}
        onGroupCreated={handleNewGroupCreated}
      />

      {/* Modal Kelola Anggota dari Card */}
      <ManageGrupMembersModal
        isOpen={!!managingMembersRoom}
        onClose={() => setManagingMembersRoom(null)}
        room={managingMembersRoom}
        allUsers={allUsers}
        canManage={canManage}
        currentUserId={currentUserId}
        onMembersUpdated={() => router.refresh()}
      />
    </div>
  );
}
