import { Metadata } from "next";
import { getMarketProduk } from "@/app/actions/market";
import { AdminMarketClient } from "./admin-market-client";

export const metadata: Metadata = {
  title: "Kelola Produk Market | Super Admin Jarimas",
  description: "Dashboard manajemen katalog dan stok produk resmi Jarimas Market.",
};

export default async function AdminMarketPage() {
  const { data: products } = await getMarketProduk();

  return <AdminMarketClient initialProducts={products} />;
}
