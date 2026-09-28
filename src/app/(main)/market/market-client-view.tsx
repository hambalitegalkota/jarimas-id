"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Package,
  ShieldCheck,
  Truck,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { formatRupiah, ProdukCard } from "@/components/market/produk-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { MarketProduk } from "@/types/database";

const KATEGORI_LIST = [
  "Semua",
  "Kesehatan & Gizi",
  "Alat Posyandu",
  "Edukasi PAUD",
  "Merchandise & Seragam",
  "Buku & Modul",
];

interface MarketClientViewProps {
  initialProducts: MarketProduk[];
  isSuperAdmin?: boolean;
}

export function MarketClientView({
  initialProducts = [],
  isSuperAdmin = false,
}: MarketClientViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");

  const safeProducts = Array.isArray(initialProducts) ? initialProducts : [];

  const filteredProducts = safeProducts.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKategori =
      selectedKategori === "Semua" || p.kategori === selectedKategori;
    return matchesSearch && matchesKategori;
  });

  return (
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-8">
      {/* Header & Hero Banner - Superlist & Evervault Style */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="cyber-badge">MARKETPLACE</span>
              <span className="text-xs font-mono text-muted-foreground">PENGADAAN RESMI KOTA TEGAL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">
              Sarana &amp; Nutrisi
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pusat pengadaan sarana tumbuh kembang anak, modul edukasi PAUD, timbangan antropometri terstandar Kemenkes, dan nutrisi posyandu resmi.
            </p>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/market/pesanan"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all hover:bg-foreground/90"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                <span>PESANAN SAYA</span>
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin/market"
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-muted border border-border px-4 text-xs font-mono font-bold text-foreground transition-all hover:bg-muted/80"
                >
                  <Package className="h-3.5 w-3.5 text-emerald-400" />
                  <span>KELOLA PRODUK (ADMIN)</span>
                </Link>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <ThemeToggle variant="compact" />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
          <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-background border border-border">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] sm:text-xs font-mono text-foreground font-semibold">100% TERSTANDAR</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-background border border-border">
            <Truck className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] sm:text-xs font-mono text-foreground font-semibold">DISTRIBUSI TEGAL</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-background border border-border">
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] sm:text-xs font-mono text-foreground font-semibold">TRANSPARAN &amp; RESMI</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Kategori Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari perlengkapan posyandu, modul PAUD, alat ukur antropometri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-4 text-xs sm:text-sm font-sans text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
          />
        </div>

        {/* Kategori Tabs Horizontal Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex shrink-0 items-center gap-1 px-1 text-xs font-mono text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          {KATEGORI_LIST.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={cn(
                "inline-flex shrink-0 items-center rounded-md px-3 py-1.5 text-xs font-mono transition-all cursor-pointer",
                selectedKategori === kat
                  ? "bg-foreground text-background font-bold border border-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {kat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Produk */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-zinc-900 text-muted-foreground">
            <Package className="h-6 w-6 stroke-[1.5px]" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
              PRODUK TIDAK DITEMUKAN
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tidak ada produk yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kategori yang dipilih.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedKategori("Semua");
            }}
            className="inline-flex h-8 items-center rounded-md bg-zinc-900 border border-border px-3 text-xs font-mono text-foreground hover:bg-zinc-800"
          >
            RESET FILTER
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-16">
          {filteredProducts.map((prod) => (
            <ProdukCard key={prod.id} produk={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
