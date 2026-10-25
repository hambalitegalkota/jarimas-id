import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAtsByKomunitas } from "@/app/actions/data-ats";
import { checkIsPkbmOrSkb } from "@/lib/ats-helpers";
import { getRekapDataAtsAction } from "@/app/actions/rekap-data-ats";
import { checkUserRekapAdminAccess } from "@/app/actions/rekap-data-anak";
import { DataAtsClientView } from "@/components/data-ats/data-ats-client-view";
import { RekapDataAtsClientView } from "@/components/data-ats/rekap-data-ats-client-view";
import { PrintButton } from "@/components/ui/print-button";
import { extractKomunitasMetadata, getKomunitasFeatureCards } from "@/lib/admin-helpers";
import { isRoleAdmin } from "@/lib/utils";

interface KomunitasDataAtsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KomunitasDataAtsPage({
  params,
}: KomunitasDataAtsPageProps) {
  const { id } = await params;

  const {
    data: komunitas,
    isSuperAdmin,
    isAdminPusat,
    isSuperOrAdminPusat,
  } = await getKomunitasDetail(id);

  if (!komunitas) {
    notFound();
  }

  const { canShowDataAts } = getKomunitasFeatureCards(komunitas);
  if (!canShowDataAts) {
    redirect(`/komunitas/${id}`);
  }

  const cleanNama = (komunitas.nama || "").toLowerCase().trim();
  const isSkb =
    komunitas.jenis_institusi === "SKB" ||
    cleanNama.includes("skb") ||
    cleanNama.includes("sanggar kegiatan belajar");
  const isPkbmOrSkb = checkIsPkbmOrSkb(komunitas, id);

  if (isPkbmOrSkb) {
    komunitas.jenis = "pkbm_skb";
    (komunitas as any).jenis_institusi = (komunitas as any).jenis_institusi || (isSkb ? "SKB" : "PKBM");
  }

  const meta = extractKomunitasMetadata(komunitas);
  const isWargaKita = komunitas.jenis === "warga_kita";
  const isRt = isWargaKita && meta.hasRt;
  const isRekapOnlyTier = isWargaKita && !meta.hasRt;

  // Untuk komunitas RW, Kelurahan, Kecamatan, dan Kota Tegal:
  // Data yang ditampilkan HANYA DATA REKAP SAJA disesuaikan levelnya.
  // Super Admin dan Admin Pusat memiliki akses penuh ke daftar rincian nama ATS di seluruh level.
  if (isRekapOnlyTier) {
    const [{ data: rekapData }, authAccess] = await Promise.all([
      getRekapDataAtsAction(),
      checkUserRekapAdminAccess(),
    ]);

    let initialTingkat: "kota" | "kecamatan" | "kelurahan" = "kota";
    if (meta.hasRw || meta.hasKel) {
      initialTingkat = "kelurahan";
    } else if (meta.rawKec && meta.rawKec !== "Kota Tegal") {
      initialTingkat = "kecamatan";
    }

    const canAccessNames = Boolean(
      isSuperOrAdminPusat ||
      isSuperAdmin ||
      isAdminPusat ||
      authAccess.canAccess
    );

    return (
      <main className="w-full min-h-screen bg-background py-4 sm:py-6 print:py-0 print:bg-white print:min-h-0">
        <RekapDataAtsClientView
          initialData={rekapData}
          canAccessDaftarNamaAts={canAccessNames}
          userPeran={
            isSuperAdmin
              ? "Super Admin"
              : isAdminPusat
              ? "Admin Pusat"
              : authAccess.userPeran
          }
          initialTingkat={initialTingkat}
          initialKecamatan={meta.rawKec || "Tegal Timur"}
          initialKelurahan={meta.rawKel || "Kejambon"}
          initialRw={meta.rawRw || undefined}
          customScopeTitle={komunitas.nama}
          backHref={`/komunitas/${id}`}
          backLabel={`Kembali ke ${komunitas.nama}`}
        />
      </main>
    );
  }

  // Khusus Komunitas Tingkat Kelurahan / RT, Posyandu, dan PKBM dan SKB:
  const dataAtsResult = await getDataAtsByKomunitas(id);

  const {
    data: atsList,
    canValidate,
    canManage,
    canAccessDaftarNama: serverCanAccess,
    currentUserId,
    isSuperAdmin: serverIsSuper,
  } = dataAtsResult;

  const hasRootAccess = Boolean(
    isSuperOrAdminPusat ||
    isSuperAdmin ||
    isAdminPusat ||
    serverIsSuper
  );

  // Otorisasi Akses Daftar Rincian Lengkap:
  const membership = komunitas?.currentUserMembership;
  const isApprovedMember = membership?.status === "approved";
  const memberRoleLower = (membership?.peran || "").toLowerCase();
  const isAdminOrPengurus =
    isRoleAdmin(memberRoleLower) ||
    memberRoleLower.includes("admin") ||
    memberRoleLower.includes("pengurus") ||
    memberRoleLower.includes("ketua") ||
    memberRoleLower.includes("tutor") ||
    memberRoleLower.includes("pengelola");
  const isKader = memberRoleLower.includes("kader") || memberRoleLower.includes("medis");

  const canAccessDaftarNama = Boolean(
    hasRootAccess ||
    serverCanAccess ||
    canManage ||
    isPkbmOrSkb ||
    (isApprovedMember && (isWargaKita || isPkbmOrSkb ? isAdminOrPengurus : isKader || isAdminOrPengurus))
  );

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* Back Button */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/komunitas/${id}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-primary" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
        <PrintButton variant="outline" size="sm" />
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-secondary/15 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200 border border-secondary/30">
              DATA ATS (ANAK TIDAK SEKOLAH)
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {komunitas.nama}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Data Anak Tidak Sekolah (ATS) {isPkbmOrSkb ? "- Seluruh Kota Tegal" : ""}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            {isPkbmOrSkb
              ? `Pemantauan data seluruh Anak Tidak Sekolah se-Kota Tegal tanpa sekat wilayah untuk diintervensi oleh ${komunitas.nama} agar kembali bersekolah.`
              : `Pendataan, verifikasi alasan tidak sekolah, dan perencanaan intervensi kembali bersekolah di ${komunitas.nama}.`}
          </p>
        </div>
      </div>

      {/* Interactive Client View */}
      <DataAtsClientView
        komunitas={komunitas}
        initialAts={atsList}
        canValidate={hasRootAccess || (isPkbmOrSkb && (canManage || isAdminOrPengurus)) ? true : canValidate}
        canManage={hasRootAccess || (isPkbmOrSkb && (canManage || isAdminOrPengurus)) ? true : canManage}
        canAccessDaftarNama={canAccessDaftarNama}
        currentUserId={currentUserId}
        isSuperAdmin={hasRootAccess}
      />
    </div>
  );
}
