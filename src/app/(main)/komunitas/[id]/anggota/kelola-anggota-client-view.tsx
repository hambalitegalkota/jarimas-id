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

  const pendingMembers = members.filter((m) => m.status === "pending");
  const approvedMembers = members.filter((m) => m.status === "approved");

  const handleApprove = (id: string, name: string) => {
    setLoadingId(id);
    setFeedback(null);

    startTransition(async () => {
      const res = await approveAnggotaByAdmin(id);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: "approved" } : m))
        );
        setFeedback({
          type: "success",
          message: `Permohonan pendaftaran ${name} berhasil disetujui!`,
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
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold shadow-sm transition-all animate-in fade-in ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
              : "border border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex rounded-2xl bg-muted/70 p-1 border border-border/80">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "pending"
              ? "bg-card text-amber-600 shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Permohonan Baru ({pendingMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={cn(
            "flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all",
            activeTab === "approved"
              ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          <span>Anggota Aktif ({approvedMembers.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "pending" ? (
        <div className="space-y-3 pb-12">
          {pendingMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Tidak Ada Permohonan Tertunda
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Semua permohonan bergabung pada komunitas ini telah selesai diverifikasi.
              </p>
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
                  className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
                        {initial}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-snug">
                          {name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{email}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                      Diajukan: {member.peran}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                    <button
                      onClick={() => handleApprove(member.id, name)}
                      disabled={isProcessing}
                      className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm shadow-primary/20 transition-all active:scale-95 hover:brightness-105 disabled:opacity-50"
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
                      onClick={() => handleReject(member.id, name)}
                      disabled={isProcessing}
                      className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive transition-all active:scale-95 hover:bg-destructive/20 disabled:opacity-50"
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
            })
          )}
        </div>
      ) : (
        /* Approved Members List */
        <div className="space-y-2.5 pb-12">
          {approvedMembers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center text-xs text-muted-foreground">
              Belum ada anggota yang disetujui.
            </div>
          ) : (
            approvedMembers.map((member) => {
              const name = member.profiles?.nama_lengkap || "Anggota";
              const email = member.profiles?.email || "-";
              const initial = name.charAt(0).toUpperCase();

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                      {initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                    {member.peran}
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
