"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { MASTER_KOMUNITAS_SEED } from "@/lib/constants/tegal-data";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  MembershipStatus,
  JenisKomunitas,
} from "@/types/database";

interface GetKomunitasListParams {
  jenis?: JenisKomunitas | "semua";
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
}

/**
 * Server Action: Mengambil daftar komunitas dengan filter & status keanggotaan pengguna
 */
export async function getKomunitasList(
  params: GetKomunitasListParams = {}
): Promise<{
  success: boolean;
  message?: string;
  data: KomunitasWithMembership[];
  currentUserId?: string | null;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil session user aktif
    let currentUserId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
      }
    } catch {
      // User tamu belum login
    }

    // 2. Query data dari Supabase
    let query = supabase.from("komunitas").select("*");

    if (params.jenis && params.jenis !== "semua") {
      query = query.eq("jenis", params.jenis);
    }
    if (params.kecamatan && params.kecamatan !== "semua") {
      query = query.eq("kecamatan", params.kecamatan);
    }
    if (params.kelurahan && params.kelurahan !== "semua") {
      query = query.eq("kelurahan", params.kelurahan);
    }
    if (params.rw && params.rw !== "semua") {
      const cleanRw = params.rw.replace(/\D/g, "").padStart(2, "0");
      query = query.eq("rw", cleanRw);
    }

    const { data: dbData, error: dbError } = await query;

    // Ambil data membership user jika login
    let userMemberships: Record<
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

    // Ambil hitungan anggota per komunitas
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

    let rawList = dbData || [];

    // Jika database masih kosong atau ada error tabel, gunakan master seed data Kota Tegal
    if (dbError || rawList.length === 0) {
      rawList = MASTER_KOMUNITAS_SEED.filter((item) => {
        if (params.jenis && params.jenis !== "semua" && item.jenis !== params.jenis) {
          return false;
        }
        if (
          params.kecamatan &&
          params.kecamatan !== "semua" &&
          item.kecamatan.toLowerCase() !== params.kecamatan.toLowerCase()
        ) {
          return false;
        }
        if (
          params.kelurahan &&
          params.kelurahan !== "semua" &&
          item.kelurahan.toLowerCase() !== params.kelurahan.toLowerCase()
        ) {
          return false;
        }
        if (params.rw && params.rw !== "semua") {
          const cleanParamRw = params.rw.replace(/\D/g, "").padStart(2, "0");
          const itemRw = (item.rw || "").replace(/\D/g, "").padStart(2, "0");
          if (cleanParamRw && itemRw && cleanParamRw !== itemRw) {
            return false;
          }
        }
        return true;
      });
    }

    // 3. Gabungkan info keanggotaan dan jumlah anggota
    const items: KomunitasWithMembership[] = rawList.map((k) => ({
      id: k.id,
      nama: k.nama,
      jenis: k.jenis,
      kecamatan: k.kecamatan,
      kelurahan: k.kelurahan,
      rt: k.rt,
      rw: k.rw,
      lokasi: k.lokasi,
      deskripsi: k.deskripsi,
      logo_url: k.logo_url,
      kontak: k.kontak,
      jadwal: k.jadwal,
      created_at: k.created_at,
      jumlah_anggota: countsMap[k.id] || (k.jenis === "posyandu" ? 12 : 24),
      currentUserMembership: userMemberships[k.id] || null,
    }));

    return {
      success: true,
      data: items,
      currentUserId,
    };
  } catch (err: any) {
    console.error("Error getKomunitasList:", err);
    // Fallback seed data saat offline atau error koneksi
    const fallbackList: KomunitasWithMembership[] = MASTER_KOMUNITAS_SEED.filter(
      (item) => {
        if (params.jenis && params.jenis !== "semua" && item.jenis !== params.jenis) {
          return false;
        }
        if (
          params.kecamatan &&
          params.kecamatan !== "semua" &&
          item.kecamatan.toLowerCase() !== params.kecamatan.toLowerCase()
        ) {
          return false;
        }
        if (
          params.kelurahan &&
          params.kelurahan !== "semua" &&
          item.kelurahan.toLowerCase() !== params.kelurahan.toLowerCase()
        ) {
          return false;
        }
        if (params.rw && params.rw !== "semua") {
          const cleanParamRw = params.rw.replace(/\D/g, "").padStart(2, "0");
          const itemRw = (item.rw || "").replace(/\D/g, "").padStart(2, "0");
          if (cleanParamRw && itemRw && cleanParamRw !== itemRw) {
            return false;
          }
        }
        return true;
      }
    ).map((k) => ({
      ...k,
      jumlah_anggota: k.jenis === "posyandu" ? 12 : 24,
      currentUserMembership: null,
    }));

    return {
      success: true,
      data: fallbackList,
      currentUserId: null,
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
        message: "Silakan masuk terlebih dahulu untuk bergabung dengan komunitas.",
      };
    }

    if (!komunitasId || !peran) {
      return {
        success: false,
        message: "Pilih peran keanggotaan Anda.",
      };
    }

    // Pastikan komunitas terdaftar di database (upsert dari seed jika belum ada)
    const seedItem = MASTER_KOMUNITAS_SEED.find((k) => k.id === komunitasId);
    if (seedItem) {
      await supabase.from("komunitas").upsert(
        {
          id: seedItem.id,
          nama: seedItem.nama,
          jenis: seedItem.jenis,
          kecamatan: seedItem.kecamatan,
          kelurahan: seedItem.kelurahan,
          rt: seedItem.rt,
          rw: seedItem.rw,
          lokasi: seedItem.lokasi,
          deskripsi: seedItem.deskripsi,
          kontak: seedItem.kontak,
          jadwal: seedItem.jadwal,
        },
        { onConflict: "id" }
      );
    }

    // Cek apakah sudah terdaftar sebelumnya
    const { data: existingMember } = await supabase
      .from("anggota_komunitas")
      .select("id, status, peran")
      .eq("user_id", user.id)
      .eq("komunitas_id", komunitasId)
      .maybeSingle();

    if (existingMember) {
      if (existingMember.status === "approved") {
        return {
          success: false,
          message: `Anda sudah menjadi anggota aktif sebagai ${existingMember.peran}.`,
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
      await supabase
        .from("anggota_komunitas")
        .update({
          peran: peran,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMember.id);
    } else {
      // Buat pendaftaran baru
      const { error: insertError } = await supabase
        .from("anggota_komunitas")
        .insert({
          user_id: user.id,
          komunitas_id: komunitasId,
          peran: peran,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }
    }

    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/profil");

    return {
      success: true,
      message: `Permohonan bergabung sebagai ${peran} berhasil dikirim! Menunggu persetujuan Pengurus.`,
    };
  } catch (err: any) {
    console.error("Error requestJoinKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal mengirim permohonan bergabung.",
    };
  }
}

/**
 * Server Action: Mengambil detail informasi komunitas & status otorisasi pengurus
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

    // Ambil data komunitas
    let { data: komunitas } = await supabase
      .from("komunitas")
      .select("*")
      .eq("id", komunitasId)
      .maybeSingle();

    if (!komunitas) {
      komunitas = MASTER_KOMUNITAS_SEED.find((k) => k.id === komunitasId) || null;
    }

    if (!komunitas) {
      return {
        success: false,
        message: "Komunitas tidak ditemukan.",
        data: null,
        currentUserId,
        isAdminOrKader: false,
      };
    }

    // Ambil status keanggotaan user saat ini
    let currentUserMembership = null;
    let isPengurusOrKader = false;

    if (currentUserId) {
      const { data: member } = await supabase
        .from("anggota_komunitas")
        .select("id, status, peran")
        .eq("user_id", currentUserId)
        .eq("komunitas_id", komunitasId)
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

    // Hitung jumlah anggota
    const { count } = await supabase
      .from("anggota_komunitas")
      .select("*", { count: "exact", head: true })
      .eq("komunitas_id", komunitasId)
      .eq("status", "approved");

    const fullData: KomunitasWithMembership = {
      ...komunitas,
      jumlah_anggota: count || (komunitas.jenis === "posyandu" ? 12 : 24),
      currentUserMembership,
    };

    return {
      success: true,
      data: fullData,
      currentUserId,
      isAdminOrKader: isSuperAdmin || isPengurusOrKader,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memuat detail komunitas.",
      data: null,
      currentUserId: null,
      isAdminOrKader: false,
    };
  }
}

/**
 * Server Action: Mengambil daftar anggota komunitas (approved & pending)
 */
/**
 * Helper: Generate realistic seed members for communities in demonstration mode
 */
function generateSeedMembersForKomunitas(
  komunitasId: string
): AnggotaKomunitasDetail[] {
  const seedKomunitas = MASTER_KOMUNITAS_SEED.find((k) => k.id === komunitasId);
  const jenis = seedKomunitas?.jenis || "warga_kita";
  const kelurahan = seedKomunitas?.kelurahan || "Kota Tegal";

  if (jenis === "posyandu") {
    return [
      {
        id: `member-${komunitasId}-1`,
        user_id: `user-kader-1`,
        komunitas_id: komunitasId,
        peran: "Kader Posyandu",
        status: "approved",
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        profiles: {
          id: "user-kader-1",
          nama_lengkap: `Ibu Siti Rahmawati (Ketua Kader ${kelurahan})`,
          email: "siti.kader@jarimas.tegal.id",
          avatar_url: null,
        },
      },
      {
        id: `member-${komunitasId}-2`,
        user_id: `user-bidan-1`,
        komunitas_id: komunitasId,
        peran: "Bidan / Tenaga Kesehatan",
        status: "approved",
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        profiles: {
          id: "user-bidan-1",
          nama_lengkap: `Bidan Nurul Hidayah, A.Md.Keb`,
          email: "nurul.bidan@jarimas.tegal.id",
          avatar_url: null,
        },
      },
      {
        id: `member-${komunitasId}-3`,
        user_id: `user-warga-1`,
        komunitas_id: komunitasId,
        peran: "Orang Tua / Ibu Balita",
        status: "approved",
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        profiles: {
          id: "user-warga-1",
          nama_lengkap: "Ratna Dewi Sartika",
          email: "ratna.dewi@gmail.com",
          avatar_url: null,
        },
      },
      {
        id: `member-${komunitasId}-4`,
        user_id: `user-warga-2`,
        komunitas_id: komunitasId,
        peran: "Warga",
        status: "pending",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        profiles: {
          id: "user-warga-2",
          nama_lengkap: "Ahmad Fauzi",
          email: "ahmad.fauzi@gmail.com",
          avatar_url: null,
        },
      },
    ];
  }

  if (jenis === "satuan_paud") {
    return [
      {
        id: `member-${komunitasId}-1`,
        user_id: `user-guru-1`,
        komunitas_id: komunitasId,
        peran: "Kepala Sekolah / Pengelola PAUD",
        status: "approved",
        created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
        profiles: {
          id: "user-guru-1",
          nama_lengkap: `Dra. Hj. Sri Wahyuni, M.Pd`,
          email: "sri.wahyuni@paud.tegal.id",
          avatar_url: null,
        },
      },
      {
        id: `member-${komunitasId}-2`,
        user_id: `user-guru-2`,
        komunitas_id: komunitasId,
        peran: "Guru Pendamping PAUD",
        status: "approved",
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        profiles: {
          id: "user-guru-2",
          nama_lengkap: `Ustadzah Anisa Fitri, S.Pd.I`,
          email: "anisa.fitri@paud.tegal.id",
          avatar_url: null,
        },
      },
      {
        id: `member-${komunitasId}-3`,
        user_id: `user-wali-1`,
        komunitas_id: komunitasId,
        peran: "Wali Murid / Orang Tua",
        status: "approved",
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        profiles: {
          id: "user-wali-1",
          nama_lengkap: "Budi Santoso",
          email: "budi.santoso@gmail.com",
          avatar_url: null,
        },
      },
    ];
  }

  // Default: warga_kita
  return [
    {
      id: `member-${komunitasId}-1`,
      user_id: `user-rt-1`,
      komunitas_id: komunitasId,
      peran: "Ketua RT / Pengurus Lingkungan",
      status: "approved",
      created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
      profiles: {
        id: "user-rt-1",
        nama_lengkap: `Bambang Prasetyo (Ketua RT)`,
        email: "bambang.rt@jarimas.tegal.id",
        avatar_url: null,
      },
    },
    {
      id: `member-${komunitasId}-2`,
      user_id: `user-kader-warga-1`,
      komunitas_id: komunitasId,
      peran: "Kader Pendata DDKS",
      status: "approved",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      profiles: {
        id: "user-kader-warga-1",
        nama_lengkap: `Ibu Tri Hastuti (Kader PKK)`,
        email: "tri.hastuti@jarimas.tegal.id",
        avatar_url: null,
      },
    },
    {
      id: `member-${komunitasId}-3`,
      user_id: `user-warga-tetap-1`,
      komunitas_id: komunitasId,
      peran: "Warga Tetap",
      status: "approved",
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      profiles: {
        id: "user-warga-tetap-1",
        nama_lengkap: "Hendrawan Pratama",
        email: "hendrawan.p@gmail.com",
        avatar_url: null,
      },
    },
    {
      id: `member-${komunitasId}-4`,
      user_id: `user-warga-baru-1`,
      komunitas_id: komunitasId,
      peran: "Warga",
      status: "pending",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      profiles: {
        id: "user-warga-baru-1",
        nama_lengkap: "Wahyu Setiawan",
        email: "wahyu.setiawan@gmail.com",
        avatar_url: null,
      },
    },
  ];
}

/**
 * Server Action: Mengambil daftar anggota dalam komunitas tertentu
 */
export async function getAnggotaKomunitas(komunitasId: string): Promise<{
  success: boolean;
  data: AnggotaKomunitasDetail[];
}> {
  try {
    const supabase = await createClient();

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
        )
      `)
      .eq("komunitas_id", komunitasId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        success: true,
        data: generateSeedMembersForKomunitas(komunitasId),
      };
    }

    const items: AnggotaKomunitasDetail[] = data.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      komunitas_id: row.komunitas_id,
      peran: row.peran,
      status: row.status,
      created_at: row.created_at,
      profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
    }));

    return {
      success: true,
      data: items,
    };
  } catch {
    return {
      success: true,
      data: generateSeedMembersForKomunitas(komunitasId),
    };
  }
}

/**
 * Server Action: Menyetujui pendaftaran anggota oleh Pengurus / Kader Komunitas
 */
export async function approveAnggotaByAdmin(anggotaId: string): Promise<{
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
        message: "Akses ditolak: Anda harus masuk terlebih dahulu.",
      };
    }

    // Ambil data permohonan anggota yang akan disetujui
    const { data: memberToApprove, error: fetchError } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, user_id")
      .eq("id", anggotaId)
      .single();

    if (fetchError || !memberToApprove) {
      return {
        success: false,
        message: "Data permohonan anggota tidak ditemukan.",
      };
    }

    // Verifikasi otorisasi: Apakah user adalah Super Admin atau Pengurus/Kader aktif komunitas ini?
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    const isSuperAdmin = profile?.is_super_admin === true;

    if (!isSuperAdmin) {
      const { data: adminMember } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", memberToApprove.komunitas_id)
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (adminMember?.peran || "").toLowerCase();
      const isCommunityAdmin =
        roleLower.includes("pengurus") ||
        roleLower.includes("kader") ||
        roleLower.includes("admin");

      if (!isCommunityAdmin) {
        return {
          success: false,
          message: "Akses ditolak: Anda tidak memiliki wewenang Pengurus di komunitas ini.",
        };
      }
    }

    // Update status menjadi approved
    const { error: updateError } = await supabase
      .from("anggota_komunitas")
      .update({
        status: "approved",
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", anggotaId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal menyetujui anggota: " + updateError.message,
      };
    }

    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${memberToApprove.komunitas_id}`);
    revalidatePath(`/komunitas/${memberToApprove.komunitas_id}/anggota`);

    return {
      success: true,
      message: "Anggota berhasil disetujui dan kini aktif!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menyetujui permohonan anggota.",
    };
  }
}

/**
 * Server Action: Menolak pendaftaran anggota oleh Pengurus / Kader
 */
export async function rejectAnggotaByAdmin(anggotaId: string): Promise<{
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
        message: "Akses ditolak: Anda harus masuk terlebih dahulu.",
      };
    }

    const { error: updateError } = await supabase
      .from("anggota_komunitas")
      .update({
        status: "rejected",
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", anggotaId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal menolak permohonan: " + updateError.message,
      };
    }

    revalidatePath("/komunitas");
    return {
      success: true,
      message: "Permohonan pendaftaran anggota telah ditolak.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menolak permohonan anggota.",
    };
  }
}
