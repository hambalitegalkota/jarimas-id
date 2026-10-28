import type { PendingApprovalItem } from "@/types/database";
import { findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  isRoleAdmin,
  isSuperAdmin as isRoleSuperAdmin,
  isAdminPusat as isRoleAdminPusat,
} from "@/lib/utils";

function normalizeStr(str?: string | null): string {
  return (str || "")
    .toLowerCase()
    .replace(/kota\s+tegal/gi, "")
    .replace(/^kecamatan\s+/i, "")
    .replace(/^kec\.\s*/i, "")
    .replace(/^kelurahan\s+/i, "")
    .replace(/^kel\.\s*/i, "")
    .trim();
}

function cleanNum(str?: string | null): string {
  if (!str) return "";
  const m = str.match(/\d+/);
  return m ? m[0].padStart(2, "0") : "";
}

export const KELURAHAN_TO_KECAMATAN_MAP: Record<string, string> = {
  kejambon: "Tegal Timur",
  panggung: "Tegal Timur",
  slerok: "Tegal Timur",
  mintaragen: "Tegal Timur",
  mangkukusuman: "Tegal Timur",

  kraton: "Tegal Barat",
  tegalsari: "Tegal Barat",
  muarareja: "Tegal Barat",
  "muara reja": "Tegal Barat",
  pesurungankidul: "Tegal Barat",
  "pesurungan kidul": "Tegal Barat",
  kemandungan: "Tegal Barat",
  pekauman: "Tegal Barat",
  kramat: "Tegal Barat",
  "debong lor": "Tegal Barat",

  bandung: "Tegal Selatan",
  debongkidul: "Tegal Selatan",
  "debong kidul": "Tegal Selatan",
  debongkulon: "Tegal Selatan",
  "debong kulon": "Tegal Selatan",
  debongtengah: "Tegal Selatan",
  "debong tengah": "Tegal Selatan",
  kalinyamatwetan: "Tegal Selatan",
  "kalinyamat wetan": "Tegal Selatan",
  keturen: "Tegal Selatan",
  randugunting: "Tegal Selatan",
  tunon: "Tegal Selatan",

  cabawan: "Margadana",
  kaligangsa: "Margadana",
  kalinyamatkulon: "Margadana",
  "kalinyamat kulon": "Margadana",
  krandon: "Margadana",
  margadana: "Margadana",
  pesurunganlor: "Margadana",
  "pesurungan lor": "Margadana",
  sumurpanggang: "Margadana",
};

export function getOfficialKecamatan(kelurahan?: string | null): string | null {
  if (!kelurahan) return null;
  const clean = kelurahan
    .toLowerCase()
    .replace(/^(kelurahan|desa)\s+/i, "")
    .replace(/kota\s+tegal/gi, "")
    .trim();
  return KELURAHAN_TO_KECAMATAN_MAP[clean] || null;
}

/**
 * Ekstraksi metadata wilayah komunitas secara mendalam dari objek, seed, maupun string nama
 */
export function extractKomunitasMetadata(kom: any) {
  const seed = kom?.id ? findOrGenerateKomunitasSeed(kom.id) : null;

  const rawKecFromKom = kom?.kecamatan || seed?.kecamatan || "";
  const rawKelFromKom = kom?.kelurahan || seed?.kelurahan || "";
  const rawRw =
    kom?.rw ||
    seed?.rw ||
    (kom?.nama ? kom.nama.match(/RW[:\s]*(\d+)/i)?.[1] : "") ||
    "";
  const rawRt =
    kom?.rt ||
    seed?.rt ||
    (kom?.nama ? kom.nama.match(/RT[:\s]*(\d+)/i)?.[1] : "") ||
    "";

  // Cek fallback Kelurahan jika kosong dari nama atau lokasi
  let rawKel = rawKelFromKom;
  if (!rawKel && kom?.nama) {
    const kelMatch = kom.nama.match(/Kelurahan[:\s]*([a-zA-Z\s]+?)(?:,|$)/i);
    if (kelMatch && kelMatch[1]) {
      rawKel = kelMatch[1].trim();
    } else {
      const allKel = [
        "Kejambon",
        "Panggung",
        "Slerok",
        "Mangkukusuman",
        "Mintaragen",
        "Kraton",
        "Kemandungan",
        "Kramat",
        "Muara Reja",
        "Pekauman",
        "Pesurungan Kidul",
        "Tegalsari",
        "Bandung",
        "Debong Kidul",
        "Debong Kulon",
        "Debong Tengah",
        "Kalinyamat Kulon",
        "Kalinyamat Wetan",
        "Keturen",
        "Randugunting",
        "Tunon",
        "Margadana",
        "Cabawan",
        "Kaligangsa",
        "Krandon",
        "Pesurungan Lor",
        "Sumurpanggang",
      ];
      const found = allKel.find((k) =>
        new RegExp(`\\b${k}\\b`, "i").test(
          `${kom?.nama || ""} ${kom?.lokasi || ""}`
        )
      );
      if (found) rawKel = found;
    }
  }

  // Cek validasi Kecamatan dari pemetaan kelurahan resmi jika belum tersedia
  let rawKec = rawKecFromKom;
  if (!rawKec && rawKel) {
    const mappedKec = KELURAHAN_TO_KECAMATAN_MAP[normalizeStr(rawKel)];
    if (mappedKec) rawKec = mappedKec;
  }

  if (!rawKec) {
    const text = `${kom?.nama || ""} ${kom?.lokasi || ""}`.toLowerCase();
    if (text.includes("tegal timur")) rawKec = "Tegal Timur";
    else if (text.includes("tegal barat")) rawKec = "Tegal Barat";
    else if (text.includes("tegal selatan")) rawKec = "Tegal Selatan";
    else if (text.includes("margadana")) rawKec = "Margadana";
    else rawKec = "Kota Tegal";
  }

  const kec = normalizeStr(rawKec);
  const kel = normalizeStr(rawKel);
  const rw = cleanNum(rawRw);
  const rt = cleanNum(rawRt);

  const hasRt = Boolean(rt && rt !== "00");
  const hasRw = Boolean(rw && rw !== "00");
  const hasKel = Boolean(
    kel && kel !== "semua" && kel !== "semua kelurahan" && kel !== ""
  );

  return {
    rawKec: rawKec || "Kota Tegal",
    rawKel: rawKel || "",
    rawRw: rawRw || "",
    rawRt: rawRt || "",
    kecamatan: rawKec || "Kota Tegal",
    kelurahan: rawKel || "",
    kec,
    kel,
    rw,
    rt,
    hasRt,
    hasRw,
    hasKel,
    jenis: (kom?.jenis || seed?.jenis || "posyandu") as string,
  };
}

