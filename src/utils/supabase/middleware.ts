import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_SUPABASE_URL = "https://nzfwkpwabfiettoixtdk.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_cseh0XvvzEyoWjxbj_JoIg_hdungUJk";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  // Jika env variable belum diisi atau masih default placeholder, lewati middleware
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.trim() === "" ||
    supabaseAnonKey.trim() === "" ||
    supabaseUrl.includes("your-supabase-url") ||
    supabaseAnonKey.includes("your-anon-key")
  ) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh token & retrieve authenticated user session
    // IMPORTANT: DO NOT REMOVE auth.getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Rute yang dikecualikan dari pencegatan
    const isExcludedFromInterception =
      pathname.startsWith("/auth/callback") ||
      pathname.startsWith("/api");

    // Jika user belum login dan mengakses /lengkapi-profil, arahkan ke login
    if (!user && pathname.startsWith("/lengkapi-profil")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Daftar rute yang memerlukan autentikasi
    const protectedPaths = [
      "/profil",
      "/dashboard",
      "/anak",
      "/ddks",
      "/input-data",
    ];
    const isProtectedRoute = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    // Rute autentikasi (login / register)
    const authPaths = ["/login", "/register"];
    const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));

    // Redirect ke halaman login jika user belum login dan mengakses rute terproteksi
    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    // Flag untuk mengaktifkan alur onboarding pencegatan /lengkapi-profil
    // Dinonaktifkan sementara agar tidak mengganggu rute utama
    const ENABLE_ONBOARDING_INTERCEPTION = false;

    // Logika jika user sedang login
    if (user && !isExcludedFromInterception) {
      if (ENABLE_ONBOARDING_INTERCEPTION) {
        // 1. Cek status kelengkapan profil (nama asli)
        let isProfileCompleted = user.user_metadata?.is_profile_completed === true;

        // Jika belum terkonfirmasi di metadata, periksa langsung ke tabel profiles
        if (!isProfileCompleted) {
          try {
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
              isProfileCompleted = true;
            }
          } catch (dbCheckErr) {
            console.warn("Middleware gagal memeriksa profil DB:", dbCheckErr);
          }
        }

        // Pencegatan: Jika profil (nama asli) belum lengkap
        if (!isProfileCompleted) {
          // Jika sedang tidak di halaman /lengkapi-profil, paksa arahkan ke /lengkapi-profil
          if (pathname !== "/lengkapi-profil") {
            const url = request.nextUrl.clone();
            url.pathname = "/lengkapi-profil";
            return NextResponse.redirect(url);
          }
          // Jika sudah di /lengkapi-profil, izinkan akses formulir
          return supabaseResponse;
        }

        // Jika profil SUDAH lengkap, cegah akses kembali ke /lengkapi-profil
        if (isProfileCompleted && pathname === "/lengkapi-profil") {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }

      // Redirect ke halaman beranda jika user sudah login tapi mengakses login/register
      if (isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.warn("Middleware session update skipped:", error);
  }

  return supabaseResponse;
}
