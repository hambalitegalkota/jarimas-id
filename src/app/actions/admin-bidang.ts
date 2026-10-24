"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import {
  isSuperAdmin as checkIsSuperAdmin,
  isAdminPusat as checkIsAdminPusat,
  isProtectedSuperAdmin,
  toValidUUID,
  isRoleAdmin,
} from "@/lib/utils";
import {
  DAFTAR_BIDANG_SPM_CONFIG,
  BIDANG_LABEL_MAP,
  BIDANG_SLUG_MAP,
} from "@/lib/constants/admin-bidang";
import type {
  BidangSpmId,
  BidangSpmConfig,
  UserAdminBidangSummary,
} from "@/types/database";

// Re-export constants for backwards compatibility if needed
export { DAFTAR_BIDANG_SPM_CONFIG, BIDANG_LABEL_MAP, BIDANG_SLUG_MAP };

/**
 * Memeriksa hak wewenang pengguna pemanggil:
 * Hanya Super Admin, Admin Pusat, dan Admin Kota yang dapat mengelola Admin Bidang.
 */
async function verifyAdminBidangManagerContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Akses ditolak: Anda harus masuk terlebih dahulu.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
    .eq("id", user.id)
    .maybeSingle();

  const userProfileCtx = {
    ...profile,
    id: user.id,
    email: profile?.email || user.email,
    nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
  };

  const isSuper = checkIsSuperAdmin(userProfileCtx);
  const isPusat = !isSuper && checkIsAdminPusat(userProfileCtx);

  if (isSuper || isPusat) {
    return { supabase, user, isSuperAdmin: isSuper, isAdminPusat: isPusat, isAdminKota: true };
  }

  // Cek apakah pengguna merupakan Admin Kota Tegal
  const { data: kotaMemberships } = await supabase
    .from("anggota_komunitas")
    .select("peran, status, komunitas(nama, jenis)")
    .eq("user_id", user.id)
    .eq("status", "approved");

  const isAdminKota = (kotaMemberships || []).some((m: any) => {
    const peran = (m.peran || "").toLowerCase();
    const komNama = (m.komunitas?.nama || "").toLowerCase();
    return (
      peran.includes("admin kota") ||
      (komNama.includes("warga kota tegal") && isRoleAdmin(peran))
    );
  });

  if (!isAdminKota) {
    throw new Error(
      "Akses ditolak: Hanya Super Admin, Admin Pusat, dan Admin Kota yang berhak mengangkat atau mencabut Admin Bidang."
    );
  }

  return { supabase, user, isSuperAdmin: false, isAdminPusat: false, isAdminKota: true };
}

/**
 * Mengambil daftar seluruh Admin Bidang yang sedang aktif
 */
export async function getAdminBidangListAction(): Promise<{
  success: boolean;
  message?: string;
  data: UserAdminBidangSummary[];
}> {
  try {
    const { supabase } = await verifyAdminBidangManagerContext();

    // 1. Ambil dari anggota_komunitas dengan peran 'Admin Bidang %'
    const { data: memberRows, error: memberErr } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, peran, created_at")
      .ilike("peran", "%Admin Bidang%")
      .eq("status", "approved");

    if (memberErr) {
      console.warn("Gagal query anggota_komunitas admin bidang:", memberErr);
    }

    // 2. Ambil dari tabel admin_bidang jika tabel ada
    let dedicatedRows: any[] = [];
    try {
      const { data: dedicatedData } = await supabase
        .from("admin_bidang")
        .select("id, user_id, bidang, created_at");
      if (dedicatedData) {
        dedicatedRows = dedicatedData;
      }
    } catch {}

    const userBidangMap = new Map<string, Set<BidangSpmId>>();
    const userCreatedAtMap = new Map<string, string>();

    // Mapping dari anggota_komunitas
    (memberRows || []).forEach((row) => {
      const p = (row.peran || "").toLowerCase();
      let matchedBidang: BidangSpmId | null = null;
      if (p.includes("pendidikan")) matchedBidang = "pendidikan";
      else if (p.includes("kesehatan")) matchedBidang = "kesehatan";
      else if (p.includes("pekerjaan umum") || p.includes("pekerjaan_umum")) matchedBidang = "pekerjaan_umum";
      else if (p.includes("perumahan") || p.includes("perumahan_rakyat")) matchedBidang = "perumahan_rakyat";
      else if (p.includes("trantibum") || p.includes("linmas")) matchedBidang = "trantibumlinmas";
      else if (p.includes("sosial")) matchedBidang = "sosial";

      if (matchedBidang) {
        if (!userBidangMap.has(row.user_id)) {
          userBidangMap.set(row.user_id, new Set());
        }
        userBidangMap.get(row.user_id)!.add(matchedBidang);
        if (!userCreatedAtMap.has(row.user_id)) {
          userCreatedAtMap.set(row.user_id, row.created_at);
        }
      }
    });

    // Mapping dari dedicated admin_bidang table
    dedicatedRows.forEach((row) => {
      const bKey = BIDANG_SLUG_MAP[row.bidang.toLowerCase()];
      if (bKey) {
        if (!userBidangMap.has(row.user_id)) {
          userBidangMap.set(row.user_id, new Set());
        }
        userBidangMap.get(row.user_id)!.add(bKey);
        if (!userCreatedAtMap.has(row.user_id)) {
          userCreatedAtMap.set(row.user_id, row.created_at);
        }
      }
    });

    const userIds = Array.from(userBidangMap.keys());
    if (userIds.length === 0) {
      return { success: true, data: [] };
    }

    // Ambil profil seluruh user terkait
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, nomor_hp")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const result: UserAdminBidangSummary[] = userIds.map((uid) => {
      const prof = profileMap.get(uid);
      return {
        userId: uid,
        userName: prof?.nama_lengkap || "Pengguna Terdaftar",
        userEmail: prof?.email || "-",
        userPhone: prof?.nomor_hp || null,
        bidangList: Array.from(userBidangMap.get(uid) || []),
        createdAt: userCreatedAtMap.get(uid) || new Date().toISOString(),
      };
    });

    // Urutkan berdasarkan nama
    result.sort((a, b) => a.userName.localeCompare(b.userName));

    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error("Error getAdminBidangListAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat daftar Admin Bidang.",
      data: [],
    };
  }
}

