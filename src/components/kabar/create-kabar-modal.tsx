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
} from "lucide-react";
import { createKabar } from "@/app/actions/kabar";
import type { VisibilitasKabar } from "@/types/database";
import { cn } from "@/lib/utils";

interface CreateKabarModalProps {
  currentUserId?: string | null;
}

export function CreateKabarModal({ currentUserId }: CreateKabarModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [konten, setKonten] = useState("");
  const [visibilitas, setVisibilitas] = useState<VisibilitasKabar>("publik");
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

    startTransition(async () => {
      const res = await createKabar(formData);
      if (res.success) {
        setKonten("");
        setVisibilitas("publik");
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
            window.location.href = "/login";
            return;
          }
          setIsOpen(true);
        }}
        aria-label="Buat Kabar Baru"
        className="fixed bottom-20 right-4 z-40 flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-r from-accent to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-accent/30 transition-transform active:scale-95 hover:brightness-110 sm:right-6"
      >
        <Plus className="h-5 w-5 stroke-[2.5px]" />
        <span>Bagikan Kabar</span>
      </button>

      {/* Modal Dialog Backdrop & Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Bagikan Kabar Baru
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sampaikan info atau update ke sesama warga
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Textarea Konten */}
              <div className="space-y-1.5">
                <textarea
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  placeholder="Apa kabar atau informasi yang ingin Anda bagikan hari ini?..."
                  rows={4}
                  required
                  maxLength={2000}
                  className="w-full rounded-2xl border border-input bg-background/50 p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <div className="flex justify-end text-[11px] text-muted-foreground">
                  <span>{konten.length}/2000 karakter</span>
                </div>
              </div>

              {/* Visibilitas Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Visibilitas Postingan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibilitas("publik")}
                    className={cn(
                      "flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-semibold transition-all",
                      visibilitas === "publik"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Globe className="h-4 w-4" />
                    <span>Publik</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibilitas("teman")}
                    className={cn(
                      "flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-semibold transition-all",
                      visibilitas === "teman"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Teman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibilitas("komunitas")}
                    className={cn(
                      "flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-semibold transition-all",
                      visibilitas === "komunitas"
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Komunitas</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!konten.trim() || isPending}
                  className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98] hover:brightness-105 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mempublikasikan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Terbitkan Kabar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
