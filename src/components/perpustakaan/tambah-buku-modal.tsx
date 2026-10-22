"use client";

import { useState, useTransition } from "react";
import { Plus, X, BookPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createBukuDigital } from "@/app/actions/buku-digital";
import type { BukuDigitalFormData } from "@/types/database";

const PILIHAN_KATEGORI = [
  "Modul Parenting",
  "Panduan Kader",
  "Buku Cerita Anak",
  "Kesehatan & Gizi",
  "Pendidikan & PAUD",
  "Keterampilan Warga",
  "Umum",
];

interface TambahBukuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TambahBukuModal({ isOpen, onClose, onSuccess }: TambahBukuModalProps) {
  const [formData, setFormData] = useState<BukuDigitalFormData>({
    judul: "",
    kategori: "Modul Parenting",
    url_sampul: "",
    sinopsis: "",
    url_baca: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.judul.trim()) {
      setErrorMessage("Judul buku/modul wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await createBukuDigital(formData);
      if (res.success) {
        setSuccessMessage("Buku berhasil ditambahkan ke direktori!");
        setTimeout(() => {
          setFormData({
            judul: "",
            kategori: "Modul Parenting",
            url_sampul: "",
            sinopsis: "",
            url_baca: "",
          });
          setSuccessMessage(null);
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5 bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Tambah Buku / Modul Baru
              </h2>
              <p className="text-2xs text-muted-foreground">
                Kurasi bacaan edukatif untuk warga dan kader
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-900 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Judul Buku */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Judul Buku / Modul <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Modul Stimulasi Tumbuh Kembang Balita"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
            >
              {PILIHAN_KATEGORI.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          {/* URL Sampul */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              URL Gambar Sampul (Cover Image)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... atau tautan gambar"
              value={formData.url_sampul}
              onChange={(e) => setFormData({ ...formData, url_sampul: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
            <p className="text-2xs text-muted-foreground">
              Kosongkan jika belum memiliki tautan cover, sistem akan memakai placeholder otomatis.
            </p>
          </div>

          {/* URL Baca / Unduh */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              URL Tautan Baca / File PDF
            </label>
            <input
              type="url"
              placeholder="https://example.com/buku.pdf atau tautan web bacaan"
              value={formData.url_baca}
              onChange={(e) => setFormData({ ...formData, url_baca: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Sinopsis */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Sinopsis / Ringkasan Buku
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan ringkasan isi buku, topik bahasan, atau panduan singkat..."
              value={formData.sinopsis}
              onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })}
              className="w-full rounded-lg border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-primary-foreground shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Simpan Buku</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
