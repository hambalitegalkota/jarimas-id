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
        "flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs transition-all hover:border-slate-300",
        className
      )}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {title}
              </h3>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                DOMISILI WARGA
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
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
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border-2 border-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{highestRole.toUpperCase()}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border-2 border-amber-300">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>MENUNGGU</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Kotak Pilihan Jenjang Wilayah Interaktif (Mobile Large Touch Cards) */}
      <div className="space-y-2.5 pt-2 border-t-2 border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span className="uppercase tracking-wider text-slate-900">
            Pilih Tingkatan Komunitas Wilayah:
          </span>
          <span className="text-blue-700 font-semibold">
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
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  !hasKomunitas && "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200"
                )}
              >
                {/* Header Label & Status Indicator */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isSelected
                        ? "text-blue-900 font-black"
                        : "text-slate-500"
                    )}
                  >
                    {tier.label}
                  </span>

                  {hasKomunitas ? (
                    <div className="flex items-center gap-1">
                      {isApproved && (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-blue-600"
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
                        <CheckCircle2 className="h-4 w-4 text-blue-700 ml-0.5" />
                      )}
                    </div>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                </div>

                {/* Nama Wilayah */}
                <div className="mt-1">
                  <p
                    className={cn(
                      "text-sm truncate leading-tight",
                      isSelected
                        ? "font-bold text-blue-950"
                        : "font-semibold text-slate-900"
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
      <div className="pt-2 border-t-2 border-slate-100">
        {targetKomunitasId ? (
          <Link
            href={`/komunitas/${targetKomunitasId}`}
            className="group flex min-h-[48px] h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-4 text-base font-bold text-white transition-all shadow-sm active:scale-98"
            title={`Buka Komunitas ${selectedTier?.label} (${selectedTier?.wilayah})`}
          >
            <Users className="h-5 w-5" />
            <span>
              Lihat Komunitas {selectedTier?.label} ({selectedTier?.wilayah})
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="flex min-h-[48px] h-12 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500 border border-slate-200">
            Pilih salah satu tingkatan di atas
          </div>
        )}
      </div>
    </div>
  );
}
