import type { PendingApprovalItem } from "@/types/database";

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
  const jenis = kom?.jenis || "posyandu";

  if (jenis === "warga_kita") {
    const cleanRt = (kom?.rt || "").replace(/\D/g, "").padStart(2, "0");
    const cleanRw = (kom?.rw || "").replace(/\D/g, "").padStart(2, "0");
    const kel = kom?.kelurahan;
    const kec = kom?.kecamatan || "Kota Tegal";

    // 1. Tingkat RT
    if (cleanRt && cleanRt !== "00" && cleanRt !== "semua") {
      return {
        tierLevel: "RT",
        targetApproverTitle: isAdmin
          ? `Admin RW ${cleanRw || "Terkait"}`
          : `Admin RT ${cleanRt} / RW ${cleanRw}`,
      };
    }

    // 2. Tingkat RW
    if (cleanRw && cleanRw !== "00" && cleanRw !== "semua") {
      return {
        tierLevel: "RW",
        targetApproverTitle: isAdmin
          ? `Admin Kelurahan ${kel || "Terkait"}`
          : `Admin RW ${cleanRw}`,
      };
    }

    // 3. Tingkat Kelurahan
    if (kel && kel !== "semua" && kel !== "Semua Kelurahan") {
      return {
        tierLevel: "Kelurahan",
        targetApproverTitle: isAdmin
          ? `Admin Kecamatan ${kec || "Terkait"}`
          : `Admin Kelurahan ${kel}`,
      };
    }

    // 4. Tingkat Kecamatan
    return {
      tierLevel: "Kecamatan",
      targetApproverTitle: "Super Admin",
    };
  }

  if (jenis === "posyandu") {
    return {
      tierLevel: "Posyandu",
      targetApproverTitle: "Pengurus / Kader Posyandu",
    };
  }

  if (jenis === "satuan_paud") {
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
 * Sistem Berjenjang:
 * - Admin RT di-approve oleh Admin RW masing-masing
 * - Admin RW di-approve oleh Admin Kelurahan masing-masing
 * - Admin Kelurahan di-approve oleh Admin Kecamatan masing-masing
 * - Admin Kecamatan di-approve oleh Super Admin
 * - Regular member di-approve oleh Admin RT (atau Admin di atasnya)
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
      jenis?: string;
      kecamatan?: string | null;
      kelurahan?: string | null;
      rw?: string | null;
      rt?: string | null;
    } | null;
  };
}): boolean {
  if (isSuperAdmin) return true;

  const roleReq = (targetItem.peran_diajukan || targetItem.peran || "").toLowerCase();
  const isAdminApp =
    roleReq.includes("pengurus") ||
    roleReq.includes("admin") ||
    roleReq.includes("ketua");
  const kom = targetItem.komunitas;
  if (!kom) return false;

  const targetJenis = kom.jenis;
  const targetKec = kom.kecamatan || "";
  const targetKel = kom.kelurahan || "";
  const targetRw = (kom.rw || "").replace(/\D/g, "").padStart(2, "0");
  const targetRt = (kom.rt || "").replace(/\D/g, "").padStart(2, "0");

  const hasRt = Boolean(targetRt && targetRt !== "00" && targetRt !== "semua");
  const hasRw = Boolean(targetRw && targetRw !== "00" && targetRw !== "semua");
  const hasKel = Boolean(targetKel && targetKel !== "semua" && targetKel !== "Semua Kelurahan");

  if (targetJenis === "warga_kita") {
    if (isAdminApp) {
      // 1. Pengajuan Admin RT -> harus di-approve oleh Admin RW (atau Kelurahan/Kecamatan di atasnya)
      if (hasRt && hasRw) {
        return userAdminKomunitas.some((uKom) => {
          const uRw = (uKom.rw || "").replace(/\D/g, "").padStart(2, "0");
          const uRt = (uKom.rt || "").replace(/\D/g, "").padStart(2, "0");
          const isRwAdmin =
            uKom.kecamatan === targetKec &&
            uKom.kelurahan === targetKel &&
            uRw === targetRw &&
            (!uRt || uRt === "00");
          const isKelAdmin =
            uKom.kecamatan === targetKec &&
            uKom.kelurahan === targetKel &&
            (!uRw || uRw === "00");
          const isKecAdmin =
            uKom.kecamatan === targetKec &&
            (!uKom.kelurahan || uKom.kelurahan === "Semua Kelurahan");
          return isRwAdmin || isKelAdmin || isKecAdmin;
        });
      }

      // 2. Pengajuan Admin RW -> harus di-approve oleh Admin Kelurahan (atau Kecamatan di atasnya)
      if (hasRw && !hasRt) {
        return userAdminKomunitas.some((uKom) => {
          const uRw = (uKom.rw || "").replace(/\D/g, "").padStart(2, "0");
          const isKelAdmin =
            uKom.kecamatan === targetKec &&
            uKom.kelurahan === targetKel &&
            (!uRw || uRw === "00");
          const isKecAdmin =
            uKom.kecamatan === targetKec &&
            (!uKom.kelurahan || uKom.kelurahan === "Semua Kelurahan");
          return isKelAdmin || isKecAdmin;
        });
      }

      // 3. Pengajuan Admin Kelurahan -> harus di-approve oleh Admin Kecamatan
      if (hasKel && !hasRw && !hasRt) {
        return userAdminKomunitas.some((uKom) => {
          const isKecAdmin =
            uKom.kecamatan === targetKec &&
            (!uKom.kelurahan || uKom.kelurahan === "Semua Kelurahan");
          return isKecAdmin;
        });
      }

      // 4. Pengajuan Admin Kecamatan -> HANYA Super Admin yang bisa approve
      return false;
    } else {
      // Regular Member role (Penduduk, Pendatang, Pengunjung, dll)
      return userAdminKomunitas.some((uKom) => {
        const uRw = (uKom.rw || "").replace(/\D/g, "").padStart(2, "0");
        const uRt = (uKom.rt || "").replace(/\D/g, "").padStart(2, "0");

        // Admin RT langsung
        if (
          hasRt &&
          hasRw &&
          uKom.kecamatan === targetKec &&
          uKom.kelurahan === targetKel &&
          uRw === targetRw &&
          uRt === targetRt
        ) {
          return true;
        }
        // Admin RW di atasnya
        if (
          hasRw &&
          uKom.kecamatan === targetKec &&
          uKom.kelurahan === targetKel &&
          uRw === targetRw &&
          (!uRt || uRt === "00")
        ) {
          return true;
        }
        // Admin Kelurahan di atasnya
        if (
          hasKel &&
          uKom.kecamatan === targetKec &&
          uKom.kelurahan === targetKel &&
          (!uRw || uRw === "00")
        ) {
          return true;
        }
        // Admin Kecamatan di atasnya
        if (
          uKom.kecamatan === targetKec &&
          (!uKom.kelurahan || uKom.kelurahan === "Semua Kelurahan")
        ) {
          return true;
        }
        return false;
      });
    }
  }

  // Untuk Posyandu / PAUD
  return userAdminKomunitas.some(
    (uKom) => uKom.id === targetItem.komunitas_id || uKom.id === kom.id
  );
}
