import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const DEFAULT_SUPABASE_URL = "https://nzfwkpwabfiettoixtdk.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_cseh0XvvzEyoWjxbj_JoIg_hdungUJk";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
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
 * Client Supabase dengan Service Role Key untuk operasi administratif backend (bypasses RLS)
 * Hanya aktif jika SUPABASE_SERVICE_ROLE_KEY tersedia di environment dan valid formatnya.
 */
export function createAdminClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!rawKey) {
    return null;
  }

  // Bersihkan kutip pembungkus, whitespace, dan karakter escape baris baru
  const serviceRoleKey = rawKey.trim().replace(/^["']|["']$/g, "").trim();

  // Validasi format dasar service role key Supabase (bukan placeholder / bukan anon key / panjang valid)
  if (
    !serviceRoleKey ||
    serviceRoleKey.length < 25 ||
    serviceRoleKey === "undefined" ||
    serviceRoleKey === "null" ||
    serviceRoleKey.includes("your-") ||
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

