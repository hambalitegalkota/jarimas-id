"use client";

import { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Users,
  Search,
  Check,
  Calendar,
  Layers,
  MessageSquare,
  ShieldCheck,
  Crown,
  Loader2,
  CheckCheck,
  UserCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { createGrupKegiatan } from "@/app/actions/grup-kegiatan";
import type { RegisteredUserItem, GrupChatRoom } from "@/types/database";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

interface CreateGrupKegiatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: RegisteredUserItem[];
  currentUserId: string | null;
  onGroupCreated?: (newRoomId: string, newRoom?: GrupChatRoom) => void;
}

const KATEGORI_PRESETS = [
  "Penanganan ATS",
  "Posyandu & Balita",
  "PAUD & PKBM",
  "Kewilayahan RT/RW",
  "Sosialisasi & Edukasi",
  "Rakor Khusus",
];

const NAMA_KEGIATAN_SUGGESTIONS = [
  "Rakor Penanganan ATS & Validasi Anak 2026",
  "Sosialisasi Pelatihan Kader Posyandu Se-Tegal",
  "Koordinasi Distribusi PMT & Imunisasi Balita",
  "Forum Tutor PKBM & Kesetaraan Paket C",
  "Kelompok Kerja Pendataan Warga & SPM",
];

export function CreateGrupKegiatanModal({
  isOpen,
  onClose,
  allUsers,
  currentUserId,
  onGroupCreated,
}: CreateGrupKegiatanModalProps) {
  const { onlineUserIds } = useGlobalMessageNotification();

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState("Penanganan ATS");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userFilterTab, setUserFilterTab] = useState<"semua" | "online" | "kader">("semua");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter kandidat anggota (mengecualikan diri sendiri)
  const candidateUsers = useMemo(() => {
    return allUsers.filter((u) => u.id !== currentUserId);
  }, [allUsers, currentUserId]);

  const filteredUsers = useMemo(() => {
    let list = candidateUsers;

    // Filter tab
    if (userFilterTab === "online") {
      list = list.filter((u) => onlineUserIds.has(u.id));
    } else if (userFilterTab === "kader") {
      list = list.filter(
        (u) =>
          u.is_super_admin ||
          u.is_admin_pusat ||
          u.komunitas_list?.some((c) =>
            /kader|pengurus|admin|bunda/i.test(c.peran || "")
          )
      );
    }

    // Filter search text
    if (searchUserQuery.trim()) {
      const q = searchUserQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.nama_lengkap.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.komunitas_list?.some((c) => c.nama.toLowerCase().includes(q))
      );
    }

    // Urutkan: pengguna online di posisi atas, lalu abjad nama
    return [...list].sort((a, b) => {
      const aOn = onlineUserIds.has(a.id) ? 1 : 0;
      const bOn = onlineUserIds.has(b.id) ? 1 : 0;
      if (aOn !== bOn) return bOn - aOn;
      return a.nama_lengkap.localeCompare(b.nama_lengkap, "id-ID");
    });
  }, [candidateUsers, userFilterTab, searchUserQuery, onlineUserIds]);

  const onlineCount = useMemo(() => {
    return candidateUsers.filter((u) => onlineUserIds.has(u.id)).length;
  }, [candidateUsers, onlineUserIds]);

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      filteredUsers.forEach((u) => next.add(u.id));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedUserIds(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = nama.trim();
    if (!cleanNama) {
      setErrorMessage("Nama kegiatan atau nama grup obrolan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createGrupKegiatan({
        nama: cleanNama,
        deskripsi: deskripsi.trim() || undefined,
        kategori,
        memberUserIds: Array.from(selectedUserIds),
      });

      if (!res.success) {
        setErrorMessage(res.message || "Gagal membuat grup kegiatan.");
        setIsSubmitting(false);
        return;
      }

      // Berhasil
      setNama("");
      setDeskripsi("");
      setSelectedUserIds(new Set());
      onClose();

      if (onGroupCreated && res.groupId) {
        onGroupCreated(res.groupId, res.room);
      }
    } catch (err: any) {
      console.error("Gagal submit create grup kegiatan:", err);
      setErrorMessage(err?.message || "Terjadi kesalahan saat membuat grup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ========================================================= */}
        {/* HEADER MODAL                                              */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-indigo-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-emerald-600 to-teal-700 text-white font-black shadow-md shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Buat Percakapan Grup Kegiatan
                </h3>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Semua Pengguna Terdaftar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pengguna yang diundang akan langsung otomatis tergabung tanpa perlu persetujuan manual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* FORM CONTENT (SCROLLABLE)                                 */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. INFORMASI KEGIATAN */}
          <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label
                htmlFor="nama-kegiatan"
                className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                Nama Kegiatan / Nama Grup Obrolan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Wajib diisi</span>
            </div>

            <div className="relative">
              <input
                id="nama-kegiatan"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Rakor Penanganan ATS & Validasi Anak 2026"
                className="w-full min-h-[46px] rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                required
              />
            </div>

            {/* Rekomendasi Nama Cepat */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 block">
                Saran Topik / Agenda Kegiatan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NAMA_KEGIATAN_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNama(sug)}
                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer text-left"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori Kegiatan Chips */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-teal-600" />
                Kategori Kegiatan
              </label>
              <div className="flex flex-wrap gap-2">
                {KATEGORI_PRESETS.map((kat) => (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => setKategori(kat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                      kategori === kat
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                    }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            </div>

            {/* Deskripsi & Agenda Kegiatan */}
            <div className="space-y-1.5 pt-2">
              <label
                htmlFor="deskripsi-kegiatan"
                className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                Deskripsi & Catatan Agenda (Opsional)
              </label>
              <textarea
                id="deskripsi-kegiatan"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={2}
                placeholder="Tuliskan tujuan kegiatan, jadwal pertemuan, atau panduan koordinasi bagi anggota grup..."
                className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-normal resize-none"
              />
            </div>
          </div>

          {/* 2. UNDANG ANGGOTA TERPILIH */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  Pilih Pengguna yang Diundang
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pengguna terpilih akan langsung tergabung dan menerima akses obrolan instan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-3 py-1 text-xs font-black text-emerald-800 dark:text-emerald-300 font-mono shadow-2xs">
                  <CheckCheck className="h-3.5 w-3.5" />
                  {selectedUserIds.size} Terpilih
                </span>
                {selectedUserIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Filter Tabs */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setUserFilterTab("semua")}
                  className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    userFilterTab === "semua"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Semua ({candidateUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilterTab("online")}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    userFilterTab === "online"
                      ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                      : "text-slate-500 hover:text-emerald-600"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online ({onlineCount})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilterTab("kader")}
                  className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    userFilterTab === "kader"
                      ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                      : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  Kader & Admin
                </button>
              </div>

              {/* Search User Input */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Cari nama atau komunitas..."
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Quick Action: Pilih Semua Hasil Cari */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                <span>Menampilkan {filteredUsers.length} pengguna</span>
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  + Pilih Semua Pengguna di Daftar Ini
                </button>
              </div>
            )}

            {/* User Selection Scrollable List */}
            <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2 pr-1 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-2.5">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada pengguna yang sesuai dengan pencarian atau filter.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.has(user.id);
                  const isOnline = onlineUserIds.has(user.id);
                  const initial = (user.nama_lengkap || "W")[0].toUpperCase();

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleSelectUser(user.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer text-left group ${
                        isSelected
                          ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-2xs"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Custom Glowing Checkbox */}
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                        </div>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-black text-xs shadow-xs">
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
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white dark:border-slate-900" />
                            </span>
                          )}
                        </div>

                        {/* User Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                              {user.nama_lengkap}
                            </span>
                            {user.is_super_admin && (
                              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 dark:text-emerald-300">
                                Super Admin
                              </span>
                            )}
                            {user.is_admin_pusat && (
                              <span className="rounded-full bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-800 px-1.5 py-0.2 text-[9px] font-black text-teal-800 dark:text-teal-300">
                                Admin Pusat
                              </span>
                            )}
                            {isOnline && (
                              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[9px] font-bold">
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {user.komunitas_list && user.komunitas_list.length > 0
                              ? user.komunitas_list.map((c) => c.nama).join(", ")
                              : user.email || "Warga Jarimas"}
                          </p>
                        </div>
                      </div>

                      {/* Status Terpilih Indicator */}
                      {isSelected && (
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase font-mono ml-2 shrink-0">
                          Diundang
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* FOOTER ACTIONS                                            */}
          {/* ========================================================= */}
          <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !nama.trim()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Membuat Grup...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Buat Grup & Undang {selectedUserIds.size > 0 ? `(${selectedUserIds.size})` : ""}{" "}
                    Pengguna
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
