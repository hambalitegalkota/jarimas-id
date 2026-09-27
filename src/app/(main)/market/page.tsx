import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { getMarketProduk } from "@/app/actions/market";
import { MarketClientView } from "./market-client-view";

export const metadata: Metadata = {
  title: "Jarimas Market | Sarana Resmi Posyandu & PAUD Kota Tegal",
  description:
    "Katalog sarana tumbuh kembang anak, alat ukur posyandu terstandar, dan modul edukasi resmi Kota Tegal.",
};

export default async function MarketPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isSuperAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();
    isSuperAdmin = !!profile?.is_super_admin;
  }

  const { data: products } = await getMarketProduk();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <MarketClientView
        initialProducts={products || []}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
