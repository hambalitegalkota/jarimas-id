"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Baby,
  Calendar,
  User,
  GraduationCap,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Scale,
  Ruler,
  AlertCircle,
  Pencil,
  Trash2,
  Home,
  FileText,
  MapPin,
  History,
  MessageSquare,
  Phone,
  ExternalLink,
  Send,
  X,
  Users,
  ArrowRightLeft,
  RotateCcw,
} from "lucide-react";
import { validateDataAnak, getCrossCommunityAdminForChatAction, restoreDataAnak } from "@/app/actions/data-anak";
import { formatNamaSekolahDisplay, isKomunitasLayananPaud } from "@/lib/data-anak-helpers";
import { ModalEditDataAnak } from "./modal-edit-data-anak";
import { ModalKeluarDataAnak } from "./modal-keluar-data-anak";
import { ModalMutasiDataAnak } from "./modal-mutasi-data-anak";
import { extractActionHistoryFromDataAnak } from "@/lib/action-history-helpers";
import type { DataAnakItem, KomunitasWithMembership } from "@/types/database";
import { cn, maskNama, formatAgeDisplay, formatWhatsAppUrl } from "@/lib/utils";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

interface CardDataAnakProps {
  anak: DataAnakItem;
  komunitas?: KomunitasWithMembership;
  canViewDetail?: boolean;
  currentUserId?: string | null;
  canValidate: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isReadOnly?: boolean;
  ageFormat?: "tahun" | "tahun_bulan";
  onUpdate?: (updated: DataAnakItem) => void;
  onDelete?: (deletedId: string) => void;
}

function calculateAge(birthDateString: string): string {
  if (!birthDateString) return "-";
  const str = birthDateString.trim();
  if (str === "24>" || str === ">24" || str.includes(">")) {
    return "> 24 Tahun";
  }
  if (/^\d+$/.test(str)) {
    return `${str} Tahun`;
  }
  try {
    let birthDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split("-").map(Number);
      birthDate = new Date(y, m - 1, d);
    } else {
      birthDate = new Date(str);
    }

    if (isNaN(birthDate.getTime())) return str;
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    const months = now.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
    }

    if (years < 0) years = 0;
    if (years >= 25) {
      return "> 24 Tahun";
    }
    return `${years} Tahun`;
  } catch {
    return birthDateString;
  }
}

function formatAddressString(
  jalan?: string | null,
  rt?: string | null,
  rw?: string | null,
  kel?: string | null,
  kec?: string | null,
  kab?: string | null
): string {
  const parts: string[] = [];
  if (jalan) parts.push(jalan);
  if (rt || rw) parts.push(`RT ${rt || "01"} / RW ${rw || "01"}`);
  if (kel) parts.push(`Kel. ${kel}`);
  if (kec) parts.push(`Kec. ${kec}`);
  if (kab) parts.push(kab);
  return parts.join(", ");
}

function cleanAlasanString(raw?: string | null): string {
  if (!raw) return "";
  const match = raw.match(/\[ALASAN\s*:\s*([^\]]+)\]/i);
  if (match && match[1]) return match[1].trim();
  // Remove all bracket tags
  const cleaned = raw.replace(/\[[^\]]+\]/g, "").trim();
  return cleaned || raw;
}

function formatWibDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return (
      new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(d) + " WIB"
    );
  } catch {
    return dateStr;
  }
}

