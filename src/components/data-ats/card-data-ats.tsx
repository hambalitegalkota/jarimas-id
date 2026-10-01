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
} from "lucide-react";
import { validateDataAts } from "@/app/actions/data-ats";
import { ModalKembaliBersekolah } from "./modal-kembali-bersekolah";
import { ModalEditAts } from "./modal-edit-ats";
import { ModalHapusAts } from "./modal-hapus-ats";
import { getJenjangAts } from "@/lib/ats-helpers";
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
    let months = now.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years >= 25) {
      return "> 24 Tahun";
    }
    if (years === 0 && months === 0) {
      return "0 Tahun";
    }
    if (years === 0) {
      return `${months} Bulan`;
    }
    if (months === 0) {
      return `${years} Tahun`;
    }
    return `${years} Thn ${months} Bln`;
  } catch {
    return birthDateString;
  }
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
  const [isPendingValidate, startValidateTransition] = useTransition();

  // Modal States
  const [isKembaliSekolahOpen, setIsKembaliSekolahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isApproved = currentAts.status_approval === "approved";
  const ageString = calculateAge(currentAts.tanggal_lahir);
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
  const alamatLengkap = [
    currentAts.alamat,
    currentAts.rt ? `RT ${currentAts.rt}` : "",
    currentAts.rw ? `RW ${currentAts.rw}` : "",
    currentAts.kelurahan ? `Kel. ${currentAts.kelurahan}` : "",
    currentAts.kecamatan ? `Kec. ${currentAts.kecamatan}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card p-5 space-y-4 transition-colors hover:border-amber-500/40">
        {/* Header: Nama Anak, Jenjang, & Status Approval */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted font-bold",
                currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-rose-500 dark:text-rose-400"
              )}
            >
              <GraduationCap className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {currentAts.nama_lengkap}
                </h3>
                {/* Jenjang Badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border shrink-0",
                    jenjangInfo.badgeClass
                  )}
                >
                  <BookOpen className="h-3 w-3" />
                  <span>{jenjangInfo.badgeLabel}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-muted-foreground">
                <span className="font-semibold text-foreground" suppressHydrationWarning>
                  {ageString}
                </span>
                <span>•</span>
                <span>
                  {currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                    ? "Laki-laki"
                    : "Perempuan"}
                </span>
                {currentAts.kelurahan && (
                  <>
                    <span>•</span>
                    <span className="text-amber-500 font-semibold">
                      {currentAts.rt ? `RT ${currentAts.rt}` : ""}
                      {currentAts.rw ? `/RW ${currentAts.rw}, ` : " "}
                      Kel. {currentAts.kelurahan}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 self-start shrink-0">
            {isApproved ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                <span>TERVERIFIKASI</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                <Clock className="h-3 w-3" />
                <span>MENUNGGU</span>
              </span>
            )}
          </div>
        </div>

        {/* Info Baris 1: Orang Tua / Wali & Alamat Domisili */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {/* Orang Tua / Wali */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5 min-w-0">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground text-[11px] shrink-0">WALI:</span>
            <span
              className="font-bold text-foreground truncate"
              title={`${currentAts.nama_orangtua} (${currentAts.tinggal_bersama})`}
            >
              {currentAts.nama_orangtua} ({currentAts.tinggal_bersama})
            </span>
          </div>

          {/* Alamat Domisili */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-muted-foreground text-[11px] shrink-0">ALAMAT:</span>
            <span
              className="font-medium text-foreground truncate"
              title={alamatLengkap || "-"}
            >
              {alamatLengkap || "-"}
            </span>
          </div>
        </div>

        {/* Info Baris 2: Keinginan Sekolah & Alasan Tidak Sekolah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {/* Keinginan Sekolah */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5 min-w-0">
            <HelpCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-muted-foreground text-[11px] shrink-0">KEINGINAN:</span>
            <span
              className={cn(
                "font-bold truncate px-1.5 py-0.5 rounded text-[11px]",
                currentAts.keinginan_sekolah === "Masih Ada"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              )}
            >
              {currentAts.keinginan_sekolah}
            </span>
          </div>

          {/* Alasan Tidak Sekolah */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5 min-w-0">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-muted-foreground text-[11px] shrink-0">ALASAN:</span>
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
          <div className="rounded-md bg-background border border-border px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
            <span className="font-mono text-[11px] font-bold text-amber-500 shrink-0">KET:</span>
            <p className="leading-relaxed italic">&ldquo;{currentAts.keterangan}&rdquo;</p>
          </div>
        )}

        {/* Riwayat Sekolah Sebelumnya & Kelas Terakhir */}
        {(currentAts.sekolah_sebelumnya || currentAts.kelas_terakhir) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {currentAts.sekolah_sebelumnya && (
              <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5 min-w-0">
                <School className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-[11px] shrink-0">SEKOLAH ASAL:</span>
                <span
                  className="font-bold text-foreground truncate"
                  title={currentAts.sekolah_sebelumnya}
                >
                  {currentAts.sekolah_sebelumnya}
                </span>
              </div>
            )}
            {currentAts.kelas_terakhir && (
              <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5 min-w-0">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-[11px] shrink-0">KELAS TERAKHIR:</span>
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

        {/* Action Buttons Bar: VALIDASI, KEMBALI BERSEKOLAH, EDIT, HAPUS (Ukuran Sama) */}
        {((!isApproved && canValidate) || canPerformActions) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border w-full">
            {/* 1. Tombol Validasi (jika status masih pending) */}
            {!isApproved && canValidate && (
              <button
                type="button"
                onClick={handleValidate}
                disabled={isPendingValidate}
                className="flex-1 min-w-0 flex h-8.5 items-center justify-center gap-1.5 rounded-md bg-amber-600 hover:bg-amber-500 px-2 text-xs font-mono font-bold text-white transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                title="Validasi Data ATS"
              >
                {isPendingValidate ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">VALIDASI</span>
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
                  className="flex-1 min-w-0 flex h-8.5 items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 px-2 text-xs font-mono font-bold text-white transition-all shadow-sm active:scale-98 cursor-pointer"
                  title="Catat Kembali Bersekolah"
                >
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">BERSEKOLAH</span>
                </button>

                {/* 3. EDIT ATS */}
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="flex-1 min-w-0 flex h-8.5 items-center justify-center gap-1.5 rounded-md border border-border bg-background hover:bg-muted hover:border-amber-500/40 px-2 text-xs font-mono font-bold text-foreground transition-all cursor-pointer"
                  title="Edit Data ATS"
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span className="truncate">EDIT</span>
                </button>

                {/* 4. HAPUS ATS */}
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex-1 min-w-0 flex h-8.5 items-center justify-center gap-1.5 rounded-md border border-border bg-background hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 px-2 text-xs font-mono font-bold text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                  title="Hapus Data ATS"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span className="truncate">HAPUS</span>
                </button>
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
