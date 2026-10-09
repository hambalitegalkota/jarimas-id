"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { DataAtsSchema, DdtkSchema } from "@/lib/zod-schemas";
import { toValidUUID } from "@/lib/utils";
import { normalizeKeinginanSekolah } from "@/lib/data-anak-helpers";
import { getKomunitasDetail } from "./komunitas";
import type {
  DataAtsItem,
  DdtkRecord,
  AlasanTidakSekolah,
} from "@/types/database";

/**
 * Server Action: Mendaftarkan Data Anak Tidak Sekolah (ATS) Baru
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
  if (raw === "25>" || raw === ">25" || raw === "24>" || raw === ">24" || raw.includes(">")) {
    return `${currentYear - 25}-01-01`;
  }

  const ageNum = parseInt(raw, 10);
  if (!isNaN(ageNum)) {
    const birthYear = currentYear - Math.max(0, ageNum);
    return `${birthYear}-${month}-${day}`;
  }

  return `${currentYear}-${month}-${day}`;
}

export async function createDataAts(formData: FormData): Promise<{
  success: boolean;
  message: string;
  dataId?: string;
  data?: DataAtsItem;
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

    const { data: targetKomunitas } = await getKomunitasDetail(komunitasId);
    if (targetKomunitas?.jenis === "satuan_paud") {
      return {
        success: false,
        message: "Data ATS tidak tersedia untuk Komunitas Satuan PAUD.",
      };
    }

    const namaLengkap = formData.get("namaLengkap")?.toString() || "";
    const usia = formData.get("usia")?.toString() || "";
    const tanggalLahirInput = formData.get("tanggalLahir")?.toString() || "";
    const tanggalLahir = parseUsiaToDate(usia, tanggalLahirInput);
    const jenisKelamin = formData.get("jenisKelamin")?.toString() || "L";
    const namaOrangtua = formData.get("namaOrangtua")?.toString() || "";
    const nomorHp = (formData.get("nomorHp")?.toString() || "").trim();
    const tinggalBersama = formData.get("tinggalBersama")?.toString() || "Orang Tua";

    // Alamat, RT/RW, Wilayah & Riwayat Sekolah
    const alamat = formData.get("alamat")?.toString()?.trim() || "";
    const rt = formData.get("rt")?.toString()?.trim() || "";
    const rw = formData.get("rw")?.toString()?.trim() || "";
    const kelurahan = formData.get("kelurahan")?.toString()?.trim() || "Randugunting";
    const kecamatan = formData.get("kecamatan")?.toString()?.trim() || "Tegal Selatan";
    const jenjangAsal = formData.get("jenjangAsal")?.toString()?.trim() || "";
    const sekolahSebelumnya = formData.get("sekolahSebelumnya")?.toString()?.trim() || "";
    const kelasTerakhir = formData.get("kelasTerakhir")?.toString()?.trim() || "";

    // ATS Specific Fields
    const keinginanSekolah = (formData.get("keinginanSekolah")?.toString() || "Masih Ada") as "Masih Ada" | "Tidak Ada";
    const alasanTidakSekolah = formData.get("alasanTidakSekolah")?.toString() || "Tidak ada biaya";
    const keterangan = formData.get("keterangan")?.toString()?.trim() || "";

    // Validasi Zod Data ATS
    const validationResult = DataAtsSchema.safeParse({
      namaLengkap,
      usia,
      tanggalLahir,
      jenisKelamin,
      namaOrangtua,
      nomorHp,
      tinggalBersama,
      alamat,
      rt,
      rw,
      kelurahan,
      kecamatan,
      jenjangAsal,
      sekolahSebelumnya,
      kelasTerakhir,
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

    // Pastikan profile user ada di tabel public.profiles untuk foreign key
    const { data: profileCheck } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profileCheck) {
      await supabase.from("profiles").upsert({
        id: user.id,
        nama_lengkap: user.user_metadata?.nama_lengkap || user.user_metadata?.name || user.email?.split("@")[0] || "Pengguna",
        email: user.email,
        updated_at: new Date().toISOString(),
      });
    }

    // Pastikan komunitas ada di tabel public.komunitas untuk foreign key
    const validKomId = toValidUUID(komunitasId);
    const { data: dbKomCheck } = await supabase
      .from("komunitas")
      .select("id")
      .eq("id", validKomId)
      .maybeSingle();

    if (!dbKomCheck) {
      const seedItem = findOrGenerateKomunitasSeed(komunitasId);
      await supabase.from("komunitas").upsert({
        id: validKomId,
        nama: komunitasNama || seedItem?.nama || "Komunitas Warga",
        nama_komunitas: komunitasNama || seedItem?.nama || "Komunitas Warga",
        jenis: seedItem?.jenis || "warga_kita",
        jenis_komunitas: seedItem?.jenis || "warga_kita",
        kecamatan: kecamatan || seedItem?.kecamatan || "Tegal Selatan",
        kelurahan: kelurahan || seedItem?.kelurahan || "Randugunting",
        rw: rw || seedItem?.rw || "01",
        rt: rt || seedItem?.rt || "01",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Format alasan_sekolah string untuk interoperabilitas database
    let formattedAlasan = `[KEINGINAN:${keinginanSekolah}] [ALASAN:${alasanTidakSekolah}]`;
    if (alamat) formattedAlasan += ` [ALAMAT:${alamat}]`;
    if (rt) formattedAlasan += ` [RT:${rt}]`;
    if (rw) formattedAlasan += ` [RW:${rw}]`;
    if (kelurahan) formattedAlasan += ` [KEL:${kelurahan}]`;
    if (kecamatan) formattedAlasan += ` [KEC:${kecamatan}]`;
    if (jenjangAsal) formattedAlasan += ` [JENJANG_ASAL:${jenjangAsal}]`;
    if (sekolahSebelumnya) formattedAlasan += ` [SEKOLAH_ASAL:${sekolahSebelumnya}]`;
    if (kelasTerakhir) formattedAlasan += ` [KELAS:${kelasTerakhir}]`;
    if (keterangan) formattedAlasan += ` [KET:${keterangan}]`;

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
      komunitas_id: validKomId,
      status_approval: "pending",
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data: insertedChild, error: insertError } = await supabase
      .from("data_anak")
      .insert(atsPayload)
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
        created_at
      `)
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
        const ddtkPayload: any = {
          data_anak_id: newChildId,
          berat_badan: parseFloat(beratBadanStr),
          tinggi_badan: parseFloat(tinggiBadanStr),
          lingkar_kepala: parseFloat(lingkarKepalaStr),
          catatan: "Pencatatan DDTK saat pendataan awal ATS",
          dicatat_oleh: user.id,
          recorded_by: user.id,
          created_at: new Date().toISOString(),
        };

        const { error: ddtkError } = await supabase
          .from("ddks_records")
          .insert(ddtkPayload);

        if (ddtkError) {
          if (ddtkError.message.includes("recorded_by")) {
            delete ddtkPayload.recorded_by;
            await supabase.from("ddks_records").insert(ddtkPayload);
          } else if (ddtkError.message.includes("dicatat_oleh")) {
            delete ddtkPayload.dicatat_oleh;
            await supabase.from("ddks_records").insert(ddtkPayload);
          }
        }
      }
    }

    revalidatePath(`/komunitas/${komunitasId}/ats`);
    revalidatePath(`/komunitas/${komunitasId}/data`);
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-ats");
    revalidatePath("/data-anak");
    revalidatePath("/profil");
    revalidatePath("/");

    const parsed = parseAtsDetails(insertedChild.alasan_sekolah);
    const formattedItem: DataAtsItem = {
      id: insertedChild.id,
      nama_lengkap: insertedChild.nama_lengkap || namaLengkap,
      tanggal_lahir: insertedChild.tanggal_lahir || tanggalLahir,
      jenis_kelamin: (insertedChild.jenis_kelamin as any) || jenisKelamin,
      nama_orangtua: insertedChild.nama_orangtua || namaOrangtua,
      nomor_hp: insertedChild.nomor_hp || nomorHp,
      tinggal_bersama: insertedChild.tinggal_bersama || tinggalBersama || "Orang Tua",
      alamat: parsed.alamat || alamat,
      rt: parsed.rt || rt,
      rw: parsed.rw || rw,
      kelurahan: parsed.kelurahan || kelurahan,
      kecamatan: parsed.kecamatan || kecamatan,
      jenjang_asal: parsed.jenjangAsal || jenjangAsal,
      sekolah_sebelumnya: parsed.sekolahSebelumnya || sekolahSebelumnya,
      kelas_terakhir: parsed.kelasTerakhir || kelasTerakhir,
      keinginan_sekolah: (parsed.keinginan as any) || keinginanSekolah,
      alasan_tidak_sekolah: (parsed.alasan as any) || alasanTidakSekolah,
      keterangan: parsed.keterangan || keterangan,
      komunitas_id: insertedChild.komunitas_id || komunitasId,
      status_approval: (insertedChild.status_approval as any) || "pending",
      validated_by: insertedChild.validated_by || null,
      validated_at: insertedChild.validated_at || null,
      created_by: insertedChild.created_by || user.id,
      created_at: insertedChild.created_at || new Date().toISOString(),
      latest_ddtk: null,
      ddtk_history: [],
    };

    return {
      success: true,
      message: "Data Anak Tidak Sekolah (ATS) berhasil didaftarkan dan menunggu verifikasi.",
      dataId: newChildId,
      data: formattedItem,
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
    revalidatePath("/data-ats");
    revalidatePath("/data-anak");
    revalidatePath("/profil");
    revalidatePath("/");
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

import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import { isDataAtsRecord } from "@/lib/data-anak-helpers";

function normalizeWilayah(val?: any): string {
  return String(val ?? "")
    .trim()
    .toLowerCase()
    .replace(/^(kelurahan|kecamatan|kel\.|kec\.)\s+/i, "")
    .replace(/\s+/g, " ");
}

function normalizeRtRwNum(val?: any): string {
  const digits = String(val ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.padStart(2, "0");
}

/**
 * Helper untuk mem-parsing alasan_sekolah format ATS
 */
