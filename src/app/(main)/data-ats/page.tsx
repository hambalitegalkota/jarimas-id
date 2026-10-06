import { Metadata } from "next";
import { getRekapDataAtsAction } from "@/app/actions/rekap-data-ats";
import { checkUserRekapAdminAccess } from "@/app/actions/rekap-data-anak";
import { RekapDataAtsClientView } from "@/components/data-ats/rekap-data-ats-client-view";

export const metadata: Metadata = {
  title: "Hasil Pendataan Anak Tidak Sekolah (ATS) | JARIMAS-ID",
  description:
    "Pantau data hasil pendataan anak tidak sekolah (ATS) berjenjang tingkat Kota Tegal, Kecamatan, dan Kelurahan mencakup kategori putus sekolah, lulus tidak melanjutkan, belum pernah sekolah, kesiapan sekolah kembali, serta rekomendasi jalur intervensi PKBM dan SKB.",
};

export const dynamic = "force-dynamic";

export default async function DataAtsRekapPage() {
  const [{ data: rekapData }, authAccess] = await Promise.all([
    getRekapDataAtsAction(),
    checkUserRekapAdminAccess(),
  ]);

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-4 sm:py-6">
      <RekapDataAtsClientView
        initialData={rekapData}
        canAccessDaftarNamaAts={authAccess.canAccess}
        userPeran={authAccess.userPeran}
      />
    </main>
  );
}
