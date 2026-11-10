import { createClient, createAdminClient } from "@/utils/supabase/server";
import {
  getPosyanduCakupanWilayah,
  getPosyanduCoverageDisplay,
} from "@/lib/data-anak-helpers";
import {
  findOrGenerateKomunitasSeed,
  findKecamatanByKelurahan,
  getJumlahRtPerRwByKelurahan,
  slugify,
} from "@/lib/constants/tegal-data";
import { SEED_POSYANDU_TEGAL } from "@/lib/constants/seed-posyandu-tegal";
import { toValidUUID, isRoleAdmin } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface PosyanduCoveragePair {
  rw: string; // 2 digit, misal "01"
  rts: string[]; // 2 digit, misal ["01", "02", "03", "04", "05"]
}

export interface PosyanduCoveredWargaScope {
  isMapped: boolean;
  kelurahan: string;
  kecamatan: string;
  pairs: PosyanduCoveragePair[];
}

export interface TargetCommunityToSync {
  id: string; // Slug ID kanonikal
  nama: string;
  jenis: "posyandu" | "warga_kita";
  kecamatan: string;
  kelurahan: string;
  rw?: string | null;
  rt?: string | null;
  lokasi: string;
  deskripsi: string;
  role: string;
}

/**
 * Ekstraksi cakupan wilayah RW dan RT suatu Posyandu untuk keperluan sinkronisasi ke Komunitas Warga Kita.
 * Mengembalikan isMapped: true dan daftar pasangan RW & RT jika posyandu sudah dipetakan.
 * Jika kelurahan belum dipetakan, mengembalikan isMapped: false dan pairs: [].
 */
export function getPosyanduCoveredWargaWilayah(posyandu: any): PosyanduCoveredWargaScope {
  if (!posyandu) {
    return { isMapped: false, kelurahan: "", kecamatan: "", pairs: [] };
  }

  let kelurahan = (posyandu.kelurahan || "").trim();
  let kecamatan = (posyandu.kecamatan || "").trim();

  if ((!kecamatan || kecamatan === "Kota Tegal") && kelurahan) {
    const foundKec = findKecamatanByKelurahan(kelurahan);
    if (foundKec) kecamatan = foundKec;
  }
  if (!kecamatan) kecamatan = "Kota Tegal";

  // Ambil data cakupan kanonikal
  const cov = getPosyanduCoverageDisplay(posyandu);
  const canon = getPosyanduCakupanWilayah(posyandu);

  if (!cov.isMapped) {
    return {
      isMapped: false,
      kelurahan,
      kecamatan,
      pairs: [],
    };
  }

  // Parse RWs
  const rawRwList: number[] = [];
  if (canon?.rwList && canon.rwList.length > 0) {
    for (const r of canon.rwList) {
      const num = parseInt(String(r).replace(/\D/g, ""), 10);
      if (!isNaN(num) && num > 0) rawRwList.push(num);
    }
  } else if (canon?.rw) {
    const matches = String(canon.rw).match(/\d+/g) || [];
    for (const m of matches) {
      const num = parseInt(m, 10);
      if (!isNaN(num) && num > 0) rawRwList.push(num);
    }
  } else if (cov.rwLabel) {
    const matches = String(cov.rwLabel).match(/\d+/g) || [];
    for (const m of matches) {
      const num = parseInt(m, 10);
      if (!isNaN(num) && num > 0) rawRwList.push(num);
    }
  } else if (posyandu.rw) {
    const num = parseInt(String(posyandu.rw).replace(/\D/g, ""), 10);
    if (!isNaN(num) && num > 0) rawRwList.push(num);
  }

  const distinctRwNums = Array.from(new Set(rawRwList)).sort((a, b) => a - b);
  const pairs: PosyanduCoveragePair[] = [];

  for (const rwNum of distinctRwNums) {
    const cleanRw = String(rwNum).padStart(2, "0");
    const rawRtList: number[] = [];

    if (canon?.rtList && canon.rtList.length > 0) {
      for (const t of canon.rtList) {
        const num = parseInt(String(t).replace(/\D/g, ""), 10);
        if (!isNaN(num) && num > 0) rawRtList.push(num);
      }
    } else if (cov.rtLabel) {
      const rangeMatch = cov.rtLabel.match(/RT\s*(\d+)\s*s\/?d\s*RT\s*(\d+)/i);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10);
        const max = parseInt(rangeMatch[2], 10);
        if (!isNaN(min) && !isNaN(max) && min <= max) {
          for (let i = min; i <= max; i++) rawRtList.push(i);
        }
      } else {
        const matches = cov.rtLabel.match(/\d+/g) || [];
        for (const m of matches) {
          const num = parseInt(m, 10);
          if (!isNaN(num) && num > 0) rawRtList.push(num);
        }
      }
    }

    if (rawRtList.length === 0) {
      // Cek jumlah RT resmi di RW ini
      const count = getJumlahRtPerRwByKelurahan(kelurahan, cleanRw);
      if (count > 0) {
        for (let i = 1; i <= count; i++) rawRtList.push(i);
      } else if (posyandu.rt) {
        const num = parseInt(String(posyandu.rt).replace(/\D/g, ""), 10);
        if (!isNaN(num) && num > 0) rawRtList.push(num);
      }
    }

    const distinctRtNums = Array.from(new Set(rawRtList)).sort((a, b) => a - b);
    const rts = distinctRtNums.map((n) => String(n).padStart(2, "0"));

    pairs.push({
      rw: cleanRw,
      rts,
    });
  }

  return {
    isMapped: true,
    kelurahan,
    kecamatan,
    pairs,
  };
}

