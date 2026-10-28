"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getGroupMessages } from "@/app/actions/pertemanan";
import { createClient } from "@/utils/supabase/client";
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
  initialGroupId?: string | null;
}

export function PercakapanHubSection({
  conversations,
  rooms,
  allUsers,
  currentUserId,
  isSuperAdmin = false,
  isAdminPusat = false,
  canManageGrupKegiatan = false,
  initialGroupId = null,
}: PercakapanHubSectionProps) {
  const router = useRouter();
  const {
    onlineUserIds,
    isUserOnline,
    totalUnreadDirect: ctxUnreadDirect,
    totalUnreadGroup: ctxUnreadGroup,
    groupUnreadCounts,
    markGroupAsRead,
  } = useGlobalMessageNotification();
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

  // Total unread pesan pribadi & pesan grup
  const totalUnreadDirect = ctxUnreadDirect > 0 ? ctxUnreadDirect : conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const totalUnreadGroup = ctxUnreadGroup;

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

  const searchParams = useSearchParams();
  const urlGroupId = initialGroupId || searchParams.get("groupId") || searchParams.get("room");

  // 1. Sinkronisasi URL groupId / room agar obrolan langsung terbuka otomatis
  useEffect(() => {
    if (urlGroupId) {
      setSubTab("grup");
      const matched = rooms.find((r) => r.id === urlGroupId);
      if (matched) {
        setSelectedGroupRoom(matched);
      } else {
        getGroupMessages(urlGroupId).then((res) => {
          if (res.success && res.komunitas) {
            setSelectedGroupRoom({
              id: res.komunitas.id,
              nama: res.komunitas.nama || "Percakapan Grup Kegiatan",
              jenis: res.komunitas.jenis || "kegiatan",
              deskripsi: res.komunitas.deskripsi,
              is_kegiatan: true,
              jumlah_anggota: 1,
              is_member: true,
            } as GrupChatRoom);
          }
        });
      }
    }
  }, [urlGroupId, rooms]);

  // 2. Supabase Realtime Listener untuk memperbarui daftar grup saat ada grup/pesan baru
  useEffect(() => {
    if (!currentUserId) return;
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`hub_percakapan_sync_${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "pesan_grup",
          },
          () => {
            router.refresh();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "anggota_komunitas",
            filter: `user_id=eq.${currentUserId}`,
          },
          () => {
            router.refresh();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime sync percakapan hub notice:", err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // Cleanup
        }
      }
    };
  }, [currentUserId, router]);

  const handleOpenManageMembers = (e: React.MouseEvent, room: GrupChatRoom) => {
    e.stopPropagation();
    setManagingMembersRoom(room);
  };

  const handleNewGroupCreated = (newGroupId: string, newRoom?: GrupChatRoom) => {
    // 1. Langsung alihkan tab ke obrolan grup
    setSubTab("grup");

    // 2. Refresh server data agar daftar room diperbarui
    router.refresh();

    // 3. Admin LANGSUNG dibawa ke modal obrolan grup yang baru dibuat
    if (newRoom) {
      setSelectedGroupRoom(newRoom);
    } else {
      const created = rooms.find((r) => r.id === newGroupId);
      if (created) {
        setSelectedGroupRoom(created);
      } else {
        setSelectedGroupRoom({
          id: newGroupId,
          nama: "Percakapan Grup Kegiatan",
          jenis: "kegiatan",
          is_kegiatan: true,
          jumlah_anggota: 1,
          is_member: true,
        } as GrupChatRoom);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* 1. SUB-TABS (PERCAKAPAN PRIBADI VS PERCAKAPAN GRUP)       */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex rounded-lg bg-card p-1 border border-border gap-1 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setSubTab("pribadi");
              setShowNewChatSelector(false);
            }}
            className={`flex-1 inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all cursor-pointer ${
              subTab === "pribadi"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Percakapan Pribadi</span>
            {totalUnreadDirect > 0 && (
              <span className="rounded-full bg-secondary text-secondary-foreground px-1.5 py-0.2 text-[10px] font-mono font-bold animate-pulse">
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
            className={`flex-1 inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all cursor-pointer ${
              subTab === "grup"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Percakapan Grup</span>
            {totalUnreadGroup > 0 ? (
              <span className="rounded-full bg-secondary text-secondary-foreground px-1.5 py-0.2 text-[10px] font-mono font-bold animate-pulse">
                {totalUnreadGroup}
              </span>
            ) : rooms.length > 0 ? (
              <span className="rounded-full bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {rooms.length}
              </span>
            ) : null}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              subTab === "pribadi"
                ? "Cari kontak atau pesan..."
                : "Cari grup posyandu/kegiatan..."
            }
            className="w-full min-h-[38px] rounded-lg border border-border bg-background pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SUB-TAB KONTEN: PERCAKAPAN PRIBADI (1-ON-1 CHAT)       */}
      {/* ========================================================= */}
      {subTab === "pribadi" && (
        <div className="space-y-3">
          {/* Quick Action: Mulai Chat Baru */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-card border border-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shadow-2xs">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Ingin Memulai Obrolan Baru?
                </h4>
                <p className="text-2xs sm:text-xs text-muted-foreground">
                  Kirim pesan pribadi langsung ke tetangga, kader posyandu, atau pengurus RT/RW.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewChatSelector(!showNewChatSelector)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showNewChatSelector ? "Tutup" : "Pilih Kontak"}</span>
            </button>
          </div>

          {/* New Chat Contact Selector Grid (if opened) */}
          {showNewChatSelector && (
            <div className="p-3 sm:p-4 rounded-lg border border-primary/30 bg-card space-y-3 shadow-sm animate-in fade-in slide-in-from-top-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                    PILIH WARGA / KADER UNTUK MEMULAI CHAT
                  </span>
                  {onlineCandidatesCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-2xs font-semibold text-primary shadow-2xs">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                      </span>
                      <span>{onlineCandidatesCount} Aktif di Web</span>
                    </span>
                  )}
                </div>
                <span className="text-2xs font-medium text-muted-foreground">
                  {candidateCitizens.length} Kontak Tersedia
                </span>
              </div>

              {/* Citizen Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
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
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-primary/50 bg-background hover:bg-muted/50 transition-all cursor-pointer text-left group"
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shadow-2xs">
                          {citizen.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={citizen.avatar_url}
                              alt={citizen.nama_lengkap}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border border-background" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary truncate block">
                          {citizen.nama_lengkap}
                        </span>
                        <span className="text-2xs text-muted-foreground truncate block">
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
            <div className="rounded-lg border border-dashed border-border bg-card p-6 sm:p-8 text-center space-y-2.5">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 max-w-sm mx-auto">
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Belum Ada Riwayat Percakapan
                </h4>
                <p className="text-2xs sm:text-xs text-muted-foreground">
                  Gunakan tombol &quot;Pilih Kontak&quot; di atas untuk memulai obrolan dengan tetangga atau kader.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
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
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 bg-card hover:bg-muted/40 transition-all cursor-pointer text-left shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar with Live Indicator */}
                      <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm shadow-2xs border border-primary/20">
                          {c.partnerAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.partnerAvatar}
                              alt={c.partnerName}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>

                        {isPartnerOnline ? (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background" />
                          </span>
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-muted-foreground/30 border border-background" />
                        )}
                      </div>

                      {/* Partner Name & Last Message */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {c.partnerName}
                            </h4>
                            {isPartnerOnline && (
                              <span className="rounded-md bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[8px] font-bold text-primary shrink-0">
                                Online
                              </span>
                            )}
                          </div>
                          <span className="text-2xs text-muted-foreground font-mono shrink-0">
                            {timeStr}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {c.isLastMessageMine && (
                            <span className="text-primary font-semibold text-2xs">
                              Anda:
                            </span>
                          )}
                          <span className="truncate">{c.lastMessage}</span>
                        </p>
                      </div>
                    </div>

                    {/* Unread Badge */}
                    {c.unreadCount > 0 && (
                      <span className="ml-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground font-mono shadow-xs shrink-0 animate-pulse">
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
        <div className="space-y-3.5">
          {/* ======================================================= */}
          {/* BANNER UTAMA BUAT GRUP KEGIATAN (ADMIN PUSAT / SUPER)   */}
          {/* ======================================================= */}
          {canManage && (
            <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-2xs">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        Percakapan Grup Kegiatan
                      </h3>
                      <span className="rounded-md bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 text-2xs font-bold tracking-wider uppercase font-mono">
                        FORUM KEGIATAN & WARGA
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                      Buat ruang percakapan kegiatan baru (penanganan stunting, posyandu, kelompok ronda, kegiatan warga, dll) dan undang anggota untuk koordinasi obrolan bersama.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateGrupModalOpen(true)}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Grup Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* Filter Pills Kategori Grup (Semua / Kegiatan / Komunitas) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <button
              type="button"
              onClick={() => setGrupFilterTab("semua")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                grupFilterTab === "semua"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              Semua Grup ({rooms.length})
            </button>

            <button
              type="button"
              onClick={() => setGrupFilterTab("kegiatan")}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                grupFilterTab === "kegiatan"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Grup Kegiatan ({kegiatanRoomsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setGrupFilterTab("komunitas")}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                grupFilterTab === "komunitas"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <Building2 className="h-3 w-3" />
              <span>Grup Posyandu & RT/RW ({komunitasRoomsCount})</span>
            </button>
          </div>

          {/* Group Card Grid */}
          {filteredRooms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 sm:p-8 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 max-w-sm mx-auto">
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Tidak Ada Grup yang Sesuai
                </h4>
                <p className="text-2xs sm:text-xs text-muted-foreground">
                  {canManage
                    ? "Klik tombol 'Buat Grup Baru' di atas untuk memulai koordinasi kegiatan."
                    : "Coba kata kunci pencarian lain atau jelajahi komunitas Posyandu dan RT/RW."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredRooms.map((room) => {
                const isKegiatan = room.is_kegiatan || room.jenis === "kegiatan";

                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedGroupRoom(room);
                      markGroupAsRead(room.id);
                    }}
                    className="flex flex-col justify-between p-3.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer text-left shadow-2xs group relative"
                  >
                    <div className="space-y-2.5 w-full">
                      {/* Top Badges & Meta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isKegiatan ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 border border-secondary/30 px-2 py-0.5 text-2xs font-bold text-secondary uppercase tracking-wide">
                              <Sparkles className="h-2.5 w-2.5" />
                              GRUP KEGIATAN
                            </span>
                          ) : (
                            <span className="rounded-md bg-muted border border-border px-1.5 py-0.5 text-2xs font-semibold text-muted-foreground uppercase">
                              {room.jenis.replace("_", " ")}
                            </span>
                          )}

                          {room.is_member && (
                            <span className="rounded-md bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-2xs font-bold text-primary">
                              Tergabung
                            </span>
                          )}

                          {(groupUnreadCounts[room.id] || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500 text-white px-2 py-0.5 text-2xs font-bold font-mono shadow-xs animate-pulse">
                              <span>{groupUnreadCounts[room.id]} Pesan Baru</span>
                            </span>
                          )}
                        </div>

                        {/* Creator / Admin Action Shortcut for Kegiatan Room */}
                        {isKegiatan && (isSuperAdmin || isAdminPusat || (Boolean(currentUserId) && room.created_by === currentUserId)) && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenManageMembers(e, room)}
                              title="Kelola & Tambah Anggota"
                              className="p-1 rounded-md bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            >
                              <UserPlus className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteKegiatanRoom(e, room)}
                              title="Hapus Grup Kegiatan"
                              className="p-1 rounded-md bg-muted text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Header Title & Icon */}
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shadow-2xs border border-primary/20">
                          {isKegiatan ? (
                            <Sparkles className="h-4 w-4" />
                          ) : room.jenis === "posyandu" ? (
                            <HeartPulse className="h-4 w-4" />
                          ) : room.jenis === "satuan_paud" ? (
                            <GraduationCap className="h-4 w-4" />
                          ) : (
                            <Building2 className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {room.nama}
                          </h4>
                          <p className="text-2xs text-muted-foreground line-clamp-1">
                            {room.jumlah_anggota} Pengguna •{" "}
                            {room.creator_name ? `Oleh ${room.creator_name}` : room.kelurahan || "Kota Tegal"}
                          </p>
                        </div>
                      </div>

                      {/* Room Description Preview */}
                      {room.deskripsi && (
                        <p className="text-2xs text-muted-foreground line-clamp-1 italic">
                          &quot;{room.deskripsi}&quot;
                        </p>
                      )}

                      {/* Last Message Preview */}
                      <div className="p-2 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground">
                        {room.last_message ? (
                          <p className="line-clamp-1">
                            <strong className="text-foreground font-semibold">
                              {room.last_message.sender_name}:
                            </strong>{" "}
                            {room.last_message.pesan}
                          </p>
                        ) : (
                          <span className="italic text-muted-foreground">
                            Belum ada pesan terbaru. Klik untuk memulai obrolan!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 mt-2 flex items-center justify-between border-t border-border text-2xs">
                      <span className="font-semibold text-muted-foreground uppercase">
                        {isKegiatan ? "Forum Kegiatan" : "Forum Komunitas"}
                      </span>
                      <span className="font-bold text-primary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
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
