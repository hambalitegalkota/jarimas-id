import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Phone,
  ShieldCheck,
  Building2,
  Sparkles,
  MessageSquare,
  Settings2,
  CheckCircle2,
  Clock,
  UserCheck,
  Share2,
} from "lucide-react";
import {
  getKomunitasDetail,
  getAnggotaKomunitas,
} from "@/app/actions/komunitas";
import { getKabarFeed } from "@/app/actions/kabar";
import { KabarCard } from "@/components/kabar/kabar-card";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { KomunitasDetailClientView } from "./detail-client-view";

interface KomunitasDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    subtab?: string;
  }>;
}

export default async function KomunitasDetailPage({
  params,
  searchParams,
}: KomunitasDetailPageProps) {
  const { id } = await params;
  const { subtab } = await searchParams;
  const currentSubtab = subtab || "kabar";

  const {
    data: komunitas,
    currentUserId,
    isAdminOrKader,
  } = await getKomunitasDetail(id);

  if (!komunitas) {
    notFound();
  }

  // Ambil daftar anggota
  const { data: anggotaList } = await getAnggotaKomunitas(id);

  // Ambil kabar feed untuk komunitas
  const { data: allKabar } = await getKabarFeed();
  const kabarKomunitas = allKabar.filter(
    (k) =>
      k.komunitas_id === id ||
      k.konten.toLowerCase().includes(komunitas.nama.toLowerCase()) ||
      k.visibilitas === "komunitas"
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-5 gap-5">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/komunitas"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-card border border-border px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs transition-all active:scale-95 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Komunitas</span>
        </Link>

        {isAdminOrKader && (
          <Link
            href={`/komunitas/${id}/anggota`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all active:scale-95 hover:brightness-105"
          >
            <Settings2 className="h-4 w-4" />
            <span>Kelola Anggota</span>
          </Link>
        )}
      </div>

      {/* Hero Header Card */}
      <KomunitasDetailClientView
        komunitas={komunitas}
        currentUserId={currentUserId}
        isAdminOrKader={isAdminOrKader}
        currentSubtab={currentSubtab}
        anggotaList={anggotaList}
        kabarKomunitas={kabarKomunitas}
      />
    </div>
  );
}
