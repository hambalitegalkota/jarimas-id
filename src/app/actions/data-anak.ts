"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { DataAnakSchema, DdksSchema } from "@/lib/zod-schemas";
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

    // DDKS Awal Parameter
    const beratBadanStr = formData.get("beratBadan")?.toString();
    const tinggiBadanStr = formData.get("tinggiBadan")?.toString();
    const panjangBadanStr = formData.get("panjangBadan")?.toString();
    const lingkarKepalaStr = formData.get("lingkarKepala")?.toString();
    const catatanDdks = formData.get("catatanDdks")?.toString()?.trim() || "";

    const hasDdksInput =
      beratBadanStr && tinggiBadanStr && lingkarKepalaStr;

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

    // Simpan DDKS awal jika diisi dan khusus di Komunitas Posyandu
    if (hasDdksInput && jenisKomunitas === "posyandu") {
      const ddksValidation = DdksSchema.safeParse({
        beratBadan: parseFloat(beratBadanStr),
        tinggiBadan: parseFloat(tinggiBadanStr),
        panjangBadan: panjangBadanStr ? parseFloat(panjangBadanStr) : null,
        lingkarKepala: parseFloat(lingkarKepalaStr),
      });

      if (ddksValidation.success) {
        const ddksPayload: any = {
          data_anak_id: newChildId,
          berat_badan: parseFloat(beratBadanStr || "0"),
          tinggi_badan: parseFloat(tinggiBadanStr || "0"),
          panjang_badan: panjangBadanStr ? parseFloat(panjangBadanStr) : null,
          lingkar_kepala: parseFloat(lingkarKepalaStr || "0"),
          catatan: catatanDdks || "Pengukuran awal pendaftaran anak.",
          dicatat_oleh: user.id,
          recorded_by: user.id,
          created_at: new Date().toISOString(),
        };

        const { error: ddksError } = await supabase
          .from("ddks_records")
          .insert(ddksPayload);

        if (ddksError) {
          if (ddksError.message.includes("recorded_by")) {
            delete ddksPayload.recorded_by;
            await supabase.from("ddks_records").insert(ddksPayload);
          } else if (ddksError.message.includes("dicatat_oleh")) {
            delete ddksPayload.dicatat_oleh;
            await supabase.from("ddks_records").insert(ddksPayload);
          } else {
            console.warn("Insert ddks_records warning:", ddksError.message);
          }
        }
      }
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
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const isAuthorizedValidator = (memberships || []).some((m: any) => {
        const role = (m.peran || "").toLowerCase();
        return (
          role.includes("kader") ||
          role.includes("pengurus") ||
          role.includes("nakes") ||
          role.includes("medis") ||
          role.includes("bidan") ||
          role.includes("admin")
        );
      });

      if (!isAuthorizedValidator) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Kader Posyandu atau Pengurus RT yang dapat memvalidasi data anak.",
        };
      }
    }

    // Perbarui status approval di database
    const { error: updateError } = await supabase
      .from("data_anak")
      .update({
        status_approval: "approved",
        validated_by: user.id,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", dataAnakId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal memvalidasi data: " + updateError.message,
      };
    }

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
export async function addDdksRecord(formData: FormData): Promise<{
  success: boolean;
  message: string;
  record?: DdksRecord;
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

    const dataAnakId = formData.get("dataAnakId")?.toString();
    const beratBadan = parseFloat(formData.get("beratBadan")?.toString() || "0");
    const tinggiBadan = parseFloat(formData.get("tinggiBadan")?.toString() || "0");
    const panjangBadan = formData.get("panjangBadan")
      ? parseFloat(formData.get("panjangBadan")!.toString())
      : null;
    const lingkarKepala = parseFloat(
      formData.get("lingkarKepala")?.toString() || "0"
    );
    const catatan = formData.get("catatan")?.toString()?.trim() || "";

    if (!dataAnakId) {
      return {
        success: false,
        message: "ID Data Anak tidak ditemukan.",
      };
    }

    // Validasi Zod DDKS
    const validation = DdksSchema.safeParse({
      beratBadan,
      tinggiBadan,
      panjangBadan,
      lingkarKepala,
    });

    if (!validation.success) {
      return {
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Data pengukuran DDKS tidak valid.",
      };
    }

    // Verifikasi otorisasi Kader/Nakes
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
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const isKaderOrNakes = (memberships || []).some((m: any) => {
        const role = (m.peran || "").toLowerCase();
        return (
          role.includes("kader") ||
          role.includes("medis") ||
          role.includes("nakes") ||
          role.includes("bidan") ||
          role.includes("pengurus")
        );
      });

      if (!isKaderOrNakes) {
        return {
          success: false,
          message:
            "Akses ditolak: Penginputan DDKS hanya dapat dilakukan oleh Kader Posyandu atau Tenaga Kesehatan.",
        };
      }
    }

    const payload: any = {
      data_anak_id: dataAnakId,
      berat_badan: beratBadan,
      tinggi_badan: tinggiBadan,
      panjang_badan: panjangBadan,
      lingkar_kepala: lingkarKepala,
      catatan: catatan || "Pengukuran rutin DDKS Posyandu.",
      dicatat_oleh: user.id,
      recorded_by: user.id,
      created_at: new Date().toISOString(),
    };

    let insertedRecord: any = null;
    let insertError: any = null;

    const res1 = await supabase
      .from("ddks_records")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (res1.error) {
      if (res1.error.message.includes("recorded_by")) {
        const payloadOnlyDicatatOleh = { ...payload };
        delete payloadOnlyDicatatOleh.recorded_by;
        const res2 = await supabase
          .from("ddks_records")
          .insert(payloadOnlyDicatatOleh)
          .select("*")
          .maybeSingle();
        insertedRecord = res2.data;
        insertError = res2.error;
      } else if (res1.error.message.includes("dicatat_oleh")) {
        const payloadOnlyRecordedBy = { ...payload };
        delete payloadOnlyRecordedBy.dicatat_oleh;
        const res3 = await supabase
          .from("ddks_records")
          .insert(payloadOnlyRecordedBy)
          .select("*")
          .maybeSingle();
        insertedRecord = res3.data;
        insertError = res3.error;
      } else {
        insertError = res1.error;
      }
    } else {
      insertedRecord = res1.data;
    }

    if (insertError || !insertedRecord) {
      return {
        success: false,
        message:
          "Gagal menyimpan DDKS: " +
          (insertError?.message || "Kesalahan database"),
      };
    }

    revalidatePath("/komunitas");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/");
    return {
      success: true,
      message: "Catatan pengukuran DDKS berhasil disimpan!",
      record: {
        ...insertedRecord,
        profiles: { nama_lengkap: profile?.nama_lengkap || "Kader Posyandu" },
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menyimpan data DDKS.",
    };
  }
}

