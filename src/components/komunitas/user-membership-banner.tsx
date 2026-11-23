"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldCheck,
  Compass,
  Sparkles,
  Building2,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserJoinedCommunity } from "@/app/actions/komunitas-kecamatan-stats";

interface UserMembershipBannerProps {
  currentTab: string;
  isLoggedIn: boolean;
  userCommunities: UserJoinedCommunity[];
}

export function UserMembershipBanner({
  currentTab,
  isLoggedIn,
  userCommunities = [],
}: UserMembershipBannerProps) {
  // Saring komunitas yang diikuti sesuai kategori tab saat ini
  const relevantCommunities = userCommunities.filter((c) => {
    const j = (c.jenis || "").toLowerCase();
    const n = (c.nama || "").toLowerCase();
    if (currentTab === "warga_kita") {
      return j === "warga_kita";
    }
    if (currentTab === "posyandu") {
      return j === "posyandu" || n.includes("posyandu");
    }
    if (currentTab === "satuan_paud") {
      return j === "satuan_paud" && !n.includes("pkbm") && !n.includes("skb");
    }
    if (currentTab === "pkbm_skb") {
      return j === "pkbm_skb" || n.includes("pkbm") || n.includes("skb") || n.includes("sanggar kegiatan belajar");
    }
    return false;
  });

  // Urutkan agar komunitas tingkat paling spesifik (RT / Lembaga Unit) berada di paling atas
  relevantCommunities.sort((a, b) => {
    const aIsRt = Boolean(a.rt && a.rt !== "" && a.rt !== "semua");
    const bIsRt = Boolean(b.rt && b.rt !== "" && b.rt !== "semua");
    if (aIsRt && !bIsRt) return -1;
    if (!aIsRt && bIsRt) return 1;

    const aIsUnit = !a.nama.toLowerCase().includes("komunitas");
    const bIsUnit = !b.nama.toLowerCase().includes("komunitas");
    if (aIsUnit && !bIsUnit) return -1;
    if (!aIsUnit && bIsUnit) return 1;

    return a.nama.localeCompare(b.nama);
  });

  const hasJoined = relevantCommunities.length > 0;
  const primaryCommunity = relevantCommunities[0] || null;
  const secondaryCommunities = relevantCommunities.slice(1);

  // Konfigurasi teks dan warna per kategori
  const tabMeta = (() => {
    switch (currentTab) {
      case "warga_kita":
        return {
          title: "Komunitas Warga Kita",
          unitLabel: "Komunitas RT / RW / Kelurahan",
          exploreHint: "Gunakan filter wilayah atau pencarian di bawah untuk menemukan komunitas RT Anda, lalu ajukan bergabung.",
          themeBadge: "bg-sky-600 text-white",
          themeBorder: "border-sky-500/30",
          themeBg: "bg-sky-500/10 dark:bg-sky-950/20",
          themeText: "text-sky-900 dark:text-sky-200",
        };
      case "posyandu":
        return {
          title: "Komunitas Posyandu",
          unitLabel: "Posyandu 6 SPM",
          exploreHint: "Gunakan filter wilayah untuk menemukan Posyandu di kelurahan Anda, lalu ajukan bergabung sebagai kader atau warga.",
          themeBadge: "bg-teal-700 text-white",
          themeBorder: "border-teal-500/30",
          themeBg: "bg-teal-500/10 dark:bg-teal-950/20",
          themeText: "text-teal-900 dark:text-teal-200",
        };
      case "satuan_paud":
        return {
          title: "Satuan PAUD",
          unitLabel: "Satuan PAUD (TK, KB, RA, SPS, TPA)",
          exploreHint: "Gunakan pencarian nama sekolah atau filter kecamatan untuk menemukan Satuan PAUD Anda dan bergabung sebagai pendidik/guru.",
          themeBadge: "bg-emerald-700 text-white",
          themeBorder: "border-emerald-500/30",
          themeBg: "bg-emerald-500/10 dark:bg-emerald-950/20",
          themeText: "text-emerald-900 dark:text-emerald-200",
        };
      case "pkbm_skb":
        return {
          title: "Komunitas PKBM & SKB",
          unitLabel: "Lembaga PKBM / SKB",
          exploreHint: "Pilih lembaga PKBM atau SKB tempat Anda bertugas atau terdaftar untuk memantau program kesetaraan dan data ATS.",
          themeBadge: "bg-amber-600 text-white",
          themeBorder: "border-amber-500/30",
          themeBg: "bg-amber-500/10 dark:bg-amber-950/20",
          themeText: "text-amber-900 dark:text-amber-200",
        };
      default:
        return {
          title: "Komunitas",
          unitLabel: "Komunitas",
          exploreHint: "Cari komunitas yang sesuai untuk Anda pada daftar di bawah ini.",
          themeBadge: "bg-primary text-white",
          themeBorder: "border-primary/30",
          themeBg: "bg-primary/10 dark:bg-primary/20",
          themeText: "text-foreground",
        };
    }
  })();

  // 1. KONDISI SUDAH BERGABUNG DI KOMUNITAS KATEGORI INI
  if (hasJoined && primaryCommunity) {
    return (
      <section
        aria-label="Status Keanggotaan Komunitas"
        className="rounded-xl border border-emerald-500/35 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:via-emerald-950/20 dark:to-teal-950/20 p-3.5 sm:p-4 text-emerald-950 dark:text-emerald-100 shadow-xs transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                  <ShieldCheck className="h-3 w-3" />
                  Anda Telah Bergabung di Komunitas
                </span>
                {primaryCommunity.peran && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30">
                    Peran: {primaryCommunity.peran}
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight truncate">
                {primaryCommunity.nama}
              </h3>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                {primaryCommunity.kelurahan && (
                  <span>Kel. {primaryCommunity.kelurahan}</span>
                )}
                {primaryCommunity.kecamatan && (
                  <span>• Kec. {primaryCommunity.kecamatan}</span>
                )}
                {primaryCommunity.rw && primaryCommunity.rw !== "semua" && (
                  <span>• RW {primaryCommunity.rw}</span>
                )}
                {primaryCommunity.rt && primaryCommunity.rt !== "semua" && (
                  <span>• RT {primaryCommunity.rt}</span>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
            <Link
              href={`/komunitas/${primaryCommunity.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-sm transition-all w-full sm:w-auto"
            >
              <span>Buka Komunitas Anda</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Jika pengguna tergabung di lebih dari satu komunitas di kategori ini */}
        {secondaryCommunities.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-emerald-500/25 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Juga bergabung di:
            </span>
            {secondaryCommunities.map((kom) => (
              <Link
                key={kom.id}
                href={`/komunitas/${kom.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-card/80 hover:bg-card border border-emerald-500/30 text-foreground font-medium text-[11px] hover:border-emerald-600 transition-colors"
              >
                <span className="truncate max-w-[200px]">{kom.nama}</span>
                <ArrowRight className="h-3 w-3 text-emerald-600" />
              </Link>
            ))}
          </div>
        )}
      </section>
    );
  }

  // 2. KONDISI BELUM BERGABUNG DI KOMUNITAS KATEGORI INI
  return (
    <section
      aria-label="Pemberitahuan Status Komunitas"
      className={cn(
        "rounded-xl border p-3.5 sm:p-4 shadow-xs transition-all",
        tabMeta.themeBorder,
        tabMeta.themeBg
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs",
              tabMeta.themeBadge
            )}
          >
            <Compass className="h-5 w-5" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                {isLoggedIn ? "Status: Belum Terdaftar" : "Pengunjung"}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Anda Belum Bergabung di {tabMeta.title}
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Cari Komunitas yang sesuai untuk anda. {tabMeta.exploreHint}
            </p>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="shrink-0 pt-1 sm:pt-0">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-accent text-foreground font-semibold text-xs transition-colors w-full sm:w-auto"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk untuk Bergabung</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
