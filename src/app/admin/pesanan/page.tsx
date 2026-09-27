import { Metadata } from "next";
import { getSemuaPesanan } from "@/app/actions/admin-market";
import { AdminPesananClient } from "./admin-pesanan-client";

export const metadata: Metadata = {
  title: "Kelola Transaksi & Resi | Super Admin Jarimas",
  description: "Dashboard manajemen pesanan masuk dan pengiriman sarana Jarimas Market.",
};

export default async function AdminPesananPage() {
  const { data: pesanan } = await getSemuaPesanan();

  return <AdminPesananClient initialPesanan={pesanan} />;
}
