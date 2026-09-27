"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
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

    const { data, error } = await supabase
      .from("anggota_komunitas")
      .select(`
        id,
        user_id,
        komunitas_id,
        peran,
        status,
        created_at,
        profiles (
          id,
          nama_lengkap,
          email,
          avatar_url
        ),
        komunitas (
          id,
          nama,
          jenis,
          lokasi
        )
      `)
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

    // Normalisasi struktur data hasil join
    const items: PendingApprovalItem[] = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      komunitas_id: row.komunitas_id,
      peran: row.peran || "Anggota",
      status: row.status,
      created_at: row.created_at,
      profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
      komunitas: Array.isArray(row.komunitas) ? row.komunitas[0] : row.komunitas,
    }));

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
