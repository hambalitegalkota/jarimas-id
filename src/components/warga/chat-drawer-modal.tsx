"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  Camera,
  ZoomIn,
  Download,
  AlertCircle,
  CornerDownLeft,
  AtSign,
} from "lucide-react";
import { getPrivateConversation, sendPrivateMessage } from "@/app/actions/pertemanan";
import { createClient } from "@/utils/supabase/client";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import {
  type PesanPribadi,
  type RegisteredUserItem,
  JARIMAS_BOT_ID,
  JARIMAS_BOT_NAME,
} from "@/types/database";
import { isAdminPusat, isSuperAdmin, cn } from "@/lib/utils";
import {
  compressScreenshot,
  serializeChatMessage,
  parseChatMessage,
  formatFileSize,
  type CompressedImageResult,
} from "@/lib/chat-media-helper";

interface ChatDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: RegisteredUserItem | null;
  currentUserId: string | null;
}

// Rekomendasi pesan cepat untuk konsultasi Admin Pusat
const QUICK_GREETINGS = [
  "Assalamu'alaikum wr. wb. salam hangat Admin! 🙏",
  "Mohon panduan terkait fitur aplikasi Jarimas 💡",
  "Bisa konsultasi terkait pendataan warga? 📋",
  "Ada kendala saat validasi data anak usia dini 🩺",
  "Informasi sinkronisasi Posyandu & RT/RW 🏘️",
];

// Kategori Emoticon Lengkap (sama seperti percakapan komunitas The Orbit Sixty)
const EMOJI_CATEGORIES = [
  {
    name: "Populer",
    icon: "🌟",
    emojis: ["👍", "❤️", "😊", "🙏", "👏", "🎉", "🔥", "💡", "☕", "✅", "📢", "🏘️"],
  },
  {
    name: "Ekspresi",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😉", "😊", "😇",
      "🥰", "😍", "🤩", "😘", "😋", "😜", "🤔", "🤫", "🤝", "👏", "🙌", "👍",
      "👎", "👊", "✌️", "👌", "🙏", "💪",
    ],
  },
  {
    name: "Kesehatan",
    icon: "🩺",
    emojis: ["🩺", "💉", "💊", "🩹", "👶", "🧒", "🍼", "🥣", "🥗", "🍎", "🥛", "❤️", "🌡️", "⚖️"],
  },
  {
    name: "Pendidikan",
    icon: "📚",
    emojis: ["📚", "🎒", "✏️", "🎨", "🎓", "🏫", "📖", "🖍️", "🧸", "🧩", "📝", "📋", "🧑‍🏫", "📌"],
  },
  {
    name: "Lingkungan",
    icon: "🏘️",
    emojis: ["🏘️", "🏡", "🏢", "🌳", "🧹", "🛡️", "🤝", "👥", "📢", "🔔", "📌", "📍", "🇮🇩", "🌱"],
  },
];

