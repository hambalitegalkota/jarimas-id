"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  X,
  Globe,
  Users,
  Building2,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  MessageSquareOff,
} from "lucide-react";
import { createKabar } from "@/app/actions/kabar";
import type { VisibilitasKabar } from "@/types/database";
import { cn } from "@/lib/utils";
import { LoginPromptModal } from "@/components/kabar/login-prompt-modal";

interface CreateKabarModalProps {
  currentUserId?: string | null;
}

export function CreateKabarModal({ currentUserId }: CreateKabarModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [konten, setKonten] = useState("");
  const [visibilitas, setVisibilitas] = useState<VisibilitasKabar>("publik");
  const [komentarDinonaktifkan, setKomentarDinonaktifkan] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!konten.trim()) {
      setErrorMessage("Konten kabar tidak boleh kosong.");
      return;
    }

    const formData = new FormData();
    formData.append("konten", konten);
    formData.append("visibilitas", visibilitas);
    formData.append(
      "komentar_dinonaktifkan",
      komentarDinonaktifkan ? "true" : "false"
    );

    startTransition(async () => {
      const res = await createKabar(formData);
      if (res.success) {
        setKonten("");
        setVisibilitas("publik");
        setKomentarDinonaktifkan(false);
        setIsOpen(false);
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          if (!currentUserId) {
            setShowAuthModal(true);
            return;
          }
          setIsOpen(true);
        }}
        aria-label="Buat Kabar Baru"
        className="fixed bottom-20 right-4 z-40 flex h-11 items-center gap-2 rounded-md bg-foreground px-4 text-xs font-mono font-semibold uppercase tracking-wider text-background shadow-lg transition-all active:scale-95 hover:bg-zinc-200 sm:right-6 sm:bottom-22 border border-zinc-700"
      >
        <Plus className="h-4 w-4 stroke-[2.5px]" />
        <span>Bagikan Kabar</span>
      </button>

      {/* Login Prompt Modal for Guests */}
      <LoginPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Silakan Masuk ke Akun"
        description="Silahkan login untuk membagikan kabar baru, memberikan reaksi, dan komentar."
      />

      {/* Modal Dialog Backdrop & Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-foreground">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    BAGIKAN KABAR
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sampaikan informasi atau catatan publik ke sesama warga
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-mono">{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Textarea Konten */}
                <div className="space-y-1.5">
                  <textarea
                    value={konten}
                    onChange={(e) => setKonten(e.target.value)}
                    placeholder="Tulis kabar, pengumuman posyandu, atau informasi warga di sini..."
                    rows={4}
                    required
                    maxLength={2000}
                    className="w-full rounded-md border border-input bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring resize-none font-sans"
                  />
                  <div className="flex justify-end text-[10px] font-mono text-muted-foreground">
                    <span>{konten.length}/2000 KARAKTER</span>
                  </div>
                </div>

                {/* Visibilitas Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground block">
                    Visibilitas Postingan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibilitas("publik")}
                      className={cn(
                        "flex min-h-[40px] flex-col items-center justify-center gap-1 rounded-md border p-2 text-xs font-mono transition-all cursor-pointer",
                        visibilitas === "publik"
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>PUBLIK</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilitas("teman")}
                      className={cn(
                        "flex min-h-[40px] flex-col items-center justify-center gap-1 rounded-md border p-2 text-xs font-mono transition-all cursor-pointer",
                        visibilitas === "teman"
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>TEMAN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilitas("komunitas")}
                      className={cn(
                        "flex min-h-[40px] flex-col items-center justify-center gap-1 rounded-md border p-2 text-xs font-mono transition-all cursor-pointer",
                        visibilitas === "komunitas"
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>KOMUNITAS</span>
                    </button>
                  </div>
                </div>

                {/* Opsi Nonaktifkan Komentar */}
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2.5 pr-2">
                    <MessageSquareOff className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <label
                        htmlFor="disable-comments-toggle"
                        className="text-xs font-semibold text-foreground cursor-pointer block"
                      >
                        Nonaktifkan Komentar
                      </label>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Orang lain tidak akan dapat mengirim komentar pada postingan ini
                      </p>
                    </div>
                  </div>
                  <input
                    id="disable-comments-toggle"
                    type="checkbox"
                    checked={komentarDinonaktifkan}
                    onChange={(e) => setKomentarDinonaktifkan(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 pb-1">
                  <button
                    type="submit"
                    disabled={!konten.trim() || isPending}
                    className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md transition-all active:scale-[0.99] hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>MEMPROSES...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>TERBITKAN KABAR</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

