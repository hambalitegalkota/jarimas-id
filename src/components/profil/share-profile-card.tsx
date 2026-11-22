"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Lock,
  Sparkles,
  MessageCircle,
} from "lucide-react";

interface ShareProfileCardProps {
  userId: string;
  username?: string | null;
  namaLengkap: string;
  isPublic?: boolean;
}

export function ShareProfileCard({
  userId,
  username,
  namaLengkap,
  isPublic = true,
}: ShareProfileCardProps) {
  const [copied, setCopied] = useState(false);

  // Gunakan username jika tersedia, atau ID user
  const profileSlug = username || userId;
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${profileSlug}`
    : `https://jarimas.id/u/${profileSlug}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Gagal menyalin link:", err);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${namaLengkap} di JARIMAS`,
          text: `Kunjungi profil ${namaLengkap} di JARIMAS - Interkoneksi Komunitas & Data Anak Kota Tegal.`,
          url: profileUrl,
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      // Fallback share via WhatsApp web/app
      const text = encodeURIComponent(
        `Halo! Kunjungi profil saya (${namaLengkap}) di JARIMAS: ${profileUrl}`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5 p-3.5 sm:p-4.5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Share2 className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>Tautan Profil Publik</span>
              {isPublic ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.2 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Globe className="h-3 w-3" />
                  Publik
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.2 text-2xs font-semibold text-amber-600 dark:text-amber-400">
                  <Lock className="h-3 w-3" />
                  Privat
                </span>
              )}
            </h3>
          </div>

          <p className="text-2xs sm:text-xs text-muted-foreground leading-relaxed">
            Bagikan tautan ini ke media sosial atau pesan agar orang lain dapat melihat peran &amp; komunitas Anda.
          </p>

          <div className="flex items-center gap-1.5 pt-0.5">
            <code className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-2xs font-mono text-foreground font-semibold truncate max-w-[280px] sm:max-w-md">
              {profileUrl}
            </code>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[34px] h-8.5 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-98 cursor-pointer shadow-2xs"
            title="Salin Tautan"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Salin Tautan</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-[34px] h-8.5 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-semibold transition-all active:scale-98 cursor-pointer shadow-2xs"
            title="Bagikan ke WhatsApp / Lainnya"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Bagikan</span>
          </button>

          <Link
            href={`/u/${profileSlug}`}
            target="_blank"
            className="inline-flex min-h-[34px] h-8.5 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-3 text-xs font-semibold transition-all active:scale-98 shadow-2xs"
            title="Buka Tampilan Publik"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tampilan Publik</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