/**
 * Menghitung tingkat (Tier) dan sasaran approver dari suatu permohonan
 */
export function computeTierAndApprover(
  kom: any,
  peranDiajukan?: string | null,
  peranBase?: string
): {
  tierLevel: "RT" | "RW" | "Kelurahan" | "Kecamatan" | "Kota" | "Posyandu" | "Satuan PAUD" | "PKBM & SKB" | "Umum";
  targetApproverTitle: string;
} {
  const roleReq = (peranDiajukan || peranBase || "").toLowerCase();
  const isAdmin =
    roleReq.includes("pengurus") ||
    roleReq.includes("admin") ||
    roleReq.includes("ketua");

  const meta = extractKomunitasMetadata(kom);

  if (meta.jenis === "warga_kita") {
    // 1. Tingkat RT (memiliki RT dan RW)
    if (meta.hasRt && meta.hasRw) {
      return {
        tierLevel: "RT",
        targetApproverTitle: isAdmin
          ? `Admin RW ${meta.rw} / Kelurahan / Kecamatan`
          : `Admin RT ${meta.rt}`,
      };
    }

    // 2. Tingkat RW (memiliki RW tanpa RT)
    if (meta.hasRw && !meta.hasRt) {
      return {
        tierLevel: "RW",
        targetApproverTitle: isAdmin
          ? `Admin Kelurahan ${meta.rawKel || "Terkait"} / Kecamatan`
          : `Admin RW ${meta.rw}`,
      };
    }

    // 3. Tingkat Kelurahan (memiliki Kelurahan tanpa RW/RT)
    if (meta.hasKel && !meta.hasRw && !meta.hasRt) {
      return {
        tierLevel: "Kelurahan",
        targetApproverTitle: isAdmin
          ? `Admin Kecamatan ${meta.rawKec || "Terkait"}`
          : `Admin Kelurahan ${meta.rawKel}`,
      };
    }

    // 4. Tingkat Kecamatan (Kecamatan tanpa Kelurahan/RW/RT)
    if (meta.rawKec && meta.rawKec !== "Kota Tegal") {
      return {
        tierLevel: "Kecamatan",
        targetApproverTitle: "Super Admin / Admin Kota Tegal",
      };
    }

    // 5. Tingkat Kota (Kota Tegal)
    return {
      tierLevel: "Kota",
      targetApproverTitle: "Super Admin",
    };
  }

  if (meta.jenis === "posyandu") {
    const kelDisplay = meta.rawKel ? `Admin Kelurahan ${meta.rawKel}` : "Admin Kelurahan Terkait";
    return {
      tierLevel: "Posyandu",
      targetApproverTitle: isAdmin
        ? `${kelDisplay} / Super Admin`
        : "Pengurus / Kader Posyandu",
    };
  }

  if (meta.jenis === "satuan_paud") {
    const kelDisplay = meta.rawKel ? `Admin Kelurahan ${meta.rawKel}` : "Admin Kelurahan Terkait";
    return {
      tierLevel: "Satuan PAUD",
      targetApproverTitle: isAdmin
        ? `${kelDisplay} / Super Admin`
        : "Admin / Kepala Sekolah / Guru",
    };
  }

  if (meta.jenis === "pkbm_skb") {
    const kelDisplay = meta.rawKel ? `Admin Kelurahan ${meta.rawKel}` : "Admin Kelurahan Terkait";
    return {
      tierLevel: "PKBM & SKB",
      targetApproverTitle: isAdmin
        ? `${kelDisplay} / Super Admin`
        : "Admin / Kepala PKBM & SKB / Pamong Belajar",
    };
  }

  return {
    tierLevel: "Umum",
    targetApproverTitle: "Super Admin",
  };
}

/**
 * Memeriksa apakah user saat ini memiliki wewenang untuk menyetujui/menolak permohonan tertentu
 * Aturan Hierarkis:
 * - Admin Kecamatan: Berhak menyetujui permohonan Admin & Warga di tingkat Kelurahan, RW, dan RT dalam kecamatannya
 * - Admin Kelurahan: Berhak menyetujui permohonan Admin & Warga di tingkat RW dan RT, serta memiliki tugas menyetujui permohonan Admin dari PAUD, SKB & PKBM, dan Posyandu di wilayah masing-masing
 * - Admin RW: Berhak menyetujui permohonan Admin & Warga di tingkat RT dalam RW-nya
 * - Admin RT: Berhak menyetujui pendaftaran Warga di tingkat RT-nya
 * - Super Admin / Admin Pusat: Berhak menyetujui seluruh tingkatan (Kecamatan, Kelurahan, RW, RT, Posyandu, Satuan PAUD, SKB & PKBM)
 */
