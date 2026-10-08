import * as XLSX from "xlsx";
import { serializeDataAnakAlasan } from "@/lib/data-anak-helpers";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { findPaudLocation } from "@/lib/data-anak-helpers";

export interface ParsedExcelChildRow {
  index: number;
  namaLengkap: string;
  tanggalLahir: string;
  usia: string;
  jenisKelamin: "L" | "P";
  namaOrangtua: string;
  nomorHp: string;
  tinggalBersama: string;
  jarakRumahKm: number;
  isSekolah: boolean;
  namaSekolah: string;
  alasanSekolah: string;
  kkKabupaten: string;
  kkKecamatan: string;
  kkKelurahan: string;
  kkRw: string;
  kkRt: string;
  kkJalan: string;
  domisiliKabupaten: string;
  domisiliKecamatan: string;
  domisiliKelurahan: string;
  domisiliRw: string;
  domisiliRt: string;
  domisiliJalan: string;
  beratBadan?: number | null;
  tinggiBadan?: number | null;
  panjangBadan?: number | null;
  lingkarKepala?: number | null;
  catatanDdks?: string;
  isValid: boolean;
  errors: string[];
}

export interface ParseExcelResult {
  fileName: string;
  totalRows: number;
  validRows: ParsedExcelChildRow[];
  invalidRows: ParsedExcelChildRow[];
  allRows: ParsedExcelChildRow[];
  headersFound: string[];
}

/**
 * Normalisasi format tanggal dari Excel (serial number, format YYYY-MM-DD, DD/MM/YYYY, dsb)
 */
export function normalizeExcelDate(val: any, fallbackUsia?: string | number): { tanggalLahir: string; usia: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentDay = String(now.getDate()).padStart(2, "0");

  if (!val && !fallbackUsia) {
    return {
      tanggalLahir: `${currentYear - 3}-${currentMonth}-${currentDay}`,
      usia: "3",
    };
  }

  // Jika berupa numeric serial date dari Excel (contoh: 44696)
  if (typeof val === "number" && val > 1000) {
    try {
      const parsedDate = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(parsedDate.getTime())) {
        const y = parsedDate.getUTCFullYear();
        const m = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
        const d = String(parsedDate.getUTCDate()).padStart(2, "0");
        let age = currentYear - y;
        if (
          now.getMonth() + 1 < parsedDate.getUTCMonth() + 1 ||
          (now.getMonth() + 1 === parsedDate.getUTCMonth() + 1 && now.getDate() < parsedDate.getUTCDate())
        ) {
          age = Math.max(0, age - 1);
        }
        return {
          tanggalLahir: `${y}-${m}-${d}`,
          usia: String(Math.min(6, Math.max(0, age))),
        };
      }
    } catch {
      // ignore fallback
    }
  }

  const str = String(val || "").trim();

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const [yStr, mStr, dStr] = str.split("-");
    const y = parseInt(yStr, 10);
    const m = mStr.padStart(2, "0");
    const d = dStr.padStart(2, "0");
    let age = Math.max(0, Math.min(6, currentYear - y));
    return {
      tanggalLahir: `${y}-${m}-${d}`,
      usia: String(age),
    };
  }

  // Format DD/MM/YYYY atau DD-MM-YYYY
  if (/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.test(str)) {
    const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const d = match[1].padStart(2, "0");
      const m = match[2].padStart(2, "0");
      const y = parseInt(match[3], 10);
      let age = Math.max(0, Math.min(6, currentYear - y));
      return {
        tanggalLahir: `${y}-${m}-${d}`,
        usia: String(age),
      };
    }
  }

  // Fallback berdasarkan Usia angka (0-6)
  const rawUsia = String(fallbackUsia || val || "3").replace(/\D/g, "");
  const ageNum = parseInt(rawUsia, 10);
  const safeAge = !isNaN(ageNum) && ageNum >= 0 && ageNum <= 6 ? ageNum : 3;
  const birthYear = currentYear - safeAge;

  return {
    tanggalLahir: `${birthYear}-${currentMonth}-${currentDay}`,
    usia: String(safeAge),
  };
}

