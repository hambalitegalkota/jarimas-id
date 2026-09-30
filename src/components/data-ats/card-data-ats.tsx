"use client";

import { useState, useTransition } from "react";
import {
  GraduationCap,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  ChevronRight,
  Scale,
  Ruler,
  AlertCircle,
  HelpCircle,
  FileText,
} from "lucide-react";
import { validateDataAts } from "@/app/actions/data-ats";
import { DdksDrawer } from "@/components/data-anak/ddks-drawer";
import type { DataAtsItem, DdtkRecord } from "@/types/database";
import { cn } from "@/lib/utils";

interface CardDataAtsProps {
  ats: DataAtsItem;
  canValidate: boolean;
  canEditDdtk: boolean;
}

function calculateAge(birthDateString: string): string {
  try {
    const birthDate = new Date(birthDateString);
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years === 0) {
      return `${months} Bulan`;
    }
    return `${years} Thn ${months} Bln`;
  } catch {
    return "-";
  }
}

export function CardDataAts({
  ats,
  canValidate,
  canEditDdtk,
}: CardDataAtsProps) {
  const [currentAts, setCurrentAts] = useState<DataAtsItem>(ats);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPendingValidate, startValidateTransition] = useTransition();

  const isApproved = currentAts.status_approval === "approved";
  const ageString = calculateAge(currentAts.tanggal_lahir);
  const latestDdtk = currentAts.latest_ddtk;

  const handleValidate = () => {
    startValidateTransition(async () => {
      const res = await validateDataAts(currentAts.id);
      if (res.success) {
        setCurrentAts((prev) => ({
          ...prev,
          status_approval: "approved",
        }));
      } else {
        alert(res.message);
      }
    });
  };

  const handleRecordAdded = (newRecord: DdtkRecord) => {
    setCurrentAts((prev) => ({
      ...prev,
      latest_ddtk: newRecord,
      ddtk_history: [newRecord, ...(prev.ddtk_history || [])],
    }));
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card p-5 space-y-4 transition-colors hover:border-amber-500/40">
        {/* Header: Nama Anak & Status Approval */}
        <div className="flex items-start justify-between gap-2">
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

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground leading-snug">
                {currentAts.nama_lengkap}
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {ageString}
                </span>
                <span>•</span>
                <span>
                  {currentAts.jenis_kelamin === "L" ||
                  currentAts.jenis_kelamin === "Laki-laki"
                    ? "Laki-laki"
                    : "Perempuan"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div>
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

        {/* Info Detail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {/* Orang Tua / Wali */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground text-[11px]">WALI:</span>
            <span className="font-bold text-foreground truncate">
              {currentAts.nama_orangtua} ({currentAts.tinggal_bersama})
            </span>
          </div>

          {/* Keinginan Sekolah */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5">
            <HelpCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-muted-foreground text-[11px]">KEINGINAN:</span>
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
        </div>

        {/* Alasan Tidak Sekolah Tag */}
        <div className="rounded-md bg-background p-3 space-y-1.5 border border-border">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>ALASAN: {currentAts.alasan_tidak_sekolah}</span>
          </div>
          {currentAts.keterangan && (
            <p className="text-xs text-muted-foreground leading-relaxed pl-5">
              &ldquo;{currentAts.keterangan}&rdquo;
            </p>
          )}
        </div>

        {/* DDTK Highlight Bar */}
        {latestDdtk ? (
          <div className="flex items-center justify-between rounded-md bg-background border border-border p-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-bold text-emerald-400">
                <Scale className="h-3.5 w-3.5" />
                <span>{latestDdtk.berat_badan} kg</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-cyan-400">
                <Ruler className="h-3.5 w-3.5" />
                <span>{latestDdtk.tinggi_badan} cm</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>LK {latestDdtk.lingkar_kepala} cm</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(latestDdtk.created_at).toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ) : (
          <div className="rounded-md bg-background border border-border p-2.5 text-center text-[11px] font-mono text-muted-foreground">
            BELUM ADA PENGUKURAN DDTK TERKINI
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-1 h-8 items-center justify-center gap-1.5 rounded-md bg-muted border border-border px-3 text-xs font-mono text-foreground transition-all hover:bg-muted/80 cursor-pointer"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{canEditDdtk ? "CATAT DDTK" : "REKAM DDTK"}</span>
            <ChevronRight className="h-3 w-3" />
          </button>

          {!isApproved && canValidate && (
            <button
              onClick={handleValidate}
              disabled={isPendingValidate}
              className="flex flex-1 h-8 items-center justify-center gap-1.5 rounded-md bg-amber-600 hover:bg-amber-500 px-3 text-xs font-mono font-bold text-white transition-all shadow-xs disabled:opacity-40 cursor-pointer"
            >
              {isPendingValidate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>VALIDASI ATS</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* DDTK Drawer */}
      <DdksDrawer
        anak={{
          id: currentAts.id,
          nama_lengkap: currentAts.nama_lengkap,
          tanggal_lahir: currentAts.tanggal_lahir,
          jenis_kelamin: currentAts.jenis_kelamin,
          nama_orangtua: currentAts.nama_orangtua,
          nomor_hp: currentAts.nomor_hp,
          tinggal_bersama: currentAts.tinggal_bersama,
          jarak_rumah_km: 0,
          is_sekolah: false,
          komunitas_id: currentAts.komunitas_id,
          status_approval: currentAts.status_approval,
          created_at: currentAts.created_at,
          latest_ddks: currentAts.latest_ddtk,
          ddks_history: currentAts.ddtk_history,
        }}
        isOpen={isDrawerOpen}
        canEditDdks={canEditDdtk}
        onClose={() => setIsDrawerOpen(false)}
        onRecordAdded={handleRecordAdded}
      />
    </>
  );
}
