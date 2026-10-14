"use client";

import { useState, useTransition } from "react";
import {
  X,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  HeartPulse,
  Users,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  requestPerubahanPeran,
  cancelPerubahanPeran,
} from "@/app/actions/komunitas";
import type { KomunitasWithMembership } from "@/types/database";
import { cn, formatPeranDisplay } from "@/lib/utils";

interface RoleOptionItem {
  role: string;
  description: string;
  badge?: string;
}

const ROLE_OPTIONS_BY_TYPE: Record<string, RoleOptionItem[]> = {
  satuan_paud: [
    {
      role: "Guru PAUD",
      description: "Pendidik atau guru aktif di Satuan PAUD / TK / KB ini",
      badge: "Pendidik",
    },
    {
      role: "Kepala Sekolah",
      description: "Kepala satuan pendidikan / pimpinan pengelola PAUD",
      badge: "Pimpinan",
    },
    {
      role: "Komite",
      description: "Pengurus komite sekolah / perwakilan paguyuban orang tua",
      badge: "Komite",
    },
    {
      role: "Orangtua/Wali Murid",
      description: "Orang tua atau wali anak didik yang terdaftar di PAUD ini",
      badge: "Wali Murid",
    },
    {
      role: "Alumni",
      description: "Keluarga alumni atau mantan peserta didik PAUD ini",
      badge: "Alumni",
    },
    {
      role: "Pengunjung",
      description: "Masyarakat umum yang memantau informasi dan kabar PAUD",
      badge: "Umum",
    },
  ],
  posyandu: [
    {
      role: "Kader",
      description: "Kader Posyandu aktif pelaksana kegiatan 6 Bidang SPM",
      badge: "Kader Posyandu",
    },
    {
      role: "Tenaga Kesehatan",
      description: "Bidan desa, perawat, atau tenaga kesehatan Puskesmas",
      badge: "Nakes",
    },
    {
      role: "Tenaga Medis",
      description: "Dokter atau praktisi medis pendukung layanan Posyandu",
      badge: "Medis",
    },
    {
      role: "PLKB",
      description: "Petugas Lapangan Keluarga Berencana / Penyuluh KB",
      badge: "PLKB",
    },
    {
      role: "PKK",
      description: "Pengurus atau anggota Tim Penggerak PKK setempat",
      badge: "PKK",
    },
    {
      role: "Pengunjung",
      description: "Warga masyarakat atau orang tua balita pengunjung umum",
      badge: "Umum",
    },
  ],
  warga_kita: [
    {
      role: "Penduduk",
      description: "Warga ber-KTP atau berdomisili di wilayah ini",
      badge: "Penduduk",
    },
    {
      role: "Pendatang",
      description: "Warga domisili tetapi ber-KTP luar wilayah",
      badge: "Pendatang",
    },
    {
      role: "Pengurus",
      description: "Pengurus RT / RW / Kelurahan setempat",
      badge: "Pengurus",
    },
    {
      role: "Pengunjung",
      description: "Warga luar wilayah yang memantau informasi",
      badge: "Umum",
    },
  ],
};

interface AjukanPerubahanPeranModalProps {
  komunitas: KomunitasWithMembership;
  currentPeran: string;
  currentPeranDiajukan?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPeranDiajukan: string | null) => void;
}

