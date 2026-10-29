"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Sparkles,
  Users,
  ShieldCheck,
  Building2,
  HeartPulse,
  GraduationCap,
  BookOpen,
  Loader2,
  Lock,
  UserPlus,
  Info,
  Clock,
  CheckCheck,
  Flame,
  AlertCircle,
  Smile,
  Image as ImageIcon,
  AtSign,
  Reply,
  X,
  Copy,
  Check,
  CornerDownLeft,
  Download,
  ZoomIn,
  Camera,
} from "lucide-react";
import { getGroupMessages, sendGroupMessage } from "@/app/actions/pertemanan";
import { createClient } from "@/utils/supabase/client";
import type {
  KomunitasWithMembership,
  PesanGrup,
  AnggotaKomunitasDetail,
} from "@/types/database";
import { formatPeranDisplay, isRoleAdmin, cn, isAdminPusat, isSuperAdmin } from "@/lib/utils";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";
import {
  compressScreenshot,
  serializeChatMessage,
  parseChatMessage,
  formatFileSize,
  type CompressedImageResult,
  type ReplyQuote,
} from "@/lib/chat-media-helper";

interface KomunitasPercakapanTabProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
  currentUserName?: string | null;
  isAdminOrKader: boolean;
  onOpenJoinModal?: () => void;
  anggotaList?: AnggotaKomunitasDetail[];
}

// Rekomendasi pesan cepat sesuai jenis komunitas
const QUICK_CHAT_PRESETS: Record<string, string[]> = {
  posyandu: [
    "Halo ibu-ibu kader & bidan desa! 👋",
    "Bagaimana jadwal kegiatan posyandu bulan ini? 🩺",
    "Stok PMT dan vitamin balita sudah siap 🥛",
    "Konfirmasi kehadiran kader posyandu 📋",
  ],
  satuan_paud: [
    "Halo bapak/ibu guru & pengelola PAUD! 👋",
    "Koordinasi rencana kegiatan belajar minggu ini 📚",
    "Pembaruan data ATS & validasi peserta didik 🎓",
    "Jadwal pertemuan parenting & wali murid 👥",
  ],
  pkbm_skb: [
    "Halo bapak/ibu pamong belajar, tutor & pengelola PKBM/SKB! 👋",
    "Jadwal kegiatan pembelajaran kesetaraan Paket A/B/C minggu ini 📚",
    "Pembaruan data warga belajar & pendaftaran kesetaraan 🎓",
    "Informasi kursus, keterampilan vokasi & ujian kesetaraan 👥",
  ],
  warga_kita: [
    "Assalamu'alaikum wr. wb. salam hangat warga! 🙏",
    "Ada info kegiatan kerja bakti lingkungan akhir pekan? 🧹",
    "Jadwal ronda & keamanan lingkungan RT/RW 🛡️",
    "Kabar informasi sosial dan gotong royong warga 🏘️",
  ],
};

// Kategori Emoji Modern untuk Komunikasi Komunitas
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

