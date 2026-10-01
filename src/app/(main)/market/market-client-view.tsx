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
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-5xl mx-auto w-full gap-6">
      {/* Header & Hero Banner - Coursera Mobile Clean Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                PENGADAAN RESMI
              </span>
              <span className="text-xs font-mono text-slate-500">KOTA TEGAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Sarana &amp; Nutrisi Posyandu
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Pusat pengadaan sarana tumbuh kembang anak, modul edukasi PAUD, timbangan antropometri terstandar Kemenkes, dan nutrisi posyandu resmi.
            </p>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/market/pesanan"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-5 text-sm font-bold text-white shadow-sm transition-all active:scale-98"
              >
                <ClipboardList className="h-4 w-4" />
                <span>PESANAN SAYA</span>
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin/market"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 text-sm font-bold text-slate-800 dark:text-slate-200 transition-all hover:bg-slate-100 active:scale-98"
                >
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>KELOLA PRODUK (ADMIN)</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">100% STANDAR</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">KOTA TEGAL</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">TRANSPARAN</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Kategori Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari perlengkapan posyandu, modul PAUD, timbangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-4 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Kategori Tabs Horizontal Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex shrink-0 items-center gap-1 px-1 text-sm font-bold text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          {KATEGORI_LIST.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer",
                selectedKategori === kat
                  ? "bg-blue-700 text-white shadow-sm border-2 border-blue-700"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Produk */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-4 shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400">
            <Package className="h-7 w-7 stroke-[1.5px]" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              PRODUK TIDAK DITEMUKAN
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tidak ada produk yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kategori yang dipilih.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedKategori("Semua");
            }}
            className="inline-flex min-h-[48px] items-center rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 text-sm font-bold cursor-pointer shadow-sm active:scale-98"
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
