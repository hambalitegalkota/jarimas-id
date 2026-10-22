"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { BookOpen, ExternalLink, Info, Trash2, Loader2, Tag } from "lucide-react";
import { deleteBukuDigital } from "@/app/actions/buku-digital";
import type { BukuDigital } from "@/types/database";

interface BukuCardProps {
  buku: BukuDigital;
  isSuperAdmin?: boolean;
  onOpenDetail: (buku: BukuDigital) => void;
  onDeleted?: () => void;
}

export function BukuCard({ buku, isSuperAdmin, onOpenDetail, onDeleted }: BukuCardProps) {
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus buku "${buku.judul}"?`)) {
      startDeleteTransition(async () => {
        const res = await deleteBukuDigital(buku.id);
        if (res.success && onDeleted) {
          onDeleted();
        } else if (!res.success) {
          alert(res.message);
        }
      });
    }
  };

  return (
    <div
      onClick={() => onOpenDetail(buku)}
      className="group flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {buku.url_sampul ? (
          <Image
            src={buku.url_sampul}
            alt={buku.judul}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground bg-gradient-to-b from-muted to-muted/60">
            <BookOpen className="h-12 w-12 mb-2 text-primary/40 group-hover:text-primary transition-colors" />
            <span className="text-2xs font-medium">Buku Edukasi Jarimas</span>
          </div>
        )}

        {/* Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-2xs font-semibold text-white border border-white/10 shadow-xs">
            <Tag className="h-2.5 w-2.5 text-amber-300" />
            <span>{buku.kategori || "Umum"}</span>
          </span>
        </div>

        {/* Super Admin Delete Button */}
        {isSuperAdmin && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Hapus buku ini"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white/90 hover:bg-rose-600 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {buku.judul}
          </h3>
          <p className="text-2xs sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {buku.sinopsis || "Klik untuk membaca sinopsis selengkapnya..."}
          </p>
        </div>

        {/* Card Actions */}
        <div className="pt-2 border-t border-border/60 flex items-center gap-2">
          {buku.url_baca ? (
            <a
              href={buku.url_baca}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-2xs sm:text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Baca</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onOpenDetail(buku)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-2xs sm:text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Info Buku</span>
              <Info className="h-3 w-3" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(buku);
            }}
            title="Lihat sinopsis"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
