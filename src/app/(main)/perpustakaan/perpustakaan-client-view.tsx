"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Plus,
  SlidersHorizontal,
  X,
  Info,
  Database,
  ArrowRight,
  BookMarked,
  CheckCircle2,
} from "lucide-react";
import { BukuCard } from "@/components/perpustakaan/buku-card";
import { BukuDetailModal } from "@/components/perpustakaan/buku-detail-modal";
import { TambahBukuModal } from "@/components/perpustakaan/tambah-buku-modal";
import type { BukuDigital } from "@/types/database";

const DAFTAR_KATEGORI = [
  "Semua",
  "Modul Parenting",
  "Panduan Kader",
  "Buku Cerita Anak",
  "Kesehatan & Gizi",
  "Pendidikan & PAUD",
  "Keterampilan Warga",
];

interface PerpustakaanClientViewProps {
  initialBuku: BukuDigital[];
  isSuperAdmin?: boolean;
  isFallback?: boolean;
}

export function PerpustakaanClientView({
  initialBuku = [],
  isSuperAdmin = false,
  isFallback = false,
}: PerpustakaanClientViewProps) {
  const [bukuList, setBukuList] = useState<BukuDigital[]>(initialBuku);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedBuku, setSelectedBuku] = useState<BukuDigital | null>(null);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);

  // Filter buku berdasarkan pencarian dan kategori
  const filteredBuku = bukuList.filter((buku) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      buku.judul.toLowerCase().includes(query) ||
      (buku.sinopsis && buku.sinopsis.toLowerCase().includes(query)) ||
      (buku.kategori && buku.kategori.toLowerCase().includes(query));

    const matchesKategori =
      selectedKategori === "Semua" ||
      (buku.kategori && buku.kategori.toLowerCase() === selectedKategori.toLowerCase());

    return matchesSearch && matchesKategori;
  });

  const handleBookDeleted = (deletedId: string) => {
    setBukuList((prev) => prev.filter((b) => b.id !== deletedId));
  };

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. HERO BANNER PERPUSTAKAAN DIGITAL                       */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-xl border border-teal-700/50 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-900 text-white p-5 sm:p-7 shadow-md">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-2xs font-semibold text-teal-200 backdrop-blur-xs">
                <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                <span>PERPUSTAKAAN DIGITAL JARIMAS</span>
              </span>
              <span className="text-2xs font-mono font-medium text-teal-200/80">KOTA TEGAL</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
              Direktori Buku, Modul &amp; Panduan Edukasi
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-xl">
              Akses terbuka modul parenting anak usia dini, panduan praktis kader Posyandu 6 Bidang SPM, dan buku cerita edukatif keluarga Kota Tegal.
            </p>
          </div>

          {/* Action Button: Tambah Buku untuk Admin */}
          {isSuperAdmin && (
            <div className="shrink-0 pt-1">
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(true)}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-secondary hover:brightness-95 px-4 text-xs sm:text-sm font-bold text-secondary-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Buku Baru</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. PEMBERITAHUAN DATABASE SEED (JIKA PERLU MIGRASI)        */}
      {/* ========================================================= */}
      {isFallback && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-amber-900 dark:text-amber-200">
          <Database className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Katalog Percontohan Perpustakaan Digital Aktif
            </p>
            <p className="text-2xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              Tabel database <code className="font-mono font-semibold bg-amber-200/50 dark:bg-amber-900/60 px-1 py-0.5 rounded">buku_digital</code> di Supabase belum dieksekusi atau masih kosong. Untuk mengaktifkan sinkronisasi database live, jalankan skrip di file <strong className="font-mono">supabase/migration_buku_digital.sql</strong> pada Supabase SQL Editor.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PENCARIAN & FILTER KATEGORI                            */}
      {/* ========================================================= */}
      <section className="space-y-3">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul buku, modul parenting, atau kata kunci panduan..."
            className="w-full rounded-xl border border-border bg-card pl-10 pr-10 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DAFTAR_KATEGORI.map((kategori) => {
            const isActive = selectedKategori === kategori;
            return (
              <button
                key={kategori}
                type="button"
                onClick={() => setSelectedKategori(kategori)}
                className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{kategori}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. DAFTAR GRID BUKU & MODUL                               */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Daftar Buku &amp; Modul
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-muted text-muted-foreground">
              {filteredBuku.length}
            </span>
          </div>

          {(searchQuery || selectedKategori !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedKategori("Semua");
              }}
              className="text-2xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {filteredBuku.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BookMarked className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-bold text-foreground">Buku Tidak Ditemukan</h3>
              <p className="text-xs text-muted-foreground">
                Tidak ada buku atau modul yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kategori yang dipilih.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedKategori("Semua");
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Tampilkan Semua Buku
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredBuku.map((buku) => (
              <BukuCard
                key={buku.id}
                buku={buku}
                isSuperAdmin={isSuperAdmin}
                onOpenDetail={(b) => setSelectedBuku(b)}
                onDeleted={() => handleBookDeleted(buku.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal Detail Buku */}
      <BukuDetailModal
        buku={selectedBuku}
        isOpen={Boolean(selectedBuku)}
        onClose={() => setSelectedBuku(null)}
      />

      {/* Modal Tambah Buku untuk Admin */}
      {isSuperAdmin && (
        <TambahBukuModal
          isOpen={isTambahModalOpen}
          onClose={() => setIsTambahModalOpen(false)}
          onSuccess={() => {
            // refresh data bisa dilakukan via server action revalidatePath
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
