"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import { isSuperAdmin, isAdminPusat, isProtectedSuperAdmin, isRoleAdmin, formatWhatsAppUrl, cn } from "@/lib/utils";
import { toggleAdminPusatRoleAction, toggleAdminKotaRoleAction } from "@/app/actions/admin";
import type { RegisteredUserItem } from "@/types/database";
import type { AdminTierLevel } from "@/lib/admin-helpers";

export interface SuperAdminWargaMonitoringToolProps {
  initialUsers: RegisteredUserItem[];
  currentUserId: string | null;
  viewerTier?: AdminTierLevel;
}

export function SuperAdminWargaMonitoringTool({
  initialUsers,
  currentUserId,
  viewerTier = "super_admin",
}: SuperAdminWargaMonitoringToolProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [usersList, setUsersList] = useState<RegisteredUserItem[]>(initialUsers);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "semua" | "online" | "posyandu" | "paud" | "warga_kita"
  >("semua");

  const { onlineUserIds, isUserOnline, openChatWithUser } =
    useGlobalMessageNotification();

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

  // Hitung jumlah online secara realtime
  const onlineCount = useMemo(() => {
    return usersList.filter(
      (u) => u.id !== currentUserId && onlineUserIds.has(u.id)
    ).length;
  }, [usersList, currentUserId, onlineUserIds]);

  // Filter daftar pengguna berdasarkan pencarian dan tab filter
  const filteredUsers = useMemo(() => {
    let result = usersList.filter((u) => u.id !== currentUserId);

    // Filter tab
    if (selectedFilter === "online") {
      result = result.filter((u) => onlineUserIds.has(u.id));
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

  return (
    <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden transition-all">
      {/* Header Accordion */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-teal-700 via-primary to-teal-800 text-white cursor-pointer select-none transition-all hover:opacity-95 min-h-[44px]"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-xs">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Monitoring Warga Terdaftar &amp; Status Online
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
              Pantau seluruh pengguna yang telah registrasi, deteksi warga yang sedang online di website, dan mulai percakapan langsung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-lg bg-white/20 border border-white/30 px-2.5 py-1 text-xs font-bold text-white">
              {initialUsers.length} Warga
            </span>
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
        <div className="p-4 sm:p-5 space-y-4">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              className={cn(
                "p-3 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 border animate-in fade-in duration-200",
                toastMessage.isError
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              )}
            >
              <span>{toastMessage.text}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-xs opacity-70 hover:opacity-100 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Total Registrasi
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                  {initialUsers.length}
                </span>
                <span className="text-xs text-muted-foreground font-medium">Akun</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-primary/10 border border-primary/30 space-y-1">
              <span className="text-[11px] font-semibold text-primary uppercase block">
                Online di Web
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-primary">
                  {onlineCount}
                </span>
                <span className="text-xs text-primary font-medium">
                  Aktif Sekarang
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Warga Posyandu
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                  {
                    initialUsers.filter((u) =>
                      u.komunitas_list?.some((c) => c.jenis === "posyandu")
                    ).length
                  }
                </span>
                <span className="text-xs text-muted-foreground font-medium">Kader/Ibu</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Warga PAUD
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                  {
                    initialUsers.filter((u) =>
                      u.komunitas_list?.some((c) => c.jenis === "satuan_paud")
                    ).length
                  }
                </span>
                <span className="text-xs text-muted-foreground font-medium">Guru/Wali</span>
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
                  placeholder="Cari nama warga, email, WhatsApp, wilayah..."
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
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-border bg-card text-center space-y-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">
                Tidak ada pengguna ditemukan
              </p>
              <p className="text-xs text-muted-foreground">
                Coba sesuaikan kata kunci pencarian atau pilih filter lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredUsers.map((userItem) => {
                const isOnline = onlineUserIds.has(userItem.id);
                const initial = userItem.nama_lengkap.charAt(0).toUpperCase();
                const waUrl = formatWhatsAppUrl(
                  userItem.nomor_hp,
                  "Halo, kami dari Jarimas Indonesia."
                );

                return (
                  <div
                    key={userItem.id}
                    className={`flex flex-col justify-between p-4 rounded-lg border transition-all shadow-xs ${
                      isOnline
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* User Header Info */}
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-base shadow-xs border border-border">
                            {userItem.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={userItem.avatar_url}
                                alt={userItem.nama_lengkap}
                                className="h-full w-full rounded-lg object-cover"
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
                      <div className="text-[10px]">
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

                      {/* Affiliation Tags */}
                      {userItem.komunitas_list &&
                        userItem.komunitas_list.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {userItem.komunitas_list.slice(0, 2).map((comm) => (
                              <Link
                                key={comm.id}
                                href={`/komunitas/${comm.id}`}
                                title={`Buka komunitas ${comm.nama} untuk komunikasi & koordinasi`}
                                className="inline-flex items-center gap-1 rounded-md bg-muted hover:bg-primary/10 border border-border hover:border-primary/40 px-2 py-0.5 text-[10px] font-semibold text-foreground hover:text-primary transition-all duration-150 truncate max-w-full group cursor-pointer shadow-2xs"
                              >
                                {comm.jenis === "posyandu" ? (
                                  <HeartPulse className="h-3 w-3 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                                ) : comm.jenis === "satuan_paud" ? (
                                  <GraduationCap className="h-3 w-3 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <Building2 className="h-3 w-3 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="truncate group-hover:underline">
                                  {comm.peran} • {comm.nama}
                                </span>
                                <ExternalLink className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 group-hover:text-primary shrink-0 transition-opacity" />
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 mt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 1. Target adalah Super Admin (Permanen / Imunitas Mutlak) */}
                        {isProtectedSuperAdmin(userItem) ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 cursor-not-allowed select-none"
                            title="Akun Super Admin memiliki status imunitas mutlak dan tidak bisa dicabut atau diturunkan"
                          >
                            <Shield className="h-3 w-3 text-amber-500" />
                            Super Admin (Permanen)
                          </span>
                        ) : viewerTier === "super_admin" ? (
                          /* HANYA SUPER ADMIN yang mengelola Admin Pusat */
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
                          ) : (userItem.komunitas_list?.some(
                              (c) =>
                                (c.nama.toLowerCase().includes("warga kota tegal") ||
                                  (c.jenis === "warga_kita" && (c.kecamatan === "Kota Tegal" || !c.kecamatan))) &&
                                isRoleAdmin(c.peran)
                            )) ? (
                            /* Pengangkatan Admin Pusat secara berjenjang HANYA tersedia bagi Admin Kota Tegal */
                            <button
                              type="button"
                              disabled={processingUserId === userItem.id}
                              onClick={() => handleToggleAdminPusat(userItem)}
                              className="inline-flex min-h-[32px] items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 transition-all cursor-pointer disabled:opacity-50"
                              title="Promosikan Admin Kota ini menjadi Admin Pusat secara berjenjang"
                            >
                              {processingUserId === userItem.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Shield className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                              )}
                              + Angkat Admin Pusat
                            </button>
                          ) : null
                        ) : viewerTier === "admin_pusat" ? (
                          /* ADMIN PUSAT: Hanya bisa mengelola Admin di bawahnya (Admin Kota) */
                          isAdminPusat(userItem) ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/25 select-none"
                              title="Pengguna ini adalah sesama Admin Pusat (satu level)"
                            >
                              <ShieldCheck className="h-3 w-3 text-primary" />
                              Admin Pusat
                            </span>
                          ) : userItem.komunitas_list?.some(
                              (c) =>
                                (c.nama.toLowerCase().includes("warga kota tegal") ||
                                  (c.jenis === "warga_kita" && (c.kecamatan === "Kota Tegal" || !c.kecamatan))) &&
                                isRoleAdmin(c.peran)
                            ) ? (
                            <button
                              type="button"
                              disabled={processingUserId === userItem.id}
                              onClick={() => handleToggleAdminKota(userItem)}
                              className="inline-flex min-h-[32px] items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                              title="Cabut wewenang sebagai Admin Kota Tegal"
                            >
                              {processingUserId === userItem.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ShieldAlert className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                              )}
                              Cabut Admin Kota
                            </button>
                          ) : userItem.komunitas_list?.some((c) => isRoleAdmin(c.peran)) ? (
                            <button
                              type="button"
                              disabled={processingUserId === userItem.id}
                              onClick={() => handleToggleAdminKota(userItem)}
                              className="inline-flex min-h-[32px] items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 transition-all cursor-pointer disabled:opacity-50"
                              title="Angkat Admin ini menjadi Admin Kota Tegal secara berjenjang"
                            >
                              {processingUserId === userItem.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Shield className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                              )}
                              + Angkat Admin Kota
                            </button>
                          ) : null
                        ) : (
                          /* Tingkat Admin lainnya: Menampilkan label status pengguna */
                          isAdminPusat(userItem) ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/25 select-none"
                              title="Admin Pusat"
                            >
                              <ShieldCheck className="h-3 w-3 text-primary" />
                              Admin Pusat
                            </span>
                          ) : userItem.komunitas_list?.some(
                              (c) =>
                                (c.nama.toLowerCase().includes("warga kota tegal") ||
                                  (c.jenis === "warga_kita" && (c.kecamatan === "Kota Tegal" || !c.kecamatan))) &&
                                isRoleAdmin(c.peran)
                            ) ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/25 select-none"
                              title="Admin Kota Tegal"
                            >
                              <Shield className="h-3 w-3 text-teal-600" />
                              Admin Kota
                            </span>
                          ) : null
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 px-3 py-1 text-[11px] font-bold text-secondary transition-all"
                            title="Hubungi via WhatsApp"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WA</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openChatWithUser(userItem)}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-1 text-[11px] font-bold text-primary-foreground transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Buka ruang percakapan dengan pengguna ini"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Mulai Chat</span>
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
    </div>
  );
}

export { SuperAdminWargaMonitoringTool as WargaMonitoringTool };

