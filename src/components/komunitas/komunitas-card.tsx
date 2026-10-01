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
    formattedTitle = komunitas.nama;
  }

  return (
    <>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs transition-all hover:border-slate-300">
        {/* Header Title & Badge Tipe */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold border-2",
                komunitas.jenis === "warga_kita" &&
                  "bg-blue-50 text-blue-700 border-blue-200",
                komunitas.jenis === "posyandu" &&
                  "bg-emerald-50 text-emerald-700 border-emerald-200",
                komunitas.jenis === "satuan_paud" &&
                  "bg-amber-50 text-amber-800 border-amber-200"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-6 w-6" />}
              {komunitas.jenis === "posyandu" && <Sparkles className="h-6 w-6" />}
              {komunitas.jenis === "satuan_paud" && <Building2 className="h-6 w-6" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {formattedTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {komunitas.kelurahan}, {komunitas.kecamatan}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-900">{komunitas.jumlah_anggota} Anggota</span>
              </div>
            </div>
          </div>

          {/* Membership Status Badge */}
          {membership && (
            <div className="shrink-0">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border-2 border-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{membership.peran.toUpperCase()}</span>
                </span>
              )}
              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border-2 border-amber-300">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>PENDING</span>
                </span>
              )}
              {membership.status === "rejected" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-900 border-2 border-rose-300">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>DITOLAK</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Deskripsi & Jadwal */}
        {komunitas.deskripsi && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {komunitas.deskripsi}
          </p>
        )}

        {komunitas.jadwal && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm text-slate-700">
            <Calendar className="h-4 w-4 text-blue-700 shrink-0" />
            <span className="truncate font-semibold">{komunitas.jadwal}</span>
          </div>
        )}

        {/* Status Admin Komunitas */}
        {komunitas.hasAdmin && komunitas.adminName ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 border-2 border-emerald-200 px-3.5 py-2 text-sm text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              Pengurus: <strong className="font-bold text-slate-900">{komunitas.adminName}</strong>
              {komunitas.adminRole ? ` (${komunitas.adminRole})` : ""}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 border-2 border-amber-200 px-3.5 py-2 text-sm text-amber-900">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="font-semibold">Belum Memiliki Admin / Pengurus</span>
          </div>
        )}

        {/* Action Buttons Bar - Coursera Mobile Touch Target (min-h-[48px]) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t-2 border-slate-100">
          {komunitas.jenis === "warga_kita" ? (
            membership?.status === "approved" ? (
              <Link
                href={`/komunitas/${komunitas.id}`}
                className="group flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-bold text-white transition-all hover:bg-blue-800 shadow-xs"
              >
                <span>Lihat Komunitas</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href={`/komunitas/${komunitas.id}`}
                className="group flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-bold text-white transition-all hover:bg-blue-800 shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                <span>Bergabung</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )
          ) : (
            <>
              {membership?.status === "approved" ? (
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className={cn(
                    "group flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-bold text-white transition-all shadow-xs",
                    komunitas.jenis === "posyandu" && "bg-blue-700 hover:bg-blue-800",
                    komunitas.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  <span>Lihat Komunitas</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className="flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-bold text-slate-800 transition-colors hover:bg-slate-50 shadow-xs"
                >
                  <span>Detail</span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
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
                    "flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-bold text-white transition-all shadow-xs cursor-pointer active:scale-98",
                    komunitas.jenis === "posyandu" && "bg-blue-700 hover:bg-blue-800",
                    komunitas.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  <UserPlus className="h-4 w-4" />
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
