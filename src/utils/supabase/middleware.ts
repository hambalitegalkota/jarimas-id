import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_SUPABASE_URL = "https://jsrvxvdajgfylpokdhmo.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_zAwSDQAa1RKYNRf7lF5fGw_Z0CdTXn2";

function getInternalSupabaseUrl(): string {
  const envInternal = process.env.INTERNAL_SUPABASE_URL;
  if (envInternal && envInternal.trim()) return envInternal.trim();

  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  // Di server production (IDCloudHost), gunakan 127.0.0.1:8000 agar tidak terhalang NAT loopback publik
  if (process.env.NODE_ENV === "production" && publicUrl.includes("103.193.176.111")) {
    return "http://127.0.0.1:8000";
  }
  return publicUrl.trim();
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = getInternalSupabaseUrl();
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

    // Daftar rute yang memerlukan autentikasi
    const protectedPaths = [
      "/profil",
      "/dashboard",
      "/anak",
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

    // Redirect ke halaman beranda jika user sudah login tapi mengakses login/register
    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.warn("Middleware session update skipped:", error);
  }

  return supabaseResponse;
}
