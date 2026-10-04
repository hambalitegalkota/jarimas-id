import { Metadata } from "next";
import { getRekapDataAnakUsiaDiniAction } from "@/app/actions/rekap-data-anak";
import { RekapDataAnakClientView } from "@/components/data-anak/rekap-data-anak-client-view";

export const metadata: Metadata = {
  title: "Rekapitulasi Hasil Pendataan Anak Usia Dini (0–6 Tahun) | JARIMAS-ID",
  description:
    "Pantau data hasil pendataan anak usia dini berjenjang tingkat Kota Tegal, Kecamatan, dan Kelurahan mencakup sebaran satuan PAUD (TK, RA, KB, SPS, TPA, SKB, PKBM), kelompok usia, jenis kelamin, dan analisis partisipasi.",
};

export const dynamic = "force-dynamic";

export default async function DataAnakRekapPage() {
  const { data: rekapData } = await getRekapDataAnakUsiaDiniAction();

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-4 sm:py-6">
      <RekapDataAnakClientView initialData={rekapData} />
    </main>
  );
}