function parseAtsDetails(alasanSekolahRaw?: string | null, fallbackKomunitas?: any): {
  keinginan: "Masih Ada" | "Tidak Ada";
  alasan: AlasanTidakSekolah;
  keterangan: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  jenjangAsal: string;
  sekolahSebelumnya: string;
  kelasTerakhir: string;
} {
  const raw = String(alasanSekolahRaw || "");
  const komMeta = fallbackKomunitas ? extractKomunitasMetadata(fallbackKomunitas) : null;

  let keinginan: "Masih Ada" | "Tidak Ada" = "Masih Ada";
  let alasan: AlasanTidakSekolah = "Tidak ada biaya";
  let keterangan = "";
  let alamat = "";
  let rt = komMeta?.rawRt ? String(komMeta.rawRt) : "Belum Tahu";
  let rw = komMeta?.rawRw ? String(komMeta.rawRw) : "Belum Tahu";
  let kelurahan = komMeta?.rawKel ? String(komMeta.rawKel) : "";
  let kecamatan = komMeta?.rawKec ? String(komMeta.rawKec) : "";
  let jenjangAsal = "";
  let sekolahSebelumnya = "";
  let kelasTerakhir = "";

  const matchKeinginan = raw.match(/\[KEINGINAN\s*:\s*([^\]]+)\]/i);
  if (matchKeinginan && matchKeinginan[1]) {
    keinginan = normalizeKeinginanSekolah(matchKeinginan[1]);
  }

  const matchAlasan = raw.match(/\[ALASAN\s*:\s*([^\]]+)\]/i);
  if (matchAlasan && matchAlasan[1]) {
    alasan = matchAlasan[1].trim() as AlasanTidakSekolah;
  } else if (raw && !raw.startsWith("[")) {
    alasan = raw as AlasanTidakSekolah;
  }

  const matchAlamat = raw.match(/\[ALAMAT\s*:\s*([^\]]+)\]/i);
  if (matchAlamat && matchAlamat[1]) alamat = matchAlamat[1].trim();

  const matchRt = raw.match(/\[RT\s*:\s*([^\]]+)\]/i);
  if (matchRt && matchRt[1]) rt = matchRt[1].trim();

  const matchRw = raw.match(/\[RW\s*:\s*([^\]]+)\]/i);
  if (matchRw && matchRw[1]) rw = matchRw[1].trim();

  const matchKel = raw.match(/\[KEL(?:URAHAN)?\s*:\s*([^\]]+)\]/i);
  if (matchKel && matchKel[1]) kelurahan = matchKel[1].trim();

  const matchKec = raw.match(/\[KEC(?:AMATAN)?\s*:\s*([^\]]+)\]/i);
  if (matchKec && matchKec[1]) kecamatan = matchKec[1].trim();

  const matchJenjangAsal = raw.match(/\[JENJANG_ASAL\s*:\s*([^\]]+)\]/i);
  if (matchJenjangAsal && matchJenjangAsal[1]) jenjangAsal = matchJenjangAsal[1].trim();

  const matchSekolahAsal = raw.match(/\[SEKOLAH_ASAL\s*:\s*([^\]]+)\]/i);
  if (matchSekolahAsal && matchSekolahAsal[1]) sekolahSebelumnya = matchSekolahAsal[1].trim();

  const matchKelas = raw.match(/\[KELAS\s*:\s*([^\]]+)\]/i);
  if (matchKelas && matchKelas[1]) kelasTerakhir = matchKelas[1].trim();

  const matchKet = raw.match(/\[KET\s*:\s*([^\]]+)\]/i);
  if (matchKet && matchKet[1]) {
    keterangan = matchKet[1].trim();
  }

  if (!jenjangAsal && sekolahSebelumnya) {
    jenjangAsal = sekolahSebelumnya;
  }

  return {
    keinginan,
    alasan,
    keterangan,
    alamat,
    rt,
    rw,
    kelurahan,
    kecamatan,
    jenjangAsal,
    sekolahSebelumnya,
    kelasTerakhir,
  };
}

