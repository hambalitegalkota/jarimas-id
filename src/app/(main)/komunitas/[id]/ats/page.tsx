import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAtsByKomunitas } from "@/app/actions/data-ats";
import { getRekapDataAtsAction } from "@/app/actions/rekap-data-ats";
import { DataAtsClientView } from "@/components/data-ats/data-ats-client-view";
import { RekapDataAtsClientView } from "@/components/data-ats/rekap-data-ats-client-view";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
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

  const { data: komunitas } = await getKomunitasDetail(id);

  if (!komunitas) {
    notFound();
  }

  if (komunitas.jenis === "satuan_paud") {
    redirect(`/komunitas/${id}`);
  }

  const meta = extractKomunitasMetadata(komunitas);
  const isWargaKita = komunitas.jenis === "warga_kita";
  const isRt = isWargaKita && meta.hasRt;
  const isRekapOnlyTier = isWargaKita && !meta.hasRt;

  // Untuk komunitas RW, Kelurahan, Kecamatan, dan Kota Tegal:
  // Data yang ditampilkan HANYA DATA REKAP SAJA (seperti pada halaman Hasil Pendataan Anak Tidak Sekolah (ATS)) disesuaikan levelnya.
  // Data lengkap rincian identitas anak hanya dapat diakses di level RT oleh Admin Komunitas Warga Kita.
  if (isRekapOnlyTier) {
    const { data: rekapData } = await getRekapDataAtsAction();

    let initialTingkat: "kota" | "kecamatan" | "kelurahan" = "kota";
    if (meta.hasRw || meta.hasKel) {
      initialTingkat = "kelurahan";
    } else if (meta.rawKec && meta.rawKec !== "Kota Tegal") {
      initialTingkat = "kecamatan";
    }

    return (
      <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-4 sm:py-6">
        <RekapDataAtsClientView
          initialData={rekapData}
          canAccessDaftarNamaAts={false}
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

  // Khusus Komunitas Tingkat RT dan Posyandu:
  const dataAtsResult = await getDataAtsByKomunitas(id);

  const {
    data: atsList,
    canValidate,
    canEditDdtk,
    canManage,
    canAccessDaftarNama: serverCanAccess,
    currentUserId,
    isSuperAdmin,
  } = dataAtsResult;

  // Otorisasi Akses Daftar Rincian Lengkap:
  // Hanya Admin di Komunitas Warga Kita (level RT) dan Posyandu (Admin / Kader) yang berhak melihat rincian nama lengkap
  const membership = komunitas?.currentUserMembership;
  const isApprovedMember = membership?.status === "approved";
  const memberRoleLower = (membership?.peran || "").toLowerCase();
  const isAdminOrPengurus =
    isRoleAdmin(memberRoleLower) ||
    memberRoleLower.includes("admin") ||
    memberRoleLower.includes("pengurus") ||
    memberRoleLower.includes("ketua");
  const isKader = memberRoleLower.includes("kader") || memberRoleLower.includes("medis");

  const canAccessDaftarNama = Boolean(
    isSuperAdmin ||
    serverCanAccess ||
    canManage ||
    (isApprovedMember && (isRt ? isAdminOrPengurus : isKader || isAdminOrPengurus))
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
        canValidate={canValidate}
        canEditDdtk={canEditDdtk}
        canManage={canManage}
        canAccessDaftarNama={canAccessDaftarNama}
        currentUserId={currentUserId}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
