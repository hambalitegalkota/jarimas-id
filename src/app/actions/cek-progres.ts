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
 * Server Action: Mengambil data Cek Progres Satuan PAUD
 * Mendukung eksekusi via RPC get_cek_progres_paud dan fallback query langsung
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authorized: false,
        items: [],
        summary: getEmptySummary(),
        message: "Silakan masuk terlebih dahulu untuk mengakses Cek Progres.",
      };
    }

    // 1. Ambil Profil & Keanggotaan Komunitas User
    const [{ data: profile }, { data: memberships }] = await Promise.all([
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

    const isSuper = isSuperOrAdminPusat({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });

    const adminInfo = getUserAdminInfo({
      profile,
      userCommunities: memberships || [],
      currentUserId: user.id,
    });

    // Validasi Otorisasi: Hanya Admin yang berhak mengakses
    if (!isSuper && !adminInfo.isAdmin) {
      return {
        authorized: false,
        items: [],
        summary: getEmptySummary(),
        message:
          "Akses Terbatas: Fitur Cek Progres hanya dapat diakses oleh Admin berwenang.",
      };
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
        p_user_id: user.id,
        p_kecamatan: filterKec,
        p_kelurahan: filterKel,
      }
    );

    if (!rpcError && rpcData && Array.isArray(rpcData)) {
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
      rawItems = await fetchProgresPaudFallback(supabase, user.id, isSuper, memberships || [], filterKec, filterKel);
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

    // 5. Hitung Ringkasan Statistik
    const summary = computeSummary(rawItems);

    return {
      authorized: true,
      userRoleLabel: adminInfo.tierBadgeLabel || (isSuper ? "Super Admin" : "Admin"),
      userTierLevel: adminInfo.tierLevel,
      adminScopeLabel: adminInfo.wilayahLabel || (isSuper ? "Seluruh Kota Tegal" : "Wilayah Binaan"),
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
  userId: string,
  isSuper: boolean,
  memberships: any[],
  filterKec: string | null,
  filterKel: string | null
): Promise<ProgresPaudItem[]> {
  // Evaluasi komunitas yang boleh diakses
  const adminKomunitasIds = (memberships || [])
    .filter((m) => isRoleAdmin(m.peran))
    .map((m) => m.komunitas_id);

  // Ambil seluruh Satuan PAUD
  let paudQuery = supabase
    .from("komunitas")
    .select("id, nama, jenis, jenis_institusi, kecamatan, kelurahan")
    .eq("jenis", "satuan_paud");

  if (filterKec) {
    paudQuery = paudQuery.eq("kecamatan", filterKec);
  }
  if (filterKel) {
    paudQuery = paudQuery.eq("kelurahan", filterKel);
  }

  const { data: paudList } = await paudQuery;
  if (!paudList || paudList.length === 0) return [];

  // Filter berjenjang jika bukan super admin
  let allowedPaud = paudList;
  if (!isSuper) {
    // Cari apakah admin kecamatan atau kelurahan
    const adminWargaKom = (memberships || []).find(
      (m) => m.komunitas?.jenis === "warga_kita" && isRoleAdmin(m.peran)
    );

    if (adminWargaKom) {
      const meta = extractKomunitasMetadata(adminWargaKom.komunitas);
      if (meta.rawKec && (!meta.rawKel || meta.rawKel === "Kota Tegal")) {
        allowedPaud = paudList.filter((p: any) => p.kecamatan === meta.rawKec);
      } else if (meta.rawKel) {
        allowedPaud = paudList.filter((p: any) => p.kelurahan === meta.rawKel);
      } else {
        allowedPaud = paudList.filter((p: any) => adminKomunitasIds.includes(p.id));
      }
    } else {
      allowedPaud = paudList.filter((p: any) => adminKomunitasIds.includes(p.id));
    }
  }

  if (allowedPaud.length === 0) return [];

  const allowedIds = allowedPaud.map((p: any) => p.id);

  // Ambil data anggota per PAUD & data anak per PAUD
  const [{ data: memberCounts }, { data: childrenData }] = await Promise.all([
    supabase
      .from("anggota_komunitas")
      .select("komunitas_id, id")
      .in("komunitas_id", allowedIds)
      .eq("status", "approved"),
    supabase
      .from("data_anak")
      .select("komunitas_id, id, created_at, updated_at, is_updated_by_paud")
      .in("komunitas_id", allowedIds),
  ]);

  const memberCountMap: Record<string, number> = {};
  (memberCounts || []).forEach((m: any) => {
    memberCountMap[m.komunitas_id] = (memberCountMap[m.komunitas_id] || 0) + 1;
  });

  const studentCountMap: Record<string, { total: number; updated: number }> = {};
  (childrenData || []).forEach((c: any) => {
    if (!studentCountMap[c.komunitas_id]) {
      studentCountMap[c.komunitas_id] = { total: 0, updated: 0 };
    }
    studentCountMap[c.komunitas_id].total += 1;
    const isUpdated =
      c.is_updated_by_paud === true ||
      (c.updated_at && c.created_at && new Date(c.updated_at).getTime() > new Date(c.created_at).getTime());
    if (isUpdated) {
      studentCountMap[c.komunitas_id].updated += 1;
    }
  });

  return allowedPaud.map((p: any) => {
    const totalStudents = studentCountMap[p.id]?.total || 0;
    const totalUpdated = studentCountMap[p.id]?.updated || 0;
    const memberCount = memberCountMap[p.id] || 0;
    const pct = totalStudents > 0 ? Math.round((totalUpdated / totalStudents) * 1000) / 10 : 0.0;

    let status: StatusPenyelesaianProgres = "BELUM_MULAI";
    if (totalStudents === 0) {
      status = "KOSONG";
    } else if (totalUpdated >= totalStudents) {
      status = "SELESAI";
    } else if (totalUpdated > 0) {
      status = "PROGRES";
    }

    return {
      komunitas_id: p.id,
      nama_paud: p.nama,
      jenis_institusi: p.jenis_institusi || "PAUD",
      kecamatan: p.kecamatan || "Kota Tegal",
      kelurahan: p.kelurahan || "-",
      jumlah_anggota: memberCount,
      has_anggota: memberCount > 0,
      total_peserta_didik: totalStudents,
      total_diperbarui: totalUpdated,
      persentase_selesai: pct,
      status_penyelesaian: status,
    };
  }).sort((a: ProgresPaudItem, b: ProgresPaudItem) => b.persentase_selesai - a.persentase_selesai);
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
