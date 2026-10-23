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

type FilterTier = "semua" | "admin_rt" | "admin_rw" | "admin_kel" | "admin_kec" | "satuan_paud" | "pkbm_skb" | "posyandu" | "warga";

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
    const jenis = item.komunitas?.jenis || "warga_kita";

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
    if (activeTier === "satuan_paud") {
      return jenis === "satuan_paud" || item.tierLevel === "Satuan PAUD";
    }
    if (activeTier === "pkbm_skb") {
      return jenis === "pkbm_skb" || item.tierLevel === "PKBM & SKB";
    }
    if (activeTier === "posyandu") {
      return jenis === "posyandu" || item.tierLevel === "Posyandu";
    }
    if (activeTier === "warga") {
      return jenis === "warga_kita" && !isAdmin;
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
    satuan_paud: approvals.filter(
      (i) => i.komunitas?.jenis === "satuan_paud" || i.tierLevel === "Satuan PAUD"
    ).length,
    pkbm_skb: approvals.filter(
      (i) => i.komunitas?.jenis === "pkbm_skb" || i.tierLevel === "PKBM & SKB"
    ).length,
    posyandu: approvals.filter(
      (i) => i.komunitas?.jenis === "posyandu" || i.tierLevel === "Posyandu"
    ).length,
    warga: approvals.filter(
      (i) =>
        i.komunitas?.jenis === "warga_kita" &&
        !isRoleAdmin(i.peran_diajukan || i.peran)
    ).length,
  };

  return (
    <div className="space-y-4">
      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border p-3.5 text-xs font-semibold transition-all animate-in fade-in",
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Daftar Permohonan Peran &amp; Admin
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-2xs font-semibold text-primary self-start sm:self-auto uppercase tracking-wider">
          {approvals.length} Permohonan Tertunda
        </span>
      </div>

      {/* Information Banner for Territorial Approval */}
      {!isSuperAdmin && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground flex items-start gap-2.5">
          <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">Wewenang Persetujuan Admin Wilayah</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Admin Kelurahan bertugas memverifikasi dan menyetujui permohonan admin &amp; pengurus dari <strong>PAUD</strong>, <strong>SKB &amp; PKBM</strong>, <strong>Posyandu</strong>, serta pengurus <strong>RW &amp; RT</strong> di wilayah kelurahan masing-masing.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs by Tier Hierarchy */}
      {approvals.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTier("semua")}
            className={cn(
              "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
              activeTier === "semua"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span>Semua</span>
            <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "semua" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {counts.semua}
            </span>
          </button>

          {counts.admin_rt > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_rt")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "admin_rt"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Admin RT</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "admin_rt" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary")}>
                {counts.admin_rt}
              </span>
            </button>
          )}

          {counts.admin_rw > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_rw")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "admin_rw"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Admin RW</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "admin_rw" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-sky-500/10 text-sky-600")}>
                {counts.admin_rw}
              </span>
            </button>
          )}

          {counts.admin_kel > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_kel")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "admin_kel"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Admin Kelurahan</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "admin_kel" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary/10 text-secondary")}>
                {counts.admin_kel}
              </span>
            </button>
          )}

          {counts.admin_kec > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_kec")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "admin_kec"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Admin Kecamatan</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "admin_kec" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-purple-500/10 text-purple-600")}>
                {counts.admin_kec}
              </span>
            </button>
          )}

          {counts.satuan_paud > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("satuan_paud")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "satuan_paud"
                  ? "bg-secondary text-secondary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Satuan PAUD</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "satuan_paud" ? "bg-secondary-foreground/20 text-secondary-foreground" : "bg-secondary/10 text-secondary")}>
                {counts.satuan_paud}
              </span>
            </button>
          )}

          {counts.pkbm_skb > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("pkbm_skb")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "pkbm_skb"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>PKBM &amp; SKB</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "pkbm_skb" ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600")}>
                {counts.pkbm_skb}
              </span>
            </button>
          )}

          {counts.posyandu > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("posyandu")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "posyandu"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Posyandu</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "posyandu" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary")}>
                {counts.posyandu}
              </span>
            </button>
          )}

          {counts.warga > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("warga")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] h-11 rounded-lg px-3.5 text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs",
                activeTier === "warga"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Warga</span>
              <span className={cn("rounded-md px-1.5 py-0.2 text-2xs font-mono font-bold", activeTier === "warga" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {counts.warga}
              </span>
            </button>
          )}
        </div>
      )}

      {/* List / Empty State */}
      {filteredApprovals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2.5">
            <Check className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-foreground text-sm">
            Semua Permohonan Selesai
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
            Tidak ada permohonan peran pengurus, kader, atau warga yang pending pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredApprovals.map((item) => {
            const userName = item.profiles?.nama_lengkap || "Pengguna Tanpa Nama";
            const userEmail = item.profiles?.email || "-";
            const userPhone = item.profiles?.nomor_hp;
            const rawKomNama = item.komunitas?.nama || "Komunitas";
            const komunitasJenis = item.komunitas?.jenis || "warga_kita";
            let komunitasNama = rawKomNama;
            if (komunitasJenis === "posyandu") {
              const cleanName = rawKomNama.replace(/^(Posyandu\s*)+/gi, "").trim();
              komunitasNama = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
            }
            const komunitasLokasi = item.komunitas?.lokasi || "Kota Tegal";
            const isProcessing = loadingId === item.id && isPending;

            const isRolePengurus = (item.peran_diajukan || item.peran)
              .toLowerCase()
              .includes("pengurus");

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3.5 transition-colors hover:border-primary/50 shadow-xs"
              >
                {/* Header User, Tier & Role */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                          {userName}
                        </h4>
                        {item.tierLevel && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-semibold uppercase border",
                              item.tierLevel === "RT" &&
                                "border-primary/30 bg-primary/10 text-primary",
                              item.tierLevel === "RW" &&
                                "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
                              item.tierLevel === "Kelurahan" &&
                                "border-secondary/30 bg-secondary/10 text-secondary",
                              item.tierLevel === "Kecamatan" &&
                                "border-purple-500/30 bg-purple-500/10 text-purple-600",
                              item.tierLevel === "Satuan PAUD" &&
                                "border-secondary/30 bg-secondary/10 text-secondary",
                              item.tierLevel === "PKBM & SKB" &&
                                "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                              item.tierLevel === "Posyandu" &&
                                "border-primary/30 bg-primary/10 text-primary",
                              !["RT", "RW", "Kelurahan", "Kecamatan", "Satuan PAUD", "PKBM & SKB", "Posyandu"].includes(item.tierLevel) &&
                                "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            <Layers className="h-3 w-3" />
                            <span>Tingkat {item.tierLevel}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-2xs text-muted-foreground font-mono">
                        <span>{userEmail}</span>
                        {userPhone && (
                          <span className="flex items-center gap-1 text-foreground font-semibold">
                            <Phone className="h-3 w-3 text-primary" />
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
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-2xs font-semibold",
                        isRolePengurus
                          ? "border-secondary/30 bg-secondary/10 text-secondary"
                          : "border-primary/30 bg-primary/10 text-primary"
                      )}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>{item.peran.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                {/* Survey Information if available (Domisili / KK) */}
                {(item.berdomisili !== undefined || item.kk_terdaftar !== undefined) && (
                  <div className="flex flex-wrap items-center gap-2 text-2xs font-mono">
                    <span className="text-muted-foreground font-semibold">Hasil Survey:</span>
                    {item.berdomisili !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold border",
                          item.berdomisili
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-secondary/30 bg-secondary/10 text-secondary"
                        )}
                      >
                        <Home className="h-3 w-3" />
                        <span>{item.berdomisili ? "Berdomisili Disini" : "Bukan Domisili"}</span>
                      </span>
                    )}
                    {item.kk_terdaftar !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold border",
                          item.kk_terdaftar
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-secondary/30 bg-secondary/10 text-secondary"
                        )}
                      >
                        <FileText className="h-3 w-3" />
                        <span>{item.kk_terdaftar ? "KK Terdaftar" : "KK Luar"}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Komunitas Info Box & Hierarchical Approver Target */}
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs space-y-1 font-mono">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      {komunitasNama}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({komunitasJenis.replace("_", " ")})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-2xs">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{komunitasLokasi}</span>
                  </div>

                  {item.targetApproverTitle && (
                    <div className="pt-1 border-t border-border/50 flex items-center justify-between text-2xs">
                      <span className="text-muted-foreground">Wewenang Persetujuan:</span>
                      <span className="text-primary font-semibold">
                        {item.targetApproverTitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(item.id, userName)}
                    disabled={isProcessing}
                    className="flex min-h-[44px] h-11 w-full sm:flex-1 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-semibold text-primary-foreground transition-all active:scale-98 disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Setujui Peran</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(item.id, userName)}
                    disabled={isProcessing}
                    className="flex min-h-[44px] h-11 w-full sm:flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 text-xs font-semibold text-destructive transition-all hover:bg-destructive/20 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4" />
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
