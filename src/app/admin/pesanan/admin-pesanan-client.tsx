"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  MapPin,
  Phone,
  User,
  Loader2,
  Send,
  AlertCircle,
  X,
  CreditCard,
  QrCode,
  Building2,
} from "lucide-react";
import { formatRupiah } from "@/components/market/produk-card";
import { updateStatusPesanan } from "@/app/actions/admin-market";
import type { MarketPesanan, StatusPesanan } from "@/types/database";
import { cn } from "@/lib/utils";

interface AdminPesananClientProps {
  initialPesanan: MarketPesanan[];
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Semua", value: "semua" },
  { label: "Perlu Konfirmasi", value: "pending" },
  { label: "Diproses", value: "diproses" },
  { label: "Dikirim", value: "dikirim" },
  { label: "Selesai", value: "selesai" },
  { label: "Dibatalkan", value: "dibatalkan" },
];

export function AdminPesananClient({
  initialPesanan,
}: AdminPesananClientProps) {
  const [pesananList, setPesananList] =
    useState<MarketPesanan[]>(initialPesanan);
  const [activeTab, setActiveTab] = useState("semua");

  // Modal Resi State
  const [selectedPesananForResi, setSelectedPesananForResi] =
    useState<MarketPesanan | null>(null);
  const [nomorResiInput, setNomorResiInput] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredList = pesananList.filter((p) => {
    if (activeTab === "semua") return true;
    return p.status_pembayaran === activeTab;
  });

  const handleUpdateStatus = (
    pesananId: string,
    statusBaru: StatusPesanan,
    nomorResi?: string
  ) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateStatusPesanan(pesananId, statusBaru, nomorResi);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });

        // Update local state
        setPesananList((prev) =>
          prev.map((item) =>
            item.id === pesananId
              ? {
                  ...item,
                  status_pembayaran: statusBaru,
                  nomor_resi: nomorResi || item.nomor_resi,
                }
              : item
          )
        );

        if (selectedPesananForResi) {
          setSelectedPesananForResi(null);
          setNomorResiInput("");
        }
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const getStatusBadge = (status: StatusPesanan) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-800/60 bg-amber-950/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-400">
            <Clock className="h-3 w-3" /> PENDING PAYMENT
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-blue-800/60 bg-blue-950/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-400">
            <Package className="h-3 w-3" /> PROCESSING
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-cyan-800/60 bg-cyan-950/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400">
            <Truck className="h-3 w-3" /> IN TRANSIT
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-800/60 bg-emerald-950/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> COMPLETED
          </span>
        );
      case "dibatalkan":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-destructive">
            <XCircle className="h-3 w-3" /> CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Deskripsi */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Kelola Transaksi &amp; Pengiriman
        </h1>
        <p className="text-xs text-muted-foreground">
          Konfirmasi pembayaran QRIS/Transfer Bank, kelola nomor resi, dan pantau pengiriman se-Kota Tegal
        </p>
      </div>

      {/* Global Feedback */}
      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-md p-3 text-xs font-medium animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-all cursor-pointer",
              activeTab === tab.value
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Pesanan Masuk */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              Tidak Ada Transaksi
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Tidak ada pesanan masuk pada kategori filter ini.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((pesanan) => {
            const prod = pesanan.produk;
            return (
              <div
                key={pesanan.id}
                className="overflow-hidden rounded-lg border border-border bg-card p-5 space-y-4"
              >
                {/* Header Transaksi */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">
                      #{pesanan.id}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground" suppressHydrationWarning>
                      • {new Date(pesanan.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold uppercase">
                      {pesanan.metode_pembayaran.replace("_", " ")}
                    </span>
                  </div>
                  <div>{getStatusBadge(pesanan.status_pembayaran)}</div>
                </div>

                {/* Konten Produk & Info Pembeli */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Produk Detail */}
                  <div className="flex items-start gap-3 lg:col-span-2">
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
                      <h4 className="line-clamp-2 text-xs font-bold text-foreground">
                        {prod?.nama || "Produk Jarimas Market"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {pesanan.jumlah} unit x {formatRupiah(prod?.harga || 0)}
                      </p>
                      <div className="text-sm font-bold text-foreground font-mono">
                        Total: {formatRupiah(pesanan.total_harga)}
                      </div>
                      {pesanan.nomor_resi && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                          <Truck className="h-3 w-3" />
                          <span>Resi: {pesanan.nomor_resi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Penerima & Alamat */}
                  <div className="rounded-md bg-background border border-border p-3 space-y-1 text-xs">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{pesanan.nama_penerima}</span>
                    </div>
                    <div className="text-muted-foreground font-mono flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{pesanan.nomor_hp}</span>
                    </div>
                    <div className="text-muted-foreground flex items-start gap-1.5 pt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">
                        {pesanan.alamat_lengkap}, {pesanan.kelurahan}, {pesanan.kecamatan}
                      </span>
                    </div>
                    {pesanan.catatan && (
                      <div className="text-zinc-400 text-[11px] pt-1 italic">
                        Catatan: &quot;{pesanan.catatan}&quot;
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi Status Admin */}
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                  {pesanan.status_pembayaran === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(pesanan.id, "dibatalkan")
                        }
                        disabled={isPending}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-xs font-medium text-destructive hover:bg-destructive/20 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Batalkan Pesanan</span>
                      </button>

                      <button
                        onClick={() =>
                          handleUpdateStatus(pesanan.id, "diproses")
                        }
                        disabled={isPending}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-3 text-xs font-bold cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Konfirmasi Bayar</span>
                      </button>
                    </>
                  )}

                  {pesanan.status_pembayaran === "diproses" && (
                    <button
                      onClick={() => {
                        setSelectedPesananForResi(pesanan);
                        setNomorResiInput(`JRM-TG${Date.now().toString().slice(-6)}`);
                      }}
                      disabled={isPending}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 text-xs font-bold cursor-pointer shadow-xs"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Input Resi &amp; Kirim</span>
                    </button>
                  )}

                  {pesanan.status_pembayaran === "dikirim" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(pesanan.id, "selesai")
                      }
                      disabled={isPending}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-950/60 border border-emerald-700 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Tandai Selesai Diterima</span>
                    </button>
                  )}

                  {pesanan.status_pembayaran === "selesai" && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ✓ TRANSAKSI SELESAI
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Input Nomor Resi */}
      {selectedPesananForResi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setSelectedPesananForResi(null)}
          />

          <div className="relative w-full max-w-md max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                  <Truck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-mono font-bold text-foreground">
                  [INPUT RESI PENGIRIMAN]
                </h3>
              </div>
              <button
                onClick={() => setSelectedPesananForResi(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 pb-12 sm:pb-16 overflow-y-auto flex-1 space-y-4 overscroll-contain">
              <p className="text-xs text-muted-foreground">
                Masukkan nomor resi ekspedisi/kurir internal Jarimas untuk pesanan <strong>#{selectedPesananForResi.id}</strong> ({selectedPesananForResi.nama_penerima}).
              </p>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Nomor Resi / Bukti Antar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JRM-TG019283"
                  value={nomorResiInput}
                  onChange={(e) => setNomorResiInput(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedPesananForResi(null)}
                  className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!nomorResiInput || isPending}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedPesananForResi.id,
                      "dikirim",
                      nomorResiInput
                    )
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
