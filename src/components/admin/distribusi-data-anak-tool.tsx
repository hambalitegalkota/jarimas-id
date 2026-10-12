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
    <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Distribusi Data Anak ke PAUD
              </h3>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-xs font-bold">
                OTOMATISASI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinkronisasi dan alokasi `komunitas_id` data anak 0–6 tahun yang bersekolah langsung ke Satuan PAUD masing-masing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileCode2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Skrip SQL</span>
            {showSqlGuide ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <button
            type="button"
            onClick={handleDistribute}
            disabled={isPending}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-blue-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Mendistribusikan...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Jalankan Distribusi Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-bold border-2 transition-all ${
            feedback.type === "success"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="leading-relaxed">{feedback.message}</p>
            {feedback.totalDistributed !== undefined && (
              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                Total Alokasi Berhasil: {feedback.totalDistributed} anak
              </p>
            )}
          </div>
        </div>
      )}

      {showSqlGuide && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Migrasi Cepat Database (Supabase SQL Editor)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Untuk melakukan pembaruan massal (bulk update 7.000+ data sekaligus) dalam hitungan detik tanpa batas kuota serverless, Anda dapat menjalankan skrip migrasi yang telah kami siapkan di file:
          </p>
          <div className="rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-[11px] select-all overflow-x-auto">
            supabase/migration_distribusi_data_anak_ke_paud.sql
          </div>
          <p className="text-slate-500 text-[11px]">
            Skrip tersebut otomatis memetakan seluruh nama sekolah (KB, TK, RA, SPS, TPA) ke ID komunitas PAUD resmi di Kota Tegal.
          </p>
        </div>
      )}
    </div>
  );
}
