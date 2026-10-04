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

type FilterTier = "semua" | "admin_rt" | "admin_rw" | "admin_kel" | "admin_kec" | "satuan_paud" | "posyandu" | "warga";

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
            "flex items-center gap-3 rounded-xl border-2 p-4 text-sm font-bold transition-all animate-in fade-in",
            feedback.type === "success"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Daftar Permohonan Peran &amp; Admin
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          {approvals.length} PERMOHONAN TERTUNDA
        </span>
      </div>

      {/* Filter Tabs by Tier Hierarchy */}
      {approvals.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTier("semua")}
            className={cn(
              "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
              activeTier === "semua"
                ? "bg-emerald-600 text-white font-bold shadow-xs border-2 border-emerald-600"
                : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            )}
          >
            <span>Semua</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "semua" ? "bg-emerald-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}>
              {counts.semua}
            </span>
          </button>

          {counts.admin_rt > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_rt")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
                activeTier === "admin_rt"
                  ? "bg-emerald-600 text-white font-bold shadow-xs border-2 border-emerald-600"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>Admin RT</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "admin_rt" ? "bg-emerald-700 text-white" : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300")}>
                {counts.admin_rt}
              </span>
            </button>
          )}

          {counts.admin_rw > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_rw")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
                activeTier === "admin_rw"
                  ? "bg-emerald-600 text-white font-bold shadow-xs border-2 border-emerald-600"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>Admin RW</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "admin_rw" ? "bg-emerald-700 text-white" : "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300")}>
                {counts.admin_rw}
              </span>
            </button>
          )}

          {counts.admin_kel > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_kel")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
                activeTier === "admin_kel"
                  ? "bg-emerald-600 text-white font-bold shadow-xs border-2 border-emerald-600"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>Admin Kelurahan</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "admin_kel" ? "bg-emerald-700 text-white" : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300")}>
                {counts.admin_kel}
              </span>
            </button>
          )}

          {counts.admin_kec > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("admin_kec")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
                activeTier === "admin_kec"
                  ? "bg-emerald-600 text-white font-bold shadow-xs border-2 border-emerald-600"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>Admin Kecamatan</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "admin_kec" ? "bg-emerald-700 text-white" : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300")}>
                {counts.admin_kec}
              </span>
            </button>
          )}

          {counts.satuan_paud > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("satuan_paud")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
                activeTier === "satuan_paud"
                  ? "bg-amber-600 text-white font-bold shadow-xs border-2 border-amber-600"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>Satuan PAUD</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "satuan_paud" ? "bg-amber-700 text-white" : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300")}>
                {counts.satuan_paud}
              </span>
            </button>
          )}

          {counts.posyandu > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("posyandu")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
                activeTier === "posyandu"
                  ? "bg-rose-600 text-white font-bold shadow-xs border-2 border-rose-600"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>Posyandu</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "posyandu" ? "bg-rose-700 text-white" : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300")}>
                {counts.posyandu}
              </span>
            </button>
          )}

          {counts.warga > 0 && (
            <button
              type="button"
              onClick={() => setActiveTier("warga")}
              className={cn(
                "inline-flex shrink-0 items-center min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer gap-2",
                activeTier === "warga"
                  ? "bg-emerald-600 text-white font-bold shadow-xs border-2 border-emerald-600"
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>Warga</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold font-mono", activeTier === "warga" ? "bg-emerald-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>
                {counts.warga}
              </span>
            </button>
          )}

        </div>
      )}

      {/* List / Empty State */}
      {filteredApprovals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-3">
            <Check className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Semua Permohonan Selesai
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
            Tidak ada permohonan peran pengurus, kader, atau warga yang pending pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 transition-all hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs"
              >
                {/* Header User, Tier & Role */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                          {userName}
                        </h4>
                        {item.tierLevel && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold uppercase border-2",
                              item.tierLevel === "RT" &&
                                "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
                              item.tierLevel === "RW" &&
                                "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300",
                              item.tierLevel === "Kelurahan" &&
                                "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
                              item.tierLevel === "Kecamatan" &&
                                "border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
                              item.tierLevel === "Satuan PAUD" &&
                                "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200",
                              item.tierLevel === "Posyandu" &&
                                "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
                              !["RT", "RW", "Kelurahan", "Kecamatan", "Satuan PAUD", "Posyandu"].includes(item.tierLevel) &&
                                "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            <Layers className="h-3.5 w-3.5" />
                            <span>TINGKAT {item.tierLevel}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
                        <span>{userEmail}</span>
                        {userPhone && (
                          <span className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-bold">
                            <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
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
                        "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold",
                        isRolePengurus
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          : "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                      )}
                    >
                      <Shield className="h-4 w-4" />
                      <span>{item.peran.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                {/* Survey Information if available (Domisili / KK) */}
                {(item.berdomisili !== undefined || item.kk_terdaftar !== undefined) && (
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500 font-bold">Hasil Survey:</span>
                    {item.berdomisili !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                          item.berdomisili
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        )}
                      >
                        <Home className="h-3.5 w-3.5" />
                        <span>{item.berdomisili ? "Berdomisili Disini" : "Bukan Domisili"}</span>
                      </span>
                    )}
                    {item.kk_terdaftar !== undefined && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                          item.kk_terdaftar
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        )}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>{item.kk_terdaftar ? "KK Terdaftar" : "KK Luar"}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Komunitas Info Box & Hierarchical Approver Target */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
                    <Building2 className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {komunitasNama}{" "}
                      <span className="text-slate-500 font-normal">
                        ({komunitasJenis.replace("_", " ")})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{komunitasLokasi}</span>
                  </div>

                  {item.targetApproverTitle && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-slate-500">Wewenang Persetujuan:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {item.targetApproverTitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    onClick={() => handleApprove(item.id, userName)}
                    disabled={isProcessing}
                    className="flex min-h-[48px] w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-bold text-white transition-all active:scale-98 disabled:opacity-50 shadow-xs cursor-pointer"
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
                    className="flex min-h-[48px] w-full sm:flex-1 items-center justify-center gap-2 rounded-xl border-2 border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-4 text-sm font-bold text-rose-700 dark:text-rose-400 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-98 disabled:opacity-50 cursor-pointer"
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
