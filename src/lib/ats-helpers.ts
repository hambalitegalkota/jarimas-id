import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import type { KomunitasWithMembership } from "@/types/database";

export type JenjangAtsId = "semua" | "sd" | "smp" | "sma" | "dewasa";

export interface JenjangAtsInfo {
  id: JenjangAtsId;
  label: string;
  shortLabel: string;
  badgeLabel: string;
  rentangUsia: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
}

export const JENJANG_ATS_CONFIG: Record<Exclude<JenjangAtsId, "semua">, JenjangAtsInfo> = {
  sd: {
    id: "sd",
    label: "SD / MI / Paket A (6–12 Thn)",
    shortLabel: "SD / Paket A",
    badgeLabel: "SD / Paket A",
    rentangUsia: "Usia 6–12 Tahun",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  smp: {
    id: "smp",
    label: "SMP / MTs / Paket B (13–15 Thn)",
    shortLabel: "SMP / Paket B",
    badgeLabel: "SMP / Paket B",
    rentangUsia: "Usia 13–15 Tahun",
    colorClass: "text-sky-400",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-500/30",
    badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  sma: {
    id: "sma",
    label: "SMA / SMK / MA / Paket C (16–18 Thn)",
    shortLabel: "SMA / Paket C",
    badgeLabel: "SMA / SMK / Paket C",
    rentangUsia: "Usia 16–18 Tahun",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  dewasa: {
    id: "dewasa",
    label: "Pendidikan Lanjutan / PKBM (19–24+ Thn)",
    shortLabel: "19–24+ Thn",
    badgeLabel: "19–24+ Thn",
    rentangUsia: "Usia 19–24+ Tahun",
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
};

/**
 * Mendeteksi Jenjang Pendidikan Anak Tidak Sekolah (ATS) berdasarkan
 * riwayat kelas terakhir, sekolah asal, atau tanggal lahir/usia.
 */
export function getJenjangAts(ats: {
  tanggal_lahir?: string | null;
  usia?: string | null;
  kelas_terakhir?: string | null;
  sekolah_sebelumnya?: string | null;
}): JenjangAtsInfo {
  const kelas = (ats.kelas_terakhir || "").toLowerCase();

  // 1. Cek dari kelas terakhir jika terisi spesifik
  if (kelas.includes("paket b") || kelas.includes("smp") || kelas.includes("mts")) {
    return JENJANG_ATS_CONFIG.smp;
  }
  if (kelas.includes("paket c") || kelas.includes("sma") || kelas.includes("smk") || kelas.includes("ma")) {
    return JENJANG_ATS_CONFIG.sma;
  }
  if (kelas.includes("paket a") || kelas.includes("sd") || kelas.includes("mi")) {
    return JENJANG_ATS_CONFIG.sd;
  }

  // 2. Cek berdasarkan usia numerik
  let age = -1;
  const rawAge = (ats.usia || "").trim();
  if (rawAge === "24>" || rawAge === ">24" || rawAge.includes(">")) {
    return JENJANG_ATS_CONFIG.dewasa;
  }
  if (/^\d+$/.test(rawAge)) {
    age = parseInt(rawAge, 10);
  } else if (ats.tanggal_lahir) {
    const str = ats.tanggal_lahir.trim();
    if (str === "24>" || str === ">24" || str.includes(">")) {
      return JENJANG_ATS_CONFIG.dewasa;
    }
    if (/^\d+$/.test(str)) {
      age = parseInt(str, 10);
    } else {
      try {
        let birthDate: Date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
          const [y, m, d] = str.split("-").map(Number);
          birthDate = new Date(y, m - 1, d);
        } else {
          birthDate = new Date(str);
        }
        if (!isNaN(birthDate.getTime())) {
          const now = new Date();
          let years = now.getFullYear() - birthDate.getFullYear();
          const months = now.getMonth() - birthDate.getMonth();
          if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
            years--;
          }
          age = years;
        }
      } catch {
        // ignore
      }
    }
  }

  if (age >= 0) {
    if (age <= 12) return JENJANG_ATS_CONFIG.sd;
    if (age <= 15) return JENJANG_ATS_CONFIG.smp;
    if (age <= 18) return JENJANG_ATS_CONFIG.sma;
    return JENJANG_ATS_CONFIG.dewasa;
  }

  return JENJANG_ATS_CONFIG.sd;
}

/**
 * Mendapatkan umur numerik anak ATS secara konsisten dari field usia atau tanggal_lahir.
 */
export function getNumericAgeAts(ats: {
  tanggal_lahir?: string | null;
  usia?: string | number | null;
}): number {
  const rawAge = String(ats.usia || "").trim();
  if (rawAge === "24>" || rawAge === ">24" || rawAge.includes(">")) {
    return 25;
  }
  if (/^\d+$/.test(rawAge)) {
    return parseInt(rawAge, 10);
  }
  if (ats.tanggal_lahir) {
    const str = ats.tanggal_lahir.trim();
    if (str === "24>" || str === ">24" || str.includes(">")) {
      return 25;
    }
    if (/^\d+$/.test(str)) {
      return parseInt(str, 10);
    }
    try {
      let birthDate: Date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split("-").map(Number);
        birthDate = new Date(y, m - 1, d);
      } else {
        birthDate = new Date(str);
      }
      if (!isNaN(birthDate.getTime())) {
        const now = new Date();
        let years = now.getFullYear() - birthDate.getFullYear();
        const months = now.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
          years--;
        }
        return Math.max(4, Math.min(30, years));
      }
    } catch {
      // ignore
    }
  }
  return 14;
}

