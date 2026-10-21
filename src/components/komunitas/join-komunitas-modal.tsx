"use client";

import { useState, useTransition } from "react";
import {
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Check,
} from "lucide-react";
import { requestJoinKomunitas } from "@/app/actions/komunitas";
import type { KomunitasWithMembership } from "@/types/database";
import { cn } from "@/lib/utils";

interface JoinKomunitasModalProps {
  komunitas: KomunitasWithMembership;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS_BY_TYPE: Record<string, string[]> = {
  warga_kita: [
    "Penduduk",
    "Pendatang",
    "Pengunjung",
  ],
  posyandu: [
    "Pengunjung",
    "Kader",
    "Tenaga Medis",
    "Tenaga Kesehatan",
    "PLKB",
    "PKK",
  ],
  satuan_paud: [
    "Guru PAUD",
    "Kepala Sekolah",
    "Orangtua/Wali Murid",
    "Komite",
    "Alumni",
    "Pengunjung",
  ],
  pkbm_skb: [
    "Tutor / Instruktur",
    "Pamong Belajar",
    "Kepala PKBM / SKB",
    "Warga Belajar (Siswa)",
    "Orangtua/Wali Murid",
    "Komite",
    "Alumni",
    "Pengunjung",
  ],
};

export function JoinKomunitasModal({
  komunitas,
  isOpen,
  onClose,
  onSuccess,
}: JoinKomunitasModalProps) {
  const availableRoles =
    ROLE_OPTIONS_BY_TYPE[komunitas.jenis] || [
      "Anggota",
      "Kader",
      "Pengurus",
    ];

  const [selectedRole, setSelectedRole] = useState(availableRoles[0] || "Anggota");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await requestJoinKomunitas({
        komunitasId: komunitas.id,
        peran: selectedRole,
      });

      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-lg sm:rounded-lg border border-border bg-card shadow-xl z-10 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 pb-3 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                Minta Bergabung
              </h3>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
                {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 pb-8 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-card">
          {/* Success Alert */}
          {successMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3.5 text-xs font-bold text-primary animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-bold text-destructive animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-foreground block leading-snug">
                  Pilih Peran yang Diajukan
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {availableRoles.map((role) => {
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "flex min-h-[46px] items-center justify-between rounded-lg border p-3 text-sm font-semibold transition-all active:scale-[0.99] text-left cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-2xs font-bold"
                            : "border-border bg-card text-foreground hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          <span>{role}</span>
                        </div>

                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed bg-secondary/15 p-3.5 rounded-lg border border-secondary/30 text-amber-950 dark:text-amber-200 space-y-1.5">
                {selectedRole === "Pengunjung" ? (
                  <p>
                    * Anda akan langsung bergabung dan aktif di <strong>{komunitas.nama}</strong> dengan peran sebagai <strong>Pengunjung</strong>.
                  </p>
                ) : (
                  <p>
                    * Pengajuan peran sebagai <strong>{selectedRole}</strong> di <strong>{komunitas.nama}</strong> memerlukan persetujuan Admin. Sebelum permohonan disetujui, Anda dapat langsung masuk dan mengakses komunitas dengan peran sebagai <strong>Pengunjung</strong>. Setelah disetujui oleh Admin, peran Anda akan otomatis berubah sesuai ajuan.
                  </p>
                )}
                <p className="text-[11px] font-semibold text-primary pt-1 border-t border-secondary/20 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    Akun Anda juga akan otomatis tergabung di Komunitas Kelurahan, Kecamatan, dan Kota Tegal sesuai wilayah ini.
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-6 text-sm font-bold text-primary-foreground shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim Pengajuan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Kirim Permohonan ({selectedRole})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
