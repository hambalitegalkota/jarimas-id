export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAnakByKomunitas } from "@/app/actions/data-anak";
import {
  getRekapDataAnakUsiaDiniAction,
  checkUserRekapAdminAccess,
} from "@/app/actions/rekap-data-anak";
import { DataAnakClientView } from "@/app/(main)/komunitas/[id]/data/data-anak-client-view";
import { PrintButton } from "@/components/ui/print-button";
import { extractKomunitasMetadata, getKomunitasFeatureCards } from "@/lib/admin-helpers";
import { buildKomunitasScopedRekap } from "@/lib/komunitas-rekap-calculator";
import { isKomunitasLayananPaud } from "@/lib/data-anak-helpers";

interface KotaTegalDataAnakPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function KotaTegalDataAnakPage({
  params,
}: KotaTegalDataAnakPageProps) {
  const { slug } = await params;

  const {
    data: komunitas,
    currentUserId,
    isAdminOrKader,
    isSuperAdmin,
    isAdminPusat,
    isSuperOrAdminPusat,
  } = await getKomunitasDetail(slug);

  if (!komunitas) {
    notFound();
  }

  const { canShowDataAnak } = getKomunitasFeatureCards(komunitas);
  if (!canShowDataAnak) {
    redirect(`/kotategal/${slug}`);
  }

  // Ambil data rincian anak komunitas dan rekapitulasi kota secara paralel
  const [dataAnakResult, { data: rekapData }] = await Promise.all([
    getDataAnakByKomunitas(komunitas.id, {
      preloadedKomunitas: komunitas,
      isAdminOrKader,
      currentUserMembership: komunitas.currentUserMembership,
    }),
    getRekapDataAnakUsiaDiniAction(),
  ]);

  const {
    data: childrenList,
    stats,
    canViewDetail = false,
    isAuthenticated = false,
    canValidate = false,
    canCreate = false,
    canEdit = false,
    canDelete = false,
    isReadOnly = true,
    userRole = "Pengunjung",
  } = dataAnakResult;

  const isPaud = isKomunitasLayananPaud(komunitas, komunitas.nama, komunitas.jenis);

  const hasRootAccess = Boolean(isSuperOrAdminPusat || isSuperAdmin || isAdminPusat);

  const scopedRekapCalc = buildKomunitasScopedRekap(
    komunitas,
    childrenList || [],
    rekapData || undefined
  );

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/kotategal/${slug}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-primary" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
        <PrintButton variant="outline" size="sm" />
      </div>

      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
              DATA ANAK USIA DINI (0–6 TAHUN)
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {komunitas.nama}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isPaud
              ? "Daftar Detail Anak Usia 0–6 Tahun"
              : "Data Anak Usia Dini (0–6 Tahun)"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {isPaud
              ? `Pemantauan, verifikasi status, dan pengelolaan data anak usia dini (0–6 tahun) di ${komunitas.nama}.`
              : `Pemantauan status pendidikan anak usia 0–6 tahun di ${komunitas.nama}: anak yang sudah bersekolah (PAUD/PKBM/SKB) dan anak yang belum bersekolah.`}
          </p>
        </div>
      </div>

      <DataAnakClientView
        komunitas={komunitas}
        initialChildren={childrenList}
        stats={stats}
        scopedRekapItem={scopedRekapCalc.scopeRekapItem}
        subTierItems={scopedRekapCalc.subTierItems}
        subTierTitle={scopedRekapCalc.subTierTitle}
        subTierColumnLabel={scopedRekapCalc.subTierColumnLabel}
        scopeType={scopedRekapCalc.scopeType}
        canViewDetail={hasRootAccess ? true : canViewDetail}
        isAuthenticated={hasRootAccess ? true : isAuthenticated}
        canValidate={hasRootAccess ? true : canValidate}
        canCreate={hasRootAccess ? true : canCreate}
        canEdit={hasRootAccess ? true : canEdit}
        canDelete={hasRootAccess ? true : canDelete}
        isReadOnly={hasRootAccess ? false : isReadOnly}
        userRole={
          isSuperAdmin
            ? "Super Admin"
            : isAdminPusat
            ? "Admin Pusat"
            : userRole
        }
      />
    </div>
  );
}
