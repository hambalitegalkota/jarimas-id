"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  UserPlus,
  MessageCircle,
  Compass,
  Users,
  Sparkles,
  School,
  ExternalLink,
} from "lucide-react";
import { UnifiedWargaCard, type WargaTierItem } from "@/components/komunitas/unified-warga-card";
import { ManageGrupMembersModal } from "@/components/kabar/manage-grup-members-modal";
import type { RegisteredUserItem } from "@/types/database";

export interface ProfilCommunityItem {
  id: string;
  komunitas_id: string;
  peran: string;
  raw_peran?: string;
  peran_diajukan?: string | null;
  status: "approved" | "pending" | "rejected";
  created_at?: string;
  komunitas: {
    id: string;
    nama: string;
    jenis: string;
    kecamatan?: string | null;
    kelurahan?: string | null;
    rw?: string | null;
    rt?: string | null;
    lokasi?: string | null;
    deskripsi?: string | null;
    created_by?: string | null;
    jumlah_anggota?: number;
  };
}

interface ProfilKomunitasSectionProps {
  communities: ProfilCommunityItem[];
  wargaKitaSummary?: {
    title: string;
    lokasi: string;
    highestRole: string;
    highestStatus: "approved" | "pending" | "rejected";
    primaryKomunitasId: string;
    tiers: WargaTierItem[];
  } | null;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
  isAdminPusat?: boolean;
  registeredUsers?: RegisteredUserItem[];
}

