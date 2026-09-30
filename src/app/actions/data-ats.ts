"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { DataAtsSchema, DdtkSchema } from "@/lib/zod-schemas";
import { toValidUUID } from "@/lib/utils";
import type {
  DataAtsItem,
  DdtkRecord,
  AlasanTidakSekolah,
} from "@/types/database";

/**
 * Server Action: Mendaftarkan Data Anak Tidak Sekolah (ATS) Baru
 */
export async function createDataAts(formData: FormData): Promise<{
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
        message: "Silakan masuk terlebih dahulu untuk menambahkan data ATS.",
      };
    }

    const komunitasId = formData.get("komunitasId")?.toString();
    const komunitasNama = formData.get("komunitasNama")?.toString() || "";

    if (!komunitasId) {
      return {
        success: false,
        message: "Komunitas tujuan tidak valid.",
      };
    }

    const namaLengkap = formData.get("namaLengkap")?.toString() || "";
    const tanggalLahir = formData.get("tanggalLahir")?.toString() || "";
    const jenisKelamin = formData.get("jenisKelamin")?.toString() || "L";
    const namaOrangtua = formData.get("namaOrangtua")?.toString() || "";
    const nomorHp = formData.get("nomorHp")?.toString() || "";
    const tinggalBersama = formData.get("tinggalBersama")?.toString() || "Orang Tua";

    // ATS Specific Fields
    const keinginanSekolah = (formData.get("keinginanSekolah")?.toString() || "Masih Ada") as "Masih Ada" | "Tidak Ada";
    const alasanTidakSekolah = formData.get("alasanTidakSekolah")?.toString() || "Tidak ada biaya";
    const keterangan = formData.get("keterangan")?.toString()?.trim() || "";

    // Validasi Zod Data ATS
    const validationResult = DataAtsSchema.safeParse({
      namaLengkap,
      tanggalLahir,
      jenisKelamin,
      namaOrangtua,
      nomorHp,
      tinggalBersama,
      keinginanSekolah,
      alasanTidakSekolah,
      keterangan,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message;
      return {
        success: false,
        message: firstError || "Periksa kembali kelengkapan data ATS.",
      };
    }

    // Format alasan_sekolah string untuk interoperabilitas database
    const formattedAlasan = `[KEINGINAN:${keinginanSekolah}] [ALASAN:${alasanTidakSekolah}]${
      keterangan ? ` [KET:${keterangan}]` : ""
    }`;

    // Simpan ke Supabase Data Anak
    const atsPayload = {
      nama_lengkap: namaLengkap,
      tanggal_lahir: tanggalLahir,
      jenis_kelamin: jenisKelamin,
      nama_orangtua: namaOrangtua,
      nomor_hp: nomorHp,
      tinggal_bersama: tinggalBersama,
      jarak_rumah_km: 0,
      is_sekolah: false,
      nama_sekolah: "ATS - Anak Tidak Sekolah",
      alasan_sekolah: formattedAlasan,
      komunitas_id: toValidUUID(komunitasId),
      status_approval: "pending",
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data: insertedChild, error: insertError } = await supabase
      .from("data_anak")
      .insert(atsPayload)
      .select("id")
      .single();

    if (insertError || !insertedChild) {
      return {
        success: false,
        message:
          "Gagal menyimpan data ATS ke database: " +
          (insertError?.message || "Kesalahan tidak diketahui"),
      };
    }

    const newChildId = insertedChild.id;

    // Optional: Simpan DDTK awal jika diisi
    const beratBadanStr = formData.get("beratBadan")?.toString();
    const tinggiBadanStr = formData.get("tinggiBadan")?.toString();
    const lingkarKepalaStr = formData.get("lingkarKepala")?.toString();

    if (beratBadanStr && tinggiBadanStr && lingkarKepalaStr) {
      const ddtkValidation = DdtkSchema.safeParse({
        beratBadan: parseFloat(beratBadanStr),
        tinggiBadan: parseFloat(tinggiBadanStr),
        lingkarKepala: parseFloat(lingkarKepalaStr),
      });

      if (ddtkValidation.success) {
        await supabase.from("ddks_records").insert({
          data_anak_id: newChildId,
          berat_badan: parseFloat(beratBadanStr),
          tinggi_badan: parseFloat(tinggiBadanStr),
          lingkar_kepala: parseFloat(lingkarKepalaStr),
          catatan: "Pencatatan DDTK saat pendataan awal ATS",
          recorded_by: user.id,
          created_at: new Date().toISOString(),
        });
      }
    }

    revalidatePath(`/komunitas/${komunitasId}/ats`);
    revalidatePath(`/komunitas/${komunitasId}`);

    return {
      success: true,
      message: "Data Anak Tidak Sekolah (ATS) berhasil didaftarkan dan menunggu verifikasi.",
      dataId: newChildId,
    };
  } catch (err: any) {
    console.error("Error createDataAts:", err);
    return {
      success: false,
      message: err.message || "Terjadi kendala saat menyimpan data ATS.",
    };
  }
}

