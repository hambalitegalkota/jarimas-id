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
    if (!formattedTitle.startsWith("Warga")) {
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
      } else {
        formattedTitle = `Warga Kecamatan: ${kec}`;
      }
    }
  } else if (komunitas.jenis === "posyandu") {
    if (!formattedTitle.startsWith("Posyandu")) {
      formattedTitle = `Posyandu ${komunitas.nama}`;
    }
  } else if (komunitas.jenis === "satuan_paud") {
    if (
      !formattedTitle.startsWith("Satuan PAUD") &&
      !formattedTitle.startsWith("PAUD") &&
      !formattedTitle.startsWith("RA") &&
      !formattedTitle.startsWith("TK") &&
      !formattedTitle.startsWith("KB") &&
      !formattedTitle.startsWith("SKB") &&
      !formattedTitle.startsWith("UPTD") &&
      !formattedTitle.startsWith("SPNF") &&
      !formattedTitle.startsWith("PKBM") &&
      !formattedTitle.startsWith("SPS") &&
      !formattedTitle.startsWith("TPA")
    ) {
      formattedTitle = `PAUD & Kesetaraan ${komunitas.nama}`;
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-5 space-y-4 transition-colors hover:border-zinc-700">
        {/* Header Title & Badge Tipe */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-foreground font-mono",
                komunitas.jenis === "warga_kita" &&
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                komunitas.jenis === "posyandu" &&
                  "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
                komunitas.jenis === "satuan_paud" &&
                  "bg-amber-500/10 text-amber-400 border-amber-500/30"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-4 w-4" />}
              {komunitas.jenis === "posyandu" && <Sparkles className="h-4 w-4" />}
              {komunitas.jenis === "satuan_paud" && <Building2 className="h-4 w-4" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground leading-snug tracking-tight">
                {formattedTitle}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {komunitas.kelurahan}, {komunitas.kecamatan}
                </span>
                <span>•</span>
                <span>{komunitas.jumlah_anggota} ANGGOTA</span>
              </div>
            </div>
          </div>

          {/* Membership Status Badge */}
          {membership && (
            <div className="shrink-0">
              {membership.status === "approved" && (
                <span className="cyber-badge font-mono text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{membership.peran.toUpperCase()}</span>
                </span>
              )}
              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400">
                  <Clock className="h-3 w-3" />
                  <span>PENDING</span>
                </span>
              )}
              {membership.status === "rejected" && (
                <span className="inline-flex items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-mono text-destructive">
                  <XCircle className="h-3 w-3" />
                  <span>DITOLAK</span>
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
          <div className="flex items-center gap-1.5 rounded border border-border/70 bg-background/40 px-2.5 py-1.5 text-[11px] text-muted-foreground font-mono">
            <Calendar className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">{komunitas.jadwal}</span>
          </div>
        )}

        {/* Status Admin Komunitas */}
        {komunitas.hasAdmin && komunitas.adminName ? (
          <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              Admin: <strong className="text-foreground font-semibold">{komunitas.adminName}</strong>
              {komunitas.adminRole ? ` (${komunitas.adminRole})` : ""}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-xs text-amber-400/90 font-mono">
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Belum Memiliki Admin / Pengurus</span>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {komunitas.jenis === "warga_kita" ? (
            membership?.status === "approved" ? (
              <Link
                href={`/komunitas/${komunitas.id}`}
                className="group flex flex-1 h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-xs font-mono font-semibold text-white transition-all hover:bg-emerald-500 shadow-xs"
              >
                <span>Lihat Komunitas</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href={`/komunitas/${komunitas.id}`}
                className="group flex flex-1 h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-xs font-mono font-bold text-white transition-all hover:bg-emerald-500 shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Bergabung</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )
          ) : (
            <>
              {membership?.status === "approved" ? (
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className={cn(
                    "group flex flex-1 h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-mono font-semibold text-white transition-all shadow-xs",
                    komunitas.jenis === "posyandu" && "bg-blue-600 hover:bg-blue-500",
                    komunitas.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-500"
                  )}
                >
                  <span>Lihat Komunitas</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-mono font-medium text-foreground transition-colors hover:bg-muted shadow-xs"
                >
                  <span>Detail</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              )}

              {!membership && (
                <button
                  onClick={() => {
                    if (!currentUserId) {
                      window.location.href = "/login";
                      return;
                    }
                    setIsJoinModalOpen(true);
                  }}
                  className={cn(
                    "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-bold text-white transition-all font-mono shadow-xs cursor-pointer active:scale-98",
                    komunitas.jenis === "posyandu" && "bg-blue-600 hover:bg-blue-500",
                    komunitas.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-500"
                  )}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Gabung</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pop Up Minta Bergabung Modal */}
      {isJoinModalOpen && (
        <JoinKomunitasModal
          komunitas={komunitas}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
        />
      )}
    </>
  );
}
