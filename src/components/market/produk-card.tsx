"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Tag } from "lucide-react";
import type { MarketProduk } from "@/types/database";
import { cn } from "@/lib/utils";

interface ProdukCardProps {
  produk: MarketProduk;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProdukCard({ produk }: ProdukCardProps) {
  const isOutOfStock = produk.stok <= 0;
  const isLowStock = produk.stok > 0 && produk.stok <= 5;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-zinc-500">
      {/* Gambar Produk */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted border-b border-border">
        <Image
          src={produk.gambar_url || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"}
          alt={produk.nama}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
        />

        {/* Badge Kategori */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-background/90 border border-border px-2 py-0.5 text-[10px] font-mono text-foreground backdrop-blur-xs">
          <Tag className="h-3 w-3 text-emerald-400" />
          <span>{produk.kategori.toUpperCase()}</span>
        </div>

        {/* Badge Stok */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/90 px-2 py-0.5 text-[10px] font-mono font-bold text-destructive-foreground backdrop-blur-xs">
              <XCircle className="h-3 w-3" /> HABIS
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 backdrop-blur-xs">
              <AlertTriangle className="h-3 w-3" /> SISA {produk.stok}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 backdrop-blur-xs">
              <CheckCircle2 className="h-3 w-3" /> READY
            </span>
          )}
        </div>
      </div>

      {/* Konten Produk */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-sm font-bold text-foreground">
            {produk.nama}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {produk.deskripsi}
          </p>
        </div>

        {/* Harga & Tombol Beli */}
        <div className="pt-3 flex items-center justify-between border-t border-border">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground block">
              HARGA RESMI
            </span>
            <span className="text-base font-bold font-mono text-foreground">
              {formatRupiah(produk.harga)}
            </span>
          </div>

          <Link
            href={`/market/${produk.id}`}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-xs",
              isOutOfStock
                ? "bg-muted border border-border text-muted-foreground cursor-not-allowed pointer-events-none"
                : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50"
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{isOutOfStock ? "HABIS" : "DETAIL"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
