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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Menunggu Pembayaran
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700">
            <Package className="h-3.5 w-3.5" /> Sedang Dipersiapkan
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-700">
            <Truck className="h-3.5 w-3.5" /> Dalam Pengiriman
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Pesanan Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/market"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-card border border-border px-4 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Katalog Market</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              Pesanan Saya
            </h1>
            <p className="text-xs text-muted-foreground">
              Pantau status pengadaan dan instruksi pembayaran
            </p>
          </div>
        </div>

        <Link
          href="/market"
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Belanja Produk Lain</span>
        </Link>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-xs",
              activeFilter === f.value
                ? "bg-primary text-primary-foreground scale-102 shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List Pesanan */}
      {filteredPesanan.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Belum Ada Pesanan
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Anda belum memiliki transaksi pesanan pada kategori status ini.
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            Mulai Belanja di Jarimas Market
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPesanan.map((pesanan) => {
            const prod = pesanan.produk;
            return (
              <div
                key={pesanan.id}
                className="overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all hover:shadow-md space-y-4"
              >
                {/* Header Card: ID & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-foreground">
                      #{pesanan.id}
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
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
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
                      <p className="text-xs text-muted-foreground">
                        {pesanan.jumlah} unit x {formatRupiah(prod?.harga || 0)}
                      </p>
                      {pesanan.nomor_resi && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                          <Truck className="h-3.5 w-3.5" />
                          <span>No. Resi: {pesanan.nomor_resi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total & Tombol Aksi */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        Total Tagihan
                      </span>
                      <span className="text-base font-black text-primary">
                        {formatRupiah(pesanan.total_harga)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPesananModal(pesanan)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95"
                    >
                      <Info className="h-4 w-4 text-primary" />
                      <span>Detail & Bayar</span>
                    </button>
                  </div>
                </div>

                {/* Alamat Pengiriman Singkat */}
                <div className="flex items-center gap-1.5 rounded-2xl bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-1">
                    Penerima: <strong>{pesanan.nama_penerima}</strong> ({pesanan.nomor_hp}) — {pesanan.alamat_lengkap}, {pesanan.kelurahan}, {pesanan.kecamatan}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail & Instruksi Pembayaran */}
      {selectedPesananModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedPesananModal(null)}
          />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Rincian Pesanan #{selectedPesananModal.id}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Status: {selectedPesananModal.status_pembayaran.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPesananModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                ✕
              </button>
            </div>

            {/* Instruksi Pembayaran jika Pending */}
            {selectedPesananModal.status_pembayaran === "pending" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Selesaikan Pembayaran Anda</span>
                </div>

                {selectedPesananModal.metode_pembayaran === "qris" ? (
                  <div className="flex flex-col items-center justify-center space-y-2 rounded-xl bg-white p-4 text-center">
                    <QrCode className="h-32 w-32 text-slate-800" />
                    <p className="text-[11px] font-bold text-slate-700">
                      Scan QRIS Resmi JARIMAS KOTA TEGAL
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Mendukung BCA Mobile, Mandiri Livin, GoPay, OVO, Dana, ShopeePay.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white p-3.5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>Rekening Transfer:</span>
                    </div>
                    {selectedPesananModal.metode_pembayaran === "transfer_bca" && (
                      <div>
                        <div className="text-base font-extrabold text-primary">
                          138-092-8172
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Bank BCA a.n. Jarimas Peduli Anak
                        </div>
                      </div>
                    )}
                    {selectedPesananModal.metode_pembayaran === "transfer_mandiri" && (
                      <div>
                        <div className="text-base font-extrabold text-primary">
                          139-00-2918273-1
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Bank Mandiri a.n. Jarimas Official
                        </div>
                      </div>
                    )}
                    {selectedPesananModal.metode_pembayaran === "transfer_bri" && (
                      <div>
                        <div className="text-base font-extrabold text-primary">
                          0102-01-092837-50-1
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Bank BRI a.n. Posyandu Jarimas
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-amber-200 pt-2 text-xs font-bold">
                  <span>Nominal yang Harus Dibayar:</span>
                  <span className="text-base text-primary">
                    {formatRupiah(selectedPesananModal.total_harga)}
                  </span>
                </div>
              </div>
            )}

            {/* Info Lengkap Pengiriman */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                Detail Penerima & Alamat
              </h4>
              <div className="rounded-2xl border border-border bg-background p-3.5 space-y-1">
                <div className="font-bold text-foreground">
                  {selectedPesananModal.nama_penerima} ({selectedPesananModal.nomor_hp})
                </div>
                <div className="text-muted-foreground">
                  {selectedPesananModal.alamat_lengkap}
                </div>
                <div className="text-muted-foreground">
                  Kel. {selectedPesananModal.kelurahan}, Kec. {selectedPesananModal.kecamatan}, Kota Tegal
                </div>
                {selectedPesananModal.catatan && (
                  <div className="text-primary pt-1 text-[11px]">
                    Catatan: &quot;{selectedPesananModal.catatan}&quot;
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedPesananModal(null)}
              className="flex h-11 w-full items-center justify-center rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
