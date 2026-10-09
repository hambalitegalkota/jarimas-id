"use client";

import { useState, useMemo } from "react";
import {
  PieChart as PieChartIcon,
  BarChart2,
  Layers,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { getJenjangAts, normalizeKeinginanSekolah } from "@/lib/ats-helpers";
import type { DataAtsItem } from "@/types/database";
import { cn } from "@/lib/utils";

interface DiagramChartFilterAtsProps {
  filteredAts: DataAtsItem[];
  totalAllAts?: number;
}

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

export function DiagramChartFilterAts({
  filteredAts,
  totalAllAts,
}: DiagramChartFilterAtsProps) {
  const [hoveredJenjang, setHoveredJenjang] = useState<string | null>(null);
  const [hoveredKeinginan, setHoveredKeinginan] = useState<string | null>(null);

  const totalFiltered = filteredAts.length;

  // 1. Data Donut Chart Jenjang
  const jenjangChartData = useMemo(() => {
    const counts = {
      sd: 0,
      smp: 0,
      sma: 0,
      dewasa: 0,
    };
    filteredAts.forEach((item) => {
      const jenjang = getJenjangAts(item).id;
      if (counts[jenjang as keyof typeof counts] !== undefined) {
        counts[jenjang as keyof typeof counts]++;
      }
    });

    const items = [
      {
        id: "sd",
        label: "SD / Paket A",
        sub: "7-12 Thn",
        count: counts.sd,
        color: "#10b981", // emerald-500
        colorClass: "text-emerald-400",
        bgClass: "bg-emerald-500",
      },
      {
        id: "smp",
        label: "SMP / Paket B",
        sub: "13-15 Thn",
        count: counts.smp,
        color: "#0ea5e9", // sky-500
        colorClass: "text-sky-400",
        bgClass: "bg-sky-500",
      },
      {
        id: "sma",
        label: "SMA / SMK / Paket C",
        sub: "16-18 Thn",
        count: counts.sma,
        color: "#f59e0b", // amber-500
        colorClass: "text-amber-400",
        bgClass: "bg-amber-500",
      },
      {
        id: "dewasa",
        label: "Dewasa",
        sub: "19-24+ Thn",
        count: counts.dewasa,
        color: "#a855f7", // purple-500
        colorClass: "text-purple-400",
        bgClass: "bg-purple-500",
      },
    ];

    let currentAngle = 0;
    return items.map((item) => {
      const pct = totalFiltered > 0 ? (item.count / totalFiltered) * 100 : 0;
      const angle = totalFiltered > 0 ? (item.count / totalFiltered) * 360 : 0;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      return {
        ...item,
        pct: Math.round(pct),
        startAngle,
        endAngle,
      };
    });
  }, [filteredAts, totalFiltered]);

  // 2. Data Donut Chart Keinginan Bersekolah
  const keinginanChartData = useMemo(() => {
    const masihAda = filteredAts.filter(
      (c) => normalizeKeinginanSekolah(c.keinginan_sekolah) === "Masih Ada"
    ).length;
    const tidakAda = filteredAts.filter(
      (c) => normalizeKeinginanSekolah(c.keinginan_sekolah) === "Tidak Ada"
    ).length;

    const items = [
      {
        id: "masih-ada",
        label: "Masih Ada Keinginan",
        count: masihAda,
        color: "#10b981", // emerald-500
        colorClass: "text-emerald-400",
        bgClass: "bg-emerald-500",
      },
      {
        id: "tidak-ada",
        label: "Tidak Ada Keinginan",
        count: tidakAda,
        color: "#f43f5e", // rose-500
        colorClass: "text-rose-400",
        bgClass: "bg-rose-500",
      },
    ];

    let currentAngle = 0;
    return items.map((item) => {
      const pct = totalFiltered > 0 ? (item.count / totalFiltered) * 100 : 0;
      const angle = totalFiltered > 0 ? (item.count / totalFiltered) * 360 : 0;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      return {
        ...item,
        pct: Math.round(pct),
        startAngle,
        endAngle,
      };
    });
  }, [filteredAts, totalFiltered]);

  // 3. Data Diagram Kolom Berkelompok: Jenjang x Gender (Laki vs Perempuan)
  const columnChartData = useMemo(() => {
    const jenjangKeys: Array<"sd" | "smp" | "sma" | "dewasa"> = ["sd", "smp", "sma", "dewasa"];
    const labels: Record<string, string> = {
      sd: "SD (7-12)",
      smp: "SMP (13-15)",
      sma: "SMA (16-18)",
      dewasa: "19-24+ Thn",
    };

    const data = jenjangKeys.map((key) => {
      const childrenInJenjang = filteredAts.filter((c) => getJenjangAts(c).id === key);
      const lCount = childrenInJenjang.filter(
        (c) => c.jenis_kelamin === "L" || c.jenis_kelamin?.toLowerCase().startsWith("l")
      ).length;
      const pCount = childrenInJenjang.filter(
        (c) => c.jenis_kelamin === "P" || c.jenis_kelamin?.toLowerCase().startsWith("p")
      ).length;

      return {
        id: key,
        label: labels[key],
        laki: lCount,
        perempuan: pCount,
        total: lCount + pCount,
      };
    });

    const maxVal = Math.max(...data.map((d) => Math.max(d.laki, d.perempuan)), 1);
    return { data, maxVal };
  }, [filteredAts]);

  if (totalFiltered === 0) {
    return null;
  }

  // Active Jenjang for Donut Center
  const activeJenjangItem =
    jenjangChartData.find((j) => j.id === hoveredJenjang) || null;

  // Active Keinginan for Donut Center
  const activeKeinginanItem =
    keinginanChartData.find((k) => k.id === hoveredKeinginan) || null;

  return (
    <div className="rounded-xl border border-border bg-card/70 backdrop-blur-xs p-4 sm:p-6 space-y-6 shadow-sm break-inside-avoid print:bg-white print:border-gray-300 print:text-black">
      {/* Header Diagram */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-400">
            <PieChartIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground font-mono uppercase">
              DIAGRAM CHART HASIL FILTER
            </h3>
            <p className="text-xs text-muted-foreground">
              Visualisasi proporsional Pie/Donut Chart dan Diagram Batang Tersegmentasi dari {totalFiltered} data ATS.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Interaktif & Real-time</span>
        </div>
      </div>

      {/* Grid 3 Diagram Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* DIAGRAM 1: DONUT CHART JENJANG PENDIDIKAN */}
        <div className="rounded-lg border border-border bg-background p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Donut: Jenjang ATS
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Proporsi</span>
          </div>

          {/* SVG Donut Center Graphic */}
          <div className="relative flex items-center justify-center py-2">
            <svg
              width="170"
              height="170"
              viewBox="0 0 170 170"
              className="overflow-visible drop-shadow-sm"
            >
              {jenjangChartData.map((item) => {
                if (item.count === 0) return null;
                const path = getDonutSlicePath(85, 85, 80, 52, item.startAngle, item.endAngle);
                const isHovered = hoveredJenjang === item.id;
                return (
                  <path
                    key={item.id}
                    d={path}
                    fill={item.color}
                    className="transition-all duration-200 cursor-pointer"
                    opacity={hoveredJenjang === null || isHovered ? 1 : 0.4}
                    style={{
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                      transformOrigin: "85px 85px",
                    }}
                    onMouseEnter={() => setHoveredJenjang(item.id)}
                    onMouseLeave={() => setHoveredJenjang(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {activeJenjangItem ? (
                <>
                  <span className={cn("text-xs font-mono font-bold", activeJenjangItem.colorClass)}>
                    {activeJenjangItem.label}
                  </span>
                  <span className="text-lg font-black font-mono text-foreground">
                    {activeJenjangItem.count}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {activeJenjangItem.pct}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    TOTAL
                  </span>
                  <span className="text-xl font-black font-mono text-foreground">
                    {totalFiltered}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">ANAK</span>
                </>
              )}
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/60 text-xs font-mono">
            {jenjangChartData.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredJenjang(item.id)}
                onMouseLeave={() => setHoveredJenjang(null)}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded transition-colors cursor-pointer",
                  hoveredJenjang === item.id ? "bg-muted font-bold" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", item.bgClass)} />
                  <span className="truncate text-muted-foreground text-[11px]">{item.label}</span>
                </div>
                <span className="text-foreground text-[11px] font-bold shrink-0 ml-1">
                  {item.count} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DIAGRAM 2: DONUT CHART KEINGINAN BERSEKOLAH */}
        <div className="rounded-lg border border-border bg-background p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Donut: Keinginan Sekolah
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Komitmen</span>
          </div>

          {/* SVG Donut Keinginan Graphic */}
          <div className="relative flex items-center justify-center py-2">
            <svg
              width="170"
              height="170"
              viewBox="0 0 170 170"
              className="overflow-visible drop-shadow-sm"
            >
              {keinginanChartData.map((item) => {
                if (item.count === 0) return null;
                const path = getDonutSlicePath(85, 85, 80, 52, item.startAngle, item.endAngle);
                const isHovered = hoveredKeinginan === item.id;
                return (
                  <path
                    key={item.id}
                    d={path}
                    fill={item.color}
                    className="transition-all duration-200 cursor-pointer"
                    opacity={hoveredKeinginan === null || isHovered ? 1 : 0.4}
                    style={{
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                      transformOrigin: "85px 85px",
                    }}
                    onMouseEnter={() => setHoveredKeinginan(item.id)}
                    onMouseLeave={() => setHoveredKeinginan(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeKeinginanItem ? (
                <>
                  <span className={cn("text-[11px] font-mono font-bold leading-tight", activeKeinginanItem.colorClass)}>
                    {activeKeinginanItem.label}
                  </span>
                  <span className="text-lg font-black font-mono text-foreground">
                    {activeKeinginanItem.count}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {activeKeinginanItem.pct}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    MASIH ADA
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {keinginanChartData[0]?.pct || 0}%
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">BERMINAT</span>
                </>
              )}
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60 text-xs font-mono">
            {keinginanChartData.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredKeinginan(item.id)}
                onMouseLeave={() => setHoveredKeinginan(null)}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded transition-colors cursor-pointer",
                  hoveredKeinginan === item.id ? "bg-muted font-bold" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", item.bgClass)} />
                  <span className="truncate text-foreground text-[11px]">{item.label}</span>
                </div>
                <span className={cn("text-[11px] font-bold shrink-0 ml-1", item.colorClass)}>
                  {item.count} Anak ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DIAGRAM 3: DIAGRAM BATANG KOLOM (JENJANG x GENDER) */}
        <div className="rounded-lg border border-border bg-background p-4 flex flex-col justify-between space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-mono font-bold uppercase text-foreground">
                Batang: Jenjang x Gender
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> L
              </span>
              <span className="flex items-center gap-1 text-pink-400">
                <span className="h-2 w-2 rounded-full bg-pink-500" /> P
              </span>
            </div>
          </div>

          {/* Column Bars Display */}
          <div className="flex items-end justify-around h-44 pt-4 pb-2 border-b border-border">
            {columnChartData.data.map((col) => {
              const lakiHeightPct = Math.max(
                Math.round((col.laki / columnChartData.maxVal) * 100),
                col.laki > 0 ? 8 : 0
              );
              const peremHeightPct = Math.max(
                Math.round((col.perempuan / columnChartData.maxVal) * 100),
                col.perempuan > 0 ? 8 : 0
              );

              return (
                <div key={col.id} className="flex flex-col items-center gap-1.5 h-full justify-end flex-1 max-w-[65px]">
                  {/* Pair of Bars */}
                  <div className="flex items-end justify-center gap-1.5 w-full h-32">
                    {/* Laki Bar */}
                    <div className="flex flex-col items-center justify-end h-full w-4">
                      {col.laki > 0 && (
                        <span className="text-[9px] font-mono font-bold text-sky-400 mb-0.5">
                          {col.laki}
                        </span>
                      )}
                      <div
                        className="w-full bg-sky-500 rounded-t-sm transition-all duration-500 hover:brightness-125"
                        style={{ height: `${lakiHeightPct}%` }}
                        title={`${col.label} - Laki-laki: ${col.laki}`}
                      />
                    </div>

                    {/* Perempuan Bar */}
                    <div className="flex flex-col items-center justify-end h-full w-4">
                      {col.perempuan > 0 && (
                        <span className="text-[9px] font-mono font-bold text-pink-400 mb-0.5">
                          {col.perempuan}
                        </span>
                      )}
                      <div
                        className="w-full bg-pink-500 rounded-t-sm transition-all duration-500 hover:brightness-125"
                        style={{ height: `${peremHeightPct}%` }}
                        title={`${col.label} - Perempuan: ${col.perempuan}`}
                      />
                    </div>
                  </div>

                  {/* Axis Label */}
                  <span className="text-[10px] font-mono text-muted-foreground font-bold text-center truncate w-full" title={col.label}>
                    {col.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Footnote info */}
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
            <span>Perbandingan Anak L vs P</span>
            <span className="text-foreground font-bold font-mono">
              Total {totalFiltered} Anak
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
