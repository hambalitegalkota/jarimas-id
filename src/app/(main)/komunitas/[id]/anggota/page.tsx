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
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/komunitas/${id}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-zinc-900 border border-border px-3 text-xs font-mono text-foreground transition-all hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>KEMBALI KE DETAIL KOMUNITAS</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="cyber-badge">MANAJEMEN ANGGOTA</span>
            <span className="text-xs font-mono text-muted-foreground uppercase">{komunitas.nama}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Kelola Anggota Komunitas
          </h1>
          <p className="text-xs text-muted-foreground">
            Verifikasi permohonan peran dan pantau status keanggotaan aktif.
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
