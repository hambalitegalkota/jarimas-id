"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import {
  RAW_POSYANDU_TEGAL,
  SEED_POSYANDU_TEGAL,
  INVALID_POSYANDU_IDS,
  extractCorePosyanduName,
} from "@/lib/constants/seed-posyandu-tegal";
import {
  RAW_PAUD_PKBM_TEGAL,
  SEED_PAUD_PKBM_TEGAL,
  INVALID_PAUD_IDS,
} from "@/lib/constants/seed-paud-tegal";
import {
  generateWargaKomunitasHierarchy,
  findOrGenerateKomunitasSeed,
  slugify,
  KOTA_TEGAL_DATA,
  getWargaHierarchyChain,
  MASTER_KOMUNITAS_SEED,
} from "@/lib/constants/tegal-data";
import {
  toValidUUID,
  normalizeRoleForDb,
  formatPeranDisplay,
  isRoleAdmin,
  isSuperAdmin as checkIsSuperAdmin,
  isAdminPusat as checkIsAdminPusat,
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

export type {
  KomunitasWithMembership,
  AnggotaKomunitasDetail,
  UserJoinedKomunitas,
  MembershipStatus,
  JenisKomunitas,
  HierarchyAdminTierInfo,
  WargaHierarchyAdmins,
};

export interface GetKomunitasListParams {
  jenis?: JenisKomunitas | "semua";
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
  rt?: string;
  bentuk?: string;
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

    // 5. Khusus jenis "satuan_paud", "posyandu", dan "semua": Gunakan Master Seed Resmi Kota Tegal
    let baseList: any[] = [];

    if (params.jenis === "satuan_paud") {
      baseList = SEED_PAUD_PKBM_TEGAL;
    } else if (params.jenis === "posyandu") {
      baseList = SEED_POSYANDU_TEGAL;
    } else {
      // jenis "semua"
      const hierarchyWarga = generateWargaKomunitasHierarchy({
        kecamatan: params.kecamatan,
        kelurahan: params.kelurahan,
        rw: params.rw,
        rt: params.rt,
      });
      baseList = [...hierarchyWarga, ...SEED_POSYANDU_TEGAL, ...SEED_PAUD_PKBM_TEGAL];
    }

    let filteredList = [...baseList];

    if (params.kecamatan && params.kecamatan !== "semua") {
      const kecLow = params.kecamatan.toLowerCase().trim();
      filteredList = filteredList.filter(
        (item) => item.kecamatan && item.kecamatan.toLowerCase().trim() === kecLow
      );
    }

    if (params.kelurahan && params.kelurahan !== "semua") {
      const kelLow = params.kelurahan.toLowerCase().trim();
      filteredList = filteredList.filter(
        (item) => item.kelurahan && item.kelurahan.toLowerCase().trim() === kelLow
      );
    }

    // Filter bentuk institusi khusus PAUD & PKBM (TK, RA, KB, SPS, TPA, PKBM, SKB)
    if (params.bentuk && params.bentuk !== "semua") {
      const bTarget = params.bentuk.toUpperCase().trim();
      filteredList = filteredList.filter((item) => {
        if (item.jenis_institusi) {
          return item.jenis_institusi.toUpperCase() === bTarget;
        }
        const upNama = (item.nama || "").toUpperCase().trim();
        if (bTarget === "TK" && (upNama.startsWith("TK ") || upNama.includes(" TK "))) return true;
        if (bTarget === "RA" && (upNama.startsWith("RA ") || upNama.includes(" RA "))) return true;
        if (bTarget === "KB" && (upNama.startsWith("KB ") || upNama.includes(" KB "))) return true;
        if (bTarget === "SPS" && (upNama.startsWith("SPS ") || upNama.startsWith("POS PAUD") || upNama.includes("POS PAUD"))) return true;
        if (bTarget === "PKBM" && (upNama.startsWith("PKBM ") || upNama.includes(" PKBM "))) return true;
        if (bTarget === "TPA" && (upNama.startsWith("TPA ") || upNama.includes(" TPA "))) return true;
        if (bTarget === "SKB" && (upNama.startsWith("SKB ") || upNama.includes(" SKB "))) return true;
        return false;
      });
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      const sq = params.searchQuery.toLowerCase().trim();
      filteredList = filteredList.filter(
        (item) =>
          item.nama.toLowerCase().includes(sq) ||
          item.kecamatan.toLowerCase().includes(sq) ||
          item.kelurahan.toLowerCase().includes(sq) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(sq)) ||
          (item.lokasi && item.lokasi.toLowerCase().includes(sq))
      );
    }

    // Urutkan berdasarkan nama
    filteredList.sort((a, b) => a.nama.localeCompare(b.nama));

    const totalCount = filteredList.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasMore = page < totalPages;
    const pagedList = filteredList.slice(offset, offset + limit);

    // Normalisasi data dengan status keanggotaan dan admin
    const items: KomunitasWithMembership[] = pagedList.map((item) => {
      const validId = toValidUUID(item.id);
      const membership =
        userMemberships[validId] ||
        userMemberships[item.id] ||
        null;

      const adminFound = adminMembersMap[validId]?.[0] || adminMembersMap[item.id]?.[0] || null;
      const hasAdmin = Boolean(adminFound);
      const adminName = adminFound
        ? adminProfileMap.get(adminFound.user_id)?.nama_lengkap || "Pengurus Terdaftar"
        : null;

      let itemNama = item.nama;
      let itemDeskripsi = item.deskripsi;
      if (item.jenis === "posyandu") {
        const coreName = extractCorePosyanduName(item.nama);
        itemNama = coreName ? `Posyandu ${coreName}` : "Posyandu";
        if (itemDeskripsi) {
          itemDeskripsi = itemDeskripsi.replace(/Posyandu\s+Posyandu/gi, "Posyandu");
        }
      }

      return {
        id: validId,
        nama: itemNama,
        jenis: item.jenis,
        jenis_institusi: item.jenis_institusi,
        npsn: item.npsn,
        kecamatan: item.kecamatan,
        kelurahan: item.kelurahan,
        rt: item.rt,
        rw: item.rw,
        lokasi: item.lokasi,
        deskripsi: itemDeskripsi,
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
          .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
          .eq("id", user.id)
          .maybeSingle();
        isSuperAdmin = checkIsSuperAdmin({
          ...prof,
          id: user.id,
          email: prof?.email || user.email,
          nama_lengkap: prof?.nama_lengkap || user.user_metadata?.nama_lengkap,
        });
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

    let nama = komunitas.nama || komunitas.nama_komunitas || "Komunitas";
    const jenis = komunitas.jenis || komunitas.jenis_komunitas || "posyandu";
    if (jenis === "posyandu") {
      const coreName = extractCorePosyanduName(nama);
      nama = coreName ? `Posyandu ${coreName}` : "Posyandu";
    }
    const lokasi =
      komunitas.lokasi ||
      [komunitas.kelurahan, komunitas.kecamatan, "Kota Tegal"]
        .filter(Boolean)
        .join(", ");
    let deskripsi =
      komunitas.deskripsi || `Layanan dan kegiatan ${nama} di ${lokasi}.`;
    if (jenis === "posyandu") {
      deskripsi = deskripsi.replace(/Posyandu\s+Posyandu/gi, "Posyandu");
    }

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

        let level: "rt" | "rw" | "kelurahan" | "kecamatan" | "kota" = "kecamatan";
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
        } else if (item.id === "kom-warga-kota-tegal" || tierMeta.rawKec === "Kota Tegal") {
          level = "kota";
          levelLabel = "Kota";
          title = "Admin Kota Tegal";
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
    }

    // 7. Hitung status keanggotaan user saat ini & wewenang Admin
    let isPengurusOrKader = isSuperAdmin;
    let currentUserMembership = null;

    if (currentUserId) {
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
        if (isApprovedAdmin) {
          isPengurusOrKader = true;
        }

        currentUserMembership = {
          id: directMember.id,
          status: directMember.status as MembershipStatus,
          peran: directMember.peran,
          peran_diajukan: directMember.peran_diajukan || null,
          berdomisili: directMember.berdomisili ?? undefined,
          kk_terdaftar: directMember.kk_terdaftar ?? undefined,
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
 * Pengguna yang mengajukan peran (Pengunjung, Tenaga Medis, Tenaga Kesehatan, PLKB, PKK, Kader, dll)
 * akan berstatus 'pending' dan memerlukan persetujuan dari Admin.
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
    const targetPeranDiajukan = formatPeranDisplay(peran.trim());

    // Pastikan record komunitas ada di database
    const seedItem = findOrGenerateKomunitasSeed(komunitasId);
    if (seedItem) {
      await supabase.from("komunitas").upsert(
        {
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
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    // Pastikan jika komunitas Warga Kita, sertakan juga rantai hierarki (RW, Kelurahan, Kecamatan)
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
      }
    }

    // Cek apakah sudah terdaftar sebelumnya
    const { data: existingMember } = await supabase
      .from("anggota_komunitas")
      .select("id, status, peran, peran_diajukan")
      .eq("user_id", user.id)
      .eq("komunitas_id", dbKomunitasId)
      .maybeSingle();

    const isDirectPengunjung = targetPeranDiajukan.toLowerCase() === "pengunjung";
    const initialActiveRole = isDirectPengunjung ? "Pengunjung" : "Pengunjung";
    const appliedRole = isDirectPengunjung ? null : targetPeranDiajukan;

    if (existingMember) {
      if (
        existingMember.status === "approved" &&
        existingMember.peran.toLowerCase() === targetPeranDiajukan.toLowerCase() &&
        !existingMember.peran_diajukan
      ) {
        return {
          success: false,
          message: `Anda sudah menjadi anggota aktif sebagai ${formatPeranDisplay(existingMember.peran)}.`,
        };
      }

      if (existingMember.peran_diajukan && existingMember.peran_diajukan.toLowerCase() === targetPeranDiajukan.toLowerCase()) {
        return {
          success: false,
          message: `Permohonan bergabung Anda sebagai ${formatPeranDisplay(existingMember.peran_diajukan)} sedang menunggu persetujuan Admin/Pengurus.`,
        };
      }

      // Perbarui keanggotaan: Masuk langsung sebagai Pengunjung dan catat peran_diajukan untuk persetujuan Admin
      const { error: updateError } = await supabase
        .from("anggota_komunitas")
        .update({
          peran: existingMember.status === "approved" && existingMember.peran !== "Pengunjung" ? existingMember.peran : initialActiveRole,
          peran_diajukan: appliedRole,
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMember.id);

      if (updateError) throw updateError;
    } else {
      // Buat pendaftaran baru: Langsung dapat masuk sebagai Pengunjung dengan peran_diajukan
      const { error: insertError } = await supabase
        .from("anggota_komunitas")
        .insert({
          user_id: user.id,
          komunitas_id: dbKomunitasId,
          peran: initialActiveRole,
          peran_diajukan: appliedRole,
          status: "approved",
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }

    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/profil");
    revalidatePath("/admin/approval");

    if (isDirectPengunjung) {
      return {
        success: true,
        message: `Selamat bergabung di ${seedItem?.nama || "Komunitas"} sebagai Pengunjung!`,
      };
    }

    return {
      success: true,
      message: `Permohonan bergabung sebagai ${targetPeranDiajukan} berhasil dikirim! Anda langsung dapat mengakses komunitas sebagai Pengunjung sambil menunggu persetujuan Admin.`,
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
  peran?: string | null;
}

/**
 * Server Action: Bergabung ke Komunitas Warga dengan Survey Domisili & KK
 * Ketentuan Penentuan Peran:
 * - KK: Kota Tegal & Domisili: Kota Tegal -> "Penduduk" (Akses Penuh Profil Data)
 * - KK: Kota Tegal & Domisili: Luar Kota Tegal -> "Penduduk Domisili Di Luar" (Akses Penuh Profil Data)
 * - KK: Luar Kota Tegal & Domisili: Kota Tegal -> "Pendatang" (Hanya Grafik & Chart)
 * - KK: Luar Kota Tegal & Domisili: Luar Kota Tegal -> "Pengunjung" (Hanya Grafik & Chart)
 * - CASCADE JOIN: Bergabung di 1 RT otomatis terhubung di tingkat RW, Kelurahan, & Kecamatan di seluruh jenjang!
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
  peran,
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

    // 1. Identifikasi Peran dari Survey Alamat KK & Domisili:
    let identifiedRole = "Pengunjung";
    if (berdomisili && kkTerdaftar) {
      identifiedRole = "Penduduk";
    } else if (!berdomisili && kkTerdaftar) {
      identifiedRole = "Penduduk Berdomisili Luar Kota";
    } else if (berdomisili && !kkTerdaftar) {
      identifiedRole = "Pendatang";
    } else {
      identifiedRole = "Pengunjung";
    }

    if (peran && peran.trim()) {
      const cleanPeran = peran.trim();
      // TIDAK ADA PROSES OTOMATISASI ADMIN: Peran Admin/Pengurus tidak dapat ditetapkan otomatis saat onboarding/survey
      if (!isRoleAdmin(cleanPeran)) {
        identifiedRole = cleanPeran;
      }
    }

    const activePeran = identifiedRole;
    const peranDiajukan = null;

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
        message: `Selamat bergabung di Komunitas Warga sebagai ${activePeran}!`,
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

      // Cek apakah user sudah memiliki peran admin aktif di komunitas ini agar tidak tertimpa
      const { data: existingItemMember } = await supabase
        .from("anggota_komunitas")
        .select("peran")
        .eq("user_id", user.id)
        .eq("komunitas_id", dbItemKomId)
        .maybeSingle();

      const itemRole =
        existingItemMember && isRoleAdmin(existingItemMember.peran)
          ? existingItemMember.peran
          : activePeran;

      // Upsert anggota_komunitas record
      const { data: mData } = await supabase
        .from("anggota_komunitas")
        .upsert(
          {
            user_id: user.id,
            komunitas_id: dbItemKomId,
            peran: itemRole,
            peran_diajukan: null,
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
        ? `Selamat bergabung sebagai ${activePeran}! Anda otomatis terhubung di ${hierarchyChain.length} tingkatan komunitas (RT, RW, Kelurahan, & Kecamatan).`
        : `Selamat bergabung di Komunitas Warga sebagai ${activePeran}!`;

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
 * Server Action: Mengajukan diri sebagai Admin / Pengurus Komunitas (jika belum ada admin)
 * Aturan Ketat:
 * 1. Pengguna WAJIB sudah bergabung dan berstatus 'approved' sebagai anggota komunitas yang bersangkutan.
 * 2. Tidak ada proses otomatisasi untuk menjadi Admin. Permohonan hanya mengisi 'peran_diajukan' dan menunggu persetujuan manual.
 * 3. Untuk Komunitas Warga Kita: Hanya anggota berstatus 'Penduduk' (KK & Domisili Kota Tegal) yang berhak mengajukan diri.
 * 4. Setiap pengguna hanya boleh mengajukan permohonan menjadi Admin untuk satu komunitas saja.
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
        message: "Silakan masuk terlebih dahulu untuk mengajukan permohonan admin.",
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

    // 1. SYARAT WAJIB 1: Pengguna HARUS SUDAH BERGABUNG dan berstatus 'approved' di komunitas ini
    const { data: existingMember } = await supabase
      .from("anggota_komunitas")
      .select("id, peran, status, peran_diajukan, berdomisili, kk_terdaftar")
      .eq("user_id", user.id)
      .eq("komunitas_id", dbKomunitasId)
      .maybeSingle();

    if (!existingMember || existingMember.status !== "approved") {
      return {
        success: false,
        message:
          "Akses ditolak: Anda harus bergabung dan disetujui sebagai anggota aktif komunitas ini terlebih dahulu sebelum dapat mengajukan diri sebagai Admin/Pengurus.",
      };
    }

    // Jika pengguna sudah menjadi Admin aktif di komunitas ini
    if (isRoleAdmin(existingMember.peran)) {
      return {
        success: false,
        message: `Anda sudah berstatus sebagai ${formatPeranDisplay(existingMember.peran)} resmi di komunitas ini.`,
      };
    }

    // Jika permohonan admin sedang dalam status pending
    if (
      existingMember.peran_diajukan &&
      isRoleAdmin(existingMember.peran_diajukan)
    ) {
      return {
        success: false,
        message: `Permohonan Anda sebagai ${formatPeranDisplay(existingMember.peran_diajukan)} sedang menunggu persetujuan Super Admin / Admin hierarki tingkat atas.`,
      };
    }

    // 2. SYARAT WAJIB 2: Untuk Komunitas Warga Kita, hanya anggota berstatus 'Penduduk' yang berhak mengajukan diri
    if (seed?.jenis === "warga_kita") {
      const isUserPenduduk =
        existingMember.peran?.toLowerCase() === "penduduk" ||
        (existingMember.berdomisili === true && existingMember.kk_terdaftar === true);

      if (!isUserPenduduk) {
        return {
          success: false,
          message:
            "Hanya anggota aktif dengan status Penduduk (KK & Domisili di Kota Tegal) yang berhak mengajukan permohonan sebagai Admin/Pengurus.",
        };
      }
    }

    // 2b. SYARAT UNTUK BIDANG SPM: Hanya peran Pendamping yang berhak mengajukan permohonan sebagai Admin Bidang SPM kepada Super Admin
    if (seed?.jenis === "bidang_spm") {
      const isPendamping =
        existingMember.peran?.toLowerCase() === "pendamping" ||
        existingMember.peran?.toLowerCase().includes("pendamping");

      if (!isPendamping) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya anggota dengan peran Pendamping yang berhak mengajukan diri sebagai Admin Bidang SPM kepada Super Admin.",
        };
      }
    }

    // 3. Cek apakah komunitas tujuan sudah memiliki Admin aktif (Satu Komunitas Satu Admin)
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

    // 4. ATURAN 1 KOMUNITAS: Bersihkan permohonan admin di komunitas warga_kita lainnya untuk user ini
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

    // 5. TIDAK ADA PROSES OTOMATISASI:
    // Kolom 'peran' pengguna TETAP peran anggota yang berlaku (TIDAK BERUBAH MENJADI ADMIN OTOMATIS).
    // Hanya mengisi kolom 'peran_diajukan' dan menunggu verifikasi serta persetujuan manual Super Admin / Admin Hierarki.
    const targetAdminRole =
      seed?.jenis === "warga_kita"
        ? "Pengurus"
        : seed?.jenis === "posyandu"
        ? "Kader"
        : "Admin";

    const { error: updateErr } = await supabase
      .from("anggota_komunitas")
      .update({
        peran_diajukan: targetAdminRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingMember.id);

    if (updateErr) throw updateErr;

    // Hitung pesan hierarkis sesuai tingkat komunitas
    let approverMessage =
      "Permohonan Admin telah dikirim dan menunggu persetujuan Super Admin.";
    if (seed) {
      const { targetApproverTitle, tierLevel } = computeTierAndApprover(
        seed,
        targetAdminRole,
        existingMember.peran
      );
      approverMessage = `Permohonan Anda sebagai Admin ${tierLevel} telah dikirim dan menunggu verifikasi ${targetApproverTitle} (tidak ada proses otomatisasi).`;
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
      message: err.message || "Gagal mengajukan permohonan sebagai admin.",
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
 * Server Action: Pengguna keluar atau tidak bergabung lagi di komunitas (Leave Community)
 */
export async function leaveKomunitas({
  komunitasId,
}: {
  komunitasId: string;
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
        message: "Silakan masuk terlebih dahulu untuk keluar dari komunitas.",
      };
    }

    const dbKomunitasId = toValidUUID(komunitasId);

    // Ambil data komunitas untuk cek apakah warga_kita (hierarki cascade)
    const { data: kom } = await supabase
      .from("komunitas")
      .select("id, jenis, kecamatan, kelurahan, rw, rt")
      .eq("id", dbKomunitasId)
      .maybeSingle();

    const seed = kom || findOrGenerateKomunitasSeed(komunitasId);

    // Hapus keanggotaan
    const { error: delErr } = await supabase
      .from("anggota_komunitas")
      .delete()
      .eq("user_id", user.id)
      .eq("komunitas_id", dbKomunitasId);

    if (delErr) {
      throw delErr;
    }

    // Jika jenis warga_kita dan pengguna keluar dari hierarki wilayah RT, hapus juga keterhubungan di RW/Kel/Kecamatan
    if (seed?.jenis === "warga_kita" && seed.rt) {
      const hierarchyChain = getWargaHierarchyChain({
        kecamatan: seed.kecamatan,
        kelurahan: seed.kelurahan,
        rw: seed.rw,
        rt: seed.rt,
      });

      const chainIds = hierarchyChain.map((h) => toValidUUID(h.id));
      if (chainIds.length > 0) {
        await supabase
          .from("anggota_komunitas")
          .delete()
          .eq("user_id", user.id)
          .in("komunitas_id", chainIds);
      }
    }

    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath("/profil");

    return {
      success: true,
      message: "Anda telah berhasil keluar dari komunitas ini.",
    };
  } catch (err: any) {
    console.error("Error leaveKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal keluar dari komunitas.",
    };
  }
}

/**
 * Server Action: Pengguna berhenti menjadi Admin / Pengurus komunitas atau membatalkan permohonan admin
 */
export async function resignAdminKomunitas({
  komunitasId,
}: {
  komunitasId: string;
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
        message: "Silakan masuk terlebih dahulu.",
      };
    }

    const dbKomunitasId = toValidUUID(komunitasId);

    // Ambil data keanggotaan pengguna
    const { data: myMember } = await supabase
      .from("anggota_komunitas")
      .select("id, peran, peran_diajukan, status, berdomisili, kk_terdaftar")
      .eq("user_id", user.id)
      .eq("komunitas_id", dbKomunitasId)
      .maybeSingle();

    if (!myMember) {
      return {
        success: false,
        message: "Anda belum terdaftar sebagai anggota pada komunitas ini.",
      };
    }

    // Ambil info komunitas
    const { data: targetKom } = await supabase
      .from("komunitas")
      .select("id, jenis")
      .eq("id", dbKomunitasId)
      .maybeSingle();

    const seed = targetKom || findOrGenerateKomunitasSeed(komunitasId);

    // Tentukan peran anggota biasa fallback
    let fallbackRole = "Pengunjung";
    if (seed?.jenis === "warga_kita") {
      fallbackRole =
        myMember.berdomisili && myMember.kk_terdaftar
          ? "Penduduk"
          : myMember.kk_terdaftar
          ? "Penduduk Berdomisili Luar Kota"
          : myMember.berdomisili
          ? "Pendatang"
          : "Pengunjung";
    } else if (seed?.jenis === "posyandu") {
      fallbackRole = "Pengunjung";
    } else {
      fallbackRole = "Pengunjung";
    }

    // Jika pengguna adalah Admin aktif: turunkan ke fallbackRole dan peran_diajukan = null
    // Jika pengguna sedang pending pengajuan admin: bersihkan peran_diajukan = null
    const { error: updateErr } = await supabase
      .from("anggota_komunitas")
      .update({
        peran: isRoleAdmin(myMember.peran) ? fallbackRole : myMember.peran,
        peran_diajukan: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", myMember.id);

    if (updateErr) throw updateErr;

    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath("/profil");
    revalidatePath("/admin/approval");

    const msg = isRoleAdmin(myMember.peran)
      ? `Anda telah berhenti dari jabatan Admin dan kembali menjadi ${formatPeranDisplay(fallbackRole)}.`
      : "Permohonan pengajuan Admin berhasil dibatalkan.";

    return {
      success: true,
      message: msg,
    };
  } catch (err: any) {
    console.error("Error resignAdminKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal memproses permohonan berhenti menjadi admin.",
    };
  }
}

/**
 * Server Action: Admin/Pengurus atau Super Admin menghentikan keanggotaan atau mengeluarkan pengguna dari komunitas
 */
export async function kickMemberByAdmin({
  membershipId,
  komunitasId,
}: {
  membershipId: string;
  komunitasId: string;
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
        message: "Silakan login terlebih dahulu.",
      };
    }

    const dbKomunitasId = toValidUUID(komunitasId);

    // Cek profil pemanggil apakah Super Admin atau Admin Pusat
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const userCtx = {
      ...myProfile,
      id: user.id,
      email: myProfile?.email || user.email,
      nama_lengkap: myProfile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    };
    const isSuperAdmin = checkIsSuperAdmin(userCtx);
    const isAdminPusat = !isSuperAdmin && checkIsAdminPusat(userCtx);

    // Cek keanggotaan pemanggil apakah Admin di komunitas ini
    let hasAdminAuth = isSuperAdmin || isAdminPusat;
    if (!hasAdminAuth) {
      const { data: myMembership } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", dbKomunitasId)
        .eq("status", "approved")
        .maybeSingle();

      if (myMembership && isRoleAdmin(myMembership.peran)) {
        hasAdminAuth = true;
      }
    }

    if (!hasAdminAuth) {
      return {
        success: false,
        message:
          "Akses ditolak: Hanya Admin/Pengurus resmi atau Super Admin yang berhak mengeluarkan anggota dari komunitas.",
      };
    }

    // Ambil data anggota target yang akan dikeluarkan
    const { data: targetMember } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, profiles (nama_lengkap, is_super_admin)")
      .eq("id", membershipId)
      .maybeSingle();

    if (!targetMember) {
      return {
        success: false,
        message: "Data anggota tidak ditemukan.",
      };
    }

    // Cegah mengeluarkan akun Super Admin
    if ((targetMember.profiles as any)?.is_super_admin === true) {
      return {
        success: false,
        message: "Tidak dapat mengeluarkan akun Super Admin.",
      };
    }

    const targetName =
      (targetMember.profiles as any)?.nama_lengkap || "Pengguna";

    // Hapus data keanggotaan target
    const adminClient = createAdminClient();
    const writeClient = adminClient || supabase;

    const { error: delErr } = await writeClient
      .from("anggota_komunitas")
      .delete()
      .eq("id", membershipId);

    if (delErr) {
      // Fallback: update status ke rejected jika RLS batasi delete
      await writeClient
        .from("anggota_komunitas")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", membershipId);
    }

    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath(`/komunitas/${komunitasId}/anggota`);
    revalidatePath(`/komunitas/${dbKomunitasId}/anggota`);
    revalidatePath("/admin/approval");

    return {
      success: true,
      message: `Keanggotaan ${targetName} telah berhasil dihentikan / dikeluarkan dari komunitas.`,
    };
  } catch (err: any) {
    console.error("Error kickMemberByAdmin:", err);
    return {
      success: false,
      message: err.message || "Gagal mengeluarkan anggota dari komunitas.",
    };
  }
}

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
 * Server Action: Menyemai seluruh data 209 Posyandu resmi Kota Tegal ke tabel `komunitas` di Supabase
 */
export async function seedPosyanduToSupabase(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  try {
    const supabase = await createClient();

    const items = RAW_POSYANDU_TEGAL.map((p) => {
      const coreName = extractCorePosyanduName(p.nama);
      const cleanNama = `Posyandu ${coreName}`;
      const cleanDeskripsi = (
        p.deskripsi ||
        `Layanan terpadu Posyandu ${coreName} ${p.kelurahan}: penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.`
      ).replace(/Posyandu\s+Posyandu/gi, "Posyandu");

      return {
        id: toValidUUID(
          `kom-posyandu-${p.kecamatan.toLowerCase().replace(/\s+/g, "-")}-${p.kelurahan.toLowerCase().replace(/\s+/g, "-")}-${coreName.toLowerCase().replace(/\s+/g, "-")}`
        ),
        nama: cleanNama,
        nama_komunitas: cleanNama,
        jenis: "posyandu",
        jenis_komunitas: "posyandu",
        kecamatan: p.kecamatan,
        kelurahan: p.kelurahan,
        lokasi:
          p.lokasi ||
          `Balai Posyandu / RW ${p.rw || "01"}, ${p.kelurahan}, ${p.kecamatan}, Kota Tegal`,
        deskripsi: cleanDeskripsi,
        kontak: p.kontak || "0813-2233-4455",
        jadwal: p.jadwal || `Setiap Hari Rabu Minggu ke-2 Pukul 08.30 - 11.30 WIB`,
        rt: p.rt || null,
        rw: p.rw || null,
      };
    });

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
 * Server Action: Memeriksa dan menghapus data posyandu duplikat di setiap kelurahan pada database Supabase.
 * Menjaga 1 entri utama dan menghapus entri duplikat dengan nama & kelurahan yang sama.
 */
export async function cleanupDuplicatePosyanduAction(): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil seluruh data posyandu dari tabel komunitas
    const { data: allPosyandu, error: fetchErr } = await supabase
      .from("komunitas")
      .select("id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, rw, rt, created_at")
      .or("jenis.eq.posyandu,jenis_komunitas.eq.posyandu")
      .order("created_at", { ascending: false });

    if (fetchErr) {
      throw fetchErr;
    }

    if (!allPosyandu || allPosyandu.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: "Tidak ada data posyandu di database.",
      };
    }

    // 2. Kelompokkan berdasarkan Kelurahan & Nama Inti Posyandu
    const grouped = new Map<string, any[]>();
    for (const p of allPosyandu) {
      const rawName = p.nama || p.nama_komunitas || "";
      const coreName = extractCorePosyanduName(rawName).toLowerCase().replace(/\s+/g, " ");
      const normKel = (p.kelurahan || "").trim().toLowerCase();
      const key = `${normKel}::${coreName}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(p);
    }

    // 3. Cari entri duplikat dan pilih entri dengan data paling lengkap sebagai master
    const duplicateIdsToDelete: string[] = [];
    for (const [key, items] of grouped.entries()) {
      if (items.length > 1) {
        items.sort((a, b) => {
          const scoreA = (a.lokasi ? 2 : 0) + (a.deskripsi ? 2 : 0) + (a.rw ? 1 : 0);
          const scoreB = (b.lokasi ? 2 : 0) + (b.deskripsi ? 2 : 0) + (b.rw ? 1 : 0);
          return scoreB - scoreA;
        });

        const master = items[0];
        const duplicates = items.slice(1);
        for (const dup of duplicates) {
          duplicateIdsToDelete.push(dup.id);
          // Pindahkan keanggotaan dari posyandu duplikat ke posyandu master jika ada
          try {
            await supabase
              .from("anggota_komunitas")
              .update({ komunitas_id: master.id })
              .eq("komunitas_id", dup.id);
          } catch {}
        }
      }
    }

    if (duplicateIdsToDelete.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: `Pemeriksaan selesai: Seluruh nama Posyandu di setiap Kelurahan sudah unik (${SEED_POSYANDU_TEGAL.length} Posyandu, tidak ada duplikat).`,
      };
    }

    // 4. Bersihkan sisa relasi di tabel anggota_komunitas untuk id yang akan dihapus
    await supabase
      .from("anggota_komunitas")
      .delete()
      .in("komunitas_id", duplicateIdsToDelete);

    // 5. Hapus entri duplikat dari tabel komunitas
    const { error: deleteErr } = await supabase
      .from("komunitas")
      .delete()
      .in("id", duplicateIdsToDelete);

    if (deleteErr) {
      throw deleteErr;
    }

    revalidatePath("/komunitas");
    revalidatePath("/profil");

    return {
      success: true,
      deletedCount: duplicateIdsToDelete.length,
      message: `Berhasil membersihkan ${duplicateIdsToDelete.length} data Posyandu duplikat. Kini seluruh ${SEED_POSYANDU_TEGAL.length} Posyandu se-Kota Tegal telah rapi dan unik.`,
    };
  } catch (err: any) {
    console.error("Error cleanupDuplicatePosyanduAction:", err);
    return {
      success: false,
      deletedCount: 0,
      message: err.message || "Gagal membersihkan data posyandu duplikat.",
    };
  }
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

export interface KomunitasAuditSummary {
  totalKomunitas: number;
  posyandu: {
    total: number;
    standardTarget: number;
    isComplete: boolean;
  };
  paud: {
    total: number;
    standardTarget: number;
    isComplete: boolean;
  };
  warga: {
    total: number;
    kecamatanCount: number;
    kelurahanCount: number;
    rwCount: number;
    rtCount: number;
    standardKec: number;
    standardKel: number;
    standardRw: number;
    isComplete: boolean;
  };
  kecamatanBreakdown: {
    nama: string;
    total: number;
    posyandu: number;
    paud: number;
    warga: number;
  }[];
}

/**
 * Server Action: Mengambil ringkasan audit kesesuaian jumlah komunitas (Ground Truth vs Database)
 */
export async function getKomunitasAuditSummaryAction(): Promise<{
  success: boolean;
  data?: KomunitasAuditSummary;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    const allInvalidIds = [...(INVALID_POSYANDU_IDS || []), ...(INVALID_PAUD_IDS || [])];

    // 1. Upayakan pembersihan data dummy/salah input posyandu & PAUD secara otomatis
    if (allInvalidIds.length > 0) {
      try {
        await supabase.from("komunitas").delete().in("id", allInvalidIds);
      } catch {
        // Abaikan jika user bukan super admin (RLS restrict)
      }
    }

    const invalidFilter = `(${allInvalidIds.join(",")})`;

    // Query exact database counts in parallel (head request without row size limits, excluding dummy IDs)
    const [
      totalRes,
      posyanduRes,
      paudRes,
      wargaRes,
      timurRes,
      baratRes,
      selatanRes,
      margadanaRes,
      timurPosRes,
      baratPosRes,
      selatanPosRes,
      margadanaPosRes,
      timurPaudRes,
      baratPaudRes,
      selatanPaudRes,
      margadanaPaudRes,
      timurWargaRes,
      baratWargaRes,
      selatanWargaRes,
      margadanaWargaRes,
    ] = await Promise.all([
      supabase.from("komunitas").select("*", { count: "exact", head: true }).not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("jenis", "posyandu").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("jenis", "satuan_paud").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("jenis", "warga_kita"),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Timur").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Barat").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Selatan").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Margadana").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Timur").eq("jenis", "posyandu").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Barat").eq("jenis", "posyandu").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Selatan").eq("jenis", "posyandu").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Margadana").eq("jenis", "posyandu").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Timur").eq("jenis", "satuan_paud").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Barat").eq("jenis", "satuan_paud").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Selatan").eq("jenis", "satuan_paud").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Margadana").eq("jenis", "satuan_paud").not("id", "in", invalidFilter),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Timur").eq("jenis", "warga_kita"),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Barat").eq("jenis", "warga_kita"),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Tegal Selatan").eq("jenis", "warga_kita"),
      supabase.from("komunitas").select("*", { count: "exact", head: true }).eq("kecamatan", "Margadana").eq("jenis", "warga_kita"),
    ]);

    const totalKomunitas = totalRes.count || 0;
    const posyanduCount = posyanduRes.count || 0;
    const paudCount = paudRes.count || 0;
    const wargaCount = wargaRes.count || 0;

    const kecamatanBreakdown = [
      {
        nama: "Tegal Timur",
        total: timurRes.count || 0,
        posyandu: timurPosRes.count || 0,
        paud: timurPaudRes.count || 0,
        warga: timurWargaRes.count || 0,
      },
      {
        nama: "Tegal Barat",
        total: baratRes.count || 0,
        posyandu: baratPosRes.count || 0,
        paud: baratPaudRes.count || 0,
        warga: baratWargaRes.count || 0,
      },
      {
        nama: "Tegal Selatan",
        total: selatanRes.count || 0,
        posyandu: selatanPosRes.count || 0,
        paud: selatanPaudRes.count || 0,
        warga: selatanWargaRes.count || 0,
      },
      {
        nama: "Margadana",
        total: margadanaRes.count || 0,
        posyandu: margadanaPosRes.count || 0,
        paud: margadanaPaudRes.count || 0,
        warga: margadanaWargaRes.count || 0,
      },
    ];

    const standardPosyanduTarget = SEED_POSYANDU_TEGAL.length || 209;
    const standardPaudTarget = SEED_PAUD_PKBM_TEGAL.length || 219;

    const summary: KomunitasAuditSummary = {
      totalKomunitas,
      posyandu: {
        total: posyanduCount,
        standardTarget: standardPosyanduTarget,
        isComplete: posyanduCount >= standardPosyanduTarget,
      },
      paud: {
        total: paudCount,
        standardTarget: standardPaudTarget,
        isComplete: paudCount >= standardPaudTarget,
      },
      warga: {
        total: wargaCount,
        kecamatanCount: 4,
        kelurahanCount: 27,
        rwCount: 459,
        rtCount: 7514,
        standardKec: 4,
        standardKel: 27,
        standardRw: 459,
        isComplete: wargaCount > 0,
      },
      kecamatanBreakdown,
    };

    return {
      success: true,
      data: summary,
    };
  } catch (err: any) {
    console.error("Error getKomunitasAuditSummaryAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat ringkasan audit komunitas.",
    };
  }
}

export interface GetKomunitasAdminListParams {
  jenis?: string;
  kecamatan?: string;
  kelurahan?: string;
  searchQuery?: string;
  sortBy?: "nama" | "jenis" | "kecamatan" | "kelurahan" | "created_at" | "jumlah_anggota";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Server Action: Mengambil daftar komunitas lengkap untuk Manajemen Admin
 */
export async function getKomunitasAdminListAction(params: GetKomunitasAdminListParams = {}): Promise<{
  success: boolean;
  data: KomunitasWithMembership[];
  totalCount: number;
  page: number;
  totalPages: number;
  message?: string;
}> {
  try {
    const supabase = await createClient();
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 15));
    const offset = (page - 1) * limit;
    const sortBy = params.sortBy || "created_at";
    const isAsc = params.sortOrder === "asc";

    let query = supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi, kontak, jadwal, created_at", { count: "exact" });

    const allInvalidIds = [...(INVALID_POSYANDU_IDS || []), ...(INVALID_PAUD_IDS || [])];
    if (allInvalidIds.length > 0) {
      try {
        await supabase.from("komunitas").delete().in("id", allInvalidIds);
      } catch {}
      const invalidFilter = `(${allInvalidIds.join(",")})`;
      query = query.not("id", "in", invalidFilter);
    }

    if (params.jenis && params.jenis !== "semua") {
      query = query.eq("jenis", params.jenis);
    }
    if (params.kecamatan && params.kecamatan !== "semua") {
      query = query.eq("kecamatan", params.kecamatan);
    }
    if (params.kelurahan && params.kelurahan !== "semua") {
      query = query.eq("kelurahan", params.kelurahan);
    }
    if (params.searchQuery && params.searchQuery.trim()) {
      const sq = `%${params.searchQuery.trim()}%`;
      query = query.or(`nama.ilike.${sq},lokasi.ilike.${sq},kelurahan.ilike.${sq},kecamatan.ilike.${sq}`);
    }

    if (sortBy === "jumlah_anggota") {
      const { data: allRawKoms, count, error } = await query;
      if (error) throw error;

      const totalCount = count || (allRawKoms ? allRawKoms.length : 0);
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      const komIds = (allRawKoms || []).map((k) => k.id);
      const countsMap: Record<string, number> = {};

      if (komIds.length > 0) {
        const { data: members } = await supabase
          .from("anggota_komunitas")
          .select("komunitas_id")
          .in("komunitas_id", komIds)
          .eq("status", "approved");

        if (members) {
          members.forEach((m) => {
            countsMap[m.komunitas_id] = (countsMap[m.komunitas_id] || 0) + 1;
          });
        }
      }

      const allItems: KomunitasWithMembership[] = (allRawKoms || []).map((item) => {
        const meta = extractKomunitasMetadata(item);
        let itemNama = item.nama || "Komunitas Tanpa Nama";
        let itemDeskripsi = item.deskripsi;
        if (item.jenis === "posyandu") {
          const coreName = extractCorePosyanduName(itemNama);
          itemNama = coreName ? `Posyandu ${coreName}` : "Posyandu";
          if (itemDeskripsi) {
            itemDeskripsi = itemDeskripsi.replace(/Posyandu\s+Posyandu/gi, "Posyandu");
          }
        }

        return {
          id: item.id,
          nama: itemNama,
          jenis: item.jenis,
          kecamatan: meta.kecamatan || item.kecamatan,
          kelurahan: meta.kelurahan || item.kelurahan,
          rw: item.rw,
          rt: item.rt,
          lokasi: item.lokasi || "Kota Tegal",
          deskripsi: itemDeskripsi,
          kontak: item.kontak,
          jadwal: item.jadwal,
          created_at: item.created_at,
          jumlah_anggota: countsMap[item.id] || 0,
        };
      });

      allItems.sort((a, b) => {
        const diff = (a.jumlah_anggota || 0) - (b.jumlah_anggota || 0);
        return isAsc ? diff : -diff;
      });

      const items = allItems.slice(offset, offset + limit);

      return {
        success: true,
        data: items,
        totalCount,
        page,
        totalPages,
      };
    } else {
      if (sortBy === "nama") {
        query = query.order("nama", { ascending: isAsc, nullsFirst: false });
      } else if (sortBy === "jenis") {
        query = query.order("jenis", { ascending: isAsc, nullsFirst: false }).order("nama", { ascending: true });
      } else if (sortBy === "kecamatan") {
        query = query.order("kecamatan", { ascending: isAsc, nullsFirst: false }).order("kelurahan", { ascending: true });
      } else if (sortBy === "kelurahan") {
        query = query.order("kelurahan", { ascending: isAsc, nullsFirst: false }).order("nama", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: isAsc, nullsFirst: false });
      }

      query = query.range(offset, offset + limit - 1);

      const { data: rawKoms, count, error } = await query;
      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      const komIds = (rawKoms || []).map((k) => k.id);
      const countsMap: Record<string, number> = {};

      if (komIds.length > 0) {
        const { data: members } = await supabase
          .from("anggota_komunitas")
          .select("komunitas_id")
          .in("komunitas_id", komIds)
          .eq("status", "approved");

        if (members) {
          members.forEach((m) => {
            countsMap[m.komunitas_id] = (countsMap[m.komunitas_id] || 0) + 1;
          });
        }
      }

      const items: KomunitasWithMembership[] = (rawKoms || []).map((item) => {
        const meta = extractKomunitasMetadata(item);
        let itemNama = item.nama || "Komunitas Tanpa Nama";
        let itemDeskripsi = item.deskripsi;
        if (item.jenis === "posyandu") {
          const coreName = extractCorePosyanduName(itemNama);
          itemNama = coreName ? `Posyandu ${coreName}` : "Posyandu";
          if (itemDeskripsi) {
            itemDeskripsi = itemDeskripsi.replace(/Posyandu\s+Posyandu/gi, "Posyandu");
          }
        }

        return {
          id: item.id,
          nama: itemNama,
          jenis: item.jenis,
          kecamatan: meta.kecamatan || item.kecamatan,
          kelurahan: meta.kelurahan || item.kelurahan,
          rw: item.rw,
          rt: item.rt,
          lokasi: item.lokasi || "Kota Tegal",
          deskripsi: itemDeskripsi,
          kontak: item.kontak,
          jadwal: item.jadwal,
          created_at: item.created_at,
          jumlah_anggota: countsMap[item.id] || 0,
        };
      });

      return {
        success: true,
        data: items,
        totalCount,
        page,
        totalPages,
      };
    }
  } catch (err: any) {
    console.error("Error getKomunitasAdminListAction:", err);
    return {
      success: false,
      data: [],
      totalCount: 0,
      page: 1,
      totalPages: 1,
      message: err.message || "Gagal mengambil daftar komunitas.",
    };
  }
}

/**
 * Server Action: Menambah Komunitas Baru oleh Super Admin
 */
export async function createKomunitasAdminAction(formData: FormData): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Akses ditolak: Anda harus masuk terlebih dahulu." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    })) {
      return { success: false, message: "Akses ditolak: Hanya Super Admin yang dapat menambahkan komunitas baru." };
    }

    const nama = formData.get("nama")?.toString()?.trim();
    const jenis = (formData.get("jenis")?.toString()?.trim() || "posyandu") as JenisKomunitas;
    const kecamatan = formData.get("kecamatan")?.toString()?.trim() || "";
    const kelurahan = formData.get("kelurahan")?.toString()?.trim() || "";
    const rw = formData.get("rw")?.toString()?.trim() || null;
    const rt = formData.get("rt")?.toString()?.trim() || null;
    const lokasi = formData.get("lokasi")?.toString()?.trim() || `${kelurahan}, ${kecamatan}, Kota Tegal`;
    const deskripsi = formData.get("deskripsi")?.toString()?.trim() || null;
    const kontak = formData.get("kontak")?.toString()?.trim() || null;
    const jadwal = formData.get("jadwal")?.toString()?.trim() || null;

    if (!nama) {
      return { success: false, message: "Nama komunitas wajib diisi." };
    }
    if (!kecamatan || !kelurahan) {
      return { success: false, message: "Kecamatan dan Kelurahan wajib dipilih." };
    }

    const cleanKec = kecamatan.toLowerCase().replace(/\s+/g, "-");
    const cleanKel = kelurahan.toLowerCase().replace(/\s+/g, "-");
    const cleanNama = nama.toLowerCase().replace(/\s+/g, "-");
    const id = toValidUUID(`kom-${jenis}-${cleanKec}-${cleanKel}-${cleanNama}-${Date.now()}`);

    const payload = {
      id,
      nama,
      nama_komunitas: nama,
      jenis,
      jenis_komunitas: jenis,
      kecamatan,
      kelurahan,
      rw,
      rt,
      lokasi,
      deskripsi,
      kontak,
      jadwal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabase
      .from("komunitas")
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    revalidatePath("/komunitas");
    revalidatePath("/profil");

    return {
      success: true,
      message: `Komunitas "${nama}" berhasil ditambahkan!`,
      data: inserted,
    };
  } catch (err: any) {
    console.error("Error createKomunitasAdminAction:", err);
    return {
      success: false,
      message: err.message || "Gagal menambahkan komunitas baru.",
    };
  }
}

/**
 * Server Action: Mengubah Data Komunitas oleh Super Admin
 */
export async function updateKomunitasAdminAction(
  komunitasId: string,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Akses ditolak: Anda harus masuk terlebih dahulu." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    })) {
      return { success: false, message: "Akses ditolak: Hanya Super Admin yang dapat mengubah data komunitas." };
    }

    const nama = formData.get("nama")?.toString()?.trim();
    const jenis = formData.get("jenis")?.toString()?.trim();
    const kecamatan = formData.get("kecamatan")?.toString()?.trim();
    const kelurahan = formData.get("kelurahan")?.toString()?.trim();
    const rw = formData.get("rw")?.toString()?.trim() || null;
    const rt = formData.get("rt")?.toString()?.trim() || null;
    const lokasi = formData.get("lokasi")?.toString()?.trim();
    const deskripsi = formData.get("deskripsi")?.toString()?.trim() || null;
    const kontak = formData.get("kontak")?.toString()?.trim() || null;
    const jadwal = formData.get("jadwal")?.toString()?.trim() || null;

    if (!nama) {
      return { success: false, message: "Nama komunitas wajib diisi." };
    }

    const updatePayload: any = {
      nama,
      nama_komunitas: nama,
      updated_at: new Date().toISOString(),
    };

    if (jenis) {
      updatePayload.jenis = jenis;
      updatePayload.jenis_komunitas = jenis;
    }
    if (kecamatan) updatePayload.kecamatan = kecamatan;
    if (kelurahan) updatePayload.kelurahan = kelurahan;
    updatePayload.rw = rw;
    updatePayload.rt = rt;
    if (lokasi) updatePayload.lokasi = lokasi;
    updatePayload.deskripsi = deskripsi;
    updatePayload.kontak = kontak;
    updatePayload.jadwal = jadwal;

    const { data: updated, error: updateError } = await supabase
      .from("komunitas")
      .update(updatePayload)
      .eq("id", komunitasId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/komunitas");
    revalidatePath("/profil");

    return {
      success: true,
      message: `Data komunitas "${nama}" berhasil diperbarui!`,
      data: updated,
    };
  } catch (err: any) {
    console.error("Error updateKomunitasAdminAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memperbarui data komunitas.",
    };
  }
}

/**
 * Server Action: Menghapus Komunitas oleh Super Admin
 */
export async function deleteKomunitasAdminAction(komunitasId: string): Promise<{
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
      return { success: false, message: "Akses ditolak: Anda harus masuk terlebih dahulu." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    })) {
      return { success: false, message: "Akses ditolak: Hanya Super Admin yang dapat menghapus komunitas." };
    }

    // 1. Bersihkan anggota terkait
    await supabase
      .from("anggota_komunitas")
      .delete()
      .eq("komunitas_id", komunitasId);

    // 2. Hapus komunitas
    const { error } = await supabase
      .from("komunitas")
      .delete()
      .eq("id", komunitasId);

    if (error) throw error;

    revalidatePath("/komunitas");
    revalidatePath("/profil");

    return {
      success: true,
      message: "Komunitas berhasil dihapus permanen.",
    };
  } catch (err: any) {
    console.error("Error deleteKomunitasAdminAction:", err);
    return {
      success: false,
      message: err.message || "Gagal menghapus komunitas.",
    };
  }
}

export interface KomunitasBerjenjangItem {
  id: string;
  nama: string;
  jenis: string;
  kecamatan: string;
  kelurahan: string;
  rw?: string | null;
  rt?: string | null;
  lokasi?: string;
  jumlahAnggota: number;
  kaderCount: number;
  pengurusCount: number;
  wargaCount: number;
  dataAnakCount: number;
}

export interface KelurahanHierarchyGroup {
  kelurahan: string;
  totalKomunitas: number;
  totalAnggota: number;
  totalDataAnak: number;
  komunitasList: KomunitasBerjenjangItem[];
}

export interface KecamatanHierarchyGroup {
  kecamatan: string;
  totalKomunitas: number;
  totalAnggota: number;
  totalDataAnak: number;
  kelurahanList: KelurahanHierarchyGroup[];
}

export interface HierarchicalActiveKomunitasSummary {
  totalKomunitasBeranggota: number;
  totalSeluruhAnggota: number;
  totalDataAnak: number;
  byJenis: {
    posyandu: { totalKomunitas: number; totalAnggota: number };
    satuan_paud: { totalKomunitas: number; totalAnggota: number };
    warga_kita: { totalKomunitas: number; totalAnggota: number };
  };
  kecamatanList: KecamatanHierarchyGroup[];
}

/**
 * Server Action: Mengambil data hierarki berjenjang komunitas yang sudah memiliki anggota dan jumlahnya
 */
export async function getHierarchicalActiveKomunitasAction(): Promise<{
  success: boolean;
  data?: HierarchicalActiveKomunitasSummary;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil seluruh anggota_komunitas yang approved
    const { data: rawMembers, error: memberErr } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, peran, status")
      .eq("status", "approved");

    if (memberErr) {
      throw memberErr;
    }

    if (!rawMembers || rawMembers.length === 0) {
      return {
        success: true,
        data: {
          totalKomunitasBeranggota: 0,
          totalSeluruhAnggota: 0,
          totalDataAnak: 0,
          byJenis: {
            posyandu: { totalKomunitas: 0, totalAnggota: 0 },
            satuan_paud: { totalKomunitas: 0, totalAnggota: 0 },
            warga_kita: { totalKomunitas: 0, totalAnggota: 0 },
          },
          kecamatanList: [],
        },
      };
    }

    // 2. Kumpulkan komunitas_id unik dan statistik peran
    const komStatsMap: Record<
      string,
      {
        total: number;
        kader: number;
        pengurus: number;
        warga: number;
      }
    > = {};

    for (const m of rawMembers) {
      const kId = m.komunitas_id;
      if (!kId) continue;
      if (!komStatsMap[kId]) {
        komStatsMap[kId] = { total: 0, kader: 0, pengurus: 0, warga: 0 };
      }
      komStatsMap[kId].total += 1;

      const pLower = (m.peran || "").toLowerCase();
      if (
        pLower.includes("kader") ||
        pLower.includes("medis") ||
        pLower.includes("nakes") ||
        pLower.includes("bidan")
      ) {
        komStatsMap[kId].kader += 1;
      } else if (
        pLower.includes("pengurus") ||
        pLower.includes("admin") ||
        pLower.includes("ketua") ||
        pLower.includes("pengelola") ||
        pLower.includes("pimpinan") ||
        pLower.includes("kepala")
      ) {
        komStatsMap[kId].pengurus += 1;
      } else {
        komStatsMap[kId].warga += 1;
      }
    }

    const activeKomIds = Object.keys(komStatsMap);

    // 3. Ambil data anak per komunitas
    const { data: rawChildren } = await supabase
      .from("data_anak")
      .select("komunitas_id");

    const dataAnakCountMap: Record<string, number> = {};
    if (rawChildren) {
      for (const ch of rawChildren) {
        if (ch.komunitas_id) {
          dataAnakCountMap[ch.komunitas_id] =
            (dataAnakCountMap[ch.komunitas_id] || 0) + 1;
        }
      }
    }

    // 4. Ambil detail komunitas dari tabel komunitas
    const { data: dbKomList } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi")
      .in("id", activeKomIds);

    const dbKomMap = new Map((dbKomList || []).map((k) => [k.id, k]));

    // 5. Susun array KomunitasBerjenjangItem
    const allActiveItems: KomunitasBerjenjangItem[] = [];
    let totalPosyanduKom = 0;
    let totalPosyanduAnggota = 0;
    let totalPaudKom = 0;
    let totalPaudAnggota = 0;
    let totalWargaKom = 0;
    let totalWargaAnggota = 0;
    let totalGlobalDataAnak = 0;

    for (const kId of activeKomIds) {
      const stats = komStatsMap[kId];
      let kom: any = dbKomMap.get(kId);

      if (!kom) {
        const seed = findOrGenerateKomunitasSeed(kId);
        if (seed) {
          kom = {
            id: kId,
            nama: seed.nama,
            jenis: seed.jenis,
            kecamatan: seed.kecamatan,
            kelurahan: seed.kelurahan,
            rw: seed.rw,
            rt: seed.rt,
            lokasi: seed.lokasi,
            deskripsi: (seed as any)?.deskripsi || null,
          };
        }
      }

      const meta = extractKomunitasMetadata(kom || { id: kId });
      let itemNama = kom?.nama || "Komunitas Tegal";
      const itemJenis = kom?.jenis || "posyandu";
      if (itemJenis === "posyandu") {
        const coreName = extractCorePosyanduName(itemNama);
        if (coreName) itemNama = `Posyandu ${coreName}`;
      }

      const rawKec = meta.kecamatan || kom?.kecamatan || "Kota Tegal";
      const rawKel = meta.kelurahan || kom?.kelurahan || "Umum";
      const childCount = dataAnakCountMap[kId] || 0;
      totalGlobalDataAnak += childCount;

      if (itemJenis === "posyandu") {
        totalPosyanduKom += 1;
        totalPosyanduAnggota += stats.total;
      } else if (itemJenis === "satuan_paud") {
        totalPaudKom += 1;
        totalPaudAnggota += stats.total;
      } else {
        totalWargaKom += 1;
        totalWargaAnggota += stats.total;
      }

      allActiveItems.push({
        id: kId,
        nama: itemNama,
        jenis: itemJenis,
        kecamatan: rawKec,
        kelurahan: rawKel,
        rw: kom?.rw || meta.rw || null,
        rt: kom?.rt || meta.rt || null,
        lokasi: kom?.lokasi || "Kota Tegal",
        jumlahAnggota: stats.total,
        kaderCount: stats.kader,
        pengurusCount: stats.pengurus,
        wargaCount: stats.warga,
        dataAnakCount: childCount,
      });
    }

    // 6. Urutkan item dari jumlah anggota terbanyak
    allActiveItems.sort((a, b) => b.jumlahAnggota - a.jumlahAnggota);

    // 7. Kelompokkan secara berjenjang (Kecamatan -> Kelurahan -> Komunitas)
    const kecamatanMap: Record<string, Record<string, KomunitasBerjenjangItem[]>> = {};

    for (const item of allActiveItems) {
      const kec = item.kecamatan || "Kota Tegal";
      const kel = item.kelurahan || "Umum";

      if (!kecamatanMap[kec]) {
        kecamatanMap[kec] = {};
      }
      if (!kecamatanMap[kec][kel]) {
        kecamatanMap[kec][kel] = [];
      }
      kecamatanMap[kec][kel].push(item);
    }

    // Standar urutan 4 kecamatan Kota Tegal
    const standardKecList = ["Tegal Timur", "Tegal Barat", "Tegal Selatan", "Margadana"];
    const allFoundKecNames = Object.keys(kecamatanMap).sort((a, b) => {
      const idxA = standardKecList.indexOf(a);
      const idxB = standardKecList.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const kecamatanHierarchy: KecamatanHierarchyGroup[] = allFoundKecNames.map(
      (kecName) => {
        const kelMap = kecamatanMap[kecName];
        const kelNames = Object.keys(kelMap).sort((a, b) => a.localeCompare(b));

        let kecTotalKom = 0;
        let kecTotalAnggota = 0;
        let kecTotalDataAnak = 0;

        const kelurahanList: KelurahanHierarchyGroup[] = kelNames.map((kelName) => {
          const list = kelMap[kelName];
          const kelTotalKom = list.length;
          const kelTotalAnggota = list.reduce(
            (sum, it) => sum + it.jumlahAnggota,
            0
          );
          const kelTotalDataAnak = list.reduce(
            (sum, it) => sum + it.dataAnakCount,
            0
          );

          kecTotalKom += kelTotalKom;
          kecTotalAnggota += kelTotalAnggota;
          kecTotalDataAnak += kelTotalDataAnak;

          return {
            kelurahan: kelName,
            totalKomunitas: kelTotalKom,
            totalAnggota: kelTotalAnggota,
            totalDataAnak: kelTotalDataAnak,
            komunitasList: list,
          };
        });

        return {
          kecamatan: kecName,
          totalKomunitas: kecTotalKom,
          totalAnggota: kecTotalAnggota,
          totalDataAnak: kecTotalDataAnak,
          kelurahanList,
        };
      }
    );

    return {
      success: true,
      data: {
        totalKomunitasBeranggota: allActiveItems.length,
        totalSeluruhAnggota: rawMembers.length,
        totalDataAnak: totalGlobalDataAnak,
        byJenis: {
          posyandu: { totalKomunitas: totalPosyanduKom, totalAnggota: totalPosyanduAnggota },
          satuan_paud: { totalKomunitas: totalPaudKom, totalAnggota: totalPaudAnggota },
          warga_kita: { totalKomunitas: totalWargaKom, totalAnggota: totalWargaAnggota },
        },
        kecamatanList: kecamatanHierarchy,
      },
    };
  } catch (err: any) {
    console.error("Error getHierarchicalActiveKomunitasAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat hierarki komunitas beranggota.",
    };
  }
}

import type { KontakKomunitasDetail } from "@/types/database";

/**
 * Server Action: Mengupdate Informasi Resmi & Operasional (Alamat Lokasi, Jadwal, Profil & Visi, dan Kontak Kader 6 Bidang)
 * Khusus Super Admin atau Admin / Pengurus / Kader Resmi Komunitas Terkait
 */
export async function updateKomunitasInformasiOperasional({
  komunitasId,
  lokasi,
  jadwal,
  deskripsi,
  kontakDetail,
}: {
  komunitasId: string;
  lokasi?: string;
  jadwal?: string;
  deskripsi?: string;
  kontakDetail: KontakKomunitasDetail;
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
        message: "Silakan masuk terlebih dahulu untuk memperbarui data.",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });
    const dbKomunitasId = toValidUUID(komunitasId);

    // Cek wewenang Admin, Pengurus, Kader jika bukan Super Admin
    let hasAdminAuth = isSuperAdmin;
    if (!hasAdminAuth) {
      const { data: myMembership } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", dbKomunitasId)
        .eq("status", "approved")
        .maybeSingle();

      if (myMembership && isRoleAdmin(myMembership.peran)) {
        hasAdminAuth = true;
      }

      // Cek hierarki admin wilayah (Admin RT/RW/Kelurahan/Kecamatan/Kota)
      if (!hasAdminAuth) {
        const { data: userAdminMemberships } = await supabase
          .from("anggota_komunitas")
          .select("komunitas_id, peran, status")
          .eq("user_id", user.id)
          .eq("status", "approved");

        const approvedAdminMemberships = (userAdminMemberships || []).filter((m) =>
          isRoleAdmin(m.peran)
        );

        if (approvedAdminMemberships.length > 0) {
          const { data: targetKom } = await supabase
            .from("komunitas")
            .select("*")
            .eq("id", dbKomunitasId)
            .maybeSingle();

          const targetData = targetKom || findOrGenerateKomunitasSeed(komunitasId);
          if (targetData) {
            const pageMeta = extractKomunitasMetadata(targetData);

            const { data: allKomunitas } = await supabase
              .from("komunitas")
              .select("id, nama, jenis, kecamatan, kelurahan, rw, rt");

            const komMap = new Map((allKomunitas || []).map((k) => [k.id, k]));

            for (const ca of approvedAdminMemberships) {
              const caKom = komMap.get(ca.komunitas_id) || findOrGenerateKomunitasSeed(ca.komunitas_id);
              const caMeta = extractKomunitasMetadata(caKom || { id: ca.komunitas_id });

              // Admin Kota / Kecamatan
              if (caMeta.kec === pageMeta.kec && !caMeta.hasKel && !caMeta.hasRw && !caMeta.hasRt) {
                hasAdminAuth = true;
                break;
              }
              // Admin Kelurahan
              if (caMeta.kec === pageMeta.kec && caMeta.kel === pageMeta.kel && !caMeta.hasRw && !caMeta.hasRt) {
                hasAdminAuth = true;
                break;
              }
              // Admin RW
              if (caMeta.kec === pageMeta.kec && caMeta.kel === pageMeta.kel && caMeta.rw === pageMeta.rw && !caMeta.hasRt) {
                hasAdminAuth = true;
                break;
              }
              // Admin RT
              if (caMeta.kec === pageMeta.kec && caMeta.kel === pageMeta.kel && caMeta.rw === pageMeta.rw && caMeta.rt === pageMeta.rt) {
                hasAdminAuth = true;
                break;
              }
            }
          }
        }
      }
    }

    if (!hasAdminAuth) {
      return {
        success: false,
        message:
          "Akses ditolak: Hanya Admin, Pengurus, Kader resmi atau Super Admin yang berhak mengedit Informasi Resmi & Operasional.",
      };
    }

    // Pastikan komunitas sudah ada di database atau buat fallback seed
    const seedItem = findOrGenerateKomunitasSeed(komunitasId);
    const serializedKontak = JSON.stringify(kontakDetail);

    const updatePayload: Record<string, any> = {
      id: dbKomunitasId,
      nama: seedItem?.nama || "Komunitas",
      nama_komunitas: seedItem?.nama || "Komunitas",
      jenis: seedItem?.jenis || "posyandu",
      jenis_komunitas: seedItem?.jenis || "posyandu",
      kecamatan: seedItem?.kecamatan || "Kota Tegal",
      kelurahan: seedItem?.kelurahan || "Semua Kelurahan",
      lokasi: lokasi?.trim() || seedItem?.lokasi || "Kota Tegal",
      jadwal: jadwal?.trim() || null,
      deskripsi: deskripsi?.trim() || null,
      kontak: serializedKontak,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from("komunitas")
      .upsert(updatePayload, { onConflict: "id" });

    if (upsertErr) {
      throw upsertErr;
    }

    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/profil");

    return {
      success: true,
      message: "Informasi Resmi & Operasional berhasil disimpan!",
    };
  } catch (err: any) {
    console.error("Error updateKomunitasInformasiOperasional:", err);
    return {
      success: false,
      message: err.message || "Gagal menyimpan informasi operasional.",
    };
  }
}

export interface PaudKomunitasMemberSummary {
  id: string;
  rawId: string;
  nama: string;
  npsn?: string;
  jenisInstitusi: string;
  kecamatan: string;
  kelurahan: string;
  lokasi: string;
  kontak?: string;
  jadwal?: string;
  deskripsi?: string;
  totalAnggota: number;
  jumlahKepalaSekolah: number;
  jumlahGuru: number;
  jumlahOrangTua: number;
  jumlahKomite: number;
  jumlahLainnya: number;
  statusKeanggotaan: "sudah_beranggota" | "belum_beranggota";
  adminName?: string | null;
  adminRole?: string | null;
  sampleMembers?: {
    id: string;
    nama: string;
    peran: string;
    avatar_url?: string | null;
  }[];
}

export interface PaudKomunitasRekapTableData {
  summary: {
    totalLembaga: number;
    totalSudahBeranggota: number;
    totalBelumBeranggota: number;
    totalSeluruhAnggota: number;
    totalKepalaSekolah: number;
    totalGuru: number;
    totalOrangTua: number;
    totalKomite: number;
    totalLainnya: number;
    byJenisInstitusi: Record<
      string,
      { totalLembaga: number; sudahBeranggota: number; totalAnggota: number }
    >;
    byKecamatan: Record<
      string,
      { totalLembaga: number; sudahBeranggota: number; totalAnggota: number }
    >;
  };
  items: PaudKomunitasMemberSummary[];
}

/**
 * Server Action: Mengambil data tabel rekap keanggotaan 219 Satuan PAUD & PKBM Kota Tegal
 * dengan rincian peran (Kepala Sekolah, Guru PAUD, Orang Tua, Komite, dll) serta status keanggotaan.
 */
export async function getPaudKomunitasRekapTableAction(): Promise<{
  success: boolean;
  message?: string;
  data?: PaudKomunitasRekapTableData;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil seluruh anggota_komunitas yang approved
    const { data: rawMembers, error: memberErr } = await supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, user_id, peran, status, created_at")
      .eq("status", "approved");

    if (memberErr) {
      console.warn("Query anggota_komunitas error:", memberErr.message);
    }

    const membersList = rawMembers || [];

    // 2. Ambil profile user terkait
    const userIds = Array.from(
      new Set(membersList.map((m) => m.user_id).filter(Boolean))
    );
    const { data: profilesData } =
      userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, nama_lengkap, email, avatar_url")
            .in("id", userIds)
        : { data: [] };

    const profileMap = new Map<string, any>(
      (profilesData || []).map((p: any) => [p.id, p])
    );

    // 3. Ambil data komunitas di DB jika ada
    const { data: dbPaudKomunitas } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, lokasi, kontak, jadwal, deskripsi")
      .eq("jenis", "satuan_paud");

    // 4. Kumpulkan anggota berdasarkan komunitas_id
    const membersByKomId: Record<string, any[]> = {};
    membersList.forEach((m) => {
      const kId = m.komunitas_id;
      if (!kId) return;
      if (!membersByKomId[kId]) {
        membersByKomId[kId] = [];
      }
      membersByKomId[kId].push(m);
    });

    // 5. Agregasi setiap 219 Master Satuan PAUD & PKBM
    const summaryByJenis: Record<
      string,
      { totalLembaga: number; sudahBeranggota: number; totalAnggota: number }
    > = {};
    const summaryByKec: Record<
      string,
      { totalLembaga: number; sudahBeranggota: number; totalAnggota: number }
    > = {};

    const items: PaudKomunitasMemberSummary[] = RAW_PAUD_PKBM_TEGAL.map(
      (item) => {
        const rawId = item.id || `kom-paud-${slugify(item.kecamatan)}-${slugify(item.kelurahan)}-${slugify(item.nama)}`;
        const validId = toValidUUID(rawId);

        // Kumpulkan candidate IDs yang mungkin match
        const matchingDbKoms = (dbPaudKomunitas || []).filter((k: any) => {
          const kNama = (k.nama || "").toLowerCase().trim();
          const itNama = item.nama.toLowerCase().trim();
          return (
            kNama === itNama &&
            (k.kecamatan || "").toLowerCase().trim() ===
              item.kecamatan.toLowerCase().trim()
          );
        });

        const candidateIds = new Set<string>([
          rawId,
          validId,
          item.id || "",
          ...matchingDbKoms.map((k: any) => k.id),
        ]);

        // Temukan seluruh anggota yang terdaftar di kandidat ID ini
        const matchedMembers: any[] = [];
        const seenMemberIds = new Set<string>();

        candidateIds.forEach((cid) => {
          if (!cid) return;
          const group = membersByKomId[cid] || [];
          group.forEach((gm) => {
            if (!seenMemberIds.has(gm.id)) {
              seenMemberIds.add(gm.id);
              matchedMembers.push(gm);
            }
          });
        });

        // Hitung rincian peran
        let jumlahKepalaSekolah = 0;
        let jumlahGuru = 0;
        let jumlahOrangTua = 0;
        let jumlahKomite = 0;
        let jumlahLainnya = 0;
        let adminName: string | null = null;
        let adminRole: string | null = null;

        const sampleMembers: {
          id: string;
          nama: string;
          peran: string;
          avatar_url?: string | null;
        }[] = [];

        matchedMembers.forEach((m) => {
          const prof = profileMap.get(m.user_id);
          const name =
            prof?.nama_lengkap || prof?.email || "Anggota Terdaftar";
          const pLower = (m.peran || "").toLowerCase().trim();

          if (
            pLower.includes("kepala") ||
            pLower.includes("pimpinan") ||
            pLower.includes("pengelola") ||
            pLower.includes("direktur")
          ) {
            jumlahKepalaSekolah += 1;
            if (!adminName) {
              adminName = name;
              adminRole = m.peran;
            }
          } else if (
            pLower.includes("guru") ||
            pLower.includes("pendidik") ||
            pLower.includes("tutor") ||
            pLower.includes("pengajar") ||
            pLower.includes("fasilitator")
          ) {
            jumlahGuru += 1;
          } else if (
            pLower.includes("orangtua") ||
            pLower.includes("orang tua") ||
            pLower.includes("wali") ||
            pLower.includes("ayah") ||
            pLower.includes("ibu") ||
            pLower.includes("bunda")
          ) {
            jumlahOrangTua += 1;
          } else if (pLower.includes("komite")) {
            jumlahKomite += 1;
          } else {
            jumlahLainnya += 1;
            if (
              !adminName &&
              (pLower.includes("admin") || pLower.includes("pengurus"))
            ) {
              adminName = name;
              adminRole = m.peran;
            }
          }

          if (sampleMembers.length < 8) {
            sampleMembers.push({
              id: m.id,
              nama: name,
              peran: m.peran || "Anggota",
              avatar_url: prof?.avatar_url || null,
            });
          }
        });

        const totalAnggota = matchedMembers.length;
        const statusKeanggotaan: "sudah_beranggota" | "belum_beranggota" =
          totalAnggota > 0 ? "sudah_beranggota" : "belum_beranggota";

        // Tentukan jenis institusi
        let jenisInstitusi = item.jenis_institusi || "PAUD";
        if (!item.jenis_institusi) {
          const upperNama = item.nama.toUpperCase();
          if (upperNama.startsWith("TK ")) jenisInstitusi = "TK";
          else if (upperNama.startsWith("KB ")) jenisInstitusi = "KB";
          else if (upperNama.startsWith("RA ")) jenisInstitusi = "RA";
          else if (upperNama.startsWith("PKBM ")) jenisInstitusi = "PKBM";
          else if (upperNama.startsWith("TPA ")) jenisInstitusi = "TPA";
          else if (upperNama.startsWith("SPS ") || upperNama.startsWith("POS PAUD")) jenisInstitusi = "SPS";
          else if (upperNama.startsWith("SKB ")) jenisInstitusi = "SKB";
        }

        // Agregasi per jenis
        if (!summaryByJenis[jenisInstitusi]) {
          summaryByJenis[jenisInstitusi] = {
            totalLembaga: 0,
            sudahBeranggota: 0,
            totalAnggota: 0,
          };
        }
        summaryByJenis[jenisInstitusi].totalLembaga += 1;
        if (totalAnggota > 0) {
          summaryByJenis[jenisInstitusi].sudahBeranggota += 1;
          summaryByJenis[jenisInstitusi].totalAnggota += totalAnggota;
        }

        // Agregasi per kecamatan
        const kec = item.kecamatan || "Kota Tegal";
        if (!summaryByKec[kec]) {
          summaryByKec[kec] = {
            totalLembaga: 0,
            sudahBeranggota: 0,
            totalAnggota: 0,
          };
        }
        summaryByKec[kec].totalLembaga += 1;
        if (totalAnggota > 0) {
          summaryByKec[kec].sudahBeranggota += 1;
          summaryByKec[kec].totalAnggota += totalAnggota;
        }

        return {
          id: validId,
          rawId,
          nama: item.nama,
          npsn: item.npsn,
          jenisInstitusi,
          kecamatan: item.kecamatan,
          kelurahan: item.kelurahan,
          lokasi: item.lokasi || `${item.kelurahan}, ${item.kecamatan}, Kota Tegal`,
          kontak: item.kontak,
          jadwal: item.jadwal,
          deskripsi: item.deskripsi,
          totalAnggota,
          jumlahKepalaSekolah,
          jumlahGuru,
          jumlahOrangTua,
          jumlahKomite,
          jumlahLainnya,
          statusKeanggotaan,
          adminName,
          adminRole,
          sampleMembers,
        };
      }
    );

    // Hitung total ringkasan global
    const totalLembaga = items.length;
    const totalSudahBeranggota = items.filter(
      (i) => i.statusKeanggotaan === "sudah_beranggota"
    ).length;
    const totalBelumBeranggota = totalLembaga - totalSudahBeranggota;
    const totalSeluruhAnggota = items.reduce(
      (sum, i) => sum + i.totalAnggota,
      0
    );
    const totalKepalaSekolah = items.reduce(
      (sum, i) => sum + i.jumlahKepalaSekolah,
      0
    );
    const totalGuru = items.reduce((sum, i) => sum + i.jumlahGuru, 0);
    const totalOrangTua = items.reduce((sum, i) => sum + i.jumlahOrangTua, 0);
    const totalKomite = items.reduce((sum, i) => sum + i.jumlahKomite, 0);
    const totalLainnya = items.reduce((sum, i) => sum + i.jumlahLainnya, 0);

    return {
      success: true,
      data: {
        summary: {
          totalLembaga,
          totalSudahBeranggota,
          totalBelumBeranggota,
          totalSeluruhAnggota,
          totalKepalaSekolah,
          totalGuru,
          totalOrangTua,
          totalKomite,
          totalLainnya,
          byJenisInstitusi: summaryByJenis,
          byKecamatan: summaryByKec,
        },
        items,
      },
    };
  } catch (err: any) {
    console.error("Error getPaudKomunitasRekapTableAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat rekap tabel komunitas PAUD & PKBM.",
    };
  }
}




