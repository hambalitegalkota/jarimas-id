"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Calendar,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  Info,
  Baby,
  ArrowRight,
  Loader2,
  X,
  Send,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { WargaOnboardingModal } from "@/components/komunitas/warga-onboarding-modal";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { applyForAdminKomunitas } from "@/app/actions/komunitas";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  KabarItem,
  HierarchyAdminTierInfo,
  WargaHierarchyAdmins,
} from "@/types/database";
import { cn } from "@/lib/utils";

interface KomunitasDetailClientViewProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
  isAdminOrKader: boolean;
  currentSubtab: string;
  anggotaList: AnggotaKomunitasDetail[];
  kabarKomunitas: KabarItem[];
}

export function KomunitasDetailClientView({
  komunitas,
  currentUserId,
  isAdminOrKader,
  currentSubtab,
  anggotaList,
  kabarKomunitas,
}: KomunitasDetailClientViewProps) {
  const [activeTab, setActiveTab] = useState(currentSubtab || "kabar");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [membershipState, setMembershipState] = useState(komunitas.currentUserMembership);
  const [isWargaOnboardingOpen, setIsWargaOnboardingOpen] = useState(
    komunitas.jenis === "warga_kita" &&
      (!komunitas.currentUserMembership ||
        komunitas.currentUserMembership.status !== "approved")
  );

  const hierarchyList: HierarchyAdminTierInfo[] = komunitas.hierarchyAdminList || [];
  const hierarchyAdmins: WargaHierarchyAdmins | null = komunitas.hierarchyAdmins || null;
  const vacantTiers = hierarchyList.filter((t) => !t.hasAdmin);
  const firstVacantTier = vacantTiers[0];

  // State untuk modal Ajukan Diri Sebagai Admin
  const [isApplyAdminOpen, setIsApplyAdminOpen] = useState(false);
  const [selectedTierKomunitasId, setSelectedTierKomunitasId] = useState<string>(
    firstVacantTier?.komunitasId || komunitas.id
  );
  const [adminHp, setAdminHp] = useState("");
  const [adminCatatan, setAdminCatatan] = useState("");
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [isSubmittingAdmin, startSubmitAdmin] = useTransition();

  const membership = membershipState;
  const approvedMembers = anggotaList.filter((m) => m.status === "approved");

  const handleApplyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFeedback(null);

    startSubmitAdmin(async () => {
      const targetId = selectedTierKomunitasId || komunitas.id;
      const res = await applyForAdminKomunitas({
        komunitasId: targetId,
        nomorHp: adminHp,
        catatan: adminCatatan,
      });

      if (res.success) {
        setAdminFeedback(res.message || "Pengajuan Anda telah berhasil dikirim!");
        setMembershipState((prev) =>
          prev
            ? { ...prev, peran_diajukan: "Pengurus" }
            : {
                id: `mem-${Date.now()}`,
                status: "approved",
                peran: "Pengunjung",
                peran_diajukan: "Pengurus",
              }
        );
        setTimeout(() => {
          setIsApplyAdminOpen(false);
          setAdminFeedback(null);
          window.location.reload();
        }, 2000);
      } else {
        setAdminFeedback(res.message || "Gagal mengirim pengajuan admin.");
      }
    });
  };

  return (
    <>
      {/* 1. HERO HEADER CARD */}
      <section className="relative overflow-hidden rounded-lg border border-border bg-card p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-zinc-900 font-bold",
                komunitas.jenis === "warga_kita" && "text-emerald-400",
                komunitas.jenis === "posyandu" && "text-emerald-400",
                komunitas.jenis === "satuan_paud" && "text-cyan-400"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-6 w-6 stroke-[1.75px]" />}
              {komunitas.jenis === "posyandu" && <Sparkles className="h-6 w-6 stroke-[1.75px]" />}
              {komunitas.jenis === "satuan_paud" && <Building2 className="h-6 w-6 stroke-[1.75px]" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="cyber-badge uppercase font-mono">
                  {komunitas.jenis.replace("_", " ")}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {komunitas.jumlah_anggota} ANGGOTA
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {komunitas.nama}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{komunitas.kelurahan || "Tegal"}, {komunitas.kecamatan || "Kota Tegal"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Link to Data Anak 0-7 Tahun */}
        <Link
          href={`/komunitas/${komunitas.id}/data`}
          className="flex items-center justify-between rounded-md bg-card border border-border p-4 text-xs transition-all hover:bg-muted/60 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-emerald-600 dark:text-emerald-400">
              <Baby className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold tracking-tight text-foreground block font-mono">
                DATA ANAK 0–7 TAHUN &amp; DDKS
              </span>
              <span className="text-[11px] text-muted-foreground">
                Lihat catatan antropometri, tumbuh kembang, dan riwayat penimbangan
              </span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        {/* User Status / Action Button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border">
          {membership ? (
            <div className="flex flex-wrap items-center gap-2">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-mono text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>TERKONFIRMASI: {membership.peran.toUpperCase()}</span>
                </span>
              )}

              {/* Tampilkan indikator jika pengguna sedang mengajukan status lain */}
              {membership.peran_diajukan && membership.peran_diajukan.toLowerCase() !== membership.peran.toLowerCase() && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-mono text-amber-400 border border-amber-500/30">
                  <Clock className="h-3.5 w-3.5" />
                  <span>MENUNGGU PERSETUJUAN ADMIN: {membership.peran_diajukan.toUpperCase()}</span>
                </span>
              )}

              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-mono text-amber-400 border border-amber-500/30">
                  <Clock className="h-3.5 w-3.5" />
                  <span>MENUNGGU VERIFIKASI: {membership.peran.toUpperCase()}</span>
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (!currentUserId) {
                  window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                  return;
                }
                if (komunitas.jenis === "warga_kita") {
                  setIsWargaOnboardingOpen(true);
                } else {
                  setIsJoinModalOpen(true);
                }
              }}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all active:scale-95 hover:bg-zinc-200 border border-zinc-700"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{komunitas.jenis === "warga_kita" ? "BERGABUNG" : "MINTA BERGABUNG"}</span>
            </button>
          )}

          {isAdminOrKader && (
            <Link
              href={`/komunitas/${komunitas.id}/anggota`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-900 border border-border px-3 text-xs font-mono text-foreground transition-all hover:bg-zinc-800"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>KELOLA PERMOHONAN</span>
            </Link>
          )}
        </div>
      </section>

      {/* 1.1 STRUKTUR KEPENGURUSAN ADMIN BERJENJANG (RT, RW, KELURAHAN, KECAMATAN) */}
      {komunitas.jenis === "warga_kita" && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
                  Struktur Kepengurusan Admin Wilayah Berjenjang
                </h4>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {komunitas.kelurahan ? `${komunitas.kelurahan}, ` : ""}{komunitas.kecamatan || "Kota Tegal"}
                </p>
              </div>
            </div>

            {vacantTiers.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (!currentUserId) {
                    window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                    return;
                  }
                  if (firstVacantTier) {
                    setSelectedTierKomunitasId(firstVacantTier.komunitasId);
                  }
                  setIsApplyAdminOpen(true);
                }}
                className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-xs font-mono font-bold text-black shadow-sm transition-all hover:bg-amber-400 active:scale-95 shrink-0"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Ajukan Diri Sebagai Admin</span>
              </button>
            ) : (
              <div className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 text-xs font-mono font-semibold text-emerald-400 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Admin Wilayah Lengkap</span>
              </div>
            )}
          </div>

          {/* 4 Tiers Display: RT, RW, Kelurahan, Kecamatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Admin RT */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                    1. Admin RT {komunitas.rt ? `(${komunitas.rt})` : ""}
                  </span>
                  {hierarchyAdmins?.rt?.hasAdmin ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Terisi
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Kosong
                    </span>
                  )}
                </div>
                <div className="pt-0.5">
                  {hierarchyAdmins?.rt?.adminName ? (
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{hierarchyAdmins.rt.adminName}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-400/90 font-mono leading-tight">
                      Komunitas Belum Memiliki Admin / Pengurus
                    </p>
                  )}
                </div>
              </div>
              {!hierarchyAdmins?.rt?.hasAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUserId) {
                      window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                      return;
                    }
                    if (hierarchyAdmins?.rt) {
                      setSelectedTierKomunitasId(hierarchyAdmins.rt.komunitasId);
                    }
                    setIsApplyAdminOpen(true);
                  }}
                  className="w-full mt-1 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-mono font-semibold transition-all text-center"
                >
                  + Ajukan Admin RT
                </button>
              )}
            </div>

            {/* 2. Admin RW */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                    2. Admin RW {komunitas.rw ? `(${komunitas.rw})` : ""}
                  </span>
                  {hierarchyAdmins?.rw?.hasAdmin ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Terisi
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Kosong
                    </span>
                  )}
                </div>
                <div className="pt-0.5">
                  {hierarchyAdmins?.rw?.adminName ? (
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{hierarchyAdmins.rw.adminName}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-400/90 font-mono leading-tight">
                      Komunitas Belum Memiliki Admin / Pengurus
                    </p>
                  )}
                </div>
              </div>
              {!hierarchyAdmins?.rw?.hasAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUserId) {
                      window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                      return;
                    }
                    if (hierarchyAdmins?.rw) {
                      setSelectedTierKomunitasId(hierarchyAdmins.rw.komunitasId);
                    }
                    setIsApplyAdminOpen(true);
                  }}
                  className="w-full mt-1 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-mono font-semibold transition-all text-center"
                >
                  + Ajukan Admin RW
                </button>
              )}
            </div>

            {/* 3. Admin Kelurahan */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                    3. Admin Kelurahan {komunitas.kelurahan ? `(${komunitas.kelurahan})` : ""}
                  </span>
                  {hierarchyAdmins?.kelurahan?.hasAdmin ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Terisi
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Kosong
                    </span>
                  )}
                </div>
                <div className="pt-0.5">
                  {hierarchyAdmins?.kelurahan?.adminName ? (
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{hierarchyAdmins.kelurahan.adminName}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-400/90 font-mono leading-tight">
                      Komunitas Belum Memiliki Admin / Pengurus
                    </p>
                  )}
                </div>
              </div>
              {!hierarchyAdmins?.kelurahan?.hasAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUserId) {
                      window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                      return;
                    }
                    if (hierarchyAdmins?.kelurahan) {
                      setSelectedTierKomunitasId(hierarchyAdmins.kelurahan.komunitasId);
                    }
                    setIsApplyAdminOpen(true);
                  }}
                  className="w-full mt-1 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-mono font-semibold transition-all text-center"
                >
                  + Ajukan Admin Kelurahan
                </button>
              )}
            </div>

            {/* 4. Admin Kecamatan */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                    4. Admin Kecamatan {komunitas.kecamatan ? `(${komunitas.kecamatan})` : ""}
                  </span>
                  {hierarchyAdmins?.kecamatan?.hasAdmin ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Terisi
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Kosong
                    </span>
                  )}
                </div>
                <div className="pt-0.5">
                  {hierarchyAdmins?.kecamatan?.adminName ? (
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{hierarchyAdmins.kecamatan.adminName}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-400/90 font-mono leading-tight">
                      Komunitas Belum Memiliki Admin / Pengurus
                    </p>
                  )}
                </div>
              </div>
              {!hierarchyAdmins?.kecamatan?.hasAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUserId) {
                      window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                      return;
                    }
                    if (hierarchyAdmins?.kecamatan) {
                      setSelectedTierKomunitasId(hierarchyAdmins.kecamatan.komunitasId);
                    }
                    setIsApplyAdminOpen(true);
                  }}
                  className="w-full mt-1 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-mono font-semibold transition-all text-center"
                >
                  + Ajukan Admin Kecamatan
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ALERT UNTUK POSYANDU & PAUD JIKA BELUM ADA ADMIN */}
      {komunitas.jenis !== "warga_kita" && !komunitas.hasAdmin && (
        <section className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-400 mt-0.5">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                  Komunitas Belum Memiliki Admin / Pengurus
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lembaga/Posyandu ini belum memiliki Admin/Kader resmi untuk mengelola data anggota dan kegiatan.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUserId) {
                  window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                  return;
                }
                setSelectedTierKomunitasId(komunitas.id);
                setIsApplyAdminOpen(true);
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-xs font-mono font-bold text-black shadow-sm transition-all hover:bg-amber-400 active:scale-95 shrink-0"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Ajukan Diri Sebagai Admin</span>
            </button>
          </div>
        </section>
      )}

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex rounded-md bg-zinc-900 p-1 border border-border">
        <button
          onClick={() => setActiveTab("kabar")}
          className={cn(
            "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-semibold transition-all",
            activeTab === "kabar"
              ? "bg-card text-foreground border border-zinc-700 shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>KABAR ({kabarKomunitas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("anggota")}
          className={cn(
            "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-semibold transition-all",
            activeTab === "anggota"
              ? "bg-card text-foreground border border-zinc-700 shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          <span>ANGGOTA ({approvedMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={cn(
            "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-semibold transition-all",
            activeTab === "data"
              ? "bg-card text-foreground border border-zinc-700 shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Info className="h-3.5 w-3.5" />
          <span>PROFIL DATA</span>
        </button>
      </div>

      {/* 3. SUB-TAB CONTENT */}
      {/* Subtab: KABAR KOMUNITAS */}
      {activeTab === "kabar" && (
        <section className="space-y-4 pb-16">
          {kabarKomunitas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-zinc-900 text-muted-foreground">
                <MessageSquare className="h-6 w-6 stroke-[1.5px]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                  BELUM ADA KABAR KOMUNITAS
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bagikan pengumuman atau jadwal kegiatan pertama untuk komunitas ini.
                </p>
              </div>
            </div>
          ) : (
            kabarKomunitas.map((kabar) => (
              <KabarCard
                key={kabar.id}
                kabar={kabar}
                currentUserId={currentUserId}
                isSuperAdmin={isAdminOrKader}
              />
            ))
          )}

          {/* Floating Create Modal */}
          <CreateKabarModal currentUserId={currentUserId} />
        </section>
      )}

      {/* Subtab: DAFTAR ANGGOTA */}
      {activeTab === "anggota" && (
        <section className="space-y-3 pb-16">
          {approvedMembers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-xs font-mono text-muted-foreground">
              BELUM ADA ANGGOTA TERDAFTAR SECARA DARING
            </div>
          ) : (
            <div className="space-y-2">
              {approvedMembers.map((member) => {
                const name = member.profiles?.nama_lengkap || "Warga Komunitas";
                const initial = name.charAt(0).toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-zinc-900 text-foreground font-mono font-bold text-xs">
                        {initial}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {name}
                        </h4>
                        <p className="text-xs font-mono text-muted-foreground">
                          {member.profiles?.email || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-mono text-muted-foreground border border-border">
                        {member.peran}
                      </span>
                      {member.peran_diajukan && (
                        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/30">
                          Diajukan: {member.peran_diajukan}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Subtab: DATA KOMUNITAS */}
      {activeTab === "data" && (
        <section className="space-y-4 pb-16">
          {/* Card Direct to Data Anak */}
          <div className="rounded-lg border border-border bg-card p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-zinc-900 text-emerald-400">
                <Baby className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground font-mono">
                  DATA ANAK 0–7 TAHUN TERDAFTAR
                </h4>
                <p className="text-xs text-muted-foreground">
                  Kelola pendaftaran balita, riwayat DDKS, dan validasi data.
                </p>
              </div>
            </div>
            <Link
              href={`/komunitas/${komunitas.id}/data`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground border border-zinc-700 px-4 text-xs font-mono font-bold text-background transition-all hover:bg-zinc-200 shrink-0"
            >
              <span>BUKA DATA</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Informasi Resmi &amp; Operasional
            </h3>

            <div className="space-y-3 text-xs">
              {/* Alamat Lengkap */}
              <div className="flex items-start gap-3 p-3.5 rounded-md bg-muted/40 border border-border">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-mono text-muted-foreground text-[11px] block">ALAMAT LOKASI</span>
                  <p className="text-foreground leading-relaxed">
                    {komunitas.lokasi}
                  </p>
                </div>
              </div>

              {/* Jadwal Kegiatan */}
              {komunitas.jadwal && (
                <div className="flex items-start gap-3 p-3.5 rounded-md bg-muted/40 border border-border">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-mono text-muted-foreground text-[11px] block">JADWAL LAYANAN</span>
                    <p className="text-foreground leading-relaxed">
                      {komunitas.jadwal}
                    </p>
                  </div>
                </div>
              )}

              {/* Kontak */}
              {komunitas.kontak && (
                <div className="flex items-start gap-3 p-3.5 rounded-md bg-muted/40 border border-border">
                  <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-mono text-muted-foreground text-[11px] block">KONTAK RESMI</span>
                    <p className="text-foreground leading-relaxed">
                      {komunitas.kontak}
                    </p>
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              {komunitas.deskripsi && (
                <div className="flex items-start gap-3 p-3.5 rounded-md bg-muted/40 border border-border">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-mono text-muted-foreground text-[11px] block">PROFIL &amp; VISI</span>
                    <p className="text-foreground leading-relaxed">
                      {komunitas.deskripsi}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Modal Join Reguler (Posyandu & Satuan PAUD) */}
      <JoinKomunitasModal
        komunitas={komunitas}
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Modal Onboarding Khusus Komunitas Warga */}
      {komunitas.jenis === "warga_kita" && (
        <WargaOnboardingModal
          komunitas={komunitas}
          isOpen={isWargaOnboardingOpen}
          onClose={() => setIsWargaOnboardingOpen(false)}
          onSuccess={(newMembership, peranDiajukan) => {
            setMembershipState({
              id: newMembership?.id || `mem-${Date.now()}`,
              status: "approved",
              peran: "Pengunjung",
              peran_diajukan: peranDiajukan || null,
            });
            setIsWargaOnboardingOpen(false);
          }}
          currentUserId={currentUserId}
        />
      )}

      {/* Modal Ajukan Diri Sebagai Admin */}
      {isApplyAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>PENGAJUAN ADMIN BERJENJANG</span>
                </div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  Ajukan Diri Sebagai Admin Komunitas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyAdminOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Pilih posisi tingkatan admin wilayah yang masih kosong untuk diajukan. Pengajuan akan diverifikasi oleh Admin satu tingkat di atasnya (atau Super Admin).
            </p>

            <form onSubmit={handleApplyAdmin} className="space-y-4 pt-1">
              {/* Pilihan Tingkatan Admin yang Kosong / Dapat Diajukan (Satu Komunitas Satu Admin) */}
              {komunitas.jenis === "warga_kita" && (
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase block font-semibold">
                    Pilih Posisi Admin yang Ingin Diajukan (Satu Komunitas Satu Admin):
                  </label>

                  {vacantTiers.length > 0 ? (
                    <div className="space-y-2">
                      {vacantTiers.map((tier) => {
                        const isSelected = selectedTierKomunitasId === tier.komunitasId;
                        const isPendingByUser = tier.userStatusAtTier?.peran_diajukan === "Pengurus";

                        return (
                          <button
                            key={tier.komunitasId}
                            type="button"
                            onClick={() => setSelectedTierKomunitasId(tier.komunitasId)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3",
                              isSelected
                                ? "border-amber-500/60 bg-amber-500/10 shadow-xs"
                                : "border-border bg-card hover:border-border/80 hover:bg-muted/20"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-4 w-4 shrink-0 rounded-full border items-center justify-center",
                                  isSelected
                                    ? "border-amber-500 bg-amber-500 text-black"
                                    : "border-muted-foreground/40 bg-transparent"
                                )}
                              >
                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-foreground font-mono">
                                  {tier.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">
                                  {tier.komunitasNama}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {isPendingByUser ? (
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⏳ Sedang Diajukan
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  🟢 Posisi Kosong
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-center space-y-1">
                      <p className="text-xs font-semibold text-emerald-400 font-mono">
                        Seluruh Posisi Admin Wilayah Telah Terisi
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Sesuai aturan satu komunitas satu admin, posisi admin yang sudah terisi tidak dapat diajukan lagi.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Form input data hanya aktif jika masih ada posisi kosong (atau untuk komunitas non-warga) */}
              {(komunitas.jenis !== "warga_kita" || vacantTiers.length > 0) && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-muted-foreground uppercase">
                      Nomor WhatsApp / HP Aktif
                    </label>
                    <input
                      type="tel"
                      value={adminHp}
                      onChange={(e) => setAdminHp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      required
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-muted-foreground uppercase">
                      Alasan / Posisi di Lingkungan (Opsional)
                    </label>
                    <textarea
                      value={adminCatatan}
                      onChange={(e) => setAdminCatatan(e.target.value)}
                      placeholder="Misal: Saya Ketua RT / Pengurus RW / Tokoh warga setempat"
                      rows={2}
                      className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-sans text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                </>
              )}

              {adminFeedback && (
                <p className="text-xs font-mono text-center text-emerald-400">
                  {adminFeedback}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyAdminOpen(false)}
                  className="flex-1 h-9 rounded-md border border-border text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {komunitas.jenis === "warga_kita" && vacantTiers.length === 0 ? "Tutup" : "Batal"}
                </button>
                {(komunitas.jenis !== "warga_kita" || vacantTiers.length > 0) && (
                  <button
                    type="submit"
                    disabled={isSubmittingAdmin || !selectedTierKomunitasId}
                    className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3 text-xs font-mono font-bold text-black hover:bg-amber-400 disabled:opacity-50"
                  >
                    {isSubmittingAdmin ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Kirim Pengajuan</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
