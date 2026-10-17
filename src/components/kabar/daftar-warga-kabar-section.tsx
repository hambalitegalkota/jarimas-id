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
  Filter,
  Home,
  Landmark,
} from "lucide-react";
import { sendFriendRequest, respondFriendRequest } from "@/app/actions/pertemanan";
import { ChatDrawerModal } from "@/components/warga/chat-drawer-modal";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import { isAdminPusat, isSuperAdmin } from "@/lib/utils";
import type { RegisteredUserItem, RekapWargaSatuKomunitas, KomunitasTierCategory } from "@/types/database";

interface DaftarWargaKabarSectionProps {
  initialUsers: RegisteredUserItem[];
  currentUserId: string | null;
  rekapKomunitas?: RekapWargaSatuKomunitas;
  isSuperAdmin?: boolean;
}

export function DaftarWargaKabarSection({
  initialUsers,
  currentUserId,
  rekapKomunitas,
  isSuperAdmin: isSuperAdminProp,
}: DaftarWargaKabarSectionProps) {
  const { onlineUserIds } = useGlobalMessageNotification();
  const [users, setUsers] = useState<RegisteredUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<KomunitasTierCategory | "semua">("semua");
  const [activeTab, setActiveTab] = useState<"semua" | "online" | "teman" | "permintaan">("semua");
  const [selectedChatUser, setSelectedChatUser] = useState<RegisteredUserItem | null>(null);
  const [loadingActionUserId, setLoadingActionUserId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Rekapitulasi sebaran warga satu komunitas (dengan jaminan 1 warga = 1 hitungan unik)
  const rekap: RekapWargaSatuKomunitas = rekapKomunitas || (() => {
    const kotaSet = new Set<string>();
    const kecSet = new Set<string>();
    const kelSet = new Set<string>();
    const rwSet = new Set<string>();
    const rtSet = new Set<string>();
    const lainSet = new Set<string>();
    const totalSet = new Set<string>();

    users.forEach((u) => {
      totalSet.add(u.id);
      if (u.categories?.includes("kota")) kotaSet.add(u.id);
      if (u.categories?.includes("kecamatan")) kecSet.add(u.id);
      if (u.categories?.includes("kelurahan")) kelSet.add(u.id);
      if (u.categories?.includes("rw")) rwSet.add(u.id);
      if (u.categories?.includes("rt")) rtSet.add(u.id);
      if (u.categories?.includes("komunitas_lain")) lainSet.add(u.id);
    });

    return {
      totalUnique: totalSet.size,
      kotaTegal: kotaSet.size,
      kecamatan: kecSet.size,
      kelurahan: kelSet.size,
      rw: rwSet.size,
      rt: rtSet.size,
      komunitasLain: lainSet.size,
    };
  })();

  const tierCards = [
    {
      id: "kota" as const,
      title: "Kota Tegal",
      subtitle: "Tingkat Kota Tegal",
      badge: "Kota Tegal",
      count: rekap.kotaTegal,
      icon: Building2,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-950",
    },
    {
      id: "kecamatan" as const,
      title: "Kecamatan",
      subtitle: "Tingkat Kecamatan",
      badge: "Kecamatan",
      count: rekap.kecamatan,
      icon: MapPin,
      iconColor: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-100 dark:bg-sky-950",
    },
    {
      id: "kelurahan" as const,
      title: "Kelurahan",
      subtitle: "Tingkat Kelurahan",
      badge: "Kelurahan",
      count: rekap.kelurahan,
      icon: Home,
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100 dark:bg-teal-950",
    },
    {
      id: "rw" as const,
      title: "RW",
      subtitle: "Rukun Warga",
      badge: "Tingkat RW",
      count: rekap.rw,
      icon: Users,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
    },
    {
      id: "rt" as const,
      title: "RT",
      subtitle: "Rukun Tetangga",
      badge: "Tingkat RT",
      count: rekap.rt,
      icon: UserCheck,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-950",
    },
    {
      id: "komunitas_lain" as const,
      title: "Komunitas Lain",
      subtitle: "Posyandu, PAUD, dll",
      badge: "Lainnya",
      count: rekap.komunitasLain,
      icon: Sparkles,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-950",
    },
  ];

  // Filter pencarian, tingkatan komunitas, & Prioritaskan pengguna online di posisi teratas
  const filterList = (list: RegisteredUserItem[]) => {
    let filtered = list;

    // Filter berdasarkan tingkatan komunitas terpilih
    if (selectedTier !== "semua") {
      filtered = filtered.filter((u) => u.categories?.includes(selectedTier));
    }

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

  // Kategori Online: Seluruh warga yang sedang online
  const onlineCitizens = filterList(
    users.filter((u) => u.id !== currentUserId && onlineUserIds.has(u.id))
  );

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

          {/* Affiliation Tags & Category Badges */}
          <div className="pt-1 space-y-1.5">
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

            {/* Badges Tingkatan Komunitas (RT, RW, Kelurahan, Kecamatan, Kota, Komunitas Lain) */}
            {userItem.categories && userItem.categories.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {userItem.categories.map((cat) => {
                  const labelMap: Record<KomunitasTierCategory, { text: string; cls: string }> = {
                    rt: { text: "RT", cls: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700" },
                    rw: { text: "RW", cls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" },
                    kelurahan: { text: "Kel.", cls: "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700" },
                    kecamatan: { text: "Kec.", cls: "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700" },
                    kota: { text: "Kota Tegal", cls: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700" },
                    komunitas_lain: { text: "Komunitas Lain", cls: "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700" },
                  };
                  const item = labelMap[cat];
                  if (!item) return null;
                  return (
                    <span
                      key={cat}
                      className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md border ${item.cls}`}
                    >
                      {item.text}
                    </span>
                  );
                })}
              </div>
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
      {/* ========================================================= */}
      {/* 0. STATISTIK SEBARAN WARGA SATU KOMUNITAS                */}
      {/* ========================================================= */}
      <section className="rounded-3xl border-2 border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/70 dark:border-indigo-950/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-black text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                <Users className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                SEBARAN WARGA SATU KOMUNITAS
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                1 Warga = 1 Hitungan
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
              Jumlah Warga Terdaftar Satu Komunitas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Distribusi jumlah warga satu komunitas di tingkat Kota Tegal, Kecamatan, Kelurahan, RW, RT, dan Komunitas yang lain. Warga yang sama hanya dihitung satu kali (tidak dihitung ganda jika terdaftar di beberapa komunitas).
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-800 shadow-2xs text-center min-w-[110px]">
              <span className="text-xl sm:text-2xl font-black block font-mono text-indigo-600 dark:text-indigo-400">
                {rekap.totalUnique}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">
                Total Warga Unik
              </span>
            </div>
          </div>
        </div>

        {/* 6 Interactive Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {tierCards.map((card) => {
            const isSelected = selectedTier === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedTier(isSelected ? "semua" : card.id)}
                className={`relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left group ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 text-white shadow-md scale-[1.02] ring-2 ring-indigo-400/30"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs hover:shadow-xs"
                }`}
                title={`Klik untuk memfilter daftar warga: ${card.title}`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : card.iconBg + " " + card.iconColor
                    }`}
                  >
                    <card.icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span
                    className={`text-lg sm:text-xl font-black font-mono block ${
                      isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {card.count}
                  </span>
                  <span
                    className={`text-xs font-bold block truncate ${
                      isSelected ? "text-white" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {card.title}
                  </span>
                  <span
                    className={`text-[10px] block truncate ${
                      isSelected ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {card.subtitle}
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[9px] font-bold text-white/90">
                    <span>Sedang Difilter</span>
                    <span>✕ Reset</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Reset Indicator if active */}
        {selectedTier !== "semua" && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 font-bold">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              <span>
                Menampilkan warga pada tingkatan: <span className="underline">{tierCards.find((t) => t.id === selectedTier)?.title}</span> ({filterList(users.filter((u) => u.id !== currentUserId)).length} Warga)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTier("semua")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-100 border border-indigo-300 dark:border-indigo-700 text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer shadow-2xs"
            >
              Tampilkan Semua Warga
            </button>
          </div>
        )}
      </section>

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

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("semua")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "semua"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          Semua Warga ({users.filter((u) => u.id !== currentUserId).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("online")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "online"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>🟢 Sedang Online ({onlineCitizens.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("teman")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "teman"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          Teman Saya ({myFriends.length})
        </button>

        {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
          <button
            type="button"
            onClick={() => setActiveTab("permintaan")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "permintaan"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            Permintaan ({incomingRequests.length + outgoingRequests.length})
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 0. BAGIAN: WARGA SEDANG ONLINE (JIKA TAB ONLINE AKTIF)     */}
      {/* ========================================================= */}
      {activeTab === "online" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                Warga Sedang Online di Website Sekarang
              </h4>
            </div>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 font-mono">
              {onlineCitizens.length} Online
            </span>
          </div>

          {onlineCitizens.length === 0 ? (
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Belum Ada Warga Lain yang Sedang Aktif
              </p>
              <p className="text-[11px] text-slate-500">
                Status online akan langsung muncul secara otomatis saat warga membuka website Jarimas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {onlineCitizens.map((u) => renderUserCard(u))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* 1. BAGIAN: TEMAN SAYA (SUDAH MENJADI TEMAN)                */}
      {/* ========================================================= */}
      {(activeTab === "semua" || activeTab === "teman") && (
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
      )}

      {/* ========================================================= */}
      {/* 2. BAGIAN: PERMINTAAN PERTEMANAN (JIKA ADA)               */}
      {/* ========================================================= */}
      {(activeTab === "semua" || activeTab === "permintaan") &&
        (incomingRequests.length > 0 || outgoingRequests.length > 0) && (
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
      {activeTab === "semua" && (
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
      )}

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
