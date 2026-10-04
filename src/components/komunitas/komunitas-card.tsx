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
    const cleanName = (komunitas.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
    formattedTitle = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
  } else if (komunitas.jenis === "satuan_paud") {
    formattedTitle = komunitas.nama;
  }

  // Handle klik tombol Gabung
  const handleJoinClick = () => {
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
          "rounded-2xl border-2 p-4 sm:p-5 space-y-3.5 shadow-xs transition-all hover:shadow-md bg-white dark:bg-slate-900",
          komunitas.jenis === "warga_kita" &&
            "border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500",
          komunitas.jenis === "posyandu" &&
            "border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500",
          komunitas.jenis === "satuan_paud" &&
            "border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500"
        )}
      >
        {/* Header: Icon, Nama Posyandu / Komunitas, Alamat & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold border-2 shadow-2xs",
                komunitas.jenis === "warga_kita" &&
                  "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                komunitas.jenis === "posyandu" &&
                  "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                komunitas.jenis === "satuan_paud" &&
                  "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-5 w-5" />}
              {komunitas.jenis === "posyandu" && <Sparkles className="h-5 w-5" />}
              {komunitas.jenis === "satuan_paud" && <Building2 className="h-5 w-5" />}
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                {formattedTitle}
              </h3>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
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

          {/* Membership Status Badge jika sudah terdaftar */}
          {membership && (
            <div className="shrink-0">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{membership.peran.toUpperCase()}</span>
                </span>
              )}
              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-800">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>PENDING</span>
                </span>
              )}
              {membership.status === "rejected" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 text-xs font-bold text-rose-900 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>DITOLAK</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Bar: Kunjungi & Gabung */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={`/komunitas/${komunitas.id}`}
            className={cn(
              "group flex flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-extrabold text-slate-800 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs active:scale-[0.99]",
              isApprovedMember &&
                (komunitas.jenis === "warga_kita"
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent")
            )}
          >
            <span>Kunjungi</span>
            <ArrowRight className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {!isApprovedMember && (
            <button
              type="button"
              onClick={handleJoinClick}
              className={cn(
                "flex flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-white transition-all shadow-2xs cursor-pointer active:scale-[0.99]",
                komunitas.jenis === "warga_kita"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              <UserPlus className="h-4 w-4" />
              <span>Gabung</span>
            </button>
          )}
        </div>
      </div>

      {/* PopUp Isian Bergabung Warga Kita (Survey KK & Domisili) */}
      {isWargaModalOpen && (
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
