import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { getMarketProduk } from "@/app/actions/market";
import { isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
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
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    isSuperAdmin = checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });
  }

  const { data: products } = await getMarketProduk();

  return (
    <MarketClientView
      initialProducts={products || []}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
