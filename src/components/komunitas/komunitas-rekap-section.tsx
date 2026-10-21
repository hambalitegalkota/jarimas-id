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
  School,
  BookOpen,
  Baby,
  HeartHandshake,
  Layers,
  X,
  ArrowRight,
  Filter,
} from "lucide-react";
import type { JenisKomunitas } from "@/types/database";
import {
  getKomunitasRekapData,
  getBentukPendidikanRekap,
  DAFTAR_BENTUK_PENDIDIKAN,
  type BentukPendidikanType,
} from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface KomunitasRekapSectionProps {
  currentTab: JenisKomunitas;
  currentKecamatan?: string;
  currentKelurahan?: string;
  currentBentuk?: string;
}

export function KomunitasRekapSection({
  currentTab,
  currentKecamatan = "semua",
  currentKelurahan = "semua",
  currentBentuk = "semua",
}: KomunitasRekapSectionProps) {
  const isPaud = currentTab === "satuan_paud";
  const isPkbm = currentTab === "pkbm_skb";
  const isWarga = currentTab === "warga_kita";

  const isFiltered =
    currentKecamatan !== "semua" ||
    currentKelurahan !== "semua" ||
    ((isPaud || isPkbm) && currentBentuk !== "semua");

  // Secara default collapsible terbuka
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const rekap = getKomunitasRekapData(currentTab, {
    bentuk: currentBentuk,
  });

  const bentukRekap = (isPaud || isPkbm)
    ? getBentukPendidikanRekap({
        kecamatan: currentKecamatan,
        kelurahan: currentKelurahan,
        tab: currentTab,
      })
    : null;

  // Tema warna dinamis sesuai tab aktif
  const themeMap: Record<string, any> = {
    posyandu: {
      border: "border-border",
      bgGradient: "bg-card",
      accentText: "text-primary",
      icon: HeartPulse,
      badgeTotal: "bg-primary text-primary-foreground",
      badgeKec:
        "bg-primary/10 border-primary/20 text-primary",
      chipActive: "bg-primary text-primary-foreground font-bold shadow-xs",
      chipHover:
        "hover:bg-primary/10 hover:border-primary/30 text-foreground",
      countBadge:
        "bg-primary/15 text-primary",
    },
    warga_kita: {
      border: "border-border",
      bgGradient: "bg-card",
      accentText: "text-sky-600 dark:text-sky-400",
      icon: Users,
      badgeTotal: "bg-sky-600 text-white",
      badgeKec:
        "bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-300",
      chipActive: "bg-sky-600 text-white font-bold shadow-xs",
      chipHover:
        "hover:bg-sky-500/10 hover:border-sky-500/30 text-foreground",
      countBadge:
        "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    },
    satuan_paud: {
      border: "border-border",
      bgGradient: "bg-card",
      accentText: "text-teal-600 dark:text-teal-400",
      icon: GraduationCap,
      badgeTotal: "bg-teal-600 text-white",
      badgeKec:
        "bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-300",
      chipActive: "bg-teal-600 text-white font-bold shadow-xs",
      chipHover:
        "hover:bg-teal-500/10 hover:border-teal-500/30 text-foreground",
      countBadge:
        "bg-teal-500/15 text-teal-700 dark:text-teal-300",
    },
    pkbm_skb: {
      border: "border-border",
      bgGradient: "bg-card",
      accentText: "text-amber-600 dark:text-amber-400",
      icon: BookOpen,
      badgeTotal: "bg-secondary text-secondary-foreground",
      badgeKec:
        "bg-secondary/15 border-secondary/30 text-secondary-foreground",
      chipActive: "bg-secondary text-secondary-foreground font-bold shadow-xs",
      chipHover:
        "hover:bg-secondary/15 hover:border-secondary/30 text-foreground",
      countBadge:
        "bg-secondary/20 text-secondary-foreground",
    },
  };

  const theme = themeMap[currentTab] || {
    border: "border-border",
    bgGradient: "bg-card",
    accentText: "text-primary",
    icon: HeartPulse,
    badgeTotal: "bg-primary text-primary-foreground",
    badgeKec:
      "bg-primary/10 border-primary/20 text-primary",
    chipActive: "bg-primary text-primary-foreground font-bold shadow-xs",
    chipHover:
      "hover:bg-primary/10 hover:border-primary/30 text-foreground",
    countBadge:
      "bg-primary/15 text-primary",
  };

  const IconComponent = theme.icon;

  // Helper membuat link filter dengan parameter terpadu
  const makeFilterUrl = (
    kecamatan?: string,
    kelurahan?: string,
    bentuk?: string
  ) => {
    const params = new URLSearchParams();
    params.set("tab", currentTab);

    const targetBentuk = bentuk !== undefined ? bentuk : currentBentuk;
    if ((isPaud || isPkbm) && targetBentuk && targetBentuk !== "semua") {
      params.set("bentuk", targetBentuk);
    }

    const targetKec = kecamatan !== undefined ? kecamatan : currentKecamatan;
    if (targetKec && targetKec !== "semua") {
      params.set("kecamatan", targetKec);
    }

    const targetKel = kelurahan !== undefined ? kelurahan : currentKelurahan;
    if (targetKel && targetKel !== "semua") {
      params.set("kelurahan", targetKel);
    }

    return `/komunitas?${params.toString()}`;
  };

  // Helper ikon khusus bentuk pendidikan
  const getBentukIcon = (bentuk: BentukPendidikanType) => {
    switch (bentuk) {
      case "TK":
        return School;
      case "KB":
        return Baby;
      case "RA":
        return BookOpen;
      case "SPS":
        return Users;
      case "TPA":
        return HeartHandshake;
      case "PKBM":
        return GraduationCap;
      case "SKB":
        return Building2;
      default:
        return School;
    }
  };

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm transition-all space-y-4 text-card-foreground"
    >
      {/* Header Bar Rekap */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-2xs shrink-0">
            <IconComponent className={`h-5 w-5 ${theme.accentText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                Rekap Jumlah {rekap.labelSingkat}
              </h2>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${theme.badgeTotal}`}
              >
                {isWarga
                  ? `${rekap.totalSemua} RW • ${(rekap.totalRt || 1712).toLocaleString("id-ID")} RT`
                  : `${rekap.totalSemua} ${rekap.satuanLabel}`}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              {isPaud
                ? `Tersebar di 7 Bentuk Satuan Pendidikan, ${rekap.totalKecamatan} Kecamatan & ${rekap.totalKelurahan} Kelurahan se-Kota Tegal`
                : isPkbm
                ? `Tersebar di 12 PKBM & 1 SKB (${rekap.totalSemua} Lembaga), ${rekap.totalKecamatan} Kecamatan se-Kota Tegal`
                : isWarga
                ? `Komunitas Warga Kota Tegal menaungi 4 Kecamatan & 27 Kelurahan (${rekap.totalSemua} RW & ${(rekap.totalRt || 1712).toLocaleString("id-ID")} RT) se-Kota Tegal`
                : `Tersebar di ${rekap.totalKecamatan} Kecamatan & ${rekap.totalKelurahan} Kelurahan se-Kota Tegal`}
            </p>
          </div>
        </div>

        {/* Action Button: Toggle Collapsible */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent text-xs font-semibold text-foreground transition-colors shadow-2xs cursor-pointer active:scale-98"
        >
          <span>{isOpen ? "Sembunyikan Rincian" : "Lihat Rincian Lengkap"}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Konten Rekap */}
      {isOpen && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-300">
          {/* ========================================================= */}
          {/* 1. KHUSUS TAB PAUD & TAB PKBM/SKB: REKAP BENTUK           */}
          {/* ========================================================= */}
          {(isPaud || isPkbm) && bentukRekap && (
            <div
              className="rounded-lg border border-border bg-card p-3.5 sm:p-4 shadow-sm space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Layers
                    className={cn(
                      "h-4 w-4",
                      isPaud
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  />
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    {isPaud
                      ? "Bentuk Satuan Pendidikan (TK, RA, KB, SPS, TPA, PKBM, SKB)"
                      : "Bentuk Satuan Pendidikan Kesetaraan (PKBM & SKB)"}
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {currentKecamatan !== "semua" || currentKelurahan !== "semua"
                    ? `${bentukRekap.totalFiltered} dari total ${bentukRekap.totalSemua} Lembaga di wilayah ini`
                    : `Total ${bentukRekap.totalSemua} Lembaga se-Kota Tegal`}
                </span>
              </div>

              {/* Grid Bentuk Lembaga */}
              <div
                className={cn(
                  "grid gap-2",
                  isPkbm
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
                )}
              >
                {/* Chip: Semua Bentuk */}
                <Link
                  href={makeFilterUrl(currentKecamatan, currentKelurahan, "semua")}
                  className={cn(
                    "flex flex-col justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-left group",
                    currentBentuk === "semua"
                      ? isPaud
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-secondary bg-secondary text-secondary-foreground shadow-xs"
                      : "border-border bg-card hover:bg-muted text-foreground"
                  )}
                  title="Tampilkan semua bentuk satuan pendidikan"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">
                      Semua
                    </span>
                    {currentBentuk === "semua" && (
                      <CheckCircle2 className="h-3 w-3 text-white shrink-0" />
                    )}
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black font-mono block leading-none">
                      {bentukRekap.totalFiltered}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-semibold block mt-1 line-clamp-1",
                        currentBentuk === "semua"
                          ? isPaud
                            ? "text-primary-foreground/90"
                            : "text-secondary-foreground/90"
                          : "text-muted-foreground"
                      )}
                    >
                      Semua Bentuk
                    </span>
                  </div>
                </Link>

                {/* List Bentuk Pendidikan / Kesetaraan */}
                {bentukRekap.list.map((item) => {
                  const isSelected =
                    currentBentuk.toUpperCase() === item.bentuk.toUpperCase();
                  const ShapeIcon = getBentukIcon(item.bentuk);

                  return (
                    <Link
                      key={item.bentuk}
                      href={makeFilterUrl(
                        currentKecamatan,
                        currentKelurahan,
                        isSelected ? "semua" : item.bentuk
                      )}
                      className={cn(
                        "flex flex-col justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-left group",
                        isSelected
                          ? isPaud
                            ? "border-primary bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/40"
                            : "border-secondary bg-secondary text-secondary-foreground shadow-xs ring-1 ring-secondary/40"
                          : "border-border bg-card hover:bg-muted text-foreground"
                      )}
                      title={`Filter: ${item.namaLengkap} (${item.kategori}) - ${item.keterangan}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <ShapeIcon
                            className={cn(
                              "h-3 w-3 shrink-0",
                              isSelected
                                ? "text-white"
                                : isPaud
                                ? "text-teal-600 dark:text-teal-400"
                                : "text-amber-600 dark:text-amber-400"
                            )}
                          />
                          <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                            {item.bentuk}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-3 w-3 text-white shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-black font-mono leading-none">
                            {item.filteredCount}
                          </span>
                          {item.filteredCount !== item.totalCount && (
                            <span
                              className={cn(
                                "text-[9px] font-mono",
                                isSelected
                                  ? isPaud
                                    ? "text-primary-foreground/80"
                                    : "text-secondary-foreground/80"
                                  : "text-muted-foreground"
                              )}
                            >
                              /{item.totalCount}
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[9px] font-semibold block mt-1 line-clamp-1",
                            isSelected
                              ? isPaud
                                ? "text-primary-foreground/90"
                                : "text-secondary-foreground/90"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.namaLengkap.replace(/^Taman\s+/i, "")}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1.B. KHUSUS TAB WARGA KITA: KOMUNITAS WARGA KOTA TEGAL    */}
          {/* ========================================================= */}
          {isWarga && (
            <div
              className={cn(
                "rounded-lg border p-3.5 sm:p-4 shadow-sm transition-all",
                currentKecamatan === "Kota Tegal"
                  ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/25"
                  : "border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                {/* Informasi Komunitas Kota Tegal */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href="/komunitas/kom-warga-kota-tegal"
                        className="text-sm sm:text-base font-bold text-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors tracking-tight inline-flex items-center gap-1.5"
                        title="Buka Komunitas Warga Kota Tegal"
                      >
                        <span>Komunitas Warga Kota Tegal</span>
                        <ArrowRight className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      </Link>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-600 text-white">
                        Tingkat Kota Tegal
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                        Induk Seluruh Warga
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      Wadah kolaborasi, gotong royong, pemantauan tumbuh kembang anak &amp; kepedulian sosial seluruh warga masyarakat se-Kota Tegal.
                    </p>
                    {/* Ringkasan Hierarki Wilayah */}
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap text-[11px] font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
                        4 Kecamatan
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
                        27 Kelurahan
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
                        167 RW
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
                        1.712 RT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <Link
                    href={
                      currentKecamatan === "Kota Tegal"
                        ? makeFilterUrl("semua", "semua")
                        : makeFilterUrl("Kota Tegal", "semua")
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95",
                      currentKecamatan === "Kota Tegal"
                        ? "bg-sky-500/15 border-sky-500 text-sky-700 dark:text-sky-300 ring-1 ring-sky-400/30 font-bold"
                        : "bg-card border-border hover:bg-accent text-foreground"
                    )}
                    title={
                      currentKecamatan === "Kota Tegal"
                        ? "Hapus filter wilayah Kota Tegal"
                        : "Tampilkan Komunitas Tingkat Kota Tegal"
                    }
                  >
                    {currentKecamatan === "Kota Tegal" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Filter Aktif</span>
                      </>
                    ) : (
                      <>
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Filter Wilayah</span>
                      </>
                    )}
                  </Link>
                  <Link
                    href="/komunitas/kom-warga-kota-tegal"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 group cursor-pointer"
                    title="Buka Halaman Komunitas Warga Kota Tegal"
                  >
                    <span>Buka Komunitas</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. GRID 4 KECAMATAN & 27 KELURAHAN                        */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rekap.kecamatanList.map((kec) => {
              const isKecSelected =
                currentKecamatan.toLowerCase() === kec.kecamatan.toLowerCase();

              return (
                <div
                  key={kec.kecamatan}
                  className={cn(
                    "rounded-lg border p-3 flex flex-col justify-between transition-all bg-card",
                    isKecSelected
                      ? isWarga
                        ? "border-sky-500 bg-sky-500/5 shadow-sm ring-1 ring-sky-500/20"
                        : "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  {/* Kecamatan Title & Total Count */}
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-border pb-2 mb-2">
                      <Link
                        href={makeFilterUrl(kec.kecamatan, "semua")}
                        className="group inline-flex items-center gap-1.5 hover:underline"
                        title={`Filter hanya Kecamatan ${kec.kecamatan}`}
                      >
                        <MapPin className={cn(
                          "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-colors",
                          isWarga ? "group-hover:text-sky-600" : "group-hover:text-primary"
                        )} />
                        <span className={cn(
                          "text-xs font-bold text-foreground transition-colors",
                          isWarga ? "group-hover:text-sky-600 dark:group-hover:text-sky-400" : "group-hover:text-primary"
                        )}>
                          Kec. {kec.kecamatan}
                        </span>
                      </Link>
                      <Link
                        href={makeFilterUrl(kec.kecamatan, "semua")}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${theme.badgeKec} hover:scale-105`}
                        title={isWarga ? `Total ${kec.totalCount} RW (${kec.rtTotal || (kec.totalCount * 10)} RT) di ${kec.kecamatan}` : `Total di ${kec.kecamatan}`}
                      >
                        {isWarga ? `${kec.totalCount} RW (${kec.rtTotal || (kec.totalCount * 10)} RT)` : kec.totalCount}
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
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer",
                              isKelSelected
                                ? theme.chipActive
                                : `bg-muted/50 border-border ${theme.chipHover}`
                            )}
                            title={
                              isWarga
                                ? `Filter: Kelurahan ${kel.kelurahan} (${kel.rwCount ?? kel.count} RW • ${kel.rtCount ?? (kel.count * 10)} RT)`
                                : `Filter: Kelurahan ${kel.kelurahan} (${kel.count} ${rekap.satuanLabel})`
                            }
                          >
                            <span>{kel.kelurahan}</span>
                            <span
                              className={cn(
                                "text-[10px] font-bold px-1.5 py-0.2 rounded",
                                isKelSelected
                                  ? "bg-white/20 text-white"
                                  : theme.countBadge
                              )}
                            >
                              {isWarga ? `${kel.rwCount ?? kel.count} RW` : kel.count}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Reset for this Kecamatan */}
                  {isKecSelected && (
                    <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[11px]">
                      <span className={cn(
                        "font-bold inline-flex items-center gap-1",
                        isWarga ? "text-sky-600 dark:text-sky-400" : "text-primary"
                      )}>
                        <CheckCircle2 className="h-3 w-3" />
                        Aktif difilter
                      </span>
                      <Link
                        href={makeFilterUrl("semua", "semua")}
                        className="text-muted-foreground hover:text-foreground underline font-medium"
                      >
                        Reset
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* 3. BANNER STATUS FILTER GABUNGAN AKTIF                     */}
          {/* ========================================================= */}
          {isFiltered && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2 flex-wrap text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1 text-slate-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="font-semibold">Filter Aktif:</span>
                </div>

                {/* Tag Bentuk Pendidikan */}
                {isPaud && currentBentuk !== "semua" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 text-[11px]">
                    <span>Bentuk: {currentBentuk}</span>
                    <Link
                      href={makeFilterUrl(currentKecamatan, currentKelurahan, "semua")}
                      className="hover:text-red-600 ml-0.5"
                      title="Hapus filter bentuk"
                    >
                      <X className="h-3 w-3" />
                    </Link>
                  </span>
                )}

                {/* Tag Kecamatan */}
                {currentKecamatan !== "semua" && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] border",
                      isWarga
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    )}
                  >
                    <span>
                      {currentKecamatan === "Kota Tegal"
                        ? "Tingkat Kota Tegal"
                        : `Kec. ${currentKecamatan}`}
                    </span>
                    <Link
                      href={makeFilterUrl("semua", "semua")}
                      className="hover:text-red-600 ml-0.5"
                      title="Hapus filter kecamatan"
                    >
                      <X className="h-3 w-3" />
                    </Link>
                  </span>
                )}

                {/* Tag Kelurahan */}
                {currentKelurahan !== "semua" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-[11px]">
                    <span>Kel. {currentKelurahan}</span>
                    <Link
                      href={makeFilterUrl(currentKecamatan, "semua")}
                      className="hover:text-red-600 ml-0.5"
                      title="Hapus filter kelurahan"
                    >
                      <X className="h-3 w-3" />
                    </Link>
                  </span>
                )}
              </div>

              <Link
                href={`/komunitas?tab=${currentTab}`}
                className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
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
