"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Scale,
  Sparkles,
  Share2,
} from "lucide-react";
import { formatRupiah } from "@/components/market/produk-card";
import type { MarketProduk } from "@/types/database";

interface DetailProdukClientProps {
  produk: MarketProduk;
}

export function DetailProdukClient({ produk }: DetailProdukClientProps) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  const isOutOfStock = produk.stok <= 0;
  const totalHarga = produk.harga * jumlah;

  const handleDecrease = () => {
    if (jumlah > 1) setJumlah((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (jumlah < produk.stok) setJumlah((prev) => prev + 1);
  };

  const handleCheckout = () => {
    router.push(`/market/checkout?productId=${produk.id}&qty=${jumlah}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: produk.nama,
        text: produk.deskripsi,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/market"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-primary" />
          <span>Kembali ke Katalog</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-xs cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>{isCopied ? "Link Tersalin!" : "Bagikan"}</span>
        </button>
      </div>

      {/* Main Grid: Gambar & Info Produk */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pb-16">
        {/* Gambar Produk */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-zinc-950">
          <Image
            src={
              produk.gambar_url ||
              "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
            }
            alt={produk.nama}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/80 border border-zinc-800 px-2.5 py-1 text-[11px] font-mono text-zinc-300 backdrop-blur-xs">
            <Tag className="h-3 w-3 text-emerald-400" />
            <span>{produk.kategori.toUpperCase()}</span>
          </div>

          <div className="absolute top-3 right-3">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-destructive/90 px-2.5 py-1 text-[10px] font-mono font-bold text-destructive-foreground backdrop-blur-xs">
                HABIS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 backdrop-blur-xs">
                <CheckCircle2 className="h-3 w-3" /> STOK: {produk.stok} UNIT
              </span>
            )}
          </div>
        </div>

        {/* Informasi Detail & Pemesanan */}
        <div className="flex flex-col justify-between space-y-6 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="cyber-badge">PENGADAAN RESMI</span>
                <span className="text-xs font-mono text-muted-foreground">KOTA TEGAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {produk.nama}
              </h1>
            </div>

            {/* Harga */}
            <div className="rounded-md bg-muted/40 border border-border p-4">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                HARGA RESMI SATUAN
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                {formatRupiah(produk.harga)}
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Deskripsi Produk
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {produk.deskripsi}
              </p>
            </div>

            {/* Spesifikasi Tambahan */}
            {produk.berat_gram && (
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground pt-1">
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  ESTIMASI BERAT: <strong className="text-foreground">{produk.berat_gram} GRAM</strong>
                </span>
              </div>
            )}
          </div>

          {/* Bagian Counter Kuantitas & Tombol Checkout */}
          <div className="space-y-4 border-t border-border pt-4">
            {/* Kuantitas Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-foreground">
                JUMLAH PESANAN:
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDecrease}
                  disabled={jumlah <= 1 || isOutOfStock}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card font-mono font-bold text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-mono font-bold text-foreground">
                  {jumlah}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={jumlah >= produk.stok || isOutOfStock}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card font-mono font-bold text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Total Perhitungan */}
            <div className="flex items-center justify-between rounded-md bg-muted/40 p-3.5 border border-border font-mono">
              <span className="text-xs text-muted-foreground">
                TOTAL ESTIMASI:
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatRupiah(totalHarga)}
              </span>
            </div>

            {/* Tombol Action */}
            <button
              onClick={handleCheckout}
              disabled={isOutOfStock}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 px-5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {isOutOfStock
                  ? "STOK SEDANG HABIS"
                  : "BELI SEKARANG & ISI ALAMAT"}
              </span>
            </button>

            {/* Info Keamanan & Garansi */}
            <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono text-[10px] text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-md bg-muted/40 border border-border/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>TERSTANDAR</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-md bg-muted/40 border border-border/60">
                <Truck className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                <span>KIRIM KOTA TEGAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