export function checkUserCanApproveItem({
  isSuperAdmin,
  isAdminPusat = false,
  userAdminKomunitas,
  targetItem,
}: {
  isSuperAdmin: boolean;
  isAdminPusat?: boolean;
  userAdminKomunitas: any[];
  targetItem: {
    komunitas_id: string;
    peran_diajukan?: string | null;
    peran: string;
    komunitas?: {
      id?: string;
      nama?: string;
      jenis?: string;
      kecamatan?: string | null;
      kelurahan?: string | null;
      rw?: string | null;
      rt?: string | null;
    } | null;
  };
}): boolean {
  if (isSuperAdmin || isAdminPusat) return true;
  if (!userAdminKomunitas || userAdminKomunitas.length === 0) return false;

  const roleReq = (targetItem.peran_diajukan || targetItem.peran || "").toLowerCase();
  const isAdminApp = isRoleAdmin(roleReq);

  const kom = targetItem.komunitas;
  if (!kom) return false;

  const targetMeta = extractKomunitasMetadata(kom);

  if (targetMeta.jenis === "warga_kita") {
    if (isAdminApp) {
      // 1. Pengajuan Admin RT -> Dapat disetujui oleh:
      //    - Admin RW di atasnya (RW yang sama)
      //    - Admin Kelurahan di atasnya (Kelurahan yang sama)
      //    - Admin Kecamatan di atasnya (Kecamatan yang sama)
      if (targetMeta.hasRt && targetMeta.hasRw) {
        return userAdminKomunitas.some((uKom) => {
          const u = extractKomunitasMetadata(uKom);
          if (u.jenis !== "warga_kita") return false;

          const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
          const kecMatch = Boolean(u.kec && targetKec && u.kec === targetKec);

          // A. Admin RW di atasnya
          if (u.hasRw && !u.hasRt) {
            const rwMatch = u.rw === targetMeta.rw;
            const kelMatch = !targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel;
            if (rwMatch && kelMatch) return true;
          }

          // B. Admin Kelurahan di atasnya
          if (u.hasKel && !u.hasRw && !u.hasRt) {
            if (u.kel === targetMeta.kel) return true;
          }

          // C. Admin Kecamatan di atasnya
          if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt) {
            if (kecMatch) return true;
          }

          return false;
        });
      }

      // 2. Pengajuan Admin RW -> Dapat disetujui oleh:
      //    - Admin Kelurahan di atasnya (Kelurahan yang sama)
      //    - Admin Kecamatan di atasnya (Kecamatan yang sama)
      if (targetMeta.hasRw && !targetMeta.hasRt) {
        return userAdminKomunitas.some((uKom) => {
          const u = extractKomunitasMetadata(uKom);
          if (u.jenis !== "warga_kita") return false;

          const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
          const kecMatch = Boolean(u.kec && targetKec && u.kec === targetKec);

          // A. Admin Kelurahan di atasnya
          if (u.hasKel && !u.hasRw && !u.hasRt) {
            if (u.kel === targetMeta.kel) return true;
          }

          // B. Admin Kecamatan di atasnya
          if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt) {
            if (kecMatch) return true;
          }

          return false;
        });
      }

      // 3. Pengajuan Admin Kelurahan -> Dapat disetujui oleh:
      //    - Admin Kecamatan di atasnya (Kecamatan yang sama)
      if (targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt) {
        return userAdminKomunitas.some((uKom) => {
          const u = extractKomunitasMetadata(uKom);
          if (u.jenis !== "warga_kita") return false;

          const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
          const kecMatch = Boolean(u.kec && targetKec && u.kec === targetKec);

          // Admin Kecamatan di atasnya
          if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt) {
            return kecMatch;
          }

          return false;
        });
      }

      // 4. Pengajuan Admin Kecamatan -> HANYA Super Admin yang bisa approve
      return isSuperAdmin;
    } else {
      // Regular Member role (Penduduk, Pendatang, Pengunjung, dll)
      return userAdminKomunitas.some((uKom) => {
        if (uKom.id === targetItem.komunitas_id || uKom.id === kom.id) return true;

        const u = extractKomunitasMetadata(uKom);
        if (u.jenis !== "warga_kita") return false;

        const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
        const kecMatch = Boolean(u.kec && targetKec && u.kec === targetKec);

        // Permohonan di RT
        if (targetMeta.hasRt && targetMeta.hasRw) {
          if (u.rt === targetMeta.rt && u.rw === targetMeta.rw && (!targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel)) return true;
          if (u.hasRw && !u.hasRt && u.rw === targetMeta.rw && (!targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel)) return true;
          if (u.hasKel && !u.hasRw && !u.hasRt && u.kel === targetMeta.kel) return true;
          if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt && kecMatch) return true;
        }

        // Permohonan di RW
        if (targetMeta.hasRw && !targetMeta.hasRt) {
          if (u.rw === targetMeta.rw && !u.hasRt && (!targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel)) return true;
          if (u.hasKel && !u.hasRw && !u.hasRt && u.kel === targetMeta.kel) return true;
          if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt && kecMatch) return true;
        }

        // Permohonan di Kelurahan
        if (targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt) {
          if (u.kel === targetMeta.kel && !u.hasRw && !u.hasRt) return true;
          if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt && kecMatch) return true;
        }

        // Permohonan di Kecamatan
        if (targetMeta.rawKec && !targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt) {
          if (u.kec === targetMeta.kec && !u.hasKel && !u.hasRw && !u.hasRt) return true;
        }

        return false;
      });
    }
  }

  // Untuk Lembaga Wilayah: Posyandu, Satuan PAUD, dan SKB & PKBM
  const isLembagaKelurahan =
    targetMeta.jenis === "posyandu" ||
    targetMeta.jenis === "satuan_paud" ||
    targetMeta.jenis === "pkbm_skb";

  if (isLembagaKelurahan) {
    const targetKelClean = (targetMeta.kel || "").replace(/\s+/g, "");
    const targetKecClean = (
      targetMeta.kec ||
      normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel])
    ).replace(/\s+/g, "");

    // Cek apakah pengguna saat ini adalah Admin Kelurahan atau Admin Kecamatan di wilayah lembaga tersebut
    const isTerritoryAdmin = userAdminKomunitas.some((uKom) => {
      const u = extractKomunitasMetadata(uKom);
      if (u.jenis !== "warga_kita") return false;

      const uKelClean = (u.kel || "").replace(/\s+/g, "");
      const uKecClean = (u.kec || "").replace(/\s+/g, "");

      // 1. Admin Kelurahan di wilayah kelurahan yang sama (Tugas menyetujui permohonan Admin PAUD, SKB & PKBM, Posyandu)
      if (u.hasKel && !u.hasRw && !u.hasRt) {
        if (targetKelClean && uKelClean === targetKelClean) return true;
      }

      // 2. Admin Kecamatan di wilayah kecamatan yang sama
      if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt) {
        if (targetKecClean && uKecClean === targetKecClean) return true;
      }

      return false;
    });

    // Jika pengguna adalah Admin Kelurahan/Kecamatan di wilayah lembaga ini, berhak menyetujui peran Admin maupun Anggota
    if (isTerritoryAdmin) {
      return true;
    }

    if (isAdminApp) {
      // Pengajuan peran Admin di PAUD, SKB & PKBM, Posyandu jika bukan Admin Kelurahan wilayah terkait, disetujui oleh Super Admin / Admin Pusat
      return isSuperAdmin || isAdminPusat;
    }

    // Pengajuan peran anggota / staf (Guru, Orangtua, dll) dapat disetujui oleh Super Admin, Admin Kelurahan setempat, atau Pengurus/Admin lembaga tersebut
    return (
      isSuperAdmin ||
      isAdminPusat ||
      userAdminKomunitas.some(
        (uKom) => uKom.id === targetItem.komunitas_id || uKom.id === kom.id
      )
    );
  }

  // Untuk Komunitas Khusus lainnya
  if (isAdminApp) {
    return isSuperAdmin || isAdminPusat;
  }

  return (
    isSuperAdmin ||
    isAdminPusat ||
    userAdminKomunitas.some(
      (uKom) => uKom.id === targetItem.komunitas_id || uKom.id === kom.id
    )
  );
}