export function ProfilKomunitasSection({
  communities,
  wargaKitaSummary,
  currentUserId,
  isSuperAdmin = false,
  isAdminPusat = false,
  registeredUsers = [],
}: ProfilKomunitasSectionProps) {
  const router = useRouter();
  const [selectedManageCommunity, setSelectedManageCommunity] = useState<ProfilCommunityItem | null>(null);

  const wargaCommunities = communities.filter(
    (c) => c.komunitas.jenis === "warga_kita"
  );
  const nonWargaCommunities = communities.filter(
    (c) => c.komunitas.jenis !== "warga_kita"
  );

  const totalCardCount = (wargaKitaSummary ? 1 : 0) + nonWargaCommunities.length;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {isSuperAdmin || isAdminPusat
              ? "Komunitas Binaan & Dikelola Admin"
              : "Komunitas Saya"}
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
          {totalCardCount} TERDAFTAR
        </span>
      </div>

      {totalCardCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4 shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Compass className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Belum Ada Komunitas Terdaftar
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Jelajahi komunitas di Kota Tegal untuk memantau tumbuh kembang anak, ATS, atau kolaborasi kegiatan.
            </p>
          </div>
          <Link
            href="/komunitas"
            className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 text-base font-bold text-white transition-all shadow-sm active:scale-98"
          >
            <span>Jelajahi Komunitas</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Kartu Rangkuman Warga Kita (Jika Ada) */}
          {wargaKitaSummary && (
            <UnifiedWargaCard
              title={wargaKitaSummary.title}
              lokasi={wargaKitaSummary.lokasi}
              highestRole={wargaKitaSummary.highestRole}
              highestStatus={wargaKitaSummary.highestStatus}
              primaryKomunitasId={wargaKitaSummary.primaryKomunitasId}
              tiers={wargaKitaSummary.tiers}
            />
          )}

          {/* 2. Kartu Komunitas Non-Warga (Kegiatan, The Orbit Sixty, Posyandu, Satuan PAUD) */}
          {nonWargaCommunities.map((item) => {
            const kom = item.komunitas || {};
            const cleanName = (kom.nama || "").toLowerCase();
            const isOrbitSixty =
              kom.id === "6b73e2b8-e708-4d31-a467-333b068b4fd8" ||
              cleanName.includes("the orbit sixty") ||
              cleanName.includes("orbit sixty");

            const isKegiatan = kom.jenis === "kegiatan" || isOrbitSixty;
            const canManageThisCommunity =
              isSuperAdmin ||
              isAdminPusat ||
              (Boolean(currentUserId) && kom.created_by === currentUserId) ||
              item.peran?.toLowerCase().includes("admin") ||
              item.peran?.toLowerCase().includes("pengurus");

            let formattedKomNama = kom.nama || "Komunitas";
            if (kom.jenis === "posyandu") {
              const coreName = (kom.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
              formattedKomNama = coreName ? `Posyandu ${coreName}` : "Posyandu";
            }

            return (
              <div
                key={item.id}
                className={`rounded-2xl border-2 p-5 space-y-4 transition-all shadow-xs ${
                  isOrbitSixty
                    ? "border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 ring-2 ring-emerald-500/10"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700"
                }`}
              >
                {/* Header Kartu Komunitas */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                        {formattedKomNama}
                      </h4>
                      {isOrbitSixty && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-2xs">
                          <Sparkles className="h-3 w-3" />
                          Unggulan Admin
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                        {isKegiatan ? (
                          <>
                            <Users className="h-3.5 w-3.5" />
                            <span>Grup Kegiatan {isOrbitSixty ? "(Penanganan ATS)" : ""}</span>
                          </>
                        ) : kom.jenis === "posyandu" ? (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Posyandu</span>
                          </>
                        ) : kom.jenis === "satuan_paud" ? (
                          <>
                            <School className="h-3.5 w-3.5" />
                            <span>Satuan PAUD</span>
                          </>
                        ) : (
                          <span>{kom.jenis || "Komunitas"}</span>
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>
                          {kom.lokasi ||
                            [kom.kelurahan, kom.kecamatan, "Kota Tegal"]
                              .filter(Boolean)
                              .join(", ") ||
                            "Kota Tegal"}
                        </span>
                      </span>
                      {kom.jumlah_anggota !== undefined && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {kom.jumlah_anggota} Anggota
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>AKTIF ({item.peran})</span>
                      </span>
                    )}
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>MENUNGGU ({item.peran})</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span>DITOLAK</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Deskripsi Komunitas */}
                {kom.deskripsi && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    &ldquo;{kom.deskripsi}&rdquo;
                  </p>
                )}

                {/* Action Buttons: Tambah Anggota, Percakapan, dan Buka Halaman */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                  {/* Tombol Tambah Anggota (Untuk Admin / Pembuat Grup / Super Admin) */}
                  {canManageThisCommunity && (
                    <button
                      type="button"
                      onClick={() => setSelectedManageCommunity(item)}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-xs sm:text-sm font-extrabold text-white transition-all shadow-sm shadow-emerald-600/20 active:scale-98 cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Tambah Anggota</span>
                    </button>
                  )}

                  {/* Tombol Obrolan Grup Percakapan (Untuk Kegiatan) */}
                  {isKegiatan && (
                    <Link
                      href={`/kabar?tab=percakapan&groupId=${item.komunitas_id}`}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-4 text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer active:scale-98"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Obrolan Grup</span>
                    </Link>
                  )}

                  {/* Tombol Buka Halaman Komunitas */}
                  <Link
                    href={`/komunitas/${item.komunitas_id}`}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all cursor-pointer active:scale-98"
                  >
                    <span>Buka Halaman</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Action Button: Explore More Communities */}
          <div className="pt-2">
            <Link
              href="/komunitas"
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 transition-all hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 active:scale-98 shadow-xs"
            >
              <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Jelajahi Komunitas Lainnya</span>
            </Link>
          </div>
        </div>
      )}

      {/* Modal Tambah & Kelola Anggota Komunitas */}
      {selectedManageCommunity && (
        <ManageGrupMembersModal
          isOpen={!!selectedManageCommunity}
          onClose={() => setSelectedManageCommunity(null)}
          room={{
            id: selectedManageCommunity.komunitas.id || selectedManageCommunity.komunitas_id,
            nama: selectedManageCommunity.komunitas.nama,
            jenis: selectedManageCommunity.komunitas.jenis,
            deskripsi: selectedManageCommunity.komunitas.deskripsi,
            jumlah_anggota: selectedManageCommunity.komunitas.jumlah_anggota || 0,
            is_kegiatan:
              selectedManageCommunity.komunitas.jenis === "kegiatan" ||
              selectedManageCommunity.komunitas.id === "6b73e2b8-e708-4d31-a467-333b068b4fd8",
          }}
          allUsers={registeredUsers}
          canManage={true}
          currentUserId={currentUserId || null}
          initialTab="undang"
          onMembersUpdated={() => {
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
