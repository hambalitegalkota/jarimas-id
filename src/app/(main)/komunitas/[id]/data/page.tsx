import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAnakByKomunitas } from "@/app/actions/data-anak";
import { getRekapDataAnakUsiaDiniAction, checkUserRekapAdminAccess } from "@/app/actions/rekap-data-anak";
import { DataAnakClientView } from "./data-anak-client-view";
import { RekapDataAnakClientView } from "@/components/data-anak/rekap-data-anak-client-view";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";

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
      <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-4 sm:py-6">
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
  const dataAnakResult = await getDataAnakByKomunitas(id);

  const {
    data: childrenList,
    stats,
    canViewDetail,
    isAuthenticated,
    canValidate,
    canEditDdks,
    canCreate,
    canEdit,
    canDelete,
    isReadOnly,
    userRole,
  } = dataAnakResult;

  const hasRootAccess = Boolean(isSuperOrAdminPusat || isSuperAdmin || isAdminPusat);

  return (
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 gap-6 max-w-4xl mx-auto w-full">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/komunitas/${id}`}
          className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-xl bg-white border-2 border-slate-200 px-4 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 text-blue-700" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b-2 border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              DATA ANAK &amp; DDTK
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">{komunitas.nama}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Data Anak (0–6 Tahun)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Pemantauan data anak usia dini, verifikasi data, dan catatan DDTK tumbuh kembang di {komunitas.nama}.
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
        canEditDdks={hasRootAccess ? true : canEditDdks}
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
