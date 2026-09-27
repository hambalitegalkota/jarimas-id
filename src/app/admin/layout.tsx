import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  ShieldAlert,
  Package,
  ClipboardList,
  Users,
  ArrowLeft,
  Store,
  Sparkles,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin, nama_lengkap, email")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    redirect("/profil");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header Admin */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-xs font-black">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-foreground">
                  Portal Super Admin
                </span>
                <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-extrabold text-accent">
                  KOTA TEGAL
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pengelola: <strong>{profile.nama_lengkap || user.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/market"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-muted active:scale-95"
            >
              <Store className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Lihat Toko</span>
            </Link>
            <Link
              href="/profil"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-muted px-3 text-xs font-bold text-foreground hover:bg-muted/80 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Profil Utama</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-border/60 bg-muted/30">
          <div className="container mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
            <Link
              href="/admin/market"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-card hover:shadow-xs active:scale-95"
            >
              <Package className="h-4 w-4 text-primary" />
              <span>Kelola Produk Market</span>
            </Link>

            <Link
              href="/admin/pesanan"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-card hover:shadow-xs active:scale-95"
            >
              <ClipboardList className="h-4 w-4 text-accent" />
              <span>Daftar Transaksi & Resi</span>
            </Link>

            <Link
              href="/profil"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-card hover:shadow-xs active:scale-95"
            >
              <Users className="h-4 w-4 text-emerald-600" />
              <span>Approval Anggota Komunitas</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
