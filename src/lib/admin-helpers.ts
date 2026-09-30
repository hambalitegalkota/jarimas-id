import type { PendingApprovalItem } from "@/types/database";
import { findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import { isRoleAdmin } from "@/lib/utils";

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

const KELURAHAN_TO_KECAMATAN_MAP: Record<string, string> = {
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
  kalinyamatkulon: "Tegal Selatan",
  "kalinyamat kulon": "Tegal Selatan",
  kalinyamatwetan: "Tegal Selatan",
  "kalinyamat wetan": "Tegal Selatan",
  randugunting: "Tegal Selatan",
  tunon: "Tegal Selatan",

  cabawan: "Margadana",
  kaligangsa: "Margadana",
  krandon: "Margadana",
  margadana: "Margadana",
  pesurunganlor: "Margadana",
  "pesurungan lor": "Margadana",
  sumurpanggang: "Margadana",
};

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

  // Cek fallback Kecamatan jika kosong atau dari pemetaan kelurahan
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
  tierLevel: "RT" | "RW" | "Kelurahan" | "Kecamatan" | "Posyandu" | "Satuan PAUD" | "Umum";
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
          ? `Admin RW ${meta.rw}`
          : `Admin RT ${meta.rt}`,
      };
    }

    // 2. Tingkat RW (memiliki RW tanpa RT)
    if (meta.hasRw && !meta.hasRt) {
      return {
        tierLevel: "RW",
        targetApproverTitle: isAdmin
          ? `Admin Kelurahan ${meta.rawKel || "Terkait"}`
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
    return {
      tierLevel: "Kecamatan",
      targetApproverTitle: "Super Admin",
    };
  }

  if (meta.jenis === "posyandu") {
    return {
      tierLevel: "Posyandu",
      targetApproverTitle: "Pengurus / Kader Posyandu",
    };
  }

  if (meta.jenis === "satuan_paud") {
    return {
      tierLevel: "Satuan PAUD",
      targetApproverTitle: "Pengelola / Kepala PAUD",
    };
  }

  return {
    tierLevel: "Umum",
    targetApproverTitle: "Super Admin",
  };
}

/**
 * Memeriksa apakah user saat ini memiliki wewenang untuk menyetujui/menolak permohonan tertentu
 * Aturan Bersih Hierarkis Satu Tingkat Langsung:
 * - Pengajuan Admin RT -> HANYA disetujui oleh Admin RW di atasnya
 * - Pengajuan Admin RW -> HANYA disetujui oleh Admin Kelurahan di atasnya
 * - Pengajuan Admin Kelurahan -> HANYA disetujui oleh Admin Kecamatan di atasnya
 * - Pengajuan Admin Kecamatan -> HANYA disetujui oleh Super Admin
 * - Permohonan Warga RT -> HANYA disetujui oleh Admin RT bersangkutan
 * - Permohonan Warga RW -> HANYA disetujui oleh Admin RW bersangkutan
 * - Permohonan Warga Kelurahan -> HANYA disetujui oleh Admin Kelurahan bersangkutan
 * - Permohonan Warga Kecamatan -> HANYA disetujui oleh Admin Kecamatan bersangkutan
 */
export function checkUserCanApproveItem({
  isSuperAdmin,
  userAdminKomunitas,
  targetItem,
}: {
  isSuperAdmin: boolean;
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
  if (isSuperAdmin) return true;
  if (!userAdminKomunitas || userAdminKomunitas.length === 0) return false;

  const roleReq = (targetItem.peran_diajukan || targetItem.peran || "").toLowerCase();
  const isAdminApp = isRoleAdmin(roleReq);

  const kom = targetItem.komunitas;
  if (!kom) return false;

  const targetMeta = extractKomunitasMetadata(kom);

  if (targetMeta.jenis === "warga_kita") {
    if (isAdminApp) {
      // 1. Pengajuan Admin RT -> HANYA Admin RW di atasnya
      // (Target memiliki RT dan RW, Approver adalah Admin RW pada Kelurahan & RW yang sama)
      if (targetMeta.hasRt && targetMeta.hasRw) {
        return userAdminKomunitas.some((uKom) => {
          const u = extractKomunitasMetadata(uKom);
          if (u.jenis !== "warga_kita") return false;
          if (u.hasRt) return false; // Bukan Admin RW jika punya RT
          if (!u.hasRw) return false; // Harus Admin RW

          const kelMatch = !targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel;
          const rwMatch = u.rw === targetMeta.rw;

          return rwMatch && kelMatch;
        });
      }

      // 2. Pengajuan Admin RW -> HANYA Admin Kelurahan di atasnya
      // (Target memiliki RW tanpa RT, Approver adalah Admin Kelurahan pada Kelurahan yang sama)
      if (targetMeta.hasRw && !targetMeta.hasRt) {
        return userAdminKomunitas.some((uKom) => {
          const u = extractKomunitasMetadata(uKom);
          if (u.jenis !== "warga_kita") return false;
          if (u.hasRt || u.hasRw) return false; // Harus Admin Kelurahan (tanpa RW dan RT)
          if (!u.hasKel) return false; // Harus memiliki kelurahan

          const kelMatch = u.kel === targetMeta.kel;
          return kelMatch;
        });
      }

      // 3. Pengajuan Admin Kelurahan -> HANYA Admin Kecamatan di atasnya
      // (Target memiliki Kelurahan tanpa RW/RT, Approver adalah Admin Kecamatan pada Kecamatan yang sama)
      if (targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt) {
        return userAdminKomunitas.some((uKom) => {
          const u = extractKomunitasMetadata(uKom);
          if (u.jenis !== "warga_kita") return false;
          if (u.hasRt || u.hasRw || u.hasKel) return false; // Harus Admin Kecamatan murni (tanpa Kel/RW/RT)

          const targetKec = targetMeta.kec || normalizeStr(KELURAHAN_TO_KECAMATAN_MAP[targetMeta.kel]);
          const uKec = u.kec;

          return Boolean(uKec && targetKec && uKec === targetKec);
        });
      }

      // 4. Pengajuan Admin Kecamatan -> HANYA Super Admin yang bisa approve
      return false;
    } else {
      // Regular Member role (Penduduk, Pendatang, Pengunjung, dll)
      return userAdminKomunitas.some((uKom) => {
        if (uKom.id === targetItem.komunitas_id || uKom.id === kom.id) return true;

        const u = extractKomunitasMetadata(uKom);
        if (u.jenis !== "warga_kita") return false;

        // Permohonan di RT
        if (targetMeta.hasRt && targetMeta.hasRw) {
          return (
            u.rw === targetMeta.rw &&
            u.rt === targetMeta.rt &&
            (!targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel)
          );
        }
        // Permohonan di RW
        if (targetMeta.hasRw && !targetMeta.hasRt) {
          return (
            u.rw === targetMeta.rw &&
            !u.hasRt &&
            (!targetMeta.hasKel || !u.hasKel || u.kel === targetMeta.kel)
          );
        }
        // Permohonan di Kelurahan
        if (targetMeta.hasKel && !targetMeta.hasRw && !targetMeta.hasRt) {
          return (
            u.kel === targetMeta.kel &&
            !u.hasRw &&
            !u.hasRt
          );
        }
        // Permohonan di Kecamatan
        return (
          u.kec === targetMeta.kec &&
          !u.hasKel &&
          !u.hasRw &&
          !u.hasRt
        );
      });
    }
  }

  // Untuk Posyandu / PAUD / Komunitas Khusus
  return userAdminKomunitas.some(
    (uKom) => uKom.id === targetItem.komunitas_id || uKom.id === kom.id
  );
}
