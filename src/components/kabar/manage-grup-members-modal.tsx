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
} from "lucide-react";
import {
  getGrupKegiatanMembers,
  addMembersToGrupKegiatan,
  removeMemberFromGrupKegiatan,
} from "@/app/actions/grup-kegiatan";
import type {
  GrupChatRoom,
  GrupKegiatanMemberItem,
  RegisteredUserItem,
} from "@/types/database";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

interface ManageGrupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GrupChatRoom | null;
  allUsers: RegisteredUserItem[];
  canManage: boolean;
  currentUserId: string | null;
  onMembersUpdated?: () => void;
}

export function ManageGrupMembersModal({
  isOpen,
  onClose,
  room,
  allUsers,
  canManage,
  currentUserId,
  onMembersUpdated,
}: ManageGrupMembersModalProps) {
  const { onlineUserIds } = useGlobalMessageNotification();

  const [activeTab, setActiveTab] = useState<"anggota" | "undang">("anggota");
  const [members, setMembers] = useState<GrupKegiatanMemberItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

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
    if (!isOpen || !room) return;

    let isMounted = true;
    async function loadMembers() {
      setIsLoadingMembers(true);
      setActionMessage(null);
      try {
        const res = await getGrupKegiatanMembers(room!.id);
        if (isMounted && res.success) {
          setMembers(res.members || []);
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
  }, [isOpen, room]);

  // Set ID user yang sudah tergabung
  const existingMemberUserIds = useMemo(() => {
    return new Set(members.map((m) => m.user_id));
  }, [members]);

  // Kandidat yang belum tergabung untuk tab "+ Undang"
  const candidateUsersToInvite = useMemo(() => {
    return allUsers
      .filter((u) => !existingMemberUserIds.has(u.id))
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
  }, [allUsers, existingMemberUserIds, searchInviteQuery, onlineUserIds]);

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

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-xl max-h-[88vh] rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ========================================================= */}
        {/* HEADER                                                    */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-teal-600 to-emerald-700 text-white font-bold shadow-xs shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                Kelola Anggota Percakapan
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {room.nama} • {members.length} Pengguna Tergabung
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* TABS (DAFTAR ANGGOTA VS + UNDANG ANGGOTA)                  */}
        {/* ========================================================= */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("anggota")}
            className={`flex-1 inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition-all cursor-pointer ${
              activeTab === "anggota"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Daftar Anggota ({members.length})</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setActiveTab("undang")}
              className={`flex-1 inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition-all cursor-pointer ${
                activeTab === "undang"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
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
            className={`mx-5 mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              actionMessage.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200"
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: DAFTAR ANGGOTA YANG SUDAH TERGABUNG                */}
        {/* ========================================================= */}
        {activeTab === "anggota" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                placeholder="Cari nama anggota grup..."
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {isLoadingMembers ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span>Memuat data anggota...</span>
              </div>
            ) : filteredCurrentMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada anggota yang sesuai dengan pencarian.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCurrentMembers.map((m) => {
                  const prof = m.profile;
                  const isOnline = onlineUserIds.has(m.user_id);
                  const initial = (prof?.nama_lengkap || "W")[0].toUpperCase();
                  const isCreatorOrAdmin =
                    m.peran.toLowerCase().includes("admin") ||
                    prof?.is_super_admin ||
                    prof?.is_admin_pusat;
                  const isMe = m.user_id === currentUserId;

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-700 text-white font-black text-xs shadow-xs">
                            {prof?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prof.avatar_url}
                                alt={prof.nama_lengkap}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white dark:border-slate-900" />
                            </span>
                          )}
                        </div>

                        {/* Profile Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                              {prof?.nama_lengkap || "Warga Jarimas"}
                              {isMe && " (Anda)"}
                            </span>
                            {prof?.is_super_admin && (
                              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 dark:text-emerald-300">
                                Super Admin
                              </span>
                            )}
                            {prof?.is_admin_pusat && (
                              <span className="rounded-full bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-800 px-1.5 py-0.2 text-[9px] font-black text-teal-800 dark:text-teal-300">
                                Admin Pusat
                              </span>
                            )}
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[9px] font-semibold text-slate-500 capitalize">
                              {m.peran}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {prof?.email || "Tergabung via undangan Admin"}
                          </p>
                        </div>
                      </div>

                      {/* Action: Keluarkan jika Admin & bukan pembuat */}
                      {canManage && !isMe && !prof?.is_super_admin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(
                              m.user_id,
                              prof?.nama_lengkap || "Pengguna"
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer shrink-0 ml-2"
                          title="Keluarkan dari grup"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: + UNDANG ANGGOTA BARU (KHUSUS ADMIN)               */}
        {/* ========================================================= */}
        {activeTab === "undang" && canManage && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
              Pilih pengguna terdaftar untuk langsung dimasukkan ke dalam grup kegiatan ini.
              Mereka dapat langsung membaca riwayat pesan dan mengirim obrolan.
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchInviteQuery}
                onChange={(e) => setSearchInviteQuery(e.target.value)}
                placeholder="Cari nama atau email pengguna yang ingin diundang..."
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Candidate List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-2">
              {candidateUsersToInvite.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada pengguna baru yang dapat diundang. Semua pengguna yang sesuai telah menjadi anggota.
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
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-2xs"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                        </div>

                        <div className="relative shrink-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-black text-xs">
                            {user.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatar_url}
                                alt={user.nama_lengkap}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate block">
                            {user.nama_lengkap}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {user.komunitas_list && user.komunitas_list.length > 0
                              ? user.komunitas_list.map((c) => c.nama).join(", ")
                              : user.email || "Warga Jarimas"}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-black text-emerald-600 uppercase font-mono ml-2 shrink-0">
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
              <span className="text-xs font-bold text-slate-500">
                {selectedInviteIds.size} pengguna dipilih
              </span>

              <button
                type="button"
                onClick={handleInviteSubmit}
                disabled={isSubmittingInvite || selectedInviteIds.size === 0}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmittingInvite ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menambahkan...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Tambahkan ke Grup ({selectedInviteIds.size})</span>
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
