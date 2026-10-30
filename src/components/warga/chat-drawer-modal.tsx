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
  Camera,
  ZoomIn,
  Download,
  AlertCircle,
  CornerDownLeft,
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

const QUICK_GREETINGS = [
  "Halo Admin Pusat Jarimas! 👋",
  "Assalamu'alaikum wr. wb. 🙏",
  "Bisa konsultasi terkait pendataan warga? 📋",
  "Mohon panduan terkait fitur aplikasi Jarimas 💡",
];

const QUICK_EMOJIS = ["👍", "❤️", "😊", "🙏", "👏", "🎉", "🔥", "💡", "🩺", "📚", "🏘️", "✅"];

export function ChatDrawerModal({
  isOpen,
  onClose,
  targetUser,
  currentUserId,
}: ChatDrawerModalProps) {
  let isOnline = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const notifContext = useGlobalMessageNotification();
    if (notifContext && targetUser?.id) {
      isOnline = notifContext.isUserOnline(targetUser.id);
    }
  } catch {
    // Fallback if rendered outside context
  }

  const [messages, setMessages] = useState<PesanPribadi[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Fitur Modern: Tangkapan Layar
  const [attachedImage, setAttachedImage] = useState<CompressedImageResult | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Fitur Modern: Lightbox Preview
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Fitur Modern: Emoji Picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

            // Validasi pesan memang antara kedua pengguna ini
            const isRelevant =
              (newMsg.sender_id === currentUserId && newMsg.receiver_id === targetUser.id) ||
              (newMsg.sender_id === targetUser.id && newMsg.receiver_id === currentUserId);

            if (isRelevant) {
              setMessages((prev) => {
                // Hindari duplikat dari optimistic UI
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

  if (!isOpen || !targetUser) return null;

  // Sesuaikan tinggi textarea otomatis
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 40),
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift + Enter membuat baris baru
        return;
      }
      e.preventDefault();
      handleSendMessage();
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
        textareaRef.current.style.height = "40px";
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-800 text-white font-black text-base shadow-xs border border-white dark:border-slate-800">
                {isJarimasBot ? (
                  <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
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
                {targetUser.is_super_admin ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold border border-purple-200 dark:border-purple-800">
                    <Sparkles className="h-2.5 w-2.5" />
                    Super Admin
                  </span>
                ) : targetUser.is_admin_pusat ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Admin Pusat
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 truncate">
                {primaryCommunity ? (
                  <>
                    <Building2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate">{primaryCommunity.nama}</span>
                    <span className="opacity-60">•</span>
                  </>
                ) : null}
                <span className={cn("font-medium", isOnline || isJarimasBot ? "text-emerald-600 dark:text-emerald-400 font-bold" : "")}>
                  {isOnline || isJarimasBot ? "Aktif Sekarang" : "Pesan Pribadi Langsung"}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Percakapan"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MESSAGES SCROLL AREA                                      */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-950/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Memuat percakapan...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Percakapan Langsung dengan {targetUser.nama_lengkap}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Belum ada pesan sebelumnya. Kirim pesan pertama untuk bertanya, konsultasi, atau berbagi tangkapan layar!
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
                const parsed = parseChatMessage(msg.pesan);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                        isMe
                          ? "bg-gradient-to-tr from-emerald-700 to-teal-600 text-white rounded-tr-none font-medium shadow-emerald-700/10"
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
                                title: `Tangkapan Layar ${isMe ? "Saya" : targetUser.nama_lengkap}`,
                              })
                            }
                            className="max-h-56 w-auto object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: parsed.imageUrl!,
                                title: `Tangkapan Layar ${isMe ? "Saya" : targetUser.nama_lengkap}`,
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

        {/* Preview Tangkapan Layar Siap Dikirim */}
        {attachedImage && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 border-t border-emerald-200 dark:border-emerald-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedImage.dataUrl}
                alt="Preview screenshot"
                className="h-10 w-10 object-cover rounded-lg border border-emerald-300 shadow-2xs shrink-0"
              />
              <div className="min-w-0 text-2xs">
                <p className="font-bold text-emerald-900 dark:text-emerald-200 truncate">
                  Tangkapan Layar Siap Dikirim ({formatFileSize(attachedImage.sizeBytes)})
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Terkompresi otomatis ({attachedImage.width}x{attachedImage.height}px)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Baris Emoji Cepat jika dibuka */}
        {showEmojiPicker && (
          <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="h-8 w-8 flex items-center justify-center text-lg rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* INPUT CHAT BAR                                            */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-1.5"
        >
          {sendError && (
            <p className="text-2xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{sendError}</span>
            </p>
          )}

          <div className="flex items-end gap-1.5">
            {/* Tombol Emoji */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Sisipkan Emoji"
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0",
                showEmojiPicker ? "bg-emerald-50 border-emerald-300 text-emerald-700" : ""
              )}
            >
              <Smile className="h-4 w-4 text-amber-500" />
            </button>

            {/* Tombol Lampirkan Tangkapan Layar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingImage}
              title="Kirim Gambar / Tangkapan Layar (bisa juga Ctrl+V langsung)"
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isProcessingImage ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              ) : (
                <Camera className="h-4 w-4 text-emerald-600" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Input Multi-line Textarea */}
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
                placeholder={
                  isJarimasBot
                    ? "Tulis pesan untuk Jarimas..."
                    : `Tulis pesan untuk ${targetUser.nama_lengkap.split(" ")[0]}... (Enter kirim, Shift+Enter baris baru, Ctrl+V tangkapan layar)`
                }
                className="w-full min-h-[40px] max-h-32 py-2.5 px-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                disabled={isSending}
              />
            </div>

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={(!inputMessage.trim() && !attachedImage) || isSending}
              aria-label="Kirim Pesan"
              className="inline-flex h-10 px-3.5 sm:px-4 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-xs shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Kirim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lightbox Modal untuk Preview Gambar Penuh */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
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
}
