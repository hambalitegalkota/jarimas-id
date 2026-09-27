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
    <div className="flex flex-col flex-1 px-4 py-5 gap-5">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/komunitas/${id}`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-card border border-border px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs transition-all active:scale-95 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
            <Baby className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              Data Anak (0–7 Tahun)
            </h1>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {komunitas.nama}
            </p>
          </div>
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
