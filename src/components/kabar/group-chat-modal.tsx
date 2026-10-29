"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Send,
  Sparkles,
  Users,
  Building2,
  HeartPulse,
  GraduationCap,
  Calendar,
  Loader2,
  UserPlus,
  ShieldCheck,
  Crown,
  Trash2,
} from "lucide-react";
import { getGroupMessages, sendGroupMessage } from "@/app/actions/pertemanan";
import { deleteGrupKegiatan } from "@/app/actions/grup-kegiatan";
import { createClient } from "@/utils/supabase/client";
import type { PesanGrup, GrupChatRoom, RegisteredUserItem } from "@/types/database";
import { ManageGrupMembersModal } from "./manage-grup-members-modal";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import { parseChatMessage } from "@/lib/chat-media-helper";

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GrupChatRoom | null;
  currentUserId: string | null;
  allUsers?: RegisteredUserItem[];
  canManage?: boolean;
}

const QUICK_COMMUNITY_GREETINGS = [
  "Halo semua warga & kader! 👋",
  "Assalamu'alaikum wr. wb. 🙏",
  "Bagaimana jadwal kegiatan posyandu minggu ini? 🩺",
  "Ada informasi terbaru dari RT/RW? 🏘️",
];

const QUICK_KEGIATAN_GREETINGS = [
  "Halo rekan-rekan kegiatan! 👋",
  "Agenda kegiatan hari ini sudah siap dibahas 📋",
  "Mohon konfirmasi kehadiran anggota tim 🙏",
  "Materi & catatan tindak lanjut kegiatan 📌",
];