/**
 * Server Action: Memperbarui Data ATS yang Ada (Edit ATS)
 */
export async function updateDataAts(
  dataAtsId: string,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: DataAtsItem;
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
        message: "Silakan masuk terlebih dahulu untuk mengubah data ATS.",
      };
    }

    // Ambil data ATS eksisting
    const { data: existingChild, error: fetchError } = await supabase
      .from("data_anak")
      .select("id, created_by, komunitas_id")
      .eq("id", dataAtsId)
      .maybeSingle();

    if (fetchError || !existingChild) {
      return {
        success: false,
        message: "Data ATS tidak ditemukan atau telah dihapus.",
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
      const { data: memberships } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const isAuthorized = (memberships || []).some((m: any) => {
        const roleLower = (m?.peran || "").toLowerCase();
        return (
          roleLower.includes("kader") ||
          roleLower.includes("pengurus") ||
          roleLower.includes("nakes") ||
          roleLower.includes("medis") ||
          roleLower.includes("admin") ||
          roleLower.includes("ketua")
        );
      });

      if (!isAuthorized) {
        return {
          success: false,
          message:
            "Akses ditolak: Anda tidak memiliki izin untuk mengubah data ATS ini.",
        };
      }
    }

    const komunitasId =
      formData.get("komunitasId")?.toString() || existingChild.komunitas_id;
    const namaLengkap = formData.get("namaLengkap")?.toString() || "";
    const usia = formData.get("usia")?.toString() || "";
    const tanggalLahirInput = formData.get("tanggalLahir")?.toString() || "";
    const tanggalLahir = parseUsiaToDate(usia, tanggalLahirInput);
    const jenisKelamin = formData.get("jenisKelamin")?.toString() || "L";
    const namaOrangtua = formData.get("namaOrangtua")?.toString() || "";
    const nomorHp = formData.get("nomorHp")?.toString() || "";
    const tinggalBersama =
      formData.get("tinggalBersama")?.toString() || "Orang Tua";

    // Alamat, RT/RW, Wilayah & Riwayat Sekolah
    const alamat = formData.get("alamat")?.toString()?.trim() || "";
    const rt = formData.get("rt")?.toString()?.trim() || "";
    const rw = formData.get("rw")?.toString()?.trim() || "";
    const kelurahan = formData.get("kelurahan")?.toString()?.trim() || "Randugunting";
    const kecamatan = formData.get("kecamatan")?.toString()?.trim() || "Tegal Selatan";
    const jenjangAsal = formData.get("jenjangAsal")?.toString()?.trim() || "";
    const sekolahSebelumnya = formData.get("sekolahSebelumnya")?.toString()?.trim() || "";
    const kelasTerakhir = formData.get("kelasTerakhir")?.toString()?.trim() || "";

    // ATS Specific Fields
    const keinginanSekolah = (formData.get("keinginanSekolah")?.toString() ||
      "Masih Ada") as "Masih Ada" | "Tidak Ada";
    const alasanTidakSekolah =
      formData.get("alasanTidakSekolah")?.toString() || "Tidak ada biaya";
    const keterangan = formData.get("keterangan")?.toString()?.trim() || "";

    // Validasi Zod Data ATS
    const validationResult = DataAtsSchema.safeParse({
      namaLengkap,
      usia,
      tanggalLahir,
      jenisKelamin,
      namaOrangtua,
      nomorHp,
      tinggalBersama,
      alamat,
      rt,
      rw,
      kelurahan,
      kecamatan,
      jenjangAsal,
      sekolahSebelumnya,
      kelasTerakhir,
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

    // Format alasan_sekolah
    let formattedAlasan = `[KEINGINAN:${keinginanSekolah}] [ALASAN:${alasanTidakSekolah}]`;
    if (alamat) formattedAlasan += ` [ALAMAT:${alamat}]`;
    if (rt) formattedAlasan += ` [RT:${rt}]`;
    if (rw) formattedAlasan += ` [RW:${rw}]`;
    if (kelurahan) formattedAlasan += ` [KEL:${kelurahan}]`;
    if (kecamatan) formattedAlasan += ` [KEC:${kecamatan}]`;
    if (jenjangAsal) formattedAlasan += ` [JENJANG_ASAL:${jenjangAsal}]`;
    if (sekolahSebelumnya) formattedAlasan += ` [SEKOLAH_ASAL:${sekolahSebelumnya}]`;
    if (kelasTerakhir) formattedAlasan += ` [KELAS:${kelasTerakhir}]`;
    if (keterangan) formattedAlasan += ` [KET:${keterangan}]`;

    // Reset status_approval kembali ke "pending" pada setiap perubahan data agar perlu divalidasi ulang di jenjang RT
    const updatePayload = {
      nama_lengkap: namaLengkap,
      tanggal_lahir: tanggalLahir,
      jenis_kelamin: jenisKelamin,
      nama_orangtua: namaOrangtua,
      nomor_hp: nomorHp,
      tinggal_bersama: tinggalBersama,
      alasan_sekolah: formattedAlasan,
      status_approval: "pending" as const,
      validated_by: null,
      validated_at: null,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedData, error: updateError } = await supabase
      .from("data_anak")
      .update(updatePayload)
      .eq("id", dataAtsId)
      .select("*")
      .single();

    if (updateError || !updatedData) {
      return {
        success: false,
        message:
          "Gagal memperbarui data ATS: " +
          (updateError?.message || "Kesalahan database"),
      };
    }

    revalidatePath(`/komunitas/${komunitasId}/ats`);
    revalidatePath(`/komunitas/${komunitasId}/data`);
    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-ats");
    revalidatePath("/data-anak");
    revalidatePath("/profil");
    revalidatePath("/");

    const parsed = parseAtsDetails(updatedData.alasan_sekolah);
    const formattedItem: DataAtsItem = {
      id: updatedData.id,
      nama_lengkap: updatedData.nama_lengkap,
      tanggal_lahir: updatedData.tanggal_lahir,
      jenis_kelamin: updatedData.jenis_kelamin,
      nama_orangtua: updatedData.nama_orangtua,
      nomor_hp: updatedData.nomor_hp,
      tinggal_bersama: updatedData.tinggal_bersama || "Orang Tua",
      alamat: parsed.alamat,
      rt: parsed.rt,
      rw: parsed.rw,
      kelurahan: parsed.kelurahan,
      kecamatan: parsed.kecamatan,
      jenjang_asal: parsed.jenjangAsal,
      sekolah_sebelumnya: parsed.sekolahSebelumnya,
      kelas_terakhir: parsed.kelasTerakhir,
      keinginan_sekolah: parsed.keinginan,
      alasan_tidak_sekolah: parsed.alasan,
      keterangan: parsed.keterangan,
      komunitas_id: updatedData.komunitas_id,
      status_approval: "pending",
      validated_by: null,
      validated_at: null,
      created_by: updatedData.created_by,
      created_at: updatedData.created_at,
      updated_at: updatedData.updated_at,
    };

    return {
      success: true,
      message: "Data ATS berhasil diperbarui dan status kembali Menunggu Validasi RT.",
      data: formattedItem,
    };
  } catch (err: any) {
    console.error("Error updateDataAts:", err);
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat memperbarui data ATS.",
    };
  }
}

