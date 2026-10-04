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
    "Pengurus",
    "Admin Kelurahan",
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
    "Admin",
    "Kepala Sekolah",
    "Guru PAUD",
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Minta Bergabung
              </h3>
              <p className="text-sm font-medium text-slate-600 line-clamp-1">
                {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 pb-12 overflow-y-auto flex-1 space-y-5 overscroll-contain bg-slate-50/50">
          {/* Success Alert */}
          {successMessage && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 animate-in fade-in">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <label className="text-base font-bold text-slate-900 block leading-snug">
                  Pilih Peran yang Diajukan
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {availableRoles.map((role) => {
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "flex min-h-[52px] items-center justify-between rounded-xl border-2 p-3.5 text-base font-bold transition-all active:scale-98 text-left cursor-pointer",
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <ShieldCheck
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isSelected ? "text-blue-700" : "text-slate-400"
                            )}
                          />
                          <span>{role}</span>
                        </div>

                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2",
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                * Permohonan peran Anda akan diverifikasi oleh Pengurus / Kader aktif komunitas terkait sebelum status Anda dikonfirmasi.
              </p>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full min-h-[50px] h-13 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Mengirim Permohonan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
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
