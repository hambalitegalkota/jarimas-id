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
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50 shadow-xs">
      {/* Gambar Produk */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted border-b border-border">
        <Image
          src={produk.gambar_url || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"}
          alt={produk.nama}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge Kategori */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-background/90 border border-border px-2.5 py-1 text-2xs font-semibold text-foreground shadow-2xs backdrop-blur-xs">
          <Tag className="h-3 w-3 text-primary" />
          <span>{produk.kategori}</span>
        </div>

        {/* Badge Stok */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive text-destructive-foreground px-2 py-0.5 text-2xs font-semibold shadow-xs">
              <XCircle className="h-3 w-3" /> STOK HABIS
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground px-2 py-0.5 text-2xs font-semibold shadow-xs">
              <AlertTriangle className="h-3 w-3" /> SISA {produk.stok}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-2xs font-semibold shadow-xs">
              <CheckCircle2 className="h-3 w-3" /> TERSEDIA
            </span>
          )}
        </div>
      </div>

      {/* Konten Produk */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-foreground">
            {produk.nama}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {produk.deskripsi}
          </p>
        </div>

        {/* Harga & Tombol Beli */}
        <div className="pt-3 flex items-center justify-between border-t border-border gap-2">
          <div>
            <span className="text-2xs font-semibold text-muted-foreground block uppercase">
              Harga Katalog
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-primary">
              {formatRupiah(produk.harga)}
            </span>
          </div>

          <Link
            href={`/market/${produk.id}`}
            className={cn(
              "inline-flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs",
              isOutOfStock
                ? "bg-muted border border-border text-muted-foreground cursor-not-allowed pointer-events-none"
                : "bg-primary hover:bg-primary-hover text-primary-foreground"
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{isOutOfStock ? "HABIS" : "DETAIL"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
