"use client";

import { MapPin, Users, CheckCircle2, CircleDashed, Building2, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KecamatanCommunityStat } from "@/app/actions/komunitas-kecamatan-stats";

interface KecamatanStatsCardsProps {
  currentTab: string;
  currentKecamatan: string;
  stats: KecamatanCommunityStat[];
  onSelectKecamatan: (kecamatan: string) => void;
}

export function KecamatanStatsCards({
  currentTab,
  currentKecamatan = "semua",
  stats = [],
  onSelectKecamatan,
}: KecamatanStatsCardsProps) {
  if (!stats || stats.length === 0) return null;

  const categorySubtitles: Record<string, string> = {
    warga_kita: "Sebaran Komunitas RT & Pengguna Se-Kota Tegal",
    posyandu: "Sebaran Posyandu 6 SPM & Kader Se-Kota Tegal",
    satuan_paud: "Sebaran Satuan PAUD & Guru Se-Kota Tegal",
    pkbm_skb: "Sebaran Lembaga PKBM & SKB Se-Kota Tegal",
  };

  const currentSubtitle = categorySubtitles[currentTab] || "Sebaran Komunitas Se-Kota Tegal";

  return (
    <section aria-label="Statistik Komunitas 4 Kecamatan" className="space-y-2.5">
      {/* Header Seksi Ringkasan Wilayah */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Ringkasan 4 Kecamatan
            </span>
            <span className="hidden sm:inline-block text-border">•</span>
            <span className="text-xs font-medium text-muted-foreground">
              {currentSubtitle}
            </span>
          </div>
        </div>

        {currentKecamatan !== "semua" && (
          <button
            type="button"
            onClick={() => onSelectKecamatan("semua")}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <span>Tampilkan Semua Kecamatan</span>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Grid 4 Kartu Kecamatan (2 kolom di mobile, 4 kolom di desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {stats.map((stat) => {
          const isSelected =
            currentKecamatan &&
            currentKecamatan.toLowerCase() === stat.kecamatan.toLowerCase();

          return (
            <div
              key={stat.kecamatan}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (isSelected) {
                  onSelectKecamatan("semua");
                } else {
                  onSelectKecamatan(stat.kecamatan);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (isSelected) {
                    onSelectKecamatan("semua");
                  } else {
                    onSelectKecamatan(stat.kecamatan);
                  }
                }
              }}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-3 sm:p-3.5 text-left transition-all cursor-pointer shadow-2xs select-none",
                isSelected
                  ? "border-primary bg-primary/8 dark:bg-primary/15 ring-2 ring-primary/40 shadow-sm"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              {/* Header Kartu: Nama Kecamatan & Persentase Terisi */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isSelected
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-bold tracking-tight truncate",
                      isSelected ? "text-primary font-extrabold" : "text-foreground"
                    )}
                  >
                    {stat.kecamatan}
                  </span>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md border shrink-0",
                    stat.persenTerisi > 0
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                  title={`${stat.totalTerisi} dari ${stat.totalMain} terisi (${stat.persenTerisi}%)`}
                >
                  {stat.persenTerisi}%
                </span>
              </div>

              {/* Angka Utama: Jumlah Total Komunitas RT / Posyandu / PAUD / Lembaga */}
              <div className="mt-2 mb-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {stat.totalMain.toLocaleString("id-ID")}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {stat.mainLabel}
                </span>
              </div>

              {/* Garis Pemisah Proporsional */}
              <div className="border-t border-border/70 my-2" />

              {/* 3 Sub-Metrik: Pengguna Bergabung, Terisi, Kosong */}
              <div className="grid grid-cols-3 gap-1 text-center divide-x divide-border/60">
                {/* 1. Pengguna Bergabung */}
                <div className="px-0.5">
                  <span className="text-xs sm:text-sm font-black font-mono text-primary block leading-tight">
                    {stat.penggunaBergabung.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground block truncate">
                    Pengguna
                  </span>
                </div>

                {/* 2. Komunitas Terisi */}
                <div className="px-0.5">
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 block leading-tight">
                    {stat.totalTerisi.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground block truncate">
                    Terisi
                  </span>
                </div>

                {/* 3. Komunitas Kosong */}
                <div className="px-0.5">
                  <span className="text-xs sm:text-sm font-black font-mono text-muted-foreground block leading-tight">
                    {stat.totalKosong.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground block truncate">
                    Kosong
                  </span>
                </div>
              </div>

              {/* Indikator Status Klik / Aktif */}
              <div className="mt-2 pt-1 border-t border-border/40 flex items-center justify-between text-[10px] font-bold">
                {isSelected ? (
                  <span className="text-primary flex items-center gap-1 font-bold">
                    <span>✓ Terfilter</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/75 group-hover:text-primary transition-colors flex items-center gap-0.5">
                    <span>Pilih wilayah</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                )}
                <span className="text-[9px] font-mono text-muted-foreground/60">
                  {stat.kecamatan.replace("Tegal ", "T.")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
