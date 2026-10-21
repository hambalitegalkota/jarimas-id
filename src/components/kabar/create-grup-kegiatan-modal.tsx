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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-lg border border-border bg-card shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary/15 text-secondary border border-secondary/30 font-bold shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Buat Percakapan Grup Kegiatan
                </h3>
                <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-2xs font-semibold text-primary uppercase">
                  Semua Pengguna Terdaftar
                </span>
              </div>
              <p className="text-2xs text-muted-foreground">
                Pengguna yang diundang akan langsung otomatis tergabung tanpa perlu persetujuan manual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORM CONTENT (SCROLLABLE) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. INFORMASI KEGIATAN */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between">
              <label
                htmlFor="nama-kegiatan"
                className="text-2xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Nama Kegiatan / Nama Grup Obrolan <span className="text-destructive">*</span>
              </label>
              <span className="text-2xs text-muted-foreground">Wajib diisi</span>
            </div>

            <div className="relative">
              <input
                id="nama-kegiatan"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Rakor Penanganan ATS & Validasi Anak 2026"
                className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                required
              />
            </div>

            {/* Rekomendasi Nama Cepat */}
            <div className="space-y-1.5 pt-1">
              <span className="text-2xs font-semibold text-muted-foreground block">
                Saran Topik / Agenda Kegiatan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NAMA_KEGIATAN_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNama(sug)}
                    className="rounded-md bg-background border border-border px-2.5 py-1 text-2xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer text-left"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori Kegiatan Chips */}
            <div className="space-y-1.5 pt-2">
              <label className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Kategori Kegiatan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {KATEGORI_PRESETS.map((kat) => (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => setKategori(kat)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                      kategori === kat
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background text-foreground border-border hover:bg-muted"
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
                className="text-2xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                Deskripsi & Catatan Agenda (Opsional)
              </label>
              <textarea
                id="deskripsi-kegiatan"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={2}
                placeholder="Tuliskan tujuan kegiatan, jadwal pertemuan, atau panduan koordinasi bagi anggota grup..."
                className="w-full rounded-lg border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* 2. UNDANG ANGGOTA TERPILIH */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Pilih Pengguna yang Diundang
                </h4>
                <p className="text-2xs text-muted-foreground">
                  Pengguna terpilih akan langsung tergabung dan menerima akses obrolan instan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary font-mono shadow-2xs">
                  <CheckCheck className="h-3.5 w-3.5" />
                  {selectedUserIds.size} Terpilih
                </span>
                {selectedUserIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-2xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              {/* Filter Tabs */}
              <div className="flex rounded-md bg-muted/60 p-1 gap-1 border border-border">
                <button
                  type="button"
                  onClick={() => setUserFilterTab("semua")}
                  className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    userFilterTab === "semua"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Semua ({candidateUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilterTab("online")}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    userFilterTab === "online"
                      ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs"
                      : "text-muted-foreground hover:text-emerald-600"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online ({onlineCount})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilterTab("kader")}
                  className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    userFilterTab === "kader"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Kader & Admin
                </button>
              </div>

              {/* Search User Input */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Cari nama atau komunitas..."
                  className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Quick Action: Pilih Semua Hasil Cari */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between text-2xs px-1 text-muted-foreground">
                <span>Menampilkan {filteredUsers.length} pengguna</span>
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  + Pilih Semua Pengguna di Daftar Ini
                </button>
              </div>
            )}

            {/* User Selection Scrollable List */}
            <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1 rounded-lg border border-border bg-muted/20 p-2">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
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
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-left group ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 shadow-2xs"
                          : "bg-card border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Custom Checkbox */}
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground shadow-2xs"
                              : "border-muted-foreground/40 bg-background group-hover:border-foreground"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                        </div>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-2xs border border-primary/20 shadow-xs">
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
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-background" />
                            </span>
                          )}
                        </div>

                        {/* User Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {user.nama_lengkap}
                            </span>
                            {user.is_super_admin && (
                              <span className="rounded-md bg-secondary/15 text-secondary border border-secondary/30 px-1.5 py-0.2 text-[9px] font-semibold">
                                Super Admin
                              </span>
                            )}
                            {user.is_admin_pusat && (
                              <span className="rounded-md bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.2 text-[9px] font-semibold">
                                Admin Pusat
                              </span>
                            )}
                            {isOnline && (
                              <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[9px] font-semibold">
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-2xs text-muted-foreground truncate">
                            {user.komunitas_list && user.komunitas_list.length > 0
                              ? user.komunitas_list.map((c) => c.nama).join(", ")
                              : user.email || "Warga Jarimas"}
                          </p>
                        </div>
                      </div>

                      {/* Status Terpilih Indicator */}
                      {isSelected && (
                        <span className="text-2xs font-semibold text-primary uppercase font-mono ml-2 shrink-0">
                          Diundang
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 min-h-[44px] h-11 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !nama.trim()}
              className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
