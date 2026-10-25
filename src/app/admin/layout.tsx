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
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { isSuperOrAdminPusat, isAdminPusat, isSuperAdmin } from "@/lib/utils";
import { PrintButton } from "@/components/ui/print-button";

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
    .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
    .eq("id", user.id)
    .maybeSingle();

  const userCtx = {
    ...profile,
    id: user.id,
    email: profile?.email || user.email,
    nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
  };

  if (!isSuperOrAdminPusat(userCtx)) {
    redirect("/profil");
  }

  const isSuper = isSuperAdmin(userCtx);
  const portalTitle = isSuper ? "PORTAL SUPER ADMIN" : "PORTAL ADMIN PUSAT";
  const badgeText = isSuper ? "ROOT OWNER" : "MANAJERIAL GLOBAL";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header Admin */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md shadow-xs">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground uppercase">
                  {portalTitle}
                </span>
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-2xs font-semibold text-primary">
                  {badgeText}
                </span>
              </div>
              <p className="text-2xs text-muted-foreground">
                Operator: <span className="text-foreground font-medium">{profile?.nama_lengkap || user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PrintButton variant="outline" size="sm" hideTextOnMobile={true} className="min-h-[44px] h-11" />
            <Link
              href="/market"
              className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-colors shadow-xs"
            >
              <Store className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Lihat Toko</span>
            </Link>
            <Link
              href="/profil"
              className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-lg bg-muted px-3.5 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <span className="hidden sm:inline">Profil Utama</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-border bg-background/50">
          <div className="container mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto px-4 py-2 scrollbar-none">
            <Link
              href="/admin/market"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 min-h-[44px] h-11 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground hover:bg-muted border border-transparent hover:border-border"
            >
              <Package className="h-4 w-4 text-primary" />
              <span>[01] KELOLA PRODUK</span>
            </Link>

            <Link
              href="/admin/pesanan"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 min-h-[44px] h-11 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground hover:bg-muted border border-transparent hover:border-border"
            >
              <ClipboardList className="h-4 w-4 text-primary" />
              <span>[02] TRANSAKSI &amp; RESI</span>
            </Link>

            <Link
              href="/profil"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 min-h-[44px] h-11 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground hover:bg-muted border border-transparent hover:border-border"
            >
              <Users className="h-4 w-4 text-primary" />
              <span>[03] APPROVAL KOMUNITAS</span>
            </Link>

            <Link
              href="/kabar?tab=percakapan"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 min-h-[44px] h-11 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground hover:bg-muted border border-transparent hover:border-border"
            >
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>[04] GRUP KEGIATAN &amp; CHAT</span>
            </Link>

            <Link
              href="/cek-progres"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 min-h-[44px] h-11 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 transition-all hover:bg-teal-500/20"
            >
              <BarChart3 className="h-4 w-4" />
              <span>[05] CEK PROGRES</span>
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
