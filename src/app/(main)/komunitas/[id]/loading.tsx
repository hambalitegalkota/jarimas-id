import { ArrowLeft, Loader2 } from "lucide-react";

export default function KomunitasDetailLoading() {
  return (
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-6 animate-in fade-in duration-200">
      {/* Back Navigation Bar Skeleton */}
      <div className="flex items-center justify-between">
        <div className="inline-flex h-9 items-center gap-2 rounded-md bg-card border border-border px-3.5 text-xs font-mono font-semibold text-muted-foreground shadow-xs">
          <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Kembali ke Komunitas</span>
        </div>
      </div>

      {/* Hero Header Card Skeleton */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            {/* Community Icon Skeleton */}
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />

            <div className="space-y-2.5">
              {/* Badge & Location */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-36 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>

              {/* Title */}
              <div className="h-7 w-48 sm:w-72 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />

              {/* Sub-info */}
              <div className="flex items-center gap-3">
                <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                <div className="h-4 w-20 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Action button skeleton */}
          <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </section>

      {/* Link Cards Skeleton */}
      <div className="space-y-3.5">
        <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-48 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3.5 w-64 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse hidden sm:block" />
        </div>

        <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-44 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3.5 w-60 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse hidden sm:block" />
        </div>
      </div>

      {/* Accordion / Feed Skeleton */}
      <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-44 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      </div>
    </div>
  );
}
