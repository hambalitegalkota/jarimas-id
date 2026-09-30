"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  RAW_POSYANDU_TEGAL,
} from "@/lib/constants/seed-posyandu-tegal";
import {
  RAW_PAUD_PKBM_TEGAL,
} from "@/lib/constants/seed-paud-tegal";
import {
  generateWargaKomunitasHierarchy,
  findOrGenerateKomunitasSeed,
  slugify,
  KOTA_TEGAL_DATA,
  getWargaHierarchyChain,
} from "@/lib/constants/tegal-data";
import {
  toValidUUID,
  normalizeRoleForDb,
  formatPeranDisplay,
  isRoleAdmin,
} from "@/lib/utils";
import {
  approveMemberRole,
  rejectMemberRole,
} from "@/app/actions/admin";
import {
  computeTierAndApprover,
  extractKomunitasMetadata,
} from "@/lib/admin-helpers";
import type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  UserJoinedKomunitas,
  MembershipStatus,
  JenisKomunitas,
  HierarchyAdminTierInfo,
  WargaHierarchyAdmins,
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

    // 2. Ambil data membership user jika login
    const userMemberships: Record<
      string,
      {
        id: string;
        status: MembershipStatus;
        peran: string;
        peran_diajukan?: string | null;
        berdomisili?: boolean;
        kk_terdaftar?: boolean;
      }
    > = {};

    if (currentUserId) {
      const { data: memberData } = await supabase
        .from("anggota_komunitas")
        .select("id, komunitas_id, status, peran, peran_diajukan, berdomisili, kk_terdaftar")
        .eq("user_id", currentUserId);

      if (memberData) {
        memberData.forEach((m) => {
          userMemberships[m.komunitas_id] = {
            id: m.id,
            status: m.status as MembershipStatus,
            peran: m.peran,
            peran_diajukan: m.peran_diajukan || null,
            berdomisili: m.berdomisili ?? undefined,
            kk_terdaftar: m.kk_terdaftar ?? undefined,
          };
        });
      }
    }

    // 3. Ambil data anggota yang disetujui (untuk hitungan anggota & deteksi admin komunitas)
    const { data: approvedMembersData } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, user_id, peran, status")
      .eq("status", "approved");

    const countsMap: Record<string, number> = {};
    const adminMembersMap: Record<string, any[]> = {};
    const adminUserIds = new Set<string>();

    if (approvedMembersData) {
      approvedMembersData.forEach((m) => {
        countsMap[m.komunitas_id] = (countsMap[m.komunitas_id] || 0) + 1;
        if (isRoleAdmin(m.peran)) {
          if (!adminMembersMap[m.komunitas_id]) {
            adminMembersMap[m.komunitas_id] = [];
          }
          adminMembersMap[m.komunitas_id].push(m);
          if (m.user_id) {
            adminUserIds.add(m.user_id);
          }
        }
      });
    }

    // Ambil profile nama admin secara aman
    const { data: adminProfilesData } =
      adminUserIds.size > 0
        ? await supabase
            .from("profiles")
            .select("id, nama_lengkap, email")
            .in("id", Array.from(adminUserIds))
        : { data: [] };

    const adminProfileMap = new Map(
      (adminProfilesData || []).map((p: any) => [p.id, p])
    );

    // 4. Khusus jenis "warga_kita": gunakan generator hierarki dinamis Kota Tegal
    if (params.jenis === "warga_kita") {
      const hierarchyItems = generateWargaKomunitasHierarchy({
        kecamatan: params.kecamatan,
        kelurahan: params.kelurahan,
        rw: params.rw,
        rt: params.rt,
      });

      let filteredWarga = hierarchyItems;
      if (params.searchQuery && params.searchQuery.trim()) {
        const sq = params.searchQuery.toLowerCase().trim();
        filteredWarga = filteredWarga.filter(
          (item) =>
            item.nama.toLowerCase().includes(sq) ||
            item.kecamatan.toLowerCase().includes(sq) ||
            item.kelurahan.toLowerCase().includes(sq) ||
            item.deskripsi.toLowerCase().includes(sq)
        );
      }

      const totalCount = filteredWarga.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const pagedWarga = filteredWarga.slice(offset, offset + limit);

      // Pastikan data Warga Kita tersinkronisasi di tabel komunitas Supabase (background upsert)
      const upsertPayload = pagedWarga.map((item) => {
        const validId = toValidUUID(item.id);
        return {
          id: validId,
          nama: item.nama,
          nama_komunitas: item.nama,
          jenis: "warga_kita",
          jenis_komunitas: "warga_kita",
          kecamatan: item.kecamatan || null,
          kelurahan: item.kelurahan || null,
          rt: item.rt || null,
          rw: item.rw || null,
          lokasi: item.lokasi,
          deskripsi: item.deskripsi,
          kontak: item.kontak || null,
          jadwal: item.jadwal || null,
          updated_at: new Date().toISOString(),
        };
      });

      if (upsertPayload.length > 0) {
        try {
          await supabase
            .from("komunitas")
            .upsert(upsertPayload, { onConflict: "id" });
        } catch {
          // Abaikan jika background upsert gagal
        }
      }

      // Ambil data komunitas warga yang tersimpan di DB untuk pencocokan relasi admin
      const { data: dbWargaKomunitas } = await supabase
        .from("komunitas")
        .select("id, nama, jenis, kecamatan, kelurahan, rw, rt")
        .eq("jenis", "warga_kita");

      const normalizeStr = (str?: string | null) =>
        (str || "")
          .toLowerCase()
          .replace(/kota\s+tegal/gi, "")
          .replace(/^kecamatan\s+/i, "")
          .replace(/^kec\.\s*/i, "")
          .replace(/^kelurahan\s+/i, "")
          .replace(/^kel\.\s*/i, "")
          .trim();

      const cleanNum = (str?: string | null) =>
        str ? str.replace(/\D/g, "").padStart(2, "0") : "";

      const items: KomunitasWithMembership[] = pagedWarga.map((item) => {
        const validId = toValidUUID(item.id);
        const membership =
          userMemberships[validId] ||
          userMemberships[item.id] ||
          null;

        const targetKec = normalizeStr(item.kecamatan);
        const targetKel = normalizeStr(item.kelurahan);
        const targetRw = cleanNum(item.rw);
        const targetRt = cleanNum(item.rt);

        const matchingDbKoms = (dbWargaKomunitas || []).filter((k) => {
          const kKec = normalizeStr(k.kecamatan);
          const kKel = normalizeStr(k.kelurahan);
          const kRw = cleanNum(k.rw);
          const kRt = cleanNum(k.rt);

          if (targetRt) {
            return kKec === targetKec && kKel === targetKel && kRw === targetRw && kRt === targetRt;
          }
          if (targetRw) {
            return kKec === targetKec && kKel === targetKel && kRw === targetRw && (!kRt || kRt === "00");
          }
          if (targetKel && targetKel !== "semua kelurahan") {
            return kKec === targetKec && kKel === targetKel && (!kRw || kRw === "00") && (!kRt || kRt === "00");
          }
          return kKec === targetKec && (!kKel || kKel === "semua kelurahan") && (!kRw || kRw === "00") && (!kRt || kRt === "00");
        });

        const candidateIds = [item.id, validId, ...matchingDbKoms.map((k) => k.id)];
        let adminFound: any = null;
        for (const cid of candidateIds) {
          if (adminMembersMap[cid] && adminMembersMap[cid].length > 0) {
            adminFound = adminMembersMap[cid][0];
            break;
          }
        }

        const hasAdmin = Boolean(adminFound);
        const adminName = adminFound
          ? adminProfileMap.get(adminFound.user_id)?.nama_lengkap || "Pengurus Terdaftar"
          : null;

        return {
          id: validId,
          nama: item.nama,
          jenis: "warga_kita",
          kecamatan: item.kecamatan,
          kelurahan: item.kelurahan,
          rt: item.rt,
          rw: item.rw,
          lokasi: item.lokasi,
          deskripsi: item.deskripsi,
          logo_url: item.logo_url || null,
          kontak: item.kontak || null,
          jadwal: item.jadwal || null,
          created_at: item.created_at || new Date().toISOString(),
          jumlah_anggota: countsMap[validId] || countsMap[item.id] || 0,
          currentUserMembership: membership,
          hasAdmin,
          adminName,
          adminRole: adminFound ? formatPeranDisplay(adminFound.peran) : null,
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
          hasMore: page < totalPages,
        },
      };
    }

    // 5. Untuk posyandu dan satuan_paud: Query data dari Supabase
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

    const rawList: any[] = dbData || [];
    const totalCount = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasMore = page < totalPages;

    // Normalisasi data
    const items: KomunitasWithMembership[] = rawList.map((k: any) => {
      const nama = k.nama || k.nama_komunitas || "Komunitas";
      const jenis = k.jenis || k.jenis_komunitas || "posyandu";
      const lokasi =
        k.lokasi ||
        [k.kelurahan, k.kecamatan, "Kota Tegal"].filter(Boolean).join(", ");
      const deskripsi =
        k.deskripsi || `Layanan dan kegiatan ${nama} di ${lokasi}.`;

      const adminFound = adminMembersMap[k.id]?.[0] || null;
      const hasAdmin = Boolean(adminFound);
      const adminName = adminFound
        ? adminProfileMap.get(adminFound.user_id)?.nama_lengkap || "Pengurus Terdaftar"
        : null;

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
        hasAdmin,
        adminName,
        adminRole: adminFound ? formatPeranDisplay(adminFound.peran) : null,
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
 * Server Action: Mengambil daftar komunitas yang telah diikuti oleh user yang sedang login
 */
export async function getUserJoinedKomunitas(): Promise<{
  success: boolean;
  message?: string;
  data: UserJoinedKomunitas[];
  currentUserId: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: true,
        data: [],
        currentUserId: null,
      };
    }

    // Ambil record anggota_komunitas milik user
    const { data: memberships, error: memberError } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, status, peran, peran_diajukan, berdomisili, kk_terdaftar, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (memberError || !memberships || memberships.length === 0) {
      return {
        success: true,
        data: [],
        currentUserId: user.id,
      };
    }

    const komunitasIds = memberships.map((m) => m.komunitas_id);

    // Ambil data detail komunitas terkait
    const { data: dbKomunitas, error: komError } = await supabase
      .from("komunitas")
      .select("*")
      .in("id", komunitasIds);

    if (komError || !dbKomunitas) {
      return {
        success: true,
        data: [],
        currentUserId: user.id,
      };
    }

    // Ambil hitungan anggota aktif untuk komunitas-komunitas ini
    const { data: memberCounts } = await supabase
      .from("anggota_komunitas")
      .select("komunitas_id")
      .in("komunitas_id", komunitasIds)
      .eq("status", "approved");

    const countsMap: Record<string, number> = {};
    (memberCounts || []).forEach((m) => {
      countsMap[m.komunitas_id] = (countsMap[m.komunitas_id] || 0) + 1;
    });

    // Ambil info admin yang disetujui untuk komunitas-komunitas yang diikuti
    const { data: allApprovedAdmins } = await supabase
      .from("anggota_komunitas")
      .select("komunitas_id, user_id, peran, status")
      .in("komunitas_id", komunitasIds)
      .eq("status", "approved");

    const adminMap: Record<string, any> = {};
    const joinedAdminUserIds = new Set<string>();
    (allApprovedAdmins || []).forEach((m) => {
      if (isRoleAdmin(m.peran)) {
        if (!adminMap[m.komunitas_id]) {
          adminMap[m.komunitas_id] = m;
          if (m.user_id) joinedAdminUserIds.add(m.user_id);
        }
      }
    });

    const { data: joinedAdminProfiles } =
      joinedAdminUserIds.size > 0
        ? await supabase
            .from("profiles")
            .select("id, nama_lengkap")
            .in("id", Array.from(joinedAdminUserIds))
        : { data: [] };

    const joinedProfileMap = new Map(
      (joinedAdminProfiles || []).map((p: any) => [p.id, p])
    );

    const komunitasMap = new Map(dbKomunitas.map((k) => [k.id, k]));

    const result: UserJoinedKomunitas[] = memberships
      .map((m) => {
        const k = komunitasMap.get(m.komunitas_id);
        if (!k) return null;

        const nama = k.nama || k.nama_komunitas || "Komunitas";
        const jenis = (k.jenis || k.jenis_komunitas || "posyandu") as JenisKomunitas;
        const lokasi =
          k.lokasi ||
          [k.kelurahan, k.kecamatan, "Kota Tegal"].filter(Boolean).join(", ");
        const deskripsi =
          k.deskripsi || `Layanan dan kegiatan ${nama} di ${lokasi}.`;

        const adminFound = adminMap[k.id];
        const hasAdmin = Boolean(adminFound);
        const adminName = adminFound
          ? joinedProfileMap.get(adminFound.user_id)?.nama_lengkap || "Pengurus Terdaftar"
          : null;

        return {
          id: k.id,
          membershipId: m.id,
          nama,
          jenis,
          kecamatan: k.kecamatan || null,
          kelurahan: k.kelurahan || null,
          rt: k.rt || null,
          rw: k.rw || null,
          lokasi,
          deskripsi,
          logo_url: k.logo_url || null,
          kontak: k.kontak || null,
          jadwal: k.jadwal || null,
          status: m.status as MembershipStatus,
          peran: m.peran || "Anggota",
          peran_diajukan: m.peran_diajukan || null,
          berdomisili: m.berdomisili ?? undefined,
          kk_terdaftar: m.kk_terdaftar ?? undefined,
          hasAdmin,
          adminName,
          adminRole: adminFound ? formatPeranDisplay(adminFound.peran) : null,
          joinedAt: m.created_at,
          jumlah_anggota: countsMap[k.id] || 0,
        };
      })
      .filter(Boolean) as UserJoinedKomunitas[];

    return {
      success: true,
      data: result,
      currentUserId: user.id,
    };
  } catch (err: any) {
    console.error("Error getUserJoinedKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat komunitas yang diikuti.",
      data: [],
      currentUserId: null,
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
    const { data: komunitasFromDb } = await supabase
      .from("komunitas")
      .select("*")
      .eq("id", dbKomunitasId)
      .maybeSingle();

    let komunitas = komunitasFromDb;

    // Fallback: Jika data belum ada di database, coba cari/generate dari Master Seed
    if (!komunitas) {
      const seedItem = findOrGenerateKomunitasSeed(komunitasId);
      if (seedItem) {
        const insertPayload = {
          id: dbKomunitasId,
          nama: seedItem.nama,
          nama_komunitas: seedItem.nama,
          jenis: seedItem.jenis,
          jenis_komunitas: seedItem.jenis,
          kecamatan: seedItem.kecamatan || "Kota Tegal",
          kelurahan: seedItem.kelurahan || "Semua Kelurahan",
          rt: seedItem.rt || null,
          rw: seedItem.rw || null,
          lokasi: seedItem.lokasi,
          deskripsi: seedItem.deskripsi,
          kontak: seedItem.kontak || null,
          jadwal: seedItem.jadwal || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: inserted } = await supabase
          .from("komunitas")
          .upsert(insertPayload, { onConflict: "id" })
          .select()
          .maybeSingle();

        komunitas = inserted || (insertPayload as any);
      }
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

    const nama = komunitas.nama || komunitas.nama_komunitas || "Komunitas";
    const jenis = komunitas.jenis || komunitas.jenis_komunitas || "posyandu";
    const lokasi =
      komunitas.lokasi ||
      [komunitas.kelurahan, komunitas.kecamatan, "Kota Tegal"]
        .filter(Boolean)
        .join(", ");
    const deskripsi =
      komunitas.deskripsi || `Layanan dan kegiatan ${nama} di ${lokasi}.`;

    // 1. Ambil seluruh komunitas dari database
    const { data: dbAllKomunitas } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi");

    const dbKomMap = new Map((dbAllKomunitas || []).map((k) => [k.id, k]));

    // 2. Ambil seluruh anggota berstatus approved dari database
    const { data: allApprovedMembers } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, user_id, peran, status")
      .eq("status", "approved");

    const approvedAdmins = (allApprovedMembers || []).filter((m) =>
      isRoleAdmin(m.peran)
    );

    // Ambil profiles untuk seluruh admin
    const adminUserIds = [
      ...new Set(approvedAdmins.map((ca) => ca.user_id).filter(Boolean)),
    ];

    const { data: chainProfiles } =
      adminUserIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, nama_lengkap, email")
            .in("id", adminUserIds)
        : { data: [] };

    const chainProfileMap = new Map(
      (chainProfiles || []).map((p: any) => [p.id, p])
    );

    // 3. Ambil seluruh keanggotaan user saat ini jika login
    let userMembershipsMap: Record<string, any> = {};
    let userMembershipsList: any[] = [];
    if (currentUserId) {
      const { data: userMemberships } = await supabase
        .from("anggota_komunitas")
        .select("id, komunitas_id, peran, peran_diajukan, status, berdomisili, kk_terdaftar")
        .eq("user_id", currentUserId);

      userMembershipsList = userMemberships || [];
      (userMemberships || []).forEach((um) => {
        userMembershipsMap[um.komunitas_id] = um;
      });
    }

    // 4. Hitung jumlah anggota yang disetujui
    const { count } = await supabase
      .from("anggota_komunitas")
      .select("*", { count: "exact", head: true })
      .eq("komunitas_id", dbKomunitasId)
      .eq("status", "approved");

    // 5. Hitung informasi admin berjenjang (RT, RW, Kelurahan, Kecamatan)
    let hierarchyAdmins: WargaHierarchyAdmins | null = null;
    let hierarchyAdminList: HierarchyAdminTierInfo[] = [];

    const pageMeta = extractKomunitasMetadata(komunitas);

    if (jenis === "warga_kita") {
      const chain = getWargaHierarchyChain({
        kecamatan: komunitas.kecamatan || "Kota Tegal",
        kelurahan: komunitas.kelurahan || "",
        rw: komunitas.rw || "",
        rt: komunitas.rt || "",
      });

      hierarchyAdmins = {};

      chain.forEach((item) => {
        const dbItemId = toValidUUID(item.id);
        const tierMeta = extractKomunitasMetadata(item);

        let level: "rt" | "rw" | "kelurahan" | "kecamatan" = "kecamatan";
        let levelLabel = "Kecamatan";
        let title = `Admin Kecamatan ${tierMeta.rawKec || "Kota Tegal"}`;

        if (tierMeta.hasRt) {
          level = "rt";
          levelLabel = "RT";
          title = `Admin RT ${tierMeta.rt}`;
        } else if (tierMeta.hasRw) {
          level = "rw";
          levelLabel = "RW";
          title = `Admin RW ${tierMeta.rw}`;
        } else if (tierMeta.hasKel) {
          level = "kelurahan";
          levelLabel = "Kelurahan";
          title = `Admin Kelurahan ${tierMeta.rawKel}`;
        }

        // Cari ID komunitas yang cocok untuk tier ini
        const matchingDbKomIds = (dbAllKomunitas || [])
          .filter((k) => {
            const kMeta = extractKomunitasMetadata(k);
            if (tierMeta.hasRt) {
              return (
                kMeta.kec === tierMeta.kec &&
                kMeta.kel === tierMeta.kel &&
                kMeta.rw === tierMeta.rw &&
                kMeta.rt === tierMeta.rt
              );
            }
            if (tierMeta.hasRw) {
              return (
                kMeta.kec === tierMeta.kec &&
                kMeta.kel === tierMeta.kel &&
                kMeta.rw === tierMeta.rw &&
                !kMeta.hasRt
              );
            }
            if (tierMeta.hasKel) {
              return (
                kMeta.kec === tierMeta.kec &&
                kMeta.kel === tierMeta.kel &&
                !kMeta.hasRw &&
                !kMeta.hasRt
              );
            }
            return (
              kMeta.kec === tierMeta.kec &&
              !kMeta.hasKel &&
              !kMeta.hasRw &&
              !kMeta.hasRt
            );
          })
          .map((k) => k.id);

        const tierAllKomIds = new Set([
          item.id,
          dbItemId,
          toValidUUID(item.id),
          ...matchingDbKomIds,
        ]);

        // Temukan admin yang menjabat di tier ini
        const adminFound = approvedAdmins.find((ca) => {
          // 1. Direct ID match
          if (
            tierAllKomIds.has(ca.komunitas_id) ||
            tierAllKomIds.has(toValidUUID(ca.komunitas_id))
          ) {
            return true;
          }

          // 2. Geographic metadata match dari ca.komunitas_id
          const caKom =
            dbKomMap.get(ca.komunitas_id) ||
            findOrGenerateKomunitasSeed(ca.komunitas_id);
          const caMeta = extractKomunitasMetadata(caKom || { id: ca.komunitas_id });

          if (tierMeta.hasRt) {
            return (
              caMeta.kec === tierMeta.kec &&
              caMeta.kel === tierMeta.kel &&
              caMeta.rw === tierMeta.rw &&
              caMeta.rt === tierMeta.rt
            );
          }
          if (tierMeta.hasRw) {
            return (
              caMeta.kec === tierMeta.kec &&
              caMeta.kel === tierMeta.kel &&
              caMeta.rw === tierMeta.rw &&
              !caMeta.hasRt
            );
          }
          if (tierMeta.hasKel) {
            return (
              caMeta.kec === tierMeta.kec &&
              caMeta.kel === tierMeta.kel &&
              !caMeta.hasRw &&
              !caMeta.hasRt
            );
          }
          return (
            caMeta.kec === tierMeta.kec &&
            !caMeta.hasKel &&
            !caMeta.hasRw &&
            !caMeta.hasRt
          );
        });

        const hasAdminTier = Boolean(adminFound);
        const adminProf = adminFound
          ? chainProfileMap.get(adminFound.user_id)
          : null;
        const adminNameTier =
          adminProf?.nama_lengkap ||
          adminProf?.email ||
          (adminFound ? `Admin ${levelLabel} Terdaftar` : null);

        let userAtTier = null;
        for (const tid of tierAllKomIds) {
          if (userMembershipsMap[tid]) {
            userAtTier = userMembershipsMap[tid];
            break;
          }
        }

        const tierInfo: HierarchyAdminTierInfo = {
          level,
          levelLabel,
          title,
          komunitasId: item.id,
          komunitasNama: item.nama,
          adminName: adminNameTier,
          hasAdmin: hasAdminTier,
          canApply: !hasAdminTier,
          userStatusAtTier: userAtTier
            ? {
                status: userAtTier.status,
                peran: userAtTier.peran,
                peran_diajukan: userAtTier.peran_diajukan || null,
              }
            : null,
        };

        hierarchyAdminList.push(tierInfo);
        if (hierarchyAdmins) {
          hierarchyAdmins[level] = tierInfo;
        }
      });
    }

    // 6. Cek apakah komunitas ini memiliki admin langsung / sesuai tingkatannya
    const directAdmin = (approvedAdmins || []).find((ca) => {
      if (ca.komunitas_id === dbKomunitasId || ca.komunitas_id === komunitasId) {
        return true;
      }
      const caKom = dbKomMap.get(ca.komunitas_id) || findOrGenerateKomunitasSeed(ca.komunitas_id);
      const caMeta = extractKomunitasMetadata(caKom || { id: ca.komunitas_id });
      if (pageMeta.hasRt) {
        return (
          caMeta.kec === pageMeta.kec &&
          caMeta.kel === pageMeta.kel &&
          caMeta.rw === pageMeta.rw &&
          caMeta.rt === pageMeta.rt
        );
      }
      if (pageMeta.hasRw) {
        return (
          caMeta.kec === pageMeta.kec &&
          caMeta.kel === pageMeta.kel &&
          caMeta.rw === pageMeta.rw &&
          !caMeta.hasRt
        );
      }
      if (pageMeta.hasKel) {
        return (
          caMeta.kec === pageMeta.kec &&
          caMeta.kel === pageMeta.kel &&
          !caMeta.hasRw &&
          !caMeta.hasRt
        );
      }
      return (
        caMeta.kec === pageMeta.kec &&
        !caMeta.hasKel &&
        !caMeta.hasRw &&
        !caMeta.hasRt
      );
    });

    let hasAdmin = Boolean(directAdmin);
    let adminName: string | null = null;
    let adminRole: string | null = null;

    if (directAdmin?.user_id) {
      const prof = chainProfileMap.get(directAdmin.user_id);
      adminName = prof?.nama_lengkap || "Pengurus Terdaftar";
      adminRole = formatPeranDisplay(directAdmin.peran);
    } else if (hierarchyAdmins) {
      if (pageMeta.hasRt && hierarchyAdmins.rt?.hasAdmin) {
        hasAdmin = true;
        adminName = hierarchyAdmins.rt.adminName;
        adminRole = "Admin RT";
      } else if (pageMeta.hasRw && hierarchyAdmins.rw?.hasAdmin) {
        hasAdmin = true;
        adminName = hierarchyAdmins.rw.adminName;
        adminRole = "Admin RW";
      } else if (pageMeta.hasKel && hierarchyAdmins.kelurahan?.hasAdmin) {
        hasAdmin = true;
        adminName = hierarchyAdmins.kelurahan.adminName;
        adminRole = "Admin Kelurahan";
      } else if (hierarchyAdmins.kecamatan?.hasAdmin) {
        hasAdmin = true;
        adminName = hierarchyAdmins.kecamatan.adminName;
        adminRole = "Admin Kecamatan";
      }
    }

    // 7. Hitung status keanggotaan user saat ini & wewenang Admin
    let isPengurusOrKader = isSuperAdmin;
    let currentUserMembership = null;

    if (currentUserId) {
      // Cek apakah user adalah Admin yang disetujui di komunitas ini atau di tingkat wilayah yang menaunginya
      const adminEntryForUser = approvedAdmins.find((ca) => {
        if (ca.user_id !== currentUserId) return false;
        if (ca.komunitas_id === dbKomunitasId || ca.komunitas_id === komunitasId) return true;

        const caKom = dbKomMap.get(ca.komunitas_id) || findOrGenerateKomunitasSeed(ca.komunitas_id);
        const caMeta = extractKomunitasMetadata(caKom || { id: ca.komunitas_id });

        // Admin Kecamatan
        if (caMeta.kec === pageMeta.kec && !caMeta.hasKel && !caMeta.hasRw && !caMeta.hasRt) return true;
        // Admin Kelurahan
        if (caMeta.kec === pageMeta.kec && caMeta.kel === pageMeta.kel && !caMeta.hasRw && !caMeta.hasRt) return true;
        // Admin RW
        if (caMeta.kec === pageMeta.kec && caMeta.kel === pageMeta.kel && caMeta.rw === pageMeta.rw && !caMeta.hasRt) return true;
        // Admin RT
        if (caMeta.kec === pageMeta.kec && caMeta.kel === pageMeta.kel && caMeta.rw === pageMeta.rw && caMeta.rt === pageMeta.rt) return true;

        return false;
      });

      if (adminEntryForUser) {
        isPengurusOrKader = true;
      }

      // Cari record keanggotaan langsung pada komunitas ini
      const directMember =
        userMembershipsMap[dbKomunitasId] ||
        userMembershipsMap[komunitasId] ||
        userMembershipsList.find((m) => {
          const mKom = dbKomMap.get(m.komunitas_id) || findOrGenerateKomunitasSeed(m.komunitas_id);
          const mMeta = extractKomunitasMetadata(mKom || { id: m.komunitas_id });
          return (
            mMeta.kec === pageMeta.kec &&
            mMeta.kel === pageMeta.kel &&
            mMeta.rw === pageMeta.rw &&
            mMeta.rt === pageMeta.rt
          );
        });

      if (directMember) {
        const isApprovedAdmin = isRoleAdmin(directMember.peran);
        if (isApprovedAdmin || isPengurusOrKader) {
          isPengurusOrKader = true;
        }

        currentUserMembership = {
          id: directMember.id,
          status: directMember.status as MembershipStatus,
          peran: isPengurusOrKader
            ? isApprovedAdmin
              ? directMember.peran
              : "Pengurus"
            : directMember.peran,
          // PENTING: Jika pengguna telah menjadi Admin wilayah ini, bersihkan peran_diajukan agar tidak muncul "MENUNGGU PERSETUJUAN ADMIN"
          peran_diajukan: isPengurusOrKader
            ? null
            : directMember.peran_diajukan || null,
          berdomisili: directMember.berdomisili ?? undefined,
          kk_terdaftar: directMember.kk_terdaftar ?? undefined,
        };
      } else if (isPengurusOrKader) {
        currentUserMembership = {
          id: `admin-${currentUserId}`,
          status: "approved" as MembershipStatus,
          peran: "Pengurus",
          peran_diajukan: null,
        };
      }
    }

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
      hasAdmin,
      adminName,
      adminRole,
      currentUserMembership,
      hierarchyAdmins,
      hierarchyAdminList,
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
      .select("id, user_id, komunitas_id, peran, peran_diajukan, berdomisili, kk_terdaftar, status, created_at")
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
        peran_diajukan: row.peran_diajukan || null,
        berdomisili: row.berdomisili ?? undefined,
        kk_terdaftar: row.kk_terdaftar ?? undefined,
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

    // Pastikan jika komunitas Warga Kita, sertakan juga rantai hierarki (RW, Kelurahan, Kecamatan)
    const seedItem = findOrGenerateKomunitasSeed(komunitasId);
    if (seedItem && seedItem.jenis === "warga_kita") {
      const hierarchyChain = getWargaHierarchyChain({
        kecamatan: seedItem.kecamatan,
        kelurahan: seedItem.kelurahan,
        rw: seedItem.rw,
        rt: seedItem.rt,
      });

      for (const item of hierarchyChain) {
        const itemDbId = toValidUUID(item.id);
        await supabase.from("komunitas").upsert(
          {
            id: itemDbId,
            nama: item.nama,
            nama_komunitas: item.nama,
            jenis: "warga_kita",
            jenis_komunitas: "warga_kita",
            kecamatan: item.kecamatan || "Kota Tegal",
            kelurahan: item.kelurahan || "Semua Kelurahan",
            rt: item.rt || null,
            rw: item.rw || null,
            lokasi: item.lokasi,
            deskripsi: item.deskripsi,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        if (itemDbId !== dbKomunitasId) {
          await supabase.from("anggota_komunitas").upsert(
            {
              user_id: user.id,
              komunitas_id: itemDbId,
              peran: dbRole,
              status: "approved",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,komunitas_id" }
          );
        }
      }
    }

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

export interface JoinKomunitasWargaParams {
  komunitasId: string;
  nama?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  rw?: string | null;
  rt?: string | null;
  lokasi?: string | null;
  deskripsi?: string | null;
  berdomisili: boolean;
  kkTerdaftar: boolean;
}

/**
 * Server Action: Bergabung ke Komunitas Warga dengan Survey Domisili & KK
 * - Mengidentifikasi status:
 *   - Ya Domisili + Ya KK -> "Penduduk"
 *   - Ya Domisili + Tidak KK -> "Pendatang"
 *   - Tidak Domisili + Tidak KK -> "Pengunjung"
 *   - Tidak Domisili + Ya KK -> "Penduduk Domisili Diluar"
 * - Pengguna langsung aktif masuk sebagai "Pengunjung" (status: approved).
 * - Peran yang diidentifikasi selain Pengunjung disimpan sebagai `peran_diajukan` menunggu verifikasi admin.
 * - CASCADE JOIN: Bergabung di 1 RT otomatis terhubung di tingkat RW, Kelurahan, & Kecamatan di atasnya!
 */
export async function joinKomunitasWargaWithSurvey({
  komunitasId,
  nama,
  kecamatan,
  kelurahan,
  rw,
  rt,
  lokasi,
  deskripsi,
  berdomisili,
  kkTerdaftar,
}: JoinKomunitasWargaParams): Promise<{
  success: boolean;
  message: string;
  membership?: any;
  peranDiajukan?: string | null;
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
        message: "Silakan masuk terlebih dahulu untuk bergabung ke komunitas.",
      };
    }

    const seedItem = findOrGenerateKomunitasSeed(komunitasId);
    const finalNama = nama || seedItem?.nama || "Komunitas Warga";
    const finalKecamatan = kecamatan || seedItem?.kecamatan || null;
    const finalKelurahan = kelurahan || seedItem?.kelurahan || null;
    const finalRw = rw || seedItem?.rw || null;
    const finalRt = rt || seedItem?.rt || null;

    // 1. Identifikasi Peran dari Survey:
    let identifiedRole = "Pengunjung";
    if (berdomisili && kkTerdaftar) {
      identifiedRole = "Penduduk";
    } else if (berdomisili && !kkTerdaftar) {
      identifiedRole = "Pendatang";
    } else if (!berdomisili && kkTerdaftar) {
      identifiedRole = "Penduduk Domisili Diluar";
    } else {
      identifiedRole = "Pengunjung";
    }

    const activePeran = "Pengunjung";
    const peranDiajukan = identifiedRole === "Pengunjung" ? null : identifiedRole;

    // 2. Ambil Rantai Hierarki Komunitas (Kecamatan, Kelurahan, RW, RT)
    const hierarchyChain = getWargaHierarchyChain({
      kecamatan: finalKecamatan,
      kelurahan: finalKelurahan,
      rw: finalRw,
      rt: finalRt,
    });

    // Fallback jika hierarchyChain kosong
    if (hierarchyChain.length === 0) {
      const dbKomId = toValidUUID(komunitasId);
      const finalLokasi =
        lokasi ||
        seedItem?.lokasi ||
        [finalKelurahan, finalKecamatan, "Kota Tegal"].filter(Boolean).join(", ") ||
        "Kota Tegal";
      const finalDeskripsi =
        deskripsi ||
        seedItem?.deskripsi ||
        `Komunitas resmi warga ${finalNama}.`;

      await supabase.from("komunitas").upsert(
        {
          id: dbKomId,
          nama: finalNama,
          nama_komunitas: finalNama,
          jenis: "warga_kita",
          jenis_komunitas: "warga_kita",
          kecamatan: finalKecamatan || "Kota Tegal",
          kelurahan: finalKelurahan || "Semua Kelurahan",
          rt: finalRt,
          rw: finalRw,
          lokasi: finalLokasi,
          deskripsi: finalDeskripsi,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      const { data: memberData } = await supabase
        .from("anggota_komunitas")
        .upsert(
          {
            user_id: user.id,
            komunitas_id: dbKomId,
            peran: activePeran,
            peran_diajukan: peranDiajukan,
            status: "approved",
            berdomisili: berdomisili,
            kk_terdaftar: kkTerdaftar,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,komunitas_id" }
        )
        .select()
        .maybeSingle();

      revalidatePath(`/komunitas/${komunitasId}`);
      revalidatePath("/komunitas");
      revalidatePath("/profil");

      return {
        success: true,
        message: "Selamat bergabung di Komunitas Warga!",
        membership: memberData,
        peranDiajukan,
      };
    }

    // 3. Upsert seluruh komunitas dalam rantai dan daftarkan keanggotaan pengguna
    let targetMembership: any = null;

    for (const item of hierarchyChain) {
      const dbItemKomId = toValidUUID(item.id);

      // Upsert komunitas record
      await supabase.from("komunitas").upsert(
        {
          id: dbItemKomId,
          nama: item.nama,
          nama_komunitas: item.nama,
          jenis: "warga_kita",
          jenis_komunitas: "warga_kita",
          kecamatan: item.kecamatan || "Kota Tegal",
          kelurahan: item.kelurahan || "Semua Kelurahan",
          rt: item.rt || null,
          rw: item.rw || null,
          lokasi: item.lokasi,
          deskripsi: item.deskripsi,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      const isTargetCommunity =
        item.id === komunitasId ||
        dbItemKomId === toValidUUID(komunitasId) ||
        (!targetMembership && item.rt === finalRt);

      // Hanya komunitas target langsung yang meminta verifikasi peran (peran_diajukan)
      // Tingkat di atasnya (RW, Kelurahan, Kecamatan) otomatis terhubung tanpa redundansi antrean
      const tierPeranDiajukan = isTargetCommunity ? peranDiajukan : null;

      // Upsert anggota_komunitas record
      const { data: mData } = await supabase
        .from("anggota_komunitas")
        .upsert(
          {
            user_id: user.id,
            komunitas_id: dbItemKomId,
            peran: activePeran,
            peran_diajukan: tierPeranDiajukan,
            status: "approved",
            berdomisili: berdomisili,
            kk_terdaftar: kkTerdaftar,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,komunitas_id" }
        )
        .select()
        .maybeSingle();

      if (isTargetCommunity) {
        targetMembership = mData;
      }
    }

    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${toValidUUID(komunitasId)}`);
    revalidatePath("/komunitas");
    revalidatePath("/profil");

    const message =
      hierarchyChain.length > 1
        ? `Selamat bergabung! Anda otomatis terhubung di ${hierarchyChain.length} tingkatan komunitas (RT, RW, Kelurahan, & Kecamatan).`
        : "Selamat bergabung di Komunitas Warga!";

    return {
      success: true,
      message,
      membership: targetMembership,
      peranDiajukan,
    };
  } catch (err: any) {
    console.error("Error joinKomunitasWargaWithSurvey:", err);
    return {
      success: false,
      message: err.message || "Gagal bergabung ke komunitas warga.",
    };
  }
}

/**
 * Server Action: Mengajukan diri sebagai Admin / Pengurus Komunitas Warga (jika belum ada admin)
 * Aturan: Setiap pengguna hanya boleh mengajukan permohonan menjadi Admin untuk satu komunitas saja di Komunitas Warga Kita.
 */
export async function applyForAdminKomunitas({
  komunitasId,
  catatan,
  nomorHp,
}: {
  komunitasId: string;
  catatan?: string;
  nomorHp?: string;
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
        message: "Silakan masuk terlebih dahulu untuk mengajukan diri sebagai admin.",
      };
    }

    const dbKomunitasId = toValidUUID(komunitasId);

    // Update nomor HP profil jika disertakan
    if (nomorHp && nomorHp.trim()) {
      await supabase
        .from("profiles")
        .update({
          nomor_hp: nomorHp.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    // Pastikan record komunitas ada di database
    const { data: targetKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi")
      .eq("id", dbKomunitasId)
      .maybeSingle();

    const seed = targetKom || findOrGenerateKomunitasSeed(komunitasId);
    if (!targetKom && seed) {
      await supabase.from("komunitas").upsert(
        {
          id: dbKomunitasId,
          nama: seed.nama,
          nama_komunitas: seed.nama,
          jenis: seed.jenis || "warga_kita",
          jenis_komunitas: seed.jenis || "warga_kita",
          kecamatan: seed.kecamatan || "Kota Tegal",
          kelurahan: seed.kelurahan || "Semua Kelurahan",
          rt: seed.rt || null,
          rw: seed.rw || null,
          lokasi: seed.lokasi,
          deskripsi: seed.deskripsi,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    // Cek apakah komunitas tujuan sudah memiliki Admin aktif (Satu Komunitas Satu Admin)
    let candidateKomIds = [dbKomunitasId];
    if (seed) {
      const { data: siblingKoms } = await supabase
        .from("komunitas")
        .select("id, kecamatan, kelurahan, rw, rt")
        .eq("jenis", seed.jenis || "warga_kita");

      const normalizeStr = (str?: string | null) =>
        (str || "").toLowerCase().replace(/^kecamatan\s+/i, "").replace(/^kelurahan\s+/i, "").trim();

      const matchedSiblingIds = (siblingKoms || [])
        .filter((k) => {
          const kKec = normalizeStr(k.kecamatan);
          const kKel = normalizeStr(k.kelurahan);
          const kRw = (k.rw || "").replace(/\D/g, "");
          const kRt = (k.rt || "").replace(/\D/g, "");

          const targetKec = normalizeStr(seed.kecamatan);
          const targetKel = normalizeStr(seed.kelurahan);
          const targetRw = (seed.rw || "").replace(/\D/g, "");
          const targetRt = (seed.rt || "").replace(/\D/g, "");

          if (seed.rt) {
            return kKec === targetKec && kKel === targetKel && kRw === targetRw && kRt === targetRt;
          }
          if (seed.rw) {
            return kKec === targetKec && kKel === targetKel && kRw === targetRw && (!kRt || kRt === "00" || kRt === "");
          }
          if (seed.kelurahan && seed.kelurahan !== "Semua Kelurahan") {
            return kKec === targetKec && kKel === targetKel && (!kRw || kRw === "00" || kRw === "") && (!kRt || kRt === "00" || kRt === "");
          }
          return kKec === targetKec && (!kKel || kKel === "semua kelurahan" || kKel === "") && (!kRw || kRw === "00" || kRw === "") && (!kRt || kRt === "00" || kRt === "");
        })
        .map((k) => k.id);

      candidateKomIds = [...new Set([dbKomunitasId, ...matchedSiblingIds])];
    }

    const { data: existingAdmins } = await supabase
      .from("anggota_komunitas")
      .select("id, peran, status, user_id")
      .in("komunitas_id", candidateKomIds)
      .eq("status", "approved");

    const activeAdmin = (existingAdmins || []).find((m) => isRoleAdmin(m.peran));

    if (activeAdmin && activeAdmin.user_id !== user.id) {
      let adminName = "Pengurus resmi";
      if (activeAdmin.user_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("nama_lengkap")
          .eq("id", activeAdmin.user_id)
          .maybeSingle();
        if (prof?.nama_lengkap) {
          adminName = prof.nama_lengkap;
        }
      }
      return {
        success: false,
        message: `Komunitas ini sudah memiliki Admin aktif (${adminName}). Satu komunitas hanya boleh memiliki satu Admin.`,
      };
    }

    // ATURAN 1 KOMUNITAS: Bersihkan permohonan admin di komunitas warga_kita lainnya untuk user ini
    try {
      const { data: userOtherAdminApps } = await supabase
        .from("anggota_komunitas")
        .select("id, komunitas_id")
        .eq("user_id", user.id)
        .eq("peran_diajukan", "Pengurus");

      const otherIds = (userOtherAdminApps || [])
        .filter((m) => m.komunitas_id !== dbKomunitasId)
        .map((m) => m.id);

      if (otherIds.length > 0) {
        await supabase
          .from("anggota_komunitas")
          .update({ peran_diajukan: null, updated_at: new Date().toISOString() })
          .in("id", otherIds);
      }
    } catch (cleanErr) {
      console.warn("Notice resetting other admin applications:", cleanErr);
    }

    // Upsert anggota_komunitas dengan peran_diajukan = 'Pengurus'
    const { data: existing } = await supabase
      .from("anggota_komunitas")
      .select("id, peran, status")
      .eq("user_id", user.id)
      .eq("komunitas_id", dbKomunitasId)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase
        .from("anggota_komunitas")
        .update({
          peran_diajukan: "Pengurus",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("anggota_komunitas")
        .insert({
          user_id: user.id,
          komunitas_id: dbKomunitasId,
          peran: "Pengunjung",
          peran_diajukan: "Pengurus",
          status: "approved",
          created_at: new Date().toISOString(),
        });

      if (insertErr) throw insertErr;
    }

    // Hitung pesan hierarkis sesuai tingkat komunitas
    let approverMessage =
      "Pengajuan Admin telah dikirim dan menunggu persetujuan Super Admin.";
    if (seed) {
      const { targetApproverTitle, tierLevel } = computeTierAndApprover(
        seed,
        "Pengurus",
        "Pengunjung"
      );
      approverMessage = `Pengajuan Anda sebagai Admin ${tierLevel} telah dikirim dan menunggu verifikasi ${targetApproverTitle}.`;
    }

    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath("/profil");
    revalidatePath("/admin/approval");

    return {
      success: true,
      message: approverMessage,
    };
  } catch (err: any) {
    console.error("Error applyForAdminKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal mengajukan diri sebagai admin.",
    };
  }
}

/**
 * Server Action: Menyetujui pendaftaran / pengajuan peran anggota oleh Pengurus / Kader Komunitas
 */
export async function approveMembership(membershipId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return approveMemberRole(membershipId);
}

/**
 * Server Action: Menolak pendaftaran anggota oleh Pengurus / Kader Komunitas
 */
export async function rejectMembership(membershipId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return rejectMemberRole(membershipId);
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

/**
 * Server Action: Menyemai seluruh data PAUD & Kesetaraan (TK, KB, RA, SPS, TPA, PKBM, SKB) resmi Kota Tegal ke tabel `komunitas` di Supabase
 */
export async function seedPaudToSupabase(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  try {
    const supabase = await createClient();

    const items = RAW_PAUD_PKBM_TEGAL.map((p) => ({
      id: toValidUUID(
        `kom-paud-${p.kecamatan.toLowerCase().replace(/\s+/g, "-")}-${p.kelurahan.toLowerCase().replace(/\s+/g, "-")}-${p.nama.toLowerCase().replace(/\s+/g, "-")}`
      ),
      nama: p.nama,
      nama_komunitas: p.nama,
      jenis: "satuan_paud",
      jenis_komunitas: "satuan_paud",
      kecamatan: p.kecamatan,
      kelurahan: p.kelurahan,
      lokasi:
        p.lokasi ||
        `Gedung ${p.nama}, ${p.kelurahan}, ${p.kecamatan}, Kota Tegal`,
      deskripsi:
        p.deskripsi ||
        `Lembaga PAUD & Pendidikan Kesetaraan (${p.nama}) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.`,
      kontak: p.kontak || "0813-5566-7788",
      jadwal: p.jadwal || "Senin s/d Jumat, Pukul 07.30 - 11.00 WIB",
      rt: p.rt || null,
      rw: p.rw || null,
      updated_at: new Date().toISOString(),
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
      message: `Berhasil meng-upsert ${totalInserted} Komunitas PAUD & Kesetaraan (TK, KB, RA, SPS, PKBM, SKB) se-Kota Tegal ke database Supabase.`,
    };
  } catch (err: any) {
    console.error("Error seedPaudToSupabase:", err);
    return {
      success: false,
      insertedCount: 0,
      message: err.message || "Gagal menyemai data PAUD & Kesetaraan ke Supabase.",
    };
  }
}

/**
 * Server Action: Trigger Penyemaian Data PAUD & Kesetaraan
 */
export async function seedAllPaudTegalAction(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  const res = await seedPaudToSupabase();
  revalidatePath("/komunitas");
  return res;
}

/**
 * Server Action: Menyemai seluruh Komunitas Warga Kita se-Kota Tegal (4 Kecamatan, 27 Kelurahan, dan 17 RW per Kelurahan) ke Supabase
 */
export async function seedWargaKitaToSupabase(options?: {
  includeRt?: boolean;
}): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const includeRt = options?.includeRt ?? true;
    const items: any[] = [];

    // 1. 4 Komunitas Tingkat Kecamatan
    const kecamatans = ["Tegal Timur", "Tegal Barat", "Tegal Selatan", "Margadana"];
    kecamatans.forEach((kec) => {
      const id = toValidUUID(`kom-warga-${slugify(kec)}`);
      items.push({
        id,
        nama: `Warga Kecamatan: ${kec}`,
        nama_komunitas: `Warga Kecamatan: ${kec}`,
        jenis: "warga_kita",
        jenis_komunitas: "warga_kita",
        kecamatan: kec,
        kelurahan: "Semua Kelurahan",
        rt: null,
        rw: null,
        lokasi: `Kecamatan ${kec}, Kota Tegal`,
        deskripsi: `Komunitas paguyuban warga se-Kecamatan ${kec}, Kota Tegal.`,
        kontak: `Sekretariat Kecamatan ${kec}`,
        jadwal: "Pertemuan Komunitas Warga Tingkat Kecamatan",
        updated_at: new Date().toISOString(),
      });
    });

    // 2. 27 Komunitas Tingkat Kelurahan, 17 RW per Kelurahan, dan 17 RT per RW
    for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
      const kecSlug = slugify(kecName);
      for (const kelName of Object.keys(kecData.kelurahan)) {
        const kelSlug = slugify(kelName);
        const kelId = toValidUUID(`kom-warga-${kecSlug}-${kelSlug}`);
        items.push({
          id: kelId,
          nama: `Warga Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
          nama_komunitas: `Warga Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
          jenis: "warga_kita",
          jenis_komunitas: "warga_kita",
          kecamatan: kecName,
          kelurahan: kelName,
          rt: null,
          rw: null,
          lokasi: `Kantor Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal`,
          deskripsi: `Komunitas seluruh warga di wilayah Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal.`,
          kontak: `Sekretariat Kelurahan ${kelName}`,
          jadwal: "Forum Komunikasi Warga Kelurahan",
          updated_at: new Date().toISOString(),
        });

        // 17 RW per Kelurahan
        for (let r = 1; r <= 17; r++) {
          const rwStr = String(r).padStart(2, "0");
          const rwId = toValidUUID(`kom-warga-${kecSlug}-${kelSlug}-rw${rwStr}`);
          items.push({
            id: rwId,
            nama: `Warga RW: ${rwStr}, Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
            nama_komunitas: `Warga RW: ${rwStr}, Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
            jenis: "warga_kita",
            jenis_komunitas: "warga_kita",
            kecamatan: kecName,
            kelurahan: kelName,
            rt: null,
            rw: rwStr,
            lokasi: `Balai RW ${rwStr}, Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal`,
            deskripsi: `Komunitas rukun warga tingkat RW ${rwStr} Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal.`,
            kontak: `Pengurus RW ${rwStr}`,
            jadwal: "Rembug RW dan Pertemuan Warga Bulanan",
            updated_at: new Date().toISOString(),
          });

          // 17 RT per RW (7.803 RT)
          if (includeRt) {
            for (let t = 1; t <= 17; t++) {
              const rtStr = String(t).padStart(2, "0");
              const rtId = toValidUUID(`kom-warga-${kecSlug}-${kelSlug}-rw${rwStr}-rt${rtStr}`);
              items.push({
                id: rtId,
                nama: `Warga RT: ${rtStr}, RW: ${rwStr}, Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
                nama_komunitas: `Warga RT: ${rtStr}, RW: ${rwStr}, Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
                jenis: "warga_kita",
                jenis_komunitas: "warga_kita",
                kecamatan: kecName,
                kelurahan: kelName,
                rt: rtStr,
                rw: rwStr,
                lokasi: `Lingkungan RT ${rtStr} / RW ${rwStr}, Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal`,
                deskripsi: `Komunitas paguyuban rukun tetangga warga RT ${rtStr} RW ${rwStr} Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal.`,
                kontak: `Pengurus RT ${rtStr} / RW ${rwStr}`,
                jadwal: "Pertemuan Rutin RT Bulanan",
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    const chunkSize = 250;
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

    const detailText = includeRt
      ? "4 Kecamatan, 27 Kelurahan, 459 RW, dan 7.803 RT"
      : "4 Kecamatan, 27 Kelurahan, dan 459 RW";

    return {
      success: true,
      insertedCount: totalInserted,
      message: `Berhasil menyiapkan ${totalInserted} Komunitas Warga (${detailText}) se-Kota Tegal ke database.`,
    };
  } catch (err: any) {
    console.error("Error seedWargaKitaToSupabase:", err);
    return {
      success: false,
      insertedCount: 0,
      message: err.message || "Gagal menyemai data Komunitas Warga ke database.",
    };
  }
}

/**
 * Server Action: Trigger Penyemaian Komunitas Warga Kita
 */
export async function seedAllWargaKitaTegalAction(options?: {
  includeRt?: boolean;
}): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  const res = await seedWargaKitaToSupabase(options);
  revalidatePath("/komunitas");
  return res;
}