/**
 * Pembersih deskripsi komunitas dari tag internal fitur kartu
 */
export function cleanDeskripsiDisplay(rawDesc?: string | null): string {
  if (!rawDesc) return "";
  return rawDesc
    .replace(/\[kartu:(data_anak|data_ats)\]/gi, "")
    .replace(/\[fitur:(data_anak|data_ats)\]/gi, "")
    .trim();
}

export const THE_ORBIT_SIXTY_ID = "6b73e2b8-e708-4d31-a467-333b068b4fd8";

/**
 * Memeriksa apakah suatu entitas komunitas atau ID merujuk pada Komunitas "The Orbit Sixty"
 */
export function isTheOrbitSixtyCommunity(komunitasOrId: any): boolean {
  if (!komunitasOrId) return false;
  if (typeof komunitasOrId === "string") {
    const clean = komunitasOrId.toLowerCase().trim();
    return (
      clean === THE_ORBIT_SIXTY_ID ||
      clean.includes("the orbit sixty") ||
      clean.includes("orbit sixty")
    );
  }
  const id = (komunitasOrId.id || komunitasOrId.komunitas_id || "").toLowerCase().trim();
  const nama = (komunitasOrId.nama || komunitasOrId.nama_komunitas || "").toLowerCase().trim();
  return (
    id === THE_ORBIT_SIXTY_ID ||
    nama.includes("the orbit sixty") ||
    nama.includes("orbit sixty")
  );
}

/**
 * Menentukan hak visibilitas kartu layanan (Data Anak dan Data ATS) di komunitas:
 * 1. Komunitas The Orbit Sixty: Kartu Data Anak dan Data ATS tidak ditampilkan.
 * 2. Komunitas baru/grup yang dibentuk oleh selain Admin Pusat & Super Admin:
 *    Hanya menampilkan Percakapan Komunitas, Kabar Komunitas, dan Daftar Anggota & Informasi Operasional.
 * 3. Kartu Data Anak / Data ATS dapat diaktifkan secara spesifik oleh Admin Pusat / Super Admin.
 * 4. Komunitas resmi kelembagaan Kota Tegal (Posyandu, PAUD, PKBM/SKB, Warga Kita) tetap menampilkan kartu layanan sesuai ranahnya.
 */
