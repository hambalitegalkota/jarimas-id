"use client";

import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

interface PublicProfileShareButtonsProps {
  namaLengkap: string;
  username: string;
}

export function PublicProfileShareButtons({
  namaLengkap,
  username,
}: PublicProfileShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Gagal menyalin tautan:", err);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${namaLengkap} di JARIMAS`,
          text: `Lihat profil ${namaLengkap} (@${username}) di JARIMAS Kota Tegal.`,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      const text = encodeURIComponent(
        `Kunjungi profil ${namaLengkap} di JARIMAS: ${currentUrl}`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex min-h-[34px] h-8.5 items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted px-3 text-xs font-semibold text-foreground transition-all shadow-2xs cursor-pointer active:scale-98"
        title="Salin Tautan Profil"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-bold">Tersalin!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Salin Link</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-[34px] h-8.5 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-98"
        title="Bagikan ke WhatsApp"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Bagikan</span>
      </button>
    </div>
  );
}
