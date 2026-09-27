import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    // Redirect ke halaman utama jika user sudah login tapi mengakses login/register
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