export function getKomunitasFeatureCards(komunitas: any) {
  if (!komunitas) {
    return {
      canShowDataAnak: false,
      canShowDataAts: false,
      isTheOrbitSixty: false,
      isKegiatan: false,
      hasCustomDataAnak: false,
      hasCustomDataAts: false,
    };
  }

  const cleanNama = (komunitas.nama || komunitas.nama_komunitas || "").toLowerCase().trim();
  const deskripsi = komunitas.deskripsi || "";
  const jenis = (komunitas.jenis || komunitas.jenis_komunitas || "").toLowerCase().trim();

  // 1. Cek spesifik Komunitas "The Orbit Sixty"
  const isTheOrbitSixty = isTheOrbitSixtyCommunity(komunitas);

  // Tag kustom yang diaktifkan oleh Super Admin / Admin Pusat
  const hasCustomDataAnak =
    deskripsi.includes("[kartu:data_anak]") || deskripsi.includes("[fitur:data_anak]");
  const hasCustomDataAts =
    deskripsi.includes("[kartu:data_ats]") || deskripsi.includes("[fitur:data_ats]");

  // Untuk The Orbit Sixty: Hapus kartu Data Anak dan Data ATS secara mutlak
  if (isTheOrbitSixty) {
    return {
      canShowDataAnak: false,
      canShowDataAts: false,
      isTheOrbitSixty: true,
      isKegiatan: true,
      hasCustomDataAnak: false,
      hasCustomDataAts: false,
    };
  }

  const isKegiatan = jenis === "kegiatan";

  // Komunitas baru yang dibentuk oleh selain Admin Pusat dan Super Admin:
  // Cukup ditampilkan kartu Percakapan Komunitas, Kabar Komunitas dan Daftar Anggota & Informasi Operasional.
  const isCreatedByNonAdmin = Boolean(
    komunitas.created_by && komunitas.is_created_by_admin === false
  );

  const isRestrictedCommunity = isKegiatan || isCreatedByNonAdmin;

  // Komunitas Resmi Kelembagaan
  const isOfficialPosyandu = jenis === "posyandu";
  const isOfficialPaud = jenis === "satuan_paud";
  const isOfficialWarga = jenis === "warga_kita";

  const isSkb =
    komunitas.jenis_institusi === "SKB" ||
    cleanNama.includes("skb") ||
    cleanNama.includes("sanggar kegiatan belajar");
  const isStarOfTomorrow = cleanNama.includes("star of tomorrow");
  const isPkbmOrSkb =
    jenis === "pkbm_skb" ||
    komunitas.jenis_institusi === "PKBM" ||
    komunitas.jenis_institusi === "SKB" ||
    cleanNama.includes("pkbm") ||
    isSkb;

  const isPurePaud = isOfficialPaud && !isPkbmOrSkb;

  let canShowDataAnak = false;
  let canShowDataAts = false;

  // Logika Data Anak:
  if (hasCustomDataAnak) {
    canShowDataAnak = true;
  } else if (!isRestrictedCommunity) {
    if (isOfficialPosyandu || isOfficialPaud || isPkbmOrSkb || isOfficialWarga) {
      canShowDataAnak = true;
    }
  }

  // Logika Data ATS:
  if (hasCustomDataAts) {
    canShowDataAts = true;
  } else if (!isRestrictedCommunity) {
    if ((isPkbmOrSkb || isOfficialWarga || isOfficialPosyandu) && !isPurePaud) {
      canShowDataAts = true;
    }
  }

  return {
    canShowDataAnak,
    canShowDataAts,
    isTheOrbitSixty: false,
    isKegiatan,
    hasCustomDataAnak,
    hasCustomDataAts,
  };
}

/**
 * Mengecek apakah pengguna aktif memiliki wewenang untuk mengangkat atau mencabut
 * peran admin seorang anggota di komunitas target sesuai aturan berjenjang:
 * - Super Admin & Admin Pusat: Berwenang di seluruh tingkatan dan seluruh komunitas
 * - Admin Kota: Berwenang di seluruh Kecamatan, Kelurahan, RW, RT, Posyandu, PAUD, PKBM & SKB
 * - Admin Kecamatan: Berwenang di wilayah kecamatannya (Kelurahan, RW, RT, Posyandu, PAUD, PKBM & SKB)
 * - Admin Kelurahan: Berwenang di wilayah kelurahannya (RW, RT) serta Posyandu, Satuan PAUD, dan PKBM & SKB setempat
 * - Admin RW: Berwenang di lingkungan RT dalam RW-nya
 * - Admin komunitas itu sendiri: Berwenang mengangkat/mencabut rekan admin di komunitasnya
 */
