"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  MapPin,
  ShieldAlert,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { approveMemberRole, rejectMemberRole } from "@/app/actions/admin";
import type { PendingApprovalItem } from "@/types/database";

interface ApprovalListProps {
  initialApprovals: PendingApprovalItem[];
}

export function ApprovalList({ initialApprovals }: ApprovalListProps) {
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>(initialApprovals);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string, name: string) => {
    setLoadingId(id);
    setFeedback(null);
    startTransition(async () => {
      const result = await approveMemberRole(id);
      if (result.success) {
        setApprovals((prev) => prev.filter((item) => item.id !== id));
        setFeedback({
          type: "success",
          message: `Permohonan peran untuk ${name} berhasil disetujui!`,
        });
      } else {
        setFeedback({
          type: "error",
          message: result.message,
        });
      }
      setLoadingId(null);
    });
  };

  const handleReject = (id: string, name: string) => {
    setLoadingId(id);
    setFeedback(null);
    startTransition(async () => {
      const result = await rejectMemberRole(id);
      if (result.success) {
        setApprovals((prev) => prev.filter((item) => item.id !== id));
        setFeedback({
          type: "success",
          message: `Permohonan peran untuk ${name} telah ditolak.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: result.message,
        });
      }
      setLoadingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
              : "border border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold text-foreground">
            Permohonan Peran Komunitas
          </h2>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {approvals.length} Menunggu
        </span>
      </div>

      {/* List / Empty State */}
      {approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">
            Semua Permohonan Selesai
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Saat ini tidak ada permohonan peran pengurus atau kader yang berstatus pending.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((item) => {
            const userName = item.profiles?.nama_lengkap || "Pengguna Tanpa Nama";
            const userEmail = item.profiles?.email || "-";
            const komunitasNama = item.komunitas?.nama || "Komunitas Umum";
            const komunitasJenis = item.komunitas?.jenis || "Posyandu";
            const komunitasLokasi = item.komunitas?.lokasi || "Indonesia";
            const isProcessing = loadingId === item.id && isPending;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:shadow-none"
              >
                {/* Header User & Role */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground leading-snug">
                        {userName}
                      </h4>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {item.peran}
                  </span>
                </div>

                {/* Komunitas Info Card */}
                <div className="rounded-xl bg-muted/50 p-3 text-xs space-y-1.5 mb-4 border border-border/50">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>
                      {komunitasNama}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({komunitasJenis})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{komunitasLokasi}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    onClick={() => handleApprove(item.id, userName)}
                    disabled={isProcessing}
                    className="flex flex-1 min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition-all active:scale-95 hover:brightness-105 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Setujui</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(item.id, userName)}
                    disabled={isProcessing}
                    className="flex flex-1 min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-all active:scale-95 hover:bg-destructive/20 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Tolak</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
