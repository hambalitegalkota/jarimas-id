import Link from "next/link";
import { notFound } from "next/navigation";
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

  const { data: atsList, canValidate, canEditDdtk } =
    await getDataAtsByKomunitas(id);

  return (
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/komunitas/${id}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-amber-500/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-amber-500" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="cyber-badge bg-amber-500/10 text-amber-500 border-amber-500/30">
              DATA ATS (ANAK TIDAK SEKOLAH)
            </span>
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {komunitas.nama}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Data Anak Tidak Sekolah (ATS)
          </h1>
          <p className="text-xs text-muted-foreground">
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
      />
    </div>
  );
}
