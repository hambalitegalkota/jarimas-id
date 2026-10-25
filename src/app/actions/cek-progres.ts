"use server";

import { createClient } from "@/utils/supabase/server";
import {
  isSuperAdmin as checkIsSuperAdmin,
  isAdminPusat as checkIsAdminPusat,
  isSuperOrAdminPusat,
  isRoleAdmin,
} from "@/lib/utils";
import { getUserAdminInfo, extractKomunitasMetadata } from "@/lib/admin-helpers";
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

    // 3. Ambil Data Progres (Coba via RPC Supabase terlebih dahulu)
    let rawItems: ProgresPaudItem[] = [];
    const filterKec = filters?.kecamatan && filters.kecamatan !== "semua" ? filters.kecamatan : null;
    const filterKel = filters?.kelurahan && filters.kelurahan !== "semua" ? filters.kelurahan : null;

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_cek_progres_paud",
      {
        p_user_id: user?.id || null,
        p_kecamatan: filterKec,
        p_kelurahan: filterKel,
      }
    );

    if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      rawItems = rpcData.map((item: any) => ({
        komunitas_id: item.komunitas_id,
        nama_paud: item.nama_paud,
        jenis_institusi: item.jenis_institusi,
        kecamatan: item.kecamatan,
        kelurahan: item.kelurahan,
        jumlah_anggota: Number(item.jumlah_anggota || 0),
        has_anggota: Boolean(item.has_anggota),
        total_peserta_didik: Number(item.total_peserta_didik || 0),
        total_diperbarui: Number(item.total_diperbarui || 0),
        persentase_selesai: Number(item.persentase_selesai || 0),
        status_penyelesaian: item.status_penyelesaian as StatusPenyelesaianProgres,
      }));
    } else {
      // Fallback Engine jika RPC belum dijalankan di Supabase SQL Editor
      rawItems = await fetchProgresPaudFallback(
        supabase,
        user?.id || null,
        isSuper,
        memberships,
        filterKec,
        filterKel
      );
    }

    // Saring institusi: Lepaskan seluruh PKBM KECUALI 'PKBM Star of Tomorrow' dan SKB
    rawItems = rawItems.filter((it) => isAllowedPaudInstitution(it.nama_paud));

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

/**
 * Fallback jika fungsi SQL RPC belum dieksekusi di database
 */
