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
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex min-h-[48px] h-12 items-center justify-center gap-2 rounded-full bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white shadow-xl transition-all active:scale-95 sm:bottom-22 cursor-pointer whitespace-nowrap"
      >
        <Plus className="h-5 w-5 stroke-[2.5px]" />
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
          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Bagikan Kabar Warga
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Sampaikan pengumuman atau catatan publik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 pb-12 overflow-y-auto flex-1 space-y-5 overscroll-contain bg-slate-50/50">
              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {komunitasNama && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                    <Building2 className="h-4 w-4 text-blue-700 shrink-0" />
                    <span>Postingan ini akan diterbitkan di komunitas: <strong>{komunitasNama}</strong></span>
                  </div>
                )}

                {/* Textarea Konten */}
                <div className="space-y-2">
                  <label className="text-base font-bold text-slate-900 block leading-snug">
                    Tuliskan Berita / Informasi <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    value={konten}
                    onChange={(e) => setKonten(e.target.value)}
                    placeholder="Tulis kabar kegiatan posyandu, info lingkungan RT/RW, atau pengumuman PAUD di sini..."
                    rows={4}
                    required
                    maxLength={2000}
                    className="w-full rounded-2xl border-2 border-slate-300 bg-white p-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <div className="flex justify-end text-xs font-semibold text-slate-500">
                    <span>{konten.length}/2000 Karakter</span>
                  </div>
                </div>

                {/* Visibilitas Selector */}
                <div className="space-y-2">
                  <label className="text-base font-bold text-slate-900 block leading-snug">
                    Visibilitas Postingan
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setVisibilitas("publik")}
                      className={cn(
                        "flex min-h-[50px] flex-col items-center justify-center gap-1 rounded-xl border-2 p-2.5 text-sm font-bold transition-all cursor-pointer",
                        visibilitas === "publik"
                          ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Globe className="h-4 w-4 text-blue-700" />
                      <span>Publik</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilitas("teman")}
                      className={cn(
                        "flex min-h-[50px] flex-col items-center justify-center gap-1 rounded-xl border-2 p-2.5 text-sm font-bold transition-all cursor-pointer",
                        visibilitas === "teman"
                          ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Teman</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibilitas("komunitas")}
                      className={cn(
                        "flex min-h-[50px] flex-col items-center justify-center gap-1 rounded-xl border-2 p-2.5 text-sm font-bold transition-all cursor-pointer",
                        visibilitas === "komunitas"
                          ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Building2 className="h-4 w-4 text-amber-600" />
                      <span>Komunitas</span>
                    </button>
                  </div>
                </div>

                {/* Opsi Nonaktifkan Komentar */}
                <div className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-start gap-3 pr-2">
                    <MessageSquareOff className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <label
                        htmlFor="disable-comments-toggle"
                        className="text-sm font-bold text-slate-900 cursor-pointer block"
                      >
                        Nonaktifkan Komentar
                      </label>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Pengguna lain tidak dapat mengirim komentar pada kabar ini
                      </p>
                    </div>
                  </div>
                  <input
                    id="disable-comments-toggle"
                    type="checkbox"
                    checked={komentarDinonaktifkan}
                    onChange={(e) => setKomentarDinonaktifkan(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!konten.trim() || isPending}
                    className="flex w-full min-h-[52px] h-13 items-center justify-center gap-2 rounded-2xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
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
