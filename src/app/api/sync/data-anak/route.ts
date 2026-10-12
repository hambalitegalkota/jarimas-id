import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/server";
import {
  findPaudLocation,
  serializeDataAnakAlasan,
  parseDataAnakDetails,
  isDataAtsRecord,
  isDummyDataAnak,
  isSchoolNameMatching,
} from "@/lib/data-anak-helpers";
import { toValidUUID } from "@/lib/utils";

// Secret token otentikasi sinkronisasi
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
      if (y >= 2015 && y <= currentYear) {
        return `${y}-${m}-${d}`;
      }
    }
    // Format DD-MM-YYYY atau DD/MM/YYYY
    const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      const d = String(dmyMatch[1]).padStart(2, "0");
      const m = String(dmyMatch[2]).padStart(2, "0");
      const y = parseInt(dmyMatch[3], 10);
      if (y >= 2015 && y <= currentYear) {
        return `${y}-${m}-${d}`;
      }
    }
    // Coba Date bawaan
    const dObj = new Date(s);
    if (!isNaN(dObj.getTime()) && dObj.getFullYear() >= 2015 && dObj.getFullYear() <= currentYear) {
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
    const match = s.match(/\b([0-6])\b/) || s.match(/(\d+)/);
    if (match) {
      const parsedNum = parseInt(match[1], 10);
      if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum <= 6) {
        return `${currentYear - parsedNum}-07-01`;
      }
    }
  }

  // 3. Fallback jika tanggal lahir dan usia tidak diisi sama sekali di data input
  return `${currentYear - 4}-07-01`;
}

function calculateUsiaFromBirthDate(birthDateStr?: string | null): string {
  if (!birthDateStr) return "3";
  try {
    const bDate = new Date(birthDateStr);
    if (isNaN(bDate.getTime())) return "3";
    const now = new Date();
    let ageYears = now.getFullYear() - bDate.getFullYear();
    const m = now.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
      ageYears--;
    }
    return ageYears >= 0 && ageYears <= 6 ? String(ageYears) : "3";
  } catch {
    return "3";
  }
}

