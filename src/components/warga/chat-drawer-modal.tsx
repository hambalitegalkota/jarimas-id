"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Smile,
  Heart,
} from "lucide-react";
import { getPrivateConversation, sendPrivateMessage } from "@/app/actions/pertemanan";
import { createClient } from "@/utils/supabase/client";
import type { PesanPribadi, RegisteredUserItem } from "@/types/database";

interface ChatDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: RegisteredUserItem | null;
  currentUserId: string | null;
}

const QUICK_GREETINGS = [
  "Halo, salam kenal! 👋",
  "Assalamu'alaikum 🙏",
  "Salam sehat Kader Posyandu 🩺",
  "Bisa koordinasi terkait warga RT/RW? 🏘️",
];

export function ChatDrawerModal({
  isOpen,
  onClose,
  targetUser,
  currentUserId,
}: ChatDrawerModalProps) {
  const [messages, setMessages] = useState<PesanPribadi[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Muat riwayat percakapan saat modal dibuka atau target berganti
  useEffect(() => {
    if (!isOpen || !targetUser) return;

    let isMounted = true;

    async function loadChat() {
      if (!targetUser) return;
      setIsLoading(true);
      try {
        const res = await getPrivateConversation(targetUser.id);
        if (isMounted && res.success) {
          setMessages(res.messages || []);
          setTimeout(() => scrollToBottom("auto"), 100);
        }
      } catch (err) {
        console.error("Gagal mengambil chat:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadChat();

    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    // 1. Supabase Realtime Subscription (Pesan Masuk Instan)
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`chat_personal_${currentUserId || "anon"}_${targetUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "pesan_pribadi",
          },
          (payload: any) => {
            const newMsg = payload.new as PesanPribadi;
            if (
              (newMsg.sender_id === targetUser.id && newMsg.receiver_id === currentUserId) ||
              (newMsg.sender_id === currentUserId && newMsg.receiver_id === targetUser.id)
            ) {
              setMessages((prev) => {
                // Hindari duplikat dari optimistic UI
                if (prev.some((m) => m.id === newMsg.id || (m.id.startsWith("temp-") && m.pesan === newMsg.pesan))) {
                  return prev.map((m) => (m.pesan === newMsg.pesan && m.id.startsWith("temp-") ? newMsg : m));
                }
                setTimeout(() => scrollToBottom("smooth"), 100);
                return [...prev, newMsg];
              });
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn("Realtime not available, falling back to polling:", realtimeErr);
    }

    // 2. Polling ringan cadangan (hanya berjalan saat tab browser aktif / tidak hidden)
    const interval = setInterval(async () => {
      if (!targetUser || (typeof document !== "undefined" && document.hidden)) return;
      try {
        const res = await getPrivateConversation(targetUser.id);
        if (res.success && res.messages) {
          setMessages((prev) => {
            if (res.messages.length !== prev.length) {
              setTimeout(() => scrollToBottom("smooth"), 100);
              return res.messages;
            }
            return prev;
          });
        }
      } catch {
        // Abaikan polling error
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // Cleanup
        }
      }
    };
  }, [isOpen, targetUser, currentUserId]);

  if (!isOpen || !targetUser) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setSendError(null);

    // Optimistic UI insert
    const tempId = "temp-" + Date.now();
    const optimisticMsg: PesanPribadi = {
      id: tempId,
      sender_id: currentUserId || "me",
      receiver_id: targetUser.id,
      pesan: text,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");
    setIsSending(true);
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const res = await sendPrivateMessage({
        receiverId: targetUser.id,
        pesan: text,
      });

      if (res.success && res.data) {
        // Gantikan temp message dengan data dari server
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.data! : m))
        );
      } else {
        // Rollback dan tampilkan error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInputMessage(text);
        setSendError(res.message || "Gagal mengirim pesan ke server.");
      }
    } catch (err: any) {
      console.error("Gagal mengirim pesan:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputMessage(text);
      setSendError(err?.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickGreeting = (greeting: string) => {
    setInputMessage(greeting);
    inputRef.current?.focus();
  };

  const initial = targetUser.nama_lengkap.charAt(0).toUpperCase() || "W";
  const primaryCommunity = targetUser.komunitas_list?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-lg h-[88vh] max-h-[680px] rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ========================================================= */}
        {/* HEADER CHAT                                               */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* User Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-800 text-white font-black text-base shadow-sm border border-white dark:border-slate-800">
                {targetUser.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={targetUser.avatar_url}
                    alt={targetUser.nama_lengkap}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 ring-1 ring-emerald-400" />
            </div>

            {/* User Name & Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                  {targetUser.nama_lengkap}
                </h3>
                {targetUser.is_super_admin && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[9px] font-black text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <ShieldCheck className="h-3 w-3 text-amber-600" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {primaryCommunity ? (
                  <span>
                    {primaryCommunity.peran} • {primaryCommunity.nama}
                  </span>
                ) : (
                  <span>Warga Terdaftar Jarimas-ID</span>
                )}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Tutup Percakapan"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert Banner */}
        {sendError && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2 shrink-0 animate-in fade-in">
            <span>⚠️ {sendError}</span>
            <button
              type="button"
              onClick={() => setSendError(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MESSAGES BODY                                             */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950 dark:to-slate-900">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Memuat percakapan...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Mulai Percakapan Pribadi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Belum ada pesan sebelumnya. Kirim pesan pertama untuk menyapa, berbagi info, atau koordinasi posyandu/warga!
                </p>
              </div>

              {/* Quick Greeting Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-sm">
                {QUICK_GREETINGS.map((greeting, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickGreeting(greeting)}
                    className="rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    {greeting}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                const timeStr = new Date(msg.created_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? "bg-gradient-to-tr from-emerald-700 to-teal-600 text-white rounded-tr-none font-medium shadow-emerald-700/10"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.pesan}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          isMe ? "text-emerald-100" : "text-slate-400"
                        }`}
                      >
                        <span>{timeStr}</span>
                        {isMe && (
                          <span>
                            {msg.is_read ? (
                              <CheckCheck className="h-3 w-3 text-emerald-200" />
                            ) : (
                              <Check className="h-3 w-3 text-emerald-200" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* QUICK SUGGESTIONS BAR (if there are messages)            */}
        {/* ========================================================= */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60">
            {QUICK_GREETINGS.slice(0, 3).map((greeting, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickGreeting(greeting)}
                className="whitespace-nowrap rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                {greeting}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* INPUT CHAT BAR                                            */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 p-3 border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ketik pesan untuk ${targetUser.nama_lengkap.split(" ")[0]}...`}
            className="flex-1 min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isSending}
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            aria-label="Kirim Pesan"
            className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
