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
  ShieldCheck,
  Check,
  X,
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

  const [kkChoice, setKkChoice] = useState<"kota_tegal" | "luar_kota_tegal">("kota_tegal");
  const [domisiliChoice, setDomisiliChoice] = useState<"kota_tegal" | "luar_kota_tegal">("kota_tegal");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Kalkulasi peran teridentifikasi sesuai pilihan user:
  // 1. KK Kota Tegal & Domisili Kota Tegal -> Penduduk
  // 2. KK Kota Tegal & Domisili Luar Kota Tegal -> Penduduk Domisili Di Luar
  // 3. KK Luar Kota Tegal & Domisili Kota Tegal -> Pendatang
  // 4. KK Luar Kota Tegal & Domisili Luar Kota Tegal -> Pengunjung
  let identifiedRole = "Pengunjung";
  let roleColor = "text-slate-800 border-slate-300 bg-slate-100";
  let roleExplanation =
    "Anda teridentifikasi sebagai Pengunjung. Hak Akses Anda di Profil Data dibatasi hanya untuk melihat visualisasi Grafik dan Chart agregat.";

  if (kkChoice === "kota_tegal" && domisiliChoice === "kota_tegal") {
    identifiedRole = "Penduduk";
    roleColor = "text-emerald-900 border-emerald-300 bg-emerald-50";
    roleExplanation =
      "Anda teridentifikasi sebagai Penduduk. Anda memiliki Hak Akses Penuh ke seluruh unsur di Profil Data (Data Anak, Data ATS, penambahan/validasi data, dan informasi wilayah).";
  } else if (kkChoice === "kota_tegal" && domisiliChoice === "luar_kota_tegal") {
    identifiedRole = "Penduduk Domisili Di Luar";
    roleColor = "text-blue-900 border-blue-300 bg-blue-50";
    roleExplanation =
      "Anda teridentifikasi sebagai Penduduk Domisili Di Luar. Anda memiliki Hak Akses Penuh ke seluruh unsur di Profil Data (Data Anak, Data ATS, penambahan/validasi data, dan informasi wilayah).";
  } else if (kkChoice === "luar_kota_tegal" && domisiliChoice === "kota_tegal") {
    identifiedRole = "Pendatang";
    roleColor = "text-amber-900 border-amber-300 bg-amber-50";
    roleExplanation =
      "Anda teridentifikasi sebagai Pendatang. Hak Akses Anda di Profil Data dibatasi hanya untuk melihat visualisasi Grafik dan Chart statistik agregat.";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
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
        berdomisili: domisiliChoice === "kota_tegal",
        kkTerdaftar: kkChoice === "kota_tegal",
        peran: identifiedRole,
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 pb-4 border-b-2 border-slate-100 text-center space-y-3 shrink-0 bg-white">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            <Sparkles className="h-4 w-4 text-blue-700" />
            <span>SELAMAT BERGABUNG</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Komunitas Warga Kita
          </h2>

          {/* Kotak Info Komunitas yang Dipilih */}
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Komunitas Dipilih:
              </span>
              <span className="text-xs font-bold text-blue-700">
                OTOMATIS BERJENJANG
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {komunitas.nama}
                </h3>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    {komunitas.kelurahan || "Tegal"}, {komunitas.kecamatan || "Kota Tegal"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900">
              💡 Cukup bergabung di RT ini, Anda otomatis terhubung ke RW, Kelurahan, &amp; Kecamatan di atasnya.
            </div>
          </div>
        </div>

        {/* Form Pertanyaan Alamat KK & Domisili */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 pb-12 overflow-y-auto flex-1 space-y-5 overscroll-contain bg-slate-50/50">
          {/* Pertanyaan 1: Alamat Sesuai KK */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-700" />
              <label className="text-base font-bold text-slate-900">
                Alamat Sesuai KK (Kartu Keluarga)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setKkChoice("kota_tegal")}
                className={cn(
                  "flex min-h-[48px] items-center justify-between rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all cursor-pointer",
                  kkChoice === "kota_tegal"
                    ? "border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    kkChoice === "kota_tegal"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {kkChoice === "kota_tegal" && <Check className="h-3 w-3 stroke-[3px]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setKkChoice("luar_kota_tegal")}
                className={cn(
                  "flex min-h-[48px] items-center justify-between rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all cursor-pointer",
                  kkChoice === "luar_kota_tegal"
                    ? "border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>Luar Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    kkChoice === "luar_kota_tegal"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {kkChoice === "luar_kota_tegal" && <Check className="h-3 w-3 stroke-[3px]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Pertanyaan 2: Alamat Domisili */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-700" />
              <label className="text-base font-bold text-slate-900">
                Alamat Domisili (Tempat Tinggal)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDomisiliChoice("kota_tegal")}
                className={cn(
                  "flex min-h-[48px] items-center justify-between rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all cursor-pointer",
                  domisiliChoice === "kota_tegal"
                    ? "border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    domisiliChoice === "kota_tegal"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {domisiliChoice === "kota_tegal" && <Check className="h-3 w-3 stroke-[3px]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDomisiliChoice("luar_kota_tegal")}
                className={cn(
                  "flex min-h-[48px] items-center justify-between rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all cursor-pointer",
                  domisiliChoice === "luar_kota_tegal"
                    ? "border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>Luar Kota Tegal</span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    domisiliChoice === "luar_kota_tegal"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {domisiliChoice === "luar_kota_tegal" && <Check className="h-3 w-3 stroke-[3px]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Hasil Identifikasi Real-time & Hak Akses */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Status Teridentifikasi:
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold border-2",
                  roleColor
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{identifiedRole.toUpperCase()}</span>
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {roleExplanation}
            </p>
          </div>

          {/* Pesan Error jika ada */}
          {errorMessage && (
            <p className="text-sm font-bold text-rose-700 bg-rose-50 p-3 rounded-xl border-2 border-rose-200 text-center">
              {errorMessage}
            </p>
          )}

          {/* Tombol Aksi: Masuk Komunitas */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex min-h-[50px] h-13 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Menyiapkan Komunitas...</span>
                </>
              ) : (
                <>
                  <span>Masuk Komunitas</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <Link
              href="/komunitas?tab=warga_kita"
              className="flex min-h-[44px] h-11 w-full items-center justify-center text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Pilih Komunitas Warga Lainnya
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
