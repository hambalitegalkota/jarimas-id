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
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            Manajemen Produk Jarimas Market
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola inventaris sarana resmi Posyandu, PAUD, dan gizi balita Kota Tegal
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tambah Produk Baru</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Total Jenis Produk
            </span>
            <span className="text-2xl font-black text-foreground">
              {products.length}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Total Stok Tersedia
            </span>
            <span className="text-2xl font-black text-foreground">
              {totalStok} unit
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Estimasi Nilai Stok
            </span>
            <span className="text-lg font-black text-primary">
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
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
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
                <div className="absolute top-3 left-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[11px] font-bold text-foreground backdrop-blur-md">
                  {prod.kategori}
                </div>
                <div className="absolute top-3 right-3">
                  {prod.stok <= 0 ? (
                    <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      Habis
                    </span>
                  ) : (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      Stok: {prod.stok}
                    </span>
                  )}
                </div>
              </div>

              {/* Konten */}
              <div className="p-4 space-y-2">
                <h3 className="line-clamp-2 text-sm font-bold text-foreground">
                  {prod.nama}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {prod.deskripsi}
                </p>
                <div className="text-base font-black text-primary pt-1">
                  {formatRupiah(prod.harga)}
                </div>
              </div>
            </div>

            {/* Aksi Edit */}
            <div className="border-t border-border p-4 bg-muted/20 flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                ID: #{prod.id}
              </span>
              <button
                onClick={() => handleOpenEditModal(prod)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted active:scale-95"
              >
                <Edit className="h-3.5 w-3.5 text-primary" />
                <span>Edit Produk</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <h2 className="text-base font-black text-foreground">
                  {editingProduct ? "Edit Produk Market" : "Tambah Produk Baru"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Nama Produk */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paket Alat Permainan Edukatif (APE Kit)"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Kategori *
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriMarket)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
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
                  <label className="text-xs font-bold text-foreground">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="Contoh: 145000"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Jumlah Stok *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 25"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* URL Gambar */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  URL Foto Produk *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={gambarUrl}
                  onChange={(e) => setGambarUrl(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Deskripsi Lengkap *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan spesifikasi, fungsi, sertifikasi, dan manfaat produk..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs font-bold text-foreground cursor-pointer"
                >
                  Tampilkan produk di katalog publik Jarimas Market
                </label>
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`flex items-start gap-2 rounded-2xl p-3 text-xs ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
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
                  className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Produk</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
