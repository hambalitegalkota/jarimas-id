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
        className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto"
      >
        {/* Header with Close Button */}
        <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                  AUTENTIKASI
                </span>
              </div>
              <h2
                id="login-prompt-title"
                className="text-lg font-bold tracking-tight text-slate-900 mt-0.5"
              >
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 pb-12 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-slate-50/50">
          <p className="text-base text-slate-700 leading-relaxed font-medium">
            {description}
          </p>

          {/* Feature Highlights */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <Heart className="h-4 w-4" />
              </div>
              <span className="font-semibold">Ekspresikan reaksi (❤️, 👍, 🙏, 😊)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-800">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="font-semibold">Tulis tanggapan & diskusi bersama warga</span>
            </div>
            <div className="flex items-center gap-3 text-slate-800">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">Bagikan kabar & pantau info posyandu</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/login"
              className="flex min-h-[50px] h-13 items-center justify-center gap-2 rounded-2xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white shadow-md transition-all active:scale-[0.99]"
            >
              <LogIn className="h-5 w-5" />
              <span>Masuk / Login Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <Link
                href="/register"
                className="flex-1 flex min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <UserPlus className="h-4 w-4 text-slate-500" />
                <span>Daftar Akun</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex min-h-[48px] h-12 items-center justify-center rounded-xl border-2 border-transparent px-4 text-sm font-bold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
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
