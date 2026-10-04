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
  UserPlus,
  Info,
  Baby,
  GraduationCap,
  ArrowRight,
  Loader2,
  X,
  Settings2,
  Lock,
  Pencil,
  Wrench,
  Home,
  HeartPulse,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { WargaOnboardingModal } from "@/components/komunitas/warga-onboarding-modal";
import { EditInformasiOperasionalModal } from "@/components/komunitas/edit-informasi-operasional-modal";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { KomunitasProfilCharts } from "@/components/komunitas/komunitas-profil-charts";
import { applyForAdminKomunitas } from "@/app/actions/komunitas";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  KabarItem,
  DataAnakItem,
} from "@/types/database";
import { cn, hasFullProfilDataAccess, parseKontakKomunitas, formatWhatsAppUrl } from "@/lib/utils";

interface KomunitasDetailClientViewProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
  isAdminOrKader: boolean;
  currentSubtab: string;
  anggotaList: AnggotaKomunitasDetail[];
  kabarKomunitas: KabarItem[];
  dataAnakList?: DataAnakItem[];
}

export function KomunitasDetailClientView({
  komunitas,
  currentUserId,
  isAdminOrKader,
  currentSubtab,
  anggotaList,
  kabarKomunitas,
  dataAnakList = [],
}: KomunitasDetailClientViewProps) {
  const [komunitasData, setKomunitasData] = useState(komunitas);
  const [activeTab, setActiveTab] = useState(currentSubtab || "kabar");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [membershipState, setMembershipState] = useState(komunitas.currentUserMembership);
  const [isWargaOnboardingOpen, setIsWargaOnboardingOpen] = useState(false);
  const [isEditOperasionalOpen, setIsEditOperasionalOpen] = useState(false);

  // State untuk modal Ajukan Diri Sebagai Admin
  const [isApplyAdminOpen, setIsApplyAdminOpen] = useState(false);
  const [adminHp, setAdminHp] = useState("");
  const [adminCatatan, setAdminCatatan] = useState("");
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [isSubmittingAdmin, startSubmitAdmin] = useTransition();

  const membership = membershipState;
  const isApprovedMember = membership?.status === "approved";
  const userPeran = membership?.peran || "Pengunjung";
  const isWargaKita = komunitasData.jenis === "warga_kita";
  const hasFullAccess = !isWargaKita || hasFullProfilDataAccess(userPeran, isAdminOrKader);
  const isChartOnly = isWargaKita && !hasFullAccess;
  const isPenduduk = userPeran === "Penduduk";
  const isKader =
    isApprovedMember &&
    (userPeran.toLowerCase().trim() === "kader" ||
      userPeran.toLowerCase().trim().includes("kader"));

  const parsedKontak = useMemo(
    () => parseKontakKomunitas(komunitasData.kontak),
    [komunitasData.kontak]
  );

  let formattedTitle = komunitasData.nama;
  if (komunitasData.jenis === "posyandu") {
    const cleanName = (komunitasData.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
    formattedTitle = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
  }

  const approvedMembers = anggotaList.filter((m) => m.status === "approved");

  // Otorisasi Kelola Anggota
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
        isAdminOrKader ||
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
                peran: "Penduduk",
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
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                  {komunitas.jenis === "warga_kita"
                    ? "WARGA KITA"
                    : komunitas.jenis === "posyandu"
                    ? "POSYANDU"
                    : "SATUAN PAUD"}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {komunitas.kelurahan && komunitas.kelurahan !== "Semua Kelurahan"
                    ? `${komunitas.kelurahan}, ${komunitas.kecamatan || "Kota Tegal"}`
                    : komunitas.kecamatan && komunitas.kecamatan !== "Kota Tegal"
                    ? `Kecamatan ${komunitas.kecamatan}, Kota Tegal`
                    : "Kota Tegal, Jawa Tengah"}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {formattedTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 font-semibold pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span>{komunitas.lokasi}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-slate-900 font-bold">
                  {komunitas.jumlah_anggota} Anggota
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge User */}
          <div className="shrink-0">
            {isApprovedMember ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border-2 border-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{userPeran.toUpperCase()}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (komunitas.jenis === "warga_kita") {
                    setIsWargaOnboardingOpen(true);
                  } else {
                    setIsJoinModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Bergabung</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* INFORMASI ADMIN / PENGURUS KOMUNITAS */}
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

      {/* ALERT JIKA BELUM MEMILIKI ADMIN (HANYA PADA WARGA KITA & HANYA PENDUDUK YANG BERHAK MENGAJUKAN ADMIN) */}
      {!komunitas.hasAdmin && isWargaKita && (
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
                {isPenduduk
                  ? "Sebagai Penduduk, Anda berhak mengajukan diri untuk menjadi Admin/Pengurus resmi kepada Admin di tingkat atasnya secara berjenjang."
                  : "Komunitas ini belum memiliki Admin resmi. Pengajuan Admin hanya dapat diajukan oleh Penduduk resmi (KK & Domisili di Kota Tegal)."}
              </p>
            </div>
          </div>

          {isPenduduk && (
            <button
              type="button"
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
          )}
        </section>
      )}

      {/* 2. SUB-TABS NAVIGATION (Pill Style: Kabar, Anggota, Profil Data) */}
      <div className="flex rounded-2xl bg-white p-1.5 border-2 border-slate-200 gap-2 shadow-xs">
        <button
          type="button"
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
          type="button"
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
          type="button"
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
          <CreateKabarModal
            currentUserId={currentUserId}
            komunitasId={komunitas.id}
            komunitasNama={formattedTitle}
          />
        </section>
      )}

      {/* Subtab: DAFTAR ANGGOTA */}
      {activeTab === "anggota" && (
        <section className="space-y-4 pb-16">
          {/* Informasi Resmi & Operasional Wilayah */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Informasi Resmi &amp; Operasional
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Informasi alamat lokasi, jadwal layanan, dan kontak resmi 6 bidang kader
                </p>
              </div>

              {isKader && (
                <button
                  type="button"
                  onClick={() => setIsEditOperasionalOpen(true)}
                  className="inline-flex min-h-[40px] h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
                  title="Hanya Kader resmi yang berhak mengedit informasi ini"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Informasi</span>
                </button>
              )}
            </div>

            <div className="space-y-3 text-sm">
              {/* Alamat Lokasi */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <MapPin className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ALAMAT LOKASI</span>
                  <p className="text-slate-900 font-semibold leading-relaxed">
                    {komunitasData.lokasi}
                  </p>
                </div>
              </div>

              {/* Jadwal Layanan */}
              {komunitasData.jadwal && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Calendar className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">JADWAL LAYANAN</span>
                    <p className="text-slate-900 font-semibold leading-relaxed">
                      {komunitasData.jadwal}
                    </p>
                  </div>
                </div>
              )}

              {/* Kontak Resmi Utama */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">KONTAK RESMI UTAMA / SEKRETARIAT</span>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-slate-900 font-bold font-mono text-base">
                      {parsedKontak.utama || komunitasData.kontak || "-"}
                    </p>
                    {parsedKontak.utama && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.utama, `Halo Pengurus ${komunitasData.nama}, saya ingin menanyakan informasi layanan.`) || `tel:${parsedKontak.utama}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Hubungi WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Kontak 6 Bidang Kader SPM (Permendagri No. 13 Tahun 2024) */}
              <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-700" />
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wider">
                      Kontak Kader 6 Bidang SPM
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                    6 Bidang SPM
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Kader Bidang Pendidikan */}
                  <div className="p-3.5 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
                        Kader Bidang Pendidikan
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {parsedKontak.kader_pendidikan.nama || "Belum ditentukan"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {parsedKontak.kader_pendidikan.wa || "No. WA belum terdaftar"}
                      </p>
                    </div>
                    {parsedKontak.kader_pendidikan.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_pendidikan.wa, `Halo Kader Bidang Pendidikan ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition-colors"
                      >
                        <Phone className="h-3 w-3 text-blue-600" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* 2. Kader Bidang Kesehatan */}
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <HeartPulse className="h-4 w-4 text-emerald-600 shrink-0" />
                        Kader Bidang Kesehatan
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {parsedKontak.kader_kesehatan.nama || "Belum ditentukan"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {parsedKontak.kader_kesehatan.wa || "No. WA belum terdaftar"}
                      </p>
                    </div>
                    {parsedKontak.kader_kesehatan.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_kesehatan.wa, `Halo Kader Bidang Kesehatan ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition-colors"
                      >
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* 3. Kader Bidang Pekerjaan Umum */}
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Wrench className="h-4 w-4 text-amber-600 shrink-0" />
                        Kader Bidang Pekerjaan Umum
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {parsedKontak.kader_pekerjaan_umum.nama || "Belum ditentukan"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {parsedKontak.kader_pekerjaan_umum.wa || "No. WA belum terdaftar"}
                      </p>
                    </div>
                    {parsedKontak.kader_pekerjaan_umum.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_pekerjaan_umum.wa, `Halo Kader Bidang Pekerjaan Umum ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-colors"
                      >
                        <Phone className="h-3 w-3 text-amber-600" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* 4. Kader Bidang Perumahan Rakyat */}
                  <div className="p-3.5 rounded-xl bg-white border border-cyan-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-cyan-900 flex items-center gap-1.5">
                        <Home className="h-4 w-4 text-cyan-600 shrink-0" />
                        Kader Bidang Perumahan Rakyat
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {parsedKontak.kader_perumahan_rakyat.nama || "Belum ditentukan"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {parsedKontak.kader_perumahan_rakyat.wa || "No. WA belum terdaftar"}
                      </p>
                    </div>
                    {parsedKontak.kader_perumahan_rakyat.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_perumahan_rakyat.wa, `Halo Kader Bidang Perumahan Rakyat ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold text-xs transition-colors"
                      >
                        <Phone className="h-3 w-3 text-cyan-600" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* 5. Kader Bidang Trantipbumlinmas */}
                  <div className="p-3.5 rounded-xl bg-white border border-purple-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                        Kader Bidang Trantipbumlinmas
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {parsedKontak.kader_trantipbumlinmas.nama || "Belum ditentukan"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {parsedKontak.kader_trantipbumlinmas.wa || "No. WA belum terdaftar"}
                      </p>
                    </div>
                    {parsedKontak.kader_trantipbumlinmas.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_trantipbumlinmas.wa, `Halo Kader Bidang Trantipbumlinmas ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition-colors"
                      >
                        <Phone className="h-3 w-3 text-purple-600" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* 6. Kader Bidang Sosial */}
                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-rose-900 flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-rose-600 shrink-0" />
                        Kader Bidang Sosial
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {parsedKontak.kader_sosial.nama || "Belum ditentukan"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {parsedKontak.kader_sosial.wa || "No. WA belum terdaftar"}
                      </p>
                    </div>
                    {parsedKontak.kader_sosial.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_sosial.wa, `Halo Kader Bidang Sosial ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-colors"
                      >
                        <Phone className="h-3 w-3 text-rose-600" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Profil & Visi */}
              {komunitasData.deskripsi && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">PROFIL &amp; VISI</span>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {komunitasData.deskripsi}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

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
      {activeTab === "data" && (
        <section className="space-y-5 pb-16">
          {/* Banner Hak Akses Penuh jika Penduduk / Penduduk Berdomisili Luar Kota */}
          {hasFullAccess && isApprovedMember && isWargaKita && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex items-start gap-3 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                    Hak Akses Penuh: {userPeran.toUpperCase()}
                  </h4>
                  <span className="rounded-md px-2 py-0.5 text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    AKSES SELURUH DATA
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Sebagai <strong>{userPeran}</strong>, Anda memiliki hak akses penuh ke visualisasi Grafik &amp; Chart, rincian data anak &amp; DDTK, data ATS, penambahan data, dan pelaporan wilayah.
                </p>
              </div>
            </div>
          )}

          {/* Visualisasi Grafik & Chart Statistik Wilayah */}
          <KomunitasProfilCharts
            komunitas={komunitas}
            dataAnakList={dataAnakList}
            userRole={userPeran}
            isChartOnly={isChartOnly}
          />

          {/* Elemen Rincian Data Anak & ATS (Hanya untuk Penduduk & Penduduk Berdomisili Luar Kota) */}
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
          ) : (
            /* Pesan Terkunci untuk Pengunjung / Pendatang */
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-200 text-slate-600">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-900">
                  Manajemen Data Terkunci
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Akses rincian data anak dan pendataan ATS hanya dapat diakses oleh <strong>Penduduk</strong> dan <strong>Penduduk Berdomisili Luar Kota</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWargaOnboardingOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Bergabung Sekarang</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Modal Ajukan Diri Sebagai Admin (Hanya untuk Penduduk) */}
      {isApplyAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    Pengajuan Admin Komunitas
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {formattedTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyAdminOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {adminFeedback && (
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-800">
                {adminFeedback}
              </div>
            )}

            <form onSubmit={handleApplyAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={adminHp}
                  onChange={(e) => setAdminHp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-mono text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Pengajuan / Kredensial Pengurus (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={adminCatatan}
                  onChange={(e) => setAdminCatatan(e.target.value)}
                  placeholder="Keterangan pengurus (misal: Ketua RT / Pengurus RW aktif)..."
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyAdminOpen(false)}
                  disabled={isSubmittingAdmin}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingAdmin ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Kirim Pengajuan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PopUp Isian Bergabung Warga Kita */}
      {isWargaOnboardingOpen && (
        <WargaOnboardingModal
          komunitas={komunitas}
          isOpen={isWargaOnboardingOpen}
          onClose={() => setIsWargaOnboardingOpen(false)}
          currentUserId={currentUserId}
          onSuccess={(newMem) => {
            setMembershipState(newMem);
            setIsWargaOnboardingOpen(false);
          }}
        />
      )}

      {/* PopUp Minta Bergabung Posyandu / PAUD */}
      {isJoinModalOpen && (
        <JoinKomunitasModal
          komunitas={komunitasData}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
        />
      )}

      {/* Modal Edit Informasi Resmi & Operasional (Khusus Admin / Kader) */}
      {isEditOperasionalOpen && (
        <EditInformasiOperasionalModal
          komunitas={komunitasData}
          isOpen={isEditOperasionalOpen}
          onClose={() => setIsEditOperasionalOpen(false)}
          onSuccess={(updatedFields) => {
            setKomunitasData((prev) => ({
              ...prev,
              ...updatedFields,
            }));
          }}
        />
      )}
    </div>
  );
}