/**
 * Normalisasi Jenis Kelamin (L/P)
 */
export function normalizeJenisKelamin(val: any): "L" | "P" {
  if (!val) return "L";
  const str = String(val).trim().toLowerCase();
  if (
    str.startsWith("p") ||
    str.includes("perempuan") ||
    str.includes("wanita") ||
    str.includes("female") ||
    str.includes("f")
  ) {
    return "P";
  }
  return "L";
}

/**
 * Normalisasi Nilai Numerik RT / RW
 */
export function normalizeRtRw(val: any, defaultVal = "01"): string {
  if (val === undefined || val === null) return defaultVal;
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return defaultVal;
  const num = parseInt(digits, 10);
  return isNaN(num) ? defaultVal : String(num).padStart(2, "0");
}

/**
 * Parse Excel Buffer menjadi baris-baris data anak siap simpan
 */
export function parseExcelDataAnak(
  fileBuffer: ArrayBuffer,
  komunitas: any,
  fileName = "data.xlsx"
): ParseExcelResult {
  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    return {
      fileName,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      allRows: [],
      headersFound: [],
    };
  }

  // Convert to JSON array of objects with raw headers
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    raw: true,
    defval: "",
  });

  // Ekstraksi Metadata Komunitas untuk default fallback
  const meta = extractKomunitasMetadata(komunitas || {});
  const paudLoc =
    komunitas?.jenis === "satuan_paud" || meta.jenis === "satuan_paud"
      ? findPaudLocation(komunitas?.nama || komunitas?.id)
      : null;

  const defaultKec = paudLoc?.kecamatan || meta.rawKec || "Tegal Timur";
  const defaultKel = paudLoc?.kelurahan || meta.rawKel || "Kejambon";
  const defaultRw = meta.rawRw || "01";
  const defaultRt = meta.rawRt || "01";
  const isPaud = komunitas?.jenis === "satuan_paud" || meta.jenis === "satuan_paud";

  const headersFound = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  // Helper pencari nilai kolom dari berbagai alias header
  const findValue = (row: Record<string, any>, aliases: string[]): any => {
    for (const key of Object.keys(row)) {
      const cleanKey = key.trim().toLowerCase().replace(/[\*\_\-\s\(\)\:\.\/]/g, "");
      for (const alias of aliases) {
        const cleanAlias = alias.toLowerCase().replace(/[\*\_\-\s\(\)\:\.\/]/g, "");
        if (cleanKey === cleanAlias || cleanKey.includes(cleanAlias)) {
          return row[key];
        }
      }
    }
    return undefined;
  };

  const allRows: ParsedExcelChildRow[] = [];
  const validRows: ParsedExcelChildRow[] = [];
  const invalidRows: ParsedExcelChildRow[] = [];

  jsonData.forEach((row, idx) => {
    const errors: string[] = [];

    // 1. Nama Lengkap Anak
    const rawNama = findValue(row, [
      "namalengkap",
      "namalengkapanak",
      "namaanak",
      "nama",
      "nama_anak",
      "namasiswa",
      "nama_lengkap",
    ]);
    const namaLengkap = String(rawNama || "").trim();

    // Lewati baris kosong jika seluruh baris tidak ada isinya
    if (!namaLengkap && Object.values(row).every((v) => !v || String(v).trim() === "")) {
      return;
    }

    if (!namaLengkap || namaLengkap.length < 2) {
      errors.push("Nama lengkap anak wajib diisi (minimal 2 huruf)");
    }

    // 2. Tanggal Lahir & Usia
    const rawTgl = findValue(row, [
      "tanggallahir",
      "tgllahir",
      "tgl_lahir",
      "tanggallahiranak",
      "tgl_lahir_anak",
      "birthdate",
      "dob",
    ]);
    const rawUsia = findValue(row, ["usia", "umur", "usiaanak", "umur_anak", "age"]);
    const { tanggalLahir, usia } = normalizeExcelDate(rawTgl, rawUsia);

    // 3. Jenis Kelamin
    const rawJk = findValue(row, [
      "jeniskelamin",
      "jk",
      "gender",
      "kelamin",
      "sex",
      "lp",
    ]);
    const jenisKelamin = normalizeJenisKelamin(rawJk);

    // 4. Nama Orang Tua / Wali
    const rawOrtu = findValue(row, [
      "namaorangtua",
      "namaortu",
      "orangtua",
      "wali",
      "namaorangtuawali",
      "nama_ibu",
      "nama_ayah",
      "ibu",
      "ayah",
      "nama_orangtua",
    ]);
    const namaOrangtua = String(rawOrtu || "").trim();
    if (!namaOrangtua || namaOrangtua.length < 2) {
      errors.push("Nama orang tua / wali wajib diisi (minimal 2 huruf)");
    }

    // 5. Kontak / No HP
    const rawHp = findValue(row, [
      "nomorhp",
      "nohp",
      "nohpwa",
      "telepon",
      "notelepon",
      "handphone",
      "phone",
      "wa",
      "whatsapp",
    ]);
    let nomorHp = String(rawHp || "").trim();
    if (nomorHp.startsWith("62")) {
      nomorHp = "0" + nomorHp.slice(2);
    }

    // 6. Tinggal Bersama & Jarak
    const rawTinggal = findValue(row, ["tinggalbersama", "tinggal", "status_tinggal"]);
    const tinggalBersama = String(rawTinggal || "Orang Tua").trim() || "Orang Tua";

    const rawJarak = findValue(row, ["jarak", "jarakrumah", "jarakkm", "jarak_rumah_km"]);
    const jarakRumahKm = parseFloat(String(rawJarak || "0.5").replace(",", ".")) || 0.5;

    // 7. Alamat KK
    const rawKkKab = findValue(row, ["kkkabupaten", "kkkab", "kabupatenkk", "kk_kabupaten"]);
    const kkKabupaten = String(rawKkKab || "Kota Tegal").trim() || "Kota Tegal";

    const rawKkKec = findValue(row, ["kkkecamatan", "kkkec", "kecamatankk", "kk_kecamatan", "kecamatan"]);
    const kkKecamatan = String(rawKkKec || defaultKec).trim() || defaultKec;

    const rawKkKel = findValue(row, ["kkkelurahan", "kkkel", "kelurahankk", "kk_kelurahan", "kelurahan", "desa"]);
    const kkKelurahan = String(rawKkKel || defaultKel).trim() || defaultKel;

    const rawKkRw = findValue(row, ["kkrw", "rwkk", "kk_rw", "rw"]);
    const kkRw = normalizeRtRw(rawKkRw, defaultRw);

    const rawKkRt = findValue(row, ["kkrt", "rtkk", "kk_rt", "rt"]);
    const kkRt = normalizeRtRw(rawKkRt, defaultRt);

    const rawKkJalan = findValue(row, ["kkjalan", "jalankk", "kk_jalan", "alamat", "alamatkk", "jalan"]);
    const kkJalan = String(rawKkJalan || "").trim();

    // 8. Alamat Domisili
    const rawDomKab = findValue(row, ["domisilikabupaten", "domkab", "kabupatendomisili", "dom_kab"]);
    const domisiliKabupaten = String(rawDomKab || kkKabupaten || "Kota Tegal").trim() || "Kota Tegal";

    const rawDomKec = findValue(row, ["domisilikecamatan", "domkec", "kecamatandomisili", "dom_kec"]);
    const domisiliKecamatan = String(rawDomKec || kkKecamatan || defaultKec).trim() || defaultKec;

    const rawDomKel = findValue(row, ["domisilikelurahan", "domkel", "kelurahandomisili", "dom_kel"]);
    const domisiliKelurahan = String(rawDomKel || kkKelurahan || defaultKel).trim() || defaultKel;

    const rawDomRw = findValue(row, ["domisilirw", "domrw", "rwdomisili", "dom_rw"]);
    const domisiliRw = normalizeRtRw(rawDomRw, kkRw || defaultRw);

    const rawDomRt = findValue(row, ["domisilirt", "domrt", "rtdomisili", "dom_rt"]);
    const domisiliRt = normalizeRtRw(rawDomRt, kkRt || defaultRt);

    const rawDomJalan = findValue(row, ["domisilijalan", "domjalan", "jalandomisili", "dom_jalan", "alamatdomisili"]);
    const domisiliJalan = String(rawDomJalan || kkJalan || "").trim();

    // 9. Status Sekolah
    const rawIsSekolah = findValue(row, ["issekolah", "statussekolah", "sudahsekolah", "sekolah"]);
    let isSekolahVal = isPaud;
    if (rawIsSekolah !== undefined) {
      const isSekStr = String(rawIsSekolah).toLowerCase();
      if (isSekStr.includes("tidak") || isSekStr.includes("belum") || isSekStr === "false" || isSekStr === "0") {
        isSekolahVal = false;
      } else if (isSekStr.includes("ya") || isSekStr.includes("sudah") || isSekStr === "true" || isSekStr === "1") {
        isSekolahVal = true;
      }
    }

    const rawNamaSekolah = findValue(row, ["namasekolah", "namapaud", "sekolahpaud", "nama_sekolah"]);
    const namaSekolah = String(rawNamaSekolah || (isPaud ? komunitas?.nama || "Satuan PAUD" : "Belum Sekolah")).trim();

    const rawAlasan = findValue(row, ["alasansekolah", "alasan", "keterangan", "alasan_sekolah"]);
    const alasanSekolah = String(rawAlasan || (isPaud ? "Sudah Usia PAUD" : "Belum Wajib (Masih Balita)")).trim();

    // 10. Data DDTK (Opsional)
    const rawBb = findValue(row, ["beratbadan", "bb", "berat", "berat_badan"]);
    const rawTb = findValue(row, ["tinggibadan", "tb", "tinggi", "tinggi_badan"]);
    const rawPb = findValue(row, ["panjangbadan", "pb", "panjang", "panjang_badan"]);
    const rawLk = findValue(row, ["lingkarkepala", "lk", "lingkar_kepala"]);
    const rawCatatan = findValue(row, ["catatanddks", "catatanddtk", "catatan", "keterangan"]);

    const beratBadan = rawBb ? parseFloat(String(rawBb).replace(",", ".")) : null;
    const tinggiBadan = rawTb ? parseFloat(String(rawTb).replace(",", ".")) : null;
    const panjangBadan = rawPb ? parseFloat(String(rawPb).replace(",", ".")) : null;
    const lingkarKepala = rawLk ? parseFloat(String(rawLk).replace(",", ".")) : null;
    const catatanDdks = String(rawCatatan || "").trim();

    const item: ParsedExcelChildRow = {
      index: idx + 1,
      namaLengkap,
      tanggalLahir,
      usia,
      jenisKelamin,
      namaOrangtua,
      nomorHp,
      tinggalBersama,
      jarakRumahKm,
      isSekolah: isSekolahVal,
      namaSekolah,
      alasanSekolah,
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
      beratBadan,
      tinggiBadan,
      panjangBadan,
      lingkarKepala,
      catatanDdks,
      isValid: errors.length === 0,
      errors,
    };

    allRows.push(item);
    if (item.isValid) {
      validRows.push(item);
    } else {
      invalidRows.push(item);
    }
  });

  return {
    fileName,
    totalRows: allRows.length,
    validRows,
    invalidRows,
    allRows,
    headersFound,
  };
}