export function AjukanPerubahanPeranModal({
  komunitas,
  currentPeran,
  currentPeranDiajukan,
  isOpen,
  onClose,
  onSuccess,
}: AjukanPerubahanPeranModalProps) {
  const roleList =
    ROLE_OPTIONS_BY_TYPE[komunitas.jenis] || [
      { role: "Anggota", description: "Anggota komunitas biasa", badge: "Anggota" },
      { role: "Kader", description: "Kader pelaksana kegiatan", badge: "Kader" },
      { role: "Pengurus", description: "Pengurus komunitas", badge: "Pengurus" },
    ];

  // Default target role: peran_diajukan sebelumnya atau opsi pertama yang bukan peran saat ini
  const initialTargetRole =
    currentPeranDiajukan ||
    roleList.find((r) => r.role.toLowerCase() !== currentPeran.toLowerCase())?.role ||
    roleList[0]?.role ||
    "Anggota";

  const [selectedRole, setSelectedRole] = useState(initialTargetRole);
  const [catatan, setCatatan] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [isCanceling, startCancel] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (selectedRole.toLowerCase() === currentPeran.toLowerCase()) {
      setFeedback({
        type: "error",
        message: `Anda sudah berstatus sebagai ${formatPeranDisplay(currentPeran)}. Pilih peran lain yang ingin Anda ajukan.`,
      });
      return;
    }

    startSubmit(async () => {
      const res = await requestPerubahanPeran({
        komunitasId: komunitas.id,
        peranBaru: selectedRole,
        catatan: catatan.trim() || undefined,
      });

      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => {
          onSuccess?.(selectedRole);
          onClose();
        }, 1500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  const handleCancelRequest = () => {
    setFeedback(null);
    startCancel(async () => {
      const res = await cancelPerubahanPeran({ komunitasId: komunitas.id });
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => {
          onSuccess?.(null);
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && !isCanceling && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border-2 border-blue-200">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Ajukan Perubahan Peran
                </h3>
                <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  VERIFIKASI ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold line-clamp-1">
                {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && !isCanceling && onClose()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-slate-50/50 text-sm">
            {/* Feedback Alerts */}
            {feedback && (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-3.5 text-xs font-bold animate-in fade-in",
                  feedback.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-rose-300 bg-rose-50 text-rose-900"
                )}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Status Peran Saat Ini */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                STATUS KEANGGOTAAN ANDA
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Peran Saat Ini:
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 border border-slate-200">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{formatPeranDisplay(currentPeran)}</span>
                  </span>
                </div>

                {currentPeranDiajukan && currentPeranDiajukan.toLowerCase() !== currentPeran.toLowerCase() && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                    <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                    <span>Diajukan: {formatPeranDisplay(currentPeranDiajukan)}</span>
                  </span>
                )}
              </div>

              {currentPeranDiajukan && currentPeranDiajukan.toLowerCase() !== currentPeran.toLowerCase() && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <p className="text-xs text-amber-800 font-medium">
                    Pengajuan peran sebelumnya sedang menunggu verifikasi Admin.
                  </p>
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={isCanceling || isSubmitting}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isCanceling ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    <span>Batalkan Pengajuan</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pilihan Peran Baru */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Pilih Peran Baru yang Diajukan</span>
                <span className="text-slate-400 font-normal">Pilih salah satu</span>
              </label>

              <div className="space-y-2">
                {roleList.map((item) => {
                  const isCurrentRole = item.role.toLowerCase() === currentPeran.toLowerCase();
                  const isSelected = selectedRole === item.role;

                  return (
                    <div
                      key={item.role}
                      onClick={() => !isCurrentRole && setSelectedRole(item.role)}
                      className={cn(
                        "rounded-2xl border-2 p-3.5 transition-all cursor-pointer flex items-start justify-between gap-3 shadow-2xs",
                        isCurrentRole &&
                          "border-slate-200 bg-slate-100/60 opacity-60 cursor-not-allowed",
                        isSelected && !isCurrentRole &&
                          "border-blue-600 bg-blue-50/50 shadow-xs",
                        !isSelected && !isCurrentRole &&
                          "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80"
                      )}
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={cn(
                              "text-sm font-bold",
                              isSelected ? "text-blue-950" : "text-slate-900"
                            )}
                          >
                            {item.role}
                          </h4>
                          {item.badge && (
                            <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {item.badge}
                            </span>
                          )}
                          {isCurrentRole && (
                            <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Peran Saat Ini
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected && !isCurrentRole
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          )}
                        >
                          {isSelected && !isCurrentRole && (
                            <Check className="h-3 w-3 stroke-[3px]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catatan / Keterangan Opsional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Catatan / Alasan Pengajuan (Opsional)
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Saya adalah guru aktif kelas B di PAUD ini sejak tahun 2024..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-xs leading-relaxed focus:border-blue-600 focus:outline-none"
              />
              <p className="text-2xs text-slate-500">
                Informasi ini akan dilihat oleh Admin / Pengurus komunitas saat memverifikasi pengajuan Anda.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t-2 border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isCanceling}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isCanceling ||
                selectedRole.toLowerCase() === currentPeran.toLowerCase()
              }
              className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim Pengajuan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-blue-200" />
                  <span>Kirim Pengajuan ke Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
