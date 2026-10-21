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
  // Default selected tier: RT jika ada, jika tidak yang pertama tersedia dengan wilayah terdaftar
  const initialTier =
    tiers.find((t) => t.komunitasId && t.label === "RT" && t.wilayah !== "-") ||
    tiers.find((t) => t.komunitasId && t.wilayah !== "-") ||
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
        "flex flex-col justify-between rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm transition-all hover:border-primary/40",
        className
      )}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary font-bold shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                {title}
              </h3>
              <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                DOMISILI WARGA
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {lokasi}
              </span>
            </div>
          </div>
        </div>

        {/* Highest Role Badge */}
        <div className="shrink-0">
          {highestStatus === "approved" ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>{highestRole.toUpperCase()}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-bold text-amber-950 dark:text-amber-200 border border-secondary/30">
              <Clock className="h-3.5 w-3.5 text-secondary" />
              <span>MENUNGGU</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Kotak Pilihan Jenjang Wilayah Interaktif (Mobile Large Touch Cards) */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span className="uppercase tracking-wider text-foreground">
            Pilih Tingkatan Komunitas Wilayah:
          </span>
          <span className="text-primary font-semibold">
            (Klik untuk memilih)
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
                  "relative flex flex-col justify-between rounded-lg border p-2.5 sm:p-3 text-left transition-all cursor-pointer select-none outline-none min-h-[68px]",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/40",
                  !hasKomunitas && "opacity-40 cursor-not-allowed bg-muted/40 border-border"
                )}
              >
                {/* Header Label & Status Indicator */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isSelected
                        ? "text-primary font-black"
                        : "text-muted-foreground"
                    )}
                  >
                    {tier.label}
                  </span>

                  {hasKomunitas ? (
                    <div className="flex items-center gap-1">
                      {isApproved && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary"
                          title="Status: Aktif"
                        />
                      )}
                      {isPending && (
                        <span
                          className="h-2 w-2 rounded-full bg-secondary animate-pulse"
                          title="Status: Menunggu"
                        />
                      )}
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-0.5" />
                      )}
                    </div>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  )}
                </div>

                {/* Nama Wilayah */}
                <div className="mt-1">
                  <p
                    className={cn(
                      "text-sm truncate leading-tight",
                      isSelected
                        ? "font-bold text-foreground"
                        : "font-semibold text-foreground/80"
                    )}
                  >
                    {tier.wilayah}
                  </p>
                  <p className="text-2xs text-muted-foreground truncate mt-0.5">
                    {hasKomunitas
                      ? tier.peran || "Penduduk"
                      : "Tidak Terdaftar"}
                  </p>
                </div>
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
            className="group flex min-h-[44px] h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 text-sm font-bold text-primary-foreground transition-all shadow-xs active:scale-98"
            title={`Buka Komunitas ${selectedTier?.label} (${selectedTier?.wilayah})`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>
              Lihat Komunitas {selectedTier?.label} ({selectedTier?.wilayah})
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="flex min-h-[44px] h-11 w-full items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground border border-border">
            Pilih salah satu tingkatan di atas
          </div>
        )}
      </div>
    </div>
  );
}
