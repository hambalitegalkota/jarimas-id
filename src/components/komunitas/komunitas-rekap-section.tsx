"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Users,
  GraduationCap,
  MapPin,
  ChevronDown,
  ChevronUp,
  BarChart3,
  CheckCircle2,
  Building2,
} from "lucide-react";
import type { JenisKomunitas } from "@/types/database";
import { getKomunitasRekapData } from "@/lib/constants/tegal-data";

interface KomunitasRekapSectionProps {
  currentTab: JenisKomunitas;
  currentKecamatan?: string;
  currentKelurahan?: string;
}

export function KomunitasRekapSection({
  currentTab,
  currentKecamatan = "semua",
  currentKelurahan = "semua",
}: KomunitasRekapSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const rekap = getKomunitasRekapData(currentTab);

  // Tema warna dinamis sesuai tab aktif
  const theme = {
    posyandu: {
      border: "border-emerald-200 dark:border-emerald-800/80",
      bgGradient:
        "bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20",
      accentText: "text-emerald-700 dark:text-emerald-400",
      icon: HeartPulse,
      badgeTotal: "bg-emerald-600 text-white",
      badgeKec:
        "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
      chipActive: "bg-emerald-600 text-white font-black shadow-xs",
      chipHover:
        "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-slate-700 dark:text-slate-300",
      countBadge:
        "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200",
    },
    warga_kita: {
      border: "border-blue-200 dark:border-blue-800/80",
      bgGradient:
        "bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20",
      accentText: "text-blue-700 dark:text-blue-400",
      icon: Users,
      badgeTotal: "bg-blue-600 text-white",
      badgeKec:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
      chipActive: "bg-blue-600 text-white font-black shadow-xs",
      chipHover:
        "hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-slate-700 dark:text-slate-300",
      countBadge:
        "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200",
    },
    satuan_paud: {
      border: "border-indigo-200 dark:border-indigo-800/80",
      bgGradient:
        "bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20",
      accentText: "text-indigo-700 dark:text-indigo-400",
      icon: GraduationCap,
      badgeTotal: "bg-indigo-600 text-white",
      badgeKec:
        "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300",
      chipActive: "bg-indigo-600 text-white font-black shadow-xs",
      chipHover:
        "hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 text-slate-700 dark:text-slate-300",
      countBadge:
        "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200",
    },
  }[currentTab];

  const IconComponent = theme.icon;

  // Helper membuat link filter wilayah
  const makeFilterUrl = (kecamatan?: string, kelurahan?: string) => {
    const params = new URLSearchParams();
    params.set("tab", currentTab);
    if (kecamatan && kecamatan !== "semua") {
      params.set("kecamatan", kecamatan);
    }
    if (kelurahan && kelurahan !== "semua") {
      params.set("kelurahan", kelurahan);
    }
    return `/komunitas?${params.toString()}`;
  };

  return (
    <section
      className={`rounded-2xl border-2 ${theme.border} ${theme.bgGradient} p-4 sm:p-5 shadow-xs transition-all`}
    >
      {/* Header Bar Rekap */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
            <IconComponent className={`h-5 w-5 ${theme.accentText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Rekap Jumlah {rekap.labelSingkat}
              </h2>
              <span
                className={`text-[11px] font-black px-2 py-0.5 rounded-full ${theme.badgeTotal}`}
              >
                {rekap.totalSemua} {rekap.satuanLabel}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tersebar di {rekap.totalKecamatan} Kecamatan &amp; {rekap.totalKelurahan} Kelurahan se-Kota Tegal
            </p>
          </div>
        </div>

        {/* Action Button: Toggle Collapsible */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer active:scale-98"
        >
          <span>{isOpen ? "Sembunyikan Rincian" : "Lihat Rincian Per Kelurahan"}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Konten Rekap per Kecamatan & Kelurahan */}
      {isOpen && (
        <div className="mt-4 space-y-3 pt-1">
          {/* Grid 4 Kecamatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {rekap.kecamatanList.map((kec) => {
              const isKecSelected =
                currentKecamatan.toLowerCase() === kec.kecamatan.toLowerCase();

              return (
                <div
                  key={kec.kecamatan}
                  className={`rounded-xl border-2 transition-all p-3 flex flex-col justify-between ${
                    isKecSelected
                      ? "border-emerald-500 dark:border-emerald-500 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Kecamatan Title & Total Count */}
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2 mb-2.5">
                      <Link
                        href={makeFilterUrl(kec.kecamatan)}
                        className="group inline-flex items-center gap-1.5 hover:underline"
                        title={`Filter hanya Kecamatan ${kec.kecamatan}`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Kec. {kec.kecamatan}
                        </span>
                      </Link>
                      <Link
                        href={makeFilterUrl(kec.kecamatan)}
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full border transition-all ${theme.badgeKec} hover:scale-105`}
                        title={`Total di ${kec.kecamatan}`}
                      >
                        {kec.totalCount}
                      </Link>
                    </div>

                    {/* Rincian Kelurahan */}
                    <div className="flex flex-wrap gap-1.5">
                      {kec.kelurahanList.map((kel) => {
                        const isKelSelected =
                          isKecSelected &&
                          currentKelurahan.toLowerCase() ===
                            kel.kelurahan.toLowerCase();

                        return (
                          <Link
                            key={kel.kelurahan}
                            href={makeFilterUrl(kec.kecamatan, kel.kelurahan)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              isKelSelected
                                ? theme.chipActive
                                : `bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 ${theme.chipHover}`
                            }`}
                            title={`Filter: Kelurahan ${kel.kelurahan} (${kel.count} ${rekap.satuanLabel})`}
                          >
                            <span>{kel.kelurahan}</span>
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                                isKelSelected
                                  ? "bg-white/20 text-white"
                                  : theme.countBadge
                              }`}
                            >
                              {kel.count}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Reset for this Kecamatan */}
                  {isKecSelected && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Aktif difilter
                      </span>
                      <Link
                        href={makeFilterUrl()}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 underline font-semibold"
                      >
                        Reset
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Banner status filter jika sedang aktif memilih kelurahan/kecamatan */}
          {(currentKecamatan !== "semua" || currentKelurahan !== "semua") && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <BarChart3 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>
                  Filter Aktif:{" "}
                  <strong>
                    {currentKecamatan !== "semua"
                      ? `Kec. ${currentKecamatan}`
                      : "Semua Kecamatan"}
                  </strong>
                  {currentKelurahan !== "semua" && (
                    <>
                      {" "}
                      &bull; Kelurahan <strong>{currentKelurahan}</strong>
                    </>
                  )}
                </span>
              </div>
              <Link
                href={makeFilterUrl()}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Tampilkan Semua Komunitas Kota Tegal &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
