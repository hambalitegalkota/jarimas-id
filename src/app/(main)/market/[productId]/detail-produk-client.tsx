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
    <div className="flex flex-col flex-1 px-4 py-5 sm:px-6 md:px-8 max-w-4xl mx-auto w-full gap-5">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/market"
          className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-card border border-border px-3.5 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span>Kembali ke Katalog</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-card border border-border px-3.5 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-2xs cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span>{isCopied ? "Tersalin!" : "Bagikan"}</span>
        </button>
      </div>

      {/* Main Grid: Gambar & Info Produk */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 pb-16">
        {/* Gambar Produk */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
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

          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-background/90 border border-border px-2.5 py-1 text-2xs font-semibold text-foreground shadow-2xs backdrop-blur-xs">
            <Tag className="h-3 w-3 text-primary" />
            <span>{produk.kategori}</span>
          </div>

          <div className="absolute top-2.5 right-2.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-destructive text-destructive-foreground px-2 py-0.5 text-2xs font-semibold shadow-xs">
                HABIS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-2xs font-semibold shadow-xs">
                <CheckCircle2 className="h-3 w-3" /> STOK: {produk.stok}
              </span>
            )}
          </div>
        </div>

        {/* Informasi Detail & Pemesanan */}
        <div className="flex flex-col justify-between space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xs">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-2xs font-semibold text-primary">
                  JARIMAS MARKET
                </span>
                <span className="text-2xs font-mono text-muted-foreground">KOTA TEGAL</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {produk.nama}
              </h1>
            </div>

            {/* Harga */}
            <div className="rounded-lg bg-muted/40 border border-border p-3.5">
              <span className="text-2xs font-semibold text-muted-foreground block uppercase">
                Harga Katalog Satuan
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-primary">
                {formatRupiah(produk.harga)}
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Deskripsi Produk
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {produk.deskripsi}
              </p>
            </div>

            {/* Spesifikasi Tambahan */}
            {produk.berat_gram && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  Estimasi Berat: <strong className="text-foreground font-mono font-bold">{produk.berat_gram} gram</strong>
                </span>
              </div>
            )}
          </div>

          {/* Bagian Counter Kuantitas & Tombol Checkout */}
          <div className="space-y-3.5 border-t border-border pt-3.5">
            {/* Kuantitas Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                Jumlah Pesanan:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecrease}
                  disabled={jumlah <= 1 || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background font-mono font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-base font-mono font-bold text-foreground">
                  {jumlah}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={jumlah >= produk.stok || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background font-mono font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Total Perhitungan */}
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">
                Total Pembayaran:
              </span>
              <span className="text-lg font-bold font-mono text-primary">
                {formatRupiah(totalHarga)}
              </span>
            </div>

            {/* Tombol Action */}
            <button
              onClick={handleCheckout}
              disabled={isOutOfStock}
              className="flex min-h-[44px] h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {isOutOfStock
                  ? "STOK SEDANG HABIS"
                  : "Pesan Sekarang & Isi Alamat"}
              </span>
            </button>

            {/* Info Keamanan & Garansi */}
            <div className="grid grid-cols-2 gap-2 text-center pt-0.5 text-2xs text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-muted/30 border border-border">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold">100% Terstandar</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-muted/30 border border-border">
                <Truck className="h-3.5 w-3.5 text-secondary" />
                <span className="font-semibold">Kirim Kota Tegal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
