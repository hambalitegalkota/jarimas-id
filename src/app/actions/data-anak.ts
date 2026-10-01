"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { DataAnakSchema, DdksSchema } from "@/lib/zod-schemas";
import { toValidUUID } from "@/lib/utils";
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

    // Logika Status & Alasan Sekolah sesuai tipe komunitas
    let isSekolah = formData.get("isSekolah") === "true";
    let namaSekolah = formData.get("namaSekolah")?.toString()?.trim() || "";
    let alasanSekolah = formData.get("alasanSekolah")?.toString()?.trim() || "";

    if (jenisKomunitas === "satuan_paud") {
      isSekolah = true;
      if (!namaSekolah) {
        namaSekolah = komunitasNama || "Satuan PAUD";
      }
      if (!alasanSekolah) {
        alasanSekolah = "Sudah Usia PAUD & Persiapan Ke SD";
      }
    } else {
      if (!isSekolah) {
        if (!namaSekolah) {
          namaSekolah = "Belum Sekolah";
        }
        if (!alasanSekolah) {
          alasanSekolah = "Belum Wajib";
        }
      }
    }

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
      alasanSekolah,
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
      alasan_sekolah: alasanSekolah,
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

    // Simpan DDKS awal jika diisi
    if (hasDdksInput) {
      const ddksValidation = DdksSchema.safeParse({
        beratBadan: parseFloat(beratBadanStr),
        tinggiBadan: parseFloat(tinggiBadanStr),
        panjangBadan: panjangBadanStr ? parseFloat(panjangBadanStr) : null,
        lingkarKepala: parseFloat(lingkarKepalaStr),
      });

      if (ddksValidation.success) {
        const ddksPayload = {
          data_anak_id: newChildId,
          berat_badan: parseFloat(beratBadanStr || "0"),
          tinggi_badan: parseFloat(tinggiBadanStr || "0"),
          panjang_badan: panjangBadanStr ? parseFloat(panjangBadanStr) : null,
          lingkar_kepala: parseFloat(lingkarKepalaStr || "0"),
          catatan: catatanDdks || "Pengukuran awal pendaftaran anak.",
          recorded_by: user.id,
          created_at: new Date().toISOString(),
        };

        const { error: ddksError } = await supabase
          .from("ddks_records")
          .insert(ddksPayload);

        if (ddksError) {
          console.warn("Insert ddks_records warning:", ddksError.message);
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

    const payload = {
      data_anak_id: dataAnakId,
      berat_badan: beratBadan,
      tinggi_badan: tinggiBadan,
      panjang_badan: panjangBadan,
      lingkar_kepala: lingkarKepala,
      catatan: catatan || "Pengukuran rutin DDKS Posyandu.",
      recorded_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data: insertedRecord, error: insertError } = await supabase
      .from("ddks_records")
      .insert(payload)
      .select("*")
      .single();

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
 */
export async function getDataAnakByKomunitas(komunitasId: string): Promise<{
  success: boolean;
  data: DataAnakItem[];
  canValidate: boolean;
  canEditDdks: boolean;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    let canValidate = false;
    let canEditDdks = false;

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

        const roleLower = (member?.peran || "").toLowerCase();
        const isKader =
          roleLower.includes("kader") ||
          roleLower.includes("medis") ||
          roleLower.includes("nakes") ||
          roleLower.includes("bidan");
        const isPengurus =
          roleLower.includes("pengurus") || roleLower.includes("admin");

        canValidate = isSuperAdmin || isKader || isPengurus;
        canEditDdks = isSuperAdmin || isKader;
      }
    } catch {
      // Tamu
    }

    // Query data_anak
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
        ddks_records (
          id,
          data_anak_id,
          berat_badan,
          tinggi_badan,
          panjang_badan,
          lingkar_kepala,
          catatan,
          recorded_by,
          created_at
        )
      `)
      .eq("komunitas_id", toValidUUID(komunitasId))
      .order("created_at", { ascending: false });

    if (childError) {
      console.warn("Query data_anak error:", childError.message);
      return {
        success: false,
        message: "Gagal memuat data anak: " + childError.message,
        data: [],
        canValidate,
        canEditDdks,
      };
    }

    if (!dbChildren || dbChildren.length === 0) {
      return {
        success: true,
        data: [],
        canValidate,
        canEditDdks,
      };
    }

    // Format DB results
    const items: DataAnakItem[] = dbChildren.map((row: any) => {
      const records: DdksRecord[] = (row.ddks_records || []).sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

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
        alasan_sekolah: row.alasan_sekolah,
        komunitas_id: row.komunitas_id,
        status_approval: row.status_approval || "pending",
        validated_by: row.validated_by,
        validated_at: row.validated_at,
        created_by: row.created_by,
        created_at: row.created_at,
        latest_ddks: records[0] || null,
        ddks_history: records,
      };
    });

    return {
      success: true,
      data: items,
      canValidate,
      canEditDdks,
    };
  } catch (err: any) {
    console.error("Error getDataAnakByKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat data anak.",
      data: [],
      canValidate: false,
      canEditDdks: false,
    };
  }
}
