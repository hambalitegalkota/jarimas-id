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
import { PrintButton } from "@/components/ui/print-button";
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
    <div className="flex flex-col flex-1 px-4 py-5 sm:px-6 md:px-8 max-w-5xl mx-auto w-full gap-5">
      {/* Header Back */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/market/${produk.id}`}
            className="inline-flex min-h-[44px] h-11 items-center gap-2 rounded-lg bg-card border border-border px-3.5 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Kembali</span>
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Checkout Pesanan
            </h1>
            <p className="text-2xs sm:text-xs text-muted-foreground">
              Selesaikan pesanan logistik dan perlengkapan posyandu
            </p>
          </div>
        </div>
        <PrintButton variant="outline" size="sm" className="min-h-[44px] h-11" hideTextOnMobile={true} />
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Kolom Kiri: Form Alamat & Metode Bayar (2 cols) */}
          <div className="space-y-5 lg:col-span-2">
            {/* Bagian 1: Alamat Pengiriman */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 font-bold">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    1. Alamat Pengiriman
                  </h2>
                  <p className="text-2xs text-muted-foreground">
                    Pengiriman resmi ke wilayah Kota Tegal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* Nama Penerima */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> Nama Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Rahayu (Kader Posyandu)"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    className="min-h-[44px] h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Nomor HP/WA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Nomor WhatsApp / HP <span className="text-2xs font-normal text-muted-foreground">(Opsional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    className="min-h-[44px] h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Kecamatan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Kecamatan *
                  </label>
                  <select
                    value={kecamatan}
                    onChange={handleKecamatanChange}
                    className="min-h-[44px] h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <label className="text-xs font-semibold text-foreground">
                    Kelurahan *
                  </label>
                  <select
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="min-h-[44px] h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <label className="text-xs font-semibold text-foreground">
                    Alamat Lengkap (Jalan, RT/RW, Patokan Rumah / Balai Posyandu) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Jl. Ki Gede Sebayu No. 12, RT 03 RW 02 (Sebelah Balai RW / Depan Posyandu Kamboja)"
                    value={alamatLengkap}
                    onChange={(e) => setAlamatLengkap(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                {/* Catatan Kurir */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Catatan Khusus Pengiriman (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Titipkan di pos satpam jika tidak ada orang"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="min-h-[44px] h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Pilihan Metode Pembayaran */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary/15 text-secondary border border-secondary/30 font-bold">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    2. Metode Pembayaran
                  </h2>
                  <p className="text-2xs text-muted-foreground">
                    Pilih cara pembayaran aman &amp; instan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {/* QRIS */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    metodePembayaran === "qris"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="qris"
                    checked={metodePembayaran === "qris"}
                    onChange={() => setMetodePembayaran("qris")}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground">
                      <QrCode className="h-3.5 w-3.5 text-primary" />
                      <span>QRIS (Semua Bank / E-Wallet)</span>
                    </div>
                    <p className="text-2xs text-muted-foreground leading-relaxed">
                      Scan kode QR instan dari GoPay, OVO, Dana, BCA Mobile, dll.
                    </p>
                  </div>
                </label>

                {/* Transfer BCA */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    metodePembayaran === "transfer_bca"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_bca"
                    checked={metodePembayaran === "transfer_bca"}
                    onChange={() => setMetodePembayaran("transfer_bca")}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Transfer Bank BCA</span>
                    </div>
                    <p className="text-2xs font-mono text-muted-foreground">
                      Rek: 138-092-8172
                    </p>
                  </div>
                </label>

                {/* Transfer Mandiri */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    metodePembayaran === "transfer_mandiri"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_mandiri"
                    checked={metodePembayaran === "transfer_mandiri"}
                    onChange={() => setMetodePembayaran("transfer_mandiri")}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Transfer Bank Mandiri</span>
                    </div>
                    <p className="text-2xs font-mono text-muted-foreground">
                      Rek: 139-00-2918273-1
                    </p>
                  </div>
                </label>

                {/* Transfer BRI */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    metodePembayaran === "transfer_bri"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_bri"
                    checked={metodePembayaran === "transfer_bri"}
                    onChange={() => setMetodePembayaran("transfer_bri")}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Transfer Bank BRI</span>
                    </div>
                    <p className="text-2xs font-mono text-muted-foreground">
                      Rek: 0102-01-092837-50-1
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Belanja (1 col) */}
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-foreground border-b border-border pb-2.5">
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
                  <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-foreground">
                    {produk.nama}
                  </h3>
                  <div className="text-2xs text-muted-foreground font-mono">
                    {jumlah} x {formatRupiah(produk.harga)}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-primary font-mono">
                    {formatRupiah(totalHarga)}
                  </div>
                </div>
              </div>

              {/* Rincian Biaya */}
              <div className="space-y-2 border-t border-border pt-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal Produk</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatRupiah(totalHarga)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Ongkir (Kota Tegal)</span>
                  <span className="font-mono font-semibold text-primary">
                    Rp 0 (Gratis)
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5 text-sm font-bold text-foreground">
                  <span>Total Bayar</span>
                  <span className="text-base sm:text-lg font-bold text-primary font-mono">
                    {formatRupiah(totalPembayaran)}
                  </span>
                </div>
              </div>

              {/* Feedback Error / Success */}
              {feedback && (
                <div
                  className={`flex items-start gap-2 rounded-lg p-3 text-xs font-medium ${
                    feedback.type === "success"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Tombol Submit Pesanan */}
              <button
                type="submit"
                disabled={isPending}
                className="flex min-h-[44px] h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-4 text-xs sm:text-sm font-semibold transition-colors shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Konfirmasi &amp; Bayar</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-2xs text-muted-foreground pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Transaksi Aman &amp; Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
