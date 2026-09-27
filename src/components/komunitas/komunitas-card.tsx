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
  Calendar,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
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
  const membership = komunitas.currentUserMembership;

  // Format Nama Komunitas sesuai tipe
  let formattedTitle = komunitas.nama;
  if (komunitas.jenis === "warga_kita") {
    const rt = komunitas.rt || "01";
    const rw = komunitas.rw || "01";
    const kel = komunitas.kelurahan || "Kejambon";
    const kec = komunitas.kecamatan || "Tegal Timur";
    formattedTitle = `Warga: RT ${rt}, RW ${rw}, ${kel}, ${kec}, Kota Tegal`;
  } else if (komunitas.jenis === "posyandu") {
    if (!formattedTitle.startsWith("Posyandu")) {
      formattedTitle = `Posyandu ${komunitas.nama}, ${komunitas.kelurahan || ""}, ${komunitas.kecamatan || ""}, Kota Tegal`;
    }
  } else if (komunitas.jenis === "satuan_paud") {
    if (!formattedTitle.startsWith("Satuan PAUD") && !formattedTitle.startsWith("PAUD") && !formattedTitle.startsWith("RA") && !formattedTitle.startsWith("TK") && !formattedTitle.startsWith("KB")) {
      formattedTitle = `Satuan PAUD ${komunitas.nama}, ${komunitas.kelurahan || ""}, ${komunitas.kecamatan || ""}, Kota Tegal`;
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md space-y-4">
        {/* Header Title & Badge Tipe */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold shadow-xs",
                komunitas.jenis === "warga_kita" &&
                  "bg-emerald-500/10 text-primary",
                komunitas.jenis === "posyandu" &&
                  "bg-accent/10 text-accent",
                komunitas.jenis === "satuan_paud" &&
                  "bg-amber-500/10 text-amber-600"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-5 w-5" />}
              {komunitas.jenis === "posyandu" && (
                <Sparkles className="h-5 w-5" />
              )}
              {komunitas.jenis === "satuan_paud" && (
                <Building2 className="h-5 w-5" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground leading-snug">
                {formattedTitle}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground/80">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {komunitas.kelurahan}, {komunitas.kecamatan}
                </span>
                <span>•</span>
                <span>{komunitas.jumlah_anggota} Anggota</span>
              </div>
            </div>
          </div>

          {/* Membership Status Badge */}
          {membership && (
            <div className="shrink-0">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>{membership.peran}</span>
                </span>
              )}
              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Menunggu Verifikasi</span>
                </span>
              )}
              {membership.status === "rejected" && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                  <span>Ditolak</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Deskripsi & Jadwal */}
        {komunitas.deskripsi && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {komunitas.deskripsi}
          </p>
        )}

        {komunitas.jadwal && (
          <div className="flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground border border-border/50">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{komunitas.jadwal}</span>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/60">
          <Link
            href={`/komunitas/${komunitas.id}`}
            className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground border border-secondary transition-all active:scale-95 hover:bg-secondary/80"
          >
            <span>Lihat Detail</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {!membership && (
            <button
              onClick={() => {
                if (!currentUserId) {
                  window.location.href = "/login";
                  return;
                }
                setIsJoinModalOpen(true);
              }}
              className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-md shadow-accent/20 transition-all active:scale-95 hover:brightness-110"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Minta Bergabung</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Join */}
      <JoinKomunitasModal
        komunitas={komunitas}
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </>
  );
}