export function ChatDrawerModal({
  isOpen,
  onClose,
  targetUser,
  currentUserId,
}: ChatDrawerModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  let isOnline = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const notifContext = useGlobalMessageNotification();
    if (notifContext && targetUser?.id) {
      isOnline = notifContext.isUserOnline(targetUser.id);
    }
  } catch {
    // Fallback jika dirender di luar context
  }

  const [messages, setMessages] = useState<PesanPribadi[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Mode Enter: "newline" (Enter baris baru) atau "send" (Enter kirim)
  const [enterMode, setEnterMode] = useState<"newline" | "send">("send");

  // Fitur Modern: Tangkapan Layar
  const [attachedImage, setAttachedImage] = useState<CompressedImageResult | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Fitur Modern: Lightbox Preview
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Fitur Modern: Emoji Picker dengan Kategori
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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
      textareaRef.current?.focus();
    }, 200);

    // 1. Supabase Realtime Subscription untuk percakapan 1-on-1 ini
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`chat_private_${currentUserId}_${targetUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "pesan_pribadi",
          },
          (payload: any) => {
            if (!isMounted) return;
            const newMsg = payload.new as PesanPribadi;

            const isRelevant =
              (newMsg.sender_id === currentUserId && newMsg.receiver_id === targetUser.id) ||
              (newMsg.sender_id === targetUser.id && newMsg.receiver_id === currentUserId);

            if (isRelevant) {
              setMessages((prev) => {
                if (
                  prev.some(
                    (m) =>
                      m.id === newMsg.id ||
                      (m.id.startsWith("temp-") && m.pesan === newMsg.pesan)
                  )
                ) {
                  return prev.map((m) =>
                    m.pesan === newMsg.pesan && m.id.startsWith("temp-") ? newMsg : m
                  );
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

    // 2. Polling cadangan (30 detik)
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
        // Abaikan
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
  }, [isOpen, targetUser, currentUserId]);

  // Tutup emoji picker jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  if (!isOpen || !targetUser || !mounted) return null;

  // Sesuaikan tinggi textarea otomatis
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 44),
        120
      )}px`;
    }
  };

  // Kompresi tangkapan layar di browser
  const processImageFile = async (file: File | Blob) => {
    setImageError(null);
    setIsProcessingImage(true);

    try {
      const result = await compressScreenshot(file, 960, 0.7, 75000);
      setAttachedImage(result);
    } catch (err: any) {
      console.error("Gagal kompresi tangkapan layar:", err);
      setImageError(err?.message || "Gagal memproses tangkapan layar.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Tangani Paste dari Clipboard (Ctrl + V)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await processImageFile(file);
          break;
        }
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
      e.target.value = "";
    }
  };

  const insertEmoji = (emoji: string) => {
    if (!textareaRef.current) {
      setInputMessage((prev) => prev + emoji);
      return;
    }
    const val = inputMessage;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newVal = val.substring(0, start) + emoji + val.substring(end);
    setInputMessage(newVal);
    setShowEmojiPicker(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
        adjustTextareaHeight();
      }
    }, 20);
  };

  // Sisipkan baris baru (tombol Baris Baru)
  const insertNewline = () => {
    if (!textareaRef.current) {
      setInputMessage((prev) => prev + "\n");
      return;
    }
    const val = inputMessage;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newVal = val.substring(0, start) + "\n" + val.substring(end);
    setInputMessage(newVal);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + 1, start + 1);
        adjustTextareaHeight();
      }
    }, 20);
  };

  // Sisipkan tag Admin Pusat (@AdminPusat)
  const insertTagAdmin = () => {
    const tag = "@AdminPusat ";
    if (!textareaRef.current) {
      setInputMessage((prev) => prev + tag);
      return;
    }
    const val = inputMessage;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newVal = val.substring(0, start) + tag + val.substring(end);
    setInputMessage(newVal);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + tag.length, start + tag.length);
        adjustTextareaHeight();
      }
    }, 20);
  };

  const toggleEnterMode = () => {
    setEnterMode((prev) => (prev === "newline" ? "send" : "newline"));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift + Enter selalu membuat baris baru
        return;
      }
      if (enterMode === "send") {
        e.preventDefault();
        handleSendMessage();
      } else {
        // Mode enter newline: biarkan browser memasukkan \n, sesuaikan tinggi
        setTimeout(adjustTextareaHeight, 10);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawText = inputMessage.trim();
    if ((!rawText && !attachedImage) || isSending) return;

    setSendError(null);

    const serializedPesan = serializeChatMessage({
      text: rawText,
      imageUrl: attachedImage?.dataUrl || null,
    });

    // Optimistic UI insert
    const tempId = "temp-" + Date.now();
    const optimisticMsg: PesanPribadi = {
      id: tempId,
      sender_id: currentUserId || "me",
      receiver_id: targetUser.id,
      pesan: serializedPesan,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");
    setAttachedImage(null);
    setShowEmojiPicker(false);
    setIsSending(true);

    setTimeout(() => {
      scrollToBottom("smooth");
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }
    }, 50);

    try {
      const res = await sendPrivateMessage({
        receiverId: targetUser.id,
        pesan: serializedPesan,
      });

      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.data! : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInputMessage(rawText);
        setSendError(res.message || "Gagal mengirim pesan ke server.");
      }
    } catch (err: any) {
      console.error("Gagal mengirim pesan:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputMessage(rawText);
      setSendError(err?.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickGreeting = (greeting: string) => {
    setInputMessage(greeting);
    setTimeout(() => {
      textareaRef.current?.focus();
      adjustTextareaHeight();
    }, 20);
  };

  const isJarimasBot =
    targetUser.id === JARIMAS_BOT_ID || targetUser.nama_lengkap === JARIMAS_BOT_NAME;
  const initial = targetUser.nama_lengkap.charAt(0).toUpperCase() || "J";

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-lg h-[92vh] sm:h-[86vh] max-h-[660px] rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ========================================================= */}
        {/* 1. HEADER CHAT                                            */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-3 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* User Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-800 text-white font-black text-sm sm:text-base shadow-xs border border-white dark:border-slate-800">
                {isJarimasBot ? (
                  <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                ) : targetUser.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={targetUser.avatar_url}
                    alt={targetUser.nama_lengkap}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              {/* Online Indicator */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs",
                  isOnline || isJarimasBot ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                )}
                title={isOnline || isJarimasBot ? "Sedang Online" : "Sedang Offline"}
              />
            </div>

            {/* User Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {targetUser.nama_lengkap}
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Admin Pusat
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 truncate">
                <span className="truncate">Jarimas Indonesia</span>
                <span className="opacity-60">•</span>
                <span className={cn("font-medium", isOnline || isJarimasBot ? "text-emerald-600 dark:text-emerald-400 font-bold" : "")}>
                  {isOnline || isJarimasBot ? "Aktif Sekarang" : "Pesan Langsung"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Header: Enter Mode Toggle & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleEnterMode}
              title={`Klik untuk ubah: saat ini tombol Enter berfungsi ${
                enterMode === "newline" ? "membuat baris baru" : "mengirim pesan"
              }`}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold transition-colors cursor-pointer"
            >
              <CornerDownLeft className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              <span>Enter: {enterMode === "newline" ? "Baris Baru" : "Kirim"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Percakapan"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MESSAGES SCROLL AREA (min-h-0 prevents overflow)      */}
        {/* ========================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 bg-slate-50/60 dark:bg-slate-950/40 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="text-xs font-semibold">Memuat percakapan...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Konsultasi dengan Admin Pusat
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Belum ada pesan sebelumnya. Kirim pertanyaan, panduan aplikasi, kendala data warga, atau lampirkan tangkapan layar.
                </p>
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
                const parsed = parseChatMessage(msg.pesan);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 mb-0.5 px-1 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Admin Pusat
                      </span>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                        isMe
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-none font-medium shadow-teal-700/10"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {/* Tangkapan Layar Jika Ada */}
                      {parsed.imageUrl && (
                        <div className="relative group/img overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 my-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={parsed.imageUrl}
                            alt="Tangkapan Layar"
                            loading="lazy"
                            onClick={() =>
                              setLightboxImage({
                                url: parsed.imageUrl!,
                                title: `Tangkapan Layar ${isMe ? "Saya" : "Admin Pusat"}`,
                              })
                            }
                            className="max-h-52 w-auto object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: parsed.imageUrl!,
                                title: `Tangkapan Layar ${isMe ? "Saya" : "Admin Pusat"}`,
                              })
                            }
                            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs cursor-pointer"
                          >
                            <ZoomIn className="h-3 w-3" />
                            <span>Perbesar</span>
                          </button>
                        </div>
                      )}

                      {/* Teks Pesan */}
                      {parsed.text && (
                        <p className="whitespace-pre-wrap break-words leading-relaxed font-normal">
                          {parsed.text}
                        </p>
                      )}

                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          isMe ? "text-teal-100" : "text-slate-400"
                        }`}
                      >
                        <span>{timeStr}</span>
                        {isMe && (
                          <span>
                            {msg.is_read ? (
                              <CheckCheck className="h-3 w-3 text-teal-200" />
                            ) : (
                              <Check className="h-3 w-3 text-teal-200" />
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
        {/* 3. SARAN PESAN CEPAT (QUICK PRESETS)                      */}
        {/* ========================================================= */}
        <div className="px-3 py-1.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1 pl-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Saran:
          </span>
          {QUICK_GREETINGS.map((greeting, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickGreeting(greeting)}
              className="shrink-0 text-2xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {greeting}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 4. PREVIEW TANGKAPAN LAYAR TERLAMPIR                      */}
        {/* ========================================================= */}
        {attachedImage && (
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/50 border-t border-emerald-200 dark:border-emerald-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedImage.dataUrl}
                alt="Preview screenshot"
                className="h-10 w-10 object-cover rounded-lg border border-emerald-300 shadow-2xs shrink-0"
              />
              <div className="min-w-0 text-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">
                    Tangkapan Layar Siap Dikirim
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-extrabold text-[10px]">
                    {formatFileSize(attachedImage.sizeBytes)}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Terkompresi otomatis ({attachedImage.width}x{attachedImage.height}px)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Hapus tangkapan layar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. POPUP EMOJI PICKER (KATEGORI MODERN)                   */}
        {/* ========================================================= */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-28 left-3 right-3 sm:left-4 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-2xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header Tabs Emoji */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveEmojiCategory(idx)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer",
                    activeEmojiCategory === idx
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Grid Emoji */}
            <div className="p-2.5 max-h-48 overflow-y-auto grid grid-cols-6 gap-2 bg-white dark:bg-slate-900">
              {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="h-8 w-8 flex items-center justify-center text-lg rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:scale-115 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. INPUT CHAT BAR (KOTAK PESAN DIJAMIN SELALU TERLIHAT)  */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-slate-50 dark:bg-slate-950/90 border-t-2 border-slate-200 dark:border-slate-800 shrink-0 space-y-2"
        >
          {sendError && (
            <p className="text-2xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{sendError}</span>
            </p>
          )}

          {/* Toolbar Pembantu: Emoticon, Tag Admin, Tangkapan Layar, Baris Baru */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              {/* Tombol Emoji */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                title="Sisipkan Emoticon"
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                  showEmojiPicker
                    ? "bg-teal-600 text-white"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Smile className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Emoticon</span>
              </button>

              {/* Tombol Tag Admin */}
              <button
                type="button"
                onClick={insertTagAdmin}
                title="Tag / Sebut Admin Pusat"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <AtSign className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">Tag Admin</span>
              </button>

              {/* Tombol Lampirkan Tangkapan Layar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                title="Kirim Gambar / Tangkapan Layar (Ctrl+V juga didukung)"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingImage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span className="hidden sm:inline">Tangkapan Layar</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Tombol Enter Baris Baru */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={insertNewline}
                title="Tambahkan baris baru"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <CornerDownLeft className="h-3 w-3 text-slate-500" />
                <span>Baris Baru</span>
              </button>
            </div>
          </div>

          {/* Kotak Input Textarea & Tombol Kirim */}
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                rows={1}
                placeholder="Ketik pesan untuk Admin Pusat Jarimas... (Enter kirim, Shift+Enter baris baru, Ctrl+V tangkapan layar)"
                className="w-full min-h-[44px] max-h-32 py-2.5 px-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed shadow-2xs"
                disabled={isSending}
              />
            </div>

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={(!inputMessage.trim() && !attachedImage) || isSending}
              aria-label="Kirim Pesan"
              className="inline-flex h-11 px-4 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-xs shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lightbox Modal untuk Preview Gambar Penuh */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white px-2">
              <p className="text-xs sm:text-sm font-bold truncate">
                {lightboxImage.title}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  download="tangkapan-layar-jarimas.webp"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/20 bg-slate-950"
            />
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
