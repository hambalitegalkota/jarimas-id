"use client";

import { X, BookOpen, ExternalLink, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import type { BukuDigital } from "@/types/database";

interface BukuDetailModalProps {
  buku: BukuDigital | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BukuDetailModal({ buku, isOpen, onClose }: BukuDetailModalProps) {
  if (!isOpen || !buku) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5 bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                Detail Buku / Modul
              </span>
              <h2 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                {buku.judul}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Cover & Quick Info */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <div className="relative w-36 h-48 shrink-0 rounded-lg overflow-hidden border border-border bg-muted shadow-sm">
              {buku.url_sampul ? (
                <Image
                  src={buku.url_sampul}
                  alt={buku.judul}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-2 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 mb-2 opacity-40 text-primary" />
                  <span className="text-2xs">Sampul Tidak Tersedia</span>
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Tag className="h-3 w-3" />
                  {buku.kategori || "Umum"}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground mt-2 leading-snug">
                  {buku.judul}
                </h3>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-2xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Ditambahkan:{" "}
                  {new Date(buku.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Sinopsis */}
          <div className="space-y-1.5 border-t border-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sinopsis / Deskripsi
            </h4>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/30 p-3.5 rounded-lg border border-border/60">
              {buku.sinopsis || "Belum ada deskripsi sinopsis untuk buku ini."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-4 sm:p-5 bg-muted/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {buku.url_baca ? (
            <a
              href={buku.url_baca}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-primary-foreground shadow-xs transition-colors cursor-pointer"
            >
              <span>Buka / Baca Sekarang</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-lg bg-muted text-xs font-medium text-muted-foreground cursor-not-allowed"
            >
              Tautan Baca Belum Tersedia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
