"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  MASTER_KOMUNITAS_SEED,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
  KOTA_TEGAL_DATA,
  generateWargaKomunitasItem,
  findOrGenerateKomunitasSeed,
  type MasterKomunitasSeedItem,
} from "@/lib/constants/tegal-data";
import { SEED_POSYANDU_TEGAL } from "@/lib/constants/seed-posyandu-tegal";
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
 * Helper: Resolve seed and dynamically generate RT items up to RT 17 per RW with text search
 */
function resolveSeedAndGeneratedKomunitas(
  params: GetKomunitasListParams
): MasterKomunitasSeedItem[] {
  const isWarga =
    !params.jenis || params.jenis === "semua" || params.jenis === "warga_kita";
  const cleanRw =
    params.rw && params.rw !== "semua"
      ? params.rw.replace(/\D/g, "").padStart(2, "0")
      : null;
  const cleanRt =
    params.rt && params.rt !== "semua"
      ? params.rt.replace(/\D/g, "").padStart(2, "0")
      : null;
  const hasKelurahan = params.kelurahan && params.kelurahan !== "semua";
  const hasKecamatan = params.kecamatan && params.kecamatan !== "semua";
  const searchQ = params.searchQuery?.trim().toLowerCase() || "";

  let candidateList: MasterKomunitasSeedItem[] = [];

  // When filtering Warga Kita by RW / Kelurahan / Kecamatan, ensure all 17 RTs are available
  if (isWarga && (cleanRw || hasKelurahan || hasKecamatan) && !searchQ) {
    if (hasKelurahan) {
      const kelName = params.kelurahan!;
      let kecName = hasKecamatan ? params.kecamatan! : "Tegal Timur";
      if (!hasKecamatan) {
        for (const [k, d] of Object.entries(KOTA_TEGAL_DATA)) {
          if (d.kelurahan[kelName]) {
            kecName = k;
            break;
          }
        }
      }

      if (cleanRw) {
        // Specific RW chosen: return either single RT or all 17 RTs for this RW
        if (cleanRt) {
          const existing = MASTER_KOMUNITAS_SEED.find(
            (k) =>
              k.jenis === "warga_kita" &&
              k.kelurahan.toLowerCase() === kelName.toLowerCase() &&
              (k.rw || "").replace(/\D/g, "").padStart(2, "0") === cleanRw &&
              (k.rt || "").replace(/\D/g, "").padStart(2, "0") === cleanRt
          );
          candidateList = [
            existing ||
              generateWargaKomunitasItem(kecName, kelName, cleanRw, cleanRt),
          ];
        } else {
          // All 17 RTs for this RW
          candidateList = DAFTAR_RT_TEGAL.map((rtNum) => {
            const existing = MASTER_KOMUNITAS_SEED.find(
              (k) =>
                k.jenis === "warga_kita" &&
                k.kelurahan.toLowerCase() === kelName.toLowerCase() &&
                (k.rw || "").replace(/\D/g, "").padStart(2, "0") === cleanRw &&
                (k.rt || "").replace(/\D/g, "").padStart(2, "0") === rtNum
            );
            return (
              existing ||
              generateWargaKomunitasItem(kecName, kelName, cleanRw, rtNum)
            );
          });
        }
      } else if (cleanRt) {
        // Specific RT chosen with Semua RW: return RT {cleanRt} across RW 01 s/d RW 17
        candidateList = DAFTAR_RW_TEGAL.map((rwNum) => {
          const existing = MASTER_KOMUNITAS_SEED.find(
            (k) =>
              k.jenis === "warga_kita" &&
              k.kelurahan.toLowerCase() === kelName.toLowerCase() &&
              (k.rw || "").replace(/\D/g, "").padStart(2, "0") === rwNum &&
              (k.rt || "").replace(/\D/g, "").padStart(2, "0") === cleanRt
          );
          return (
            existing ||
            generateWargaKomunitasItem(kecName, kelName, rwNum, cleanRt)
          );
        });
      }
    } else if (hasKecamatan && cleanRw) {
      // Specific Kecamatan and specific RW
      const kelList = Object.keys(
        KOTA_TEGAL_DATA[params.kecamatan!]?.kelurahan || {}
      );
      const results: MasterKomunitasSeedItem[] = [];
      for (const kel of kelList) {
        if (cleanRt) {
          results.push(
            generateWargaKomunitasItem(
              params.kecamatan!,
              kel,
              cleanRw,
              cleanRt
            )
          );
        } else {
          for (const rtNum of DAFTAR_RT_TEGAL) {
            results.push(
              generateWargaKomunitasItem(
                params.kecamatan!,
                kel,
                cleanRw,
                rtNum
              )
            );
          }
        }
      }
      candidateList = results;
    }
  }

  // Jika candidateList belum terisi (pencarian umum atau filter biasa), gunakan master seed
  if (candidateList.length === 0) {
    candidateList = MASTER_KOMUNITAS_SEED;
  }

  // Default seed filtering for general queries & text search
  return candidateList.filter((item) => {
    // 1. Filter Jenis
    if (
      params.jenis &&
      params.jenis !== "semua" &&
      item.jenis !== params.jenis
    ) {
      return false;
    }

    // 2. Filter Pencarian Teks (Search Query)
    if (searchQ) {
      const matchNama = (item.nama || "").toLowerCase().includes(searchQ);
      const matchKel = (item.kelurahan || "").toLowerCase().includes(searchQ);
      const matchKec = (item.kecamatan || "").toLowerCase().includes(searchQ);
      const matchLok = (item.lokasi || "").toLowerCase().includes(searchQ);
      const matchDesc = (item.deskripsi || "").toLowerCase().includes(searchQ);

      if (!matchNama && !matchKel && !matchKec && !matchLok && !matchDesc) {
        return false;
      }
    }

    // 3. Filter Kecamatan
    if (
      params.kecamatan &&
      params.kecamatan !== "semua" &&
      item.kecamatan.toLowerCase() !== params.kecamatan.toLowerCase()
    ) {
      return false;
    }

    // 4. Filter Kelurahan
    if (
      params.kelurahan &&
      params.kelurahan !== "semua" &&
      item.kelurahan.toLowerCase() !== params.kelurahan.toLowerCase()
    ) {
      return false;
    }

    // 5. Filter RW
    if (cleanRw) {
      const itemRw = (item.rw || "").replace(/\D/g, "").padStart(2, "0");
      if (cleanRw !== itemRw) {
        return false;
      }
    }

    // 6. Filter RT
    if (cleanRt) {
      const itemRt = (item.rt || "").replace(/\D/g, "").padStart(2, "0");
      if (cleanRt !== itemRt) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Server Action: Mengambil daftar komunitas dengan filter, pencarian, & paginasi
 */
export async function getKomunitasList(
  params: GetKomunitasListParams = {}
): Promise<GetKomunitasListResult> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const offset = (page - 1) * limit;

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

    // 2. Query data dari Supabase dengan Count & Pagination
    let query = supabase
      .from("komunitas")
      .select(
        "id, nama_komunitas, jenis_komunitas, kecamatan, kelurahan, rw, rt, created_at",
        { count: "exact" }
      );

    if (params.jenis && params.jenis !== "semua") {
      query = query.eq("jenis_komunitas", params.jenis);
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
    if (params.rt && params.rt !== "semua") {
      const cleanRt = params.rt.replace(/\D/g, "").padStart(2, "0");
      query = query.eq("rt", cleanRt);
    }
    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.trim();
      query = query.ilike("nama_komunitas", `%${q}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: dbData, count, error: dbError } = await query;

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

    let rawList: any[] = dbData || [];
    let totalCount = count || 0;

    // Jika database masih kosong atau ada error tabel, gunakan master seed data & dynamic RT generator
    if (dbError || rawList.length === 0) {
      const fullFallback = resolveSeedAndGeneratedKomunitas(params);
      totalCount = fullFallback.length;
      rawList = fullFallback.slice(offset, offset + limit);
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasMore = page < totalPages;

    // 3. Gabungkan info keanggotaan dan jumlah anggota
    const items: KomunitasWithMembership[] = rawList.map((k: any) => {
      const seedItem = findOrGenerateKomunitasSeed(k.id);
      const nama = k.nama_komunitas || k.nama || "Komunitas";
      const jenis = k.jenis_komunitas || k.jenis || "posyandu";
      const lokasi =
        k.lokasi ||
        seedItem?.lokasi ||
        [k.kelurahan, k.kecamatan, "Kota Tegal"].filter(Boolean).join(", ");
      const deskripsi =
        k.deskripsi ||
        seedItem?.deskripsi ||
        `Layanan dan kegiatan ${nama} di ${lokasi}.`;

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
        kontak: k.kontak || seedItem?.kontak || null,
        jadwal: k.jadwal || seedItem?.jadwal || null,
        created_at: k.created_at,
        jumlah_anggota:
          countsMap[k.id] ||
          countsMap[toValidUUID(k.id)] ||
          (jenis === "posyandu" ? 12 : 24),
        currentUserMembership:
          userMemberships[k.id] ||
          userMemberships[toValidUUID(k.id)] ||
          null,
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
    // Fallback seed data saat offline atau error koneksi
    const fullFallback = resolveSeedAndGeneratedKomunitas(params);
    const totalCount = fullFallback.length;
    const paginatedList = fullFallback.slice(offset, offset + limit);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasMore = page < totalPages;

    const fallbackList: KomunitasWithMembership[] = paginatedList.map((k) => ({
      ...k,
      jumlah_anggota: k.jenis === "posyandu" ? 12 : 24,
      currentUserMembership: null,
    }));

    return {
      success: true,
      data: fallbackList,
      currentUserId: null,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };
  }
}

/**
 * Helper: Upsert seluruh 230+ Posyandu Kota Tegal ke Supabase
 */
export async function seedPosyanduToSupabase(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const items = SEED_POSYANDU_TEGAL.map((p) => ({
      id: toValidUUID(p.id),
      nama_komunitas: p.nama,
      jenis_komunitas: p.jenis,
      kecamatan: p.kecamatan,
      kelurahan: p.kelurahan,
      rt: p.rt || null,
      rw: p.rw || null,
    }));

    // Batch upsert per 50 items agar efisien
    const chunkSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const { error } = await supabase.from("komunitas").upsert(chunk, { onConflict: "id" });
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
 * Server Action: Mengisi seluruh data Posyandu se-Kota Tegal ke Supabase
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

    // Pastikan komunitas terdaftar di database (upsert dari seed jika belum ada)
    const { data: existingKom } = await supabase
      .from("komunitas")
      .select("id")
      .eq("id", dbKomunitasId)
      .maybeSingle();

    if (!existingKom) {
      const seedItem =
        findOrGenerateKomunitasSeed(komunitasId) ||
        findOrGenerateKomunitasSeed(dbKomunitasId);

      if (seedItem) {
        await supabase.from("komunitas").upsert(
          {
            id: dbKomunitasId,
            nama_komunitas: seedItem.nama,
            jenis_komunitas: seedItem.jenis,
            kecamatan: seedItem.kecamatan,
            kelurahan: seedItem.kelurahan,
            rt: seedItem.rt || null,
            rw: seedItem.rw || null,
          },
          { onConflict: "id" }
        );
      }
    }

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
      let { error: updateError } = await supabase
        .from("anggota_komunitas")
        .update({
          peran: dbRole,
          status: "pending",
        })
        .eq("id", existingMember.id);

      if (updateError && updateError.message?.includes("enum")) {
        const fallbackRes = await supabase
          .from("anggota_komunitas")
          .update({
            peran: "anggota",
            status: "pending",
          })
          .eq("id", existingMember.id);
        updateError = fallbackRes.error;
      }

      if (updateError) {
        throw updateError;
      }
    } else {
      // Buat pendaftaran baru dengan dbRole yang dinormalisasi
      let { error: insertError } = await supabase
        .from("anggota_komunitas")
        .insert({
          user_id: user.id,
          komunitas_id: dbKomunitasId,
          peran: dbRole,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (insertError && insertError.message?.includes("enum")) {
        const fallbackRes = await supabase
          .from("anggota_komunitas")
          .insert({
            user_id: user.id,
            komunitas_id: dbKomunitasId,
            peran: "anggota",
            status: "pending",
            created_at: new Date().toISOString(),
          });
        insertError = fallbackRes.error;
      }

      if (insertError) {
        throw insertError;
      }
    }

    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath("/profil");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Permohonan bergabung sebagai ${formatPeranDisplay(peran)} berhasil dikirim! Menunggu persetujuan Pengurus.`,
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

    // Ambil data komunitas menggunakan valid UUID
    let { data: komunitas } = await supabase
      .from("komunitas")
      .select("*")
      .eq("id", dbKomunitasId)
      .maybeSingle();

    if (!komunitas) {
      komunitas =
        findOrGenerateKomunitasSeed(komunitasId) ||
        findOrGenerateKomunitasSeed(dbKomunitasId);
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

    const seed =
      findOrGenerateKomunitasSeed(komunitasId) ||
      findOrGenerateKomunitasSeed(dbKomunitasId);

    const nama =
      komunitas.nama_komunitas || komunitas.nama || seed?.nama || "Komunitas";
    const jenis =
      komunitas.jenis_komunitas || komunitas.jenis || seed?.jenis || "posyandu";
    const lokasi =
      komunitas.lokasi ||
      seed?.lokasi ||
      [komunitas.kelurahan, komunitas.kecamatan, "Kota Tegal"]
        .filter(Boolean)
        .join(", ");
    const deskripsi =
      komunitas.deskripsi ||
      seed?.deskripsi ||
      `Layanan dan kegiatan ${nama} di ${lokasi}.`;

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

    // Hitung jumlah anggota
    const { count } = await supabase
      .from("anggota_komunitas")
      .select("*", { count: "exact", head: true })
      .eq("komunitas_id", dbKomunitasId)
      .eq("status", "approved");

    const fullData: KomunitasWithMembership = {
      id: dbKomunitasId,
      nama,
      jenis,
      kecamatan: komunitas.kecamatan || seed?.kecamatan,
      kelurahan: komunitas.kelurahan || seed?.kelurahan,
      rt: komunitas.rt || seed?.rt,
      rw: komunitas.rw || seed?.rw,
      lokasi,
      deskripsi,
      logo_url: komunitas.logo_url || null,
      kontak: komunitas.kontak || seed?.kontak || null,
      jadwal: komunitas.jadwal || seed?.jadwal || null,
      created_at: komunitas.created_at,
      jumlah_anggota: count || (jenis === "posyandu" ? 12 : 24),
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
  const seedKomunitas = findOrGenerateKomunitasSeed(komunitasId);
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
    const dbKomunitasId = toValidUUID(komunitasId);

    const { data: rawMembers, error } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, status, created_at")
      .eq("komunitas_id", dbKomunitasId)
      .order("created_at", { ascending: false });

    if (error || !rawMembers || rawMembers.length === 0) {
      return {
        success: true,
        data: generateSeedMembersForKomunitas(komunitasId),
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
