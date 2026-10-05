"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, Users, MessageCircle, Sparkles, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

interface KabarMainTabsProps {
  currentTab: "kabar" | "percakapan" | "warga";
  totalFeedCount?: number;
  totalUnreadChat?: number;
  totalCitizensCount?: number;
}

export function KabarMainTabs({
  currentTab = "kabar",
  totalFeedCount = 0,
  totalUnreadChat = 0,
  totalCitizensCount = 0,
}: KabarMainTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { totalUnreadCount } = useGlobalMessageNotification();

  const effectiveUnread = totalUnreadCount > 0 ? totalUnreadCount : totalUnreadChat;

  const handleTabChange = (newTab: "kabar" | "percakapan" | "warga") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "kabar") {
      params.delete("tab");
    } else {
      params.set("tab", newTab);
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <div className="flex rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 p-1.5 border-2 border-slate-200 dark:border-slate-800 shadow-sm gap-1.5">
      {/* Tab 1: Kabar Warga */}
      <button
        type="button"
        onClick={() => handleTabChange("kabar")}
        disabled={isPending}
        className={cn(
          "flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-3 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-98 text-center",
          currentTab === "kabar"
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <MessageSquare className="h-4 w-4 shrink-0" />
        <span>Kabar Warga</span>
        {totalFeedCount > 0 && (
          <span
            className={cn(
              "hidden sm:inline-flex rounded-full px-1.5 py-0.2 text-[10px] font-mono",
              currentTab === "kabar"
                ? "bg-emerald-800/80 text-emerald-100"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            )}
          >
            {totalFeedCount}
          </span>
        )}
      </button>

      {/* Tab 2 (Tengah): Percakapan */}
      <button
        type="button"
        onClick={() => handleTabChange("percakapan")}
        disabled={isPending}
        className={cn(
          "flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-3 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-98 text-center relative",
          currentTab === "percakapan"
            ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>Percakapan</span>
        {effectiveUnread > 0 ? (
          <span className="relative flex items-center justify-center">
            <span className="rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-mono font-black shadow-xs ring-1 ring-white/50 animate-pulse">
              {effectiveUnread > 99 ? "99+" : effectiveUnread}
            </span>
          </span>
        ) : (
          <span
            className={cn(
              "hidden sm:inline-flex rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase",
              currentTab === "percakapan"
                ? "bg-emerald-900/60 text-emerald-100"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            )}
          >
            Chat
          </span>
        )}
      </button>

      {/* Tab 3: Daftar Warga */}
      <button
        type="button"
        onClick={() => handleTabChange("warga")}
        disabled={isPending}
        className={cn(
          "flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-3 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-98 text-center",
          currentTab === "warga"
            ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <Users className="h-4 w-4 shrink-0" />
        <span>Daftar Warga</span>
        {totalCitizensCount > 0 && (
          <span
            className={cn(
              "hidden sm:inline-flex rounded-full px-1.5 py-0.2 text-[10px] font-mono",
              currentTab === "warga"
                ? "bg-teal-900/60 text-teal-100"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            )}
          >
            {totalCitizensCount}
          </span>
        )}
      </button>
    </div>
  );
}
