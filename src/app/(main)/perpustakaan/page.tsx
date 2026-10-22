import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { getBukuDigitalList } from "@/app/actions/buku-digital";
import { isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
import { PerpustakaanClientView } from "./perpustakaan-client-view";

export const metadata: Metadata = {
  title: "Perpustakaan Digital | Direktori Buku & Modul Edukasi Jarimas",
  description:
    "Direktori kurasi buku cerita anak, modul parenting, panduan kader posyandu, dan materi edukasi Kota Tegal.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PerpustakaanPage() {
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

  const { data: books, isFallback } = await getBukuDigitalList();

  return (
    <PerpustakaanClientView
      initialBuku={books || []}
      isSuperAdmin={isSuperAdmin}
      isFallback={isFallback}
    />
  );
}
