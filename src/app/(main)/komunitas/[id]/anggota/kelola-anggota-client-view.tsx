"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import {
  approveAnggotaByAdmin,
  rejectAnggotaByAdmin,
} from "@/app/actions/komunitas";
import type { AnggotaKomunitasDetail } from "@/types/database";
import { cn } from "@/lib/utils";

interface KelolaAnggotaClientViewProps {
  komunitasId: string;
  initialMembers: AnggotaKomunitasDetail[];
}

export function KelolaAnggotaClientView({
  komunitasId,
  initialMembers,
}: KelolaAnggotaClientViewProps) {
  const [members, setMembers] = useState<AnggotaKomunitasDetail[]>(initialMembers);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingMembers = members.filter(
    (m) =>
      m.status === "pending" ||
      (Boolean(m.peran_diajukan) &&
        m.peran_diajukan?.toLowerCase() !== m.peran.toLowerCase())
  );
  const approvedMembers = members.filter((m) => m.status === "approved");

  const handleApprove = (id: string, name: string) => {
    setLoadingId(id);
    setFeedback(null);

    startTransition(async () => {
      const res = await approveAnggotaByAdmin(id);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "approved",
                  peran: m.peran_diajukan || m.peran,
                  peran_diajukan: null,
                }
              : m
          )
        );
        setFeedback({
          type: "success",
          message: `Permohonan pendaftaran / verifikasi peran ${name} berhasil disetujui!`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
      setLoadingId(null);
    });
  };

  const handleReject = (id: string, name: string) => {
    setLoadingId(id);
    setFeedback(null);

    startTransition(async () => {
      const res = await rejectAnggotaByAdmin(id);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: "rejected" } : m))
        );
        setFeedback({
          type: "success",
          message: `Permohonan pendaftaran ${name} telah ditolak.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
      setLoadingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-md p-3.5 text-xs font-mono shadow-sm transition-all animate-in fade-in ${
            feedback.type === "success"
              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-[10px] uppercase underline opacity-70 hover:opacity-100 font-mono"
          >
            TUTUP
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex rounded-md bg-muted p-1 border border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-semibold transition-all",
            activeTab === "pending"
              ? "bg-card text-amber-500 dark:text-amber-400 border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>PERMOHONAN BARU ({pendingMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={cn(
            "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md text-xs font-mono font-semibold transition-all",
            activeTab === "approved"
              ? "bg-card text-foreground border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          <span>ANGGOTA AKTIF ({approvedMembers.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "pending" ? (
        <div className="space-y-3 pb-16">
          {pendingMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                <CheckCircle className="h-6 w-6 stroke-[1.5px]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                  TIDAK ADA PERMOHONAN TERTUNDA
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Semua permohonan bergabung pada komunitas ini telah selesai diverifikasi.
                </p>
              </div>
            </div>
          ) : (
            pendingMembers.map((member) => {
              const name = member.profiles?.nama_lengkap || "Pemohon";
              const email = member.profiles?.email || "-";
              const initial = name.charAt(0).toUpperCase();
              const isProcessing = loadingId === member.id && isPending;

              return (
                <div
                  key={member.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-amber-500 dark:text-amber-400 font-mono font-bold text-xs">
                        {initial}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-snug">
                          {name}
                        </h4>
                        <p className="text-xs font-mono text-muted-foreground">{email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-mono text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        DIAJUKAN: {(member.peran_diajukan || member.peran).toUpperCase()}
                      </span>
                      {member.peran_diajukan && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Saat ini: {member.peran}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleApprove(member.id, name)}
                      disabled={isProcessing}
                      className="flex flex-1 h-8 items-center justify-center gap-1.5 rounded-md bg-foreground border border-border px-3 text-xs font-mono font-bold text-background transition-all hover:opacity-90 disabled:opacity-40"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>SETUJUI</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(member.id, name)}
                      disabled={isProcessing}
                      className="flex flex-1 h-8 items-center justify-center gap-1.5 rounded-md border border-destructive/40 bg-card px-3 text-xs font-mono font-bold text-destructive transition-all hover:bg-destructive/10 disabled:opacity-40"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>TOLAK</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Approved Members List */
        <div className="space-y-2 pb-16">
          {approvedMembers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-xs font-mono text-muted-foreground">
              BELUM ADA ANGGOTA YANG DISETUJUI
            </div>
          ) : (
            approvedMembers.map((member) => {
              const name = member.profiles?.nama_lengkap || "Anggota";
              const email = member.profiles?.email || "-";
              const initial = name.charAt(0).toUpperCase();

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground font-mono font-bold text-xs">
                      {initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {name}
                      </h4>
                      <p className="text-xs font-mono text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {member.peran.toUpperCase()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
