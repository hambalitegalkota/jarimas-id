"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCode2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { distribusikanDataAnakKePaudAction } from "@/app/actions/data-anak";

export function DistribusiDataAnakTool() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    totalDistributed?: number;
  } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const handleDistribute = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await distribusikanDataAnakKePaudAction();
        if (res.success) {
          setFeedback({
            type: "success",
            message: res.message,
            totalDistributed: res.totalDistributed,
          });
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            message: res.message,
          });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err?.message || "Terjadi kesalahan saat mendistribusikan data anak.",
        });
      }
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold border border-primary/20">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Distribusi Data Anak ke PAUD
              </h3>
              <span className="inline-flex items-center rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider">
                Otomatisasi
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sinkronisasi dan alokasi `komunitas_id` data anak 0–6 tahun yang bersekolah langsung ke Satuan PAUD masing-masing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="inline-flex min-h-[44px] h-11 items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3.5 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-colors cursor-pointer shadow-xs"
          >
            <FileCode2 className="h-4 w-4 text-primary" />
            <span>Skrip SQL</span>
            {showSqlGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDistribute}
            disabled={isPending}
            className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary-hover active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mendistribusikan...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Jalankan Distribusi Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-2.5 rounded-lg p-3.5 text-xs font-semibold border transition-all ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
          )}
          <div className="space-y-0.5">
            <p className="leading-relaxed">{feedback.message}</p>
            {feedback.totalDistributed !== undefined && (
              <p className="text-2xs font-mono text-emerald-600 dark:text-emerald-400">
                Total Alokasi Berhasil: {feedback.totalDistributed} anak
              </p>
            )}
          </div>
        </div>
      )}

      {showSqlGuide && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Migrasi Cepat Database (Supabase SQL Editor)</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Untuk melakukan pembaruan massal (bulk update 7.000+ data sekaligus) dalam hitungan detik tanpa batas kuota serverless, Anda dapat menjalankan skrip migrasi yang telah kami siapkan di file:
          </p>
          <div className="rounded-lg bg-card border border-border text-foreground p-3 font-mono text-2xs select-all overflow-x-auto shadow-xs">
            supabase/migration_distribusi_data_anak_ke_paud.sql
          </div>
          <p className="text-muted-foreground text-2xs">
            Skrip tersebut otomatis memetakan seluruh nama sekolah (KB, TK, RA, SPS, TPA) ke ID komunitas PAUD resmi di Kota Tegal.
          </p>
        </div>
      )}
    </div>
  );
}
