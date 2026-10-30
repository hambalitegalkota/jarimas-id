"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleQuestion, Loader2, Sparkles } from "lucide-react";
import { ChatDrawerModal } from "@/components/warga/chat-drawer-modal";
import { getAdminPusatProfile } from "@/app/actions/pertemanan";
import type { RegisteredUserItem } from "@/types/database";
import { cn } from "@/lib/utils";

interface TanyaAdminButtonProps {
  currentUserId?: string | null;
  adminPusatInitial?: RegisteredUserItem | null;
  variant?: "header" | "nav" | "badge";
  className?: string;
  showTextOnMobile?: boolean;
}

const FALLBACK_ADMIN_PUSAT: RegisteredUserItem = {
  id: "1e729af1-f5b8-4a4d-983a-13a0253c6838",
  nama_lengkap: "Admin Pusat Jarimas Indonesia",
  email: "jarimas.id@gmail.com",
  is_admin_pusat: true,
  is_super_admin: false,
  created_at: new Date().toISOString(),
  komunitas_list: [
    {
      id: "pusat",
      nama: "Admin Pusat Jarimas Indonesia",
      jenis: "warga_kita",
      peran: "Admin Pusat",
    },],
};

const FALLBACK_SUPER_ADMIN: RegisteredUserItem = {
  id: "f4d9ea89-1752-4be5-a407-f5e79ea1c9e1",
  nama_lengkap: "hambali hidayat",
  email: "hambali.tegalkota@gmail.com",
  is_admin_pusat: false,
  is_super_admin: true,
  created_at: new Date().toISOString(),
  komunitas_list: [
    {
      id: "superadmin",
      nama: "Super Admin Jarimas",
      jenis: "warga_kita",
      peran: "Super Admin",
    },],
};

export function TanyaAdminButton({
  currentUserId,
  adminPusatInitial,
  variant = "header",
  className,
  showTextOnMobile = false,
}: TanyaAdminButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState<RegisteredUserItem | null>(
    adminPusatInitial || null
  );

  const handleClick = async () => {
    // 1. Pengguna belum registrasi / login
    if (!currentUserId) {
      const confirmLogin = window.confirm(
        "Silakan masuk atau registrasi terlebih dahulu untuk memulai percakapan langsung dengan Admin Pusat Jarimas Indonesia."
      );
      if (confirmLogin) {
        router.push("/login");
      }
      return;
    }

    // 2. Ambil profil admin pusat jika belum tersedia
    let admin = targetAdmin;
    if (!admin) {
      setIsLoading(true);
      try {
        const fetched = await getAdminPusatProfile();
        admin = fetched || FALLBACK_ADMIN_PUSAT;
        setTargetAdmin(admin);
      } catch (err) {
        console.error("Gagal mengambil profil admin pusat:", err);
        admin = FALLBACK_ADMIN_PUSAT;
        setTargetAdmin(admin);
      } finally {
        setIsLoading(false);
      }
    }

    // 3. Jika pengguna yang sedang login adalah Admin Pusat itu sendiri, alihkan ke Super Admin
    if (admin && currentUserId === admin.id) {
      admin = FALLBACK_SUPER_ADMIN;
      setTargetAdmin(admin);
    }

    setIsOpen(true);
  };

  return (
    <>
      {variant === "header" && (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          title="Tanya Admin: Mulai percakapan langsung dengan Admin Pusat Jarimas Indonesia"
          className={cn(
            "inline-flex min-h-[36px] sm:min-h-[40px] items-center gap-1.5 sm:gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-95 text-white px-2.5 sm:px-3.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer border border-teal-500/30",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
          ) : (
            <MessageCircleQuestion className="h-4 w-4 text-amber-300 shrink-0" />
          )}
          <span className={cn(showTextOnMobile ? "inline" : "hidden sm:inline")}>
            Tanya Admin
          </span>
          <span className="hidden md:inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      )}

      {variant === "nav" && (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          title="Mulai percakapan langsung dengan Admin Pusat"
          className={cn(
            "group relative flex h-full flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5 transition-all outline-none cursor-pointer text-muted-foreground hover:text-primary font-medium",
            className
          )}
        >
          <div className="relative">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            ) : (
              <MessageCircleQuestion className="h-5 w-5 text-teal-600 transition-transform group-hover:scale-110" />
            )}
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <span className="text-[10px] tracking-tight font-bold text-teal-700 dark:text-teal-300">
            Tanya Admin
          </span>
        </button>
      )}

      {/* Modal Percakapan Langsung dengan Admin Pusat */}
      {isOpen && (
        <ChatDrawerModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          targetUser={targetAdmin || FALLBACK_ADMIN_PUSAT}
          currentUserId={currentUserId || null}
        />
      )}
    </>
  );
}

