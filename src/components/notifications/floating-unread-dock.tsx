"use client";

import React from "react";
import { MessageSquare, X, ArrowRight, Sparkles } from "lucide-react";
import type { IncomingMessageNotificationItem } from "@/types/database";

interface FloatingUnreadDockProps {
  unreadCount: number;
  latestUnread?: IncomingMessageNotificationItem;
  onClick: () => void;
  onDismiss: () => void;
}

export function FloatingUnreadDock({
  unreadCount,
  latestUnread,
  onClick,
  onDismiss,
}: FloatingUnreadDockProps) {
  if (unreadCount <= 0) return null;

  const senderFirstName = latestUnread?.senderName
    ? latestUnread.senderName.split(" ")[0]
    : "Warga";

  return (
    <div
      aria-label="Pemberitahuan Pesan Tertunda"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="group relative flex items-center gap-2 rounded-2xl border-2 border-emerald-500/80 bg-slate-900/95 text-white p-2 sm:px-3.5 sm:py-2.5 shadow-2xl backdrop-blur-xl ring-4 ring-emerald-500/20 hover:border-emerald-400 transition-all">
        
        {/* Pulsing indicator badge */}
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-2.5 text-left cursor-pointer outline-none"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30 shrink-0 group-hover:scale-105 transition-transform">
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
            </span>
            <MessageSquare className="h-4 w-4" />
          </div>

          <div className="flex flex-col pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {unreadCount} Pesan Menunggu
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-300 line-clamp-1 max-w-[170px] sm:max-w-[220px]">
              Tanggapi {senderFirstName}...
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 rounded-lg bg-emerald-600/30 border border-emerald-500/40 px-2 py-1 text-[10px] font-bold text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <span>Balas</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        {/* Dismiss cross */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          title="Sembunyikan notifikasi mengambang"
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