async function fetchProgresPaudFallback(
  supabase: any,
  userId: string | null,
  isSuper: boolean,
  memberships: any[],
  filterKec: string | null,
  filterKel: string | null
): Promise<ProgresPaudItem[]> {
  // Ambil seluruh Satuan PAUD
  let paudQuery = supabase
    .from("komunitas")
    .select("id, nama, jenis, kecamatan, kelurahan")
    .eq("jenis", "satuan_paud");

  if (filterKec && filterKec !== "semua") {
    paudQuery = paudQuery.eq("kecamatan", filterKec);
  }
  if (filterKel && filterKel !== "semua") {
    paudQuery = paudQuery.eq("kelurahan", filterKel);
  }

  const { data: rawPaudList, error: paudErr } = await paudQuery;
  if (paudErr || !rawPaudList || rawPaudList.length === 0) {
    console.error("Error fetching paudList in fallback:", paudErr);
    return [];
  }

  // Filter: Lepaskan seluruh PKBM KECUALI 'PKBM Star of Tomorrow' dan SKB
  const paudList = rawPaudList.filter((p: any) => isAllowedPaudInstitution(p.nama));

  const allowedIds = paudList.map((p: any) => p.id);

  // Ambil data anggota per PAUD & seluruh data anak bersekolah (termasuk hasil sinkronisasi Google Sheet)
  const chunkRanges = [
    [0, 999], [1000, 1999], [2000, 2999], [3000, 3999],
    [4000, 4999], [5000, 5999], [6000, 6999], [7000, 7999]
  ];

  const [{ data: memberCounts }, ...childChunks] = await Promise.all([
    supabase
      .from("anggota_komunitas")
      .select("komunitas_id, id")
      .in("komunitas_id", allowedIds)
      .eq("status", "approved"),
    ...chunkRanges.map(([start, end]) =>
      supabase
        .from("data_anak")
        .select("id, nama_sekolah, komunitas_id, status_approval, validated_at, is_updated_by_paud, diperbarui_oleh")
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

  // Normalisasi helper untuk mencocokkan nama sekolah hasil sinkronisasi dengan nama lembaga PAUD
  const cleanSchool = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/111/g, "iii")
      .replace(/bina anak sholeh/g, "bina iman anak sholeh")
      .replace(/[^a-z0-9]/g, "");

  const paudByClean = new Map<string, any>();
  const paudById = new Map<string, any>();
  paudList.forEach((p: any) => {
    paudById.set(p.id, p);
    paudByClean.set(cleanSchool(p.nama), p);
  });

  const memberCountMap: Record<string, number> = {};
  (memberCounts || []).forEach((m: any) => {
    memberCountMap[m.komunitas_id] = (memberCountMap[m.komunitas_id] || 0) + 1;
  });

  const studentCountMap: Record<string, { total: number; updated: number }> = {};
  paudList.forEach((p: any) => {
    studentCountMap[p.id] = { total: 0, updated: 0 };
  });

  childrenData.forEach((c: any) => {
    // 1. Cari PAUD yang cocok: via ID langsung atau nama sekolah Google Sheet
    let p = paudById.get(c.komunitas_id);
    if (!p && c.nama_sekolah) {
      const cName = cleanSchool(c.nama_sekolah);
      p = paudByClean.get(cName);
      if (!p) {
        // Fallback substring matcher
        p = paudList.find((x: any) => {
          const cx = cleanSchool(x.nama);
          return cx === cName || cx.includes(cName) || cName.includes(cx);
        });
      }
    }

    if (p && studentCountMap[p.id]) {
      studentCountMap[p.id].total += 1;

      // SYARAT 1: Lembaga PAUD HARUS memiliki akun guru/operator yang bergabung
      const hasTeacher = (memberCountMap[p.id] || 0) > 0;

      // SYARAT 2: Murid tersebut secara nyata telah divalidasi (approved) ATAU diedit oleh akun pengguna terdaftar
      const isUpdated =
        hasTeacher &&
        (c.status_approval === "approved" ||
          c.validated_at != null ||
          (c.is_updated_by_paud === true && c.diperbarui_oleh != null));

      if (isUpdated) {
        studentCountMap[p.id].updated += 1;
      }
    }
  });

  return paudList.map((p: any) => {
    const totalStudents = studentCountMap[p.id]?.total || 0;
    const totalUpdated = studentCountMap[p.id]?.updated || 0;
    const memberCount = memberCountMap[p.id] || 0;
    const pct = totalStudents > 0 ? Math.round((totalUpdated / totalStudents) * 1000) / 10 : 0.0;

    let status: StatusPenyelesaianProgres = "BELUM_MULAI";
    if (totalStudents === 0) {
      status = "KOSONG";
    } else if (memberCount === 0) {
      status = "BELUM_MULAI";
    } else if (totalUpdated >= totalStudents && totalStudents > 0) {
      status = "SELESAI";
    } else if (totalUpdated > 0) {
      status = "PROGRES";
    } else {
      status = "BELUM_MULAI";
    }

    // Deteksi tipe institusi dari nama (TK, KB, RA, PKBM, SKB, SPS/Pos PAUD, TPA)
    let jenisInstitusi = "PAUD";
    const n = (p.nama || "").toUpperCase();
    if (n.startsWith("TK ") || n.startsWith("TK-") || n.includes("TAMAN KANAK")) jenisInstitusi = "TK";
    else if (n.startsWith("KB ") || n.includes("KELOMPOK BERMAIN")) jenisInstitusi = "KB";
    else if (n.startsWith("RA ") || n.startsWith("RAUDHATUL")) jenisInstitusi = "RA";
    else if (n.startsWith("PKBM ") || n.includes("PKBM")) jenisInstitusi = "PKBM";
    else if (n.includes("SKB") || n.includes("SANGGAR KEGIATAN") || n.includes("SPNF")) jenisInstitusi = "SKB";
    else if (n.startsWith("POS PAUD") || n.includes("SPS")) jenisInstitusi = "SPS / Pos PAUD";
    else if (n.startsWith("TPA")) jenisInstitusi = "TPA";

    return {
      komunitas_id: p.id,
      nama_paud: p.nama,
      jenis_institusi: jenisInstitusi,
      kecamatan: p.kecamatan || "Kota Tegal",
      kelurahan: p.kelurahan || "-",
      jumlah_anggota: memberCount,
      has_anggota: memberCount > 0,
      total_peserta_didik: totalStudents,
      total_diperbarui: totalUpdated,
      persentase_selesai: pct,
      status_penyelesaian: status,
    };
  }).sort((a: ProgresPaudItem, b: ProgresPaudItem) => {
    // 1. Utamakan yang memiliki persentase tertinggi
    if (b.persentase_selesai !== a.persentase_selesai) {
      return b.persentase_selesai - a.persentase_selesai;
    }
    // 2. Yang memiliki data murid terdaftar (aktif pendataan)
    if (b.total_peserta_didik !== a.total_peserta_didik) {
      return b.total_peserta_didik - a.total_peserta_didik;
    }
    // 3. Yang sudah memiliki akun guru
    if (b.jumlah_anggota !== a.jumlah_anggota) {
      return b.jumlah_anggota - a.jumlah_anggota;
    }
    // 4. Lalu abjad nama
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
