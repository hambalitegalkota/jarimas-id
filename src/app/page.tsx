import { Suspense } from "react";
import { HeartHandshake } from "lucide-react";
import { getKabarFeed } from "@/app/actions/kabar";
import { createClient } from "@/utils/supabase/server";
import { KabarCard } from "@/components/kabar/kabar-card";
import { KabarFilter } from "@/components/kabar/kabar-filter";
import { CreateKabarModal } from "@/components/kabar/create-kabar-modal";
import type { SortingKabar, VisibilitasKabar } from "@/types/database";

interface HomePageProps {
  searchParams: Promise<{
    sort?: string;
    visibility?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
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
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 gap-6 max-w-4xl mx-auto w-full">
      {/* Header Banner - Coursera Mobile Style */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              KOTA TEGAL
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Kabar Warga
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Informasi publik, pengumuman posyandu, dan interaksi warga real-time.
          </p>
        </div>
      </header>

      {/* Filter & Sorting Controls */}
      <Suspense fallback={<div className="min-h-[80px] animate-pulse bg-slate-100 rounded-2xl border-2 border-slate-200" />}>
        <KabarFilter
          currentSort={currentSort}
          currentVisibility={currentVisibility}
        />
      </Suspense>

      {/* Feed Stream */}
      <main className="space-y-4 pb-16">
        {feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold tracking-tight text-slate-900">
                Belum Ada Kabar Terbit
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mulai interaksi dengan membagikan kabar atau pengumuman pertama Anda kepada sesama warga dan komunitas.
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
