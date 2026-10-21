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
    <div className="flex rounded-lg bg-card p-1 border border-border shadow-xs gap-1">
      {/* Tab 1: Kabar Warga */}
      <button
        type="button"
        onClick={() => handleTabChange("kabar")}
        disabled={isPending}
        className={cn(
          "flex-1 inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-98 text-center",
          currentTab === "kabar"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
        <span>Kabar Warga</span>
        {totalFeedCount > 0 && (
          <span
            className={cn(
              "hidden sm:inline-flex rounded-full px-1.5 py-0.2 text-[10px] font-mono",
              currentTab === "kabar"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
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
          "flex-1 inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-98 text-center relative",
          currentTab === "percakapan"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <MessageCircle className="h-3.5 w-3.5 shrink-0" />
        <span>Percakapan</span>
        {effectiveUnread > 0 ? (
          <span className="relative flex items-center justify-center">
            <span className="rounded-full bg-secondary text-secondary-foreground px-1.5 py-0.2 text-[10px] font-mono font-bold shadow-xs animate-pulse">
              {effectiveUnread > 99 ? "99+" : effectiveUnread}
            </span>
          </span>
        ) : (
          <span
            className={cn(
              "hidden sm:inline-flex rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase",
              currentTab === "percakapan"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/10 text-primary border border-primary/20"
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
          "flex-1 inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-98 text-center",
          currentTab === "warga"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Users className="h-3.5 w-3.5 shrink-0" />
        <span>Daftar Warga</span>
        {totalCitizensCount > 0 && (
          <span
            className={cn(
              "hidden sm:inline-flex rounded-full px-1.5 py-0.2 text-[10px] font-mono",
              currentTab === "warga"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {totalCitizensCount}
          </span>
        )}
      </button>
    </div>
  );
}
