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

  // Handle comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const contentToSend = commentText.trim();
    setCommentText("");

    startCommentTransition(async () => {
      const res = await addKomentarKabar(kabar.id, contentToSend);
      if (res.success) {
        setComments((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            kabar_id: kabar.id,
            user_id: currentUserId || "",
            konten: contentToSend,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    });
  };

  // Handle delete
  const handleDeletePost = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus postingan kabar ini?")) {
      return;
    }

    startDeleteTransition(async () => {
      await deleteKabar(kabar.id);
    });
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

              {/* Visibility Badge */}
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
            </div>
          </div>
        </div>

        {/* Delete button for author/admin */}
        {canDelete && (
          <button
            onClick={handleDeletePost}
            disabled={isPendingDelete}
            aria-label="Hapus postingan"
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            {isPendingDelete ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
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
            onClick={() => setShowReactionPicker(!showReactionPicker)}
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
          <MessageCircle className="h-3.5 w-3.5" />
          <span>[{comments.length} KOMENTAR]</span>
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div className="border-t border-border bg-muted/20 p-3 space-y-3 font-mono text-xs">
          {/* List of Comments */}
          {comments.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-1">
              Belum ada komentar.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const commentAuthor =
                  comment.profiles?.nama_lengkap || "Warga";
                const commentInitial = commentAuthor.charAt(0).toUpperCase();

                return (
                  <div key={comment.id} className="flex items-start gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-muted text-[10px] font-bold text-foreground">
                      {commentInitial}
                    </div>
                    <div className="flex-1 rounded border border-border bg-card p-2 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground">
                          {commentAuthor}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-foreground/90 font-sans text-xs leading-relaxed break-words whitespace-pre-line">
                        {comment.konten}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New Comment Input Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis tanggapan..."
              className="flex-1 h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring font-sans"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isPendingComment}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
              aria-label="Kirim Komentar"
            >
              {isPendingComment ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
