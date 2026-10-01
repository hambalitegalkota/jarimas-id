"use client";

import { useState, useTransition } from "react";
import {
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
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
  warga_kita: ["Penduduk", "Pendatang", "Pengurus"],
  posyandu: [
    "Pengunjung",
    "Kader",
    "Tenaga Medis",
    "Tenaga Kesehatan",
    "PLKB",
    "PKK",
  ],
  satuan_paud: [
    "Orangtua/Wali Murid",
    "Tenaga Pendidik / Tutor",
    "Tenaga Kependidikan",
    "Pengelola PAUD / PKBM / SKB",
    "Kepala Satuan / Pimpinan",
    "Warga Belajar",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-foreground">
              <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                MINTA BERGABUNG
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 pb-10 sm:pb-12 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Success Alert */}
          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-mono">{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-mono">{errorMessage}</span>
            </div>
          )}

          {/* Role Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground block">
                  Pilih Peran yang Diajukan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-0.5">
                  {availableRoles.map((role) => {
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "flex min-h-[44px] items-center gap-2 rounded-md border p-3 text-xs font-mono transition-all active:scale-98 text-left cursor-pointer",
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "border-border text-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <ShieldCheck
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          )}
                        />
                        <span className="truncate">{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                * Permohonan peran Anda akan diverifikasi oleh Pengurus / Kader aktif komunitas terkait sebelum status Anda dikonfirmasi.
              </p>

              {/* Submit Button */}
              <div className="pt-2 pb-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>MENGIRIM PERMOHONAN...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>KIRIM PERMOHONAN ({selectedRole.toUpperCase()})</span>
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