/**
 * Informasi cakupan wilayah berjenjang (RT, RW, Kelurahan, Kecamatan)
 */
export function getWilayahScopeInfo(komunitas: KomunitasWithMembership | null | undefined | Record<string, unknown>): {
  tierLevel: "RT" | "RW" | "Kelurahan" | "Kecamatan" | "Komunitas";
  scopeTitle: string;
  scopeSubtitle: string;
  badgeLabel: string;
  isWargaKita: boolean;
  kecamatan: string;
  kelurahan: string;
  rw: string;
  rt: string;
} {
  const meta = extractKomunitasMetadata(komunitas);

  if (meta.jenis === "warga_kita") {
    if (meta.hasRt && meta.hasRw) {
      return {
        tierLevel: "RT",
        scopeTitle: `Wilayah RT ${meta.rawRt} RW ${meta.rawRw}`,
        scopeSubtitle: `Kel. ${meta.rawKel}, Kec. ${meta.rawKec}`,
        badgeLabel: `Wilayah RT ${meta.rawRt} / RW ${meta.rawRw}`,
        isWargaKita: true,
        kecamatan: meta.rawKec,
        kelurahan: meta.rawKel,
        rw: meta.rawRw,
        rt: meta.rawRt,
      };
    }
    if (meta.hasRw && !meta.hasRt) {
      return {
        tierLevel: "RW",
        scopeTitle: `Wilayah RW ${meta.rawRw} (Mencakup Semua RT)`,
        scopeSubtitle: `Kel. ${meta.rawKel}, Kec. ${meta.rawKec}`,
        badgeLabel: `Wilayah RW ${meta.rawRw}`,
        isWargaKita: true,
        kecamatan: meta.rawKec,
        kelurahan: meta.rawKel,
        rw: meta.rawRw,
        rt: "",
      };
    }
    if (meta.hasKel && !meta.hasRw && !meta.hasRt) {
      return {
        tierLevel: "Kelurahan",
        scopeTitle: `Wilayah Kelurahan ${meta.rawKel} (Mencakup Semua RW & RT)`,
        scopeSubtitle: `Kecamatan ${meta.rawKec}`,
        badgeLabel: `Wilayah Kel. ${meta.rawKel}`,
        isWargaKita: true,
        kecamatan: meta.rawKec,
        kelurahan: meta.rawKel,
        rw: "",
        rt: "",
      };
    }
    return {
      tierLevel: "Kecamatan",
      scopeTitle: `Wilayah Kecamatan ${meta.rawKec} (Mencakup Semua Kelurahan, RW & RT)`,
      scopeSubtitle: `Kota Tegal`,
      badgeLabel: `Wilayah Kec. ${meta.rawKec}`,
      isWargaKita: true,
      kecamatan: meta.rawKec,
      kelurahan: "",
      rw: "",
      rt: "",
    };
  }

  // Jika Komunitas Posyandu: Tampilkan cakupan wilayah Kelurahan tempat Posyandu berada
  if (meta.jenis === "posyandu") {
    const rawPosyanduName = typeof komunitas?.nama === "string" ? komunitas.nama : "Posyandu";
    const namaPosyanduClean = rawPosyanduName.split(",")[0].trim();
    const kelName = meta.rawKel || "Kelurahan";
    const kecName = meta.rawKec || "Kota Tegal";

    return {
      tierLevel: "Kelurahan",
      scopeTitle: `Wilayah Kelurahan ${kelName} (Mencakup Semua RW & RT)`,
      scopeSubtitle: `Kecamatan ${kecName} • ${namaPosyanduClean}`,
      badgeLabel: `Wilayah Kel. ${kelName}`,
      isWargaKita: true,
      kecamatan: meta.rawKec,
      kelurahan: meta.rawKel,
      rw: "",
      rt: "",
    };
  }

  const namaKomunitas = typeof komunitas?.nama === "string" ? komunitas.nama : "Komunitas";
  const lokasiKomunitas = typeof komunitas?.lokasi === "string" ? komunitas.lokasi : "Kota Tegal";

  return {
    tierLevel: "Komunitas",
    scopeTitle: namaKomunitas,
    scopeSubtitle: lokasiKomunitas,
    badgeLabel: "Komunitas",
    isWargaKita: false,
    kecamatan: meta.rawKec,
    kelurahan: meta.rawKel,
    rw: meta.rawRw,
    rt: meta.rawRt,
  };
}

