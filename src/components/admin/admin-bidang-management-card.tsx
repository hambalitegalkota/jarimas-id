"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  Check,
  X,
  Loader2,
  GraduationCap,
  HeartPulse,
  Hammer,
  Home,
  FileText,
  Sparkles,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import {
  getAdminBidangListAction,
  assignAdminBidangAction,
  revokeAdminBidangAction,
} from "@/app/actions/admin-bidang";
import { DAFTAR_BIDANG_SPM_CONFIG } from "@/lib/constants/admin-bidang";
import { formatWhatsAppUrl, cn } from "@/lib/utils";
import type {
  BidangSpmId,
  BidangSpmConfig,
  UserAdminBidangSummary,
  RegisteredUserItem,
} from "@/types/database";
import type { AdminTierLevel } from "@/lib/admin-helpers";

export interface AdminBidangManagementCardProps {
  registeredUsers: RegisteredUserItem[];
  currentUserId: string | null;
  viewerTier?: AdminTierLevel;
}

const BIDANG_ICON_MAP: Record<BidangSpmId, any> = {
  pendidikan: GraduationCap,
  kesehatan: HeartPulse,
  pekerjaan_umum: Hammer,
  perumahan_rakyat: Home,
  trantibumlinmas: ShieldAlert,
  sosial: Users,
};

const BIDANG_COLOR_MAP: Record<BidangSpmId, { bg: string; text: string; border: string; activeBg: string }> = {
  pendidikan: {
    bg: "bg-sky-500/10",
    text: "text-sky-800 dark:text-sky-300",
    border: "border-sky-500/30",
    activeBg: "bg-sky-600 text-white",
  },
  kesehatan: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-500/30",
    activeBg: "bg-emerald-600 text-white",
  },
  pekerjaan_umum: {
    bg: "bg-amber-500/10",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-500/30",
    activeBg: "bg-amber-600 text-white",
  },
  perumahan_rakyat: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-800 dark:text-indigo-300",
    border: "border-indigo-500/30",
    activeBg: "bg-indigo-600 text-white",
  },
  trantibumlinmas: {
    bg: "bg-rose-500/10",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-500/30",
    activeBg: "bg-rose-600 text-white",
  },
  sosial: {
    bg: "bg-purple-500/10",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-500/30",
    activeBg: "bg-purple-600 text-white",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-slate-500/10",
  text: "text-slate-800 dark:text-slate-300",
  border: "border-slate-500/30",
  activeBg: "bg-slate-600 text-white",
};

