"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  LogOut,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  School,
  HeartCrack,
  Check,
  Baby,
} from "lucide-react";
import { keluarDataAnak } from "@/app/actions/data-anak";
import type { DataAnakItem } from "@/types/database";
import { cn } from "@/lib/utils";

export const ALASAN_KELUAR_PAUD_OPTIONS = [
  {
    id: "Melanjutkan Ke SD",
    label: "Melanjutkan Ke SD",
    desc: "Lulus dari PAUD dan naik jenjang ke Sekolah Dasar (SD / MI)",
    badge: "Lulus PAUD",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    icon: GraduationCap,
  },
  {
    id: "Pindah PAUD Lain",
    label: "Pindah PAUD Lain",
    desc: "Mutasi / pindah belajar ke satuan PAUD atau TK lain",
    badge: "Mutasi",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
    icon: School,
  },
  {
    id: "Tidak Sekolah",
    label: "Tidak Sekolah",
    desc: "Berhenti atau putus sekolah (potensi Anak Tidak Sekolah)",
    badge: "Putus Sekolah",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    icon: AlertTriangle,
  },
  {
    id: "Meninggal Dunia",
    label: "Meninggal Dunia",
    desc: "Peserta didik meninggal dunia",
    badge: "Duka Cita",
    badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    icon: HeartCrack,
  },
] as const;

interface ModalKeluarDataAnakProps {
  isOpen: boolean;
  anak: DataAnakItem;
  komunitasId: string;
  komunitasNama?: string;
  onClose: () => void;
  onSuccess: (deletedChildId: string) => void;
}

export function ModalKeluarDataAnak({
  isOpen,
  anak,
  komunitasId,
  komunitasNama = "Satuan PAUD",
  onClose,
  onSuccess,
}: ModalKeluarDataAnakProps) {
  const [isPending, startTransition] = useTransition();
  const [alasanKeluar, setAlasanKeluar] = useState<string>(
    ALASAN_KELUAR_PAUD_OPTIONS[0].id
  );
  const [catatan, setCatatan] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleKeluar = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await keluarDataAnak(anak.id, komunitasId, {
        alasanKeluar,
        catatan,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setTimeout(() => {
          onSuccess(anak.id);
          onClose();
        }, 800);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal mencatat anak keluar.",
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Pencatatan Keluar Anak
              </h3>
              <p className="text-sm font-medium text-slate-500 line-clamp-1">
                {komunitasNama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleKeluar}
          className="p-4 sm:p-6 pb-10 overflow-y-auto flex-1 space-y-5 overscroll-contain bg-slate-50/50"
        >
          {/* Toast Feedback */}
          {feedback && (
            <div
              className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-bold shadow-xs animate-in fade-in ${
                feedback.type === "success"
                  ? "border-2 border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-2 border-rose-300 bg-rose-50 text-rose-900"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Child Identity Card */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Baby className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {anak.nama_lengkap}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate">
                  Orang Tua / Wali: {anak.nama_orangtua || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Exit Reason Options (High-Contrast Cards) */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-900 block">
              Pilih Alasan Keluar dari PAUD <span className="text-rose-600">*</span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {ALASAN_KELUAR_PAUD_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = alasanKeluar === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAlasanKeluar(opt.id)}
                    className={cn(
                      "flex items-start justify-between rounded-2xl border-2 p-3.5 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-rose-500 bg-rose-50/70 text-slate-900 shadow-xs ring-2 ring-rose-500/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 mt-0.5",
                          isSelected
                            ? "border-rose-400 bg-rose-100 text-rose-800"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {opt.label}
                          </span>
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[11px] font-bold border",
                              opt.badgeColor
                            )}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ml-2 mt-1",
                        isSelected
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-900 block">
              Catatan / Sekolah Baru (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Diterima di SDN 1 Tegal / Pindah ke TK Pertiwi"
              className="w-full min-h-[46px] h-11 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-600 focus:outline-hidden"
            />
          </div>

          {/* Warning Notice */}
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3.5 text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Perhatian:</strong> Peserta didik akan dicatat keluar dari daftar siswa aktif di <strong>{komunitasNama}</strong>.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-[46px] h-11 px-5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-100 text-sm font-bold text-slate-700 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex min-h-[46px] h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white px-6 text-sm font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Konfirmasi Catat Keluar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
