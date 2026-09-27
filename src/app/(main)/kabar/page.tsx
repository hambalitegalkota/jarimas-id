import { Suspense } from "react";
import { Sparkles, MessageSquarePlus, HeartHandshake } from "lucide-react";
import { getKabarFeed } from "@/app/actions/kabar";
import { createClient } from "@/utils/supabase/server";
import { KabarCard } from "@/components/kabar/kabar-card";
import { KabarFilter } from "@/components/kabar/kabar-filter";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
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
    <div className="flex flex-col flex-1 px-4 py-5 gap-5">
      {/* Header Banner */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white font-bold shadow-md shadow-primary/20">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Kabar Warga
            </h1>
            <p className="text-xs text-muted-foreground">
              Ruang berbagi info &amp; parenting warga JARIMAS-ID
            </p>
          </div>
        </div>
      </header>

      {/* Filter & Sorting Controls */}
      <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-2xl" />}>
        <KabarFilter
          currentSort={currentSort}
          currentVisibility={currentVisibility}
        />
      </Suspense>

      {/* Feed Stream */}
      <main className="space-y-4 pb-12">
        {feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquarePlus className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Belum Ada Kabar di Kategori Ini
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
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
