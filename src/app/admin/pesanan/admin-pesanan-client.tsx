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
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Menunggu Pembayaran
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-700">
            <Package className="h-3.5 w-3.5" /> Sedang Diproses
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-3 py-1 text-xs font-bold text-purple-700">
            <Truck className="h-3.5 w-3.5" /> Dalam Pengiriman
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
          </span>
        );
      case "dibatalkan":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
            <XCircle className="h-3.5 w-3.5" /> Dibatalkan
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
        <h1 className="text-xl sm:text-2xl font-black text-foreground">
          Kelola Transaksi & Pengiriman
        </h1>
        <p className="text-xs text-muted-foreground">
          Konfirmasi pembayaran QRIS/Transfer Bank, kelola nomor resi, dan pantau pengiriman se-Kota Tegal
        </p>
      </div>

      {/* Global Feedback */}
      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-2xl p-4 text-xs font-medium animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
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
              "inline-flex shrink-0 items-center rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-xs",
              activeTab === tab.value
                ? "bg-accent text-accent-foreground scale-102 shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Pesanan Masuk */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
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
                className="overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all hover:shadow-md space-y-4"
              >
                {/* Header Transaksi */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground">
                      #{pesanan.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {new Date(pesanan.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-extrabold uppercase">
                      {pesanan.metode_pembayaran.replace("_", " ")}
                    </span>
                  </div>
                  <div>{getStatusBadge(pesanan.status_pembayaran)}</div>
                </div>

                {/* Konten Produk & Info Pembeli */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Produk Detail */}
                  <div className="flex items-start gap-3 lg:col-span-2">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
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
                      <div className="text-sm font-black text-primary">
                        Total: {formatRupiah(pesanan.total_harga)}
                      </div>
                      {pesanan.nomor_resi && (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-700">
                          <Truck className="h-3.5 w-3.5" />
                          <span>Resi: {pesanan.nomor_resi}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Penerima & Alamat */}
                  <div className="rounded-2xl bg-muted/40 p-3.5 space-y-1 text-xs">
                    <div className="font-bold text-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>{pesanan.nama_penerima}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>{pesanan.nomor_hp}</span>
                    </div>
                    <div className="text-muted-foreground flex items-start gap-1 pt-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {pesanan.alamat_lengkap}, {pesanan.kelurahan}, {pesanan.kecamatan}
                      </span>
                    </div>
                    {pesanan.catatan && (
                      <div className="text-accent text-[11px] pt-1">
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
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-destructive hover:bg-muted"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Batalkan Pesanan</span>
                      </button>

                      <button
                        onClick={() =>
                          handleUpdateStatus(pesanan.id, "diproses")
                        }
                        disabled={isPending}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Konfirmasi Pembayaran Diterima</span>
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
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-purple-600 px-4 text-xs font-bold text-white hover:bg-purple-700 shadow-xs"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Input Resi & Kirim Barang</span>
                    </button>
                  )}

                  {pesanan.status_pembayaran === "dikirim" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(pesanan.id, "selesai")
                      }
                      disabled={isPending}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Tandai Selesai Diterima</span>
                    </button>
                  )}

                  {pesanan.status_pembayaran === "selesai" && (
                    <span className="text-xs font-bold text-emerald-600">
                      ✓ Transaksi Telah Selesai
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedPesananForResi(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                  <Truck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black text-foreground">
                  Input Resi Pengiriman
                </h3>
              </div>
              <button
                onClick={() => setSelectedPesananForResi(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Masukkan nomor resi ekspedisi/kurir internal Jarimas untuk pesanan <strong>#{selectedPesananForResi.id}</strong> ({selectedPesananForResi.nama_penerima}).
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Nomor Resi / Bukti Antar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JRM-TG019283"
                  value={nomorResiInput}
                  onChange={(e) => setNomorResiInput(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs font-bold text-foreground focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedPesananForResi(null)}
                  className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-muted"
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
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-purple-600 px-5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
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
