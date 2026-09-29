"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  Layers,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { approveMemberRole, rejectMemberRole } from "@/app/actions/admin";
import type { PendingApprovalItem } from "@/types/database";
import { cn } from "@/lib/utils";

interface KecamatanMonitoringAccordionProps {
  initialItems: PendingApprovalItem[];
}

const DAFTAR_KECAMATAN = [
  "Tegal Timur",
  "Tegal Barat",
  "Tegal Selatan",
  "Margadana",
];

export function KecamatanMonitoringAccordion({
  initialItems,
}: KecamatanMonitoringAccordionProps) {
  const [items, setItems] = useState<PendingApprovalItem[]>(initialItems);
  const [openKecamatan, setOpenKecamatan] = useState<Record<string, boolean>>({
    "Tegal Timur": false,
    "Tegal Barat": false,
    "Tegal Selatan": false,
    Margadana: false,
  });
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const toggleKecamatan = (kec: string) => {
    setOpenKecamatan((prev) => ({
      ...prev,
      [kec]: !prev[kec],
    }));
  };

  const handleApprove = (id: string) => {
    setFeedback(null);
    setProcessingId(id);
    startTransition(async () => {
      const res = await approveMemberRole(id);
      setProcessingId(null);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  const handleReject = (id: string) => {
    setFeedback(null);
    setProcessingId(id);
    startTransition(async () => {
      const res = await rejectMemberRole(id);
      setProcessingId(null);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  // Group items by Kecamatan
  const groupedByKecamatan: Record<string, PendingApprovalItem[]> = {};
  DAFTAR_KECAMATAN.forEach((kec) => {
    groupedByKecamatan[kec] = [];
  });
  groupedByKecamatan["Lainnya"] = [];

  items.forEach((item) => {
    const itemKec = item.komunitas?.kecamatan;
    const matchedKec = DAFTAR_KECAMATAN.find(
      (k) => itemKec && itemKec.toLowerCase().includes(k.toLowerCase())
    );

    if (matchedKec) {
      groupedByKecamatan[matchedKec].push(item);
    } else {
      groupedByKecamatan["Lainnya"].push(item);
    }
  });

  const totalPendingAllKecamatan = items.length;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Monitoring Seluruh Permohonan Wilayah (Per Kecamatan)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          TOTAL {totalPendingAllKecamatan} PERMOHONAN BERJENJANG
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Pantau seluruh permohonan peran dan admin berjenjang (RT, RW, Kelurahan, Kecamatan) di setiap wilayah Kota Tegal. Super Admin memiliki wewenang untuk memantau atau menyetujui langsung:
      </p>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg p-3 text-xs font-mono border animate-in fade-in duration-200",
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          )}
          <span className="flex-1 leading-relaxed">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-[10px] uppercase underline opacity-70 hover:opacity-100 font-mono shrink-0"
          >
            TUTUP
          </button>
        </div>
      )}

      {/* 4 Kecamatan Accordions */}
      <div className="space-y-3">
        {DAFTAR_KECAMATAN.map((kecName) => {
          const kecItems = groupedByKecamatan[kecName] || [];
          const isOpen = openKecamatan[kecName] ?? false;
          const pendingCount = kecItems.length;

          return (
            <div
              key={kecName}
              className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs transition-all"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleKecamatan(kecName)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border font-bold text-xs font-mono",
                      pendingCount > 0
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-muted/30 border-border text-muted-foreground"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                      Kecamatan {kecName}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {pendingCount > 0
                        ? `${pendingCount} Permohonan Belum Disetujui`
                        : "Tidak ada permohonan yang menunggu"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded font-semibold",
                      pendingCount > 0
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-muted/40 text-muted-foreground border border-border"
                    )}
                  >
                    {pendingCount} PENDING
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-muted/20 text-muted-foreground">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="p-4 pt-1 border-t border-border/60 space-y-3">
                  {pendingCount === 0 ? (
                    <div className="p-6 text-center text-xs font-mono text-muted-foreground border border-dashed border-border rounded-lg bg-card/30">
                      Semua permohonan di Kecamatan {kecName} telah disetujui / diproses.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {kecItems.map((item) => {
                        const isThisProcessing = isPending && processingId === item.id;
                        const roleLower = (item.peran_diajukan || item.peran || "").toLowerCase();
                        const isAdminApplication =
                          roleLower.includes("pengurus") ||
                          roleLower.includes("admin") ||
                          roleLower.includes("ketua");

                        return (
                          <div
                            key={item.id}
                            className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-xs hover:border-border/90 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                              {/* Left Profile & Target Community */}
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={cn(
                                      "text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border",
                                      item.tierLevel === "RT" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
                                      item.tierLevel === "RW" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                                      item.tierLevel === "Kelurahan" && "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
                                      item.tierLevel === "Kecamatan" && "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    )}
                                  >
                                    {isAdminApplication
                                      ? `Permohonan Admin ${item.tierLevel}`
                                      : `Verifikasi Warga (${item.peran})`}
                                  </span>
                                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    Menunggu: {item.targetApproverTitle}
                                  </span>
                                </div>

                                <h5 className="text-sm font-bold text-foreground">
                                  {item.profiles?.nama_lengkap || "Warga"}
                                </h5>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono">
                                  <span>{item.profiles?.email || "-"}</span>
                                  {item.profiles?.nomor_hp && (
                                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                      <Phone className="h-3 w-3" />
                                      <span>{item.profiles.nomor_hp}</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-muted-foreground font-mono pt-0.5 flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span>{item.komunitas?.nama}</span>
                                </p>
                              </div>

                              {/* Right Action Buttons */}
                              <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleReject(item.id)}
                                  disabled={isPending}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 text-xs font-mono text-destructive hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
                                >
                                  {isThisProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                  )}
                                  <span>Tolak</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleApprove(item.id)}
                                  disabled={isPending}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-mono font-bold text-white hover:bg-emerald-500 transition-all disabled:opacity-50"
                                >
                                  {isThisProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  <span>Setujui</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
