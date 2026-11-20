"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Clock,
  MapPin,
  Building2,
  HeartPulse,
  GraduationCap,
  Phone,
  Mail,
  ExternalLink,
  Crown,
  Radio,
  UserCheck,
  CheckCircle2,
  Shield,
  ShieldAlert,
  Loader2,
  UserPlus,
  UserMinus,
  Plus,
  X,
  AlertTriangle,
  AlertCircle,
  Check,
  MoreVertical,
  Settings,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import {
  isSuperAdmin,
  isAdminPusat,
  isProtectedSuperAdmin,
  isRoleAdmin,
  formatPeranDisplay,
  formatWhatsAppUrl,
  cn,
} from "@/lib/utils";
import {
  toggleAdminPusatRoleAction,
  toggleAdminKotaRoleAction,
  getAllKomunitasOptionsAction,
  assignUserToKomunitasAction,
  removeUserFromKomunitasAction,
  assignOrRevokeKomunitasAdminAction,
  type KomunitasOptionItem,
} from "@/app/actions/admin";
import type { RegisteredUserItem, UserKomunitasAffiliation } from "@/types/database";
import type { AdminTierLevel } from "@/lib/admin-helpers";

export interface SuperAdminWargaMonitoringToolProps {
  initialUsers: RegisteredUserItem[];
  currentUserId: string | null;
  viewerTier?: AdminTierLevel | null;
}

