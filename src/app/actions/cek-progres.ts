"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import { createClient, createStatelessClient } from "@/utils/supabase/server";

export async function invalidateCekProgresCache(): Promise<void> {
  try {
    revalidateTag("cek-progres-paud", "max");
  } catch (err) {
    console.warn("invalidateCekProgresCache error:", err);
  }
}
import {
  isSuperAdmin as checkIsSuperAdmin,
  isAdminPusat as checkIsAdminPusat,
  isSuperOrAdminPusat,
  isRoleAdmin,
} from "@/lib/utils";
import { getUserAdminInfo, extractKomunitasMetadata } from "@/lib/admin-helpers";
import {
  cleanBaseSchoolName,
  isSchoolNameMatching,
  normalizeWilayah,
  isDataAtsRecord,
  generateChildIdentityKey,
  isDummyDataAnak,
  resolveJenisInstitusi,
} from "@/lib/data-anak-helpers";
import type {
  ProgresPaudItem,
  CekProgresPaudSummary,
  KegiatanAdministratif,
  StatusPenyelesaianProgres,
} from "@/types/database";

export interface GetCekProgresPaudResult {
  authorized: boolean;
  userRoleLabel?: string;
  userTierLevel?: string | null;
  adminScopeLabel?: string;
  kegiatan?: KegiatanAdministratif | null;
  items: ProgresPaudItem[];
  summary: CekProgresPaudSummary;
  message?: string;
}

const DEFAULT_KEGIATAN_PAUD: KegiatanAdministratif = {
  id: "keg-update-paud-001",
  kode: "update_data_anak_paud",
  judul: "Update Data Anak Usia Dini oleh Satuan PAUD",
  deskripsi:
    "Pembaruan kelengkapan dan validasi data anak usia dini (0-6 tahun) oleh pengurus/guru masing-masing Satuan PAUD se-Kota Tegal.",
  target_entitas: "satuan_paud",
  tanggal_mulai: "2026-01-01",
  tanggal_selesai: null,
  status: "aktif",
  created_at: new Date().toISOString(),
};

/**
 * Filter Satuan Pendidikan:
 * Hanya menyertakan seluruh TK, KB, RA, SPS/Pos PAUD, TPA, SKB,
 * dan HANYA PKBM Star of Tomorrow (PKBM umum lainnya dilepas).
 */
function isAllowedPaudInstitution(nama: string): boolean {
  const n = (nama || "").toUpperCase();
  if (n.includes("PKBM")) {
    return n.includes("STAR OF TOMORROW") || n.includes("STAR");
  }
  return true;
}

/**
 * Server Action: Mengambil data Cek Progres Satuan PAUD
 * Terbuka untuk seluruh pengunjung publik maupun pengguna terdaftar.
 */
