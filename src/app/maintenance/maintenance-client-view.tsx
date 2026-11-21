"use client";

import React, { useState } from "react";
import {
  Wrench,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
  Mail,
  MessageCircle,
  KeyRound,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export function MaintenanceClientView() {
  const [isReloading, setIsReloading] = useState(false);
  const [showAdminBypass, setShowAdminBypass] = useState(false);
  const [bypassPasscode, setBypassPasscode] = useState("");
  const [bypassError, setBypassError] = useState("");

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleAdminBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bypassPasscode.trim().toLowerCase() === "admin") {
      window.location.href = "/?bypass=admin";
    } else {
      setBypassError("Kata kunci akses admin tidak sesuai.");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-teal-50/70 via-slate-50 to-white flex flex-col justify-between px-4 py-8 sm:py-12">
      {/* Background Decorative Blur Circles */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

      {/* Header Branding */}
      <header className="relative z-10 mx-auto w-full max-w-xl flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold text-lg tracking-wider">
            J
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-lg tracking-tight">
                JARIMAS-ID
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                Kota Tegal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Platform Kolaborasi Lintas Warga
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/90 px-3 py-1 text-xs font-semibold text-amber-800 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Mode Pemeliharaan
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-xl">
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-10 shadow-xl shadow-slate-200/60 backdrop-blur-md text-center">
          {/* Animated Illustration / Icon Box */}
          <div className="relative mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-lg shadow-teal-500/25">
            <Wrench className="h-10 w-10 sm:h-12 sm:w-12 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          {/* Requested Exact Title and Message */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
            Website sedang dalam perbaikan.
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-semibold text-teal-700">
            Kembali lagi nanti yah. Terimakasih.
          </p>

          {/* Context Explanation */}
          <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200/70 p-4 sm:p-5 text-left text-sm leading-relaxed text-slate-600">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">
                  Optimalisasi & Pembaruan Sistem Terpadu
                </p>
                <p className="mt-1 text-slate-500 text-xs sm:text-[13px] leading-relaxed">
                  Kami sedang menyempurnakan infrastruktur dan sinkronisasi basis data
                  agar akses data anak, interkoneksi komunitas, dan pertukaran informasi
                  warga dapat berjalan jauh lebih cepat, stabil, dan aman.
                </p>
              </div>
            </div>
          </div>

          {/* Status Details */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-teal-600" />
              <span>Estimasi: Pemulihan bertahap sedang berlangsung</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-medium text-emerald-700">Data Warga Terlindungi Aman</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleReload}
              disabled={isReloading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition duration-150 disabled:opacity-70 cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`}
              />
              {isReloading ? "Memuat Ulang..." : "Muat Ulang Halaman"}
            </button>

            <a
              href="https://wa.me/6281355662029?text=Halo%20Admin%20JARIMAS-ID%2C%20saya%20ingin%20menanyakan%20status%20layanan%20website%20JARIMAS-ID%20yang%20sedang%20dalam%20perbaikan."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-xs transition duration-150"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Bantuan WhatsApp</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </a>
          </div>

          {/* Secondary Contact Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Email: jarimas.id@gmail.com</span>
            </span>
          </div>

          {/* Technical Team / Admin Bypass Section */}
          <div className="mt-4 pt-3">
            {!showAdminBypass ? (
              <button
                type="button"
                onClick={() => setShowAdminBypass(true)}
                className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 transition"
              >
                <KeyRound className="h-3 w-3" />
                <span>Akses Pengelola Sistem (Bypass)</span>
              </button>
            ) : (
              <form
                onSubmit={handleAdminBypassSubmit}
                className="mt-2 mx-auto max-w-xs rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left"
              >
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Masukkan Kata Kunci Akses Admin:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={bypassPasscode}
                    onChange={(e) => {
                      setBypassPasscode(e.target.value);
                      setBypassError("");
                    }}
                    placeholder="Ketik 'admin'"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition"
                  >
                    Buka
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminBypass(false);
                      setBypassError("");
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                </div>
                {bypassError && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">
                    {bypassError}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-xl pt-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} JARIMAS-ID. Seluruh hak cipta dilindungi.</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Inisiatif Kolaboratif Warga se-Kota Tegal
        </p>
      </footer>
    </div>
  );
}
