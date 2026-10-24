"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
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
  BookOpen,
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
  MessageCircle,
  School,
  BarChart3,
  Plus,
  Search,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { WargaOnboardingModal } from "@/components/komunitas/warga-onboarding-modal";
import { EditInformasiOperasionalModal } from "@/components/komunitas/edit-informasi-operasional-modal";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { LaporanKaderSpmFormCard } from "@/components/komunitas/laporan-kader-spm-form-card";
import { RekapLaporanKaderWilayahCard } from "@/components/komunitas/rekap-laporan-kader-wilayah-card";
import { KomunitasPercakapanTab } from "@/components/komunitas/komunitas-percakapan-tab";
import { AjukanPerubahanPeranModal } from "@/components/komunitas/ajukan-perubahan-peran-modal";
import { ManageGrupMembersModal } from "@/components/kabar/manage-grup-members-modal";
import { CardDataAnak } from "@/components/data-anak/card-data-anak";
import { FormDataAnak } from "@/components/data-anak/form-data-anak";
import { KomunitasRekapGrafikView } from "@/components/data-anak/komunitas-rekap-grafik-view";
import { isKomunitasLayananPaud } from "@/lib/data-anak-helpers";
import {
  buildKomunitasScopedRekap,
  type KomunitasScopedRekapResult,
} from "@/lib/komunitas-rekap-calculator";
import {
  applyForAdminKomunitas,
  leaveKomunitas,
  resignAdminKomunitas,
  kickMemberByAdmin,
  toggleKomunitasKartuLayananAction,
} from "@/app/actions/komunitas";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  KabarItem,
  DataAnakItem,
  DataAtsItem,
} from "@/types/database";
import {
  cn,
  hasFullProfilDataAccess,
  parseKontakKomunitas,
  parseJadwalPosyandu,
  parseCakupanWilayah,
  formatWhatsAppUrl,
  formatPeranDisplay,
  isRoleAdmin,
  isSuperAdmin,
} from "@/lib/utils";
import { extractKomunitasMetadata, getKomunitasFeatureCards, cleanDeskripsiDisplay } from "@/lib/admin-helpers";

interface KomunitasDetailClientViewProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
  isAdminOrKader: boolean;
  isSuperAdmin?: boolean;
  isAdminPusat?: boolean;
  isSuperOrAdminPusat?: boolean;
  currentSubtab?: string | null;
  anggotaList: AnggotaKomunitasDetail[];
  kabarKomunitas: KabarItem[];
  dataAnakList?: DataAnakItem[];
  dataAtsList?: DataAtsItem[];
  dataAnakStats?: {
    total: number;
    approved: number;
    pending: number;
  };
  canValidateDataAnak?: boolean;
  canCreateDataAnak?: boolean;
  canEditDataAnak?: boolean;
  canDeleteDataAnak?: boolean;
  isReadOnlyDataAnak?: boolean;
  canViewDetailDataAnak?: boolean;
  userRoleDataAnak?: string;
  scopedRekapResult?: KomunitasScopedRekapResult | null;
}