/**
 * Menetapkan atau memperbarui penugasan Admin Bidang bagi pengguna target
 * - Pengguna cukup berstatus terdaftar (tidak perlu menjadi admin sebelumnya).
 * - Dapat ditetapkan pada satu, beberapa, atau seluruh 6 bidang.
 * - Jika selectedBidang kosong ([]), maka peran Admin Bidang dicabut seutuhnya.
 */
export async function assignAdminBidangAction(
  targetUserId: string,
  selectedBidang: BidangSpmId[]
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, user } = await verifyAdminBidangManagerContext();

    if (!targetUserId) {
      return { success: false, message: "ID Pengguna target tidak valid." };
    }

    // 1. Ambil data profil target
    const { data: targetProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, is_super_admin, is_admin_pusat")
      .eq("id", targetUserId)
      .maybeSingle();

    if (profileErr || !targetProfile) {
      return { success: false, message: "Profil pengguna target tidak ditemukan." };
    }

    // Proteksi Imunitas Super Admin: Akun Super Admin tidak dapat diubah
    if (isProtectedSuperAdmin(targetProfile)) {
      return {
        success: false,
        message:
          "Tindakan ditolak: Akun Super Admin memiliki imunitas mutlak dan tidak dapat dialihkan perannya.",
      };
    }

    const adminClient = createAdminClient() || supabase;

    // Cari ID Komunitas Warga Kota Tegal
    const { data: kotaKom } = await supabase
      .from("komunitas")
      .select("id")
      .ilike("nama", "%Warga Kota Tegal%")
      .maybeSingle();

    const kotaKomId = kotaKom?.id || toValidUUID("kom-warga-kota-tegal");

    // 2. Hapus seluruh peran Admin Bidang lama milik pengguna ini di anggota_komunitas
    await adminClient
      .from("anggota_komunitas")
      .delete()
      .eq("user_id", targetUserId)
      .ilike("peran", "%Admin Bidang%");

    // 3. Masukkan peran Admin Bidang yang dipilih ke anggota_komunitas
    const validBidangList = Array.from(new Set(selectedBidang)).filter((b) =>
      Boolean(BIDANG_LABEL_MAP[b])
    );

    if (validBidangList.length > 0) {
      const insertRows = validBidangList.map((b) => ({
        komunitas_id: kotaKomId,
        user_id: targetUserId,
        peran: BIDANG_LABEL_MAP[b],
        status: "approved",
        approved_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: insertErr } = await adminClient
        .from("anggota_komunitas")
        .insert(insertRows);

      if (insertErr) {
        throw insertErr;
      }
    }

    // 4. Sinkronisasi ke tabel dedicated admin_bidang jika tabel ada
    try {
      await adminClient.from("admin_bidang").delete().eq("user_id", targetUserId);

      if (validBidangList.length > 0) {
        const dedicatedRows = validBidangList.map((b) => ({
          user_id: targetUserId,
          bidang: b,
          assigned_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        await adminClient.from("admin_bidang").insert(dedicatedRows);
      }
    } catch {}

    const targetName = targetProfile.nama_lengkap || targetProfile.email || "Pengguna";
    const actionDesc =
      validBidangList.length > 0
        ? `berhasil ditetapkan sebagai Admin pada ${validBidangList.length} Bidang (${validBidangList.map((b) => BIDANG_LABEL_MAP[b].replace("Admin ", "")).join(", ")})`
        : "berhasil dicabut dari seluruh penugasan Admin Bidang";

    revalidatePath("/profil");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");

    return {
      success: true,
      message: `Akun ${targetName} ${actionDesc}!`,
    };
  } catch (err: any) {
    console.error("Error assignAdminBidangAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memperbarui penetapan Admin Bidang.",
    };
  }
}

/**
 * Mencabut seluruh atau satu bidang penugasan Admin Bidang dari pengguna target
 */
export async function revokeAdminBidangAction(
  targetUserId: string,
  bidangId?: BidangSpmId
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, user } = await verifyAdminBidangManagerContext();

    if (!targetUserId) {
      return { success: false, message: "ID Pengguna target tidak valid." };
    }

    const adminClient = createAdminClient() || supabase;

    if (bidangId) {
      const targetLabel = BIDANG_LABEL_MAP[bidangId];
      if (targetLabel) {
        await adminClient
          .from("anggota_komunitas")
          .delete()
          .eq("user_id", targetUserId)
          .eq("peran", targetLabel);

        try {
          await adminClient
            .from("admin_bidang")
            .delete()
            .eq("user_id", targetUserId)
            .eq("bidang", bidangId);
        } catch {}
      }
    } else {
      await adminClient
        .from("anggota_komunitas")
        .delete()
        .eq("user_id", targetUserId)
        .ilike("peran", "%Admin Bidang%");

      try {
        await adminClient.from("admin_bidang").delete().eq("user_id", targetUserId);
      } catch {}
    }

    revalidatePath("/profil");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");

    return {
      success: true,
      message: "Penugasan Admin Bidang berhasil dicabut.",
    };
  } catch (err: any) {
    console.error("Error revokeAdminBidangAction:", err);
    return {
      success: false,
      message: err.message || "Gagal mencabut Admin Bidang.",
    };
  }
}
