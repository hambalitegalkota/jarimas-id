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
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-950/40 border border-emerald-800 text-emerald-400 font-mono font-bold">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-foreground font-mono">
                  PORTAL SUPER ADMIN
                </span>
                <span className="rounded-md border border-emerald-800/60 bg-emerald-950/30 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400">
                  KOTA TEGAL
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Operator: <span className="text-foreground">{profile.nama_lengkap || user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/market"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Store className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Lihat Toko</span>
            </Link>
            <Link
              href="/profil"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profil Utama</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-border bg-background/50">
          <div className="container mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 scrollbar-none">
            <Link
              href="/admin/market"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              <Package className="h-3.5 w-3.5" />
              <span>[01] KELOLA PRODUK</span>
            </Link>

            <Link
              href="/admin/pesanan"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span>[02] TRANSAKSI & RESI</span>
            </Link>

            <Link
              href="/profil"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              <Users className="h-3.5 w-3.5" />
              <span>[03] APPROVAL KOMUNITAS</span>
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
