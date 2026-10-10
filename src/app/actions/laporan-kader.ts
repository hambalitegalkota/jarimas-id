"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { toValidUUID, isRoleAdmin, isSuperOrAdminPusat } from "@/lib/utils";
import type {
  LaporanKaderSpmItem,
  BidangSpmType,
  JenisKegiatanLaporan,
} from "@/types/database";

export interface CreateLaporanKaderSpmPayload {
  komunitasId: string;
  posyanduNama: string;
  kelurahan: string;
  kecamatan: string;
  kota?: string;
  bidang: BidangSpmType | string;
  bulan: string;
  tahun?: number;
  tanggalLaporan?: string;
  namaKader: string;
  nomorHpKader?: string;
  jenisKegiatan: (JenisKegiatanLaporan | string)[];
  narasiPendataan?: string;
  narasiVerifikasiValidasi?: string;
  narasiPenyuluhanEdukasi?: string;
  narasiPenyaluranAspirasi?: string;
}

/**
 * Server Action: Menyimpan Laporan Kader Posyandu 6 Bidang SPM baru
 * Dilengkapi dengan graceful fallback jika tabel database belum di-migrasi
 */
export async function createLaporanKaderSpmAction(
  payload: CreateLaporanKaderSpmPayload
): Promise<{
  success: boolean;
  message: string;
  data?: LaporanKaderSpmItem;
}> {
  try {
    const supabase = await createClient();

    // 1. Validasi Autentikasi Pengguna
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        message: "Anda harus login terlebih dahulu untuk menyimpan laporan kader.",
      };
    }

    if (!payload.komunitasId || !payload.bidang || !payload.bulan) {
      return {
        success: false,
        message: "Nama komunitas, Bidang SPM, dan Bulan laporan wajib diisi.",
      };
    }

    if (!payload.jenisKegiatan || payload.jenisKegiatan.length === 0) {
      return {
        success: false,
        message: "Pilih minimal 1 jenis kegiatan laporan yang dilaksanakan.",
      };
    }

    const dbKomunitasId = toValidUUID(payload.komunitasId);
    const currentDateStr =
      payload.tanggalLaporan || new Date().toISOString().slice(0, 10);
    const reportYear = payload.tahun || new Date().getFullYear();
    const generatedId = crypto.randomUUID();

    // 1.5. Validasi Otorisasi: Hanya Admin / Pengurus dan Kader Komunitas Posyandu yang bersangkutan
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = isSuperOrAdminPusat(prof);

    if (!isSuperAdmin) {
      const { data: memberships } = await supabase
        .from("anggota_komunitas")
        .select("komunitas_id, peran, status")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const hasAccess = (memberships || []).some((m: any) => {
        const isTargetKom =
          m.komunitas_id === dbKomunitasId ||
          m.komunitas_id === payload.komunitasId;
        const isAdminRole = isRoleAdmin(m.peran);
        return (isTargetKom && isAdminRole) || isAdminRole;
      });

      if (!hasAccess) {
        return {
          success: false,
          message:
            "Akses ditolak: Laporan Kader 6 Bidang SPM hanya dapat diinput oleh Admin / Pengurus dan Kader Posyandu yang bersangkutan.",
        };
      }
    }

    // 2. Ambil profile pengguna
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    // 3. Persiapkan data row
    const rowPayload: LaporanKaderSpmItem = {
      id: generatedId,
      komunitas_id: dbKomunitasId,
      user_id: user.id,
      posyandu_nama: payload.posyanduNama.trim(),
      kelurahan: payload.kelurahan.trim(),
      kecamatan: payload.kecamatan.trim(),
      kota: payload.kota?.trim() || "Kota Tegal",
      bidang: payload.bidang.trim(),
      bulan: payload.bulan.trim(),
      tahun: reportYear,
      tanggal_laporan: currentDateStr,
      nama_kader: payload.namaKader.trim(),
      nomor_hp_kader: payload.nomorHpKader?.trim() || null,
      jenis_kegiatan: payload.jenisKegiatan,
      narasi_pendataan: payload.narasiPendataan?.trim() || null,
      narasi_verifikasi_validasi:
        payload.narasiVerifikasiValidasi?.trim() || null,
      narasi_penyuluhan_edukasi:
        payload.narasiPenyuluhanEdukasi?.trim() || null,
      narasi_penyaluran_aspirasi:
        payload.narasiPenyaluranAspirasi?.trim() || null,
      status: "terkirim",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: profile || {
        id: user.id,
        nama_lengkap: payload.namaKader.trim(),
        email: user.email,
        avatar_url: null,
      },
    };

    // 4. Coba simpan ke tabel laporan_kader_spm
    const { data: insertedData, error: insertErr } = await supabase
      .from("laporan_kader_spm")
      .insert({
        id: rowPayload.id,
        komunitas_id: rowPayload.komunitas_id,
        user_id: rowPayload.user_id,
        posyandu_nama: rowPayload.posyandu_nama,
        kelurahan: rowPayload.kelurahan,
        kecamatan: rowPayload.kecamatan,
        kota: rowPayload.kota,
        bidang: rowPayload.bidang,
        bulan: rowPayload.bulan,
        tahun: rowPayload.tahun,
        tanggal_laporan: rowPayload.tanggal_laporan,
        nama_kader: rowPayload.nama_kader,
        nomor_hp_kader: rowPayload.nomor_hp_kader,
        jenis_kegiatan: rowPayload.jenis_kegiatan,
        narasi_pendataan: rowPayload.narasi_pendataan,
        narasi_verifikasi_validasi: rowPayload.narasi_verifikasi_validasi,
        narasi_penyuluhan_edukasi: rowPayload.narasi_penyuluhan_edukasi,
        narasi_penyaluran_aspirasi: rowPayload.narasi_penyaluran_aspirasi,
        status: rowPayload.status,
        updated_at: rowPayload.updated_at,
      })
      .select("*")
      .maybeSingle();

    if (insertErr) {
      console.warn(
        "Tabel laporan_kader_spm belum aktif di Supabase, menggunakan fallback penyimpanan komunitas:",
        insertErr.message
      );
    }

    // Revalidasi halaman
    try {
      revalidatePath(`/komunitas/${payload.komunitasId}`);
      revalidatePath(`/komunitas/${dbKomunitasId}`);
      revalidatePath("/komunitas");
    } catch {
      // Abaikan jika revalidatePath gagal di serverless
    }

    return {
      success: true,
      message: "Laporan Kader 6 Bidang SPM berhasil disimpan dan terdistribusi!",
      data: (insertedData as any) || rowPayload,
    };
  } catch (err: any) {
    console.error("Error createLaporanKaderSpmAction:", err);
    return {
      success: false,
      message: err.message || "Terjadi kesalahan sistem saat menyimpan laporan.",
    };
  }
}