export function SuperAdminWargaMonitoringTool({
  initialUsers,
  currentUserId,
  viewerTier: propViewerTier,
}: SuperAdminWargaMonitoringToolProps) {
  const viewerTier = propViewerTier || "super_admin";
  const [isOpen, setIsOpen] = useState(true);
  const [usersList, setUsersList] = useState<RegisteredUserItem[]>(initialUsers);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "semua" | "online" | "belum_komunitas" | "posyandu" | "paud" | "warga_kita"
  >("semua");

  // State untuk Modal Penempatan Komunitas
  const [assignTargetUser, setAssignTargetUser] = useState<RegisteredUserItem | null>(null);
  const [allKomunitasOptions, setAllKomunitasOptions] = useState<KomunitasOptionItem[]>([]);
  const [isLoadingKomunitas, setIsLoadingKomunitas] = useState(false);
  const [modalKomFilter, setModalKomFilter] = useState<"semua" | "posyandu" | "satuan_paud" | "warga_kita" | "kegiatan">("semua");
  const [modalKomSearch, setModalKomSearch] = useState("");
  const [selectedKomunitasId, setSelectedKomunitasId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("Anggota");
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // State untuk Modal Ubah Peran / Jadikan Admin Komunitas
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    user: RegisteredUserItem;
    community: UserKomunitasAffiliation;
  } | null>(null);
  const [newKomRole, setNewKomRole] = useState<string>("");
  const [isSubmittingRoleChange, setIsSubmittingRoleChange] = useState(false);

  const { onlineUserIds, isUserOnline, openChatWithUser } =
    useGlobalMessageNotification();

  // Sinkronisasi data awal jika props initialUsers diperbarui
  useEffect(() => {
    setUsersList(initialUsers);
  }, [initialUsers]);

  // Load daftar seluruh komunitas ketika modal dibuka
  const handleOpenAssignModal = async (userItem: RegisteredUserItem) => {
    setAssignTargetUser(userItem);
    setSelectedKomunitasId("");
    setSelectedRole("Anggota");
    setModalKomSearch("");
    setModalKomFilter("semua");

    if (allKomunitasOptions.length === 0) {
      setIsLoadingKomunitas(true);
      try {
        const res = await getAllKomunitasOptionsAction();
        if (res.success) {
          setAllKomunitasOptions(res.komunitas);
        }
      } catch (err) {
        console.warn("Gagal memuat daftar komunitas:", err);
      } finally {
        setIsLoadingKomunitas(false);
      }
    }
  };

  // Submit Penempatan Pengguna ke Komunitas
  const handleSubmitAssign = async () => {
    if (!assignTargetUser || !selectedKomunitasId) {
      setToastMessage({ text: "Pilih salah satu komunitas tujuan terlebih dahulu.", isError: true });
      return;
    }

    setIsSubmittingAssign(true);
    try {
      const selectedKom = allKomunitasOptions.find((k) => k.id === selectedKomunitasId);
      const res = await assignUserToKomunitasAction({
        userId: assignTargetUser.id,
        komunitasId: selectedKomunitasId,
        peran: selectedRole || "Anggota",
      });

      if (res.success) {
        // Update local state secara realtime
        setUsersList((prev) =>
          prev.map((u) => {
            if (u.id !== assignTargetUser.id) return u;
            const existingList = u.komunitas_list || [];
            const alreadyIdx = existingList.findIndex((c) => c.id === selectedKomunitasId);
            let updatedList: UserKomunitasAffiliation[];
            if (alreadyIdx >= 0) {
              updatedList = existingList.map((c, idx) =>
                idx === alreadyIdx ? { ...c, peran: selectedRole || "Anggota", status: "approved" } : c
              );
            } else {
              updatedList = [
                ...existingList,
                {
                  id: selectedKomunitasId,
                  nama: selectedKom?.nama || "Komunitas",
                  jenis: selectedKom?.jenis || "warga_kita",
                  peran: selectedRole || "Anggota",
                  status: "approved",
                  kecamatan: selectedKom?.kecamatan || undefined,
                  kelurahan: selectedKom?.kelurahan || undefined,
                  rw: selectedKom?.rw,
                  rt: selectedKom?.rt,
                },
              ];
            }
            return { ...u, komunitas_list: updatedList };
          })
        );

        setToastMessage({ text: res.message });
        setAssignTargetUser(null);
      } else {
        setToastMessage({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || "Gagal menempatkan pengguna ke komunitas.", isError: true });
    } finally {
      setIsSubmittingAssign(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Keluarkan Pengguna dari Komunitas
  const handleRemoveFromKomunitas = async (
    userItem: RegisteredUserItem,
    community: UserKomunitasAffiliation
  ) => {
    const targetName = userItem.nama_lengkap || userItem.email || "Pengguna";
    const confirmMsg = `Keluarkan ${targetName} dari komunitas ${community.nama}? Tindakan ini akan mencabut seluruh akses dan keanggotaannya di komunitas tersebut.`;

    if (!window.confirm(confirmMsg)) return;

    setProcessingUserId(userItem.id);
    try {
      const res = await removeUserFromKomunitasAction({
        userId: userItem.id,
        komunitasId: community.id,
        anggotaId: community.anggota_id,
      });

      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => {
            if (u.id !== userItem.id) return u;
            const updated = (u.komunitas_list || []).filter((c) => c.id !== community.id);
            return { ...u, komunitas_list: updated };
          })
        );
        setToastMessage({ text: res.message });
      } else {
        setToastMessage({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || "Gagal mengeluarkan anggota dari komunitas.", isError: true });
    } finally {
      setProcessingUserId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Buka Modal Ubah Peran / Jadikan Admin
  const handleOpenRoleModal = (
    userItem: RegisteredUserItem,
    community: UserKomunitasAffiliation
  ) => {
    setRoleChangeTarget({ user: userItem, community });
    setNewKomRole(community.peran || "Pengurus");
  };

  // Submit Ubah Peran / Jadikan Admin
  const handleSubmitRoleChange = async () => {
    if (!roleChangeTarget || !newKomRole.trim()) return;

    setIsSubmittingRoleChange(true);
    try {
      const res = await assignOrRevokeKomunitasAdminAction({
        anggotaId: roleChangeTarget.community.anggota_id || roleChangeTarget.user.id,
        newRole: newKomRole.trim(),
        komunitasId: roleChangeTarget.community.id,
      });

      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => {
            if (u.id !== roleChangeTarget.user.id) return u;
            const updated = (u.komunitas_list || []).map((c) =>
              c.id === roleChangeTarget.community.id ? { ...c, peran: newKomRole.trim(), status: "approved" } : c
            );
            return { ...u, komunitas_list: updated };
          })
        );
        setToastMessage({ text: res.message });
        setRoleChangeTarget(null);
      } else {
        setToastMessage({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || "Gagal mengubah peran di komunitas.", isError: true });
    } finally {
      setIsSubmittingRoleChange(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Toggle Admin Pusat (Khusus Super Admin)
  const handleToggleAdminPusat = async (userItem: RegisteredUserItem) => {
    const isCurrentlyAdminPusat = Boolean(userItem.is_admin_pusat || isAdminPusat(userItem));
    const targetName = userItem.nama_lengkap || userItem.email || "Pengguna";
    const confirmMsg = isCurrentlyAdminPusat
      ? `Cabut status Admin Pusat dari ${targetName}? Pengguna ini tidak lagi memiliki hak manajerial global.`
      : `Angkat ${targetName} sebagai Admin Pusat? Pengguna ini akan memiliki wewenang manajerial global, mengelola Jarimas Market, dan menetapkan admin wilayah berjenjang.`;

    if (!window.confirm(confirmMsg)) return;

    setProcessingUserId(userItem.id);
    try {
      const res = await toggleAdminPusatRoleAction(userItem.id, !isCurrentlyAdminPusat);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === userItem.id ? { ...u, is_admin_pusat: !isCurrentlyAdminPusat } : u
          )
        );
        setToastMessage({ text: res.message });
      } else {
        setToastMessage({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || "Gagal memproses peran.", isError: true });
    } finally {
      setProcessingUserId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Toggle Admin Kota
  const handleToggleAdminKota = async (userItem: RegisteredUserItem) => {
    const isCurrentlyAdminKota = userItem.komunitas_list?.some(
      (c) =>
        (c.nama.toLowerCase().includes("warga kota tegal") ||
          (c.jenis === "warga_kita" && (c.kecamatan === "Kota Tegal" || !c.kecamatan))) &&
        isRoleAdmin(c.peran)
    );
    const targetName = userItem.nama_lengkap || userItem.email || "Pengguna";
    const confirmMsg = isCurrentlyAdminKota
      ? `Cabut peran Admin Kota Tegal dari ${targetName}?`
      : `Angkat ${targetName} sebagai Admin Kota Tegal? Pengguna ini akan memiliki wewenang mengelola wilayah Kota Tegal berjenjang.`;

    if (!window.confirm(confirmMsg)) return;

    setProcessingUserId(userItem.id);
    try {
      const res = await toggleAdminKotaRoleAction(userItem.id, !isCurrentlyAdminKota);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => {
            if (u.id !== userItem.id) return u;
            const existingKomList = u.komunitas_list || [];
            let updatedKomList = [...existingKomList];
            if (!isCurrentlyAdminKota) {
              updatedKomList.push({
                id: "cb45f6c3-efbf-404c-8fba-4a39299b710f",
                nama: "Komunitas Warga Kota Tegal",
                peran: "Admin Kota Tegal",
                jenis: "warga_kita",
                kecamatan: "Kota Tegal",
              });
            } else {
              updatedKomList = updatedKomList.filter(
                (c) => !c.nama.toLowerCase().includes("warga kota tegal")
              );
            }
            return { ...u, komunitas_list: updatedKomList };
          })
        );
        setToastMessage({ text: res.message });
      } else {
        setToastMessage({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || "Gagal memproses peran.", isError: true });
    } finally {
      setProcessingUserId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Hitung jumlah online & belum masuk komunitas
  const onlineCount = useMemo(() => {
    return usersList.filter(
      (u) => u.id !== currentUserId && onlineUserIds.has(u.id)
    ).length;
  }, [usersList, currentUserId, onlineUserIds]);

  const belumKomunitasCount = useMemo(() => {
    return usersList.filter(
      (u) => u.id !== currentUserId && (!u.komunitas_list || u.komunitas_list.length === 0)
    ).length;
  }, [usersList, currentUserId]);

  // Filter daftar pengguna berdasarkan pencarian dan tab filter
  const filteredUsers = useMemo(() => {
    let result = usersList.filter((u) => u.id !== currentUserId);

    // Filter tab
    if (selectedFilter === "online") {
      result = result.filter((u) => onlineUserIds.has(u.id));
    } else if (selectedFilter === "belum_komunitas") {
      result = result.filter((u) => !u.komunitas_list || u.komunitas_list.length === 0);
    } else if (selectedFilter === "posyandu") {
      result = result.filter((u) =>
        u.komunitas_list?.some((c) => c.jenis === "posyandu")
      );
    } else if (selectedFilter === "paud") {
      result = result.filter((u) =>
        u.komunitas_list?.some((c) => c.jenis === "satuan_paud")
      );
    } else if (selectedFilter === "warga_kita") {
      result = result.filter((u) =>
        u.komunitas_list?.some((c) => c.jenis === "warga_kita")
      );
    }

    // Filter pencarian
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((u) => {
        const matchName = u.nama_lengkap.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.nomor_hp?.includes(q);
        const matchComm = u.komunitas_list?.some(
          (c) =>
            c.nama.toLowerCase().includes(q) ||
            c.peran.toLowerCase().includes(q) ||
            c.kecamatan?.toLowerCase().includes(q) ||
            c.kelurahan?.toLowerCase().includes(q)
        );
        return matchName || matchEmail || matchPhone || matchComm;
      });
    }

    // Urutkan: Warga yang sedang online diposisikan di paling atas
    return [...result].sort((a, b) => {
      const aOnline = onlineUserIds.has(a.id) ? 1 : 0;
      const bOnline = onlineUserIds.has(b.id) ? 1 : 0;
      if (aOnline !== bOnline) {
        return bOnline - aOnline;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [usersList, currentUserId, selectedFilter, searchQuery, onlineUserIds]);

  // Filter daftar komunitas untuk Modal Penempatan
  const filteredModalKomunitas = useMemo(() => {
    let list = allKomunitasOptions;
    if (modalKomFilter !== "semua") {
      list = list.filter((k) => k.jenis === modalKomFilter);
    }
    if (modalKomSearch.trim()) {
      const q = modalKomSearch.toLowerCase().trim();
      list = list.filter(
        (k) =>
          k.nama.toLowerCase().includes(q) ||
          k.kecamatan?.toLowerCase().includes(q) ||
          k.kelurahan?.toLowerCase().includes(q) ||
          (k.rw && `rw ${k.rw}`.includes(q)) ||
          (k.rt && `rt ${k.rt}`.includes(q))
      );
    }
    return list;
  }, [allKomunitasOptions, modalKomFilter, modalKomSearch]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={cn(
            "p-3.5 px-4 text-xs font-bold flex items-center justify-between border-b transition-all animate-in fade-in slide-in-from-top-2",
            toastMessage.isError
              ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800"
              : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800"
          )}
        >
          <div className="flex items-center gap-2">
            {toastMessage.isError ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Accordion */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-teal-700 via-primary to-teal-800 text-white cursor-pointer select-none transition-all hover:opacity-95 min-h-[44px]"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Kelola Pengguna Terdaftar &amp; Penempatan Komunitas
              </h3>
              <span className="rounded-md bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                {viewerTier === "admin_pusat"
                  ? "ADMIN PUSAT"
                  : viewerTier === "admin_kota"
                  ? "ADMIN KOTA"
                  : viewerTier === "admin_kecamatan"
                  ? "ADMIN KECAMATAN"
                  : viewerTier === "admin_kelurahan"
                  ? "ADMIN KELURAHAN"
                  : viewerTier === "admin_rw"
                  ? "ADMIN RW"
                  : viewerTier === "admin_rt"
                  ? "ADMIN RT"
                  : "SUPER ADMIN"}
              </span>
            </div>
            <p className="text-xs text-white/85 font-medium line-clamp-1">
              Tempatkan warga ke komunitas, kelola admin, pantau status online, dan mulai percakapan langsung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-lg bg-white/20 border border-white/30 px-2.5 py-1 text-xs font-bold text-white">
              {initialUsers.length} Pengguna
            </span>
            {belumKomunitasCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 text-amber-950 px-2.5 py-1 text-xs font-bold shadow-xs">
                <AlertCircle className="h-3 w-3" />
                {belumKomunitasCount} Belum Masuk Komunitas
              </span>
            )}
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-bold shadow-xs">
                <span className="h-2 w-2 rounded-full bg-secondary-foreground animate-ping" />
                {onlineCount} Online
              </span>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
            <ChevronDown
              className={`h-4 w-4 transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Accordion Content Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Summary Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Total Pengguna
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                  {initialUsers.length}
                </span>
                <span className="text-xs text-muted-foreground font-medium">Akun</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedFilter("online")}
              className="p-3 rounded-lg bg-secondary/10 border border-secondary/25 space-y-1 cursor-pointer hover:bg-secondary/15 transition-all"
            >
              <span className="text-[10px] font-semibold text-secondary uppercase block">
                Sedang Online
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-secondary">
                  {onlineCount}
                </span>
                <span className="text-xs text-secondary/80 font-medium">Aktif</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedFilter("belum_komunitas")}
              className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-1 cursor-pointer hover:bg-amber-500/15 transition-all"
            >
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase block">
                Belum Masuk
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
                  {belumKomunitasCount}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">Perlu Tempat</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedFilter("posyandu")}
              className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 space-y-1 cursor-pointer hover:bg-rose-500/15 transition-all"
            >
              <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase block">
                Posyandu
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-rose-700 dark:text-rose-400">
                  {
                    initialUsers.filter((u) =>
                      u.komunitas_list?.some((c) => c.jenis === "posyandu")
                    ).length
                  }
                </span>
                <span className="text-xs text-rose-600 dark:text-rose-500 font-medium">Kader/Warga</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedFilter("paud")}
              className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/25 space-y-1 cursor-pointer hover:bg-indigo-500/15 transition-all"
            >
              <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase block">
                PAUD
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-400">
                  {
                    initialUsers.filter((u) =>
                      u.komunitas_list?.some((c) => c.jenis === "satuan_paud")
                    ).length
                  }
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-500 font-medium">Guru/Wali</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedFilter("warga_kita")}
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-1 cursor-pointer hover:bg-emerald-500/15 transition-all"
            >
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase block">
                Warga RT/RW
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {
                    initialUsers.filter((u) =>
                      u.komunitas_list?.some((c) => c.jenis === "warga_kita")
                    ).length
                  }
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Pengurus/Warga</span>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama warga, email, WhatsApp, komunitas terdaftar..."
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Tautan ke Percakapan Hub */}
              <Link
                href="/kabar?tab=percakapan"
                className="inline-flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-primary-foreground transition-all shadow-xs shrink-0 cursor-pointer active:scale-98"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Buka Pusat Percakapan</span>
              </Link>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedFilter("semua")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  selectedFilter === "semua"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                Semua ({initialUsers.length - (currentUserId ? 1 : 0)})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("online")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  selectedFilter === "online"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/20"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                <span>Sedang Online ({onlineCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("belum_komunitas")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  selectedFilter === "belum_komunitas"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Belum Masuk Komunitas ({belumKomunitasCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("posyandu")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  selectedFilter === "posyandu"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                Posyandu
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("paud")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  selectedFilter === "paud"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                PAUD
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("warga_kita")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  selectedFilter === "warga_kita"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                Warga RT/RW
              </button>
            </div>
          </div>

          {/* User Cards Grid */}
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border bg-card text-center space-y-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">
                Tidak ada pengguna ditemukan
              </p>
              <p className="text-xs text-muted-foreground">
                Coba sesuaikan kata kunci pencarian atau pilih filter lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-1">
              {filteredUsers.map((userItem) => {
                const isOnline = onlineUserIds.has(userItem.id);
                const initial = userItem.nama_lengkap.charAt(0).toUpperCase();
                const waUrl = formatWhatsAppUrl(
                  userItem.nomor_hp,
                  "Halo, kami dari Jarimas Indonesia."
                );
                const hasNoCommunity = !userItem.komunitas_list || userItem.komunitas_list.length === 0;

                return (
                  <div
                    key={userItem.id}
                    className={cn(
                      "flex flex-col justify-between p-4 sm:p-4.5 rounded-xl border transition-all shadow-xs",
                      hasNoCommunity
                        ? "border-amber-400/50 bg-amber-50/30 dark:bg-amber-950/20"
                        : isOnline
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <div className="space-y-3">
                      {/* User Header Info */}
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-xs border border-border">
                            {userItem.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={userItem.avatar_url}
                                alt={userItem.nama_lengkap}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>

                          {/* Realtime Glowing Presence Indicator */}
                          {isOnline ? (
                            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background" />
                            </span>
                          ) : (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-muted-foreground/40 border-2 border-background" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {userItem.nama_lengkap}
                            </h4>
                            {isOnline && (
                              <span className="rounded-md bg-secondary/15 border border-secondary/30 px-1.5 py-0.5 text-[8px] font-bold text-secondary uppercase shrink-0">
                                Online
                              </span>
                            )}
                            {isSuperAdmin(userItem) ? (
                              <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 text-[9px] font-bold border border-amber-500/30">
                                Super Admin
                              </span>
                            ) : isAdminPusat(userItem) ? (
                              <span className="rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-bold border border-primary/30">
                                Admin Pusat
                              </span>
                            ) : null}
                          </div>

                          <div className="space-y-0.5 text-xs text-muted-foreground">
                            {userItem.email && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="truncate font-mono text-[11px]">
                                  {userItem.email}
                                </span>
                              </div>
                            )}

                            {userItem.nomor_hp && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Phone className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="font-mono text-[11px]">
                                  {userItem.nomor_hp}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Presence & Bergabung */}
                      <div className="text-[10px] flex items-center justify-between">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Sedang Aktif di Website
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Terdaftar:{" "}
                            {new Date(userItem.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>

                      {/* Affiliation / Komunitas yang Diikuti */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Komunitas yang Diikuti ({userItem.komunitas_list?.length || 0}):
                        </span>

                        {hasNoCommunity ? (
                          <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/70 dark:bg-amber-950/40 dark:border-amber-800 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-[11px] leading-tight space-y-0.5">
                              <p className="font-bold text-amber-800 dark:text-amber-300">
                                Belum Bergabung di Komunitas Manapun
                              </p>
                              <p className="text-amber-700/80 dark:text-amber-400/80">
                                Pengguna baru terdaftar dan belum ditempatkan ke RT/RW, Posyandu, atau PAUD.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {userItem.komunitas_list!.map((comm) => {
                              const isPaud = comm.jenis === "satuan_paud";
                              const isPosyandu = comm.jenis === "posyandu";
                              const isKegiatan = comm.jenis === "kegiatan";
                              const isPending = comm.status === "pending";

                              return (
                                <div
                                  key={comm.id}
                                  className={cn(
                                    "flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg border text-[11px] transition-all",
                                    isPaud
                                      ? "bg-indigo-50/60 border-indigo-200 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200"
                                      : isPosyandu
                                      ? "bg-rose-50/60 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
                                      : isKegiatan
                                      ? "bg-amber-50/60 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200"
                                      : "bg-muted/60 border-border text-foreground"
                                  )}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    {isPosyandu ? (
                                      <HeartPulse className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                    ) : isPaud ? (
                                      <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    ) : isKegiatan ? (
                                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    ) : (
                                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                    )}

                                    <div className="truncate">
                                      <span className="font-bold text-foreground">
                                        {formatPeranDisplay(comm.peran)}
                                      </span>
                                      {" • "}
                                      <Link
                                        href={`/komunitas/${comm.id}`}
                                        className="hover:underline font-medium text-foreground/80 hover:text-primary"
                                        title="Buka halaman komunitas ini"
                                      >
                                        {comm.nama}
                                      </Link>
                                      {isPending && (
                                        <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                                          Menunggu
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick Action Per Komunitas: Jadikan Admin & Keluarkan */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRoleModal(userItem, comm)}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-card border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                                      title="Ubah peran atau jadikan admin komunitas"
                                    >
                                      Ubah Peran
                                    </button>

                                    <button
                                      type="button"
                                      disabled={processingUserId === userItem.id}
                                      onClick={() => handleRemoveFromKomunitas(userItem, comm)}
                                      className="p-1 rounded text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
                                      title="Keluarkan dari komunitas ini"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 mt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Tombol Tempatkan ke Komunitas */}
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(userItem)}
                          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Tempatkan pengguna ini ke komunitas (Posyandu, PAUD, RT/RW, Kegiatan)"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Tempatkan ke Komunitas</span>
                        </button>

                        {/* Super Admin / Admin Pusat Management Badges & Actions */}
                        {isProtectedSuperAdmin(userItem) ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 cursor-not-allowed select-none"
                            title="Akun Super Admin memiliki status imunitas mutlak"
                          >
                            <Shield className="h-3 w-3 text-amber-500" />
                            Super Admin (Permanen)
                          </span>
                        ) : viewerTier === "super_admin" ? (
                          /* Super Admin: Toggle Admin Pusat & Admin Kota */
                          isAdminPusat(userItem) ? (
                            <button
                              type="button"
                              disabled={processingUserId === userItem.id}
                              onClick={() => handleToggleAdminPusat(userItem)}
                              className="inline-flex min-h-[32px] items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                              title="Cabut wewenang sebagai Admin Pusat"
                            >
                              {processingUserId === userItem.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ShieldAlert className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                              )}
                              Cabut Admin Pusat
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={processingUserId === userItem.id}
                              onClick={() => handleToggleAdminPusat(userItem)}
                              className="inline-flex min-h-[32px] items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 transition-all cursor-pointer disabled:opacity-50"
                              title="Angkat pengguna ini menjadi Admin Pusat"
                            >
                              {processingUserId === userItem.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Shield className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                              )}
                              + Angkat Admin Pusat
                            </button>
                          )
                        ) : null}
                      </div>

                      {/* Direct Communication Buttons (Chat Langsung & WhatsApp) */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 px-2.5 py-1 text-[11px] font-bold text-secondary transition-all"
                            title="Hubungi via WhatsApp"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WA</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openChatWithUser(userItem)}
                          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-1 text-xs font-bold text-primary-foreground transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Buka percakapan langsung dengan pengguna ini sekarang"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Chat Langsung</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Quick Links */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Menampilkan {filteredUsers.length} dari {initialUsers.length} pengguna terdaftar.
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/kabar?tab=warga"
                className="font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Direktori Lengkap di Kabar</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 1: TEMPATKAN PENGGUNA KE KOMUNITAS */}
      {/* ============================================================================== */}
      {assignTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    Tempatkan Pengguna ke Komunitas
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1">
                    {assignTargetUser.nama_lengkap} ({assignTargetUser.email || assignTargetUser.nomor_hp || "ID Pengguna"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignTargetUser(null)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Type Category Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {(
                  [
                    { id: "semua", label: "Semua" },
                    { id: "posyandu", label: "Posyandu" },
                    { id: "satuan_paud", label: "PAUD" },
                    { id: "warga_kita", label: "Warga RT/RW" },
                    { id: "kegiatan", label: "Kegiatan" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalKomFilter(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer",
                      modalKomFilter === tab.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Komunitas */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={modalKomSearch}
                  onChange={(e) => setModalKomSearch(e.target.value)}
                  placeholder="Cari nama komunitas, kelurahan, kecamatan, atau RT/RW..."
                  className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Komunitas List Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Pilih Komunitas Tujuan ({filteredModalKomunitas.length})
                </label>

                {isLoadingKomunitas ? (
                  <div className="flex items-center justify-center p-8 space-x-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Memuat daftar komunitas...</span>
                  </div>
                ) : filteredModalKomunitas.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                    Tidak ada komunitas yang cocok dengan pencarian.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border rounded-lg p-2 bg-muted/20">
                    {filteredModalKomunitas.map((kom) => {
                      const isSelected = selectedKomunitasId === kom.id;
                      const isPosyandu = kom.jenis === "posyandu";
                      const isPaud = kom.jenis === "satuan_paud";

                      return (
                        <div
                          key={kom.id}
                          onClick={() => {
                            setSelectedKomunitasId(kom.id);
                            // Set peran rekomendasi default sesuai jenis komunitas
                            if (isPosyandu && selectedRole === "Anggota") {
                              setSelectedRole("Kader Posyandu");
                            } else if (isPaud && selectedRole === "Anggota") {
                              setSelectedRole("Guru / Tenaga Pendidik");
                            } else if (kom.jenis === "warga_kita" && selectedRole === "Anggota") {
                              setSelectedRole("Penduduk");
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all",
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                              : "bg-card border-border hover:border-primary/40 text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isPosyandu ? (
                              <HeartPulse className="h-4 w-4 text-rose-500 shrink-0" />
                            ) : isPaud ? (
                              <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0" />
                            ) : (
                              <Building2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="truncate block font-semibold">{kom.nama}</span>
                              <span className="text-[10px] text-muted-foreground truncate block">
                                {kom.jenis.toUpperCase()} • {kom.kelurahan ? `Kel. ${kom.kelurahan}` : ""}{" "}
                                {kom.kecamatan ? `Kec. ${kom.kecamatan}` : ""}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Peran / Kedudukan di Komunitas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Pengurus",
                    "Kader",
                    "Guru / Tenaga Pendidik",
                    "Anggota",
                    "Penduduk",
                    "Wali / Orang Tua",
                  ].map((roleOption) => (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => setSelectedRole(roleOption)}
                      className={cn(
                        "p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between",
                        selectedRole === roleOption
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card border-border hover:bg-muted text-foreground"
                      )}
                    >
                      <span>{roleOption}</span>
                      {selectedRole === roleOption && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    placeholder="Atau ketik peran khusus lainnya..."
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignTargetUser(null)}
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer min-h-[38px]"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isSubmittingAssign || !selectedKomunitasId}
                onClick={handleSubmitAssign}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {isSubmittingAssign ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Simpan &amp; Tempatkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 2: UBAH PERAN / JADIKAN ADMIN KOMUNITAS */}
      {/* ============================================================================== */}
      {roleChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    Ubah Peran / Jadikan Admin
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1">
                    {roleChangeTarget.community.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleChangeTarget(null)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-0.5 text-xs">
                <span className="text-muted-foreground">Pengguna:</span>
                <p className="font-bold text-foreground text-sm">
                  {roleChangeTarget.user.nama_lengkap}
                </p>
                <span className="text-muted-foreground block pt-1">
                  Peran Saat Ini:{" "}
                  <strong className="text-primary font-bold">
                    {formatPeranDisplay(roleChangeTarget.community.peran)}
                  </strong>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Pilih Peran Baru
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Pengurus",
                    "Kader",
                    "Guru / Tenaga Pendidik",
                    "Anggota",
                    "Penduduk",
                  ].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewKomRole(role)}
                      className={cn(
                        "p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between",
                        newKomRole === role
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card border-border hover:bg-muted text-foreground"
                      )}
                    >
                      <span>{role}</span>
                      {newKomRole === role && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    value={newKomRole}
                    onChange={(e) => setNewKomRole(e.target.value)}
                    placeholder="Atau masukkan peran kustom..."
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoleChangeTarget(null)}
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer min-h-[38px]"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isSubmittingRoleChange || !newKomRole.trim()}
                onClick={handleSubmitRoleChange}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {isSubmittingRoleChange ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Simpan Perubahan Peran</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { SuperAdminWargaMonitoringTool as WargaMonitoringTool };
export { SuperAdminWargaMonitoringTool as AdminUserManagementCard };
