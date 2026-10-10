"use client";

import { useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  Clock,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Building2,
  HeartPulse,
  GraduationCap,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  HeartHandshake,
  User,
} from "lucide-react";
import { sendFriendRequest, respondFriendRequest } from "@/app/actions/pertemanan";
import { ChatDrawerModal } from "@/components/warga/chat-drawer-modal";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import { isAdminPusat, isSuperAdmin } from "@/lib/utils";
import type { RegisteredUserItem } from "@/types/database";

interface DaftarWargaKabarSectionProps {
  initialUsers: RegisteredUserItem[];
  currentUserId: string | null;
}

export function DaftarWargaKabarSection({
  initialUsers,
  currentUserId,
}: DaftarWargaKabarSectionProps) {
  const { onlineUserIds } = useGlobalMessageNotification();
  const [users, setUsers] = useState<RegisteredUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatUser, setSelectedChatUser] = useState<RegisteredUserItem | null>(null);
  const [loadingActionUserId, setLoadingActionUserId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Filter pencarian & Prioritaskan pengguna online di posisi teratas
  const filterList = (list: RegisteredUserItem[]) => {
    let filtered = list;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = list.filter((u) => {
        const matchName = u.nama_lengkap.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchCommunity = u.komunitas_list?.some(
          (c) =>
            c.nama.toLowerCase().includes(q) ||
            c.peran.toLowerCase().includes(q) ||
            c.kecamatan?.toLowerCase().includes(q) ||
            c.kelurahan?.toLowerCase().includes(q)
        );
        return matchName || matchEmail || matchCommunity;
      });
    }

    return [...filtered].sort((a, b) => {
      const aOnline = onlineUserIds.has(a.id) ? 1 : 0;
      const bOnline = onlineUserIds.has(b.id) ? 1 : 0;
      if (aOnline !== bOnline) {
        return bOnline - aOnline;
      }
      return a.nama_lengkap.localeCompare(b.nama_lengkap, "id-ID");
    });
  };

  // Kategori 1: Teman Saya (Sudah berteman)
  const myFriends = filterList(
    users.filter((u) => u.id !== currentUserId && u.friendship_status === "accepted")
  );

  // Kategori 2: Permintaan Pertemanan
  const incomingRequests = filterList(
    users.filter((u) => u.id !== currentUserId && u.friendship_status === "pending_received")
  );
  const outgoingRequests = filterList(
    users.filter((u) => u.id !== currentUserId && u.friendship_status === "pending_sent")
  );

  // Kategori 3: Warga Lainnya (Belum berteman)
  const otherCitizens = filterList(
    users.filter(
      (u) =>
        u.id !== currentUserId &&
        u.friendship_status !== "accepted" &&
        u.friendship_status !== "pending_received" &&
        u.friendship_status !== "pending_sent"
    )
  );

  // User diri sendiri
  const selfUser = users.find((u) => u.id === currentUserId && !u.is_super_admin && !isSuperAdmin(u));


  const handleSendFriendRequest = async (targetUser: RegisteredUserItem) => {
    setLoadingActionUserId(targetUser.id);
    setActionFeedback(null);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id
          ? { ...u, friendship_status: "pending_sent" }
          : u
      )
    );

    try {
      const res = await sendFriendRequest(targetUser.id);
      if (res.success) {
        setActionFeedback(res.message);
        if (res.friendshipId) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === targetUser.id
                ? { ...u, friendship_id: res.friendshipId, friendship_status: "pending_sent" }
                : u
            )
          );
        }
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? { ...u, friendship_status: targetUser.friendship_status }
              : u
          )
        );
        setActionFeedback(res.message);
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, friendship_status: targetUser.friendship_status }
            : u
        )
      );
      setActionFeedback("Terjadi kesalahan sistem saat menambah teman.");
    } finally {
      setLoadingActionUserId(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleRespondFriendRequest = async (
    targetUser: RegisteredUserItem,
    action: "accept" | "reject" | "cancel"
  ) => {
    if (!targetUser.friendship_id) return;
    setLoadingActionUserId(targetUser.id);
    setActionFeedback(null);

    const oldStatus = targetUser.friendship_status;
    const newStatus = action === "accept" ? "accepted" : "none";

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id
          ? {
              ...u,
              friendship_status: newStatus,
              friendship_id: action === "accept" ? u.friendship_id : null,
            }
          : u
      )
    );

    try {
      const res = await respondFriendRequest(targetUser.friendship_id, action);
      if (res.success) {
        setActionFeedback(res.message);
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? { ...u, friendship_status: oldStatus }
              : u
          )
        );
        setActionFeedback(res.message);
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, friendship_status: oldStatus }
            : u
        )
      );
      setActionFeedback("Gagal memproses pertemanan.");
    } finally {
      setLoadingActionUserId(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const renderUserCard = (userItem: RegisteredUserItem) => {
    const initial = userItem.nama_lengkap.charAt(0).toUpperCase();
    const isOnline = onlineUserIds.has(userItem.id);
    const isLoading = loadingActionUserId === userItem.id;

    return (
      <div
        key={userItem.id}
        className={`flex flex-col justify-between p-4 rounded-2xl border-2 transition-all shadow-2xs ${
          isOnline
            ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500 ring-1 ring-emerald-400/20"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60"
        }`}
      >
        <div className="space-y-3">
          {/* Header Card */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-800 text-white font-black text-base shadow-sm border border-white dark:border-slate-800">
                {userItem.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userItem.avatar_url}
                    alt={userItem.nama_lengkap}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>

              {/* Glowing Online Indicator */}
              {isOnline ? (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </span>
              ) : (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                  {userItem.nama_lengkap}
                </h4>
                {isOnline && (
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.2 text-[8px] font-black text-emerald-800 dark:text-emerald-300 uppercase shrink-0 animate-pulse">
                    Online
                  </span>
                )}
                {(userItem.is_super_admin || isSuperAdmin(userItem)) ? (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 text-[9px] font-black text-amber-900 dark:text-amber-300 border border-amber-300">
                    Super Admin
                  </span>
                ) : (userItem.is_admin_pusat || isAdminPusat(userItem)) ? (
                  <span className="rounded-full bg-teal-100 dark:bg-teal-950/80 px-1.5 py-0.2 text-[9px] font-black text-teal-900 dark:text-teal-300 border border-teal-300">
                    Admin Pusat
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {isOnline ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    🟢 Sedang Aktif di Web
                  </span>
                ) : (
                  `Bergabung ${new Date(userItem.created_at).toLocaleDateString("id-ID", {
                    month: "short",
                    year: "numeric",
                  })}`
                )}
              </span>
            </div>
          </div>

          {/* Affiliation Tags */}
          <div className="pt-1">
            {userItem.komunitas_list && userItem.komunitas_list.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {userItem.komunitas_list.slice(0, 2).map((comm) => (
                  <span
                    key={comm.id}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full"
                  >
                    {comm.jenis === "posyandu" ? (
                      <HeartPulse className="h-3 w-3 text-emerald-600 shrink-0" />
                    ) : comm.jenis === "satuan_paud" ? (
                      <GraduationCap className="h-3 w-3 text-indigo-600 shrink-0" />
                    ) : (
                      <Building2 className="h-3 w-3 text-sky-600 shrink-0" />
                    )}
                    <span className="truncate">
                      {comm.peran} • {comm.nama}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Warga Kota Tegal
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Friendship Status Action */}
          <div>
            {userItem.friendship_status === "accepted" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>Berteman</span>
              </span>
            ) : userItem.friendship_status === "pending_sent" ? (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  <Clock className="h-3 w-3" />
                  <span>Terkirim</span>
                </span>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleRespondFriendRequest(userItem, "cancel")}
                  className="text-[10px] text-slate-400 hover:text-rose-600 underline"
                >
                  Batal
                </button>
              </div>
            ) : userItem.friendship_status === "pending_received" ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleRespondFriendRequest(userItem, "accept")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer shadow-xs"
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  <span>Terima</span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleRespondFriendRequest(userItem, "reject")}
                  className="p-1 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Tolak"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSendFriendRequest(userItem)}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <UserPlus className="h-3 w-3 text-emerald-600 group-hover:text-white" />
                )}
                <span>+ Teman</span>
              </button>
            )}
          </div>

          {/* Direct Message Chat Button */}
          <button
            type="button"
            onClick={() => setSelectedChatUser(userItem)}
            className="inline-flex min-h-[32px] items-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3 py-1 text-[11px] font-extrabold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Chat</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
            Jejaring Warga &amp; Teman Terverifikasi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Temukan tetangga, kader posyandu, dan pengurus RT/RW se-Kota Tegal.
          </p>
        </div>

        <div className="relative min-w-[240px] sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama warga, posyandu, RT/RW..."
            className="w-full min-h-[38px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Action Notification Feedback */}
      {actionFeedback && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-xs font-bold text-emerald-900 dark:text-emerald-200">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. BAGIAN: TEMAN SAYA (SUDAH MENJADI TEMAN)                */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
              Teman Saya (Sudah Berteman)
            </h4>
          </div>
          <span className="rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300 font-mono">
            {myFriends.length} Teman
          </span>
        </div>

        {myFriends.length === 0 ? (
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-center space-y-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Belum Ada Teman yang Terhubung
            </p>
            <p className="text-[11px] text-slate-500">
              Kirim permintaan pertemanan ke warga di daftar bawah untuk mulai menjalin silaturahmi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myFriends.map((u) => renderUserCard(u))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 2. BAGIAN: PERMINTAAN PERTEMANAN (JIKA ADA)               */}
      {/* ========================================================= */}
      {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                <Clock className="h-4 w-4" />
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                Permintaan Pertemanan
              </h4>
            </div>
            <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-xs font-bold font-mono">
              {incomingRequests.length + outgoingRequests.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomingRequests.map((u) => renderUserCard(u))}
            {outgoingRequests.map((u) => renderUserCard(u))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 3. BAGIAN: WARGA LAINNYA (BELUM MENJADI TEMAN)            */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              <Users className="h-4 w-4" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
              Warga Lainnya di Kota Tegal
            </h4>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
            {otherCitizens.length} Warga
          </span>
        </div>

        {otherCitizens.length === 0 ? (
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-center space-y-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tidak Ada Warga yang Cocok
            </p>
            <p className="text-[11px] text-slate-500">
              Coba gunakan kata kunci pencarian yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherCitizens.map((u) => renderUserCard(u))}
          </div>
        )}
      </section>

      {/* Direct Chat Modal */}
      <ChatDrawerModal
        isOpen={!!selectedChatUser}
        onClose={() => setSelectedChatUser(null)}
        targetUser={selectedChatUser}
        currentUserId={currentUserId}
      />
    </div>
  );
}
