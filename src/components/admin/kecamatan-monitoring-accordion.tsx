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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Monitoring Seluruh Permohonan Wilayah (Per Kecamatan)
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">
          TOTAL {totalPendingAllKecamatan} PERMOHONAN BERJENJANG
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-1">
        Pantau seluruh permohonan peran dan admin berjenjang (RT, RW, Kelurahan, Kecamatan) di setiap wilayah Kota Tegal.
      </p>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-4 text-sm font-bold border-2 animate-in fade-in duration-200",
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
          <span className="flex-1 leading-relaxed">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs uppercase underline cursor-pointer"
          >
            Tutup
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
              className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleKecamatan(kecName)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border-2 font-bold text-sm",
                      pendingCount > 0
                        ? "bg-amber-50 border-amber-500 text-amber-700"
                        : "bg-slate-100 border-slate-200 text-slate-500"
                    )}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Kecamatan {kecName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {pendingCount > 0
                        ? `${pendingCount} Permohonan Menunggu Persetujuan`
                        : "Tidak ada permohonan yang menunggu"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs px-3 py-1 rounded-full font-bold border-2",
                      pendingCount > 0
                        ? "bg-amber-50 text-amber-700 border-amber-500"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}
                  >
                    {pendingCount} PENDING
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  {pendingCount === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      Semua permohonan di Kecamatan {kecName} telah disetujui / diproses.
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                            className="rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-3 shadow-xs hover:border-blue-400 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              {/* Left Profile & Target Community */}
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={cn(
                                      "text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border-2",
                                      item.tierLevel === "RT" && "bg-cyan-50 text-cyan-700 border-cyan-400",
                                      item.tierLevel === "RW" && "bg-emerald-50 text-emerald-700 border-emerald-400",
                                      item.tierLevel === "Kelurahan" && "bg-indigo-50 text-indigo-700 border-indigo-400",
                                      item.tierLevel === "Kecamatan" && "bg-amber-50 text-amber-700 border-amber-400"
                                    )}
                                  >
                                    {isAdminApplication
                                      ? `Admin ${item.tierLevel}`
                                      : `Warga (${item.peran})`}
                                  </span>
                                  <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold">
                                    Wewenang: {item.targetApproverTitle}
                                  </span>
                                </div>

                                <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {item.profiles?.nama_lengkap || "Warga"}
                                </h5>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                                  <span>{item.profiles?.email || "-"}</span>
                                  {item.profiles?.nomor_hp && (
                                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                                      <Phone className="h-3.5 w-3.5" />
                                      <span>{item.profiles.nomor_hp}</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono pt-0.5 flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                  <span>{item.komunitas?.nama}</span>
                                </p>
                              </div>

                              {/* Right Action Buttons */}
                              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 sm:pt-0 shrink-0 w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => handleReject(item.id)}
                                  disabled={isPending}
                                  className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border-2 border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  {isThisProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  <span>Tolak</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleApprove(item.id)}
                                  disabled={isPending}
                                  className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                  {isThisProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
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
