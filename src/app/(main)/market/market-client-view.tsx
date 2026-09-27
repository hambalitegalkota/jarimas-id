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
import { ProdukCard } from "@/components/market/produk-card";
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
    <div className="space-y-6">
      {/* Header & Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary/95 to-primary/80 p-6 text-primary-foreground shadow-lg">
        <div className="relative z-10 max-w-lg space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Pengadaan Resmi Terstandar Kota Tegal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Jarimas Market
          </h1>
          <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed">
            Pusat pengadaan sarana tumbuh kembang anak, modul edukasi PAUD,
            timbangan & pita LiLA Posyandu, hingga nutrisi terstandar Kemenkes.
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              href="/market/pesanan"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-xs font-bold text-primary shadow-xs transition-all hover:bg-white/90 active:scale-95"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Pesanan Saya</span>
            </Link>

            {isSuperAdmin && (
              <Link
                href="/admin/market"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-xs font-bold text-accent-foreground shadow-xs transition-all hover:bg-accent/90 active:scale-95"
              >
                <Package className="h-4 w-4" />
                <span>Kelola Produk (Admin)</span>
              </Link>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/20 pt-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span className="text-[10px] sm:text-xs font-medium">100% Terstandar</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Truck className="h-5 w-5 text-accent" />
            <span className="text-[10px] sm:text-xs font-medium">Kirim ke Posyandu/RT</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <span className="text-[10px] sm:text-xs font-medium">Transparan & Resmi</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Kategori Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari perlengkapan posyandu, modul PAUD, alat ukur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 shadow-xs"
          />
        </div>

        {/* Kategori Tabs Horizontal Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex shrink-0 items-center gap-1 px-1 text-xs font-bold text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          {KATEGORI_LIST.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={`inline-flex shrink-0 items-center rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                selectedKategori === kat
                  ? "bg-primary text-primary-foreground scale-102 shadow-sm"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Produk */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Tidak ada produk yang cocok dengan kata kunci &quot;{searchQuery}&quot;
              atau filter kategori yang dipilih.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedKategori("Semua");
            }}
            className="inline-flex h-10 items-center rounded-xl bg-primary/10 px-4 text-xs font-bold text-primary hover:bg-primary/20"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((prod) => (
            <ProdukCard key={prod.id} produk={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
