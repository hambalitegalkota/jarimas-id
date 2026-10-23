"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

interface GoogleAuthButtonProps {
  text?: string;
  redirectTo?: string;
  mode?: "login" | "register";
}

export function GoogleAuthButton({
  text = "Masuk dengan Google",
  redirectTo = "/",
  mode = "login",
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const supabase = createClient();
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";

      // Siapkan URL callback OAuth
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(
        redirectTo
      )}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setErrorMessage(
          error.message || "Gagal menghubungkan ke Google. Silakan coba kembali."
        );
        setIsLoading(false);
      }
      // Browser akan dialihkan secara otomatis ke Google Login
    } catch (err: any) {
      console.error("Google OAuth Error:", err);
      setErrorMessage(
        err?.message || "Terjadi kesalahan saat memulai autentikasi Google."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-2xs text-destructive animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="group relative flex w-full min-h-[44px] h-11 items-center justify-center gap-3 rounded-lg border border-border bg-background hover:bg-muted/60 text-foreground px-4 text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary/40"
        aria-label={text}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Menghubungkan ke Google...
            </span>
          </>
        ) : (
          <>
            {/* Google Icon Vector Resmi */}
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
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
            <span className="tracking-tight">{text}</span>
          </>
        )}
      </button>
    </div>
  );
}
