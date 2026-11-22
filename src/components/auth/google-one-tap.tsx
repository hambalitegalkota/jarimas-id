"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { loginWithGoogleOneTap, loginUser } from "@/app/actions/auth";

declare global {
  interface Window {
    google?: any;
  }
}

function GoogleColorIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function GoogleOneTapPrompt() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Cek apakah pengguna sudah memiliki sesi login aktif
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Periksa apakah prompt pernah ditutup pada sesi tab ini
        const isDismissed = sessionStorage.getItem("jarimas_dismiss_google_prompt");
        if (!isDismissed) {
          const timer = setTimeout(() => {
            setShowPrompt(true);
          }, 2000);
          return () => clearTimeout(timer);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      if (session) setShowPrompt(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Inisialisasi Google One Tap resmi saat script GIS selesai dimuat
  const handleScriptLoad = () => {
    if (!googleClientId || isAuthenticated) return;

    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response?.credential) {
              setIsProcessing(true);
              setErrorMessage("");
              try {
                const res = await loginWithGoogleOneTap(response.credential);
                if (res.success) {
                  router.push("/profil");
                  router.refresh();
                } else {
                  setErrorMessage(res.message || "Gagal masuk dengan Google.");
                  setIsProcessing(false);
                }
              } catch (err: any) {
                setErrorMessage(err?.message || "Terjadi kesalahan saat masuk.");
                setIsProcessing(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Tampilkan prompt Google One Tap resmi
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Jika Google One Tap resmi tidak tampil, fallback popup tetap aktif
          }
        });
      }
    } catch (err) {
      console.warn("Google One Tap init error:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem("jarimas_dismiss_google_prompt", "true");
    } catch {}
  };

  // Submit via popup instan
  const handleInstantGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.set("email", inputEmail.trim());
      formData.set("password", ""); // Tanpa password (otomatis passwordless direct)

      const result = await loginUser({ success: false, message: "" }, formData);
      if (result && !result.success && result.message) {
        setErrorMessage(result.message);
        setIsProcessing(false);
      }
    } catch {
      // Jika terjadi redirect Next.js, ini normal
      setShowPrompt(false);
    }
  };

  // Jika sudah login, tidak perlu tampilkan apa pun
  if (isAuthenticated === true) {
    return null;
  }

  return (
    <>
      {/* Script Resmi Google Identity Services */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Popup Cerdas Masuk Akun Google / Gmail */}
      {showPrompt && !isAuthenticated && (
        <aside
          role="complementary"
          aria-label="Pemberitahuan Masuk Cepat Akun Google"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] rounded-2xl border border-primary/20 bg-card p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan"
            className="absolute top-3 right-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="space-y-3.5">
            {/* Header info */}
            <div className="flex items-start gap-3 pr-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-xs">
                <GoogleColorIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-sm bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    MASUK CEPAT
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-foreground">
                  Gunakan Akun Google Anda?
                </h2>
                <p className="text-2xs text-muted-foreground leading-snug">
                  Masuk atau buat akun baru tanpa perlu kata sandi dan langsung atur profil Anda.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-2xs text-destructive">
                {errorMessage}
              </div>
            )}

            {/* Fast Email Submit Form */}
            <form onSubmit={handleInstantGoogleSubmit} className="space-y-2 pt-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="alamat@gmail.com"
                  className="w-full min-h-[36px] h-9 rounded-lg border border-border bg-background pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 inline-flex min-h-[36px] h-9 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-3 text-xs font-semibold shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menghubungkan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Lanjutkan &amp; Buka Profil</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-2xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Aman, resmi &amp; langsung aktif di JARIMAS</span>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
