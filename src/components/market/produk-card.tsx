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
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      {/* Gambar Produk */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/40">
        <Image
          src={produk.gambar_url || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"}
          alt={produk.nama}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge Kategori */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs">
          <Tag className="h-3 w-3 text-primary" />
          <span>{produk.kategori}</span>
        </div>

        {/* Badge Stok */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/90 px-2.5 py-1 text-xs font-bold text-destructive-foreground backdrop-blur-xs">
              <XCircle className="h-3 w-3" /> Habis
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
              <AlertTriangle className="h-3 w-3" /> Sisa {produk.stok}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-xs">
              <CheckCircle2 className="h-3 w-3" /> Ready
            </span>
          )}
        </div>
      </div>

      {/* Konten Produk */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {produk.nama}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {produk.deskripsi}
          </p>
        </div>

        {/* Harga & Tombol Beli */}
        <div className="pt-2 flex items-center justify-between border-t border-border/60">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Harga Resmi
            </span>
            <span className="text-lg font-extrabold text-primary">
              {formatRupiah(produk.harga)}
            </span>
          </div>

          <Link
            href={`/market/${produk.id}`}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-bold transition-all shadow-xs active:scale-95",
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isOutOfStock ? "Habis" : "Beli"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
