"use client";

import { useEffect } from "react";

/**
 * Komponen pemulihan otomatis dari ChunkLoadError.
 * Terjadi ketika server melakukan deployment versi baru dan file hash chunk JavaScript lama diganti,
 * sedangkan browser klien masih memegang referensi ke hash chunk lama.
 */
export function ChunkErrorRecovery() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const message = String(reason?.message || reason || "");

      if (
        message.includes("Failed to load chunk") ||
        message.includes("Loading chunk") ||
        message.includes("ChunkLoadError") ||
        message.includes("missing chunk")
      ) {
        event.preventDefault();
        const guardKey = "jarimas_chunk_reload_guard";
        const last = sessionStorage.getItem(guardKey);
        const now = Date.now();

        // Cegah looping: hanya auto-reload jika belum pernah auto-reload dalam 15 detik terakhir
        if (!last || now - parseInt(last, 10) > 15000) {
          sessionStorage.setItem(guardKey, String(now));
          window.location.reload();
        }
      }
    };

    const handleError = (event: ErrorEvent) => {
      const message = String(event?.message || "");
      if (
        message.includes("Failed to load chunk") ||
        message.includes("Loading chunk") ||
        message.includes("ChunkLoadError") ||
        message.includes("missing chunk")
      ) {
        const guardKey = "jarimas_chunk_reload_guard";
        const last = sessionStorage.getItem(guardKey);
        const now = Date.now();

        if (!last || now - parseInt(last, 10) > 15000) {
          sessionStorage.setItem(guardKey, String(now));
          window.location.reload();
        }
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
