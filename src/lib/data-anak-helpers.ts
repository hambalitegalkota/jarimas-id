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
 * Mencari lokasi (Kecamatan dan Kelurahan) dari sebuah Satuan PAUD/PKBM berdasarkan nama atau ID
 */
export function findPaudLocation(paudNameOrId?: string | null): {
  kecamatan: string;
  kelurahan: string;
  nama: string;
} | null {
  if (!paudNameOrId) return null;
  const query = paudNameOrId.trim().toLowerCase();

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
      (item.nama_sekolah.toLowerCase() === targetKomunitas.nama.toLowerCase() ||
        item.nama_sekolah.toLowerCase().includes(targetKomunitas.nama.toLowerCase()) ||
        targetKomunitas.nama.toLowerCase().includes(item.nama_sekolah.toLowerCase()))
    ) {
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

  // 3. Komunitas Posyandu: Tampilkan anak yang berdomisili/ber-KK di Kelurahan Posyandu berada ATAU terdaftar di PAUD wilayah Kelurahan tersebut
  if (targetKomunitas?.jenis === "posyandu" || targetMeta?.jenis === "posyandu") {
    const domKelMatch = isKelMatch(domKel) && isKecMatch(domKec);
    const kkKelMatch = isKelMatch(kkKel) && isKecMatch(kkKec);

    // Jika Posyandu memiliki target RW spesifik
    if (targetRw) {
      const domRwMatch = domRw === targetRw && domKelMatch;
      const kkRwMatch = kkRw === targetRw && kkKelMatch;
      return domRwMatch || kkRwMatch || domKelMatch || kkKelMatch || paudKelMatch;
    }

    return domKelMatch || kkKelMatch || paudKelMatch;
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


