"use client";

import { useState, useEffect, useRef } from "react";
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
  Loader2,
  Lock,
  UserPlus,
  Info,
  Clock,
  CheckCheck,
  Flame,
  AlertCircle,
} from "lucide-react";
import { getGroupMessages, sendGroupMessage } from "@/app/actions/pertemanan";
import { createClient } from "@/utils/supabase/client";
import type { KomunitasWithMembership, PesanGrup } from "@/types/database";
import { formatPeranDisplay, isRoleAdmin, cn, isAdminPusat, isSuperAdmin } from "@/lib/utils";

interface KomunitasPercakapanTabProps {
  komunitas: KomunitasWithMembership;
  currentUserId?: string | null;
  isAdminOrKader: boolean;
  onOpenJoinModal?: () => void;
}

// Rekomendasi pesan cepat sesuai jenis komunitas
const QUICK_CHAT_PRESETS: Record<string, string[]> = {
  bidang_spm: [
    "Halo bapak/ibu Tim Pembina & Pendamping SPM! 👋",
    "Koordinasi pemenuhan standar pelayanan dasar 📋",
    "Verifikasi data faktual warga & balita lapangan 🔍",
    "Laporan tindak lanjut dan kendala layanan ⚠️",
    "Jadwal rapat koordinasi terpadu 🗓️",
  ],
  posyandu: [
    "Halo ibu-ibu kader & bidan desa! 👋",
    "Bagaimana jadwal penimbangan & DDTK bulan ini? 🩺",
    "Stok PMT dan vitamin balita sudah siap 🥛",
    "Konfirmasi kehadiran kader posyandu 📋",
  ],
  satuan_paud: [
    "Halo bapak/ibu guru & pengelola PAUD! 👋",
    "Koordinasi rencana kegiatan belajar minggu ini 📚",
    "Pembaruan data ATS & validasi peserta didik 🎓",
    "Jadwal pertemuan parenting & wali murid 👥",
  ],
  warga_kita: [
    "Assalamu'alaikum wr. wb. salam hangat warga! 🙏",
    "Ada info kegiatan kerja bakti lingkungan akhir pekan? 🧹",
    "Jadwal ronda & keamanan lingkungan RT/RW 🛡️",
    "Kabar informasi sosial dan gotong royong warga 🏘️",
  ],
};

export function KomunitasPercakapanTab({
  komunitas,
  currentUserId,
  isAdminOrKader,
  onOpenJoinModal,
}: KomunitasPercakapanTabProps) {
  const [messages, setMessages] = useState<PesanGrup[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const membership = komunitas.currentUserMembership;
  const isApprovedMember = membership?.status === "approved" || isAdminOrKader;
  const userPeran = membership?.peran || (isAdminOrKader ? "Admin" : "Pengunjung");
  const isPendingApproval = Boolean(membership?.peran_diajukan);

  const isSpm = komunitas.jenis === "bidang_spm";
  const presets = QUICK_CHAT_PRESETS[komunitas.jenis] || QUICK_CHAT_PRESETS.warga_kita;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

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
              setTimeout(() => scrollToBottom("smooth"), 100);
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn("Realtime group chat not available:", realtimeErr);
    }

    // 2. Fallback polling berkala saat tab aktif
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
    }, 8000);

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending || !currentUserId) return;

    const tempId = "temp-" + Date.now();
    const optimisticMsg: PesanGrup = {
      id: tempId,
      komunitas_id: komunitas.id,
      user_id: currentUserId,
      pesan: text,
      created_at: new Date().toISOString(),
      profiles: {
        id: currentUserId,
        nama_lengkap: "Saya",
        email: "",
        is_super_admin: false,
      },
      user_role: userPeran,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");
    setIsSending(true);
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const res = await sendGroupMessage({
        komunitasId: komunitas.id,
        pesan: text,
      });

      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...res.data!, user_role: userPeran } : m))
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
    inputRef.current?.focus();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xs border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
            {isSpm ? (
              <ShieldCheck className="h-6 w-6" />
            ) : komunitas.jenis === "posyandu" ? (
              <HeartPulse className="h-6 w-6" />
            ) : komunitas.jenis === "satuan_paud" ? (
              <GraduationCap className="h-6 w-6" />
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black tracking-tight text-white">
                Ruang Percakapan {isSpm ? "Bidang SPM" : "Komunitas"}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-2xs font-extrabold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium line-clamp-1">
              {komunitas.nama} • Koordinasi terbuka seluruh anggota terdaftar
            </p>
          </div>
        </div>

        {/* Info Status Keanggotaan User */}
        {currentUserId ? (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 text-2xs">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Masuk untuk Berbicara
          </Link>
        )}
      </div>

      {/* 2. AREA PESAN / CHAT CONTAINER */}
      <div className="relative flex flex-col h-[460px] sm:h-[520px] rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
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
                  Jadilah yang pertama memulai koordinasi, berbagi informasi, atau menyapa anggota komunitas ini.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUserId && msg.user_id === currentUserId;
              const senderName = msg.profiles?.nama_lengkap || "Warga Komunitas";
              const isSuper = msg.profiles?.is_super_admin === true || isSuperAdmin(msg.profiles);
              const isPusat = !isSuper && isAdminPusat(msg.profiles);
              const roleDisplay = msg.user_role || (isSuper ? "Super Admin" : isPusat ? "Admin Pusat" : "Anggota");

              const timeStr = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
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

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-xs"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.pesan}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. QUICK CHAT PRESETS CHIPS */}
        {currentUserId && isApprovedMember && (
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
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

        {/* 4. INPUT FIELD / LOCKED STATE BAR */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t-2 border-slate-200 dark:border-slate-800 shrink-0">
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
                  Anda perlu bergabung dengan komunitas ini untuk mengirim pesan di ruang percakapan.
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenJoinModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Bergabung Sekarang
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ketik pesan untuk seluruh anggota ${komunitas.nama}...`}
                  maxLength={1000}
                  disabled={isSending}
                  className="w-full h-10 px-3.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
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
            </form>
          )}

          {errorMsg && (
            <p className="mt-1.5 text-2xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
