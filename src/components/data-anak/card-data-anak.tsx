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
      <div className="overflow-hidden rounded-lg border border-border bg-card p-5 space-y-4 transition-colors hover:border-zinc-700">
        {/* Header: Nama Anak & Status Approval */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted font-bold",
                currentChild.jenis_kelamin === "L" ||
                  currentChild.jenis_kelamin === "Laki-laki"
                  ? "text-cyan-400"
                  : "text-emerald-400"
              )}
            >
              <Baby className="h-5 w-5" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground leading-snug">
                {currentChild.nama_lengkap}
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="font-semibold text-foreground" suppressHydrationWarning>
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
          {/* Orang Tua */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground text-[11px]">WALI:</span>
            <span className="font-bold text-foreground truncate">
              {currentChild.nama_orangtua}
            </span>
          </div>

          {/* Pendidikan */}
          <div className="flex items-center gap-2 rounded-md bg-background border border-border p-2.5">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground text-[11px]">STATUS:</span>
            <span className="font-bold text-foreground truncate">
              {currentChild.is_sekolah
                ? currentChild.nama_sekolah || "Bersekolah PAUD"
                : "Belum Sekolah"}
            </span>
          </div>
        </div>

        {/* Alasan Sekolah Tag */}
        {currentChild.alasan_sekolah && (
          <div className="rounded-md bg-background p-2.5 text-xs text-muted-foreground border border-border">
            <span className="font-mono text-muted-foreground text-[11px]">KETERANGAN: </span>
            <span className="text-foreground">{currentChild.alasan_sekolah}</span>
          </div>
        )}

        {/* DDTK Highlight Bar */}
        {latestDdks ? (
          <div className="flex items-center justify-between rounded-md bg-background border border-border p-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-bold text-emerald-400">
                <Scale className="h-3.5 w-3.5" />
                <span>{latestDdks.berat_badan} kg</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-cyan-400">
                <Ruler className="h-3.5 w-3.5" />
                <span>{latestDdks.tinggi_badan} cm</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>LK {latestDdks.lingkar_kepala} cm</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
              {new Date(latestDdks.created_at).toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ) : (
          <div className="rounded-md bg-background border border-border p-3 text-center text-[11px] font-mono text-muted-foreground">
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
            <span>{canEditDdks ? "CATAT DDTK" : "REKAM DDTK"}</span>
            <ChevronRight className="h-3 w-3" />
          </button>

          {!isApproved && canValidate && (
            <button
              onClick={handleValidate}
              disabled={isPendingValidate}
              className="flex flex-1 h-8 items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 text-xs font-mono font-bold text-white transition-all shadow-xs disabled:opacity-40 cursor-pointer"
            >
              {isPendingValidate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>VALIDASI ANAK</span>
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
