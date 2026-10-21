"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
  School,
  Layers,
  AlertCircle,
  Printer,
  HeartHandshake,
  CheckCircle2,
  HelpCircle,
  Compass,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Filter,
  X,
  Award,
  Info,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RekapDataAtsResult,
  WilayahRekapAtsItem,
  AtsCategoryBreakdown,
  AtsJenjangAsalBreakdown,
} from "@/app/actions/rekap-data-ats";
import { KartuDaftarNamaAtsRekap } from "./kartu-daftar-nama-ats-rekap";

export type TableAtsSortColumn =
  | "default"
  | "nama"
  | "kecamatan"
  | "totalAts"
  | "putusSekolah"
  | "lulusTidakLanjut"
  | "belumPernahSekolah"
  | "keinginan"
  | "lakiLaki"
  | "perempuan"
  | "prioritas";

export type SortDirection = "asc" | "desc";

const TABLE_ATS_SORT_LABELS: Record<TableAtsSortColumn, string> = {
  default: "Nomor Urut Default",
  nama: "Kelurahan",
  kecamatan: "Kecamatan",
  totalAts: "Total ATS",
  putusSekolah: "Putus Sekolah (DO)",
  lulusTidakLanjut: "Lulus Tdk Lanjut (LTM)",
  belumPernahSekolah: "Belum Pernah (BPB)",
  keinginan: "Ingin Sekolah Kembali",
  lakiLaki: "Laki-laki",
  perempuan: "Perempuan",
  prioritas: "Prioritas Intervensi",
};

// Helper untuk menghasilkan path SVG Donut Chart
function getDonutSlicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const angleDiff = endAngleDeg - startAngleDeg;
  if (angleDiff <= 0.01) return "";

  // Hindari glitch SVG arc pada lingkaran penuh (360 derajat)
  if (angleDiff >= 359.9) {
    const midAngle = startAngleDeg + 180;
    return `${getDonutSlicePath(cx, cy, rOuter, rInner, startAngleDeg, midAngle)} ${getDonutSlicePath(cx, cy, rOuter, rInner, midAngle, endAngleDeg)}`;
  }

  const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
  const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

  const x1Outer = cx + rOuter * Math.cos(startRad);
  const y1Outer = cy + rOuter * Math.sin(startRad);
  const x2Outer = cx + rOuter * Math.cos(endRad);
  const y2Outer = cy + rOuter * Math.sin(endRad);

  const x1Inner = cx + rInner * Math.cos(endRad);
  const y1Inner = cy + rInner * Math.sin(endRad);
  const x2Inner = cx + rInner * Math.cos(startRad);
  const y2Inner = cy + rInner * Math.sin(startRad);

  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  return [
    `M ${x1Outer.toFixed(2)} ${y1Outer.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2Outer.toFixed(2)} ${y2Outer.toFixed(2)}`,
    `L ${x1Inner.toFixed(2)} ${y1Inner.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x2Inner.toFixed(2)} ${y2Inner.toFixed(2)}`,
    `Z`,
  ].join(" ");
}

export interface RekapDataAtsClientViewProps {
  initialData: RekapDataAtsResult;
  canAccessDaftarNamaAts?: boolean;
  userPeran?: string;
  initialTingkat?: "kota" | "kecamatan" | "kelurahan";
  initialKecamatan?: string;
  initialKelurahan?: string;
  initialRw?: string;
  backHref?: string;
  backLabel?: string;
  customScopeTitle?: string;
  hideTingkatSelector?: boolean;
}

