import { Metadata } from "next";
import { getPesananUser } from "@/app/actions/market";
import { PesananClientView } from "./pesanan-client-view";

export const metadata: Metadata = {
  title: "Pesanan Saya | Jarimas Market Kota Tegal",
  description: "Pantau status pengadaan sarana tumbuh kembang anak dan riwayat pesanan.",
};

export default async function PesananUserPage() {
  const { data: pesanan } = await getPesananUser();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <PesananClientView initialPesanan={pesanan || []} />
    </div>
  );
}
