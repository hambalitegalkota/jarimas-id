import { Suspense } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquarePlus,
  HeartHandshake,
  Flame,
  Clock,
  ShieldCheck,
  Megaphone,
  HeartPulse,
} from "lucide-react";
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
    <div className="flex flex-col flex-1 px-4 py-4 sm:px-6 md:px-8 gap-6 max-w-4xl mx-auto w-full pb-20">
      {/* ========================================================= */}
      {/* 1. HEADER BANNER KABAR WARGA                              */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-lg shadow-slate-950/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-bold text-emerald-300 backdrop-blur-xs">
                FORUM &amp; KABAR WARGA
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-300 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE KOTA TEGAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Kabar Jarimas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Ruang interaksi publik seputar jadwal penimbangan posyandu, edukasi nutrisi gizi balita, dan info penting di lingkungan RT/RW Anda.
            </p>
          </div>

          <div className="shrink-0">
            <div className="flex sm:flex-col items-center gap-2">
              <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center">
                <span className="text-base sm:text-lg font-black block font-mono text-emerald-400">
                  {feedItems.length}
                </span>
                <span className="text-[10px] text-slate-300 uppercase font-bold">
                  Kabar Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Pill */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/15 text-xs text-slate-300 font-medium">
          <Megaphone className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Bagikan pengumuman atau tips kesehatan dengan menekan tombol tulis di pojok bawah.</span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FILTER & SORTING CONTROLS                              */}
      {/* ========================================================= */}
      <Suspense fallback={<div className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-800" />}>
        <KabarFilter
          currentSort={currentSort}
          currentVisibility={currentVisibility}
        />
      </Suspense>

      {/* ========================================================= */}
      {/* 3. FEED STREAM                                            */}
      {/* ========================================================= */}
      <main className="space-y-4">
        {feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400">
              <MessageSquarePlus className="h-7 w-7 stroke-[1.5px]" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Belum Ada Kabar di Kategori Ini
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Jadilah yang pertama membagikan pengumuman posyandu, tips gizi balita, atau kabar lingkungan sekitar.
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
