"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { RAW_POSYANDU_TEGAL } from "@/lib/constants/seed-posyandu-tegal";
import {
  toValidUUID,
  normalizeRoleForDb,
  formatPeranDisplay,
} from "@/lib/utils";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  MembershipStatus,
  JenisKomunitas,
} from "@/types/database";

export interface GetKomunitasListParams {
  jenis?: JenisKomunitas | "semua";
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
  rt?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface GetKomunitasListResult {
  success: boolean;
  message?: string;
  data: KomunitasWithMembership[];
  currentUserId?: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Server Action: Mengambil daftar komunitas dengan filter, pencarian, & paginasi dari Supabase
 */
export async function getKomunitasList(
  params: GetKomunitasListParams = {}
): Promise<GetKomunitasListResult> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const offset = (page - 1) * limit;

  try {
    const supabase = await createClient();

    // 1. Ambil session user aktif jika ada
    let currentUserId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
      }
    } catch {
      // User tamu
    }

    // 2. Query data dari Supabase dengan Count & Pagination
    let query = supabase
      .from("komunitas")
      .select("*", { count: "exact" });

    if (params.jenis && params.jenis !== "semua") {
      query = query.or(`jenis.eq.${params.jenis},jenis_komunitas.eq.${params.jenis}`);
    }
    if (params.kecamatan && params.kecamatan !== "semua") {
      query = query.ilike("kecamatan", params.kecamatan);
    }
    if (params.kelurahan && params.kelurahan !== "semua") {
      query = query.ilike("kelurahan", params.kelurahan);
    }
    if (params.rw && params.rw !== "semua") {
      const cleanRw = params.rw.replace(/\D/g, "").padStart(2, "0");
      query = query.eq("rw", cleanRw);
    }
    if (params.rt && params.rt !== "semua") {
      const cleanRt = params.rt.replace(/\D/g, "").padStart(2, "0");
      query = query.eq("rt", cleanRt);
    }
    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.trim();
      query = query.or(`nama.ilike.%${q}%,nama_komunitas.ilike.%${q}%`);
    }

    query = query.order("nama", { ascending: true }).range(offset, offset + limit - 1);

    const { data: dbData, count, error: dbError } = await query;

    if (dbError) {
      console.warn("Query komunitas error:", dbError.message);
      return {
        success: false,
        message: "Gagal memuat daftar komunitas: " + dbError.message,
        data: [],
        currentUserId,
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 1,
          hasMore: false,
        },
      };
    }

    // 3. Ambil data membership user jika login
    const userMemberships: Record<
      string,
      { id: string; status: MembershipStatus; peran: string }
    > = {};

    if (currentUserId) {
      const { data: memberData } = await supabase
        .from("anggota_komunitas")
        .select("id, komunitas_id, status, peran")
        .eq("user_id", currentUserId);

      if (memberData) {
        memberData.forEach((m) => {
          userMemberships[m.komunitas_id] = {
            id: m.id,
            status: m.status as MembershipStatus,
            peran: m.peran,
          };
        });
      }
    }

    // 4. Ambil hitungan anggota per komunitas
    const { data: memberCounts } = await supabase
      .from("anggota_komunitas")
      .select("komunitas_id")
      .eq("status", "approved");

    const countsMap: Record<string, number> = {};
    if (memberCounts) {
      memberCounts.forEach((m) => {
        countsMap[m.komunitas_id] = (countsMap[m.komunitas_id] || 0) + 1;
      });
    }

    const rawList: any[] = dbData || [];
    const totalCount = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasMore = page < totalPages;

    // 5. Normalisasi data
    const items: KomunitasWithMembership[] = rawList.map((k: any) => {
      const nama = k.nama || k.nama_komunitas || "Komunitas";
      const jenis = k.jenis || k.jenis_komunitas || "posyandu";
      const lokasi =
        k.lokasi ||
        [k.kelurahan, k.kecamatan, "Kota Tegal"].filter(Boolean).join(", ");
      const deskripsi =
        k.deskripsi || `Layanan dan kegiatan ${nama} di ${lokasi}.`;

      return {
        id: k.id,
        nama,
        jenis,
        kecamatan: k.kecamatan,
        kelurahan: k.kelurahan,
        rt: k.rt,
        rw: k.rw,
        lokasi,
        deskripsi,
        logo_url: k.logo_url || null,
        kontak: k.kontak || null,
        jadwal: k.jadwal || null,
        created_at: k.created_at,
        jumlah_anggota: countsMap[k.id] || 0,
        currentUserMembership: userMemberships[k.id] || null,
      };
    });

    return {
      success: true,
      data: items,
      currentUserId,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };
  } catch (err: any) {
    console.error("Error getKomunitasList:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat komunitas.",
      data: [],
      currentUserId: null,
      pagination: {
        page,
        limit,
        totalCount: 0,
        totalPages: 1,
        hasMore: false,
      },
    };
  }
}

