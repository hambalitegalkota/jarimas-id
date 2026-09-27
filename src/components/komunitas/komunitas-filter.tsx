"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MapPin, Filter, RotateCcw } from "lucide-react";
import {
  DAFTAR_KECAMATAN_TEGAL,
  getKelurahanByKecamatan,
} from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface KomunitasFilterProps {
  currentKecamatan?: string;
  currentKelurahan?: string;
}

export function KomunitasFilter({
  currentKecamatan = "semua",
  currentKelurahan = "semua",
}: KomunitasFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const availableKelurahan =
    currentKecamatan && currentKecamatan !== "semua"
      ? getKelurahanByKecamatan(currentKecamatan)
      : [];

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (val === "semua") {
      params.delete("kecamatan");
      params.delete("kelurahan");
    } else {
      params.set("kecamatan", val);
      params.delete("kelurahan"); // Reset kelurahan when kecamatan changes
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleKelurahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (val === "semua") {
      params.delete("kelurahan");
    } else {
      params.set("kelurahan", val);
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("kecamatan");
    params.delete("kelurahan");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const hasFilter =
    (currentKecamatan && currentKecamatan !== "semua") ||
    (currentKelurahan && currentKelurahan !== "semua");

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Filter Wilayah Kota Tegal</span>
        </div>
        {hasFilter && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Dropdown Kecamatan */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Kecamatan
          </label>
          <div className="relative">
            <select
              value={currentKecamatan}
              onChange={handleKecamatanChange}
              disabled={isPending}
              className="w-full min-h-[44px] rounded-2xl border border-input bg-background px-3.5 pr-8 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="semua">Semua Kecamatan</option>
              {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                <option key={kec} value={kec}>
                  Kec. {kec}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Dropdown Kelurahan */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Kelurahan
          </label>
          <div className="relative">
            <select
              value={currentKelurahan}
              onChange={handleKelurahanChange}
              disabled={
                isPending ||
                !currentKecamatan ||
                currentKecamatan === "semua" ||
                availableKelurahan.length === 0
              }
              className={cn(
                "w-full min-h-[44px] rounded-2xl border border-input bg-background px-3.5 pr-8 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none",
                (!currentKecamatan || currentKecamatan === "semua") &&
                  "opacity-60 cursor-not-allowed"
              )}
            >
              <option value="semua">
                {currentKecamatan && currentKecamatan !== "semua"
                  ? "Semua Kelurahan"
                  : "Pilih Kecamatan Dahulu"}
              </option>
              {availableKelurahan.map((kel) => (
                <option key={kel} value={kel}>
                  Kel. {kel}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