/**
 * Server Action: Validasi Data ATS
 */
export async function validateDataAts(dataAtsId: string): Promise<{
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

    // Verifikasi otorisasi
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
          role.includes("admin")
        );
      });

      if (!isAuthorizedValidator) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Kader Posyandu atau Pengurus RT yang dapat memvalidasi data ATS.",
        };
      }
    }

    const { error: updateError } = await supabase
      .from("data_anak")
      .update({
        status_approval: "approved",
        validated_by: user.id,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", dataAtsId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal memvalidasi data ATS: " + updateError.message,
      };
    }

    revalidatePath("/komunitas");
    return {
      success: true,
      message: "Data ATS berhasil diverifikasi dan masuk dalam basis intervensi pendidikan.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memvalidasi data ATS.",
    };
  }
}

/**
 * Helper untuk mem-parsing alasan_sekolah format ATS
 */
function parseAtsDetails(alasanSekolahRaw?: string | null): {
  keinginan: "Masih Ada" | "Tidak Ada";
  alasan: AlasanTidakSekolah;
  keterangan: string;
} {
  const raw = alasanSekolahRaw || "";
  let keinginan: "Masih Ada" | "Tidak Ada" = "Masih Ada";
  let alasan: AlasanTidakSekolah = "Tidak ada biaya";
  let keterangan = "";

  if (raw.includes("[KEINGINAN:")) {
    const matchKeinginan = raw.match(/\[KEINGINAN:(.*?)\]/);
    if (matchKeinginan && matchKeinginan[1]) {
      keinginan = matchKeinginan[1].trim() as "Masih Ada" | "Tidak Ada";
    }
  }

  if (raw.includes("[ALASAN:")) {
    const matchAlasan = raw.match(/\[ALASAN:(.*?)\]/);
    if (matchAlasan && matchAlasan[1]) {
      alasan = matchAlasan[1].trim() as AlasanTidakSekolah;
    }
  } else if (raw && !raw.startsWith("[")) {
    alasan = raw as AlasanTidakSekolah;
  }

  if (raw.includes("[KET:")) {
    const matchKet = raw.match(/\[KET:(.*?)\]/);
    if (matchKet && matchKet[1]) {
      keterangan = matchKet[1].trim();
    }
  }

  return { keinginan, alasan, keterangan };
}

/**
 * Server Action: Mengambil Data ATS berdasarkan Komunitas
 */
export async function getDataAtsByKomunitas(komunitasId: string): Promise<{
  success: boolean;
  data: DataAtsItem[];
  canValidate: boolean;
  canEditDdtk: boolean;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    let canValidate = false;
    let canEditDdtk = false;

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
        canEditDdtk = isSuperAdmin || isKader;
      }
    } catch {
      // Tamu
    }

    // Query data ATS dari data_anak dengan filter is_sekolah = false atau nama_sekolah ATS
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
      .eq("is_sekolah", false)
      .order("created_at", { ascending: false });

    if (childError) {
      console.warn("Query data_ats error:", childError.message);
    }

    const rows = dbChildren || [];

    const items: DataAtsItem[] = rows.map((row: any) => {
      const records: DdtkRecord[] = (row.ddks_records || []).sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const parsed = parseAtsDetails(row.alasan_sekolah);

      return {
        id: row.id,
        nama_lengkap: row.nama_lengkap,
        tanggal_lahir: row.tanggal_lahir,
        jenis_kelamin: row.jenis_kelamin,
        nama_orangtua: row.nama_orangtua,
        nomor_hp: row.nomor_hp,
        tinggal_bersama: row.tinggal_bersama || "Orang Tua",
        keinginan_sekolah: parsed.keinginan,
        alasan_tidak_sekolah: parsed.alasan,
        keterangan: parsed.keterangan,
        komunitas_id: row.komunitas_id,
        status_approval: row.status_approval || "pending",
        validated_by: row.validated_by,
        validated_at: row.validated_at,
        created_by: row.created_by,
        created_at: row.created_at,
        latest_ddtk: records[0] || null,
        ddtk_history: records,
      };
    });

    return {
      success: true,
      data: items,
      canValidate,
      canEditDdtk,
    };
  } catch (err: any) {
    console.error("Error getDataAtsByKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat data ATS.",
      data: [],
      canValidate: false,
      canEditDdtk: false,
    };
  }
}