/**
 * Server Action: Mengambil detail spesifik satu komunitas
 */
export async function getKomunitasDetail(komunitasId: string): Promise<{
  success: boolean;
  message?: string;
  data: KomunitasWithMembership | null;
  currentUserId?: string | null;
  isAdminOrKader: boolean;
}> {
  try {
    const supabase = await createClient();
    const dbKomunitasId = toValidUUID(komunitasId);

    let currentUserId: string | null = null;
    let isSuperAdmin = false;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        const { data: prof } = await supabase
          .from("profiles")
          .select("is_super_admin")
          .eq("id", user.id)
          .single();
        isSuperAdmin = prof?.is_super_admin === true;
      }
    } catch {
      // User tamu
    }

    // Ambil data komunitas dari database
    const { data: komunitas, error } = await supabase
      .from("komunitas")
      .select("*")
      .eq("id", dbKomunitasId)
      .maybeSingle();

    if (error || !komunitas) {
      return {
        success: false,
        message: "Komunitas tidak ditemukan di database.",
        data: null,
        currentUserId,
        isAdminOrKader: false,
      };
    }

    const nama = komunitas.nama || komunitas.nama_komunitas || "Komunitas";
    const jenis = komunitas.jenis || komunitas.jenis_komunitas || "posyandu";
    const lokasi =
      komunitas.lokasi ||
      [komunitas.kelurahan, komunitas.kecamatan, "Kota Tegal"]
        .filter(Boolean)
        .join(", ");
    const deskripsi =
      komunitas.deskripsi || `Layanan dan kegiatan ${nama} di ${lokasi}.`;

    // Ambil status keanggotaan user saat ini
    let currentUserMembership = null;
    let isPengurusOrKader = false;

    if (currentUserId) {
      const { data: member } = await supabase
        .from("anggota_komunitas")
        .select("id, status, peran")
        .eq("user_id", currentUserId)
        .eq("komunitas_id", dbKomunitasId)
        .maybeSingle();

      if (member) {
        currentUserMembership = {
          id: member.id,
          status: member.status as MembershipStatus,
          peran: member.peran,
        };
        const roleLower = (member.peran || "").toLowerCase();
        if (
          member.status === "approved" &&
          (roleLower.includes("pengurus") ||
            roleLower.includes("kader") ||
            roleLower.includes("admin"))
        ) {
          isPengurusOrKader = true;
        }
      }
    }

    // Hitung jumlah anggota yang disetujui
    const { count } = await supabase
      .from("anggota_komunitas")
      .select("*", { count: "exact", head: true })
      .eq("komunitas_id", dbKomunitasId)
      .eq("status", "approved");

    const fullData: KomunitasWithMembership = {
      id: dbKomunitasId,
      nama,
      jenis,
      kecamatan: komunitas.kecamatan,
      kelurahan: komunitas.kelurahan,
      rt: komunitas.rt,
      rw: komunitas.rw,
      lokasi,
      deskripsi,
      logo_url: komunitas.logo_url || null,
      kontak: komunitas.kontak || null,
      jadwal: komunitas.jadwal || null,
      created_at: komunitas.created_at,
      jumlah_anggota: count || 0,
      currentUserMembership,
    };

    return {
      success: true,
      data: fullData,
      currentUserId,
      isAdminOrKader: isSuperAdmin || isPengurusOrKader,
    };
  } catch (err: any) {
    console.error("Error getKomunitasDetail:", err);
    return {
      success: false,
      message: err.message || "Gagal mengambil detail komunitas.",
      data: null,
      currentUserId: null,
      isAdminOrKader: false,
    };
  }
}

/**
 * Server Action: Mengambil daftar anggota dalam komunitas tertentu
 */