export function KomunitasPercakapanTab({
  komunitas,
  currentUserId,
  currentUserName,
  isAdminOrKader,
  onOpenJoinModal,
  anggotaList = [],
}: KomunitasPercakapanTabProps) {
  const [messages, setMessages] = useState<PesanGrup[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fitur Modern: Balas Pesan (Quote / Reply)
  const [replyingTo, setReplyingTo] = useState<ReplyQuote | null>(null);

  // Fitur Modern: Tangkapan Layar (Screenshot / Image Attachment)
  const [attachedImage, setAttachedImage] = useState<CompressedImageResult | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Fitur Modern: Lightbox Preview Gambar Penuh
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Fitur Modern: Emoticon Picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);

  // Fitur Modern: Mode Tombol Enter ("newline" = Enter baris baru, "send" = Enter kirim pesan)
  const [enterMode, setEnterMode] = useState<"newline" | "send">("newline");

  // Fitur Modern: Tag Pengguna (@mention)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [showMentionMenu, setShowMentionMenu] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { markGroupAsRead } = useGlobalMessageNotification();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mentionMenuRef = useRef<HTMLDivElement>(null);

  const membership = komunitas.currentUserMembership;
  const isApprovedMember =
    membership?.status === "approved" ||
    membership?.peran === "Super Admin" ||
    isAdminOrKader;
  const userPeran = membership?.peran || (isAdminOrKader ? "Admin" : "Pengunjung");
  const isPendingApproval = Boolean(membership?.peran_diajukan);
  const presets = QUICK_CHAT_PRESETS[komunitas.jenis] || QUICK_CHAT_PRESETS.warga_kita;

  // Baca preferensi enterMode dari localStorage saat inisialisasi
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("jarimas_chat_enter_mode");
      if (savedMode === "send" || savedMode === "newline") {
        setEnterMode(savedMode);
      }
    } catch {
      // Abaikan jika localStorage tidak diizinkan
    }
  }, []);

  // Simpan preferensi enterMode
  const toggleEnterMode = () => {
    const nextMode = enterMode === "newline" ? "send" : "newline";
    setEnterMode(nextMode);
    try {
      localStorage.setItem("jarimas_chat_enter_mode", nextMode);
    } catch {
      // Abaikan
    }
  };

  // Hanya Komunitas RT, Posyandu, dan Satuan PAUD yang dapat digabung langsung.
  const canJoin =
    komunitas.jenis === "posyandu" ||
    komunitas.jenis === "satuan_paud" ||
    komunitas.jenis === "pkbm_skb" ||
    (komunitas.jenis === "warga_kita" &&
      Boolean(komunitas.rt && komunitas.rt.trim() !== "" && komunitas.rt !== "semua"));

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Tutup dropdown emoji / mention saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        mentionMenuRef.current &&
        !mentionMenuRef.current.contains(e.target as Node)
      ) {
        setShowMentionMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Daftar Anggota yang Dapat Di-tag (@mention)
  const mentionableUsers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; role?: string }>();

    // 1. Dari anggotaList terdaftar
    if (anggotaList && anggotaList.length > 0) {
      anggotaList.forEach((m) => {
        const name = m.profiles?.nama_lengkap?.trim();
        if (name && m.user_id !== currentUserId) {
          map.set(name.toLowerCase(), {
            id: m.user_id,
            name,
            role: m.peran,
          });
        }
      });
    }

    // 2. Dari riwayat pesan (termasuk admin/pengguna yang pernah mengirim pesan)
    messages.forEach((msg) => {
      const name = msg.profiles?.nama_lengkap?.trim();
      if (
        name &&
        msg.user_id &&
        msg.user_id !== currentUserId &&
        !map.has(name.toLowerCase())
      ) {
        map.set(name.toLowerCase(), {
          id: msg.user_id,
          name,
          role: msg.user_role || "Anggota",
        });
      }
    });

    return Array.from(map.values());
  }, [anggotaList, messages, currentUserId]);

  // Filter mention sesuai query yang diketik
  const filteredMentionUsers = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase().trim();
    if (!q) return mentionableUsers.slice(0, 8);
    return mentionableUsers
      .filter((u) => u.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [mentionableUsers, mentionQuery]);

  // Muat Pesan & Realtime Subscription
  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await getGroupMessages(komunitas.id);
        if (isMounted) {
          if (res.success) {
            setMessages(res.messages || []);
            setTimeout(() => scrollToBottom("auto"), 100);
          } else {
            setErrorMsg(res.message || "Gagal memuat percakapan.");
          }
        }
      } catch (err: any) {
        console.error("Error load group messages:", err);
        if (isMounted) setErrorMsg("Terjadi kendala saat memuat percakapan.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMessages();
    markGroupAsRead(komunitas.id);

    // 1. Supabase Realtime Subscription
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`chat_komunitas_${komunitas.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "pesan_grup",
            filter: `komunitas_id=eq.${komunitas.id}`,
          },
          async () => {
            if (!isMounted) return;
            const res = await getGroupMessages(komunitas.id);
            if (isMounted && res.success && res.messages) {
              setMessages(res.messages);
              markGroupAsRead(komunitas.id);
              setTimeout(() => scrollToBottom("smooth"), 100);
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn("Realtime group chat not available:", realtimeErr);
    }

    // 2. Fallback polling berkala saat tab aktif (30 detik)
    const interval = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await getGroupMessages(komunitas.id);
        if (res.success && res.messages && isMounted) {
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
  }, [komunitas.id]);

  // Otomatis sesuaikan tinggi textarea saat teks bertambah
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 40),
        140
      )}px`;
    }
  };

  // Tangani perubahan teks input & deteksi @mention
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputMessage(val);
    adjustTextareaHeight();

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Valid jika tidak terputus spasi ganda atau baris baru
      if (!/[\r\n\t]/.test(textAfterAt) && textAfterAt.length <= 25) {
        setMentionQuery(textAfterAt);
        setShowMentionMenu(true);
        setMentionIndex(0);
        return;
      }
    }

    setShowMentionMenu(false);
    setMentionQuery(null);
  };

  // Masukkan tag pengguna terpilih ke posisi kursor
  const insertMention = (user: { name: string }) => {
    if (!textareaRef.current) return;
    const val = inputMessage;
    const cursorPos = textareaRef.current.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const prefix = val.slice(0, lastAtIndex);
      const suffix = val.slice(cursorPos);
      const inserted = `@${user.name} `;
      const newVal = prefix + inserted + suffix;
      setInputMessage(newVal);
      setShowMentionMenu(false);
      setMentionQuery(null);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = prefix.length + inserted.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
          adjustTextareaHeight();
        }
      }, 20);
    } else {
      // Jika dipanggil via tombol toolbar @
      const inserted = `@${user.name} `;
      setInputMessage((prev) => prev + inserted);
      setShowMentionMenu(false);
      setTimeout(() => {
        textareaRef.current?.focus();
        adjustTextareaHeight();
      }, 20);
    }
  };

  // Masukkan emoji ke posisi kursor
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

  // Masukkan baris baru secara eksplisit (tombol Enter Baris Baru)
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

  // Proses gambar / tangkapan layar (kompresi ketat sisi klien)
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

  // Tangani Paste dari Clipboard (Ctrl+V / Tangkapan Layar langsung)
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

  // Tangani pemilihan berkas gambar dari tombol lampiran
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
      e.target.value = "";
    }
  };

  // Navigasi Keyboard pada Input & Mention
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. Keyboard Nav untuk Menu Mention
    if (showMentionMenu && filteredMentionUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredMentionUsers.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev === 0 ? filteredMentionUsers.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMentionUsers[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentionMenu(false);
        return;
      }
    }

    // 2. Pengaturan Enter
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter selalu membuat baris baru
        return;
      }

      if (enterMode === "send") {
        // Mode Enter = Kirim Pesan
        e.preventDefault();
        handleSendMessage();
      } else {
        // Mode Enter = Baris Baru (default)
        // Biarkan browser memasukkan \n secara alami, sesuaikan tinggi
        setTimeout(adjustTextareaHeight, 10);
      }
    }
  };

  // Kirim Pesan Grup Terpadu
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawText = inputMessage.trim();
    if ((!rawText && !attachedImage) || isSending || !currentUserId) return;

    // Serialisasi pesan dengan metadata balasan & gambar terkompresi
    const serializedPesan = serializeChatMessage({
      text: rawText,
      imageUrl: attachedImage?.dataUrl || null,
      replyTo: replyingTo,
    });

    const tempId = "temp-" + Date.now();
    const optimisticMsg: PesanGrup = {
      id: tempId,
      komunitas_id: komunitas.id,
      user_id: currentUserId,
      pesan: serializedPesan,
      created_at: new Date().toISOString(),
      profiles: {
        id: currentUserId,
        nama_lengkap: currentUserName || "Saya",
        email: "",
        is_super_admin: false,
      },
      user_role: userPeran,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");
    setAttachedImage(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowMentionMenu(false);
    setIsSending(true);
    setTimeout(() => {
      scrollToBottom("smooth");
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
      }
    }, 50);

    try {
      const res = await sendGroupMessage({
        komunitasId: komunitas.id,
        pesan: serializedPesan,
      });

      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...res.data!, user_role: userPeran } : m
          )
        );
      } else if (!res.success) {
        setErrorMsg(res.message || "Gagal mengirim pesan.");
      }
    } catch (err) {
      console.error("Gagal kirim pesan:", err);
      setErrorMsg("Koneksi gagal mengirim pesan.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectPreset = (preset: string) => {
    setInputMessage(preset);
    setTimeout(() => {
      textareaRef.current?.focus();
      adjustTextareaHeight();
    }, 20);
  };

  // Salin teks pesan
  const handleCopyMessage = (msgId: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Balas pesan
  const handleStartReply = (msg: PesanGrup) => {
    const parsed = parseChatMessage(msg.pesan);
    const senderName =
      msg.user_id === currentUserId
        ? "Saya"
        : msg.profiles?.nama_lengkap || "Warga";
    setReplyingTo({
      id: msg.id,
      senderName,
      textSnippet: parsed.text || (parsed.imageUrl ? "📷 Tangkapan Layar" : "Pesan"),
    });
    textareaRef.current?.focus();
  };

  // Render Konten Teks dengan Tag @mention & Highlight
  const renderFormattedText = (text: string, isMe: boolean) => {
    if (!text) return null;

    // Deteksi mention @NamaPengguna
    const mentionRegex = /@([a-zA-Z0-9_\s.]{2,30})(?=[,\s!?\n]|$)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(text)) !== null) {
      const start = match.index;
      const end = mentionRegex.lastIndex;

      // Bagian teks biasa sebelum mention
      if (start > lastIndex) {
        elements.push(text.substring(lastIndex, start));
      }

      const rawMention = match[0];
      const namePart = match[1].trim();

      // Cek apakah mention ditujukan ke pengguna saat ini
      const isTargetingMe =
        Boolean(currentUserName && namePart.toLowerCase() === currentUserName.toLowerCase()) ||
        namePart.toLowerCase() === "saya";

      elements.push(
        <span
          key={`mention-${start}`}
          className={cn(
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md font-bold text-xs transition-colors",
            isTargetingMe
              ? "bg-amber-400 text-slate-900 border border-amber-500 shadow-2xs animate-pulse"
              : isMe
              ? "bg-white/25 text-white border border-white/30"
              : "bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700"
          )}
          title={`Pesan ditujukan untuk ${namePart}`}
        >
          <AtSign className="h-2.5 w-2.5 shrink-0 opacity-80" />
          <span>{namePart}</span>
          {isTargetingMe && (
            <span className="ml-1 text-[9px] px-1 py-0.2 rounded-full bg-amber-600 text-white font-extrabold uppercase tracking-tight">
              Anda
            </span>
          )}
        </span>
      );

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  // Badge Peran Warna Khusus
  const renderRoleBadge = (role?: string | null, isSuper?: boolean, isPusat?: boolean) => {
    if (isSuper) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Sparkles className="h-2.5 w-2.5 text-purple-600" />
          Super Admin
        </span>
      );
    }

    if (isPusat || (role && role.toLowerCase().includes("admin pusat"))) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          <ShieldCheck className="h-2.5 w-2.5 text-teal-600" />
          Admin Pusat
        </span>
      );
    }

    if (!role) return null;
    const rLower = role.toLowerCase();

    if (rLower.includes("tim pembina")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <ShieldCheck className="h-2.5 w-2.5 text-amber-600" />
          Tim Pembina
        </span>
      );
    }

    if (rLower.includes("pendamping")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          <Sparkles className="h-2.5 w-2.5 text-teal-600" />
          Pendamping
        </span>
      );
    }

    if (rLower.includes("kader")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <HeartPulse className="h-2.5 w-2.5 text-emerald-600" />
          Kader
        </span>
      );
    }

    if (rLower.includes("mitra")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <Building2 className="h-2.5 w-2.5 text-sky-600" />
          Mitra
        </span>
      );
    }

    if (rLower.includes("admin") || rLower.includes("pengurus")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <ShieldCheck className="h-2.5 w-2.5 text-blue-600" />
          Admin / Pengurus
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        {formatPeranDisplay(role)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. HEADER INFO RUANG PERCAKAPAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xs border border-slate-700/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
            {komunitas.jenis === "posyandu" ? (
              <HeartPulse className="h-4.5 w-4.5" />
            ) : komunitas.jenis === "satuan_paud" ? (
              <GraduationCap className="h-4.5 w-4.5" />
            ) : komunitas.jenis === "pkbm_skb" ? (
              <BookOpen className="h-4.5 w-4.5" />
            ) : (
              <Building2 className="h-4.5 w-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                Ruang Percakapan Komunitas
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Real-Time
              </span>
            </div>
            <p className="text-2xs text-slate-300 font-medium truncate">
              {komunitas.nama} • Koordinasi terbuka seluruh anggota terdaftar
            </p>
          </div>
        </div>

        {/* Info Status Keanggotaan & Mode Enter */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {currentUserId && isApprovedMember && (
            <button
              type="button"
              onClick={toggleEnterMode}
              title={`Klik untuk ubah: saat ini tombol Enter berfungsi ${
                enterMode === "newline" ? "membuat baris baru" : "mengirim pesan"
              }`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-2xs font-semibold transition-colors cursor-pointer"
            >
              <CornerDownLeft className="h-3 w-3 text-teal-400" />
              <span>Enter: {enterMode === "newline" ? "Baris Baru" : "Kirim"}</span>
            </button>
          )}

          {currentUserId ? (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-2xs shrink-0">
              <span className="text-slate-300">Status Anda:</span>
              <span className="font-bold text-teal-300">
                {isApprovedMember ? formatPeranDisplay(userPeran) : "Pengunjung"}
              </span>
              {isPendingApproval && (
                <span className="text-amber-300 font-medium">
                  (Ajuan: {membership?.peran_diajukan})
                </span>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-xs shrink-0"
            >
              Masuk untuk Berbicara
            </Link>
          )}
        </div>
      </div>

      {/* 2. AREA PESAN / CHAT CONTAINER */}
      <div className="relative flex flex-col h-[500px] sm:h-[560px] rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
              <p className="text-xs font-semibold">Memuat riwayat percakapan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Belum Ada Percakapan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Jadilah yang pertama memulai koordinasi, berbagi tangkapan layar, atau menyapa anggota komunitas ini.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUserId && msg.user_id === currentUserId;
              const senderName = msg.profiles?.nama_lengkap || "Warga Komunitas";
              const isSuper = isSuperAdmin(msg.profiles);
              const isPusat = !isSuper && isAdminPusat(msg.profiles);
              const roleDisplay =
                msg.user_role ||
                (isSuper ? "Super Admin" : isPusat ? "Admin Pusat" : "Anggota");

              const timeStr = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              // Parsing pesan berstruktur (Teks, Gambar Terkompresi, Kutipan Balasan)
              const parsed = parseChatMessage(msg.pesan);

              return (
                <div
                  key={msg.id}
                  className={`group flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-2 px-1 text-2xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isMe ? "Saya" : senderName}
                    </span>
                    {renderRoleBadge(roleDisplay, isSuper, isPusat)}
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {timeStr}
                    </span>
                  </div>

                  {/* Message Bubble Container with Actions */}
                  <div className="relative flex items-end gap-1.5 max-w-[90%] sm:max-w-[78%]">
                    {/* Action buttons (Reply & Copy) on left for sender "Saya" */}
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pb-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, parsed.text)}
                          title="Salin teks pesan"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartReply(msg)}
                          title="Balas pesan ini"
                          className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Reply className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Main Bubble */}
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs space-y-2",
                        isMe
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-xs"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs"
                      )}
                    >
                      {/* 1. Preview Balasan Pesan (Jika Membalas) */}
                      {parsed.replyTo && (
                        <div
                          className={cn(
                            "p-2 rounded-xl text-2xs border-l-3 space-y-0.5",
                            isMe
                              ? "bg-black/15 border-white text-white/90"
                              : "bg-slate-100 dark:bg-slate-900 border-teal-500 text-slate-600 dark:text-slate-300"
                          )}
                        >
                          <p className="font-bold flex items-center gap-1 text-[11px]">
                            <Reply className="h-3 w-3 shrink-0" />
                            <span>{parsed.replyTo.senderName}</span>
                          </p>
                          <p className="truncate line-clamp-1 italic text-2xs opacity-90">
                            {parsed.replyTo.textSnippet}
                          </p>
                        </div>
                      )}

                      {/* 2. Gambar Tangkapan Layar Terlampir */}
                      {parsed.imageUrl && (
                        <div className="relative group/img overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={parsed.imageUrl}
                            alt="Tangkapan Layar"
                            loading="lazy"
                            onClick={() =>
                              setLightboxImage({
                                url: parsed.imageUrl!,
                                title: `Tangkapan Layar oleh ${isMe ? "Saya" : senderName}`,
                              })
                            }
                            className="max-h-64 sm:max-h-80 w-auto object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: parsed.imageUrl!,
                                title: `Tangkapan Layar oleh ${isMe ? "Saya" : senderName}`,
                              })
                            }
                            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold backdrop-blur-xs transition-colors cursor-pointer"
                          >
                            <ZoomIn className="h-3 w-3" />
                            <span>Perbesar</span>
                          </button>
                        </div>
                      )}

                      {/* 3. Teks Pesan Pengguna (Mendukung Enter Baris Baru & Tag @mention) */}
                      {parsed.text && (
                        <div className="whitespace-pre-wrap break-words leading-relaxed font-normal">
                          {renderFormattedText(parsed.text, Boolean(isMe))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons (Reply & Copy) on right for other members */}
                    {!isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pb-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartReply(msg)}
                          title="Balas pesan ini"
                          className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Reply className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, parsed.text)}
                          title="Salin teks pesan"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. QUICK CHAT PRESETS CHIPS */}
        {currentUserId && isApprovedMember && (
          <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1 pl-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Saran:
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="shrink-0 text-2xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* 4. PREVIEW BAR KUTIPAN BALASAN (JIKA AKTIF) */}
        {replyingTo && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-teal-50 dark:bg-teal-950/60 border-t border-teal-200 dark:border-teal-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Reply className="h-4 w-4 text-teal-600 shrink-0" />
              <div className="min-w-0 text-2xs">
                <p className="font-bold text-teal-900 dark:text-teal-200 truncate">
                  Membalas ke: {replyingTo.senderName}
                </p>
                <p className="text-slate-600 dark:text-slate-400 truncate line-clamp-1">
                  {replyingTo.textSnippet}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 5. PREVIEW BAR TANGKAPAN LAYAR TERLAMPIR (JIKA ADA) */}
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
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">
                    Tangkapan Layar Siap Dikirim
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-extrabold text-[10px]">
                    {formatFileSize(attachedImage.sizeBytes)}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Terkompresi otomatis ({attachedImage.width}x{attachedImage.height}px) • Hemat kuota & server
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Hapus lampiran gambar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 6. DROPDOWN MENU TAG ANGGOTA (@MENTION) */}
        {showMentionMenu && filteredMentionUsers.length > 0 && (
          <div
            ref={mentionMenuRef}
            className="absolute bottom-28 left-4 right-4 sm:left-6 sm:w-80 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border-2 border-teal-500 shadow-xl z-30 p-1.5 space-y-1"
          >
            <div className="flex items-center justify-between px-2 py-1 text-2xs font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <AtSign className="h-3 w-3 text-teal-600" />
                Sebut Anggota Komunitas
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Tekan Enter / Klik</span>
            </div>
            {filteredMentionUsers.map((user, idx) => (
              <button
                key={user.id}
                type="button"
                onClick={() => insertMention(user)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer",
                  idx === mentionIndex
                    ? "bg-teal-50 dark:bg-teal-950/80 text-teal-900 dark:text-teal-100 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200 font-bold flex items-center justify-center text-2xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{user.name}</span>
                </div>
                {user.role && (
                  <span className="text-[10px] font-medium text-slate-400 shrink-0">
                    {formatPeranDisplay(user.role)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 7. POPUP EMOJI PICKER */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-28 left-4 right-4 sm:left-12 sm:w-88 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-2xl z-30 overflow-hidden"
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
            <div className="p-3 max-h-52 overflow-y-auto grid grid-cols-6 sm:grid-cols-7 gap-2 bg-white dark:bg-slate-900">
              {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="h-9 w-9 flex items-center justify-center text-xl rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:scale-115 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 8. INPUT TOOLBAR & MULTI-LINE TEXTAREA */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t-2 border-slate-200 dark:border-slate-800 shrink-0 space-y-2">
          {!currentUserId ? (
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Masuk ke akun Anda untuk mengirim pesan di ruang percakapan ini.</span>
              </div>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
              >
                Masuk
              </Link>
            </div>
          ) : !isApprovedMember ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 text-center sm:text-left">
                <Info className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  {canJoin
                    ? "Anda perlu bergabung dengan komunitas ini untuk mengirim pesan di ruang percakapan."
                    : "Keanggotaan komunitas wilayah (RW, Kelurahan, Kecamatan, Kota Tegal) didapatkan otomatis dengan bergabung di Komunitas RT, Posyandu, atau PAUD."}
                </span>
              </div>
              {canJoin ? (
                <button
                  type="button"
                  onClick={onOpenJoinModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Bergabung Sekarang
                </button>
              ) : (
                <Link
                  href="/komunitas?tab=warga_kita"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
                >
                  <span>Cari Komunitas RT</span>
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-2">
              {/* Toolbar Pembantu Fitur Modern: Emoji, Tag @, Lampirkan Tangkapan Layar, Tombol Enter Baris Baru */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {/* Tombol Emoji */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker((prev) => !prev);
                      setShowMentionMenu(false);
                    }}
                    title="Sisipkan Emoticon"
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                      showEmojiPicker
                        ? "bg-teal-600 text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    <Smile className="h-3.5 w-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Emoticon</span>
                  </button>

                  {/* Tombol Tag Anggota (@mention) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMentionMenu((prev) => !prev);
                      setShowEmojiPicker(false);
                      setMentionQuery("");
                    }}
                    title="Tag / Sebut Anggota Komunitas"
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                      showMentionMenu
                        ? "bg-teal-600 text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    <AtSign className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="hidden sm:inline">Tag Anggota</span>
                  </button>

                  {/* Tombol Lampirkan Tangkapan Layar (Screenshot) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    title="Kirim Gambar / Tangkapan Layar (Ctrl+V juga didukung)"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
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

                {/* Tombol Enter Baris Baru & Bantuan */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={insertNewline}
                    title="Tekan untuk membuat baris baru (bisa juga Shift+Enter)"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CornerDownLeft className="h-3 w-3 text-teal-600" />
                    <span>Baris Baru ↵</span>
                  </button>
                </div>
              </div>

              {/* Area Teks Input (Multi-line Textarea dengan Auto-grow) */}
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    rows={1}
                    placeholder={`Tulis pesan untuk anggota ${komunitas.nama}... (Shift+Enter / tombol Baris Baru, Ctrl+V tangkapan layar)`}
                    maxLength={2000}
                    disabled={isSending}
                    className="w-full min-h-[42px] max-h-36 py-2.5 px-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  disabled={(!inputMessage.trim() && !attachedImage) || isSending}
                  className="inline-flex h-[42px] items-center justify-center gap-1.5 px-4 sm:px-5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 text-white text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Kirim</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Feedback Error jika ada */}
          {(errorMsg || imageError) && (
            <p className="mt-1.5 text-2xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errorMsg || imageError}
            </p>
          )}
        </div>
      </div>

      {/* 9. MODAL LIGHTBOX PREVIEW GAMBAR LENGKAP */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between text-white px-2">
              <p className="text-xs sm:text-sm font-bold truncate">
                {lightboxImage.title}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  download="tangkapan-layar-jarimas.webp"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  title="Unduh gambar tangkapan layar"
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

            {/* Gambar Penuh */}
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
