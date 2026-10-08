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
import { DdksDrawer } from "./ddks-drawer";
import { ModalEditDataAnak } from "./modal-edit-data-anak";
import { ModalKeluarDataAnak } from "./modal-keluar-data-anak";
import type { DataAnakItem, DdksRecord, KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface CardDataAnakProps {
  anak: DataAnakItem;
  komunitas?: KomunitasWithMembership;
  canValidate: boolean;
  canEditDdks: boolean;
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
  canValidate,
  canEditDdks,
  canEdit,
  canDelete,
  isReadOnly,
  onUpdate,
  onDelete,
}: CardDataAnakProps) {
  const [currentChild, setCurrentChild] = useState<DataAnakItem>(anak);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isKeluarModalOpen, setIsKeluarModalOpen] = useState(false);
  const [isPendingValidate, startValidateTransition] = useTransition();

  const isPaud = komunitas?.jenis === "satuan_paud" || currentChild.is_sekolah;
  const isApproved = currentChild.status_approval === "approved";
  const ageString = calculateAge(currentChild.tanggal_lahir);
  const latestDdks = currentChild.latest_ddks;

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

  const handleRecordAdded = (newRecord: DdksRecord) => {
    const updated = {
      ...currentChild,
      latest_ddks: newRecord,
      ddks_history: [newRecord, ...(currentChild.ddks_history || [])],
    };
    setCurrentChild(updated);
    onUpdate?.(updated);
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
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs transition-all hover:border-slate-300 break-inside-avoid print:bg-white print:border-gray-300 print:text-black print:shadow-none">
        {/* Header: Nama Anak & Status Approval */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-all",
            isExpanded ? "border-b-2 border-slate-100 pb-4" : "pb-0"
          )}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold border-2",
                currentChild.jenis_kelamin === "L" ||
                  currentChild.jenis_kelamin === "Laki-laki"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              <Baby className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentChild.nama_lengkap}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
                <span className="font-mono text-slate-900" suppressHydrationWarning>
                  {ageString}
                </span>
                <span>•</span>
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

            {/* Toggle Sembunyikan / Tampilkan Button */}
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
          {/* Info Detail Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
            {/* Orang Tua */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
              <User className="h-4 w-4 text-slate-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Orang Tua / Wali
                </span>
                <span className="font-bold text-slate-900 truncate block">
                  {currentChild.nama_orangtua || "-"}
                </span>
              </div>
            </div>

            {/* Pendidikan */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
              <GraduationCap className="h-4 w-4 text-slate-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Status Pendidikan
                </span>
                <span className="font-bold text-slate-900 truncate block">
                  {currentChild.is_sekolah
                    ? currentChild.nama_sekolah || "Bersekolah PAUD"
                    : "Belum Sekolah"}
                </span>
              </div>
            </div>
          </div>

          {/* Info Alamat KK & Domisili */}
          <div className="space-y-2 rounded-xl bg-slate-50/80 border border-slate-200 p-3 text-xs sm:text-sm">
            {/* Alamat KK */}
            <div className="flex items-start gap-2 text-slate-700">
              <FileText className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold text-slate-900">Alamat KK: </span>
                <span className="text-slate-800">
                  {kkAddressStr || "Belum dilengkapi"}
                </span>
              </div>
            </div>

            {/* Alamat Domisili */}
            <div className="flex items-start gap-2 text-slate-700">
              <Home className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold text-slate-900">Domisili: </span>
                <span className="text-slate-800">
                  {isSameAddress
                    ? "Sama dengan Alamat KK"
                    : domisiliAddressStr || "Belum dilengkapi"}
                </span>
              </div>
            </div>
          </div>

          {/* Alasan Sekolah / Keterangan Tag */}
          {cleanedAlasan && (
            <div className="rounded-xl bg-blue-50/50 p-3 text-xs sm:text-sm text-slate-700 border border-blue-100 leading-relaxed">
              <span className="font-bold text-blue-950">Keterangan: </span>
              <span className="text-slate-800">{cleanedAlasan}</span>
            </div>
          )}

          {/* DDTK Highlight Bar */}
          {latestDdks ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-xl bg-blue-50/60 border-2 border-blue-200 p-3.5 text-sm font-mono">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Scale className="h-4 w-4 text-emerald-600" />
                  <span>{latestDdks.berat_badan} kg</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Ruler className="h-4 w-4 text-blue-600" />
                  <span>{latestDdks.tinggi_badan} cm</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Activity className="h-4 w-4 text-slate-500" />
                  <span>LK {latestDdks.lingkar_kepala} cm</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500" suppressHydrationWarning>
                {new Date(latestDdks.created_at).toLocaleDateString("id-ID", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-center text-sm font-semibold text-amber-900 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Data Belum Di Isi Oleh Posyandu</span>
            </div>
          )}

          {/* Action Buttons Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex flex-1 min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 border-2 border-slate-200 px-3.5 text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer"
            >
              <Activity className="h-4 w-4 text-slate-700" />
              <span>{canEditDdks ? "Catat DDTK Posyandu" : "Rekam DDTK"}</span>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>

            {/* Menu Edit Data & Keluar untuk Data Anak (Admin, Kepala Sekolah, Guru PAUD / Pengurus / Pembuat Data) */}
            {(canEdit || canDelete || isPaud) && (
              <div className="flex items-center gap-2 shrink-0">
                {canEdit !== false && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-98 border-2 border-blue-200 px-3.5 text-xs sm:text-sm font-bold text-blue-900 transition-all cursor-pointer"
                  >
                    <Pencil className="h-4 w-4 text-blue-700" />
                    <span>Edit Data</span>
                  </button>
                )}

                {canDelete !== false && (
                  <button
                    type="button"
                    onClick={() => setIsKeluarModalOpen(true)}
                    className="flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-98 border-2 border-rose-200 px-3.5 text-xs sm:text-sm font-bold text-rose-900 transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-700" />
                    <span>Keluar / Hapus</span>
                  </button>
                )}
              </div>
            )}

            {!isApproved && canValidate && (
              <button
                type="button"
                onClick={handleValidate}
                disabled={isPendingValidate}
                className="flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 px-4 text-xs sm:text-sm font-bold text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isPendingValidate ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Validasi</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Center Toggle Handle Pill */}
        <div className="flex justify-center -mb-1 pt-1 print:hidden">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="group inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-3.5 py-1 text-xs font-bold text-slate-600 transition-all active:scale-95 cursor-pointer shadow-2xs"
            title={isExpanded ? "Sembunyikan detail rincian" : "Tampilkan detail rincian"}
          >
            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-700">
              {isExpanded ? "Sembunyikan Detail" : "Tampilkan Detail Lengkap"}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-800 transition-transform" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-800 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* DDKS Drawer */}
      <DdksDrawer
        anak={currentChild}
        isOpen={isDrawerOpen}
        canEditDdks={canEditDdks}
        onClose={() => setIsDrawerOpen(false)}
        onRecordAdded={handleRecordAdded}
      />

      {/* Edit Data Anak Modal */}
      {isEditModalOpen && (
        <ModalEditDataAnak
          isOpen={isEditModalOpen}
          anak={currentChild}
          komunitasId={komunitas?.id || currentChild.komunitas_id}
          komunitasNama={komunitas?.nama || currentChild.nama_sekolah || "Satuan PAUD"}
          jenisKomunitas={komunitas?.jenis || "satuan_paud"}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleChildUpdated}
        />
      )}

      {/* Keluar Data Anak Modal */}
      {isKeluarModalOpen && (
        <ModalKeluarDataAnak
          isOpen={isKeluarModalOpen}
          anak={currentChild}
          komunitasId={komunitas?.id || currentChild.komunitas_id}
          komunitasNama={komunitas?.nama || currentChild.nama_sekolah || "Satuan PAUD"}
          onClose={() => setIsKeluarModalOpen(false)}
          onSuccess={handleChildDeleted}
        />
      )}
    </>
  );
}
