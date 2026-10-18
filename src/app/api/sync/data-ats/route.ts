import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/server";
import {
  parseAtsDetails,
  serializeDataAtsAlasan,
  normalizeKeinginanSekolah,
  isDataAtsRecord,
  isDummyDataAnak,
  normalizeWilayah,
  normalizeRtRwNum,
} from "@/lib/data-anak-helpers";
import { toValidUUID } from "@/lib/utils";

// Secret token otentikasi sinkronisasi (konsisten dengan Data Anak 0-6)
const DEFAULT_SYNC_SECRET = "jarimas-tegal-sync-2026";
const DEFAULT_SYSTEM_USER_ID = "1d827e22-9253-486a-a948-3fac6d01ae38"; // Akun Admin pengelola

function getSupabaseAdmin(): any {
  try {
    const adminClient = createAdminClient();
    if (adminClient) return adminClient;
  } catch {
    // fallback anon
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nzfwkpwabfiettoixtdk.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_cseh0XvvzEyoWjxbj_JoIg_hdungUJk";
  return createClient(supabaseUrl, supabaseAnonKey);
}

function cleanToken(token?: string | null): string {
  if (!token) return "";
  return String(token).trim().replace(/^["']|["']$/g, "").trim();
}

function verifySecret(req: NextRequest, bodySecret?: string): boolean {
  const configuredSecret = cleanToken(process.env.JARIMAS_SYNC_SECRET || DEFAULT_SYNC_SECRET);
  const authHeader = req.headers.get("authorization") || "";
  const headerSecret = cleanToken(req.headers.get("x-sync-secret"));
  const querySecret = cleanToken(req.nextUrl.searchParams.get("secret"));
  const incomingBodySecret = cleanToken(bodySecret);
  const bearerSecret = authHeader.startsWith("Bearer ") ? cleanToken(authHeader.slice(7)) : "";

  const validSecrets = new Set<string>([
    configuredSecret.toLowerCase(),
    DEFAULT_SYNC_SECRET.toLowerCase(),
    "sb_publishable_cseh0XvvzEyoWjxbj_JoIg_hdungUJk".toLowerCase(),
    cleanToken(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toLowerCase(),
  ].filter(Boolean));

  for (const s of [headerSecret, querySecret, incomingBodySecret, bearerSecret]) {
    if (s && validSecrets.has(s.toLowerCase())) return true;
  }

  return false;
}

function parseBirthDateOrAge(item: any): string {
  const currentYear = new Date().getFullYear();

  // 1. Cek kolom tanggal lahir eksplisit
  const rawDate =
    item.tanggal_lahir ||
    item.tgl_lahir ||
    item.birth_date ||
    item.tanggalLahir ||
    item.tglLahir ||
    item.tgl ||
    item.lahir;

  if (rawDate) {
    const s = String(rawDate).trim();
    // Format YYYY-MM-DD
    const isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = String(isoMatch[2]).padStart(2, "0");
      const d = String(isoMatch[3]).padStart(2, "0");
      if (y >= 1990 && y <= currentYear) {
        return `${y}-${m}-${d}`;
      }
    }
    // Format DD-MM-YYYY atau DD/MM/YYYY
    const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      const d = String(dmyMatch[1]).padStart(2, "0");
      const m = String(dmyMatch[2]).padStart(2, "0");
      const y = parseInt(dmyMatch[3], 10);
      if (y >= 1990 && y <= currentYear) {
        return `${y}-${m}-${d}`;
      }
    }
    // Coba Date bawaan
    const dObj = new Date(s);
    if (!isNaN(dObj.getTime()) && dObj.getFullYear() >= 1990 && dObj.getFullYear() <= currentYear) {
      return dObj.toISOString().split("T")[0];
    }
  }

  // 2. Cek kolom usia / umur
  const rawUsia =
    item.usia !== undefined && item.usia !== null && item.usia !== ""
      ? item.usia
      : item.umur !== undefined && item.umur !== null && item.umur !== ""
      ? item.umur
      : item.age;

  if (rawUsia !== undefined && rawUsia !== null && rawUsia !== "") {
    const s = String(rawUsia).trim();
    if (s === "24>" || s === ">24" || s === "25>" || s === ">25" || s.includes(">")) {
      return `${currentYear - 25}-07-01`;
    }
    const match = s.match(/(\d+)/);
    if (match) {
      const parsedNum = parseInt(match[1], 10);
      if (!isNaN(parsedNum) && parsedNum >= 4 && parsedNum <= 40) {
        return `${currentYear - parsedNum}-07-01`;
      }
    }
  }

  // 3. Fallback jika tanggal lahir dan usia tidak diisi sama sekali (rata-rata ATS usia SMP 14 tahun)
  return `${currentYear - 14}-07-01`;
}

function calculateUsiaFromBirthDate(birthDateStr?: string | null): string {
  if (!birthDateStr) return "14";
  try {
    const bDate = new Date(birthDateStr);
    if (isNaN(bDate.getTime())) return "14";
    const now = new Date();
    let ageYears = now.getFullYear() - bDate.getFullYear();
    const m = now.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
      ageYears--;
    }
    return ageYears >= 4 ? String(ageYears) : "14";
  } catch {
    return "14";
  }
}

/**
 * POST /api/sync/data-ats
 * Menerima kiriman batch data ATS dari Google Apps Script
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const candidateSecret =
      body.secret ||
      body.API_SECRET ||
      body.apiKey ||
      body.token ||
      req.headers.get("x-sync-secret") ||
      req.nextUrl.searchParams.get("secret") ||
      "";

    if (!verifySecret(req, candidateSecret)) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Akses ditolak: Secret Key tidak valid (diterima: '${String(candidateSecret).slice(0, 50)}'). Pastikan CONFIG.API_SECRET diatur ke 'jarimas-tegal-sync-2026'.`,
        },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const items = Array.isArray(body.items) ? body.items : body.records || [];

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada baris data ATS yang dikirim.",
        },
        { status: 400 }
      );
    }

    // Ambil daftar seluruh Komunitas Warga Kita (Kelurahan & RW/RT) untuk pemetaan wilayah ATS
    const { data: dbWargaKomunitas } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt")
      .eq("jenis", "warga_kita");

    const results: Array<{
      row_index: number;
      id: string;
      status: "created" | "existing" | "updated" | "error";
      nama_lengkap: string;
      message?: string;
    }> = [];

    // 1. Filter dan kumpulkan nama serta ID untuk bulk check
    const validItems: any[] = [];
    for (const item of items) {
      const rowIndex = Number(item.row_index || 0);
      const namaLengkap = String(item.nama_lengkap || "").trim();

      if (!namaLengkap || namaLengkap.length < 2) {
        results.push({
          row_index: rowIndex,
          id: "",
          status: "error",
          nama_lengkap: namaLengkap,
          message: "Nama lengkap tidak boleh kosong (minimal 2 karakter).",
        });
        continue;
      }

      validItems.push({
        ...item,
        row_index: rowIndex,
        nama_lengkap: namaLengkap,
      });
    }

    const incomingNames = Array.from(new Set(validItems.map((v) => v.nama_lengkap)));
    const incomingIds = validItems
      .map((v) => toValidUUID(v.id))
      .filter((id): id is string => Boolean(id && id.length > 10));

    // 2. Bulk Lookup data yang sudah ada di database
    let existingByName: any[] = [];
    if (incomingNames.length > 0) {
      const { data: foundByName } = await supabase
        .from("data_anak")
        .select("id, nama_lengkap, nama_orangtua, alasan_sekolah, komunitas_id, is_sekolah")
        .in("nama_lengkap", incomingNames);
      if (foundByName) existingByName = foundByName;
    }

    let existingById: any[] = [];
    if (incomingIds.length > 0) {
      const { data: foundById } = await supabase
        .from("data_anak")
        .select("id, nama_lengkap, nama_orangtua, alasan_sekolah, komunitas_id, is_sekolah")
        .in("id", incomingIds);
      if (foundById) existingById = foundById;
    }

    // 3. Pisahkan item yang sudah ada vs yang baru perlu di-insert
    const itemsToInsert: Array<{
      rowIndex: number;
      namaLengkap: string;
      payload: any;
    }> = [];

    for (const item of validItems) {
      const rowIndex = item.row_index;
      const namaLengkap = item.nama_lengkap;
      const validItemId = toValidUUID(item.id);

      const rawJk = String(item.jenis_kelamin || "").trim().toUpperCase();
      const jk: "L" | "P" = rawJk.startsWith("P") || rawJk === "PEREMPUAN" ? "P" : "L";
      const birthDate = parseBirthDateOrAge(item);
      const namaOrangtua = String(item.nama_orangtua || "").trim() || "-";

      const targetKecamatan = String(item.kecamatan || "Tegal Selatan").trim();
      const targetKelurahan = String(item.kelurahan || "Randugunting").trim();
      const targetRw = normalizeRtRwNum(item.rw);
      const targetRt = normalizeRtRwNum(item.rt);

      // Cari Komunitas Warga Kita yang paling cocok untuk ATS
      let targetKomunitasId = "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703"; // Default Komunitas Warga Kota Tegal

      if (dbWargaKomunitas && dbWargaKomunitas.length > 0) {
        const normKel = normalizeWilayah(targetKelurahan);
        const normKec = normalizeWilayah(targetKecamatan);

        // 1. Coba cocokkan tingkat RT jika ada
        if (targetRt && targetRw) {
          const matchRt = dbWargaKomunitas.find(
            (k: any) =>
              normalizeWilayah(k.kelurahan) === normKel &&
              normalizeRtRwNum(k.rw) === targetRw &&
              normalizeRtRwNum(k.rt) === targetRt
          );
          if (matchRt) targetKomunitasId = matchRt.id;
        }

        // 2. Coba cocokkan tingkat RW jika belum cocok
        if (targetKomunitasId === "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703" && targetRw) {
          const matchRw = dbWargaKomunitas.find(
            (k: any) =>
              normalizeWilayah(k.kelurahan) === normKel &&
              normalizeRtRwNum(k.rw) === targetRw &&
              !k.rt
          );
          if (matchRw) targetKomunitasId = matchRw.id;
        }

        // 3. Cocokkan tingkat Kelurahan (rw is null, rt is null)
        if (targetKomunitasId === "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703" && targetKelurahan) {
          const matchKel = dbWargaKomunitas.find(
            (k: any) =>
              normalizeWilayah(k.kelurahan) === normKel &&
              (!normKec || normalizeWilayah(k.kecamatan) === normKec) &&
              !k.rw &&
              !k.rt
          );
          if (matchKel) targetKomunitasId = matchKel.id;
        }
      }

      // Format alasan_sekolah string ATS terstruktur
      const alasanFormatted = serializeDataAtsAlasan({
        keinginanSekolah: item.keinginan_sekolah || item.keinginan || "Masih Ada",
        alasanTidakSekolah: item.alasan_tidak_sekolah || item.alasan || "Tidak ada biaya",
        alamat: item.alamat || item.alamat_jalan || "",
        rt: item.rt || "Belum Tahu",
        rw: item.rw || "Belum Tahu",
        kelurahan: targetKelurahan,
        kecamatan: targetKecamatan,
        jenjangAsal: item.jenjang_asal || item.kategori_ats || item.kategori || "",
        sekolahSebelumnya: item.sekolah_asal || item.sekolah_sebelumnya || "",
        kelasTerakhir: item.kelas_terakhir || item.kelas || "",
        keterangan: item.keterangan || item.ket || "",
      });

      // Cek apakah ada kecocokan ID atau Nama Lengkap yang merupakan data ATS
      const matchById = validItemId ? existingById.find((e) => e.id === validItemId) : null;
      const matchByName = existingByName.find(
        (ex) =>
          ex.nama_lengkap?.toLowerCase() === namaLengkap.toLowerCase() &&
          isDataAtsRecord(ex) &&
          !isDummyDataAnak(ex) &&
          (namaOrangtua === "-" ||
            !ex.nama_orangtua ||
            ex.nama_orangtua === "-" ||
            ex.nama_orangtua.toLowerCase() === namaOrangtua.toLowerCase())
      );

      const matchInDb = matchById || matchByName;

      if (matchInDb) {
        // Perbarui data ATS yang sudah ada
        const updatePayload: any = {
          tanggal_lahir: birthDate,
          jenis_kelamin: jk,
          is_sekolah: false,
          nama_sekolah: "ATS - Anak Tidak Sekolah",
          alasan_sekolah: alasanFormatted,
          komunitas_id: toValidUUID(targetKomunitasId),
          updated_at: new Date().toISOString(),
        };
        if (namaOrangtua && namaOrangtua !== "-") updatePayload.nama_orangtua = namaOrangtua;
        if (item.nomor_hp) updatePayload.nomor_hp = String(item.nomor_hp).trim();
        if (item.tinggal_bersama) updatePayload.tinggal_bersama = String(item.tinggal_bersama).trim();

        const { error: updErr } = await supabase
          .from("data_anak")
          .update(updatePayload)
          .eq("id", matchInDb.id);

        results.push({
          row_index: rowIndex,
          id: matchInDb.id,
          status: updErr ? "error" : "updated",
          nama_lengkap: namaLengkap,
          message: updErr
            ? `Gagal memperbarui data ATS: ${updErr.message}`
            : "Data ATS berhasil diperbarui dari sinkronisasi Google Sheet.",
        });
        continue;
      }

      // Jika data baru, siapkan untuk bulk insert
      const atsPayload = {
        nama_lengkap: namaLengkap,
        tanggal_lahir: birthDate,
        jenis_kelamin: jk,
        nama_orangtua: namaOrangtua,
        nomor_hp: String(item.nomor_hp || "").trim(),
        tinggal_bersama: String(item.tinggal_bersama || "").trim() || "Orang Tua",
        jarak_rumah_km: 0,
        is_sekolah: false,
        nama_sekolah: "ATS - Anak Tidak Sekolah",
        alasan_sekolah: alasanFormatted,
        komunitas_id: toValidUUID(targetKomunitasId),
        status_approval: "pending",
        created_by: DEFAULT_SYSTEM_USER_ID,
        created_at: new Date().toISOString(),
      };

      itemsToInsert.push({
        rowIndex,
        namaLengkap,
        payload: atsPayload,
      });
    }

    // 4. Lakukan Bulk Insert massal
    if (itemsToInsert.length > 0) {
      const payloads = itemsToInsert.map((t) => t.payload);
      const { data: insertedBatch, error: batchError } = await supabase
        .from("data_anak")
        .insert(payloads)
        .select("id, nama_lengkap");

      if (!batchError && insertedBatch && insertedBatch.length === itemsToInsert.length) {
        insertedBatch.forEach((ins: any, idx: number) => {
          results.push({
            row_index: itemsToInsert[idx].rowIndex,
            id: ins.id,
            status: "created",
            nama_lengkap: itemsToInsert[idx].namaLengkap,
            message: "Data ATS baru berhasil didaftarkan ke sistem.",
          });
        });
      } else {
        console.warn("ATS batch insert fallback to sequential:", batchError?.message);
        for (const itemInsert of itemsToInsert) {
          const { data: singleInserted, error: singleError } = await supabase
            .from("data_anak")
            .insert(itemInsert.payload)
            .select("id")
            .single();

          if (singleError || !singleInserted) {
            results.push({
              row_index: itemInsert.rowIndex,
              id: "",
              status: "error",
              nama_lengkap: itemInsert.namaLengkap,
              message: singleError?.message || "Gagal menyimpan ke database Supabase.",
            });
          } else {
            results.push({
              row_index: itemInsert.rowIndex,
              id: singleInserted.id,
              status: "created",
              nama_lengkap: itemInsert.namaLengkap,
              message: "Data ATS baru berhasil didaftarkan ke sistem.",
            });
          }
        }
      }
    }

    const createdCount = results.filter((r) => r.status === "created").length;
    const updatedCount = results.filter((r) => r.status === "updated").length;
    const existingCount = results.filter((r) => r.status === "existing").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    try {
      revalidatePath("/data-ats");
      revalidatePath("/komunitas");
      revalidatePath("/profil");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("Gagal revalidasi path pasca sinkronisasi ATS:", revalErr);
    }

    return NextResponse.json({
      success: true,
      message: `Proses sinkronisasi data ATS selesai: ${createdCount} data baru ditambahkan, ${updatedCount} data berhasil diperbarui, ${existingCount} data tidak berubah, ${errorCount} gagal.`,
      createdCount,
      updatedCount,
      existingCount,
      errorCount,
      results,
    });
  } catch (err: any) {
    console.error("API Sync Data ATS Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/data-ats
 * Mengambil data ATS terkini beserta status verifikasi
 * untuk ditarik ke Google Sheet (fitur "Tarik Data Terbaru dari Website")
 */
export async function GET(req: NextRequest) {
  try {
    if (!verifySecret(req)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak: Secret Key tidak valid. Pastikan CONFIG.API_SECRET diatur ke 'jarimas-tegal-sync-2026'.",
        },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Hitung total baris data ATS
    const { count: totalRowCount, error: countErr } = await supabase
      .from("data_anak")
      .select("*", { count: "exact", head: true })
      .or("is_sekolah.eq.false,is_sekolah.is.null,nama_sekolah.ilike.%ATS%,alasan_sekolah.ilike.%KEINGINAN%");

    if (countErr) {
      console.warn("API GET data_ats count warning:", countErr.message);
    }

    const totalToFetch = totalRowCount && totalRowCount > 0 ? totalRowCount : 1000;
    const CHUNK_SIZE = 1000;
    const numChunks = Math.max(1, Math.ceil(totalToFetch / CHUNK_SIZE));

    const chunkPromises = [];
    for (let i = 0; i < numChunks; i++) {
      chunkPromises.push(
        supabase
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
            status_approval,
            created_at,
            updated_at
          `)
          .or("is_sekolah.eq.false,is_sekolah.is.null,nama_sekolah.ilike.%ATS%,alasan_sekolah.ilike.%KEINGINAN%")
          .order("created_at", { ascending: false })
          .range(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE - 1)
      );
    }

    const chunkResults = await Promise.all(chunkPromises);
    const rawChildren = chunkResults.flatMap((res) => res.data || []);

    // Filter hanya anak ATS riil (bukan PAUD dan bukan data dummy)
    const atsChildren = rawChildren.filter(
      (c: any) => isDataAtsRecord(c) && !isDummyDataAnak(c) && c.is_sekolah !== true
    );

    const formattedList = atsChildren.map((c: any) => {
      const parsed = parseAtsDetails(c.alasan_sekolah);

      return {
        id: c.id,
        nama_lengkap: c.nama_lengkap,
        jenis_kelamin: c.jenis_kelamin,
        nama_orangtua: c.nama_orangtua || "-",
        usia: calculateUsiaFromBirthDate(c.tanggal_lahir),
        tanggal_lahir: c.tanggal_lahir || "",
        nomor_hp: c.nomor_hp || "",
        tinggal_bersama: c.tinggal_bersama || "Orang Tua",
        alamat_jalan: parsed.alamat || "",
        rt: parsed.rt || "",
        rw: parsed.rw || "",
        kelurahan: parsed.kelurahan || "",
        kecamatan: parsed.kecamatan || "",
        jenjang_asal: parsed.jenjangAsal || "",
        sekolah_asal: parsed.sekolahSebelumnya || "",
        kelas_terakhir: parsed.kelasTerakhir || "",
        keinginan_sekolah: normalizeKeinginanSekolah(parsed.keinginan),
        alasan_tidak_sekolah: parsed.alasan || "Tidak ada biaya",
        keterangan: parsed.keterangan || "",
        status_verifikasi: c.status_approval === "approved" ? "Terverifikasi" : "Pending",
        terakhir_update: c.updated_at || c.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      total: formattedList.length,
      data: formattedList,
    });
  } catch (err: any) {
    console.error("API GET Data ATS Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
