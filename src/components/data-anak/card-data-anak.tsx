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
  Scale,
  Ruler,
  AlertCircle,
} from "lucide-react";
import { validateDataAnak } from "@/app/actions/data-anak";
import { DdksDrawer } from "./ddks-drawer";
import type { DataAnakItem, DdksRecord } from "@/types/database";
import { cn } from "@/lib/utils";

interface CardDataAnakProps {
  anak: DataAnakItem;
  canValidate: boolean;
  canEditDdks: boolean;
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

export function CardDataAnak({
  anak,
  canValidate,
  canEditDdks,
}: CardDataAnakProps) {
  const [currentChild, setCurrentChild] = useState<DataAnakItem>(anak);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPendingValidate, startValidateTransition] = useTransition();

  const isApproved = currentChild.status_approval === "approved";
  const ageString = calculateAge(currentChild.tanggal_lahir);
  const latestDdks = currentChild.latest_ddks;

  const handleValidate = () => {
    startValidateTransition(async () => {
      const res = await validateDataAnak(currentChild.id);
      if (res.success) {
        setCurrentChild((prev) => ({
          ...prev,
          status_approval: "approved",
        }));
      } else {
        alert(res.message);
      }
    });
  };

  const handleRecordAdded = (newRecord: DdksRecord) => {
    setCurrentChild((prev) => ({
      ...prev,
      latest_ddks: newRecord,
      ddks_history: [newRecord, ...(prev.ddks_history || [])],
    }));
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-xs transition-all hover:border-slate-300">
        {/* Header: Nama Anak & Status Approval */}
        <div className="flex items-start justify-between gap-3">
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

          {/* Status Badge */}
          <div className="shrink-0">
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
          </div>
        </div>

        {/* Info Detail Grid (Single Column on mobile, 2 col on sm) */}
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

        {/* Alasan Sekolah Tag */}
        {currentChild.alasan_sekolah && (
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 border border-slate-200 leading-relaxed">
            <span className="font-bold text-slate-900">Keterangan: </span>
            <span>{currentChild.alasan_sekolah}</span>
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

        {/* Action Buttons Bar - Stacked full width on mobile or side-by-side with min-h-[48px] */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t-2 border-slate-100">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 border-2 border-slate-200 px-4 text-sm font-bold text-slate-800 transition-all cursor-pointer"
          >
            <Activity className="h-4 w-4 text-slate-700" />
            <span>{canEditDdks ? "Catat DDTK Posyandu" : "Rekam DDTK"}</span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>

          {!isApproved && canValidate && (
            <button
              onClick={handleValidate}
              disabled={isPendingValidate}
              className="flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 px-4 text-sm font-bold text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPendingValidate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Validasi Data Anak</span>
                </>
              )}
            </button>
          )}
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
    </>
  );
}
