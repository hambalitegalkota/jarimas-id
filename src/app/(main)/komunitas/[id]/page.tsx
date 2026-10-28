import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Phone,
  ShieldCheck,
  Building2,
  Sparkles,
  MessageSquare,
  Settings2,
  CheckCircle2,
  Clock,
  UserCheck,
  Share2,
} from "lucide-react";
import {
  getKomunitasDetail,
  getAnggotaKomunitas,
} from "@/app/actions/komunitas";
import { getDataAnakByKomunitas } from "@/app/actions/data-anak";
import { getDataAtsByKomunitas } from "@/app/actions/data-ats";
import { getKabarFeed } from "@/app/actions/kabar";
import { getRekapDataAnakUsiaDiniAction } from "@/app/actions/rekap-data-anak";
import { toValidUUID } from "@/lib/utils";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { KomunitasDetailClientView } from "./detail-client-view";
import { PrintButton } from "@/components/ui/print-button";
import { getKomunitasFeatureCards, isTheOrbitSixtyCommunity } from "@/lib/admin-helpers";
import { isKomunitasLayananPaud } from "@/lib/data-anak-helpers";
import { buildKomunitasScopedRekap } from "@/lib/komunitas-rekap-calculator";
import { checkCanManageKomunitasAdminsAction } from "@/app/actions/admin";

interface KomunitasDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    subtab?: string;
  }>;
}

export default async function KomunitasDetailPage({
  params,
  searchParams,
}: KomunitasDetailPageProps) {
  const { id } = await params;
  const { subtab } = await searchParams;
  const currentSubtab = subtab || null;

  const {
    data: komunitas,
    currentUserId,
    isAdminOrKader,
    isSuperAdmin,
    isAdminPusat,
    isSuperOrAdminPusat,
  } = await getKomunitasDetail(id);

  if (!komunitas) {
    notFound();
  }

  const { canShowDataAnak, canShowDataAts } = getKomunitasFeatureCards(komunitas);
  const isPaud = isKomunitasLayananPaud(komunitas, komunitas.nama, komunitas.jenis);
  const hasRootAccess = Boolean(isSuperOrAdminPusat || isSuperAdmin || isAdminPusat);

  // Ambil data anggota, data anak, data ATS, kabar, rekap, dan kewenangan pengangkatan admin secara paralel
  const [
    { data: anggotaList },
    dataAnakRes,
    dataAtsRes,
    { data: allKabar },
    rekapDataRes,
    canManageAdminsRes,
  ] = await Promise.all([
    getAnggotaKomunitas(id),
    canShowDataAnak
      ? getDataAnakByKomunitas(id, {
          countOnly: false,
          preloadedKomunitas: komunitas,
          isAdminOrKader,
          currentUserMembership: komunitas.currentUserMembership,
        })
      : Promise.resolve({
          success: true,
          data: [],
          stats: { total: 0, approved: 0, pending: 0 },
          canViewDetail: false,
          isAuthenticated: false,
          canValidate: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          isReadOnly: true,
          userRole: "Pengunjung",
        }),
    canShowDataAts ? getDataAtsByKomunitas(id) : Promise.resolve({ data: [] }),
    getKabarFeed({ filterVisibilitas: "semua", limit: 20 }),
    canShowDataAnak ? getRekapDataAnakUsiaDiniAction() : Promise.resolve({ data: null }),
    currentUserId ? checkCanManageKomunitasAdminsAction(id) : Promise.resolve(false),
  ]);

  const canAssignAdmin = hasRootAccess ? true : Boolean(canManageAdminsRes);
  const dataAnakList = dataAnakRes?.data || [];
  const dataAtsList = dataAtsRes?.data || [];
  const dbKomunitasId = toValidUUID(id);
  const cleanNama = (komunitas.nama || "").toLowerCase().trim();
  const isOrbitSixty = isTheOrbitSixtyCommunity(komunitas);
  const isApprovedMember = komunitas.currentUserMembership?.status === "approved";
  const canViewOrbitSixtyKabar = hasRootAccess || isApprovedMember;

  const kabarKomunitas =
    isOrbitSixty && !canViewOrbitSixtyKabar
      ? []
      : (allKabar || []).filter((k) => {
          // 1. Cocok langsung dengan ID komunitas
          if (k.komunitas_id === id || k.komunitas_id === dbKomunitasId) {
            return true;
          }
          // 2. Konten secara spesifik menyebutkan nama komunitas
          if (
            cleanNama.length > 3 &&
            k.konten &&
            k.konten.toLowerCase().includes(cleanNama)
          ) {
            return true;
          }
          return false;
        });

  // Hitung rekap dinamis untuk seluruh jenis Komunitas (PAUD, Posyandu, Warga Kita, PKBM/SKB)
  const scopedRekapCalc = canShowDataAnak
    ? buildKomunitasScopedRekap(komunitas, dataAnakList, rekapDataRes?.data || undefined)
    : null;

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/komunitas"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-primary" />
          <span>Kembali ke Komunitas</span>
        </Link>
        <PrintButton variant="outline" size="sm" />
      </div>

      {/* Hero Header Card & Client View */}
      <KomunitasDetailClientView
        komunitas={komunitas}
        currentUserId={currentUserId}
        isAdminOrKader={isAdminOrKader}
        isSuperAdmin={isSuperAdmin}
        isAdminPusat={isAdminPusat}
        isSuperOrAdminPusat={isSuperOrAdminPusat}
        currentSubtab={currentSubtab}
        anggotaList={anggotaList}
        kabarKomunitas={kabarKomunitas}
        dataAnakList={dataAnakList || []}
        dataAtsList={dataAtsList || []}
        dataAnakStats={dataAnakRes?.stats}
        canValidateDataAnak={hasRootAccess ? true : (dataAnakRes?.canValidate ?? false)}
        canCreateDataAnak={hasRootAccess ? true : (dataAnakRes?.canCreate ?? false)}
        canEditDataAnak={hasRootAccess ? true : (dataAnakRes?.canEdit ?? false)}
        canDeleteDataAnak={hasRootAccess ? true : (dataAnakRes?.canDelete ?? false)}
        isReadOnlyDataAnak={hasRootAccess ? false : (dataAnakRes?.isReadOnly ?? true)}
        canViewDetailDataAnak={hasRootAccess ? true : (dataAnakRes?.canViewDetail ?? false)}
        userRoleDataAnak={dataAnakRes?.userRole}
        scopedRekapResult={scopedRekapCalc}
        canAssignAdmin={canAssignAdmin}
      />
    </div>
  );
}