export function GroupChatModal({
  isOpen,
  onClose,
  room,
  currentUserId,
  allUsers = [],
  canManage = false,
}: GroupChatModalProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<PesanGrup[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const { markGroupAsRead } = useGlobalMessageNotification();

  const isCreatorOrAdmin =
    Boolean(canManage) ||
    Boolean(currentUserId && room?.created_by === currentUserId);

  const handleDeleteGroup = async () => {
    if (!room) return;
    const confirm = window.confirm(
      `Apakah Anda yakin ingin menghapus grup kegiatan "${room.nama}"? Seluruh riwayat percakapan dan keanggotaan dalam grup ini akan dihapus secara permanen.`
    );
    if (!confirm) return;

    try {
      const res = await deleteGrupKegiatan(room.id);
      if (res.success) {
        alert(res.message || "Grup kegiatan berhasil dihapus.");
        onClose();
        router.refresh();
      } else {
        alert(res.message || "Gagal menghapus grup kegiatan.");
      }
    } catch (err: any) {
      alert(err?.message || "Terjadi kesalahan saat menghapus grup.");
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isKegiatan = room?.jenis === "kegiatan" || room?.is_kegiatan;
  const quickGreetings = isKegiatan
    ? QUICK_KEGIATAN_GREETINGS
    : QUICK_COMMUNITY_GREETINGS;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!isOpen || !room) return;

    let isMounted = true;

    async function loadMessages() {
      if (!room) return;
      setIsLoading(true);
      try {
        const res = await getGroupMessages(room.id);
        if (isMounted && res.success) {
          setMessages(res.messages || []);
          setTimeout(() => scrollToBottom("auto"), 100);
        }
      } catch (err) {
        console.error("Gagal load group messages:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMessages();
    if (room?.id) markGroupAsRead(room.id);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    // 1. Supabase Realtime Subscription (Pesan Grup Masuk Instan)
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`chat_group_${room.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "pesan_grup",
            filter: `komunitas_id=eq.${room.id}`,
          },
          async () => {
            // Segera fetch pesan grup terupdate
            if (!isMounted) return;
            const res = await getGroupMessages(room.id);
            if (isMounted && res.success && res.messages) {
              setMessages(res.messages);
              if (room?.id) markGroupAsRead(room.id);
              setTimeout(() => scrollToBottom("smooth"), 100);
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn("Realtime group chat not available:", realtimeErr);
    }

    // 2. Polling cadangan (30 detik, andalkan Supabase Realtime)
    const interval = setInterval(async () => {
      if (!room || (typeof document !== "undefined" && document.hidden)) return;
      try {
        const res = await getGroupMessages(room.id);
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
        // Ignored
      }
    }, 30000);

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
  }, [isOpen, room]);

  if (!isOpen || !room) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    const tempId = "temp-" + Date.now();
    const optimisticMsg: PesanGrup = {
      id: tempId,
      komunitas_id: room.id,
      user_id: currentUserId || "me",
      pesan: text,
      created_at: new Date().toISOString(),
      profiles: {
        id: currentUserId || "me",
        nama_lengkap: "Saya",
        email: "",
        is_super_admin: false,
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");
    setIsSending(true);
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const res = await sendGroupMessage({
        komunitasId: room.id,
        pesan: text,
      });
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.data! : m))
        );
      }
    } catch (err) {
      console.error("Gagal kirim pesan grup:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickGreeting = (g: string) => {
    setInputMessage(g);
    inputRef.current?.focus();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="relative flex flex-col w-full max-w-lg h-[88vh] max-h-[680px] rounded-lg border border-border bg-card shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* HEADER GRUP CHAT */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Group Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md font-bold text-sm shrink-0 border ${
                  isKegiatan
                    ? "bg-secondary/15 text-secondary border-secondary/30"
                    : room.jenis === "posyandu"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    : room.jenis === "satuan_paud"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    : "bg-primary/15 text-primary border-primary/30"
                }`}
              >
                {isKegiatan ? (
                  <Sparkles className="h-5 w-5" />
                ) : room.jenis === "posyandu" ? (
                  <HeartPulse className="h-5 w-5" />
                ) : room.jenis === "satuan_paud" ? (
                  <GraduationCap className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>

              {/* Group Title & Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                    {room.nama}
                  </h3>
                  {isKegiatan && (
                    <span className="rounded-md bg-secondary/15 border border-secondary/30 px-1.5 py-0.5 text-2xs font-semibold text-secondary shrink-0">
                      Grup Kegiatan
                    </span>
                  )}
                </div>
                <p className="text-2xs text-muted-foreground flex items-center gap-1.5 truncate">
                  <span>{room.jumlah_anggota} Anggota</span>
                  <span>•</span>
                  {isKegiatan ? (
                    <span>Kota Tegal</span>
                  ) : (
                    <span className="capitalize">{room.jenis.replace("_", " ")}</span>
                  )}
                  {room.creator_name && (
                    <>
                      <span>•</span>
                      <span className="text-muted-foreground/80">oleh {room.creator_name}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowMembersModal(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
                title="Kelola & Lihat Anggota"
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Anggota ({room.jumlah_anggota})</span>
              </button>

              {isKegiatan && isCreatorOrAdmin && (
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  title="Hapus Grup Kegiatan Ini"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Obrolan Grup"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs font-medium">Memuat pesan grup...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-bold text-foreground">
                    {isKegiatan ? "Percakapan Grup Kegiatan" : "Obrolan Grup Komunitas"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isKegiatan
                      ? "Ruang koordinasi kegiatan telah siap. Kirim pesan pembuka atau diskusikan agenda bersama tim terundang!"
                      : "Belum ada pesan di grup ini. Kirim pesan pertama untuk berdiskusi dengan sesama anggota komunitas!"}
                  </p>
                </div>

                {/* Quick Greeting Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-sm">
                  {quickGreetings.map((greeting, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickGreeting(greeting)}
                      className="rounded-md bg-card hover:bg-muted border border-border px-2.5 py-1 text-2xs font-medium text-foreground transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      {greeting}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.user_id === currentUserId;
                  const authorName = msg.profiles?.nama_lengkap || "Warga";
                  const authorInitial = authorName.charAt(0).toUpperCase();
                  const timeStr = new Date(msg.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const roleBadge = msg.user_role;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-2xs border border-primary/20 shadow-2xs">
                          {msg.profiles?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={msg.profiles.avatar_url}
                              alt={authorName}
                              className="h-full w-full rounded-md object-cover"
                            />
                          ) : (
                            <span>{authorInitial}</span>
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[82%] sm:max-w-[75%] rounded-lg px-3.5 py-2 shadow-xs text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-xs font-medium"
                            : "bg-card text-card-foreground rounded-tl-xs border border-border"
                        }`}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-2xs font-bold text-foreground">
                              {authorName}
                            </span>
                            {roleBadge && (
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
                                {roleBadge}
                              </span>
                            )}
                          </div>
                        )}
                        {(() => {
                          const parsed = parseChatMessage(msg.pesan);
                          return (
                            <>
                              {parsed.replyTo && (
                                <div className="p-1.5 rounded-md text-2xs border-l-2 bg-black/10 dark:bg-black/30 border-teal-500 mb-1">
                                  <p className="font-bold">{parsed.replyTo.senderName}</p>
                                  <p className="truncate line-clamp-1 italic text-2xs opacity-80">{parsed.replyTo.textSnippet}</p>
                                </div>
                              )}
                              {parsed.imageUrl && (
                                <div className="overflow-hidden rounded-md mb-1.5 border border-black/10">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={parsed.imageUrl} alt="Tangkapan layar" className="max-h-60 w-auto rounded-md object-cover" />
                                </div>
                              )}
                              {parsed.text && <p className="whitespace-pre-wrap break-words">{parsed.text}</p>}
                            </>
                          );
                        })()}
                        <div
                          className={`flex items-center justify-end gap-1 text-2xs mt-1 ${
                            isMe ? "text-primary-foreground/75" : "text-muted-foreground"
                          }`}
                        >
                          <span>{timeStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* QUICK SUGGESTIONS BAR */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none border-t border-border bg-muted/30">
              {quickGreetings.slice(0, 3).map((greeting, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickGreeting(greeting)}
                  className="whitespace-nowrap rounded-md bg-card hover:bg-muted border border-border px-2 py-0.5 text-2xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  {greeting}
                </button>
              ))}
            </div>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 p-3 border-t border-border bg-card shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Tulis pesan untuk grup ${room.nama}...`}
              className="flex-1 min-h-[44px] h-11 rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isSending}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              aria-label="Kirim Pesan Grup"
              className="inline-flex min-h-[44px] h-11 min-w-[44px] w-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-xs"
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
      <ManageGrupMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        room={room}
        allUsers={allUsers}
        canManage={isCreatorOrAdmin}
        currentUserId={currentUserId}
        onMembersUpdated={() => router.refresh()}
      />
    </>
  );
}
