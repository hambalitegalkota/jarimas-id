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
import { PrintButton } from "@/components/ui/print-button";
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
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary/10 border border-secondary/30 px-2 py-0.5 text-2xs font-semibold text-secondary">
            <Clock className="h-3 w-3" /> Menunggu Bayar
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/30 px-2 py-0.5 text-2xs font-semibold text-primary">
            <Package className="h-3 w-3" /> Diproses
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-2xs font-semibold text-sky-600 dark:text-sky-400">
            <Truck className="h-3 w-3" /> Dikirim
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2 py-0.5 text-2xs font-semibold text-muted-foreground">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-5xl mx-auto w-full gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-2xs font-bold text-primary">
              TRANSAKSI RESMI
            </span>
            <span className="text-2xs font-mono text-muted-foreground uppercase tracking-wider">KOTA TEGAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Pesanan Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Pantau status pengadaan sarana posyandu dan instruksi pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PrintButton variant="outline" size="sm" className="min-h-[44px] h-11" hideTextOnMobile={true} />
          <Link
            href="/market"
            className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-card border border-border px-4 text-xs font-semibold text-foreground hover:bg-muted/70 hover:border-primary/40 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Katalog Sarana</span>
          </Link>
        </div>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((f) => {
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-4 text-xs font-semibold transition-all cursor-pointer shadow-xs",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List Pesanan */}
      {filteredPesanan.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-10 text-center space-y-4 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground">
            <ClipboardList className="h-6 w-6 stroke-[1.5px]" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">
              Belum Ada Pesanan
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Anda belum memiliki transaksi pesanan pada kategori status ini.
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex min-h-[44px] h-11 items-center rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-5 text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-3 pb-16">
          {filteredPesanan.map((pesanan) => {
            const prod = pesanan.produk;
            return (
              <div
                key={pesanan.id}
                className="overflow-hidden rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 transition-colors hover:border-primary/50 shadow-xs"
              >
                {/* Header Card: ID & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs font-bold text-foreground">
                      #{pesanan.id.slice(0, 8)}
                    </span>
                    <span className="text-2xs text-muted-foreground" suppressHydrationWarning>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center">
                  {/* Item Produk */}
                  <div className="flex items-center gap-3.5 sm:col-span-2">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
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
                      <h4 className="line-clamp-2 text-sm font-semibold text-foreground">
                        {prod?.nama || "Produk Jarimas Market"}
                      </h4>
                      <p className="text-xs font-mono text-muted-foreground">
                        {pesanan.jumlah} Unit x {formatRupiah(prod?.harga || 0)}
                      </p>
                      {pesanan.nomor_resi && (
                        <div className="inline-flex items-center gap-1 text-2xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          <Truck className="h-3 w-3" />
                          <span>RESI: {pesanan.nomor_resi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total & Tombol Aksi */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4 gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Total Tagihan
                      </span>
                      <span className="text-base font-bold font-mono text-primary">
                        {formatRupiah(pesanan.total_harga)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPesananModal(pesanan)}
                      className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3.5 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 active:scale-98 transition-colors cursor-pointer"
                    >
                      <Info className="h-3.5 w-3.5 text-primary" />
                      <span>Rincian</span>
                    </button>
                  </div>
                </div>

                {/* Alamat Pengiriman Singkat */}
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/60 px-3 py-2 text-2xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-1">
                    Penerima: <strong className="text-foreground font-semibold">{pesanan.nama_penerima}</strong> ({pesanan.nomor_hp}) — {pesanan.alamat_lengkap}, {pesanan.kelurahan}, {pesanan.kecamatan}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail & Instruksi Pembayaran */}
      {selectedPesananModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={() => setSelectedPesananModal(null)}
          />

          <div className="relative w-full max-w-lg max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-lg border border-border bg-card shadow-xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-card">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Rincian Pesanan #{selectedPesananModal.id.slice(0, 8)}
                </h3>
                <p className="text-2xs font-mono text-muted-foreground">
                  STATUS: {selectedPesananModal.status_pembayaran.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPesananModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer font-bold text-sm transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain">
              {/* Instruksi Pembayaran jika Pending */}
              {selectedPesananModal.status_pembayaran === "pending" && (
                <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                    <Clock className="h-4 w-4" />
                    <span>Selesaikan Pembayaran</span>
                  </div>

                  {selectedPesananModal.metode_pembayaran === "qris" ? (
                    <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-card border border-border p-4 text-center">
                      <QrCode className="h-32 w-32 text-foreground" />
                      <p className="text-xs font-bold text-foreground">
                        QRIS RESMI JARIMAS KOTA TEGAL
                      </p>
                      <p className="text-2xs text-muted-foreground">
                        BCA Mobile, Mandiri Livin, GoPay, OVO, Dana, ShopeePay.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-card border border-border p-3.5 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-foreground font-semibold">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span>Rekening Transfer:</span>
                      </div>
                      {selectedPesananModal.metode_pembayaran === "transfer_bca" && (
                        <div className="space-y-0.5">
                          <div className="text-base font-bold font-mono text-primary">
                            138-092-8172
                          </div>
                          <div className="text-2xs text-muted-foreground">
                            Bank BCA a.n. Jarimas Peduli Anak
                          </div>
                        </div>
                      )}
                      {selectedPesananModal.metode_pembayaran === "transfer_mandiri" && (
                        <div className="space-y-0.5">
                          <div className="text-base font-bold font-mono text-primary">
                            139-00-2918273-1
                          </div>
                          <div className="text-2xs text-muted-foreground">
                            Bank Mandiri a.n. Jarimas Official
                          </div>
                        </div>
                      )}
                      {selectedPesananModal.metode_pembayaran === "transfer_bri" && (
                        <div className="space-y-0.5">
                          <div className="text-base font-bold font-mono text-primary">
                            0102-01-092837-50-1
                          </div>
                          <div className="text-2xs text-muted-foreground">
                            Bank BRI a.n. Posyandu Jarimas
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-secondary/20 pt-2.5 text-xs font-semibold">
                    <span className="text-muted-foreground">Nominal Tagihan:</span>
                    <span className="text-base text-secondary font-bold font-mono">
                      {formatRupiah(selectedPesananModal.total_harga)}
                    </span>
                  </div>
                </div>
              )}

              {/* Info Lengkap Pengiriman */}
              <div className="space-y-1.5 text-xs">
                <h4 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                  Detail Penerima &amp; Alamat
                </h4>
                <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
                  <div className="font-semibold text-foreground">
                    {selectedPesananModal.nama_penerima} ({selectedPesananModal.nomor_hp})
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {selectedPesananModal.alamat_lengkap}
                  </div>
                  <div className="text-muted-foreground text-2xs">
                    Kel. {selectedPesananModal.kelurahan}, Kec. {selectedPesananModal.kecamatan}, Kota Tegal
                  </div>
                  {selectedPesananModal.catatan && (
                    <div className="text-primary pt-1 text-2xs font-medium">
                      Catatan: &quot;{selectedPesananModal.catatan}&quot;
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedPesananModal(null)}
                  className="flex min-h-[44px] h-11 w-full items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