/**
 * Menghasilkan daftar seluruh target komunitas (Posyandu Berjenjang dan Warga Kita tingkat Kota,
 * Kecamatan, Kelurahan, serta RW & RT bila sudah dipetakan) yang WAJIB diikuti oleh anggota posyandu.
 */
export function buildPosyanduWargaAndBerjenjangTargets(
  posyandu: any,
  userRole: string = "Kader"
): TargetCommunityToSync[] {
  if (!posyandu) return [];

  let kelurahan = (posyandu.kelurahan || "").trim();
  let kecamatan = (posyandu.kecamatan || "").trim();

  if ((!kecamatan || kecamatan === "Kota Tegal") && kelurahan) {
    const foundKec = findKecamatanByKelurahan(kelurahan);
    if (foundKec) kecamatan = foundKec;
  }
  if (!kecamatan) kecamatan = "Kota Tegal";

  const kecSlug = slugify(kecamatan);
  const kelSlug = kelurahan ? slugify(kelurahan) : "semua-kelurahan";

  const normRole = (userRole || "").toLowerCase();
  const berjenjangRole =
    normRole.includes("kader") || normRole.includes("pengurus") || normRole.includes("admin")
      ? "Kader"
      : "Anggota";
  const wargaRole = "Penduduk";

  const targets: TargetCommunityToSync[] = [];

  // ==========================================
  // 1. KOMUNITAS POSYANDU BERJENJANG
  // ==========================================
  // Tingkat Kelurahan (jika ada kelurahan spesifik)
  if (kelurahan && kelurahan !== "Semua Kelurahan" && kelurahan !== "semua") {
    targets.push({
      id: `kom-posyandu-${kecSlug}-${kelSlug}`,
      nama: `Komunitas Posyandu Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
      jenis: "posyandu",
      kecamatan,
      kelurahan,
      rw: null,
      rt: null,
      lokasi: `Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
      deskripsi: `Komunitas koordinasi kader Posyandu tingkat Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.`,
      role: berjenjangRole,
    });
  }

  // Tingkat Kecamatan
  if (kecamatan && kecamatan !== "Kota Tegal" && kecamatan !== "semua") {
    targets.push({
      id: `kom-posyandu-${kecSlug}`,
      nama: `Komunitas Posyandu Kecamatan: ${kecamatan}`,
      jenis: "posyandu",
      kecamatan,
      kelurahan: "Semua Kelurahan",
      rw: null,
      rt: null,
      lokasi: `Kecamatan ${kecamatan}, Kota Tegal`,
      deskripsi: `Komunitas koordinasi kader Posyandu se-Kecamatan ${kecamatan}, Kota Tegal yang menghimpun seluruh posyandu di wilayah ini.`,
      role: berjenjangRole,
    });
  }

  // Tingkat Kota Tegal
  targets.push({
    id: "kom-posyandu-kota-tegal",
    nama: "Komunitas Posyandu Kota Tegal",
    jenis: "posyandu",
    kecamatan: "Kota Tegal",
    kelurahan: "Semua Kelurahan",
    rw: null,
    rt: null,
    lokasi: "Kota Tegal, Jawa Tengah",
    deskripsi:
      "Forum komunikasi dan koordinasi kader Posyandu tingkat Kota Tegal yang menghimpun seluruh kader posyandu dari 4 kecamatan dan 27 kelurahan se-Kota Tegal.",
    role: berjenjangRole,
  });

  // ==========================================
  // 2. KOMUNITAS WARGA KITA TINGKAT WILAYAH
  // ==========================================
  // Tingkat Kota Tegal
  targets.push({
    id: "kom-warga-kota-tegal",
    nama: "Komunitas Warga Kota Tegal",
    jenis: "warga_kita",
    kecamatan: "Kota Tegal",
    kelurahan: "Semua Kelurahan",
    rw: null,
    rt: null,
    lokasi: "Kota Tegal, Jawa Tengah",
    deskripsi:
      "Komunitas kolaborasi seluruh warga masyarakat Kota Tegal, Jawa Tengah. Wadah kebersamaan dari warga, oleh warga, untuk warga dalam mendukung tumbuh kembang anak, kesehatan keluarga, dan kepedulian sosial.",
    role: wargaRole,
  });

  // Tingkat Kecamatan
  if (kecamatan && kecamatan !== "Kota Tegal" && kecamatan !== "semua") {
    targets.push({
      id: `kom-warga-${kecSlug}`,
      nama: `Warga Kecamatan: ${kecamatan}`,
      jenis: "warga_kita",
      kecamatan,
      kelurahan: "Semua Kelurahan",
      rw: null,
      rt: null,
      lokasi: `Kecamatan ${kecamatan}, Kota Tegal`,
      deskripsi: `Komunitas paguyuban warga se-Kecamatan ${kecamatan}, Kota Tegal.`,
      role: wargaRole,
    });
  }

  // Tingkat Kelurahan
  if (kelurahan && kelurahan !== "Semua Kelurahan" && kelurahan !== "semua") {
    targets.push({
      id: `kom-warga-${kecSlug}-${kelSlug}`,
      nama: `Warga Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
      jenis: "warga_kita",
      kecamatan,
      kelurahan,
      rw: null,
      rt: null,
      lokasi: `Kantor Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
      deskripsi: `Komunitas seluruh warga di wilayah Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
      role: wargaRole,
    });
  }

  // ==========================================
  // 3. KOMUNITAS WARGA KITA TINGKAT RW & RT
  //    (Hanya bila cakupan posyandu telah dipetakan)
  // ==========================================
  const covInfo = getPosyanduCoveredWargaWilayah(posyandu);
  if (covInfo.isMapped && covInfo.pairs.length > 0) {
    for (const pair of covInfo.pairs) {
      // Warga RW
      targets.push({
        id: `kom-warga-${kecSlug}-${kelSlug}-rw${pair.rw}`,
        nama: `Warga RW: ${pair.rw}, Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
        jenis: "warga_kita",
        kecamatan,
        kelurahan,
        rw: pair.rw,
        rt: null,
        lokasi: `Balai RW ${pair.rw}, Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
        deskripsi: `Komunitas rukun warga tingkat RW ${pair.rw} Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
        role: wargaRole,
      });

      // Warga RT untuk setiap RT yang dilayani posyandu
      for (const rt of pair.rts) {
        targets.push({
          id: `kom-warga-${kecSlug}-${kelSlug}-rw${pair.rw}-rt${rt}`,
          nama: `Warga RT: ${rt}, RW: ${pair.rw}, Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
          jenis: "warga_kita",
          kecamatan,
          kelurahan,
          rw: pair.rw,
          rt: rt,
          lokasi: `Lingkungan RT ${rt} / RW ${pair.rw}, Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
          deskripsi: `Komunitas paguyuban rukun tetangga warga RT ${rt} RW ${pair.rw} Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
          role: wargaRole,
        });
      }
    }
  }

  return targets;
}

/**
 * Menyinkronkan satu pengguna yang tergabung di Posyandu agar otomatis tergabung juga ke:
 * 1. Komunitas Posyandu Berjenjang (Kelurahan, Kecamatan, Kota Tegal)
 * 2. Komunitas Warga Kita (Tingkat Kota, Kecamatan, Kelurahan)
 * 3. Komunitas Warga Kita (Tingkat RW dan RT sesuai cakupan wilayah layanan posyandu jika sudah dipetakan)
 */
export async function syncPosyanduMemberToWargaAndBerjenjang({
  userId,
  posyanduId,
  role = "Kader",
  client,
}: {
  userId: string;
  posyanduId: string;
  role?: string;
  client?: any;
}): Promise<{
  success: boolean;
  syncedCount: number;
  targetCount: number;
  message: string;
}> {
  if (!userId || !posyanduId) {
    return { success: false, syncedCount: 0, targetCount: 0, message: "User ID atau Posyandu ID kosong." };
  }

  const writeClient = client || createAdminClient() || (await createClient());
  const dbPosId = toValidUUID(posyanduId);

  // 1. Dapatkan metadata Posyandu
  let posData = findOrGenerateKomunitasSeed(posyanduId);
  const { data: dbKomRow } = await writeClient
    .from("komunitas")
    .select("*")
    .eq("id", dbPosId)
    .maybeSingle();

  if (dbKomRow) {
    posData = {
      ...posData,
      ...dbKomRow,
    };
  }

  if (!posData || posData.jenis !== "posyandu") {
    return { success: false, syncedCount: 0, targetCount: 0, message: "Komunitas bukan merupakan posyandu." };
  }

  // 2. Bangun daftar komunitas target
  const targets = buildPosyanduWargaAndBerjenjangTargets(posData, role);
  if (targets.length === 0) {
    return { success: true, syncedCount: 0, targetCount: 0, message: "Tidak ada target komunitas yang dibangun." };
  }

  // 3. Coba via RPC hierarkis (SECURITY DEFINER) jika fungsi SQL telah diterapkan
  try {
    const payloadJson = targets.map((t) => ({
      ...t,
      id: toValidUUID(t.id),
    }));
    const { data: rpcCount, error: rpcErr } = await writeClient.rpc(
      "sync_user_posyandu_warga_hierarchy",
      {
        p_user_id: userId,
        p_communities: payloadJson,
      }
    );
    if (!rpcErr && typeof rpcCount === "number" && rpcCount > 0) {
      return {
        success: true,
        syncedCount: rpcCount,
        targetCount: targets.length,
        message: `Berhasil menyinkronkan keanggotaan ke ${rpcCount} komunitas berjenjang dan warga kita via RPC.`,
      };
    }
  } catch {
    // Fallback ke eksekusi loop langsung jika RPC belum tersedia
  }

  let syncedCount = 0;

  for (const target of targets) {
    const dbTargetId = toValidUUID(target.id);

    try {
      // 1. Pastikan komunitas tersedia di database
      await writeClient.from("komunitas").upsert(
        {
          id: dbTargetId,
          nama: target.nama,
          nama_komunitas: target.nama,
          jenis: target.jenis,
          jenis_komunitas: target.jenis,
          kecamatan: target.kecamatan || "Kota Tegal",
          kelurahan: target.kelurahan || "Semua Kelurahan",
          rw: target.rw || null,
          rt: target.rt || null,
          lokasi: target.lokasi,
          deskripsi: target.deskripsi,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      // 2. Cek keanggotaan pengguna di komunitas target
      const { data: existing } = await writeClient
        .from("anggota_komunitas")
        .select("id, peran, status")
        .eq("user_id", userId)
        .eq("komunitas_id", dbTargetId)
        .maybeSingle();

      if (!existing) {
        await writeClient.from("anggota_komunitas").insert({
          user_id: userId,
          komunitas_id: dbTargetId,
          peran: target.role,
          peran_diajukan: null,
          status: "approved",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        syncedCount++;
      } else {
        // Jika sudah ada, pastikan status approved
        const isCurrentlyAdmin = isRoleAdmin(existing.peran);
        const shouldUpgradeToKader = !isCurrentlyAdmin && target.role === "Kader";
        const updatePayload: Record<string, any> = {
          status: "approved",
          updated_at: new Date().toISOString(),
        };
        if (shouldUpgradeToKader) {
          updatePayload.peran = "Kader";
        }

        if (existing.status !== "approved" || shouldUpgradeToKader) {
          await writeClient
            .from("anggota_komunitas")
            .update(updatePayload)
            .eq("id", existing.id);
        }
        syncedCount++;
      }
    } catch (upsertErr) {
      console.warn(`Gagal menyinkronkan target ${target.id} (${dbTargetId}):`, upsertErr);
    }
  }

  return {
    success: true,
    syncedCount,
    targetCount: targets.length,
    message: `Berhasil menyinkronkan keanggotaan ke ${syncedCount} komunitas berjenjang dan warga kita.`,
  };
}

/**
 * Menyinkronkan seluruh anggota aktif suatu Posyandu ke Komunitas Warga Kita dan Posyandu Berjenjang.
 * Dipanggil otomatis saat informasi operasional / cakupan wilayah Posyandu baru dipetakan atau diperbarui.
 */
export async function syncPosyanduCoverageToAllMembers(
  posyanduId: string,
  client?: any
): Promise<{
  success: boolean;
  memberCount: number;
  message: string;
}> {
  const writeClient = client || createAdminClient() || (await createClient());
  const dbPosId = toValidUUID(posyanduId);

  // Ambil seluruh anggota posyandu yang approved
  const { data: members, error } = await writeClient
    .from("anggota_komunitas")
    .select("user_id, peran")
    .eq("komunitas_id", dbPosId)
    .eq("status", "approved");

  if (error || !members || members.length === 0) {
    return {
      success: true,
      memberCount: 0,
      message: "Tidak ada anggota aktif yang perlu disinkronkan.",
    };
  }

  let count = 0;
  for (const m of members) {
    if (m.user_id) {
      await syncPosyanduMemberToWargaAndBerjenjang({
        userId: m.user_id,
        posyanduId: dbPosId,
        role: m.peran,
        client: writeClient,
      });
      count++;
    }
  }

  return {
    success: true,
    memberCount: count,
    message: `Berhasil menyinkronkan ${count} anggota Posyandu ke Komunitas Warga Kita dan Posyandu Berjenjang.`,
  };
}

/**
 * Menyinkronkan seluruh anggota seluruh Posyandu di Kota Tegal ke Komunitas Warga Kita dan Posyandu Berjenjang.
 */
export async function syncAllPosyanduMembers(
  client?: any
): Promise<{
  success: boolean;
  totalMembers: number;
  totalSynced: number;
  message: string;
}> {
  const writeClient = client || createAdminClient() || (await createClient());

  // 1. Ambil seluruh komunitas jenis posyandu dari database
  const { data: posKoms } = await writeClient
    .from("komunitas")
    .select("id, nama, jenis, kecamatan, kelurahan, rw, rt")
    .eq("jenis", "posyandu");

  const posKomMap = new Map<string, any>((posKoms || []).map((k: any) => [k.id, k]));

  // Tambahkan juga semua posyandu resmi dari SEED_POSYANDU_TEGAL
  for (const p of SEED_POSYANDU_TEGAL) {
    const pUuid = toValidUUID(p.id);
    if (!posKomMap.has(pUuid)) {
      posKomMap.set(pUuid, p as any);
    }
  }

  // 2. Ambil seluruh anggota_komunitas yang approved (dengan pagination)
  let allMembers: any[] = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data } = await writeClient
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, status")
      .eq("status", "approved")
      .range(from, from + batchSize - 1);
    if (!data || data.length === 0) break;
    allMembers = allMembers.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  // Saring keanggotaan pada Posyandu Basis (bukan forum berjenjang)
  const posMembers = allMembers.filter((m) => {
    const k = posKomMap.get(m.komunitas_id);
    if (!k) return false;
    const rawNama = ((k as any).nama || "").toLowerCase();
    const isBerjenjang =
      rawNama.includes("komunitas posyandu") ||
      rawNama.startsWith("komunitas") ||
      m.komunitas_id === toValidUUID("kom-posyandu-kota-tegal");
    return !isBerjenjang;
  });

  let synced = 0;
  for (const pm of posMembers) {
    if (pm.user_id && pm.komunitas_id) {
      await syncPosyanduMemberToWargaAndBerjenjang({
        userId: pm.user_id,
        posyanduId: pm.komunitas_id,
        role: pm.peran,
        client: writeClient,
      });
      synced++;
    }
  }

  try {
    revalidatePath("/komunitas");
    revalidatePath("/profil");
  } catch {}

  return {
    success: true,
    totalMembers: posMembers.length,
    totalSynced: synced,
    message: `Berhasil menyinkronkan ${synced} anggota Posyandu ke Komunitas Warga Kita (RT, RW, Kelurahan, Kecamatan, Kota) dan Posyandu Berjenjang.`,
  };
}
