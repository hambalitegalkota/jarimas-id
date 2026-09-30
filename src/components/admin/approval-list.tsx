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
  Phone,
  Home,
  FileText,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";
import { approveMemberRole, rejectMemberRole } from "@/app/actions/admin";
import type { PendingApprovalItem } from "@/types/database";
import { cn, isRoleAdmin } from "@/lib/utils";

interface ApprovalListProps {
  initialApprovals: PendingApprovalItem[];
  isSuperAdmin?: boolean;
}

type FilterTier = "semua" | "admin_rt" | "admin_rw" | "admin_kel" | "admin_kec" | "warga" | "posyandu_paud";

export function ApprovalList({
  initialApprovals,
  isSuperAdmin = true,
}: ApprovalListProps) {
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>(initialApprovals);
  const [activeTier, setActiveTier] = useState<FilterTier>("semua");
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
          message: result.message || `Permohonan peran untuk ${name} berhasil disetujui.`,
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
          message: result.message || `Permohonan peran untuk ${name} telah ditolak.`,
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

  // Filter items based on active tier tab
  const filteredApprovals = approvals.filter((item) => {
    if (activeTier === "semua") return true;

    const isAdmin = isRoleAdmin(item.peran_diajukan || item.peran);
    const jenis = item.komunitas?.jenis || "posyandu";

    if (activeTier === "admin_rt") {
      return jenis === "warga_kita" && isAdmin && item.tierLevel === "RT";
    }
    if (activeTier === "admin_rw") {
      return jenis === "warga_kita" && isAdmin && item.tierLevel === "RW";
    }
    if (activeTier === "admin_kel") {
      return jenis === "warga_kita" && isAdmin && item.tierLevel === "Kelurahan";
    }
    if (activeTier === "admin_kec") {
      return jenis === "warga_kita" && isAdmin && item.tierLevel === "Kecamatan";
    }
    if (activeTier === "warga") {
      return jenis === "warga_kita" && !isAdmin;
    }
    if (activeTier === "posyandu_paud") {
      return jenis === "posyandu" || jenis === "satuan_paud";
    }
    return true;
  });

  // Calculate counts for badges
  const counts = {
    semua: approvals.length,
    admin_rt: approvals.filter(
      (i) =>
        i.komunitas?.jenis === "warga_kita" &&
        isRoleAdmin(i.peran_diajukan || i.peran) &&
        i.tierLevel === "RT"
    ).length,
    admin_rw: approvals.filter(
      (i) =>
        i.komunitas?.jenis === "warga_kita" &&
        isRoleAdmin(i.peran_diajukan || i.peran) &&
        i.tierLevel === "RW"
    ).length,
    admin_kel: approvals.filter(
      (i) =>
        i.komunitas?.jenis === "warga_kita" &&
        isRoleAdmin(i.peran_diajukan || i.peran) &&
        i.tierLevel === "Kelurahan"
    ).length,
    admin_kec: approvals.filter(
      (i) =>
        i.komunitas?.jenis === "warga_kita" &&
        isRoleAdmin(i.peran_diajukan || i.peran) &&
        i.tierLevel === "Kecamatan"
    ).length,
    warga: approvals.filter(
      (i) =>
        i.komunitas?.jenis === "warga_kita" &&
        !isRoleAdmin(i.peran_diajukan || i.peran)
    ).length,
    posyandu_paud: approvals.filter(
      (i) =>
        i.komunitas?.jenis === "posyandu" || i.komunitas?.jenis === "satuan_paud"
    ).length,
  };

  return (
    <div className="space-y-4">
      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-md border p-3.5 text-xs font-medium transition-all animate-in fade-in",
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono"
              : "border-destructive/40 bg-destructive/10 text-destructive font-mono"
          )}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-0.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            Daftar Permohonan Peran &amp; Admin
          </h3>
        </div>
        <span className="cyber-badge font-mono text-[11px] self-start sm:self-auto">
          {approvals.length} PERMOHONAN TERTUNDA
        </span>
      </div>

      {/* Filter Tabs by Tier Hierarchy */}
      {approvals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border border-border bg-muted/40 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTier("semua")}
            className={cn(
              "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
              activeTier === "semua"
                ? "bg-card text-foreground font-bold shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Semua</span>
            <span className="rounded bg-muted px-1.5 py-0.2 text-[10px]">
              {counts.semua}
            </span>
          </button>

          {counts.admin_rt > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_rt")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                activeTier === "admin_rt"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Admin RT</span>
              <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 text-[10px]">
                {counts.admin_rt}
              </span>
            </button>
          )}

          {counts.admin_rw > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_rw")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                activeTier === "admin_rw"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Admin RW</span>
              <span className="rounded bg-cyan-500/20 text-cyan-400 px-1.5 py-0.2 text-[10px]">
                {counts.admin_rw}
              </span>
            </button>
          )}

          {counts.admin_kel > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_kel")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                activeTier === "admin_kel"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Admin Kelurahan</span>
              <span className="rounded bg-amber-500/20 text-amber-400 px-1.5 py-0.2 text-[10px]">
                {counts.admin_kel}
              </span>
            </button>
          )}

          {counts.admin_kec > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_kec")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                activeTier === "admin_kec"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Admin Kecamatan</span>
              <span className="rounded bg-purple-500/20 text-purple-400 px-1.5 py-0.2 text-[10px]">
                {counts.admin_kec}
              </span>
            </button>
          )}

          {counts.warga > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("warga")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                activeTier === "warga"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Warga (Penduduk/Pendatang)</span>
              <span className="rounded bg-muted px-1.5 py-0.2 text-[10px]">
                {counts.warga}
              </span>
            </button>
          )}

          {counts.posyandu_paud > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("posyandu_paud")}
              className={cn(
                "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                activeTier === "posyandu_paud"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Posyandu &amp; PAUD</span>
              <span className="rounded bg-muted px-1.5 py-0.2 text-[10px]">
                {counts.posyandu_paud}
              </span>
            </button>
          )}
        </div>
      )}

      {/* List / Empty State */}
      {filteredApprovals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/60 p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground mb-3">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
          <h4 className="font-semibold text-foreground text-sm">
            Semua Permohonan Selesai
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs font-mono">
            Tidak ada permohonan peran pengurus, kader, atau warga yang pending pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApprovals.map((item) => {
            const userName = item.profiles?.nama_lengkap || "Pengguna Tanpa Nama";
            const userEmail = item.profiles?.email || "-";
            const userPhone = item.profiles?.nomor_hp;
            const komunitasNama = item.komunitas?.nama || "Komunitas";
            const komunitasJenis = item.komunitas?.jenis || "warga_kita";
            const komunitasLokasi = item.komunitas?.lokasi || "Kota Tegal";
            const isProcessing = loadingId === item.id && isPending;

            const isRolePengurus = (item.peran_diajukan || item.peran)
              .toLowerCase()
              .includes("pengurus");

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4 space-y-3 transition-colors hover:border-zinc-700 shadow-xs"
              >
                {/* Header User, Tier & Role */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-foreground font-mono text-xs">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground leading-snug">
                          {userName}
                        </h4>
                        {item.tierLevel && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase border",
                              item.tierLevel === "RT" &&
                                "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                              item.tierLevel === "RW" &&
                                "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
                              item.tierLevel === "Kelurahan" &&
                                "border-amber-500/30 bg-amber-500/10 text-amber-400",
                              item.tierLevel === "Kecamatan" &&
                                "border-purple-500/30 bg-purple-500/10 text-purple-400",
                              (item.tierLevel === "Posyandu" ||
                                item.tierLevel === "Satuan PAUD") &&
                                "border-border bg-muted text-foreground"
                            )}
                          >
                            <Layers className="h-3 w-3" />
                            <span>TINGKAT {item.tierLevel}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span>{userEmail}</span>
                        {userPhone && (
                          <span className="flex items-center gap-1 text-foreground">
                            <Phone className="h-3 w-3 text-emerald-400" />
                            {userPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role Requested Badge */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono font-bold",
                        isRolePengurus
                          ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                          : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      )}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>{item.peran.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                {/* Survey Information if available (Domisili / KK) */}
                {(item.berdomisili !== undefined || item.kk_terdaftar !== undefined) && (
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="text-muted-foreground text-[11px]">Hasil Survey:</span>
                    {item.berdomisili !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border",
                          item.berdomisili
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        )}
                      >
                        <Home className="h-3 w-3" />
                        <span>{item.berdomisili ? "Berdomisili Disini" : "Bukan Domisili"}</span>
                      </span>
                    )}
                    {item.kk_terdaftar !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border",
                          item.kk_terdaftar
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        )}
                      >
                        <FileText className="h-3 w-3" />
                        <span>{item.kk_terdaftar ? "KK Terdaftar" : "KK Luar"}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Komunitas Info Box & Hierarchical Approver Target */}
                <div className="rounded-md border border-border/80 bg-background/50 p-3 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {komunitasNama}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({komunitasJenis.replace("_", " ")})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{komunitasLokasi}</span>
                  </div>

                  {item.targetApproverTitle && (
                    <div className="pt-1 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Wewenang Persetujuan:</span>
                      <span className="text-emerald-400 font-bold">
                        {item.targetApproverTitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(item.id, userName)}
                    disabled={isProcessing}
                    className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-98 disabled:opacity-50 font-mono uppercase shadow-xs cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Setujui Peran</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(item.id, userName)}
                    disabled={isProcessing}
                    className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/20 active:scale-98 disabled:opacity-50 font-mono font-bold uppercase"
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
