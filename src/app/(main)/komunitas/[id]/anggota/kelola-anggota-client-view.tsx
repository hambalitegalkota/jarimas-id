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
  UserX,
  AlertTriangle,
  X,
  UserPlus,
} from "lucide-react";
import {
  approveAnggotaByAdmin,
  rejectAnggotaByAdmin,
  kickMemberByAdmin,
  getAnggotaKomunitas,
} from "@/app/actions/komunitas";
import { ManageGrupMembersModal } from "@/components/kabar/manage-grup-members-modal";
import type { AnggotaKomunitasDetail } from "@/types/database";
import { cn, formatPeranDisplay } from "@/lib/utils";

interface KelolaAnggotaClientViewProps {
  komunitasId: string;
  komunitasNama?: string;
  initialMembers: AnggotaKomunitasDetail[];
}

export function KelolaAnggotaClientView({
  komunitasId,
  komunitasNama,
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
  const [kickTargetMember, setKickTargetMember] = useState<AnggotaKomunitasDetail | null>(null);
  const [isKicking, setIsKicking] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const handleConfirmKick = async () => {
    if (!kickTargetMember) return;
    setIsKicking(true);
    setFeedback(null);

    try {
      const res = await kickMemberByAdmin({
        membershipId: kickTargetMember.id,
        komunitasId,
      });

      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== kickTargetMember.id));
        setFeedback({
          type: "success",
          message: res.message || `Anggota berhasil dikeluarkan dari komunitas.`,
        });
        setKickTargetMember(null);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal mengeluarkan anggota.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Terjadi kesalahan saat mengeluarkan anggota.",
      });
    } finally {
      setIsKicking(false);
    }
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

      {/* Tabs Switcher & Tombol Tambah Anggota */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 rounded-lg bg-muted p-1 border border-border">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
              activeTab === "pending"
                ? "bg-card text-secondary border border-border shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Permohonan Baru ({pendingMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={cn(
              "flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
              activeTab === "approved"
                ? "bg-card text-foreground border border-border shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Anggota Aktif ({approvedMembers.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-bold text-primary-foreground transition-all shadow-xs active:scale-98 cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Tambah Anggota</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "pending" ? (
        <div className="space-y-3 pb-16">
          {pendingMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                <CheckCircle className="h-6 w-6 stroke-[1.5px]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Tidak Ada Permohonan Tertunda
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
                  className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-secondary/30 bg-secondary/15 text-secondary font-bold text-xs">
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
                      <span className="rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-bold text-amber-950 dark:text-amber-200 border border-secondary/30">
                        Diajukan: {formatPeranDisplay(member.peran_diajukan || member.peran)}
                      </span>
                      {member.peran_diajukan && (
                        <span className="text-[10px] text-muted-foreground">
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
                      className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-3 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Setujui</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(member.id, name)}
                      disabled={isProcessing}
                      className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-card px-3 text-xs font-bold text-destructive transition-all hover:bg-destructive/10 disabled:opacity-40 cursor-pointer"
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
      ) : (
        /* Approved Members List */
        <div className="space-y-2 pb-16">
          {approvedMembers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
              Belum ada anggota yang disetujui
            </div>
          ) : (
            approvedMembers.map((member) => {
              const name = member.profiles?.nama_lengkap || "Anggota";
              const email = member.profiles?.email || "-";
              const initial = name.charAt(0).toUpperCase();

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground font-bold text-xs">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {name}
                      </h4>
                      <p className="text-xs font-mono text-muted-foreground truncate">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/20">
                      {formatPeranDisplay(member.peran)}
                    </span>

                    {/* Tombol Keluarkan Anggota oleh Admin */}
                    <button
                      type="button"
                      onClick={() => setKickTargetMember(member)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/15 text-destructive px-2.5 text-xs font-semibold transition-all cursor-pointer"
                      title={`Keluarkan ${name} dari komunitas`}
                    >
                      <UserX className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Keluarkan</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Konfirmasi Keluarkan Anggota */}
      {kickTargetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Keluarkan Anggota?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Konfirmasi Tindakan Pengurus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isKicking && setKickTargetMember(null)}
                disabled={isKicking}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Apakah Anda yakin ingin mengeluarkan anggota berikut dari komunitas ini?
              </p>
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
                <p className="font-bold text-foreground text-base">
                  {kickTargetMember.profiles?.nama_lengkap || "Pengguna"}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>{kickTargetMember.profiles?.email || "-"}</span>
                  <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                    {formatPeranDisplay(kickTargetMember.peran)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-destructive font-semibold leading-relaxed">
                * Pengguna yang dikeluarkan akan kehilangan akses ke grup dan data internal komunitas ini sampai bergabung kembali.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setKickTargetMember(null)}
                disabled={isKicking}
                className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmKick}
                disabled={isKicking}
                className="flex-1 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isKicking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4" />
                    <span>Ya, Keluarkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Anggota */}
      {isAddModalOpen && (
        <ManageGrupMembersModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          room={{
            id: komunitasId,
            nama: komunitasNama || "Komunitas",
            jenis: "kegiatan",
            jumlah_anggota: approvedMembers.length || members.length,
          }}
          existingMemberIds={members.map((m) => m.user_id)}
          allUsers={[]}
          canManage={true}
          currentUserId={null}
          initialTab="undang"
          onMembersUpdated={async () => {
            const res = await getAnggotaKomunitas(komunitasId);
            if (res.success && res.data) {
              setMembers(res.data);
            }
          }}
        />
      )}
    </div>
  );
}
