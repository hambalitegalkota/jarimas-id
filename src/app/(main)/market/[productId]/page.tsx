import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProdukDetail } from "@/app/actions/market";
import { DetailProdukClient } from "./detail-produk-client";

interface DetailProdukPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({
  params,
}: DetailProdukPageProps): Promise<Metadata> {
  const { productId } = await params;
  const { data: produk } = await getProdukDetail(productId);

  if (!produk) {
    return {
      title: "Produk Tidak Ditemukan | Jarimas Market",
    };
  }

  return {
    title: `${produk.nama} | Jarimas Market Kota Tegal`,
    description: produk.deskripsi,
  };
}

export default async function DetailProdukPage({
  params,
}: DetailProdukPageProps) {
  const { productId } = await params;
  const { data: produk } = await getProdukDetail(productId);

  if (!produk) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <DetailProdukClient produk={produk} />
    </div>
  );
}
