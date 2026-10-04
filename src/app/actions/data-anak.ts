"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { DataAnakSchema, DdksSchema } from "@/lib/zod-schemas";
import { toValidUUID } from "@/lib/utils";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  serializeDataAnakAlasan,
  parseDataAnakDetails,
  isDataAnakMatchingKomunitas,
  isDataAtsRecord,
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

    // Logika Status & Alasan Sekolah sesuai tipe komunitas
    let isSekolah = jenisKomunitas === "satuan_paud";
    let namaSekolah = formData.get("namaSekolah")?.toString()?.trim() || "";
    let rawAlasanSekolah = formData.get("alasanSekolah")?.toString()?.trim() || "";

    if (jenisKomunitas === "satuan_paud") {
      isSekolah = true;
      if (!namaSekolah) {
        namaSekolah = komunitasNama || "Satuan PAUD";
      }
      if (!rawAlasanSekolah) {
        rawAlasanSekolah = "Sudah Usia PAUD";
      }
    } else {
      isSekolah = false;
      if (!namaSekolah) {
        namaSekolah = "Belum Sekolah";
      }
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
      .select("is_super_admin, nama_lengkap")
      .eq("id", user.id)
      .single();

    const isSuperAdmin = profile?.is_super_admin === true;

    if (!isSuperAdmin) {
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
      .select("is_super_admin, nama_lengkap")
      .eq("id", user.id)
      .single();

    const isSuperAdmin = profile?.is_super_admin === true;

    if (!isSuperAdmin) {
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
export async function getDataAnakByKomunitas(komunitasId: string): Promise<{
  success: boolean;
  data: DataAnakItem[];
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

    // 1. Ekstraksi metadata komunitas target
    let targetKomunitas: any = null;
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

    const targetMeta = extractKomunitasMetadata(
      targetKomunitas || { id: komunitasId }
    );
    const targetJenis = targetKomunitas?.jenis || "satuan_paud";

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_super_admin")
          .eq("id", user.id)
          .single();

        const isSuperAdmin = profile?.is_super_admin === true;

        const dbKomunitasId = toValidUUID(komunitasId);
        const { data: member } = await supabase
          .from("anggota_komunitas")
          .select("peran, status")
          .eq("user_id", user.id)
          .eq("komunitas_id", dbKomunitasId)
          .eq("status", "approved")
          .maybeSingle();

        userRole = member?.peran || (isSuperAdmin ? "Super Admin" : "Pengunjung");
        const roleLower = (member?.peran || "").toLowerCase();

        if (isSuperAdmin) {
          canCreate = true;
          canEdit = true;
          canDelete = true;
          canValidate = true;
          canEditDdks = true;
          isReadOnly = false;
        } else if (member && member.status === "approved") {
          if (targetJenis === "satuan_paud") {
            // Admin, Kepala Sekolah, Guru PAUD / Pendidik -> Full Access
            const isPaudStaff =
              roleLower.includes("admin") ||
              roleLower.includes("kepala") ||
              roleLower.includes("guru") ||
              roleLower.includes("pendidik") ||
              roleLower.includes("tutor") ||
              roleLower.includes("pengelola") ||
              roleLower.includes("pengurus");

            if (isPaudStaff) {
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = true;
              canEditDdks = true;
              isReadOnly = false;
            } else {
              // Orangtua/Wali Murid, Komite, Alumni -> Read Only
              canCreate = false;
              canEdit = false;
              canDelete = false;
              canValidate = false;
              canEditDdks = false;
              isReadOnly = true;
            }
          } else if (targetJenis === "posyandu") {
            const isKader =
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
              canCreate = true;
              canEdit = true;
              canDelete = true;
              canValidate = true;
              canEditDdks = true;
              isReadOnly = false;
            }
          } else {
            // Warga Kita (RT, RW, Kelurahan, Kecamatan)
            const isWarga =
              roleLower.includes("penduduk") ||
              roleLower.includes("pengurus") ||
              roleLower.includes("admin") ||
              roleLower.includes("kader") ||
              roleLower.includes("ketua") ||
              roleLower.includes("pendatang");

            if (isWarga) {
              canCreate = true;
              canEdit = true;
              canDelete = roleLower.includes("pengurus") || roleLower.includes("admin") || roleLower.includes("ketua");
              canValidate = roleLower.includes("pengurus") || roleLower.includes("admin") || roleLower.includes("kader") || roleLower.includes("ketua");
              canEditDdks = roleLower.includes("kader") || roleLower.includes("pengurus");
              isReadOnly = false;
            }
          }
        }
      }
    } catch {
      // Tamu
    }

    // 2. Ambil peta seluruh komunitas untuk fallback metadata
    const { data: allDbKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt");
    const dbKomMap = new Map((allDbKom || []).map((k: any) => [k.id, k]));

    // 3. Query semua data_anak dari database
    const { data: dbChildren, error: childError } = await supabase
      .from("data_anak")
      .select(`
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
      `)
      .order("created_at", { ascending: false });

    if (childError) {
      console.warn("Query data_anak error:", childError.message);
      return {
        success: false,
        message: "Gagal memuat data anak: " + childError.message,
        data: [],
        canValidate,
        canEditDdks,
        canCreate,
        canEdit,
        canDelete,
        isReadOnly,
        userRole,
      };
    }

    // Filter ketat: Hanya data anak balita / PAUD (0–6 Tahun) yang BUKAN data ATS
    const nonAtsChildren = (dbChildren || []).filter((row: any) => !isDataAtsRecord(row));

    if (!nonAtsChildren || nonAtsChildren.length === 0) {
      return {
        success: true,
        data: [],
        canValidate,
        canEditDdks,
        canCreate,
        canEdit,
        canDelete,
        isReadOnly,
        userRole,
      };
    }

    const validKomId = toValidUUID(komunitasId);

    // 4. Format dan filter data_anak sesuai hierarki & interoperabilitas wilayah
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

    return {
      success: true,
      data: items,
      canValidate,
      canEditDdks,
      canCreate,
      canEdit,
      canDelete,
      isReadOnly,
      userRole,
    };
  } catch (err: any) {
    console.error("Error getDataAnakByKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat data anak.",
      data: [],
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
      .select("is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = profile?.is_super_admin === true;
    const isCreator = existingChild.created_by === user.id;

    if (!isSuperAdmin && !isCreator) {
      const { data: membership } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", toValidUUID(komunitasId))
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (membership?.peran || "").toLowerCase();
      const isAuthorized =
        roleLower.includes("kader") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("guru") ||
        roleLower.includes("admin") ||
        roleLower.includes("pendidik");

      if (!isAuthorized) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Pengurus/Pendidik PAUD atau penginput data yang dapat mengubah data anak.",
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

    const isSekolah = jenisKomunitas === "satuan_paud";
    let namaSekolah = formData.get("namaSekolah")?.toString()?.trim() || "";
    let rawAlasanSekolah = formData.get("alasanSekolah")?.toString()?.trim() || "";

    if (jenisKomunitas === "satuan_paud") {
      if (!namaSekolah) {
        namaSekolah = komunitasNama || "Satuan PAUD";
      }
      if (!rawAlasanSekolah) {
        rawAlasanSekolah = "Sudah Usia PAUD";
      }
    } else {
      if (!namaSekolah) {
        namaSekolah = "Belum Sekolah";
      }
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
      .select("is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = profile?.is_super_admin === true;
    const isCreator = existingChild.created_by === user.id;

    if (!isSuperAdmin && !isCreator) {
      const { data: membership } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("komunitas_id", toValidUUID(komunitasId))
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (membership?.peran || "").toLowerCase();
      const isAuthorized =
        roleLower.includes("kader") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("guru") ||
        roleLower.includes("admin") ||
        roleLower.includes("pendidik");

      if (!isAuthorized) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Pengurus/Pendidik PAUD atau penginput data yang dapat mencatat anak keluar.",
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