export function AdminBidangManagementCard({
  registeredUsers = [],
  currentUserId,
  viewerTier = "super_admin",
}: AdminBidangManagementCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"daftar" | "angkat" | "cakupan">("daftar");
  const [adminBidangList, setAdminBidangList] = useState<UserAdminBidangSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Form State untuk Angkat / Ubah Admin Bidang
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [selectedTargetUser, setSelectedTargetUser] = useState<RegisteredUserItem | null>(null);
  const [selectedBidangSet, setSelectedBidangSet] = useState<Set<BidangSpmId>>(new Set());
  const [isProcessing, startTransition] = useTransition();

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const { openChatWithUser } = useGlobalMessageNotification();

  // Load daftar admin bidang awal
  const loadAdminBidangList = async () => {
    setIsLoadingList(true);
    try {
      const res = await getAdminBidangListAction();
      if (res.success && res.data) {
        setAdminBidangList(res.data);
      }
    } catch (err: any) {
      console.warn("Gagal memuat list admin bidang:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadAdminBidangList();
  }, []);

  // Filter daftar pengguna terdaftar untuk dropdown pemilihan
  const filteredCandidateUsers = useMemo(() => {
    if (!searchUserQuery.trim()) return registeredUsers.slice(0, 15);
    const q = searchUserQuery.toLowerCase().trim();
    return registeredUsers
      .filter(
        (u) =>
          u.nama_lengkap.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.nomor_hp?.includes(q)
      )
      .slice(0, 20);
  }, [registeredUsers, searchUserQuery]);

  const handleSelectUser = (userItem: RegisteredUserItem) => {
    setSelectedTargetUser(userItem);
    // Cari apakah user ini sudah punya bidang yang ada
    const existing = adminBidangList.find((a) => a.userId === userItem.id);
    if (existing) {
      setSelectedBidangSet(new Set(existing.bidangList));
    } else {
      setSelectedBidangSet(new Set());
    }
  };

  const handleToggleBidang = (bidangId: BidangSpmId) => {
    setSelectedBidangSet((prev) => {
      const next = new Set(prev);
      if (next.has(bidangId)) {
        next.delete(bidangId);
      } else {
        next.add(bidangId);
      }
      return next;
    });
  };

  const handleSelectAllBidang = () => {
    if (selectedBidangSet.size === DAFTAR_BIDANG_SPM_CONFIG.length) {
      setSelectedBidangSet(new Set());
    } else {
      setSelectedBidangSet(new Set(DAFTAR_BIDANG_SPM_CONFIG.map((b) => b.id)));
    }
  };

  const handleSaveAssignment = () => {
    if (!selectedTargetUser) {
      setToastMessage({ text: "Silakan pilih pengguna terlebih dahulu.", isError: true });
      return;
    }

    const bidangArray = Array.from(selectedBidangSet);
    const targetName = selectedTargetUser.nama_lengkap || selectedTargetUser.email || "Pengguna";

    startTransition(async () => {
      try {
        const res = await assignAdminBidangAction(selectedTargetUser.id, bidangArray);
        if (res.success) {
          setToastMessage({ text: res.message });
          // Perbarui local state
          setAdminBidangList((prev) => {
            const filtered = prev.filter((a) => a.userId !== selectedTargetUser.id);
            if (bidangArray.length > 0) {
              return [
                ...filtered,
                {
                  userId: selectedTargetUser.id,
                  userName: targetName,
                  userEmail: selectedTargetUser.email || "-",
                  userPhone: selectedTargetUser.nomor_hp || null,
                  bidangList: bidangArray,
                  createdAt: new Date().toISOString(),
                },
              ];
            }
            return filtered;
          });
          // Reset form dan kembali ke tab daftar
          setSelectedTargetUser(null);
          setSelectedBidangSet(new Set());
          setSearchUserQuery("");
          setActiveTab("daftar");
        } else {
          setToastMessage({ text: res.message, isError: true });
        }
      } catch (err: any) {
        setToastMessage({
          text: err.message || "Gagal menyimpan penetapan Admin Bidang.",
          isError: true,
        });
      } finally {
        setTimeout(() => setToastMessage(null), 5000);
      }
    });
  };

  const handleStartEditFromList = (item: UserAdminBidangSummary) => {
    const matchedUser = registeredUsers.find((u) => u.id === item.userId) || {
      id: item.userId,
      nama_lengkap: item.userName,
      email: item.userEmail,
      nomor_hp: item.userPhone,
      is_super_admin: false,
      created_at: item.createdAt || new Date().toISOString(),
    };
    setSelectedTargetUser(matchedUser);
    setSelectedBidangSet(new Set(item.bidangList));
    setActiveTab("angkat");
  };

  const handleRevokeAllFromList = (item: UserAdminBidangSummary) => {
    if (
      !window.confirm(
        `Cabut seluruh peran Admin Bidang dari ${item.userName}? Pengguna ini tidak lagi memiliki hak pengawasan data lintas bidang.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await revokeAdminBidangAction(item.userId);
        if (res.success) {
          setToastMessage({ text: res.message });
          setAdminBidangList((prev) => prev.filter((a) => a.userId !== item.userId));
        } else {
          setToastMessage({ text: res.message, isError: true });
        }
      } catch (err: any) {
        setToastMessage({ text: err.message || "Gagal mencabut Admin Bidang.", isError: true });
      } finally {
        setTimeout(() => setToastMessage(null), 5000);
      }
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs transition-all">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={cn(
            "p-3 text-xs font-semibold flex items-center justify-between border-b transition-all",
            toastMessage.isError
              ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
              : "bg-teal-500/10 border-teal-500/30 text-teal-800 dark:text-teal-300"
          )}
        >
          <div className="flex items-center gap-2">
            {toastMessage.isError ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs underline hover:opacity-80 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Kartu Terpisah */}
      <div className="bg-gradient-to-r from-teal-600 via-primary to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-xs shadow-xs border border-white/20">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
                Pengangkatan Admin Bidang (SPM)
              </h3>
              <span className="rounded-md bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                {viewerTier === "super_admin"
                  ? "SUPER ADMIN"
                  : viewerTier === "admin_pusat"
                  ? "ADMIN PUSAT"
                  : "ADMIN KOTA"}
              </span>
            </div>
            <p className="text-xs text-white/85 font-medium mt-0.5">
              Penetapan hak pengawasan data (Read-Only) dan koordinasi lintas 6 Bidang Standar Pelayanan Minimal se-Kota Tegal
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          title={isOpen ? "Tutup panel" : "Buka panel"}
        >
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5 bg-card">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("daftar")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === "daftar"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Daftar Admin Bidang Aktif</span>
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                {adminBidangList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("angkat")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === "angkat"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{selectedTargetUser ? "Ubah Penugasan" : "+ Angkat Admin Bidang"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cakupan")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === "cakupan"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Cakupan Hak Akses 6 Bidang</span>
            </button>
          </div>

          {/* TAB 1: DAFTAR ADMIN BIDANG AKTIF */}
          {activeTab === "daftar" && (
            <div className="space-y-4">
              {isLoadingList ? (
                <div className="py-10 text-center space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-xs text-muted-foreground">Memuat data Admin Bidang...</p>
                </div>
              ) : adminBidangList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
                  <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">
                      Belum Ada Admin Bidang yang Ditetapkan
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Super Admin, Admin Pusat, dan Admin Kota dapat mengangkat pengguna terdaftar manapun menjadi Admin Bidang untuk mengawasi data Pendidikan, Kesehatan, PU, Perumahan, Trantibumlinmas, maupun Sosial.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("angkat")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-xs font-bold text-primary-foreground transition-all shadow-xs cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>+ Angkat Admin Bidang Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {adminBidangList.map((item) => {
                    const waUrl = formatWhatsAppUrl(
                      item.userPhone,
                      `Halo ${item.userName}, koordinasi terkait penugasan Admin Bidang di JARIMAS-ID.`
                    );

                    return (
                      <div
                        key={item.userId}
                        className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-foreground truncate">
                                {item.userName}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate font-mono">
                                {item.userEmail}
                              </p>
                              {item.userPhone && (
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {item.userPhone}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 rounded-md bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                              Admin Bidang
                            </span>
                          </div>

                          {/* Daftar Badges Bidang yang Ditugaskan */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(item.bidangList || []).map((bId) => {
                              const config = (DAFTAR_BIDANG_SPM_CONFIG || []).find((b) => b.id === bId);
                              const color = BIDANG_COLOR_MAP[bId] || DEFAULT_COLOR;
                              const Icon = BIDANG_ICON_MAP[bId] || Shield;

                              return (
                                <span
                                  key={bId}
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border",
                                    color.bg,
                                    color.text,
                                    color.border
                                  )}
                                  title={config?.deskripsi}
                                >
                                  <Icon className="h-3 w-3" />
                                  <span>{config?.badgeLabel || bId}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditFromList(item)}
                              disabled={isProcessing}
                              className="inline-flex min-h-[30px] items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border border-border bg-muted/60 hover:bg-muted text-foreground transition-all cursor-pointer"
                              title="Ubah penugasan bidang pengguna ini"
                            >
                              <SlidersHorizontal className="h-3 w-3 text-primary" />
                              <span>Ubah Bidang</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRevokeAllFromList(item)}
                              disabled={isProcessing}
                              className="inline-flex min-h-[30px] items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 transition-all cursor-pointer"
                              title="Cabut seluruh peran Admin Bidang"
                            >
                              <X className="h-3 w-3" />
                              <span>Cabut</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1 ml-auto">
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[30px] items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 px-2 py-1 text-[10px] font-bold text-secondary transition-all"
                                title="Hubungi via WhatsApp"
                              >
                                <Phone className="h-3 w-3" />
                                <span>WA</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                openChatWithUser({
                                  id: item.userId,
                                  nama_lengkap: item.userName,
                                  email: item.userEmail,
                                  is_super_admin: false,
                                  created_at: item.createdAt || new Date().toISOString(),
                                })
                              }
                              className="inline-flex min-h-[30px] items-center gap-1 rounded-md bg-primary hover:bg-primary-hover px-2.5 py-1 text-[10px] font-bold text-primary-foreground transition-all shadow-2xs cursor-pointer"
                              title="Mulai percakapan langsung"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Chat</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANGKAT / UBAH PENUGASAN ADMIN BIDANG */}
          {activeTab === "angkat" && (
            <div className="space-y-5">
              {/* Box Info Regulasi */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <h4 className="font-bold text-foreground">
                    Aturan Pengangkatan Admin Bidang
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pengguna <strong>tidak perlu menjadi admin atau anggota komunitas manapun</strong> sebelumnya. Cukup merupakan pengguna yang telah terdaftar di JARIMAS-ID. Admin Bidang memiliki wewenang melihat detail data secara lengkap (Read-Only) serta berkomunikasi langsung dengan seluruh warga tanpa batasan.
                  </p>
                </div>
              </div>

              {/* LANGKAH 1: Pilih Pengguna */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>1. Pilih Pengguna Terdaftar</span>
                  {selectedTargetUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetUser(null);
                        setSelectedBidangSet(new Set());
                      }}
                      className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
                    >
                      Ganti Pengguna
                    </button>
                  )}
                </label>

                {selectedTargetUser ? (
                  <div className="rounded-lg border border-primary/40 bg-primary/10 p-3.5 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-xs">
                        {selectedTargetUser.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {selectedTargetUser.nama_lengkap}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {selectedTargetUser.email || "-"} • {selectedTargetUser.nomor_hp || "Tanpa No. HP"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      Terpilih
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchUserQuery}
                        onChange={(e) => setSearchUserQuery(e.target.value)}
                        placeholder="Cari nama, email, atau nomor HP pengguna terdaftar..."
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-card divide-y divide-border">
                      {filteredCandidateUsers.length === 0 ? (
                        <p className="p-3 text-xs text-muted-foreground text-center">
                          Tidak ada pengguna yang cocok dengan pencarian.
                        </p>
                      ) : (
                        filteredCandidateUsers.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => handleSelectUser(u)}
                            className="p-2.5 sm:p-3 hover:bg-muted/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-foreground truncate">
                                {u.nama_lengkap}
                              </h5>
                              <p className="text-[11px] text-muted-foreground truncate font-mono">
                                {u.email || "-"} {u.nomor_hp ? `• ${u.nomor_hp}` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              Pilih
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* LANGKAH 2: Checklist 6 Bidang SPM */}
              {selectedTargetUser && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        2. Tentukan Bidang Penugasan ({selectedBidangSet.size} dari {DAFTAR_BIDANG_SPM_CONFIG.length} Dipilih)
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Centang bidang yang ingin diberikan wewenang hak akses pengawasannya kepada pengguna ini.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSelectAllBidang}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer whitespace-nowrap"
                    >
                      {selectedBidangSet.size === DAFTAR_BIDANG_SPM_CONFIG.length
                        ? "Batal Pilih Semua"
                        : "Pilih Semua Bidang"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(DAFTAR_BIDANG_SPM_CONFIG || []).map((b) => {
                      const isSelected = selectedBidangSet.has(b.id);
                      const color = BIDANG_COLOR_MAP[b.id] || DEFAULT_COLOR;
                      const Icon = BIDANG_ICON_MAP[b.id] || Shield;

                      return (
                        <div
                          key={b.id}
                          onClick={() => handleToggleBidang(b.id)}
                          className={cn(
                            "rounded-lg border p-4 space-y-2.5 transition-all cursor-pointer relative",
                            isSelected
                              ? `${color.border} bg-card shadow-xs ring-1 ring-primary/40`
                              : "border-border bg-card/60 hover:bg-card opacity-80"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                                  isSelected
                                    ? `${color.bg} ${color.text} ${color.border}`
                                    : "bg-muted text-muted-foreground border-border"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">
                                  {b.nama}
                                </h5>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">
                                  {b.deskripsi}
                                </span>
                              </div>
                            </div>

                            <div
                              className={cn(
                                "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-background"
                              )}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          {/* Hak Akses Data Terperinci */}
                          <div className="rounded-md bg-muted/40 p-2.5 border border-border/60 space-y-1 text-2xs">
                            <div className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                              <ShieldCheck className="h-3 w-3 text-primary" />
                              <span>Hak Akses Data (Read-Only):</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {b.hakAkses}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tombol Simpan */}
                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetUser(null);
                        setSelectedBidangSet(new Set());
                        setActiveTab("daftar");
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveAssignment}
                      disabled={isProcessing}
                      className="inline-flex min-h-[38px] items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>
                            {selectedBidangSet.size === 0
                              ? "Cabut Wewenang Admin Bidang"
                              : `Simpan Penetapan (${selectedBidangSet.size} Bidang)`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KATALOG CAKUPAN HAK AKSES 6 BIDANG */}
          {activeTab === "cakupan" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/10 p-3.5 text-xs text-muted-foreground leading-relaxed">
                Katalog di bawah ini merinci hak akses data pengawasan untuk masing-masing bidang. Seluruh Admin Bidang memiliki kewenangan <strong>melihat data secara mendalam (Read-Only)</strong> tanpa batasan wilayah kelurahan/kecamatan, dan <strong>tidak memiliki hak untuk mengubah atau menghapus data</strong>. Hak akses data ini akan terus berkembang seiring perkembangan modul aplikasi JARIMAS-ID.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(DAFTAR_BIDANG_SPM_CONFIG || []).map((b, idx) => {
                  const color = BIDANG_COLOR_MAP[b.id] || DEFAULT_COLOR;
                  const Icon = BIDANG_ICON_MAP[b.id] || Shield;

                  return (
                    <div
                      key={b.id}
                      className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
                              color.bg,
                              color.text,
                              color.border
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                0{idx + 1}.
                              </span>
                              <h4 className="text-sm font-bold text-foreground">
                                {b.nama}
                              </h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {b.deskripsi}
                            </p>
                          </div>
                        </div>

                        {/* Deskripsi Hak Akses */}
                        <div className="rounded-lg bg-muted/30 p-3 border border-border/70 space-y-1.5 text-xs">
                          <div className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            <span>Hak Akses Data Terbuka (Read-Only):</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed text-xs">
                            {b.hakAkses}
                          </p>
                        </div>

                        {/* Rincian Cakupan Dataset */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Cakupan Dataset &amp; Modul:
                          </span>
                          <ul className="space-y-1 text-xs text-foreground">
                            {Array.isArray(b.cakupanData) &&
                              b.cakupanData.map((item, i) => (
                                <li key={i} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-medium">Status Akses: Aktif se-Kota Tegal</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ Read-Only Dilindungi
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
