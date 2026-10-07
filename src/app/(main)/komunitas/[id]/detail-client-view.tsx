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
  LogOut,
  UserMinus,
  UserX,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { WargaOnboardingModal } from "@/components/komunitas/warga-onboarding-modal";
import { EditInformasiOperasionalModal } from "@/components/komunitas/edit-informasi-operasional-modal";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { KomunitasProfilCharts } from "@/components/komunitas/komunitas-profil-charts";
import { LaporanKaderSpmFormCard } from "@/components/komunitas/laporan-kader-spm-form-card";
import { RekapLaporanKaderWilayahCard } from "@/components/komunitas/rekap-laporan-kader-wilayah-card";
import {
  applyForAdminKomunitas,
  leaveKomunitas,
  resignAdminKomunitas,
  kickMemberByAdmin,
} from "@/app/actions/komunitas";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  KabarItem,
  DataAnakItem,
  DataAtsItem,
} from "@/types/database";
import { cn, hasFullProfilDataAccess, parseKontakKomunitas, formatWhatsAppUrl, formatPeranDisplay, isRoleAdmin } from "@/lib/utils";

interface KomunitasDetailClientViewProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
  isAdminOrKader: boolean;
  currentSubtab: string;
  anggotaList: AnggotaKomunitasDetail[];
  kabarKomunitas: KabarItem[];
  dataAnakList?: DataAnakItem[];
  dataAtsList?: DataAtsItem[];
}

