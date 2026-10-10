import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  findPaudLocation,
  serializeDataAnakAlasan,
  parseDataAnakDetails,
  isDataAtsRecord,
} from "@/lib/data-anak-helpers";
import { toValidUUID } from "@/lib/utils";

// Secret token otentikasi sinkronisasi
const DEFAULT_SYNC_SECRET = "jarimas-tegal-sync-2026";
const DEFAULT_SYSTEM_USER_ID = "1d827e22-9253-486a-a948-3fac6d01ae38"; // Akun Admin pengelola

function getSupabaseAdmin() {
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

function calculateBirthDateFromUsia(usia?: string | number | null): string {
  const currentYear = new Date().getFullYear();
  let numUsia = 4;
  if (usia !== undefined && usia !== null && usia !== "") {
    const parsed = Number(usia);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
      numUsia = parsed;
    }
  }
  const birthYear = currentYear - numUsia;
  return `${birthYear}-07-01`;
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

    if (!verifySecret(req, body.secret)) {
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
    const items = Array.isArray(body.items) ? body.items : body.records || [];

    if (items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tidak ada baris data anak yang dikirim.",
      }, { status: 400 });
    }

    // Ambil daftar komunitas aktif untuk mencocokkan PAUD / Kelurahan
    const { data: dbKomunitas } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan")
      .limit(300);

    const results: Array<{
      row_index: number;
      id: string;
      status: "created" | "existing" | "updated" | "error";
      nama_lengkap: string;
      message?: string;
    }> = [];

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

      const rawJk = String(item.jenis_kelamin || "").trim().toUpperCase();
      const jk: "L" | "P" = rawJk.startsWith("P") || rawJk === "PEREMPUAN" ? "P" : "L";
      const namaOrangtua = String(item.nama_orangtua || "").trim() || "-";
      const namaPaud = String(item.nama_paud || "").trim();
      const isSekolah = Boolean(namaPaud && namaPaud.toLowerCase() !== "belum sekolah");

      // Deteksi lokasi dan wilayah Satuan PAUD
      const paudLoc = isSekolah ? findPaudLocation(namaPaud) : null;
      const targetKecamatan = paudLoc?.kecamatan || item.kecamatan || "Kota Tegal";
      const targetKelurahan = paudLoc?.kelurahan || item.kelurahan || "Semua Kelurahan";

      // Cari Komunitas yang paling cocok
      let targetKomunitasId = "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703"; // Default Komunitas
      if (dbKomunitas && dbKomunitas.length > 0) {
        // 1. Coba cocokkan dengan komunitas PAUD
        if (isSekolah) {
          const matchPaudKom = dbKomunitas.find(
            (k) =>
              k.jenis === "satuan_paud" &&
              (k.nama.toLowerCase().includes(namaPaud.toLowerCase()) ||
                namaPaud.toLowerCase().includes(k.nama.toLowerCase()))
          );
          if (matchPaudKom) targetKomunitasId = matchPaudKom.id;
        }

        // 2. Jika belum cocok, cari berdasarkan Kelurahan
        if (targetKomunitasId === "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703" && targetKelurahan !== "Semua Kelurahan") {
          const matchKelKom = dbKomunitas.find(
            (k) =>
              k.kelurahan?.toLowerCase() === targetKelurahan.toLowerCase() &&
              k.jenis === "warga_kita"
          );
          if (matchKelKom) targetKomunitasId = matchKelKom.id;
        }
      }

      // Cek apakah data anak sudah ada di database
      let existingChildId: string | null = null;

      // 1. Cek berdasarkan ID jika sheet sudah memiliki ID
      if (item.id && String(item.id).trim().length > 10) {
        const { data: foundById } = await supabase
          .from("data_anak")
          .select("id")
          .eq("id", toValidUUID(item.id))
          .maybeSingle();

        if (foundById) {
          existingChildId = foundById.id;
        }
      }

      // 2. Cek berdasarkan Nama Lengkap dan Nama Orang Tua jika ID belum ada
      if (!existingChildId) {
        const { data: foundByName } = await supabase
          .from("data_anak")
          .select("id, alasan_sekolah")
          .ilike("nama_lengkap", namaLengkap)
          .ilike("nama_orangtua", namaOrangtua)
          .maybeSingle();

        if (foundByName && !isDataAtsRecord(foundByName)) {
          existingChildId = foundByName.id;
        }
      }

      // JIKA DATA SUDAH ADA: Kembalikan ID yang ada
      if (existingChildId) {
        results.push({
          row_index: rowIndex,
          id: existingChildId,
          status: "existing",
          nama_lengkap: namaLengkap,
          message: "Data anak sudah terdaftar sebelumnya di sistem.",
        });
        continue;
      }

      // JIKA BELUM ADA: Lakukan INSERT data baru
      const birthDate = calculateBirthDateFromUsia(item.usia);
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
        status_approval: "pending", // Status awal menunggu verifikasi kader / posyandu
        created_by: DEFAULT_SYSTEM_USER_ID,
        created_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await supabase
        .from("data_anak")
        .insert(childPayload)
        .select("id")
        .single();

      if (insertError || !inserted) {
        results.push({
          row_index: rowIndex,
          id: "",
          status: "error",
          nama_lengkap: namaLengkap,
          message: insertError?.message || "Gagal menyimpan ke database Supabase.",
        });
      } else {
        results.push({
          row_index: rowIndex,
          id: inserted.id,
          status: "created",
          nama_lengkap: namaLengkap,
          message: "Data anak baru berhasil didaftarkan ke sistem.",
        });
      }
    }

    const createdCount = results.filter((r) => r.status === "created").length;
    const existingCount = results.filter((r) => r.status === "existing").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      success: true,
      message: `Proses sinkronisasi selesai: ${createdCount} data baru ditambahkan, ${existingCount} data sudah ada, ${errorCount} gagal.`,
      createdCount,
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

    // Filter hanya anak balita/PAUD (bukan data ATS)
    const validChildren = (children || []).filter((c) => !isDataAtsRecord(c));

    const formattedList = validChildren.map((c) => {
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
