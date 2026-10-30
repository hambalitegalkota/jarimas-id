"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { DataAnakSchema } from "@/lib/zod-schemas";
import { toValidUUID, isSuperAdmin as checkIsSuperAdmin, isAdminPusat as checkIsAdminPusat, isSuperOrAdminPusat, isRoleAdmin } from "@/lib/utils";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  serializeDataAnakAlasan,
  parseDataAnakDetails,
  isDataAnakMatchingKomunitas,
  isDataAtsRecord,
  isDummyDataAnak,
  isSchoolNameMatching,
  extractSchoolNumberToken,
  isKomunitasLayananPaud,
} from "@/lib/data-anak-helpers";
import type {
  DataAnakItem,
  DdksRecord,
  JenisKomunitas,
} from "@/types/database";

/**
 * Server Action: Menyimpan Data Anak Baru beserta Record DDKS Awal
 */
function parseUsiaToDate(usiaStr?: string | null, tanggalLahirStr?: string | null): string {
  if (tanggalLahirStr && tanggalLahirStr.includes("-") && tanggalLahirStr.length >= 8) {
    return tanggalLahirStr;
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const raw = (usiaStr || tanggalLahirStr || "0").toString().trim();
  if (raw === "24>" || raw === ">24" || raw.includes(">")) {
    return `${currentYear - 25}-01-01`;
  }

  const ageNum = parseInt(raw, 10);
  if (!isNaN(ageNum)) {
    const birthYear = currentYear - Math.max(0, ageNum);
    return `${birthYear}-${month}-${day}`;
  }

  return `${currentYear}-${month}-${day}`;
}

export async function createDataAnak(formData: FormData): Promise<{
  success: boolean;
  message: string;
  dataId?: string;
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
        message: "Silakan masuk terlebih dahulu untuk menambahkan data anak.",
      };
    }

    const komunitasId = formData.get("komunitasId")?.toString();
    const jenisKomunitas = (formData.get("jenisKomunitas")?.toString() ||
      "warga_kita") as JenisKomunitas;
    const komunitasNama = formData.get("komunitasNama")?.toString() || "";

    if (!komunitasId) {
      return {
        success: false,
        message: "Komunitas tujuan tidak valid.",
      };
    }

    // Verifikasi otorisasi: Hanya Admin Komunitas / Super Admin / Admin Pusat yang berhak menambah data anak
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperOrPusat = isSuperOrAdminPusat({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });

    if (!isSuperOrPusat) {
      const validTargetKomId = toValidUUID(komunitasId);
      const { data: member } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", validTargetKomId)
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (member?.peran || "").toLowerCase();
      const isCommunityAdmin =
        isRoleAdmin(roleLower) ||
        roleLower.includes("admin") ||
        roleLower.includes("kepala") ||
        roleLower.includes("guru") ||
        roleLower.includes("pendidik") ||
        roleLower.includes("tutor") ||
        roleLower.includes("pengelola") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("kader") ||
        roleLower.includes("pimpinan") ||
        roleLower.includes("ketua");

      if (!member || member.status !== "approved" || !isCommunityAdmin) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Admin Komunitas yang memiliki wewenang untuk menambahkan data anak.",
        };
      }
    }

    const namaLengkap = formData.get("namaLengkap")?.toString() || "";
    const usia = formData.get("usia")?.toString() || "";
    const tanggalLahirInput = formData.get("tanggalLahir")?.toString() || "";
    const tanggalLahir = parseUsiaToDate(usia, tanggalLahirInput);
    const jenisKelamin = formData.get("jenisKelamin")?.toString() || "L";
    const namaOrangtua = formData.get("namaOrangtua")?.toString() || "";
    const nomorHp = formData.get("nomorHp")?.toString() || "";
    const tinggalBersama = formData.get("tinggalBersama")?.toString() || "Orang Tua";
    const jarakRumahKm = parseFloat(
      formData.get("jarakRumahKm")?.toString() || "0"
    );

    // Alamat Sesuai KK
    const kkKabupaten = formData.get("kkKabupaten")?.toString()?.trim() || "Kota Tegal";
    const kkKecamatan = formData.get("kkKecamatan")?.toString()?.trim() || "";
    const kkKelurahan = formData.get("kkKelurahan")?.toString()?.trim() || "";
    const kkRw = formData.get("kkRw")?.toString()?.trim() || "";
    const kkRt = formData.get("kkRt")?.toString()?.trim() || "";
    const kkJalan = formData.get("kkJalan")?.toString()?.trim() || "";

    // Alamat Domisili
    const domisiliKabupaten =
      formData.get("domisiliKabupaten")?.toString()?.trim() || "Kota Tegal";
    const domisiliKecamatan = formData.get("domisiliKecamatan")?.toString()?.trim() || "";
    const domisiliKelurahan = formData.get("domisiliKelurahan")?.toString()?.trim() || "";
    const domisiliRw = formData.get("domisiliRw")?.toString()?.trim() || "";
    const domisiliRt = formData.get("domisiliRt")?.toString()?.trim() || "";
    const domisiliJalan = formData.get("domisiliJalan")?.toString()?.trim() || "";

    // Verifikasi jenis komunitas dari database: Satuan PAUD, PKBM Star of Tomorrow, dan SKB Kota Tegal berhak mendaftarkan peserta didik PAUD
    const validKomId = toValidUUID(komunitasId);
    const { data: dbKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, jenis_institusi")
      .eq("id", validKomId)
      .maybeSingle();

    const isPaudKomunitas = isKomunitasLayananPaud(dbKom, komunitasNama, jenisKomunitas);

    const isSekolah = isPaudKomunitas;
    const namaSekolah = isPaudKomunitas
      ? (dbKom?.nama || komunitasNama || "Satuan PAUD")
      : "Belum Sekolah";
    let rawAlasanSekolah = formData.get("alasanSekolah")?.toString()?.trim() || "";

    if (isPaudKomunitas) {
      if (!rawAlasanSekolah) {
        rawAlasanSekolah = "Sudah Usia PAUD";
      }
    } else {
      if (!rawAlasanSekolah) {
        rawAlasanSekolah = "Belum Wajib (Masih Balita)";
      }
    }

    // Serialisasi Alamat KK & Domisili ke dalam alasan_sekolah
    const formattedAlasan = serializeDataAnakAlasan({
      alasanSekolah: rawAlasanSekolah,
      kkKabupaten,
      kkKecamatan,
      kkKelurahan,
      kkRw,
      kkRt,
      kkJalan,
      domisiliKabupaten,
      domisiliKecamatan,
      domisiliKelurahan,
      domisiliRw,
      domisiliRt,
      domisiliJalan,
    });

    // Validasi Zod Data Anak
    const validationResult = DataAnakSchema.safeParse({
      namaLengkap,
      usia,
      tanggalLahir,
      jenisKelamin,
      namaOrangtua,
      nomorHp,
      tinggalBersama,
      jarakRumahKm,
      isSekolah,
      namaSekolah,
      alasanSekolah: formattedAlasan,
      kkKabupaten,
      kkKecamatan,
      kkKelurahan,
      kkRw,
      kkRt,
      kkJalan,
      domisiliKabupaten,
      domisiliKecamatan,
      domisiliKelurahan,
      domisiliRw,
      domisiliRt,
      domisiliJalan,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message;
      return {
        success: false,
        message: firstError || "Periksa kembali kelengkapan data anak.",
      };
    }

    // Simpan ke Supabase Data Anak
    const childPayload = {
      nama_lengkap: namaLengkap,
      tanggal_lahir: tanggalLahir,
      jenis_kelamin: jenisKelamin,
      nama_orangtua: namaOrangtua,
      nomor_hp: nomorHp,
      tinggal_bersama: tinggalBersama,
      jarak_rumah_km: jarakRumahKm,
      is_sekolah: isSekolah,
      nama_sekolah: namaSekolah,
      alasan_sekolah: formattedAlasan,
      komunitas_id: toValidUUID(komunitasId),
      status_approval: "pending",
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data: insertedChild, error: insertChildError } = await supabase
      .from("data_anak")
      .insert(childPayload)
      .select("id")
      .single();

    if (insertChildError || !insertedChild) {
      return {
        success: false,
        message:
          "Gagal menyimpan data anak ke database: " +
          (insertChildError?.message || "Kesalahan tidak diketahui"),
      };
    }

    const newChildId = insertedChild.id;

    revalidatePath(`/komunitas/${komunitasId}/data`);
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/");

    return {
      success: true,
      message:
        "Data anak berhasil didaftarkan! Menunggu verifikasi Kader Posyandu / Pengurus RT.",
      dataId: newChildId,
    };
  } catch (err: any) {
    console.error("Error createDataAnak:", err);
    return {
      success: false,
      message: err.message || "Gagal menyimpan data anak.",
    };
  }
}