export function KomunitasDetailClientView({
  komunitas,
  currentUserId,
  isAdminOrKader,
  currentSubtab,
  anggotaList,
  kabarKomunitas,
  dataAnakList = [],
  dataAtsList = [],
}: KomunitasDetailClientViewProps) {
  const [komunitasData, setKomunitasData] = useState(komunitas);
  const [activeTab, setActiveTab] = useState<string | null>(currentSubtab || null);
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

  // State untuk Kelola Keanggotaan (Keluar, Berhenti Admin, Kick Member)
  const [anggotaState, setAnggotaState] = useState<AnggotaKomunitasDetail[]>(anggotaList);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [kickTargetMember, setKickTargetMember] = useState<AnggotaKomunitasDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const membership = membershipState;
  const isApprovedMember = membership?.status === "approved";
  const userPeran = membership?.peran || "Pengunjung";
  const isWargaKita = komunitasData.jenis === "warga_kita";
  const hasFullAccess = !isWargaKita || hasFullProfilDataAccess(userPeran, isAdminOrKader);
  const isChartOnly = isWargaKita && !hasFullAccess;
  const isPenduduk =
    isApprovedMember &&
    (userPeran === "Penduduk" ||
      (membership?.berdomisili === true && membership?.kk_terdaftar === true));
  const isKader =
    isApprovedMember &&
    (userPeran.toLowerCase().trim() === "kader" ||
      userPeran.toLowerCase().trim().includes("kader"));
  const isUserAdmin = isApprovedMember && isRoleAdmin(userPeran);
  const isUserPendingAdmin = Boolean(membership?.peran_diajukan && isRoleAdmin(membership.peran_diajukan));

  // Otorisasi Edit Informasi Resmi & Operasional (Super Admin, Admin Hierarki, Admin Langsung, Pengurus, Kader, dll.)
  const canEditOperasional = useMemo(() => {
    if (isAdminOrKader) return true;
    if (!currentUserId) return false;
    if (!isApprovedMember) return false;
    return isRoleAdmin(userPeran) || isKader;
  }, [isAdminOrKader, currentUserId, isApprovedMember, userPeran, isKader]);

  // Otorisasi Akses Laporan Kader Posyandu 6 Bidang SPM:
  // Hanya Admin / Pengurus dan Kader Komunitas Posyandu yang bersangkutan (serta Super Admin & Admin Wilayah yang menaunginya)
  const canAccessLaporanPosyandu = useMemo(() => {
    if (!currentUserId) return false;
    if (isAdminOrKader) return true;
    return isApprovedMember && (isUserAdmin || isKader);
  }, [isAdminOrKader, currentUserId, isApprovedMember, isUserAdmin, isKader]);

  const parsedKontak = useMemo(
    () => parseKontakKomunitas(komunitasData.kontak),
    [komunitasData.kontak]
  );

  let formattedTitle = komunitasData.nama;
  if (komunitasData.jenis === "posyandu") {
    const cleanName = (komunitasData.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
    formattedTitle = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
  }

  const myProfileName = useMemo(() => {
    const me = anggotaState.find((m) => m.user_id === currentUserId);
    return me?.profiles?.nama_lengkap || "Kader Posyandu";
  }, [anggotaState, currentUserId]);

  const approvedMembers = anggotaState.filter((m) => m.status === "approved");

  const handleLeave = async () => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await leaveKomunitas({ komunitasId: komunitas.id });
      if (res.success) {
        setActionFeedback({ type: "success", message: res.message });
        setMembershipState(null);
        setKomunitasData((prev) => ({
          ...prev,
          jumlah_anggota: Math.max(0, prev.jumlah_anggota - 1),
        }));
        setAnggotaState((prev) => prev.filter((m) => m.user_id !== currentUserId));
        setTimeout(() => {
          setIsLeaveModalOpen(false);
          window.location.reload();
        }, 1500);
      } else {
        setActionFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message || "Gagal keluar dari komunitas." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResign = async () => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await resignAdminKomunitas({ komunitasId: komunitas.id });
      if (res.success) {
        setActionFeedback({ type: "success", message: res.message });
        setMembershipState((prev) =>
          prev
            ? {
                ...prev,
                peran: isWargaKita ? "Penduduk" : "Pengunjung",
                peran_diajukan: null,
              }
            : null
        );
        setTimeout(() => {
          setIsResignModalOpen(false);
          window.location.reload();
        }, 1500);
      } else {
        setActionFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message || "Gagal memproses permohonan." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleKickMember = async () => {
    if (!kickTargetMember) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await kickMemberByAdmin({
        membershipId: kickTargetMember.id,
        komunitasId: komunitas.id,
      });
      if (res.success) {
        setActionFeedback({ type: "success", message: res.message });
        setAnggotaState((prev) => prev.filter((m) => m.id !== kickTargetMember.id));
        setKomunitasData((prev) => ({
          ...prev,
          jumlah_anggota: Math.max(0, prev.jumlah_anggota - 1),
        }));
        setKickTargetMember(null);
      } else {
        setActionFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message || "Gagal mengeluarkan anggota." });
    } finally {
      setActionLoading(false);
    }
  };

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
            roleLower.includes("guru") ||
            roleLower.includes("pendidik") ||
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
  const detailLinkCards = [
    {
      id: "data_anak",
      href: `/komunitas/${komunitas.id}/data`,
      title: "Data Anak (0–6 Tahun) & DDTK",
      subtitle: "Kelola pendaftaran balita, riwayat DDTK tumbuh kembang, dan validasi data",
      badgeText: `${dataAnakList.length} Balita / Anak`,
      icon: Baby,
      hoverBorder: "hover:border-blue-400 dark:hover:border-blue-600",
      hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-950",
      arrowBg: "bg-slate-100 dark:bg-slate-800",
      arrowHoverBg: "group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600",
      arrowColor: "text-slate-500 dark:text-slate-400",
      textHoverColor: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    },
    ...(komunitas.jenis !== "satuan_paud"
      ? [
          {
            id: "data_ats" as const,
            href: `/komunitas/${komunitas.id}/ats`,
            title: "Data ATS (Anak Tidak Sekolah)",
            subtitle: "Pendataan Anak Tidak Sekolah, pemantauan alasan, dan rencana intervensi kembali bersekolah",
            badgeText: `${dataAtsList.length} Kasus ATS`,
            icon: GraduationCap,
            hoverBorder: "hover:border-amber-400 dark:hover:border-amber-600",
            hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
            iconColor: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-100 dark:bg-amber-950",
            arrowBg: "bg-slate-100 dark:bg-slate-800",
            arrowHoverBg: "group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-600",
            arrowColor: "text-slate-500 dark:text-slate-400",
            textHoverColor: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
          },
        ]
      : []),
  ];

  const detailAccordionCategories = [
    {
      id: "kabar",
      title: "Kabar Komunitas",
      subtitle: "Pengumuman dan diskusi interaktif anggota komunitas",
      badgeText: `${kabarKomunitas.length} Kabar`,
      icon: MessageSquare,
      activeColorBg: "bg-blue-600 dark:bg-blue-700",
      badgeColor: "bg-blue-500/20 text-blue-100 border-blue-400/30",
      hoverBorder: "hover:border-blue-400 dark:hover:border-blue-600",
      hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      id: "anggota",
      title: "Daftar Anggota & Informasi Operasional",
      subtitle: "Informasi operasional, struktur pengurus dan 6 bidang kader",
      badgeText: `${anggotaState.filter((m) => m.status === "approved").length} Anggota`,
      icon: Users,
      activeColorBg: "bg-emerald-600 dark:bg-emerald-700",
      badgeColor: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30",
      hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600",
      hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
    },
    {
      id: "data",
      title: "Profil Data & Rekapitulasi",
      subtitle: "Data agregat balita, ATS, dan grafik capaian komunitas",
      badgeText: "Data Agregat",
      icon: Info,
      activeColorBg: "bg-indigo-600 dark:bg-indigo-700",
      badgeColor: "bg-indigo-500/20 text-indigo-100 border-indigo-400/30",
      hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-600",
      hoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-950",
    },
  ];

  const sortedDetailCategories = [
    ...detailAccordionCategories.filter((c) => c.id !== activeTab),
    ...(activeTab ? detailAccordionCategories.filter((c) => c.id === activeTab) : []),
  ];

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

          {/* Status Badge & Aksi Keanggotaan User */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            {isApprovedMember ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border-2 border-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{formatPeranDisplay(userPeran).toUpperCase()}</span>
                </span>

                {/* Tombol Berhenti Jadi Admin jika user adalah Admin */}
                {isUserAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsResignModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                    title="Berhenti dari jabatan Admin komunitas"
                  >
                    <UserMinus className="h-3.5 w-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Lepas Admin</span>
                  </button>
                )}

                {/* Tombol Keluar Komunitas */}
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                  title="Keluar dari komunitas ini"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : membership?.status === "pending" || membership?.peran_diajukan ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border-2 border-amber-300">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>MENUNGGU</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsResignModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Batalkan permohonan keanggotaan/admin"
                >
                  <X className="h-3.5 w-3.5 text-slate-500" />
                  <span>Batal</span>
                </button>
              </div>
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

      {/* ALERT JIKA BELUM MEMILIKI ADMIN (HANYA UNTUK PENGGUNA YANG SUDAH LOGIN & SUDAH BERGABUNG SEBAGAI ANGGOTA PADA WARGA KITA) */}
      {Boolean(currentUserId) && isApprovedMember && !komunitas.hasAdmin && isWargaKita && (
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
                {isPenduduk ? (
                  membership?.peran_diajukan ? (
                    <span className="font-semibold text-emerald-800">
                      Permohonan Anda sebagai Admin sedang menunggu verifikasi dan persetujuan Super Admin / Admin hierarki tingkat atas. (Tidak ada proses otomatisasi).
                    </span>
                  ) : (
                    "Sebagai anggota berstatus Penduduk, Anda berhak mengajukan permohonan menjadi Admin/Pengurus resmi kepada Admin tingkat atas (melalui verifikasi manual, tanpa proses otomatisasi)."
                  )
                ) : (
                  "Pengajuan Admin hanya dapat diajukan oleh anggota dengan status Penduduk resmi (KK & Domisili di Kota Tegal)."
                )}
              </p>
            </div>
          </div>

          {/* Action Button: Pengajuan Admin jika berstatus Penduduk */}
          {isPenduduk && !membership?.peran_diajukan ? (
            <button
              type="button"
              onClick={() => setIsApplyAdminOpen(true)}
              className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 text-sm font-bold shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Ajukan Diri Sebagai Admin</span>
            </button>
          ) : membership?.peran_diajukan ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 border border-amber-300 shrink-0">
              <Clock className="h-4 w-4 text-amber-700" />
              <span>Menunggu Persetujuan</span>
            </span>
          ) : null}
        </section>
      )}

      {/* 2. DAFTAR KARTU UTAMA (DATA ANAK & ATS) DAN ACCORDION SUB-TABS KOMUNITAS */}
      <div className="space-y-3.5 transition-all duration-500 ease-in-out">
        {/* KARTU LINK DATA UTAMA (POSISI PALING ATAS, TIDAK IKUT BERGESER) */}
        {detailLinkCards.map((cat) => {
          const Icon = cat.icon;
          if (hasFullAccess) {
            return (
              <div
                key={cat.id}
                className={`rounded-3xl border-2 transition-all duration-500 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs ${cat.hoverBorder}`}
              >
                <Link
                  href={cat.href}
                  className={`w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-slate-800 dark:text-slate-100 transition-all cursor-pointer group ${cat.hoverBg} text-left`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className={`text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 ${cat.textHoverColor} transition-colors`}>
                          {cat.title}
                        </h2>
                        <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden sm:inline-block text-xs font-bold text-slate-400 ${cat.textHoverColor} transition-colors`}>
                      Buka Data
                    </span>
                    <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl ${cat.arrowBg} ${cat.arrowHoverBg} flex items-center justify-center ${cat.arrowColor} transition-all duration-300 shadow-2xs`}>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          } else {
            return (
              <div
                key={cat.id}
                className="rounded-3xl border-2 transition-all duration-500 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => setIsWargaOnboardingOpen(true)}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-slate-800 dark:text-slate-100 transition-all cursor-pointer group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 text-left"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${cat.iconBg} ${cat.iconColor} opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-2xs`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {cat.title}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-2xs font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Lock className="h-3 w-3 text-amber-600" />
                          Khusus Penduduk
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
                      Buka Akses
                    </span>
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-amber-600 dark:text-amber-400 transition-all duration-300 shadow-2xs">
                      <Lock className="h-4 w-4 transform group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              </div>
            );
          }
        })}

        {/* ACCORDION SUB-TABS (KABAR, ANGGOTA, PROFIL DATA) */}
        {sortedDetailCategories.map((cat) => {
          const isOpen = activeTab === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              className={`rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
                isOpen
                  ? `border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-2 sm:p-3 shadow-md`
                  : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs ${cat.hoverBorder}`
              }`}
            >
              {/* Accordion Header / Trigger */}
              {isOpen ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(null)}
                  title="Klik untuk menutup bagian ini"
                  className={`w-full flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl text-white ${cat.activeColorBg} shadow-sm cursor-pointer transition-all hover:opacity-95 group text-left`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black tracking-tight truncate">
                          {cat.title}
                        </h2>
                        <span
                          className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${cat.badgeColor}`}
                        >
                          {cat.badgeText}
                        </span>
                        <span className="inline-flex items-center gap-1 text-2xs font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Aktif Terbuka
                        </span>
                      </div>
                      <p className="text-xs text-white/90 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                      Tutup Bagian
                    </span>
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs group-hover:bg-white/30 transition-colors">
                      <ChevronDown className="h-5 w-5 transform rotate-180 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-slate-800 dark:text-slate-100 transition-all cursor-pointer group ${cat.hoverBg} text-left`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cat.title}
                        </h2>
                        <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      Buka Bagian
                    </span>
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                      <ChevronDown className="h-5 w-5 transform rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              )}

              {/* Accordion Body Content */}
              {isOpen && (
                <div className="p-2 sm:p-4 animate-in fade-in-50 duration-300">
                  {cat.id === "kabar" && (
                    <section className="space-y-4 pb-4">
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
      {cat.id === "anggota" && (
        <section className="space-y-4 pb-4">
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

              {canEditOperasional && (
                <button
                  type="button"
                  onClick={() => setIsEditOperasionalOpen(true)}
                  className="inline-flex min-h-[40px] h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
                  title="Edit Informasi Resmi & Operasional Komunitas"
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
                const isMe = currentUserId && member.user_id === currentUserId;
                const isTargetSuperAdmin = (member.profiles as any)?.is_super_admin === true;
                const canKickThisMember = canManageMembers && !isMe && !isTargetSuperAdmin;

                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold text-base">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 truncate">
                            {name}
                          </h4>
                          {isMe && (
                            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md">
                              ANDA
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-500 truncate">
                          {member.profiles?.email || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200">
                        {formatPeranDisplay(member.peran)}
                      </span>
                      {member.peran_diajukan && (
                        <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                          Diajukan: {formatPeranDisplay(member.peran_diajukan)}
                        </span>
                      )}

                      {/* Tombol Keluarkan Anggota oleh Pengurus */}
                      {canKickThisMember && (
                        <button
                          type="button"
                          onClick={() => setKickTargetMember(member)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                          title={`Keluarkan ${name} dari komunitas`}
                        >
                          <UserX className="h-3.5 w-3.5 text-rose-600" />
                          <span>Keluarkan</span>
                        </button>
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
      {cat.id === "data" && (
        <section className="space-y-5 pb-4">
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

          {/* ========================================================= */}
          {/* LAPORAN KADER POSYANDU 6 BIDANG SPM                       */}
          {/* ========================================================= */}
          {/* 1. Komunitas Posyandu: Formulir Input & Riwayat Laporan (Khusus Admin / Pengurus & Kader) */}
          {komunitasData.jenis === "posyandu" && canAccessLaporanPosyandu && (
            <LaporanKaderSpmFormCard
              komunitas={komunitasData}
              currentUserId={currentUserId}
              userName={myProfileName}
              isAdminOrKader={canAccessLaporanPosyandu}
            />
          )}

          {/* 2. Komunitas Kelurahan, Kecamatan, dan Kota Tegal: Rekap Laporan Wilayah */}
          {komunitasData.jenis === "warga_kita" && isAdminOrKader && (
            <RekapLaporanKaderWilayahCard
              komunitas={komunitasData}
              isAdminOrKader={isAdminOrKader}
              currentUserId={currentUserId}
            />
          )}

          {/* Visualisasi Grafik & Chart Statistik Wilayah */}
          <KomunitasProfilCharts
            komunitas={komunitas}
            dataAnakList={dataAnakList}
            dataAtsList={dataAtsList}
            userRole={userPeran}
            isChartOnly={isChartOnly}
          />
        </section>
      )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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

      {/* Modal Konfirmasi Keluar Komunitas */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600">
                  <LogOut className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Keluar dari Komunitas?
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {formattedTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setIsLeaveModalOpen(false)}
                disabled={actionLoading}
                className="rounded-xl p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  actionFeedback.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-300 bg-rose-50 text-rose-800"
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Apakah Anda yakin ingin keluar dan tidak bergabung lagi di <strong>{formattedTitle}</strong>?
              </p>
              {isWargaKita && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium leading-relaxed">
                  Perhatian: Keluar dari komunitas RT Warga Kita akan otomatis melepaskan keterhubungan domisili Anda pada tingkatan RW, Kelurahan, dan Kecamatan terkait.
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLeave}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Ya, Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Berhenti Jadi Admin / Batalkan Pengajuan Admin */}
      {isResignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700">
                  <UserMinus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isUserAdmin ? "Berhenti Menjadi Admin?" : "Batalkan Permohonan?"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {formattedTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setIsResignModalOpen(false)}
                disabled={actionLoading}
                className="rounded-xl p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  actionFeedback.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-300 bg-rose-50 text-rose-800"
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="space-y-3 text-sm text-slate-600">
              <p>
                {isUserAdmin
                  ? "Apakah Anda yakin ingin berhenti dari status Admin/Pengurus resmi di komunitas ini? Peran Anda akan dikembalikan menjadi warga/anggota biasa."
                  : "Apakah Anda yakin ingin membatalkan permohonan keanggotaan/pengajuan Admin ini?"}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResignModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleResign}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4" />
                    <span>{isUserAdmin ? "Ya, Lepas Admin" : "Ya, Batalkan"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Keluarkan Anggota (Khusus Admin) */}
      {kickTargetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Keluarkan Anggota?
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Konfirmasi Tindakan Pengurus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setKickTargetMember(null)}
                disabled={actionLoading}
                className="rounded-xl p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  actionFeedback.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-300 bg-rose-50 text-rose-800"
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Apakah Anda yakin ingin mengeluarkan anggota berikut dari <strong>{formattedTitle}</strong>?
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-base">
                  {kickTargetMember.profiles?.nama_lengkap || "Pengguna"}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{kickTargetMember.profiles?.email || "-"}</span>
                  <span className="font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    {formatPeranDisplay(kickTargetMember.peran)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-rose-600 font-semibold leading-relaxed">
                * Pengguna yang dikeluarkan akan kehilangan akses ke data dan aktivitas internal komunitas ini sampai bergabung kembali.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setKickTargetMember(null)}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleKickMember}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4" />
                    <span>Ya, Keluarkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
