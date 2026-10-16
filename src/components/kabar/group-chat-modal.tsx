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
              setTimeout(() => scrollToBottom("smooth"), 100);
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn("Realtime group chat not available:", realtimeErr);
    }

    // 2. Polling ringan cadangan (hanya saat tab browser aktif)
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="relative flex flex-col w-full max-w-lg h-[88vh] max-h-[680px] rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* ========================================================= */}
          {/* HEADER GRUP CHAT                                          */}
          {/* ========================================================= */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Group Icon */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white font-black text-base shadow-sm border border-white dark:border-slate-800 shrink-0 ${
                  isKegiatan
                    ? "bg-gradient-to-tr from-amber-600 via-emerald-600 to-teal-700"
                    : room.jenis === "posyandu"
                    ? "bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-700"
                    : room.jenis === "satuan_paud"
                    ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-800"
                    : "bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-800"
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
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                    {room.nama}
                  </h3>
                  {isKegiatan && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 dark:text-emerald-300 shrink-0">
                      Grup Kegiatan
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
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
                      <span className="text-slate-400">oleh {room.creator_name}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Header Actions: Kelola Anggota, Hapus Grup & Tutup */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowMembersModal(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                title="Kelola & Lihat Anggota"
              >
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Anggota ({room.jumlah_anggota})</span>
              </button>

              {isKegiatan && isCreatorOrAdmin && (
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  title="Hapus Grup Kegiatan Ini"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Obrolan Grup"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MESSAGES BODY                                             */}
          {/* ========================================================= */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950 dark:to-slate-900">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold">Memuat pesan grup...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="h-7 w-7 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isKegiatan ? "Percakapan Grup Kegiatan" : "Obrolan Grup Komunitas"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
                      className="rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95"
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
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-xs">
                          {msg.profiles?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={msg.profiles.avatar_url}
                              alt={authorName}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <span>{authorInitial}</span>
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? "bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-tr-none font-medium"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700"
                        }`}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[11px] font-black text-slate-900 dark:text-slate-100">
                              {authorName}
                            </span>
                            {roleBadge && (
                              <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                {roleBadge}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.pesan}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                            isMe ? "text-emerald-100" : "text-slate-400"
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

          {/* ========================================================= */}
          {/* QUICK SUGGESTIONS BAR                                     */}
          {/* ========================================================= */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60">
              {quickGreetings.slice(0, 3).map((greeting, idx) => (
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
          {/* INPUT FORM                                                */}
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
              placeholder={`Tulis pesan untuk grup ${room.nama}...`}
              className="flex-1 min-h-[42px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSending}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              aria-label="Kirim Pesan Grup"
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

      {/* Modal Kelola Anggota Grup */}
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
