"use client";

import { useState, useTransition, useMemo } from "react";
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
  Settings2,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { WargaOnboardingModal } from "@/components/komunitas/warga-onboarding-modal";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { KomunitasProfilCharts } from "@/components/komunitas/komunitas-profil-charts";
import { applyForAdminKomunitas } from "@/app/actions/komunitas";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  KabarItem,
} from "@/types/database";
import { cn, hasFullProfilDataAccess } from "@/lib/utils";

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

  // Otorisasi Kelola Anggota:
  // - Komunitas Warga Kita: Pengurus
  // - Komunitas Satuan PAUD: Kepala Sekolah / Pengelola
  // - Komunitas Posyandu: Kader
  const canManageMembers = useMemo(() => {
    if (!currentUserId) return false;

    const roleLower = (membership?.peran || "").toLowerCase().trim();
    const isApproved = membership?.status === "approved";

    if (komunitas.jenis === "warga_kita") {
      return (
        isAdminOrKader ||
        (isApproved &&
          (roleLower.includes("pengurus") ||
            roleLower.includes("ketua") ||
            roleLower.includes("admin") ||
            roleLower.includes("pimpinan")))
      );
    }

    if (komunitas.jenis === "satuan_paud") {
      return (
        (isAdminOrKader &&
          (roleLower.includes("kepala") ||
            roleLower.includes("pimpinan") ||
            roleLower.includes("pengelola") ||
            roleLower.includes("admin") ||
            roleLower.includes("super_admin") ||
            roleLower.includes("super admin"))) ||
        (isApproved &&
          (roleLower.includes("kepala") ||
            roleLower.includes("pimpinan") ||
            roleLower.includes("pengelola") ||
            roleLower.includes("admin")))
      );
    }

    if (komunitas.jenis === "posyandu") {
      return (
        isAdminOrKader ||
        (isApproved &&
          (roleLower.includes("kader") ||
            roleLower.includes("bidan") ||
            roleLower.includes("medis") ||
            roleLower.includes("nakes") ||
            roleLower.includes("kesehatan") ||
            roleLower.includes("admin")))
      );
    }

    return isAdminOrKader;
  }, [komunitas.jenis, membership, isAdminOrKader, currentUserId]);

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
    <div className="space-y-6">
      {/* 1. HERO HEADER CARD */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-bold border-2",
                komunitas.jenis === "warga_kita" && "bg-blue-50 text-blue-700 border-blue-200",
                komunitas.jenis === "posyandu" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                komunitas.jenis === "satuan_paud" && "bg-amber-50 text-amber-800 border-amber-200"
              )}
            >
              {komunitas.jenis === "warga_kita" && <Users className="h-7 w-7" />}
              {komunitas.jenis === "posyandu" && <Sparkles className="h-7 w-7" />}
              {komunitas.jenis === "satuan_paud" && <Building2 className="h-7 w-7" />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200 uppercase">
                  {komunitas.jenis.replace("_", " ")}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {komunitas.jumlah_anggota} ANGGOTA
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {komunitas.nama}
              </h2>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>{komunitas.kelurahan || "Tegal"}, {komunitas.kecamatan || "Kota Tegal"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Status / Action Button */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-slate-100">
          {membership ? (
            <div className="flex flex-wrap items-center gap-2">
              {membership.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 border-2 border-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>TERKONFIRMASI: {membership.peran.toUpperCase()}</span>
                </span>
              )}

              {/* Tampilkan indikator jika pengguna sedang mengajukan status lain */}
              {membership.peran_diajukan &&
                membership.peran_diajukan.toLowerCase() !== membership.peran.toLowerCase() &&
                !isAdminOrKader && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 border-2 border-amber-300">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>MENUNGGU PERSETUJUAN: {membership.peran_diajukan.toUpperCase()}</span>
                  </span>
                )}

              {membership.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 border-2 border-amber-300">
                  <Clock className="h-4 w-4 text-amber-600" />
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
                "inline-flex min-h-[48px] h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 text-base font-bold text-white shadow-md transition-all active:scale-98 cursor-pointer",
                komunitas.jenis === "warga_kita" && "bg-blue-700 hover:bg-blue-800",
                komunitas.jenis === "posyandu" && "bg-blue-700 hover:bg-blue-800",
                komunitas.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-700"
              )}
            >
              <UserPlus className="h-4 w-4" />
              <span>{komunitas.jenis === "warga_kita" ? "BERGABUNG" : "MINTA BERGABUNG"}</span>
            </button>
          )}
        </div>
      </section>

      {/* INFORMASI ADMIN / PENGURUS KOMUNITAS (JIKA SUDAH ADA ADMIN) */}
      {komunitas.hasAdmin && (
        <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 space-y-2 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                  Admin / Pengurus Resmi Terdaftar
                </h4>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Terverifikasi
                </span>
              </div>
              <p className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{komunitas.adminName || "Pengurus Resmi Komunitas"}</span>
                {komunitas.adminRole && (
                  <span className="text-slate-600 font-semibold text-sm">
                    • {komunitas.adminRole}
                  </span>
                )}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pengurus resmi yang mengelola verifikasi anggota, jadwal kegiatan, dan layanan komunitas.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ALERT JIKA BELUM MEMILIKI ADMIN */}
      {!komunitas.hasAdmin && (
        <section className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-amber-950">
                Komunitas Belum Memiliki Admin / Pengurus
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
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
            className="inline-flex min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 text-base font-bold shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Ajukan Diri Sebagai Admin</span>
          </button>
        </section>
      )}

      {/* 2. SUB-TABS NAVIGATION (Pill Style) */}
      <div className="flex rounded-2xl bg-white p-1.5 border-2 border-slate-200 gap-2 shadow-xs">
        <button
          onClick={() => setActiveTab("kabar")}
          className={cn(
            "flex flex-1 min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
            activeTab === "kabar"
              ? "bg-blue-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>KABAR ({kabarKomunitas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("anggota")}
          className={cn(
            "flex flex-1 min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
            activeTab === "anggota"
              ? "bg-blue-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Users className="h-4 w-4" />
          <span>ANGGOTA ({approvedMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={cn(
            "flex flex-1 min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
            activeTab === "data"
              ? "bg-blue-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Info className="h-4 w-4" />
          <span>PROFIL DATA</span>
        </button>
      </div>

      {/* 3. SUB-TAB CONTENT */}
      {/* Subtab: KABAR KOMUNITAS */}
      {activeTab === "kabar" && (
        <section className="space-y-4 pb-16">
          {kabarKomunitas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border-2 border-blue-200">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-bold text-slate-900">
                  Belum Ada Kabar Komunitas
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
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
        <section className="space-y-4 pb-16">
          {/* Header Action Bar di dalam Tab Anggota */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 shadow-xs">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900">
                Daftar Anggota Komunitas
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Total {approvedMembers.length} anggota aktif terdaftar
              </p>
            </div>

            {canManageMembers && (
              <Link
                href={`/komunitas/${komunitas.id}/anggota`}
                className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 text-sm font-bold shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
              >
                <Settings2 className="h-4 w-4" />
                <span>KELOLA ANGGOTA</span>
              </Link>
            )}
          </div>

          {approvedMembers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center text-sm font-semibold text-slate-500">
              Belum ada anggota terdaftar secara daring
            </div>
          ) : (
            <div className="space-y-2.5">
              {approvedMembers.map((member) => {
                const name = member.profiles?.nama_lengkap || "Warga Komunitas";
                const initial = name.charAt(0).toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold text-base">
                        {initial}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {name}
                        </h4>
                        <p className="text-sm font-semibold text-slate-500">
                          {member.profiles?.email || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200">
                        {member.peran}
                      </span>
                      {member.peran_diajukan && (
                        <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200">
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

      {/* Subtab: PROFIL DATA */}
      {activeTab === "data" && (() => {
        const userPeran = membership?.peran || "Pengunjung";
        const isWargaKita = komunitas.jenis === "warga_kita";
        const hasFullAccess = !isWargaKita || hasFullProfilDataAccess(userPeran, isAdminOrKader);
        const isChartOnly = isWargaKita && !hasFullAccess;

        return (
          <section className="space-y-5 pb-16">
            {/* 1. Header Banner Hak Akses (Khusus Warga Kita) */}
            {isWargaKita && (
              <div
                className={cn(
                  "rounded-2xl border-2 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs",
                  hasFullAccess
                    ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                    : "border-amber-200 bg-amber-50/80 text-amber-950"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm",
                      hasFullAccess
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    )}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold">
                        {hasFullAccess
                          ? `Hak Akses Penuh: ${userPeran.toUpperCase()}`
                          : `Hak Akses Pratinjau: ${userPeran.toUpperCase()}`}
                      </h4>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-2xs font-extrabold uppercase border",
                          hasFullAccess
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        )}
                      >
                        {hasFullAccess ? "AKSES SELURUH DATA" : "HANYA GRAFIK & CHART"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {hasFullAccess
                        ? `Sebagai ${userPeran}, Anda memiliki hak akses penuh ke seluruh unsur Profil Data (visualisasi Grafik & Chart, rincian data anak, data ATS, validasi, dan informasi operasional).`
                        : `Sebagai ${userPeran}, Anda memiliki hak akses untuk melihat visualisasi Grafik dan Chart statistik agregat wilayah ini. Akses rincian data anak & penambahan data diperuntukkan bagi Penduduk dan Penduduk Domisili Di Luar.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Visualisasi Grafik & Chart Statistik Wilayah */}
            <KomunitasProfilCharts
              komunitas={komunitas}
              userRole={userPeran}
              isChartOnly={isChartOnly}
            />

            {/* 3. Elemen Rincian Data Anak & ATS (Hanya untuk yang berhak akses penuh: Penduduk, Penduduk Domisili Di Luar, atau Pengurus/Admin) */}
            {hasFullAccess ? (
              <div className="space-y-4">
                <div className="border-t-2 border-slate-200 pt-4">
                  <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider mb-3">
                    MANAJEMEN DATA &amp; DDTK
                  </h3>
                </div>

                {/* Card Direct to Data Anak & DDTK */}
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700">
                      <Baby className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">
                        Data Anak (0–6 Tahun) &amp; DDTK
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Kelola pendaftaran balita, riwayat DDTK tumbuh kembang, dan validasi data.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/komunitas/${komunitas.id}/data`}
                    className="inline-flex min-h-[48px] h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white transition-all shadow-xs shrink-0"
                  >
                    <span>BUKA DATA</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Card Direct to Data ATS (Anak Tidak Sekolah) */}
                {komunitas.jenis !== "satuan_paud" && (
                  <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-800">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900">
                          Data ATS (Anak Tidak Sekolah)
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Pendataan Anak Tidak Sekolah, pemantauan alasan, dan rencana intervensi kembali bersekolah.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/komunitas/${komunitas.id}/ats`}
                      className="inline-flex min-h-[48px] h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-6 text-base font-bold text-white transition-all shadow-xs shrink-0"
                    >
                      <span>BUKA DATA ATS</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            ) : null}

            {/* 4. Informasi Resmi & Operasional Wilayah */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Informasi Resmi &amp; Operasional
              </h3>

              <div className="space-y-3 text-sm">
                {/* Alamat Lengkap */}
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <MapPin className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ALAMAT LOKASI</span>
                    <p className="text-slate-900 font-semibold leading-relaxed">
                      {komunitas.lokasi}
                    </p>
                  </div>
                </div>

                {/* Jadwal Kegiatan */}
                {komunitas.jadwal && (
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <Calendar className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">JADWAL LAYANAN</span>
                      <p className="text-slate-900 font-semibold leading-relaxed">
                        {komunitas.jadwal}
                      </p>
                    </div>
                  </div>
                )}

                {/* Kontak */}
                {komunitas.kontak && (
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">KONTAK RESMI</span>
                      <p className="text-slate-900 font-semibold leading-relaxed">
                        {komunitas.kontak}
                      </p>
                    </div>
                  </div>
                )}

                {/* Deskripsi */}
                {komunitas.deskripsi && (
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">PROFIL &amp; VISI</span>
                      <p className="text-slate-900 font-medium leading-relaxed">
                        {komunitas.deskripsi}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })()}

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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 rounded-md border-2 border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>PENGAJUAN ADMIN KOMUNITAS</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Ajukan Diri Sebagai Admin
                  </h3>
                  <p className="text-sm font-bold text-blue-700">
                    {komunitas.nama}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplyAdminOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                Pengajuan Anda akan diverifikasi oleh Admin satu tingkat di atasnya atau Super Admin. Sesuai ketentuan, satu komunitas memiliki satu Admin resmi penanggung jawab.
              </p>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 pb-12 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-slate-50/50">
              <form onSubmit={handleApplyAdmin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-base font-bold text-slate-900 block">
                    Nomor WhatsApp / HP Aktif <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={adminHp}
                    onChange={(e) => setAdminHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    required
                    className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-4 text-base font-mono text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-base font-bold text-slate-900 block">
                    Alasan / Posisi di Lingkungan (Opsional)
                  </label>
                  <textarea
                    value={adminCatatan}
                    onChange={(e) => setAdminCatatan(e.target.value)}
                    placeholder="Misal: Saya Pengurus RT / Tokoh warga setempat"
                    rows={2}
                    className="w-full rounded-xl border-2 border-slate-300 bg-white p-3.5 text-base text-slate-900 focus:border-blue-600 focus:outline-hidden resize-none"
                  />
                </div>

                {adminFeedback && (
                  <p className="text-sm font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border-2 border-emerald-200 text-center">
                    {adminFeedback}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyAdminOpen(false)}
                    className="flex-1 min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white text-base font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdmin}
                    className="flex-1 min-h-[48px] h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-base font-bold text-white disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmittingAdmin ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
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
    </div>
  );
}