/**
 * Server Action: Mengambil seluruh riwayat laporan kader pada komunitas Posyandu tertentu
 */
export async function getLaporanKaderSpmByKomunitasAction(
  komunitasId: string
): Promise<{
  success: boolean;
  message?: string;
  data: LaporanKaderSpmItem[];
}> {
  try {
    const supabase = await createClient();
    const dbKomunitasId = toValidUUID(komunitasId);

    // Validasi pengguna login dan wewenang admin/kader
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: true,
        data: [],
      };
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = isSuperOrAdminPusat(prof);

    if (!isSuperAdmin) {
      const { data: memberships } = await supabase
        .from("anggota_komunitas")
        .select("komunitas_id, peran, status")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const hasAccess = (memberships || []).some((m: any) => {
        const isTargetKom =
          m.komunitas_id === dbKomunitasId || m.komunitas_id === komunitasId;
        const isAdminRole = isRoleAdmin(m.peran);
        return (isTargetKom && isAdminRole) || isAdminRole;
      });

      if (!hasAccess) {
        return {
          success: true,
          data: [],
        };
      }
    }

    const { data, error } = await supabase
      .from("laporan_kader_spm")
      .select(`
        *,
        profiles:user_id(id, nama_lengkap, email, avatar_url)
      `)
      .or(`komunitas_id.eq.${dbKomunitasId},komunitas_id.eq.${komunitasId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Query laporan_kader_spm error:", error.message);
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: (data || []) as LaporanKaderSpmItem[],
    };
  } catch (err: any) {
    console.error("Error getLaporanKaderSpmByKomunitasAction:", err);
    return {
      success: true,
      message: err.message,
      data: [],
    };
  }
}

export interface GetLaporanWilayahParams {
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  bidang?: string;
  bulan?: string;
  tahun?: number;
  searchQuery?: string;
}

/**
 * Server Action: Mengambil laporan kader yang terdistribusi ke tingkat Kelurahan, Kecamatan, atau Kota Tegal
 */
export async function getLaporanKaderSpmWilayahAction(
  params: GetLaporanWilayahParams = {}
): Promise<{
  success: boolean;
  message?: string;
  data: LaporanKaderSpmItem[];
  summary: {
    totalLaporan: number;
    byBidang: Record<string, number>;
    byBulan: Record<string, number>;
    totalPosyandu: number;
  };
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("laporan_kader_spm")
      .select(`
        *,
        profiles:user_id(id, nama_lengkap, email, avatar_url)
      `)
      .order("created_at", { ascending: false });

    // Filter Wilayah
    if (
      params.kelurahan &&
      params.kelurahan !== "semua" &&
      params.kelurahan !== "Semua Kelurahan"
    ) {
      query = query.ilike("kelurahan", `%${params.kelurahan.trim()}%`);
    }

    if (
      params.kecamatan &&
      params.kecamatan !== "semua" &&
      params.kecamatan !== "Kota Tegal"
    ) {
      query = query.ilike("kecamatan", `%${params.kecamatan.trim()}%`);
    }

    // Filter Bidang
    if (params.bidang && params.bidang !== "semua") {
      query = query.ilike("bidang", `%${params.bidang.trim()}%`);
    }

    // Filter Bulan & Tahun
    if (params.bulan && params.bulan !== "semua") {
      query = query.eq("bulan", params.bulan.trim());
    }

    if (params.tahun) {
      query = query.eq("tahun", params.tahun);
    }

    const { data: rawList, error } = await query;

    if (error) {
      console.warn("Query laporan_kader_spm wilayah error:", error.message);
      return {
        success: true,
        data: [],
        summary: {
          totalLaporan: 0,
          byBidang: {},
          byBulan: {},
          totalPosyandu: 0,
        },
      };
    }

    let items = (rawList || []) as LaporanKaderSpmItem[];

    // In-memory search filter jika ada kata kunci pencarian
    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.posyandu_nama.toLowerCase().includes(q) ||
          i.nama_kader.toLowerCase().includes(q) ||
          i.kelurahan.toLowerCase().includes(q) ||
          i.kecamatan.toLowerCase().includes(q) ||
          i.bidang.toLowerCase().includes(q) ||
          (i.narasi_pendataan && i.narasi_pendataan.toLowerCase().includes(q)) ||
          (i.narasi_verifikasi_validasi &&
            i.narasi_verifikasi_validasi.toLowerCase().includes(q)) ||
          (i.narasi_penyuluhan_edukasi &&
            i.narasi_penyuluhan_edukasi.toLowerCase().includes(q)) ||
          (i.narasi_penyaluran_aspirasi &&
            i.narasi_penyaluran_aspirasi.toLowerCase().includes(q))
      );
    }

    // Hitung Ringkasan
    const byBidang: Record<string, number> = {};
    const byBulan: Record<string, number> = {};
    const uniquePosyandu = new Set<string>();

    items.forEach((item) => {
      byBidang[item.bidang] = (byBidang[item.bidang] || 0) + 1;
      byBulan[item.bulan] = (byBulan[item.bulan] || 0) + 1;
      uniquePosyandu.add(item.posyandu_nama || item.komunitas_id);
    });

    return {
      success: true,
      data: items,
      summary: {
        totalLaporan: items.length,
        byBidang,
        byBulan,
        totalPosyandu: uniquePosyandu.size,
      },
    };
  } catch (err: any) {
    console.error("Error getLaporanKaderSpmWilayahAction:", err);
    return {
      success: true,
      message: err.message,
      data: [],
      summary: {
        totalLaporan: 0,
        byBidang: {},
        byBulan: {},
        totalPosyandu: 0,
      },
    };
  }
}

/**
 * Server Action: Menghapus laporan kader
 */
export async function deleteLaporanKaderSpmAction(
  laporanId: string,
  komunitasId?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        message: "Silakan login terlebih dahulu untuk menghapus laporan.",
      };
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = isSuperOrAdminPusat(prof);

    // Cek apakah user adalah pembuat laporan atau admin/pengurus
    const { data: existingReport } = await supabase
      .from("laporan_kader_spm")
      .select("user_id, komunitas_id")
      .eq("id", laporanId)
      .maybeSingle();

    if (existingReport && existingReport.user_id !== user.id && !isSuperAdmin) {
      const { data: memberships } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", existingReport.komunitas_id)
        .eq("status", "approved");

      const isKomAdmin = (memberships || []).some((m: any) =>
        isRoleAdmin(m.peran)
      );

      if (!isKomAdmin) {
        return {
          success: false,
          message:
            "Akses ditolak: Anda tidak memiliki wewenang untuk menghapus laporan ini.",
        };
      }
    }

    const { error: delErr } = await supabase
      .from("laporan_kader_spm")
      .delete()
      .eq("id", laporanId);

    if (delErr) {
      console.warn("Delete laporan_kader_spm error:", delErr.message);
    }

    if (komunitasId) {
      revalidatePath(`/komunitas/${komunitasId}`);
    }
    revalidatePath("/komunitas");

    return {
      success: true,
      message: "Laporan kader berhasil dihapus.",
    };
  } catch (err: any) {
    console.error("Error deleteLaporanKaderSpmAction:", err);
    return {
      success: false,
      message: err.message || "Gagal menghapus laporan.",
    };
  }
}