export async function getAnggotaKomunitas(komunitasId: string): Promise<{
  success: boolean;
  data: AnggotaKomunitasDetail[];
  message?: string;
}> {
  try {
    const supabase = await createClient();
    const dbKomunitasId = toValidUUID(komunitasId);

    const { data: rawMembers, error } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, status, created_at")
      .eq("komunitas_id", dbKomunitasId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Query anggota_komunitas error:", error.message);
      return {
        success: false,
        message: "Gagal memuat anggota komunitas: " + error.message,
        data: [],
      };
    }

    if (!rawMembers || rawMembers.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const userIds = [
      ...new Set(rawMembers.map((m: any) => m.user_id).filter(Boolean)),
    ];
    const { data: profilesData } =
      userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, nama_lengkap, email")
            .in("id", userIds)
        : { data: [] };

    const profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

    const items: AnggotaKomunitasDetail[] = rawMembers.map((row: any) => {
      const prof = profileMap.get(row.user_id);
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
      };
    });

    return {
      success: true,
      data: items,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memuat anggota komunitas.",
      data: [],
    };
  }
}

/**
 * Server Action: Mengajukan permintaan bergabung dengan komunitas
 */
export async function requestJoinKomunitas({
  komunitasId,
  peran,
}: {
  komunitasId: string;
  peran: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message:
          "Silakan masuk terlebih dahulu untuk bergabung dengan komunitas.",
      };
    }

    if (!komunitasId || !peran) {
      return {
        success: false,
        message: "Pilih peran keanggotaan Anda.",
      };
    }

    const dbKomunitasId = toValidUUID(komunitasId);
    const dbRole = normalizeRoleForDb(peran);

    // Cek apakah sudah terdaftar sebelumnya
    const { data: existingMember } = await supabase
      .from("anggota_komunitas")
      .select("id, status, peran")
      .eq("user_id", user.id)
      .eq("komunitas_id", dbKomunitasId)
      .maybeSingle();

    if (existingMember) {
      const displayRole = formatPeranDisplay(existingMember.peran);
      if (existingMember.status === "approved") {
        return {
          success: false,
          message: `Anda sudah menjadi anggota aktif sebagai ${displayRole}.`,
        };
      }
      if (existingMember.status === "pending") {
        return {
          success: false,
          message:
            "Permohonan bergabung Anda sudah dikirim dan sedang menunggu verifikasi Pengurus/Kader.",
        };
      }

      // Jika status sebelumnya rejected, perbarui menjadi pending
      const { error: updateError } = await supabase
        .from("anggota_komunitas")
        .update({
          peran: dbRole,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMember.id);

      if (updateError) throw updateError;
    } else {
      // Buat pendaftaran baru
      const { error: insertError } = await supabase
        .from("anggota_komunitas")
        .insert({
          user_id: user.id,
          komunitas_id: dbKomunitasId,
          peran: dbRole,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }

    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/profil");

    return {
      success: true,
      message:
        "Permohonan berhasil dikirim! Menunggu persetujuan Pengurus / Kader Komunitas.",
    };
  } catch (err: any) {
    console.error("Error requestJoinKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal mengajukan permohonan keanggotaan.",
    };
  }
}

/**
 * Server Action: Menyetujui pendaftaran anggota oleh Pengurus / Kader Komunitas
 */
export async function approveMembership(membershipId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Akses ditolak: Silakan login terlebih dahulu.",
      };
    }

    const { data: memberTarget, error: fetchErr } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, user_id, peran")
      .eq("id", membershipId)
      .single();

    if (fetchErr || !memberTarget) {
      return {
        success: false,
        message: "Data permohonan anggota tidak ditemukan.",
      };
    }

    // Cek otorisasi
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    const isSuperAdmin = profile?.is_super_admin === true;

    if (!isSuperAdmin) {
      const { data: userRoleInKom } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", memberTarget.komunitas_id)
        .eq("status", "approved")
        .maybeSingle();

      const roleStr = (userRoleInKom?.peran || "").toLowerCase();
      const isAllowed =
        roleStr.includes("pengurus") ||
        roleStr.includes("kader") ||
        roleStr.includes("admin");

      if (!isAllowed) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Pengurus, Kader, atau Super Admin yang dapat menyetujui anggota.",
        };
      }
    }

    const { error: updateError } = await supabase
      .from("anggota_komunitas")
      .update({
        status: "approved",
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membershipId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal menyetujui anggota: " + updateError.message,
      };
    }

    revalidatePath(`/komunitas/${memberTarget.komunitas_id}/anggota`);
    revalidatePath(`/komunitas/${memberTarget.komunitas_id}`);
    revalidatePath("/admin/approval");

    return {
      success: true,
      message: "Keanggotaan berhasil disetujui!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menyetujui permohonan anggota.",
    };
  }
}

/**
 * Server Action: Menolak pendaftaran anggota oleh Pengurus / Kader Komunitas
 */
