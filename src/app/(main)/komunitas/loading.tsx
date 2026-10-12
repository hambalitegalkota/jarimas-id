import { Loader2 } from "lucide-react";

export default function KomunitasLoading() {
  return (
    <div className="flex flex-col flex-1 px-4 py-8 sm:px-6 md:px-8 gap-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-60 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-4 w-96 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-9 w-32 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        <div className="h-9 w-32 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      </div>

      {/* Cards List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 sm:w-64 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3.5 w-36 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