/**
 * Server Action: Validasi Lintas Komunitas Data Anak oleh Kader / Pengurus RT
 */
export async function validateDataAnak(dataAnakId: string): Promise<{
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

    // Verifikasi otorisasi: Apakah user adalah Super Admin, Kader Posyandu, atau Pengurus RT
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperOrPusat = isSuperOrAdminPusat({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });

    if (!isSuperOrPusat) {
      const { data: memberships } = await supabase
        .from("anggota_komunitas")
        .select("peran, status, komunitas_id, komunitas(id, nama, jenis, jenis_institusi)")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const isAuthorizedValidator = (memberships || []).some((m: any) => {
        const role = (m.peran || "").toLowerCase();
        const kom = m.komunitas;
        const isPaudOrEquivalent = isKomunitasLayananPaud(kom, kom?.nama, kom?.jenis);

        // Jika anggota satuan PAUD resmi, PKBM Star of Tomorrow, atau SKB:
        if (isPaudOrEquivalent) {
          return (
            role.includes("admin") ||
            role.includes("kepala") ||
            role.includes("guru") ||
            role.includes("pendidik") ||
            role.includes("tutor") ||
            role.includes("pengelola") ||
            role.includes("pengurus") ||
            role.includes("pimpinan") ||
            role.includes("operator")
          );
        }

        // Posyandu & Warga Kita
        return (
          role.includes("kader") ||
          role.includes("pengurus") ||
          role.includes("nakes") ||
          role.includes("medis") ||
          role.includes("bidan") ||
          role.includes("admin") ||
          role.includes("ketua")
        );
      });

      if (!isAuthorizedValidator) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Admin/Guru Satuan PAUD, PKBM, SKB, Kader Posyandu, atau Pengurus RT yang dapat memvalidasi data anak.",
        };
      }
    }

    // Perbarui status approval di database
    const { data: updatedChildData, error: updateError } = await supabase
      .from("data_anak")
      .update({
        status_approval: "approved",
        validated_by: user.id,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_updated_by_paud: true,
        terakhir_diperbarui_at: new Date().toISOString(),
        diperbarui_oleh: user.id,
      })
      .eq("id", dataAnakId)
      .select("komunitas_id")
      .single();

    if (updateError) {
      return {
        success: false,
        message: "Gagal memvalidasi data: " + updateError.message,
      };
    }

    // Pastikan validator otomatis tercatat di anggota_komunitas PAUD jika belum ada
    if (updatedChildData?.komunitas_id && user?.id) {
      try {
        await supabase.from("anggota_komunitas").upsert(
          {
            komunitas_id: updatedChildData.komunitas_id,
            user_id: user.id,
            peran: "Pendidik",
            status: "approved",
          },
          { onConflict: "komunitas_id,user_id", ignoreDuplicates: true }
        );
      } catch (e) {
        // Non-blocking
      }
    }

    revalidatePath("/cek-progres");
    revalidatePath("/komunitas");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/");
    return {
      success: true,
      message:
        "Data anak berhasil divalidasi! Status kini terkonfirmasi di seluruh ekosistem Posyandu & PAUD.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memvalidasi data anak.",
    };
  }
}

/**
 * Server Action: Menambahkan Riwayat Pengukuran DDKS Baru (Khusus Kader / Nakes Posyandu)
 */
export async function addDdksRecord(_formData?: FormData): Promise<{
  success: boolean;
  message: string;
  record?: DdksRecord;
}> {
  return {
    success: false,
    message: "Fitur pencatatan DDTK / Rekam Medis dinonaktifkan.",
  };
}

/**
 * Server Action: Mengambil Data Anak Terkait Komunitas
 * Mendukung pemetaan lintas komunitas:
 * - Data yang di-input di PAUD akan muncul di Komunitas Kabupaten/Kota, Kecamatan, Kelurahan, RW, RT sesuai alamat KK / Domisili dan Komunitas Posyandu
 */
