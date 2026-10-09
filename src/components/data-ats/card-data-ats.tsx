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
import { getJenjangAts, normalizeKeinginanSekolah } from "@/lib/ats-helpers";
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
  if (str === "25>" || str === ">25" || str === "24>" || str === ">24" || str.includes(">")) {
    return "> 25 Tahun";
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
      return "> 25 Tahun";
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
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
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-4 transition-all hover:border-blue-400 shadow-xs break-inside-avoid print:bg-white print:border-gray-300 print:text-black print:shadow-none">
        {/* Header: Nama Anak, Jenjang, & Status Approval */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-all",
            isExpanded ? "border-b-2 border-slate-100 pb-4" : "pb-0"
          )}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 font-bold",
                currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              )}
            >
              <GraduationCap className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentAts.nama_lengkap}
                </h3>
                {/* Jenjang Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border-2 border-blue-200 bg-blue-50 text-blue-900 shrink-0">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{jenjangInfo.badgeLabel}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium text-slate-600">
                <span className="font-bold text-slate-900 font-mono" suppressHydrationWarning>
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
                    <span className="text-blue-800 font-bold">
                      {rtRwHeaderStr}Kel. {currentAts.kelurahan}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge & Toggle Button */}
          <div className="flex items-center gap-2 self-start shrink-0">
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border-2 border-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>TERVERIFIKASI</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border-2 border-amber-300">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>MENUNGGU</span>
              </span>
            )}

            {/* Toggle Sembunyikan / Tampilkan */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer border-2 print:hidden",
                isExpanded
                  ? "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  : "border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800"
              )}
              title={isExpanded ? "Sembunyikan Detail Kartu" : "Tampilkan Detail Kartu"}
            >
              <span>{isExpanded ? "Sembunyikan" : "Tampilkan"}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Detail Section (Disembunyikan secara default, tetap tampil saat dicetak) */}
        <div className={cn("space-y-4 pt-1", !isExpanded && "hidden print:block")}>
          {/* Info Grid: Orang Tua / Wali & Alamat Domisili */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
            {/* Orang Tua / Wali */}
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
              <User className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-slate-500 font-bold text-xs shrink-0">WALI:</span>
              <span
                className="font-bold text-slate-900 truncate"
                title={`${currentAts.nama_orangtua} (${currentAts.tinggal_bersama})`}
              >
                {currentAts.nama_orangtua} ({currentAts.tinggal_bersama})
              </span>
            </div>

            {/* Alamat Domisili */}
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="text-slate-500 font-bold text-xs shrink-0">ALAMAT:</span>
              <span
                className="font-semibold text-slate-800 truncate"
                title={alamatLengkap || "-"}
              >
                {alamatLengkap || "-"}
              </span>
            </div>
          </div>

          {/* Info Grid: Keinginan Sekolah & Alasan Tidak Sekolah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
            {/* Keinginan Sekolah */}
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
              <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="text-slate-500 font-bold text-xs shrink-0">MINAT:</span>
              <span
                className={cn(
                  "font-bold truncate px-2 py-0.5 rounded-lg text-xs",
                  normalizeKeinginanSekolah(currentAts.keinginan_sekolah) === "Masih Ada"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                )}
              >
                {normalizeKeinginanSekolah(currentAts.keinginan_sekolah) === "Masih Ada"
                  ? "Masih Ada Keinginan"
                  : "Tidak Ada Keinginan"}
              </span>
            </div>

            {/* Alasan Tidak Sekolah */}
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-slate-500 font-bold text-xs shrink-0">ALASAN:</span>
              <span
                className="font-bold text-slate-900 truncate"
                title={currentAts.alasan_tidak_sekolah}
              >
                {currentAts.alasan_tidak_sekolah}
              </span>
            </div>
          </div>

          {/* Keterangan Alasan Tambahan jika ada */}
          {currentAts.keterangan && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-700 flex items-start gap-2.5">
              <span className="text-xs font-bold text-blue-700 shrink-0 bg-blue-100 px-2 py-0.5 rounded">KET</span>
              <p className="leading-relaxed italic">&ldquo;{currentAts.keterangan}&rdquo;</p>
            </div>
          )}

          {/* Riwayat Sekolah Sebelumnya & Kelas Terakhir */}
          {(currentAts.sekolah_sebelumnya || currentAts.kelas_terakhir) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              {currentAts.sekolah_sebelumnya && (
                <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
                  <School className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-slate-500 font-bold text-xs shrink-0">SEKOLAH:</span>
                  <span
                    className="font-bold text-slate-900 truncate"
                    title={currentAts.sekolah_sebelumnya}
                  >
                    {currentAts.sekolah_sebelumnya}
                  </span>
                </div>
              )}
              {currentAts.kelas_terakhir && (
                <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
                  <BookOpen className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-slate-500 font-bold text-xs shrink-0">KELAS:</span>
                  <span
                    className="font-bold text-slate-900 truncate"
                    title={currentAts.kelas_terakhir}
                  >
                    {currentAts.kelas_terakhir}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons Bar: VALIDASI, KEMBALI BERSEKOLAH, EDIT, HAPUS (Min 48px Height Tap Targets) */}
          {((!isApproved && canValidate) || canPerformActions) && (
            <div className="grid grid-cols-1 sm:flex sm:items-center gap-2.5 pt-3 border-t-2 border-slate-100 w-full print:hidden">
              {/* 1. Tombol Validasi (jika status masih pending) */}
              {!isApproved && canValidate && (
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={isPendingValidate}
                  className="flex-1 min-h-[48px] h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] px-4 text-sm font-bold text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  title="Validasi Data ATS"
                >
                  {isPendingValidate ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 shrink-0" />
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
                    className="flex-1 min-h-[48px] h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] px-4 text-sm font-bold text-white transition-all shadow-sm cursor-pointer"
                    title="Catat Kembali Bersekolah"
                  >
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span>BERSEKOLAH</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* 3. EDIT ATS */}
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="flex-1 min-h-[48px] h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 px-4 text-sm font-bold text-slate-800 transition-all cursor-pointer"
                      title="Edit Data ATS"
                    >
                      <Pencil className="h-4 w-4 shrink-0 text-slate-700" />
                      <span>EDIT</span>
                    </button>

                    {/* 4. HAPUS ATS */}
                    <button
                      type="button"
                      onClick={() => setIsDeleteOpen(true)}
                      className="min-h-[48px] h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-4 text-sm font-bold transition-all cursor-pointer"
                      title="Hapus Data ATS"
                    >
                      <Trash2 className="h-4 w-4 shrink-0 text-red-600" />
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
