import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { RAW_PAUD_PKBM_TEGAL } from "@/lib/constants/seed-paud-tegal";
import {
  MASTER_KOMUNITAS_SEED,
  findOrGenerateKomunitasSeed,
} from "@/lib/constants/tegal-data";
import type { DataAnakItem } from "@/types/database";

export function normalizeWilayah(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/^kecamatan\s+/i, "")
    .replace(/^kelurahan\s+/i, "")
    .replace(/^desa\s+/i, "")
    .replace(/^kota\s+/i, "")
    .replace(/^kabupaten\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeRtRwNum(val?: string | null | number): string {
  if (val === undefined || val === null) return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return isNaN(num) ? "" : String(num);
}

/**
 * Mendeteksi apakah suatu baris data merupakan data Anak Tidak Sekolah (ATS)
 */
export function isDataAtsRecord(row: any): boolean {
  if (!row) return false;

  const rawAlasan = String(row.alasan_sekolah || "");
  const rawNamaSekolah = String(row.nama_sekolah || "").toLowerCase();

  // 1. Tag khusus format ATS
  if (
    rawAlasan.includes("[KEINGINAN:") ||
    rawAlasan.includes("[SEKOLAH_ASAL:") ||
    rawAlasan.includes("[KELAS:") ||
    rawAlasan.includes("[KET:")
  ) {
    return true;
  }

  // 2. Nama sekolah mengandung ATS / Anak Tidak Sekolah
  if (
    rawNamaSekolah.includes("ats") ||
    rawNamaSekolah.includes("anak tidak sekolah") ||
    rawNamaSekolah.includes("putus sekolah") ||
    rawNamaSekolah.includes("belum pernah sekolah")
  ) {
    return true;
  }

  // 3. Alasan sekolah merupakan alasan spesifik ATS tanpa tag KK/DOM balita
  const lowerAlasan = rawAlasan.toLowerCase();
  const atsKeywords = [
    "tidak ada biaya",
    "keterbatasan biaya",
    "bekerja",
    "membantu orang tua",
    "menikah",
    "hamil",
    "kurang minat",
    "motivasi",
    "terkendala zonasi",
    "drop out",
  ];

  const hasKkDomTags =
    rawAlasan.includes("[KK_KAB:") ||
    rawAlasan.includes("[DOM_KAB:") ||
    rawAlasan.includes("[KK_KEC:") ||
    rawAlasan.includes("[DOM_KEC:");

  if (!hasKkDomTags && atsKeywords.some((kw) => lowerAlasan.includes(kw))) {
    return true;
  }

  return false;
}

/**
 * Memeriksa apakah suatu komunitas berhak menyelenggarakan dan mengisikan data peserta didik PAUD aktif (sudah bersekolah).
 * Meliputi:
 * 1. Satuan PAUD Resmi (jenis === "satuan_paud")
 * 2. PKBM Star of Tomorrow (satuan pendidikan kesetaraan yang memiliki layanan PAUD)
 * 3. SKB Kota Tegal / UPTD SPNF Sanggar Kegiatan Belajar (memiliki layanan PAUD)
 */
export function isKomunitasLayananPaud(
  komunitas?: {
    id?: string;
    nama?: string;
    jenis?: string;
    jenis_institusi?: string;
  } | null,
  fallbackNama?: string,
  fallbackJenis?: string
): boolean {
  const jenis = String(komunitas?.jenis || fallbackJenis || "").toLowerCase().trim();
  const nama = String(komunitas?.nama || fallbackNama || "").toLowerCase().trim();
  const institusi = String(komunitas?.jenis_institusi || "").toLowerCase().trim();

  // 1. Seluruh Satuan PAUD Resmi (TK, KB, RA, SPS, TPA)
  if (jenis === "satuan_paud") {
    return true;
  }

  // 2. PKBM Star of Tomorrow (memiliki layanan PAUD resmi)
  if (nama.includes("star of tomorrow")) {
    return true;
  }

  // 3. SKB Kota Tegal / UPTD SPNF Sanggar Kegiatan Belajar (memiliki layanan PAUD resmi)
  if (
    institusi === "skb" ||
    nama.includes("skb") ||
    nama.includes("sanggar kegiatan belajar")
  ) {
    return true;
  }

  return false;
}

/**
 * Mendeteksi apakah suatu baris data merupakan data uji coba / dummy anak
 */
export function isDummyDataAnak(row: any): boolean {
  if (!row) return false;
  const name = String(row.nama_lengkap || "").trim().toUpperCase();
  const school = String(row.nama_sekolah || "").trim().toUpperCase();
  const parent = String(row.nama_orangtua || "").trim();

  // Pola nama uji coba: "ANAK TEST 0".."ANAK TEST 49", "TEST", "TEST CEK RETURN", dll.
  if (
    name.startsWith("ANAK TEST") ||
    name === "TEST" ||
    name.includes("TEST CEK") ||
    name.startsWith("TEST ") ||
    name === "DUMMY" ||
    name.startsWith("DUMMY ")
  ) {
    return true;
  }

  // Pola nama sekolah uji coba: "KB TEST", "TEST"
  if (school.includes("TEST") || school.includes("DUMMY")) {
    return true;
  }

  // Data duplikat uji coba khusus (seperti ANAK SHOLEH dengan orangtua '-')
  if (school === "ANAK SHOLEH" && (parent === "-" || !parent)) {
    return true;
  }

  return false;
}

/**
 * Mencari lokasi (Kecamatan dan Kelurahan) dari sebuah Satuan PAUD/PKBM berdasarkan nama atau ID
 */
export function findPaudLocation(
  paudNameOrId?: string | null,
  wilayahContext?: { kelurahan?: string | null; kecamatan?: string | null }
): {
  kecamatan: string;
  kelurahan: string;
  nama: string;
} | null {
  if (!paudNameOrId) return null;
  const query = paudNameOrId.trim().toLowerCase();
  const ctxKel = (wilayahContext?.kelurahan || "").toLowerCase().trim();
  const ctxKec = (wilayahContext?.kecamatan || "").toLowerCase().trim();

  // Disambiguasi khusus KB BIAS (Kemandungan vs Panggung)
  if (query.includes("bias") || (query.includes("bina") && query.includes("sholeh"))) {
    const isTb =
      query.endsWith(" tb") ||
      query.includes(" tb ") ||
      query.includes("(bias) tb") ||
      query.includes("barat") ||
      query.includes("kemandungan") ||
      ctxKel.includes("kemandungan") ||
      ctxKec.includes("barat");
    const isTt =
      query.endsWith(" tt") ||
      query.includes(" tt ") ||
      query.includes("(bias) tt") ||
      query.includes("timur") ||
      query.includes("panggung") ||
      ctxKel.includes("panggung") ||
      ctxKec.includes("timur");

    if (isTb && !isTt) {
      const tbMatch = RAW_PAUD_PKBM_TEGAL.find(
        (p) => p.id === "e001abba-d414-4cf2-886e-913577dbfcc5"
      );
      if (tbMatch) {
        return {
          kecamatan: tbMatch.kecamatan,
          kelurahan: tbMatch.kelurahan,
          nama: tbMatch.nama,
        };
      }
    } else if (isTt && !isTb) {
      const ttMatch = RAW_PAUD_PKBM_TEGAL.find(
        (p) => p.id === "6448b6d1-a2b6-4844-8595-ba29636faa7d"
      );
      if (ttMatch) {
        return {
          kecamatan: ttMatch.kecamatan,
          kelurahan: ttMatch.kelurahan,
          nama: ttMatch.nama,
        };
      }
    }
  }

  // Disambiguasi Pos PAUD Kartini (Kraton vs Slerok)
  if (query.includes("kartini")) {
    if (query.includes("kraton") || query.includes("barat") || ctxKel.includes("kraton")) {
      const match = RAW_PAUD_PKBM_TEGAL.find(
        (p) => p.id === "21283b97-a8a0-4031-8641-2349ad207e87"
      );
      if (match) return { kecamatan: match.kecamatan, kelurahan: match.kelurahan, nama: match.nama };
    } else if (query.includes("slerok") || query.includes("rw. vi") || query.includes("rw 06") || query.includes("timur") || ctxKel.includes("slerok")) {
      const match = RAW_PAUD_PKBM_TEGAL.find(
        (p) => p.id === "3ff83fb1-b19c-45c8-871a-a6bd264d56c0"
      );
      if (match) return { kecamatan: match.kecamatan, kelurahan: match.kelurahan, nama: match.nama };
    }
  }

  // Disambiguasi Pos PAUD Melati (Pesurungan Kidul vs Kalinyamat Kulon vs Melati Sari)
  if (query.includes("melati") && (query.includes("pos paud") || query.includes("sps") || query.startsWith("melati") || query === "pos paud melati" || query === "paud melati")) {
    const isPesurungan =
      query.includes("pesurungan") ||
      query.includes("kidul") ||
      ctxKel.includes("pesurungan") ||
      ctxKec.includes("barat");
    const isKalinyamat =
      query.includes("kalinyamat") ||
      query.includes("kulon") ||
      ctxKel.includes("kalinyamat") ||
      ctxKec.includes("margadana");
    const isSari =
      query.includes("sari") ||
      ctxKel.includes("tegalsari") ||
      ctxKel.includes("slerok");

    if (isPesurungan && !isKalinyamat) {
      return {
        kecamatan: "Tegal Barat",
        kelurahan: "Pesurungan Kidul",
        nama: "Pos PAUD Melati Pesurungan Kidul",
      };
    } else if (isKalinyamat && !isPesurungan) {
      return {
        kecamatan: "Margadana",
        kelurahan: "Kalinyamat Kulon",
        nama: "Pos PAUD Melati Kalinyamat Kulon",
      };
    } else if (isSari) {
      return {
        kecamatan: "Tegal Barat",
        kelurahan: "Tegalsari",
        nama: "Pos PAUD Melati Sari",
      };
    }
  }

  // Disambiguasi TK Pertiwi berdasarkan nomor cabang
  if (query.includes("pertiwi")) {
    if (query.includes("25.8") || query.includes("25 8") || ctxKel.includes("pesurungan")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Pesurungan Kidul", nama: "TK Pertiwi 25.8 Pesurungan Kidul" };
    }
    if (query.includes("25.12") || query.includes("25 12") || ctxKel.includes("kalinyamat")) {
      return { kecamatan: "Margadana", kelurahan: "Kalinyamat Kulon", nama: "TK Pertiwi 25.12 Kalinyamat Kulon" };
    }
    if (query.includes("25.13") || query.includes("25 13") || ctxKel.includes("kejambon")) {
      return { kecamatan: "Tegal Timur", kelurahan: "Kejambon", nama: "TK Pertiwi 25.13 Kejambon" };
    }
    if (query.includes("25.6") || query.includes("25 6") || ctxKel.includes("panggung")) {
      return { kecamatan: "Tegal Timur", kelurahan: "Panggung", nama: "TK Pertiwi 25.6 Panggung" };
    }
    if (query.includes("25.3") || query.includes("25 3") || ctxKel.includes("slerok")) {
      return { kecamatan: "Tegal Timur", kelurahan: "Slerok", nama: "TK Pertiwi 25.3 Slerok" };
    }
    if (query.includes("25.2") || query.includes("25 2") || ctxKel.includes("kemandungan")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Kemandungan", nama: "TK Pertiwi 25.2 Kemandungan" };
    }
    if (query.includes("25.5") || query.includes("25 5") || ctxKel.includes("kraton")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Kraton", nama: "TK Pertiwi 25.5 Kraton" };
    }
    if (query.includes("25.7") || query.includes("25 7") || ctxKel.includes("pekauman")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Pekauman", nama: "TK Pertiwi 25.7 Pekauman" };
    }
    if (query.includes("25.4") || query.includes("25 4") || ctxKel.includes("tegalsari")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Tegalsari", nama: "TK Pertiwi 25.4 Tegalsari" };
    }
    if (query.includes("25.9") || query.includes("25 9") || ctxKel.includes("bandung")) {
      return { kecamatan: "Tegal Selatan", kelurahan: "Bandung", nama: "TK Pertiwi 25.9 Bandung" };
    }
    if (query.includes("25.10") || query.includes("25 10") || ctxKel.includes("debong tengah")) {
      return { kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", nama: "TK Pertiwi 25.10 Debong Tengah" };
    }
    if (query.includes("25.1") || query.includes("25 1") || ctxKel.includes("randugunting")) {
      return { kecamatan: "Tegal Selatan", kelurahan: "Randugunting", nama: "TK Pertiwi 25.1 Randugunting" };
    }
  }

  // Disambiguasi Al Azhar 66 (KB vs TK)
  if (query.includes("al azhar") || query.includes("al-azhar")) {
    if (query.includes("tk") || query.includes("kanak")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Pesurungan Kidul", nama: "TK Islam Al Azhar 66 Kota Tegal" };
    }
    return { kecamatan: "Tegal Barat", kelurahan: "Pesurungan Kidul", nama: "KB Islam Al Azhar 66 Kota Tegal" };
  }

  // Disambiguasi Mekar di Pesurungan Kidul
  if (query.includes("mekar")) {
    if (query.includes("pkbm")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Pesurungan Kidul", nama: "PKBM Mekar" };
    }
    if (query.includes("kb") || query.includes("pesurungan") || ctxKel.includes("pesurungan")) {
      return { kecamatan: "Tegal Barat", kelurahan: "Pesurungan Kidul", nama: "KB Mekar" };
    }
  }

  // Disambiguasi Sofa Marwah
  if (query.includes("sofa marwah")) {
    return { kecamatan: "Tegal Barat", kelurahan: "Pesurungan Kidul", nama: "KB Sofa Marwah" };
  }

  // 1. Cek di RAW_PAUD_PKBM_TEGAL berdasarkan nama
  const rawMatch = RAW_PAUD_PKBM_TEGAL.find(
    (p) =>
      p.nama.toLowerCase() === query ||
      query.includes(p.nama.toLowerCase()) ||
      p.nama.toLowerCase().includes(query)
  );
  if (rawMatch) {
    return {
      kecamatan: rawMatch.kecamatan,
      kelurahan: rawMatch.kelurahan,
      nama: rawMatch.nama,
    };
  }

  // 2. Cek di MASTER_KOMUNITAS_SEED
  const seedMatch = MASTER_KOMUNITAS_SEED.find(
    (k) =>
      k.jenis === "satuan_paud" &&
      (k.id === paudNameOrId ||
        k.nama.toLowerCase() === query ||
        k.nama.toLowerCase().includes(query) ||
        query.includes(k.nama.toLowerCase()))
  );
  if (seedMatch) {
    return {
      kecamatan: seedMatch.kecamatan,
      kelurahan: seedMatch.kelurahan,
      nama: seedMatch.nama,
    };
  }

  // 3. Fallback findOrGenerateKomunitasSeed
  const gen = findOrGenerateKomunitasSeed(paudNameOrId);
  if (gen && gen.jenis === "satuan_paud") {
    return {
      kecamatan: gen.kecamatan,
      kelurahan: gen.kelurahan,
      nama: gen.nama,
    };
  }

  return null;
}

export interface DataAnakAlasanParams {
  alasanSekolah?: string | null;
  kkKabupaten?: string | null;
  kkKecamatan?: string | null;
  kkKelurahan?: string | null;
  kkRw?: string | null;
  kkRt?: string | null;
  kkJalan?: string | null;
  domisiliKabupaten?: string | null;
  domisiliKecamatan?: string | null;
  domisiliKelurahan?: string | null;
  domisiliRw?: string | null;
  domisiliRt?: string | null;
  domisiliJalan?: string | null;
}

/**
 * Serialisasi data alasan dan alamat KK & Domisili ke dalam format string alasan_sekolah
 */
export function serializeDataAnakAlasan(params: DataAnakAlasanParams): string {
  const parts: string[] = [];

  const alasan = (params.alasanSekolah || "").trim();
  if (alasan) {
    parts.push(`[ALASAN:${alasan}]`);
  }

  // Alamat Sesuai KK
  const kkKab = (params.kkKabupaten || "Kota Tegal").trim();
  const kkKec = (params.kkKecamatan || "").trim();
  const kkKel = (params.kkKelurahan || "").trim();
  const kkRw = (params.kkRw || "").trim();
  const kkRt = (params.kkRt || "").trim();
  const kkJalan = (params.kkJalan || "").trim();

  if (kkKab) parts.push(`[KK_KAB:${kkKab}]`);
  if (kkKec) parts.push(`[KK_KEC:${kkKec}]`);
  if (kkKel) parts.push(`[KK_KEL:${kkKel}]`);
  if (kkRw) parts.push(`[KK_RW:${kkRw}]`);
  if (kkRt) parts.push(`[KK_RT:${kkRt}]`);
  if (kkJalan) parts.push(`[KK_JALAN:${kkJalan}]`);

  // Alamat Domisili
  const domKab = (params.domisiliKabupaten || "Kota Tegal").trim();
  const domKec = (params.domisiliKecamatan || "").trim();
  const domKel = (params.domisiliKelurahan || "").trim();
  const domRw = (params.domisiliRw || "").trim();
  const domRt = (params.domisiliRt || "").trim();
  const domJalan = (params.domisiliJalan || "").trim();

  if (domKab) parts.push(`[DOM_KAB:${domKab}]`);
  if (domKec) parts.push(`[DOM_KEC:${domKec}]`);
  if (domKel) parts.push(`[DOM_KEL:${domKel}]`);
  if (domRw) parts.push(`[DOM_RW:${domRw}]`);
  if (domRt) parts.push(`[DOM_RT:${domRt}]`);
  if (domJalan) parts.push(`[DOM_JALAN:${domJalan}]`);

  return parts.join(" ").trim();
}

export interface ParsedDataAnakDetails {
  alasan: string;
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
}

/**
 * Parsing rincian alasan dan alamat KK & Domisili dari string alasan_sekolah
 */
export function parseDataAnakDetails(
  rawAlasan?: string | null,
  fallbackKom?: any
): ParsedDataAnakDetails {
  const raw = String(rawAlasan || "").trim();
  const komMeta = fallbackKom ? extractKomunitasMetadata(fallbackKom) : null;
  const paudLoc =
    fallbackKom?.jenis === "satuan_paud" || fallbackKom?.nama
      ? findPaudLocation(fallbackKom?.nama || fallbackKom?.id)
      : null;

  let alasan = "";
  let kkKabupaten = "Kota Tegal";
  let kkKecamatan = paudLoc?.kecamatan || komMeta?.rawKec || "Tegal Timur";
  let kkKelurahan = paudLoc?.kelurahan || komMeta?.rawKel || "";
  let kkRw = komMeta?.rawRw || "01";
  let kkRt = komMeta?.rawRt || "01";
  let kkJalan = "";

  let domisiliKabupaten = "Kota Tegal";
  let domisiliKecamatan = paudLoc?.kecamatan || komMeta?.rawKec || "Tegal Timur";
  let domisiliKelurahan = paudLoc?.kelurahan || komMeta?.rawKel || "";
  let domisiliRw = komMeta?.rawRw || "01";
  let domisiliRt = komMeta?.rawRt || "01";
  let domisiliJalan = "";

  // 1. Ekstraksi [ALASAN:...]
  const matchAlasan = raw.match(/\[ALASAN\s*:\s*([^\]]+)\]/i);
  if (matchAlasan && matchAlasan[1]) {
    alasan = matchAlasan[1].trim();
  } else if (raw && !raw.startsWith("[")) {
    alasan = raw;
  }

  // 2. Ekstraksi KK
  const matchKkKab = raw.match(/\[KK_KAB\s*:\s*([^\]]+)\]/i);
  if (matchKkKab && matchKkKab[1]) kkKabupaten = matchKkKab[1].trim();

  const matchKkKec = raw.match(/\[KK_KEC(?:AMATAN)?\s*:\s*([^\]]+)\]/i);
  if (matchKkKec && matchKkKec[1]) kkKecamatan = matchKkKec[1].trim();

  const matchKkKel = raw.match(/\[KK_KEL(?:URAHAN)?\s*:\s*([^\]]+)\]/i);
  if (matchKkKel && matchKkKel[1]) kkKelurahan = matchKkKel[1].trim();

  const matchKkRw = raw.match(/\[KK_RW\s*:\s*([^\]]+)\]/i);
  if (matchKkRw && matchKkRw[1]) kkRw = matchKkRw[1].trim();

  const matchKkRt = raw.match(/\[KK_RT\s*:\s*([^\]]+)\]/i);
  if (matchKkRt && matchKkRt[1]) kkRt = matchKkRt[1].trim();

  const matchKkJalan = raw.match(/\[KK_JALAN\s*:\s*([^\]]+)\]/i);
  if (matchKkJalan && matchKkJalan[1]) kkJalan = matchKkJalan[1].trim();

  // 3. Ekstraksi DOMISILI
  const matchDomKab = raw.match(/\[DOM_KAB\s*:\s*([^\]]+)\]/i);
  if (matchDomKab && matchDomKab[1]) domisiliKabupaten = matchDomKab[1].trim();

  const matchDomKec = raw.match(/\[DOM_KEC(?:AMATAN)?\s*:\s*([^\]]+)\]/i);
  if (matchDomKec && matchDomKec[1]) domisiliKecamatan = matchDomKec[1].trim();

  const matchDomKel = raw.match(/\[DOM_KEL(?:URAHAN)?\s*:\s*([^\]]+)\]/i);
  if (matchDomKel && matchDomKel[1]) domisiliKelurahan = matchDomKel[1].trim();

  const matchDomRw = raw.match(/\[DOM_RW\s*:\s*([^\]]+)\]/i);
  if (matchDomRw && matchDomRw[1]) domisiliRw = matchDomRw[1].trim();

  const matchDomRt = raw.match(/\[DOM_RT\s*:\s*([^\]]+)\]/i);
  if (matchDomRt && matchDomRt[1]) domisiliRt = matchDomRt[1].trim();

  const matchDomJalan = raw.match(/\[DOM_JALAN\s*:\s*([^\]]+)\]/i);
  if (matchDomJalan && matchDomJalan[1]) domisiliJalan = matchDomJalan[1].trim();

  // 4. Fallback legacy format ATS: [ALAMAT:...], [RT:...], [RW:...], [KEL:...], [KEC:...]
  if (!matchDomJalan) {
    const legacyAlamat = raw.match(/\[ALAMAT\s*:\s*([^\]]+)\]/i);
    if (legacyAlamat && legacyAlamat[1]) {
      domisiliJalan = legacyAlamat[1].trim();
      if (!kkJalan) kkJalan = domisiliJalan;
    }
  }
  if (!matchDomRt) {
    const legacyRt = raw.match(/\[RT\s*:\s*([^\]]+)\]/i);
    if (legacyRt && legacyRt[1]) {
      domisiliRt = legacyRt[1].trim();
      if (!matchKkRt) kkRt = domisiliRt;
    }
  }
  if (!matchDomRw) {
    const legacyRw = raw.match(/\[RW\s*:\s*([^\]]+)\]/i);
    if (legacyRw && legacyRw[1]) {
      domisiliRw = legacyRw[1].trim();
      if (!matchKkRw) kkRw = domisiliRw;
    }
  }
  if (!matchDomKel) {
    const legacyKel = raw.match(/\[KEL(?:URAHAN)?\s*:\s*([^\]]+)\]/i);
    if (legacyKel && legacyKel[1]) {
      domisiliKelurahan = legacyKel[1].trim();
      if (!matchKkKel) kkKelurahan = domisiliKelurahan;
    }
  }
  if (!matchDomKec) {
    const legacyKec = raw.match(/\[KEC(?:AMATAN)?\s*:\s*([^\]]+)\]/i);
    if (legacyKec && legacyKec[1]) {
      domisiliKecamatan = legacyKec[1].trim();
      if (!matchKkKec) kkKecamatan = domisiliKecamatan;
    }
  }

  // Format default alasan jika masih kosong
  if (!alasan) {
    alasan = "Sudah Usia PAUD";
  }

  // Jika KK adalah Luar Kota Tegal dan tidak ada tag spesifik, kosongkan field detail
  if (kkKabupaten.toLowerCase() !== "kota tegal") {
    if (!matchKkKec) kkKecamatan = "";
    if (!matchKkKel) kkKelurahan = "";
    if (!matchKkRw) kkRw = "";
    if (!matchKkRt) kkRt = "";
    if (!matchKkJalan) kkJalan = "";
  }

  // Jika Domisili adalah Luar Kota Tegal dan tidak ada tag spesifik, kosongkan field detail
  if (domisiliKabupaten.toLowerCase() !== "kota tegal") {
    if (!matchDomKec) domisiliKecamatan = "";
    if (!matchDomKel) domisiliKelurahan = "";
    if (!matchDomRw) domisiliRw = "";
    if (!matchDomRt) domisiliRt = "";
    if (!matchDomJalan) domisiliJalan = "";
  }

  return {
    alasan,
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
  };
}