export async function getCekProgresPaudAction(filters?: {
  kecamatan?: string;
  kelurahan?: string;
  status?: string;
  search?: string;
}): Promise<GetCekProgresPaudResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userRoleLabel = "Publik";
    let adminScopeLabel = "Seluruh Kota Tegal";
    let userTierLevel: string | null = null;
    let isSuper = false;
    let memberships: any[] = [];

    // Jika pengunjung terautentikasi (login), ambil profil & keanggotaannya
    if (user) {
      const [{ data: profile }, { data: userMemberships }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("anggota_komunitas")
          .select("id, komunitas_id, peran, status, komunitas(*)")
          .eq("user_id", user.id)
          .eq("status", "approved"),
      ]);

      memberships = userMemberships || [];

      isSuper = isSuperOrAdminPusat({
        ...profile,
        id: user.id,
        email: profile?.email || user.email,
        nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
      });

      const adminInfo = getUserAdminInfo({
        profile,
        userCommunities: memberships,
        currentUserId: user.id,
      });

      userTierLevel = adminInfo.tierLevel;

      if (isSuper) {
        userRoleLabel = "Super Admin";
        adminScopeLabel = "Seluruh Kota Tegal";
      } else if (adminInfo.isAdmin) {
        userRoleLabel = adminInfo.tierBadgeLabel || "Admin";
        adminScopeLabel = adminInfo.wilayahLabel || "Wilayah Binaan";
      } else {
        userRoleLabel = "Warga / Pengguna";
        adminScopeLabel = "Seluruh Kota Tegal";
      }
    }

    // 2. Ambil Informasi Kegiatan
    let kegiatan = DEFAULT_KEGIATAN_PAUD;
    const { data: dbKegiatan } = await supabase
      .from("kegiatan_administratif")
      .select("*")
      .eq("kode", "update_data_anak_paud")
      .maybeSingle();

    if (dbKegiatan) {
      kegiatan = dbKegiatan as KegiatanAdministratif;
    }

    // 3. Ambil Data Progres dari Next.js Shared Data Cache (Bebas dari beban Egress berulang)
    const allPaudItems = await getCachedAllProgresPaud();

    const filterKec = filters?.kecamatan && filters.kecamatan !== "semua" ? filters.kecamatan : null;
    const filterKel = filters?.kelurahan && filters.kelurahan !== "semua" ? filters.kelurahan : null;

    let rawItems = allPaudItems;
    if (filterKec) {
      rawItems = rawItems.filter((it) => normalizeWilayah(it.kecamatan) === normalizeWilayah(filterKec));
    }
    if (filterKel) {
      rawItems = rawItems.filter((it) => normalizeWilayah(it.kelurahan) === normalizeWilayah(filterKel));
    }

    // 4. Terapkan Filter Opsional (Pencarian Teks & Status)
    let filteredItems = rawItems;
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      filteredItems = filteredItems.filter(
        (it) =>
          it.nama_paud.toLowerCase().includes(q) ||
          it.kecamatan.toLowerCase().includes(q) ||
          it.kelurahan.toLowerCase().includes(q) ||
          it.jenis_institusi.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== "semua") {
      filteredItems = filteredItems.filter((it) => it.status_penyelesaian === filters.status);
    }

    // Urutkan Secara Default:
    // Selesai validasi terbaik diletakkan di bawah, yang belum diletakkan di atas agar terlihat lebih awal.
    // 1) Kelompokkan: Belum Selesai (<100%) di atas, Selesai (100%) di bawah
    // 2) Di antara yang belum selesai: persentase penyelesaian terendah terlebih dahulu (0% -> 99%)
    // 3) Siswa yang belum diperbarui (sisa target) terbanyak (lebih mendesak)
    // 4) Target peserta didik terbanyak
    // 5) Ketersediaan akun guru
    // 6) Abjad nama PAUD
    filteredItems.sort((a, b) => {
      const isSelesaiA = a.persentase_selesai >= 100 || a.status_penyelesaian === "SELESAI" ? 1 : 0;
      const isSelesaiB = b.persentase_selesai >= 100 || b.status_penyelesaian === "SELESAI" ? 1 : 0;
      if (isSelesaiA !== isSelesaiB) return isSelesaiA - isSelesaiB;

      if (a.persentase_selesai !== b.persentase_selesai) return a.persentase_selesai - b.persentase_selesai;

      const sisaA = Math.max(0, a.total_peserta_didik - a.total_diperbarui);
      const sisaB = Math.max(0, b.total_peserta_didik - b.total_diperbarui);
      if (sisaB !== sisaA) return sisaB - sisaA;

      if (b.total_peserta_didik !== a.total_peserta_didik) return b.total_peserta_didik - a.total_peserta_didik;

      const hasAccA = a.has_anggota || a.jumlah_anggota > 0 ? 1 : 0;
      const hasAccB = b.has_anggota || b.jumlah_anggota > 0 ? 1 : 0;
      if (hasAccB !== hasAccA) return hasAccB - hasAccA;

      return a.nama_paud.localeCompare(b.nama_paud);
    });

    // 5. Hitung Ringkasan Statistik
    const summary = computeSummary(rawItems);

    return {
      authorized: true,
      userRoleLabel,
      userTierLevel,
      adminScopeLabel,
      kegiatan,
      items: filteredItems,
      summary,
    };
  } catch (err: any) {
    console.error("Error in getCekProgresPaudAction:", err);
    return {
      authorized: false,
      items: [],
      summary: getEmptySummary(),
      message: err?.message || "Terjadi kesalahan saat memuat data progres.",
    };
  }
}

const getCachedAllProgresPaud = unstable_cache(
  async () => {
    const supabase = createStatelessClient();
    return await computeAllProgresPaud(supabase);
  },
  ["cek-progres-paud-se-kota-tegal"],
  {
    tags: ["cek-progres-paud"],
    revalidate: 3600, // 1 Jam di Next.js Data Cache
  }
);

