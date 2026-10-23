"use client";

import { useState, useTransition } from "react";
import {
  GraduationCap,
  User,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  HelpCircle,
  Pencil,
  Trash2,
  MapPin,
  School,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { validateDataAts } from "@/app/actions/data-ats";
import { ModalKembaliBersekolah } from "./modal-kembali-bersekolah";
import { ModalEditAts } from "./modal-edit-ats";
import { ModalHapusAts } from "./modal-hapus-ats";
import { getJenjangAts, normalizeKeinginanSekolah, getNumericAgeAts } from "@/lib/ats-helpers";
import type { DataAtsItem } from "@/types/database";
import { cn } from "@/lib/utils";

interface CardDataAtsProps {
  ats: DataAtsItem;
  komunitasId: string;
  komunitasNama?: string;
  canValidate: boolean;
  canEditDdtk?: boolean;
  canManage?: boolean;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
  onUpdate?: (updatedItem: DataAtsItem) => void;
  onDelete?: (deletedId: string) => void;
  onKembaliSekolah?: (atsId: string, namaSekolah: string) => void;
}

function calculateAge(ats: DataAtsItem): string {
  const age = getNumericAgeAts(ats);
  if (age >= 25) {
    return "> 25 Tahun";
  }
  if (age > 0) {
    return `${age} Tahun`;
  }
  return "-";
}

export function CardDataAts({
  ats,
  komunitasId,
  komunitasNama,
  canValidate,
  canManage,
  currentUserId,
  isSuperAdmin,
  onUpdate,
  onDelete,
  onKembaliSekolah,
}: CardDataAtsProps) {
  const [currentAts, setCurrentAts] = useState<DataAtsItem>(ats);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isPendingValidate, startValidateTransition] = useTransition();

  // Modal States
  const [isKembaliSekolahOpen, setIsKembaliSekolahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isApproved = currentAts.status_approval === "approved";
  const ageString = calculateAge(currentAts);
  const jenjangInfo = getJenjangAts(currentAts);

  // Cek hak izin user untuk Edit & Hapus
  const isCreator = Boolean(currentUserId && currentAts.created_by === currentUserId);
  const canPerformActions = Boolean(canManage || isSuperAdmin || isCreator || canValidate);

  const handleValidate = () => {
    startValidateTransition(async () => {
      const res = await validateDataAts(currentAts.id);
      if (res.success) {
        const updated = {
          ...currentAts,
          status_approval: "approved" as const,
        };
        setCurrentAts(updated);
        onUpdate?.(updated);
      } else {
        alert(res.message);
      }
    });
  };

  const handleEditSuccess = (updatedItem: DataAtsItem) => {
    setCurrentAts(updatedItem);
    setIsEditOpen(false);
    onUpdate?.(updatedItem);
  };

  const handleKembaliSekolahSuccess = (atsId: string, namaSekolah: string) => {
    setIsKembaliSekolahOpen(false);
    onKembaliSekolah?.(atsId, namaSekolah);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setIsDeleteOpen(false);
    onDelete?.(deletedId);
  };

  // Format Wilayah & Alamat
  const rawRw = currentAts.rw ? String(currentAts.rw).trim() : "";
  const rawRt = currentAts.rt ? String(currentAts.rt).trim() : "";
  const isRwBelumTahu = !rawRw || rawRw === "Belum Tahu" || rawRw.toLowerCase().includes("belum") || rawRw === "-" || rawRw === "0";
  const isRtBelumTahu = !rawRt || rawRt === "Belum Tahu" || rawRt.toLowerCase().includes("belum") || rawRt === "-" || rawRt === "0";

  const rtRwHeaderStr = isRwBelumTahu && isRtBelumTahu
    ? "RT/RW Belum Tahu, "
    : isRwBelumTahu
    ? `RT ${rawRt} (RW Belum Tahu), `
    : isRtBelumTahu
    ? `RW ${rawRw} (RT Belum Tahu), `
    : `RT ${rawRt}/RW ${rawRw}, `;

  const rtRwAlamatStr = isRwBelumTahu && isRtBelumTahu
    ? "RT/RW Belum Tahu"
    : [
        !isRtBelumTahu ? `RT ${rawRt}` : "RT Belum Tahu",
        !isRwBelumTahu ? `RW ${rawRw}` : "RW Belum Tahu",
      ].filter(Boolean).join(", ");

  const alamatLengkap = [
    currentAts.alamat,
    rtRwAlamatStr,
    currentAts.kelurahan ? `Kel. ${currentAts.kelurahan}` : "",
    currentAts.kecamatan ? `Kec. ${currentAts.kecamatan}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card p-3 sm:p-3.5 space-y-2.5 transition-all hover:border-primary/40 hover:shadow-xs break-inside-avoid print:bg-white print:border-gray-300 print:text-black print:shadow-none">
        {/* Header: Nama Anak, Jenjang, & Status Approval */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all",
            isExpanded ? "border-b border-border/60 pb-2.5" : "pb-0"
          )}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={cn(
                "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border font-bold",
                currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
              )}
            >
              <GraduationCap className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight truncate">
                  {currentAts.nama_lengkap}
                </h3>
                {/* Jenjang Badge */}
                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] sm:text-2xs font-bold border border-primary/20 bg-primary/10 text-primary shrink-0">
                  <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span>{jenjangInfo.badgeLabel}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-2xs sm:text-xs text-muted-foreground font-medium">
                <span className="font-bold text-foreground font-mono" suppressHydrationWarning>
                  {ageString}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  {currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                    ? "Laki-laki"
                    : "Perempuan"}
                </span>
                {currentAts.kelurahan && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-primary font-semibold truncate">
                      {rtRwHeaderStr}Kel. {currentAts.kelurahan}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge & Toggle Button */}
          <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
            {isApproved ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 px-2 py-0.5 text-[10px] sm:text-2xs font-bold border border-teal-500/20">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                <span>TERVERIFIKASI</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 text-amber-900 dark:text-amber-200 px-2 py-0.5 text-[10px] sm:text-2xs font-bold border border-secondary/30">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary" />
                <span>MENUNGGU</span>
              </span>
            )}

            {/* Toggle Sembunyikan / Tampilkan */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] sm:text-2xs font-bold transition-all active:scale-95 cursor-pointer border print:hidden",
                isExpanded
                  ? "border-border bg-muted/60 hover:bg-muted text-muted-foreground"
                  : "border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary"
              )}
              title={isExpanded ? "Sembunyikan Detail Kartu" : "Tampilkan Detail Kartu"}
            >
              <span>{isExpanded ? "Sembunyikan" : "Tampilkan"}</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              ) : (
                <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Detail Section (Disembunyikan secara default, tetap tampil saat dicetak) */}
        <div className={cn("space-y-2.5 pt-0.5", !isExpanded && "hidden print:block")}>
          {/* Info Grid: Orang Tua / Wali & Alamat Domisili */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Orang Tua / Wali */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 p-2 min-w-0">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground font-bold text-2xs shrink-0">WALI:</span>
              <span
                className="font-bold text-foreground truncate"
                title={`${currentAts.nama_orangtua} (${currentAts.tinggal_bersama})`}
              >
                {currentAts.nama_orangtua} ({currentAts.tinggal_bersama})
              </span>
            </div>

            {/* Alamat Domisili */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 p-2 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground font-bold text-2xs shrink-0">ALAMAT:</span>
              <span
                className="font-medium text-foreground truncate"
                title={alamatLengkap || "-"}
              >
                {alamatLengkap || "-"}
              </span>
            </div>
          </div>

          {/* Info Grid: Keinginan Sekolah & Alasan Tidak Sekolah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Keinginan Sekolah */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 p-2 min-w-0">
              <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground font-bold text-2xs shrink-0">MINAT:</span>
              <span
                className={cn(
                  "font-bold truncate px-1.5 py-0.5 rounded text-2xs",
                  normalizeKeinginanSekolah(currentAts.keinginan_sekolah) === "Masih Ada"
                    ? "bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/20"
                    : "bg-secondary/15 text-amber-900 dark:text-amber-200 border border-secondary/30"
                )}
              >
                {normalizeKeinginanSekolah(currentAts.keinginan_sekolah) === "Masih Ada"
                  ? "Masih Ada Keinginan"
                  : "Tidak Ada Keinginan"}
              </span>
            </div>

            {/* Alasan Tidak Sekolah */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 p-2 min-w-0">
              <AlertCircle className="h-3.5 w-3.5 text-secondary shrink-0" />
              <span className="text-muted-foreground font-bold text-2xs shrink-0">ALASAN:</span>
              <span
                className="font-bold text-foreground truncate"
                title={currentAts.alasan_tidak_sekolah}
              >
                {currentAts.alasan_tidak_sekolah}
              </span>
            </div>
          </div>

          {/* Keterangan Alasan Tambahan jika ada */}
          {currentAts.keterangan && (
            <div className="rounded-lg bg-muted/40 border border-border/70 p-2 text-xs text-foreground flex items-start gap-2">
              <span className="text-2xs font-bold text-primary shrink-0 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">KET</span>
              <p className="leading-relaxed italic">&ldquo;{currentAts.keterangan}&rdquo;</p>
            </div>
          )}

          {/* Riwayat Sekolah Sebelumnya & Kelas Terakhir */}
          {(currentAts.sekolah_sebelumnya || currentAts.kelas_terakhir) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentAts.sekolah_sebelumnya && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 p-2 min-w-0">
                  <School className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-bold text-2xs shrink-0">SEKOLAH:</span>
                  <span
                    className="font-bold text-foreground truncate"
                    title={currentAts.sekolah_sebelumnya}
                  >
                    {currentAts.sekolah_sebelumnya}
                  </span>
                </div>
              )}
              {currentAts.kelas_terakhir && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/70 p-2 min-w-0">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-bold text-2xs shrink-0">KELAS:</span>
                  <span
                    className="font-bold text-foreground truncate"
                    title={currentAts.kelas_terakhir}
                  >
                    {currentAts.kelas_terakhir}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Bar: VALIDASI, KEMBALI BERSEKOLAH, EDIT, HAPUS (Selalu Tampil Jelas di Kartu) */}
        {((!isApproved && canValidate) || canPerformActions) && (
          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 pt-2 border-t border-border/60 w-full print:hidden">
            {/* 1. Tombol Validasi (jika status masih pending) */}
            {!isApproved && canValidate && (
              <button
                type="button"
                onClick={handleValidate}
                disabled={isPendingValidate}
                className="flex-1 min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg bg-secondary hover:bg-secondary-hover active:scale-[0.98] px-3 text-xs font-bold text-secondary-foreground transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                title="Validasi Data ATS"
              >
                {isPendingValidate ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>VALIDASI ATS</span>
                  </>
                )}
              </button>
            )}

            {/* 2. KEMBALI BERSEKOLAH, EDIT, HAPUS */}
            {canPerformActions && (
              <>
                {/* 2. KEMBALI BERSEKOLAH (Tombol Utama) */}
                <button
                  type="button"
                  onClick={() => setIsKembaliSekolahOpen(true)}
                  className="flex-1 min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] px-3 text-xs font-bold text-primary-foreground transition-all shadow-xs cursor-pointer"
                  title="Catat Kembali Bersekolah ke PKBM / SKB / Sekolah"
                >
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  <span>BERSEKOLAH</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {/* 3. EDIT ATS */}
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="flex-1 min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground px-3 text-xs font-bold transition-all cursor-pointer"
                    title="Edit Data ATS"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span>EDIT</span>
                  </button>

                  {/* 4. HAPUS ATS */}
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 px-3 text-xs font-bold transition-all cursor-pointer"
                    title="Hapus Data ATS"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                    <span>HAPUS</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal Kembali Bersekolah */}
      {isKembaliSekolahOpen && (
        <ModalKembaliBersekolah
          isOpen={isKembaliSekolahOpen}
          ats={currentAts}
          komunitasId={komunitasId}
          onClose={() => setIsKembaliSekolahOpen(false)}
          onSuccess={handleKembaliSekolahSuccess}
        />
      )}

      {/* Modal Edit ATS */}
      {isEditOpen && (
        <ModalEditAts
          isOpen={isEditOpen}
          ats={currentAts}
          komunitasId={komunitasId}
          komunitasNama={komunitasNama}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal Hapus ATS */}
      {isDeleteOpen && (
        <ModalHapusAts
          isOpen={isDeleteOpen}
          ats={currentAts}
          komunitasId={komunitasId}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
