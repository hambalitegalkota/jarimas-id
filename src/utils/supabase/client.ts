import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://jsrvxvdajgfylpokdhmo.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_zAwSDQAa1RKYNRf7lF5fGw_Z0CdTXn2";

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
