"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  MessageCircle,
  Globe,
  Users,
  Building2,
  Trash2,
  Send,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Reply,
  CornerDownRight,
  X,
  MessageSquareOff,
} from "lucide-react";
import {
  toggleReaksiKabar,
  addKomentarKabar,
  deleteKabar,
  deleteKomentarKabar,
  toggleKomentarKabarStatus,
} from "@/app/actions/kabar";
import type { KabarItem, KomentarKabar } from "@/types/database";
import { cn } from "@/lib/utils";
import { LoginPromptModal } from "@/components/kabar/login-prompt-modal";

interface KabarCardProps {
  kabar: KabarItem;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
}

const AVAILABLE_REACTIONS = [
  { emoji: "❤️", label: "Suka" },
  { emoji: "👍", label: "Setuju" },
  { emoji: "🙏", label: "Terima Kasih" },
  { emoji: "😊", label: "Senang" },
];

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Baru saja";
    if (diffMin < 60) return `${diffMin}m lalu`;
    if (diffHour < 24) return `${diffHour}h lalu`;
    if (diffDay < 7) return `${diffDay}d lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Baru saja";
  }
}

export function KabarCard({
  kabar,
  currentUserId,
  isSuperAdmin = false,
}: KabarCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsDisabled, setCommentsDisabled] = useState(
    kabar.komentar_dinonaktifkan || false
  );
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [userReaction, setUserReaction] = useState<string | null>(
    kabar.user_reaction || null
  );
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    kabar.reaksi_counts || {}
  );
  const [totalReactions, setTotalReactions] = useState(kabar.jumlah_reaksi);
  const [comments, setComments] = useState(kabar.komentar_list || []);

  const commentInputRef = useRef<HTMLInputElement>(null);

  const [isPendingReaction, startReactionTransition] = useTransition();
  const [isPendingComment, startCommentTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [isPendingDeleteComment, startDeleteCommentTransition] = useTransition();
  const [isPendingToggleComments, startToggleCommentsTransition] = useTransition();

  // Sinkronisasi data komentar, reaksi, dan status komentar ketika props kabar diperbarui
  useEffect(() => {
    if (kabar.komentar_list) {
      setComments(kabar.komentar_list);
    }
    if (kabar.reaksi_counts) {
      setReactionCounts(kabar.reaksi_counts);
    }
    if (typeof kabar.jumlah_reaksi === "number") {
      setTotalReactions(kabar.jumlah_reaksi);
    }
    if (kabar.user_reaction !== undefined) {
      setUserReaction(kabar.user_reaction || null);
    }
    if (kabar.komentar_dinonaktifkan !== undefined) {
      setCommentsDisabled(kabar.komentar_dinonaktifkan);
    }
  }, [kabar]);

  const isAuthor = currentUserId && kabar.user_id === currentUserId;
  const canManagePost = isAuthor || isSuperAdmin;
  const canDelete = isAuthor || isSuperAdmin;
  const authorName =
    kabar.profiles?.nama_lengkap || "Warga JARIMAS";
  const authorInitial = authorName.charAt(0).toUpperCase();

  // Semua komentar tampil untuk publik
  const visibleComments = comments;

  // Susun struktur komentar berulir (threaded comments)
  const commentsMap = new Map(visibleComments.map((c) => [c.id, c]));
  const rootComments: KomentarKabar[] = [];
  const repliesByRootId = new Map<string, KomentarKabar[]>();

  visibleComments.forEach((comment) => {
    if (!comment.parent_id || !commentsMap.has(comment.parent_id)) {
      rootComments.push(comment);
    } else {
      // Telusuri parent untuk menemukan root comment id
      let rootId = comment.parent_id;
      while (
        commentsMap.get(rootId)?.parent_id &&
        commentsMap.has(commentsMap.get(rootId)!.parent_id!)
      ) {
        rootId = commentsMap.get(rootId)!.parent_id!;
      }
      const existing = repliesByRootId.get(rootId) || [];
      existing.push(comment);
      repliesByRootId.set(rootId, existing);
    }
  });

  // Handle reaction button click (triggers auth modal if guest)
  const handleReactionButtonClick = () => {
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    setShowReactionPicker(!showReactionPicker);
  };

  // Handle reaction toggle
  const handleReactionClick = (emoji: string) => {
    if (!currentUserId) {
      setShowReactionPicker(false);
      setShowAuthModal(true);
      return;
    }
    setShowReactionPicker(false);
    startReactionTransition(async () => {
      // Optimistic update
      const previousReaction = userReaction;
      const prevCounts = { ...reactionCounts };
      let newTotal = totalReactions;

      if (previousReaction === emoji) {
        // Toggle off
        setUserReaction(null);
        prevCounts[emoji] = Math.max(0, (prevCounts[emoji] || 1) - 1);
        newTotal = Math.max(0, newTotal - 1);
      } else {
        // Toggle on or switch
        if (previousReaction && prevCounts[previousReaction]) {
          prevCounts[previousReaction] = Math.max(
            0,
            prevCounts[previousReaction] - 1
          );
        } else {
          newTotal += 1;
        }
        setUserReaction(emoji);
        prevCounts[emoji] = (prevCounts[emoji] || 0) + 1;
      }

      setUserReaction(previousReaction === emoji ? null : emoji);
      setReactionCounts(prevCounts);
      setTotalReactions(newTotal);

      const res = await toggleReaksiKabar(kabar.id, emoji);
      if (!res.success) {
        // Revert jika gagal
        setUserReaction(previousReaction);
        setReactionCounts(kabar.reaksi_counts || {});
        setTotalReactions(kabar.jumlah_reaksi);
      }
    });
  };

  // Handle reply button click on a comment
  const handleReplyClick = (targetComment: KomentarKabar) => {
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    if (commentsDisabled) {
      return;
    }
    const targetName = targetComment.profiles?.nama_lengkap || "Warga";
    setReplyingTo({
      id: targetComment.id,
      authorName: targetName,
    });
    if (!showComments) {
      setShowComments(true);
    }
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 50);
  };

  // Handle comment or reply submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    if (commentsDisabled) {
      setCommentError("Komentar pada postingan ini telah dinonaktifkan.");
      return;
    }
    if (!commentText.trim()) return;

    const contentToSend = commentText.trim();
    const targetParentId = replyingTo?.id || null;

    setCommentError(null);
    setCommentText("");

    startCommentTransition(async () => {
      const res = await addKomentarKabar(
        kabar.id,
        contentToSend,
        "publik",
        targetParentId
      );
      if (res.success) {
        setCommentError(null);
        setReplyingTo(null);
        if (res.data) {
          setComments((prev) => [...prev, res.data!]);
        } else {
          setComments((prev) => [
            ...prev,
            {
              id: `temp-${Date.now()}`,
              kabar_id: kabar.id,
              user_id: currentUserId || "",
              konten: contentToSend,
              visibilitas: "publik",
              parent_id: targetParentId,
              created_at: new Date().toISOString(),
              profiles: {
                id: currentUserId || "",
                nama_lengkap: "Saya",
              },
            },
          ]);
        }
      } else {
        setCommentError(res.message || "Gagal mengirim komentar. Silakan coba lagi.");
        setCommentText(contentToSend);
      }
    });
  };

  // Handle delete post
  const handleDeletePost = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus postingan kabar ini?")) {
      return;
    }

    startDeleteTransition(async () => {
      await deleteKabar(kabar.id);
    });
  };

  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      return;
    }

    startDeleteCommentTransition(async () => {
      // Optimistic delete dengan backup untuk revert jika gagal
      const prevCommentsBackup = [...comments];
      setComments((prev) =>
        prev.filter((c) => c.id !== commentId && c.parent_id !== commentId)
      );

      const res = await deleteKomentarKabar(commentId, kabar.id);
      if (!res.success) {
        setComments(prevCommentsBackup);
        alert(res.message);
      }
    });
  };

  // Handle toggle komentar dinonaktifkan / aktif
  const handleToggleComments = () => {
    const newDisabled = !commentsDisabled;
    const confirmMsg = newDisabled
      ? "Apakah Anda yakin ingin menonaktifkan komentar pada postingan ini? Pengguna lain tidak akan dapat mengirim komentar."
      : "Apakah Anda ingin mengaktifkan kembali komentar pada postingan ini?";

    if (!confirm(confirmMsg)) return;

    startToggleCommentsTransition(async () => {
      setCommentsDisabled(newDisabled);
      const res = await toggleKomentarKabarStatus(kabar.id, newDisabled);
      if (!res.success) {
        setCommentsDisabled(!newDisabled);
        alert(res.message);
      }
    });
  };

  // Helper render satu item komentar / balasan
  const renderCommentItem = (
    comment: KomentarKabar,
    isReply: boolean = false
  ) => {
    const commentAuthor = comment.profiles?.nama_lengkap || "Warga";
    const commentInitial = commentAuthor.charAt(0).toUpperCase();

    // Izin hapus komentar: pembuat komentar, pembuat kabar (author post), atau super admin
    const canDeleteThisComment =
      currentUserId &&
      (comment.user_id === currentUserId ||
        kabar.user_id === currentUserId ||
        isSuperAdmin);

    // Cari nama orang yang dibalas jika ini adalah balasan
    let repliedToAuthor: string | null = null;
    if (comment.parent_id && commentsMap.has(comment.parent_id)) {
      repliedToAuthor =
        commentsMap.get(comment.parent_id)?.profiles?.nama_lengkap || "Warga";
    }

    return (
      <div
        key={comment.id}
        className={cn(
          "flex items-start gap-2 group/comment",
          isReply && "pt-1"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded border border-border bg-muted font-bold text-foreground",
            isReply ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px]"
          )}
        >
          {commentInitial}
        </div>
        <div className="flex-1 rounded border border-border bg-card p-2 text-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between gap-1 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground">
                {commentAuthor}
              </span>

              {/* Indikator Membalas Siapa */}
              {repliedToAuthor && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                  <span>↳ membalas</span>
                  <span className="font-medium underline">@{repliedToAuthor}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">
                {formatTimeAgo(comment.created_at)}
              </span>

              {/* Tombol Balas Komentar (hanya muncul jika komentar belum dinonaktifkan) */}
              {!commentsDisabled && (
                <button
                  type="button"
                  onClick={() => handleReplyClick(comment)}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={`Balas komentar ${commentAuthor}`}
                >
                  <Reply className="h-2.5 w-2.5" />
                  <span>Balas</span>
                </button>
              )}

              {/* Tombol Hapus Komentar */}
              {canDeleteThisComment && (
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={isPendingDeleteComment}
                  className="inline-flex items-center justify-center h-5 w-5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Hapus komentar ini"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          </div>

          <p className="text-foreground/90 font-sans text-xs leading-relaxed break-words whitespace-pre-line">
            {comment.konten}
          </p>
        </div>
      </div>
    );
  };

  return (
    <article className="rounded-lg border border-border bg-card transition-colors hover:border-zinc-700">
      {/* Card Header: Author Info & Visibilitas */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-sm font-semibold text-foreground">
            {authorInitial}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-foreground leading-tight">
                {authorName}
              </h3>
              {kabar.profiles?.is_super_admin && (
                <span className="cyber-badge font-mono text-[9px] py-0 px-1">
                  <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                  ADMIN
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>{formatTimeAgo(kabar.created_at)}</span>
              <span>•</span>

              {/* Visibility Badge Kabar */}
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                {kabar.visibilitas === "publik" && (
                  <>
                    <Globe className="h-3 w-3 text-emerald-400" />
                    <span>PUBLIK</span>
                  </>
                )}
                {kabar.visibilitas === "teman" && (
                  <>
                    <Users className="h-3 w-3 text-cyan-400" />
                    <span>TEMAN</span>
                  </>
                )}
                {kabar.visibilitas === "komunitas" && (
                  <>
                    <Building2 className="h-3 w-3 text-amber-400" />
                    <span>
                      {kabar.komunitas?.nama || "KOMUNITAS"}
                    </span>
                  </>
                )}
              </span>

              {/* Indikator Komentar Dinonaktifkan */}
              {commentsDisabled && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                    <MessageSquareOff className="h-2.5 w-2.5" />
                    <span>KOMENTAR TUTUP</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons for author / admin */}
        {canManagePost && (
          <div className="flex items-center gap-1">
            {/* Toggle Nonaktifkan / Aktifkan Komentar */}
            <button
              type="button"
              onClick={handleToggleComments}
              disabled={isPendingToggleComments}
              className={cn(
                "flex h-7 items-center gap-1 rounded px-2 text-[10px] font-mono transition-colors border",
                commentsDisabled
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                  : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
              )}
              title={
                commentsDisabled
                  ? "Komentar sedang dinonaktifkan. Klik untuk mengaktifkan kembali."
                  : "Klik untuk menonaktifkan komentar pada postingan ini."
              }
            >
              {isPendingToggleComments ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : commentsDisabled ? (
                <>
                  <MessageSquareOff className="h-3 w-3 text-amber-500" />
                  <span className="hidden sm:inline">Buka Komentar</span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Tutup Komentar</span>
                </>
              )}
            </button>

            {/* Delete button for author/admin */}
            {canDelete && (
              <button
                onClick={handleDeletePost}
                disabled={isPendingDelete}
                aria-label="Hapus postingan"
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Hapus postingan kabar"
              >
                {isPendingDelete ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Text Content */}
      <div className="px-4 py-2 text-sm leading-relaxed text-foreground whitespace-pre-line break-words font-normal">
        {kabar.konten}
      </div>

      {/* Reaction Summary Pills */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1.5 px-4 pt-1 font-mono text-xs text-muted-foreground">
          <div className="flex -space-x-1 overflow-hidden">
            {Object.keys(reactionCounts)
              .filter((k) => reactionCounts[k] > 0)
              .map((emoji) => (
                <span
                  key={emoji}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 text-xs border border-border"
                >
                  {emoji}
                </span>
              ))}
          </div>
          <span>[{totalReactions} REAKSI]</span>
        </div>
      )}

      {/* Interactive Bottom Bar */}
      <div className="relative mt-2 border-t border-border px-3 py-1.5 flex items-center justify-between font-mono text-xs">
        {/* Reaction Picker Button & Popover */}
        <div className="relative">
          <button
            onClick={handleReactionButtonClick}
            disabled={isPendingReaction}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded px-2 text-xs transition-colors",
              userReaction
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{userReaction || "😊"}</span>
            <span>{userReaction ? "BEREAKSI" : "REAKSI"}</span>
          </button>

          {/* Reaction Picker Popup */}
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 z-20">
              {AVAILABLE_REACTIONS.map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleReactionClick(item.emoji)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded text-sm transition-transform hover:scale-125 active:scale-95",
                    userReaction === item.emoji && "bg-muted scale-110"
                  )}
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Toggle Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded px-2 text-xs transition-colors",
            showComments
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {commentsDisabled ? (
            <MessageSquareOff className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
          <span>[{visibleComments.length} KOMENTAR]</span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div className="border-t border-border bg-muted/20 p-3 space-y-3 font-mono text-xs">
          {/* List of Threaded Comments */}
          {visibleComments.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-1">
              {commentsDisabled ? "Komentar dinonaktifkan." : "Belum ada komentar."}
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {rootComments.map((rootComment) => {
                const replies = repliesByRootId.get(rootComment.id) || [];

                return (
                  <div key={rootComment.id} className="space-y-2">
                    {/* Root Comment */}
                    {renderCommentItem(rootComment, false)}

                    {/* Threaded Replies under this root */}
                    {replies.length > 0 && (
                      <div className="ml-3 sm:ml-5 pl-2.5 border-l-2 border-border/70 space-y-2 pt-0.5">
                        {replies.map((reply) =>
                          renderCommentItem(reply, true)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment Error Alert */}
          {commentError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1 font-mono text-[11px] leading-tight">{commentError}</span>
              <button
                type="button"
                onClick={() => setCommentError(null)}
                className="text-[10px] underline font-mono hover:text-foreground"
              >
                Tutup
              </button>
            </div>
          )}

          {/* New Comment / Reply Input Form OR Disabled Banner */}
          {commentsDisabled ? (
            <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-2.5 text-xs text-amber-600 dark:text-amber-400 animate-in fade-in">
              <MessageSquareOff className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="font-mono text-[11px] leading-tight">
                Komentar pada postingan ini telah dinonaktifkan oleh pembuat kabar.
              </span>
            </div>
          ) : (
            <form onSubmit={handleCommentSubmit} className="space-y-2 pt-1">
              {/* Banner Balasan Aktif */}
              {replyingTo && (
                <div className="flex items-center justify-between rounded bg-muted/60 px-2.5 py-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                    <span>
                      Membalas <strong className="font-semibold text-foreground">@{replyingTo.authorName}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Batalkan balasan"
                  >
                    <X className="h-3 w-3" />
                    <span>Batal</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    if (commentError) setCommentError(null);
                  }}
                  onFocus={() => {
                    if (!currentUserId) {
                      setShowAuthModal(true);
                    }
                  }}
                  onClick={() => {
                    if (!currentUserId) {
                      setShowAuthModal(true);
                    }
                  }}
                  readOnly={!currentUserId}
                  placeholder={
                    currentUserId
                      ? replyingTo
                        ? `Tulis balasan untuk @${replyingTo.authorName}...`
                        : "Tulis komentar..."
                      : "Silahkan login untuk memberikan komentar..."
                  }
                  className="flex-1 h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring font-sans cursor-pointer sm:cursor-text"
                />
                <button
                  type={currentUserId ? "submit" : "button"}
                  onClick={() => {
                    if (!currentUserId) {
                      setShowAuthModal(true);
                    }
                  }}
                  disabled={currentUserId ? !commentText.trim() || isPendingComment : false}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                  aria-label={replyingTo ? "Kirim Balasan" : "Kirim Komentar"}
                  title={replyingTo ? "Kirim Balasan" : "Kirim Komentar"}
                >
                  {isPendingComment ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Login Prompt Modal for Guests */}
      <LoginPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Silakan Masuk ke Akun"
        description="Silahkan login untuk memberikan reaksi dan komentar pada Kabar Warga."
      />
    </article>
  );
}