/**
 * Normalisasi status keinginan sekolah ATS
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

export const DAFTAR_15_KELAS_ATS = [
  { key: "bpb", label: "Belum Pernah Bersekolah", shortLabel: "BPB", jenjang: "BPB" as const },
  { key: "sd1_do", label: "Kelas 1 SD DO", shortLabel: "1 DO", jenjang: "SD" as const },
  { key: "sd2_do", label: "Kelas 2 SD DO", shortLabel: "2 DO", jenjang: "SD" as const },
  { key: "sd3_do", label: "Kelas 3 SD DO", shortLabel: "3 DO", jenjang: "SD" as const },
  { key: "sd4_do", label: "Kelas 4 SD DO", shortLabel: "4 DO", jenjang: "SD" as const },
  { key: "sd5_do", label: "Kelas 5 SD DO", shortLabel: "5 DO", jenjang: "SD" as const },
  { key: "sd6_do", label: "Kelas 6 SD DO", shortLabel: "6 DO", jenjang: "SD" as const },
  { key: "sd6_ltm", label: "Kelas 6 SD LTM", shortLabel: "6 LTM", jenjang: "SD" as const },
  { key: "smp7_do", label: "Kelas 7 SMP DO", shortLabel: "7 DO", jenjang: "SMP" as const },
  { key: "smp8_do", label: "Kelas 8 SMP DO", shortLabel: "8 DO", jenjang: "SMP" as const },
  { key: "smp9_do", label: "Kelas 9 SMP DO", shortLabel: "9 DO", jenjang: "SMP" as const },
  { key: "smp9_ltm", label: "Kelas 9 SMP LTM", shortLabel: "9 LTM", jenjang: "SMP" as const },
  { key: "sma10_do", label: "Kelas 10 SMA DO", shortLabel: "10 DO", jenjang: "SMA" as const },
  { key: "sma11_do", label: "Kelas 11 SMA DO", shortLabel: "11 DO", jenjang: "SMA" as const },
  { key: "sma12_do", label: "Kelas 12 SMA DO", shortLabel: "12 DO", jenjang: "SMA" as const },
] as const;

export function classifyKelasAts(rawAsal?: string, rawKelas?: string): string {
  const k = (rawKelas || "").trim().toLowerCase();
  const a = (rawAsal || "").trim().toLowerCase();
  const comb = `${k} ${a}`.toLowerCase();

  // 1. Belum Pernah Bersekolah (BPB)
  if (
    comb.includes("belum") ||
    comb.includes("tidak pernah") ||
    comb.includes("bpb") ||
    comb.includes("bps")
  ) {
    return "bpb";
  }

  // 2. SMA / SMK / MA / Paket C (Kelas 10, 11, 12 DO)
  if (comb.includes("kelas 12") || comb.includes("kls 12") || comb.includes("12 do") || comb.includes("kelas xii")) {
    return "sma12_do";
  }
  if (comb.includes("kelas 11") || comb.includes("kls 11") || comb.includes("11 do") || comb.includes("kelas xi")) {
    return "sma11_do";
  }
  if (comb.includes("kelas 10") || comb.includes("kls 10") || comb.includes("10 do") || comb.includes("kelas x")) {
    return "sma10_do";
  }

  // 3. SMP / MTs / Paket B (Kelas 7, 8, 9 DO & 9 LTM)
  if (
    comb.includes("9 ltm") ||
    (comb.includes("kelas 9") && (comb.includes("ltm") || comb.includes("lulus") || comb.includes("tidak lanjut"))) ||
    ((comb.includes("smp") || comb.includes("mts") || comb.includes("paket b")) && (comb.includes("ltm") || comb.includes("lulus") || comb.includes("tidak lanjut")))
  ) {
    return "smp9_ltm";
  }
  if (comb.includes("kelas 9") || comb.includes("kls 9") || comb.includes("9 do") || comb.includes("kelas ix")) {
    return "smp9_do";
  }
  if (comb.includes("kelas 8") || comb.includes("kls 8") || comb.includes("8 do") || comb.includes("kelas viii")) {
    return "smp8_do";
  }
  if (comb.includes("kelas 7") || comb.includes("kls 7") || comb.includes("7 do") || comb.includes("kelas vii")) {
    return "smp7_do";
  }

  // 4. SD / MI / Paket A (Kelas 1 s/d 6 DO & 6 LTM)
  if (
    comb.includes("6 ltm") ||
    (comb.includes("kelas 6") && (comb.includes("ltm") || comb.includes("lulus") || comb.includes("tidak lanjut"))) ||
    ((comb.includes("sd") || comb.includes("mi") || comb.includes("paket a")) && (comb.includes("ltm") || comb.includes("lulus") || comb.includes("tidak lanjut")))
  ) {
    return "sd6_ltm";
  }
  if (comb.includes("kelas 6") || comb.includes("kls 6") || comb.includes("6 do") || comb.includes("kelas vi")) {
    return "sd6_do";
  }
  if (comb.includes("kelas 5") || comb.includes("kls 5") || comb.includes("5 do") || comb.includes("kelas v")) {
    return "sd5_do";
  }
  if (comb.includes("kelas 4") || comb.includes("kls 4") || comb.includes("4 do") || comb.includes("kelas iv")) {
    return "sd4_do";
  }
  if (comb.includes("kelas 3") || comb.includes("kls 3") || comb.includes("3 do") || comb.includes("kelas iii")) {
    return "sd3_do";
  }
  if (comb.includes("kelas 2") || comb.includes("kls 2") || comb.includes("2 do") || comb.includes("kelas ii")) {
    return "sd2_do";
  }
  if (comb.includes("kelas 1") || comb.includes("kls 1") || comb.includes("1 do") || comb.includes("kelas i")) {
    return "sd1_do";
  }

  // Fallback jika hanya jenjang asal yang terisi (tanpa kelas spesifik)
  if (comb.includes("sma") || comb.includes("smk") || comb.includes("paket c")) {
    return "sma10_do";
  }
  if (comb.includes("smp") || comb.includes("mts") || comb.includes("paket b")) {
    return "smp7_do";
  }
  if (comb.includes("sd") || comb.includes("mi") || comb.includes("paket a")) {
    return "sd6_do";
  }

  return "bpb";
}

