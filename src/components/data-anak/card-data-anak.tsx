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
      <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4 transition-all hover:shadow-md">
        {/* Header: Nama Anak & Status Approval */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold shadow-xs",
                currentChild.jenis_kelamin === "L" ||
                  currentChild.jenis_kelamin === "Laki-laki"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent"
              )}
            >
              <Baby className="h-6 w-6" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground leading-snug">
                {currentChild.nama_lengkap}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/90">
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
              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Terverifikasi</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Menunggu Verifikasi</span>
              </span>
            )}
          </div>
        </div>

        {/* Info Detail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Orang Tua */}
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Orang Tua:</span>
            <span className="font-bold text-foreground truncate">
              {currentChild.nama_orangtua}
            </span>
          </div>

          {/* Pendidikan */}
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5">
            <GraduationCap className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="text-muted-foreground">Status:</span>
            <span className="font-bold text-foreground truncate">
              {currentChild.is_sekolah
                ? currentChild.nama_sekolah || "Bersekolah PAUD"
                : "Belum Sekolah"}
            </span>
          </div>
        </div>

        {/* Alasan Sekolah Tag */}
        {currentChild.alasan_sekolah && (
          <div className="rounded-xl bg-muted/30 p-2.5 text-[11px] text-muted-foreground border border-border/40">
            <span className="font-semibold text-foreground/80">Keterangan: </span>
            <span>{currentChild.alasan_sekolah}</span>
          </div>
        )}

        {/* DDKS Highlight Bar */}
        {latestDdks ? (
          <div className="flex items-center justify-between rounded-2xl bg-emerald-500/5 border border-primary/20 p-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-bold text-primary">
                <Scale className="h-3.5 w-3.5" />
                <span>{latestDdks.berat_badan} kg</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-accent">
                <Ruler className="h-3.5 w-3.5" />
                <span>{latestDdks.tinggi_badan} cm</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-amber-600">
                <Activity className="h-3.5 w-3.5" />
                <span>LK {latestDdks.lingkar_kepala} cm</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(latestDdks.created_at).toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ) : (
          <div className="rounded-2xl bg-muted/40 p-3 text-center text-[11px] text-muted-foreground">
            Belum ada data pengukuran DDKS terkini.
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/60">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground border border-secondary transition-all active:scale-95 hover:bg-secondary/80"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{canEditDdks ? "Lihat & Catat DDKS" : "Lihat Rekam DDKS"}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {!isApproved && canValidate && (
            <button
              onClick={handleValidate}
              disabled={isPendingValidate}
              className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all active:scale-95 hover:brightness-105 disabled:opacity-50"
            >
              {isPendingValidate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Validasi Anak</span>
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