export function checkUserCanAssignAdminRole({
  isSuperAdmin,
  isAdminPusat = false,
  userAdminKomunitas,
  targetKomunitas,
}: {
  isSuperAdmin: boolean;
  isAdminPusat?: boolean;
  userAdminKomunitas: any[];
  targetKomunitas: any;
}): boolean {
  if (isSuperAdmin) return true;
  if (!targetKomunitas) return false;

  const targetMeta = extractKomunitasMetadata(targetKomunitas);
  const targetId = targetKomunitas.id || targetKomunitas.komunitas_id;

  // 1. Evaluasi Komunitas Warga Kita Berjenjang
  // Aturan Mutlak: Admin HANYA bisa mengangkat Admin di bawahnya, TIDAK BISA mengangkat Admin yang satu level apalagi lebih tinggi!
  if (targetMeta.jenis === "warga_kita") {
    // A. Target adalah Tingkat Kota (Kota Tegal) -> HANYA Super Admin & Admin Pusat yang berhak mengangkat Admin Kota
    if (!targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt && (targetMeta.rawKec === "Kota Tegal" || !targetMeta.kec || targetMeta.kec === "kota tegal")) {
      return isSuperAdmin || isAdminPusat;
    }

    // B. Target adalah Tingkat Kecamatan -> HANYA Super Admin, Admin Pusat, dan Admin Kota yang berhak mengangkat Admin Kecamatan
    if (!targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt && targetMeta.rawKec && targetMeta.rawKec !== "Kota Tegal") {
      if (isSuperAdmin || isAdminPusat) return true;
      return userAdminKomunitas.some((uKom) => {
        const u = extractKomunitasMetadata(uKom);
        if (u.jenis !== "warga_kita") return false;
        // Admin Kota Tegal
        return !u.hasKel && !u.hasRw && !u.hasRt && (u.rawKec === "Kota Tegal" || !u.kec || u.kec === "kota tegal");
      });
    }

    // C. Target adalah Tingkat Kelurahan -> Bisa diangkat oleh Admin Kecamatan di atasnya, Admin Kota, Admin Pusat, Super Admin
    if (targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt) {
      if (isSuperAdmin || isAdminPusat) return true;
      return userAdminKomunitas.some((uKom) => {
        const u = extractKomunitasMetadata(uKom);
        if (u.jenis !== "warga_kita") return false;
        // Admin Kota
        if (!u.hasKel && !u.hasRw && !u.hasRt && (u.rawKec === "Kota Tegal" || !u.kec || u.kec === "kota tegal")) return true;
        // Admin Kecamatan di atasnya (Kecamatan yang sama)
        const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
        const kecMatch = Boolean(u.kec && targetKec && u.kec === targetKec);
        if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt && kecMatch) return true;
        return false;
      });
    }

    // D. Target adalah Tingkat RW -> Bisa diangkat oleh Admin Kelurahan di atasnya, Admin Kecamatan di atasnya, Admin Kota, Admin Pusat, Super Admin
    if (targetMeta.hasRw && !targetMeta.hasRt) {
      if (isSuperAdmin || isAdminPusat) return true;
      return userAdminKomunitas.some((uKom) => {
        const u = extractKomunitasMetadata(uKom);
        if (u.jenis !== "warga_kita") return false;
        // Admin Kota
        if (!u.hasKel && !u.hasRw && !u.hasRt && (u.rawKec === "Kota Tegal" || !u.kec || u.kec === "kota tegal")) return true;
        // Admin Kecamatan
        const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
        const kecMatch = Boolean(u.kec && targetKec && u.kec === targetKec);
        if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt && kecMatch) return true;
        // Admin Kelurahan di atasnya
        if (u.hasKel && !u.hasRw && !u.hasRt && u.kel === targetMeta.kel) return true;
        return false;
      });
    }

    // E. Target adalah Tingkat RT -> Bisa diangkat oleh Admin RW di atasnya, Admin Kelurahan, Admin Kecamatan, Admin Kota, Admin Pusat, Super Admin
    if (targetMeta.hasRt && targetMeta.hasRw) {
      if (isSuperAdmin || isAdminPusat) return true;
      return userAdminKomunitas.some((uKom) => {
        const u = extractKomunitasMetadata(uKom);
        if (u.jenis !== "warga_kita") return false;
        // Admin Kota
        if (!u.hasKel && !u.hasRw && !u.hasRt && (u.rawKec === "Kota Tegal" || !u.kec || u.kec === "kota tegal")) return true;
        // Admin Kecamatan
        const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
        const kecMatch = Boolean(u.kec && targetKec && u.kec === targetKec);
        if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt && kecMatch) return true;
        // Admin Kelurahan
        if (u.hasKel && !u.hasRw && !u.hasRt && u.kel === targetMeta.kel) return true;
        // Admin RW di atasnya (RW yang sama)
        if (u.hasRw && !u.hasRt && u.rw === targetMeta.rw && (!targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel)) return true;
        return false;
      });
    }

    return false;
  }

  // 2. Evaluasi Lembaga: Posyandu, Satuan PAUD, dan PKBM & SKB
  const isLembaga =
    targetMeta.jenis === "posyandu" ||
    targetMeta.jenis === "satuan_paud" ||
    targetMeta.jenis === "pkbm_skb";

  if (isLembaga) {
    if (isSuperAdmin || isAdminPusat) return true;

    const targetKelClean = (targetMeta.kel || "").replace(/\s+/g, "");
    const targetKecClean = (
      targetMeta.kec ||
      normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel])
    ).replace(/\s+/g, "");

    return userAdminKomunitas.some((uKom) => {
      const u = extractKomunitasMetadata(uKom);
      if (u.jenis !== "warga_kita") return false;

      // Admin Kota
      if (!u.hasKel && !u.hasRw && !u.hasRt && (u.rawKec === "Kota Tegal" || !u.kec || u.kec === "kota tegal")) {
        return true;
      }

      const uKelClean = (u.kel || "").replace(/\s+/g, "");
      const uKecClean = (u.kec || "").replace(/\s+/g, "");

      // Admin Kelurahan setempat (Kewenangan menetapkan Admin Posyandu, PAUD, PKBM & SKB di kelurahannya)
      if (u.hasKel && !u.hasRw && !u.hasRt) {
        if (targetKelClean && uKelClean === targetKelClean) return true;
      }

      // Admin Kecamatan setempat
      if (u.kec && !u.hasKel && !u.hasRw && !u.hasRt) {
        if (targetKecClean && uKecClean === targetKecClean) return true;
      }

      return false;
    });
  }

  // 3. Komunitas Mandiri / Grup Kegiatan (Non-Wilayah)
  // Pengelola yang ditunjuk atau pembuat grup dapat mengelola anggota grupnya
  if (targetMeta.jenis === "kegiatan") {
    if (isSuperAdmin || isAdminPusat) return true;
    return userAdminKomunitas.some((uKom) => {
      return uKom.id === targetId || (uKom.komunitas_id && uKom.komunitas_id === targetId);
    });
  }

  return false;
}

export type AdminTierLevel =
  | "super_admin"
  | "admin_pusat"
  | "admin_kota"
  | "admin_kecamatan"
  | "admin_kelurahan"
  | "admin_rw"
  | "admin_rt"
  | "admin_bidang"
  | "admin_komunitas";