/**
 * Server Action: Intervensi Kembali Bersekolah bagi Anak ATS
 * Mengubah status anak menjadi bersekolah (is_sekolah = true) dan mencatat nama sekolah baru
 */
export async function kembaliBersekolah(
  dataAtsId: string,
  payload: {
    namaSekolah: string;
    jenjang?: string;
    bentukIntervensi?: string;
    catatan?: string;
    komunitasId?: string;
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
        message:
          "Silakan masuk terlebih dahulu untuk memproses intervensi kembali bersekolah.",
      };
    }

    if (!payload.namaSekolah || payload.namaSekolah.trim().length < 2) {
      return {
        success: false,
        message: "Nama sekolah / lembaga pendidikan baru wajib diisi.",
      };
    }

    // Ambil data ATS target
    const { data: existingChild, error: fetchError } = await supabase
      .from("data_anak")
      .select("id, nama_lengkap, created_by, komunitas_id")
      .eq("id", dataAtsId)
      .maybeSingle();

    if (fetchError || !existingChild) {
      return {
        success: false,
        message: "Data ATS tidak ditemukan atau telah dihapus.",
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
        .eq("komunitas_id", existingChild.komunitas_id)
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (membership?.peran || "").toLowerCase();
      const isAuthorized =
        roleLower.includes("kader") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("nakes") ||
        roleLower.includes("medis") ||
        roleLower.includes("admin");

      if (!isAuthorized) {
        return {
          success: false,
          message:
            "Akses ditolak: Hanya Pengurus, Kader, atau pembuat data yang dapat mencatat kembali bersekolah.",
        };
      }
    }

    const schoolNote = `[KEMBALI BERSEKOLAH] Sekolah: ${payload.namaSekolah.trim()}${
      payload.jenjang ? ` | Jenjang: ${payload.jenjang}` : ""
    }${
      payload.bentukIntervensi
        ? ` | Intervensi: ${payload.bentukIntervensi}`
        : ""
    }${payload.catatan?.trim() ? ` | Catatan: ${payload.catatan.trim()}` : ""}`;

    const { error: updateError } = await supabase
      .from("data_anak")
      .update({
        is_sekolah: true,
        nama_sekolah: payload.namaSekolah.trim(),
        alasan_sekolah: schoolNote,
        status_approval: "approved",
        validated_by: user.id,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", dataAtsId);

    if (updateError) {
      return {
        success: false,
        message:
          "Gagal mencatat status kembali bersekolah: " + updateError.message,
      };
    }

    const targetKomunitasId = payload.komunitasId || existingChild.komunitas_id;
    revalidatePath(`/komunitas/${targetKomunitasId}/ats`);
    revalidatePath(`/komunitas/${targetKomunitasId}/data`);
    revalidatePath(`/komunitas/${targetKomunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-ats");
    revalidatePath("/data-anak");
    revalidatePath("/profil");
    revalidatePath("/");

    return {
      success: true,
      message: `Selamat! ${existingChild.nama_lengkap} berhasil tercatat kembali bersekolah di ${payload.namaSekolah.trim()} dan dialihkan ke Data Anak aktif.`,
    };
  } catch (err: any) {
    console.error("Error kembaliBersekolah:", err);
    return {
      success: false,
      message:
        err.message || "Terjadi kesalahan saat memproses status kembali bersekolah.",
    };
  }
}

/**
 * Server Action: Menghapus Data ATS (Hapus ATS)
 */
export async function deleteDataAts(
  dataAtsId: string,
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
        message: "Silakan masuk terlebih dahulu untuk menghapus data ATS.",
      };
    }

    // Ambil data ATS eksisting
    const { data: existingChild, error: fetchError } = await supabase
      .from("data_anak")
      .select("id, nama_lengkap, created_by, komunitas_id")
      .eq("id", dataAtsId)
      .maybeSingle();

    if (fetchError || !existingChild) {
      return {
        success: false,
        message: "Data ATS tidak ditemukan atau sudah dihapus.",
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
        .eq("komunitas_id", existingChild.komunitas_id)
        .eq("status", "approved")
        .maybeSingle();

      const roleLower = (membership?.peran || "").toLowerCase();
      const isAuthorized =
        roleLower.includes("kader") ||
        roleLower.includes("pengurus") ||
        roleLower.includes("nakes") ||
        roleLower.includes("medis") ||
        roleLower.includes("admin");

      if (!isAuthorized) {
        return {
          success: false,
          message:
            "Akses ditolak: Anda tidak memiliki izin untuk menghapus data ATS ini.",
        };
      }
    }

    // Hapus relasi riwayat DDTK jika ada
    try {
      await supabase
        .from("ddks_records")
        .delete()
        .eq("data_anak_id", dataAtsId);
    } catch (e) {
      console.warn("Hapus ddks_records warning:", e);
    }

    // Hapus record data_anak
    const { error: deleteError } = await supabase
      .from("data_anak")
      .delete()
      .eq("id", dataAtsId);

    if (deleteError) {
      return {
        success: false,
        message: "Gagal menghapus data ATS: " + deleteError.message,
      };
    }

    const targetKomunitasId = komunitasId || existingChild.komunitas_id;
    revalidatePath(`/komunitas/${targetKomunitasId}/ats`);
    revalidatePath(`/komunitas/${targetKomunitasId}/data`);
    revalidatePath(`/komunitas/${targetKomunitasId}`);
    revalidatePath("/komunitas");
    revalidatePath("/data-ats");
    revalidatePath("/data-anak");
    revalidatePath("/profil");
    revalidatePath("/");

    return {
      success: true,
      message: `Data ATS ${existingChild.nama_lengkap} berhasil dihapus dari sistem.`,
    };
  } catch (err: any) {
    console.error("Error deleteDataAts:", err);
    return {
      success: false,
      message: err.message || "Terjadi kendala saat menghapus data ATS.",
    };
  }
}

/**
 * Server Action: Mengambil Data ATS berdasarkan Komunitas
 * - Komunitas RT: Hanya tampilkan data Anak ATS di RT tersebut & tombol Validasi aktif
 * - Komunitas RW: Tampilkan seluruh data Anak ATS di RW tersebut (semua RT di RW itu) & tombol Validasi tersembunyi
 * - Komunitas Kelurahan: Tampilkan seluruh data Anak ATS di Kelurahan tersebut (semua RW & RT di Kelurahan itu) & tombol Validasi tersembunyi
 * - Komunitas Kecamatan: Tampilkan seluruh data Anak ATS di Kecamatan tersebut & tombol Validasi tersembunyi
 */
export async function getDataAtsByKomunitas(komunitasId: string): Promise<{
  success: boolean;
  data: DataAtsItem[];
  canValidate: boolean;
  canEditDdtk: boolean;
  canManage: boolean;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    let canValidate = false;
    let canEditDdtk = false;
    let canManage = false;
    let currentUserId: string | null = null;
    let isSuperAdmin = false;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        currentUserId = user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_super_admin")
          .eq("id", user.id)
          .single();

        isSuperAdmin = profile?.is_super_admin === true;
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
        canManage = isSuperAdmin || isKader || isPengurus;
      }
    } catch {
      // Tamu
    }

    // 1. Ekstraksi informasi tingkat wilayah komunitas target (RT, RW, Kelurahan, Kecamatan)
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

    if (targetKomunitas?.jenis === "satuan_paud") {
      return {
        success: false,
        data: [],
        canValidate: false,
        canEditDdtk: false,
        canManage: false,
        message: "Data ATS tidak tersedia untuk Komunitas Satuan PAUD.",
      };
    }

    const meta = extractKomunitasMetadata(targetKomunitas || { id: komunitasId });

    // Jenjang RT dan Posyandu memiliki wewenang untuk memvalidasi / memverifikasi Data ATS warga di wilayahnya
    const isRtCommunity = Boolean(
      meta.jenis === "warga_kita" &&
      ((meta.hasRt && meta.hasRw) ||
        (targetKomunitas?.rt && targetKomunitas?.rw))
    );
    const isPosyanduCommunity = Boolean(
      meta.jenis === "posyandu" || targetKomunitas?.jenis === "posyandu"
    );
    canValidate = (isRtCommunity || isPosyanduCommunity) && (isSuperAdmin || canManage);

    // 2. Ambil peta seluruh komunitas dari DB untuk resolusi fallback metadata
    const { data: allDbKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt");
    const dbKomMap = new Map((allDbKom || []).map((k: any) => [k.id, k]));

    // 3. Query data ATS dari data_anak
    let dbChildren: any[] | null = null;
    try {
      const { data, error: childError } = await supabase
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
        console.warn("Query data_ats with relation error:", childError.message);
      } else {
        dbChildren = data;
      }
    } catch (e) {
      console.warn("Exception querying data_anak with relation:", e);
    }

    if (!dbChildren) {
      const { data: fallbackData } = await supabase
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
          created_at
        `)
        .order("created_at", { ascending: false });

      dbChildren = fallbackData || [];
    }

    const rows = (dbChildren || []).filter(
      (row: any) => isDataAtsRecord(row) && row.is_sekolah !== true
    );
    const validKomId = toValidUUID(komunitasId);

    const items: DataAtsItem[] = rows
      .map((row: any) => {
        const records: DdtkRecord[] = (row.ddks_records || []).map((r: any) => ({
          ...r,
          recorded_by: r.recorded_by || r.dicatat_oleh || r.created_by || r.user_id,
        })).sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const childKomObj =
          dbKomMap.get(row.komunitas_id) ||
          findOrGenerateKomunitasSeed(row.komunitas_id) ||
          { id: row.komunitas_id };
        const parsed = parseAtsDetails(row.alasan_sekolah, childKomObj);

        return {
          id: row.id,
          nama_lengkap: row.nama_lengkap,
          tanggal_lahir: row.tanggal_lahir,
          jenis_kelamin: row.jenis_kelamin,
          nama_orangtua: row.nama_orangtua,
          nomor_hp: row.nomor_hp,
          tinggal_bersama: row.tinggal_bersama || "Orang Tua",
          alamat: parsed.alamat,
          rt: parsed.rt,
          rw: parsed.rw,
          kelurahan: parsed.kelurahan,
          kecamatan: parsed.kecamatan,
          jenjang_asal: parsed.jenjangAsal,
          sekolah_sebelumnya: parsed.sekolahSebelumnya,
          kelas_terakhir: parsed.kelasTerakhir,
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
      })
      .filter((item) => {
        const itemKec = normalizeWilayah(item.kecamatan);
        const itemKel = normalizeWilayah(item.kelurahan);
        const itemRw = normalizeRtRwNum(item.rw);
        const itemRt = normalizeRtRwNum(item.rt);

        const targetKec = normalizeWilayah(meta.rawKec);
        const targetKel = normalizeWilayah(meta.rawKel);
        const targetRw = normalizeRtRwNum(meta.rawRw);
        const targetRt = normalizeRtRwNum(meta.rawRt);

        const rawItemRw = (item.rw || "").trim().toLowerCase();
        const rawItemRt = (item.rt || "").trim().toLowerCase();

        const isRwBelumTahu =
          !itemRw ||
          !rawItemRw ||
          rawItemRw.includes("belum") ||
          rawItemRw === "-" ||
          rawItemRw === "0" ||
          rawItemRw === "00";

        const isRtBelumTahu =
          !itemRt ||
          !rawItemRt ||
          rawItemRt.includes("belum") ||
          rawItemRt === "-" ||
          rawItemRt === "0" ||
          rawItemRt === "00";

        // 0. Komunitas Posyandu: Tampilkan seluruh data Anak ATS di Kelurahan tempat Posyandu berada
        if (meta.jenis === "posyandu" || targetKomunitas?.jenis === "posyandu") {
          const matchKel =
            !targetKel ||
            itemKel === targetKel ||
            itemKel.includes(targetKel) ||
            targetKel.includes(itemKel);
          const matchKec =
            !targetKec ||
            !itemKec ||
            itemKec === targetKec ||
            itemKec.includes(targetKec) ||
            targetKec.includes(itemKec);

          return matchKel && matchKec;
        }

        // 1. Komunitas RT: Tampilkan data jika RT cocok, ATAU jika RW/RT Belum Tahu di Kelurahan yang sama
        if (meta.hasRt && meta.hasRw) {
          const matchKel =
            !targetKel ||
            !itemKel ||
            itemKel === targetKel ||
            itemKel.includes(targetKel) ||
            targetKel.includes(itemKel);
          const matchKec =
            !targetKec ||
            !itemKec ||
            itemKec === targetKec ||
            itemKec.includes(targetKec) ||
            targetKec.includes(itemKec);

          if (!matchKel || !matchKec) return false;

          // Jika RW Belum Tahu, otomatis terdistribusi ke semua RW & RT di Kelurahan ini
          if (isRwBelumTahu) {
            return true;
          }

          // Jika RW spesifik tetapi tidak sama dengan RW komunitas ini, jangan tampilkan
          if (itemRw !== targetRw) {
            return false;
          }

          // Jika RW sama dan RT Belum Tahu, terdistribusi ke semua RT dalam RW ini
          if (isRtBelumTahu) {
            return true;
          }

          // Jika RW sama dan RT spesifik, hanya tampilkan jika RT sama persis
          return itemRt === targetRt;
        }

        // 2. Komunitas RW: Tampilkan data jika RW cocok, ATAU jika RW Belum Tahu di Kelurahan yang sama
        if (meta.hasRw && !meta.hasRt) {
          const matchKel =
            !targetKel ||
            !itemKel ||
            itemKel === targetKel ||
            itemKel.includes(targetKel) ||
            targetKel.includes(itemKel);
          const matchKec =
            !targetKec ||
            !itemKec ||
            itemKec === targetKec ||
            itemKec.includes(targetKec) ||
            targetKec.includes(itemKec);

          if (!matchKel || !matchKec) return false;

          // Jika RW Belum Tahu, otomatis terdistribusi ke semua RW di Kelurahan ini
          if (isRwBelumTahu) {
            return true;
          }

          // Hanya tampilkan jika RW sama persis
          return itemRw === targetRw;
        }

        // 3. Komunitas Kelurahan: Tampilkan seluruh data Anak ATS di Kelurahan tersebut
        if (meta.hasKel && !meta.hasRw && !meta.hasRt) {
          const matchKel =
            itemKel === targetKel ||
            itemKel.includes(targetKel) ||
            targetKel.includes(itemKel);
          const matchKec =
            !targetKec ||
            !itemKec ||
            itemKec === targetKec ||
            itemKec.includes(targetKec) ||
            targetKec.includes(itemKec);

          return matchKel && matchKec;
        }

        // 4. Komunitas Kecamatan: Tampilkan data Anak ATS di Kecamatan tersebut
        if (targetKec && targetKec !== "kota tegal" && targetKec !== "semua") {
          return (
            itemKec === targetKec ||
            itemKec.includes(targetKec) ||
            targetKec.includes(itemKec)
          );
        }

        // Fallback untuk komunitas tingkat kota
        return true;
      });

    return {
      success: true,
      data: items,
      canValidate,
      canEditDdtk,
      canManage,
      currentUserId,
      isSuperAdmin,
    };
  } catch (err: any) {
    console.error("Error getDataAtsByKomunitas:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat data ATS.",
      data: [],
      canValidate: false,
      canEditDdtk: false,
      canManage: false,
    };
  }
}
