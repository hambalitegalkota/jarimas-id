import { toValidUUID } from "@/lib/utils";
import {
  MASTER_KOMUNITAS_SEED,
  findOrGenerateKomunitasSeed,
  slugify,
  KOTA_TEGAL_DATA,
} from "@/lib/constants/tegal-data";
import { SEED_POSYANDU_TEGAL } from "@/lib/constants/seed-posyandu-tegal";
import { SEED_PAUD_PKBM_TEGAL } from "@/lib/constants/seed-paud-tegal";

export interface KomunitasSlugInput {
  id?: string;
  nama?: string;
  nama_komunitas?: string;
  jenis?: string;
  jenis_komunitas?: string;
  kecamatan?: string | null;
  kelurahan?: string | null;
  rw?: string | null;
  rt?: string | null;
}

/**
 * Normalisasi nomor RT/RW menjadi 2 digit (misal "1" -> "01", "04" -> "04")
 */
function normalizeNumber(val?: string | null): string {
  if (!val) return "";
  const cleaned = val.replace(/\D/g, "");
  return cleaned ? cleaned.padStart(2, "0") : "";
}

/**
 * Menghasilkan unique slug cantik untuk suatu Komunitas di Kota Tegal
 * Sesuai aturan:
 * - Kecamatan: "kecamatan-[nama]"
 * - Kelurahan: "kelurahan-[nama]"
 * - RW: "rw-[no]-[kelurahan]"
 * - RT: "rt-[no]-rw-[no]-[kelurahan]"
 * - Posyandu: "[nama-posyandu]-[kelurahan]" (atau nama asli jika sudah mengandung kelurahan)
 * - PAUD/PKBM: "[nama-paud/pkbm]" (nama asli lembaga, bila kembar ditambahkan kelurahan)
 */
export function generateKomunitasSlug(komunitas: KomunitasSlugInput): string {
  // Override khusus ID KB Bina Anak Sholeh (BIAS) Kemandungan & Panggung
  const rawId = komunitas.id || "";
  const validId = toValidUUID(rawId);
  if (
    rawId === "e001abba-d414-4cf2-886e-913577dbfcc5" ||
    validId === "e001abba-d414-4cf2-886e-913577dbfcc5"
  ) {
    return "kb-bina-anak-sholeh-bias-kemandungan";
  }
  if (
    rawId === "6448b6d1-a2b6-4844-8595-ba29636faa7d" ||
    validId === "6448b6d1-a2b6-4844-8595-ba29636faa7d"
  ) {
    return "kb-bina-anak-sholeh-bias-panggung";
  }

  let nama = (komunitas.nama || komunitas.nama_komunitas || "").trim();
  if (nama.toLowerCase().includes("bina iman anak sholeh")) {
    nama = nama.replace(/bina\s+iman\s+anak\s+sholeh/gi, "bina anak sholeh");
  }
  const jenis = (komunitas.jenis || komunitas.jenis_komunitas || "").toLowerCase().trim();
  const kec = (komunitas.kecamatan || "").trim();
  const kel = (komunitas.kelurahan || "").trim();
  const rw = normalizeNumber(komunitas.rw);
  const rt = normalizeNumber(komunitas.rt);

  // 1. Komunitas Warga Kita / Wilayah (Kecamatan, Kelurahan, RW, RT)
  if (jenis === "warga_kita" || jenis === "lingkungan_warga" || jenis === "warga") {
    // RT
    if (rt && rw && kel && kel !== "Semua Kelurahan" && kel !== "semua") {
      return `rt-${rt}-rw-${rw}-${slugify(kel)}`;
    }
    // RW
    if (rw && kel && kel !== "Semua Kelurahan" && kel !== "semua") {
      return `rw-${rw}-${slugify(kel)}`;
    }
    // Kelurahan
    if (kel && kel !== "Semua Kelurahan" && kel !== "semua") {
      return `kelurahan-${slugify(kel)}`;
    }
    // Kecamatan
    if (kec && kec !== "Kota Tegal" && kec !== "semua") {
      return `kecamatan-${slugify(kec)}`;
    }
    return "warga-kota-tegal";
  }

  // 2. Komunitas Posyandu
  if (jenis === "posyandu") {
    const kelSlug = kel && kel !== "Semua Kelurahan" ? slugify(kel) : "";
    const nameSlug = slugify(nama);
    // Jika nama posyandu sudah mencakup nama kelurahan, gunakan langsung
    if (kelSlug && nameSlug.includes(kelSlug)) {
      return nameSlug;
    }
    // Tambahkan kelurahan di akhir nama posyandu
    if (kelSlug) {
      return `${nameSlug}-${kelSlug}`;
    }
    return nameSlug;
  }

  // 3. Komunitas Satuan PAUD & PKBM / SKB
  if (
    jenis === "satuan_paud" ||
    jenis === "paud" ||
    jenis === "pkbm_skb" ||
    jenis === "pkbm" ||
    jenis === "skb"
  ) {
    const nameSlug = slugify(nama);
    return nameSlug;
  }

  // 4. Default fallback: slugify dari nama komunitas
  return slugify(nama) || "komunitas";
}

