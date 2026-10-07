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
        "flex flex-col justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs transition-all hover:border-emerald-400 dark:hover:border-emerald-600",
        className
      )}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {title}
              </h3>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                DOMISILI WARGA
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slate-500" />
                {lokasi}
              </span>
            </div>
          </div>
        </div>

        {/* Highest Role Badge */}
        <div className="shrink-0">
          {highestStatus === "approved" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{highestRole.toUpperCase()}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border-2 border-amber-500">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>MENUNGGU</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Kotak Pilihan Jenjang Wilayah Interaktif (Mobile Large Touch Cards) */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <span className="uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Pilih Tingkatan Komunitas Wilayah:
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            (Klik untuk memilih)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  "relative flex flex-col justify-between rounded-xl border-2 p-3 text-left transition-all cursor-pointer select-none outline-none min-h-[72px]",
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40",
                  !hasKomunitas && "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                )}
              >
                {/* Header Label & Status Indicator */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isSelected
                        ? "text-emerald-900 dark:text-emerald-200 font-black"
                        : "text-slate-500"
                    )}
                  >
                    {tier.label}
                  </span>

                  {hasKomunitas ? (
                    <div className="flex items-center gap-1">
                      {isApproved && (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-emerald-600"
                          title="Status: Aktif"
                        />
                      )}
                      {isPending && (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"
                          title="Status: Menunggu"
                        />
                      )}
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                      )}
                    </div>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>

                {/* Nama Wilayah */}
                <div className="mt-1">
                  <p
                    className={cn(
                      "text-sm truncate leading-tight",
                      isSelected
                        ? "font-bold text-slate-900 dark:text-slate-100"
                        : "font-semibold text-slate-800 dark:text-slate-200"
                    )}
                  >
                    {tier.wilayah}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
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
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        {targetKomunitasId ? (
          <Link
            href={`/komunitas/${targetKomunitasId}`}
            className="group flex min-h-[48px] h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-base font-bold text-white transition-all shadow-sm active:scale-98"
            title={`Buka Komunitas ${selectedTier?.label} (${selectedTier?.wilayah})`}
          >
            <Users className="h-5 w-5" />
            <span>
              Lihat Komunitas {selectedTier?.label} ({selectedTier?.wilayah})
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="flex min-h-[48px] h-12 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-500 border border-slate-200 dark:border-slate-700">
            Pilih salah satu tingkatan di atas
          </div>
        )}
      </div>
    </div>
  );
}
