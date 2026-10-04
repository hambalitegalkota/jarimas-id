"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  AlertCircle,
  Home,
  FileText,
  User,
  ShieldCheck,
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("semua");
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleApprove = (id: string, name: string) => {
    setFeedback(null);
    setProcessingId(id);
    startTransition(async () => {
      const res = await approveMemberRole(id);
      setProcessingId(null);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || `Permohonan untuk ${name} berhasil disetujui.`,
        });
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal menyetujui permohonan.",
        });
      }
    });
  };

  const handleReject = (id: string, name: string) => {
    setFeedback(null);
    setProcessingId(id);
    startTransition(async () => {
      const res = await rejectMemberRole(id);
      setProcessingId(null);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || `Permohonan untuk ${name} telah ditolak.`,
        });
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal menolak permohonan.",
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

  const totalPending = items.length;

  // Filter items based on selected tab
  const displayedItems =
    selectedKecamatan === "semua"
      ? items
      : groupedByKecamatan[selectedKecamatan] || [];

  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Master Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-bold text-sm",
              totalPending > 0
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
            )}
          >
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Monitoring Seluruh Permohonan Wilayah
              </h3>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                (4 Kecamatan)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pantau dan kelola seluruh permohonan berjenjang (RT, RW, Kelurahan, Kecamatan, Satuan PAUD, Posyandu) dalam satu panel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-full font-bold font-mono border",
              totalPending > 0
                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            )}
          >
            {totalPending} PERMOHONAN
          </span>

          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content: Tabs + Compact List */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
          {/* Feedback Banner */}
          {feedback && (
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-xl p-3 text-xs font-bold border-2 transition-all shadow-xs",
                feedback.type === "success"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
                  : "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span className="flex-1 leading-relaxed">{feedback.message}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-[10px] uppercase underline cursor-pointer hover:opacity-80"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Compact Kecamatan Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedKecamatan("semua")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-98",
                selectedKecamatan === "semua"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              <span>Semua</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold",
                  selectedKecamatan === "semua"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                )}
              >
                {totalPending}
              </span>
            </button>

            {DAFTAR_KECAMATAN.map((kec) => {
              const count = groupedByKecamatan[kec]?.length || 0;
              const isActive = selectedKecamatan === kec;

              return (
                <button
                  key={kec}
                  type="button"
                  onClick={() => setSelectedKecamatan(kec)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-98",
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  <span>{kec}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold",
                        isActive
                          ? "bg-amber-400 text-slate-900"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {groupedByKecamatan["Lainnya"]?.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedKecamatan("Lainnya")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-98",
                  selectedKecamatan === "Lainnya"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                <span>Lainnya</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold bg-amber-100 text-amber-700 border border-amber-300">
                  {groupedByKecamatan["Lainnya"].length}
                </span>
              </button>
            )}
          </div>

          {/* List of Applications */}
          {displayedItems.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {selectedKecamatan === "semua"
                ? "Tidak ada permohonan berjenjang yang menunggu persetujuan."
                : `Tidak ada permohonan berjenjang di Kecamatan ${selectedKecamatan}.`}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((item) => {
                const isThisProcessing = isPending && processingId === item.id;
                const roleLower = (item.peran_diajukan || item.peran || "").toLowerCase();
                const isAdminApplication =
                  roleLower.includes("pengurus") ||
                  roleLower.includes("admin") ||
                  roleLower.includes("ketua");
                const userName = item.profiles?.nama_lengkap || "Pengguna JARIMAS";
                const cleanPhone = (item.profiles?.nomor_hp || "").replace(/[^0-9]/g, "");
                const waPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Tier Badge */}
                          <span
                            className={cn(
                              "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border",
                              item.tierLevel === "RT" && "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
                              item.tierLevel === "RW" && "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
                              item.tierLevel === "Kelurahan" && "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
                              item.tierLevel === "Kecamatan" && "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800",
                              item.tierLevel === "Satuan PAUD" && "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-700",
                              item.tierLevel === "Posyandu" && "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800",
                              !item.tierLevel && "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            )}
                          >
                            TINGKAT {item.tierLevel?.toUpperCase() || "KOMUNITAS"}
                          </span>

                          {/* Role Tag */}
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {item.peran}
                          </span>

                          {item.targetApproverTitle && (
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                              Wewenang: {item.targetApproverTitle}
                            </span>
                          )}
                        </div>

                        {/* Name & Contacts */}
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>{userName}</span>
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono mt-0.5">
                            <span>{item.profiles?.email || "-"}</span>
                            {item.profiles?.nomor_hp && (
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                <span>{item.profiles.nomor_hp}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Survey Result Badges */}
                        {(item.berdomisili || item.kk_terdaftar) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">Hasil Survey:</span>
                            {item.berdomisili && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                <Home className="h-3 w-3" />
                                Berdomisili Disini
                              </span>
                            )}
                            {item.kk_terdaftar && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                                <FileText className="h-3 w-3" />
                                KK Terdaftar
                              </span>
                            )}
                          </div>
                        )}

                        {/* Community Info Box */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                            <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{item.komunitas?.nama || "Komunitas"}</span>
                            {item.komunitas?.jenis && (
                              <span className="text-[10px] font-normal text-slate-500">
                                ({item.komunitas.jenis.replace("_", " ")})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{item.komunitas?.lokasi || "Kota Tegal"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id, userName)}
                          disabled={isPending}
                          className="flex-1 sm:flex-none inline-flex min-h-[40px] w-full sm:w-28 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer active:scale-98 shadow-xs"
                        >
                          {isThisProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>Setujui</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(item.id, userName)}
                          disabled={isPending}
                          className="flex-1 sm:flex-none inline-flex min-h-[40px] w-full sm:w-28 items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-4 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                          {isThisProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          <span>Tolak</span>
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
}

