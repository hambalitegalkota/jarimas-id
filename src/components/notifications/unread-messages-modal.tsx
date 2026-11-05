"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  X,
  ArrowRight,
  CheckCheck,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Building2,
  Clock,
  Send,
} from "lucide-react";
import type { IncomingMessageNotificationItem, RegisteredUserItem, GrupChatRoom } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UnreadMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  unreadList: IncomingMessageNotificationItem[];
  isUserOnline: (userId: string) => boolean;
  onOpenDirectChat: (userOrId: RegisteredUserItem | string) => void;
  onOpenGroupChat: (roomOrId: GrupChatRoom | string) => void;
  onMarkAllRead: () => Promise<void>;
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Baru saja";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Baru saja";
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Baru saja";
  }
}

interface GroupedUnreadConversation {
  id: string; // key
  isGroup: boolean;
  targetId: string; // senderId or groupId
  name: string;
  avatarUrl: string | null;
  roleBadge?: string;
  community?: string;
  latestMessage: string;
  latestCreatedAt: string;
  unreadCount: number;
  partnerUser?: RegisteredUserItem | null;
}

export function UnreadMessagesModal({
  isOpen,
  onClose,
  unreadCount,
  unreadList,
  isUserOnline,
  onOpenDirectChat,
  onOpenGroupChat,
  onMarkAllRead,
}: UnreadMessagesModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Kelompokkan unreadList berdasarkan percakapan (user atau grup)
  const groupedMap = new Map<string, GroupedUnreadConversation>();

  unreadList.forEach((item) => {
    const key = item.isGroup && item.groupId ? `group_${item.groupId}` : `direct_${item.senderId}`;

    const existing = groupedMap.get(key);
    if (existing) {
      existing.unreadCount += 1;
      // Ambil pesan terbaru
      if (new Date(item.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime()) {
        existing.latestMessage = item.pesan;
        existing.latestCreatedAt = item.createdAt;
      }
    } else {
      groupedMap.set(key, {
        id: key,
        isGroup: Boolean(item.isGroup),
        targetId: (item.isGroup && item.groupId ? item.groupId : item.senderId) || "",
        name: item.isGroup ? item.groupName || "Grup Komunitas" : item.senderName,
        avatarUrl: item.senderAvatar || null,
        roleBadge: item.isGroup ? "Ruang Diskusi Grup" : item.senderRole,
        community: item.senderCommunity,
        latestMessage: item.pesan,
        latestCreatedAt: item.createdAt,
        unreadCount: 1,
        partnerUser: item.partnerUser,
      });
    }
  });

  const groupedConversations = Array.from(groupedMap.values()).sort(
    (a, b) => new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime()
  );

  const handleOpenConversation = (conv: GroupedUnreadConversation) => {
    onClose();
    if (conv.isGroup) {
      onOpenGroupChat(conv.targetId);
    } else if (conv.partnerUser) {
      onOpenDirectChat(conv.partnerUser);
    } else {
      onOpenDirectChat(conv.targetId);
    }
  };

  const handleGoToPercakapanPage = () => {
    onClose();
    router.push("/kabar?tab=percakapan");
  };

  const handleMarkAll = async () => {
    setIsMarking(true);
    try {
      await onMarkAllRead();
      onClose();
    } finally {
      setIsMarking(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daftar Notifikasi Pesan Belum Dibaca"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30">
              <MessageSquare className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                  Pesan Belum Dibaca
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black font-mono bg-rose-500 text-white shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Pilih percakapan untuk langsung membuka dan membalas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List of Unread Conversations */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-border/60 space-y-1">
          {groupedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="text-sm font-bold text-foreground">
                  Semua Pesan Sudah Terbuka
                </p>
                <p className="text-xs text-muted-foreground">
                  Tidak ada pesan baru yang tertunda. Anda dapat meninjau seluruh obrolan di Pusat Percakapan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGoToPercakapanPage}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <span>Buka Pusat Percakapan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            groupedConversations.map((conv) => {
              const isOnline = !conv.isGroup && isUserOnline(conv.targetId);

              return (
                <div
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv)}
                  className="group flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-muted/70 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11 rounded-xl border border-border shadow-2xs">
                        {conv.avatarUrl && (
                          <AvatarImage src={conv.avatarUrl} alt={conv.name} />
                        )}
                        <AvatarFallback className="rounded-xl font-bold bg-primary/10 text-primary">
                          {conv.isGroup ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            conv.name.charAt(0).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online dot indicator for direct users */}
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                      )}
                    </div>

                    {/* Sender & Message Details */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {conv.name}
                        </span>
                        {conv.roleBadge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/80 truncate max-w-[140px]">
                            {conv.roleBadge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1 break-all">
                        {conv.latestMessage}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 font-mono">
                        <Clock className="h-3 w-3 inline" />
                        <span>{formatTimeAgo(conv.latestCreatedAt)}</span>
                        {conv.community && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{conv.community}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-black font-mono bg-rose-500 text-white shadow-xs">
                      {conv.unreadCount > 1 ? `+${conv.unreadCount}` : "Baru"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConversation(conv);
                      }}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-2xs"
                    >
                      <span>Buka</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isMarking || unreadCount === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            <span>{isMarking ? "Membersihkan..." : "Tandai Semua Sudah Dibaca"}</span>
          </button>

          <button
            type="button"
            onClick={handleGoToPercakapanPage}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
          >
            <span>Buka Pusat Percakapan</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

