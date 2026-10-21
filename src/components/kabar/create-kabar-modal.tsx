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
  komunitasId?: string;
  komunitasNama?: string;
}

export function CreateKabarModal({
  currentUserId,
  komunitasId,
  komunitasNama,
}: CreateKabarModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [konten, setKonten] = useState("");
  const [visibilitas, setVisibilitas] = useState<VisibilitasKabar>(
    komunitasId ? "komunitas" : "publik"
  );
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
    if (komunitasId) {
      formData.append("komunitas_id", komunitasId);
    }
    formData.append(
      "komentar_dinonaktifkan",
      komentarDinonaktifkan ? "true" : "false"
    );

    startTransition(async () => {
      const res = await createKabar(formData);
      if (res.success) {
        setKonten("");
        setVisibilitas(komunitasId ? "komunitas" : "publik");
        setKomentarDinonaktifkan(false);
        setIsOpen(false);
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) - Centered Pill */}
      <button
        onClick={() => {
          if (!currentUserId) {
            setShowAuthModal(true);
            return;
          }
          setIsOpen(true);
        }}
        aria-label="Buat Kabar Baru"
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover px-5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 sm:bottom-22 cursor-pointer whitespace-nowrap"
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-2xl sm:rounded-lg border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    Bagikan Kabar Warga
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sampaikan pengumuman atau catatan publik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 pb-8 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-background">
              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-900">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {komunitasNama && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Postingan ini akan diterbitkan di komunitas: <strong>{komunitasNama}</strong></span>
                  </div>
                )}

                {/* Textarea Konten */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground block">
                    Tuliskan Berita / Informasi <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    value={konten}
                    onChange={(e) => setKonten(e.target.value)}
                    placeholder="Tulis kabar kegiatan posyandu, info lingkungan RT/RW, atau pengumuman PAUD di sini..."
                    rows={4}
                    required
                    maxLength={2000}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden resize-none leading-relaxed"
                  />
                  <div className="flex justify-end text-2xs font-medium text-muted-foreground">
                    <span>{konten.length}/2000 Karakter</span>
                  </div>
                </div>

                {/* Visibilitas Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-foreground block">
                    Visibilitas Postingan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibilitas("publik")}
                      className={cn(
                        "flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border p-2 text-xs font-semibold transition-all cursor-pointer",
                        visibilitas === "publik"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <span>Publik</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilitas("teman")}
                      className={cn(
                        "flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border p-2 text-xs font-semibold transition-all cursor-pointer",
                        visibilitas === "teman"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>Teman</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilitas("komunitas")}
                      className={cn(
                        "flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border p-2 text-xs font-semibold transition-all cursor-pointer",
                        visibilitas === "komunitas"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>Komunitas</span>
                    </button>
                  </div>
                </div>

                {/* Opsi Nonaktifkan Komentar */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-2xs">
                  <div className="flex items-start gap-2.5 pr-2">
                    <MessageSquareOff className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <label
                        htmlFor="disable-comments-toggle"
                        className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer block"
                      >
                        Nonaktifkan Komentar
                      </label>
                      <p className="text-2xs text-muted-foreground leading-relaxed">
                        Pengguna lain tidak dapat mengirim komentar pada kabar ini
                      </p>
                    </div>
                  </div>
                  <input
                    id="disable-comments-toggle"
                    type="checkbox"
                    checked={komentarDinonaktifkan}
                    onChange={(e) => setKomentarDinonaktifkan(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!konten.trim() || isPending}
                    className="flex w-full min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menerbitkan Kabar...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Terbitkan Kabar Warga</span>
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
