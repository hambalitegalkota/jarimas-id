"use client";

import React, { useState, useId } from "react";
import {
  TrendingUp,
  GraduationCap,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Flag,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DailyProgressPoint {
  date: string;
  dayLabel: string;
  type: "aktual" | "proyeksi";
  siswaHarian: number;
  siswaKumulatif: number;
  siswaPersen: number;
  paudTuntasHarian: number;
  paudTuntasKumulatif: number;
  milestone?: string;
}

export const TIMELINE_PROGRESS_DATA: DailyProgressPoint[] = [
  {
    date: "2026-10-25",
    dayLabel: "25 Okt",
    type: "aktual",
    siswaHarian: 0,
    siswaKumulatif: 0,
    siswaPersen: 0.0,
    paudTuntasHarian: 0,
    paudTuntasKumulatif: 0,
    milestone: "Hari Pertama Peluncuran Cek Progres",
  },
  {
    date: "2026-10-26",
    dayLabel: "26 Okt",
    type: "aktual",
    siswaHarian: 624,
    siswaKumulatif: 624,
    siswaPersen: 7.9,
    paudTuntasHarian: 6,
    paudTuntasKumulatif: 6,
  },
  {
    date: "2026-10-27",
    dayLabel: "27 Okt",
    type: "aktual",
    siswaHarian: 246,
    siswaKumulatif: 870,
    siswaPersen: 11.0,
    paudTuntasHarian: 4,
    paudTuntasKumulatif: 10,
  },
  {
    date: "2026-10-28",
    dayLabel: "28 Okt",
    type: "aktual",
    siswaHarian: 971,
    siswaKumulatif: 1841,
    siswaPersen: 23.3,
    paudTuntasHarian: 22,
    paudTuntasKumulatif: 32,
    milestone: "Lonjakan Awal Terbesar (+971 Siswa)",
  },
  {
    date: "2026-10-29",
    dayLabel: "29 Okt",
    type: "aktual",
    siswaHarian: 644,
    siswaKumulatif: 2485,
    siswaPersen: 31.5,
    paudTuntasHarian: 13,
    paudTuntasKumulatif: 45,
  },
  {
    date: "2026-10-30",
    dayLabel: "30 Okt",
    type: "aktual",
    siswaHarian: 483,
    siswaKumulatif: 2968,
    siswaPersen: 37.6,
    paudTuntasHarian: 8,
    paudTuntasKumulatif: 53,
  },
  {
    date: "2026-10-31",
    dayLabel: "31 Okt",
    type: "aktual",
    siswaHarian: 147,
    siswaKumulatif: 3115,
    siswaPersen: 39.5,
    paudTuntasHarian: 5,
    paudTuntasKumulatif: 58,
  },
  {
    date: "2026-11-01",
    dayLabel: "01 Nov",
    type: "aktual",
    siswaHarian: 88,
    siswaKumulatif: 3203,
    siswaPersen: 40.6,
    paudTuntasHarian: 2,
    paudTuntasKumulatif: 60,
  },
  {
    date: "2026-11-02",
    dayLabel: "02 Nov",
    type: "aktual",
    siswaHarian: 509,
    siswaKumulatif: 3712,
    siswaPersen: 47.1,
    paudTuntasHarian: 11,
    paudTuntasKumulatif: 71,
  },
  {
    date: "2026-11-03",
    dayLabel: "03 Nov",
    type: "aktual",
    siswaHarian: 500,
    siswaKumulatif: 4212,
    siswaPersen: 53.4,
    paudTuntasHarian: 4,
    paudTuntasKumulatif: 75,
    milestone: "Menembus 50% Sasaran Kota",
  },
  {
    date: "2026-11-04",
    dayLabel: "04 Nov",
    type: "aktual",
    siswaHarian: 760,
    siswaKumulatif: 4972,
    siswaPersen: 63.0,
    paudTuntasHarian: 18,
    paudTuntasKumulatif: 93,
    milestone: "Akselerasi Verifikasi Masif (+760 Siswa)",
  },
  {
    date: "2026-11-05",
    dayLabel: "05 Nov",
    type: "aktual",
    siswaHarian: 308,
    siswaKumulatif: 5280,
    siswaPersen: 66.9,
    paudTuntasHarian: 6,
    paudTuntasKumulatif: 99,
  },
  {
    date: "2026-11-06",
    dayLabel: "06 Nov",
    type: "aktual",
    siswaHarian: 256,
    siswaKumulatif: 5536,
    siswaPersen: 70.2,
    paudTuntasHarian: 5,
    paudTuntasKumulatif: 104,
    milestone: "Menembus 70% & 100 PAUD Tuntas",
  },
  {
    date: "2026-11-07",
    dayLabel: "07 Nov",
    type: "aktual",
    siswaHarian: 207,
    siswaKumulatif: 5743,
    siswaPersen: 72.8,
    paudTuntasHarian: 2,
    paudTuntasKumulatif: 106,
  },
  {
    date: "2026-11-08",
    dayLabel: "08 Nov",
    type: "aktual",
    siswaHarian: 157,
    siswaKumulatif: 5900,
    siswaPersen: 74.8,
    paudTuntasHarian: 2,
    paudTuntasKumulatif: 108,
  },
  {
    date: "2026-11-09",
    dayLabel: "09 Nov",
    type: "aktual",
    siswaHarian: 170,
    siswaKumulatif: 6070,
    siswaPersen: 77.0,
    paudTuntasHarian: 3,
    paudTuntasKumulatif: 111,
  },
  {
    date: "2026-11-10",
    dayLabel: "10 Nov",
    type: "aktual",
    siswaHarian: 97,
    siswaKumulatif: 6167,
    siswaPersen: 78.2,
    paudTuntasHarian: 3,
    paudTuntasKumulatif: 114,
  },
  {
    date: "2026-11-11",
    dayLabel: "11 Nov",
    type: "aktual",
    siswaHarian: 246,
    siswaKumulatif: 6413,
    siswaPersen: 81.3,
    paudTuntasHarian: 6,
    paudTuntasKumulatif: 120,
    milestone: "Menembus 80% Sasaran Kota",
  },
  {
    date: "2026-11-12",
    dayLabel: "12 Nov",
    type: "aktual",
    siswaHarian: 236,
    siswaKumulatif: 6649,
    siswaPersen: 84.2,
    paudTuntasHarian: 29,
    paudTuntasKumulatif: 149,
    milestone: "Posisi Saat Ini: 84.2% (149 PAUD Tuntas)",
  },
  {
    date: "2026-11-13",
    dayLabel: "13 Nov",
    type: "proyeksi",
    siswaHarian: 310,
    siswaKumulatif: 6959,
    siswaPersen: 88.1,
    paudTuntasHarian: 16,
    paudTuntasKumulatif: 165,
  },
  {
    date: "2026-11-14",
    dayLabel: "14 Nov",
    type: "proyeksi",
    siswaHarian: 330,
    siswaKumulatif: 7289,
    siswaPersen: 92.3,
    paudTuntasHarian: 15,
    paudTuntasKumulatif: 180,
    milestone: "Menembus 90% Sasaran Kota",
  },
  {
    date: "2026-11-15",
    dayLabel: "15 Nov",
    type: "proyeksi",
    siswaHarian: 310,
    siswaKumulatif: 7599,
    siswaPersen: 96.2,
    paudTuntasHarian: 14,
    paudTuntasKumulatif: 194,
  },
  {
    date: "2026-11-16",
    dayLabel: "16 Nov",
    type: "proyeksi",
    siswaHarian: 296,
    siswaKumulatif: 7895,
    siswaPersen: 100.0,
    paudTuntasHarian: 11,
    paudTuntasKumulatif: 205,
    milestone: "Target 100% Tuntas Lengkap Seluruh Murid",
  },
];

interface ProgresTimelineChartProps {
  totalSasaranSiswa?: number;
  totalSatuanPaud?: number;
}

export function ProgresTimelineChart({
  totalSasaranSiswa = 7895,
  totalSatuanPaud = 209,
}: ProgresTimelineChartProps) {
  const [metricMode, setMetricMode] = useState<"siswa" | "paud">("siswa");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(18); // Default highlight: 12 Nov (Hari Ini)
  const gradId = useId();

  const data = TIMELINE_PROGRESS_DATA;
  const maxSiswa = totalSasaranSiswa;
  const maxPaud = 205; // 205 PAUD bersasaran murid (4 PAUD kosong)

  // SVG Dimension Constants
  const svgWidth = 860;
  const svgHeight = 240;
  const padLeft = 46;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 34;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Coordinate Mapping
  const getX = (idx: number) => padLeft + (idx / (data.length - 1)) * chartW;
  const getY = (val: number, maxVal: number) =>
    padTop + chartH - (Math.min(val, maxVal) / maxVal) * chartH;

  // Split into actual (idx 0..18) and projected (idx 18..22)
  const actualData = data.filter((d) => d.type === "aktual");
  const actualLastIdx = actualData.length - 1; // 18 (12 Nov)

  // Build SVG Paths for Siswa
  const siswaPoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.siswaKumulatif, maxSiswa),
  }));

  const siswaActualPoints = siswaPoints.slice(0, actualLastIdx + 1);
  const siswaProjectedPoints = siswaPoints.slice(actualLastIdx);

  const makeLinePath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => (i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(" ");

  const makeAreaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    const line = makeLinePath(pts);
    const firstX = pts[0].x.toFixed(1);
    const lastX = pts[pts.length - 1].x.toFixed(1);
    const baseY = (padTop + chartH).toFixed(1);
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  // Build SVG Paths for PAUD
  const paudPoints = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.paudTuntasKumulatif, maxPaud),
  }));
  const paudActualPoints = paudPoints.slice(0, actualLastIdx + 1);
  const paudProjectedPoints = paudPoints.slice(actualLastIdx);

  const activePoints = metricMode === "siswa" ? siswaPoints : paudPoints;
  const activeActualPoints = metricMode === "siswa" ? siswaActualPoints : paudActualPoints;
  const activeProjectedPoints = metricMode === "siswa" ? siswaProjectedPoints : paudProjectedPoints;

  const currentHoverItem = hoveredIdx !== null ? data[hoveredIdx] : data[actualLastIdx];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
      {/* Header with Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                Grafik Progres Penyelesaian Tugas Edit Data Anak
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 px-2 py-0.5 text-3xs font-bold uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                25 Okt — 16 Nov 2026
              </span>
            </div>
            <p className="text-2xs text-muted-foreground font-medium">
              Riwayat capaian harian sejak pertama kali dirilis hingga estimasi tuntas 100% lengkap
            </p>
          </div>
        </div>

        {/* Toggle Mode Button */}
        <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setMetricMode("siswa")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all",
              metricMode === "siswa"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
            <span>Siswa Diperbarui</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("paud")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all",
              metricMode === "paud"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>PAUD Tuntas 100%</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip for Fast Context */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
        <div className="rounded-lg bg-muted/40 border border-border p-2.5 space-y-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-3xs font-semibold uppercase">
            <Calendar className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            <span>Hari Pertama</span>
          </div>
          <div className="text-sm font-black font-mono text-foreground">
            25 Okt 2026
          </div>
          <p className="text-3xs text-muted-foreground truncate">
            Rilis Halaman Cek Progres
          </p>
        </div>

        <div className="rounded-lg bg-teal-500/10 border border-teal-500/30 p-2.5 space-y-0.5">
          <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 text-3xs font-semibold uppercase">
            <CheckCircle2 className="h-3 w-3 text-teal-600" />
            <span>Posisi Hari Ini (12 Nov)</span>
          </div>
          <div className="text-sm font-black font-mono text-teal-700 dark:text-teal-300">
            6.649 <span className="text-2xs font-normal">/ 7.895</span> (84.2%)
          </div>
          <p className="text-3xs text-teal-600/90 dark:text-teal-400 truncate">
            149 dari 209 PAUD tuntas 100%
          </p>
        </div>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 space-y-0.5">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-3xs font-semibold uppercase">
            <ArrowRight className="h-3 w-3 text-amber-600" />
            <span>Sisa Menuju Tuntas</span>
          </div>
          <div className="text-sm font-black font-mono text-amber-700 dark:text-amber-300">
            1.246 <span className="text-2xs font-normal">Siswa Lagi</span>
          </div>
          <p className="text-3xs text-amber-600/90 dark:text-amber-400 truncate">
            56 PAUD sedang &amp; bersiap tuntas
          </p>
        </div>

        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 space-y-0.5">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-3xs font-semibold uppercase">
            <Flag className="h-3 w-3 text-emerald-600" />
            <span>Estimasi Lengkap 100%</span>
          </div>
          <div className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-300">
            16 Nov 2026
          </div>
          <p className="text-3xs text-emerald-600/90 dark:text-emerald-400 truncate">
            Semua PAUD tuntas lengkap
          </p>
        </div>
      </div>

      {/* SVG Interactive Chart Area */}
      <div className="relative w-full overflow-x-auto rounded-lg border border-border/80 bg-background/50 p-2 sm:p-3">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          <defs>
            <linearGradient id={`${gradId}-actual`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id={`${gradId}-proj`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = padTop + chartH - (pct / 100) * chartH;
            return (
              <g key={pct}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                  fill="currentColor"
                  fillOpacity="0.45"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Projection Zone Background Tint */}
          <rect
            x={getX(actualLastIdx)}
            y={padTop}
            width={getX(data.length - 1) - getX(actualLastIdx)}
            height={chartH}
            fill="#f59e0b"
            fillOpacity="0.04"
          />
          <text
            x={(getX(actualLastIdx) + getX(data.length - 1)) / 2}
            y={padTop + 14}
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fill="#d97706"
            fillOpacity="0.8"
          >
            PROYEKSI MENUJU 100%
          </text>

          {/* Area Fills */}
          <path
            d={makeAreaPath(activeActualPoints)}
            fill={`url(#${gradId}-actual)`}
          />
          <path
            d={makeAreaPath(activeProjectedPoints)}
            fill={`url(#${gradId}-proj)`}
          />

          {/* Actual Line (Solid Teal) */}
          <path
            d={makeLinePath(activeActualPoints)}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Projected Line (Dashed Amber) */}
          <path
            d={makeLinePath(activeProjectedPoints)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Target 100% Top Baseline */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={svgWidth - padRight}
            y2={padTop}
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />
          <text
            x={svgWidth - padRight - 4}
            y={padTop - 6}
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="end"
            fill="#10b981"
          >
            TARGET PENUH: {metricMode === "siswa" ? `${totalSasaranSiswa} Siswa` : `${maxPaud} PAUD`} (100%)
          </text>

          {/* Milestone markers and interactive hover points */}
          {data.map((d, i) => {
            const pt = activePoints[i];
            const isHovered = hoveredIdx === i;
            const isToday = i === actualLastIdx;
            const isMilestone = Boolean(d.milestone);

            return (
              <g
                key={d.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onClick={() => setHoveredIdx(i)}
              >
                {/* Invisible hover target column */}
                <rect
                  x={pt.x - 12}
                  y={padTop}
                  width={24}
                  height={chartH + padBottom}
                  fill="transparent"
                />

                {/* Milestone Flag Indicator */}
                {isMilestone && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 5}
                    fill={d.type === "aktual" ? "#0d9488" : "#f59e0b"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all"
                  />
                )}

                {/* Point dot on hover */}
                {isHovered && !isMilestone && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={5.5}
                    fill={d.type === "aktual" ? "#0d9488" : "#f59e0b"}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}

                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + chartH}
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeDasharray="2 2"
                  />
                )}

                {/* X Axis Date Label */}
                {(i % 2 === 0 || i === actualLastIdx || i === data.length - 1) && (
                  <text
                    x={pt.x}
                    y={padTop + chartH + 16}
                    fontSize="8.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={isToday ? 1 : isHovered ? 0.9 : 0.55}
                    fontWeight={isToday || isHovered ? "bold" : "normal"}
                  >
                    {d.dayLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Live Detail Hover Banner */}
        {currentHoverItem && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-border bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-bold uppercase",
                  currentHoverItem.type === "aktual"
                    ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                )}
              >
                {currentHoverItem.type === "aktual" ? "Data Aktual Riil" : "Target / Proyeksi"}
              </span>
              <span className="text-xs font-bold font-mono text-foreground">
                {currentHoverItem.dayLabel} 2026
              </span>
              {currentHoverItem.milestone && (
                <span className="text-2xs font-semibold text-muted-foreground flex items-center gap-1 truncate">
                  • 🎯 {currentHoverItem.milestone}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-3xs text-muted-foreground uppercase block font-sans">
                  {metricMode === "siswa" ? "Diperbarui Hari Ini" : "PAUD Tuntas Hari Ini"}
                </span>
                <span className="font-bold text-foreground">
                  +{metricMode === "siswa" ? currentHoverItem.siswaHarian : currentHoverItem.paudTuntasHarian}
                </span>
              </div>

              <div className="border-l border-border pl-3">
                <span className="text-3xs text-muted-foreground uppercase block font-sans">
                  {metricMode === "siswa" ? "Total Kumulatif" : "Total PAUD Selesai"}
                </span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {metricMode === "siswa"
                    ? `${currentHoverItem.siswaKumulatif} / ${totalSasaranSiswa}`
                    : `${currentHoverItem.paudTuntasKumulatif} / ${maxPaud}`}
                  <span className="ml-1 text-2xs text-muted-foreground">
                    ({currentHoverItem.siswaPersen}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Information Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-2xs text-muted-foreground pt-1 border-t border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded-full bg-teal-600 inline-block" />
            <span className="font-semibold text-foreground">Data Aktual Riil (25 Okt - 12 Nov)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 border-t-2 border-dashed border-amber-500 inline-block" />
            <span className="font-semibold text-foreground">Proyeksi Menuju Tuntas 100% (13 - 16 Nov)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-foreground">Milestone Penting</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground font-mono">
          <Info className="h-3.5 w-3.5 text-teal-500" />
          <span>Arahkan kursor / sentuh titik grafik untuk melihat rincian tanggal</span>
        </div>
      </div>
    </div>
  );
}

