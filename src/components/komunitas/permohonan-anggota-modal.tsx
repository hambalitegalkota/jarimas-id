"use client";

import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  User,
} from "lucide-react";
import type { AnggotaKomunitasDetail } from "@/types/database";
import { formatPeranDisplay, cn } from "@/lib/utils";

interface PermohonanAnggotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingMembers: AnggotaKomunitasDetail[];
  onApprove: (member: AnggotaKomunitasDetail) => Promise<void>;
  onReject: (member: AnggotaKomunitasDetail) => Promise<void>;
  processingId: string | null;
  komunitasNama?: string;
  onOpenChat: (userId: string) => void;
}

export function PermohonanAnggotaModal({
  isOpen,
  onClose,
  pendingMembers,
  onApprove,
  onReject,
  processingId,
  komunitasNama,
  onOpenChat,
}: PermohonanAnggotaModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 pb-3.5 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-2xs">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                  Permohonan Anggota Baru
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-white shadow-2xs">
                  {pendingMembers.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {komunitasNama ? `Verifikasi permohonan di ${komunitasNama}` : "Verifikasi pendaftaran dan perubahan peran"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="Tutup dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 overscroll-contain bg-card">
          {pendingMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center space-y-3.5 my-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6 stroke-[2px]" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-foreground">
                  Tidak Ada Permohonan Tertunda
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Semua permohonan bergabung atau perubahan peran pada komunitas ini telah selesai diverifikasi.
                </p>
              </div>
            </div>
          ) : (
            pendingMembers.map((member) => {
              const name = member.profiles?.nama_lengkap || "Pemohon";
              const email = member.profiles?.email || "-";
              const hp = member.profiles?.nomor_hp;
              const initial = name.charAt(0).toUpperCase();
              const isProcessing = processingId === member.id;
              const roleTarget = member.peran_diajukan || member.peran;

              return (
                <div
                  key={member.id}
                  className="rounded-xl border border-border bg-card hover:border-amber-500/30 p-4 space-y-3 shadow-2xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-sm shadow-2xs">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onOpenChat(member.user_id)}
                          className="text-sm font-bold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors text-left truncate cursor-pointer block leading-snug"
                          title={`Mulai Chat dengan ${name}`}
                        >
                          {name}
                        </button>
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          {email}
                        </p>
                        {hp && (
                          <p className="text-2xs text-muted-foreground font-mono">
                            WA: {hp}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-950 dark:text-amber-200 border border-amber-500/30">
                        Diajukan: {formatPeranDisplay(roleTarget)}
                      </span>
                      {member.peran_diajukan && (
                        <span className="text-[10px] text-muted-foreground">
                          Peran saat ini: {member.peran}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2.5 border-t border-border">
                    <button
                      type="button"
                      onClick={() => onOpenChat(member.user_id)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-200 px-3 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                      title={`Kirim Pesan / Chat dengan ${name}`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onApprove(member)}
                      disabled={isProcessing}
                      className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-98"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Setujui</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onReject(member)}
                      disabled={isProcessing}
                      className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-500/40 bg-card hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Tolak</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-3.5 sm:p-4 border-t border-border bg-muted/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center px-4 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

