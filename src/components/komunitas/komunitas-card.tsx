"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Compass,
  AlertCircle,
  Eye,
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
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isWargaModalOpen, setIsWargaModalOpen] = useState(false);
  const [showVisitConfirmModal, setShowVisitConfirmModal] = useState(false);

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
    if (!formattedTitle.startsWith("Posyandu")) {
      formattedTitle = `Posyandu ${komunitas.nama}`;
    }
  } else if (komunitas.jenis === "satuan_paud") {
    formattedTitle = komunitas.nama;
  }

  // Handler Klik Tombol Berkunjung untuk Warga Kita
  const handleWargaVisitClick = () => {
    if (isApprovedMember) {
      // Jika pengguna sudah bergabung, langsung buka halaman komunitas
      router.push(`/komunitas/${komunitas.id}`);
    } else {
      // Jika belum bergabung, munculkan dialog konfirmasi
      setShowVisitConfirmModal(true);
    }
  };

  return (
    <>
      <div className={cn(
        "rounded-2xl border-2 p-5 sm:p-6 space-y-4 shadow-xs transition-all hover:shadow-md bg-white dark:bg-slate-900",
        komunitas.jenis === "warga_kita" && "border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500",
        komunitas.jenis === "posyandu" && "border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500",
        komunitas.jenis === "satuan_paud" && "border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500"
      )}>
        {/* Header Title & Badge Tipe */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold border-2 shadow-2xs",
                komunitas.jenis === "warga_kita" &&
                  "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                komunitas.jenis === "posyandu" &&
                  "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                komunitas.jenis === "satuan_paud" &&
                  "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-6 w-6" />}
              {komunitas.jenis === "posyandu" && <Sparkles className="h-6 w-6" />}
              {komunitas.jenis === "satuan_paud" && <Building2 className="h-6 w-6" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {formattedTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  {komunitas.kelurahan && komunitas.kelurahan !== "Semua Kelurahan"
                    ? `${komunitas.kelurahan}, ${komunitas.kecamatan || "Kota Tegal"}`
                    : komunitas.kecamatan && komunitas.kecamatan !== "Kota Tegal"
                    ? `Kecamatan ${komunitas.kecamatan}, Kota Tegal`
                    : "Kota Tegal, Jawa Tengah"}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{komunitas.jumlah_anggota} Anggota</span>
              </div>
            </div>
          </div>

          {/* Membership Status Badge */}
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

        {/* Deskripsi & Jadwal */}
        {komunitas.deskripsi && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {komunitas.deskripsi}
          </p>
        )}

        {komunitas.jadwal && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate font-semibold">{komunitas.jadwal}</span>
          </div>
        )}

        {/* Status Admin Komunitas */}
        {komunitas.hasAdmin && komunitas.adminName ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 px-3.5 py-2 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              Pengurus: <strong className="font-bold text-slate-900 dark:text-slate-100">{komunitas.adminName}</strong>
              {komunitas.adminRole ? ` (${komunitas.adminRole})` : ""}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 px-3.5 py-2 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="font-semibold">Belum Memiliki Admin / Pengurus</span>
          </div>
        )}

        {/* Action Buttons Bar - Harmonious & Unified */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
          {komunitas.jenis === "warga_kita" ? (
            <button
              type="button"
              onClick={handleWargaVisitClick}
              className="group flex flex-1 min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-extrabold text-white transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Berkunjung</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <>
              {membership?.status === "approved" ? (
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className="group flex flex-1 min-h-[46px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-white transition-all shadow-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <span>Lihat Komunitas</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className="flex flex-1 min-h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-extrabold text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
                >
                  <span>Detail</span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </Link>
              )}

              {!membership && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUserId) {
                      window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                      return;
                    }
                    setIsJoinModalOpen(true);
                  }}
                  className="flex flex-1 min-h-[46px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-white transition-all shadow-xs cursor-pointer active:scale-98 bg-emerald-600 hover:bg-emerald-700"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Gabung</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Dialog: Anda Tidak Bergabung di Komunitas Ini, Lanjut Berkunjung? */}
      {showVisitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-600 font-bold">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 leading-tight">
                  Kunjungan Komunitas
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {komunitas.nama}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-4 space-y-1 text-slate-800">
              <p className="text-sm font-bold text-emerald-950">
                Anda tidak bergabung di komunitas ini, lanjut berkunjung?
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sebagai Pengunjung, Anda dapat melihat Kabar, Anggota, serta visualisasi Grafik dan Chart di Profil Data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowVisitConfirmModal(false)}
                className="min-h-[44px] px-4 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVisitConfirmModal(false);
                  setIsWargaModalOpen(true);
                }}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Bergabung</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVisitConfirmModal(false);
                  router.push(`/komunitas/${komunitas.id}`);
                }}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <Eye className="h-4 w-4" />
                <span>Lanjut Berkunjung</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PopUp Isian Bergabung Warga Kita (Survey KK & Domisili) */}
      {isWargaModalOpen && (
        <WargaOnboardingModal
          komunitas={komunitas}
          isOpen={isWargaModalOpen}
          onClose={() => setIsWargaModalOpen(false)}
          currentUserId={currentUserId}
          onSuccess={() => {
            setIsWargaModalOpen(false);
            router.push(`/komunitas/${komunitas.id}`);
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
