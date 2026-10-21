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
import { cn, formatPeranDisplay, isRoleAdmin } from "@/lib/utils";

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
  pkbm_skb: [
    {
      role: "Tutor / Instruktur",
      description: "Tenaga pendidik / tutor pembelajaran kesetaraan Paket A/B/C dan vokasi",
      badge: "Pendidik",
    },
    {
      role: "Pamong Belajar",
      description: "Pamong belajar atau tenaga fungsional pengembang kurikulum nonformal",
      badge: "Pamong",
    },
    {
      role: "Kepala PKBM / SKB",
      description: "Pimpinan atau pengelola resmi lembaga PKBM / SKB",
      badge: "Pimpinan",
    },
    {
      role: "Warga Belajar",
      description: "Peserta didik aktif program pendidikan kesetaraan atau kursus keterampilan",
      badge: "Siswa",
    },
    {
      role: "Komite",
      description: "Pengurus komite / dewan pendidikan nonformal satuan ini",
      badge: "Komite",
    },
    {
      role: "Orangtua/Wali Murid",
      description: "Orang tua atau wali warga belajar yang terdaftar",
      badge: "Wali Murid",
    },
    {
      role: "Alumni",
      description: "Alumni lulusan Paket A, B, C, atau program kejuruan PKBM/SKB ini",
      badge: "Alumni",
    },
    {
      role: "Pengunjung",
      description: "Masyarakat umum yang memantau informasi pendidikan kesetaraan",
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

  const availableRoles = roleList.filter((r) => {
    if (r.role.toLowerCase() === currentPeran.toLowerCase()) return false;
    if (isRoleAdmin(r.role) && Boolean(komunitas.hasAdmin)) return false;
    return true;
  });

  // Default target role: peran_diajukan sebelumnya atau opsi pertama yang bukan peran saat ini
  const initialTargetRole =
    (currentPeranDiajukan && availableRoles.some((r) => r.role.toLowerCase() === currentPeranDiajukan.toLowerCase())
      ? currentPeranDiajukan
      : null) ||
    availableRoles[0]?.role ||
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
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && !isCanceling && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-lg sm:rounded-lg border border-border bg-card shadow-xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 pb-3.5 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground leading-tight">
                  Ajukan Perubahan Peran
                </h3>
                <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  VERIFIKASI ADMIN
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
                {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && !isCanceling && onClose()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-muted/20 text-sm">
            {/* Feedback Alerts */}
            {feedback && (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-xs font-semibold animate-in fade-in",
                  feedback.type === "success"
                    ? "border-emerald-500/20 bg-emerald-50 text-emerald-900"
                    : "border-rose-500/20 bg-rose-50 text-rose-900"
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
            <div className="rounded-lg border border-border bg-card p-3.5 space-y-2 shadow-2xs">
              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground block">
                STATUS KEANGGOTAAN ANDA
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Peran Saat Ini:
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-foreground border border-border">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span>{formatPeranDisplay(currentPeran)}</span>
                  </span>
                </div>

                {currentPeranDiajukan && currentPeranDiajukan.toLowerCase() !== currentPeran.toLowerCase() && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-bold text-secondary border border-secondary/30">
                    <Clock className="h-3.5 w-3.5 text-secondary animate-pulse" />
                    <span>Diajukan: {formatPeranDisplay(currentPeranDiajukan)}</span>
                  </span>
                )}
              </div>

              {currentPeranDiajukan && currentPeranDiajukan.toLowerCase() !== currentPeran.toLowerCase() && (
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <p className="text-xs text-amber-700 font-medium">
                    Pengajuan peran sebelumnya sedang menunggu verifikasi Admin.
                  </p>
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={isCanceling || isSubmitting}
                    className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline shrink-0 cursor-pointer disabled:opacity-50"
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
              <label className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>Pilih Peran Baru yang Diajukan</span>
                <span className="text-muted-foreground font-normal">Pilih salah satu</span>
              </label>

              <div className="space-y-2">
                {roleList.map((item) => {
                  const isCurrentRole = item.role.toLowerCase() === currentPeran.toLowerCase();
                  const isAdminRole = isRoleAdmin(item.role);
                  const isOccupiedAdmin = isAdminRole && Boolean(komunitas.hasAdmin) && !isCurrentRole;
                  const isSelected = selectedRole === item.role;
                  const isDisabled = isCurrentRole || isOccupiedAdmin;

                  return (
                    <div
                      key={item.role}
                      onClick={() => !isDisabled && setSelectedRole(item.role)}
                      className={cn(
                        "rounded-lg border p-3 transition-all flex items-start justify-between gap-3 shadow-2xs",
                        isDisabled
                          ? "border-border bg-muted/40 opacity-60 cursor-not-allowed"
                          : "cursor-pointer",
                        isSelected && !isDisabled &&
                          "border-primary bg-primary/5 shadow-2xs",
                        !isSelected && !isDisabled &&
                          "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={cn(
                              "text-xs sm:text-sm font-bold",
                              isSelected && !isDisabled ? "text-primary" : "text-foreground"
                            )}
                          >
                            {item.role}
                          </h4>
                          {item.badge && (
                            <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                              {item.badge}
                            </span>
                          )}
                          {isCurrentRole && (
                            <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              Peran Saat Ini
                            </span>
                          )}
                          {isOccupiedAdmin && (
                            <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30">
                              Admin Sudah Terdaftar
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                          {isOccupiedAdmin
                            ? "Posisi Admin / Pengurus untuk komunitas ini sudah terisi dan aktif."
                            : item.description}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                            isSelected && !isDisabled
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background"
                          )}
                        >
                          {isSelected && !isDisabled && (
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
              <label className="text-xs font-bold text-foreground block">
                Catatan / Alasan Pengajuan (Opsional)
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Saya adalah guru aktif kelas B di PAUD ini sejak tahun 2024..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs leading-relaxed focus:border-primary focus:outline-none"
              />
              <p className="text-2xs text-muted-foreground">
                Informasi ini akan dilihat oleh Admin / Pengurus komunitas saat memverifikasi pengajuan Anda.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 sm:p-4 border-t border-border bg-card flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isCanceling}
              className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-foreground font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
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
              className="inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-5 text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-primary-foreground/80" />
                  <span>Kirim Pengajuan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
