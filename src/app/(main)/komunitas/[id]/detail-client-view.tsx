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
  GraduationCap,
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

  // State untuk modal Ajukan Diri Sebagai Admin
  const [isApplyAdminOpen, setIsApplyAdminOpen] = useState(false);
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
      const res = await applyForAdminKomunitas({
        komunitasId: komunitas.id,
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
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 font-bold",
                komunitas.jenis === "warga_kita" && "text-emerald-500 dark:text-emerald-400",
                komunitas.jenis === "posyandu" && "text-cyan-500 dark:text-cyan-400",
                komunitas.jenis === "satuan_paud" && "text-amber-500 dark:text-amber-400"
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

              {/* Tampilkan indikator jika pengguna sedang mengajukan status lain (hanya jika bukan Admin/Kader) */}
              {membership.peran_diajukan &&
                membership.peran_diajukan.toLowerCase() !== membership.peran.toLowerCase() &&
                !isAdminOrKader && (
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
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 cursor-pointer",
                komunitas.jenis === "warga_kita" && "bg-emerald-600 hover:bg-emerald-500",
                komunitas.jenis === "posyandu" && "bg-blue-600 hover:bg-blue-500",
                komunitas.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-500"
              )}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{komunitas.jenis === "warga_kita" ? "BERGABUNG" : "MINTA BERGABUNG"}</span>
            </button>
          )}

          {isAdminOrKader && (
            <Link
              href={`/komunitas/${komunitas.id}/anggota`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-medium text-foreground transition-all hover:bg-muted shadow-xs"
            >
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span>KELOLA PERMOHONAN</span>
            </Link>
          )}
        </div>
      </section>

      {/* INFORMASI ADMIN / PENGURUS KOMUNITAS (JIKA SUDAH ADA ADMIN) */}
      {komunitas.hasAdmin && (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 mt-0.5">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                    Admin / Pengurus Resmi Terdaftar
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{komunitas.adminName || "Pengurus Resmi Komunitas"}</span>
                  {komunitas.adminRole && (
                    <span className="text-muted-foreground font-mono font-normal">
                      • {komunitas.adminRole}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pengurus resmi yang mengelola verifikasi anggota, jadwal kegiatan, dan layanan komunitas.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ALERT JIKA BELUM MEMILIKI ADMIN */}
      {!komunitas.hasAdmin && (
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
                  Komunitas ini belum memiliki Admin/Pengurus resmi untuk mengelola data anggota dan kegiatan.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUserId) {
                  window.location.href = `/login?redirectTo=/komunitas/${komunitas.id}`;
                  return;
                }
                setIsApplyAdminOpen(true);
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-xs font-mono font-bold text-black shadow-sm transition-all hover:bg-amber-400 active:scale-95 shrink-0 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Ajukan Diri Sebagai Admin</span>
            </button>
          </div>
        </section>
      )}

      {/* QUICK ACCESS CARDS: DATA ANAK & DATA ATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card Data Anak 0-7 */}
        <Link
          href={`/komunitas/${komunitas.id}/data`}
          className="group rounded-lg border border-emerald-500/40 bg-card p-4 flex items-center justify-between gap-3 hover:border-emerald-500 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <Baby className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground group-hover:text-emerald-400 transition-colors">
                  DATA ANAK (0–7 THN) &amp; DDTK
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Rekam tumbuh kembang balita &amp; validasi data
              </p>
            </div>
          </div>
          <span className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 group-hover:bg-emerald-500 px-3 text-[11px] font-mono font-bold text-white shadow-xs shrink-0 transition-colors">
            <span>BUKA</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        {/* Card Data ATS */}
        <Link
          href={`/komunitas/${komunitas.id}/ats`}
          className="group rounded-lg border border-amber-500/40 bg-card p-4 flex items-center justify-between gap-3 hover:border-amber-500 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground group-hover:text-amber-400 transition-colors">
                  DATA ATS (ANAK TIDAK SEKOLAH)
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Pendataan anak tidak sekolah &amp; alasan
              </p>
            </div>
          </div>
          <span className="inline-flex h-8 items-center gap-1 rounded-md bg-amber-600 group-hover:bg-amber-500 px-3 text-[11px] font-mono font-bold text-white shadow-xs shrink-0 transition-colors">
            <span>BUKA</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex rounded-md bg-muted/60 p-1.5 border border-border gap-1.5">
        <button
          onClick={() => setActiveTab("kabar")}
          className={cn(
            "flex flex-1 h-9.5 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer",
            activeTab === "kabar"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/60"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>KABAR ({kabarKomunitas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("anggota")}
          className={cn(
            "flex flex-1 h-9.5 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer",
            activeTab === "anggota"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/60"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          <span>ANGGOTA ({approvedMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={cn(
            "flex flex-1 h-9.5 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer",
            activeTab === "data"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card/60"
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
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground">
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
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground font-mono font-bold text-xs">
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
                      <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground border border-border">
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
          {/* Card Direct to Data Anak & DDTK */}
          <div className="rounded-lg border border-border bg-card p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-emerald-500 dark:text-emerald-400">
                <Baby className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground font-mono">
                  DATA ANAK 0–7 TAHUN &amp; DDTK
                </h4>
                <p className="text-xs text-muted-foreground">
                  Kelola pendaftaran balita, riwayat DDTK tumbuh kembang, dan validasi data.
                </p>
              </div>
            </div>
            <Link
              href={`/komunitas/${komunitas.id}/data`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 text-xs font-mono font-bold text-white transition-all shadow-sm active:scale-98 shrink-0"
            >
              <span>BUKA DATA</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card Direct to Data ATS (Anak Tidak Sekolah) */}
          <div className="rounded-lg border border-border bg-card p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-amber-500 dark:text-amber-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground font-mono">
                  DATA ATS (ANAK TIDAK SEKOLAH)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pendataan Anak Tidak Sekolah, pemantauan alasan, dan rencana intervensi kembali bersekolah.
                </p>
              </div>
            </div>
            <Link
              href={`/komunitas/${komunitas.id}/ats`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber-600 hover:bg-amber-500 px-4 text-xs font-mono font-bold text-white transition-all shadow-sm active:scale-98 shrink-0"
            >
              <span>BUKA DATA ATS</span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-border shrink-0 bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span>PENGAJUAN ADMIN KOMUNITAS</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    Ajukan Diri Sebagai Admin
                  </h3>
                  <p className="text-xs font-mono text-emerald-400 font-semibold">
                    {komunitas.nama}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplyAdminOpen(false)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                Pengajuan Anda akan diverifikasi oleh Admin satu tingkat di atasnya atau Super Admin. Sesuai ketentuan, satu komunitas memiliki satu Admin resmi penanggung jawab.
              </p>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 pb-12 sm:pb-16 overflow-y-auto flex-1 space-y-4 overscroll-contain">
              <form onSubmit={handleApplyAdmin} className="space-y-4">
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
                    placeholder="Misal: Saya Pengurus RT / Tokoh warga setempat"
                    rows={2}
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-sans text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>

                {adminFeedback && (
                  <p className="text-xs font-mono text-center text-emerald-400">
                    {adminFeedback}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyAdminOpen(false)}
                    className="flex-1 h-9 rounded-md border border-border text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdmin}
                    className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3 text-xs font-mono font-bold text-black hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
