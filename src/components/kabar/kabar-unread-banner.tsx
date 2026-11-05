"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowRight, ListFilter, CheckCheck, Sparkles } from "lucide-react";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

interface KabarUnreadBannerProps {
  currentTab?: string | null;
}

export function KabarUnreadBanner({ currentTab }: KabarUnreadBannerProps) {
  const router = useRouter();
  const { totalUnreadCount, openUnreadModal, markAllMessagesAsRead } =
    useGlobalMessageNotification();
  const [isMarking, setIsMarking] = useState(false);

  if (totalUnreadCount <= 0) return null;

  const handleMarkAll = async () => {
    setIsMarking(true);
    try {
      await markAllMessagesAsRead();
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <aside
      aria-label="Pemberitahuan Pesan Warga Belum Dibaca"
      className="relative overflow-hidden rounded-xl border-2 border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent p-4 sm:p-4.5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-md shadow-rose-600/30">
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            </span>
            <MessageSquare className="h-5 w-5" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-foreground">
                Pemberitahuan Pesan Warga
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xs">
                <Sparkles className="h-3 w-3" />
                {totalUnreadCount > 99 ? "99+" : totalUnreadCount} Pesan Belum Dibaca
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Anda memiliki pesan tertunda dari sesama warga atau ruang komunitas yang belum dibuka.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={openUnreadModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-xs font-bold text-foreground transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
          >
            <ListFilter className="h-3.5 w-3.5 text-rose-500" />
            <span>Lihat Daftar Pesan</span>
          </button>

          {currentTab !== "percakapan" && (
            <Link
              href="/kabar?tab=percakapan"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
            >
              <span>Buka Percakapan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isMarking}
            title="Tandai semua pesan sebagai sudah dibaca"
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