/**
 * Generate Template Excel (.xlsx) dengan kolom terstandarisasi dan petunjuk pengisian
 */
export function generateTemplateDataAnakWorkbook(
  komunitasNama = "KB AISYIYAH ANAK SHOLEH",
  jenisKomunitas = "satuan_paud"
): Uint8Array {
  const wb = XLSX.utils.book_new();

  const isPaud = jenisKomunitas === "satuan_paud";

  // 1. Data Sheet Header & Sample Rows
  const headers = [
    "No",
    "Nama Lengkap Anak *",
    "Tanggal Lahir (YYYY-MM-DD)",
    "Usia (0-6)",
    "Jenis Kelamin (L/P) *",
    "Nama Orang Tua / Wali *",
    "Nomor HP / WhatsApp",
    "Tinggal Bersama",
    "Jarak Rumah ke Lokasi (Km)",
    "Alamat KK - Kabupaten/Kota",
    "Alamat KK - Kecamatan",
    "Alamat KK - Kelurahan",
    "Alamat KK - RW (01-99)",
    "Alamat KK - RT (01-99)",
    "Alamat KK - Jalan / No Rumah",
    "Alamat Domisili - Kabupaten/Kota",
    "Alamat Domisili - Kecamatan",
    "Alamat Domisili - Kelurahan",
    "Alamat Domisili - RW (01-99)",
    "Alamat Domisili - RT (01-99)",
    "Alamat Domisili - Jalan / No Rumah",
    "Status Sekolah (Sudah PAUD / Belum Sekolah)",
    "Nama Satuan PAUD / Sekolah",
    "Alasan Sekolah",
    "Berat Badan (kg)",
    "Tinggi Badan (cm)",
    "Lingkar Kepala (cm)",
    "Catatan DDTK / Keterangan",
  ];

  const sampleRows = [
    [
      1,
      "Muhammad Rayyan Al-Fatih",
      "2022-04-15",
      "4",
      "L",
      "Budi Santoso & Siti Rahayu",
      "081234567890",
      "Orang Tua",
      0.5,
      "Kota Tegal",
      "Tegal Timur",
      "Kejambon",
      "02",
      "04",
      "Jl. Melati No. 15",
      "Kota Tegal",
      "Tegal Timur",
      "Kejambon",
      "02",
      "04",
      "Jl. Melati No. 15",
      isPaud ? "Sudah PAUD" : "Belum Sekolah",
      isPaud ? komunitasNama : "Belum Sekolah",
      isPaud ? "Sudah Usia PAUD" : "Belum Wajib (Masih Balita)",
      14.5,
      98.0,
      48.5,
      "Tumbuh kembang aktif dan sehat",
    ],
    [
      2,
      "Aisyah Putri Azzahra",
      "2023-08-20",
      "3",
      "P",
      "Ahmad Fauzi & Dewi Lestari",
      "085712345678",
      "Orang Tua",
      0.8,
      "Kota Tegal",
      "Tegal Timur",
      "Slerok",
      "01",
      "03",
      "Jl. Cempaka No. 8",
      "Kota Tegal",
      "Tegal Timur",
      "Slerok",
      "01",
      "03",
      "Jl. Cempaka No. 8",
      isPaud ? "Sudah PAUD" : "Belum Sekolah",
      isPaud ? komunitasNama : "Belum Sekolah",
      isPaud ? "Memberikan Pendidikan Terbaik Sejak Usia Dini" : "Belum Wajib (Masih Balita)",
      12.8,
      92.5,
      47.0,
      "Imunisasi dasar lengkap",
    ],
  ];

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [
    { wch: 6 }, // No
    { wch: 28 }, // Nama Lengkap Anak
    { wch: 22 }, // Tanggal Lahir
    { wch: 12 }, // Usia
    { wch: 18 }, // Jenis Kelamin
    { wch: 26 }, // Nama Orang Tua
    { wch: 18 }, // No HP
    { wch: 16 }, // Tinggal Bersama
    { wch: 18 }, // Jarak
    { wch: 22 }, // KK Kab
    { wch: 18 }, // KK Kec
    { wch: 18 }, // KK Kel
    { wch: 14 }, // KK RW
    { wch: 14 }, // KK RT
    { wch: 25 }, // KK Jalan
    { wch: 22 }, // Dom Kab
    { wch: 18 }, // Dom Kec
    { wch: 18 }, // Dom Kel
    { wch: 14 }, // Dom RW
    { wch: 14 }, // Dom RT
    { wch: 25 }, // Dom Jalan
    { wch: 24 }, // Status Sekolah
    { wch: 28 }, // Nama PAUD
    { wch: 26 }, // Alasan
    { wch: 15 }, // BB
    { wch: 15 }, // TB
    { wch: 15 }, // LK
    { wch: 30 }, // Catatan DDTK
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Template Data Anak");

  // 2. Petunjuk Pengisian Sheet
  const instructions = [
    ["PANDUAN PENGISIAN TEMPLATE EXCEL DATA ANAK JARIMAS-ID"],
    ["Komunitas Target: " + komunitasNama],
    [""],
    ["NO", "KOLOM", "STATUS", "FORMAT & CONTOH", "KETERANGAN"],
    ["1", "Nama Lengkap Anak", "Wajib", "Muhammad Rayyan", "Nama lengkap anak sesuai Akta / KK."],
    ["2", "Tanggal Lahir", "Disarankan", "2022-04-15 atau 15/04/2022", "Format tanggal lahir tahun-bulan-hari atau hari/bulan/tahun."],
    ["3", "Usia", "Opsional", "3 atau 4", "Usia anak (0 s/d 6 tahun). Otomatis dihitung jika tanggal lahir diisi."],
    ["4", "Jenis Kelamin", "Wajib", "L atau P (atau Laki-laki / Perempuan)", "Kode L untuk Laki-laki, P untuk Perempuan."],
    ["5", "Nama Orang Tua / Wali", "Wajib", "Budi Santoso / Siti Rahayu", "Nama ayah/ibu atau wali yang bertanggung jawab."],
    ["6", "Nomor HP / WhatsApp", "Opsional", "081234567890", "Nomor kontak yang dapat dihubungi untuk pemantauan/koordinasi."],
    ["7", "Tinggal Bersama", "Opsional", "Orang Tua / Wali / Nenek", "Status pengasuhan anak (default: Orang Tua)."],
    ["8", "Jarak Rumah", "Opsional", "0.5 (dalam kilometer)", "Jarak tempat tinggal anak ke lokasi sekolah / posyandu."],
    ["9", "Alamat KK & Domisili", "Disarankan", "Kota Tegal, Kec. Tegal Timur, Kel. Kejambon, RW 02, RT 04", "Data wilayah digunakan untuk pemetaan lintas komunitas otomatis."],
    ["10", "Status & Nama Sekolah", "Otomatis", isPaud ? komunitasNama : "Belum Sekolah", "Secara default terisi sesuai komunitas yang dituju."],
    ["11", "Pengukuran DDTK (BB/TB/LK)", "Opsional", "BB: 14.5 kg, TB: 98 cm, LK: 48.5 cm", "Catatan tumbuh kembang awal saat pendaftaran (opsional)."],
    [""],
    ["CATATAN PENTING:"],
    ["- Jangan mengubah judul kolom pada baris pertama agar sistem dapat membaca otomatis."],
    ["- Anda dapat menghapus baris contoh (baris 2 dan 3) dan menggantinya dengan data anak riil."],
    ["- File dapat disimpan dalam format .xlsx, .xls, atau .csv."],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(instructions);
  wsGuide["!cols"] = [
    { wch: 5 },
    { wch: 26 },
    { wch: 14 },
    { wch: 35 },
    { wch: 55 },
  ];

  XLSX.utils.book_append_sheet(wb, wsGuide, "Petunjuk Pengisian");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(wbout);
}
