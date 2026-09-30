"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  MapPin,
  Home,
  FileText,
  BadgeAlert,
  ShieldCheck,
} from "lucide-react";
import { joinKomunitasWargaWithSurvey } from "@/app/actions/komunitas";
import type { KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface WargaOnboardingModalProps {
  komunitas: KomunitasWithMembership;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (membership: any, peranDiajukan?: string | null) => void;
  currentUserId?: string | null;
}

export function WargaOnboardingModal({
  komunitas,
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
}: WargaOnboardingModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [berdomisili, setBerdomisili] = useState<boolean>(true);
  const [kkTerdaftar, setKkTerdaftar] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Kalkulasi peran teridentifikasi sesuai pilihan user:
  // - Ya Domisili + Ya KK -> "Penduduk"
  // - Ya Domisili + Tidak KK -> "Pendatang"
  // - Tidak Domisili + Tidak KK -> "Pengunjung"
  // - Tidak Domisili + Ya KK -> "Penduduk Domisili Diluar"
  let identifiedRole = "Pengunjung";
  let roleColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  let roleExplanation =
    "Anda teridentifikasi sebagai Pengunjung. Anda akan langsung masuk ke halaman komunitas dengan status Pengunjung.";

  if (berdomisili && kkTerdaftar) {
    identifiedRole = "Penduduk";
    roleColor = "text-emerald-400 border-emerald-500/40 bg-emerald-500/15";
    roleExplanation =
      "Anda teridentifikasi sebagai Penduduk. Anda langsung masuk dengan status Pengunjung, status Penduduk akan aktif setelah persetujuan Admin.";
  } else if (berdomisili && !kkTerdaftar) {
    identifiedRole = "Pendatang";
    roleColor = "text-amber-400 border-amber-500/40 bg-amber-500/15";
    roleExplanation =
      "Anda teridentifikasi sebagai Pendatang. Anda langsung masuk dengan status Pengunjung, status Pendatang akan aktif setelah persetujuan Admin.";
  } else if (!berdomisili && kkTerdaftar) {
    identifiedRole = "Penduduk Domisili Diluar";
    roleColor = "text-cyan-400 border-cyan-500/40 bg-cyan-500/15";
    roleExplanation =
      "Anda teridentifikasi sebagai Penduduk Domisili Diluar. Anda langsung masuk dengan status Pengunjung, status ini akan aktif setelah persetujuan Admin.";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      // Jika pengunjung belum login, arahkan ke login dengan redirect kembali
      router.push(`/login?redirectTo=/komunitas/${komunitas.id}`);
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await joinKomunitasWargaWithSurvey({
        komunitasId: komunitas.id,
        nama: komunitas.nama,
        kecamatan: komunitas.kecamatan,
        kelurahan: komunitas.kelurahan,
        rw: komunitas.rw,
        rt: komunitas.rt,
        lokasi: komunitas.lokasi,
        deskripsi: komunitas.deskripsi,
        berdomisili,
        kkTerdaftar,
      });

      if (res.success) {
        onSuccess(res.membership, res.peranDiajukan);
        onClose();
      } else {
        setErrorMessage(res.message || "Gagal bergabung ke komunitas.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border text-center space-y-2 shrink-0 bg-card">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SELAMAT BERGABUNG</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Komunitas Warga Kita
          </h2>

          {/* Kotak Info Komunitas yang Dipilih */}
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Anda Memilih Komunitas:
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-medium">
                OTOMATIS BERJENJANG
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {komunitas.nama}
                </h3>
                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  <span>
                    {komunitas.kelurahan || "Tegal"}, {komunitas.kecamatan || "Kota Tegal"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-300 font-mono">
              💡 Cukup bergabung di RT ini, Anda otomatis terhubung ke RW, Kelurahan, &amp; Kecamatan di atasnya.
            </div>
          </div>
        </div>

        {/* Form Pertanyaan Domisili & KK */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Pertanyaan 1: Domisili */}
          <div className="rounded-lg border border-border bg-background/50 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-cyan-400" />
              <label className="text-xs font-semibold text-foreground">
                Apakah Anda Berdomisili disini?
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBerdomisili(true)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border py-2 px-3 text-xs font-mono font-medium transition-all cursor-pointer",
                  berdomisili
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <CheckCircle2 className={cn("h-3.5 w-3.5", berdomisili ? "text-emerald-400" : "text-muted-foreground")} />
                <span>Ya, Domisili Disini</span>
              </button>

              <button
                type="button"
                onClick={() => setBerdomisili(false)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border py-2 px-3 text-xs font-mono font-medium transition-all cursor-pointer",
                  !berdomisili
                    ? "border-amber-500 bg-amber-500/15 text-amber-400 font-bold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <XCircle className={cn("h-3.5 w-3.5", !berdomisili ? "text-amber-400" : "text-muted-foreground")} />
                <span>Tidak</span>
              </button>
            </div>
          </div>

          {/* Pertanyaan 2: Kartu Keluarga */}
          <div className="rounded-lg border border-border bg-background/50 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <label className="text-xs font-semibold text-foreground">
                Apakah Kartu Keluarga Anda terdaftar disini?
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKkTerdaftar(true)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border py-2 px-3 text-xs font-mono font-medium transition-all cursor-pointer",
                  kkTerdaftar
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <CheckCircle2 className={cn("h-3.5 w-3.5", kkTerdaftar ? "text-emerald-400" : "text-muted-foreground")} />
                <span>Ya, KK Terdaftar</span>
              </button>

              <button
                type="button"
                onClick={() => setKkTerdaftar(false)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border py-2 px-3 text-xs font-mono font-medium transition-all cursor-pointer",
                  !kkTerdaftar
                    ? "border-amber-500 bg-amber-500/15 text-amber-400 font-bold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <XCircle className={cn("h-3.5 w-3.5", !kkTerdaftar ? "text-amber-400" : "text-muted-foreground")} />
                <span>Tidak</span>
              </button>
            </div>
          </div>

          {/* Hasil Identifikasi Real-time */}
          <div className="rounded-lg border border-border/80 bg-zinc-950/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Identifikasi Status:
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold border",
                  roleColor
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>{identifiedRole.toUpperCase()}</span>
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {roleExplanation}
            </p>
          </div>

          {/* Pesan Error jika ada */}
          {errorMessage && (
            <p className="text-xs text-destructive font-mono text-center">
              {errorMessage}
            </p>
          )}

          {/* Tombol Aksi: Masuk Komunitas */}
          <div className="space-y-2 pt-2 pb-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-xs sm:text-sm font-mono font-bold text-white shadow-md transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyiapkan Komunitas...</span>
                </>
              ) : (
                <>
                  <span>Masuk Komunitas</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <Link
              href="/komunitas?tab=warga_kita"
              className="flex h-9 w-full items-center justify-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Pilih Komunitas Warga Lainnya
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
