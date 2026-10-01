import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert any string identifier (e.g. "kom-posyandu-1", "kom-warga-1") into a valid, deterministic UUID format.
 * If the input is already a valid UUID, returns it normalized in lowercase.
 */
export function toValidUUID(input?: string | null): string {
  if (!input || typeof input !== "string") {
    return "00000000-0000-4000-8000-000000000000";
  }

  const trimmed = input.trim();
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  // 128-bit deterministic hash from string using multiple prime seeds
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  let h3 = 0x9e3779b9;
  let h4 = 0x1b873593;

  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ (code >> 2), 1597334677);
    h3 = Math.imul(h3 ^ (code << 3), 3849203117);
    h4 = Math.imul(h4 ^ (code + i), 2246822507);
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  const hex3 = (h3 >>> 0).toString(16).padStart(8, "0");
  const hex4 = (h4 >>> 0).toString(16).padStart(8, "0");

  const fullHex = `${hex1}${hex2}${hex3}${hex4}`;

  // Format as standard UUID v4: 8-4-4-4-12
  const p1 = fullHex.substring(0, 8);
  const p2 = fullHex.substring(8, 12);
  const p3 = "4" + fullHex.substring(13, 16);
  const p4 = "8" + fullHex.substring(17, 20);
  const p5 = fullHex.substring(20, 32);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`.toLowerCase();
}

/**
 * Normalisasi nilai peran untuk tipe data enum Postgres user_role_enum
 * Postgres user_role_enum bertipe lowercase: 'kader' | 'pengurus' | 'anggota' | 'super_admin'
 */
export function normalizeRoleForDb(peran: string): string {
  const p = (peran || "").toLowerCase().trim();
  if (
    p.includes("kader") ||
    p.includes("medis") ||
    p.includes("kesehatan") ||
    p.includes("nakes") ||
    p.includes("bidan") ||
    p.includes("plkb") ||
    p.includes("pkk")
  ) {
    return "kader";
  }
  if (
    p.includes("pengurus") ||
    p.includes("pendidik") ||
    p.includes("kependidikan") ||
    p.includes("admin") ||
    p.includes("ketua") ||
    p.includes("kepala")
  ) {
    return "pengurus";
  }
  if (p === "super admin" || p === "super_admin") {
    return "super_admin";
  }
  return "anggota";
}

/**
 * Format tampilan teks peran untuk antarmuka pengguna (Title Case / Bahasa Indonesia)
 */
export function formatPeranDisplay(peran?: string | null): string {
  if (!peran) return "Anggota";
  const p = peran.trim();
  const pLower = p.toLowerCase();
  if (pLower === "kader") return "Kader";
  if (pLower === "pengurus") return "Pengurus";
  if (pLower === "anggota") return "Anggota";
  if (pLower === "super_admin" || pLower === "super admin") return "Super Admin";
  if (pLower === "penduduk") return "Penduduk";
  if (pLower === "penduduk domisili di luar" || pLower === "penduduk domisili diluar") {
    return "Penduduk Domisili Di Luar";
  }
  if (pLower === "pendatang") return "Pendatang";
  if (pLower === "pengunjung") return "Pengunjung";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

/**
 * Mengecek apakah peran tertentu merupakan peran Admin / Pengurus / Kader
 */
export function isRoleAdmin(peran?: string | null): boolean {
  if (!peran) return false;
  const p = peran.toLowerCase().trim();
  if (
    p === "anggota" ||
    p === "warga" ||
    p === "penduduk" ||
    p === "pendatang" ||
    p === "pengunjung" ||
    p === "penduduk domisili diluar" ||
    p === "penduduk domisili di luar"
  ) {
    return false;
  }
  return (
    p.includes("admin") ||
    p.includes("pengurus") ||
    p.includes("kader") ||
    p.includes("ketua") ||
    p.includes("pengelola") ||
    p.includes("pimpinan") ||
    p.includes("super_admin") ||
    p.includes("super admin") ||
    p.includes("nakes") ||
    p.includes("bidan") ||
    p.includes("kepala") ||
    p.includes("guru") ||
    p.includes("tenaga") ||
    p.includes("pendidik")
  );
}

/**
 * Mengecek apakah peran memiliki hak akses penuh ke seluruh unsur Profil Data Komunitas Warga Kita
 * (Penduduk & Penduduk Domisili Di Luar, atau Pengurus/Admin/Kader)
 */
export function hasFullProfilDataAccess(
  peran?: string | null,
  isAdminOrKader: boolean = false
): boolean {
  if (isAdminOrKader) return true;
  if (!peran) return false;
  const p = peran.toLowerCase().trim();
  if (
    p === "penduduk" ||
    p === "penduduk domisili di luar" ||
    p === "penduduk domisili diluar"
  ) {
    return true;
  }
  return isRoleAdmin(p);
}


