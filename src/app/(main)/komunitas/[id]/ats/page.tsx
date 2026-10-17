import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAtsByKomunitas } from "@/app/actions/data-ats";
import { getRekapDataAtsAction } from "@/app/actions/rekap-data-ats";
import { checkUserRekapAdminAccess } from "@/app/actions/rekap-data-anak";
import { DataAtsClientView } from "@/components/data-ats/data-ats-client-view";
import { RekapDataAtsClientView } from "@/components/data-ats/rekap-data-ats-client-view";
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
  const isPkbmOrSkb =
    komunitas.jenis === "pkbm_skb" ||
    komunitas.jenis_institusi === "PKBM" ||
    komunitas.jenis_institusi === "SKB" ||
    cleanNama.includes("pkbm") ||
    isSkb;

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
      <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-4 sm:py-6 print:py-0 print:bg-white print:min-h-0">
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
    canEditDdtk,
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
    (isApprovedMember && (isWargaKita || isPkbmOrSkb ? isAdminOrPengurus : isKader || isAdminOrPengurus))
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 gap-6 max-w-4xl mx-auto w-full">
      {/* Back Button */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/komunitas/${id}`}
          className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-xl bg-white border-2 border-slate-200 px-4 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 text-blue-700" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b-2 border-slate-200 pb-5 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
              DATA ATS (ANAK TIDAK SEKOLAH)
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">
              {komunitas.nama}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Data Anak Tidak Sekolah (ATS)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Pendataan, verifikasi alasan tidak sekolah, dan perencanaan intervensi kembali bersekolah di {komunitas.nama}.
          </p>
        </div>
      </div>

      {/* Interactive Client View */}
      <DataAtsClientView
        komunitas={komunitas}
        initialAts={atsList}
        canValidate={hasRootAccess ? true : canValidate}
        canEditDdtk={hasRootAccess ? true : canEditDdtk}
        canManage={hasRootAccess ? true : canManage}
        canAccessDaftarNama={canAccessDaftarNama}
        currentUserId={currentUserId}
        isSuperAdmin={hasRootAccess}
      />
    </div>
  );
}