/**
 * Komputasi Murni Data Progres Satuan PAUD Se-Kota Tegal
 * Menggunakan client stateless tanpa cookie agar dapat disimpan dalam Next.js Shared Data Cache.
 */
async function computeAllProgresPaud(supabase: any): Promise<ProgresPaudItem[]> {
  // Ambil seluruh Satuan PAUD se-Kota Tegal
  const { data: rawPaudList, error: paudErr } = await supabase
    .from("komunitas")
    .select("id, nama, jenis, kecamatan, kelurahan")
    .eq("jenis", "satuan_paud");

  if (paudErr || !rawPaudList || rawPaudList.length === 0) {
    console.error("Error fetching paudList in computeAllProgresPaud:", paudErr);
    return [];
  }

  // Filter: Lepaskan seluruh PKBM KECUALI 'PKBM Star of Tomorrow' dan SKB
  const paudList = rawPaudList.filter((p: any) => isAllowedPaudInstitution(p.nama));

  const allowedIds = paudList.map((p: any) => p.id);

  // Hitung total anak bersekolah secara presisi agar tidak mengirim query kosong yang memperlambat
  const { count: totalSekolahCount } = await supabase
    .from("data_anak")
    .select("id", { count: "exact", head: true })
    .eq("is_sekolah", true);

  const totalToQuery = totalSekolahCount && totalSekolahCount > 0 ? totalSekolahCount : 8000;
  const numChunks = Math.min(10, Math.ceil(totalToQuery / 1000));
  const chunkRanges = Array.from({ length: numChunks }, (_, i) => [i * 1000, (i + 1) * 1000 - 1]);

  const [{ data: memberCounts }, ...childChunks] = await Promise.all([
    supabase
      .from("anggota_komunitas")
      .select("komunitas_id, id")
      .in("komunitas_id", allowedIds)
      .eq("status", "approved"),
    ...chunkRanges.map(([start, end]) =>
      supabase
        .from("data_anak")
        .select("id, nama_lengkap, nama_orangtua, tanggal_lahir, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, validated_at, validated_by, is_updated_by_paud, diperbarui_oleh")
        .eq("is_sekolah", true)
        .range(start, end)
    ),
  ]);

  let childrenData: any[] = [];
  childChunks.forEach((chunkResult) => {
    if (chunkResult.data && Array.isArray(chunkResult.data)) {
      childrenData = childrenData.concat(chunkResult.data);
    }
  });

  const paudById = new Map<string, any>();
  paudList.forEach((p: any) => {
    paudById.set(p.id, p);
  });

  const memberCountMap: Record<string, number> = {};
  (memberCounts || []).forEach((m: any) => {
    memberCountMap[m.komunitas_id] = (memberCountMap[m.komunitas_id] || 0) + 1;
  });

  // Track murid unik per PAUD agar tidak terjadi pembengkakan data akibat record duplikat (misal pending vs approved)
  const paudStudentsMap = new Map<string, Map<string, { isUpdated: boolean; child: any }>>();
  const validatorMap: Record<string, Set<string>> = {};
  paudList.forEach((p: any) => {
    paudStudentsMap.set(p.id, new Map());
    validatorMap[p.id] = new Set<string>();
  });

  // Catat PAUD mana saja yang sudah memiliki siswa terdaftar langsung (komunitas_id === p.id)
  const paudDirectCount = new Map<string, number>();
  childrenData.forEach((c: any) => {
    if (c.komunitas_id && paudById.has(c.komunitas_id)) {
      paudDirectCount.set(c.komunitas_id, (paudDirectCount.get(c.komunitas_id) || 0) + 1);
    }
  });

  childrenData.forEach((c: any) => {
    // Saring data ATS dan data anomali dummy agar tidak masuk ke rekap Satuan PAUD
    if (isDummyDataAnak(c) || isDataAtsRecord(c)) {
      return;
    }

    // 1. Cari PAUD yang cocok: via ID langsung atau nama sekolah
    let p = paudById.get(c.komunitas_id);
    const hasDirectMatch = Boolean(p);

    if (!p && c.nama_sekolah) {
      // Cari PAUD yang cocok dengan presisi jenjang dan lokasi wilayah
      const matchedPauds = paudList.filter((x: any) => isSchoolNameMatching(c.nama_sekolah, x.nama));
      if (matchedPauds.length === 1) {
        p = matchedPauds[0];
      } else if (matchedPauds.length > 1) {
        // Disambiguasi Wilayah: Jika ada beberapa PAUD dengan nama mirip, cocokkan dengan kelurahan domisili/KK anak
        const m = (c.alasan_sekolah || "").match(/\[(DOM_KEL|KK_KEL|KEL):([^\]]+)\]/);
        const childKel = m ? normalizeWilayah(m[2]) : "";
        p = matchedPauds.find((x: any) => normalizeWilayah(x.kelurahan) === childKel) || matchedPauds[0];
      }
    }

    if (p && paudStudentsMap.has(p.id)) {
      // Disambiguasi Wilayah: Jika PAUD sudah memiliki siswa yang diinput/terdaftar langsung (komunitas_id === p.id),
      // jangan masukkan data unlinked (komunitas_id !== p.id) yang kelurahannya berbeda
      const directCount = paudDirectCount.get(p.id) || 0;
      if (directCount > 0 && !hasDirectMatch) {
        const m = (c.alasan_sekolah || "").match(/DOM_KEL:([^\]]+)/);
        const domKel = m ? normalizeWilayah(m[1]) : "";
        const paudKel = normalizeWilayah(p.kelurahan);
        if (domKel && paudKel && domKel !== paudKel) {
          return;
        }
      }

      const pMap = paudStudentsMap.get(p.id)!;
      const childKey = generateChildIdentityKey(c) || c.id;
      if (!childKey) return;

      // Murid tersebut secara nyata telah divalidasi (approved) ATAU diedit oleh akun pengguna terdaftar
      const isUpdated = Boolean(
        c.status_approval === "approved" ||
          c.validated_at != null ||
          (c.is_updated_by_paud === true && c.diperbarui_oleh != null)
      );

      if (!pMap.has(childKey)) {
        pMap.set(childKey, { isUpdated, child: c });
      } else {
        // Jika sudah ada tapi record saat ini sudah approved/diperbarui, update statusnya ke true
        const existing = pMap.get(childKey)!;
        if (isUpdated && !existing.isUpdated) {
          existing.isUpdated = true;
          existing.child = c;
        }
      }

      // Catat akun validator/editor yang beraktivitas nyata di PAUD ini
      const validatorId = c.validated_by || c.diperbarui_oleh;
      if (validatorId) {
        validatorMap[p.id].add(validatorId);
      }
    }
  });

  return paudList.map((p: any) => {
    const pMap = paudStudentsMap.get(p.id);
    const totalStudents = pMap ? pMap.size : 0;
    let totalUpdated = 0;
    pMap?.forEach((v) => {
      if (v.isUpdated) totalUpdated++;
    });
    const directMemberCount = memberCountMap[p.id] || 0;
    const activeValidatorCount = validatorMap[p.id]?.size || 0;
    // Total akun guru/operator terverifikasi (anggota terdaftar atau validator riil)
    const memberCount = Math.max(directMemberCount, activeValidatorCount);
    const hasAnggota = memberCount > 0;
    const pct = totalStudents > 0 ? Math.round((totalUpdated / totalStudents) * 1000) / 10 : 0.0;

    let status: StatusPenyelesaianProgres = "BELUM_MULAI";
    if (totalStudents === 0) {
      status = "KOSONG";
    } else if (totalUpdated >= totalStudents && totalStudents > 0) {
      status = "SELESAI";
    } else if (totalUpdated > 0) {
      status = "PROGRES";
    } else {
      status = "BELUM_MULAI";
    }

    // Deteksi tipe institusi dari nama (TK, KB, RA, PKBM, SKB, SPS/Pos PAUD, TPA)
    const resolved = resolveJenisInstitusi(p.nama);
    let jenisInstitusi = "PAUD";
    if (resolved === "SPS") jenisInstitusi = "SPS / Pos PAUD";
    else if (resolved) jenisInstitusi = resolved;

    return {
      komunitas_id: p.id,
      nama_paud: p.nama,
      jenis_institusi: jenisInstitusi,
      kecamatan: p.kecamatan || "Kota Tegal",
      kelurahan: p.kelurahan || "-",
      jumlah_anggota: memberCount,
      has_anggota: hasAnggota,
      total_peserta_didik: totalStudents,
      total_diperbarui: totalUpdated,
      persentase_selesai: pct,
      status_penyelesaian: status,
    };
  }).sort((a: ProgresPaudItem, b: ProgresPaudItem) => {
    // 1. Utamakan Satuan PAUD yang SUDAH ADA akun gurunya terlebih dahulu
    const hasAccA = a.has_anggota || a.jumlah_anggota > 0 ? 1 : 0;
    const hasAccB = b.has_anggota || b.jumlah_anggota > 0 ? 1 : 0;
    if (hasAccB !== hasAccA) {
      return hasAccB - hasAccA;
    }
    // 2. Prosentase proses penyelesaian tertinggi
    if (b.persentase_selesai !== a.persentase_selesai) {
      return b.persentase_selesai - a.persentase_selesai;
    }
    // 3. Jumlah siswa yang telah diperbarui terbanyak
    if (b.total_diperbarui !== a.total_diperbarui) {
      return b.total_diperbarui - a.total_diperbarui;
    }
    // 4. Target peserta didik terbanyak
    if (b.total_peserta_didik !== a.total_peserta_didik) {
      return b.total_peserta_didik - a.total_peserta_didik;
    }
    // 5. Jumlah akun guru terbanyak
    if (b.jumlah_anggota !== a.jumlah_anggota) {
      return b.jumlah_anggota - a.jumlah_anggota;
    }
    // 6. Abjad nama PAUD
    return a.nama_paud.localeCompare(b.nama_paud);
  });
}

