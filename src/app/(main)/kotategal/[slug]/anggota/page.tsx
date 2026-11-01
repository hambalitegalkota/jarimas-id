import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getKomunitasDetail,
  getAnggotaKomunitas,
} from "@/app/actions/komunitas";
import { checkCanManageKomunitasAdminsAction } from "@/app/actions/admin";
import { KelolaAnggotaClientView } from "@/app/(main)/komunitas/[id]/anggota/kelola-anggota-client-view";
import { PrintButton } from "@/components/ui/print-button";

interface KotaTegalKelolaAnggotaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function KotaTegalKelolaAnggotaPage({
  params,
}: KotaTegalKelolaAnggotaPageProps) {
  const { slug } = await params;

  const [
    { data: komunitas, currentUserId, isAdminOrKader },
    canAssignAdmin,
  ] = await Promise.all([
    getKomunitasDetail(slug),
    checkCanManageKomunitasAdminsAction(slug),
  ]);

  if (!komunitas) {
    notFound();
  }

  if (!currentUserId) {
    redirect("/login");
  }

  const { data: allMembers = [] } = await getAnggotaKomunitas(komunitas.id);

  const roleLower = (komunitas.currentUserMembership?.peran || "").toLowerCase().trim();
  const isApproved = komunitas.currentUserMembership?.status === "approved";

  let hasManagePermission = false;
  if (isAdminOrKader) {
    if (komunitas.jenis === "warga_kita") {
      hasManagePermission =
        isAdminOrKader ||
        (isApproved &&
          (roleLower.includes("pengurus") ||
            roleLower.includes("ketua") ||
            roleLower.includes("admin") ||
            roleLower.includes("pimpinan")));
    } else if (komunitas.jenis === "satuan_paud" || komunitas.jenis === "pkbm_skb") {
      hasManagePermission =
        isAdminOrKader ||
        (isApproved &&
          (roleLower.includes("kepala") ||
            roleLower.includes("pimpinan") ||
            roleLower.includes("pengelola") ||
            roleLower.includes("admin") ||
            roleLower.includes("operator")));
    } else if (komunitas.jenis === "posyandu") {
      hasManagePermission =
        isAdminOrKader ||
        (isApproved &&
          (roleLower.includes("ketua") ||
            roleLower.includes("admin") ||
            roleLower.includes("pengurus") ||
            roleLower.includes("kader")));
    } else {
      hasManagePermission = isAdminOrKader;
    }
  }

  if (!hasManagePermission) {
    redirect(`/kotategal/${slug}`);
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 gap-5 max-w-4xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/kotategal/${slug}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-primary" />
          <span>Kembali ke Detail Komunitas</span>
        </Link>
        <PrintButton variant="outline" size="sm" />
      </div>

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

      <KelolaAnggotaClientView
        komunitasId={komunitas.id}
        komunitasNama={komunitas.nama}
        komunitasJenis={komunitas.jenis}
        initialMembers={allMembers}
        canAssignAdmin={canAssignAdmin}
      />
    </div>
  );
}