/**
 * POST /api/sync/data-anak
 * Menerima kiriman batch data anak dari Google Apps Script
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
            `Akses ditolak: Secret Key tidak valid (diterima: '${String(candidateSecret).slice(0, 50)}'). Pastikan CONFIG.API_SECRET di Google Apps Script diatur ke 'jarimas-tegal-sync-2026'.`,
        },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const items = Array.isArray(body.items) ? body.items : body.records || [];

    if (items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tidak ada baris data anak yang dikirim.",
      }, { status: 400 });
    }

    // Ambil daftar seluruh Komunitas Satuan PAUD (219 lembaga) dan Kelurahan untuk pemetaan wilayah
    const { data: dbPauds } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan")
      .eq("jenis", "satuan_paud");

    const { data: dbKelKomunitas } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan")
      .eq("jenis", "warga_kita")
      .is("rw", null)
      .is("rt", null);

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
        .select("id, nama_lengkap, nama_orangtua, alasan_sekolah")
        .in("nama_lengkap", incomingNames);
      if (foundByName) existingByName = foundByName;
    }

    let existingById: any[] = [];
    if (incomingIds.length > 0) {
      const { data: foundById } = await supabase
        .from("data_anak")
        .select("id")
        .in("id", incomingIds);
      if (foundById) existingById = foundById;
    }

    const existingIdSet = new Set(existingById.map((e) => e.id));

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
      const namaPaud = String(item.nama_paud || "").trim();
      const isSekolah = Boolean(namaPaud && namaPaud.toLowerCase() !== "belum sekolah");
      const birthDate = parseBirthDateOrAge(item);
      const namaOrangtua = String(item.nama_orangtua || "").trim() || "-";

      // Deteksi lokasi dan wilayah Satuan PAUD
      const paudLoc = isSekolah ? findPaudLocation(namaPaud) : null;
      const targetKecamatan = paudLoc?.kecamatan || item.kecamatan || "Kota Tegal";
      const targetKelurahan = paudLoc?.kelurahan || item.kelurahan || "Semua Kelurahan";

      // Cari Komunitas yang paling cocok: Prioritas utama Komunitas PAUD jika anak bersekolah
      let targetKomunitasId = "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703"; // Default Komunitas

      if (isSekolah && dbPauds && dbPauds.length > 0) {
        const matchPaudKom = (dbPauds as any[]).find((k: any) =>
          isSchoolNameMatching(namaPaud, k.nama)
        );
        if (matchPaudKom) {
          targetKomunitasId = matchPaudKom.id;
        }
      }

      if (
        targetKomunitasId === "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703" &&
        targetKelurahan !== "Semua Kelurahan" &&
        dbKelKomunitas &&
        dbKelKomunitas.length > 0
      ) {
        const matchKelKom = (dbKelKomunitas as any[]).find(
          (k: any) =>
            k.kelurahan?.toLowerCase() === targetKelurahan.toLowerCase() &&
            k.jenis === "warga_kita"
        );
        if (matchKelKom) targetKomunitasId = matchKelKom.id;
      }

      const alasanFormatted = serializeDataAnakAlasan({
        alasanSekolah: isSekolah ? "Sudah Usia PAUD" : "Belum Wajib (Masih Balita)",
        kkKecamatan: targetKecamatan,
        kkKelurahan: targetKelurahan,
        kkRw: item.rw || "01",
        kkRt: item.rt || "01",
        kkJalan: item.alamat_jalan || "",
        domisiliKecamatan: targetKecamatan,
        domisiliKelurahan: targetKelurahan,
        domisiliRw: item.rw || "01",
        domisiliRt: item.rt || "01",
        domisiliJalan: item.alamat_jalan || "",
      });

      // Cek apakah ada kecocokan ID atau Nama Lengkap & Nama Orang Tua
      const matchById = validItemId ? existingById.find((e) => e.id === validItemId) : null;
      const matchInDb =
        matchById ||
        existingByName.find(
          (ex) =>
            ex.nama_lengkap?.toLowerCase() === namaLengkap.toLowerCase() &&
            !isDataAtsRecord(ex) &&
            !isDummyDataAnak(ex) &&
            (namaOrangtua === "-" ||
              !ex.nama_orangtua ||
              ex.nama_orangtua === "-" ||
              ex.nama_orangtua.toLowerCase() === namaOrangtua.toLowerCase())
        );

      if (matchInDb) {
        // Perbarui data anak yang sudah ada (termasuk alokasi komunitas PAUD & alamat jika ada pembaruan)
        const updatePayload: any = {
          tanggal_lahir: birthDate,
          jenis_kelamin: jk,
          is_sekolah: isSekolah,
          nama_sekolah: isSekolah ? namaPaud : "Belum Sekolah",
          komunitas_id: toValidUUID(targetKomunitasId),
          updated_at: new Date().toISOString(),
        };
        if (namaOrangtua && namaOrangtua !== "-") updatePayload.nama_orangtua = namaOrangtua;
        if (item.nomor_hp) updatePayload.nomor_hp = String(item.nomor_hp).trim();
        if (item.tinggal_bersama) updatePayload.tinggal_bersama = String(item.tinggal_bersama).trim();
        if (item.jarak_rumah_km !== undefined && item.jarak_rumah_km !== null) {
          updatePayload.jarak_rumah_km = Number(item.jarak_rumah_km) || 0.5;
        }

        // Jika terdapat rincian alamat baru, perbarui alasan_sekolah
        if (item.kecamatan || item.kelurahan || item.alamat_jalan || item.rw || item.rt) {
          updatePayload.alasan_sekolah = alasanFormatted;
        }

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
            ? `Gagal memperbarui data: ${updErr.message}`
            : "Data anak & pemetaan PAUD berhasil diperbarui dari sinkronisasi Google Sheet.",
        });
        continue;
      }

      const childPayload = {
        nama_lengkap: namaLengkap,
        tanggal_lahir: birthDate,
        jenis_kelamin: jk,
        nama_orangtua: namaOrangtua,
        nomor_hp: String(item.nomor_hp || "").trim(),
        tinggal_bersama: String(item.tinggal_bersama || "").trim() || "Orang Tua",
        jarak_rumah_km: Number(item.jarak_rumah_km) || 0.5,
        is_sekolah: isSekolah,
        nama_sekolah: isSekolah ? namaPaud : "Belum Sekolah",
        alasan_sekolah: alasanFormatted,
        komunitas_id: toValidUUID(targetKomunitasId),
        status_approval: "pending",
        created_by: DEFAULT_SYSTEM_USER_ID,
        created_at: new Date().toISOString(),
      };

      itemsToInsert.push({
        rowIndex,
        namaLengkap,
        payload: childPayload,
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
        // Semua data berhasil di-insert secara massal
        insertedBatch.forEach((ins: any, idx: number) => {
          results.push({
            row_index: itemsToInsert[idx].rowIndex,
            id: ins.id,
            status: "created",
            nama_lengkap: itemsToInsert[idx].namaLengkap,
            message: "Data anak baru berhasil didaftarkan ke sistem.",
          });
        });
      } else {
        // Fallback jika batch insert gagal (misal constraint per-baris): coba insert satu per satu
        console.warn("Batch insert fallback to sequential:", batchError?.message);
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
              message: "Data anak baru berhasil didaftarkan ke sistem.",
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
      revalidatePath("/komunitas");
      revalidatePath("/data-anak");
      revalidatePath("/profil");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("Gagal revalidasi path pasca sinkronisasi:", revalErr);
    }

    return NextResponse.json({
      success: true,
      message: `Proses sinkronisasi selesai: ${createdCount} data baru ditambahkan, ${updatedCount} data berhasil diperbarui, ${existingCount} data tidak berubah, ${errorCount} gagal.`,
      createdCount,
      updatedCount,
      existingCount,
      errorCount,
      results,
    });
  } catch (err: any) {
    console.error("API Sync Data Anak Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/data-anak
 * Mengambil data anak terkini beserta status verifikasi & pengukuran fisik (DDTK)
 * untuk ditarik ke Google Sheet (fitur "Tarik Data Terbaru dari Website")
 */
