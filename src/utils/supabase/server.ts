import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const DEFAULT_SUPABASE_URL = "http://103.193.176.111:8000";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q";

/**
 * Dapatkan URL Supabase yang optimal untuk koneksi internal backend di server
 */
export function getInternalSupabaseUrl(): string {
  const envInternal = process.env.INTERNAL_SUPABASE_URL;
  if (envInternal && envInternal.trim()) return envInternal.trim();

  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  // Di server Linux (IDCloudHost), gunakan 127.0.0.1:8000 agar tidak terhalang NAT loopback publik
  if (typeof window === "undefined") {
    if (process.platform !== "win32" && (publicUrl.includes("103.193.176.111") || process.env.NODE_ENV === "production")) {
      return "http://127.0.0.1:8000";
    }
  }
  return publicUrl.trim();
}

export async function createClient() {
  const supabaseUrl = getInternalSupabaseUrl();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.trim() === "" ||
    supabaseAnonKey.trim() === "" ||
    supabaseUrl.includes("your-supabase-url") ||
    supabaseAnonKey.includes("your-anon-key")
  ) {
    throw new Error(
      "Supabase Environment Variables tidak ditemukan di .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Client Supabase Stateless (Murni Client-side/Anon tanpa Cookie Session)
 * Khusus digunakan di dalam Next.js unstable_cache / ISR untuk mencegah error headers/cookies.
 */
export function createStatelessClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Client Supabase dengan Service Role Key untuk operasi administratif backend (bypasses RLS)
 * Hanya aktif jika SUPABASE_SERVICE_ROLE_KEY tersedia di environment dan valid formatnya.
 */
export function createAdminClient() {
  const supabaseUrl = getInternalSupabaseUrl();
  let rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (
    !rawKey ||
    rawKey.trim() === "" ||
    rawKey.includes("your-") ||
    rawKey === "undefined" ||
    rawKey === "null"
  ) {
    rawKey = DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  }

  // Bersihkan kutip pembungkus, whitespace, dan karakter escape baris baru
  const serviceRoleKey = rawKey.trim().replace(/^["']|["']$/g, "").trim();

  // Validasi format dasar service role key Supabase (bukan anon key / panjang valid)
  if (
    !serviceRoleKey ||
    serviceRoleKey.length < 25 ||
    serviceRoleKey.startsWith("sb_publishable_")
  ) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