export function CardDataAnak({
  anak,
  komunitas,
  canViewDetail = true,
  currentUserId,
  canValidate,
  canEdit,
  canDelete,
  isReadOnly,
  ageFormat = "tahun",
  onUpdate,
  onDelete,
}: CardDataAnakProps) {
  const [currentChild, setCurrentChild] = useState<DataAnakItem>(anak);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [localAgeFormat, setLocalAgeFormat] = useState<"tahun" | "tahun_bulan">(
    ageFormat || "tahun"
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isKeluarModalOpen, setIsKeluarModalOpen] = useState(false);
  const [isMutasiModalOpen, setIsMutasiModalOpen] = useState(false);
  const [isPendingValidate, startValidateTransition] = useTransition();
  const [isPendingRestore, startRestoreTransition] = useTransition();

  const isDeleted = currentChild.status_approval === "deleted" || Boolean(currentChild.deleted_at);
  const isMutasi = currentChild.status_approval === "mutasi" || Boolean(currentChild.mutasi_at);
  const isManualAdded = Boolean(
    currentChild.is_manual_added ||
      currentChild.created_by ||
      (currentChild.alasan_sekolah && currentChild.alasan_sekolah.includes("[DITAMBAHKAN"))
  );
  const actionHistory = extractActionHistoryFromDataAnak(currentChild);

  const handleRestore = () => {
    startRestoreTransition(async () => {
      const res = await restoreDataAnak(currentChild.id);
      if (res.success) {
        const updated: DataAnakItem = {
          ...currentChild,
          status_approval: "approved",
          deleted_at: null,
          deleted_by: null,
        };
        setCurrentChild(updated);
        onUpdate?.(updated);
      } else {
        alert(res.message);
      }
    });
  };

  const handleMutasiSuccess = (updated: DataAnakItem) => {
    setCurrentChild(updated);
    setIsMutasiModalOpen(false);
    onUpdate?.(updated);
  };

  const { openChatWithUser } = useGlobalMessageNotification();
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [chatModalData, setChatModalData] = useState<{
    isOpen: boolean;
    targetKomunitas: any;
    adminUser: any;
    allAdminsCount: number;
    waUrl: string | null;
    targetType: "paud" | "posyandu";
  } | null>(null);

  const handleOpenCrossChat = async () => {
    try {
      setIsChatLoading(true);
      const targetType = isKomunitasPaud ? "posyandu" : "paud";
      const res = await getCrossCommunityAdminForChatAction({
        targetType,
        namaSekolah: currentChild.nama_sekolah,
        kelurahan: currentChild.domisili_kelurahan || currentChild.kk_kelurahan,
        rw: currentChild.domisili_rw || currentChild.kk_rw,
        rt: currentChild.domisili_rt || currentChild.kk_rt,
        childId: currentChild.id,
        komunitasId: komunitas?.id,
      });

      if (!res.success && !res.targetKomunitas) {
        alert(res.message || "Komunitas mitra belum ditemukan.");
        return;
      }

      const targetKom = res.targetKomunitas;
      const adminUser = res.adminUser;

      const waMessage =
        targetType === "paud"
          ? `Halo Pengurus / Admin ${targetKom?.nama || "Satuan PAUD"}, saya pengurus/kader dari ${komunitas?.nama || "Posyandu"}. Ingin koordinasi terkait pembaruan & verifikasi data anak: *${currentChild.nama_lengkap}* (Sekolah: ${currentChild.nama_sekolah || "-"}). Terima kasih.`
          : `Halo Kader ${targetKom?.nama || "Posyandu"}, saya pengurus dari ${komunitas?.nama || "Satuan PAUD"}. Ingin koordinasi terkait pembaruan & verifikasi data anak: *${currentChild.nama_lengkap}* (Domisili: RT ${currentChild.domisili_rt || "-"} / RW ${currentChild.domisili_rw || "-"}, Kel. ${currentChild.domisili_kelurahan || "-"}). Terima kasih.`;

      const waUrl = formatWhatsAppUrl(targetKom?.kontak, waMessage);

      setChatModalData({
        isOpen: true,
        targetKomunitas: targetKom,
        adminUser,
        allAdminsCount: res.allAdminsCount,
        waUrl,
        targetType,
      });
    } catch (err: any) {
      console.error("Error cross chat:", err);
      alert("Gagal membuka komunikasi antar-komunitas: " + (err?.message || "Kesalahan sistem"));
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (ageFormat) {
      setLocalAgeFormat(ageFormat);
    }
  }, [ageFormat]);

  const canEditAllowed = Boolean(canEdit);
  const canDeleteAllowed = Boolean(canDelete);
  const canValidateAllowed = Boolean(canValidate);

  const isKomunitasPaud = isKomunitasLayananPaud(
    komunitas,
    komunitas?.nama,
    komunitas?.jenis
  );
  const isApproved = currentChild.status_approval === "approved";
  const ageString = formatAgeDisplay(currentChild.tanggal_lahir, {
    mode: localAgeFormat,
    rawUsia: (currentChild as any).usia,
  });

  // Privasi nama anak & orang tua untuk pengguna yang belum registrasi atau tanpa akses detail
  const isRegisteredUser = currentUserId === undefined ? true : Boolean(currentUserId);
  const hasAccess = isRegisteredUser && Boolean(canViewDetail);
  const displayNamaLengkap = hasAccess ? currentChild.nama_lengkap : maskNama(currentChild.nama_lengkap, "Anak");
  const displayNamaOrangtua = hasAccess ? (currentChild.nama_orangtua || "-") : maskNama(currentChild.nama_orangtua, "-");

  const kkAddressStr = formatAddressString(
    currentChild.kk_jalan,
    currentChild.kk_rt,
    currentChild.kk_rw,
    currentChild.kk_kelurahan,
    currentChild.kk_kecamatan,
    currentChild.kk_kabupaten
  );

  const domisiliAddressStr = formatAddressString(
    currentChild.domisili_jalan,
    currentChild.domisili_rt,
    currentChild.domisili_rw,
    currentChild.domisili_kelurahan,
    currentChild.domisili_kecamatan,
    currentChild.domisili_kabupaten
  );

  const isSameAddress = kkAddressStr && kkAddressStr === domisiliAddressStr;
  const cleanedAlasan = cleanAlasanString(currentChild.alasan_sekolah);

  const handleValidate = () => {
    startValidateTransition(async () => {
      const res = await validateDataAnak(currentChild.id);
      if (res.success) {
        const updated = {
          ...currentChild,
          status_approval: "approved" as const,
        };
        setCurrentChild(updated);
        onUpdate?.(updated);
      } else {
        alert(res.message);
      }
    });
  };

  const handleChildUpdated = (updated: DataAnakItem) => {
    setCurrentChild(updated);
    onUpdate?.(updated);
  };

  const handleChildDeleted = (deletedId: string) => {
    onDelete?.(deletedId);
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card p-3 sm:p-3.5 shadow-sm transition-all hover:border-primary/40 break-inside-avoid print:bg-white print:border-gray-300 print:text-black print:shadow-none">
        {/* Header: Nama Anak & Status Approval */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all",
            isExpanded ? "border-b border-border/60 pb-2.5 mb-2.5" : "pb-0"
          )}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={cn(
                "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg font-bold border",
                currentChild.jenis_kelamin === "L" ||
                  currentChild.jenis_kelamin === "Laki-laki"
                  ? "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300"
                  : "border-primary/25 bg-primary/10 text-primary"
              )}
            >
              <Baby className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <h3 className="text-sm sm:base font-bold text-foreground tracking-tight leading-snug truncate">
                {displayNamaLengkap}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <button
                  type="button"
                  onClick={() =>
                    setLocalAgeFormat((prev) =>
                      prev === "tahun" ? "tahun_bulan" : "tahun"
                    )
                  }
                  className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left"
                  title={`Format usia saat ini: ${localAgeFormat === "tahun" ? "Tahun" : "Tahun & Bulan"}. Klik untuk beralih format.`}
                  suppressHydrationWarning
                >
                  {ageString}
                </button>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  {currentChild.jenis_kelamin === "L" ||
                  currentChild.jenis_kelamin === "Laki-laki"
                    ? "Laki-laki"
                    : "Perempuan"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge & Toggle Button */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start sm:self-center shrink-0">
            {isDeleted ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-2 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 border border-rose-500/30">
                <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span>DIHAPUS</span>
              </span>
            ) : isMutasi ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/15 px-2 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/30">
                <ArrowRightLeft className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>MUTASI</span>
              </span>
            ) : isKomunitasPaud ? (
              isApproved ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 px-2 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>TERVERIFIKASI</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/15 px-2 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 border border-secondary/30">
                  <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>MENUNGGU</span>
                </span>
              )
            ) : currentChild.is_sekolah ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 px-2 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 border border-teal-500/20" title="Data Bersumber dari Satuan PAUD (Read-Only)">
                <GraduationCap className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>BERSEKOLAH</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 border border-amber-500/30">
                <Baby className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>BELUM BERSEKOLAH</span>
              </span>
            )}

            {isManualAdded && !isDeleted && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-300 border border-sky-500/30">
                <span>DITAMBAHKAN</span>
              </span>
            )}

            {/* Toggle Sembunyikan / Tampilkan Button */}
            {canViewDetail ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 cursor-pointer border print:hidden",
                  isExpanded
                    ? "border-border bg-muted hover:bg-muted/80 text-foreground"
                    : "border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                )}
                title={isExpanded ? "Sembunyikan Detail Kartu" : "Tampilkan Detail Kartu"}
              >
                <span>{isExpanded ? "Sembunyikan" : "Tampilkan"}</span>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* Collapsible Detail Section (Padat & Ramping) */}
        {canViewDetail && (
          <div className={cn("space-y-2 pt-0.5", !isExpanded && "hidden print:block")}>
            {/* Info Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs">
              {/* Orang Tua */}
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 px-2.5 py-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-tight">
                    Orang Tua / Wali
                  </span>
                  <span className="font-semibold text-foreground truncate block leading-snug">
                    {displayNamaOrangtua}
                  </span>
                </div>
              </div>

              {/* Pendidikan */}
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 px-2.5 py-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-tight">
                    Status Pendidikan
                  </span>
                  <span className="font-semibold text-foreground truncate block leading-snug">
                    {currentChild.is_sekolah
                      ? formatNamaSekolahDisplay(currentChild.nama_sekolah) || "Bersekolah PAUD"
                      : "Belum Sekolah"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Alamat KK & Domisili */}
            <div className="space-y-1 rounded-lg bg-muted/30 border border-border/70 px-2.5 py-1.5 text-xs">
              {/* Alamat KK */}
              <div className="flex items-start gap-1.5 text-foreground leading-tight">
                <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-semibold text-foreground">Alamat KK: </span>
                  <span className="text-muted-foreground">
                    {kkAddressStr || "Belum dilengkapi"}
                  </span>
                </div>
              </div>

              {/* Alamat Domisili */}
              <div className="flex items-start gap-1.5 text-foreground leading-tight">
                <Home className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-semibold text-foreground">Domisili: </span>
                  <span className="text-muted-foreground">
                    {isSameAddress
                      ? "Sama dengan Alamat KK"
                      : domisiliAddressStr || "Belum dilengkapi"}
                  </span>
                </div>
              </div>
            </div>

            {/* Alasan Sekolah / Keterangan Tag */}
            {cleanedAlasan && (
              <div className="rounded-lg bg-primary/5 px-2.5 py-1.5 text-xs text-foreground border border-primary/20 leading-snug">
                <span className="font-semibold text-primary">
                  {currentChild.is_sekolah ? "Alasan Mengikuti PAUD: " : "Keterangan: "}
                </span>
                <span className="text-foreground">{cleanedAlasan}</span>
              </div>
            )}

            {/* Riwayat Aksi Data Anak (Waktu & Identitas Semua Aksi: Tambah, Validasi, Edit, Mutasi, Hapus) */}
            <div className="rounded-lg bg-muted/40 border border-border/70 p-2.5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <History className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Riwayat Aksi Data Anak</span>
                </div>
                <span className="text-2xs text-muted-foreground">{actionHistory.length} Riwayat</span>
              </div>

              {actionHistory.length > 0 ? (
                <div className="space-y-1.5 divide-y divide-border/40">
                  {actionHistory.map((item, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2 text-2xs">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className={cn("mt-1 h-2 w-2 rounded-full shrink-0", item.badgeDotColor)} />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-bold text-foreground">{item.label}</span>
                            {item.pelaku && (
                              <span className="text-muted-foreground truncate">• {item.pelaku}</span>
                            )}
                          </div>
                          {item.keterangan && (
                            <p className="text-muted-foreground text-[10px] leading-tight">{item.keterangan}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground font-mono shrink-0 text-right">{item.waktuFormatted}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic">
                  Belum ada riwayat aktivitas tercatat.
                </p>
              )}
            </div>

            {/* Action Buttons Bar: Edit Data, Mutasi, Chat, Hapus (atau Pulihkan jika Dihapus) */}
            {isDeleted ? (
              canDeleteAllowed && (
                <div className="flex items-center justify-between gap-2 w-full pt-2.5 border-t border-border/60">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Data Anak ini berada di folder Dihapus</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRestore}
                    disabled={isPendingRestore}
                    className="min-h-[34px] h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    title="Pulihkan Data Anak ke Daftar Aktif"
                  >
                    {isPendingRestore ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>PULIHKAN DATA</span>
                      </>
                    )}
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2.5 border-t border-border/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Tombol Edit Data - Berhak diakses baik oleh Admin/Kader Posyandu maupun PAUD */}
                  {canEditAllowed && (
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex h-8 sm:h-8.5 items-center justify-center gap-1.5 rounded-lg bg-secondary/15 hover:bg-secondary/25 active:scale-98 border border-secondary/30 px-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200 transition-all cursor-pointer"
                      title="Edit data anak (terbuka setara bagi Posyandu dan Satuan PAUD)"
                    >
                      <Pencil className="h-3.5 w-3.5 text-secondary" />
                      <span>Edit Data</span>
                    </button>
                  )}

                  {/* Tombol Mutasi Sekolah / Satuan PAUD */}
                  {canEditAllowed && (
                    <button
                      type="button"
                      onClick={() => setIsMutasiModalOpen(true)}
                      className="flex h-8 sm:h-8.5 items-center justify-center gap-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 active:scale-98 border border-purple-200 px-2.5 text-xs font-semibold text-purple-800 transition-all cursor-pointer dark:bg-purple-950/20 dark:hover:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-300"
                      title="Catat mutasi / perpindahan anak dari sekolah asal ke sekolah/satuan PAUD lain"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Mutasi</span>
                    </button>
                  )}

                  {/* Tombol Chat Koordinasi Lintas Komunitas (PAUD <-> Posyandu) */}
                  <button
                    type="button"
                    onClick={handleOpenCrossChat}
                    disabled={isChatLoading}
                    className="flex h-8 sm:h-8.5 items-center justify-center gap-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 active:scale-98 border border-teal-200 px-2.5 text-xs font-semibold text-teal-800 transition-all cursor-pointer dark:bg-teal-950/20 dark:hover:bg-teal-950/40 dark:border-teal-900/40 dark:text-teal-300"
                    title={
                      isKomunitasPaud
                        ? "Buka koordinasi chat langsung dengan Kader/Admin Posyandu wilayah anak"
                        : "Buka koordinasi chat langsung dengan Admin Satuan PAUD sekolah anak"
                    }
                  >
                    {isChatLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    )}
                    <span>
                      {isKomunitasPaud ? "Chat Kader Posyandu" : "Chat Admin PAUD"}
                    </span>
                  </button>

                  {/* Tombol Keluar / Hapus (Jika berhak) */}
                  {canDeleteAllowed && (
                    <button
                      type="button"
                      onClick={() => setIsKeluarModalOpen(true)}
                      className="flex h-8 sm:h-8.5 items-center justify-center gap-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-98 border border-rose-200 px-2.5 text-xs font-semibold text-rose-700 transition-all cursor-pointer dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-700 dark:text-rose-400" />
                      <span>{isKomunitasPaud ? "Keluar / Hapus" : "Hapus Data"}</span>
                    </button>
                  )}
                </div>

                {/* Status & Badge Sinkronisasi */}
                <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                  {currentChild.is_sekolah ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-2xs font-semibold text-teal-800 dark:text-teal-300">
                      <ShieldCheck className="h-3 w-3 text-teal-600 shrink-0" />
                      <span>Sinkronisasi PAUD &amp; Posyandu</span>
                    </span>
                  ) : null}

                  {!isApproved && currentChild.is_updated_by_paud && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-2xs font-semibold text-amber-700 dark:text-amber-300">
                      <CheckCircle2 className="h-3 w-3 text-amber-600 shrink-0" />
                      <span>Sudah Diedit (Belum Valid)</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Data Anak Modal */}
      {isEditModalOpen && (
        <ModalEditDataAnak
          isOpen={isEditModalOpen}
          anak={currentChild}
          komunitasId={komunitas?.id || currentChild.komunitas_id}
          komunitasNama={komunitas?.nama || formatNamaSekolahDisplay(currentChild.nama_sekolah) || "Satuan PAUD"}
          jenisKomunitas={komunitas?.jenis || (currentChild.is_sekolah ? "satuan_paud" : "warga_kita")}
          canValidate={canValidateAllowed}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleChildUpdated}
        />
      )}

      {/* Keluar / Hapus Data Anak Modal */}
      {isKeluarModalOpen && (
        <ModalKeluarDataAnak
          isOpen={isKeluarModalOpen}
          anak={currentChild}
          komunitasId={komunitas?.id || currentChild.komunitas_id}
          komunitasNama={komunitas?.nama || formatNamaSekolahDisplay(currentChild.nama_sekolah) || "Satuan PAUD"}
          onClose={() => setIsKeluarModalOpen(false)}
          onSuccess={handleChildDeleted}
        />
      )}

      {/* Modal Mutasi Data Anak */}
      {isMutasiModalOpen && (
        <ModalMutasiDataAnak
          isOpen={isMutasiModalOpen}
          anak={currentChild}
          komunitasId={komunitas?.id || currentChild.komunitas_id}
          komunitasNama={komunitas?.nama || formatNamaSekolahDisplay(currentChild.nama_sekolah) || "Satuan PAUD"}
          onClose={() => setIsMutasiModalOpen(false)}
          onSuccess={handleMutasiSuccess}
        />
      )}

      {/* Modal Koordinasi Chat Antar Komunitas (PAUD & Posyandu) */}
      {chatModalData?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setChatModalData(null)}
          />

          <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    Koordinasi {chatModalData.targetType === "paud" ? "Satuan PAUD" : "Kader Posyandu"}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    Komunikasi sinkronisasi data anak: <span className="font-semibold text-foreground">{currentChild.nama_lengkap}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatModalData(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Info Komunitas Target */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Lembaga / Komunitas Mitra
                </div>
                <div className="text-sm font-bold text-foreground">
                  {chatModalData.targetKomunitas?.nama || (chatModalData.targetType === "paud" ? "Satuan PAUD" : "Posyandu Wilayah")}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                  {chatModalData.targetKomunitas?.kelurahan && (
                    <span>Kel. {chatModalData.targetKomunitas.kelurahan}</span>
                  )}
                  {chatModalData.targetKomunitas?.kecamatan && (
                    <span>• Kec. {chatModalData.targetKomunitas.kecamatan}</span>
                  )}
                </div>
              </div>

              {/* Opsi 1: Chat Langsung di JARIMAS-ID */}
              {chatModalData.adminUser ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5" /> Chat Aplikasi JARIMAS (Direkomendasikan)
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      Akun Aktif
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Terhubung langsung dengan akun pengurus: <strong className="text-foreground">{chatModalData.adminUser.nama_lengkap}</strong> ({chatModalData.adminUser.peran || "Admin / Pengurus"}).
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const uid = chatModalData.adminUser.id;
                      setChatModalData(null);
                      await openChatWithUser(uid);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Mulai Percakapan Langsung</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    Belum ada akun pengurus aktif yang terdaftar di aplikasi untuk {chatModalData.targetKomunitas?.nama}.
                  </p>
                  <p>
                    Anda tetap dapat berkoordinasi secara langsung menggunakan saluran WhatsApp resmi lembaga di bawah ini.
                  </p>
                </div>
              )}

              {/* Opsi 2: WhatsApp Resmi Lembaga */}
              {chatModalData.waUrl ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Resmi
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {chatModalData.targetKomunitas?.kontak}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hubungi via WhatsApp resmi lembaga dengan pesan pembuka otomatis terkait data anak {currentChild.nama_lengkap}.
                  </p>
                  <a
                    href={chatModalData.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Buka Chat WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Nomor WhatsApp resmi belum dicantumkan di profil lembaga ini.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
              <button
                type="button"
                onClick={() => setChatModalData(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