/**
 * Cache in-memory untuk pemetaan slug -> ID Komunitas
 */
let slugToIdMap: Map<string, string> | null = null;
let idToSlugMap: Map<string, string> | null = null;

function initializeSlugMaps() {
  if (slugToIdMap && idToSlugMap) return;

  slugToIdMap = new Map<string, string>();
  idToSlugMap = new Map<string, string>();

  // 1. Indeks seluruh MASTER_KOMUNITAS_SEED
  for (const item of MASTER_KOMUNITAS_SEED) {
    if (!item || !item.id) continue;
    const slug = generateKomunitasSlug(item);
    if (slug) {
      if (!slugToIdMap.has(slug)) {
        slugToIdMap.set(slug, item.id);
      }
      idToSlugMap.set(item.id, slug);
      const uuid = toValidUUID(item.id);
      if (uuid) {
        idToSlugMap.set(uuid, slug);
        if (!slugToIdMap.has(slug)) {
          slugToIdMap.set(slug, uuid);
        }
      }
    }
  }

  // 2. Indeks seluruh SEED_POSYANDU_TEGAL
  for (const item of SEED_POSYANDU_TEGAL) {
    if (!item || !item.id) continue;
    const slug = generateKomunitasSlug(item);
    if (slug) {
      if (!slugToIdMap.has(slug)) {
        slugToIdMap.set(slug, item.id);
      }
      idToSlugMap.set(item.id, slug);
      const uuid = toValidUUID(item.id);
      if (uuid) {
        idToSlugMap.set(uuid, slug);
      }
    }
  }

  // 3. Indeks seluruh SEED_PAUD_PKBM_TEGAL
  for (const item of SEED_PAUD_PKBM_TEGAL) {
    if (!item || !item.id) continue;
    const slug = generateKomunitasSlug(item);
    if (slug) {
      if (!slugToIdMap.has(slug)) {
        slugToIdMap.set(slug, item.id);
      }
      idToSlugMap.set(item.id, slug);
      const uuid = toValidUUID(item.id);
      if (uuid) {
        idToSlugMap.set(uuid, slug);
      }
    }
  }

  // 4. Aliases khusus KB Bina Anak Sholeh (BIAS) Kemandungan & Panggung (mendukung slug baru maupun lama)
  const biasKemandunganId = "e001abba-d414-4cf2-886e-913577dbfcc5";
  const biasPanggungId = "6448b6d1-a2b6-4844-8595-ba29636faa7d";

  slugToIdMap.set("kb-bina-anak-sholeh-bias-kemandungan", biasKemandunganId);
  slugToIdMap.set("kb-bina-iman-anak-sholeh-bias-kemandungan", biasKemandunganId);
  slugToIdMap.set("kb-bina-anak-sholeh-bias-tb", biasKemandunganId);
  slugToIdMap.set("kb-bina-iman-anak-sholeh-bias-tb", biasKemandunganId);
  idToSlugMap.set(biasKemandunganId, "kb-bina-anak-sholeh-bias-kemandungan");

  slugToIdMap.set("kb-bina-anak-sholeh-bias-panggung", biasPanggungId);
  slugToIdMap.set("kb-bina-iman-anak-sholeh-bias-panggung", biasPanggungId);
  slugToIdMap.set("kb-bina-anak-sholeh-bias-tt", biasPanggungId);
  slugToIdMap.set("kb-bina-iman-anak-sholeh-bias-tt", biasPanggungId);
  idToSlugMap.set(biasPanggungId, "kb-bina-anak-sholeh-bias-panggung");
}

/**
 * Mencari ID Komunitas berdasarkan slug unik
 * Mendukung pencarian in-memory cepat serta fallback hierarki warga
 */
