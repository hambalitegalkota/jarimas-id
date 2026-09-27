import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, UserCheck } from "lucide-react";
import {
  getKomunitasDetail,
  getAnggotaKomunitas,
} from "@/app/actions/komunitas";
import { KelolaAnggotaClientView } from "./kelola-anggota-client-view";

interface KelolaAnggotaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KelolaAnggotaPage({
  params,
}: KelolaAnggotaPageProps) {
  const { id } = await params;

  const {
    data: komunitas,
    currentUserId,
    isAdminOrKader,
  } = await getKomunitasDetail(id);

  if (!komunitas) {
    notFound();
  }

  if (!currentUserId) {
    redirect("/login");
  }

  if (!isAdminOrKader) {
    redirect(`/komunitas/${id}`);
  }

  const { data: allMembers } = await getAnggotaKomunitas(id);

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
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">
            Kelola Anggota Komunitas
          </h1>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {komunitas.nama}
          </p>
        </div>
      </div>

      {/* Interactive Member Management View */}
      <KelolaAnggotaClientView
        komunitasId={id}
        initialMembers={allMembers}
      />
    </div>
  );
}
