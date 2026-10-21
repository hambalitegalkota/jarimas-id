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
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      {/* Master Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-muted/50 cursor-pointer focus:outline-none min-h-[44px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-bold text-sm",
              totalPending > 0
                ? "bg-secondary/10 border-secondary/30 text-secondary"
                : "bg-primary/10 border-primary/30 text-primary"
            )}
          >
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">
                Monitoring Seluruh Permohonan Wilayah
              </h3>
              <span className="text-[11px] font-semibold text-muted-foreground">
                (4 Kecamatan)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pantau dan kelola seluruh permohonan berjenjang (RT, RW, Kelurahan, Kecamatan, Satuan PAUD, Posyandu) dalam satu panel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-lg font-bold font-mono border",
              totalPending > 0
                ? "bg-secondary/10 text-secondary border-secondary/30"
                : "bg-muted text-muted-foreground border-border"
            )}
          >
            {totalPending} PERMOHONAN
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
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
        <div className="p-4 sm:p-5 pt-3 border-t border-border space-y-4 bg-muted/20">
          {/* Feedback Banner */}
          {feedback && (
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-lg p-3 text-xs font-semibold border transition-all shadow-xs",
                feedback.type === "success"
                  ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
                  : "border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
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
                className="text-[10px] uppercase font-bold underline cursor-pointer hover:opacity-80"
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
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-98 min-h-[38px]",
                selectedKecamatan === "semua"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              )}
            >
              <span>Semua</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] rounded-md font-mono font-bold",
                  selectedKecamatan === "semua"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
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
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-98 min-h-[38px]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  )}
                >
                  <span>{kec}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] rounded-md font-mono font-bold",
                        isActive
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-secondary/15 text-secondary border border-secondary/30"
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
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-98 min-h-[38px]",
                  selectedKecamatan === "Lainnya"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                )}
              >
                <span>Lainnya</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-md font-mono font-bold bg-secondary/15 text-secondary border border-secondary/30">
                  {groupedByKecamatan["Lainnya"].length}
                </span>
              </button>
            )}
          </div>

          {/* List of Applications */}
          {displayedItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border bg-card">
              {selectedKecamatan === "semua"
                ? "Tidak ada permohonan berjenjang yang menunggu persetujuan."
                : `Tidak ada permohonan berjenjang di Kecamatan ${selectedKecamatan}.`}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((item) => {
                const isThisProcessing = isPending && processingId === item.id;
                const userName = item.profiles?.nama_lengkap || "Pengguna JARIMAS";
                const cleanPhone = (item.profiles?.nomor_hp || "").replace(/[^0-9]/g, "");
                const waPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-xs hover:border-primary/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: Info */}
                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Tier Badge */}
                          <span
                            className={cn(
                              "text-[10px] px-2.5 py-0.5 rounded-lg font-bold uppercase border",
                              item.tierLevel === "RT" && "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
                              item.tierLevel === "RW" && "bg-primary/10 text-primary border-primary/30",
                              item.tierLevel === "Kelurahan" && "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
                              item.tierLevel === "Kecamatan" && "bg-secondary/10 text-secondary border-secondary/30",
                              item.tierLevel === "Satuan PAUD" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
                              item.tierLevel === "Posyandu" && "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
                              !item.tierLevel && "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            TINGKAT {item.tierLevel?.toUpperCase() || "KOMUNITAS"}
                          </span>

                          {/* Role Tag */}
                          <span className="text-[10px] px-2.5 py-0.5 rounded-lg font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                            {item.peran}
                          </span>

                          {item.targetApproverTitle && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border font-medium">
                              Wewenang: {item.targetApproverTitle}
                            </span>
                          )}
                        </div>

                        {/* Name & Contacts */}
                        <div>
                          <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                            <span>{userName}</span>
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono mt-0.5">
                            <span>{item.profiles?.email || "-"}</span>
                            {item.profiles?.nomor_hp && (
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
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
                            <span className="text-[11px] text-muted-foreground font-medium">Hasil Survey:</span>
                            {item.berdomisili && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                <Home className="h-3 w-3" />
                                Berdomisili Disini
                              </span>
                            )}
                            {item.kk_terdaftar && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                <FileText className="h-3 w-3" />
                                KK Terdaftar
                              </span>
                            )}
                          </div>
                        )}

                        {/* Community Info Box */}
                        <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{item.komunitas?.nama || "Komunitas"}</span>
                            {item.komunitas?.jenis && (
                              <span className="text-[10px] font-normal text-muted-foreground">
                                ({item.komunitas.jenis.replace("_", " ")})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
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
                          className="flex-1 sm:flex-none inline-flex min-h-[44px] h-11 w-full sm:w-28 items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 text-xs font-bold text-primary-foreground transition-all disabled:opacity-50 cursor-pointer active:scale-98 shadow-xs"
                        >
                          {isThisProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <span>Setujui</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(item.id, userName)}
                          disabled={isPending}
                          className="flex-1 sm:flex-none inline-flex min-h-[44px] h-11 w-full sm:w-28 items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                          {isThisProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
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

