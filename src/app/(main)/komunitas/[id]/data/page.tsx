import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAnakByKomunitas } from "@/app/actions/data-anak";
import { getRekapDataAnakUsiaDiniAction, checkUserRekapAdminAccess } from "@/app/actions/rekap-data-anak";
import { DataAnakClientView } from "./data-anak-client-view";
import { RekapDataAnakClientView } from "@/components/data-anak/rekap-data-anak-client-view";
import { extractKomunitasMetadata, getKomunitasFeatureCards } from "@/lib/admin-helpers";

interface KomunitasDataAnakPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KomunitasDataAnakPage({
  params,
}: KomunitasDataAnakPageProps) {
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

  const { canShowDataAnak } = getKomunitasFeatureCards(komunitas);
  if (!canShowDataAnak) {
    redirect(`/komunitas/${id}`);
  }

  const meta = extractKomunitasMetadata(komunitas);
  const isWargaKita = komunitas.jenis === "warga_kita";
  const isRt = isWargaKita && meta.hasRt;
  const isRekapOnlyTier = isWargaKita && !meta.hasRt;

  // Untuk komunitas RW, Kelurahan, Kecamatan, dan Kota Tegal:
  // Data yang ditampilkan HANYA DATA REKAP SAJA disesuaikan levelnya.
  // Super Admin dan Admin Pusat memiliki akses penuh ke daftar nama & rincian di seluruh level.
  if (isRekapOnlyTier) {
    const [{ data: rekapData }, authAccess] = await Promise.all([
      getRekapDataAnakUsiaDiniAction(),
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
        <RekapDataAnakClientView
          initialData={rekapData}
          canAccessDaftarNamaAnak={canAccessNames}
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

  // Khusus Komunitas Tingkat RT, Satuan PAUD, dan Posyandu:
  const dataAnakResult = await getDataAnakByKomunitas(id, {
    preloadedKomunitas: komunitas,
  });

  const {
    data: childrenList,
    stats,
    canViewDetail,
    isAuthenticated,
    canValidate,
    canCreate,
    canEdit,
    canDelete,
    isReadOnly,
    userRole,
  } = dataAnakResult;

  const hasRootAccess = Boolean(isSuperOrAdminPusat || isSuperAdmin || isAdminPusat);

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/komunitas/${id}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-primary" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
              DATA ANAK USIA DINI
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase">{komunitas.nama}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Data Anak (0–6 Tahun)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
            Pemantauan dan verifikasi pendataan anak usia dini (0–6 tahun) di {komunitas.nama}.
          </p>
        </div>
      </div>

      {/* Interactive Client View */}
      <DataAnakClientView
        komunitas={komunitas}
        initialChildren={childrenList}
        stats={stats}
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
