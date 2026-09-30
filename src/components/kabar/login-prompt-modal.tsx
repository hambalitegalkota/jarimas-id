"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  LogIn,
  X,
  Heart,
  MessageCircle,
  Sparkles,
  ArrowRight,
  UserPlus,
} from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function LoginPromptModal({
  isOpen,
  onClose,
  title = "Silakan Masuk ke Akun",
  description = "Silahkan login untuk memberikan reaksi dan komentar pada Kabar Warga.",
}: LoginPromptModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto"
      >
        {/* Header with Close Button */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="cyber-badge text-[10px] py-0 px-1.5">AUTENTIKASI</span>
              </div>
              <h2
                id="login-prompt-title"
                className="text-base font-bold tracking-tight text-foreground mt-0.5"
              >
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <p className="text-sm text-foreground/90 leading-relaxed font-sans">
            {description}
          </p>

          {/* Feature Highlights */}
          <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex items-center gap-2.5 text-foreground/85">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Heart className="h-3.5 w-3.5" />
              </div>
              <span>Ekspresikan reaksi (❤️, 👍, 🙏, 😊)</span>
            </div>
            <div className="flex items-center gap-2.5 text-foreground/85">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <span>Tulis tanggapan & diskusi bersama warga</span>
            </div>
            <div className="flex items-center gap-2.5 text-foreground/85">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span>Bagikan kabar & pantau info posyandu</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all active:scale-[0.99] hover:bg-zinc-200"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk / Login Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/register"
                className="flex-1 flex min-h-[40px] items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-mono font-medium text-foreground hover:bg-muted transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Daftar Akun</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex min-h-[40px] items-center justify-center rounded-md border border-transparent px-3 py-2 text-xs font-mono font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
