import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Baby,
} from "lucide-react";
import { getKomunitasDetail } from "@/app/actions/komunitas";
import { getDataAnakByKomunitas } from "@/app/actions/data-anak";
import { DataAnakClientView } from "./data-anak-client-view";

interface KomunitasDataAnakPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KomunitasDataAnakPage({
  params,
}: KomunitasDataAnakPageProps) {
  const { id } = await params;

  const { data: komunitas } = await getKomunitasDetail(id);

  if (!komunitas) {
    notFound();
  }

  const { data: childrenList, canValidate, canEditDdks } =
    await getDataAnakByKomunitas(id);

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

      {/* Header Info - Coursera Mobile */}
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
            Pemantauan tumbuh kembang DDTK dan validasi data posyandu / PAUD.
          </p>
        </div>
      </div>

      {/* Interactive Client View */}
      <DataAnakClientView
        komunitas={komunitas}
        initialChildren={childrenList}
        canValidate={canValidate}
        canEditDdks={canEditDdks}
      />
    </div>
  );
}
