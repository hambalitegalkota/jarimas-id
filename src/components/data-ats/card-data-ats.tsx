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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
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
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5 space-y-2.5 transition-all hover:border-indigo-400 hover:shadow-xs break-inside-avoid print:bg-white print:border-gray-300 print:text-black print:shadow-none">
        {/* Header: Nama Anak, Jenjang, & Status Approval */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all",
            isExpanded ? "border-b border-slate-100 dark:border-slate-800 pb-2.5" : "pb-0"
          )}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={cn(
                "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border font-bold",
                currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                  ? "border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                  : "border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
              )}
            >
              <GraduationCap className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                  {currentAts.nama_lengkap}
                </h3>
                {/* Jenjang Badge */}
                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] sm:text-2xs font-bold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 shrink-0">
                  <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span>{jenjangInfo.badgeLabel}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-2xs sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono" suppressHydrationWarning>
                  {ageString}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>
                  {currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                    ? "Laki-laki"
                    : "Perempuan"}
                </span>
                {currentAts.kelurahan && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-blue-700 dark:text-blue-400 font-semibold truncate">
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
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] sm:text-2xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>TERVERIFIKASI</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] sm:text-2xs font-bold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 dark:text-amber-400" />
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
                  ? "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  : "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-800 dark:text-blue-300"
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
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-2 min-w-0">
              <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-500 font-bold text-2xs shrink-0">WALI:</span>
              <span
                className="font-bold text-slate-900 dark:text-slate-100 truncate"
                title={`${currentAts.nama_orangtua} (${currentAts.tinggal_bersama})`}
              >
                {currentAts.nama_orangtua} ({currentAts.tinggal_bersama})
              </span>
            </div>

            {/* Alamat Domisili */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-2 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-slate-500 font-bold text-2xs shrink-0">ALAMAT:</span>
              <span
                className="font-medium text-slate-800 dark:text-slate-200 truncate"
                title={alamatLengkap || "-"}
              >
                {alamatLengkap || "-"}
              </span>
            </div>
          </div>

          {/* Info Grid: Keinginan Sekolah & Alasan Tidak Sekolah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Keinginan Sekolah */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-2 min-w-0">
              <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-slate-500 font-bold text-2xs shrink-0">MINAT:</span>
              <span
                className={cn(
                  "font-bold truncate px-1.5 py-0.5 rounded text-2xs",
                  normalizeKeinginanSekolah(currentAts.keinginan_sekolah) === "Masih Ada"
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                )}
              >
                {normalizeKeinginanSekolah(currentAts.keinginan_sekolah) === "Masih Ada"
                  ? "Masih Ada Keinginan"
                  : "Tidak Ada Keinginan"}
              </span>
            </div>

            {/* Alasan Tidak Sekolah */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-2 min-w-0">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-slate-500 font-bold text-2xs shrink-0">ALASAN:</span>
              <span
                className="font-bold text-slate-900 dark:text-slate-100 truncate"
                title={currentAts.alasan_tidak_sekolah}
              >
                {currentAts.alasan_tidak_sekolah}
              </span>
            </div>
          </div>

          {/* Keterangan Alasan Tambahan jika ada */}
          {currentAts.keterangan && (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-2 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-2xs font-bold text-blue-700 dark:text-blue-300 shrink-0 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">KET</span>
              <p className="leading-relaxed italic">&ldquo;{currentAts.keterangan}&rdquo;</p>
            </div>
          )}

          {/* Riwayat Sekolah Sebelumnya & Kelas Terakhir */}
          {(currentAts.sekolah_sebelumnya || currentAts.kelas_terakhir) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentAts.sekolah_sebelumnya && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-2 min-w-0">
                  <School className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-500 font-bold text-2xs shrink-0">SEKOLAH:</span>
                  <span
                    className="font-bold text-slate-900 dark:text-slate-100 truncate"
                    title={currentAts.sekolah_sebelumnya}
                  >
                    {currentAts.sekolah_sebelumnya}
                  </span>
                </div>
              )}
              {currentAts.kelas_terakhir && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-2 min-w-0">
                  <BookOpen className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-500 font-bold text-2xs shrink-0">KELAS:</span>
                  <span
                    className="font-bold text-slate-900 dark:text-slate-100 truncate"
                    title={currentAts.kelas_terakhir}
                  >
                    {currentAts.kelas_terakhir}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons Bar: VALIDASI, KEMBALI BERSEKOLAH, EDIT, HAPUS */}
          {((!isApproved && canValidate) || canPerformActions) && (
            <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full print:hidden">
              {/* 1. Tombol Validasi (jika status masih pending) */}
              {!isApproved && canValidate && (
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={isPendingValidate}
                  className="flex-1 min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-[0.98] px-3 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
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
                    className="flex-1 min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] px-3 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                    title="Catat Kembali Bersekolah"
                  >
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span>BERSEKOLAH</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* 3. EDIT ATS */}
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="flex-1 min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                      title="Edit Data ATS"
                    >
                      <Pencil className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-slate-300" />
                      <span>EDIT</span>
                    </button>

                    {/* 4. HAPUS ATS */}
                    <button
                      type="button"
                      onClick={() => setIsDeleteOpen(true)}
                      className="min-h-[38px] h-9 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 px-3 text-xs font-bold transition-all cursor-pointer"
                      title="Hapus Data ATS"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0 text-red-600" />
                      <span>HAPUS</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
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
