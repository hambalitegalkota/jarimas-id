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
import { getDataAnakByKomunitas } from "@/app/actions/data-anak";
import { getDataAtsByKomunitas } from "@/app/actions/data-ats";
import { getKabarFeed } from "@/app/actions/kabar";
import { toValidUUID } from "@/lib/utils";
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
    isSuperAdmin,
    isAdminPusat,
    isSuperOrAdminPusat,
  } = await getKomunitasDetail(id);

  if (!komunitas) {
    notFound();
  }

  const cleanNama = (komunitas.nama || "").toLowerCase().trim();
  const isSkb =
    komunitas.jenis_institusi === "SKB" ||
    cleanNama.includes("skb") ||
    cleanNama.includes("sanggar kegiatan belajar");
  const isStarOfTomorrow = cleanNama.includes("star of tomorrow");
  const isPkbmOrSkb =
    komunitas.jenis === "pkbm_skb" ||
    komunitas.jenis_institusi === "PKBM" ||
    komunitas.jenis_institusi === "SKB" ||
    cleanNama.includes("pkbm") ||
    isSkb;

  const isPurePaud = komunitas.jenis === "satuan_paud" && !isPkbmOrSkb;
  const canShowDataAnak = !isPkbmOrSkb || isSkb || isStarOfTomorrow;
  const canShowDataAts = !isPurePaud;

  // Ambil data anggota, data anak, data ATS, dan kabar secara paralel untuk render awal yang cepat dan akurat
  const [
    { data: anggotaList },
    dataAnakRes,
    dataAtsRes,
    { data: allKabar },
  ] = await Promise.all([
    getAnggotaKomunitas(id),
    canShowDataAnak ? getDataAnakByKomunitas(id) : Promise.resolve({ data: [] }),
    canShowDataAts ? getDataAtsByKomunitas(id) : Promise.resolve({ data: [] }),
    getKabarFeed({ filterVisibilitas: "semua", limit: 20 }),
  ]);

  const dataAnakList = dataAnakRes?.data || [];
  const dataAtsList = dataAtsRes?.data || [];
  const dbKomunitasId = toValidUUID(id);

  const kabarKomunitas = (allKabar || []).filter((k) => {
    // 1. Cocok langsung dengan ID komunitas
    if (k.komunitas_id === id || k.komunitas_id === dbKomunitasId) {
      return true;
    }
    // 2. Konten secara spesifik menyebutkan nama komunitas
    if (
      cleanNama.length > 3 &&
      k.konten &&
      k.konten.toLowerCase().includes(cleanNama)
    ) {
      return true;
    }
    return false;
  });

  return (
    <div className="flex flex-col flex-1 px-3 sm:px-5 md:px-6 py-3 sm:py-4 gap-3 sm:gap-3.5 max-w-4xl mx-auto w-full pb-20">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/komunitas"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-primary" />
          <span>Kembali ke Komunitas</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <KomunitasDetailClientView
        komunitas={komunitas}
        currentUserId={currentUserId}
        isAdminOrKader={isAdminOrKader}
        isSuperAdmin={isSuperAdmin}
        isAdminPusat={isAdminPusat}
        isSuperOrAdminPusat={isSuperOrAdminPusat}
        currentSubtab={currentSubtab}
        anggotaList={anggotaList}
        kabarKomunitas={kabarKomunitas}
        dataAnakList={dataAnakList || []}
        dataAtsList={dataAtsList || []}
      />
    </div>
  );
}
