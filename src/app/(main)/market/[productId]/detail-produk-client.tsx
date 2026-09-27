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
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/market"
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-card border border-border px-4 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Katalog</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-card border border-border px-4 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
        >
          <Share2 className="h-4 w-4" />
          <span>{isCopied ? "Link Tersalin!" : "Bagikan"}</span>
        </button>
      </div>

      {/* Main Grid: Gambar & Info Produk */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Gambar Produk */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
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

          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs">
            <Tag className="h-3 w-3 text-primary" />
            <span>{produk.kategori}</span>
          </div>

          <div className="absolute top-4 right-4">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/90 px-3 py-1 text-xs font-bold text-destructive-foreground backdrop-blur-xs">
                Stok Habis
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-xs">
                <CheckCircle2 className="h-3 w-3" /> Tersedia {produk.stok} unit
              </span>
            )}
          </div>
        </div>

        {/* Informasi Detail & Pemesanan */}
        <div className="flex flex-col justify-between space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Sparkles className="h-3 w-3" /> Resmi Jarimas Kota Tegal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {produk.nama}
              </h1>
            </div>

            {/* Harga */}
            <div className="rounded-2xl bg-muted/40 p-4">
              <span className="text-xs font-medium text-muted-foreground block">
                Harga Resmi Satuan
              </span>
              <div className="text-2xl sm:text-3xl font-black text-primary">
                {formatRupiah(produk.harga)}
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Deskripsi Produk
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {produk.deskripsi}
              </p>
            </div>

            {/* Spesifikasi Tambahan */}
            {produk.berat_gram && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Scale className="h-4 w-4 text-primary" />
                <span>
                  Estimasi Berat Pengiriman: <strong>{produk.berat_gram} gram</strong>
                </span>
              </div>
            )}
          </div>

          {/* Bagian Counter Kuantitas & Tombol Checkout */}
          <div className="space-y-4 border-t border-border pt-4">
            {/* Kuantitas Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Jumlah Pesanan:
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrease}
                  disabled={jumlah <= 1 || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card font-bold text-foreground shadow-xs transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-base font-extrabold text-foreground">
                  {jumlah}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={jumlah >= produk.stok || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card font-bold text-foreground shadow-xs transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Total Perhitungan */}
            <div className="flex items-center justify-between rounded-2xl bg-primary/5 p-4 border border-primary/20">
              <span className="text-xs font-bold text-foreground">
                Total Estimasi:
              </span>
              <span className="text-xl font-black text-primary">
                {formatRupiah(totalHarga)}
              </span>
            </div>

            {/* Tombol Action */}
            <button
              onClick={handleCheckout}
              disabled={isOutOfStock}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-98 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>
                {isOutOfStock
                  ? "Stok Produk Sedang Habis"
                  : "Beli Sekarang & Isi Alamat"}
              </span>
            </button>

            {/* Info Keamanan & Garansi */}
            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Terverifikasi Jarimas</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                <span>Kurir Siap Antar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
