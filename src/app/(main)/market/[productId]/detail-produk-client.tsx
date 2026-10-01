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
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-4xl mx-auto w-full gap-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/market"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Kembali ke Katalog</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span>{isCopied ? "Tersalin!" : "Bagikan"}</span>
        </button>
      </div>

      {/* Main Grid: Gambar & Info Produk */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pb-16">
        {/* Gambar Produk */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
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

          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm backdrop-blur-xs">
            <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{produk.kategori}</span>
          </div>

          <div className="absolute top-3 right-3">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                HABIS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5" /> STOK: {produk.stok}
              </span>
            )}
          </div>
        </div>

        {/* Informasi Detail & Pemesanan */}
        <div className="flex flex-col justify-between space-y-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                  PENGADAAN RESMI
                </span>
                <span className="text-xs font-mono text-slate-500">KOTA TEGAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {produk.nama}
              </h1>
            </div>

            {/* Harga */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
              <span className="text-xs font-bold text-slate-500 block uppercase">
                HARGA RESMI SATUAN
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-700 dark:text-blue-400">
                {formatRupiah(produk.harga)}
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Deskripsi Produk
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">
                {produk.deskripsi}
              </p>
            </div>

            {/* Spesifikasi Tambahan */}
            {produk.berat_gram && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 pt-1">
                <Scale className="h-4 w-4 text-slate-500" />
                <span>
                  Estimasi Berat: <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold">{produk.berat_gram} gram</strong>
                </span>
              </div>
            )}
          </div>

          {/* Bagian Counter Kuantitas & Tombol Checkout */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            {/* Kuantitas Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Jumlah Pesanan:
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrease}
                  disabled={jumlah <= 1 || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                  {jumlah}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={jumlah >= produk.stok || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-slate-100 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Total Perhitungan */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Total Pembayaran:
              </span>
              <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400">
                {formatRupiah(totalHarga)}
              </span>
            </div>

            {/* Tombol Action */}
            <button
              onClick={handleCheckout}
              disabled={isOutOfStock}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>
                {isOutOfStock
                  ? "STOK SEDANG HABIS"
                  : "PESAN SEKARANG & ISI ALAMAT"}
              </span>
            </button>

            {/* Info Keamanan & Garansi */}
            <div className="grid grid-cols-2 gap-2 text-center pt-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold">100% TERSTANDAR</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold">KIRIM KOTA TEGAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
