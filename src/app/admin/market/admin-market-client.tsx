"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Edit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  Loader2,
  Save,
  X,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { formatRupiah } from "@/components/market/produk-card";
import { upsertProduk } from "@/app/actions/admin-market";
import type { MarketProduk, KategoriMarket } from "@/types/database";

const KATEGORI_OPTIONS: KategoriMarket[] = [
  "Kesehatan & Gizi",
  "Alat Posyandu",
  "Edukasi PAUD",
  "Merchandise & Seragam",
  "Buku & Modul",
];

interface AdminMarketClientProps {
  initialProducts: MarketProduk[];
}

export function AdminMarketClient({ initialProducts }: AdminMarketClientProps) {
  const [products, setProducts] = useState<MarketProduk[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketProduk | null>(
    null
  );

  // Form State
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState<KategoriMarket>("Kesehatan & Gizi");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [gambarUrl, setGambarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNama("");
    setDeskripsi("");
    setKategori("Kesehatan & Gizi");
    setHarga("");
    setStok("");
    setGambarUrl(
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
    );
    setIsActive(true);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: MarketProduk) => {
    setEditingProduct(prod);
    setNama(prod.nama);
    setDeskripsi(prod.deskripsi);
    setKategori(prod.kategori as KategoriMarket);
    setHarga(prod.harga.toString());
    setStok(prod.stok.toString());
    setGambarUrl(prod.gambar_url);
    setIsActive(prod.is_active);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    if (editingProduct) {
      formData.append("id", editingProduct.id);
    }
    formData.append("nama", nama);
    formData.append("deskripsi", deskripsi);
    formData.append("kategori", kategori);
    formData.append("harga", harga);
    formData.append("stok", stok);
    formData.append("gambarUrl", gambarUrl);
    formData.append("isActive", isActive ? "true" : "false");

    startTransition(async () => {
      const res = await upsertProduk(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });

        // Update local state
        const updatedItem: MarketProduk = {
          id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
          nama,
          deskripsi,
          kategori,
          harga: parseInt(harga, 10) || 0,
          stok: parseInt(stok, 10) || 0,
          gambar_url: gambarUrl,
          is_active: isActive,
        };

        setProducts((prev) => {
          if (editingProduct) {
            return prev.map((p) => (p.id === editingProduct.id ? updatedItem : p));
          } else {
            return [updatedItem, ...prev];
          }
        });

        setTimeout(() => {
          setIsModalOpen(false);
        }, 1000);
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const totalStok = products.reduce((acc, p) => acc + (p.stok || 0), 0);
  const totalValue = products.reduce(
    (acc, p) => acc + (p.harga || 0) * (p.stok || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Manajemen Produk Jarimas Market
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola inventaris sarana Posyandu, PAUD, dan gizi balita Kota Tegal
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-4 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3.5 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground block">
              Total Jenis Produk
            </span>
            <span className="text-xl font-mono font-bold text-foreground">
              {products.length}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3.5 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground block">
              Total Stok Tersedia
            </span>
            <span className="text-xl font-mono font-bold text-foreground">
              {totalStok} UNIT
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3.5 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 border border-secondary/20 text-secondary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground block">
              Estimasi Nilai Stok
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-secondary">
              {formatRupiah(totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid List Produk Admin */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="overflow-hidden rounded-lg border border-border bg-card flex flex-col justify-between shadow-xs transition-colors hover:border-primary/50"
          >
            <div>
              {/* Gambar & Kategori */}
              <div className="relative aspect-16/9 w-full bg-muted">
                <Image
                  src={
                    prod.gambar_url ||
                    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={prod.nama}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2.5 left-2.5 rounded-md bg-card/90 px-2 py-0.5 text-2xs font-medium text-foreground border border-border backdrop-blur-xs">
                  {prod.kategori}
                </div>
                <div className="absolute top-2.5 right-2.5">
                  {prod.stok <= 0 ? (
                    <span className="rounded-md bg-destructive/90 px-2 py-0.5 text-2xs font-semibold text-destructive-foreground">
                      HABIS
                    </span>
                  ) : (
                    <span className="rounded-md bg-card/90 border border-border px-2 py-0.5 text-2xs font-mono font-semibold text-primary backdrop-blur-xs">
                      STOK: {prod.stok}
                    </span>
                  )}
                </div>
              </div>

              {/* Konten */}
              <div className="p-4 space-y-1.5">
                <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-foreground">
                  {prod.nama}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                  {prod.deskripsi}
                </p>
                <div className="text-sm font-bold text-primary font-mono pt-1">
                  {formatRupiah(prod.harga)}
                </div>
              </div>
            </div>

            {/* Aksi Edit */}
            <div className="border-t border-border/70 p-3 bg-muted/20 flex items-center justify-between">
              <span className="text-2xs font-mono text-muted-foreground">
                ID: #{prod.id.slice(0, 8)}
              </span>
              <button
                onClick={() => handleOpenEditModal(prod)}
                className="inline-flex min-h-[36px] h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 cursor-pointer transition-colors shadow-xs"
              >
                <Edit className="h-3 w-3 text-primary" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-lg border border-border bg-card shadow-xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Package className="h-4 w-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-foreground">
                  {editingProduct ? "Edit Produk Sarana" : "Tambah Produk Sarana Baru"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {/* Nama Produk */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Nama Produk <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paket Alat Permainan Edukatif (APE Kit)"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="h-11 min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Kategori <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriMarket)}
                    className="h-11 min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  >
                    {KATEGORI_OPTIONS.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Harga & Stok Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Harga Satuan (Rp) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      placeholder="Contoh: 145000"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      className="h-11 min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-xs font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Jumlah Stok <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Contoh: 25"
                      value={stok}
                      onChange={(e) => setStok(e.target.value)}
                      className="h-11 min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-xs font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* URL Gambar */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    URL Foto Produk <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={gambarUrl}
                    onChange={(e) => setGambarUrl(e.target.value)}
                    className="h-11 min-h-[44px] w-full rounded-lg border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Deskripsi Lengkap <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jelaskan spesifikasi, fungsi, sertifikasi, dan manfaat produk..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden transition-all"
                  />
                </div>

                {/* Status Aktif */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <label
                    htmlFor="isActiveToggle"
                    className="text-xs font-medium text-foreground cursor-pointer"
                  >
                    Tampilkan produk di katalog publik Jarimas Market
                  </label>
                </div>

                {/* Feedback */}
                {feedback && (
                  <div
                    className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
                      feedback.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex min-h-[44px] h-11 items-center rounded-lg border border-border bg-card px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-5 text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer transition-all active:scale-98"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Simpan Produk</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
