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
import { cn, isAdminPusat, isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
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

  const visibleComments = comments;

  // Susun struktur komentar berulir
  const commentsMap = new Map(visibleComments.map((c) => [c.id, c]));
  const rootComments: KomentarKabar[] = [];
  const repliesByRootId = new Map<string, KomentarKabar[]>();

  visibleComments.forEach((comment) => {
    if (!comment.parent_id || !commentsMap.has(comment.parent_id)) {
      rootComments.push(comment);
    } else {
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

  const handleReactionButtonClick = () => {
    if (!currentUserId) {
      setShowAuthModal(true);
      return;
    }
    setShowReactionPicker(!showReactionPicker);
  };

  const handleReactionClick = (emoji: string) => {
    if (!currentUserId) {
      setShowReactionPicker(false);
      setShowAuthModal(true);
      return;
    }
    setShowReactionPicker(false);
    startReactionTransition(async () => {
      const previousReaction = userReaction;
      const prevCounts = { ...reactionCounts };
      let newTotal = totalReactions;

      if (previousReaction === emoji) {
        setUserReaction(null);
        prevCounts[emoji] = Math.max(0, (prevCounts[emoji] || 1) - 1);
        newTotal = Math.max(0, newTotal - 1);
      } else {
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
        setUserReaction(previousReaction);
        setReactionCounts(kabar.reaksi_counts || {});
        setTotalReactions(kabar.jumlah_reaksi);
      }
    });
  };

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

  const handleDeletePost = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus postingan kabar ini?")) {
      return;
    }

    startDeleteTransition(async () => {
      await deleteKabar(kabar.id);
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      return;
    }

    startDeleteCommentTransition(async () => {
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

  const renderCommentItem = (
    comment: KomentarKabar,
    isReply: boolean = false
  ) => {
    const commentAuthor = comment.profiles?.nama_lengkap || "Warga";
    const commentInitial = commentAuthor.charAt(0).toUpperCase();

    const canDeleteThisComment =
      currentUserId &&
      (comment.user_id === currentUserId ||
        kabar.user_id === currentUserId ||
        isSuperAdmin);

    let repliedToAuthor: string | null = null;
    if (comment.parent_id && commentsMap.has(comment.parent_id)) {
      repliedToAuthor =
        commentsMap.get(comment.parent_id)?.profiles?.nama_lengkap || "Warga";
    }

    return (
      <div
        key={comment.id}
        className={cn(
          "flex items-start gap-2.5 group/comment",
          isReply && "pt-1"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg font-bold border",
            isReply
              ? "h-7 w-7 text-xs bg-muted border-border text-muted-foreground"
              : "h-8 w-8 text-xs bg-primary/10 border-primary/20 text-primary"
          )}
        >
          {commentInitial}
        </div>
        <div className="flex-1 rounded-lg border border-border bg-card p-3 text-sm space-y-1 shadow-2xs">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground text-xs sm:text-sm">
                {commentAuthor}
              </span>

              {repliedToAuthor && (
                <span className="inline-flex items-center gap-1 text-2xs text-primary font-semibold">
                  <span>↳ membalas</span>
                  <span className="underline">@{repliedToAuthor}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xs font-medium text-muted-foreground" suppressHydrationWarning>
                {formatTimeAgo(comment.created_at)}
              </span>

              {!commentsDisabled && (
                <button
                  type="button"
                  onClick={() => handleReplyClick(comment)}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title={`Balas komentar ${commentAuthor}`}
                >
                  <Reply className="h-3 w-3" />
                  <span>Balas</span>
                </button>
              )}

              {canDeleteThisComment && (
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={isPendingDeleteComment}
                  className="inline-flex items-center justify-center h-5 w-5 rounded-md text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Hapus komentar ini"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <p className="text-foreground text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line">
            {comment.konten}
          </p>
        </div>
      </div>
    );
  };

  return (
    <article className="rounded-lg border border-border bg-card shadow-xs transition-all hover:border-primary/40 overflow-hidden">
      {/* Card Header: Author Info & Visibilitas */}
      <div className="flex items-start justify-between p-4 pb-2.5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
            {authorInitial}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                {authorName}
              </h3>
              {(kabar.profiles?.is_super_admin || checkIsSuperAdmin(kabar.profiles)) ? (
                <span className="rounded-md bg-secondary/15 px-2 py-0.5 text-2xs font-bold text-secondary border border-secondary/30">
                  SUPER ADMIN
                </span>
              ) : isAdminPusat(kabar.profiles) ? (
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-2xs font-bold text-primary border border-primary/30">
                  ADMIN PUSAT
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-2xs font-medium text-muted-foreground">
              <span suppressHydrationWarning>{formatTimeAgo(kabar.created_at)}</span>
              <span>•</span>

              {/* Visibility Badge Kabar */}
              <span className="inline-flex items-center gap-1 font-semibold">
                {kabar.visibilitas === "publik" && (
                  <>
                    <Globe className="h-3 w-3 text-primary" />
                    <span>Publik</span>
                  </>
                )}
                {kabar.visibilitas === "teman" && (
                  <>
                    <Users className="h-3 w-3 text-primary" />
                    <span>Teman</span>
                  </>
                )}
                {kabar.visibilitas === "komunitas" && (
                  <>
                    <Building2 className="h-3 w-3 text-primary" />
                    <span>{kabar.komunitas?.nama || "Komunitas"}</span>
                  </>
                )}
              </span>

              {commentsDisabled && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-secondary font-semibold">
                    <MessageSquareOff className="h-3 w-3" />
                    <span>Komentar Tutup</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons for author / admin */}
        {canManagePost && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleComments}
              disabled={isPendingToggleComments}
              className={cn(
                "flex min-h-[34px] h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors border cursor-pointer",
                commentsDisabled
                  ? "bg-secondary/10 text-secondary border-secondary/30 hover:bg-secondary/20"
                  : "text-muted-foreground border-border hover:bg-muted"
              )}
              title={
                commentsDisabled
                  ? "Komentar sedang dinonaktifkan. Klik untuk mengaktifkan kembali."
                  : "Klik untuk menonaktifkan komentar pada postingan ini."
              }
            >
              {isPendingToggleComments ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : commentsDisabled ? (
                <>
                  <MessageSquareOff className="h-3.5 w-3.5 text-secondary" />
                  <span className="hidden sm:inline">Buka Komentar</span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">Tutup Komentar</span>
                </>
              )}
            </button>

            {canDelete && (
              <button
                onClick={handleDeletePost}
                disabled={isPendingDelete}
                aria-label="Hapus postingan"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                title="Hapus postingan kabar"
              >
                {isPendingDelete ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Text Content */}
      <div className="px-4 py-2 text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-line break-words">
        {kabar.konten}
      </div>

      {/* Reaction Summary Pills */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 px-4 pt-1 text-xs font-semibold text-muted-foreground">
          <div className="flex -space-x-1 overflow-hidden">
            {Object.keys(reactionCounts)
              .filter((k) => reactionCounts[k] > 0)
              .map((emoji) => (
                <span
                  key={emoji}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs border border-card shadow-2xs"
                >
                  {emoji}
                </span>
              ))}
          </div>
          <span>{totalReactions} Reaksi</span>
        </div>
      )}

      {/* Interactive Bottom Bar */}
      <div className="relative mt-2 border-t border-border px-4 py-2 flex items-center justify-between">
        {/* Reaction Picker Button & Popover */}
        <div className="relative">
          <button
            onClick={handleReactionButtonClick}
            disabled={isPendingReaction}
            className={cn(
              "flex min-h-[38px] h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all border cursor-pointer",
              userReaction
                ? "bg-primary/10 text-primary border-primary/30 shadow-2xs font-bold"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            <span className="text-sm">{userReaction || "😊"}</span>
            <span>{userReaction ? "Bereaksi" : "Beri Reaksi"}</span>
          </button>

          {/* Reaction Picker Popup */}
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1.5 rounded-lg border border-border bg-card p-1.5 shadow-lg animate-in fade-in zoom-in-95 z-20">
              {AVAILABLE_REACTIONS.map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleReactionClick(item.emoji)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-base transition-transform hover:scale-125 active:scale-95 cursor-pointer",
                    userReaction === item.emoji && "bg-primary/15 scale-110 border border-primary/30"
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
            "flex min-h-[38px] h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all border cursor-pointer",
            showComments
              ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
              : "border-border text-foreground hover:bg-muted"
          )}
        >
          {commentsDisabled ? (
            <MessageSquareOff className="h-3.5 w-3.5 text-secondary" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
          <span>{visibleComments.length} Komentar</span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div className="border-t border-border bg-muted/40 p-3 sm:p-4 space-y-3">
          {/* List of Threaded Comments */}
          {visibleComments.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-2">
              {commentsDisabled ? "Komentar dinonaktifkan." : "Belum ada komentar."}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {rootComments.map((rootComment) => {
                const replies = repliesByRootId.get(rootComment.id) || [];

                return (
                  <div key={rootComment.id} className="space-y-2">
                    {/* Root Comment */}
                    {renderCommentItem(rootComment, false)}

                    {/* Threaded Replies */}
                    {replies.length > 0 && (
                      <div className="ml-3 sm:ml-5 pl-2.5 border-l-2 border-border space-y-2 pt-1">
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
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs font-semibold text-rose-900 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="flex-1">{commentError}</span>
              <button
                type="button"
                onClick={() => setCommentError(null)}
                className="text-2xs underline font-bold hover:text-rose-950 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* New Comment / Reply Input Form */}
          {commentsDisabled ? (
            <div className="flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 p-3 text-xs font-semibold text-secondary-foreground animate-in fade-in">
              <MessageSquareOff className="h-4 w-4 shrink-0 text-secondary" />
              <span>
                Komentar pada postingan ini telah dinonaktifkan oleh pembuat kabar.
              </span>
            </div>
          ) : (
            <form onSubmit={handleCommentSubmit} className="space-y-2 pt-1">
              {/* Banner Balasan Aktif */}
              {replyingTo && (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Membalas <strong className="font-bold">@{replyingTo.authorName}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-primary/20 transition-colors cursor-pointer"
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
                        : "Tulis komentar Anda..."
                      : "Silahkan login untuk memberikan komentar..."
                  }
                  className="flex-1 min-h-[44px] h-11 rounded-lg border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                />
                <button
                  type={currentUserId ? "submit" : "button"}
                  onClick={() => {
                    if (!currentUserId) {
                      setShowAuthModal(true);
                    }
                  }}
                  disabled={currentUserId ? !commentText.trim() || isPendingComment : false}
                  className="flex min-h-[44px] h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-2xs cursor-pointer shrink-0"
                  aria-label={replyingTo ? "Kirim Balasan" : "Kirim Komentar"}
                  title={replyingTo ? "Kirim Balasan" : "Kirim Komentar"}
                >
                  {isPendingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
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
