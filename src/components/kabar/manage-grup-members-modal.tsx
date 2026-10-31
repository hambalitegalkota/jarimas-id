"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Users,
  UserPlus,
  Search,
  Check,
  ShieldCheck,
  Crown,
  Loader2,
  Trash2,
  AlertCircle,
  Sparkles,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  getGrupKegiatanMembers,
  addMembersToGrupKegiatan,
  removeMemberFromGrupKegiatan,
  deleteGrupKegiatan,
} from "@/app/actions/grup-kegiatan";
import { getRegisteredUsers } from "@/app/actions/pertemanan";
import {
  GrupChatRoom,
  GrupKegiatanMemberItem,
  RegisteredUserItem,
} from "@/types/database";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import { toValidUUID, isSuperAdmin, isAdminPusat } from "@/lib/utils";

interface ManageGrupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GrupChatRoom | null;
  allUsers?: RegisteredUserItem[];
  existingMemberIds?: string[];
  canManage: boolean;
  currentUserId: string | null;
  initialTab?: "anggota" | "undang";
  onMembersUpdated?: () => void;
}

export function ManageGrupMembersModal({
  isOpen,
  onClose,
  room,
  allUsers = [],
  existingMemberIds = [],
  canManage,
  currentUserId,
  initialTab = "anggota",
  onMembersUpdated,
}: ManageGrupMembersModalProps) {
  const { onlineUserIds, openChatWithUser } = useGlobalMessageNotification();

  const [activeTab, setActiveTab] = useState<"anggota" | "undang">(initialTab);
  const [internalUsers, setInternalUsers] = useState<RegisteredUserItem[]>(allUsers);
  const [members, setMembers] = useState<GrupKegiatanMemberItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  // Sync initialTab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Load all users jika belum disediakan dari parent
  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      setInternalUsers(allUsers);
    } else if (isOpen) {
      let isMounted = true;
      setIsLoadingUsers(true);
      getRegisteredUsers()
        .then((res) => {
          if (isMounted && res.users) {
            setInternalUsers(res.users);
          }
        })
        .catch((err) => {
          console.warn("Gagal auto-fetch registered users:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingUsers(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, allUsers]);

  // State untuk Tab Tambah / Undang Anggota Baru
  const [searchInviteQuery, setSearchInviteQuery] = useState("");
  const [selectedInviteIds, setSelectedInviteIds] = useState<Set<string>>(new Set());
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Ambil daftar anggota saat modal dibuka
  useEffect(() => {
    if (!isOpen || !room?.id) return;

    let isMounted = true;
    async function loadMembers() {
      setIsLoadingMembers(true);
      setActionMessage(null);
      try {
        const res = await getGrupKegiatanMembers(room!.id);
        if (isMounted && res.success && res.members) {
          setMembers(res.members);
        }
      } catch (err) {
        console.error("Gagal load anggota grup:", err);
      } finally {
        if (isMounted) setIsLoadingMembers(false);
      }
    }

    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [isOpen, room?.id]);

  // Set ID user yang sudah tergabung (gabungan dari prop existingMemberIds dan fetch members)
  const existingMemberUserIds = useMemo(() => {
    const ids = new Set<string>();
    if (existingMemberIds && Array.isArray(existingMemberIds)) {
      existingMemberIds.forEach((id) => {
        if (id) ids.add(String(id).trim().toLowerCase());
      });
    }
    members.forEach((m) => {
      if (m.user_id) ids.add(String(m.user_id).trim().toLowerCase());
    });
    return ids;
  }, [members, existingMemberIds]);

  // Kandidat yang belum tergabung untuk tab "+ Undang"
  // Menyaring pengguna yang sudah terdaftar di existingMemberUserIds MAUPUN di u.komunitas_list
  const candidateUsersToInvite = useMemo(() => {
    const rawTargetId = (room?.id || "").toLowerCase().trim();
    const validTargetUuid = rawTargetId ? toValidUUID(rawTargetId).toLowerCase() : "";

    return internalUsers
      .filter((u) => {
        const uidNormalized = String(u.id || "").trim().toLowerCase();
        // 1. Saring jika ID pengguna sudah ada di existingMemberUserIds
        if (existingMemberUserIds.has(uidNormalized)) {
          return false;
        }

        // 2. Saring jika pengguna sudah terdaftar di komunitas ini berdasarkan komunitas_list miliknya
        if (rawTargetId && u.komunitas_list && u.komunitas_list.length > 0) {
          const isAlreadyAffiliated = u.komunitas_list.some((c) => {
            const cid = String(c.id || "").trim().toLowerCase();
            const cValid = toValidUUID(cid).toLowerCase();
            return (
              cid === rawTargetId ||
              cValid === rawTargetId ||
              (validTargetUuid && (cid === validTargetUuid || cValid === validTargetUuid))
            );
          });
          if (isAlreadyAffiliated) {
            return false;
          }
        }

        return true;
      })
      .filter((u) => {
        if (!searchInviteQuery.trim()) return true;
        const q = searchInviteQuery.toLowerCase().trim();
        return (
          u.nama_lengkap.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.komunitas_list?.some((c) => c.nama.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const aOn = onlineUserIds.has(a.id) ? 1 : 0;
        const bOn = onlineUserIds.has(b.id) ? 1 : 0;
        if (aOn !== bOn) return bOn - aOn;
        return a.nama_lengkap.localeCompare(b.nama_lengkap, "id-ID");
      });
  }, [internalUsers, existingMemberUserIds, room?.id, searchInviteQuery, onlineUserIds]);

  // Filter anggota yang sedang ditampilkan di tab Anggota
  const filteredCurrentMembers = useMemo(() => {
    if (!searchMemberQuery.trim()) return members;
    const q = searchMemberQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.profile?.nama_lengkap.toLowerCase().includes(q) ||
        m.profile?.email?.toLowerCase().includes(q) ||
        m.peran.toLowerCase().includes(q)
    );
  }, [members, searchMemberQuery]);

  const toggleSelectInvite = (uid: string) => {
    setSelectedInviteIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleInviteSubmit = async () => {
    if (!room || selectedInviteIds.size === 0 || isSubmittingInvite) return;
    setIsSubmittingInvite(true);
    setActionMessage(null);

    try {
      const res = await addMembersToGrupKegiatan({
        komunitasId: room.id,
        memberUserIds: Array.from(selectedInviteIds),
      });

      if (res.success) {
        setActionMessage({
          type: "success",
          text: res.message || "Anggota baru berhasil ditambahkan!",
        });
        setSelectedInviteIds(new Set());
        // Reload anggota
        const updated = await getGrupKegiatanMembers(room.id);
        if (updated.success) setMembers(updated.members || []);
        setActiveTab("anggota");
        if (onMembersUpdated) onMembersUpdated();
      } else {
        setActionMessage({
          type: "error",
          text: res.message || "Gagal menambahkan anggota.",
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string, targetName: string) => {
    if (!room) return;
    const confirm = window.confirm(
      `Apakah Anda yakin ingin mengeluarkan "${targetName}" dari grup kegiatan ini?`
    );
    if (!confirm) return;

    try {
      const res = await removeMemberFromGrupKegiatan({
        komunitasId: room.id,
        targetUserId,
      });

      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId));
        setActionMessage({
          type: "success",
          text: `"${targetName}" berhasil dikeluarkan dari grup.`,
        });
        if (onMembersUpdated) onMembersUpdated();
      } else {
        setActionMessage({
          type: "error",
          text: res.message || "Gagal mengeluarkan anggota.",
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!room) return;
    const confirm = window.confirm(
      `Apakah Anda yakin ingin menghapus grup kegiatan "${room.nama}"? Seluruh riwayat obrolan dan keanggotaan dalam grup ini akan dihapus secara permanen.`
    );
    if (!confirm) return;

    try {
      const res = await deleteGrupKegiatan(room.id);
      if (res.success) {
        alert(res.message || "Grup kegiatan berhasil dihapus.");
        onClose();
        if (onMembersUpdated) onMembersUpdated();
      } else {
        setActionMessage({
          type: "error",
          text: res.message || "Gagal menghapus grup kegiatan.",
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan.",
      });
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-t-2xl sm:rounded-lg border border-border bg-card shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 font-bold shadow-2xs shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                Tambah &amp; Kelola Anggota Komunitas
              </h3>
              <p className="text-2xs text-muted-foreground truncate">
                {room.nama} • {Math.max(members.length, existingMemberUserIds.size, room.jumlah_anggota || 0)} Anggota Tergabung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {canManage && (room.is_kegiatan || room.jenis === "kegiatan") && (
              <button
                type="button"
                onClick={handleDeleteGroup}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Hapus Grup Kegiatan Ini"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shrink-0"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-border bg-muted/40 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("anggota")}
            className={`flex-1 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md px-4 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "anggota"
                ? "bg-card text-foreground shadow-2xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Daftar Anggota ({Math.max(members.length, existingMemberUserIds.size, room.jumlah_anggota || 0)})</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setActiveTab("undang")}
              className={`flex-1 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md px-4 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "undang"
                  ? "bg-card text-primary shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Undang Pengguna Baru</span>
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {actionMessage && (
          <div
            className={`mx-4 sm:mx-5 mt-3.5 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              actionMessage.type === "success"
                ? "bg-primary/10 border border-primary/20 text-primary"
                : "bg-destructive/10 border border-destructive/20 text-destructive"
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* TAB 1: DAFTAR ANGGOTA YANG SUDAH TERGABUNG */}
        {activeTab === "anggota" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                placeholder="Cari nama anggota grup..."
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {isLoadingMembers ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Memuat data anggota...</span>
              </div>
            ) : filteredCurrentMembers.length === 0 ? (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Users className="h-6 w-6" />
                </div>
                {searchMemberQuery.trim() ? (
                  <p className="text-xs text-muted-foreground">
                    Tidak ada anggota yang cocok dengan kata kunci &quot;{searchMemberQuery}&quot;.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">
                      Belum ada anggota terdaftar di grup ini
                    </p>
                    <p className="text-2xs text-muted-foreground max-w-xs mx-auto">
                      Pengguna yang diundang langsung otomatis tergabung tanpa perlu persetujuan (approve) manual.
                    </p>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("undang")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mt-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Undang Pengguna Sekarang</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCurrentMembers.map((m) => {
                  const prof = m.profile;
                  const isOnline = onlineUserIds.has(m.user_id);
                  const initial = (prof?.nama_lengkap || "W")[0].toUpperCase();
                  const isMe = m.user_id === currentUserId;

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-xs shadow-2xs border border-primary/20">
                            {prof?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prof.avatar_url}
                                alt={prof.nama_lengkap}
                                className="h-full w-full rounded-md object-cover"
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-background" />
                            </span>
                          )}
                        </div>

                        {/* Profile Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isMe ? (
                              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                                {prof?.nama_lengkap || "Warga Jarimas"} (Anda)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  openChatWithUser(m.user_id);
                                }}
                                className="text-xs sm:text-sm font-bold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors text-left truncate cursor-pointer"
                                title={`Mulai Chat dengan ${prof?.nama_lengkap || "Warga"}`}
                              >
                                {prof?.nama_lengkap || "Warga Jarimas"}
                              </button>
                            )}
                            {isSuperAdmin(prof) && (
                              <span className="rounded-md bg-secondary/15 border border-secondary/30 text-secondary px-1.5 py-0.2 text-[9px] font-semibold">
                                Super Admin
                              </span>
                            )}
                            {isAdminPusat(prof) && (
                              <span className="rounded-md bg-primary/15 border border-primary/30 text-primary px-1.5 py-0.2 text-[9px] font-semibold">
                                Admin Pusat
                              </span>
                            )}
                            <span className="rounded-md bg-muted px-1.5 py-0.2 text-[9px] font-medium text-muted-foreground capitalize">
                              {m.peran}
                            </span>
                          </div>
                          <p className="text-2xs text-muted-foreground truncate">
                            {prof?.email || "Tergabung via undangan Admin"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {!isMe && (
                          <button
                            type="button"
                            onClick={() => {
                                  onClose();
                                  openChatWithUser(m.user_id);
                                }}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-200 px-2 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                            title={`Chat langsung dengan ${prof?.nama_lengkap || "Pengguna"}`}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden sm:inline">Chat</span>
                          </button>
                        )}

                        {/* Action: Keluarkan jika Admin & bukan pembuat */}
                        {canManage && !isMe && !isSuperAdmin(prof) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(
                                m.user_id,
                                prof?.nama_lengkap || "Pengguna"
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border border-border"
                            title="Keluarkan dari grup"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Opsi Hapus Grup */}
            {canManage && (room.is_kegiatan || room.jenis === "kegiatan") && (
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-2xs text-muted-foreground">
                  Grup sudah selesai atau tidak digunakan lagi?
                </span>
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Grup Kegiatan</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: + UNDANG ANGGOTA BARU (KHUSUS ADMIN) */}
        {activeTab === "undang" && canManage && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground leading-relaxed">
              Cari dan pilih pengguna terdaftar untuk langsung dimasukkan ke dalam komunitas <strong>{room.nama}</strong>. Anggota baru otomatis berstatus aktif (terverifikasi) dan dapat langsung berinteraksi.
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchInviteQuery}
                onChange={(e) => setSearchInviteQuery(e.target.value)}
                placeholder="Cari nama, email, atau komunitas pengguna..."
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Sub-header dengan Toggle Pilih Semua */}
            <div className="flex items-center justify-between text-2xs px-1">
              <span className="font-semibold text-muted-foreground">
                {isLoadingUsers
                  ? "Memuat daftar pengguna..."
                  : `Tersedia ${candidateUsersToInvite.length} pengguna:`}
              </span>
              {candidateUsersToInvite.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedInviteIds.size === candidateUsersToInvite.length) {
                      setSelectedInviteIds(new Set());
                    } else {
                      setSelectedInviteIds(new Set(candidateUsersToInvite.map((u) => u.id)));
                    }
                  }}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  {selectedInviteIds.size === candidateUsersToInvite.length
                    ? "Batal Pilih Semua"
                    : `Pilih Semua (${candidateUsersToInvite.length})`}
                </button>
              )}
            </div>

            {/* Candidate List */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 rounded-lg border border-border bg-muted/20 p-2">
              {isLoadingUsers ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Memuat daftar pengguna terdaftar...</span>
                </div>
              ) : candidateUsersToInvite.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  {searchInviteQuery.trim()
                    ? `Tidak ada pengguna yang cocok dengan "${searchInviteQuery}".`
                    : "Tidak ada pengguna baru yang dapat diundang. Semua pengguna telah menjadi anggota komunitas ini."}
                </div>
              ) : (
                candidateUsersToInvite.map((user) => {
                  const isSelected = selectedInviteIds.has(user.id);
                  const isOnline = onlineUserIds.has(user.id);
                  const initial = (user.nama_lengkap || "W")[0].toUpperCase();

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleSelectInvite(user.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 shadow-2xs"
                          : "bg-card border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                        </div>

                        <div className="relative shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-2xs border border-primary/20">
                            {user.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatar_url}
                                alt={user.nama_lengkap}
                                className="h-full w-full rounded-md object-cover"
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-background" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-bold text-foreground truncate block">
                            {user.nama_lengkap}
                          </span>
                          <span className="text-2xs text-muted-foreground truncate block">
                            {user.komunitas_list && user.komunitas_list.length > 0
                              ? user.komunitas_list.map((c) => c.nama).join(", ")
                              : user.email || "Warga Jarimas"}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-2xs font-semibold text-primary uppercase font-mono ml-2 shrink-0">
                          Dipilih
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {selectedInviteIds.size} pengguna dipilih
              </span>

              <button
                type="button"
                onClick={handleInviteSubmit}
                disabled={isSubmittingInvite || selectedInviteIds.size === 0}
                className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs font-semibold text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmittingInvite ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menambahkan...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Tambahkan ke Komunitas ({selectedInviteIds.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
