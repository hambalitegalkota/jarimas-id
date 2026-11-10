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
  Home,
  AlertTriangle,
} from "lucide-react";
import { UnifiedWargaCard, type WargaTierItem } from "@/components/komunitas/unified-warga-card";
import { ManageGrupMembersModal } from "@/components/kabar/manage-grup-members-modal";
import { getPosyanduCoverageDisplay } from "@/lib/data-anak-helpers";
import type { RegisteredUserItem } from "@/types/database";

function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  isAdminKota?: boolean;
  registeredUsers?: RegisteredUserItem[];
}

export function ProfilKomunitasSection({
  communities,
  wargaKitaSummary,
  currentUserId,
  isSuperAdmin = false,
  isAdminPusat = false,
  isAdminKota = false,
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
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            {isSuperAdmin || isAdminPusat || isAdminKota
              ? "Komunitas Binaan & Dikelola Admin"
              : "Komunitas Saya"}
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
          {totalCardCount} TERDAFTAR
        </span>
      </div>

      {totalCardCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center space-y-4 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-foreground">
              Belum Ada Komunitas Terdaftar
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Jelajahi komunitas di Kota Tegal untuk memantau tumbuh kembang anak, ATS, atau kolaborasi kegiatan.
            </p>
          </div>
          <Link
            href="/komunitas"
            className="inline-flex min-h-[44px] h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-sm font-bold text-primary-foreground transition-all shadow-xs active:scale-98"
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
              isAdminKota ||
              (Boolean(currentUserId) && kom.created_by === currentUserId) ||
              item.peran?.toLowerCase().includes("admin") ||
              item.peran?.toLowerCase().includes("pengurus");

            const isBerjenjangItem =
              cleanName.includes("komunitas posyandu") ||
              cleanName.includes("komunitas paud") ||
              cleanName.startsWith("komunitas") ||
              (typeof item.komunitas_id === "string" && (
                item.komunitas_id.startsWith("kom-posyandu-") ||
                item.komunitas_id.startsWith("kom-paud-")
              ));

            let formattedKomNama = kom.nama || "Komunitas";
            if (kom.jenis === "posyandu") {
              const rawNama = (kom.nama || "").trim();
              if (rawNama.toLowerCase().includes("komunitas posyandu")) {
                formattedKomNama = rawNama.replace(/^(posyandu\s+)+(komunitas\s+posyandu)/i, "$2");
              } else if (rawNama.toLowerCase().startsWith("komunitas")) {
                formattedKomNama = rawNama;
              } else {
                const coreName = rawNama.replace(/^(Posyandu\s*)+/gi, "").trim();
                formattedKomNama = coreName ? `Posyandu ${coreName}` : "Posyandu";
              }
            }

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-4 sm:p-5 space-y-3.5 transition-all shadow-sm ${
                  isOrbitSixty
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {/* Header Kartu Komunitas */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                        {formattedKomNama}
                      </h4>
                      {isOrbitSixty && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 text-amber-950 dark:text-amber-200 border border-secondary/30 px-2.5 py-0.5 text-[11px] font-bold">
                          <Sparkles className="h-3 w-3 text-secondary" />
                          Unggulan Admin
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="font-bold text-primary inline-flex items-center gap-1">
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
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {kom.lokasi ||
                            [kom.kelurahan, kom.kecamatan, "Kota Tegal"]
                              .filter(Boolean)
                              .join(", ") ||
                            "Kota Tegal"}
                        </span>
                      </span>
                      {kom.jenis === "posyandu" && !isBerjenjangItem && (() => {
                        const cov = getPosyanduCoverageDisplay(kom);
                        return cov.isMapped ? (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold px-2 py-0.5 text-xs border border-emerald-200 dark:border-emerald-800">
                              <Home className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>{cov.label}</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-semibold px-2 py-0.5 text-xs border border-amber-200 dark:border-amber-800">
                              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                              <span>Belum Dipetakan</span>
                            </span>
                          </>
                        );
                      })()}
                      {kom.jumlah_anggota !== undefined && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-foreground">
                            {kom.jumlah_anggota} Anggota
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span>AKTIF ({item.peran})</span>
                      </span>
                    )}
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-secondary/30 bg-secondary/15 px-2.5 py-1 text-xs font-bold text-amber-950 dark:text-amber-200">
                        <Clock className="h-3.5 w-3.5 text-secondary" />
                        <span>MENUNGGU ({item.peran})</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                        <span>DITOLAK</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Deskripsi Komunitas */}
                {kom.deskripsi && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic bg-muted/30 p-3 rounded-lg border border-border">
                    &ldquo;{kom.deskripsi}&rdquo;
                  </p>
                )}

                {/* Forum Koordinasi Berjenjang untuk Kader Posyandu */}
                {kom.jenis === "posyandu" && !isBerjenjangItem && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                        Komunitas Berjenjang yang Diikuti (Forum Koordinasi Kader)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300/50">
                        Otomatis Terhubung
                      </span>
                    </div>
                    <p className="text-2xs text-muted-foreground leading-relaxed">
                      Sebagai kader/anggota posyandu ini, Anda terhubung dalam forum koordinasi kader berjenjang tingkat Kelurahan, Kecamatan, dan Kota Tegal:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-xs font-bold">
                      {kom.kelurahan && (
                        <Link
                          href={`/komunitas/kom-posyandu-${slugify(kom.kecamatan || "tegal-timur")}-${slugify(kom.kelurahan)}`}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-foreground group shadow-2xs"
                        >
                          <div className="min-w-0 pr-1">
                            <span className="block text-[10px] font-medium text-muted-foreground uppercase">Tingkat Kelurahan</span>
                            <span className="block truncate text-xs font-bold text-foreground group-hover:text-primary">
                              Kel. {kom.kelurahan}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                      {kom.kecamatan && (
                        <Link
                          href={`/komunitas/kom-posyandu-${slugify(kom.kecamatan)}`}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-foreground group shadow-2xs"
                        >
                          <div className="min-w-0 pr-1">
                            <span className="block text-[10px] font-medium text-muted-foreground uppercase">Tingkat Kecamatan</span>
                            <span className="block truncate text-xs font-bold text-foreground group-hover:text-primary">
                              Kec. {kom.kecamatan}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                      <Link
                        href="/komunitas/kom-posyandu-kota-tegal"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-foreground group shadow-2xs"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="block text-[10px] font-medium text-muted-foreground uppercase">Tingkat Kota</span>
                          <span className="block truncate text-xs font-bold text-foreground group-hover:text-primary">
                            Kota Tegal
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Forum Koordinasi Berjenjang untuk Pendidik Satuan PAUD */}
                {kom.jenis === "satuan_paud" && !isBerjenjangItem && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <School className="h-3.5 w-3.5 text-primary shrink-0" />
                        Komunitas Berjenjang yang Diikuti (Forum Satuan PAUD)
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300/50">
                        Otomatis Terhubung
                      </span>
                    </div>
                    <p className="text-2xs text-muted-foreground leading-relaxed">
                      Sebagai pendidik/anggota satuan PAUD ini, Anda terhubung dalam forum koordinasi berjenjang tingkat Kelurahan, Kecamatan, dan Kota Tegal:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-xs font-bold">
                      {kom.kelurahan && (
                        <Link
                          href={`/komunitas/kom-paud-${slugify(kom.kecamatan || "tegal-timur")}-${slugify(kom.kelurahan)}`}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-foreground group shadow-2xs"
                        >
                          <div className="min-w-0 pr-1">
                            <span className="block text-[10px] font-medium text-muted-foreground uppercase">Tingkat Kelurahan</span>
                            <span className="block truncate text-xs font-bold text-foreground group-hover:text-primary">
                              Kel. {kom.kelurahan}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                      {kom.kecamatan && (
                        <Link
                          href={`/komunitas/kom-paud-${slugify(kom.kecamatan)}`}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-foreground group shadow-2xs"
                        >
                          <div className="min-w-0 pr-1">
                            <span className="block text-[10px] font-medium text-muted-foreground uppercase">Tingkat Kecamatan</span>
                            <span className="block truncate text-xs font-bold text-foreground group-hover:text-primary">
                              Kec. {kom.kecamatan}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                      <Link
                        href="/komunitas/kom-paud-kota-tegal"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-foreground group shadow-2xs"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="block text-[10px] font-medium text-muted-foreground uppercase">Tingkat Kota</span>
                          <span className="block truncate text-xs font-bold text-foreground group-hover:text-primary">
                            Kota Tegal
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Tambah Anggota, Percakapan, dan Buka Halaman */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                  {/* Tombol Tambah Anggota (Untuk Admin / Pembuat Grup / Super Admin) */}
                  {canManageThisCommunity && (
                    <button
                      type="button"
                      onClick={() => setSelectedManageCommunity(item)}
                      className="inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs sm:text-sm font-bold text-primary-foreground transition-all shadow-xs active:scale-98 cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Tambah Anggota</span>
                    </button>
                  )}

                  {/* Tombol Obrolan Grup Percakapan (Untuk Kegiatan) */}
                  {isKegiatan && (
                    <Link
                      href={`/kabar?tab=percakapan&groupId=${item.komunitas_id}`}
                      className="inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 text-xs sm:text-sm font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer active:scale-98"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Obrolan Grup</span>
                    </Link>
                  )}

                  {/* Tombol Buka Halaman Komunitas */}
                  <Link
                    href={`/komunitas/${item.komunitas_id}`}
                    className="inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-lg bg-card border border-border px-4 text-xs sm:text-sm font-bold text-foreground hover:bg-muted transition-all cursor-pointer active:scale-98"
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
              className="flex min-h-[44px] h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground transition-all hover:border-primary/40 hover:bg-muted/40 active:scale-98 shadow-xs"
            >
              <Compass className="h-4 w-4 text-primary" />
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
