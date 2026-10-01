import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import type { DataAtsItem, KomunitasWithMembership } from "@/types/database";

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
    label: "SD / MI / Paket A (7–12 Thn)",
    shortLabel: "SD / Paket A",
    badgeLabel: "SD / Paket A",
    rentangUsia: "Usia 7–12 Tahun",
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
 * Informasi cakupan wilayah berjenjang (RT, RW, Kelurahan, Kecamatan)
 */
export function getWilayahScopeInfo(komunitas: any): {
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

  return {
    tierLevel: "Komunitas",
    scopeTitle: komunitas?.nama || "Komunitas",
    scopeSubtitle: komunitas?.lokasi || "Kota Tegal",
    badgeLabel: "Komunitas",
    isWargaKita: false,
    kecamatan: meta.rawKec,
    kelurahan: meta.rawKel,
    rw: meta.rawRw,
    rt: meta.rawRt,
  };
}
