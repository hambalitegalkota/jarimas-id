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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-2xl sm:rounded-lg border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto"
      >
        {/* Header with Close Button */}
        <div className="flex items-start justify-between p-4 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-2xs font-bold text-primary border border-primary/20">
                  AUTENTIKASI
                </span>
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 pb-8 overflow-y-auto flex-1 space-y-3.5 overscroll-contain bg-background">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Feature Highlights */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <Heart className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Ekspresikan reaksi (❤️, 👍, 🙏, 😊)</span>
            </div>
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Tulis tanggapan & diskusi bersama warga</span>
            </div>
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary border border-secondary/30">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Bagikan kabar & pantau info posyandu</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-all active:scale-[0.99]"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk / Login Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/register"
                className="flex-1 flex min-h-[40px] h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Daftar Akun</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex min-h-[40px] h-10 items-center justify-center rounded-lg border border-transparent px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
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
