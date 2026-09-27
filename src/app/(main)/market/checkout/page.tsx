import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getProdukDetail } from "@/app/actions/market";
import { CheckoutClientView } from "./checkout-client-view";

export const metadata: Metadata = {
  title: "Checkout Pengadaan | Jarimas Market Kota Tegal",
  description: "Formulir checkout dan pembayaran resmi Jarimas Market.",
};

interface CheckoutPageProps {
  searchParams: Promise<{
    productId?: string;
    qty?: string;
  }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { productId, qty } = await searchParams;

  if (!productId) {
    redirect("/market");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nama_lengkap, nomor_hp")
      .eq("id", user.id)
      .single();
    userProfile = profile;
  }

  const { data: produk } = await getProdukDetail(productId);

  if (!produk) {
    redirect("/market");
  }

  const initialQty = parseInt(qty || "1", 10);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <CheckoutClientView
        produk={produk}
        initialQty={isNaN(initialQty) ? 1 : initialQty}
        userProfile={userProfile}
      />
    </div>
  );
}
