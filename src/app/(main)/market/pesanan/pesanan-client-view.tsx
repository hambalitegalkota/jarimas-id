"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  QrCode,
  Building2,
  MapPin,
  ExternalLink,
  ShoppingBag,
  Info,
} from "lucide-react";
import { formatRupiah } from "@/components/market/produk-card";
import type { MarketPesanan, StatusPesanan } from "@/types/database";
import { cn } from "@/lib/utils";

interface PesananClientViewProps {
  initialPesanan: MarketPesanan[];
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "Semua", value: "semua" },
  { label: "Menunggu Pembayaran", value: "pending" },
  { label: "Diproses", value: "diproses" },
  { label: "Dikirim", value: "dikirim" },
  { label: "Selesai", value: "selesai" },
];

export function PesananClientView({
  initialPesanan = [],
}: PesananClientViewProps) {
  const [activeFilter, setActiveFilter] = useState("semua");
  const [selectedPesananModal, setSelectedPesananModal] =
    useState<MarketPesanan | null>(null);

  const safePesanan = Array.isArray(initialPesanan) ? initialPesanan : [];

  const filteredPesanan = safePesanan.filter((item) => {
    if (activeFilter === "semua") return true;
    return item.status_pembayaran === activeFilter;
  });

  const getStatusBadge = (status: StatusPesanan) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-400">
            <Clock className="h-3 w-3" /> MENUNGGU PEMBAYARAN
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan-400">
            <Package className="h-3 w-3" /> DIPROSES
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 text-[11px] font-mono font-bold text-purple-400">
            <Truck className="h-3 w-3" /> DALAM PENGIRIMAN
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> SELESAI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted border border-border px-2.5 py-1 text-[11px] font-mono font-bold text-muted-foreground">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="cyber-badge">TRANSAKSI MARKET</span>
            <span className="text-xs font-mono text-muted-foreground">KOTA TEGAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">
            Pesanan Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Pantau status pengadaan resmi dan instruksi pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/market"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-muted border border-border px-3 text-xs font-mono text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>KATALOG MARKET</span>
          </Link>
        </div>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-md px-3 py-1.5 text-xs font-mono transition-all cursor-pointer",
              activeFilter === f.value
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List Pesanan */}
      {filteredPesanan.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <ClipboardList className="h-6 w-6 stroke-[1.5px]" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
              BELUM ADA PESANAN
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Anda belum memiliki transaksi pesanan pada kategori status ini.
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex h-8 items-center rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            MULAI BELANJA
          </Link>
        </div>
      ) : (
        <div className="space-y-4 pb-16">
          {filteredPesanan.map((pesanan) => {
            const prod = pesanan.produk;
            return (
              <div
                key={pesanan.id}
                className="overflow-hidden rounded-lg border border-border bg-card p-5 space-y-4 transition-colors hover:border-zinc-700"
              >
                {/* Header Card: ID & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs font-bold text-foreground">
                      #{pesanan.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      •{" "}
                      {new Date(pesanan.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <div>{getStatusBadge(pesanan.status_pembayaran)}</div>
                </div>

                {/* Konten Produk & Info Penerima */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Item Produk */}
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      {prod?.gambar_url && (
                        <Image
                          src={prod.gambar_url}
                          alt={prod.nama || "Produk"}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="line-clamp-2 text-sm font-bold text-foreground">
                        {prod?.nama || "Produk Jarimas Market"}
                      </h4>
                      <p className="text-xs font-mono text-muted-foreground">
                        {pesanan.jumlah} UNIT x {formatRupiah(prod?.harga || 0)}
                      </p>
                      {pesanan.nomor_resi && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          <Truck className="h-3 w-3" />
                          <span>RESI: {pesanan.nomor_resi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total & Tombol Aksi */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        TOTAL TAGIHAN
                      </span>
                      <span className="text-base font-bold font-mono text-foreground">
                        {formatRupiah(pesanan.total_harga)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPesananModal(pesanan)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-muted px-3 text-xs font-mono text-foreground hover:bg-muted/80 active:scale-95 transition-colors"
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>RINCIAN</span>
                    </button>
                  </div>
                </div>

                {/* Alamat Pengiriman Singkat */}
                <div className="flex items-center gap-1.5 rounded-md bg-muted/60 border border-border px-3 py-2 text-xs text-muted-foreground font-mono">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-1">
                    PENERIMA: <strong className="text-foreground">{pesanan.nama_penerima}</strong> ({pesanan.nomor_hp}) — {pesanan.alamat_lengkap}, {pesanan.kelurahan}, {pesanan.kecamatan}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail & Instruksi Pembayaran */}
      {selectedPesananModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setSelectedPesananModal(null)}
          />

          <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-border shrink-0 bg-card">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                  RINCIAN PESANAN #{selectedPesananModal.id.slice(0, 8)}
                </h3>
                <p className="text-xs font-mono text-muted-foreground">
                  STATUS: {selectedPesananModal.status_pembayaran.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPesananModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Instruksi Pembayaran jika Pending */}
              {selectedPesananModal.status_pembayaran === "pending" && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-500 dark:text-amber-400">
                    <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span>SELESAIKAN PEMBAYARAN</span>
                  </div>

                  {selectedPesananModal.metode_pembayaran === "qris" ? (
                    <div className="flex flex-col items-center justify-center space-y-2 rounded-md bg-background border border-border p-4 text-center">
                      <QrCode className="h-32 w-32 text-foreground" />
                      <p className="text-[11px] font-mono font-bold text-foreground">
                        QRIS RESMI JARIMAS KOTA TEGAL
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        BCA Mobile, Mandiri Livin, GoPay, OVO, Dana, ShopeePay.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md bg-background border border-border p-3.5 space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-foreground font-bold">
                        <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>REKENING TRANSFER:</span>
                      </div>
                      {selectedPesananModal.metode_pembayaran === "transfer_bca" && (
                        <div>
                          <div className="text-base font-bold font-mono text-foreground">
                            138-092-8172
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Bank BCA a.n. Jarimas Peduli Anak
                          </div>
                        </div>
                      )}
                      {selectedPesananModal.metode_pembayaran === "transfer_mandiri" && (
                        <div>
                          <div className="text-base font-bold font-mono text-foreground">
                            139-00-2918273-1
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Bank Mandiri a.n. Jarimas Official
                          </div>
                        </div>
                      )}
                      {selectedPesananModal.metode_pembayaran === "transfer_bri" && (
                        <div>
                          <div className="text-base font-bold font-mono text-foreground">
                            0102-01-092837-50-1
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Bank BRI a.n. Posyandu Jarimas
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-amber-500/20 pt-2 text-xs font-mono font-bold">
                    <span className="text-muted-foreground">NOMINAL TOTAL:</span>
                    <span className="text-base text-foreground">
                      {formatRupiah(selectedPesananModal.total_harga)}
                    </span>
                  </div>
                </div>
              )}

              {/* Info Lengkap Pengiriman */}
              <div className="space-y-2 text-xs">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Detail Penerima &amp; Alamat
                </h4>
                <div className="rounded-md border border-border bg-background p-3.5 space-y-1 font-mono">
                  <div className="font-bold text-foreground">
                    {selectedPesananModal.nama_penerima} ({selectedPesananModal.nomor_hp})
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {selectedPesananModal.alamat_lengkap}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Kel. {selectedPesananModal.kelurahan}, Kec. {selectedPesananModal.kecamatan}, Kota Tegal
                  </div>
                  {selectedPesananModal.catatan && (
                    <div className="text-emerald-600 dark:text-emerald-400 pt-1 text-[11px]">
                      Catatan: &quot;{selectedPesananModal.catatan}&quot;
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 pb-1">
                <button
                  onClick={() => setSelectedPesananModal(null)}
                  className="flex h-9 w-full items-center justify-center rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  TUTUP RINCIAN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