/**
 * Ekstraksi token nomor / angka Romawi pada nama sekolah (misal: "X", "III", "2")
 */
export function extractSchoolNumberToken(str?: string | null): string | null {
  if (!str) return null;
  const norm = str
    .toLowerCase()
    .replace(/[`'’]/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g, " ")
    .replace(/\b111\b/g, "iii")
    .replace(/\s+/g, " ")
    .trim();

  const match = norm.match(
    /\b(xiii|xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i|13|12|11|10|9|8|7|6|5|4|3|2|1)\b/
  );
  if (!match) return null;
  const val = match[1];
  const romanMap: Record<string, string> = {
    "1": "i",
    "2": "ii",
    "3": "iii",
    "4": "iv",
    "5": "v",
    "6": "vi",
    "7": "vii",
    "8": "viii",
    "9": "ix",
    "10": "x",
    "11": "xi",
    "12": "xii",
    "13": "xiii",
    i: "i",
    ii: "ii",
    iii: "iii",
    iv: "iv",
    v: "v",
    vi: "vi",
    vii: "vii",
    viii: "viii",
    ix: "ix",
    x: "x",
    xi: "xi",
    xii: "xii",
    xiii: "xiii",
  };
  return romanMap[val] || val;
}

/**
 * Membersihkan nama sekolah ke basis string alfanumerik tanpa nomor cabang
 */
export function cleanBaseSchoolName(str?: string | null): string {
  if (!str) return "";
  let s = str
    .toLowerCase()
    .replace(/[`'’]/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g, " ")
    .replace(/\b111\b/g, "iii")
    .replace(/\biman\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  s = s
    .replace(
      /\b(xiii|xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i|13|12|11|10|9|8|7|6|5|4|3|2|1)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  return s.replace(/[^a-z0-9]/g, "");
}

/**
 * Mencocokkan dua nama sekolah/PAUD secara cerdas dan toleran terhadap variasi penulisan:
 * tanda baca (titik, petik), romawi vs angka arab (111 -> III, 1 -> I), singkatan, dll.
 */
export function isSchoolNameMatching(
  school1?: string | null,
  school2?: string | null
): boolean {
  if (!school1 || !school2) return false;
  const s1 = school1.trim();
  const s2 = school2.trim();
  if (s1.toLowerCase() === s2.toLowerCase()) return true;

  const num1 = extractSchoolNumberToken(s1);
  const num2 = extractSchoolNumberToken(s2);

  // Jika kedua nama memiliki nomor cabang, nomornya wajib sama persis
  if (num1 && num2 && num1 !== num2) {
    return false;
  }
  // Jika salah satu memiliki nomor cabang dan yang lain tidak, jangan cocokkan
  if ((num1 && !num2) || (!num1 && num2)) {
    return false;
  }

  const base1 = cleanBaseSchoolName(s1);
  const base2 = cleanBaseSchoolName(s2);

  if (base1 === base2) return true;
  if (
    base1.length > 5 &&
    base2.length > 5 &&
    (base1.includes(base2) || base2.includes(base1))
  ) {
    return true;
  }

  return false;
}

export interface PosyanduCakupanWilayah {
  rw: string;
  rtList?: string[];
}

/**
 * Helper untuk menentukan cakupan sinkronisasi wilayah suatu Posyandu.
 * Ketentuan khusus Kelurahan Debong Lor:
 * - Posyandu Seruni 1: cakupan sinkronisasi dengan RW 1 RT 1, 2, 3, 7 dan 8
 * - Posyandu Seruni 2: cakupan sinkronisasi dengan RW 1 RT 4, 5 dan 6
 * - Posyandu Sartika: cakupan sinkronisasi dengan RW 2 (RT 01 s/d RT 05)
 * - Posyandu Mawar: cakupan sinkronisasi dengan RW 3 (RT 01 s/d RT 04)
 */
export function getPosyanduCakupanWilayah(targetKomunitas: any): PosyanduCakupanWilayah | null {
  if (!targetKomunitas) return null;
  const nama = (targetKomunitas.nama || "").toLowerCase();
  const kel = (targetKomunitas.kelurahan || "").toLowerCase();

  // Khusus Kelurahan Debong Lor
  if (kel.includes("debong lor") || nama.includes("debong lor")) {
    if (
      nama.includes("seruni 1") ||
      nama.includes("seruni i") ||
      (nama.includes("seruni") && !nama.includes("seruni 2") && !nama.includes("seruni ii"))
    ) {
      return {
        rw: "01",
        rtList: ["01", "02", "03", "07", "08", "1", "2", "3", "7", "8"],
      };
    }
    if (nama.includes("seruni 2") || nama.includes("seruni ii")) {
      return {
        rw: "01",
        rtList: ["04", "05", "06", "4", "5", "6"],
      };
    }
    if (nama.includes("sartika")) {
      return {
        rw: "02",
      };
    }
    if (nama.includes("mawar")) {
      return {
        rw: "03",
      };
    }
  }

  // Khusus Kelurahan Pesurungan Lor
  if (kel.includes("pesurungan lor") || nama.includes("pesurungan lor")) {
    if (nama.includes("melati")) {
      return { rw: "01" };
    }
    if (nama.includes("mawar")) {
      return { rw: "02" };
    }
    if (nama.includes("anggrek")) {
      return { rw: "03" };
    }
    if (nama.includes("jaya samudra") || nama.includes("jaya samudera")) {
      return { rw: "04" };
    }
  }

  // Khusus Kelurahan Margadana
  if (
    kel === "margadana" ||
    (kel.includes("margadana") && !kel.includes("pesurungan") && !kel.includes("cabawan") && !kel.includes("kaligangsa") && !kel.includes("krandon") && !kel.includes("sumurpanggang")) ||
    nama.includes("margadana")
  ) {
    if (nama.includes("bougenville")) return { rw: "01" };
    if (nama.includes("dahlia")) return { rw: "02" };
    if (nama.includes("jagadipa")) return { rw: "03" };
    if (nama.includes("kenanga")) return { rw: "04" };
    if (
      nama.includes("cempaka 1") ||
      nama.includes("cempaka i") ||
      (nama.includes("cempaka") && !nama.includes("cempaka 2") && !nama.includes("cempaka ii"))
    ) {
      return { rw: "05" };
    }
    if (nama.includes("cempaka 2") || nama.includes("cempaka ii")) return { rw: "05" };
    if (nama.includes("anyelir")) return { rw: "06" };
    if (nama.includes("sambisari") || nama.includes("kesambi sari") || nama.includes("kesambisari")) return { rw: "07" };
    if (nama.includes("suplir") || nama.includes("suflir")) return { rw: "08" };
    if (nama.includes("wijaya kusuma") || nama.includes("wijayakusuma")) return { rw: "09" };
    if (nama.includes("sedap malam")) return { rw: "10" };
    if (nama.includes("anggrek bulan")) return { rw: "11" };
    if (nama.includes("lavender")) return { rw: "12" };
    if (nama.includes("edelweis") || nama.includes("edelweiss")) return { rw: "13" };
  }

  // Posyandu umum berdasarkan kolom rw
  if (targetKomunitas.rw) {
    const rawRw = String(targetKomunitas.rw).replace(/^(rw|rt)\s*/i, "").trim();
    const num = parseInt(rawRw, 10);
    if (!isNaN(num) && num > 0) {
      return { rw: String(num).padStart(2, "0") };
    }
  }

  return null;
}

export function getPosyanduCakupanRw(targetKomunitas: any): string | null {
  return getPosyanduCakupanWilayah(targetKomunitas)?.rw || null;
}

/**
 * Filter logika hierarkis: Apakah data anak sesuai dan harus muncul di komunitas target?
 * Mencakup Komunitas PAUD, Posyandu, RT, RW, Kelurahan, Kecamatan, dan Kabupaten/Kota.
 */
export function isDataAnakMatchingKomunitas(
  item: DataAnakItem,
  targetKomunitas: any,
  targetMeta: any,
  targetKomId: string
): boolean {
  // 1. Cocok langsung dengan ID komunitas pembuat / tempat pendaftaran
  if (item.komunitas_id === targetKomId || item.komunitas_id === targetKomunitas?.id) {
    return true;
  }

  // 2. Komunitas Satuan PAUD: Tampilkan anak yang terdaftar di PAUD ini
  if (targetKomunitas?.jenis === "satuan_paud" || targetMeta?.jenis === "satuan_paud") {
    if (
      item.nama_sekolah &&
      targetKomunitas?.nama &&
      isSchoolNameMatching(item.nama_sekolah, targetKomunitas.nama)
    ) {
      // Disambiguation check: jika nama sekolah anak ambigu tanpa kelurahan (misal "Pos PAUD Melati")
      // dan targetKomunitas memiliki nama kelurahan (misal "Pos PAUD Melati Pesurungan Kidul"),
      // pastikan wilayah domisili/KK anak tidak bertentangan dengan kelurahan komunitas PAUD.
      const kKelTarget = (targetKomunitas.kelurahan || "").toLowerCase().trim();
      const childSchool = item.nama_sekolah.toLowerCase().trim();
      if (kKelTarget && !childSchool.includes(kKelTarget)) {
        const hasOtherKelWithSameBase = RAW_PAUD_PKBM_TEGAL.some(
          (p) =>
            p.id !== targetKomunitas.id &&
            (p.kelurahan || "").toLowerCase().trim() !== kKelTarget &&
            isSchoolNameMatching(childSchool, p.nama)
        );
        if (hasOtherKelWithSameBase) {
          const domKel = normalizeWilayah(item.domisili_kelurahan);
          const kkKel = normalizeWilayah(item.kk_kelurahan);
          const isDomMatch = domKel && (domKel === kKelTarget || domKel.includes(kKelTarget) || kKelTarget.includes(domKel));
          const isKkMatch = kkKel && (kkKel === kKelTarget || kkKel.includes(kKelTarget) || kKelTarget.includes(kkKel));
          if (!isDomMatch && !isKkMatch) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  // Normalisasi data wilayah domisili anak
  const domKec = normalizeWilayah(item.domisili_kecamatan);
  const domKel = normalizeWilayah(item.domisili_kelurahan);
  const domRw = normalizeRtRwNum(item.domisili_rw);
  const domRt = normalizeRtRwNum(item.domisili_rt);

  // Normalisasi data wilayah KK anak
  const kkKec = normalizeWilayah(item.kk_kecamatan);
  const kkKel = normalizeWilayah(item.kk_kelurahan);
  const kkRw = normalizeRtRwNum(item.kk_rw);
  const kkRt = normalizeRtRwNum(item.kk_rt);

  // Normalisasi data wilayah komunitas target
  const targetKec = normalizeWilayah(targetMeta?.rawKec || targetKomunitas?.kecamatan);
  const targetKel = normalizeWilayah(targetMeta?.rawKel || targetKomunitas?.kelurahan);
  const targetRw = normalizeRtRwNum(targetMeta?.rawRw || targetKomunitas?.rw);
  const targetRt = normalizeRtRwNum(targetMeta?.rawRt || targetKomunitas?.rt);

  // Helper matching wilayah (bisa cocok via Domisili ATAU KK)
  const isKecMatch = (kec: string) =>
    !targetKec ||
    targetKec === "kota tegal" ||
    targetKec === "semua" ||
    !kec ||
    kec === targetKec ||
    kec.includes(targetKec) ||
    targetKec.includes(kec);

  const isKelMatch = (kel: string) =>
    !targetKel ||
    targetKel === "semua" ||
    targetKel === "semua kelurahan" ||
    kel === targetKel ||
    kel.includes(targetKel) ||
    targetKel.includes(kel);

  // Cek lokasi PAUD tempat anak terdaftar (jika bersekolah di PAUD / nama_sekolah terisi)
  const paudLoc = findPaudLocation(item.nama_sekolah || item.komunitas_id);
  const paudKec = paudLoc ? normalizeWilayah(paudLoc.kecamatan) : "";
  const paudKel = paudLoc ? normalizeWilayah(paudLoc.kelurahan) : "";
  const paudKelMatch = Boolean(paudLoc && isKelMatch(paudKel) && isKecMatch(paudKec));
  const paudKecMatch = Boolean(paudLoc && isKecMatch(paudKec));

  // 3. Komunitas Posyandu: Hanya tampilkan data anak yang sesuai dengan cakupan wilayahnya
  if (targetKomunitas?.jenis === "posyandu" || targetMeta?.jenis === "posyandu") {
    const cakupan = getPosyanduCakupanWilayah(targetKomunitas);
    const posyanduRw = cakupan?.rw || getPosyanduCakupanRw(targetKomunitas) || targetRw;
    const domKelMatch = isKelMatch(domKel) && isKecMatch(domKec);
    const kkKelMatch = isKelMatch(kkKel) && isKecMatch(kkKec);

    if (!domKelMatch && !kkKelMatch && !paudKelMatch) {
      return false;
    }

    // Helper cek apakah isian RW atau RT adalah "Belum Tahu" / kosong
    const isDomRwBelumTahu =
      !domRw ||
      !item.domisili_rw ||
      String(item.domisili_rw).toLowerCase().includes("belum") ||
      item.domisili_rw === "-" ||
      item.domisili_rw === "0";

    const isKkRwBelumTahu =
      !kkRw ||
      !item.kk_rw ||
      String(item.kk_rw).toLowerCase().includes("belum") ||
      item.kk_rw === "-" ||
      item.kk_rw === "0";

    // Data dengan isian RW “Belum Tahu” dan RT “Belum Tahu” tetap dialirkan ke seluruh Posyandu di wilayah kelurahan
    if ((domKelMatch && isDomRwBelumTahu) || (kkKelMatch && isKkRwBelumTahu)) {
      return true;
    }

    // Jika Posyandu memiliki target RW / cakupan RW spesifik
    if (posyanduRw) {
      let domRwMatch = domRw === posyanduRw && domKelMatch;
      let kkRwMatch = kkRw === posyanduRw && kkKelMatch;

      // Jika Posyandu memiliki cakupan RT spesifik (misal Seruni 1: RT 1,2,3,7,8 & Seruni 2: RT 4,5,6)
      if (cakupan?.rtList && cakupan.rtList.length > 0) {
        const isDomRtBelumTahu =
          !domRt ||
          !item.domisili_rt ||
          String(item.domisili_rt).toLowerCase().includes("belum") ||
          item.domisili_rt === "-" ||
          item.domisili_rt === "0";

        const isKkRtBelumTahu =
          !kkRt ||
          !item.kk_rt ||
          String(item.kk_rt).toLowerCase().includes("belum") ||
          item.kk_rt === "-" ||
          item.kk_rt === "0";

        const domRtMatch = Boolean((domRt && cakupan.rtList.includes(domRt)) || isDomRtBelumTahu);
        const kkRtMatch = Boolean((kkRt && cakupan.rtList.includes(kkRt)) || isKkRtBelumTahu);

        domRwMatch = domRwMatch && domRtMatch;
        kkRwMatch = kkRwMatch && kkRtMatch;
      }

      return Boolean(domRwMatch || kkRwMatch);
    }

    // Posyandu tanpa cakupan RW spesifik (tingkat kelurahan)
    return Boolean(domKelMatch || kkKelMatch || paudKelMatch);
  }

  // 4. Komunitas RT (Tingkat RT: hasRt && hasRw)
  if (targetMeta?.hasRt && targetMeta?.hasRw) {
    const domRtMatch =
      domRt === targetRt && domRw === targetRw && isKelMatch(domKel) && isKecMatch(domKec);
    const kkRtMatch =
      kkRt === targetRt && kkRw === targetRw && isKelMatch(kkKel) && isKecMatch(kkKec);

    return domRtMatch || kkRtMatch;
  }

  // 5. Komunitas RW (Tingkat RW: hasRw && !hasRt)
  if (targetMeta?.hasRw && !targetMeta?.hasRt) {
    const domRwMatch = domRw === targetRw && isKelMatch(domKel) && isKecMatch(domKec);
    const kkRwMatch = kkRw === targetRw && isKelMatch(kkKel) && isKecMatch(kkKec);

    return domRwMatch || kkRwMatch;
  }

  // 6. Komunitas Kelurahan (Tingkat Kelurahan: hasKel && !hasRw && !hasRt)
  if (targetMeta?.hasKel && !targetMeta?.hasRw && !targetMeta?.hasRt) {
    const domKelMatch = isKelMatch(domKel) && isKecMatch(domKec);
    const kkKelMatch = isKelMatch(kkKel) && isKecMatch(kkKec);

    return domKelMatch || kkKelMatch || paudKelMatch;
  }

  // 7. Komunitas Kecamatan (Tingkat Kecamatan: targetKec && !hasKel)
  if (targetKec && targetKec !== "kota tegal" && targetKec !== "semua") {
    const domKecMatch = isKecMatch(domKec);
    const kkKecMatch = isKecMatch(kkKec);

    return domKecMatch || kkKecMatch || paudKecMatch;
  }

  // 8. Komunitas Kabupaten/Kota (Kota Tegal / Umum)
  // Menampilkan semua anak yang ber-KK / berdomisili di Kota Tegal
  return true;
}

export interface ParsedAtsDetails {
  keinginan: "Masih Ada" | "Tidak Ada";
  alasan: string;
  keterangan: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  jenjangAsal: string;
  sekolahSebelumnya: string;
  kelasTerakhir: string;
}

/**
 * Helper untuk menormalisasi nilai Keinginan Sekolah ATS
 * Mendukung variasi input dari Google Sheets / Form seperti:
 * "Tidak Ada Keinginan", "Masih Ada Keinginan", "Tida Ada Keinginan", "Tidak Ada", "Masih Ada", dll.
 */
export function normalizeKeinginanSekolah(val?: string | null): "Masih Ada" | "Tidak Ada" {
  if (!val) return "Masih Ada";
  const s = String(val).trim().toLowerCase();
  if (
    s.includes("tidak") ||
    s.includes("tida") ||
    s.includes("tdk") ||
    s.includes("bukan") ||
    s.includes("belum") ||
    s.includes("ogah") ||
    s.includes("gamau") ||
    s.includes("ga mau") ||
    s === "false" ||
    s === "no" ||
    s === "0"
  ) {
    return "Tidak Ada";
  }
  return "Masih Ada";
}

export interface DataAtsAlasanParams {
  keinginanSekolah?: string | null;
  alasanTidakSekolah?: string | null;
  alamat?: string | null;
  rt?: string | null;
  rw?: string | null;
  kelurahan?: string | null;
  kecamatan?: string | null;
  jenjangAsal?: string | null;
  sekolahSebelumnya?: string | null;
  kelasTerakhir?: string | null;
  keterangan?: string | null;
}

export function serializeDataAtsAlasan(params: DataAtsAlasanParams): string {
  const keinginan = normalizeKeinginanSekolah(params.keinginanSekolah);
  const alasan = (params.alasanTidakSekolah || "Tidak ada biaya").trim();

  let formatted = `[KEINGINAN:${keinginan}] [ALASAN:${alasan}]`;
  if (params.alamat) formatted += ` [ALAMAT:${params.alamat.trim()}]`;
  if (params.rt) formatted += ` [RT:${params.rt.trim()}]`;
  if (params.rw) formatted += ` [RW:${params.rw.trim()}]`;
  if (params.kelurahan) formatted += ` [KEL:${params.kelurahan.trim()}]`;
  if (params.kecamatan) formatted += ` [KEC:${params.kecamatan.trim()}]`;
  if (params.jenjangAsal) formatted += ` [JENJANG_ASAL:${params.jenjangAsal.trim()}]`;
  if (params.sekolahSebelumnya) formatted += ` [SEKOLAH_ASAL:${params.sekolahSebelumnya.trim()}]`;
  if (params.kelasTerakhir) formatted += ` [KELAS:${params.kelasTerakhir.trim()}]`;
  if (params.keterangan) formatted += ` [KET:${params.keterangan.trim()}]`;

  return formatted;
}

export function parseAtsDetails(
  alasanSekolahRaw?: string | null,
  fallbackKomunitas?: any
): ParsedAtsDetails {
  const raw = String(alasanSekolahRaw || "");
  const komMeta = fallbackKomunitas ? extractKomunitasMetadata(fallbackKomunitas) : null;

  let keinginan: "Masih Ada" | "Tidak Ada" = "Masih Ada";
  let alasan = "Tidak ada biaya";
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
    alasan = matchAlasan[1].trim();
  } else if (raw && !raw.startsWith("[")) {
    alasan = raw;
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

  // Fallback: jika jenjangAsal belum ada, gunakan sekolahSebelumnya jika itu merupakan opsi jenjang
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
 * Memformat nama satuan PAUD agar seragam dan menyertakan nama kelurahan
 * jika merupakan salah satu lembaga yang memiliki kesamaan nama di Kota Tegal.
 */
export function formatNamaSekolahDisplay(
  namaSekolah?: string | null,
  wilayahContext?: { kelurahan?: string | null; kecamatan?: string | null }
): string {
  if (!namaSekolah) return "-";
  const s = namaSekolah.trim();
  const lower = s.toLowerCase();
  const ctxKel = (wilayahContext?.kelurahan || "").toLowerCase().trim();
  const ctxKec = (wilayahContext?.kecamatan || "").toLowerCase().trim();

  // 1. KB BIAS
  if (lower.includes("bias") && (lower.includes("tb") || lower.includes("kemandungan") || lower.includes("barat") || ctxKel.includes("kemandungan") || ctxKec.includes("barat"))) {
    return "KB Bina Iman Anak Sholeh (BIAS) Kemandungan";
  }
  if (lower.includes("bias") && (lower.includes("tt") || lower.includes("panggung") || lower.includes("timur") || ctxKel.includes("panggung") || ctxKec.includes("timur"))) {
    return "KB Bina Iman Anak Sholeh (BIAS) Panggung";
  }

  // 2. Pos PAUD Kartini
  if (lower === "pos paud kartini kraton" || (lower.includes("kartini") && (lower.includes("kraton") || lower.includes("barat") || ctxKel.includes("kraton")))) {
    return "Pos PAUD Kartini Kraton";
  }
  if (
    lower === "pos paud kartini slerok" ||
    lower === "pos paud kartini rw. vi" ||
    lower === "pos paud kartini rw 06" ||
    (lower.includes("kartini") && (lower.includes("slerok") || lower.includes("timur") || ctxKel.includes("slerok")))
  ) {
    return "Pos PAUD Kartini Slerok";
  }

  // 3. Permata Hati
  if (lower === "ra permata hati" || lower === "ra permata hati kejambon" || (lower.includes("permata hati") && (lower.includes("kejambon") || ctxKel.includes("kejambon")))) {
    return "RA Permata Hati Kejambon";
  }
  if (lower === "kb permata hati" || lower === "kb permata hati slerok" || (lower.includes("permata hati") && (lower.includes("slerok") || ctxKel.includes("slerok")))) {
    return "KB Permata Hati Slerok";
  }

  // 4. Sekar Melati
  if (lower === "kb sekar melati" || lower === "kb. sekar melati" || lower === "kb sekar melati panggung" || (lower.includes("sekar melati") && (lower.includes("panggung") || ctxKel.includes("panggung")))) {
    return "KB Sekar Melati Panggung";
  }
  if (lower === "pos paud sekar melati" || lower === "pos paud sekar melati tegalsari" || (lower.includes("sekar melati") && (lower.includes("tegalsari") || ctxKel.includes("tegalsari")))) {
    return "Pos PAUD Sekar Melati Tegalsari";
  }

  // 5. Little Star
  if (lower === "tk little star" || lower === "tk little star kraton" || (lower.includes("little star") && (lower.includes("kraton") || ctxKel.includes("kraton")))) {
    return "TK Little Star Kraton";
  }
  if (lower === "kb little star" || lower === "kb little star tegalsari" || (lower.includes("little star") && (lower.includes("tegalsari") || ctxKel.includes("tegalsari")))) {
    return "KB Little Star Tegalsari";
  }

  // 6. Nurul Huda
  if (lower === "paud tpq nurul huda" || lower === "paud tpq nurul huda panggung" || (lower.includes("nurul huda") && (lower.includes("panggung") || ctxKel.includes("panggung")))) {
    return "PAUD TPQ Nurul Huda Panggung";
  }
  if (lower === "tk nurul huda" || lower === "tk nurul huda muarareja" || (lower.includes("nurul huda") && (lower.includes("muarareja") || ctxKel.includes("muarareja")))) {
    return "TK Nurul Huda Muarareja";
  }

  // 7. Mutiara Shahabat
  if (lower === "kb mutiara shahabat" || lower === "kb mutiara shahabat kemandungan" || (lower.includes("mutiara shahabat") && (lower.includes("kemandungan") || ctxKel.includes("kemandungan")))) {
    return "KB Mutiara Shahabat Kemandungan";
  }
  if (lower === "pkbm mutiara shahabat" || lower === "pkbm mutiara shahabat pekauman" || (lower.includes("mutiara shahabat") && (lower.includes("pekauman") || ctxKel.includes("pekauman")))) {
    return "PKBM Mutiara Shahabat Pekauman";
  }

  // 8. At Taqwa
  if (lower === "ra at taqwa" || lower === "ra at taqwa pekauman" || (lower.includes("at taqwa") && (lower.includes("pekauman") || ctxKel.includes("pekauman")))) {
    return "RA At Taqwa Pekauman";
  }
  if (lower === "paud tpq at taqwa" || lower === "paud tpq at taqwa cabawan" || (lower.includes("at taqwa") && (lower.includes("cabawan") || ctxKel.includes("cabawan")))) {
    return "PAUD TPQ At Taqwa Cabawan";
  }

  // 9. Pos PAUD Melati (Pesurungan Kidul vs Kalinyamat Kulon vs Melati Sari)
  if (lower.includes("melati") && (lower.includes("pos paud") || lower.includes("sps") || lower.startsWith("melati") || lower === "pos paud melati" || lower === "paud melati")) {
    if (lower.includes("pesurungan") || lower.includes("kidul") || ctxKel.includes("pesurungan") || ctxKec.includes("barat")) {
      return "Pos PAUD Melati Pesurungan Kidul";
    }
    if (lower.includes("kalinyamat") || lower.includes("kulon") || ctxKel.includes("kalinyamat") || ctxKec.includes("margadana")) {
      return "Pos PAUD Melati Kalinyamat Kulon";
    }
    if (lower.includes("sari") || ctxKel.includes("tegalsari")) {
      return "Pos PAUD Melati Sari";
    }
  }

  // 10. TK Pertiwi (Semua Cabang di Kota Tegal Menyertakan Kelurahan)
  if (lower.includes("pertiwi")) {
    if (lower.includes("25.8") || lower.includes("25 8") || ctxKel.includes("pesurungan")) {
      return "TK Pertiwi 25.8 Pesurungan Kidul";
    }
    if (lower.includes("25.12") || lower.includes("25 12") || ctxKel.includes("kalinyamat")) {
      return "TK Pertiwi 25.12 Kalinyamat Kulon";
    }
    if (lower.includes("25.13") || lower.includes("25 13") || ctxKel.includes("kejambon")) {
      return "TK Pertiwi 25.13 Kejambon";
    }
    if (lower.includes("25.6") || lower.includes("25 6") || ctxKel.includes("panggung")) {
      return "TK Pertiwi 25.6 Panggung";
    }
    if (lower.includes("25.3") || lower.includes("25 3") || ctxKel.includes("slerok")) {
      return "TK Pertiwi 25.3 Slerok";
    }
    if (lower.includes("25.2") || lower.includes("25 2") || ctxKel.includes("kemandungan")) {
      return "TK Pertiwi 25.2 Kemandungan";
    }
    if (lower.includes("25.5") || lower.includes("25 5") || ctxKel.includes("kraton")) {
      return "TK Pertiwi 25.5 Kraton";
    }
    if (lower.includes("25.7") || lower.includes("25 7") || ctxKel.includes("pekauman")) {
      return "TK Pertiwi 25.7 Pekauman";
    }
    if (lower.includes("25.4") || lower.includes("25 4") || ctxKel.includes("tegalsari")) {
      return "TK Pertiwi 25.4 Tegalsari";
    }
    if (lower.includes("25.9") || lower.includes("25 9") || ctxKel.includes("bandung")) {
      return "TK Pertiwi 25.9 Bandung";
    }
    if (lower.includes("25.10") || lower.includes("25 10") || ctxKel.includes("debong tengah")) {
      return "TK Pertiwi 25.10 Debong Tengah";
    }
    if (lower.includes("25.1") || lower.includes("25 1") || ctxKel.includes("randugunting")) {
      return "TK Pertiwi 25.1 Randugunting";
    }
  }

  // 11. Pos PAUD Kenanga
  if (lower.includes("kenanga") && (lower.includes("pos paud") || lower.includes("sps") || lower === "pos paud kenanga")) {
    if (lower.includes("mintaragen") || ctxKel.includes("mintaragen")) return "Pos PAUD Kenanga Mintaragen";
    if (lower.includes("kemandungan") || ctxKel.includes("kemandungan")) return "Pos PAUD Kenanga Kemandungan";
    if (lower.includes("kraton") || ctxKel.includes("kraton")) return "Pos PAUD Kenanga Kraton";
  }

  // 12. Pos PAUD Seruni
  if (lower.includes("seruni") && (lower.includes("pos paud") || lower.includes("sps") || lower === "pos paud seruni")) {
    if (lower.includes("panggung") || ctxKel.includes("panggung")) return "Pos PAUD Seruni Panggung";
    if (lower.includes("debong lor") || ctxKel.includes("debong lor")) return "Pos PAUD Seruni Debong Lor";
    if (lower.includes("sumurpanggang") || ctxKel.includes("sumurpanggang")) return "Pos PAUD Seruni Sumurpanggang";
  }

  // 13. Pos PAUD Dewi Sartika
  if (lower.includes("dewi sartika")) {
    if (lower.includes("kraton") || ctxKel.includes("kraton")) return "Pos PAUD Dewi Sartika Kraton";
    if (lower.includes("debong kulon") || ctxKel.includes("debong kulon")) return "Pos PAUD Dewi Sartika Debong Kulon";
  }

  // 14. Pos PAUD Bougenville
  if (lower.includes("bougenville") && (lower.includes("pos paud") || lower.includes("sps") || lower === "pos paud bougenville")) {
    if (lower.includes("tegalsari") || ctxKel.includes("tegalsari")) return "Pos PAUD Bougenville Tegalsari";
    if (lower.includes("margadana") || ctxKel.includes("margadana")) return "Pos PAUD Bougenville Margadana";
  }

  // 15. Pos PAUD Tunas Harapan
  if (lower.includes("tunas harapan")) {
    if (lower.includes("randugunting") || ctxKel.includes("randugunting")) return "Pos PAUD Tunas Harapan Randugunting";
    if (lower.includes("krandon") || ctxKel.includes("krandon")) return "Pos PAUD Tunas Harapan Krandon";
  }

  // 16. KB & PKBM Mekar
  if (lower.includes("mekar")) {
    if (lower.includes("pkbm")) return "PKBM Mekar";
    if (lower.includes("kb") || lower.includes("pesurungan") || ctxKel.includes("pesurungan")) return "KB Mekar";
  }

  return s;
}


