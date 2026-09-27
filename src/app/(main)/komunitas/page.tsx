import { Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Sparkles,
  Search,
} from "lucide-react";
import { getKomunitasList } from "@/app/actions/komunitas";
import { KomunitasFilter } from "@/components/komunitas/komunitas-filter";
import { KomunitasCard } from "@/components/komunitas/komunitas-card";
import type { JenisKomunitas } from "@/types/database";

interface KomunitasPageProps {
  searchParams: Promise<{
    tab?: string;
    kecamatan?: string;
    kelurahan?: string;
    rw?: string;
  }>;
}

export default async function KomunitasPage({
  searchParams,
}: KomunitasPageProps) {
  const resolvedParams = await searchParams;
  const currentTab = (resolvedParams.tab as JenisKomunitas) || "warga_kita";
  const currentKecamatan = resolvedParams.kecamatan || "semua";
  const currentKelurahan = resolvedParams.kelurahan || "semua";
  const currentRw = resolvedParams.rw || "semua";

  const { data: listKomunitas, currentUserId } = await getKomunitasList({
    jenis: currentTab,
    kecamatan: currentKecamatan,
    kelurahan: currentKelurahan,
    rw: currentRw,
  });

  const querySuffix = `${
    currentKecamatan !== "semua" ? `&kecamatan=${currentKecamatan}` : ""
  }${currentKelurahan !== "semua" ? `&kelurahan=${currentKelurahan}` : ""}${
    currentRw !== "semua" ? `&rw=${currentRw}` : ""
  }`;

  return (
    <div className="flex flex-col flex-1 px-4 py-5 gap-5">
      {/* Header Banner */}
      <header className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Eksplorasi Komunitas
        </h1>
        <p className="text-xs text-muted-foreground">
          Temukan &amp; bergabunglah dengan Posyandu, PAUD, dan RT/RW di Kota Tegal
        </p>
      </header>

      {/* 3 Tab Kategori Utama (Warga Kita, Posyandu, Satuan PAUD) */}
      <div className="flex rounded-2xl bg-muted/70 p-1 border border-border/80">
        <Link
          href={`/komunitas?tab=warga_kita${querySuffix}`}
          className={`flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
            currentTab === "warga_kita"
              ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Warga Kita</span>
        </Link>

        <Link
          href={`/komunitas?tab=posyandu${querySuffix}`}
          className={`flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
            currentTab === "posyandu"
              ? "bg-card text-accent shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Posyandu</span>
        </Link>

        <Link
          href={`/komunitas?tab=satuan_paud${querySuffix}`}
          className={`flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
            currentTab === "satuan_paud"
              ? "bg-card text-amber-600 shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4 text-amber-600" />
          <span>Satuan PAUD</span>
        </Link>
      </div>

      {/* Filter Dropdown Wilayah */}
      <Suspense fallback={<div className="h-28 animate-pulse rounded-3xl bg-muted" />}>
        <KomunitasFilter
          currentKecamatan={currentKecamatan}
          currentKelurahan={currentKelurahan}
          currentRw={currentRw}
        />
      </Suspense>

      {/* List Komunitas Stream */}
      <main className="space-y-4 pb-12">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Daftar Lembaga &amp; Komunitas
          </span>
          <span className="text-xs text-muted-foreground">
            {listKomunitas.length} Ditemukan
          </span>
        </div>

        {listKomunitas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Tidak Ada Komunitas yang Cocok
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Coba ubah filter kecamatan atau kelurahan untuk melihat komunitas lainnya di Kota Tegal.
              </p>
            </div>
          </div>
        ) : (
          listKomunitas.map((kom) => (
            <KomunitasCard
              key={kom.id}
              komunitas={kom}
              currentUserId={currentUserId}
            />
          ))
        )}
      </main>
    </div>
  );
}
