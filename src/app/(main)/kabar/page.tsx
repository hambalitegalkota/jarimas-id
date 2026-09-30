import { Suspense } from "react";
import { Sparkles, MessageSquarePlus, HeartHandshake } from "lucide-react";
import { getKabarFeed } from "@/app/actions/kabar";
import { createClient } from "@/utils/supabase/server";
import { KabarCard } from "@/components/kabar/kabar-card";
import { KabarFilter } from "@/components/kabar/kabar-filter";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SortingKabar, VisibilitasKabar } from "@/types/database";

interface KabarPageProps {
  searchParams: Promise<{
    sort?: string;
    visibility?: string;
  }>;
}

export default async function KabarPage({ searchParams }: KabarPageProps) {
  const resolvedParams = await searchParams;
  const currentSort = (resolvedParams.sort as SortingKabar) || "terbaru";
  const currentVisibility =
    (resolvedParams.visibility as "semua" | VisibilitasKabar) || "semua";

  // Ambil data feed dari Server Action
  const { data: feedItems, currentUserId } = await getKabarFeed({
    sorting: currentSort,
    filterVisibilitas: currentVisibility,
  });

  // Periksa hak akses Super Admin jika user terautentikasi
  let isSuperAdmin = false;
  if (currentUserId) {
    try {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", currentUserId)
        .single();
      isSuperAdmin = profile?.is_super_admin === true;
    } catch {
      // Abaikan jika tabel profil belum ada
    }
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-8">
      {/* Header Banner - Superlist & Resend Style */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="cyber-badge">FEED</span>
            <span className="text-xs font-mono text-muted-foreground">KOTA TEGAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">
            Kabar Warga
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Ruang berbagi informasi, edukasi gizi, dan pengumuman kegiatan posyandu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle variant="compact" />
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* Filter & Sorting Controls */}
      <Suspense fallback={<div className="h-16 animate-pulse bg-muted rounded-md border border-border" />}>
        <KabarFilter
          currentSort={currentSort}
          currentVisibility={currentVisibility}
        />
      </Suspense>

      {/* Feed Stream */}
      <main className="space-y-4 pb-16">
        {feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <MessageSquarePlus className="h-6 w-6 stroke-[1.5px]" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                BELUM ADA KABAR DI KATEGORI INI
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jadilah yang pertama membagikan kabar, tips gizi, atau pengumuman seputar posyandu dan anak.
              </p>
            </div>
          </div>
        ) : (
          feedItems.map((kabar) => (
            <KabarCard
              key={kabar.id}
              kabar={kabar}
              currentUserId={currentUserId}
              isSuperAdmin={isSuperAdmin}
            />
          ))
        )}
      </main>

      {/* Floating Action Button & Modal */}
      <CreateKabarModal currentUserId={currentUserId} />
    </div>
  );
}
