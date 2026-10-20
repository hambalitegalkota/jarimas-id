import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://nzfwkpwabfiettoixtdk.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_cseh0XvvzEyoWjxbj_JoIg_hdungUJk";

export function createClient() {
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

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
