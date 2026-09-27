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
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-bold shadow-sm",
                komunitas.jenis === "warga_kita" &&
                  "bg-emerald-500/10 text-primary",
                komunitas.jenis === "posyandu" &&
                  "bg-accent/10 text-accent",
                komunitas.jenis === "satuan_paud" &&
                  "bg-amber-500/10 text-amber-600"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-7 w-7" />}
              {komunitas.jenis === "posyandu" && (
                <Sparkles className="h-7 w-7" />
              )}
              {komunitas.jenis === "satuan_paud" && (
                <Building2 className="h-7 w-7" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground leading-snug">
                {komunitas.nama}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {komunitas.kelurahan}, {komunitas.kecamatan}
                </span>
                <span>•</span>
                <span>{komunitas.jumlah_anggota} Anggota</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Link to Data Anak 0-7 Tahun */}
        <Link
          href={`/komunitas/${komunitas.id}/data`}
          className="flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-primary transition-all hover:bg-primary/15 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <Baby className="h-5 w-5 text-primary" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">
                Data Anak 0–7 Tahun &amp; DDKS
              </span>
              <span className="text-[11px] text-muted-foreground">
                Lihat catatan antropometri, tumbuh kembang, &amp; validasi anak
              </span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </Link>

        {/* User Status / Action Button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/60">
          {membership ? (
            <div className="flex items-center gap-2">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Anggota Terkonfirmasi ({membership.peran})</span>
                </span>
              )}
              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Menunggu Verifikasi ({membership.peran})</span>
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
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-accent px-5 py-2 text-xs font-bold text-white shadow-md shadow-accent/20 transition-transform active:scale-95 hover:brightness-110"
            >
              <UserPlus className="h-4 w-4" />
              <span>Minta Bergabung</span>
            </button>
          )}

          {isAdminOrKader && (
            <Link
              href={`/komunitas/${komunitas.id}/anggota`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl bg-secondary px-3.5 py-2 text-xs font-bold text-secondary-foreground border border-secondary transition-all active:scale-95 hover:bg-secondary/80"
            >
              <UserCheck className="h-4 w-4" />
              <span>Kelola Permohonan</span>
            </Link>
          )}
        </div>
      </section>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex rounded-2xl bg-muted/70 p-1 border border-border/80">
        <button
          onClick={() => setActiveTab("kabar")}
          className={cn(
            "flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "kabar"
              ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Kabar ({kabarKomunitas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("anggota")}
          className={cn(
            "flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "anggota"
              ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          <span>Anggota ({approvedMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={cn(
            "flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "data"
              ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Info className="h-4 w-4" />
          <span>Data Profil</span>
        </button>
      </div>

      {/* 3. SUB-TAB CONTENT */}
      {/* Subtab: KABAR KOMUNITAS */}
      {activeTab === "kabar" && (
        <section className="space-y-4 pb-12">
          {kabarKomunitas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  Belum Ada Kabar di Komunitas Ini
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Bagikan pengumuman atau jadwal penimbangan balita pertama untuk komunitas ini.
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
        <section className="space-y-3 pb-12">
          {approvedMembers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center text-xs text-muted-foreground">
              Belum ada data anggota yang terdaftar secara daring.
            </div>
          ) : (
            <div className="space-y-2.5">
              {approvedMembers.map((member) => {
                const name = member.profiles?.nama_lengkap || "Warga Komunitas";
                const initial = name.charAt(0).toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                        {initial}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {member.profiles?.email || "-"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground/80 border border-border">
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
        <section className="space-y-4 pb-12">
          {/* Card Direct to Data Anak */}
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white font-bold">
                <Baby className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">
                  Data Anak 0–7 Tahun Terdaftar
                </h4>
                <p className="text-xs text-muted-foreground">
                  Kelola pendaftaran balita, riwayat DDKS, dan validasi data.
                </p>
              </div>
            </div>
            <Link
              href={`/komunitas/${komunitas.id}/data`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm shadow-primary/20 transition-all active:scale-95 hover:brightness-105 shrink-0"
            >
              <span>Buka Data</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              Informasi Resmi &amp; Operasional
            </h3>

            <div className="space-y-3 text-xs">
              {/* Alamat Lengkap */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground">Alamat Lokasi:</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {komunitas.lokasi}
                  </p>
                </div>
              </div>

              {/* Jadwal Kegiatan */}
              {komunitas.jadwal && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40">
                  <Calendar className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">Jadwal Operasional / Layanan:</span>
                    <p className="text-muted-foreground leading-relaxed">
                      {komunitas.jadwal}
                    </p>
                  </div>
                </div>
              )}

              {/* Kontak */}
              {komunitas.kontak && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">Kontak Pengurus / Kader:</span>
                    <p className="text-muted-foreground leading-relaxed">
                      {komunitas.kontak}
                    </p>
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              {komunitas.deskripsi && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground">Profil &amp; Visi:</span>
                    <p className="text-muted-foreground leading-relaxed">
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