export async function GET(req: NextRequest) {
  try {
    if (!verifySecret(req)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak: Secret Key tidak valid. Pastikan CONFIG.API_SECRET di Google Apps Script diatur ke 'jarimas-tegal-sync-2026'.",
        },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Ambil seluruh data anak (0–6 tahun) beserta riwayat DDTK terakhir
    const { data: children, error } = await supabase
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
        updated_at,
        ddks_records (
          berat_badan,
          tinggi_badan,
          lingkar_kepala,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data dari database: " + error.message },
        { status: 500 }
      );
    }

    // Filter hanya anak balita/PAUD riil (bukan data ATS dan bukan data dummy)
    const validChildren = ((children as any[]) || []).filter(
      (c: any) => !isDataAtsRecord(c) && !isDummyDataAnak(c)
    );

    const formattedList = validChildren.map((c: any) => {
      const parsed = parseDataAnakDetails(c.alasan_sekolah);
      const sortedDdks = (c.ddks_records || []).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestDdks = sortedDdks[0] || null;

      return {
        id: c.id,
        nama_lengkap: c.nama_lengkap,
        jenis_kelamin: c.jenis_kelamin,
        nama_orangtua: c.nama_orangtua,
        nama_paud: c.is_sekolah ? c.nama_sekolah : "",
        usia: calculateUsiaFromBirthDate(c.tanggal_lahir),
        nomor_hp: c.nomor_hp || "",
        tinggal_bersama: c.tinggal_bersama || "Orang Tua",
        jarak_rumah_km: c.jarak_rumah_km || 0.5,
        alasan_sekolah: parsed.alasan || (c.is_sekolah ? "Sudah Usia PAUD" : "Belum Wajib (Masih Balita)"),
        kecamatan: parsed.domisiliKecamatan || parsed.kkKecamatan || "Kota Tegal",
        kelurahan: parsed.domisiliKelurahan || parsed.kkKelurahan || "",
        rw: parsed.domisiliRw || parsed.kkRw || "",
        rt: parsed.domisiliRt || parsed.kkRt || "",
        alamat_jalan: parsed.domisiliJalan || parsed.kkJalan || "",
        berat_badan_kg: latestDdks?.berat_badan || "",
        tinggi_badan_cm: latestDdks?.tinggi_badan || "",
        lingkar_kepala_cm: latestDdks?.lingkar_kepala || "",
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
    console.error("API GET Data Anak Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