export function KomunitasDetailClientView({
  komunitas,
  currentUserId,
  isAdminOrKader,
  isSuperAdmin: isSuperAdminProp,
  isAdminPusat: isAdminPusatProp,
  isSuperOrAdminPusat: isSuperOrAdminPusatProp,
  currentSubtab,
  anggotaList,
  kabarKomunitas,
  dataAnakList = [],
  dataAtsList = [],
  dataAnakStats,
  canValidateDataAnak,
  canCreateDataAnak,
  canEditDataAnak,
  canDeleteDataAnak,
  isReadOnlyDataAnak,
  canViewDetailDataAnak,
  userRoleDataAnak,
  scopedRekapResult,
}: KomunitasDetailClientViewProps) {
  const [komunitasData, setKomunitasData] = useState(komunitas);

  const initialActiveTab = useMemo(() => {
    if (!currentSubtab || currentSubtab === "data") {
      return null;
    }
    if (!currentUserId && currentSubtab === "anggota") {
      return null;
    }
    return currentSubtab;
  }, [currentUserId, currentSubtab]);
  const [activeTab, setActiveTab] = useState<string | null>(initialActiveTab);

  // State untuk data anak & ATS komunitas
  const [dataAnakState, setDataAnakState] = useState<DataAnakItem[]>(dataAnakList);
  const [dataAtsState, setDataAtsState] = useState<DataAtsItem[]>(dataAtsList);

  useEffect(() => {
    setDataAnakState(dataAnakList);
  }, [dataAnakList]);

  useEffect(() => {
    setDataAtsState(dataAtsList);
  }, [dataAtsList]);

  // State khusus Komunitas PAUD
  const isPaudCommunity = isKomunitasLayananPaud(
    komunitasData,
    komunitasData.nama,
    komunitasData.jenis
  );

  const [activePaudTab, setActivePaudTab] = useState<
    "anak" | "rekap" | "anggota" | "kabar" | "percakapan"
  >(() => {
    if (currentSubtab === "rekap") return "rekap";
    if (currentSubtab === "anggota") return "anggota";
    if (currentSubtab === "kabar") return "kabar";
    if (currentSubtab === "percakapan") return "percakapan";
    return "anak";
  });
  const [paudStatusFilter, setPaudStatusFilter] = useState<"semua" | "approved" | "pending">("semua");
  const [searchQueryAnak, setSearchQueryAnak] = useState("");
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);

  const rekapPaudCalc = useMemo(() => {
    if (scopedRekapResult) {
      return scopedRekapResult;
    }
    return buildKomunitasScopedRekap(komunitasData, dataAnakState);
  }, [komunitasData, dataAnakState, scopedRekapResult]);

  const totalChildren = dataAnakStats?.total ?? dataAnakState.length;
  const totalApproved =
    dataAnakStats?.approved ??
    dataAnakState.filter((c) => c.status_approval === "approved").length;
  const totalPending =
    dataAnakStats?.pending ??
    dataAnakState.filter((c) => c.status_approval === "pending").length;

  const paudDisplayedChildren = useMemo(() => {
    let list = dataAnakState;
    if (paudStatusFilter === "approved") {
      list = list.filter((c) => c.status_approval === "approved");
    } else if (paudStatusFilter === "pending") {
      list = list.filter((c) => c.status_approval !== "approved");
    }
    if (!searchQueryAnak.trim()) return list;
    const q = searchQueryAnak.toLowerCase().trim();
    return list.filter(
      (c) =>
        c.nama_lengkap.toLowerCase().includes(q) ||
        c.nama_orangtua.toLowerCase().includes(q) ||
        (c.alasan_sekolah && c.alasan_sekolah.toLowerCase().includes(q))
    );
  }, [dataAnakState, paudStatusFilter, searchQueryAnak]);

  // Helper identifikasi fitur & kartu komunitas
  const featureCards = useMemo(
    () => getKomunitasFeatureCards(komunitasData),
    [komunitasData]
  );
  const canShowDataAnakCard = featureCards.canShowDataAnak;
  const canShowDataAtsCard = featureCards.canShowDataAts;

  const cleanKomNama = (komunitasData.nama || "").toLowerCase().trim();
  const isSkb =
    komunitasData.jenis_institusi === "SKB" ||
    cleanKomNama.includes("skb") ||
    cleanKomNama.includes("sanggar kegiatan belajar");

  const isStarOfTomorrow = cleanKomNama.includes("star of tomorrow");

  const isPkbmOrSkb =
    komunitasData.jenis === "pkbm_skb" ||
    komunitasData.jenis_institusi === "PKBM" ||
    komunitasData.jenis_institusi === "SKB" ||
    cleanKomNama.includes("pkbm") ||
    isSkb;

  const isPureSatuanPaud = komunitasData.jenis === "satuan_paud" && !isPkbmOrSkb;

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [membershipState, setMembershipState] = useState(komunitas.currentUserMembership);
  const [isWargaOnboardingOpen, setIsWargaOnboardingOpen] = useState(false);
  const [isEditOperasionalOpen, setIsEditOperasionalOpen] = useState(false);
  const [isUbahPeranOpen, setIsUbahPeranOpen] = useState(false);
  const [isManageCardsOpen, setIsManageCardsOpen] = useState(false);
  const [cardActionLoading, setCardActionLoading] = useState(false);

  const handleToggleCard = async (kartu: "data_anak" | "data_ats", enable: boolean) => {
    setCardActionLoading(true);
    try {
      const res = await toggleKomunitasKartuLayananAction(komunitasData.id, kartu, enable);
      if (res.success) {
        let currentDesc = komunitasData.deskripsi || "";
        const tag = `[kartu:${kartu}]`;
        if (enable) {
          if (!currentDesc.includes(tag)) {
            currentDesc = `${tag} ${currentDesc}`.trim();
          }
        } else {
          currentDesc = currentDesc.replace(new RegExp(`\\[kartu:${kartu}\\]\\s*`, "g"), "").trim();
          currentDesc = currentDesc.replace(new RegExp(`\\[fitur:${kartu}\\]\\s*`, "g"), "").trim();
        }
        setKomunitasData((prev) => ({
          ...prev,
          deskripsi: currentDesc,
        }));
        setActionFeedback({ type: "success", message: res.message });
      } else {
        setActionFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setActionFeedback({ type: "error", message: err.message || "Gagal mengubah kartu layanan." });
    } finally {
      setCardActionLoading(false);
    }
  };

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
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [kickTargetMember, setKickTargetMember] = useState<AnggotaKomunitasDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const membership = membershipState;
  const isApprovedMember = membership?.status === "approved";
  const userPeran = membership?.peran || "Pengunjung";
  const roleLower = userPeran.toLowerCase().trim();

  // Root Authority: Super Admin & Admin Pusat memiliki akses bebas mutlak ke seluruh komunitas tanpa harus bergabung
  const isSuperOrPusat = Boolean(
    isSuperOrAdminPusatProp ||
    isSuperAdminProp ||
    isAdminPusatProp ||
    roleLower === "super admin" ||
    roleLower === "super_admin" ||
    roleLower === "admin pusat" ||
    roleLower === "admin_pusat" ||
    (membership && isSuperAdmin(membership as any))
  );
  const isActualSuperAdmin = Boolean(
    isSuperAdminProp ||
    roleLower === "super admin" ||
    roleLower === "super_admin" ||
    (membership && isSuperAdmin(membership as any))
  );
  const isActualAdminPusat = Boolean(
    isAdminPusatProp ||
    (!isActualSuperAdmin && (roleLower === "admin pusat" || roleLower === "admin_pusat"))
  );

  const isWargaKita = komunitasData.jenis === "warga_kita";
  const isPaud = komunitasData.jenis === "satuan_paud";
  const isPosyandu = komunitasData.jenis === "posyandu";

  const meta = useMemo(() => extractKomunitasMetadata(komunitasData), [komunitasData]);
  const isRt = isWargaKita && Boolean(komunitasData.rt && komunitasData.rt.trim() !== "" && komunitasData.rt !== "semua" && komunitasData.rt !== "00");
  const isRekapOnlyTier = isWargaKita && !isRt;
  const tierLevelLabel = isRt
    ? `RT ${meta.rt || ""}`
    : meta.hasRw
    ? `RW ${meta.rw || ""}`
    : meta.hasKel
    ? `Kelurahan ${meta.rawKel || ""}`
    : (meta.rawKec && meta.rawKec !== "Kota Tegal")
    ? `Kecamatan ${meta.rawKec || ""}`
    : "Kota Tegal";

  // Hanya Komunitas RT, Posyandu, dan Satuan PAUD yang memiliki fungsi gabung langsung.
  // Komunitas RW, Kelurahan, Kecamatan, dan Kota Tegal tidak memiliki fungsi gabung langsung.
  // Super Admin dan Admin Pusat tidak perlu bergabung ke komunitas manapun
  const canJoin =
    !isSuperOrPusat &&
    (isPosyandu ||
    isPaud ||
    (isWargaKita && isRt));

  // Ketentuan Hak Akses:
  // Super Admin & Admin Pusat: Hak akses penuh ke seluruh data dan komunitas.
  // Data lengkap hanya dapat dilihat oleh Admin di Komunitas Warga Kita (khusus level RT), Admin PAUD, dan Admin/Kader Posyandu.
  // Komunitas RW, Kelurahan, Kecamatan, dan Kota Tegal menampilkan data rekap agregat.
  const hasFullAccess = useMemo(() => {
    if (isSuperOrPusat) return true;
    if (isPaud) {
      const p = userPeran.toLowerCase();
      return isAdminOrKader || isRoleAdmin(userPeran) || p.includes("kepala") || p.includes("guru") || p.includes("pendidik") || p.includes("pengelola");
    }
    if (isPosyandu) {
      const p = userPeran.toLowerCase();
      return isAdminOrKader || isRoleAdmin(userPeran) || p.includes("kader") || p.includes("bidan") || p.includes("medis") || p.includes("nakes");
    }
    if (isWargaKita) {
      return isRt && (isAdminOrKader || isRoleAdmin(userPeran));
    }
    return false;
  }, [isSuperOrPusat, isPaud, isPosyandu, isWargaKita, isRt, userPeran, isAdminOrKader]);

  const isPenduduk =
    isApprovedMember &&
    (userPeran === "Penduduk" ||
      (membership?.berdomisili === true && membership?.kk_terdaftar === true));
  const isPendamping =
    isApprovedMember &&
    (userPeran.toLowerCase().trim() === "pendamping" ||
      userPeran.toLowerCase().trim().includes("pendamping"));
  const isKader =
    isApprovedMember &&
    (userPeran.toLowerCase().trim() === "kader" ||
      userPeran.toLowerCase().trim().includes("kader"));
  const isUserAdmin = isApprovedMember && isRoleAdmin(userPeran);
  const isUserPendingAdmin = Boolean(membership?.peran_diajukan && isRoleAdmin(membership.peran_diajukan));

  // Otorisasi Edit Informasi Resmi & Operasional (Super Admin, Admin Hierarki, Admin Langsung, Pengurus, Kader, dll.)
  const canEditOperasional = useMemo(() => {
    if (isSuperOrPusat) return true;
    if (isAdminOrKader) return true;
    if (!currentUserId) return false;
    if (!isApprovedMember) return false;
    return isRoleAdmin(userPeran) || isKader;
  }, [isSuperOrPusat, isAdminOrKader, currentUserId, isApprovedMember, userPeran, isKader]);

  // Otorisasi Akses Laporan Kader Posyandu 6 Bidang SPM:
  // Hanya Admin / Pengurus dan Kader Komunitas Posyandu yang bersangkutan (serta Super Admin & Admin Wilayah yang menaunginya)
  const canAccessLaporanPosyandu = useMemo(() => {
    if (isSuperOrPusat) return true;
    if (!currentUserId) return false;
    if (isAdminOrKader) return true;
    return isApprovedMember && (isUserAdmin || isKader);
  }, [isSuperOrPusat, isAdminOrKader, currentUserId, isApprovedMember, userPeran, isKader]);

  const parsedKontak = useMemo(
    () => parseKontakKomunitas(komunitasData.kontak),
    [komunitasData.kontak]
  );

  const parsedCakupanWilayah = useMemo(
    () => parseCakupanWilayah(komunitasData),
    [komunitasData]
  );

  const parsedJadwalPosyandu = useMemo(
    () => parseJadwalPosyandu(komunitasData.jadwal),
    [komunitasData.jadwal]
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

  // Cek apakah komunitas sudah memiliki admin terverifikasi/disetujui,
  // baik dari payload server (komunitas.hasAdmin) maupun dari daftar anggota approved
  const adminMemberFromList = useMemo(() => {
    return anggotaState.find(
      (m) => m.status === "approved" && isRoleAdmin(m.peran)
    );
  }, [anggotaState]);

  const hasCommunityAdmin = Boolean(
    komunitas.hasAdmin || adminMemberFromList
  );

  const effectiveAdminName =
    komunitas.adminName ||
    adminMemberFromList?.profiles?.nama_lengkap ||
    "Pengurus Komunitas";

  const effectiveAdminRole =
    komunitas.adminRole ||
    (adminMemberFromList ? formatPeranDisplay(adminMemberFromList.peran) : "Pengurus");

  const effectiveAdminHp =
    komunitas.adminHp ||
    adminMemberFromList?.profiles?.nomor_hp ||
    parsedKontak.utama ||
    null;

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
    if (isSuperOrPusat) return true;

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

    if (komunitas.jenis === "satuan_paud" || isPkbmOrSkb) {
      return (
        isAdminOrKader ||
        (isApproved &&
          (roleLower.includes("kepala") ||
            roleLower.includes("pimpinan") ||
            roleLower.includes("pengelola") ||
            roleLower.includes("tutor") ||
            roleLower.includes("pamong") ||
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
  }, [isSuperOrPusat, komunitas.jenis, isPkbmOrSkb, membership, isAdminOrKader, currentUserId]);

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
    ...(canShowDataAnakCard
      ? [
          {
            id: "data_anak" as const,
            href: `/komunitas/${komunitas.id}/data`,
            title: isRekapOnlyTier
              ? "Rekapitulasi Data Anak Usia Dini (0–6 Tahun)"
              : "Data Anak (0–6 Tahun) & DDTK",
            subtitle: isRekapOnlyTier
              ? `Pantau rekapitulasi data agregat balita, sebaran satuan PAUD, dan capaian ${tierLevelLabel}`
              : hasFullAccess
              ? "Kelola pendaftaran balita RT, riwayat DDTK tumbuh kembang, dan validasi data"
              : `Pantau data agregat balita dan catatan DDTK ${tierLevelLabel}`,
            badgeText: isRekapOnlyTier ? "Data Rekapitulasi" : `${dataAnakState.length} Balita / Anak`,
            icon: Baby,
            hoverBorder: "hover:border-primary/40",
            hoverBg: "hover:bg-primary/5",
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
            arrowBg: "bg-muted",
            arrowHoverBg: "group-hover:bg-primary group-hover:text-primary-foreground",
            arrowColor: "text-muted-foreground",
            textHoverColor: "group-hover:text-primary",
          },
        ]
      : []),
    ...(canShowDataAtsCard
      ? [
          {
            id: "data_ats" as const,
            href: `/komunitas/${komunitas.id}/ats`,
            title: isRekapOnlyTier
              ? "Rekapitulasi Data ATS (Anak Tidak Sekolah)"
              : "Data ATS (Anak Tidak Sekolah)",
            subtitle: isRekapOnlyTier
              ? `Pantau rekapitulasi penanganan ATS, kelompok umur, dan rekomendasi intervensi ${tierLevelLabel}`
              : isPkbmOrSkb
              ? "Data seluruh Anak Tidak Sekolah se-Kota Tegal untuk dipantau dan diintervensi kembali bersekolah"
              : hasFullAccess
              ? "Pendataan Anak Tidak Sekolah, pemantauan alasan, dan verifikasi data RT"
              : `Pantau hasil pendataan kasus anak tidak sekolah ${tierLevelLabel}`,
            badgeText: isRekapOnlyTier
              ? "Data Rekapitulasi"
              : isPkbmOrSkb
              ? `${dataAtsState.length} Kasus ATS (Se-Kota Tegal)`
              : `${dataAtsState.length} Kasus ATS`,
            icon: GraduationCap,
            hoverBorder: "hover:border-secondary/40",
            hoverBg: "hover:bg-secondary/10",
            iconColor: "text-secondary",
            iconBg: "bg-secondary/15",
            arrowBg: "bg-muted",
            arrowHoverBg: "group-hover:bg-secondary group-hover:text-secondary-foreground",
            arrowColor: "text-muted-foreground",
            textHoverColor: "group-hover:text-secondary",
          },
        ]
      : []),
  ];

  const detailAccordionCategories = [
    {
      id: "percakapan",
      title: "Percakapan Komunitas",
      subtitle: "Ruang diskusi dan koordinasi interaktif seluruh anggota komunitas",
      badgeText: "Chat Grup",
      icon: MessageCircle,
      activeColorBg: "bg-primary text-primary-foreground",
      badgeColor: "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30",
      hoverBorder: "hover:border-primary/40",
      hoverBg: "hover:bg-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      id: "kabar",
      title: "Kabar Komunitas",
      subtitle: "Pengumuman dan diskusi interaktif anggota komunitas",
      badgeText: `${kabarKomunitas.length} Kabar`,
      icon: MessageSquare,
      activeColorBg: "bg-primary text-primary-foreground",
      badgeColor: "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30",
      hoverBorder: "hover:border-primary/40",
      hoverBg: "hover:bg-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    ...(currentUserId
      ? [
          {
            id: "anggota" as const,
            title: "Daftar Anggota & Informasi Operasional",
            subtitle:
              komunitas.jenis === "posyandu"
                ? "Informasi operasional, struktur pengurus dan 6 bidang kader"
                : "Informasi operasional dan struktur pengurus komunitas",
            badgeText: `${anggotaState.filter((m) => m.status === "approved").length} Anggota`,
            icon: Users,
            activeColorBg: "bg-primary text-primary-foreground",
            badgeColor: "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30",
            hoverBorder: "hover:border-primary/40",
            hoverBg: "hover:bg-primary/5",
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
          },
        ]
      : []),
  ];

  // Urutkan kategori: Kartu yang terbuka posisinya otomatis berada di paling atas
  const sortedDetailCategories = [
    ...(activeTab ? detailAccordionCategories.filter((c) => c.id === activeTab) : []),
    ...detailAccordionCategories.filter((c) => c.id !== activeTab),
  ];

  // =========================================================================
  // TAMPILAN KHUSUS KOMUNITAS PAUD (TK, KB, SPS, TPA, RA, PKBM & SKB)
  // =========================================================================
  if (isPaudCommunity) {
    return (
      <div className="space-y-4">
        {/* 1. HERO HEADER CARD KHUSUS LEMBAGA PAUD */}
        <section className="relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          {/* Baris Paling Atas: Badge Kategori, Wilayah & Aksi Status User */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/70">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="rounded-md px-2.5 py-0.5 text-2xs font-extrabold border bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30 uppercase tracking-wide">
                {isSkb
                  ? "SKB (SANGGAR KEGIATAN BELAJAR)"
                  : isStarOfTomorrow
                  ? "PKBM & SATUAN PAUD"
                  : cleanKomNama.includes("tk")
                  ? "TAMAN KANAK-KANAK (TK)"
                  : cleanKomNama.includes("kb")
                  ? "KELOMPOK BERMAIN (KB)"
                  : cleanKomNama.includes("sps")
                  ? "SATUAN PAUD SEJENIS (SPS)"
                  : cleanKomNama.includes("tpa")
                  ? "TEMPAT PENITIPAN ANAK (TPA)"
                  : cleanKomNama.includes("ra")
                  ? "RAUDHATUL ATHFAL (RA)"
                  : "SATUAN PENDIDIKAN PAUD"}
              </span>
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {komunitas.kelurahan && komunitas.kelurahan !== "Semua Kelurahan"
                  ? `${komunitas.kelurahan}, ${komunitas.kecamatan || "Kota Tegal"}`
                  : komunitas.kecamatan && komunitas.kecamatan !== "Kota Tegal"
                  ? `Kecamatan ${komunitas.kecamatan}, Kota Tegal`
                  : "Kota Tegal, Jawa Tengah"}
              </span>
              <span className="text-muted-foreground/40 hidden sm:inline">•</span>
              <span className="text-xs font-bold text-foreground font-mono hidden sm:inline">
                {totalChildren} Siswa Terdaftar
              </span>
              <span className="text-muted-foreground/40 hidden sm:inline">•</span>
              <span className="text-xs font-bold text-foreground font-mono hidden sm:inline">
                {approvedMembers.length} Anggota / Pendidik
              </span>
            </div>

            {/* Status Peran & Tombol Aksi Pengguna */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isSuperOrPusat ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary text-secondary-foreground px-2.5 py-1 text-2xs font-bold shadow-2xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{isActualSuperAdmin ? "SUPER ADMIN" : "ADMIN PUSAT"}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsManageCardsOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                    title="Kelola Kartu Layanan (Data Anak & ATS)"
                  >
                    <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">Kelola Kartu</span>
                  </button>
                </div>
              ) : isApprovedMember ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-800 dark:text-teal-300 border border-teal-500/20 shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>{formatPeranDisplay(userPeran).toUpperCase()}</span>
                  </span>

                  {membershipState?.peran_diajukan &&
                    membershipState.peran_diajukan.toLowerCase() !== userPeran.toLowerCase() && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 border border-secondary/30">
                        <Clock className="h-3.5 w-3.5 text-secondary animate-pulse" />
                        <span>MENUNGGU: {formatPeranDisplay(membershipState.peran_diajukan).toUpperCase()}</span>
                      </span>
                    )}

                  <button
                    type="button"
                    onClick={() => setIsUbahPeranOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                    title="Ajukan perubahan peran kepada Admin"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden sm:inline">Ajukan Peran</span>
                  </button>
                </div>
              ) : membership?.status === "pending" || membership?.peran_diajukan ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 border border-secondary/30">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    <span>MENUNGGU PERSETUJUAN</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsResignModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted text-foreground px-2 py-1 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Batal</span>
                  </button>
                </div>
              ) : canJoin ? (
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-2xs transition-all active:scale-98 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Bergabung</span>
                </button>
              ) : null}

              {/* Tombol EDIT INFORMASI LEMBAGA (Khusus Admin/Pengurus/Pendidik) */}
              {canEditOperasional && (
                <button
                  type="button"
                  onClick={() => setIsEditOperasionalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                  title="Edit data dan informasi operasional lembaga PAUD ini"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Informasi</span>
                </button>
              )}
            </div>
          </div>

          {/* NAMA PAUD (PALING ATAS, BESAR & MENCOLOK) */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/25 shadow-xs">
              <School className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                {komunitasData.nama}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1 truncate max-w-xl">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{komunitasData.lokasi}</span>
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="font-semibold text-foreground">
                  Lembaga PAUD Terdaftar
                </span>
              </div>
            </div>
          </div>

          {/* INFORMASI TENTANG LEMBAGA PAUD (DI DALAM KARTU YANG SAMA) */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                Informasi Lembaga &amp; Operasional
              </span>
              {canEditOperasional && (
                <button
                  type="button"
                  onClick={() => setIsEditOperasionalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Ubah Data Lembaga</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* 1. Alamat Lembaga */}
              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Alamat Lembaga
                </span>
                <p className="font-semibold text-foreground leading-relaxed">
                  {komunitasData.lokasi || "Alamat belum dicantumkan"}
                </p>
              </div>

              {/* 2. Jam Operasional / Jadwal Layanan */}
              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Jam Operasional / Jadwal
                </span>
                <p className="font-semibold text-foreground leading-relaxed">
                  {komunitasData.jadwal || "Senin - Jumat 07:30 - 11:00 WIB"}
                </p>
              </div>

              {/* 3. Kontak Resmi & WhatsApp */}
              <div className="p-3 rounded-lg bg-card border border-border space-y-1 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  Kontak &amp; WhatsApp
                </span>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className="font-mono font-bold text-foreground truncate">
                    {effectiveAdminHp || parsedKontak.utama || komunitasData.kontak || "Belum dicantumkan"}
                  </p>
                  {(effectiveAdminHp || parsedKontak.utama) && (
                    <a
                      href={formatWhatsAppUrl(
                        effectiveAdminHp || parsedKontak.utama,
                        `Halo Pengurus/Guru ${komunitasData.nama}, saya ingin menanyakan informasi pendaftaran/sekolah...`
                      ) || `https://wa.me/${(effectiveAdminHp || parsedKontak.utama).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs shadow-2xs transition-all active:scale-95 shrink-0"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Profil, Visi & Deskripsi Lembaga */}
            {komunitasData.deskripsi && cleanDeskripsiDisplay(komunitasData.deskripsi) && (
              <div className="p-3 rounded-lg bg-card border border-border text-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Profil &amp; Visi Lembaga
                </span>
                <p className="text-foreground leading-relaxed font-medium">
                  {cleanDeskripsiDisplay(komunitasData.deskripsi)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 2. TAB NAVIGASI UTAMA KOMUNITAS PAUD */}
        <div className="space-y-4">
          {/* Tab Bar Horizontal */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80">
            {/* Tab 1: Daftar Detail Anak */}
            <button
              type="button"
              onClick={() => setActivePaudTab("anak")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0",
                activePaudTab === "anak"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
            >
              <Baby className="h-4 w-4" />
              <span>Daftar Detail Anak</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-md font-mono text-2xs",
                  activePaudTab === "anak"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {totalChildren}
              </span>
            </button>

            {/* Tab 2: Rekap, Grafik & Diagram */}
            <button
              type="button"
              onClick={() => setActivePaudTab("rekap")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0",
                activePaudTab === "rekap"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Rekap, Grafik &amp; Diagram</span>
            </button>

            {/* Tab 3: Daftar Anggota */}
            <button
              type="button"
              onClick={() => setActivePaudTab("anggota")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0",
                activePaudTab === "anggota"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Daftar Anggota</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-md font-mono text-2xs",
                  activePaudTab === "anggota"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {approvedMembers.length}
              </span>
            </button>

            {/* Tab 4: Kabar Komunitas */}
            <button
              type="button"
              onClick={() => setActivePaudTab("kabar")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0",
                activePaudTab === "kabar"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Kabar Komunitas</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-md font-mono text-2xs",
                  activePaudTab === "kabar"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {kabarKomunitas.length}
              </span>
            </button>

            {/* Tab 5: Percakapan Komunitas */}
            <button
              type="button"
              onClick={() => setActivePaudTab("percakapan")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0",
                activePaudTab === "percakapan"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Percakapan Komunitas</span>
            </button>
          </div>

          {/* 3. KONTEN TAB AKTIF PAUD */}
          {activePaudTab === "anak" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Notice Banner untuk Read Only */}
              {isReadOnlyDataAnak && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4 flex items-start gap-3 text-foreground shadow-2xs">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">
                      Mode Akses: Tinjauan Siswa ({userRoleDataAnak || userPeran})
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Sebagai anggota di Satuan PAUD ini, Anda memiliki akses melihat profil siswa dan riwayat DDTK secara transparan. Pengelolaan data siswa dikelola oleh Admin, Kepala Sekolah, dan Guru PAUD.
                    </p>
                  </div>
                </div>
              )}

              {/* 3 STATISTIC METRIC CARDS (INTERAKTIF FILTER STATUS) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setPaudStatusFilter("semua")}
                  className={cn(
                    "rounded-lg border p-4 text-center space-y-1 shadow-sm cursor-pointer transition-all",
                    paudStatusFilter === "semua"
                      ? "border-primary bg-primary/10 shadow-2xs ring-1 ring-primary/30"
                      : "border-border bg-card hover:bg-muted/30"
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    TOTAL DATA ANAK
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                    {totalChildren}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Siswa Terdata
                  </span>
                </div>

                <div
                  onClick={() => setPaudStatusFilter("approved")}
                  className={cn(
                    "rounded-lg border p-4 text-center space-y-1 shadow-sm cursor-pointer transition-all",
                    paudStatusFilter === "approved"
                      ? "border-teal-500 bg-teal-500/15 shadow-2xs ring-1 ring-teal-500/30"
                      : "border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/15"
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
                    TERVERIFIKASI
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-teal-700 dark:text-teal-300">
                    {totalApproved}
                  </span>
                  <span className="text-xs font-semibold text-teal-800 dark:text-teal-300 block">
                    Status Valid
                  </span>
                </div>

                <div
                  onClick={() => setPaudStatusFilter("pending")}
                  className={cn(
                    "rounded-lg border p-4 text-center space-y-1 shadow-sm cursor-pointer transition-all",
                    paudStatusFilter === "pending"
                      ? "border-secondary bg-secondary/20 shadow-2xs ring-1 ring-secondary/40"
                      : "border-secondary/30 bg-secondary/10 hover:bg-secondary/15"
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 block">
                    MENUNGGU VALIDASI
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-secondary">
                    {totalPending}
                  </span>
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 block">
                    Perlu Verifikasi
                  </span>
                </div>
              </div>

              {/* SEARCH & TAMBAH DATA ANAK */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQueryAnak}
                    onChange={(e) => setSearchQueryAnak(e.target.value)}
                    placeholder="Cari nama anak atau orang tua..."
                    className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                {canCreateDataAnak && (
                  <button
                    type="button"
                    onClick={() => setIsAddChildModalOpen(true)}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground px-4 text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>TAMBAH DATA ANAK</span>
                  </button>
                )}
              </div>

              {/* FILTER CHIPS STATUS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setPaudStatusFilter("semua")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5",
                    paudStatusFilter === "semua"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>Semua Siswa</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                    {totalChildren}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaudStatusFilter("approved")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5",
                    paudStatusFilter === "approved"
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-teal-500/10 hover:text-teal-700"
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Terverifikasi</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                    {totalApproved}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaudStatusFilter("pending")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5",
                    paudStatusFilter === "pending"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-amber-500/10 hover:text-amber-800"
                  )}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Menunggu Validasi</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                    {totalPending}
                  </span>
                </button>
              </div>

              {/* LIST KARTU DATA ANAK */}
              <div className="space-y-2.5 pb-8">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-xs font-bold uppercase text-foreground tracking-wider flex items-center gap-1.5">
                    <span>DAFTAR DETAIL ANAK</span>
                    <span className="font-mono text-muted-foreground">
                      ({paudDisplayedChildren.length} DATA)
                    </span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {paudDisplayedChildren.length} dari total {totalChildren} anak
                  </span>
                </div>

                {paudDisplayedChildren.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Baby className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-bold tracking-tight text-foreground">
                        Belum Ada Data Siswa
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {searchQueryAnak
                          ? "Tidak ditemukan siswa yang sesuai dengan kata kunci pencarian."
                          : "Admin, Kepala Sekolah, dan Guru PAUD dapat menambahkan siswa terdaftar di satuan PAUD ini."}
                      </p>
                    </div>
                  </div>
                ) : (
                  paudDisplayedChildren.map((child) => (
                    <CardDataAnak
                      key={child.id}
                      anak={child}
                      komunitas={komunitasData}
                      canValidate={canValidateDataAnak ?? false}
                      canEdit={canEditDataAnak ?? false}
                      canDelete={canDeleteDataAnak ?? false}
                      isReadOnly={isReadOnlyDataAnak ?? false}
                      onUpdate={(updated) => {
                        setDataAnakState((prev) =>
                          prev.map((c) => (c.id === updated.id ? updated : c))
                        );
                      }}
                      onDelete={(deletedId) => {
                        setDataAnakState((prev) =>
                          prev.filter((c) => c.id !== deletedId)
                        );
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REKAP, GRAFIK & DIAGRAM */}
          {activePaudTab === "rekap" && (
            <div className="space-y-6 animate-in fade-in duration-150 pb-8">
              <KomunitasRekapGrafikView
                scopeRekapItem={rekapPaudCalc.scopeRekapItem}
                subTierItems={rekapPaudCalc.subTierItems}
                subTierTitle={rekapPaudCalc.subTierTitle}
                subTierColumnLabel={rekapPaudCalc.subTierColumnLabel}
                scopeType={rekapPaudCalc.scopeType}
                komunitasNama={komunitasData.nama}
              />
            </div>
          )}

          {/* TAB 3: DAFTAR ANGGOTA */}
          {activePaudTab === "anggota" && (
            <div className="space-y-4 animate-in fade-in duration-150 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-card p-3 sm:p-3.5 rounded-xl border border-border shadow-2xs">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Daftar Anggota &amp; Pendidik PAUD
                  </h3>
                  <p className="text-2xs text-muted-foreground font-medium">
                    Total {approvedMembers.length} pendidik, pengurus, dan orang tua aktif terdaftar
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(isUserAdmin || isSuperOrPusat) && (
                    <button
                      type="button"
                      onClick={() => setIsAddMemberModalOpen(true)}
                      className="inline-flex min-h-[34px] h-8 items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-3 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Tambah Anggota</span>
                    </button>
                  )}

                  {canManageMembers && (
                    <Link
                      href={`/komunitas/${komunitas.id}/anggota`}
                      className="inline-flex min-h-[34px] h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground px-3 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      <span>Kelola Anggota</span>
                    </Link>
                  )}
                </div>
              </div>

              {approvedMembers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-xs font-semibold text-muted-foreground">
                  Belum ada anggota atau guru terdaftar secara daring
                </div>
              ) : (
                <div className="space-y-2">
                  {approvedMembers.map((member) => {
                    const name = member.profiles?.nama_lengkap || "Warga Komunitas";
                    const initial = name.charAt(0).toUpperCase();
                    const isMe = currentUserId && member.user_id === currentUserId;
                    const isTargetSuperAdmin = isSuperAdmin(member.profiles);
                    const canKickThisMember = canManageMembers && !isMe && !isTargetSuperAdmin;

                    return (
                      <div
                        key={member.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                {name}
                              </h4>
                              {isMe && (
                                <span className="text-[9px] font-extrabold bg-primary/20 text-primary px-1.5 py-0.2 rounded">
                                  ANDA
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-2xs text-muted-foreground font-medium">
                              <span className="truncate">{member.profiles?.email || "-"}</span>
                              {member.profiles?.nomor_hp && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                    {member.profiles.nomor_hp}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <span
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-2xs font-bold border",
                              isRoleAdmin(member.peran)
                                ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 font-black"
                                : "bg-muted text-foreground border-border"
                            )}
                          >
                            {formatPeranDisplay(member.peran)}
                          </span>
                          {member.peran_diajukan && (
                            <span className="rounded-lg bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-2xs font-bold text-amber-900 dark:text-amber-200 border border-amber-200">
                              Diajukan: {formatPeranDisplay(member.peran_diajukan)}
                            </span>
                          )}

                          {isMe && (
                            <button
                              type="button"
                              onClick={() => setIsUbahPeranOpen(true)}
                              className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 text-2xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                              title="Ajukan perubahan peran kepada Admin"
                            >
                              <Sparkles className="h-3 w-3 text-primary" />
                              <span>Ubah Peran</span>
                            </button>
                          )}

                          {canKickThisMember && (
                            <button
                              type="button"
                              onClick={() => setKickTargetMember(member)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 text-2xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                              title={`Keluarkan ${name} dari komunitas`}
                            >
                              <UserX className="h-3 w-3 text-rose-600" />
                              <span>Keluarkan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KABAR KOMUNITAS */}
          {activePaudTab === "kabar" && (
            <div className="space-y-4 animate-in fade-in duration-150 pb-8">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Kabar &amp; Pengumuman Sekolah
                  </h3>
                  <p className="text-2xs text-muted-foreground">
                    Bagikan pengumuman, jadwal kegiatan belajar, dan kabar penting untuk seluruh warga sekolah
                  </p>
                </div>
              </div>

              {kabarKomunitas.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="text-sm font-bold tracking-tight text-foreground">
                      Belum Ada Kabar Komunitas
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Bagikan pengumuman atau jadwal kegiatan pertama untuk sekolah PAUD ini.
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

              <CreateKabarModal
                currentUserId={currentUserId}
                komunitasId={komunitas.id}
                komunitasNama={komunitasData.nama}
              />
            </div>
          )}

          {/* TAB 5: PERCAKAPAN KOMUNITAS */}
          {activePaudTab === "percakapan" && (
            <div className="space-y-4 animate-in fade-in duration-150 pb-8">
              <KomunitasPercakapanTab
                komunitas={komunitasData}
                currentUserId={currentUserId}
                isAdminOrKader={isAdminOrKader}
                onOpenJoinModal={() => setIsJoinModalOpen(true)}
              />
            </div>
          )}
        </div>

        {/* MODAL-MODAL TERKAIT KOMUNITAS PAUD */}
        {/* 1. Modal Edit Informasi Resmi & Operasional Lembaga */}
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

        {/* 2. Modal Tambah Data Siswa Baru */}
        {isAddChildModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Baby className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Tambah Data Siswa PAUD Baru
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {komunitasData.nama}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddChildModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <FormDataAnak
                komunitasId={komunitasData.id}
                komunitasNama={komunitasData.nama}
                jenisKomunitas={komunitasData.jenis}
                komunitas={komunitasData}
                onSuccess={() => {
                  setIsAddChildModalOpen(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}

        {/* 3. Modal Gabung Komunitas */}
        {isJoinModalOpen && canJoin && (
          <JoinKomunitasModal
            komunitas={komunitasData}
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
          />
        )}

        {/* 4. Modal Ajukan Perubahan Peran */}
        {isUbahPeranOpen && (
          <AjukanPerubahanPeranModal
            komunitas={{
              ...komunitasData,
              hasAdmin: hasCommunityAdmin,
            }}
            currentPeran={userPeran}
            currentPeranDiajukan={membershipState?.peran_diajukan}
            isOpen={isUbahPeranOpen}
            onClose={() => setIsUbahPeranOpen(false)}
            onSuccess={(newPeranDiajukan) => {
              setMembershipState((prev) =>
                prev
                  ? {
                      ...prev,
                      peran_diajukan: newPeranDiajukan,
                    }
                  : null
              );
              setAnggotaState((prev) =>
                prev.map((m) =>
                  m.user_id === currentUserId
                    ? { ...m, peran_diajukan: newPeranDiajukan }
                    : m
                )
              );
            }}
          />
        )}

        {/* 5. Modal Kelola Kartu Layanan (Super Admin & Admin Pusat) */}
        {isManageCardsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
            <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Kelola Kartu Layanan
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Khusus Super Admin &amp; Admin Pusat
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManageCardsOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Atur kartu layanan khusus yang diaktifkan untuk komunitas{" "}
                <strong className="text-foreground">{komunitasData.nama}</strong>.
              </p>

              <div className="space-y-3 pt-1">
                {/* Toggle Data Anak */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <Baby className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Data Anak (0–6 Tahun) &amp; DDTK
                      </h4>
                      <p className="text-2xs text-muted-foreground">
                        Pendataan balita dan tumbuh kembang
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={cardActionLoading}
                    onClick={() => handleToggleCard("data_anak", !canShowDataAnakCard)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50",
                      canShowDataAnakCard
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                        : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs"
                    )}
                  >
                    {cardActionLoading ? "..." : canShowDataAnakCard ? "Hapus Kartu" : "Tambah Kartu"}
                  </button>
                </div>

                {/* Toggle Data ATS */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary border border-secondary/30">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Data ATS (Anak Tidak Sekolah)
                      </h4>
                      <p className="text-2xs text-muted-foreground">
                        Kasus anak putus sekolah / tidak sekolah
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={cardActionLoading}
                    onClick={() => handleToggleCard("data_ats", !canShowDataAtsCard)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50",
                      canShowDataAtsCard
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                        : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs"
                    )}
                  >
                    {cardActionLoading ? "..." : canShowDataAtsCard ? "Hapus Kartu" : "Tambah Kartu"}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsManageCardsOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Modal Tambah & Kelola Anggota Komunitas */}
        {isAddMemberModalOpen && (
          <ManageGrupMembersModal
            isOpen={isAddMemberModalOpen}
            onClose={() => setIsAddMemberModalOpen(false)}
            room={{
              id: komunitas.id,
              nama: komunitas.nama,
              jenis: komunitas.jenis,
              deskripsi: komunitas.deskripsi,
              jumlah_anggota: anggotaState.length,
              is_kegiatan: komunitas.jenis === "kegiatan",
            }}
            existingMemberIds={anggotaState.map((a) => a.user_id)}
            allUsers={[]}
            canManage={true}
            currentUserId={currentUserId || null}
            initialTab="undang"
            onMembersUpdated={() => {
              window.location.reload();
            }}
          />
        )}

        {/* 7. Modal Konfirmasi Keluar Komunitas */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Keluar dari Komunitas?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {komunitasData.nama}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !actionLoading && setIsLeaveModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {actionFeedback && (
                <div
                  className={cn(
                    "p-3 rounded-lg text-xs font-semibold flex items-center gap-2",
                    actionFeedback.type === "success"
                      ? "bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/30"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}
                >
                  {actionFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">
                Anda akan keluar dari keanggotaan <strong className="text-foreground">{komunitasData.nama}</strong>. Anda tidak akan lagi menerima pemberitahuan kegiatan khusus sekolah ini sampai Anda bergabung kembali.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 h-9 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleLeave}
                  className="flex-1 h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Ya, Keluar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. Modal Resign Admin */}
        {isResignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    <UserMinus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Lepas Jabatan Admin?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {komunitasData.nama}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !actionLoading && setIsResignModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {actionFeedback && (
                <div
                  className={cn(
                    "p-3 rounded-lg text-xs font-semibold flex items-center gap-2",
                    actionFeedback.type === "success"
                      ? "bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/30"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}
                >
                  {actionFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">
                Anda akan melepaskan peran pengelolaan sebagai Admin di sekolah ini. Status keanggotaan Anda akan kembali menjadi anggota biasa.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setIsResignModalOpen(false)}
                  className="flex-1 h-9 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleResign}
                  className="flex-1 h-9 rounded-lg bg-secondary hover:bg-secondary-hover text-secondary-foreground text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Ya, Lepas Admin</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 9. Modal Konfirmasi Kick Member */}
        {kickTargetMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                    <UserX className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Keluarkan Anggota?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {komunitasData.nama}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !actionLoading && setKickTargetMember(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Apakah Anda yakin ingin mengeluarkan anggota berikut dari{" "}
                  <strong className="text-foreground">{komunitasData.nama}</strong>?
                </p>
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
                  <p className="font-bold text-foreground text-base">
                    {kickTargetMember.profiles?.nama_lengkap || "Pengguna"}
                  </p>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>{kickTargetMember.profiles?.email || "-"}</span>
                    <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                      {formatPeranDisplay(kickTargetMember.peran)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setKickTargetMember(null)}
                  disabled={actionLoading}
                  className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleKickMember}
                  disabled={actionLoading}
                  className="flex-1 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

  // =========================================================================
  // TAMPILAN STANDAR KOMUNITAS NON-PAUD (WARGA KITA & POSYANDU)
  // =========================================================================
  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* 1. HERO HEADER CARD (PADAT, RAPI, EFISIEN RUANG) */}
      <section className="relative overflow-hidden rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm">
        {/* Baris Atas: Kategori, Lokasi, Jumlah Anggota & Tombol Aksi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-border/60">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-2xs font-bold border shrink-0",
                komunitasData.jenis === "warga_kita" && "bg-primary/10 text-primary border-primary/20",
                komunitasData.jenis === "posyandu" && "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/20",
                isPkbmOrSkb && "bg-secondary/15 text-amber-900 dark:text-amber-200 border-secondary/30",
                isPureSatuanPaud && "bg-primary/10 text-primary border-primary/20",
                komunitasData.jenis === "kegiatan" && "bg-muted text-foreground border-border"
              )}
            >
              {komunitasData.jenis === "warga_kita"
                ? "WARGA KITA"
                : komunitasData.jenis === "posyandu"
                ? "POSYANDU"
                : isSkb
                ? "SKB"
                : isPkbmOrSkb
                ? (isStarOfTomorrow ? "PKBM & SATUAN PAUD" : "PKBM")
                : komunitasData.jenis === "kegiatan"
                ? "GRUP KEGIATAN"
                : "KOMUNITAS"}
            </span>
            <span className="text-xs font-semibold text-muted-foreground truncate">
              {komunitas.kelurahan && komunitas.kelurahan !== "Semua Kelurahan"
                ? `${komunitas.kelurahan}, ${komunitas.kecamatan || "Kota Tegal"}`
                : komunitas.kecamatan && komunitas.kecamatan !== "Kota Tegal"
                ? `Kecamatan ${komunitas.kecamatan}, Kota Tegal`
                : "Kota Tegal, Jawa Tengah"}
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span className="text-xs font-bold text-foreground font-mono hidden sm:inline">
              {komunitas.jumlah_anggota} Anggota
            </span>
          </div>

          {/* Status Badge & Aksi Keanggotaan User (Rapi & Terstruktur) */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {isSuperOrPusat ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary text-secondary-foreground px-2.5 py-1 text-2xs font-bold shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{isActualSuperAdmin ? "SUPER ADMIN" : "ADMIN PUSAT"}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsManageCardsOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                  title="Kelola Kartu Layanan (Data Anak & ATS)"
                >
                  <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Kelola Kartu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("percakapan")}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                  title="Buka Ruang Percakapan Komunitas"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Percakapan</span>
                </button>
              </div>
            ) : isApprovedMember ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-800 dark:text-teal-300 border border-teal-500/20 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>{formatPeranDisplay(userPeran).toUpperCase()}</span>
                </span>

                {membershipState?.peran_diajukan &&
                  membershipState.peran_diajukan.toLowerCase() !== userPeran.toLowerCase() && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 border border-secondary/30"
                      title="Permohonan perubahan peran sedang menunggu verifikasi Admin/Pengurus"
                    >
                      <Clock className="h-3.5 w-3.5 text-secondary animate-pulse" />
                      <span>MENUNGGU: {formatPeranDisplay(membershipState.peran_diajukan).toUpperCase()}</span>
                    </span>
                  )}

                <button
                  type="button"
                  onClick={() => setIsUbahPeranOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                  title="Ajukan perubahan peran kepada Admin"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {membershipState?.peran_diajukan &&
                    membershipState.peran_diajukan.toLowerCase() !== userPeran.toLowerCase()
                      ? "Ubah Pengajuan Peran"
                      : "Ajukan Peran"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("percakapan")}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                  title="Buka Ruang Percakapan Komunitas"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Percakapan</span>
                </button>

                {isUserAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                    title="Tambah anggota baru ke komunitas ini"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Tambah Anggota</span>
                  </button>
                )}

                {isUserAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsResignModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 text-amber-900 dark:text-amber-200 px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                    title="Berhenti dari jabatan Admin komunitas"
                  >
                    <UserMinus className="h-3.5 w-3.5 text-secondary" />
                    <span className="hidden sm:inline">Lepas Admin</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 px-2.5 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                  title="Keluar dari komunitas ini"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : membership?.status === "pending" || membership?.peran_diajukan ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 border border-secondary/30">
                  <Clock className="h-3.5 w-3.5 text-secondary" />
                  <span>MENUNGGU</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsResignModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted text-foreground px-2 py-1 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  title="Batalkan permohonan keanggotaan/admin"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Batal</span>
                </button>
              </div>
            ) : canJoin ? (
              <button
                type="button"
                onClick={() => {
                  if (komunitas.jenis === "warga_kita") {
                    setIsWargaOnboardingOpen(true);
                  } else {
                    setIsJoinModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Bergabung</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2.5 py-1 text-2xs font-semibold text-muted-foreground border border-border">
                <Info className="h-3 w-3 text-primary shrink-0" />
                <span>Keanggotaan Otomatis dari RT / Posyandu / PAUD</span>
              </div>
            )}
          </div>
        </div>

        {/* Baris Utama: Icon + Judul Komunitas + Alamat */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg font-bold border",
              komunitas.jenis === "warga_kita" && "bg-primary/10 text-primary border-primary/20",
              komunitas.jenis === "posyandu" && "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
              isPkbmOrSkb && "bg-secondary/15 text-amber-900 dark:text-amber-200 border-secondary/30",
              isPureSatuanPaud && "bg-primary/10 text-primary border-primary/20"
            )}
          >
            {komunitas.jenis === "warga_kita" && <Users className="h-5 w-5" />}
            {komunitas.jenis === "posyandu" && <Sparkles className="h-5 w-5" />}
            {isPkbmOrSkb && <BookOpen className="h-5 w-5" />}
            {isPureSatuanPaud && <Building2 className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
              {formattedTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1 truncate max-w-xl">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <span className="truncate">{komunitas.lokasi}</span>
              </span>
              <span className="sm:hidden text-muted-foreground/40">•</span>
              <span className="sm:hidden font-mono text-foreground font-bold">
                {komunitas.jumlah_anggota} Anggota
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMASI ADMIN / PENGURUS KOMUNITAS (KOMPAK, PADAT & BEBAS RUANG KOSONG) */}
      {hasCommunityAdmin && (
        <section className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-2xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Info Admin */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
                <ShieldCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Admin / Pengurus:
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {effectiveAdminName}
                  </h3>
                  {effectiveAdminRole && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-card text-foreground border border-border">
                      {effectiveAdminRole}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-200 border border-teal-500/20">
                    <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            {/* Kontak Admin: WhatsApp & Telepon Ringkas */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {effectiveAdminHp ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-foreground hidden md:inline-block px-2 py-1 rounded-md bg-card border border-border text-[11px]">
                    {effectiveAdminHp}
                  </span>
                  <a
                    href={formatWhatsAppUrl(effectiveAdminHp, `Halo Admin ${effectiveAdminName}, saya warga di ${komunitasData.nama}...`) || `https://wa.me/${effectiveAdminHp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title={`Chat WhatsApp dengan ${effectiveAdminName}`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${effectiveAdminHp.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-card hover:bg-muted text-foreground text-xs font-bold border border-border shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title={`Telepon langsung ${effectiveAdminName}`}
                  >
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="hidden sm:inline">Telepon</span>
                  </a>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Kontak belum dicantumkan</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ALERT JIKA BELUM MEMILIKI ADMIN (HANYA MUNCUL JIKA KOMUNITAS BELUM MEMILIKI ADMIN) */}
      {!hasCommunityAdmin && Boolean(currentUserId) && !isSuperOrPusat && isApprovedMember && isWargaKita && (
        <section className="rounded-lg border border-secondary/30 bg-secondary/10 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Komunitas Belum Memiliki Admin / Pengurus
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isPenduduk ? (
                  membership?.peran_diajukan ? (
                    <span className="font-semibold text-primary">
                      Permohonan Anda sebagai Admin sedang menunggu verifikasi Super Admin / Admin hierarki tingkat atas.
                    </span>
                  ) : (
                    "Sebagai anggota berstatus Penduduk, Anda berhak mengajukan diri menjadi Admin/Pengurus."
                  )
                ) : (
                  "Pengajuan Admin hanya dapat diajukan oleh anggota dengan status Penduduk (KK & Domisili di Kota Tegal)."
                )}
              </p>
            </div>
          </div>

          {/* Action Button: Pengajuan Admin */}
          {isWargaKita && isPenduduk && !membership?.peran_diajukan ? (
            <button
              type="button"
              onClick={() => setIsApplyAdminOpen(true)}
              className="inline-flex min-h-[36px] h-9 items-center justify-center gap-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-secondary-foreground px-3.5 text-xs font-bold shadow-2xs transition-all active:scale-98 shrink-0 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Ajukan Diri Sebagai Admin</span>
            </button>
          ) : membership?.peran_diajukan ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 border border-secondary/30 shrink-0">
              <Clock className="h-3.5 w-3.5 text-secondary" />
              <span>Menunggu Persetujuan</span>
            </span>
          ) : null}
        </section>
      )}

      {/* 2. DAFTAR KARTU UTAMA DAN ACCORDION SUB-TABS KOMUNITAS */}
      <div className="space-y-2.5 transition-all duration-300 ease-in-out">
        {/* DERETAN ATAS: ACCORDION SUB-TABS (PERCAKAPAN, KABAR, ANGGOTA) */}
        {sortedDetailCategories.map((cat) => {
          const isOpen = activeTab === cat.id;
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              className={`rounded-lg border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? `border-primary/40 bg-card p-1 sm:p-1.5 shadow-xs`
                  : `border-border bg-card shadow-2xs hover:shadow-xs hover:border-primary/40 ${cat.hoverBorder}`
              }`}
            >
              {/* Accordion Header / Trigger */}
              {isOpen ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(null)}
                  title="Klik untuk menutup bagian ini"
                  className={`w-full flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-lg text-primary-foreground ${cat.activeColorBg} shadow-2xs cursor-pointer transition-all hover:opacity-95 group text-left`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-xs shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xs sm:text-sm font-black tracking-tight truncate">
                          {cat.title}
                        </h2>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border backdrop-blur-xs ${cat.badgeColor}`}
                        >
                          {cat.badgeText}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Aktif Terbuka
                        </span>
                      </div>
                      <p className="text-2xs text-white/90 font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-white/90 group-hover:text-white transition-colors">
                      Tutup Bagian
                    </span>
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-xs group-hover:bg-white/30 transition-colors">
                      <ChevronDown className="h-3.5 w-3.5 transform rotate-180 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full flex items-center justify-between gap-2.5 p-2.5 sm:p-3 text-foreground transition-all cursor-pointer group ${cat.hoverBg} text-left`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xs sm:text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {cat.title}
                        </h2>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground border border-border">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-2xs text-muted-foreground font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      Buka Bagian
                    </span>
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-muted group-hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-colors">
                      <ChevronDown className="h-3.5 w-3.5 transform rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              )}

              {/* Accordion Body Content */}
              {isOpen && (
                <div className="p-2 sm:p-2.5 animate-in fade-in-50 duration-200">
                  {/* Subtab: RUANG PERCAKAPAN KOMUNITAS */}
                  {cat.id === "percakapan" && (
                    <section className="space-y-4 pb-4">
                      <KomunitasPercakapanTab
                        komunitas={komunitasData}
                        currentUserId={currentUserId}
                        isAdminOrKader={isAdminOrKader}
                        onOpenJoinModal={() => {
                          if (komunitas.jenis === "warga_kita") {
                            setIsWargaOnboardingOpen(true);
                          } else {
                            setIsJoinModalOpen(true);
                          }
                        }}
                      />
                    </section>
                  )}

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
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Informasi &amp; Operasional
                </h3>
                <p className="text-2xs text-slate-500 font-medium">
                  {komunitasData.jenis === "posyandu"
                    ? "Informasi alamat lokasi, jadwal layanan, dan kontak 6 bidang kader"
                    : "Informasi alamat lokasi, jadwal layanan, dan kontak pengurus"}
                </p>
              </div>

              {canEditOperasional && (
                <button
                  type="button"
                  onClick={() => setIsEditOperasionalOpen(true)}
                  className="inline-flex min-h-[34px] h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer shrink-0"
                  title="Edit Informasi & Operasional Komunitas"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit Informasi</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Alamat Lokasi & Cakupan Wilayah */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ALAMAT LOKASI {komunitasData.jenis === "posyandu" ? "POSYANDU" : ""}
                    </span>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                      {komunitasData.lokasi}
                    </p>
                  </div>
                </div>

                {/* Cakupan Wilayah Layanan (RW & RT yang Dilayani) */}
                {komunitasData.jenis === "posyandu" && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-[10px] tracking-wide shrink-0">
                      <Users className="h-3 w-3 text-emerald-600" />
                      CAKUPAN WILAYAH
                    </span>
                    <p className="text-slate-900 dark:text-slate-100 font-bold text-xs">
                      {parsedCakupanWilayah}
                    </p>
                  </div>
                )}
              </div>

              {/* Jadwal Layanan (Khusus Posyandu: Menampilkan Jadwal Balita, Lansia, dan Remaja) */}
              {komunitasData.jenis === "posyandu" ? (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-2.5 sm:p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-[11px] font-black text-blue-950 dark:text-blue-300 uppercase tracking-wider">
                        Jadwal Layanan Posyandu Terpadu
                      </h4>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Siklus Hidup (ILP)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* 1. Posyandu Balita & Ibu Hamil */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/40 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold text-xs">
                        <span className="text-sm">👶</span>
                        <span>Posyandu Balita</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        Balita, Anak &amp; Ibu Hamil
                      </span>
                      <p className="text-slate-800 dark:text-slate-100 font-semibold text-xs leading-relaxed pt-0.5">
                        {parsedJadwalPosyandu.balita || "Belum ditentukan"}
                      </p>
                    </div>

                    {/* 2. Posyandu Lansia */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/40 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs">
                        <span className="text-sm">🧓</span>
                        <span>Posyandu Lansia</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        Warga Usia Lanjut
                      </span>
                      <p className="text-slate-800 dark:text-slate-100 font-semibold text-xs leading-relaxed pt-0.5">
                        {parsedJadwalPosyandu.lansia || "Belum ditentukan"}
                      </p>
                    </div>

                    {/* 3. Posyandu Remaja */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                        <span className="text-sm">🧑</span>
                        <span>Posyandu Remaja</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        Remaja &amp; Usia Produktif
                      </span>
                      <p className="text-slate-800 dark:text-slate-100 font-semibold text-xs leading-relaxed pt-0.5">
                        {parsedJadwalPosyandu.remaja || "Belum ditentukan"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Jadwal Komunitas Non-Posyandu */
                komunitasData.jadwal && (
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <Calendar className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">JADWAL LAYANAN</span>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                        {komunitasData.jadwal}
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* Kontak Resmi Utama */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 w-full min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KONTAK UTAMA / SEKRETARIAT</span>
                    {effectiveAdminName && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                        Admin: {effectiveAdminName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <p className="text-slate-900 dark:text-slate-100 font-bold font-mono text-xs sm:text-sm">
                      {effectiveAdminHp || parsedKontak.utama || komunitasData.kontak || "-"}
                    </p>
                    {(effectiveAdminHp || parsedKontak.utama) && (
                      <a
                        href={formatWhatsAppUrl(effectiveAdminHp || parsedKontak.utama, `Halo Pengurus ${komunitasData.nama}, saya ingin menanyakan informasi layanan.`) || `tel:${effectiveAdminHp || parsedKontak.utama}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Kontak 6 Bidang Kader SPM (Permendagri No. 13 Tahun 2024) - Khusus Komunitas Posyandu */}
              {komunitasData.jenis === "posyandu" && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 sm:p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                    <h4 className="text-[11px] font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                      Kontak Kader 6 Bidang SPM
                    </h4>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
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
              )}

              {/* Profil & Visi */}
              {komunitasData.deskripsi && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">PROFIL &amp; VISI</span>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {cleanDeskripsiDisplay(komunitasData.deskripsi)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Daftar Anggota Komunitas
              </h3>
              <p className="text-2xs text-slate-500 font-medium">
                Total {approvedMembers.length} anggota aktif terdaftar
              </p>
            </div>

            {canManageMembers && (
              <Link
                href={`/komunitas/${komunitas.id}/anggota`}
                className="inline-flex min-h-[36px] h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-3.5 text-xs font-bold shadow-2xs transition-all active:scale-98 shrink-0 cursor-pointer"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>KELOLA ANGGOTA</span>
              </Link>
            )}
          </div>

          {approvedMembers.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs font-semibold text-slate-400">
              Belum ada anggota terdaftar secara daring
            </div>
          ) : (
            <div className="space-y-2">
              {approvedMembers.map((member) => {
                const name = member.profiles?.nama_lengkap || "Warga Komunitas";
                const initial = name.charAt(0).toUpperCase();
                const isMe = currentUserId && member.user_id === currentUserId;
                const isTargetSuperAdmin = isSuperAdmin(member.profiles);
                const canKickThisMember = canManageMembers && !isMe && !isTargetSuperAdmin;

                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {name}
                          </h4>
                          {isMe && (
                            <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                              ANDA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-2xs text-slate-500 font-medium">
                          <span className="truncate">{member.profiles?.email || "-"}</span>
                          {member.profiles?.nomor_hp && (
                            <>
                              <span>•</span>
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                {member.profiles.nomor_hp}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <span className={cn(
                        "rounded-lg px-2.5 py-1 text-2xs font-bold border",
                        isRoleAdmin(member.peran)
                          ? "bg-emerald-100 text-emerald-950 border-emerald-300 font-black"
                          : "bg-slate-100 text-slate-800 border-slate-200"
                      )}>
                        {formatPeranDisplay(member.peran)}
                      </span>
                      {member.peran_diajukan && (
                        <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-2xs font-bold text-amber-900 border border-amber-200">
                          Diajukan: {formatPeranDisplay(member.peran_diajukan)}
                        </span>
                      )}

                      {/* Tombol Ajukan Ubah Peran jika ini adalah User sendiri */}
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => setIsUbahPeranOpen(true)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 text-2xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                          title="Ajukan perubahan peran kepada Admin"
                        >
                          <Sparkles className="h-3 w-3 text-blue-600" />
                          <span>Ubah Peran</span>
                        </button>
                      )}

                      {/* Tombol Keluarkan Anggota oleh Pengurus */}
                      {canKickThisMember && (
                        <button
                          type="button"
                          onClick={() => setKickTargetMember(member)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 text-2xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                          title={`Keluarkan ${name} dari komunitas`}
                        >
                          <UserX className="h-3 w-3 text-rose-600" />
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
                </div>
              )}
            </div>
          );
        })}

        {/* DI BAWAH 3 KARTU: KARTU LINK DATA UTAMA (DATA ANAK & ATS) */}
        {detailLinkCards.map((cat) => {
          const Icon = cat.icon;
          const canAccessCard =
            isSuperOrPusat ||
            hasFullAccess ||
            (isRekapOnlyTier && (isApprovedMember || isPenduduk || isAdminOrKader));

          if (canAccessCard) {
            return (
              <div
                key={cat.id}
                className={`rounded-lg border transition-all duration-200 overflow-hidden border-border bg-card shadow-2xs hover:shadow-xs hover:border-primary/40 ${cat.hoverBorder}`}
              >
                <Link
                  href={cat.href}
                  className={`w-full flex items-center justify-between gap-3 p-2.5 sm:p-3 text-foreground transition-all cursor-pointer group ${cat.hoverBg} text-left`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${cat.iconBg} ${cat.iconColor} group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className={`text-xs sm:text-sm font-black tracking-tight text-foreground ${cat.textHoverColor} transition-colors`}>
                          {cat.title}
                        </h2>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground border border-border">
                          {cat.badgeText}
                        </span>
                      </div>
                      <p className="text-2xs sm:text-xs text-muted-foreground font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`hidden sm:inline-block text-xs font-bold text-muted-foreground ${cat.textHoverColor} transition-colors`}>
                      Buka Data
                    </span>
                    <div className={`h-7 w-7 rounded-lg ${cat.arrowBg} ${cat.arrowHoverBg} flex items-center justify-center ${cat.arrowColor} transition-all duration-300 shadow-2xs`}>
                      <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          } else {
            return (
              <div
                key={cat.id}
                className="rounded-lg border transition-all duration-200 overflow-hidden border-border bg-card shadow-2xs hover:shadow-xs hover:border-secondary/40"
              >
                <button
                  type="button"
                  onClick={() => setIsWargaOnboardingOpen(true)}
                  className="w-full flex items-center justify-between gap-3 p-2.5 sm:p-3 text-foreground transition-all cursor-pointer group hover:bg-muted/40 text-left"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${cat.iconBg} ${cat.iconColor} opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-2xs`}
                    >
                      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xs sm:text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {cat.title}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-secondary/15 text-amber-950 dark:text-amber-200 border border-secondary/30">
                          <Lock className="h-3 w-3 text-secondary" />
                          Khusus Penduduk
                        </span>
                      </div>
                      <p className="text-2xs sm:text-xs text-muted-foreground font-medium line-clamp-1">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:text-secondary transition-colors">
                      Buka Akses
                    </span>
                    <div className="h-7 w-7 rounded-lg bg-secondary/15 group-hover:bg-secondary group-hover:text-white flex items-center justify-center text-secondary transition-all duration-300 shadow-2xs">
                      <Lock className="h-3.5 w-3.5 transform group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
              </div>
            );
          }
        })}

        {/* PALING BAWAH: KARTU LAPORAN KADER POSYANDU 6 BIDANG SPM */}
        {komunitasData.jenis === "posyandu" && (
          <LaporanKaderSpmFormCard
            komunitas={komunitasData}
            currentUserId={currentUserId}
            userName={myProfileName}
            isAdminOrKader={canAccessLaporanPosyandu}
          />
        )}

        {/* REKAP LAPORAN KADER WILAYAH (KELURAHAN, KECAMATAN, KOTA TEGAL) */}
        {komunitasData.jenis === "warga_kita" && isAdminOrKader && (
          <RekapLaporanKaderWilayahCard
            komunitas={komunitasData}
            isAdminOrKader={isAdminOrKader}
            currentUserId={currentUserId}
          />
        )}
      </div>

      {/* Modal Ajukan Diri Sebagai Admin (Hanya untuk Penduduk) */}
      {isApplyAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/15 text-secondary font-bold border border-secondary/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    Pengajuan Admin Komunitas
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {formattedTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyAdminOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {adminFeedback && (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                {adminFeedback}
              </div>
            )}

            <form onSubmit={handleApplyAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Nomor WhatsApp / HP Aktif <span className="text-muted-foreground font-normal">(Opsional)</span>
                </label>
                <input
                  type="tel"
                  value={adminHp}
                  onChange={(e) => setAdminHp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Catatan Pengajuan / Kredensial Pengurus (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={adminCatatan}
                  onChange={(e) => setAdminCatatan(e.target.value)}
                  placeholder="Keterangan pengurus (misal: Ketua RT / Pengurus RW aktif)..."
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsApplyAdminOpen(false)}
                  disabled={isSubmittingAdmin}
                  className="px-4 py-2.5 rounded-lg border border-border bg-card font-bold text-xs text-foreground hover:bg-muted cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover font-bold text-xs text-white cursor-pointer shadow-xs disabled:opacity-50"
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
      {isWargaOnboardingOpen && canJoin && (
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
      {isJoinModalOpen && canJoin && (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Keluar dari Komunitas?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formattedTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setIsLeaveModalOpen(false)}
                disabled={actionLoading}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-bold ${
                  actionFeedback.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Apakah Anda yakin ingin keluar dan tidak bergabung lagi di <strong className="text-foreground">{formattedTitle}</strong>?
              </p>
              {isWargaKita && (
                <div className="p-3 rounded-lg bg-secondary/15 border border-secondary/30 text-xs text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                  Perhatian: Keluar dari komunitas RT Warga Kita akan otomatis melepaskan keterhubungan domisili Anda pada tingkatan RW, Kelurahan, dan Kecamatan terkait.
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLeave}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/15 border border-secondary/30 text-secondary">
                  <UserMinus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {isUserAdmin ? "Berhenti Menjadi Admin?" : "Batalkan Permohonan?"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formattedTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setIsResignModalOpen(false)}
                disabled={actionLoading}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-bold ${
                  actionFeedback.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                {isUserAdmin
                  ? "Apakah Anda yakin ingin berhenti dari status Admin/Pengurus di komunitas ini? Peran Anda akan dikembalikan menjadi warga/anggota biasa."
                  : "Apakah Anda yakin ingin membatalkan permohonan keanggotaan/pengajuan Admin ini?"}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResignModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleResign}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg bg-secondary hover:bg-secondary-hover text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Keluarkan Anggota?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Konfirmasi Tindakan Pengurus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setKickTargetMember(null)}
                disabled={actionLoading}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-bold ${
                  actionFeedback.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Apakah Anda yakin ingin mengeluarkan anggota berikut dari <strong className="text-foreground">{formattedTitle}</strong>?
              </p>
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
                <p className="font-bold text-foreground text-base">
                  {kickTargetMember.profiles?.nama_lengkap || "Pengguna"}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>{kickTargetMember.profiles?.email || "-"}</span>
                  <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                    {formatPeranDisplay(kickTargetMember.peran)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-destructive font-semibold leading-relaxed">
                * Pengguna yang dikeluarkan akan kehilangan akses ke data dan aktivitas internal komunitas ini sampai bergabung kembali.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setKickTargetMember(null)}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleKickMember}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

      {/* Modal Ajukan Perubahan Peran (misal Pengunjung -> Guru/Kepala Sekolah di PAUD, atau Kader/Nakes di Posyandu) */}
      {isUbahPeranOpen && (
        <AjukanPerubahanPeranModal
          komunitas={{
            ...komunitasData,
            hasAdmin: hasCommunityAdmin,
          }}
          currentPeran={userPeran}
          currentPeranDiajukan={membershipState?.peran_diajukan}
          isOpen={isUbahPeranOpen}
          onClose={() => setIsUbahPeranOpen(false)}
          onSuccess={(newPeranDiajukan) => {
            setMembershipState((prev) =>
              prev
                ? {
                    ...prev,
                    peran_diajukan: newPeranDiajukan,
                  }
                : null
            );
            setAnggotaState((prev) =>
              prev.map((m) =>
                m.user_id === currentUserId
                  ? { ...m, peran_diajukan: newPeranDiajukan }
                  : m
              )
            );
          }}
        />
      )}
      {/* MODAL KELOLA KARTU LAYANAN (SUPER ADMIN & ADMIN PUSAT) */}
      {isManageCardsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">
                    Kelola Kartu Layanan
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Khusus Super Admin & Admin Pusat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageCardsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Atur kartu layanan khusus yang diaktifkan untuk komunitas{" "}
              <strong className="text-foreground">{komunitasData.nama}</strong>.
            </p>

            <div className="space-y-3 pt-1">
              {/* Toggle Data Anak */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Baby className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Data Anak (0–6 Tahun) & DDTK
                    </h4>
                    <p className="text-2xs text-muted-foreground">
                      Pendataan balita dan tumbuh kembang
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={cardActionLoading}
                  onClick={() => handleToggleCard("data_anak", !canShowDataAnakCard)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50",
                    canShowDataAnakCard
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                      : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs"
                  )}
                >
                  {cardActionLoading ? "..." : canShowDataAnakCard ? "Hapus Kartu" : "Tambah Kartu"}
                </button>
              </div>

              {/* Toggle Data ATS */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary border border-secondary/30">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Data ATS (Anak Tidak Sekolah)
                    </h4>
                    <p className="text-2xs text-muted-foreground">
                      Kasus anak putus sekolah / tidak sekolah
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={cardActionLoading}
                  onClick={() => handleToggleCard("data_ats", !canShowDataAtsCard)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50",
                    canShowDataAtsCard
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                      : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs"
                  )}
                >
                  {cardActionLoading ? "..." : canShowDataAtsCard ? "Hapus Kartu" : "Tambah Kartu"}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManageCardsOpen(false)}
                className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah & Kelola Anggota Komunitas */}
      {isAddMemberModalOpen && (
        <ManageGrupMembersModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          room={{
            id: komunitas.id,
            nama: komunitas.nama,
            jenis: komunitas.jenis,
            deskripsi: komunitas.deskripsi,
            jumlah_anggota: anggotaState.length,
            is_kegiatan: komunitas.jenis === "kegiatan",
          }}
          existingMemberIds={anggotaState.map((a) => a.user_id)}
          allUsers={[]}
          canManage={true}
          currentUserId={currentUserId || null}
          initialTab="undang"
          onMembersUpdated={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