export function resolveKomunitasIdBySlug(slug: string): string | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  initializeSlugMaps();

  // 1. Direct match di map in-memory
  if (slugToIdMap?.has(cleanSlug)) {
    return slugToIdMap.get(cleanSlug)!;
  }

  // 2. Jika slug adalah valid UUID, langsung kembalikan
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cleanSlug)) {
    return cleanSlug;
  }

  // 3. Cek pola hierarki warga:
  // Pola RT: rt-02-rw-04-kalinyamat-kulon
  const rtMatch = cleanSlug.match(/^rt-(\d+)-rw-(\d+)-(.+)$/);
  if (rtMatch) {
    const [, rtNum, rwNum, kelSlug] = rtMatch;
    const cleanRt = rtNum.padStart(2, "0");
    const cleanRw = rwNum.padStart(2, "0");
    for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
      for (const kelName of Object.keys(kecData.kelurahan)) {
        if (slugify(kelName) === kelSlug) {
          const id = `kom-warga-${slugify(kecName)}-${kelSlug}-rw${cleanRw}-rt${cleanRt}`;
          return id;
        }
      }
    }
  }

  // Pola RW: rw-04-kalinyamat-kulon
  const rwMatch = cleanSlug.match(/^rw-(\d+)-(.+)$/);
  if (rwMatch) {
    const [, rwNum, kelSlug] = rwMatch;
    const cleanRw = rwNum.padStart(2, "0");
    for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
      for (const kelName of Object.keys(kecData.kelurahan)) {
        if (slugify(kelName) === kelSlug) {
          const id = `kom-warga-${slugify(kecName)}-${kelSlug}-rw${cleanRw}`;
          return id;
        }
      }
    }
  }

  // Pola Kelurahan: kelurahan-kalinyamat-kulon
  const kelMatch = cleanSlug.match(/^kelurahan-(.+)$/);
  if (kelMatch) {
    const kelSlug = kelMatch[1];
    for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
      for (const kelName of Object.keys(kecData.kelurahan)) {
        if (slugify(kelName) === kelSlug) {
          const id = `kom-warga-${slugify(kecName)}-${kelSlug}`;
          return id;
        }
      }
    }
  }

  // Pola Kecamatan: kecamatan-margadana
  const kecMatch = cleanSlug.match(/^kecamatan-(.+)$/);
  if (kecMatch) {
    const kecSlug = kecMatch[1];
    for (const kecName of Object.keys(KOTA_TEGAL_DATA)) {
      if (slugify(kecName) === kecSlug) {
        const id = `kom-warga-${kecSlug}`;
        return id;
      }
    }
  }

  return null;
}

/**
 * Normalisasi dan resolusi ID komunitas (baik berupa UUID, ID seed string, maupun custom slug)
 * menjadi UUID database yang valid.
 */
export function toValidKomunitasUUID(komunitasIdOrSlug?: string | null): string {
  if (!komunitasIdOrSlug) {
    return toValidUUID(komunitasIdOrSlug);
  }
  const resolved = resolveKomunitasIdBySlug(komunitasIdOrSlug) || komunitasIdOrSlug;
  return toValidUUID(resolved);
}

/**
 * Mengambil slug untuk suatu komunitas (berdasarkan objek komunitas atau ID)
 */
export function getKomunitasSlug(komunitasOrId: KomunitasSlugInput | string): string {
  if (typeof komunitasOrId === "string") {
    initializeSlugMaps();
    if (idToSlugMap?.has(komunitasOrId)) {
      return idToSlugMap.get(komunitasOrId)!;
    }
    const seed = findOrGenerateKomunitasSeed(komunitasOrId);
    if (seed) {
      return generateKomunitasSlug(seed);
    }
    return komunitasOrId;
  }

  return generateKomunitasSlug(komunitasOrId);
}

/**
 * Menghasilkan URL lengkap komunitas yang cantik & siap dibagikan
 * Contoh: https://jarimas.id/kotategal/pos-paud-insan-cendikia
 */
export function getKomunitasShareUrl(
  komunitas: KomunitasSlugInput,
  origin: string = "https://jarimas.id"
): string {
  const slug = generateKomunitasSlug(komunitas);
  const cleanOrigin = origin.replace(/\/+$/, "");
  return `${cleanOrigin}/kotategal/${slug}`;
}
