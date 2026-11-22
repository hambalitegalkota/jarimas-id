import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// ============================================================================
// MODE PEMELIHARAAN (MAINTENANCE MODE)
// ============================================================================
// Diaktifkan sementara untuk kondisi mendesak perbaikan database Supabase.
// Default: TRUE (Aktif).
//
// Cara menonaktifkan setelah Supabase selesai diperbaiki:
// 1. Ubah nilai IS_MAINTENANCE_ACTIVE di bawah ini menjadi `false`, ATAU
// 2. Set environment variable NEXT_PUBLIC_MAINTENANCE_MODE="false".
//
// Akses Khusus Admin (Bypass):
// - Buka URL: https://jarimas.id/?bypass=admin untuk mengakses web secara normal.
// - Buka URL: https://jarimas.id/?bypass=off untuk kembali melihat tampilan perbaikan.
// ============================================================================
export const IS_MAINTENANCE_ACTIVE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ? true : false;

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Tangani Bypass Admin via Query Parameter ?bypass=...
  const bypassQuery = searchParams.get("bypass");
  const hasBypassCookie =
    request.cookies.get("maintenance_bypass")?.value === "admin";

  if (bypassQuery === "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete("bypass");
    redirectUrl.pathname = "/";
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("maintenance_bypass", "admin", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // Berlaku 24 jam
    });
    return response;
  }

  if (bypassQuery === "off") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete("bypass");
    redirectUrl.pathname = "/maintenance";
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("maintenance_bypass");
    return response;
  }

  // 2. Jika Mode Pemeliharaan Aktif dan bukan admin bypass
  if (IS_MAINTENANCE_ACTIVE && !hasBypassCookie) {
    // API routes mengembalikan status 503
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Service Temporarily Unavailable",
          message:
            "Website sedang dalam perbaikan. Kembali lagi nanti yah. Terimakasih.",
          maintenance: true,
        },
        { status: 503 }
      );
    }

    // Jika sudah di rute /maintenance, lanjutkan render halaman pemeliharaan
    if (pathname === "/maintenance") {
      return NextResponse.next();
    }

    // Arahkan seluruh rute publik lainnya ke /maintenance
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    return NextResponse.redirect(maintenanceUrl);
  }

  // 3. Jika Mode Pemeliharaan Tidak Aktif tetapi pengguna mengakses /maintenance secara manual
  if (!IS_MAINTENANCE_ACTIVE && pathname === "/maintenance") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  // Jika tidak dalam mode pemeliharaan (atau memiliki bypass admin), jalankan sesi normal
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image formats (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
