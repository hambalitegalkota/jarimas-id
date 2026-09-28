"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  User,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { formatRupiah } from "@/components/market/produk-card";
import { createPesanan } from "@/app/actions/market";
import { KOTA_TEGAL_DATA } from "@/lib/constants/tegal-data";
import type { MarketProduk, MetodePembayaran } from "@/types/database";

interface CheckoutClientViewProps {
  produk: MarketProduk;
  initialQty: number;
  userProfile?: {
    nama_lengkap?: string;
    nomor_hp?: string | null;
  } | null;
}

export function CheckoutClientView({
  produk,
  initialQty,
  userProfile,
}: CheckoutClientViewProps) {
  const router = useRouter();

  const [jumlah] = useState(initialQty > 0 ? initialQty : 1);
  const [namaPenerima, setNamaPenerima] = useState(
    userProfile?.nama_lengkap || ""
  );
  const [nomorHp, setNomorHp] = useState(userProfile?.nomor_hp || "");
  const [kecamatan, setKecamatan] = useState("Tegal Timur");
  const [kelurahan, setKelurahan] = useState("Kejambon");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [catatan, setCatatan] = useState("");
  const [metodePembayaran, setMetodePembayaran] =
    useState<MetodePembayaran>("qris");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalHarga = produk.harga * jumlah;
  const ongkir = 0; // Gratis ongkir untuk seluruh wilayah Kota Tegal
  const totalPembayaran = totalHarga + ongkir;

  // Daftar kelurahan berdasarkan kecamatan yang dipilih
  const availableKelurahan = Object.keys(
    KOTA_TEGAL_DATA[kecamatan]?.kelurahan || {}
  );

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKec = e.target.value;
    setKecamatan(newKec);
    const kelList = Object.keys(KOTA_TEGAL_DATA[newKec]?.kelurahan || {});
    if (kelList.length > 0) {
      setKelurahan(kelList[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("produkId", produk.id);
    formData.append("jumlah", jumlah.toString());
    formData.append("namaPenerima", namaPenerima);
    formData.append("nomorHp", nomorHp);
    formData.append("alamatLengkap", alamatLengkap);
    formData.append("kecamatan", kecamatan);
    formData.append("kelurahan", kelurahan);
    formData.append("metodePembayaran", metodePembayaran);
    if (catatan) formData.append("catatan", catatan);

    startTransition(async () => {
      const res = await createPesanan(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setTimeout(() => {
          router.push("/market/pesanan");
        }, 1200);
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Back */}
      <div className="flex items-center gap-3">
        <Link
          href={`/market/${produk.id}`}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3 text-xs font-medium text-foreground transition-all hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Checkout Pesanan
          </h1>
          <p className="text-xs text-muted-foreground">
            Selesaikan pesanan logistik dan perlengkapan posyandu
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Kolom Kiri: Form Alamat & Metode Bayar (2 cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Bagian 1: Alamat Pengiriman */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    1. Alamat Pengiriman
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pengiriman resmi ke wilayah Kota Tegal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nama Penerima */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Nama Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Rahayu (Kader Posyandu)"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
                  />
                </div>

                {/* Nomor HP/WA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
                  />
                </div>

                {/* Kecamatan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Kecamatan *
                  </label>
                  <select
                    value={kecamatan}
                    onChange={handleKecamatanChange}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-zinc-500 focus:outline-hidden"
                  >
                    {Object.keys(KOTA_TEGAL_DATA).map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kelurahan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Kelurahan *
                  </label>
                  <select
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-zinc-500 focus:outline-hidden"
                  >
                    {availableKelurahan.map((kel) => (
                      <option key={kel} value={kel}>
                        {kel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alamat Lengkap */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Alamat Lengkap (Jalan, RT/RW, Patokan Rumah / Balai Posyandu) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Contoh: Jl. Ki Gede Sebayu No. 12, RT 03 RW 02 (Sebelah Balai RW / Depan Posyandu Kamboja)"
                    value={alamatLengkap}
                    onChange={(e) => setAlamatLengkap(e.target.value)}
                    className="w-full rounded-md border border-border bg-background p-3 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
                  />
                </div>

                {/* Catatan Kurir */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Catatan Khusus Pengiriman (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Titipkan di pos satpam jika tidak ada orang"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-zinc-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Pilihan Metode Pembayaran */}
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    2. Metode Pembayaran
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pilih cara pembayaran aman & instan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* QRIS */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-all ${
                    metodePembayaran === "qris"
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="qris"
                    checked={metodePembayaran === "qris"}
                    onChange={() => setMetodePembayaran("qris")}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                      <span>QRIS (Gopay / OVO / Dana / BCA)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Scan kode QR instan dari semua aplikasi e-wallet & m-banking.
                    </p>
                  </div>
                </label>

                {/* Transfer BCA */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-all ${
                    metodePembayaran === "transfer_bca"
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_bca"
                    checked={metodePembayaran === "transfer_bca"}
                    onChange={() => setMetodePembayaran("transfer_bca")}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Transfer Bank BCA</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Rek: 138-092-8172
                    </p>
                  </div>
                </label>

                {/* Transfer Mandiri */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-all ${
                    metodePembayaran === "transfer_mandiri"
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_mandiri"
                    checked={metodePembayaran === "transfer_mandiri"}
                    onChange={() => setMetodePembayaran("transfer_mandiri")}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Transfer Bank Mandiri</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Rek: 139-00-2918273-1
                    </p>
                  </div>
                </label>

                {/* Transfer BRI */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-all ${
                    metodePembayaran === "transfer_bri"
                      ? "border-emerald-500 bg-emerald-950/20"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_bri"
                    checked={metodePembayaran === "transfer_bri"}
                    onChange={() => setMetodePembayaran("transfer_bri")}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Transfer Bank BRI</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Rek: 0102-01-092837-50-1
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Belanja (1 col) */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">
                Ringkasan Pesanan
              </h2>

              {/* Item Produk */}
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  <Image
                    src={
                      produk.gambar_url ||
                      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={produk.nama}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="line-clamp-1 text-xs font-semibold text-foreground">
                    {produk.nama}
                  </h3>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {jumlah} x {formatRupiah(produk.harga)}
                  </div>
                  <div className="text-xs font-bold text-foreground font-mono">
                    {formatRupiah(totalHarga)}
                  </div>
                </div>
              </div>

              {/* Rincian Biaya */}
              <div className="space-y-2 border-t border-border pt-4 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal Produk</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatRupiah(totalHarga)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Ongkir (Kota Tegal)</span>
                  <span className="font-mono font-medium text-emerald-400">
                    Rp 0 (Gratis)
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-bold text-foreground">
                  <span>Total Bayar</span>
                  <span className="text-base font-black text-foreground font-mono">
                    {formatRupiah(totalPembayaran)}
                  </span>
                </div>
              </div>

              {/* Feedback Error / Success */}
              {feedback && (
                <div
                  className={`flex items-start gap-2 rounded-md p-3 text-xs ${
                    feedback.type === "success"
                      ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
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

              {/* Tombol Submit Pesanan */}
              <button
                type="submit"
                disabled={isPending}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 text-xs font-bold text-background transition-all hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Konfirmasi & Bayar</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono">ENCRYPTED CHECKOUT</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
