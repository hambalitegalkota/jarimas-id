"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  MessageCircle,
} from "lucide-react";
import type { IncomingMessageNotificationItem } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FloatingMessageNotificationBannerProps {
  notification: IncomingMessageNotificationItem;
  isMuted: boolean;
  onDismiss: () => void;
  onQuickReply: (replyText: string) => Promise<{ success: boolean; message?: string }>;
  onOpenFullChat: () => void;
  onToggleMute: () => void;
}

const QUICK_RESPONSE_PRESETS = [
  "Siap, segera saya cek! 👍",
  "Baik, terima kasih infonya 🙏",
  "Bisa koordinasi via chat ini? 💬",
  "Oke siap 📋",
];

const AUTO_DISMISS_SECONDS = 15;

export function FloatingMessageNotificationBanner({
  notification,
  isMuted,
  onDismiss,
  onQuickReply,
  onOpenFullChat,
  onToggleMute,
}: FloatingMessageNotificationBannerProps) {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss countdown timer with pause on hover/focus
  useEffect(() => {
    if (isHovered || replyText.length > 0 || isSending) return;

    const intervalMs = 100;
    const step = (intervalMs / (AUTO_DISMISS_SECONDS * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isHovered, replyText, isSending, onDismiss]);

  const handleSendReply = async (textToSend?: string) => {
    const finalMsg = (textToSend || replyText).trim();
    if (!finalMsg || isSending) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await onQuickReply(finalMsg);
      if (res.success) {
        setSendSuccess(true);
        setTimeout(() => {
          onDismiss();
        }, 1200);
      } else {
        setErrorMessage(res.message || "Gagal mengirim balasan.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi.");
    } finally {
      setIsSending(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    setReplyText(chipText);
    handleSendReply(chipText);
  };

  const initials = notification.senderName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isBot =
    notification.senderId === "00000000-0000-0000-0000-000000000001" ||
    notification.senderName.toLowerCase().includes("jarimas");

  return (
    <aside
      aria-label="Notifikasi Pesan Masuk"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-6 sm:w-[440px] z-50 pointer-events-auto transition-all duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400/90 dark:border-emerald-500 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 shadow-[0_20px_50px_rgba(5,150,105,0.3)] ring-4 ring-emerald-500/25 backdrop-blur-xl animate-in slide-in-from-top-6 fade-in duration-300 zoom-in-98">
        
        {/* Top Progress Countdown Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Ambient Top Glow Effect */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />

        <div className="p-4 sm:p-5 flex flex-col gap-3.5 relative z-10">
          {/* Header Row: Attention Radar & Controls */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30">
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-slate-900" />
                </span>
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-spin duration-1000" />
                    Pesan Baru Masuk
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="h-2.5 w-2.5 text-emerald-400" />
                  Menunggu tanggapan Anda
                </span>
              </div>
            </div>

            {/* Mute and Close buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleMute}
                title={isMuted ? "Bunyikan notifikasi" : "Senyapkan notifikasi"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-amber-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                )}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                title="Tutup banner notifikasi"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sender Profile & Message Snippet */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0 mt-0.5">
              <Avatar className="h-10 w-10 ring-2 ring-emerald-500/50 shadow-md">
                {notification.senderAvatar && (
                  <AvatarImage
                    src={notification.senderAvatar}
                    alt={notification.senderName}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-tr from-emerald-800 to-teal-900 text-white font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm text-white tracking-tight truncate">
                  {notification.senderName}
                </span>
                {isBot && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" /> Resmi
                  </span>
                )}
                {notification.senderRole && !isBot && (
                  <span className="text-[10px] font-semibold text-emerald-300/90 truncate">
                    • {notification.senderRole}
                  </span>
                )}
              </div>

              {/* Speech Bubble */}
              <div className="rounded-xl bg-slate-800/90 border border-slate-700/80 p-2.5 text-slate-200 text-xs sm:text-sm font-medium leading-relaxed break-words shadow-inner">
                <p className="line-clamp-3 italic">
                  &ldquo;{notification.pesan}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Quick Response Chips (1-Tap Send) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ⚡ Balas Cepat 1-Ketuk:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_RESPONSE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isSending || sendSuccess}
                  onClick={() => handleChipClick(preset)}
                  className="rounded-lg bg-slate-800 hover:bg-emerald-950 hover:border-emerald-500/60 border border-slate-700/70 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:text-emerald-300 transition-all active:scale-95 text-left disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Inline Quick Reply Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendReply();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Tulis balasan untuk ${notification.senderName.split(" ")[0]}...`}
                disabled={isSending || sendSuccess}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-emerald-400 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!replyText.trim() || isSending || sendSuccess}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-xs px-3.5 py-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sendSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-200" />
                  <span>Terkirim!</span>
                </>
              ) : (
                <>
                  <span>Kirim</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Error notice if any */}
          {errorMessage && (
            <p className="text-[11px] font-semibold text-rose-400">
              {errorMessage}
            </p>
          )}

          {/* Action Footer: Open Full Chat Modal */}
          <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onOpenFullChat}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 px-3 py-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all group"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Buka Obrolan Lengkap &amp; Riwayat</span>
              <ArrowRight className="h-3.5 w-3.5 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
