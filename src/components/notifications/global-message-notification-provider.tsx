"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getUnreadMessagesSummary,
  getUserProfileForChat,
  sendPrivateMessage,
  markConversationAsRead,
} from "@/app/actions/pertemanan";
import {
  playNotificationChime,
  triggerNotificationHaptics,
  startTabTitleFlash,
  stopTabTitleFlash,
} from "@/lib/notification-sound";
import type {
  IncomingMessageNotificationItem,
  RegisteredUserItem,
  PesanPribadi,
} from "@/types/database";
import { FloatingMessageNotificationBanner } from "./floating-message-notification-banner";
import { FloatingUnreadDock } from "./floating-unread-dock";
import { ChatDrawerModal } from "@/components/warga/chat-drawer-modal";

interface GlobalMessageNotificationContextType {
  currentUserId: string | null;
  totalUnreadCount: number;
  activeNotification: IncomingMessageNotificationItem | null;
  unreadList: IncomingMessageNotificationItem[];
  isMuted: boolean;
  isPillDismissed: boolean;
  isChatDrawerOpen: boolean;
  activeChatTarget: RegisteredUserItem | null;
  openChatWithUser: (userOrId: RegisteredUserItem | string) => Promise<void>;
  closeChatDrawer: () => void;
  dismissActiveNotification: () => void;
  quickReplyToActive: (replyText: string) => Promise<{ success: boolean; message?: string }>;
  toggleMute: () => void;
  refreshUnreadCount: () => Promise<void>;
  restoreBannerFromPill: () => void;
  dismissPill: () => void;
}

const GlobalMessageNotificationContext =
  createContext<GlobalMessageNotificationContextType | null>(null);

export function useGlobalMessageNotification() {
  const context = useContext(GlobalMessageNotificationContext);
  if (!context) {
    throw new Error(
      "useGlobalMessageNotification must be used within GlobalMessageNotificationProvider"
    );
  }
  return context;
}

