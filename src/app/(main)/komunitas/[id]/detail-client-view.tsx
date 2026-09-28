"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Calendar,
  Phone,
  ShieldCheck,
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
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
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

  const membership = komunitas.currentUserMembership;
  const approvedMembers = anggotaList.filter((m) => m.status === "approved");

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
                <span>{komunitas.kelurahan}, {komunitas.kecamatan}</span>
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
            <div className="flex items-center gap-2">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-mono text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>TERKONFIRMASI: {membership.peran.toUpperCase()}</span>
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
                  window.location.href = "/login";
                  return;
                }
                setIsJoinModalOpen(true);
              }}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all active:scale-95 hover:bg-zinc-200 border border-zinc-700"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>MINTA BERGABUNG</span>
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
                    <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-mono text-muted-foreground border border-border">
                      {member.peran}
                    </span>
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

      {/* Modal Join */}
      <JoinKomunitasModal
        komunitas={komunitas}
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
