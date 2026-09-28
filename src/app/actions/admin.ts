"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { formatPeranDisplay } from "@/lib/utils";
import type { PendingApprovalItem } from "@/types/database";

/**
 * Helper internal untuk memverifikasi hak akses Super Admin
 */
async function verifySuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Akses tidak sah: Anda harus masuk terlebih dahulu.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_super_admin, nama_lengkap, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_super_admin) {
    throw new Error("Akses ditolak: Fitur ini hanya dapat diakses oleh Super Admin.");
  }

  return { supabase, user, profile };
}

/**
 * Server Action: Mengambil seluruh permohonan anggota komunitas dengan status 'pending'
 */
export async function getPendingApprovals(): Promise<{
  success: boolean;
  message?: string;
  data: PendingApprovalItem[];
}> {
  try {
    const { supabase } = await verifySuperAdmin();

    const { data: rawPending, error } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data pending approvals:", error.message);
      return {
        success: false,
        message: "Gagal memuat daftar persetujuan: " + error.message,
        data: [],
      };
    }

    if (!rawPending || rawPending.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const userIds = [...new Set(rawPending.map((r: any) => r.user_id).filter(Boolean))];
    const komIds = [...new Set(rawPending.map((r: any) => r.komunitas_id).filter(Boolean))];

    const { data: profilesData } =
      userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, nama_lengkap, email")
            .in("id", userIds)
        : { data: [] };

    const { data: komData } =
      komIds.length > 0
        ? await supabase
            .from("komunitas")
            .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi")
            .in("id", komIds)
        : { data: [] };

    const profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
    const komMap = new Map((komData || []).map((k: any) => [k.id, k]));

    // Normalisasi struktur data
    const items: PendingApprovalItem[] = rawPending.map((row: any) => {
      const prof = profileMap.get(row.user_id);
      const kom = komMap.get(row.komunitas_id);

      const namaKomunitas = kom?.nama || "Komunitas Tegal";
      const jenisKomunitas = kom?.jenis || "posyandu";
      const lokasiKomunitas =
        kom?.lokasi ||
        [kom?.kelurahan, kom?.kecamatan, "Kota Tegal"].filter(Boolean).join(", ") ||
        "Kota Tegal";

      return {
        id: row.id,
        user_id: row.user_id,
        komunitas_id: row.komunitas_id,
        peran: formatPeranDisplay(row.peran),
        status: row.status,
        created_at: row.created_at,
        profiles: {
          id: row.user_id,
          nama_lengkap: prof?.nama_lengkap || "Pengguna JARIMAS",
          email: prof?.email || "-",
          avatar_url: null,
        },
        komunitas: {
          id: row.komunitas_id,
          nama: namaKomunitas,
          jenis: jenisKomunitas,
          lokasi: lokasiKomunitas,
        },
      };
    });

    return {
      success: true,
      data: items,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat memverifikasi Super Admin.",
      data: [],
    };
  }
}

/**
 * Server Action: Menyetujui permohonan peran anggota komunitas
 */
export async function approveMemberRole(anggotaId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, user } = await verifySuperAdmin();

    if (!anggotaId) {
      return {
        success: false,
        message: "ID Anggota tidak valid.",
      };
    }

    const { error } = await supabase
      .from("anggota_komunitas")
      .update({
        status: "approved",
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", anggotaId);

    if (error) {
      return {
        success: false,
        message: "Gagal menyetujui permohonan: " + error.message,
      };
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/admin");
    return {
      success: true,
      message: "Permohonan peran anggota berhasil disetujui.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menyetujui permohonan.",
    };
  }
}

/**
 * Server Action: Menolak permohonan peran anggota komunitas
 */
export async function rejectMemberRole(anggotaId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, user } = await verifySuperAdmin();

    if (!anggotaId) {
      return {
        success: false,
        message: "ID Anggota tidak valid.",
      };
    }

    const { error } = await supabase
      .from("anggota_komunitas")
      .update({
        status: "rejected",
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", anggotaId);

    if (error) {
      return {
        success: false,
        message: "Gagal menolak permohonan: " + error.message,
      };
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/admin");
    return {
      success: true,
      message: "Permohonan peran anggota telah ditolak.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menolak permohonan.",
    };
  }
}
