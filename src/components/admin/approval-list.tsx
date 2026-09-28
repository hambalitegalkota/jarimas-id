"use client";

import { useState, useTransition } from "react";
import {
  Check,
  X,
  Clock,
  User,
  Building2,
  MapPin,
  Shield,
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
          message: `Permohonan peran untuk ${name} berhasil disetujui.`,
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
          className={`flex items-center gap-3 rounded-md border p-3 text-xs font-medium transition-all ${
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono"
              : "border-destructive/40 bg-destructive/10 text-destructive font-mono"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-mono underline opacity-70 hover:opacity-100"
          >
            [Tutup]
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            Permohonan Peran Komunitas
          </h3>
        </div>
        <span className="cyber-badge font-mono text-[11px]">
          {approvals.length} PENDING
        </span>
      </div>

      {/* List / Empty State */}
      {approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/60 p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground mb-3">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
          <h4 className="font-semibold text-foreground text-sm">
            Semua Permohonan Selesai
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs font-mono">
            Tidak ada permohonan peran pengurus atau kader yang pending.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((item) => {
            const userName = item.profiles?.nama_lengkap || "Pengguna Tanpa Nama";
            const userEmail = item.profiles?.email || "-";
            const komunitasNama = item.komunitas?.nama || "Komunitas Umum";
            const komunitasJenis = item.komunitas?.jenis || "Posyandu";
            const komunitasLokasi = item.komunitas?.lokasi || "Kota Tegal";
            const isProcessing = loadingId === item.id && isPending;

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-zinc-700"
              >
                {/* Header User & Role */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-foreground font-mono text-xs">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground leading-snug">
                        {userName}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">{userEmail}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-mono font-medium text-foreground shrink-0">
                    <Shield className="h-3 w-3 text-emerald-400" />
                    {item.peran}
                  </span>
                </div>

                {/* Komunitas Info Box */}
                <div className="rounded border border-border/80 bg-background/50 p-2.5 text-xs space-y-1 mb-3 font-mono">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {komunitasNama}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({komunitasJenis})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{komunitasLokasi}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(item.id, userName)}
                    disabled={isProcessing}
                    className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Setujui</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(item.id, userName)}
                    disabled={isProcessing}
                    className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50 font-mono"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <X className="h-3.5 w-3.5" />
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

export default ApprovalList;