export async function getDataAnakByKomunitas(
  komunitasId: string,
  options?: {
    countOnly?: boolean;
    preloadedKomunitas?: any;
    isAdminOrKader?: boolean;
    currentUserMembership?: any;
  }
): Promise<{
  success: boolean;
  data: DataAnakItem[];
  stats?: {
    total: number;
    approved: number;
    pending: number;
  };
  canViewDetail?: boolean;
  isAuthenticated?: boolean;
  canValidate: boolean;
  canEditDdks?: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isReadOnly: boolean;
  userRole?: string;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    let canValidate = false;
    let canEditDdks = false;
    let canCreate = false;
    let canEdit = false;
    let canDelete = false;
    let isReadOnly = true;
    let userRole = "Pengunjung";
    let isAuthenticated = false;
    let canViewDetail = false;

    // 1. Ekstraksi metadata komunitas target
    let targetKomunitas: any = options?.preloadedKomunitas || null;
    if (!targetKomunitas) {
      const { data: dbKom } = await supabase
        .from("komunitas")
        .select("*")
        .eq("id", toValidUUID(komunitasId))
        .maybeSingle();

      if (dbKom) {
        targetKomunitas = dbKom;
      } else {
        targetKomunitas = findOrGenerateKomunitasSeed(komunitasId);
      }
    }

    const targetMeta = extractKomunitasMetadata(
      targetKomunitas || { id: komunitasId }
    );
    const targetJenis = targetKomunitas?.jenis || "satuan_paud";

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        isAuthenticated = true;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
          .eq("id", user.id)
          .maybeSingle();

        const userProfileCtx = {
          ...profile,
          id: user.id,
          email: profile?.email || user.email,
          nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
        };
        const isSuperAdmin = checkIsSuperAdmin(userProfileCtx);
        const isAdminPusat = checkIsAdminPusat(userProfileCtx);
        const isSuperOrPusat = isSuperAdmin || isAdminPusat;

        const dbKomunitasId = toValidUUID(komunitasId);

        let member = options?.currentUserMembership;
        if (!member) {
          const { data: dbMember } = await supabase
            .from("anggota_komunitas")
            .select("peran, status")
            .eq("user_id", user.id)
            .eq("komunitas_id", dbKomunitasId)
            .eq("status", "approved")
            .maybeSingle();
          member = dbMember;
        }

        const isApprovedMember = Boolean(member && member.status === "approved");
        userRole = member?.peran || (isSuperAdmin ? "Super Admin" : isAdminPusat ? "Admin Pusat" : "Pengunjung");
        const roleLower = (member?.peran || "").toLowerCase();
        const isAdminRole = isRoleAdmin(roleLower);

        if (isSuperOrPusat) {
          // Super Admin & Admin Pusat: Hak akses penuh ke seluruh fitur dan data
          canCreate = true;
          canEdit = true;
          canDelete = true;
          canValidate = true;
          canEditDdks = true;
          isReadOnly = false;
          canViewDetail = true;
        } else if (isApprovedMember) {
          const cleanTargetNama = (targetKomunitas?.nama || "").toLowerCase();
          const isPkbmOrSkbTarget =
            targetJenis === "pkbm_skb" ||
            targetKomunitas?.jenis_institusi === "PKBM" ||
            targetKomunitas?.jenis_institusi === "SKB" ||
            cleanTargetNama.includes("pkbm") ||
            cleanTargetNama.includes("skb") ||
            cleanTargetNama.includes("sanggar kegiatan belajar");

          const isCommunityAdmin = Boolean(options?.isAdminOrKader || isAdminRole);

          if (isKomunitasLayananPaud(targetKomunitas, targetKomunitas?.nama, targetJenis) || isPkbmOrSkbTarget) {
            // Admin Komunitas PAUD / PKBM: Admin, Kepala Sekolah, Guru PAUD / Tutor PKBM / Pendidik / Pengurus
            const isPaudStaff =
              isCommunityAdmin ||
              roleLower.includes("admin") ||
              roleLower.includes("kepala") ||
              roleLower.includes("guru") ||
              roleLower.includes("pendidik") ||
              roleLower.includes("tutor") ||
              roleLower.includes("pengelola") ||
              roleLower.includes("pengurus");

            if (isPaudStaff) {
              // Admin Komunitas: Fitur Lengkap & Lihat Data Detail
              canViewDetail = true;
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = true;
              canEditDdks = true;
              isReadOnly = false;
            } else {
              // Pengguna yang telah bergabung dalam komunitas: HANYA BISA MELIHAT SAJA
              canViewDetail = true;
              canCreate = false;
              canEdit = false;
              canDelete = false;
              canValidate = false;
              canEditDdks = false;
              isReadOnly = true;
            }
          } else if (targetJenis === "posyandu") {
            // Admin Komunitas Posyandu: Kader, Nakes, Bidan, Medis, Pengurus, Admin
            const isKader =
              isCommunityAdmin ||
              roleLower.includes("kader") ||
              roleLower.includes("medis") ||
              roleLower.includes("kesehatan") ||
              roleLower.includes("bidan") ||
              roleLower.includes("nakes") ||
              roleLower.includes("plkb") ||
              roleLower.includes("pkk") ||
              roleLower.includes("pengurus") ||
              roleLower.includes("admin");

            if (isKader) {
              // Admin Komunitas: Fitur Lengkap & Lihat Data Detail
              canViewDetail = true;
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = true;
              canEditDdks = true;
              isReadOnly = false;
            } else {
              // Pengguna yang telah bergabung dalam komunitas: HANYA BISA MELIHAT SAJA
              canViewDetail = true;
              canCreate = false;
              canEdit = false;
              canDelete = false;
              canValidate = false;
              canEditDdks = false;
              isReadOnly = true;
            }
          } else {
            // Warga Kita (RT, RW, Kelurahan, Kecamatan, Kota Tegal)
            const isWargaAdmin =
              isCommunityAdmin ||
              roleLower.includes("admin") ||
              roleLower.includes("pengurus") ||
              roleLower.includes("ketua") ||
              roleLower.includes("kader") ||
              roleLower.includes("rt") ||
              roleLower.includes("rw") ||
              roleLower.includes("lurah");

            if (isWargaAdmin) {
              // Admin Komunitas: Fitur Lengkap & Lihat Data Detail
              canViewDetail = true;
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = false;
              canEditDdks = true;
              isReadOnly = false;
            } else {
              // Pengguna yang telah bergabung dalam komunitas: HANYA BISA MELIHAT SAJA
              canViewDetail = true;
              canCreate = false;
              canEdit = false;
              canDelete = false;
              canValidate = false;
              canEditDdks = false;
              isReadOnly = true;
            }
          }
        } else {
          // Selain admin dan pengguna yang telah bergabung (Tamu/Publik, belum bergabung, atau pending):
          // TIDAK BISA MELIHAT DATA DETAIL
          canViewDetail = false;
          canCreate = false;
          canEdit = false;
          canDelete = false;
          canValidate = false;
          canEditDdks = false;
          isReadOnly = true;
        }
      }
    } catch {
      // Tamu / Belum Login
      canViewDetail = false;
      canCreate = false;
      canEdit = false;
      canDelete = false;
      canValidate = false;
      canEditDdks = false;
      isReadOnly = true;
    }

    // 2. Query data_anak dari database (Targeted untuk Satuan PAUD & Paginasi penuh untuk wilayah)
    const validKomId = toValidUUID(komunitasId);
    let dbChildren: any[] = [];
    let childError: any = null;

    const selectFields = options?.countOnly
      ? `
        id,
        nama_lengkap,
        nama_sekolah,
        is_sekolah,
        alasan_sekolah,
        komunitas_id,
        status_approval,
        created_at
      `
      : `
        id,
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        nama_orangtua,
        nomor_hp,
        tinggal_bersama,
        jarak_rumah_km,
        is_sekolah,
        nama_sekolah,
        alasan_sekolah,
        komunitas_id,
        status_approval,
        validated_by,
        validated_at,
        created_by,
        created_at,
        ddks_records (*)
      `;

    const cleanKomNama = (targetKomunitas?.nama || "").toLowerCase();
    const isPkbmOrSkbTarget =
      targetJenis === "pkbm_skb" ||
      targetKomunitas?.jenis_institusi === "PKBM" ||
      targetKomunitas?.jenis_institusi === "SKB" ||
      cleanKomNama.includes("pkbm") ||
      cleanKomNama.includes("skb") ||
      cleanKomNama.includes("sanggar kegiatan belajar");

    if (isKomunitasLayananPaud(targetKomunitas, targetKomunitas?.nama, targetJenis) || isPkbmOrSkbTarget) {
      const rawPaudName = (targetKomunitas?.nama || "").trim();
      const numToken = extractSchoolNumberToken(rawPaudName);

      // Kumpulkan variasi frasa pencarian nama sekolah dari nama komunitas PAUD:
      // 1. Nama asli & tanpa prefix jenjang (KB, TK, PAUD TPQ, POS PAUD, SPS, TPA, RA, PKBM, SKB)
      // 2. Tanpa nama kelurahan / kecamatan jika tertera di nama komunitas (misal: "TK Nurul Huda Muarareja" -> "Nurul Huda")
      // 3. Toleransi tanda baca (petik satu/dua, backtick, titik, spasi)
      const searchPhrases = new Set<string>();
      if (rawPaudName) searchPhrases.add(rawPaudName);

      const prefixRegex = /^(KB|TK|TPA|SPS|RA|PKBM|SKB|POS PAUD|PAUD TPQ|PAUD|TPQ)[\s.]+/i;
      const cleanPrefix = rawPaudName.replace(prefixRegex, "").trim();
      if (cleanPrefix && cleanPrefix.length > 2) {
        searchPhrases.add(cleanPrefix);
      }

      // Variasi tanpa kata "Iman" (misal: "Bina Iman Anak Sholeh" vs "Bina Anak Sholeh")
      if (cleanPrefix.toLowerCase().includes("iman")) {
        const noImanClean = cleanPrefix.replace(/\biman\b/gi, "").replace(/\s+/g, " ").trim();
        const noImanRaw = rawPaudName.replace(/\biman\b/gi, "").replace(/\s+/g, " ").trim();
        if (noImanClean.length > 2) searchPhrases.add(noImanClean);
        if (noImanRaw.length > 2) searchPhrases.add(noImanRaw);
      }

      // Variasi angka Romawi III <-> 111 (misal: "TK Kartika III-28" vs "TK Kartika 111-28")
      if (/\biii\b/i.test(cleanPrefix)) {
        searchPhrases.add(cleanPrefix.replace(/\biii\b/gi, "111"));
      }

      // Variasi tanpa nama kelurahan jika tertera di nama komunitas (misal: "TK Nurul Huda Muarareja" -> "TK Nurul Huda")
      // CATATAN PENTING: Hanya kelurahan (BUKAN kecamatan, karena kecamatan sering menjadi nama resmi sekolah misal "KB Aisyiyah Tegal Barat")
      const kel = targetKomunitas?.kelurahan;
      if (kel && kel !== "semua" && kel !== "Semua Kelurahan" && kel !== "Kota Tegal") {
        const kelRegex = new RegExp(`\\b${kel}\\b`, "gi");
        const rawNoLoc = rawPaudName.replace(kelRegex, "").replace(/\s+/g, " ").trim();
        const cleanNoLoc = cleanPrefix.replace(kelRegex, "").replace(/\s+/g, " ").trim();

        // Jangan izinkan frasa 1 kata yang terlalu umum sebagai wildcard bebas agar tidak menenggelamkan sekolah spesifik
        const genericOneWords = new Set([
          "aisyiyah", "pertiwi", "masyithoh", "ihsaniyah", "pembina", "kartini", "bina", "tunas", "harapan", "islam", "terpadu"
        ]);

        if (rawNoLoc && rawNoLoc.length > 3) {
          searchPhrases.add(rawNoLoc);
        }
        if (cleanNoLoc && cleanNoLoc.length > 3) {
          const words = cleanNoLoc.split(/\s+/).filter(Boolean);
          if (words.length >= 2 || !genericOneWords.has(cleanNoLoc.toLowerCase())) {
            searchPhrases.add(cleanNoLoc);
          }
        }
        // Variasi frasa nama sekolah + kelurahan dengan wildcard perantara (misal "POS PAUD KARTINI RW. VI SLEROK" vs "Pos PAUD Kartini Slerok")
        if (cleanNoLoc && cleanNoLoc.length > 2) {
          searchPhrases.add(`${cleanNoLoc}%${kel}`);
        }
        if (rawNoLoc && rawNoLoc.length > 2) {
          searchPhrases.add(`${rawNoLoc}%${kel}`);
        }
      }

      // Variasi toleransi tanda baca (petik satu/dua, backtick, kurung yang mengganggu PostgREST)
      const initialPhrases = Array.from(searchPhrases);
      for (const phrase of initialPhrases) {
        if (/[\`'’]/.test(phrase)) {
          searchPhrases.add(phrase.replace(/[\`'’]/g, " ").replace(/\s+/g, " ").trim());
          searchPhrases.add(phrase.replace(/[\`'’]/g, "%"));
          searchPhrases.add(phrase.replace(/[\`'’]/g, ""));
        }
        if (/[()]/.test(phrase)) {
          searchPhrases.add(phrase.replace(/[()]/g, " ").replace(/\s+/g, " ").trim());
          searchPhrases.add(phrase.replace(/[()]/g, "%"));
          searchPhrases.add(phrase.replace(/[()]/g, ""));
        }
        // Toleransi spasi <-> tanda hubung (misal "Mubtadi-ien" vs "Mubtadiien" vs "Mubtadi ien", "Al-Izzah" vs "Al Izzah")
        if (phrase.includes(" ")) {
          searchPhrases.add(phrase.replace(/\s+/g, "%"));
          searchPhrases.add(phrase.replace(/\s+/g, "-"));
        }
        if (phrase.includes("-")) {
          searchPhrases.add(phrase.replace(/-/g, "%"));
          searchPhrases.add(phrase.replace(/-/g, " "));
          searchPhrases.add(phrase.replace(/-/g, ""));
        }
        // Jika terdiri dari beberapa kata, tambahkan kombinasi kata kunci inti dengan wildcard antar-kata
        const cleanWords = phrase.replace(/[()\-]/g, " ").split(/\s+/).filter((w) => w.length > 2);
        if (cleanWords.length >= 2) {
          searchPhrases.add(`${cleanWords[0]}%${cleanWords[1]}`);
          // Potongan awalan kata kedua (misal "Hidayatul%Mubtadi" untuk menangani "Mubtadi-ien" dan "Mubtadiien")
          if (cleanWords[1].length > 5) {
            searchPhrases.add(`${cleanWords[0]}%${cleanWords[1].slice(0, 6)}`);
          }
        }
      }

      // Bersihkan karakter pembatas sintaks PostgREST (.or() terganggu jika ada kurung atau koma)
      const validPhrases = Array.from(searchPhrases)
        .map((p) => p.replace(/[(),]/g, "%").replace(/%+/g, "%").trim())
        .filter((p) => p.replace(/%/g, "").length >= 3);

      const orConditions: string[] = [
        `komunitas_id.eq.${validKomId}`,
      ];

      if (numToken) {
        // Jika PAUD memiliki nomor cabang (contoh: "I", "II", "1", "2"):
        // JANGAN gunakan trailing wildcard '%' langsung di belakang nomor cabang,
        // karena '%...I%' di SQL LIKE akan mencocokkan cabang IV, IX, XI, XII, XIII, II, III, dst.
        const numTokenLower = numToken.toLowerCase();
        const romanToArabic: Record<string, string> = {
          i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6",
          vii: "7", viii: "8", ix: "9", x: "10", xi: "11", xii: "12", xiii: "13"
        };
        const arabicToRoman: Record<string, string> = {
          "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V", "6": "VI",
          "7": "VII", "8": "VIII", "9": "IX", "10": "X", "11": "XI", "12": "XII", "13": "XIII"
        };

        const arabNum = romanToArabic[numTokenLower];
        const romanNum = arabicToRoman[numTokenLower];

        for (const phrase of validPhrases) {
          if (extractSchoolNumberToken(phrase)) {
            orConditions.push(`nama_sekolah.ilike.${phrase}`);
            orConditions.push(`nama_sekolah.ilike.%${phrase}`);
            orConditions.push(`nama_sekolah.ilike.%${phrase} %`);

            if (arabNum) {
              const phraseArab = phrase.replace(new RegExp(`\\b${numToken}\\b`, "i"), arabNum);
              orConditions.push(`nama_sekolah.ilike.${phraseArab}`);
              orConditions.push(`nama_sekolah.ilike.%${phraseArab}`);
              orConditions.push(`nama_sekolah.ilike.%${phraseArab} %`);
            }
            if (romanNum) {
              const phraseRoman = phrase.replace(new RegExp(`\\b${numToken}\\b`, "i"), romanNum);
              orConditions.push(`nama_sekolah.ilike.${phraseRoman}`);
              orConditions.push(`nama_sekolah.ilike.%${phraseRoman}`);
              orConditions.push(`nama_sekolah.ilike.%${phraseRoman} %`);
            }
          } else {
            // Frasa tanpa nomor cabang (misal nama dasar tanpa kelurahan)
            orConditions.push(`nama_sekolah.ilike.%${phrase}%`);
          }
        }
      } else {
        // Sekolah tanpa nomor cabang (misal: "TK Pembina", "KB Kartini", dsb.)
        for (const phrase of validPhrases) {
          orConditions.push(`nama_sekolah.ilike.%${phrase}%`);
        }
      }

      let query = supabase
        .from("data_anak")
        .select(selectFields)
        .order("created_at", { ascending: false });

      if (orConditions.length > 0) {
        query = query.or(orConditions.join(","));
      } else {
        query = query.eq("komunitas_id", validKomId);
      }

      const { data: paudDirect, error: paudDirectError } = await query.limit(3000);

      if (paudDirectError) {
        childError = paudDirectError;
      } else if (paudDirect) {
        dbChildren = paudDirect;
      }
    } else {
      // Komunitas Posyandu, Warga Kita, SPM: filter targeted per komunitas_id, kelurahan, atau kecamatan
      const targetKel = targetKomunitas?.kelurahan && targetKomunitas.kelurahan !== "semua" && targetKomunitas.kelurahan !== "Semua Kelurahan"
        ? targetKomunitas.kelurahan
        : null;
      const targetKec = targetKomunitas?.kecamatan && targetKomunitas.kecamatan !== "semua" && targetKomunitas.kecamatan !== "Kota Tegal"
        ? targetKomunitas.kecamatan
        : null;

      let directQuery = supabase
        .from("data_anak")
        .select(selectFields)
        .order("created_at", { ascending: false });

      if (targetKel) {
        directQuery = directQuery.or(`komunitas_id.eq.${validKomId},alasan_sekolah.ilike.%${targetKel}%`).limit(1500);
      } else if (targetKec) {
        directQuery = directQuery.or(`komunitas_id.eq.${validKomId},alasan_sekolah.ilike.%${targetKec}%`).limit(3000);
      } else {
        directQuery = directQuery.limit(5000);
      }

      const { data: directData, error: directErr } = await directQuery;
      if (directErr) {
        childError = directErr;
      } else if (directData && directData.length > 0) {
        dbChildren = directData;
      }
    }

    if (childError) {
      console.warn("Query data_anak error:", childError.message);
      return {
        success: false,
        message: "Gagal memuat data anak: " + childError.message,
        data: [],
        stats: { total: 0, approved: 0, pending: 0 },
        canViewDetail: false,
        isAuthenticated,
        canValidate,
        canEditDdks,
        canCreate,
        canEdit,
        canDelete,
        isReadOnly,
        userRole,
      };
    }

    // Filter ketat: Hanya data anak balita / PAUD (0–6 Tahun) yang BUKAN data ATS dan BUKAN data dummy
    const nonAtsChildren = (dbChildren || []).filter(
      (row: any) => !isDataAtsRecord(row) && !isDummyDataAnak(row)
    );

    if (!nonAtsChildren || nonAtsChildren.length === 0) {
      return {
        success: true,
        data: [],
        stats: { total: 0, approved: 0, pending: 0 },
        canViewDetail,
        isAuthenticated,
        canValidate,
        canEditDdks,
        canCreate,
        canEdit,
        canDelete,
        isReadOnly,
        userRole,
      };
    }

    // 4. Format dan filter data_anak sesuai hierarki & interoperabilitas wilayah
    if (options?.countOnly) {
      const items: DataAnakItem[] = nonAtsChildren
        .map((row: any) => {
          const parsed = parseDataAnakDetails(
            row.alasan_sekolah,
            targetKomunitas || { id: row.komunitas_id }
          );

          return {
            id: row.id,
            nama_lengkap: row.nama_lengkap,
            tanggal_lahir: row.tanggal_lahir || "",
            jenis_kelamin: row.jenis_kelamin || "L",
            nama_orangtua: row.nama_orangtua || "",
            nomor_hp: row.nomor_hp || "",
            tinggal_bersama: row.tinggal_bersama || "Orang Tua",
            jarak_rumah_km: row.jarak_rumah_km || 0,
            is_sekolah: row.is_sekolah ?? true,
            nama_sekolah: row.nama_sekolah || "",
            alasan_sekolah: parsed.alasan,
            kk_kabupaten: parsed.kkKabupaten,
            kk_kecamatan: parsed.kkKecamatan,
            kk_kelurahan: parsed.kkKelurahan,
            kk_rw: parsed.kkRw,
            kk_rt: parsed.kkRt,
            kk_jalan: parsed.kkJalan,
            domisili_kabupaten: parsed.domisiliKabupaten,
            domisili_kecamatan: parsed.domisiliKecamatan,
            domisili_kelurahan: parsed.domisiliKelurahan,
            domisili_rw: parsed.domisiliRw,
            domisili_rt: parsed.domisiliRt,
            domisili_jalan: parsed.domisiliJalan,
            komunitas_id: row.komunitas_id,
            status_approval: row.status_approval || "pending",
            validated_by: row.validated_by,
            validated_at: row.validated_at,
            is_updated_by_paud: Boolean(row.is_updated_by_paud),
            terakhir_diperbarui_at: row.terakhir_diperbarui_at,
            diperbarui_oleh: row.diperbarui_oleh,
            created_by: row.created_by,
            created_at: row.created_at,
            latest_ddks: null,
            ddks_history: [],
          };
        })
        .filter((item) => {
          return isDataAnakMatchingKomunitas(
            item,
            targetKomunitas,
            targetMeta,
            validKomId
          );
        });

      // Deduplikasi murid: utamakan record yang sudah approved / terverifikasi agar tidak menggandakan data
      const dedupedCountMap = new Map<string, DataAnakItem>();
      items.forEach((item) => {
        const key = (item.nama_lengkap || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
        if (!key) return;
        const existing = dedupedCountMap.get(key);
        if (!existing) {
          dedupedCountMap.set(key, item);
        } else {
          if (item.status_approval === "approved" && existing.status_approval !== "approved") {
            dedupedCountMap.set(key, item);
          } else if (new Date(item.created_at).getTime() > new Date(existing.created_at).getTime() && existing.status_approval !== "approved") {
            dedupedCountMap.set(key, item);
          }
        }
      });
      const finalCountItems = Array.from(dedupedCountMap.values());

      const totalCount = finalCountItems.length;
      const approvedCount = finalCountItems.filter((c) => c.status_approval === "approved").length;
      const pendingCount = totalCount - approvedCount;

      return {
        success: true,
        data: finalCountItems,
        stats: {
          total: totalCount,
          approved: approvedCount,
          pending: pendingCount,
        },
        canViewDetail,
        isAuthenticated,
        canValidate,
        canEditDdks,
        canCreate: canViewDetail ? canCreate : false,
        canEdit: canViewDetail ? canEdit : false,
        canDelete: canViewDetail ? canDelete : false,
        isReadOnly,
        userRole,
      };
    }

    const childKomIds = [...new Set(dbChildren.map((c: any) => c.komunitas_id).filter(Boolean))];
    const missingKomIds = childKomIds.filter((cid: string) => !findOrGenerateKomunitasSeed(cid));
    const { data: missingDbKoms } = missingKomIds.length > 0
      ? await supabase.from("komunitas").select("id, nama, jenis, kecamatan, kelurahan, rw, rt").in("id", missingKomIds)
      : { data: [] };
    const dbKomMap = new Map((missingDbKoms || []).map((k: any) => [k.id, k]));

    const items: DataAnakItem[] = nonAtsChildren
      .map((row: any) => {
        const records: DdksRecord[] = (row.ddks_records || []).map((r: any) => ({
          ...r,
          recorded_by: r.recorded_by || r.dicatat_oleh || r.created_by || r.user_id,
        })).sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const childKomObj =
          dbKomMap.get(row.komunitas_id) ||
          findOrGenerateKomunitasSeed(row.komunitas_id) || {
            id: row.komunitas_id,
          };
        const parsed = parseDataAnakDetails(row.alasan_sekolah, childKomObj);

        return {
          id: row.id,
          nama_lengkap: canViewDetail ? row.nama_lengkap : (row.nama_lengkap ? row.nama_lengkap.slice(0, 1) + "***" : "Anak"),
          tanggal_lahir: row.tanggal_lahir,
          jenis_kelamin: row.jenis_kelamin,
          nama_orangtua: canViewDetail ? row.nama_orangtua : null,
          nomor_hp: canViewDetail ? row.nomor_hp : null,
          tinggal_bersama: canViewDetail ? row.tinggal_bersama : null,
          jarak_rumah_km: row.jarak_rumah_km,
          is_sekolah: row.is_sekolah,
          nama_sekolah: row.nama_sekolah,
          alasan_sekolah: canViewDetail ? parsed.alasan : null,
          kk_kabupaten: parsed.kkKabupaten,
          kk_kecamatan: parsed.kkKecamatan,
          kk_kelurahan: parsed.kkKelurahan,
          kk_rw: canViewDetail ? parsed.kkRw : null,
          kk_rt: canViewDetail ? parsed.kkRt : null,
          kk_jalan: canViewDetail ? parsed.kkJalan : null,
          domisili_kabupaten: parsed.domisiliKabupaten,
          domisili_kecamatan: parsed.domisiliKecamatan,
          domisili_kelurahan: parsed.domisiliKelurahan,
          domisili_rw: canViewDetail ? parsed.domisiliRw : null,
          domisili_rt: canViewDetail ? parsed.domisiliRt : null,
          domisili_jalan: canViewDetail ? parsed.domisiliJalan : null,
          komunitas_id: row.komunitas_id,
          status_approval: row.status_approval || "pending",
          validated_by: canViewDetail ? row.validated_by : null,
          validated_at: canViewDetail ? row.validated_at : null,
          is_updated_by_paud: Boolean(row.is_updated_by_paud),
          terakhir_diperbarui_at: canViewDetail ? row.terakhir_diperbarui_at : null,
          diperbarui_oleh: canViewDetail ? row.diperbarui_oleh : null,
          created_by: canViewDetail ? row.created_by : null,
          created_at: row.created_at,
          latest_ddks: canViewDetail ? (records[0] || null) : null,
          ddks_history: canViewDetail ? records : [],
        };
      })
      .filter((item) => {
        return isDataAnakMatchingKomunitas(
          item,
          targetKomunitas,
          targetMeta,
          validKomId
        );
      });

    // Deduplikasi murid: utamakan record yang sudah approved / terverifikasi agar tidak menggandakan data
    const dedupedItemMap = new Map<string, DataAnakItem>();
    items.forEach((item) => {
      const key = (item.nama_lengkap || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      if (!key) return;
      const existing = dedupedItemMap.get(key);
      if (!existing) {
        dedupedItemMap.set(key, item);
      } else {
        if (item.status_approval === "approved" && existing.status_approval !== "approved") {
          dedupedItemMap.set(key, item);
        } else if (new Date(item.created_at).getTime() > new Date(existing.created_at).getTime() && existing.status_approval !== "approved") {
          dedupedItemMap.set(key, item);
        }
      }
    });
    const finalItems = Array.from(dedupedItemMap.values());

    const totalCount = finalItems.length;
    const approvedCount = finalItems.filter((c) => c.status_approval === "approved").length;
    const pendingCount = totalCount - approvedCount;

    return {
      success: true,
      data: finalItems,
      stats: {
        total: totalCount,
        approved: approvedCount,
        pending: pendingCount,
      },
      canViewDetail,
      isAuthenticated,
      canValidate,
      canEditDdks,
      canCreate: canViewDetail ? canCreate : false,
      canEdit: canViewDetail ? canEdit : false,
      canDelete: canViewDetail ? canDelete : false,
      isReadOnly,
      userRole,
    };
  } catch (err: any) {
    console.error("Error getDataAnakByKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat data anak.",
      data: [],
      stats: { total: 0, approved: 0, pending: 0 },
      canViewDetail: false,
      isAuthenticated: false,
      canValidate: false,
      canEditDdks: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      isReadOnly: true,
      userRole: "Pengunjung",
    };
  }
}

/**
 * Server Action: Mengubah / Memperbarui Data Anak (Khusus Komunitas PAUD / Pengurus / Pembuat Data)
 */
export async function updateDataAnak(
  dataAnakId: string,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: DataAnakItem;
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
        message: "Silakan masuk terlebih dahulu untuk mengubah data anak.",
      };
    }

    const komunitasId = formData.get("komunitasId")?.toString();
    const jenisKomunitas = (formData.get("jenisKomunitas")?.toString() ||
      "satuan_paud") as JenisKomunitas;
    const komunitasNama = formData.get("komunitasNama")?.toString() || "";

    if (!komunitasId) {
      return {
        success: false,
        message: "Komunitas tujuan tidak valid.",
      };
    }

    // Ambil data anak target
    const { data: existingChild, error: fetchError } = await supabase
      .from("data_anak")
      .select("id, created_by, komunitas_id, alasan_sekolah")
      .eq("id", dataAnakId)
      .maybeSingle();

    if (fetchError || !existingChild) {
      return {
        success: false,
        message: "Data anak tidak ditemukan atau telah dihapus.",
      };
    }

    // Cek otorisasi user
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperOrPusat = isSuperOrAdminPusat({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });
    const isCreator = existingChild.created_by === user.id;

    if (!isSuperOrPusat && !isCreator) {
      const { data: membership } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", toValidUUID(komunitasId))
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (membership?.peran || "").toLowerCase();
      const isAuthorized =
        roleLower.includes("admin") ||
        roleLower.includes("kepala") ||
        roleLower.includes("guru") ||
        roleLower.includes("pendidik") ||
        roleLower.includes("tutor") ||
        roleLower.includes("pengelola") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("pimpinan") ||
        roleLower.includes("kader");

      if (!isAuthorized) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Admin, Kepala Sekolah, Guru/Pendidik PAUD, atau penginput data yang dapat mengubah data anak.",
        };
      }
    }

    const namaLengkap = formData.get("namaLengkap")?.toString() || "";
    const usia = formData.get("usia")?.toString() || "";
    const tanggalLahirInput = formData.get("tanggalLahir")?.toString() || "";
    const tanggalLahir = parseUsiaToDate(usia, tanggalLahirInput);
    const jenisKelamin = formData.get("jenisKelamin")?.toString() || "L";
    const namaOrangtua = formData.get("namaOrangtua")?.toString() || "";
    const nomorHp = formData.get("nomorHp")?.toString() || "";
    const tinggalBersama = formData.get("tinggalBersama")?.toString() || "Orang Tua";
    const jarakRumahKm = parseFloat(
      formData.get("jarakRumahKm")?.toString() || "0"
    );

    // Alamat Sesuai KK
    const kkKabupaten = formData.get("kkKabupaten")?.toString()?.trim() || "Kota Tegal";
    const kkKecamatan = formData.get("kkKecamatan")?.toString()?.trim() || "";
    const kkKelurahan = formData.get("kkKelurahan")?.toString()?.trim() || "";
    const kkRw = formData.get("kkRw")?.toString()?.trim() || "";
    const kkRt = formData.get("kkRt")?.toString()?.trim() || "";
    const kkJalan = formData.get("kkJalan")?.toString()?.trim() || "";

    // Alamat Domisili
    const domisiliKabupaten =
      formData.get("domisiliKabupaten")?.toString()?.trim() || "Kota Tegal";
    const domisiliKecamatan = formData.get("domisiliKecamatan")?.toString()?.trim() || "";
    const domisiliKelurahan = formData.get("domisiliKelurahan")?.toString()?.trim() || "";
    const domisiliRw = formData.get("domisiliRw")?.toString()?.trim() || "";
    const domisiliRt = formData.get("domisiliRt")?.toString()?.trim() || "";
    const domisiliJalan = formData.get("domisiliJalan")?.toString()?.trim() || "";

    // Verifikasi jenis komunitas dari database: Satuan PAUD, PKBM Star of Tomorrow, dan SKB Kota Tegal berhak mengelola peserta didik PAUD
    const validKomId = toValidUUID(komunitasId);
    const { data: dbKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, jenis_institusi")
      .eq("id", validKomId)
      .maybeSingle();

    const isPaudKomunitas = isKomunitasLayananPaud(dbKom, komunitasNama, jenisKomunitas);

    const isSekolah = isPaudKomunitas;
    const namaSekolah = isPaudKomunitas
      ? (dbKom?.nama || komunitasNama || "Satuan PAUD")
      : "Belum Sekolah";
    let rawAlasanSekolah = formData.get("alasanSekolah")?.toString()?.trim() || "";

    if (isPaudKomunitas) {
      if (!rawAlasanSekolah) {
        rawAlasanSekolah = "Sudah Usia PAUD";
      }
    } else {
      if (!rawAlasanSekolah) {
        rawAlasanSekolah = "Belum Wajib (Masih Balita)";
      }
    }

    // Serialisasi Alamat KK & Domisili ke dalam alasan_sekolah
    const formattedAlasan = serializeDataAnakAlasan({
      alasanSekolah: rawAlasanSekolah,
      kkKabupaten,
      kkKecamatan,
      kkKelurahan,
      kkRw,
      kkRt,
      kkJalan,
      domisiliKabupaten,
      domisiliKecamatan,
      domisiliKelurahan,
      domisiliRw,
      domisiliRt,
      domisiliJalan,
    });

    // Validasi Zod Data Anak
    const validationResult = DataAnakSchema.safeParse({
      namaLengkap,
      usia,
      tanggalLahir,
      jenisKelamin,
      namaOrangtua,
      nomorHp,
      tinggalBersama,
      jarakRumahKm,
      isSekolah,
      namaSekolah,
      alasanSekolah: formattedAlasan,
      kkKabupaten,
      kkKecamatan,
      kkKelurahan,
      kkRw,
      kkRt,
      kkJalan,
      domisiliKabupaten,
      domisiliKecamatan,
      domisiliKelurahan,
      domisiliRw,
      domisiliRt,
      domisiliJalan,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message;
      return {
        success: false,
        message: firstError || "Periksa kembali kelengkapan data anak.",
      };
    }

    const validasiSekarang =
      formData.get("validasiSekarang")?.toString() === "true" ||
      formData.get("validasiSekarang")?.toString() === "1";

    const updatePayload: Record<string, any> = {
      nama_lengkap: namaLengkap,
      tanggal_lahir: tanggalLahir,
      jenis_kelamin: jenisKelamin,
      nama_orangtua: namaOrangtua,
      nomor_hp: nomorHp,
      tinggal_bersama: tinggalBersama,
      jarak_rumah_km: jarakRumahKm,
      is_sekolah: isSekolah,
      nama_sekolah: namaSekolah,
      alasan_sekolah: formattedAlasan,
      updated_at: new Date().toISOString(),
      is_updated_by_paud: true,
      terakhir_diperbarui_at: new Date().toISOString(),
      diperbarui_oleh: user.id,
      ...(validasiSekarang
        ? {
            status_approval: "approved",
            validated_by: user.id,
            validated_at: new Date().toISOString(),
          }
        : {}),
    };

    const { data: updatedChild, error: updateError } = await supabase
      .from("data_anak")
      .update(updatePayload)
      .eq("id", dataAnakId)
      .select("*")
      .single();

    if (updateError || !updatedChild) {
      return {
        success: false,
        message:
          "Gagal memperbarui data anak: " +
          (updateError?.message || "Kesalahan database"),
      };
    }

    // Pastikan validator/editor otomatis tercatat di anggota_komunitas PAUD jika belum ada
    const targetPaudId = updatedChild.komunitas_id || (komunitasId ? toValidUUID(komunitasId) : null);
    if (targetPaudId && user?.id) {
      try {
        await supabase.from("anggota_komunitas").upsert(
          {
            komunitas_id: targetPaudId,
            user_id: user.id,
            peran: "Pendidik",
            status: "approved",
          },
          { onConflict: "komunitas_id,user_id", ignoreDuplicates: true }
        );
      } catch (e) {
        // Non-blocking
      }
    }

    revalidatePath(`/komunitas/${komunitasId}/data`);
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/cek-progres");
    revalidatePath("/komunitas");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/");

    const parsedUpdated = parseDataAnakDetails(updatedChild.alasan_sekolah);

    return {
      success: true,
      message: validasiSekarang
        ? "Data anak berhasil disimpan dan divalidasi!"
        : "Data anak berhasil diperbarui!",
      data: {
        id: updatedChild.id,
        nama_lengkap: updatedChild.nama_lengkap,
        tanggal_lahir: updatedChild.tanggal_lahir,
        jenis_kelamin: updatedChild.jenis_kelamin,
        nama_orangtua: updatedChild.nama_orangtua,
        nomor_hp: updatedChild.nomor_hp,
        tinggal_bersama: updatedChild.tinggal_bersama,
        jarak_rumah_km: updatedChild.jarak_rumah_km,
        is_sekolah: updatedChild.is_sekolah,
        nama_sekolah: updatedChild.nama_sekolah,
        alasan_sekolah: parsedUpdated.alasan,
        kk_kabupaten: parsedUpdated.kkKabupaten,
        kk_kecamatan: parsedUpdated.kkKecamatan,
        kk_kelurahan: parsedUpdated.kkKelurahan,
        kk_rw: parsedUpdated.kkRw,
        kk_rt: parsedUpdated.kkRt,
        kk_jalan: parsedUpdated.kkJalan,
        domisili_kabupaten: parsedUpdated.domisiliKabupaten,
        domisili_kecamatan: parsedUpdated.domisiliKecamatan,
        domisili_kelurahan: parsedUpdated.domisiliKelurahan,
        domisili_rw: parsedUpdated.domisiliRw,
        domisili_rt: parsedUpdated.domisiliRt,
        domisili_jalan: parsedUpdated.domisiliJalan,
        komunitas_id: updatedChild.komunitas_id,
        status_approval: updatedChild.status_approval || "pending",
        validated_by: updatedChild.validated_by,
        validated_at: updatedChild.validated_at,
        is_updated_by_paud: Boolean(updatedChild.is_updated_by_paud),
        terakhir_diperbarui_at: updatedChild.terakhir_diperbarui_at,
        diperbarui_oleh: updatedChild.diperbarui_oleh,
        created_by: updatedChild.created_by,
        created_at: updatedChild.created_at,
      },
    };
  } catch (err: any) {
    console.error("Error updateDataAnak:", err);
    return {
      success: false,
      message: err.message || "Gagal memperbarui data anak.",
    };
  }
}

/**
 * Server Action: Mencatat Status Keluar Anak dari Satuan PAUD
 * Alasan: Melanjutkan Ke SD, Pindah PAUD Lain, Tidak Sekolah, Meninggal Dunia
 */
export async function keluarDataAnak(
  dataAnakId: string,
  komunitasId: string,
  payload: {
    alasanKeluar: string;
    catatan?: string;
  }
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
        message: "Silakan masuk terlebih dahulu untuk memproses status anak keluar.",
      };
    }

    if (!payload.alasanKeluar) {
      return {
        success: false,
        message: "Pilih alasan keluar anak dari PAUD.",
      };
    }

    // Ambil data anak target
    const { data: existingChild, error: fetchError } = await supabase
      .from("data_anak")
      .select("id, nama_lengkap, created_by, komunitas_id")
      .eq("id", dataAnakId)
      .maybeSingle();

    if (fetchError || !existingChild) {
      return {
        success: false,
        message: "Data anak tidak ditemukan atau telah dihapus.",
      };
    }

    // Cek otorisasi user
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperOrPusat = isSuperOrAdminPusat({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });
    const isCreator = existingChild.created_by === user.id;

    if (!isSuperOrPusat && !isCreator) {
      const { data: membership } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", toValidUUID(komunitasId))
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (membership?.peran || "").toLowerCase();
      const isAuthorized =
        roleLower.includes("admin") ||
        roleLower.includes("kepala") ||
        roleLower.includes("guru") ||
        roleLower.includes("pendidik") ||
        roleLower.includes("tutor") ||
        roleLower.includes("pengelola") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("pimpinan") ||
        roleLower.includes("kader");

      if (!isAuthorized) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Admin, Kepala Sekolah, Guru/Pendidik PAUD, atau penginput data yang dapat mencatat anak keluar.",
        };
      }
    }

    // Hapus records DDKS terlebih dahulu untuk integritas foreign key
    await supabase
      .from("ddks_records")
      .delete()
      .eq("data_anak_id", dataAnakId);

    // Hapus record data_anak dari database satuan PAUD
    const { error: deleteError } = await supabase
      .from("data_anak")
      .delete()
      .eq("id", dataAnakId);

    if (deleteError) {
      return {
        success: false,
        message:
          "Gagal memproses anak keluar: " +
          (deleteError?.message || "Kesalahan database"),
      };
    }

    revalidatePath(`/komunitas/${komunitasId}/data`);
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/");

    return {
      success: true,
      message: `Anak berhasil dicatat keluar dengan alasan "${payload.alasanKeluar}".`,
    };
  } catch (err: any) {
    console.error("Error keluarDataAnak:", err);
    return {
      success: false,
      message: err.message || "Gagal memproses data anak keluar.",
    };
  }
}

/**
 * Server Action: Menghapus Data Anak secara permanen
 */
export async function deleteDataAnak(
  dataAnakId: string,
  komunitasId?: string
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
        message: "Silakan masuk terlebih dahulu untuk menghapus data anak.",
      };
    }

    const { data: existingChild, error: fetchError } = await supabase
      .from("data_anak")
      .select("id, nama_lengkap, created_by, komunitas_id")
      .eq("id", dataAnakId)
      .maybeSingle();

    if (fetchError || !existingChild) {
      return {
        success: false,
        message: "Data anak tidak ditemukan atau sudah dihapus.",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperOrPusat = isSuperOrAdminPusat({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    });
    const isCreator = existingChild.created_by === user.id;

    if (!isSuperOrPusat && !isCreator) {
      const { data: membership } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", existingChild.komunitas_id)
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (membership?.peran || "").toLowerCase();
      const isAuthorized =
        roleLower.includes("admin") ||
        roleLower.includes("kepala") ||
        roleLower.includes("guru") ||
        roleLower.includes("pendidik") ||
        roleLower.includes("tutor") ||
        roleLower.includes("pengelola") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("pimpinan") ||
        roleLower.includes("kader");

      if (!isAuthorized) {
        return {
          success: false,
          message: "Akses ditolak: Anda tidak memiliki izin untuk menghapus data anak ini.",
        };
      }
    }

    // Hapus records DDKS terlebih dahulu
    try {
      await supabase
        .from("ddks_records")
        .delete()
        .eq("data_anak_id", dataAnakId);
    } catch (e) {
      console.warn("Hapus ddks_records warning:", e);
    }

    // Hapus record data_anak
    const { error: deleteError } = await supabase
      .from("data_anak")
      .delete()
      .eq("id", dataAnakId);

    if (deleteError) {
      return {
        success: false,
        message: "Gagal menghapus data anak: " + deleteError.message,
      };
    }

    const targetKomunitasId = komunitasId || existingChild.komunitas_id;
    revalidatePath(`/komunitas/${targetKomunitasId}/data`);
    revalidatePath(`/komunitas/${targetKomunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/");

    return {
      success: true,
      message: `Data anak ${existingChild.nama_lengkap} berhasil dihapus dari sistem.`,
    };
  } catch (err: any) {
    console.error("Error deleteDataAnak:", err);
    return {
      success: false,
      message: err.message || "Terjadi kendala saat menghapus data anak.",
    };
  }
}



