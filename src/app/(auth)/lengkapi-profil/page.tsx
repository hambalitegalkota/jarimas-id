import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LengkapiProfilClientForm } from "./lengkapi-profil-client";

export const metadata = {
  title: "Lengkapi Profil Pengguna | JARIMAS-ID",
  description:
    "Masukkan nama asli Anda untuk menyelesaikan verifikasi akun Google dan melanjutkan ke platform JARIMAS.",
};

export default async function LengkapiProfilPage() {
  const supabase = await createClient();

  // 1. Verifikasi sesi pengguna
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Periksa apakah profil sudah lengkap di database
  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap, is_profile_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile?.is_profile_completed === true &&
    profile?.nama_lengkap &&
    profile.nama_lengkap.trim() !== ""
  ) {
    // Jika nama asli sudah terisi dan terkonfirmasi, langsung arahkan ke beranda
    redirect("/");
  }

  const userEmail = user.email || "";
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;
  const googleName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center px-4 py-8 sm:px-6 max-w-lg mx-auto w-full">
      <LengkapiProfilClientForm
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        googleName={googleName}
      />
    </div>
  );
}
