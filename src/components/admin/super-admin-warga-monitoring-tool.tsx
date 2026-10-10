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
} from "lucide-react";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import { isSuperAdmin, isAdminPusat, formatWhatsAppUrl } from "@/lib/utils";
import type { RegisteredUserItem } from "@/types/database";

interface SuperAdminWargaMonitoringToolProps {
  initialUsers: RegisteredUserItem[];
  currentUserId: string | null;
}

export function SuperAdminWargaMonitoringTool({
  initialUsers,
  currentUserId,
}: SuperAdminWargaMonitoringToolProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "semua" | "online" | "posyandu" | "paud" | "warga_kita"
  >("semua");

  const { onlineUserIds, isUserOnline, openChatWithUser } =
    useGlobalMessageNotification();

  // Hitung jumlah online secara realtime
  const onlineCount = useMemo(() => {
    return initialUsers.filter(
      (u) => u.id !== currentUserId && onlineUserIds.has(u.id)
    ).length;
  }, [initialUsers, currentUserId, onlineUserIds]);

  // Filter daftar pengguna berdasarkan pencarian dan tab filter
  const filteredUsers = useMemo(() => {
    let result = initialUsers.filter((u) => u.id !== currentUserId);

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
  }, [initialUsers, currentUserId, selectedFilter, searchQuery, onlineUserIds]);

  return (
    <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      {/* Header Accordion */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-3 p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white cursor-pointer select-none transition-all hover:opacity-95"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs shadow-2xs">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black tracking-tight truncate">
                Monitoring Warga Terdaftar &amp; Status Online
              </h3>
              <span className="rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-2xs font-extrabold text-white">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-white/90 font-medium line-clamp-1">
              Pantau seluruh pengguna yang telah registrasi, deteksi warga yang sedang online di website, dan mulai percakapan langsung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-full bg-white/25 border border-white/30 px-3 py-1 text-xs font-black text-white">
              {initialUsers.length} Warga
            </span>
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 text-slate-900 px-3 py-1 text-xs font-black animate-pulse shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-950 animate-ping" />
                {onlineCount} Online Sekarang
              </span>
            )}
          </div>
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
            <ChevronDown
              className={`h-5 w-5 transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Accordion Content Body */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-5 animate-in fade-in-50 duration-300">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Total Registrasi
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                  {initialUsers.length}
                </span>
                <span className="text-xs text-slate-500 font-bold">Akun</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                Online di Web
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {onlineCount}
                </span>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  Aktif Sekarang
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Warga Posyandu
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                  {
                    initialUsers.filter((u) =>
                      u.komunitas_list?.some((c) => c.jenis === "posyandu")
                    ).length
                  }
                </span>
                <span className="text-xs text-slate-500 font-bold">Kader/Ibu</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Warga PAUD
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                  {
                    initialUsers.filter((u) =>
                      u.komunitas_list?.some((c) => c.jenis === "satuan_paud")
                    ).length
                  }
                </span>
                <span className="text-xs text-slate-500 font-bold">Guru/Wali</span>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama warga, email, WhatsApp, wilayah..."
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tautan ke Percakapan Hub */}
              <Link
                href="/kabar?tab=percakapan"
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs shrink-0"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === "semua"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                Semua ({initialUsers.length - (currentUserId ? 1 : 0)})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("online")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === "online"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 Sedang Online ({onlineCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("posyandu")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === "posyandu"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                Posyandu
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("paud")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === "paud"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                PAUD
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter("warga_kita")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === "warga_kita"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                Warga RT/RW
              </button>
            </div>
          </div>

          {/* User Cards Grid */}
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <Users className="h-8 w-8 text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tidak ada pengguna ditemukan
              </p>
              <p className="text-xs text-slate-500">
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
                    className={`flex flex-col justify-between p-4 rounded-2xl border-2 transition-all shadow-2xs ${
                      isOnline
                        ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-400/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* User Header Info */}
                      <div className="flex items-start gap-3">
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

                          {/* Realtime Glowing Presence Indicator */}
                          {isOnline ? (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                            </span>
                          ) : (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                              {userItem.nama_lengkap}
                            </h4>
                            {isOnline && (
                              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.2 text-[8px] font-black text-emerald-800 dark:text-emerald-300 uppercase shrink-0 animate-pulse">
                                Online
                              </span>
                            )}
                            {userItem.is_super_admin || isSuperAdmin(userItem) ? (
                              <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 text-[9px] font-black text-amber-900 dark:text-amber-300 border border-amber-300">
                                Super Admin
                              </span>
                            ) : userItem.is_admin_pusat || isAdminPusat(userItem) ? (
                              <span className="rounded-full bg-teal-100 dark:bg-teal-950/80 px-1.5 py-0.2 text-[9px] font-black text-teal-900 dark:text-teal-300 border border-teal-300">
                                Admin Pusat
                              </span>
                            ) : null}
                          </div>

                          <div className="space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {userItem.email && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="truncate font-mono text-[11px]">
                                  {userItem.email}
                                </span>
                              </div>
                            )}

                            {userItem.nomor_hp && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Phone className="h-3 w-3 shrink-0 text-slate-400" />
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Sedang Aktif di Website Sekarang
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Terdaftar sejak:{" "}
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
                          <div className="flex flex-wrap gap-1 pt-1">
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
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-400">
                        Akses Super Admin: Direct Chat Aktif
                      </div>

                      <div className="flex items-center gap-1.5">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[32px] items-center gap-1 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 transition-all"
                            title="Hubungi via WhatsApp"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WA</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openChatWithUser(userItem)}
                          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-[11px] font-extrabold text-white transition-all shadow-xs cursor-pointer active:scale-95"
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
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Menampilkan {filteredUsers.length} dari {initialUsers.length} pengguna terdaftar.
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/kabar?tab=warga"
                className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
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
