"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WargaTierItem {
  label: "RT" | "RW" | "Kelurahan" | "Kecamatan";
  wilayah: string;
  komunitasId?: string;
  peran?: string;
  status?: "approved" | "pending" | "rejected" | string;
  jumlahAnggota?: number;
}

export interface UnifiedWargaCardProps {
  title: string;
  lokasi: string;
  highestRole: string;
  highestStatus: "approved" | "pending" | "rejected" | string;
  primaryKomunitasId?: string;
  tiers: WargaTierItem[];
  className?: string;
}

export function UnifiedWargaCard({
  title,
  lokasi,
  highestRole,
  highestStatus,
  primaryKomunitasId,
  tiers,
  className,
}: UnifiedWargaCardProps) {
  // Default selected tier: RT jika ada, jika tidak yang pertama tersedia dengan komunitasId
  const initialTier =
    tiers.find((t) => t.komunitasId && t.label === "RT") ||
    tiers.find((t) => t.komunitasId) ||
    tiers[0];

  const [selectedLabel, setSelectedLabel] = useState<string>(
    initialTier?.label || "RT"
  );

  const selectedTier =
    tiers.find((t) => t.label === selectedLabel) || initialTier;
  const targetKomunitasId = selectedTier?.komunitasId || primaryKomunitasId;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs transition-all hover:border-blue-500/40",
        className
      )}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-sky-400 font-mono">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                {title}
              </h3>
              <span className="cyber-badge font-mono text-[9px] py-0 px-1.5">
                DOMISILI WARGA
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-sky-500" />
                {lokasi}
              </span>
            </div>
          </div>
        </div>

        {/* Highest Role Badge */}
        <div className="shrink-0">
          {highestStatus === "approved" ? (
            <span className="cyber-badge font-mono text-[11px] py-0.5">
              <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-sky-400" />
              <span>{highestRole.toUpperCase()}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-400">
              <Clock className="h-3 w-3" />
              <span>MENUNGGU</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Kotak Pilihan Jenjang Wilayah Interaktif */}
      <div className="space-y-2 pt-1 border-t border-border/70">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span className="font-semibold uppercase text-foreground">
            Pilih Tingkatan Komunitas Wilayah:
          </span>
          <span className="text-[10px] text-blue-600 dark:text-sky-400 font-medium">
            (Klik kotak untuk memilih)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tiers.map((tier) => {
            const isSelected = tier.label === selectedLabel;
            const hasKomunitas = Boolean(tier.komunitasId) || (Boolean(tier.wilayah) && tier.wilayah !== "-");
            const isApproved = tier.status === "approved";
            const isPending = tier.status === "pending";

            return (
              <button
                key={tier.label}
                type="button"
                onClick={() => {
                  if (hasKomunitas) {
                    setSelectedLabel(tier.label);
                  }
                }}
                disabled={!hasKomunitas}
                className={cn(
                  "relative flex flex-col justify-between rounded-md border p-2.5 text-left transition-all cursor-pointer select-none outline-none",
                  isSelected
                    ? "border-blue-600 dark:border-sky-400 bg-blue-50/70 dark:bg-sky-950/40 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-border/80 bg-muted/20 hover:border-blue-400/50 hover:bg-muted/40",
                  !hasKomunitas && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Header Label & Status Indicator */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold uppercase tracking-wider",
                      isSelected
                        ? "text-blue-700 dark:text-sky-300 font-extrabold"
                        : "text-muted-foreground"
                    )}
                  >
                    {tier.label}
                  </span>

                  {hasKomunitas ? (
                    <div className="flex items-center gap-1">
                      {isApproved && (
                        <span
                          className="h-2 w-2 rounded-full bg-blue-500 dark:bg-sky-400"
                          title="Status: Aktif"
                        />
                      )}
                      {isPending && (
                        <span
                          className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"
                          title="Status: Menunggu"
                        />
                      )}
                      {isSelected && (
                        <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-sky-400 ml-0.5" />
                      )}
                    </div>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>

                {/* Nama Wilayah */}
                <div className="mt-1.5">
                  <p
                    className={cn(
                      "text-xs truncate leading-tight",
                      isSelected
                        ? "font-bold text-blue-950 dark:text-sky-100"
                        : "font-semibold text-foreground"
                    )}
                  >
                    {tier.wilayah}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                    {hasKomunitas
                      ? tier.peran || "Penduduk"
                      : "Tidak Terdaftar"}
                  </p>
                </div>

                {/* Selected Indicator Pill */}
                {isSelected && (
                  <span className="mt-1.5 inline-flex items-center text-[9px] font-mono font-semibold text-blue-600 dark:text-sky-400">
                    ● Terpilih
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button: Dynamic Destination based on Selected Tier */}
      <div className="pt-2 border-t border-border">
        {targetKomunitasId ? (
          <Link
            href={`/komunitas/${targetKomunitasId}`}
            className="group flex h-9.5 w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 text-xs font-mono font-semibold text-background transition-all hover:bg-foreground/90 shadow-xs"
            title={`Buka Komunitas ${selectedTier?.label} (${selectedTier?.wilayah})`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>
              Lihat Komunitas {selectedTier?.label} ({selectedTier?.wilayah})
            </span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="flex h-9.5 w-full items-center justify-center rounded-md bg-muted text-xs font-mono text-muted-foreground">
            Pilih salah satu tingkatan di atas
          </div>
        )}
      </div>
    </div>
  );
}
