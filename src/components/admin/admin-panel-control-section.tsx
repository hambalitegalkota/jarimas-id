"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Layers,
  Users,
  ShieldCheck,
  Building2,
  UserCheck,
  Trash2,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminPanelSectionItem {
  id: string;
  label: string;
  description?: string;
  badgeText?: string | number;
  iconName: "layers" | "users" | "shield" | "building" | "user-check" | "trash";
  content: React.ReactNode;
}

export interface AdminPanelControlSectionProps {
  panelTitle: string;
  tierBadgeLabel: string;
  sections: AdminPanelSectionItem[];
  defaultSectionId?: string;
}

const ICON_MAP: Record<AdminPanelSectionItem["iconName"], LucideIcon> = {
  layers: Layers,
  users: Users,
  shield: ShieldCheck,
  building: Building2,
  "user-check": UserCheck,
  trash: Trash2,
};

export function AdminPanelControlSection({
  panelTitle,
  tierBadgeLabel,
  sections,
  defaultSectionId,
}: AdminPanelControlSectionProps) {
  const searchParams = useSearchParams();
  const urlSection = searchParams.get("section");

  // Tentukan seksi aktif: jika ada di URL dan valid, gunakan URL. Jika tidak, gunakan defaultSectionId atau seksi pertama
  const initialSection = useMemo(() => {
    if (urlSection && sections.some((s) => s.id === urlSection)) {
      return urlSection;
    }
    if (defaultSectionId && sections.some((s) => s.id === defaultSectionId)) {
      return defaultSectionId;
    }
    return sections[0]?.id || "";
  }, [urlSection, defaultSectionId, sections]);

  const [activeSectionId, setActiveSectionId] = useState<string>(initialSection);

  // Sinkronkan jika URL berubah (misal dari navigasi browser)
  useEffect(() => {
    if (urlSection && sections.some((s) => s.id === urlSection)) {
      setActiveSectionId(urlSection);
    }
  }, [urlSection, sections]);

  // Handler pemilihan tombol
  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("section", id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* Header Panel Kendali */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" />
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-foreground">
            {panelTitle}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-0.5 text-[10px] font-bold text-secondary uppercase tracking-wider">
          {tierBadgeLabel}
        </span>
      </div>

      {/* Barisan Tombol Responsif (Menyesuaikan Ukuran Layar: HP, Tablet, Desktop) */}
      <div
        className={cn(
          "grid gap-2 sm:gap-2.5",
          sections.length === 2 && "grid-cols-2",
          sections.length === 3 && "grid-cols-2 sm:grid-cols-3",
          sections.length === 4 && "grid-cols-2 sm:grid-cols-4",
          sections.length >= 5 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        )}
      >
        {sections.map((sec) => {
          const isActive = sec.id === activeSection?.id;
          const Icon = ICON_MAP[sec.iconName] || Layers;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleSelectSection(sec.id)}
              className={cn(
                "flex flex-col items-start justify-between p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group shadow-2xs hover:shadow-xs min-h-[82px] sm:min-h-[90px]",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between w-full gap-2 mb-1.5 sm:mb-2">
                <div
                  className={cn(
                    "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105 shrink-0",
                    isActive
                      ? "bg-white/20 text-white backdrop-blur-xs"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>

                {sec.badgeText !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {sec.badgeText}
                  </span>
                )}
              </div>

              <div className="w-full min-w-0">
                <span
                  className={cn(
                    "font-bold text-xs sm:text-sm block truncate leading-tight",
                    isActive
                      ? "text-white"
                      : "text-foreground group-hover:text-primary transition-colors"
                  )}
                >
                  {sec.label}
                </span>
                {sec.description && (
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] line-clamp-1 mt-0.5 block",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    {sec.description}
                  </span>
                )}
              </div>

              {/* Garis indikator aktif */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40" />
              )}
            </button>
          );
        })}
      </div>

      {/* Konten Bagian Aktif */}
      <div className="pt-1">
        {activeSection ? (
          <div
            key={activeSection.id}
            className="animate-in fade-in-50 duration-200 transition-all"
          >
            {activeSection.content}
          </div>
        ) : null}
      </div>
    </section>
  );
}