function computeSummary(items: ProgresPaudItem[]): CekProgresPaudSummary {
  const totalPaud = items.length;
  let paudWithMembers = 0;
  let paudSelesai = 0;
  let paudDalamProgres = 0;
  let paudBelumMulai = 0;
  let totalPesertaDidik = 0;
  let totalDiperbarui = 0;

  const kecMap: Record<
    string,
    { totalPaud: number; paudSelesai: number; totalPesertaDidik: number; totalDiperbarui: number }
  > = {};

  items.forEach((item) => {
    if (item.has_anggota) paudWithMembers++;
    if (item.status_penyelesaian === "SELESAI") paudSelesai++;
    else if (item.status_penyelesaian === "PROGRES") paudDalamProgres++;
    else if (item.status_penyelesaian === "BELUM_MULAI") paudBelumMulai++;

    totalPesertaDidik += item.total_peserta_didik;
    totalDiperbarui += item.total_diperbarui;

    const kec = item.kecamatan || "Kota Tegal";
    if (!kecMap[kec]) {
      kecMap[kec] = { totalPaud: 0, paudSelesai: 0, totalPesertaDidik: 0, totalDiperbarui: 0 };
    }
    kecMap[kec].totalPaud++;
    if (item.status_penyelesaian === "SELESAI") kecMap[kec].paudSelesai++;
    kecMap[kec].totalPesertaDidik += item.total_peserta_didik;
    kecMap[kec].totalDiperbarui += item.total_diperbarui;
  });

  const perKecamatan = Object.keys(kecMap).map((kec) => {
    const data = kecMap[kec];
    const pct =
      data.totalPesertaDidik > 0
        ? Math.round((data.totalDiperbarui / data.totalPesertaDidik) * 1000) / 10
        : 0;
    return {
      kecamatan: kec,
      totalPaud: data.totalPaud,
      paudSelesai: data.paudSelesai,
      totalPesertaDidik: data.totalPesertaDidik,
      totalDiperbarui: data.totalDiperbarui,
      persentase: pct,
    };
  });

  const persentaseTotal =
    totalPesertaDidik > 0
      ? Math.round((totalDiperbarui / totalPesertaDidik) * 1000) / 10
      : 0;

  return {
    totalPaud,
    paudWithMembers,
    paudWithoutMembers: totalPaud - paudWithMembers,
    paudSelesai,
    paudDalamProgres,
    paudBelumMulai,
    totalPesertaDidik,
    totalDiperbarui,
    persentaseTotal,
    perKecamatan,
  };
}

function getEmptySummary(): CekProgresPaudSummary {
  return {
    totalPaud: 0,
    paudWithMembers: 0,
    paudWithoutMembers: 0,
    paudSelesai: 0,
    paudDalamProgres: 0,
    paudBelumMulai: 0,
    totalPesertaDidik: 0,
    totalDiperbarui: 0,
    persentaseTotal: 0,
    perKecamatan: [],
  };
}
