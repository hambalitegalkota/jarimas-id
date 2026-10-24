export interface DaftarNamaAnakItem {
  id: string;
  namaLengkap: string;
  tanggalLahir?: string | null;
  usia: number;
  jenisKelamin: "L" | "P";
  namaOrangtua: string;
  nomorHp: string;
  tinggalBersama: string;
  isSekolah: boolean;
  namaSekolah: string;
  kategoriSekolah?: string;
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
  statusApproval: string;
  komunitasId: string;
  komunitasNama: string;
  createdAt: string;
}

export interface SchoolTypeBreakdown {
  tk: number;
  ra: number;
  kb: number;
  sps: number;
  tpa: number;
  skb: number;
  pkbm: number;
}

export interface GenderBreakdown {
  lakiLaki: number;
  perempuan: number;
  total: number;
}

export interface AgeGroupBreakdown {
  age0_1: number; // 0-1 tahun (0 - 23 bulan)
  age2: number;   // 2 tahun
  age3: number;   // 3 tahun
  age4: number;   // 4 tahun
  age5: number;   // 5 tahun
  age6: number;   // 6 tahun
}

export interface ReasonCount {
  alasan: string;
  jumlah: number;
  persentase: number;
}

export interface WilayahRekapItem {
  id: string;
  nama: string;
  tingkat: "kota" | "kecamatan" | "kelurahan" | "rw" | "rt" | "paud" | "posyandu";
  kecamatan?: string;
  totalAnak: number;
  totalBersekolah: number;
  totalTidakBersekolah: number;
  persenBersekolah: number;
  persenTidakBersekolah: number;

  // Rincian Anak Bersekolah
  bersekolahGender: GenderBreakdown;
  bersekolahJenjang: SchoolTypeBreakdown;
  bersekolahUsia: AgeGroupBreakdown;
  bersekolahAlasan: ReasonCount[];

  // Rincian Matriks: Usia Tunggal (0–6 Tahun) x Jenjang Satuan PAUD (TK, RA, KB, SPS, TPA, PKBM, SKB)
  bersekolahUsiaJenjang: Record<number, SchoolTypeBreakdown>;

  // Rincian Anak Tidak / Belum Bersekolah
  tidakBersekolahGender: GenderBreakdown;
  tidakBersekolahUsia: AgeGroupBreakdown;
  tidakBersekolahAlasan: ReasonCount[];
}

export interface RekapDataAnakUsiaDiniResult {
  kota: WilayahRekapItem;
  kecamatanList: WilayahRekapItem[];
  kelurahanList: WilayahRekapItem[];
  lastUpdated: string;
  totalLiveRecords: number;
}

export const DAFTAR_ALASAN_BERSEKOLAH = [
  "Stimulasi & Pendidikan Usia Dini",
  "Melatih Kemandirian & Sosialisasi",
  "Persiapan Masuk Sekolah Dasar (SD)",
  "Pengembangan Bahasa & Kognitif",
  "Pengembangan Minat, Bakat & Motorik",
  "Fasilitas Belajar & Bermain Lengkap",
  "Dorongan Orang Tua & Lingkungan",
  "Alasan Lainnya",
];

export const DAFTAR_ALASAN_TIDAK_SEKOLAH = [
  "Belum Cukup Usia / Masih Balita",
  "Keterbatasan Biaya / Ekonomi",
  "Jarak ke Sekolah Jauh / Transportasi",
  "Tidak Ada yang Mengantar / Menjemput",
  "Anak Belum Siap Mental / Mandiri",
  "Pola Asuh Mandiri di Rumah",
  "Kondisi Kesehatan / Khusus",
  "Alasan Lainnya",
];

export function calculateAgeFromBirthDate(birthDateStr?: string | null): number {
  if (!birthDateStr) return 4;
  let s = String(birthDateStr).trim();

  // Dukung format tanggal DD-MM-YYYY atau DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = String(dmyMatch[1]).padStart(2, "0");
    const m = String(dmyMatch[2]).padStart(2, "0");
    const y = dmyMatch[3];
    s = `${y}-${m}-${d}`;
  }

  const birth = new Date(s);
  if (isNaN(birth.getTime())) return 4;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, Math.min(10, age));
}

export function classifySchoolType(namaSekolah?: string | null): keyof SchoolTypeBreakdown {
  const s = (namaSekolah || "").trim();
  if (!s) return "kb";

  // 1. Taman Kanak-Kanak (TK) - Prioritas jika terdapat sebutan TK / Taman Kanak-Kanak (termasuk TK ABA)
  if (/\b(TK|TAMAN\s*KANAK[- ]*KANAK|TKI)\b/i.test(s)) return "tk";

  // 2. Kelompok Bermain (KB)
  if (/\b(KB|KELOMPOK\s*BERMAIN|KBI)\b/i.test(s)) return "kb";

  // 3. Raudhatul Athfal (RA) - Khusus satuan RA / Raudhatul Athfal Kemenag
  if (
    /^(RA\b|RAUDHATUL\s*ATHFAL|RAUDLATUL\s*ATHFAL)/i.test(s) ||
    /\b(RAUDHATUL\s*ATHFAL|RAUDLATUL\s*ATHFAL)\b/i.test(s) ||
    /\bRA\s+[A-Z]/i.test(s)
  ) {
    return "ra";
  }

  // 4. Satuan PAUD Sejenis (SPS)
  if (/\b(SPS|POS\s*PAUD|PAUD\s*TPQ)\b/i.test(s)) return "sps";

  // 5. Taman Penitipan Anak (TPA)
  if (/\b(TPA|TAMAN\s*PENITIPAN|PENITIPAN\s*ANAK)\b/i.test(s)) return "tpa";

  // 6. Sanggar Kegiatan Belajar (SKB)
  if (/\b(SKB|SANGGAR\s*KEGIATAN)\b/i.test(s)) return "skb";

  // 7. Pusat Kegiatan Belajar Masyarakat (PKBM)
  if (/\b(PKBM|PUSAT\s*KEGIATAN\s*BELAJAR)\b/i.test(s)) return "pkbm";

  if (/\bPAUD\b/i.test(s)) return "kb";
  return "tk";
}

