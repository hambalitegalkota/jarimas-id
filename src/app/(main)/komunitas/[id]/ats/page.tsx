import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAtsByKomunitas } from "@/app/actions/data-ats";
import { DataAtsClientView } from "@/components/data-ats/data-ats-client-view";

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

  const {
    data: atsList,
    canValidate,
    canEditDdtk,
    canManage,
    currentUserId,
    isSuperAdmin,
  } = await getDataAtsByKomunitas(id);

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

      {/* Header Info - Coursera Mobile */}
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
            Pendataan, verifikasi alasan tidak sekolah, dan perencanaan intervensi kembali bersekolah di Kota Tegal.
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
        currentUserId={currentUserId}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
