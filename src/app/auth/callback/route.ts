import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Route Handler untuk pertukaran kode autentikasi Supabase (PKCE Code Exchange)
 * Digunakan untuk:
 * 1. Konfirmasi email pendaftaran baru
 * 2. Tautan Atur Ulang Kata Sandi (Reset Password)
 * 3. OAuth Callback (Google, dll)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  // Lindungi dari open-redirect: pastikan "next" dimulai dengan "/"
  const safeNext = next.startsWith("/") ? next : "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${safeNext}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
        } else {
          return NextResponse.redirect(`${origin}${safeNext}`);
        }
      } else {
        console.warn("Gagal menukarkan kode sesi auth:", error.message);
      }
    } catch (err) {
      console.error("Exception pada auth callback handler:", err);
    }
  }

  // Jika terjadi kendala kode atau tautan kedaluwarsa, arahkan ke login dengan notifikasi
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Tautan verifikasi telah kedaluwarsa atau tidak valid. Silakan coba lagi."
    )}`
  );
}