export function RekapDataAtsClientView({
  initialData,
  canAccessDaftarNamaAts = false,
  userPeran,
  initialTingkat,
  initialKecamatan,
  initialKelurahan,
  initialRw,
  backHref,
  backLabel,
  customScopeTitle,
  hideTingkatSelector = false,
}: RekapDataAtsClientViewProps) {
  // State Filter Berjenjang
  const [selectedTingkat, setSelectedTingkat] = useState<"kota" | "kecamatan" | "kelurahan">(initialTingkat || "kota");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>(initialKecamatan || "Tegal Timur");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>(initialKelurahan || "Kejambon");
  const [activeTabSection, setActiveTabSection] = useState<"semua" | "kategori" | "jenjang_usia" | "tabel">("semua");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [tablePriorityFilter, setTablePriorityFilter] = useState<"semua" | "tinggi" | "sedang" | "terkendali">("semua");
  const [sortColumn, setSortColumn] = useState<TableAtsSortColumn>("default");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [hoveredKategori, setHoveredKategori] = useState<string | null>(null);
  const [hoveredKeinginan, setHoveredKeinginan] = useState<string | null>(null);
  const [hoveredKelas, setHoveredKelas] = useState<string | null>(null);
  const [hoveredUsia, setHoveredUsia] = useState<number | null>(null);
  const [hoveredReason, setHoveredReason] = useState<string | null>(null);
  const [kelasViewMode, setKelasViewMode] = useState<"15_kelas" | "jenjang">("15_kelas");
  const [showAllReasons, setShowAllReasons] = useState<boolean>(false);

  const [isAllHidden, setIsAllHidden] = useState(false);
  const [hiddenCharts, setHiddenCharts] = useState<Record<string, boolean>>({});

  const toggleChart = (key: string) => {
    setHiddenCharts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAll = () => {
    if (isAllHidden) {
      setIsAllHidden(false);
      setHiddenCharts({});
    } else {
      setIsAllHidden(true);
      setHiddenCharts({
        kategori: true,
        keinginan: true,
        kelas: true,
        usia: true,
        alasan: true,
      });
    }
  };

  // Handler Sort Kolom Tabel ATS
  const handleSort = (column: TableAtsSortColumn) => {
    if (sortColumn === column) {
      const isTextCol = column === "nama" || column === "kecamatan";
      const firstDir: SortDirection = isTextCol ? "asc" : "desc";
      const secondDir: SortDirection = isTextCol ? "desc" : "asc";

      if (sortDirection === firstDir) {
        setSortDirection(secondDir);
      } else {
        // Siklus ke-3: reset kembali ke urutan default
        setSortColumn("default");
        setSortDirection(firstDir);
      }
    } else {
      setSortColumn(column);
      if (column === "nama" || column === "kecamatan") {
        setSortDirection("asc");
      } else {
        // Kolom angka dimulai dari nilai tertinggi (desc)
        setSortDirection("desc");
      }
    }
  };

  const handleResetSort = () => {
    setSortColumn("default");
    setSortDirection("desc");
  };

  // Helper render header kolom sortable
  const renderSortTh = (
    col: TableAtsSortColumn,
    label: string,
    align: "left" | "center" = "center",
    paddingClass: string = "px-2"
  ) => {
    const isActive = sortColumn === col;
    const isText = col === "nama" || col === "kecamatan";
    const descTitle = isText ? "Z ke A" : "tertinggi ke terendah";
    const ascTitle = isText ? "A ke Z" : "terendah ke tertinggi";

    return (
      <th
        scope="col"
        onClick={() => handleSort(col)}
        className={cn(
          "py-2 sm:py-2.5 text-2xs sm:text-xs select-none cursor-pointer transition-colors group",
          paddingClass,
          align === "center" ? "text-center" : "text-left",
          isActive
            ? "bg-blue-100/80 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border-b-2 border-blue-600 dark:border-blue-400"
            : "hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
        )}
        title={`Urutkan berdasarkan ${label} (${
          isActive
            ? `Saat ini ${sortDirection === "desc" ? descTitle : ascTitle}. Klik untuk ${sortDirection === "desc" ? ascTitle : "kembali normal"}`
            : `Klik untuk urutkan ${isText ? "A-Z" : "tertinggi ke terendah"}`
        })`}
      >
        <div
          className={cn(
            "inline-flex items-center gap-1.5",
            align === "center" ? "justify-center w-full" : "justify-start"
          )}
        >
          <span className={cn(isActive && "font-black text-blue-900 dark:text-blue-100")}>
            {label}
          </span>
          <span
            className={cn(
              "p-0.5 rounded transition-all inline-flex items-center justify-center shrink-0",
              isActive
                ? "bg-blue-600 text-white dark:bg-blue-500 shadow-2xs"
                : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            )}
          >
            {isActive ? (
              sortDirection === "desc" ? (
                <ArrowDown className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <ArrowUp className="h-3 w-3 stroke-[2.5]" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    );
  };

  // Daftar opsi kecamatan & kelurahan
  const daftarKecamatan = useMemo(() => {
    return initialData.kecamatanList.map((k) => k.nama);
  }, [initialData]);

  const daftarKelurahanInSelectedKecamatan = useMemo(() => {
    return initialData.kelurahanList.filter((k) => k.kecamatan === selectedKecamatan);
  }, [initialData, selectedKecamatan]);

  // Target Item Wilayah yang sedang aktif
  const currentWilayahData = useMemo<WilayahRekapAtsItem>(() => {
    if (selectedTingkat === "kota") {
      return initialData.kota;
    }
    if (selectedTingkat === "kecamatan") {
      const match = initialData.kecamatanList.find((k) => k.nama === selectedKecamatan);
      return match || initialData.kecamatanList[0] || initialData.kota;
    }
    // Kelurahan
    const match = initialData.kelurahanList.find((k) => k.nama === selectedKelurahan);
    return match || initialData.kelurahanList[0] || initialData.kota;
  }, [selectedTingkat, selectedKecamatan, selectedKelurahan, initialData]);

  // Statistik Prioritas Kelurahan untuk Quick Filter di Tabel
  const priorityCounts = useMemo(() => {
    const list = initialData.kelurahanList;
    let tinggi = 0;
    let sedang = 0;
    let terkendali = 0;
    list.forEach((k) => {
      const tot = k.totalAts ?? 0;
      if (tot >= 25) tinggi++;
      else if (tot >= 15) sedang++;
      else terkendali++;
    });
    return { tinggi, sedang, terkendali, total: list.length };
  }, [initialData.kelurahanList]);

  // Data Tabel Komparatif yang difilter dan diurutkan
  const filteredTableRows = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    let rows = initialData.kelurahanList;

    if (tablePriorityFilter !== "semua") {
      rows = rows.filter((k) => {
        const tot = k.totalAts ?? 0;
        if (tablePriorityFilter === "tinggi") return tot >= 25;
        if (tablePriorityFilter === "sedang") return tot >= 15 && tot < 25;
        if (tablePriorityFilter === "terkendali") return tot < 15;
        return true;
      });
    }

    if (q) {
      rows = rows.filter(
        (k) =>
          k.nama.toLowerCase().includes(q) ||
          (k.kecamatan && k.kecamatan.toLowerCase().includes(q))
      );
    }

    if (sortColumn === "default") {
      return rows;
    }

    const getColValue = (item: WilayahRekapAtsItem, col: TableAtsSortColumn): number | string => {
      switch (col) {
        case "nama":
          return item.nama || "";
        case "kecamatan":
          return item.kecamatan || "";
        case "totalAts":
        case "prioritas":
          return item.totalAts ?? 0;
        case "putusSekolah":
          return item.kategori?.putusSekolah ?? 0;
        case "lulusTidakLanjut":
          return item.kategori?.lulusTidakLanjut ?? 0;
        case "belumPernahSekolah":
          return item.kategori?.belumPernahSekolah ?? 0;
        case "keinginan":
          return item.keinginan?.masihAda ?? 0;
        case "lakiLaki":
          return item.gender?.lakiLaki ?? 0;
        case "perempuan":
          return item.gender?.perempuan ?? 0;
        default:
          return 0;
      }
    };

    return [...rows].sort((a, b) => {
      const valA = getColValue(a, sortColumn);
      const valB = getColValue(b, sortColumn);

      let cmp = 0;
      if (typeof valA === "string" && typeof valB === "string") {
        cmp = valA.localeCompare(valB, "id", { sensitivity: "base" });
      } else {
        cmp = (valA as number) - (valB as number);
      }

      if (cmp === 0) {
        // Secondary tie breaker: nama alfabetis
        cmp = a.nama.localeCompare(b.nama, "id");
      }

      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [initialData.kelurahanList, tableSearch, sortColumn, sortDirection]);

  // Data Donut Chart Kategori ATS (DO, LTM, BPB)
  const kategoriDonutData = useMemo(() => {
    const k = currentWilayahData.kategori;
    const total = currentWilayahData.totalAts || 0;
    const items = [
      {
        id: "do",
        key: "putusSekolah",
        code: "DO",
        label: "Putus Sekolah (DO)",
        fullName: "Drop Out / Putus Sekolah",
        desc: "Berhenti sebelum menyelesaikan jenjang pendidikan",
        count: k.putusSekolah,
        color: "#f43f5e", // rose-500
        bgClass: "bg-rose-500",
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
      },
      {
        id: "ltm",
        key: "lulusTidakLanjut",
        code: "LTM",
        label: "Lulus Tdk Lanjut (LTM)",
        fullName: "Lulus Tidak Melanjutkan",
        desc: "Lulus jenjang sebelumnya namun tidak melanjutkan",
        count: k.lulusTidakLanjut,
        color: "#f59e0b", // amber-500
        bgClass: "bg-amber-500",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      },
      {
        id: "bpb",
        key: "belumPernahSekolah",
        code: "BPB",
        label: "Belum Pernah Sekolah (BPB)",
        fullName: "Belum Pernah Bersekolah",
        desc: "Usia wajib belajar (6–18 thn) belum pernah sekolah",
        count: k.belumPernahSekolah,
        color: "#3b82f6", // blue-500
        bgClass: "bg-blue-500",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
      },
    ];

    let currentAngle = 0;
    return items.map((item) => {
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      const angle = total > 0 ? (item.count / total) * 360 : 0;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      return {
        ...item,
        pct,
        startAngle,
        endAngle,
      };
    });
  }, [currentWilayahData]);

  // Data Donut Chart Keinginan Bersekolah Kembali
  const keinginanDonutData = useMemo(() => {
    const total = currentWilayahData.totalAts || 0;
    const masihAdaCount = currentWilayahData.keinginan?.masihAda || 0;
    const tidakAdaCount = currentWilayahData.keinginan?.tidakAda || 0;

    const items = [
      {
        id: "masih-ada",
        label: "Masih Ada Keinginan",
        sub: "Siap difasilitasi ke PKBM / SKB",
        count: masihAdaCount,
        pct: currentWilayahData.persenInginSekolah || 0,
        color: "#10b981", // emerald-500
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      },
      {
        id: "tidak-ada",
        label: "Tidak Ingin / Ragu",
        sub: "Perlu pendampingan & konseling",
        count: tidakAdaCount,
        pct: 100 - (currentWilayahData.persenInginSekolah || 0),
        color: "#94a3b8", // slate-400
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      },
    ];

    let currentAngle = 0;
    return items.map((item) => {
      const angle = total > 0 ? (item.count / total) * 360 : 0;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      return {
        ...item,
        startAngle,
        endAngle,
      };
    });
  }, [currentWilayahData]);

  const activeKategoriItem = useMemo(() => {
    if (!hoveredKategori) return null;
    return kategoriDonutData.find((item) => item.id === hoveredKategori) || null;
  }, [hoveredKategori, kategoriDonutData]);

  const activeKeinginanItem = useMemo(() => {
    if (!hoveredKeinginan) return null;
    return keinginanDonutData.find((item) => item.id === hoveredKeinginan) || null;
  }, [hoveredKeinginan, keinginanDonutData]);

  const activeHoveredKelasItem = useMemo(() => {
    if (!hoveredKelas) return null;
    return (currentWilayahData.kelasPerJenjang || []).find((k) => k.key === hoveredKelas) || null;
  }, [hoveredKelas, currentWilayahData]);

  const activeHoveredUsiaItem = useMemo(() => {
    if (hoveredUsia === null) return null;
    return (currentWilayahData.usiaPerTahun || []).find((u) => u.usia === hoveredUsia) || null;
  }, [hoveredUsia, currentWilayahData]);

  const jenjangEntries = useMemo(() => {
    const j = currentWilayahData.jenjangAsal;
    const total = currentWilayahData.totalAts || 1;
    return [
      { label: "Belum Pernah Bersekolah", count: j.belumSekolah, pct: Math.round((j.belumSekolah / total) * 100), color: "bg-blue-600" },
      { label: "SD / MI / Paket A Putus Sekolah / DO", count: j.sdPutus, pct: Math.round((j.sdPutus / total) * 100), color: "bg-rose-500" },
      { label: "SD / MI / Paket A Lulus Tidak Melanjutkan", count: j.sdLulus, pct: Math.round((j.sdLulus / total) * 100), color: "bg-amber-500" },
      { label: "SMP / MTs / Paket B Putus Sekolah / DO", count: j.smpPutus, pct: Math.round((j.smpPutus / total) * 100), color: "bg-rose-600" },
      { label: "SMP / MTs / Paket B Lulus Tidak Melanjutkan", count: j.smpLulus, pct: Math.round((j.smpLulus / total) * 100), color: "bg-amber-600" },
      { label: "SMA / SMK / MA / Paket C Putus Sekolah", count: j.smaPutus, pct: Math.round((j.smaPutus / total) * 100), color: "bg-teal-600" },
    ];
  }, [currentWilayahData]);

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24 print:max-w-none print:w-full print:p-0 print:m-0 print:gap-0 print:pb-0">
      {/* Tombol Kembali jika diakses dari Detail Komunitas */}
      {backHref && (
        <div className="flex items-center justify-between print:hidden print-hide-on-daftar-nama">
          <Link
            href={backHref}
            className="inline-flex min-h-[40px] h-10 items-center gap-2 rounded-lg bg-card border border-border px-3.5 text-xs font-semibold text-foreground transition-all hover:bg-muted shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>{backLabel || "Kembali ke Komunitas"}</span>
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. BREADCRUMB & HERO HEADER                               */}
      {/* ========================================================= */}
      <div className="space-y-3 print-hide-on-daftar-nama">
        <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <span>Beranda</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <span className="text-foreground font-bold">
            {customScopeTitle || "Pantau Hasil Pendataan ATS"}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 p-6 sm:p-7 rounded-lg text-white shadow-sm border border-teal-800/40 relative overflow-hidden print-card-item break-inside-avoid">
          {/* Subtle Glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-lg bg-secondary/20 border border-secondary/40 px-3 py-0.5 text-xs font-black text-amber-300 tracking-wide uppercase">
                {customScopeTitle ? `BERJENJANG: ${customScopeTitle.toUpperCase()}` : "PENDATAAN ANAK TIDAK SEKOLAH (ATS)"}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Pembaruan: {initialData.lastUpdated}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
              Hasil Pendataan Anak Tidak Sekolah (ATS)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dashboard rekapitulasi penanganan ATS berjenjang Kota Tegal, 4 Kecamatan, dan 27 Kelurahan. Menampilkan kategori putus sekolah, lulus tidak melanjutkan, belum pernah sekolah, kesiapan kembali bersekolah, serta jalur intervensi program kesetaraan (PKBM &amp; SKB).
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0 relative z-10 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md active:scale-98 shadow-sm"
            >
              <Printer className="h-4 w-4 text-amber-300" />
              <span>Cetak Rekap ATS</span>
            </button>
            <div className="text-2xs text-slate-400 font-medium hidden md:block">
              {initialData.totalLiveRecords} data valid di database
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. LEVEL SELECTOR CONTROLS (KOTA / KECAMATAN / KELURAHAN) */}
      {/* ========================================================= */}
      <div className="bg-card p-4 sm:p-5 rounded-lg border border-border shadow-sm space-y-4 print-hide-on-daftar-nama print-card-item break-inside-avoid print:p-3 print:space-y-0 print:border-slate-300 print:rounded-lg">
        {!hideTingkatSelector && (
          <div className="space-y-3.5 print:hidden">
            {/* Header / Selector Label */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                    Filter Tingkat Analisis ATS
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Pilih Cakupan Wilayah Rekapitulasi ATS
                  </h3>
                </div>
              </div>
              <span className="text-2xs text-muted-foreground font-medium">
                Pilih tingkat agregasi untuk memperbarui grafik &amp; data ATS
              </span>
            </div>

            {/* Level Hierarchy Buttons (Grid 3 Cols, Zero Overflow, No Scrollbar) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-muted/60 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setSelectedTingkat("kota")}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border",
                  selectedTingkat === "kota"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                <span>🏢</span>
                <span>Kota Tegal (Agregat)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTingkat("kecamatan")}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border",
                  selectedTingkat === "kecamatan"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-primary hover:bg-card"
                )}
              >
                <span>🏛️</span>
                <span>Tingkat Kecamatan</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTingkat("kelurahan")}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border",
                  selectedTingkat === "kelurahan"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-primary hover:bg-card"
                )}
              >
                <span>🏘️</span>
                <span>Tingkat Kelurahan</span>
              </button>
            </div>

            {/* Sub-Filters: Dedicated Panel for Kecamatan */}
            {selectedTingkat === "kecamatan" && (
              <div className="p-3.5 sm:p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Pilih Kecamatan:
                  </span>
                  <span className="text-2xs text-muted-foreground font-medium">
                    Klik salah satu kecamatan untuk melihat data spesifik
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {daftarKecamatan.map((kec) => (
                    <button
                      key={kec}
                      type="button"
                      onClick={() => setSelectedKecamatan(kec)}
                      className={cn(
                        "px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer flex items-center justify-center gap-1.5",
                        selectedKecamatan === kec
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted"
                      )}
                    >
                      <span>Kec. {kec}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Filters: Dedicated 2-Step Panel for Kelurahan */}
            {selectedTingkat === "kelurahan" && (
              <div className="p-3.5 sm:p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Filter Wilayah Kelurahan ATS:
                  </span>
                  <span className="text-2xs text-muted-foreground font-medium">
                    Langkah 1: Tentukan Kecamatan &bull; Langkah 2: Pilih Kelurahan
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                  {/* Step 1: Pilih Kecamatan */}
                  <div className="lg:col-span-7 space-y-1.5">
                    <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        1
                      </span>
                      <span>Kecamatan:</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {daftarKecamatan.map((kec) => (
                        <button
                          key={kec}
                          type="button"
                          onClick={() => {
                            setSelectedKecamatan(kec);
                            const firstKel = initialData.kelurahanList.find((k) => k.kecamatan === kec);
                            if (firstKel) setSelectedKelurahan(firstKel.nama);
                          }}
                          className={cn(
                            "px-2.5 py-2 rounded-lg text-2xs font-bold transition-all text-center border truncate cursor-pointer",
                            selectedKecamatan === kec
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted"
                          )}
                        >
                          {kec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Pilih Kelurahan */}
                  <div className="lg:col-span-5 space-y-1.5">
                    <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                      <label className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          2
                        </span>
                        <span>Kelurahan ({selectedKecamatan}):</span>
                      </label>
                      <span className="text-primary font-bold">
                        {daftarKelurahanInSelectedKecamatan.length} Kel.
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedKelurahan}
                        onChange={(e) => setSelectedKelurahan(e.target.value)}
                        className="w-full bg-background border border-primary/30 text-foreground text-xs font-bold rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs appearance-none pr-9 transition-colors"
                      >
                        {daftarKelurahanInSelectedKecamatan.map((kel) => (
                          <option key={kel.nama} value={kel.nama}>
                            Kel. {kel.nama} {kel.totalAts ? `(${kel.totalAts} ATS)` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 text-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Wilayah Indicator Badge */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border flex-wrap gap-2 text-xs print:pt-0 print:border-none">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse print:hidden shrink-0" />
            <span className="font-bold text-muted-foreground">Wilayah Rekap ATS:</span>
            <strong className="text-sm font-black text-foreground">
              {currentWilayahData.tingkat === "kota" && "Seluruh Wilayah Kota Tegal"}
              {currentWilayahData.tingkat === "kecamatan" && `Kecamatan ${currentWilayahData.nama}, Kota Tegal`}
              {currentWilayahData.tingkat === "kelurahan" && (
                <>
                  {initialRw ? `RW ${initialRw} • ` : ""}
                  Kelurahan {currentWilayahData.nama}, Kec. {currentWilayahData.kecamatan}, Kota Tegal
                </>
              )}
            </strong>
          </div>

          <div className="flex items-center gap-2 text-2xs font-bold text-muted-foreground">
            <span className="px-2 py-0.5 rounded-lg bg-muted border border-border font-mono">
              {initialRw ? `RW ${initialRw} (Kel. ${currentWilayahData.nama})` : "Intervensi: SKB & PKBM Kota Tegal"}
            </span>
          </div>
        </div>
      </div>

      {/* Ketentuan Privasi & Tingkat Data Rekapitulasi ATS */}
      <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 sm:p-5 flex items-start gap-3 shadow-xs print-hide-on-daftar-nama print-card-item break-inside-avoid print:p-3">
        <ShieldCheck className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
            Data Rekapitulasi Wilayah &amp; Perlindungan Privasi ATS
          </h4>
          <p className="text-xs sm:text-sm text-foreground leading-relaxed">
            Data yang ditampilkan pada halaman ini adalah <strong>Data Rekapitulasi Hasil Pendataan ATS</strong>. Sesuai ketentuan perlindungan privasi data, rincian identitas lengkap anak tidak sekolah hanya dapat diakses di <strong>Tingkat KELURAHAN</strong> oleh <strong>Admin di Komunitas Warga Kita</strong>, <strong>Admin PAUD</strong>, <strong>Admin Posyandu</strong> dan <strong>Admin PKBM dan SKB</strong>.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. SECTION NAVIGATION TABS                                */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-muted/60 p-1.5 rounded-lg border border-border print:hidden print-hide-on-daftar-nama">
        <button
          type="button"
          onClick={() => setActiveTabSection("semua")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "semua"
              ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
              : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          📊 Ringkasan Visual ATS
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("kategori")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "kategori"
              ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
              : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          🎯 Kategori &amp; Keinginan Sekolah
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("jenjang_usia")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "jenjang_usia"
              ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
              : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          📚 Jenjang Asal &amp; Kelompok Usia
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection("tabel")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
            activeTabSection === "tabel"
              ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
              : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          📑 Tabel Rekapitulasi Berjenjang (27 Kelurahan)
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. SECTION: KATEGORI & KEINGINAN BERSEKOLAH               */}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "kategori") && (
        <div className="space-y-4 print-hide-on-daftar-nama">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print-section-header break-after-avoid">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs shrink-0">
                <PieChartIcon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-foreground">
                  Kategori ATS &amp; Kesiapan Kembali Bersekolah
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Status putus sekolah, lulus tidak melanjutkan, serta kemauan anak untuk kembali belajar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={toggleAll}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer print:hidden shrink-0",
                  isAllHidden
                    ? "bg-primary hover:bg-primary-hover text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-foreground border-border hover:bg-muted shadow-2xs"
                )}
                title={isAllHidden ? "Tampilkan Seluruh Grafik" : "Sembunyikan Seluruh Grafik"}
              >
                {isAllHidden ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Tampilkan Semua Grafik</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Sembunyikan Semua Grafik</span>
                  </>
                )}
              </button>
              <span className="hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono print:inline-block shrink-0">
                Total: {currentWilayahData.totalAts} Anak
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 print-cards-grid">
            {/* 5.1 Kategori ATS Breakdown */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm print-card-item break-inside-avoid print:p-4 print:rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                      <BarChart3 className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                        Distribusi Kategori ATS
                      </h3>
                      <p className="text-2xs sm:text-xs text-muted-foreground font-medium truncate">
                        Status DO, LTM, dan Belum Pernah Sekolah
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleChart("kategori")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-2xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 print:hidden"
                      title={hiddenCharts.kategori ? "Tampilkan Grafik" : "Sembunyikan Grafik"}
                    >
                      {hiddenCharts.kategori ? (
                        <>
                          <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span>Tampilkan</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-slate-400" />
                          <span>Sembunyikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {hiddenCharts.kategori ? (
                  <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 mt-4">
                    <EyeOff className="h-4 w-4 text-slate-400" />
                    <span>Grafik Distribusi Kategori ATS disembunyikan.</span>
                    <button
                      type="button"
                      onClick={() => toggleChart("kategori")}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Tampilkan kembali
                    </button>
                  </div>
                ) : (
                  <div className="pt-3.5 space-y-4">
                    {/* Visual Donut Chart + 3 Metric Rows */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                      {/* Donut Chart */}
                      <div className="relative flex items-center justify-center shrink-0 w-[140px] h-[140px]">
                        {currentWilayahData.totalAts > 0 ? (
                          <svg width="140" height="140" viewBox="0 0 140 140" className="overflow-visible drop-shadow-2xs">
                            {kategoriDonutData.map((item) => {
                              if (item.count === 0) return null;
                              const path = getDonutSlicePath(70, 70, 66, 44, item.startAngle, item.endAngle);
                              const isHovered = hoveredKategori === item.id;
                              return (
                                <path
                                  key={item.id}
                                  d={path}
                                  fill={item.color}
                                  className="transition-all duration-300 cursor-pointer"
                                  opacity={hoveredKategori === null || isHovered ? 1 : 0.4}
                                  style={{
                                    transform: isHovered ? "scale(1.04)" : "scale(1)",
                                    transformOrigin: "70px 70px",
                                  }}
                                  onMouseEnter={() => setHoveredKategori(item.id)}
                                  onMouseLeave={() => setHoveredKategori(null)}
                                />
                              );
                            })}
                          </svg>
                        ) : (
                          <div className="w-[130px] h-[130px] rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          {activeKategoriItem ? (
                            <>
                              <span className="text-[10px] font-mono font-black" style={{ color: activeKategoriItem.color }}>
                                {activeKategoriItem.code}
                              </span>
                              <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 leading-tight">
                                {activeKategoriItem.count}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                {activeKategoriItem.pct}%
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                TOTAL ATS
                              </span>
                              <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 leading-none my-0.5">
                                {currentWilayahData.totalAts}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                Anak
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 3 Category Cards */}
                      <div className="flex-1 w-full space-y-2">
                        {kategoriDonutData.map((item) => {
                          const isHovered = hoveredKategori === item.id;
                          return (
                            <div
                              key={item.id}
                              onMouseEnter={() => setHoveredKategori(item.id)}
                              onMouseLeave={() => setHoveredKategori(null)}
                              className={cn(
                                "p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer",
                                isHovered
                                  ? "bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-xs"
                                  : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={cn("px-1.5 py-0.5 rounded-md font-mono text-2xs font-black uppercase border shrink-0", item.badgeBg)}>
                                    {item.code}
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {item.fullName}
                                  </span>
                                </div>
                                <div className="flex items-baseline gap-1 shrink-0 font-mono">
                                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                                    {item.count}
                                  </span>
                                  <span className="text-2xs font-semibold text-slate-500 font-sans">
                                    Anak
                                  </span>
                                  <span className="text-2xs font-bold text-slate-500 ml-0.5">
                                    ({item.pct}%)
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-8 mt-0.5 truncate">
                                {item.desc}
                              </p>
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5 ml-8 w-[calc(100%-2rem)]">
                                <div
                                  className={cn("h-full rounded-full transition-all duration-700", item.bgClass)}
                                  style={{ width: `${Math.max(item.count > 0 ? 3 : 0, item.pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Integrated Proportion Segment Bar */}
                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between text-2xs font-bold">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Proporsi Kategori:</span>
                        <div className="flex items-center gap-2.5 font-mono text-slate-700 dark:text-slate-300">
                          {kategoriDonutData.map((item) => (
                            <span key={item.id} className="flex items-center gap-1">
                              <span className={cn("h-2 w-2 rounded-full shrink-0", item.bgClass)} />
                              <span className="font-sans font-semibold">{item.code}:</span>
                              <span>{item.pct}%</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 p-0.5 gap-0.5">
                        {kategoriDonutData.map((item) => (
                          <div
                            key={item.id}
                            className={cn("h-full first:rounded-l-full last:rounded-r-full transition-all duration-700", item.bgClass)}
                            style={{ width: `${Math.max(item.count > 0 ? 3 : 0, item.pct)}%` }}
                            title={`${item.label}: ${item.count} Anak (${item.pct}%)`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5.2 Keinginan Bersekolah Kembali & Rasio Gender */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm print-card-item break-inside-avoid print:p-4 print:rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                        Kesiapan Kembali Bersekolah
                      </h3>
                      <p className="text-2xs sm:text-xs text-muted-foreground font-medium truncate">
                        Minat belajar kembali &amp; profil gender anak ATS
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleChart("keinginan")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-foreground text-2xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-muted print:hidden"
                      title={hiddenCharts.keinginan ? "Tampilkan Grafik" : "Sembunyikan Grafik"}
                    >
                      {hiddenCharts.keinginan ? (
                        <>
                          <Eye className="h-3 w-3 text-primary" />
                          <span>Tampilkan</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                          <span>Sembunyikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {hiddenCharts.keinginan ? (
                  <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 mt-4">
                    <EyeOff className="h-4 w-4 text-slate-400" />
                    <span>Grafik Keinginan Bersekolah disembunyikan.</span>
                    <button
                      type="button"
                      onClick={() => toggleChart("keinginan")}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Tampilkan kembali
                    </button>
                  </div>
                ) : (
                  <div className="pt-3.5 space-y-3.5">
                    {/* Visual Donut Chart + 2 Readiness Cards */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                      {/* Donut Chart */}
                      <div className="relative flex items-center justify-center shrink-0 w-[140px] h-[140px]">
                        {currentWilayahData.totalAts > 0 ? (
                          <svg width="140" height="140" viewBox="0 0 140 140" className="overflow-visible drop-shadow-2xs">
                            {keinginanDonutData.map((item) => {
                              if (item.count === 0) return null;
                              const path = getDonutSlicePath(70, 70, 66, 44, item.startAngle, item.endAngle);
                              const isHovered = hoveredKeinginan === item.id;
                              return (
                                <path
                                  key={item.id}
                                  d={path}
                                  fill={item.color}
                                  className="transition-all duration-300 cursor-pointer"
                                  opacity={hoveredKeinginan === null || isHovered ? 1 : 0.4}
                                  style={{
                                    transform: isHovered ? "scale(1.04)" : "scale(1)",
                                    transformOrigin: "70px 70px",
                                  }}
                                  onMouseEnter={() => setHoveredKeinginan(item.id)}
                                  onMouseLeave={() => setHoveredKeinginan(null)}
                                />
                              );
                            })}
                          </svg>
                        ) : (
                          <div className="w-[130px] h-[130px] rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          {activeKeinginanItem ? (
                            <>
                              <span className="text-[10px] font-mono font-black" style={{ color: activeKeinginanItem.color }}>
                                {activeKeinginanItem.id === "masih-ada" ? "BERMINAT" : "RAGU"}
                              </span>
                              <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 leading-tight">
                                {activeKeinginanItem.count}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                {activeKeinginanItem.pct}%
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                                {currentWilayahData.persenInginSekolah}%
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                                BERMINAT
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 2 Readiness Cards Stacked */}
                      <div className="flex-1 w-full space-y-2">
                        {/* Masih Ada Keinginan */}
                        <div
                          onMouseEnter={() => setHoveredKeinginan("masih-ada")}
                          onMouseLeave={() => setHoveredKeinginan(null)}
                          className={cn(
                            "p-3 rounded-2xl border transition-all cursor-pointer",
                            hoveredKeinginan === "masih-ada"
                              ? "bg-emerald-100/90 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 shadow-xs"
                              : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                              Masih Ada Keinginan
                            </span>
                            <span className="text-xs font-mono font-black text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60">
                              {currentWilayahData.persenInginSekolah}%
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mt-1">
                            <div className="text-lg sm:text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                              {currentWilayahData.keinginan.masihAda} <span className="text-xs font-bold text-emerald-600 font-sans">Anak</span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                              ✓ Siap ke PKBM/SKB
                            </span>
                          </div>
                        </div>

                        {/* Tidak Ingin / Ragu */}
                        <div
                          onMouseEnter={() => setHoveredKeinginan("tidak-ada")}
                          onMouseLeave={() => setHoveredKeinginan(null)}
                          className={cn(
                            "p-3 rounded-2xl border transition-all cursor-pointer",
                            hoveredKeinginan === "tidak-ada"
                              ? "bg-slate-200/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 shadow-xs"
                              : "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                              Tidak Ingin / Ragu
                            </span>
                            <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                              {100 - currentWilayahData.persenInginSekolah}%
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mt-1">
                            <div className="text-lg sm:text-xl font-black font-mono text-slate-700 dark:text-slate-200">
                              {currentWilayahData.keinginan.tidakAda} <span className="text-xs font-bold text-slate-500 font-sans">Anak</span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              ℹ Perlu Konseling
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rasio Gender ATS */}
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between text-2xs sm:text-xs font-extrabold">
                        <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
                          Laki-laki: {currentWilayahData.gender.lakiLaki} Anak (
                          {Math.round((currentWilayahData.gender.lakiLaki / (currentWilayahData.totalAts || 1)) * 100)}%)
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                          Perempuan: {currentWilayahData.gender.perempuan} Anak (
                          {Math.round((currentWilayahData.gender.perempuan / (currentWilayahData.totalAts || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 p-0.5 gap-0.5">
                        <div
                          className="bg-sky-500 h-full rounded-l-full transition-all duration-700"
                          style={{
                            width: `${Math.round((currentWilayahData.gender.lakiLaki / (currentWilayahData.totalAts || 1)) * 100)}%`,
                          }}
                          title={`Laki-laki: ${currentWilayahData.gender.lakiLaki} Anak`}
                        />
                        <div
                          className="bg-rose-500 h-full rounded-r-full transition-all duration-700"
                          style={{
                            width: `${Math.round((currentWilayahData.gender.perempuan / (currentWilayahData.totalAts || 1)) * 100)}%`,
                          }}
                          title={`Perempuan: ${currentWilayahData.gender.perempuan} Anak`}
                        />
                      </div>
                    </div>

                    {/* Micro Callout Alert */}
                    <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs font-medium text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">Anak dengan motivasi belajar tinggi segera difasilitasi ke PKBM/SKB terdekat.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SECTION: JENJANG ASAL, KELOMPOK USIA & ALASAN ATS     */}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "jenjang_usia") && (
        <div className="space-y-4 pt-4 print-hide-on-daftar-nama">
          {/* Section 6 Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print-section-header break-after-avoid">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs shrink-0">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-foreground truncate">
                  Jenjang Sekolah Asal, Kelompok Usia &amp; Alasan Tidak Sekolah
                </h2>
                <p className="text-xs text-muted-foreground font-medium truncate">
                  Rincian tingkatan kelas terakhir, distribusi rentang umur, dan faktor penyebab putus sekolah.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={toggleAll}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer print:hidden shrink-0",
                  isAllHidden
                    ? "bg-primary hover:bg-primary-hover text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-foreground border-border hover:bg-muted shadow-2xs"
                )}
                title={isAllHidden ? "Tampilkan Seluruh Grafik" : "Sembunyikan Seluruh Grafik"}
              >
                {isAllHidden ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-primary-foreground" />
                    <span>Tampilkan Semua Grafik</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Sembunyikan Semua Grafik</span>
                  </>
                )}
              </button>
              <span className="hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono print:inline-block shrink-0">
                Total: {currentWilayahData.totalAts} Anak
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 print-cards-grid">
            {/* 6.1 Diagram Batang: Jenjang Sekolah Asal / Kelas Terakhir ATS */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm print-card-item break-inside-avoid print:p-4 print:rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                      <School className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                        Jenjang &amp; Kelas Terakhir ATS
                      </h3>
                      <p className="text-2xs sm:text-xs text-muted-foreground font-medium truncate">
                        Tingkat kelas DO, LTM, dan belum pernah sekolah
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* View Mode Toggle (15 Kelas vs 4 Jenjang) */}
                    <div className="hidden sm:inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border">
                      <button
                        type="button"
                        onClick={() => setKelasViewMode("15_kelas")}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-2xs font-bold transition-all cursor-pointer",
                          kelasViewMode === "15_kelas"
                            ? "bg-card text-foreground shadow-2xs font-black"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Tampilkan rincian 15 tingkatan kelas"
                      >
                        15 Kelas
                      </button>
                      <button
                        type="button"
                        onClick={() => setKelasViewMode("jenjang")}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-2xs font-bold transition-all cursor-pointer",
                          kelasViewMode === "jenjang"
                            ? "bg-card text-foreground shadow-2xs font-black"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Tampilkan ringkasan 4 jenjang pendidikan"
                      >
                        4 Jenjang
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleChart("kelas")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-foreground text-2xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-muted print:hidden"
                      title={hiddenCharts.kelas ? "Tampilkan Grafik" : "Sembunyikan Grafik"}
                    >
                      {hiddenCharts.kelas ? (
                        <>
                          <Eye className="h-3 w-3 text-primary" />
                          <span>Tampilkan</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                          <span>Sembunyikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {hiddenCharts.kelas ? (
                  <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 mt-4">
                    <EyeOff className="h-4 w-4 text-slate-400" />
                    <span>Grafik jenjang &amp; kelas terakhir ATS disembunyikan.</span>
                    <button
                      type="button"
                      onClick={() => toggleChart("kelas")}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Tampilkan kembali
                    </button>
                  </div>
                ) : (
                  <div className="pt-3.5 space-y-3.5">
                    {(() => {
                      const kelasList = currentWilayahData.kelasPerJenjang || [];
                      const maxKelasCount = Math.max(...kelasList.map((k) => k.jumlah), 1);
                      const total = currentWilayahData.totalAts || 1;

                      // Hitung total ringkasan jenjang
                      const countBPB = kelasList.find((k) => k.key === "bpb")?.jumlah || 0;
                      const countSD = kelasList
                        .filter((k) => k.jenjang === "SD")
                        .reduce((acc, curr) => acc + curr.jumlah, 0);
                      const countSMP = kelasList
                        .filter((k) => k.jenjang === "SMP")
                        .reduce((acc, curr) => acc + curr.jumlah, 0);
                      const countSMA = kelasList
                        .filter((k) => k.jenjang === "SMA")
                        .reduce((acc, curr) => acc + curr.jumlah, 0);

                      return (
                        <>
                          {/* Dynamic Active Hover Banner */}
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-2xs min-h-[34px]">
                            {activeHoveredKelasItem ? (
                              <div className="flex items-center gap-2 font-bold truncate">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase shrink-0",
                                  activeHoveredKelasItem.jenjang === "BPB" && "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
                                  activeHoveredKelasItem.jenjang === "SD" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
                                  activeHoveredKelasItem.jenjang === "SMP" && "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300",
                                  activeHoveredKelasItem.jenjang === "SMA" && "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300"
                                )}>
                                  {activeHoveredKelasItem.jenjang}
                                </span>
                                <span className="text-slate-800 dark:text-slate-200 truncate">
                                  {activeHoveredKelasItem.label}:
                                </span>
                                <span className="text-indigo-700 dark:text-indigo-400 font-mono font-black shrink-0">
                                  {activeHoveredKelasItem.jumlah} Anak ({activeHoveredKelasItem.persentase}%)
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate">Arahkan kursor pada batang untuk melihat rincian kelas</span>
                              </div>
                            )}
                            <span className="text-slate-400 font-mono text-[10px] shrink-0 hidden sm:inline ml-2">
                              Puncak: {maxKelasCount} Anak
                            </span>
                          </div>

                          {kelasViewMode === "15_kelas" ? (
                            /* 15 Kelas Bar Chart with Clean Proportional X-Axis */
                            <div className="space-y-2">
                              <div className="h-44 sm:h-48 w-full flex items-end justify-between gap-1 sm:gap-1.5 px-2 pt-4 pb-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl relative">
                                {kelasList.map((kItem) => {
                                  const heightPct =
                                    kItem.jumlah > 0
                                      ? Math.max(12, Math.round((kItem.jumlah / maxKelasCount) * 100))
                                      : 0;

                                  let barGradient = "from-blue-600 to-indigo-500";
                                  let textBadge = "text-blue-700 dark:text-blue-400";

                                  if (kItem.jenjang === "SD") {
                                    if (kItem.key === "sd6_ltm") {
                                      barGradient = "from-amber-500 to-yellow-400";
                                      textBadge = "text-amber-700 dark:text-amber-400";
                                    } else {
                                      barGradient = "from-emerald-500 to-teal-400";
                                      textBadge = "text-emerald-700 dark:text-emerald-400";
                                    }
                                  } else if (kItem.jenjang === "SMP") {
                                    if (kItem.key === "smp9_ltm") {
                                      barGradient = "from-orange-500 to-amber-400";
                                      textBadge = "text-orange-700 dark:text-orange-400";
                                    } else {
                                      barGradient = "from-sky-500 to-blue-400";
                                      textBadge = "text-sky-700 dark:text-sky-400";
                                    }
                                  } else if (kItem.jenjang === "SMA") {
                                    barGradient = "from-purple-500 to-pink-500";
                                    textBadge = "text-purple-700 dark:text-purple-400";
                                  }

                                  const cleanLabel =
                                    kItem.key === "bpb"
                                      ? "BPB"
                                      : kItem.key === "sd6_ltm"
                                      ? "6L"
                                      : kItem.key === "smp9_ltm"
                                      ? "9L"
                                      : kItem.shortLabel.replace(" DO", "");

                                  const isHovered = hoveredKelas === kItem.key;

                                  return (
                                    <div
                                      key={kItem.key}
                                      onMouseEnter={() => setHoveredKelas(kItem.key)}
                                      onMouseLeave={() => setHoveredKelas(null)}
                                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                                      title={`${kItem.label}: ${kItem.jumlah} Anak (${kItem.persentase}%)`}
                                    >
                                      {/* Value Count Label on Top of Bar */}
                                      <span
                                        className={cn(
                                          "text-[9px] sm:text-[10px] font-black font-mono mb-1 transition-all",
                                          kItem.jumlah > 0 ? textBadge : "text-transparent"
                                        )}
                                      >
                                        {kItem.jumlah > 0 ? kItem.jumlah : ""}
                                      </span>

                                      {/* Bar Column with Smooth Rounded Tops */}
                                      <div className="w-full max-w-[16px] sm:max-w-[20px] h-24 sm:h-28 flex items-end justify-center">
                                        <div
                                          className={cn(
                                            "w-full rounded-t-sm sm:rounded-t-md transition-all duration-500 shadow-2xs",
                                            isHovered ? "brightness-125 scale-x-110" : "group-hover:brightness-110",
                                            kItem.jumlah > 0
                                              ? `bg-gradient-to-t ${barGradient}`
                                              : "bg-slate-200 dark:bg-slate-700/50 h-1"
                                          )}
                                          style={{
                                            height: kItem.jumlah > 0 ? `${heightPct}%` : "3px",
                                          }}
                                        />
                                      </div>

                                      {/* Clean Horizontal X-Axis Label */}
                                      <div className="h-6 w-full flex items-center justify-center mt-1">
                                        <span
                                          className={cn(
                                            "text-[8.5px] sm:text-[9.5px] font-mono font-bold transition-colors select-none",
                                            isHovered
                                              ? "text-indigo-600 dark:text-indigo-400 font-black scale-110"
                                              : "text-slate-600 dark:text-slate-400"
                                          )}
                                        >
                                          {cleanLabel}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Subtle Jenjang Boundary Marker Under Bar Labels */}
                              <div className="flex items-center gap-1 px-2 text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-500">
                                <div className="w-[6.6%] text-center border-t-2 border-blue-400 pt-0.5 truncate">
                                  BPB
                                </div>
                                <div className="w-[46.6%] text-center border-t-2 border-emerald-400 pt-0.5 truncate text-emerald-700 dark:text-emerald-400">
                                  SD (Kelas 1–6)
                                </div>
                                <div className="w-[26.6%] text-center border-t-2 border-sky-400 pt-0.5 truncate text-sky-700 dark:text-sky-400">
                                  SMP (7–9)
                                </div>
                                <div className="w-[20.2%] text-center border-t-2 border-purple-400 pt-0.5 truncate text-purple-700 dark:text-purple-400">
                                  SMA (10–12)
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* 4 Jenjang Aggregate Horizontal Bars View */
                            <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
                              {[
                                { label: "Belum Pernah Bersekolah (BPB)", count: countBPB, pct: Math.round((countBPB / total) * 100), color: "bg-blue-600", badge: "BPB" },
                                { label: "SD / MI / Paket A (Kelas 1–6)", count: countSD, pct: Math.round((countSD / total) * 100), color: "bg-emerald-500", badge: "SD" },
                                { label: "SMP / MTs / Paket B (Kelas 7–9)", count: countSMP, pct: Math.round((countSMP / total) * 100), color: "bg-sky-500", badge: "SMP" },
                                { label: "SMA / SMK / MA / Paket C (Kelas 10–12)", count: countSMA, pct: Math.round((countSMA / total) * 100), color: "bg-purple-600", badge: "SMA" },
                              ].map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                      <span className={cn("h-2 w-2 rounded-full shrink-0", item.color)} />
                                      {item.label}
                                    </span>
                                    <span className="font-mono text-slate-900 dark:text-slate-100 font-black">
                                      {item.count} Anak ({item.pct}%)
                                    </span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={cn("h-full rounded-full transition-all duration-700", item.color)}
                                      style={{ width: `${Math.max(item.count > 0 ? 3 : 0, item.pct)}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 4 Bottom Summary Cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1">
                            <div className="p-2 sm:p-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-center transition-all hover:border-blue-300">
                              <span className="text-[10px] font-extrabold text-blue-800 dark:text-blue-300 uppercase block truncate">
                                Belum Sekolah
                              </span>
                              <div className="text-xs sm:text-sm font-black font-mono text-blue-700 dark:text-blue-400 mt-0.5">
                                {countBPB} <span className="text-[10px] font-sans font-semibold text-slate-500">Anak</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                ({Math.round((countBPB / total) * 100)}%)
                              </span>
                            </div>

                            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center transition-all hover:border-emerald-300">
                              <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase block truncate">
                                SD / MI (1–6)
                              </span>
                              <div className="text-xs sm:text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {countSD} <span className="text-[10px] font-sans font-semibold text-slate-500">Anak</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                ({Math.round((countSD / total) * 100)}%)
                              </span>
                            </div>

                            <div className="p-2 sm:p-2.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-center transition-all hover:border-sky-300">
                              <span className="text-[10px] font-extrabold text-sky-800 dark:text-sky-300 uppercase block truncate">
                                SMP / MTs (7–9)
                              </span>
                              <div className="text-xs sm:text-sm font-black font-mono text-sky-700 dark:text-sky-400 mt-0.5">
                                {countSMP} <span className="text-[10px] font-sans font-semibold text-slate-500">Anak</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                ({Math.round((countSMP / total) * 100)}%)
                              </span>
                            </div>

                            <div className="p-2 sm:p-2.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-center transition-all hover:border-purple-300">
                              <span className="text-[10px] font-extrabold text-purple-800 dark:text-purple-300 uppercase block truncate">
                                SMA / SMK (10–12)
                              </span>
                              <div className="text-xs sm:text-sm font-black font-mono text-purple-700 dark:text-purple-400 mt-0.5">
                                {countSMA} <span className="text-[10px] font-sans font-semibold text-slate-500">Anak</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                ({Math.round((countSMA / total) * 100)}%)
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* 6.2 Diagram Batang: Distribusi Usia ATS (6 - 18 Tahun) */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm print-card-item break-inside-avoid print:p-4 print:rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                      <BarChart3 className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                        Distribusi Usia ATS (6 – 18 Tahun)
                      </h3>
                      <p className="text-2xs sm:text-xs text-muted-foreground font-medium truncate">
                        Jumlah anak tidak sekolah pada kelompok umur wajib belajar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xs sm:text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono">
                      13 Kelompok Usia
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleChart("usia")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-foreground text-2xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-muted print:hidden"
                      title={hiddenCharts.usia ? "Tampilkan Grafik" : "Sembunyikan Grafik"}
                    >
                      {hiddenCharts.usia ? (
                        <>
                          <Eye className="h-3 w-3 text-primary" />
                          <span>Tampilkan</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                          <span>Sembunyikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {hiddenCharts.usia ? (
                  <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 mt-4">
                    <EyeOff className="h-4 w-4 text-slate-400" />
                    <span>Grafik usia ATS disembunyikan.</span>
                    <button
                      type="button"
                      onClick={() => toggleChart("usia")}
                      className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Tampilkan kembali
                    </button>
                  </div>
                ) : (
                  <div className="pt-3.5 space-y-3.5">
                    {(() => {
                      const ageList = currentWilayahData.usiaPerTahun || [];
                      const maxAgeCount = Math.max(...ageList.map((u) => u.jumlah), 1);
                      const total = currentWilayahData.totalAts || 1;

                      return (
                        <>
                          {/* Dynamic Active Hover Banner */}
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-2xs min-h-[34px]">
                            {activeHoveredUsiaItem ? (
                              <div className="flex items-center gap-2 font-bold truncate">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase shrink-0",
                                  activeHoveredUsiaItem.usia <= 12
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                    : activeHoveredUsiaItem.usia <= 15
                                    ? "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                                )}>
                                  {activeHoveredUsiaItem.usia <= 12 ? "SD" : activeHoveredUsiaItem.usia <= 15 ? "SMP" : "SMA"}
                                </span>
                                <span className="text-slate-800 dark:text-slate-200">
                                  Usia {activeHoveredUsiaItem.usia} Tahun:
                                </span>
                                <span className="text-sky-700 dark:text-sky-400 font-mono font-black shrink-0">
                                  {activeHoveredUsiaItem.jumlah} Anak ({activeHoveredUsiaItem.persentase}%)
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                                <Sparkles className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                                <span className="truncate">Arahkan kursor pada batang untuk melihat rincian usia</span>
                              </div>
                            )}
                            <span className="text-slate-400 font-mono text-[10px] shrink-0 hidden sm:inline ml-2">
                              Puncak: {maxAgeCount} Anak
                            </span>
                          </div>

                          {/* 13 Kelompok Usia Bar Chart */}
                          <div className="space-y-2">
                            <div className="h-44 sm:h-48 w-full flex items-end justify-between gap-1 sm:gap-1.5 px-2 pt-4 pb-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl relative">
                              {ageList.map((uItem) => {
                                const heightPct =
                                  uItem.jumlah > 0
                                    ? Math.max(12, Math.round((uItem.jumlah / maxAgeCount) * 100))
                                    : 0;

                                let barGradient = "from-emerald-500 to-teal-400";
                                let textBadge = "text-emerald-700 dark:text-emerald-400";
                                if (uItem.usia >= 13 && uItem.usia <= 15) {
                                  barGradient = "from-sky-500 to-blue-400";
                                  textBadge = "text-sky-700 dark:text-sky-400";
                                } else if (uItem.usia >= 16) {
                                  barGradient = "from-amber-500 to-orange-400";
                                  textBadge = "text-amber-700 dark:text-amber-400";
                                }

                                const isHovered = hoveredUsia === uItem.usia;

                                return (
                                  <div
                                    key={uItem.usia}
                                    onMouseEnter={() => setHoveredUsia(uItem.usia)}
                                    onMouseLeave={() => setHoveredUsia(null)}
                                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                                    title={`Usia ${uItem.usia} Tahun: ${uItem.jumlah} Anak (${uItem.persentase}%)`}
                                  >
                                    {/* Value Count Label on Top of Bar */}
                                    <span
                                      className={cn(
                                        "text-[9px] sm:text-[10px] font-black font-mono mb-1 transition-all",
                                        uItem.jumlah > 0 ? textBadge : "text-transparent"
                                      )}
                                    >
                                      {uItem.jumlah > 0 ? uItem.jumlah : ""}
                                    </span>

                                    {/* Bar Column */}
                                    <div className="w-full max-w-[20px] sm:max-w-[24px] h-24 sm:h-28 flex items-end justify-center">
                                      <div
                                        className={cn(
                                          "w-full rounded-t-sm sm:rounded-t-md transition-all duration-500 shadow-2xs",
                                          isHovered ? "brightness-125 scale-x-110" : "group-hover:brightness-110",
                                          uItem.jumlah > 0
                                            ? `bg-gradient-to-t ${barGradient}`
                                            : "bg-slate-200 dark:bg-slate-700/50 h-1"
                                        )}
                                        style={{
                                          height: uItem.jumlah > 0 ? `${heightPct}%` : "3px",
                                        }}
                                      />
                                    </div>

                                    {/* Age X-Axis Label */}
                                    <div className="h-6 w-full flex items-center justify-center mt-1">
                                      <span
                                        className={cn(
                                          "text-[9px] sm:text-[10px] font-mono font-bold transition-colors select-none",
                                          isHovered
                                            ? "text-sky-600 dark:text-sky-400 font-black scale-110"
                                            : "text-slate-600 dark:text-slate-400"
                                        )}
                                      >
                                        {uItem.usia}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Subtle Age Boundary Marker Under Bar Labels */}
                            <div className="flex items-center gap-1 px-2 text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-500">
                              <div className="w-[53.8%] text-center border-t-2 border-emerald-400 pt-0.5 truncate text-emerald-700 dark:text-emerald-400">
                                SD (6–12 Thn)
                              </div>
                              <div className="w-[23.1%] text-center border-t-2 border-sky-400 pt-0.5 truncate text-sky-700 dark:text-sky-400">
                                SMP (13–15)
                              </div>
                              <div className="w-[23.1%] text-center border-t-2 border-amber-400 pt-0.5 truncate text-amber-700 dark:text-amber-400">
                                SMA (16–18)
                              </div>
                            </div>
                          </div>

                          {/* 3 Bottom Summary Cards */}
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center transition-all hover:border-emerald-300">
                              <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase block truncate">
                                SD (6–12 Thn)
                              </span>
                              <div className="text-xs sm:text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {currentWilayahData.usia.age7_12} <span className="text-[10px] font-sans font-semibold text-slate-500">Anak</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                ({Math.round((currentWilayahData.usia.age7_12 / total) * 100)}%)
                              </span>
                            </div>

                            <div className="p-2 sm:p-2.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-center transition-all hover:border-sky-300">
                              <span className="text-[10px] font-extrabold text-sky-800 dark:text-sky-300 uppercase block truncate">
                                SMP (13–15 Thn)
                              </span>
                              <div className="text-xs sm:text-sm font-black font-mono text-sky-700 dark:text-sky-400 mt-0.5">
                                {currentWilayahData.usia.age12_15} <span className="text-[10px] font-sans font-semibold text-slate-500">Anak</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                ({Math.round((currentWilayahData.usia.age12_15 / total) * 100)}%)
                              </span>
                            </div>

                            <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-center transition-all hover:border-amber-300">
                              <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase block truncate">
                                SMA (16–18 Thn)
                              </span>
                              <div className="text-xs sm:text-sm font-black font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                                {currentWilayahData.usia.age15_18} <span className="text-[10px] font-sans font-semibold text-slate-500">Anak</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                ({Math.round((currentWilayahData.usia.age15_18 / total) * 100)}%)
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6.3 Diagram Batang Faktor Penyebab & Alasan Tidak Sekolah (Urutan Terbanyak s/d Tersedikit) */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm print-card-item break-inside-avoid print:p-4 print:rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertCircle className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                    Alasan &amp; Faktor Menjadi ATS
                  </h3>
                  <p className="text-2xs sm:text-xs text-muted-foreground font-medium truncate">
                    Peringkat faktor penyebab anak tidak bersekolah (terbanyak ke tersedikit)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="text-2xs sm:text-xs font-bold px-2.5 py-1 rounded-lg bg-secondary/15 text-amber-900 dark:text-amber-200 border border-secondary/30 font-mono">
                  Ranking Kasus
                </span>
                <button
                  type="button"
                  onClick={() => toggleChart("alasan")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-foreground text-2xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-muted print:hidden"
                  title={hiddenCharts.alasan ? "Tampilkan Grafik" : "Sembunyikan Grafik"}
                >
                  {hiddenCharts.alasan ? (
                    <>
                      <Eye className="h-3 w-3 text-secondary" />
                      <span>Tampilkan</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                      <span>Sembunyikan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {hiddenCharts.alasan ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2">
                <EyeOff className="h-4 w-4 text-slate-400" />
                <span>Grafik alasan menjadi ATS disembunyikan.</span>
                <button
                  type="button"
                  onClick={() => toggleChart("alasan")}
                  className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Tampilkan kembali
                </button>
              </div>
            ) : (
              <>
                {(() => {
                  const sortedReasons = [...(currentWilayahData.alasanList || [])].sort(
                    (a, b) => b.jumlah - a.jumlah
                  );
                  const maxReasonCount = Math.max(...sortedReasons.map((r) => r.jumlah), 1);
                  const reasonsWithCount = sortedReasons.filter((r) => r.jumlah > 0);
                  const zeroReasons = sortedReasons.filter((r) => r.jumlah === 0);
                  const displayedReasons = showAllReasons ? sortedReasons : (reasonsWithCount.length > 0 ? reasonsWithCount : sortedReasons.slice(0, 5));

                  if (currentWilayahData.totalAts === 0) {
                    return (
                      <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Tidak ada data ATS pada cakupan wilayah ini.
                        </p>
                        <p className="text-2xs text-slate-500 mt-1">
                          Semua anak usia sekolah tercatat aktif bersekolah.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 pt-1">
                      {/* Top 3 Spotlight Podium Cards */}
                      {reasonsWithCount.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {reasonsWithCount.slice(0, 3).map((topR, topIdx) => {
                            const isFirst = topIdx === 0;
                            const isSecond = topIdx === 1;
                            return (
                              <div
                                key={topIdx}
                                className={cn(
                                  "p-3 sm:p-3.5 rounded-2xl border transition-all relative overflow-hidden",
                                  isFirst
                                    ? "bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-300 dark:border-amber-700 shadow-xs"
                                    : isSecond
                                    ? "bg-slate-50/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                                    : "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/60"
                                )}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase",
                                      isFirst
                                        ? "bg-amber-500 text-white shadow-2xs"
                                        : isSecond
                                        ? "bg-slate-400 text-white"
                                        : "bg-orange-700 text-white"
                                    )}
                                  >
                                    <Award className="h-3 w-3" />
                                    <span>#{topIdx + 1} Utama</span>
                                  </span>
                                  <span className="font-mono text-2xs font-bold text-slate-600 dark:text-slate-400">
                                    {topR.persentase}%
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug min-h-[32px]">
                                  {topR.alasan}
                                </h4>
                                <div className="flex items-baseline gap-1 mt-2 font-mono">
                                  <span
                                    className={cn(
                                      "text-lg font-black",
                                      isFirst
                                        ? "text-amber-800 dark:text-amber-300"
                                        : "text-slate-900 dark:text-slate-100"
                                    )}
                                  >
                                    {topR.jumlah}
                                  </span>
                                  <span className="text-2xs font-semibold text-slate-500 font-sans">
                                    Anak
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Full List of Reasons with Proportional Gradient Bars */}
                      <div className="space-y-2 pt-1">
                        {displayedReasons.map((r, idx) => {
                          const isTop1 = idx === 0 && r.jumlah > 0;
                          const isTop2 = idx === 1 && r.jumlah > 0;
                          const isTop3 = idx === 2 && r.jumlah > 0;
                          const barWidthPct =
                            r.jumlah > 0
                              ? Math.max(4, Math.round((r.jumlah / maxReasonCount) * 100))
                              : 0;
                          const isHovered = hoveredReason === r.alasan;

                          return (
                            <div
                              key={idx}
                              onMouseEnter={() => setHoveredReason(r.alasan)}
                              onMouseLeave={() => setHoveredReason(null)}
                              className={cn(
                                "p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                                isHovered
                                  ? "bg-slate-100/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 shadow-xs"
                                  : isTop1
                                  ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50"
                                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              )}
                            >
                              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={cn(
                                      "flex items-center justify-center h-5 w-5 rounded-md text-2xs font-black shrink-0 font-mono",
                                      isTop1
                                        ? "bg-amber-500 text-white shadow-2xs"
                                        : isTop2
                                        ? "bg-slate-400 text-white"
                                        : isTop3
                                        ? "bg-orange-600 text-white"
                                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                    )}
                                  >
                                    #{idx + 1}
                                  </span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold truncate">
                                    {r.alasan}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-slate-900 dark:text-slate-100 font-black text-xs sm:text-sm">
                                    {r.jumlah} <span className="text-2xs font-sans font-semibold text-slate-500">Anak</span>
                                  </span>
                                  <span
                                    className={cn(
                                      "text-2xs font-bold px-2 py-0.5 rounded-lg font-mono",
                                      isTop1
                                        ? "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200"
                                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    )}
                                  >
                                    {r.persentase}%
                                  </span>
                                </div>
                              </div>

                              {/* Diagram Batang Horizontal */}
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    isTop1
                                      ? "bg-gradient-to-r from-amber-500 to-rose-500"
                                      : isTop2 || isTop3
                                      ? "bg-gradient-to-r from-rose-500 to-amber-500"
                                      : "bg-gradient-to-r from-indigo-500 to-slate-400"
                                  )}
                                  style={{ width: `${barWidthPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Collapsible toggle for 0-case reasons */}
                      {zeroReasons.length > 0 && reasonsWithCount.length > 0 && (
                        <div className="pt-1 text-center">
                          <button
                            type="button"
                            onClick={() => setShowAllReasons((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-2xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                          >
                            <span>
                              {showAllReasons
                                ? "Sembunyikan faktor tanpa kasus (0 kasus)"
                                : `Tampilkan ${zeroReasons.length} faktor lainnya (0 kasus)`}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/* 8. TABEL KOMPARATIF BERJENJANG (27 KELURAHAN SE-KOTA TEGAL)*/}
      {/* ========================================================= */}
      {(activeTabSection === "semua" || activeTabSection === "tabel") && (
        <div className="space-y-4 pt-4 print-hide-on-daftar-nama">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print-section-header break-after-avoid">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs shrink-0">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-foreground truncate">
                  Tabel Rekapitulasi Berjenjang ATS per Kelurahan
                </h2>
                <p className="text-xs text-muted-foreground font-medium truncate">
                  Rincian komparatif jumlah ATS, kategori DO/LTM/BPB, dan kesiapan sekolah kembali se-Kota Tegal
                </p>
              </div>
            </div>

            {/* Table Search Input & Sort Badge */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {sortColumn !== "default" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-2xs animate-in fade-in">
                  <span>
                    Urutan: <strong>{TABLE_ATS_SORT_LABELS[sortColumn]}</strong> (
                    {sortDirection === "desc"
                      ? sortColumn === "nama" || sortColumn === "kecamatan"
                        ? "Z ke A"
                        : "Tertinggi ke Terendah ↓"
                      : sortColumn === "nama" || sortColumn === "kecamatan"
                      ? "A ke Z"
                      : "Terendah ke Tertinggi ↑"}
                    )
                  </span>
                  <button
                    type="button"
                    onClick={handleResetSort}
                    className="ml-1 px-1.5 py-0.5 rounded-md bg-primary/20 hover:bg-primary/30 text-primary cursor-pointer transition-colors text-2xs"
                    title="Reset urutan ke nomor asli"
                  >
                    ✕ Reset
                  </button>
                </div>
              )}

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Cari Kelurahan / Kecamatan..."
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-8 py-1.5 text-xs font-semibold text-foreground focus:outline-hidden focus:border-primary shadow-2xs"
                />
                {tableSearch && (
                  <button
                    type="button"
                    onClick={() => setTableSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                    title="Hapus pencarian"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Priority Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-2xs font-bold print:hidden">
            <span className="text-muted-foreground uppercase flex items-center gap-1 shrink-0 font-bold">
              <Filter className="h-3 w-3" />
              <span>Prioritas:</span>
            </span>
            <button
              type="button"
              onClick={() => setTablePriorityFilter("semua")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 border",
                tablePriorityFilter === "semua"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-card text-foreground border-border hover:bg-muted"
              )}
            >
              Semua ({priorityCounts.total})
            </button>
            <button
              type="button"
              onClick={() => setTablePriorityFilter("tinggi")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 border",
                tablePriorityFilter === "tinggi"
                  ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100"
              )}
            >
              Tinggi (≥25): {priorityCounts.tinggi}
            </button>
            <button
              type="button"
              onClick={() => setTablePriorityFilter("sedang")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 border",
                tablePriorityFilter === "sedang"
                  ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
              )}
            >
              Sedang (15–24): {priorityCounts.sedang}
            </button>
            <button
              type="button"
              onClick={() => setTablePriorityFilter("terkendali")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 border",
                tablePriorityFilter === "terkendali"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              )}
            >
              Terkendali (&lt;15): {priorityCounts.terkendali}
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm print-card-item print:rounded-lg">
            <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xs shadow-2xs">
                  <tr className="border-b border-border text-foreground font-bold">
                    <th
                      scope="col"
                      onClick={handleResetSort}
                      className={cn(
                        "py-2.5 px-2 select-none cursor-pointer transition-colors group",
                        sortColumn === "default"
                          ? "hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                          : "hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                      )}
                      title={sortColumn === "default" ? "Nomor Urut Default" : "Klik untuk reset ke nomor urut asli"}
                    >
                      <div className="inline-flex items-center gap-1 justify-center w-full">
                        <span>No</span>
                        {sortColumn !== "default" ? (
                          <RotateCcw className="h-3 w-3 text-rose-500" />
                        ) : (
                          <span className="opacity-0 group-hover:opacity-40 text-2xs">#</span>
                        )}
                      </div>
                    </th>
                    {renderSortTh("nama", "Kelurahan", "left", "px-2.5")}
                    {renderSortTh("kecamatan", "Kecamatan", "left", "px-2")}
                    {renderSortTh("totalAts", "Total", "center", "px-2")}
                    {renderSortTh("putusSekolah", "DO", "center", "px-1 sm:px-1.5")}
                    {renderSortTh("lulusTidakLanjut", "LTM", "center", "px-1 sm:px-1.5")}
                    {renderSortTh("belumPernahSekolah", "BPB", "center", "px-1 sm:px-1.5")}
                    {renderSortTh("keinginan", "Ingin Kembali", "center", "px-2")}
                    {renderSortTh("lakiLaki", "L", "center", "px-1")}
                    {renderSortTh("perempuan", "P", "center", "px-1")}
                    {renderSortTh("prioritas", "Prioritas", "center", "px-2")}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredTableRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        Tidak ada kelurahan yang cocok dengan filter pencarian &amp; prioritas.
                      </td>
                    </tr>
                  ) : (
                    filteredTableRows.map((kel, idx) => {
                      const isSelected = selectedKelurahan === kel.nama && selectedTingkat === "kelurahan";
                      return (
                        <tr
                          key={kel.nama}
                          onClick={() => {
                            setSelectedTingkat("kelurahan");
                            if (kel.kecamatan) setSelectedKecamatan(kel.kecamatan);
                            setSelectedKelurahan(kel.nama);
                          }}
                          className={cn(
                            "transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
                            isSelected
                              ? "bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-l-blue-600 font-bold"
                              : ""
                          )}
                          title={`Klik untuk memfokuskan grafik ke Kelurahan ${kel.nama}`}
                        >
                          <td className="py-2.5 px-2 text-center font-mono text-2xs sm:text-xs text-slate-500">{idx + 1}</td>
                          <td className={cn("py-2.5 px-2.5 text-2xs sm:text-xs", sortColumn === "nama" && "bg-blue-50/40 dark:bg-blue-950/20")}>
                            <strong className="text-slate-900 dark:text-slate-100">{kel.nama}</strong>
                          </td>
                          <td className={cn("py-2.5 px-2 text-2xs sm:text-xs text-slate-600 dark:text-slate-400", sortColumn === "kecamatan" && "bg-blue-50/40 dark:bg-blue-950/20 font-bold")}>
                            {kel.kecamatan}
                          </td>
                          <td className={cn("py-2.5 px-2 text-center font-mono font-bold text-slate-900 dark:text-slate-100 text-2xs sm:text-xs", sortColumn === "totalAts" && "bg-blue-50/60 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100 font-black")}>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                              {kel.totalAts}
                            </span>
                          </td>
                          <td className={cn("py-2.5 px-1 sm:px-1.5 text-center font-mono text-rose-600 font-bold text-2xs sm:text-xs", sortColumn === "putusSekolah" && "bg-rose-50/60 dark:bg-rose-950/30 font-black ring-1 ring-inset ring-rose-300")}>
                            {kel.kategori.putusSekolah}
                          </td>
                          <td className={cn("py-2.5 px-1 sm:px-1.5 text-center font-mono text-amber-600 font-bold text-2xs sm:text-xs", sortColumn === "lulusTidakLanjut" && "bg-amber-50/60 dark:bg-amber-950/30 font-black ring-1 ring-inset ring-amber-300")}>
                            {kel.kategori.lulusTidakLanjut}
                          </td>
                          <td className={cn("py-2.5 px-1 sm:px-1.5 text-center font-mono text-blue-600 font-bold text-2xs sm:text-xs", sortColumn === "belumPernahSekolah" && "bg-blue-50/60 dark:bg-blue-950/30 font-black ring-1 ring-inset ring-blue-300")}>
                            {kel.kategori.belumPernahSekolah}
                          </td>
                          <td className={cn("py-2.5 px-2 text-center", sortColumn === "keinginan" && "bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-inset ring-emerald-300")}>
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-2xs sm:text-xs">
                              <span>{kel.keinginan.masihAda}</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-sans">
                                ({kel.persenInginSekolah}%)
                              </span>
                            </span>
                          </td>
                          <td className={cn("py-2.5 px-1 text-center font-mono text-sky-700 dark:text-sky-300 text-2xs sm:text-xs", sortColumn === "lakiLaki" && "bg-sky-50/60 dark:bg-sky-950/30 font-bold")}>
                            {kel.gender.lakiLaki}
                          </td>
                          <td className={cn("py-2.5 px-1 text-center font-mono text-rose-700 dark:text-rose-300 text-2xs sm:text-xs", sortColumn === "perempuan" && "bg-rose-50/60 dark:bg-rose-950/30 font-bold")}>
                            {kel.gender.perempuan}
                          </td>
                          <td className={cn("py-2.5 px-2 text-center", sortColumn === "prioritas" && "bg-blue-50/60 dark:bg-blue-950/30")}>
                            <span
                              className={cn(
                                "inline-block px-2 py-0.5 rounded-full font-black text-[10px] font-mono uppercase border",
                                kel.totalAts === 0
                                  ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                  : kel.totalAts >= 25
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                                  : kel.totalAts >= 15
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              )}
                            >
                              {kel.totalAts === 0 ? "0 ATS" : kel.totalAts >= 25 ? "Tinggi" : kel.totalAts >= 15 ? "Sedang" : "Terkendali"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-medium">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Menampilkan <strong>{filteredTableRows.length}</strong> dari {initialData.kelurahanList.length} kelurahan
                </span>
                {tablePriorityFilter !== "semua" && (
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    • Filter Prioritas: {tablePriorityFilter.toUpperCase()}
                  </span>
                )}
                {sortColumn !== "default" && (
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    • Diurutkan: {TABLE_ATS_SORT_LABELS[sortColumn]} (
                    {sortDirection === "desc"
                      ? sortColumn === "nama" || sortColumn === "kecamatan"
                        ? "Z-A"
                        : "Tertinggi ↓"
                      : sortColumn === "nama" || sortColumn === "kecamatan"
                      ? "A-Z"
                      : "Terendah ↑"}
                    )
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {(sortColumn !== "default" || tablePriorityFilter !== "semua" || tableSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleResetSort();
                      setTablePriorityFilter("semua");
                      setTableSearch("");
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Reset Semua Filter &amp; Urutan
                  </button>
                )}
                <span className="hidden sm:inline">Klik baris kelurahan untuk memfokuskan grafik.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8.5 KARTU DAFTAR ANAK TIDAK SEKOLAH (ATS)                 */}
      {/* ========================================================= */}
      <KartuDaftarNamaAtsRekap
        tingkat={selectedTingkat}
        selectedKecamatan={selectedKecamatan}
        selectedKelurahan={selectedKelurahan}
        currentWilayahNama={
          selectedTingkat === "kota"
            ? "Seluruh Kota Tegal"
            : selectedTingkat === "kecamatan"
            ? `Kec. ${selectedKecamatan}`
            : `Kel. ${selectedKelurahan}`
        }
        totalAts={currentWilayahData.totalAts}
        canAccess={canAccessDaftarNamaAts}
        userPeran={userPeran}
      />

      {/* ========================================================= */}
      {/* 9. FOOTER CALL-TO-ACTION & LINK TO ATS / PKBM             */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-lg bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 border border-teal-800/40 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 print:hidden print-hide-on-daftar-nama relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1.5 text-center sm:text-left relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/20 border border-secondary/40 text-[10px] font-mono font-bold text-amber-200 uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Kolaborasi Pengentasan ATS</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white">
            Kader RT/RW Menemukan Anak Putus Sekolah di Lingkungan Anda?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Daftarkan dan validasi data ATS langsung di Komunitas Warga Kita tingkat RT/RW untuk segera difasilitasi intervensi oleh Dinas Pendidikan dan PKBM/SKB se-Kota Tegal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <Link
            href="/komunitas?tab=warga_kita"
            className="px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-secondary-foreground text-xs font-bold transition-all shadow-xs active:scale-98"
          >
            Input ATS di Warga Kita
          </Link>
          <Link
            href="/komunitas?tab=satuan_paud"
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all backdrop-blur-md active:scale-98"
          >
            Lembaga PKBM / SKB
          </Link>
        </div>
      </div>
    </div>
  );
}
