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
  ArrowRight,
  Award,
  Zap,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { formatRupiah, ProdukCard } from "@/components/market/produk-card";
import { cn } from "@/lib/utils";
import type { MarketProduk } from "@/types/database";

const KATEGORI_LIST = [
  "Semua",
  "Antropometri",
  "PMT & Nutrisi",
  "Edukasi PAUD",
  "Alat Posyandu",
  "Kesehatan & Gizi",
  "Buku & Modul",
  "Merchandise & Seragam",
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
      selectedKategori === "Semua" ||
      p.kategori.toLowerCase() === selectedKategori.toLowerCase() ||
      (selectedKategori === "Antropometri" && p.kategori.toLowerCase().includes("antropometri")) ||
      (selectedKategori === "PMT & Nutrisi" && (p.kategori.toLowerCase().includes("pmt") || p.kategori.toLowerCase().includes("nutrisi") || p.kategori.toLowerCase().includes("gizi"))) ||
      (selectedKategori === "Edukasi PAUD" && (p.kategori.toLowerCase().includes("paud") || p.kategori.toLowerCase().includes("edukasi")));
    return matchesSearch && matchesKategori;
  });

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24">
      {/* ========================================================= */}
      {/* 1. HERO BANNER JARIMAS MARKET                             */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-xs space-y-4">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-2xs font-semibold text-primary">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                <span>JARIMAS MARKET</span>
              </span>
              <span className="text-2xs font-mono font-semibold text-muted-foreground">KOTA TEGAL</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Sarana Posyandu, PAUD &amp; Nutrisi Balita
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Pusat pengadaan alat ukur antropometri standar Kemenkes RI, modul stimulasi motorik PAUD, dan paket PMT bergizi untuk posyandu se-Kota Tegal.
            </p>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href="/market/pesanan"
                className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors cursor-pointer"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Riwayat Pesanan Saya</span>
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin/market"
                  className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-background hover:bg-muted border border-border px-4 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <Package className="h-4 w-4 text-primary" />
                  <span>Kelola Produk (Admin)</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-border pt-3.5">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold border border-primary/20">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold block text-foreground">Utamakan Produk Lokal</span>
              <span className="text-2xs text-muted-foreground">Kembangkan ekonomi masyarakat</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-secondary font-bold border border-secondary/30">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold block text-foreground">Kirim Langsung</span>
              <span className="text-2xs text-muted-foreground">Seluruh wilayah Kota Tegal</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold border border-primary/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold block text-foreground">Transparan &amp; Resmi</span>
              <span className="text-2xs text-muted-foreground">QRIS &amp; verifikasi pesanan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SEARCH BAR & KATEGORI FILTER                           */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Cari perlengkapan posyandu, timbangan digital, modul PAUD, biskuit PMT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[44px] h-11 w-full rounded-lg border border-border bg-background pl-10 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Kategori Tabs Horizontal Scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex shrink-0 items-center gap-1 px-1 text-2xs font-semibold text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          {KATEGORI_LIST.map((kat) => {
            const isActive = selectedKategori === kat;
            return (
              <button
                key={kat}
                type="button"
                onClick={() => setSelectedKategori(kat)}
                className={cn(
                  "inline-flex shrink-0 items-center min-h-[38px] h-9 rounded-md px-3 text-xs font-semibold transition-colors cursor-pointer active:scale-95 border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card border-border text-foreground hover:bg-muted"
                )}
              >
                {kat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. GRID PRODUK                                            */}
      {/* ========================================================= */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 sm:p-10 text-center space-y-3 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
            <Package className="h-6 w-6 stroke-[1.5px]" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tidak ada produk yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kategori yang dipilih.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedKategori("Semua");
            }}
            className="inline-flex min-h-[44px] h-11 items-center rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-4 text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
          >
            Reset Filter Produk
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-2xs font-semibold text-muted-foreground">
            <span>Menampilkan {filteredProducts.length} produk katalog</span>
            <span className="font-mono">KOTA TEGAL</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((prod) => (
              <ProdukCard key={prod.id} produk={prod} />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. KETERANGAN STATUS PENGEMBANGAN FITUR                   */}
      {/* ========================================================= */}
      <div className="flex items-center justify-center gap-2 rounded-lg border border-secondary/30 bg-secondary/15 px-4 py-3 text-center text-secondary shadow-2xs">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide">
          Fitur masih belum aktif, proses pengembangan.
        </span>
      </div>
    </div>
  );
}
