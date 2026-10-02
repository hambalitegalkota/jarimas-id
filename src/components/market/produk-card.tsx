"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Tag } from "lucide-react";
import type { MarketProduk } from "@/types/database";
import { cn, formatRupiah } from "@/lib/utils";
export { formatRupiah };

interface ProdukCardProps {
  produk: MarketProduk;
}

export function ProdukCard({ produk }: ProdukCardProps) {
  const isOutOfStock = produk.stok <= 0;
  const isLowStock = produk.stok > 0 && produk.stok <= 5;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:border-emerald-500 shadow-xs">
      {/* Gambar Produk */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-800">
        <Image
          src={produk.gambar_url || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"}
          alt={produk.nama}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge Kategori */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm backdrop-blur-xs">
          <Tag className="h-3.5 w-3.5 text-emerald-600" />
          <span>{produk.kategori}</span>
        </div>

        {/* Badge Stok */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              <XCircle className="h-3.5 w-3.5" /> STOK HABIS
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 border border-amber-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5" /> SISA {produk.stok}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> TERSEDIA
            </span>
          )}
        </div>
      </div>

      {/* Konten Produk */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {produk.nama}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {produk.deskripsi}
          </p>
        </div>

        {/* Harga & Tombol Beli */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <span className="text-xs font-bold text-slate-500 block">
              HARGA RESMI
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {formatRupiah(produk.harga)}
            </span>
          </div>

          <Link
            href={`/market/${produk.id}`}
            className={cn(
              "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition-all active:scale-95 cursor-pointer shadow-xs",
              isOutOfStock
                ? "bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed pointer-events-none"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isOutOfStock ? "HABIS" : "DETAIL"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
