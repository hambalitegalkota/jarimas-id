import React from "react";
import { cn } from "@/lib/utils";

export interface PageSkeletonProps {
  className?: string;
  variant?: "dashboard" | "list" | "detail";
  hasHeroBanner?: boolean;
  hasTabs?: boolean;
}

export function PageSkeleton({
  className,
  variant = "dashboard",
  hasHeroBanner = true,
  hasTabs = true,
}: PageSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24 animate-in fade-in duration-200",
        className
      )}
    >
      {/* 1. Breadcrumb / Back Button Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <div className="h-4 w-32 rounded-md bg-slate-300 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse hidden sm:block" />
      </div>

      {/* 2. Hero Banner Skeleton */}
      {hasHeroBanner && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3 max-w-2xl flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-5 w-28 rounded-full bg-white/15 animate-pulse" />
                <div className="h-4 w-36 rounded-md bg-white/10 animate-pulse" />
              </div>
              <div className="h-8 sm:h-10 w-3/4 rounded-2xl bg-white/20 animate-pulse" />
              <div className="space-y-1.5 pt-1">
                <div className="h-3.5 w-full rounded-md bg-white/10 animate-pulse" />
                <div className="h-3.5 w-4/5 rounded-md bg-white/10 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-28 rounded-2xl bg-white/15 animate-pulse shrink-0 hidden md:block" />
          </div>
        </div>
      )}

      {/* 3. Level / Filter / Tabs Skeleton */}
      {hasTabs && (
        <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-3.5 w-28 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-48 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="h-9 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-9 rounded-xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />
            <div className="h-9 rounded-xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      )}

      {/* 4. Variant-Specific Content Skeletons */}
      {variant === "dashboard" && (
        <div className="space-y-5">
          {/* Section Heading Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 animate-pulse" />
              <div className="h-6 w-56 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-8 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>

          {/* 2-Column Responsive Metric Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {[1, 2].map((cardIdx) => (
              <div
                key={cardIdx}
                className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-36 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      <div className="h-3 w-48 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-7 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>

                {/* Circle & Bars Shimmer */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
                  <div className="sm:col-span-5 flex justify-center">
                    <div className="h-28 w-28 rounded-full border-8 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 animate-pulse flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    </div>
                  </div>
                  <div className="sm:col-span-7 space-y-2.5">
                    <div className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-pulse" />
                    <div className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-pulse" />
                    <div className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === "list" && (
        <div className="space-y-3.5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 sm:w-64 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-3.5 w-36 sm:w-44 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                </div>
              </div>
              <div className="h-9 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse hidden sm:block shrink-0" />
            </div>
          ))}
        </div>
      )}

      {variant === "detail" && (
        <div className="space-y-4">
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>
            </div>
            <div className="h-20 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
