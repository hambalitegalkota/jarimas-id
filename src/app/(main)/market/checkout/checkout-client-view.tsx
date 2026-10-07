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
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-5xl mx-auto w-full gap-6">
      {/* Header Back */}
      <div className="flex items-center gap-3">
        <Link
          href={`/market/${produk.id}`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Kembali</span>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Checkout Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Selesaikan pesanan logistik dan perlengkapan posyandu
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Kolom Kiri: Form Alamat & Metode Bayar (2 cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Bagian 1: Alamat Pengiriman */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    1. Alamat Pengiriman
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pengiriman resmi ke wilayah Kota Tegal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nama Penerima */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-600" /> Nama Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Rahayu (Kader Posyandu)"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    className="min-h-[48px] w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Nomor HP/WA */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-blue-600" /> Nomor WhatsApp / HP <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Opsional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    className="min-h-[48px] w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Kecamatan */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    Kecamatan *
                  </label>
                  <select
                    value={kecamatan}
                    onChange={handleKecamatanChange}
                    className="min-h-[48px] w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base font-medium text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-hidden"
                  >
                    {Object.keys(KOTA_TEGAL_DATA).map((kec) => (
                      <option key={kec} value={kec}>
                        {kec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kelurahan */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    Kelurahan *
                  </label>
                  <select
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="min-h-[48px] w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base font-medium text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-hidden"
                  >
                    {availableKelurahan.map((kel) => (
                      <option key={kel} value={kel}>
                        {kel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alamat Lengkap */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    Alamat Lengkap (Jalan, RT/RW, Patokan Rumah / Balai Posyandu) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Jl. Ki Gede Sebayu No. 12, RT 03 RW 02 (Sebelah Balai RW / Depan Posyandu Kamboja)"
                    value={alamatLengkap}
                    onChange={(e) => setAlamatLengkap(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Catatan Kurir */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    Catatan Khusus Pengiriman (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Titipkan di pos satpam jika tidak ada orang"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="min-h-[48px] w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Pilihan Metode Pembayaran */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    2. Metode Pembayaran
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pilih cara pembayaran aman & instan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* QRIS */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                    metodePembayaran === "qris"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="qris"
                    checked={metodePembayaran === "qris"}
                    onChange={() => setMetodePembayaran("qris")}
                    className="mt-1 h-5 w-5 accent-blue-600"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      <QrCode className="h-4 w-4 text-blue-600" />
                      <span>QRIS (Semua Bank / E-Wallet)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Scan kode QR instan dari GoPay, OVO, Dana, BCA Mobile, dll.
                    </p>
                  </div>
                </label>

                {/* Transfer BCA */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                    metodePembayaran === "transfer_bca"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_bca"
                    checked={metodePembayaran === "transfer_bca"}
                    onChange={() => setMetodePembayaran("transfer_bca")}
                    className="mt-1 h-5 w-5 accent-blue-600"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>Transfer Bank BCA</span>
                    </div>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      Rek: 138-092-8172
                    </p>
                  </div>
                </label>

                {/* Transfer Mandiri */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                    metodePembayaran === "transfer_mandiri"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_mandiri"
                    checked={metodePembayaran === "transfer_mandiri"}
                    onChange={() => setMetodePembayaran("transfer_mandiri")}
                    className="mt-1 h-5 w-5 accent-blue-600"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>Transfer Bank Mandiri</span>
                    </div>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      Rek: 139-00-2918273-1
                    </p>
                  </div>
                </label>

                {/* Transfer BRI */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                    metodePembayaran === "transfer_bri"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value="transfer_bri"
                    checked={metodePembayaran === "transfer_bri"}
                    onChange={() => setMetodePembayaran("transfer_bri")}
                    className="mt-1 h-5 w-5 accent-blue-600"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>Transfer Bank BRI</span>
                    </div>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      Rek: 0102-01-092837-50-1
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Belanja (1 col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                Ringkasan Pesanan
              </h2>

              {/* Item Produk */}
              <div className="flex items-center gap-3.5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
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
                <div className="space-y-1 min-w-0">
                  <h3 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {produk.nama}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {jumlah} x {formatRupiah(produk.harga)}
                  </div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-400 font-mono">
                    {formatRupiah(totalHarga)}
                  </div>
                </div>
              </div>

              {/* Rincian Biaya */}
              <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Produk</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatRupiah(totalHarga)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Ongkir (Kota Tegal)</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Rp 0 (Gratis)
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-base font-bold text-slate-900 dark:text-slate-100">
                  <span>Total Bayar</span>
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-400 font-mono">
                    {formatRupiah(totalPembayaran)}
                  </span>
                </div>
              </div>

              {/* Feedback Error / Success */}
              {feedback && (
                <div
                  className={`flex items-start gap-2.5 rounded-xl p-3.5 text-sm ${
                    feedback.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-500"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-2 border-rose-500"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Tombol Submit Pesanan */}
              <button
                type="submit"
                disabled={isPending}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 text-base font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>Konfirmasi &amp; Bayar</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Transaksi Aman &amp; Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
