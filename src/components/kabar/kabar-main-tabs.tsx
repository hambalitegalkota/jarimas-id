"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Megaphone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

interface KabarMainTabsProps {
  currentTab: "kabar" | "percakapan";
  totalFeedCount?: number;
  totalUnreadChat?: number;
}

export function KabarMainTabs({
  currentTab = "kabar",
  totalFeedCount = 0,
  totalUnreadChat = 0,
}: KabarMainTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { totalUnreadCount } = useGlobalMessageNotification();

  const effectiveUnread = totalUnreadCount > 0 ? totalUnreadCount : totalUnreadChat;

  const handleTabChange = (newTab: "kabar" | "percakapan") => {
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
    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-card border border-border shadow-xs">
      {/* Tab 1: Kabar */}
      <button
        type="button"
        onClick={() => handleTabChange("kabar")}
        disabled={isPending}
        className={cn(
          "flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer text-center",
          currentTab === "kabar"
            ? "bg-primary text-primary-foreground shadow-xs font-black"
            : "text-muted-foreground hover:text-foreground hover:bg-muted font-semibold"
        )}
      >
        <Megaphone className="h-4 w-4 shrink-0" />
        <span>Kabar</span>
        {totalFeedCount > 0 && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-2xs font-mono font-bold",
              currentTab === "kabar"
                ? "bg-white/20 text-white"
                : "bg-muted-foreground/10 text-muted-foreground"
            )}
          >
            {totalFeedCount}
          </span>
        )}
      </button>

      {/* Tab 2: Percakapan */}
      <button
        type="button"
        onClick={() => handleTabChange("percakapan")}
        disabled={isPending}
        className={cn(
          "flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer text-center relative",
          currentTab === "percakapan"
            ? "bg-primary text-primary-foreground shadow-xs font-black"
            : "text-muted-foreground hover:text-foreground hover:bg-muted font-semibold"
        )}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>Percakapan</span>
        {effectiveUnread > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-amber-500 text-white shadow-xs animate-pulse">
            {effectiveUnread > 99 ? "99+" : effectiveUnread} Pesan
          </span>
        ) : (
          <span
            className={cn(
              "hidden sm:inline-flex px-2 py-0.5 rounded-full text-2xs font-mono font-bold",
              currentTab === "percakapan"
                ? "bg-white/20 text-white"
                : "bg-muted-foreground/10 text-muted-foreground"
            )}
          >
            Aktif
          </span>
        )}
      </button>
    </div>
  );
}
