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
  LogIn,
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
  ShieldPlus,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import { WargaOnboardingModal } from "@/components/komunitas/warga-onboarding-modal";
import { EditInformasiOperasionalModal } from "@/components/komunitas/edit-informasi-operasional-modal";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { LaporanKaderSpmFormCard } from "@/components/komunitas/laporan-kader-spm-form-card";
import { RekapLaporanKaderWilayahCard } from "@/components/komunitas/rekap-laporan-kader-wilayah-card";
import { KomunitasPercakapanTab } from "@/components/komunitas/komunitas-percakapan-tab";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import { AjukanPerubahanPeranModal } from "@/components/komunitas/ajukan-perubahan-peran-modal";
import { ManageGrupMembersModal } from "@/components/kabar/manage-grup-members-modal";
import { CardDataAnak } from "@/components/data-anak/card-data-anak";
import { FormDataAnak } from "@/components/data-anak/form-data-anak";
import { KomunitasRekapGrafikView } from "@/components/data-anak/komunitas-rekap-grafik-view";
import { PaudRekapGrafikView } from "@/components/data-anak/paud-rekap-grafik-view";
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
import { assignOrRevokeKomunitasAdminAction } from "@/app/actions/admin";
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
import {
  extractKomunitasMetadata,
  getKomunitasFeatureCards,
  cleanDeskripsiDisplay,
  getDefaultAdminRole,
  isOfficialAdminKomunitas,
} from "@/lib/admin-helpers";

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
  canAssignAdmin?: boolean;
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
  canAssignAdmin = false,
}: KomunitasDetailClientViewProps) {
  const [komunitasData, setKomunitasData] = useState(komunitas);

  const initialActiveTab = useMemo(() => {
    if (!currentSubtab || currentSubtab === "data") {
      return null;
    }
    return currentSubtab;
  }, [currentSubtab]);
  const [activeTab, setActiveTab] = useState<string | null>(initialActiveTab);
  const { groupUnreadCounts, markGroupAsRead } = useGlobalMessageNotification();
  const communityUnreadCount = groupUnreadCounts[komunitasData.id] || 0;

  // State untuk data anak & ATS komunitas
  const [dataAnakState, setDataAnakState] = useState<DataAnakItem[]>(dataAnakList);
  const [dataAtsState, setDataAtsState] = useState<DataAtsItem[]>(dataAtsList);

  useEffect(() => {
    setDataAnakState(dataAnakList);
  }, [dataAnakList]);

  useEffect(() => {
    setDataAtsState(dataAtsList);
  }, [dataAtsList]);

  // Helper identifikasi fitur & kartu komunitas
  const featureCards = useMemo(
    () => getKomunitasFeatureCards(komunitasData),
    [komunitasData]
  );
  const canShowDataAnakCard = featureCards.canShowDataAnak;
  const canShowDataAtsCard = featureCards.canShowDataAts;
  const isTheOrbitSixty = featureCards.isTheOrbitSixty;

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

  const isPaudCommunity = isKomunitasLayananPaud(
    komunitasData,
    komunitasData.nama,
    komunitasData.jenis
  );

  type KomunitasMainTab =
    | "anak"
    | "rekap"
    | "ats"
    | "laporan_spm"
    | "anggota"
    | "kabar"
    | "percakapan";

  const [activeMainTab, setActiveMainTab] = useState<KomunitasMainTab>(() => {
    if (currentSubtab === "rekap") return "rekap";
    if (currentSubtab === "ats") return "ats";
    if (currentSubtab === "laporan_spm" || currentSubtab === "spm") return "laporan_spm";
    if (currentSubtab === "anggota") return "anggota";
    if (currentSubtab === "kabar") return "kabar";
    if (currentSubtab === "percakapan") return "percakapan";
    if (canShowDataAnakCard) return "anak";
    if (canShowDataAtsCard) return "ats";
    return "kabar";
  });

  useEffect(() => {
    if (activeMainTab === "percakapan") {
      markGroupAsRead(komunitasData.id);
    }
  }, [activeMainTab, komunitasData.id, markGroupAsRead]);

  const [paudStatusFilter, setPaudStatusFilter] = useState<"semua" | "approved" | "pending">("semua");
  const [dataAnakFilterSubTab, setDataAnakFilterSubTab] = useState<
    "semua" | "bersekolah" | "belum_bersekolah"
  >("semua");
  const [searchQueryAnak, setSearchQueryAnak] = useState("");
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);

  const rekapPaudCalc = useMemo(() => {
    if (scopedRekapResult) {
      return scopedRekapResult;
    }
    return buildKomunitasScopedRekap(komunitasData, dataAnakState);
  }, [komunitasData, dataAnakState, scopedRekapResult]);

  // Pemisahan anak bersekolah vs belum bersekolah untuk Warga Kita & umum
  const bersekolahChildren = useMemo(
    () =>
      dataAnakState.filter(
        (c) =>
          c.is_sekolah === true ||
          Boolean(
            c.nama_sekolah &&
              !c.nama_sekolah.toLowerCase().includes("belum")
          )
      ),
    [dataAnakState]
  );

  const belumBersekolahChildren = useMemo(
    () =>
      dataAnakState.filter(
        (c) =>
          !c.is_sekolah ||
          (c.nama_sekolah && c.nama_sekolah.toLowerCase().includes("belum"))
      ),
    [dataAnakState]
  );

  const totalChildren = dataAnakStats?.total ?? dataAnakState.length;
  const totalBersekolahCount = bersekolahChildren.length;
  const totalBelumBersekolahCount = belumBersekolahChildren.length;
  const totalApproved =
    dataAnakStats?.approved ??
    dataAnakState.filter((c) => c.status_approval === "approved").length;
  const totalPending =
    dataAnakStats?.pending ??
    dataAnakState.filter((c) => c.status_approval === "pending").length;

  const isWargaKitaCheck = komunitasData.jenis === "warga_kita";

  const displayedChildren = useMemo(() => {
    let list = dataAnakState;

    // Filter sub-kategori bersekolah / belum bersekolah jika di Warga Kita
    if (isWargaKitaCheck) {
      if (dataAnakFilterSubTab === "bersekolah") {
        list = bersekolahChildren;
      } else if (dataAnakFilterSubTab === "belum_bersekolah") {
        list = belumBersekolahChildren;
      }
    }

    // Filter status verifikasi
    if (paudStatusFilter === "approved") {
      list = list.filter((c) => c.status_approval === "approved");
    } else if (paudStatusFilter === "pending") {
      list = list.filter((c) => c.status_approval !== "approved");
    }

    // Pencarian
    if (!searchQueryAnak.trim()) return list;
    const q = searchQueryAnak.toLowerCase().trim();
    return list.filter(
      (c) =>
        c.nama_lengkap.toLowerCase().includes(q) ||
        c.nama_orangtua.toLowerCase().includes(q) ||
        (c.nama_sekolah && c.nama_sekolah.toLowerCase().includes(q)) ||
        (c.alasan_sekolah && c.alasan_sekolah.toLowerCase().includes(q))
    );
  }, [
    dataAnakState,
    isWargaKitaCheck,
    dataAnakFilterSubTab,
    bersekolahChildren,
    belumBersekolahChildren,
    paudStatusFilter,
    searchQueryAnak,
  ]);

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
  const [promoteTargetMember, setPromoteTargetMember] = useState<AnggotaKomunitasDetail | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
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

  const defaultAdminRole = getDefaultAdminRole(komunitas.jenis, komunitas);
  const approvedMembers = anggotaState.filter((m) => m.status === "approved");

  // Filter anggota yang memegang peran Admin resmi pengelola komunitas
  const adminMembers = useMemo(() => {
    return approvedMembers.filter((m) =>
      isOfficialAdminKomunitas(m.peran, komunitas.jenis)
    );
  }, [approvedMembers, komunitas.jenis]);

  const hasAdmin = adminMembers.length > 0;

  // Cek apakah komunitas sudah memiliki admin terverifikasi/disetujui,
  // baik dari payload server (komunitas.hasAdmin) maupun dari daftar anggota approved
  const adminMemberFromList = adminMembers[0] || null;

  const hasCommunityAdmin = Boolean(
    hasAdmin || (komunitas.hasAdmin && komunitas.adminName)
  );

  const effectiveAdminName =
    adminMemberFromList?.profiles?.nama_lengkap ||
    komunitas.adminName ||
    "Pengurus Komunitas";

  const effectiveAdminRole =
    adminMemberFromList
      ? formatPeranDisplay(adminMemberFromList.peran)
      : komunitas.adminRole || defaultAdminRole;

  const effectiveAdminHp =
    adminMemberFromList?.profiles?.nomor_hp ||
    komunitas.adminHp ||
    parsedKontak.utama ||
    null;

  const handleConfirmPromoteAdmin = async () => {
    if (!promoteTargetMember) return;
    setIsPromoting(true);
    setActionFeedback(null);
    try {
      const res = await assignOrRevokeKomunitasAdminAction({
        anggotaId: promoteTargetMember.id,
        newRole: defaultAdminRole,
        komunitasId: komunitas.id,
      });

      if (res.success) {
        setAnggotaState((prev) =>
          prev.map((m) =>
            m.id === promoteTargetMember.id
              ? {
                  ...m,
                  peran: defaultAdminRole,
                  status: "approved",
                  peran_diajukan: null,
                }
              : m
          )
        );
        setKomunitasData((prev) => ({
          ...prev,
          hasAdmin: true,
          adminName: promoteTargetMember.profiles?.nama_lengkap || "Pengurus Komunitas",
          adminRole: defaultAdminRole,
          adminHp: promoteTargetMember.profiles?.nomor_hp || prev.adminHp,
        }));
        setActionFeedback({
          type: "success",
          message:
            res.message ||
            `Berhasil mengangkat ${promoteTargetMember.profiles?.nama_lengkap || "anggota"} sebagai ${defaultAdminRole}!`,
        });
        setPromoteTargetMember(null);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setActionFeedback({
          type: "error",
          message: res.message || "Gagal mengangkat admin komunitas.",
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: "error",
        message: err?.message || "Terjadi kesalahan saat memproses pengangkatan admin.",
      });
    } finally {
      setIsPromoting(false);
    }
  };

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
      subtitle: isTheOrbitSixty
        ? "Pengumuman dan diskusi internal khusus anggota The Orbit Sixty"
        : "Pengumuman dan diskusi interaktif anggota komunitas",
      badgeText:
        isTheOrbitSixty && !isApprovedMember && !isSuperOrPusat
          ? "Khusus Anggota"
          : `${kabarKomunitas.length} Kabar`,
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
  // TAMPILAN TERPADU SEMUA KOMUNITAS (WARGA KITA, POSYANDU, PKBM & SKB, PAUD)
  // =========================================================================
  return (
    <div className="space-y-4">
      {/* 1. HERO HEADER CARD UNIVERSAL (PADAT, BERWIBAWA & BERSIH) */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
        {/* Baris Paling Atas: Badge Kategori, Wilayah & Aksi Status User */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={cn(
                "rounded-md px-2.5 py-0.5 text-2xs font-extrabold border uppercase tracking-wide shrink-0",
                isWargaKita && "bg-primary/10 text-primary border-primary/25",
                isPosyandu && "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30",
                (isPkbmOrSkb || isSkb || isStarOfTomorrow) && "bg-secondary/15 text-amber-900 dark:text-amber-200 border-secondary/30",
                isPaud && !isPkbmOrSkb && "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30",
                komunitasData.jenis === "kegiatan" && "bg-muted text-foreground border-border"
              )}
            >
              {isWargaKita
                ? `WARGA KITA • ${tierLevelLabel.toUpperCase()}`
                : isPosyandu
                ? "POSYANDU ILP (INTEGRASI LAYANAN PRIMER)"
                : isSkb
                ? "SKB (SANGGAR KEGIATAN BELAJAR)"
                : isStarOfTomorrow
                ? "PKBM & SATUAN PAUD"
                : isPkbmOrSkb
                ? "PKBM (PENDIDIKAN KESETARAAN & MASYARAKAT)"
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
                : isPaud
                ? "SATUAN PENDIDIKAN PAUD"
                : "KOMUNITAS"}
            </span>

            <span className="text-xs font-semibold text-muted-foreground truncate">
              {komunitas.kelurahan && komunitas.kelurahan !== "Semua Kelurahan"
                ? `${komunitas.kelurahan}, ${komunitas.kecamatan || "Kota Tegal"}`
                : komunitas.kecamatan && komunitas.kecamatan !== "Kota Tegal"
                ? `Kecamatan ${komunitas.kecamatan}, Kota Tegal`
                : "Kota Tegal, Jawa Tengah"}
            </span>

            {canShowDataAnakCard && (
              <>
                <span className="text-muted-foreground/40 hidden sm:inline">•</span>
                <span className="text-xs font-bold text-foreground font-mono hidden sm:inline">
                  {totalChildren} {isPaudCommunity ? "Siswa" : "Anak"} Terdaftar
                </span>
              </>
            )}

            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span className="text-xs font-bold text-foreground font-mono hidden sm:inline">
              {approvedMembers.length} {isPosyandu ? "Kader / Anggota" : isPaudCommunity ? "Pendidik / Anggota" : isWargaKita ? "Warga" : "Anggota"}
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
            ) : null}

            {/* Tombol EDIT INFORMASI KOMUNITAS / LEMBAGA (Khusus Admin/Pengurus/Kader) */}
            {canEditOperasional && (
              <button
                type="button"
                onClick={() => setIsEditOperasionalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 text-xs font-bold shadow-2xs transition-all active:scale-98 cursor-pointer"
                title="Edit data dan informasi operasional komunitas/lembaga ini"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Informasi</span>
              </button>
            )}
          </div>
        </div>

        {/* NAMA KOMUNITAS / LEMBAGA (PALING ATAS, BESAR & MENCOLOK) */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={cn(
              "flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl shadow-xs border",
              isWargaKita && "bg-primary/10 text-primary border-primary/25",
              isPosyandu && "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25",
              (isPkbmOrSkb || isSkb || isStarOfTomorrow) && "bg-secondary/15 text-amber-900 dark:text-amber-200 border-secondary/30",
              isPaud && !isPkbmOrSkb && "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25",
              komunitasData.jenis === "kegiatan" && "bg-muted text-foreground border-border"
            )}
          >
            {isWargaKita ? (
              <Home className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : isPosyandu ? (
              <HeartPulse className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : isPkbmOrSkb ? (
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : isPaud ? (
              <School className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : (
              <Users className="h-6 w-6 sm:h-7 sm:w-7" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
              {formattedTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1 truncate max-w-xl">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{komunitasData.lokasi}</span>
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="font-semibold text-foreground">
                {isPosyandu
                  ? `Posyandu Siklus Hidup Terpadu (ILP) • RW ${meta.rw || "-"} Kel. ${komunitas.kelurahan || "Kraton"}`
                  : isWargaKita
                  ? `Lingkungan Warga Kita • ${tierLevelLabel}`
                  : isPkbmOrSkb
                  ? "Pendidikan Nonformal Kesetaraan & PAUD"
                  : isPaud
                  ? "Satuan Pendidikan PAUD Terdaftar"
                  : "Komunitas Terdaftar"}
              </span>
            </div>
          </div>
        </div>

        {/* INFORMASI TENTANG LEMBAGA / KOMUNITAS (DI DALAM KARTU YANG SAMA) */}
        <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              {isPaudCommunity
                ? "Informasi Lembaga & Operasional"
                : isPosyandu
                ? "Informasi Posyandu & Layanan ILP"
                : isWargaKita
                ? "Informasi Wilayah & Layanan Warga"
                : "Informasi Komunitas & Operasional"}
            </span>
            {canEditOperasional && (
              <button
                type="button"
                onClick={() => setIsEditOperasionalOpen(true)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                <span>Ubah Informasi</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {/* 1. Alamat */}
            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {isPosyandu ? "Alamat Posyandu" : isWargaKita ? "Alamat / Sekretariat" : "Alamat Lembaga"}
              </span>
              <p className="font-semibold text-foreground leading-relaxed">
                {komunitasData.lokasi || "Alamat belum dicantumkan"}
              </p>
            </div>

            {/* 2. Jam Operasional / Jadwal Layanan */}
            <div className="p-3 rounded-lg bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {isPosyandu ? "Jadwal Layanan Posyandu" : isWargaKita ? "Jadwal Pelayanan Warga" : "Jam Operasional / Jadwal"}
              </span>
              <p className="font-semibold text-foreground leading-relaxed">
                {isPosyandu
                  ? (parsedJadwalPosyandu.balita ? `Balita: ${parsedJadwalPosyandu.balita}` : komunitasData.jadwal || "Siklus Hidup Terpadu Bulanan")
                  : komunitasData.jadwal || (isWargaKita ? "Pelayanan Administrasi RT/RW" : "Senin - Jumat 07:30 - 11:00 WIB")}
              </p>
            </div>

            {/* 3. Kontak Resmi & WhatsApp */}
            <div className="p-3 rounded-lg bg-card border border-border space-y-1 sm:col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                Kontak &amp; WhatsApp
              </span>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="min-w-0">
                  <p className="font-mono font-bold text-foreground truncate">
                    {effectiveAdminHp || parsedKontak.utama || komunitasData.kontak || "Belum dicantumkan"}
                  </p>
                  {effectiveAdminName && (
                    <span className="text-[10px] text-muted-foreground truncate block">
                      Admin: {effectiveAdminName}
                    </span>
                  )}
                </div>
                {(effectiveAdminHp || parsedKontak.utama) && (
                  <a
                    href={formatWhatsAppUrl(
                      effectiveAdminHp || parsedKontak.utama,
                      `Halo Pengurus ${komunitasData.nama}, saya ingin menanyakan informasi layanan...`
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

          {/* Cakupan Wilayah Layanan (Khusus Posyandu & Warga Kita) */}
          {(isPosyandu || isWargaKita) && (
            <div className="p-3 rounded-lg bg-card border border-border text-xs flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold text-2xs uppercase tracking-wide shrink-0">
                <Users className="h-3 w-3" />
                Cakupan Wilayah
              </span>
              <p className="text-foreground font-semibold">
                {isPosyandu ? parsedCakupanWilayah : `Wilayah Layanan: ${tierLevelLabel}, Kelurahan ${komunitas.kelurahan || "-"}, Kecamatan ${komunitas.kecamatan || "-"}`}
              </p>
            </div>
          )}

          {/* Profil, Visi & Deskripsi */}
          {komunitasData.deskripsi && cleanDeskripsiDisplay(komunitasData.deskripsi) && (
            <div className="p-3 rounded-lg bg-card border border-border text-xs space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Profil &amp; Visi
              </span>
              <p className="text-foreground leading-relaxed font-medium">
                {cleanDeskripsiDisplay(komunitasData.deskripsi)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ALERT JIKA BELUM MEMILIKI ADMIN (HANYA MUNCUL DI WARGA KITA RT JIKA BELUM ADA ADMIN) */}
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

      {/* 2. TAB NAVIGASI UTAMA KOMUNITAS TERPADU */}
      <div className="space-y-4">
        {/* Tab Bar Horizontal */}
        {(() => {
          const canShowSpmTab = Boolean(
            isPosyandu ||
              (isWargaKita &&
                (isAdminOrKader || isSuperOrPusat) &&
                (meta.hasKel || Boolean(meta.rawKec) || (!meta.hasRt && !meta.hasRw)))
          );
          const totalTabs =
            (canShowDataAnakCard ? 2 : 0) +
            (canShowDataAtsCard ? 1 : 0) +
            (canShowSpmTab ? 1 : 0) +
            3;
          const isGrid3 = totalTabs === 3;
          const isGrid4 = totalTabs === 4;

          return (
            <div
              className={cn(
                "pb-1 border-b border-border/80",
                isGrid3
                  ? "grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2"
                  : isGrid4
                  ? "grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-2"
                  : "flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1.5"
              )}
            >
              {/* Tab 1: Data Anak (0-6 Thn) / Balita / Siswa */}
              {canShowDataAnakCard && (
                <button
                  type="button"
                  onClick={() => setActiveMainTab("anak")}
                  className={cn(
                    "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-2xs sm:text-xs font-semibold transition-all cursor-pointer border",
                    isGrid3 || isGrid4 ? "w-full sm:w-auto" : "shrink-0",
                    activeMainTab === "anak"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                      : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Baby className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>
                    {isPaudCommunity ? (
                      <>
                        <span className="hidden sm:inline">Daftar </span>Siswa
                      </>
                    ) : isPosyandu ? (
                      <>
                        <span className="sm:hidden">Balita</span>
                        <span className="hidden sm:inline">Data Balita</span>
                      </>
                    ) : isWargaKita ? (
                      <>
                        <span className="sm:hidden">Anak</span>
                        <span className="hidden sm:inline">Data Anak (0–6 Thn)</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Data </span>Siswa
                      </>
                    )}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full font-mono text-2xs font-bold leading-none shrink-0",
                      activeMainTab === "anak"
                        ? "bg-white/25 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {totalChildren}
                  </span>
                </button>
              )}

              {/* Tab 2: Rekap, Grafik & Diagram */}
              {canShowDataAnakCard && (
                <button
                  type="button"
                  onClick={() => setActiveMainTab("rekap")}
                  className={cn(
                    "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-2xs sm:text-xs font-semibold transition-all cursor-pointer border",
                    isGrid3 || isGrid4 ? "w-full sm:w-auto" : "shrink-0",
                    activeMainTab === "rekap"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                      : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>
                    <span className="sm:hidden">Grafik</span>
                    <span className="hidden sm:inline">Rekap &amp; Grafik</span>
                  </span>
                </button>
              )}

              {/* Tab 3: Data ATS (Anak Tidak Sekolah) */}
              {canShowDataAtsCard && (
                <button
                  type="button"
                  onClick={() => setActiveMainTab("ats")}
                  className={cn(
                    "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-2xs sm:text-xs font-semibold transition-all cursor-pointer border",
                    isGrid3 || isGrid4 ? "w-full sm:w-auto" : "shrink-0",
                    activeMainTab === "ats"
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-xs font-bold"
                      : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>
                    <span className="sm:hidden">ATS</span>
                    <span className="hidden sm:inline">Data ATS</span>
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full font-mono text-2xs font-bold leading-none shrink-0",
                      activeMainTab === "ats"
                        ? "bg-white/25 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {dataAtsState.length}
                  </span>
                </button>
              )}

              {/* Tab 4: Laporan Kader SPM (Khusus Posyandu & Wilayah Kel/Kec/Kota) */}
              {canShowSpmTab && (
                <button
                  type="button"
                  onClick={() => setActiveMainTab("laporan_spm")}
                  className={cn(
                    "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-2xs sm:text-xs font-semibold transition-all cursor-pointer border",
                    isGrid3 || isGrid4 ? "w-full sm:w-auto" : "shrink-0",
                    activeMainTab === "laporan_spm"
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs font-bold"
                      : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>
                    <span className="sm:hidden">SPM</span>
                    <span className="hidden sm:inline">
                      {isPosyandu ? "Laporan SPM" : "SPM Wilayah"}
                    </span>
                  </span>
                </button>
              )}

              {/* Tab 5: Daftar Anggota / Kader / Warga */}
              <button
                type="button"
                onClick={() => setActiveMainTab("anggota")}
                className={cn(
                  "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-2xs sm:text-xs font-semibold transition-all cursor-pointer border",
                  isGrid3 || isGrid4 ? "w-full sm:w-auto" : "shrink-0",
                  activeMainTab === "anggota"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>
                  {isPosyandu ? (
                    <>
                      <span className="sm:hidden">Kader</span>
                      <span className="hidden sm:inline">Daftar Kader</span>
                    </>
                  ) : isWargaKita ? (
                    <>
                      <span className="sm:hidden">Warga</span>
                      <span className="hidden sm:inline">Daftar Warga</span>
                    </>
                  ) : isPaudCommunity ? (
                    <>
                      <span className="sm:hidden">Anggota</span>
                      <span className="hidden sm:inline">Anggota &amp; Pendidik</span>
                    </>
                  ) : (
                    <>
                      <span className="sm:hidden">Anggota</span>
                      <span className="hidden sm:inline">Daftar Anggota</span>
                    </>
                  )}
                </span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full font-mono text-2xs font-bold leading-none shrink-0",
                    activeMainTab === "anggota"
                      ? "bg-white/25 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {approvedMembers.length}
                </span>
              </button>

              {/* Tab 6: Kabar Komunitas */}
              <button
                type="button"
                onClick={() => setActiveMainTab("kabar")}
                className={cn(
                  "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-2xs sm:text-xs font-semibold transition-all cursor-pointer border",
                  isGrid3 || isGrid4 ? "w-full sm:w-auto" : "shrink-0",
                  activeMainTab === "kabar"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>
                  Kabar<span className="hidden sm:inline"> Komunitas</span>
                </span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full font-mono text-2xs font-bold leading-none shrink-0",
                    activeMainTab === "kabar"
                      ? "bg-white/25 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {kabarKomunitas.length}
                </span>
              </button>

              {/* Tab 7: Percakapan Komunitas */}
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab("percakapan");
                  markGroupAsRead(komunitasData.id);
                }}
                className={cn(
                  "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-2xs sm:text-xs font-semibold transition-all cursor-pointer border",
                  isGrid3 || isGrid4 ? "w-full sm:w-auto" : "shrink-0",
                  activeMainTab === "percakapan"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>
                  Percakapan<span className="hidden sm:inline"> Komunitas</span>
                </span>
                {communityUnreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full font-mono text-2xs bg-rose-500 text-white font-bold animate-pulse leading-none shrink-0">
                    {communityUnreadCount}
                  </span>
                )}
              </button>
            </div>
          );
        })()}

        {/* 3. KONTEN TAB AKTIF TERPADU */}
        {/* TAB 1: DATA ANAK (0-6 TAHUN) / BALITA / SISWA */}
        {activeMainTab === "anak" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Notice Banner Keterangan Akses & Integrasi Data */}
            {isWargaKita ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4 flex items-start gap-3 text-foreground shadow-2xs">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    Sistem Pendataan Terpadu Anak Usia Dini (0–6 Tahun)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Data anak usia 0–6 tahun yang bersekolah bersumber resmi dari Komunitas PAUD (TK/KB/SPS/TPA/RA, PKBM &amp; SKB) dan bersifat terpadu (read-only bagi warga). Warga dan Kader RT dapat mendaftarkan Data Anak Usia 0–6 Tahun yang belum bersekolah melalui tombol <strong>TAMBAH DATA ANAK</strong>.
                  </p>
                </div>
              </div>
            ) : isPosyandu ? (
              <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3.5 sm:p-4 flex items-start gap-3 text-foreground shadow-2xs">
                <HeartPulse className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                    Integrasi Layanan Primer (ILP) &amp; DDTK Tumbuh Kembang
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Data pemantauan balita dan anak usia 0–6 tahun terintegrasi dengan siklus hidup Posyandu ILP. Kader Posyandu dapat memvalidasi dan memantau status gizi serta tumbuh kembang anak di wilayah ini.
                  </p>
                </div>
              </div>
            ) : (isReadOnlyDataAnak && canViewDetailDataAnak) ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4 flex items-start gap-3 text-foreground shadow-2xs">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    Mode Akses: Anggota Komunitas ({userRoleDataAnak || userPeran || "Anggota"})
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sebagai pengguna yang telah bergabung dalam komunitas ini, Anda memiliki akses melihat data rincian anak (View-Only). Penambahan, perubahan, dan penghapusan data dikelola oleh Admin Komunitas.
                  </p>
                </div>
              </div>
            ) : null}

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
                  {isPaudCommunity ? "Siswa Terdata" : "Anak Terdaftar"}
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

            {/* SUB-FILTER PEMISAH JENIS DATA ANAK (KHUSUS KOMUNITAS WARGA KITA) */}
            {isWargaKita && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-3.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/15 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Pemisahan Kategori Data Anak Usia Dini (0–6 Tahun)
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Pemisahan data anak bersekolah &amp; belum bersekolah
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDataAnakFilterSubTab("semua")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5",
                      dataAnakFilterSubTab === "semua"
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>Semua Data Anak</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                      {totalChildren}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDataAnakFilterSubTab("bersekolah")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5",
                      dataAnakFilterSubTab === "bersekolah"
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-teal-500/10 hover:text-teal-700"
                    )}
                  >
                    <School className="h-3.5 w-3.5" />
                    <span>Sudah Bersekolah (PAUD/TK/KB)</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                      {totalBersekolahCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDataAnakFilterSubTab("belum_bersekolah")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5",
                      dataAnakFilterSubTab === "belum_bersekolah"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-amber-500/10 hover:text-amber-800"
                    )}
                  >
                    <Baby className="h-3.5 w-3.5" />
                    <span>Belum Bersekolah</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                      {totalBelumBersekolahCount}
                    </span>
                  </button>
                </div>

                {dataAnakFilterSubTab === "bersekolah" && (
                  <p className="text-2xs text-muted-foreground flex items-center gap-1 pt-0.5">
                    <Info className="h-3 w-3 text-primary shrink-0" />
                    <span>
                      Data anak yang sudah bersekolah bersumber dari Satuan PAUD (TK/KB/SPS/TPA/RA, PKBM &amp; SKB) dan bersifat terpadu (read-only bagi warga).
                    </span>
                  </p>
                )}
                {dataAnakFilterSubTab === "belum_bersekolah" && (
                  <p className="text-2xs text-muted-foreground flex items-center gap-1 pt-0.5">
                    <Info className="h-3 w-3 text-secondary shrink-0" />
                    <span>
                      Data anak usia 0–6 tahun di lingkungan RT/RW yang belum bersekolah. Kader/Warga dapat menambahkan data melalui tombol Tambah Data Anak.
                    </span>
                  </p>
                )}
              </div>
            )}

            {canViewDetailDataAnak ? (
              <>
                {/* SEARCH & TAMBAH DATA ANAK */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQueryAnak}
                      onChange={(e) => setSearchQueryAnak(e.target.value)}
                      placeholder="Cari nama anak, orang tua, atau sekolah..."
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
                    <span>Semua Data</span>
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
                        ({displayedChildren.length} DATA)
                      </span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {displayedChildren.length} dari total {totalChildren} anak
                    </span>
                  </div>

                  {displayedChildren.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <Baby className="h-6 w-6" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="text-sm font-bold tracking-tight text-foreground">
                          Belum Ada Data Anak
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {searchQueryAnak
                            ? "Tidak ditemukan data anak yang sesuai dengan kata kunci pencarian."
                            : isPaudCommunity
                            ? "Admin, Kepala Sekolah, dan Guru PAUD dapat menambahkan siswa terdaftar di satuan PAUD ini."
                            : "Kader dan pengurus dapat menambahkan data anak usia 0–6 tahun di lingkungan komunitas ini."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    displayedChildren.map((child) => {
                      const isChildFromPaudSchool =
                        child.is_sekolah === true ||
                        Boolean(
                          child.nama_sekolah &&
                            !child.nama_sekolah.toLowerCase().includes("belum")
                        );

                      const isReadOnlyForThisChild =
                        (isWargaKitaCheck && isChildFromPaudSchool) || Boolean(isReadOnlyDataAnak);

                      const canEditForThisChild =
                        (isWargaKitaCheck && isChildFromPaudSchool)
                          ? false
                          : Boolean(canEditDataAnak);

                      const canDeleteForThisChild =
                        (isWargaKitaCheck && isChildFromPaudSchool)
                          ? false
                          : Boolean(canDeleteDataAnak);

                      const canValidateForThisChild =
                        (isWargaKitaCheck && isChildFromPaudSchool)
                          ? false
                          : Boolean(canValidateDataAnak);

                      return (
                        <CardDataAnak
                          key={child.id}
                          anak={child}
                          komunitas={komunitasData}
                          canViewDetail={true}
                          canValidate={canValidateForThisChild}
                          canEdit={canEditForThisChild}
                          canDelete={canDeleteForThisChild}
                          isReadOnly={isReadOnlyForThisChild}
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
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* BLOK AKSES TERKUNCI UNTUK SELAIN ADMIN DAN PENGGUNA YANG TELAH BERGABUNG */
              <div className="rounded-lg border border-border bg-card p-6 text-center space-y-4 shadow-sm pb-8">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-lg bg-secondary/15 border border-secondary/30 text-secondary shadow-2xs">
                  <Lock className="h-7 w-7" />
                </div>

                <div className="space-y-1.5 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground border border-border">
                    <ShieldAlert className="h-3.5 w-3.5 text-secondary" />
                    <span>Privasi &amp; Perlindungan Data Anak</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Akses Rincian Identitas Anak Terkunci
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sesuai ketentuan perlindungan privasi data anak, rincian identitas lengkap hanya dapat diakses oleh <strong>Admin Komunitas</strong> serta <strong>Pengguna yang telah bergabung</strong> dalam komunitas ini. Anda tetap dapat meninjau statistik agregat pada tab <strong>Rekap, Grafik &amp; Diagram</strong>.
                  </p>
                </div>

                <div className="pt-2 max-w-md mx-auto">
                  {!currentUserId ? (
                    <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4 text-left">
                      <p className="text-xs text-foreground font-semibold leading-relaxed">
                        Silakan masuk atau daftar akun JARIMAS-ID untuk bergabung dan mengakses data komunitas:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <Link
                          href={`/login?redirect=/komunitas/${komunitasData.id}`}
                          className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          <span>Masuk ke Akun</span>
                        </Link>
                        <Link
                          href={`/register?redirect=/komunitas/${komunitasData.id}`}
                          className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-bold transition-all active:scale-[0.98]"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Daftar Akun</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4 text-left">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground leading-relaxed">
                          Anda saat ini belum terdaftar sebagai anggota komunitas ini (atau pendaftaran Anda masih menunggu verifikasi admin). Bergabunglah ke komunitas untuk dapat melihat daftar detail anak.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsJoinModalOpen(true)}
                        className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Gabung Komunitas Ini</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REKAP, GRAFIK & DIAGRAM */}
        {activeMainTab === "rekap" && (
          <div className="space-y-6 animate-in fade-in duration-150 pb-8">
            {isPaudCommunity || isPaud ? (
              <PaudRekapGrafikView
                childrenList={dataAnakState}
                komunitasNama={komunitasData.nama}
              />
            ) : (
              <KomunitasRekapGrafikView
                scopeRekapItem={rekapPaudCalc.scopeRekapItem}
                subTierItems={rekapPaudCalc.subTierItems}
                subTierTitle={rekapPaudCalc.subTierTitle}
                subTierColumnLabel={rekapPaudCalc.subTierColumnLabel}
                scopeType={rekapPaudCalc.scopeType}
                komunitasNama={komunitasData.nama}
              />
            )}
          </div>
        )}

        {/* TAB 3: DATA ATS (ANAK TIDAK SEKOLAH) */}
        {activeMainTab === "ats" && (
          <div className="space-y-4 animate-in fade-in duration-150 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/10 border border-secondary/25 p-4 rounded-xl shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground shadow-2xs">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Penanganan Kasus Anak Tidak Sekolah (ATS)
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                    {isPkbmOrSkb
                      ? "PKBM dan SKB berperan sebagai garda terdepan pengentasan ATS di Kota Tegal melalui Program Kesetaraan Paket A (SD), Paket B (SMP), dan Paket C (SMA)."
                      : "Pemantauan dan pendataan anak usia sekolah (7–18 tahun) yang putus sekolah atau belum pernah bersekolah untuk diintervensi kembali ke satuan pendidikan formal maupun nonformal."}
                  </p>
                </div>
              </div>

              <Link
                href={`/komunitas/${komunitas.id}/ats`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-hover text-secondary-foreground text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <span>Buka Manajemen ATS</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 3 Kartu Metrik ATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1 text-center">
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">
                  TOTAL KASUS ATS
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                  {dataAtsState.length}
                </span>
                <span className="text-2xs font-semibold text-muted-foreground block">
                  Kasus Terdata
                </span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 shadow-2xs space-y-1 text-center">
                <span className="text-2xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  LAYANAN KESETARAAN
                </span>
                <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-300 py-1.5 block">
                  Paket A, B &amp; C
                </span>
                <span className="text-2xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                  SD / SMP / SMA
                </span>
              </div>

              <div className="p-4 rounded-xl border border-secondary/30 bg-secondary/15 shadow-2xs space-y-1 text-center">
                <span className="text-2xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block">
                  INTERVENSI AKTIF
                </span>
                <span className="text-sm font-black font-mono text-secondary py-1.5 block">
                  Pemberdayaan
                </span>
                <span className="text-2xs font-semibold text-amber-900 dark:text-amber-200 block">
                  Pamong &amp; Tutor Belajar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAPORAN KADER SPM */}
        {activeMainTab === "laporan_spm" && (
          <div className="space-y-4 animate-in fade-in duration-150 pb-8">
            {isPosyandu && (
              <LaporanKaderSpmFormCard
                komunitas={komunitasData}
                currentUserId={currentUserId}
                userName={myProfileName}
                isAdminOrKader={canAccessLaporanPosyandu}
              />
            )}

            {isWargaKita && (
              <RekapLaporanKaderWilayahCard
                komunitas={komunitasData}
                isAdminOrKader={isAdminOrKader}
                currentUserId={currentUserId}
              />
            )}
          </div>
        )}

        {/* TAB 5: DAFTAR ANGGOTA */}
        {activeMainTab === "anggota" && (
          <div className="space-y-4 animate-in fade-in duration-150 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-card p-3 sm:p-3.5 rounded-xl border border-border shadow-2xs">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  {isPosyandu
                    ? "Daftar Kader & Anggota Posyandu"
                    : isWargaKita
                    ? "Daftar Warga & Pengurus Komunitas"
                    : isPaudCommunity
                    ? "Daftar Anggota & Pendidik PAUD"
                    : "Daftar Anggota Komunitas"}
                </h3>
                <p className="text-2xs text-muted-foreground font-medium">
                  Total {approvedMembers.length} anggota aktif terdaftar
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

            {/* Alert Feedback Aksi Anggota / Admin */}
            {actionFeedback && (
              <div
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl p-3 text-xs font-medium border shadow-2xs animate-in fade-in",
                  actionFeedback.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200"
                )}
              >
                <div className="flex items-center gap-2">
                  {actionFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{actionFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActionFeedback(null)}
                  className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* SECTION: TAMPILAN ADMIN KOMUNITAS (DILIHAT OLEH SELURUH PENGGUNA) */}
            {hasAdmin ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 sm:p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                        <span>Admin &amp; Pengelola Resmi Komunitas</span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">
                          {adminMembers.length} Admin
                        </span>
                      </h4>
                      <p className="text-2xs text-muted-foreground">
                        Pengelola aktif yang bertanggung jawab atas kegiatan, layanan, dan validasi data di komunitas ini.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {adminMembers.map((admin) => {
                    const adminName = admin.profiles?.nama_lengkap || "Pengurus Komunitas";
                    const initial = adminName.charAt(0).toUpperCase();
                    const hp = admin.profiles?.nomor_hp;
                    const email = admin.profiles?.email;
                    const role = formatPeranDisplay(admin.peran);

                    return (
                      <div
                        key={admin.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-card border border-border shadow-2xs hover:border-emerald-500/40 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-base shadow-2xs">
                            {initial}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                {adminName}
                              </p>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                                {role}
                              </span>
                            </div>
                            <p className="text-2xs text-muted-foreground truncate">
                              {email || "-"}
                            </p>
                            {hp && (
                              <div className="pt-0.5">
                                <a
                                  href={formatWhatsAppUrl(hp, `Halo Admin ${komunitasData.nama}...`) || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>WA: {hp}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-300/80 dark:border-amber-700/50 bg-amber-500/10 p-3.5 sm:p-4 space-y-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-0.5">
                    <ShieldAlert className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                        Belum Ada Admin Komunitas Terdaftar
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-2xs">
                        Perlu Ditentukan
                      </span>
                    </div>
                    <p className="text-2xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                      Komunitas ini saat ini belum memiliki pengelola yang berstatus sebagai Admin resmi. Seluruh pengguna dapat melihat informasi status ini. Pelayanan administratif dan validasi data dapat dikoordinasikan melalui pembina wilayah di atasnya.
                    </p>

                    {/* NOTICE KHUSUS: HANYA DILIHAT OLEH ADMIN DI ATASNYA */}
                    {canAssignAdmin && (
                      <div className="mt-2.5 rounded-lg border border-primary/30 bg-primary/10 p-2.5 sm:p-3 text-2xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-primary">
                          <ShieldPlus className="h-4 w-4" />
                          <span>Kewenangan Pembina Wilayah / Admin di Atasnya</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Sebagai Admin di atas komunitas ini, Anda berwenang mengangkat salah satu anggota aktif di bawah menjadi <strong className="text-foreground">{defaultAdminRole}</strong>.
                          {approvedMembers.length > 0 ? (
                            <span> Silakan tentukan anggota pada daftar di bawah dan tekan tombol <strong className="text-emerald-700 dark:text-emerald-300">"Angkat Jadi Admin"</strong>.</span>
                          ) : (
                            <span> Belum ada anggota terdaftar. Anggota perlu bergabung terlebih dahulu sebelum dapat diangkat sebagai Admin.</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Khusus Posyandu: Struktur Rincian Kontak 6 Bidang Kader SPM */}
            {isPosyandu && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wide">
                      Kontak 6 Bidang Kader SPM Posyandu (Permendagri No. 13 Tahun 2024)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                    6 Bidang Layanan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {/* 1. Pendidikan */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Kader Pendidikan
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {parsedKontak.kader_pendidikan.nama || "Belum ditentukan"}
                    </p>
                    {parsedKontak.kader_pendidikan.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_pendidikan.wa, `Halo Kader Pendidikan Posyandu ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WA: {parsedKontak.kader_pendidikan.wa}</span>
                      </a>
                    )}
                  </div>

                  {/* 2. Kesehatan */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <HeartPulse className="h-3.5 w-3.5" />
                      Kader Kesehatan
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {parsedKontak.kader_kesehatan.nama || "Belum ditentukan"}
                    </p>
                    {parsedKontak.kader_kesehatan.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_kesehatan.wa, `Halo Kader Kesehatan Posyandu ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WA: {parsedKontak.kader_kesehatan.wa}</span>
                      </a>
                    )}
                  </div>

                  {/* 3. Pekerjaan Umum */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5" />
                      Kader Pekerjaan Umum
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {parsedKontak.kader_pekerjaan_umum.nama || "Belum ditentukan"}
                    </p>
                    {parsedKontak.kader_pekerjaan_umum.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_pekerjaan_umum.wa, `Halo Kader PU Posyandu ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WA: {parsedKontak.kader_pekerjaan_umum.wa}</span>
                      </a>
                    )}
                  </div>

                  {/* 4. Perumahan Rakyat */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-cyan-600 flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      Kader Perumahan Rakyat
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {parsedKontak.kader_perumahan_rakyat.nama || "Belum ditentukan"}
                    </p>
                    {parsedKontak.kader_perumahan_rakyat.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_perumahan_rakyat.wa, `Halo Kader Perkim Posyandu ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WA: {parsedKontak.kader_perumahan_rakyat.wa}</span>
                      </a>
                    )}
                  </div>

                  {/* 5. Trantibumlinmas */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Kader Trantibumlinmas
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {parsedKontak.kader_trantipbumlinmas.nama || "Belum ditentukan"}
                    </p>
                    {parsedKontak.kader_trantipbumlinmas.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_trantipbumlinmas.wa, `Halo Kader Trantibum Posyandu ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WA: {parsedKontak.kader_trantipbumlinmas.wa}</span>
                      </a>
                    )}
                  </div>

                  {/* 6. Sosial */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Kader Sosial
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {parsedKontak.kader_sosial.nama || "Belum ditentukan"}
                    </p>
                    {parsedKontak.kader_sosial.wa && (
                      <a
                        href={formatWhatsAppUrl(parsedKontak.kader_sosial.wa, `Halo Kader Sosial Posyandu ${komunitasData.nama}...`) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>WA: {parsedKontak.kader_sosial.wa}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {approvedMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-xs font-semibold text-muted-foreground">
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
                            isOfficialAdminKomunitas(member.peran, komunitas.jenis)
                              ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 font-black shadow-2xs"
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

                        {/* TOMBOL ANGKAT SEBAGAI ADMIN (HANYA DILIHAT OLEH ADMIN DI ATASNYA JIKA BELUM ADA ADMIN) */}
                        {!hasAdmin && canAssignAdmin && !isOfficialAdminKomunitas(member.peran, komunitas.jenis) && (
                          <button
                            type="button"
                            disabled={isPromoting}
                            onClick={() => setPromoteTargetMember(member)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/60 px-2.5 py-1 text-2xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                            title={`Angkat ${name} menjadi Admin (${defaultAdminRole})`}
                          >
                            <ShieldPlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Angkat Jadi Admin</span>
                          </button>
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

        {/* TAB 6: KABAR KOMUNITAS */}
        {activeMainTab === "kabar" && (
          <div className="space-y-4 animate-in fade-in duration-150 pb-8">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Kabar &amp; Pengumuman Komunitas
                </h3>
                <p className="text-2xs text-muted-foreground">
                  Bagikan pengumuman, agenda kegiatan, dan kabar penting untuk seluruh anggota komunitas
                </p>
              </div>
            </div>

            {isTheOrbitSixty && !isApprovedMember && !isSuperOrPusat ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-8 sm:p-10 text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h4 className="text-sm font-bold text-foreground">
                    Kabar Komunitas Khusus Anggota
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Kabar dan pengumuman komunitas The Orbit Sixty bersifat tertutup khusus untuk anggota komunitas yang telah bergabung.
                  </p>
                </div>
                {!currentUserId ? (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk untuk Bergabung</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Ajukan Gabung Komunitas</span>
                  </button>
                )}
              </div>
            ) : kabarKomunitas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold tracking-tight text-foreground">
                    Belum Ada Kabar Komunitas
                  </h4>
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

            {/* Tombol Buat Kabar hanya jika anggota disetujui atau admin */}
            {(!isTheOrbitSixty || isApprovedMember || isSuperOrPusat) && (
              <CreateKabarModal
                currentUserId={currentUserId}
                komunitasId={komunitas.id}
                komunitasNama={komunitasData.nama}
              />
            )}
          </div>
        )}

        {/* TAB 7: PERCAKAPAN KOMUNITAS */}
        {activeMainTab === "percakapan" && (
          <div className="space-y-4 animate-in fade-in duration-150 pb-8">
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
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL-MODAL TERPADU KOMUNITAS                                             */}
      {/* ========================================================================= */}
      {/* 1. Modal Edit Informasi Resmi & Operasional Lembaga / Komunitas */}
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

      {/* 2. Modal Tambah Data Anak / Siswa Baru */}
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
                    {isPaudCommunity ? "Tambah Data Siswa PAUD Baru" : "Tambah Data Anak Usia Dini (0–6 Tahun)"}
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
              komunitasId={komunitas.id}
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

      {/* 3. Modal Ajukan Diri Sebagai Admin (Untuk Warga RT yang Belum Punya Admin) */}
      {isApplyAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <h3 className="font-bold text-foreground text-sm">
                  Ajukan Diri Sebagai Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyAdminOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Sebagai penduduk di lingkungan{" "}
              <strong className="text-foreground">{komunitasData.nama}</strong>,
              Anda dapat mengajukan diri menjadi Admin/Pengurus untuk mengelola
              kegiatan dan data warga.
            </p>

            <form onSubmit={handleApplyAdmin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Nomor Handphone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={adminHp}
                  onChange={(e) => setAdminHp(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Catatan / Pengalaman Pengurus (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Saya pengurus RT aktif / kader setempat..."
                  value={adminCatatan}
                  onChange={(e) => setAdminCatatan(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-hidden resize-none"
                />
              </div>

              {adminFeedback && (
                <div
                  className={cn(
                    "p-2.5 rounded-lg text-xs font-semibold",
                    adminFeedback.includes("berhasil")
                      ? "bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/20"
                      : "bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20"
                  )}
                >
                  {adminFeedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsApplyAdminOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmin}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-secondary-foreground text-xs font-bold shadow-2xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAdmin && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Kirim Pengajuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Konfirmasi Keluar Komunitas */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">
                  Keluar dari Komunitas
                </h3>
                <p className="text-2xs text-muted-foreground">
                  Konfirmasi pengunduran diri
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin keluar dari{" "}
              <strong className="text-foreground">{komunitasData.nama}</strong>?
              Akses obrolan dan fitur anggota Anda akan dicabut.
            </p>

            {actionFeedback && (
              <div
                className={cn(
                  "p-2.5 rounded-lg text-xs font-semibold",
                  actionFeedback.type === "success"
                    ? "bg-teal-500/10 text-teal-800 dark:text-teal-300"
                    : "bg-rose-500/10 text-rose-800 dark:text-rose-300"
                )}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setIsLeaveModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleLeave}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>Ya, Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Konfirmasi Melepas Jabatan Admin */}
      {isResignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <UserMinus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">
                  Lepas Jabatan Admin
                </h3>
                <p className="text-2xs text-muted-foreground">
                  Konfirmasi permohonan
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin berhenti sebagai Admin di{" "}
              <strong className="text-foreground">{komunitasData.nama}</strong>?
              Peran Anda akan kembali menjadi Penduduk/Pengunjung biasa.
            </p>

            {actionFeedback && (
              <div
                className={cn(
                  "p-2.5 rounded-lg text-xs font-semibold",
                  actionFeedback.type === "success"
                    ? "bg-teal-500/10 text-teal-800 dark:text-teal-300"
                    : "bg-rose-500/10 text-rose-800 dark:text-rose-300"
                )}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setIsResignModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleResign}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-secondary-foreground text-xs font-bold shadow-2xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserMinus className="h-3.5 w-3.5" />
                )}
                <span>Ya, Lepas Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Konfirmasi Mengeluarkan Anggota (Khusus Pengurus) */}
      {kickTargetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <UserX className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">
                  Keluarkan Anggota
                </h3>
                <p className="text-2xs text-muted-foreground">
                  Tindakan administratif
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin mengeluarkan{" "}
              <strong className="text-foreground">
                {kickTargetMember.profiles?.nama_lengkap || "Anggota"}
              </strong>{" "}
              dari komunitas{" "}
              <strong className="text-foreground">{komunitasData.nama}</strong>?
            </p>

            {actionFeedback && (
              <div
                className={cn(
                  "p-2.5 rounded-lg text-xs font-semibold",
                  actionFeedback.type === "success"
                    ? "bg-teal-500/10 text-teal-800 dark:text-teal-300"
                    : "bg-rose-500/10 text-rose-800 dark:text-rose-300"
                )}
              >
                {actionFeedback.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setKickTargetMember(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleKickMember}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserX className="h-3.5 w-3.5" />
                )}
                <span>Ya, Keluarkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Kelola Kartu Layanan (Super Admin & Admin Pusat) */}
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
                      Pendataan anak usia dini dan tumbuh kembang
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

      {/* 8. Modal Kelola & Undang Anggota (Pengurus) */}
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

      {/* 9. Modal Ajukan Perubahan Peran Anggota */}
      {isUbahPeranOpen && (
        <AjukanPerubahanPeranModal
          komunitas={komunitasData}
          currentPeran={userPeran}
          currentPeranDiajukan={membershipState?.peran_diajukan}
          isOpen={isUbahPeranOpen}
          onClose={() => setIsUbahPeranOpen(false)}
          onSuccess={(newPeranDiajukan) => {
            setMembershipState((prev) =>
              prev ? { ...prev, peran_diajukan: newPeranDiajukan } : null
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

      {/* 10. Modal Bergabung Komunitas */}
      {isJoinModalOpen && (
        <JoinKomunitasModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          komunitas={komunitasData}
          onSuccess={() => {
            setIsJoinModalOpen(false);
            window.location.reload();
          }}
        />
      )}

      {/* 11. Modal Onboarding Warga (Warga Kita) */}
      {isWargaOnboardingOpen && (
        <WargaOnboardingModal
          isOpen={isWargaOnboardingOpen}
          onClose={() => setIsWargaOnboardingOpen(false)}
          komunitas={komunitasData}
          currentUserId={currentUserId}
          onSuccess={() => {
            setIsWargaOnboardingOpen(false);
            window.location.reload();
          }}
        />
      )}

      {/* 12. Modal Konfirmasi Angkat Admin oleh Admin di Atasnya */}
      {promoteTargetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Angkat Menjadi Admin Komunitas
                  </h3>
                  <p className="text-2xs text-muted-foreground">
                    Penetapan Pengelola Resmi Komunitas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPromoting && setPromoteTargetMember(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-muted-foreground">
                Sebagai Admin di atasnya, Anda akan mengangkat anggota berikut menjadi <strong className="text-foreground">{defaultAdminRole}</strong> untuk mengelola komunitas <strong className="text-foreground">{komunitasData.nama}</strong>:
              </p>

              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5">
                <div className="flex justify-between items-center text-2xs">
                  <span className="text-muted-foreground">Nama Anggota:</span>
                  <span className="font-bold text-foreground">
                    {promoteTargetMember.profiles?.nama_lengkap || "Warga Komunitas"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-2xs">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-muted-foreground">
                    {promoteTargetMember.profiles?.email || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-2xs">
                  <span className="text-muted-foreground">Peran Saat Ini:</span>
                  <span className="font-bold text-muted-foreground">
                    {formatPeranDisplay(promoteTargetMember.peran)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-2xs border-t border-border/60 pt-1.5">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Peran Baru (Admin):</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                    {defaultAdminRole}
                  </span>
                </div>
              </div>

              <p className="text-2xs text-muted-foreground bg-primary/5 border border-primary/15 rounded-lg p-2.5">
                ℹ️ Setelah diangkat, anggota ini akan memiliki wewenang penuh sebagai Admin pengelola komunitas, termasuk memperbarui informasi operasional, mengelola anggota, dan memvalidasi data anak.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                disabled={isPromoting}
                onClick={() => setPromoteTargetMember(null)}
                className="rounded-lg border border-border bg-card hover:bg-muted px-3.5 py-2 text-xs font-bold text-foreground transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPromoting}
                onClick={handleConfirmPromoteAdmin}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isPromoting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Ya, Angkat Jadi Admin</span>
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