export async function rejectMembership(membershipId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Akses ditolak: Silakan login terlebih dahulu.",
      };
    }

    const { data: memberTarget, error: fetchErr } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, user_id, peran")
      .eq("id", membershipId)
      .single();

    if (fetchErr || !memberTarget) {
      return {
        success: false,
        message: "Data permohonan anggota tidak ditemukan.",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    const isSuperAdmin = profile?.is_super_admin === true;

    if (!isSuperAdmin) {
      const { data: userRoleInKom } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", memberTarget.komunitas_id)
        .eq("status", "approved")
        .maybeSingle();

      const roleStr = (userRoleInKom?.peran || "").toLowerCase();
      const isAllowed =
        roleStr.includes("pengurus") ||
        roleStr.includes("kader") ||
        roleStr.includes("admin");

      if (!isAllowed) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Pengurus atau Kader yang dapat menolak anggota.",
        };
      }
    }

    const { error: updateError } = await supabase
      .from("anggota_komunitas")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", membershipId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal menolak permohonan: " + updateError.message,
      };
    }

    revalidatePath(`/komunitas/${memberTarget.komunitas_id}/anggota`);
    revalidatePath(`/komunitas/${memberTarget.komunitas_id}`);
    revalidatePath("/admin/approval");

    return {
      success: true,
      message: "Permohonan keanggotaan telah ditolak.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memproses penolakan anggota.",
    };
  }
}

// Aliases for compatibility
export const approveAnggotaByAdmin = approveMembership;
export const rejectAnggotaByAdmin = rejectMembership;

/**
 * Server Action: Memperbarui peran anggota komunitas
 */
export async function updateMemberRole(
  membershipId: string,
  roleBaru: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Akses ditolak: Silakan login terlebih dahulu.",
      };
    }

    const dbRole = normalizeRoleForDb(roleBaru);

    const { data: targetMember } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id")
      .eq("id", membershipId)
      .single();

    if (!targetMember) {
      return {
        success: false,
        message: "Anggota tidak ditemukan.",
      };
    }

    const { error: updateError } = await supabase
      .from("anggota_komunitas")
      .update({
        peran: dbRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membershipId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal memperbarui peran: " + updateError.message,
      };
    }

    revalidatePath(`/komunitas/${targetMember.komunitas_id}/anggota`);

    return {
      success: true,
      message: `Peran anggota berhasil diperbarui menjadi ${formatPeranDisplay(dbRole)}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memperbarui peran anggota.",
    };
  }
}

/**
 * Server Action: Menyemai seluruh data 230+ Posyandu resmi Kota Tegal ke tabel `komunitas` di Supabase
 */
export async function seedPosyanduToSupabase(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  try {
    const supabase = await createClient();

    const items = RAW_POSYANDU_TEGAL.map((p) => ({
      id: toValidUUID(
        `kom-posyandu-${p.kecamatan.toLowerCase().replace(/\s+/g, "-")}-${p.kelurahan.toLowerCase().replace(/\s+/g, "-")}-${p.nama.toLowerCase().replace(/\s+/g, "-")}`
      ),
      nama: p.nama,
      nama_komunitas: p.nama,
      jenis: "posyandu",
      jenis_komunitas: "posyandu",
      kecamatan: p.kecamatan,
      kelurahan: p.kelurahan,
      lokasi:
        p.lokasi ||
        `Balai Posyandu / RW ${p.rw || "01"}, ${p.kelurahan}, ${p.kecamatan}, Kota Tegal`,
      deskripsi:
        p.deskripsi ||
        `Layanan terpadu Posyandu ${p.nama} ${p.kelurahan}: penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.`,
      kontak: p.kontak || "0813-2233-4455",
      jadwal: p.jadwal || `Setiap Hari Rabu Minggu ke-2 Pukul 08.30 - 11.30 WIB`,
      rt: p.rt || null,
      rw: p.rw || null,
    }));

    const chunkSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("komunitas")
        .upsert(chunk, { onConflict: "id" });

      if (error) {
        throw error;
      }
      totalInserted += chunk.length;
    }

    return {
      success: true,
      insertedCount: totalInserted,
      message: `Berhasil meng-upsert ${totalInserted} Posyandu se-Kota Tegal ke database Supabase.`,
    };
  } catch (err: any) {
    console.error("Error seedPosyanduToSupabase:", err);
    return {
      success: false,
      insertedCount: 0,
      message: err.message || "Gagal menyemai data Posyandu ke Supabase.",
    };
  }
}

/**
 * Server Action: Trigger Penyemaian Data Posyandu
 */
export async function seedAllPosyanduTegalAction(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  const res = await seedPosyanduToSupabase();
  revalidatePath("/komunitas");
  return res;
}