export function normalizeReasonBersekolah(raw?: string | null): string {
  const s = (raw || "").toLowerCase();
  if (s.includes("stimulasi") || s.includes("pendidikan") || s.includes("terbaik")) return "Stimulasi & Pendidikan Usia Dini";
  if (s.includes("mandiri") || s.includes("sosialisasi") || s.includes("teman")) return "Melatih Kemandirian & Sosialisasi";
  if (s.includes("sd") || s.includes("sekolah dasar") || s.includes("persiapan")) return "Persiapan Masuk Sekolah Dasar (SD)";
  if (s.includes("bahasa") || s.includes("kognitif") || s.includes("bicara")) return "Pengembangan Bahasa & Kognitif";
  if (s.includes("motorik") || s.includes("bakat") || s.includes("kreatif")) return "Pengembangan Minat, Bakat & Motorik";
  if (s.includes("fasilitas") || s.includes("bermain") || s.includes("dekat")) return "Fasilitas Belajar & Bermain Lengkap";
  if (s.includes("orang tua") || s.includes("keluarga") || s.includes("lingkungan") || s.includes("usia paud")) return "Dorongan Orang Tua & Lingkungan";
  return "Stimulasi & Pendidikan Usia Dini";
}

export function normalizeReasonTidakSekolah(raw?: string | null, age: number = 2): string {
  const s = (raw || "").toLowerCase();
  if (s.includes("belum wajib") || s.includes("balita") || s.includes("usia") || s.includes("belum cukup") || age <= 2) {
    return "Belum Cukup Usia / Masih Balita";
  }
  if (s.includes("biaya") || s.includes("ekonomi") || s.includes("dana") || s.includes("uang")) {
    return "Keterbatasan Biaya / Ekonomi";
  }
  if (s.includes("jauh") || s.includes("jarak") || s.includes("transportasi")) {
    return "Jarak ke Sekolah Jauh / Transportasi";
  }
  if (s.includes("antar") || s.includes("jemput") || s.includes("sibuk")) {
    return "Tidak Ada yang Mengantar / Menjemput";
  }
  if (s.includes("mental") || s.includes("takut") || s.includes("menangis") || s.includes("belum siap")) {
    return "Anak Belum Siap Mental / Mandiri";
  }
  if (s.includes("asuh") || s.includes("rumah") || s.includes("nenek")) {
    return "Pola Asuh Mandiri di Rumah";
  }
  if (s.includes("sakit") || s.includes("khusus") || s.includes("kesehatan")) {
    return "Kondisi Kesehatan / Khusus";
  }
  return "Belum Cukup Usia / Masih Balita";
}

export function createEmptyUsiaJenjang(): Record<number, SchoolTypeBreakdown> {
  const res: Record<number, SchoolTypeBreakdown> = {};
  for (let age = 0; age <= 6; age++) {
    res[age] = { tk: 0, ra: 0, kb: 0, sps: 0, tpa: 0, skb: 0, pkbm: 0 };
  }
  return res;
}

export function createEmptyRekapWilayah(
  id: string,
  nama: string,
  tingkat: "kota" | "kecamatan" | "kelurahan" | "rw" | "rt" | "paud" | "posyandu",
  kecamatan?: string
): WilayahRekapItem {
  return {
    id,
    nama,
    tingkat,
    kecamatan,
    totalAnak: 0,
    totalBersekolah: 0,
    totalTidakBersekolah: 0,
    persenBersekolah: 0,
    persenTidakBersekolah: 0,
    bersekolahGender: { lakiLaki: 0, perempuan: 0, total: 0 },
    bersekolahJenjang: { tk: 0, ra: 0, kb: 0, sps: 0, tpa: 0, skb: 0, pkbm: 0 },
    bersekolahUsia: { age0_1: 0, age2: 0, age3: 0, age4: 0, age5: 0, age6: 0 },
    bersekolahAlasan: DAFTAR_ALASAN_BERSEKOLAH.map((alasan) => ({ alasan, jumlah: 0, persentase: 0 })),
    bersekolahUsiaJenjang: createEmptyUsiaJenjang(),
    tidakBersekolahGender: { lakiLaki: 0, perempuan: 0, total: 0 },
    tidakBersekolahUsia: { age0_1: 0, age2: 0, age3: 0, age4: 0, age5: 0, age6: 0 },
    tidakBersekolahAlasan: DAFTAR_ALASAN_TIDAK_SEKOLAH.map((alasan) => ({ alasan, jumlah: 0, persentase: 0 })),
  };
}
