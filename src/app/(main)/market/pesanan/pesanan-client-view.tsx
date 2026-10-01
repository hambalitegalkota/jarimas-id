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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> MENUNGGU BAYAR
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-500 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Package className="h-3.5 w-3.5 text-blue-600" /> DIPROSES
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-500 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
            <Truck className="h-3.5 w-3.5 text-purple-600" /> DIKIRIM
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> SELESAI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-5xl mx-auto w-full gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              TRANSAKSI RESMI
            </span>
            <span className="text-xs font-mono text-slate-500">KOTA TEGAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pesanan Saya
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Pantau status pengadaan sarana posyandu dan instruksi pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/market"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Katalog Sarana</span>
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
              "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer",
              activeFilter === f.value
                ? "bg-blue-700 text-white font-bold shadow-xs border-2 border-blue-700"
                : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List Pesanan */}
      {filteredPesanan.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-4 shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400">
            <ClipboardList className="h-7 w-7 stroke-[1.5px]" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              BELUM ADA PESANAN
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Anda belum memiliki transaksi pesanan pada kategori status ini.
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex min-h-[48px] items-center rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-98"
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
                className="overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 transition-colors hover:border-blue-500 shadow-xs"
              >
                {/* Header Card: ID & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      #{pesanan.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-slate-500" suppressHydrationWarning>
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
                  <div className="flex items-center gap-3.5 sm:col-span-2">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
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
                      <h4 className="line-clamp-2 text-base font-bold text-slate-900 dark:text-slate-100">
                        {prod?.nama || "Produk Jarimas Market"}
                      </h4>
                      <p className="text-xs font-mono text-slate-500">
                        {pesanan.jumlah} Unit x {formatRupiah(prod?.harga || 0)}
                      </p>
                      {pesanan.nomor_resi && (
                        <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <Truck className="h-3.5 w-3.5" />
                          <span>RESI: {pesanan.nomor_resi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total & Tombol Aksi */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-slate-500 block">
                        TOTAL TAGIHAN
                      </span>
                      <span className="text-base sm:text-lg font-bold font-mono text-blue-700 dark:text-blue-400">
                        {formatRupiah(pesanan.total_harga)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPesananModal(pesanan)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition-colors cursor-pointer"
                    >
                      <Info className="h-4 w-4 text-blue-600" />
                      <span>RINCIAN</span>
                    </button>
                  </div>
                </div>

                {/* Alamat Pengiriman Singkat */}
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="line-clamp-1">
                    Penerima: <strong className="text-slate-900 dark:text-slate-100">{pesanan.nama_penerima}</strong> ({pesanan.nomor_hp}) — {pesanan.alamat_lengkap}, {pesanan.kelurahan}, {pesanan.kecamatan}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedPesananModal(null)}
          />

          <div className="relative w-full max-w-lg max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Rincian Pesanan #{selectedPesananModal.id.slice(0, 8)}
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  STATUS: {selectedPesananModal.status_pembayaran.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPesananModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 pb-8 overflow-y-auto flex-1 space-y-5 overscroll-contain">
              {/* Instruksi Pembayaran jika Pending */}
              {selectedPesananModal.status_pembayaran === "pending" && (
                <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-3.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Selesaikan Pembayaran</span>
                  </div>

                  {selectedPesananModal.metode_pembayaran === "qris" ? (
                    <div className="flex flex-col items-center justify-center space-y-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-4 text-center">
                      <QrCode className="h-36 w-36 text-slate-900 dark:text-slate-100" />
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        QRIS RESMI JARIMAS KOTA TEGAL
                      </p>
                      <p className="text-xs text-slate-500">
                        BCA Mobile, Mandiri Livin, GoPay, OVO, Dana, ShopeePay.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>Rekening Transfer:</span>
                      </div>
                      {selectedPesananModal.metode_pembayaran === "transfer_bca" && (
                        <div>
                          <div className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400">
                            138-092-8172
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Bank BCA a.n. Jarimas Peduli Anak
                          </div>
                        </div>
                      )}
                      {selectedPesananModal.metode_pembayaran === "transfer_mandiri" && (
                        <div>
                          <div className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400">
                            139-00-2918273-1
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Bank Mandiri a.n. Jarimas Official
                          </div>
                        </div>
                      )}
                      {selectedPesananModal.metode_pembayaran === "transfer_bri" && (
                        <div>
                          <div className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400">
                            0102-01-092837-50-1
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Bank BRI a.n. Posyandu Jarimas
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-amber-200 dark:border-amber-900/50 pt-3 text-sm font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Nominal Tagihan:</span>
                    <span className="text-lg text-blue-700 dark:text-blue-400 font-mono">
                      {formatRupiah(selectedPesananModal.total_harga)}
                    </span>
                  </div>
                </div>
              )}

              {/* Info Lengkap Pengiriman */}
              <div className="space-y-2 text-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Detail Penerima &amp; Alamat
                </h4>
                <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedPesananModal.nama_penerima} ({selectedPesananModal.nomor_hp})
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs">
                    {selectedPesananModal.alamat_lengkap}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs">
                    Kel. {selectedPesananModal.kelurahan}, Kec. {selectedPesananModal.kecamatan}, Kota Tegal
                  </div>
                  {selectedPesananModal.catatan && (
                    <div className="text-blue-700 dark:text-blue-400 pt-1 text-xs font-medium">
                      Catatan: &quot;{selectedPesananModal.catatan}&quot;
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedPesananModal(null)}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-base font-bold transition-colors cursor-pointer shadow-sm active:scale-98"
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