export interface UserAdminInfo {
  isAdmin: boolean;
  tierLevel: AdminTierLevel | null;
  tierRank: number;
  panelTitle: string | null;
  tierBadgeLabel: string;
  wilayahLabel?: string;
  canAppointRole:
    | "admin_pusat"
    | "admin_kota"
    | "admin_kecamatan"
    | "admin_kelurahan"
    | "admin_rw"
    | "admin_rt"
    | null;
  canAppointRoleLabel: string | null;
}

/**
 * Menghitung tingkat dan nama Panel Kendali seorang pengguna secara deterministik dan berjenjang.
 * Aturan:
 * 1. Super Admin: "Panel Kendali Super Admin"
 * 2. Admin Pusat: "Panel Kendali Admin Pusat"
 * 3. Admin Kota: "Panel Kendali Admin Kota" (Kota Tegal)
 * 4. Admin Kecamatan: "Panel Kendali Admin Kecamatan [Nama]"
 * 5. Admin Kelurahan: "Panel Kendali Admin Kelurahan [Nama]"
 * 6. Admin RW: "Panel Kendali Admin RW [Nomor]"
 * 7. Admin RT: "Panel Kendali Admin RT [Nomor]"
 * 8. Admin Komunitas: "Panel Kendali Admin [Nama Komunitas]"
 * 9. Selain Admin: TIDAK ADA Panel Kendali di profilnya (isAdmin: false, panelTitle: null)
 */
export function getUserAdminInfo({
  profile,
  userCommunities = [],
  currentUserId,
}: {
  profile?: any;
  userCommunities?: any[];
  currentUserId?: string | null;
}): UserAdminInfo {
  const userFull = {
    ...profile,
    id: currentUserId || profile?.id,
    email: profile?.email,
    nama_lengkap: profile?.nama_lengkap,
  };

  // 1. Super Admin (Root Platform)
  if (isRoleSuperAdmin(userFull)) {
    return {
      isAdmin: true,
      tierLevel: "super_admin",
      tierRank: 1,
      panelTitle: "Panel Kendali Super Admin",
      tierBadgeLabel: "Super Admin",
      wilayahLabel: "Platform JARIMAS",
      canAppointRole: "admin_pusat",
      canAppointRoleLabel: "Admin Pusat",
    };
  }

  // 2. Admin Pusat (Platform Manager)
  if (isRoleAdminPusat(userFull)) {
    return {
      isAdmin: true,
      tierLevel: "admin_pusat",
      tierRank: 2,
      panelTitle: "Panel Kendali Admin Pusat",
      tierBadgeLabel: "Admin Pusat",
      wilayahLabel: "Platform JARIMAS",
      canAppointRole: "admin_kota",
      canAppointRoleLabel: "Admin Kota",
    };
  }

  // 3. Evaluasi dari Komunitas yang disetujui (Approved)
  const approvedAdminCommunities = (userCommunities || []).filter((item) => {
    if (item.status !== "approved") return false;
    const role = (item.raw_peran || item.peran || "").toLowerCase().trim();
    return isRoleAdmin(role);
  });

  if (approvedAdminCommunities.length === 0) {
    return {
      isAdmin: false,
      tierLevel: null,
      tierRank: 999,
      panelTitle: null,
      tierBadgeLabel: "Warga",
      canAppointRole: null,
      canAppointRoleLabel: null,
    };
  }

  const candidateTiers: UserAdminInfo[] = [];

  for (const item of approvedAdminCommunities) {
    const kom = item.komunitas || {};
    const meta = extractKomunitasMetadata(kom);

    if (meta.jenis === "warga_kita") {
      // Tingkat Kota
      if (
        !meta.hasKel &&
        !meta.hasRw &&
        !meta.hasRt &&
        (meta.rawKec === "Kota Tegal" || !meta.kec || meta.kec === "kota tegal" || item.komunitas_id === "kom-warga-kota-tegal")
      ) {
        candidateTiers.push({
          isAdmin: true,
          tierLevel: "admin_kota",
          tierRank: 3,
          panelTitle: "Panel Kendali Admin Kota Tegal",
          tierBadgeLabel: "Admin Kota",
          wilayahLabel: "Kota Tegal",
          canAppointRole: "admin_kecamatan",
          canAppointRoleLabel: "Admin Kecamatan",
        });
        continue;
      }

      // Tingkat Kecamatan
      if (meta.rawKec && meta.rawKec !== "Kota Tegal" && !meta.hasKel && !meta.hasRw && !meta.hasRt) {
        candidateTiers.push({
          isAdmin: true,
          tierLevel: "admin_kecamatan",
          tierRank: 4,
          panelTitle: `Panel Kendali Admin Kecamatan ${meta.rawKec}`,
          tierBadgeLabel: `Admin Kec. ${meta.rawKec}`,
          wilayahLabel: `Kecamatan ${meta.rawKec}`,
          canAppointRole: "admin_kelurahan",
          canAppointRoleLabel: "Admin Kelurahan",
        });
        continue;
      }

      // Tingkat Kelurahan
      if (meta.hasKel && !meta.hasRw && !meta.hasRt) {
        candidateTiers.push({
          isAdmin: true,
          tierLevel: "admin_kelurahan",
          tierRank: 5,
          panelTitle: `Panel Kendali Admin Kelurahan ${meta.rawKel}`,
          tierBadgeLabel: `Admin Kel. ${meta.rawKel}`,
          wilayahLabel: `Kelurahan ${meta.rawKel}`,
          canAppointRole: "admin_rw",
          canAppointRoleLabel: "Admin RW",
        });
        continue;
      }

      // Tingkat RW
      if (meta.hasRw && !meta.hasRt) {
        candidateTiers.push({
          isAdmin: true,
          tierLevel: "admin_rw",
          tierRank: 6,
          panelTitle: `Panel Kendali Admin RW ${meta.rw}${meta.rawKel ? ` Kel. ${meta.rawKel}` : ""}`,
          tierBadgeLabel: `Admin RW ${meta.rw}`,
          wilayahLabel: `RW ${meta.rw}${meta.rawKel ? `, ${meta.rawKel}` : ""}`,
          canAppointRole: "admin_rt",
          canAppointRoleLabel: "Admin RT",
        });
        continue;
      }

      // Tingkat RT
      if (meta.hasRt) {
        candidateTiers.push({
          isAdmin: true,
          tierLevel: "admin_rt",
          tierRank: 7,
          panelTitle: `Panel Kendali Admin RT ${meta.rt}${meta.rw ? ` / RW ${meta.rw}` : ""}`,
          tierBadgeLabel: `Admin RT ${meta.rt}`,
          wilayahLabel: `RT ${meta.rt}${meta.rw ? `, RW ${meta.rw}` : ""}`,
          canAppointRole: null,
          canAppointRoleLabel: null,
        });
        continue;
      }
    }

    // Tingkat Admin Bidang (SPM Kota Tegal)
    const rLower = (item.raw_peran || item.peran || "").toLowerCase();
    if (rLower.includes("admin bidang") || rLower.includes("admin_bidang")) {
      const bidangName = (item.peran || "Admin Bidang").replace(/^Admin\s*/i, "");
      candidateTiers.push({
        isAdmin: true,
        tierLevel: "admin_bidang",
        tierRank: 8.5,
        panelTitle: null, // Admin Bidang tidak mengangkat admin lain
        tierBadgeLabel: `Admin ${bidangName}`,
        wilayahLabel: "Kota Tegal",
        canAppointRole: null,
        canAppointRoleLabel: null,
      });
      continue;
    }

    // Tingkat Lembaga / Komunitas Khusus
    const komNama = kom.nama || "Komunitas";
    candidateTiers.push({
      isAdmin: true,
      tierLevel: "admin_komunitas",
      tierRank: 8,
      panelTitle: `Panel Kendali Admin ${komNama}`,
      tierBadgeLabel: `Admin ${kom.jenis === "posyandu" ? "Posyandu" : kom.jenis === "satuan_paud" ? "PAUD" : "Komunitas"}`,
      wilayahLabel: komNama,
      canAppointRole: null,
      canAppointRoleLabel: null,
    });
  }

  if (candidateTiers.length === 0) {
    return {
      isAdmin: false,
      tierLevel: null,
      tierRank: 999,
      panelTitle: null,
      tierBadgeLabel: "Warga",
      canAppointRole: null,
      canAppointRoleLabel: null,
    };
  }

  // Ambil jenjang tertinggi
  candidateTiers.sort((a, b) => a.tierRank - b.tierRank);
  return candidateTiers[0];
}