/**
 * Server Action: Mengambil Data Anak Terkait Komunitas Beserta Riwayat DDKS
 * Mendukung pemetaan lintas komunitas:
 * - Data yang di-input di PAUD akan muncul di Komunitas Kabupaten/Kota, Kecamatan, Kelurahan, RW, RT sesuai alamat KK / Domisili dan Komunitas Posyandu
 */
export async function getDataAnakByKomunitas(
  komunitasId: string,
  options?: {
    countOnly?: boolean;
    preloadedKomunitas?: any;
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
  canEditDdks: boolean;
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
        const { data: member } = await supabase
          .from("anggota_komunitas")
          .select("peran, status")
          .eq("user_id", user.id)
          .eq("komunitas_id", dbKomunitasId)
          .eq("status", "approved")
          .maybeSingle();

        userRole = member?.peran || (isSuperAdmin ? "Super Admin" : isAdminPusat ? "Admin Pusat" : "Pengunjung");
        const roleLower = (member?.peran || "").toLowerCase();
        const isAdminRole = isRoleAdmin(roleLower);

        if (isSuperOrPusat) {
          canCreate = true;
          canEdit = true;
          canDelete = true;
          canValidate = true;
          canEditDdks = true;
          isReadOnly = false;
          canViewDetail = true;
        } else if (member && member.status === "approved") {
          const cleanTargetNama = (targetKomunitas?.nama || "").toLowerCase();
          const isPkbmOrSkbTarget =
            targetJenis === "pkbm_skb" ||
            targetKomunitas?.jenis_institusi === "PKBM" ||
            targetKomunitas?.jenis_institusi === "SKB" ||
            cleanTargetNama.includes("pkbm") ||
            cleanTargetNama.includes("skb") ||
            cleanTargetNama.includes("sanggar kegiatan belajar");

          if (isKomunitasLayananPaud(targetKomunitas, targetKomunitas?.nama, targetJenis) || isPkbmOrSkbTarget) {
            // Admin, Kepala Sekolah, Guru PAUD / Tutor PKBM / Pendidik -> Full Access
            const isPaudStaff =
              isAdminRole ||
              roleLower.includes("admin") ||
              roleLower.includes("kepala") ||
              roleLower.includes("guru") ||
              roleLower.includes("pendidik") ||
              roleLower.includes("tutor") ||
              roleLower.includes("pengelola") ||
              roleLower.includes("pengurus");

            if (isPaudStaff) {
              canViewDetail = true;
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = true;
              canEditDdks = true;
              isReadOnly = false;
            } else {
              // Orangtua/Wali Murid, Komite, Alumni, Pengunjung -> Hanya Agregat
              canViewDetail = false;
              canCreate = false;
              canEdit = false;
              canDelete = false;
              canValidate = false;
              canEditDdks = false;
              isReadOnly = true;
            }
          } else if (targetJenis === "posyandu") {
            const isKader =
              isAdminRole ||
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
              canViewDetail = true;
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = true;
              canEditDdks = true;
              isReadOnly = false;
            } else {
              canViewDetail = false;
              canCreate = false;
              canEdit = false;
              canDelete = false;
              canValidate = false;
              canEditDdks = false;
              isReadOnly = true;
            }
          } else {
            // Warga Kita (RT, RW, Kelurahan, Kecamatan, Kota Tegal)
            // Ketentuan: Data lengkap hanya bisa dilihat di level RT oleh Admin Komunitas Warga Kita.
            // Di level RW, Kelurahan, Kecamatan, dan Kota Tegal hanya data rekap saja.
            const isRt = Boolean(targetMeta.hasRt);
            const isWargaAdmin =
              isAdminRole ||
              roleLower.includes("admin") ||
              roleLower.includes("pengurus") ||
              roleLower.includes("ketua");

            if (isRt && isWargaAdmin) {
              canViewDetail = true;
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = true;
              canEditDdks = true;
              isReadOnly = false;
            } else {
              // Non-admin di RT atau di level RW, Kelurahan, Kecamatan, Kota Tegal: Data rekap saja, data lengkap terkunci
              canViewDetail = false;
              canCreate = false;
              canEdit = false;
              canDelete = false;
              canValidate = false;
              canEditDdks = false;
              isReadOnly = true;
            }
          }
        }
      }
    } catch {
      // Tamu
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
      const cleanPaudName = rawPaudName
        .replace(/^(KB|TK|TPA|SPS|RA|PKBM|SKB|POS PAUD)\s+/i, "")
        .trim();

      const numToken = extractSchoolNumberToken(rawPaudName);

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

        // 1. Variasi Nama Asli (persis atau tanpa awalan TK/KB)
        if (rawPaudName) {
          orConditions.push(`nama_sekolah.ilike.${rawPaudName}`);
        }
        if (cleanPaudName) {
          orConditions.push(`nama_sekolah.ilike.%${cleanPaudName}`);
          orConditions.push(`nama_sekolah.ilike.%${cleanPaudName} %`);
        }

        // 2. Variasi Angka Arab jika tokennya Romawi
        if (arabNum) {
          const rawArab = rawPaudName.replace(new RegExp(`\\b${numToken}\\b`, "i"), arabNum);
          const cleanArab = cleanPaudName.replace(new RegExp(`\\b${numToken}\\b`, "i"), arabNum);
          if (rawArab) orConditions.push(`nama_sekolah.ilike.${rawArab}`);
          if (cleanArab) {
            orConditions.push(`nama_sekolah.ilike.%${cleanArab}`);
            orConditions.push(`nama_sekolah.ilike.%${cleanArab} %`);
          }
        }

        // 3. Variasi Angka Romawi jika tokennya Arab
        if (romanNum) {
          const rawRoman = rawPaudName.replace(new RegExp(`\\b${numToken}\\b`, "i"), romanNum);
          const cleanRoman = cleanPaudName.replace(new RegExp(`\\b${numToken}\\b`, "i"), romanNum);
          if (rawRoman) orConditions.push(`nama_sekolah.ilike.${rawRoman}`);
          if (cleanRoman) {
            orConditions.push(`nama_sekolah.ilike.%${cleanRoman}`);
            orConditions.push(`nama_sekolah.ilike.%${cleanRoman} %`);
          }
        }
      } else {
        // Sekolah tanpa nomor cabang (misal: "TK Pembina", "KB Kartini", dsb.)
        if (cleanPaudName) {
          orConditions.push(`nama_sekolah.ilike.%${cleanPaudName}%`);
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

      const { data: paudDirect, error: paudDirectError } = await query.limit(300);

      if (paudDirectError) {
        childError = paudDirectError;
      } else if (paudDirect) {
        dbChildren = paudDirect;
      }
    } else {
      // Komunitas Posyandu, Warga Kita, SPM: filter targeted per komunitas_id atau kelurahan
      const targetKel = targetKomunitas?.kelurahan && targetKomunitas.kelurahan !== "semua" && targetKomunitas.kelurahan !== "Semua Kelurahan"
        ? targetKomunitas.kelurahan
        : null;

      let directQuery = supabase
        .from("data_anak")
        .select(selectFields)
        .order("created_at", { ascending: false });

      if (targetKel) {
        directQuery = directQuery.or(`komunitas_id.eq.${validKomId},alasan_sekolah.ilike.%${targetKel}%`);
      } else {
        directQuery = directQuery.eq("komunitas_id", validKomId);
      }

      const { data: directData, error: directErr } = await directQuery.limit(200);
      if (directErr) {
        childError = directErr;
      } else if (directData && directData.length > 0) {
        dbChildren = directData;
      } else if (!targetKel) {
        // Fallback hanya jika di level kota (tanpa kelurahan), dibatasi maksimal 200 data terbaru
        const { data: fallbackChunk, error: fallbackErr } = await supabase
          .from("data_anak")
          .select(selectFields)
          .order("created_at", { ascending: false })
          .limit(200);

        if (fallbackErr) childError = fallbackErr;
        else if (fallbackChunk) dbChildren = fallbackChunk;
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

      const totalCount = items.length;
      const approvedCount = items.filter((c) => c.status_approval === "approved").length;
      const pendingCount = totalCount - approvedCount;

      return {
        success: true,
        data: items,
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
          nama_lengkap: row.nama_lengkap,
          tanggal_lahir: row.tanggal_lahir,
          jenis_kelamin: row.jenis_kelamin,
          nama_orangtua: row.nama_orangtua,
          nomor_hp: row.nomor_hp,
          tinggal_bersama: row.tinggal_bersama,
          jarak_rumah_km: row.jarak_rumah_km,
          is_sekolah: row.is_sekolah,
          nama_sekolah: row.nama_sekolah,
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
          created_by: row.created_by,
          created_at: row.created_at,
          latest_ddks: records[0] || null,
          ddks_history: records,
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

    const totalCount = items.length;
    const approvedCount = items.filter((c) => c.status_approval === "approved").length;
    const pendingCount = totalCount - approvedCount;

    return {
      success: true,
      data: items,
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

    const updatePayload = {
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

    revalidatePath(`/komunitas/${komunitasId}/data`);
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/");

    const parsedUpdated = parseDataAnakDetails(updatedChild.alasan_sekolah);

    return {
      success: true,
      message: "Data anak berhasil diperbarui!",
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



