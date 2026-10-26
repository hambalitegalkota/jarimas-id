"use client";

import { useState, useTransition } from "react";
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
  LogOut,
  Home,
  FileText,
  MapPin,
} from "lucide-react";
import { validateDataAnak } from "@/app/actions/data-anak";
import { formatNamaSekolahDisplay, isKomunitasLayananPaud } from "@/lib/data-anak-helpers";
import { ModalEditDataAnak } from "./modal-edit-data-anak";
import { ModalKeluarDataAnak } from "./modal-keluar-data-anak";
import type { DataAnakItem, KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface CardDataAnakProps {
  anak: DataAnakItem;
  komunitas?: KomunitasWithMembership;
  canViewDetail?: boolean;
  canValidate: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isReadOnly?: boolean;
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

export function CardDataAnak({
  anak,
  komunitas,
  canViewDetail = true,
  canValidate,
  canEdit,
  canDelete,
  isReadOnly,
  onUpdate,
  onDelete,
}: CardDataAnakProps) {
  const [currentChild, setCurrentChild] = useState<DataAnakItem>(anak);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isKeluarModalOpen, setIsKeluarModalOpen] = useState(false);
  const [isPendingValidate, startValidateTransition] = useTransition();

  const canEditAllowed = Boolean(canEdit);
  const canDeleteAllowed = Boolean(canDelete);
  const canValidateAllowed = Boolean(canValidate);

  const isKomunitasPaud = isKomunitasLayananPaud(
    komunitas,
    komunitas?.nama,
    komunitas?.jenis
  );
  const isApproved = currentChild.status_approval === "approved";
  const ageString = calculateAge(currentChild.tanggal_lahir);

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
                {currentChild.nama_lengkap}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="font-semibold text-foreground" suppressHydrationWarning>
                  {ageString}
                </span>
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
          <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-center shrink-0">
            {isKomunitasPaud ? (
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
                    {currentChild.nama_orangtua || "-"}
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
                <span className="font-semibold text-primary">Keterangan: </span>
                <span className="text-foreground">{cleanedAlasan}</span>
              </div>
            )}

            {/* Action Buttons Bar: Edit Data, Keluar / Hapus, dan Validasi */}
            {isKomunitasPaud ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 pt-2 border-t border-border/60">
                {(canEditAllowed || canDeleteAllowed) ? (
                  <div className="flex items-center gap-1.5">
                    {canEditAllowed && (
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex h-8 sm:h-8.5 items-center justify-center gap-1 rounded-lg bg-secondary/15 hover:bg-secondary/25 active:scale-98 border border-secondary/30 px-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200 transition-all cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5 text-secondary" />
                        <span>Edit Data</span>
                      </button>
                    )}

                    {canDeleteAllowed && (
                      <button
                        type="button"
                        onClick={() => setIsKeluarModalOpen(true)}
                        className="flex h-8 sm:h-8.5 items-center justify-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-98 border border-rose-200 px-2.5 text-xs font-semibold text-rose-700 transition-all cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-700" />
                        <span>Keluar / Hapus</span>
                      </button>
                    )}
                  </div>
                ) : <div />}

                {/* Badge Indikator Status Jika Sudah Pernah Diedit namun Belum Divalidasi */}
                {!isApproved && currentChild.is_updated_by_paud && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-2xs font-semibold text-amber-700 dark:text-amber-300">
                      <CheckCircle2 className="h-3 w-3 text-amber-600 shrink-0" />
                      <span>Sudah Diedit (Belum Valid)</span>
                    </span>
                  </div>
                )}
              </div>
            ) : currentChild.is_sekolah ? (
              /* Di Komunitas Lain untuk Data Anak Bersekolah: Tidak Bisa Diedit (Read-Only) */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 border-t border-border/60">
                <div className="inline-flex items-center gap-1.5 text-2xs font-bold text-teal-800 dark:text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Sumber Data: Satuan PAUD / PKBM / SKB (Data Terverifikasi Sekolah, Terkunci &amp; Tidak Dapat Diedit)</span>
                </div>
              </div>
            ) : (
              /* Di Komunitas Lain untuk Data Anak Belum Bersekolah: Hanya Admin/Kader yang memiliki wewenang edit/hapus */
              (canEditAllowed || canDeleteAllowed) && (
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    {canEditAllowed && (
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex h-8 items-center justify-center gap-1 rounded-lg bg-secondary/15 hover:bg-secondary/25 active:scale-98 border border-secondary/30 px-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200 transition-all cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5 text-secondary" />
                        <span>Edit Data Belum Sekolah</span>
                      </button>
                    )}

                    {canDeleteAllowed && (
                      <button
                        type="button"
                        onClick={() => setIsKeluarModalOpen(true)}
                        className="flex h-8 items-center justify-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-98 border border-rose-200 px-2.5 text-xs font-semibold text-rose-700 transition-all cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-700" />
                        <span>Hapus Data</span>
                      </button>
                    )}
                  </div>
                </div>
              )
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
    </>
  );
}
