"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { WargaOnboardingModal } from "@/components/komunitas/warga-onboarding-modal";
import type { KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface KomunitasCardProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
}

export function KomunitasCard({
  komunitas,
  currentUserId,
}: KomunitasCardProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isWargaModalOpen, setIsWargaModalOpen] = useState(false);

  const membership = komunitas.currentUserMembership;
  const isApprovedMember = membership?.status === "approved";

  // Hanya Komunitas RT, Posyandu, dan Satuan PAUD yang dapat digabung secara langsung.
  // Komunitas RW, Kelurahan, Kecamatan, dan Kota Tegal tidak memiliki tombol gabung langsung.
  const canJoin =
    komunitas.jenis === "posyandu" ||
    komunitas.jenis === "satuan_paud" ||
    komunitas.jenis === "pkbm_skb" ||
    (komunitas.jenis === "warga_kita" &&
      Boolean(komunitas.rt && komunitas.rt.trim() !== "" && komunitas.rt !== "semua"));

  // Format Nama Komunitas sesuai tipe
  let formattedTitle = komunitas.nama;
  if (komunitas.jenis === "warga_kita") {
    if (!formattedTitle.startsWith("Warga") && !formattedTitle.startsWith("Komunitas Warga")) {
      const rt = komunitas.rt;
      const rw = komunitas.rw;
      const kel = komunitas.kelurahan;
      const kec = komunitas.kecamatan || "Kota Tegal";
      if (rt && rw && kel) {
        formattedTitle = `Warga RT: ${rt}, RW: ${rw}, Kelurahan: ${kel}, Kecamatan: ${kec}`;
      } else if (rw && kel) {
        formattedTitle = `Warga RW: ${rw}, Kelurahan: ${kel}, Kecamatan: ${kec}`;
      } else if (kel) {
        formattedTitle = `Warga Kelurahan: ${kel}, Kecamatan: ${kec}`;
      } else if (kec === "Kota Tegal" || !kec) {
        formattedTitle = "Komunitas Warga Kota Tegal";
      } else {
        formattedTitle = `Warga Kecamatan: ${kec}`;
      }
    }
  } else if (komunitas.jenis === "posyandu") {
    const cleanName = (komunitas.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
    formattedTitle = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
  } else if (komunitas.jenis === "satuan_paud" || komunitas.jenis === "pkbm_skb") {
    formattedTitle = komunitas.nama;
  }

  // Handle klik tombol Gabung
  const handleJoinClick = () => {
    if (!canJoin) return;
    if (!currentUserId) {
      window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
      return;
    }
    if (komunitas.jenis === "warga_kita") {
      setIsWargaModalOpen(true);
    } else {
      setIsJoinModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={cn(
          "rounded-lg border border-border p-3.5 sm:p-4 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3",
          komunitas.jenis === "warga_kita" && "hover:border-sky-500/40",
          komunitas.jenis === "posyandu" && "hover:border-primary/40",
          komunitas.jenis === "satuan_paud" && "hover:border-teal-500/40",
          komunitas.jenis === "pkbm_skb" && "hover:border-secondary/40"
        )}
      >
        {/* Kiri: Icon, Nama Posyandu & Alamat */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg font-bold border shadow-2xs",
              komunitas.jenis === "warga_kita" &&
                "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
              komunitas.jenis === "posyandu" &&
                "bg-primary/10 text-primary border-primary/20",
              komunitas.jenis === "satuan_paud" &&
                "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
              komunitas.jenis === "pkbm_skb" &&
                "bg-secondary/15 text-secondary-foreground border-secondary/30"
            )}
          >
            {komunitas.jenis === "warga_kita" && <Users className="h-5 w-5" />}
            {komunitas.jenis === "posyandu" && <Sparkles className="h-5 w-5" />}
            {komunitas.jenis === "satuan_paud" && <Building2 className="h-5 w-5" />}
            {komunitas.jenis === "pkbm_skb" && <BookOpen className="h-5 w-5" />}
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug truncate">
                {formattedTitle}
              </h3>
              {komunitas.jenis === "satuan_paud" && komunitas.jenis_institusi && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  {komunitas.jenis_institusi}
                </span>
              )}
              {komunitas.jenis === "pkbm_skb" && komunitas.jenis_institusi && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {komunitas.jenis_institusi}
                </span>
              )}
              {/* Membership Status Badge */}
              {membership && (
                <div className="shrink-0 hidden md:block">
                  {membership.status === "approved" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      <span>{membership.peran.toUpperCase()}</span>
                    </span>
                  )}
                  {membership.status === "pending" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2 py-0.5 text-[11px] font-bold text-secondary-foreground border border-secondary/30">
                      <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      <span>PENDING</span>
                    </span>
                  )}
                  {membership.status === "rejected" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive border border-destructive/20">
                      <XCircle className="h-3 w-3" />
                      <span>DITOLAK</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">
                {komunitas.kelurahan && komunitas.kelurahan !== "Semua Kelurahan"
                  ? `${komunitas.kelurahan}, ${komunitas.kecamatan || "Kota Tegal"}`
                  : komunitas.kecamatan && komunitas.kecamatan !== "Kota Tegal"
                  ? `Kecamatan ${komunitas.kecamatan}, Kota Tegal`
                  : "Kota Tegal, Jawa Tengah"}
              </span>
            </div>
          </div>
        </div>

        {/* Kanan: Tombol Kunjungi & Gabung (Sejajar dan Kompak) */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
          {/* Membership Status Badge di Mobile */}
          {membership && (
            <div className="shrink-0 md:hidden mr-auto">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary border border-primary/20">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span>{membership.peran.toUpperCase()}</span>
                </span>
              )}
              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2 py-1 text-[11px] font-bold text-secondary-foreground border border-secondary/30">
                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span>PENDING</span>
                </span>
              )}
            </div>
          )}

          <Link
            href={`/komunitas/${komunitas.id}`}
            prefetch={false}
            className={cn(
              "group inline-flex min-h-[38px] h-9.5 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-bold text-foreground transition-all hover:bg-accent shadow-2xs active:scale-95",
              isApprovedMember &&
                "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent"
            )}
          >
            <span>Kunjungi</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {!isApprovedMember && canJoin && (
            <button
              type="button"
              onClick={handleJoinClick}
              className="inline-flex min-h-[38px] h-9.5 items-center justify-center gap-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3.5 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Gabung</span>
            </button>
          )}
        </div>
      </div>

      {/* PopUp Isian Bergabung Warga Kita (Survey KK & Domisili) */}
      {isWargaModalOpen && canJoin && (
        <WargaOnboardingModal
          komunitas={komunitas}
          isOpen={isWargaModalOpen}
          onClose={() => setIsWargaModalOpen(false)}
          currentUserId={currentUserId}
          onSuccess={() => {
            setIsWargaModalOpen(false);
            window.location.href = `/komunitas/${komunitas.id}`;
          }}
        />
      )}

      {/* Pop Up Minta Bergabung Modal (Posyandu / PAUD) */}
      {isJoinModalOpen && canJoin && (
        <JoinKomunitasModal
          komunitas={komunitas}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
        />
      )}
    </>
  );
}
