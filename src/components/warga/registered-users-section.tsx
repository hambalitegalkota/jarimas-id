"use client";

import { useState, useTransition } from "react";
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
  User,
  HeartHandshake,
} from "lucide-react";
import {
  sendFriendRequest,
  respondFriendRequest,
} from "@/app/actions/pertemanan";
import { ChatDrawerModal } from "./chat-drawer-modal";
import { isAdminPusat, isSuperAdmin } from "@/lib/utils";
import type { RegisteredUserItem } from "@/types/database";

interface RegisteredUsersSectionProps {
  initialUsers: RegisteredUserItem[];
  totalCount: number;
  totalFriendsCount: number;
  totalPendingRequestsCount: number;
  currentUserId: string | null;
}

export function RegisteredUsersSection({
  initialUsers,
  totalCount,
  totalFriendsCount: initialFriendsCount,
  totalPendingRequestsCount: initialPendingCount,
  currentUserId,
}: RegisteredUsersSectionProps) {
  const [users, setUsers] = useState<RegisteredUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"semua" | "teman" | "permintaan">("semua");
  const [selectedChatUser, setSelectedChatUser] = useState<RegisteredUserItem | null>(null);
  const [loadingActionUserId, setLoadingActionUserId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Hitung jumlah teman & permintaan secara reaktif dari state lokal
  const friendsCount = users.filter((u) => u.friendship_status === "accepted").length;
  const pendingCount = users.filter((u) => u.friendship_status === "pending_received").length;

  // Filter berdasarkan pencarian dan tab aktif
  const filteredUsers = users.filter((u) => {
    // 1. Filter Tab
    if (activeTab === "teman" && u.friendship_status !== "accepted") {
      return false;
    }
    if (activeTab === "permintaan" && u.friendship_status !== "pending_received") {
      return false;
    }

    // 2. Filter Search
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
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

  // Handler kirim permintaan pertemanan
  const handleSendFriendRequest = async (targetUser: RegisteredUserItem) => {
    setLoadingActionUserId(targetUser.id);
    setActionFeedback(null);

    // Optimistic update
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
        // Rollback
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
      setActionFeedback("Terjadi kesalahan saat mengirim permintaan.");
    } finally {
      setLoadingActionUserId(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Handler respon permintaan pertemanan (Accept / Reject / Cancel)
  const handleRespondFriendRequest = async (
    targetUser: RegisteredUserItem,
    action: "accept" | "reject" | "cancel"
  ) => {
    if (!targetUser.friendship_id) return;
    setLoadingActionUserId(targetUser.id);
    setActionFeedback(null);

    const oldStatus = targetUser.friendship_status;
    const newStatus = action === "accept" ? "accepted" : "none";

    // Optimistic update
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
        // Rollback
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
      setActionFeedback("Gagal memproses permintaan pertemanan.");
    } finally {
      setLoadingActionUserId(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  return (
    <section
      id="warga-terdaftar"
      className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-6 shadow-sm"
    >
      {/* ========================================================= */}
      {/* 1. HEADER SECTION                                         */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-3.5 py-1 text-xs font-black text-emerald-900 dark:text-emerald-300 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>JARINGAN WARGA &amp; PERTEMANAN JARIMAS-ID</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Warga &amp; Pengguna Terdaftar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Daftar warga Kota Tegal, kader Posyandu, dan pengurus terverifikasi. Tambahkan teman untuk mempererat silaturahmi serta lakukan percakapan pribadi langsung.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Terdaftar
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {totalCount} Warga
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionFeedback && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CONTROLS: TABS & SEARCH BAR                            */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("semua")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "semua"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>Semua Warga</span>
            <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("teman")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "teman"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5 text-teal-600" />
            <span>Teman Saya</span>
            {friendsCount > 0 && (
              <span className="ml-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {friendsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("permintaan")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "permintaan"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Permintaan Masuk</span>
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-mono font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative min-w-[240px] md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kader, RT/RW, kelurahan..."
            className="w-full min-h-[42px] rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. REGISTERED USERS GRID                                  */}
      {/* ========================================================= */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {activeTab === "teman"
                ? "Belum Ada Teman Terhubung"
                : activeTab === "permintaan"
                ? "Tidak Ada Permintaan Pertemanan"
                : "Tidak Ada Pengguna yang Cocok"}
            </h4>
            <p className="text-xs text-slate-500">
              {activeTab === "teman"
                ? "Jelajahi tab Semua Warga dan kirim permintaan pertemanan untuk mulai terhubung."
                : activeTab === "permintaan"
                ? "Saat ada warga atau kader lain yang menambahkan Anda, pemberitahuan akan muncul di sini."
                : "Coba kata kunci pencarian lain seperti nama lengkap, nama posyandu, atau kelurahan."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((userItem) => {
            const isMe = userItem.id === currentUserId;
            const initial = userItem.nama_lengkap.charAt(0).toUpperCase() || "W";
            const isLoadingThisUser = loadingActionUserId === userItem.id;
            const primaryComm = userItem.komunitas_list?.[0];

            return (
              <div
                key={userItem.id}
                className={`relative flex flex-col justify-between rounded-3xl border-2 p-5 transition-all shadow-xs hover:shadow-md ${
                  isMe
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Avatar & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-800 text-white font-black text-lg shadow-sm border-2 border-white dark:border-slate-800">
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
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 ring-1 ring-emerald-400" />
                      </div>

                      {/* Name & Subtitle */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                            {userItem.nama_lengkap}
                          </h3>
                          {(userItem.is_super_admin || isSuperAdmin(userItem)) ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[9px] font-black text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              <ShieldCheck className="h-3 w-3 text-amber-600" />
                              Super Admin
                            </span>
                          ) : (userItem.is_admin_pusat || isAdminPusat(userItem)) ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 text-[9px] font-black text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                              <ShieldCheck className="h-3 w-3 text-teal-600" />
                              Admin Pusat
                            </span>
                          ) : null}
                          {isMe && (
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[9px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                              Anda
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                          Bergabung{" "}
                          {new Date(userItem.created_at).toLocaleDateString("id-ID", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Community & Roles Affiliations */}
                  <div className="space-y-1.5 pt-1">
                    {userItem.komunitas_list && userItem.komunitas_list.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {userItem.komunitas_list.slice(0, 2).map((comm) => (
                          <span
                            key={comm.id}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full"
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
                      <span className="inline-flex items-center gap-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        Warga Kota Tegal
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Interactive Actions Bar */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Left: Friendship Action */}
                  <div className="flex-1">
                    {isMe ? (
                      <span className="text-[11px] font-bold text-slate-400 italic">
                        Profil Akun Anda
                      </span>
                    ) : userItem.friendship_status === "accepted" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Berteman</span>
                      </span>
                    ) : userItem.friendship_status === "pending_sent" ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>Terkirim</span>
                        </span>
                        {userItem.friendship_id && (
                          <button
                            type="button"
                            disabled={isLoadingThisUser}
                            onClick={() => handleRespondFriendRequest(userItem, "cancel")}
                            className="text-[10px] font-bold text-slate-400 hover:text-rose-600 underline cursor-pointer"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    ) : userItem.friendship_status === "pending_received" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isLoadingThisUser}
                          onClick={() => handleRespondFriendRequest(userItem, "accept")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all active:scale-95 cursor-pointer shadow-xs"
                        >
                          {isLoadingThisUser ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>Terima</span>
                        </button>
                        <button
                          type="button"
                          disabled={isLoadingThisUser}
                          onClick={() => handleRespondFriendRequest(userItem, "reject")}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Tolak"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoadingThisUser}
                        onClick={() => handleSendFriendRequest(userItem)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer shadow-2xs group"
                      >
                        {isLoadingThisUser ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5 text-emerald-600 group-hover:text-white transition-colors" />
                        )}
                        <span>Tambah Teman</span>
                      </button>
                    )}
                  </div>

                  {/* Right: Private Chat Action */}
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => setSelectedChatUser(userItem)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 text-xs font-extrabold text-white transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Chat</span>
                      {userItem.unread_messages_count && userItem.unread_messages_count > 0 ? (
                        <span className="rounded-full bg-amber-400 text-slate-950 px-1.5 text-[9px] font-black font-mono">
                          {userItem.unread_messages_count}
                        </span>
                      ) : null}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CHAT DRAWER / POPUP MODAL                              */}
      {/* ========================================================= */}
      <ChatDrawerModal
        isOpen={!!selectedChatUser}
        onClose={() => setSelectedChatUser(null)}
        targetUser={selectedChatUser}
        currentUserId={currentUserId}
      />
    </section>
  );
}
