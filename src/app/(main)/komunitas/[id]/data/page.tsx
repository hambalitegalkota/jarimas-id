import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Baby,
  ShieldCheck,
  Clock,
  Plus,
  Users,
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
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-6">
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
      <div className="flex items-start justify-between gap-3 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="cyber-badge">DATA ANAK &amp; DDTK</span>
            <span className="text-xs font-mono text-muted-foreground uppercase">{komunitas.nama}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Data Anak (0–7 Tahun)
          </h1>
          <p className="text-xs text-muted-foreground">
            Pemantauan tumbuh kembang DDTK, validasi lintas komunitas PAUD &amp; Posyandu.
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
