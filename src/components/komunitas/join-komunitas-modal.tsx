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
    "Orangtua/Wali",
    "Tenaga Pendidik",
    "Tenaga Kependidikan",
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Minta Bergabung
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role Form */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pilih Peran yang Diajukan
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-0.5">
                {availableRoles.map((role) => {
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "flex min-h-[48px] items-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition-all active:scale-95 text-left",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary"
                          : "border-border text-foreground hover:bg-muted"
                      )}
                    >
                      <ShieldCheck
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "text-primary" : "text-muted-foreground"
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
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengirim Permohonan...</span>
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
  );
}
