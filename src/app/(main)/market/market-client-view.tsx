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
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full gap-6 pb-24">
      {/* ========================================================= */}
      {/* 1. HERO BANNER JARIMAS MARKET                             */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl shadow-slate-950/30 space-y-6">
        {/* Decorative Orbs */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-black text-emerald-300 backdrop-blur-xs">
                <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                <span>JARIMAS MARKET</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">KOTA TEGAL</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Sarana Posyandu, PAUD &amp; Nutrisi Balita
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Pusat pengadaan alat ukur antropometri standar Kemenkes RI, modul stimulasi motorik PAUD, dan paket PMT bergizi untuk posyandu se-Kota Tegal.
            </p>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/market/pesanan"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <ClipboardList className="h-4 w-4 text-emerald-700" />
                <span>RIWAYAT PESANAN SAYA</span>
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin/market"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-white/30 px-5 text-xs sm:text-sm font-extrabold text-emerald-300 transition-all active:scale-98 cursor-pointer"
                >
                  <Package className="h-4 w-4 text-emerald-300" />
                  <span>KELOLA PRODUK (ADMIN)</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 border-t border-white/15 pt-4 text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-white/20 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-black block">Utamakan produk lokal &amp; sekitar</span>
              <span className="text-[11px] text-slate-500">Kembangkan ekonomi masyarakat</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-white/20 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-black block">Kirim Langsung</span>
              <span className="text-[11px] text-slate-500">Seluruh wilayah Kota Tegal</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-white/20 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-black block">Transparan &amp; Resmi</span>
              <span className="text-[11px] text-slate-500">QRIS &amp; verifikasi pesanan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SEARCH BAR & KATEGORI FILTER                           */}
      {/* ========================================================= */}
      <div className="space-y-3.5">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari perlengkapan posyandu, timbangan digital, modul PAUD, biskuit PMT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[50px] w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-10 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Kategori Tabs Horizontal Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex shrink-0 items-center gap-1 px-1 text-xs font-bold text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          {KATEGORI_LIST.map((kat) => {
            const isActive = selectedKategori === kat;
            return (
              <button
                key={kat}
                type="button"
                onClick={() => setSelectedKategori(kat)}
                className={cn(
                  "inline-flex shrink-0 items-center min-h-[42px] rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-95",
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm border-2 border-emerald-600"
                    : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:border-slate-300"
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
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4 shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Package className="h-7 w-7 stroke-[1.5px]" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tidak ada produk yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kategori yang dipilih.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedKategori("Semua");
            }}
            className="inline-flex min-h-[46px] items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 text-xs sm:text-sm font-extrabold cursor-pointer shadow-sm active:scale-98"
          >
            Reset Filter Produk
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
            <span>Menampilkan {filteredProducts.length} produk katalog</span>
            <span className="font-mono">KOTA TEGAL</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((prod) => (
              <ProdukCard key={prod.id} produk={prod} />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. KETERANGAN STATUS PENGEMBANGAN FITUR                   */}
      {/* ========================================================= */}
      <div className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 px-5 py-4 text-center text-amber-900 dark:text-amber-200 shadow-2xs">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-xs sm:text-sm font-extrabold tracking-wide">
          Fitur masih belum aktif, proses pengembangan.
        </span>
      </div>
    </div>
  );
}