export function GlobalMessageNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [unreadList, setUnreadList] = useState<IncomingMessageNotificationItem[]>([]);
  const [activeNotification, setActiveNotification] =
    useState<IncomingMessageNotificationItem | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPillDismissed, setIsPillDismissed] = useState<boolean>(false);

  // Global Chat Modal State
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeChatTarget, setActiveChatTarget] = useState<RegisteredUserItem | null>(
    null
  );

  const activeChatTargetRef = useRef<RegisteredUserItem | null>(null);
  const isChatDrawerOpenRef = useRef<boolean>(false);
  activeChatTargetRef.current = activeChatTarget;
  isChatDrawerOpenRef.current = isChatDrawerOpen;

  // Load mute preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("jarimas_notif_muted");
      if (savedMute === "true") {
        setIsMuted(true);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("jarimas_notif_muted", String(next));
      }
      return next;
    });
  }, []);

  // Fetch unread messages summary from server
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadMessagesSummary();
      if (res.success) {
        setTotalUnreadCount(res.totalUnread);
        setUnreadList(res.unreadList || []);
        if (res.currentUserId) {
          setCurrentUserId(res.currentUserId);
        }
        if (res.totalUnread === 0) {
          stopTabTitleFlash();
        }
      }
    } catch (err) {
      console.warn("Gagal merefresh notifikasi pesan:", err);
    }
  }, []);

  // Handle incoming message trigger
  const handleIncomingMessage = useCallback(
    async (newMsg: PesanPribadi) => {
      // Ignore if sent by self
      if (newMsg.sender_id === currentUserId) return;

      // If user is currently looking at this specific chat drawer, don't show floating banner
      if (
        isChatDrawerOpenRef.current &&
        activeChatTargetRef.current?.id === newMsg.sender_id
      ) {
        refreshUnreadCount();
        return;
      }

      // Play alert chime and haptics
      playNotificationChime(isMuted);
      triggerNotificationHaptics();

      // Fetch sender profile details for rich notification
      let senderInfo: RegisteredUserItem | null = null;
      try {
        const userRes = await getUserProfileForChat(newMsg.sender_id);
        if (userRes.success && userRes.user) {
          senderInfo = userRes.user;
        }
      } catch (err) {
        console.warn("Gagal memuat profil pengirim:", err);
      }

      const senderName =
        senderInfo?.nama_lengkap ||
        (newMsg.sender_id === "00000000-0000-0000-0000-000000000001"
          ? "Jarimas"
          : "Warga Jarimas");

      const senderRole =
        senderInfo?.komunitas_list?.[0]
          ? `${senderInfo.komunitas_list[0].peran} ${senderInfo.komunitas_list[0].nama}`
          : senderInfo?.id === "00000000-0000-0000-0000-000000000001"
          ? "Pusat Layanan Resmi"
          : "Warga";

      const notifItem: IncomingMessageNotificationItem = {
        id: newMsg.id,
        senderId: newMsg.sender_id,
        senderName,
        senderAvatar: senderInfo?.avatar_url || null,
        senderRole,
        senderCommunity: senderInfo?.komunitas_list?.[0]?.nama,
        pesan: newMsg.pesan,
        createdAt: newMsg.created_at || new Date().toISOString(),
        partnerUser: senderInfo || {
          id: newMsg.sender_id,
          nama_lengkap: senderName,
          avatar_url: senderInfo?.avatar_url || null,
          is_super_admin: false,
          created_at: new Date().toISOString(),
        },
      };

      setActiveNotification(notifItem);
      setIsPillDismissed(false);
      setTotalUnreadCount((prev) => prev + 1);
      setUnreadList((prev) => [notifItem, ...prev]);

      // Flash browser tab title to alert user
      startTabTitleFlash(senderName, totalUnreadCount + 1);
    },
    [currentUserId, isMuted, totalUnreadCount, refreshUnreadCount]
  );

  // Inisialisasi Auth & Supabase Realtime Listener
  useEffect(() => {
    let channel: any = null;
    let authSub: any = null;
    let isMounted = true;

    async function init() {
      try {
        const supabase = createClient();

        // 1. Ambil user saat ini
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (isMounted) {
          if (user) {
            setCurrentUserId(user.id);
            refreshUnreadCount();
          } else {
            setCurrentUserId(null);
            setTotalUnreadCount(0);
            setUnreadList([]);
            setActiveNotification(null);
          }
        }

        // 2. Listen ke perubahan auth login/logout
        const authListener = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              setCurrentUserId(session.user.id);
              refreshUnreadCount();
            } else {
              setCurrentUserId(null);
              setTotalUnreadCount(0);
              setUnreadList([]);
              setActiveNotification(null);
              stopTabTitleFlash();
            }
          }
        );
        authSub = authListener.data.subscription;

        // 3. Supabase Realtime Subscription untuk pesan pribadi masuk
        if (user) {
          channel = supabase
            .channel(`global_message_notifications_${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "pesan_pribadi",
              },
              (payload: any) => {
                const newMsg = payload.new as PesanPribadi;
                if (newMsg && newMsg.receiver_id === user.id) {
                  handleIncomingMessage(newMsg);
                }
              }
            )
            .subscribe();
        }
      } catch (err) {
        console.warn("Realtime notification initialization error:", err);
      }
    }

    init();

    // 4. Polling sinkronisasi ringan saat tab aktif
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden && currentUserId) {
        refreshUnreadCount();
      }
    }, 12000);

    // 5. Visibility change handler
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        refreshUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (authSub) authSub.unsubscribe();
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // Cleanup
        }
      }
    };
  }, [currentUserId, handleIncomingMessage, refreshUnreadCount]);

  // Dismiss floating banner
  const dismissActiveNotification = useCallback(() => {
    setActiveNotification(null);
    stopTabTitleFlash();
  }, []);

  // Quick Reply handler right from notification
  const quickReplyToActive = useCallback(
    async (replyText: string) => {
      if (!activeNotification || !replyText.trim()) {
        return { success: false, message: "Pesan balasan tidak boleh kosong." };
      }

      try {
        const senderId = activeNotification.senderId;
        const res = await sendPrivateMessage({
          receiverId: senderId,
          pesan: replyText.trim(),
        });

        if (res.success) {
          // Tandai obrolan sebagai telah dibaca
          await markConversationAsRead(senderId);
          setActiveNotification(null);
          stopTabTitleFlash();
          refreshUnreadCount();
          return { success: true, message: "Balasan berhasil terkirim!" };
        } else {
          return { success: false, message: res.message || "Gagal mengirim balasan." };
        }
      } catch (err: any) {
        return {
          success: false,
          message: err?.message || "Terjadi kesalahan saat membalas.",
        };
      }
    },
    [activeNotification, refreshUnreadCount]
  );

  // Open full chat modal from any page
  const openChatWithUser = useCallback(
    async (userOrId: RegisteredUserItem | string) => {
      dismissActiveNotification();
      stopTabTitleFlash();

      if (typeof userOrId === "string") {
        try {
          const res = await getUserProfileForChat(userOrId);
          if (res.success && res.user) {
            setActiveChatTarget(res.user);
            setIsChatDrawerOpen(true);
            await markConversationAsRead(userOrId);
            refreshUnreadCount();
          }
        } catch (err) {
          console.error("Gagal membuka chat modal:", err);
        }
      } else {
        setActiveChatTarget(userOrId);
        setIsChatDrawerOpen(true);
        if (userOrId.id) {
          await markConversationAsRead(userOrId.id);
          refreshUnreadCount();
        }
      }
    },
    [dismissActiveNotification, refreshUnreadCount]
  );

  const closeChatDrawer = useCallback(() => {
    setIsChatDrawerOpen(false);
    setActiveChatTarget(null);
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const restoreBannerFromPill = useCallback(() => {
    if (unreadList.length > 0) {
      setActiveNotification(unreadList[0]);
      setIsPillDismissed(false);
    }
  }, [unreadList]);

  const dismissPill = useCallback(() => {
    setIsPillDismissed(true);
  }, []);

  return (
    <GlobalMessageNotificationContext.Provider
      value={{
        currentUserId,
        totalUnreadCount,
        activeNotification,
        unreadList,
        isMuted,
        isPillDismissed,
        isChatDrawerOpen,
        activeChatTarget,
        openChatWithUser,
        closeChatDrawer,
        dismissActiveNotification,
        quickReplyToActive,
        toggleMute,
        refreshUnreadCount,
        restoreBannerFromPill,
        dismissPill,
      }}
    >
      {children}

      {/* 1. Global Floating Incoming Message Banner */}
      {activeNotification && (
        <FloatingMessageNotificationBanner
          notification={activeNotification}
          isMuted={isMuted}
          onDismiss={dismissActiveNotification}
          onQuickReply={quickReplyToActive}
          onOpenFullChat={() => {
            if (activeNotification.partnerUser) {
              openChatWithUser(activeNotification.partnerUser);
            } else {
              openChatWithUser(activeNotification.senderId);
            }
          }}
          onToggleMute={toggleMute}
        />
      )}

      {/* 2. Floating Unread Dock Pill (appears when banner is dismissed but messages remain) */}
      {!activeNotification && totalUnreadCount > 0 && !isPillDismissed && (
        <FloatingUnreadDock
          unreadCount={totalUnreadCount}
          latestUnread={unreadList[0]}
          onClick={() => {
            if (unreadList[0]?.partnerUser) {
              openChatWithUser(unreadList[0].partnerUser);
            } else if (unreadList[0]?.senderId) {
              openChatWithUser(unreadList[0].senderId);
            } else {
              restoreBannerFromPill();
            }
          }}
          onDismiss={dismissPill}
        />
      )}

      {/* 3. Global Integrated Chat Modal (Accessible from any page!) */}
      {isChatDrawerOpen && activeChatTarget && (
        <ChatDrawerModal
          isOpen={isChatDrawerOpen}
          onClose={closeChatDrawer}
          targetUser={activeChatTarget}
          currentUserId={currentUserId}
        />
      )}
    </GlobalMessageNotificationContext.Provider>
  );
}
