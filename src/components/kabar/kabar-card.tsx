"use client";

import { useState, useTransition } from "react";
import {
  MessageCircle,
  Globe,
  Users,
  Building2,
  Trash2,
  Send,
  Loader2,
  MoreVertical,
  Smile,
  ShieldCheck,
} from "lucide-react";
import {
  toggleReaksiKabar,
  addKomentarKabar,
  deleteKabar,
} from "@/app/actions/kabar";
import type { KabarItem } from "@/types/database";
import { cn } from "@/lib/utils";

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

function formatExactTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function KabarCard({
  kabar,
  currentUserId,
  isSuperAdmin = false,
}: KabarCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userReaction, setUserReaction] = useState<string | null>(
    kabar.user_reaction || null
  );
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    kabar.reaksi_counts || {}
  );
  const [totalReactions, setTotalReactions] = useState(kabar.jumlah_reaksi);
  const [comments, setComments] = useState(kabar.komentar_list || []);

  const [isPendingReaction, startReactionTransition] = useTransition();
  const [isPendingComment, startCommentTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const isAuthor = currentUserId && kabar.user_id === currentUserId;
  const canDelete = isAuthor || isSuperAdmin;
  const authorName =
    kabar.profiles?.nama_lengkap || "Warga JARIMAS";
  const authorInitial = authorName.charAt(0).toUpperCase();

  // Handle reaction toggle
  const handleReactionClick = (emoji: string) => {
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

      setReactionCounts(prevCounts);
      setTotalReactions(newTotal);

      // Server call
      await toggleReaksiKabar(kabar.id, emoji);
    });
  };

  // Handle comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const textToSend = commentText;
    setCommentText("");

    startCommentTransition(async () => {
      // Optimistic local comment addition
      const optimisticComment = {
        id: "temp-" + Date.now(),
        kabar_id: kabar.id,
        user_id: currentUserId || "anon",
        konten: textToSend,
        created_at: new Date().toISOString(),
        profiles: {
          nama_lengkap: "Anda",
        },
      };

      setComments((prev) => [...prev, optimisticComment]);

      const res = await addKomentarKabar(kabar.id, textToSend);
      if (!res.success) {
        // Rollback if failed
        setComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id)
        );
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

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Card Header: Author Info & Visibilitas */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar / Initial */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-700 text-base font-bold text-white shadow-sm shadow-primary/20">
            {authorInitial}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground leading-tight">
                {authorName}
              </h3>
              {kabar.profiles?.is_super_admin && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  <ShieldCheck className="h-3 w-3 text-amber-500" />
                  Admin
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTimeAgo(kabar.created_at)}</span>
              <span>•</span>

              {/* Visibility Badge */}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                {kabar.visibilitas === "publik" && (
                  <>
                    <Globe className="h-3 w-3 text-emerald-600" />
                    <span>Publik</span>
                  </>
                )}
                {kabar.visibilitas === "teman" && (
                  <>
                    <Users className="h-3 w-3 text-blue-600" />
                    <span>Hanya Teman</span>
                  </>
                )}
                {kabar.visibilitas === "komunitas" && (
                  <>
                    <Building2 className="h-3 w-3 text-amber-600" />
                    <span>
                      {kabar.komunitas?.nama || "Komunitas"}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Delete button for author/admin */}
        {canDelete && (
          <button
            onClick={handleDeletePost}
            disabled={isPendingDelete}
            aria-label="Hapus postingan"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-90"
          >
            {isPendingDelete ? (
              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Post Text Content */}
      <div className="px-4 py-2 text-sm leading-relaxed text-foreground whitespace-pre-line break-words font-normal">
        {kabar.konten}
      </div>

      {/* Reaction Summary Pills */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1.5 px-4 pt-2">
          <div className="flex -space-x-1 overflow-hidden">
            {Object.keys(reactionCounts)
              .filter((k) => reactionCounts[k] > 0)
              .map((emoji) => (
                <span
                  key={emoji}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs shadow-xs"
                >
                  {emoji}
                </span>
              ))}
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {totalReactions} reaksi
          </span>
        </div>
      )}

      {/* Interactive Bottom Bar */}
      <div className="relative mt-3 border-t border-border/60 px-2 py-1.5 flex items-center justify-between">
        {/* Reaction Picker Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            disabled={isPendingReaction}
            className={cn(
              "flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
              userReaction
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="text-base">
              {userReaction || "😊"}
            </span>
            <span>{userReaction ? "Bereaksi" : "Reaksi"}</span>
          </button>

          {/* Reaction Picker Popup */}
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1.5 rounded-full border border-border bg-card/95 backdrop-blur-md p-1.5 shadow-xl shadow-black/10 animate-in fade-in zoom-in-95 z-20">
              {AVAILABLE_REACTIONS.map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleReactionClick(item.emoji)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-lg transition-transform hover:scale-125 active:scale-95",
                    userReaction === item.emoji && "bg-primary/20 scale-110"
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
            "flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
            showComments
              ? "bg-secondary text-secondary-foreground font-bold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length} Komentar</span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div className="border-t border-border/80 bg-muted/30 p-4 space-y-4 animate-in fade-in">
          {/* List of Comments */}
          {comments.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-2">
              Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const commentAuthor =
                  comment.profiles?.nama_lengkap || "Warga";
                const commentInitial = commentAuthor.charAt(0).toUpperCase();

                return (
                  <div key={comment.id} className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                      {commentInitial}
                    </div>
                    <div className="flex-1 rounded-2xl bg-card border border-border/70 p-2.5 text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {commentAuthor}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(comment.created_at)} (
                          {formatExactTime(comment.created_at)})
                        </span>
                      </div>
                      <p className="text-foreground/90 leading-relaxed break-words whitespace-pre-line">
                        {comment.konten}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New Comment Input Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis tanggapan santun..."
              className="flex-1 min-h-[44px] rounded-xl border border-input bg-card px-3.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isPendingComment}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-accent text-white shadow-sm shadow-accent/25 transition-transform active:scale-95 hover:brightness-110 disabled:opacity-50"
              aria-label="Kirim Komentar"
            >
              {isPendingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