/**
 * Menentukan peran admin default berdasarkan jenis komunitas
 */
export function getDefaultAdminRole(jenis?: string, kom?: any): string {
  if (kom && (jenis === "warga_kita" || kom.jenis === "warga_kita")) {
    const meta = extractKomunitasMetadata(kom);
    if (meta.hasRt) return `Admin RT ${meta.rt}`;
    if (meta.hasRw) return `Admin RW ${meta.rw}`;
    if (meta.hasKel) return `Admin Kelurahan ${meta.rawKel || ""}`.trim();
    if (meta.rawKec && meta.rawKec !== "Kota Tegal") return `Admin Kecamatan ${meta.rawKec}`;
    return "Admin Kota Tegal";
  }
  switch (jenis) {
    case "warga_kita":
      return "Pengurus";
    case "posyandu":
      return "Kader";
    case "satuan_paud":
      return "Admin PAUD";
    case "pkbm_skb":
      return "Admin PKBM";
    default:
      return "Pengurus";
  }
}

/**
 * Menentukan apakah peran seorang anggota merupakan peran Admin resmi pengelola komunitas
 * Catatan: Guru PAUD / Tutor / Pendidik adalah peran pengajar, BUKAN Admin Komunitas
 */
export function isOfficialAdminKomunitas(
  peran?: string | null,
  jenisKomunitas?: string
): boolean {
  if (!peran) return false;
  const p = peran.toLowerCase().trim();

  // Peran non-admin yang jelas
  if (
    p === "anggota" ||
    p === "warga" ||
    p === "penduduk" ||
    p === "wali murid" ||
    p === "orang tua" ||
    p === "warga belajar" ||
    p === "siswa" ||
    p === "peserta didik" ||
    p === "tutor" ||
    p === "instruktur" ||
    p === "pamong" ||
    p.includes("pendatang") ||
    p.includes("pengunjung") ||
    p.includes("mitra") ||
    p.includes("pendamping")
  ) {
    return false;
  }

  // Khusus PAUD: Guru PAUD / Pendidik PAUD adalah Guru/Pendidik, BUKAN Admin PAUD
  if (
    p === "guru" ||
    p === "guru paud" ||
    p === "pendidik" ||
    p === "pendidik paud" ||
    p === "tenaga kependidikan"
  ) {
    return false;
  }

  // Khusus PKBM & SKB: Pendidik Kesetaraan / Tutor bukan Admin PKBM
  if (p.includes("pendidik kesetaraan") || p.includes("tutor")) {
    return false;
  }

  // Peran yang sah sebagai Admin Komunitas
  return (
    p.includes("admin") ||
    p.includes("pengurus") ||
    p.includes("kader") ||
    p.includes("ketua") ||
    p.includes("kepala") ||
    p.includes("pengelola") ||
    p.includes("pimpinan")
  );
}


