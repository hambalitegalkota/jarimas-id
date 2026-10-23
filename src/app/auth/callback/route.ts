import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Gagal menukar kode auth Supabase OAuth:", exchangeError);
        return NextResponse.redirect(`${origin}/login?error=oauth_error`);
      }

      // Ambil user yang berhasil masuk
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(`${origin}/login?error=user_not_found`);
      }

      // Periksa apakah profil pengguna sudah memiliki nama asli
      const { data: profile } = await supabase
        .from("profiles")
        .select("nama_lengkap, is_profile_completed")
        .eq("id", user.id)
        .maybeSingle();

      // Cek apakah profil sudah lengkap (memiliki nama asli yang terkonfirmasi)
      const isCompleted =
        profile?.is_profile_completed === true &&
        Boolean(profile?.nama_lengkap && profile.nama_lengkap.trim() !== "");

      if (!profile) {
        // Inisialisasi awal tabel profiles jika belum dibuat oleh trigger
        try {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email,
              nama_lengkap: "",
              avatar_url:
                user.user_metadata?.avatar_url ||
                user.user_metadata?.picture ||
                null,
              is_profile_completed: false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        } catch (initErr) {
          console.warn("Inisialisasi profil OAuth:", initErr);
        }

        return NextResponse.redirect(`${origin}/lengkapi-profil`);
      }

      if (!isCompleted) {
        // Cegat pengguna baru/yang belum melengkapi nama asli
        return NextResponse.redirect(`${origin}/lengkapi-profil`);
      }

      // Jika profil sudah lengkap, arahkan ke rute tujuan
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("Error pada callback auth:", err);
      return NextResponse.redirect(`${origin}/login?error=oauth_unexpected_error`);
    }
  }

  // Jika tidak ada code di URL param
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}
