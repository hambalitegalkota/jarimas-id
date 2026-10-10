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
  if (pLower === "admin_pusat" || pLower === "admin pusat") return "Admin Pusat";
  if (pLower === "penduduk") return "Penduduk";
  if (
    pLower === "penduduk berdomisili luar kota" ||
    pLower === "penduduk domisili di luar" ||
    pLower === "penduduk domisili diluar"
  ) {
    return "Penduduk Berdomisili Luar Kota";
  }
  if (pLower === "pendatang") return "Pendatang";
  if (pLower === "pengunjung") return "Pengunjung";
  if (pLower === "tenaga medis" || pLower === "medis") return "Tenaga Medis";
  if (pLower === "tenaga kesehatan" || pLower === "nakes") return "Tenaga Kesehatan";
  if (pLower === "plkb") return "PLKB";
  if (pLower === "pkk") return "PKK";
  if (pLower === "guru paud" || pLower === "guru") return "Guru PAUD";
  if (pLower === "kepala sekolah" || pLower === "kepala paud") return "Kepala Sekolah";
  if (pLower === "orangtua/wali murid" || pLower === "wali murid") return "Orangtua/Wali Murid";
  if (pLower === "komite") return "Komite";
  if (pLower === "alumni") return "Alumni";
  if (pLower === "tim pembina" || pLower === "pembina") return "Tim Pembina";
  if (pLower === "pendamping") return "Pendamping";
  if (pLower === "mitra") return "Mitra";
  if (pLower === "admin kelurahan") return "Admin Kelurahan";
  if (pLower === "admin") return "Admin";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

/**
 * Mengecek apakah pengguna memiliki status peran Super Admin (Root Administrator Platform JARIMAS)
 * Super Admin memiliki hak akses penuh (bypass mutlak) ke seluruh komunitas, data anak, DDTK, ATS,
 * laporan kader, persetujuan admin berjenjang, dan tata kelola akun.
 */
export function isSuperAdmin(profileOrUser?: {
  is_super_admin?: boolean;
  is_admin_pusat?: boolean;
  nama_lengkap?: string | null;
  email?: string | null;
  id?: string | null;
} | null): boolean {
  if (!profileOrUser) return false;
  if (profileOrUser.is_super_admin === true) return true;

  const email = (profileOrUser.email || "").toLowerCase().trim();
  if (
    email === "jarimas.id@gmail.com" ||
    email.includes("jarimas.id@") ||
    email.startsWith("jarimas.id") ||
    email === "admin@jarimas.id"
  ) {
    return true;
  }

  const name = (profileOrUser.nama_lengkap || "").toLowerCase().trim();
  if (
    name === "jarimas indonesia" ||
    name === "jarimas" ||
    name.startsWith("jarimas indonesia")
  ) {
    return true;
  }

  if (profileOrUser.id === "00000000-0000-0000-0000-000000000001") return true;

  return false;
}

/**
 * Mengecek apakah pengguna memiliki status peran Admin Pusat (Manajerial Global di bawah Super Admin)
 */
export function isAdminPusat(profileOrUser?: {
  is_admin_pusat?: boolean;
  is_super_admin?: boolean;
  nama_lengkap?: string | null;
  email?: string | null;
  id?: string | null;
} | null): boolean {
  if (!profileOrUser) return false;
  if (isSuperAdmin(profileOrUser)) return false; // Super Admin adalah tingkatan di atas Admin Pusat
  if (profileOrUser.is_admin_pusat === true) return true;
  return false;
}

/**
 * Mengecek apakah pengguna memiliki hak akses penuh tingkat atas (Super Admin atau Admin Pusat)
 */
export function isSuperOrAdminPusat(profileOrUser?: {
  is_admin_pusat?: boolean;
  is_super_admin?: boolean;
  nama_lengkap?: string | null;
  email?: string | null;
  id?: string | null;
} | null): boolean {
  if (!profileOrUser) return false;
  return isSuperAdmin(profileOrUser) || isAdminPusat(profileOrUser);
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
    p === "mitra" ||
    p === "pendamping" ||
    p === "penduduk berdomisili luar kota" ||
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
    p.includes("admin_pusat") ||
    p.includes("admin pusat") ||
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
 * (Penduduk & Penduduk Berdomisili Luar Kota, atau Pengurus/Admin/Kader)
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
    p === "penduduk berdomisili luar kota" ||
    p === "penduduk domisili di luar" ||
    p === "penduduk domisili diluar"
  ) {
    return true;
  }
  return isRoleAdmin(p);
}

/**
 * Format angka numerik ke format mata uang Rupiah Indonesia (IDR)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Mengecek apakah pengguna memiliki hak akses penuh (Membuat, Mengedit, Mendelet) Data Anak di Komunitas
 * - Di Satuan PAUD: Admin, Kepala Sekolah, Guru PAUD / Pendidik, Super Admin -> Full Access
 * - Di Satuan PAUD: Orangtua/Wali Murid, Komite, Alumni -> Read Only
 * - Di Posyandu: Kader, Tenaga Kesehatan/Medis, Bidan, Pengurus, Super Admin -> Full Access
 * - Di Warga Kita (RT/RW/Kelurahan): Pengurus RT, Penduduk, Super Admin -> Full Access
 */
export function canManageDataAnakInKomunitas(
  jenisKomunitas?: string | null,
  peran?: string | null,
  isSuperAdmin: boolean = false
): { canCreate: boolean; canEdit: boolean; canDelete: boolean; isReadOnly: boolean } {
  if (isSuperAdmin) {
    return { canCreate: true, canEdit: true, canDelete: true, isReadOnly: false };
  }
  if (!peran) {
    return { canCreate: false, canEdit: false, canDelete: false, isReadOnly: true };
  }

  const p = peran.toLowerCase().trim();
  if (p.includes("admin pusat") || p.includes("admin_pusat") || p.includes("super admin") || p.includes("super_admin")) {
    return { canCreate: true, canEdit: true, canDelete: true, isReadOnly: false };
  }

  const jenis = (jenisKomunitas || "").toLowerCase().trim();

  if (jenis === "satuan_paud") {
    // Admin, Kepala Sekolah, Guru PAUD / Pendidik -> Full Access
    const isPaudStaff =
      p.includes("admin") ||
      p.includes("kepala") ||
      p.includes("guru") ||
      p.includes("pendidik") ||
      p.includes("tutor") ||
      p.includes("pengelola") ||
      p.includes("pengurus");

    if (isPaudStaff) {
      return { canCreate: true, canEdit: true, canDelete: true, isReadOnly: false };
    }

    // Orangtua/Wali Murid, Komite, Alumni, Warga Belajar, Pengunjung -> Read Only
    return { canCreate: false, canEdit: false, canDelete: false, isReadOnly: true };
  }

  if (jenis === "posyandu") {
    const isPosyanduStaff =
      p.includes("kader") ||
      p.includes("medis") ||
      p.includes("kesehatan") ||
      p.includes("bidan") ||
      p.includes("nakes") ||
      p.includes("plkb") ||
      p.includes("pkk") ||
      p.includes("pengurus") ||
      p.includes("admin");

    if (isPosyanduStaff) {
      return { canCreate: true, canEdit: true, canDelete: true, isReadOnly: false };
    }
    return { canCreate: false, canEdit: false, canDelete: false, isReadOnly: true };
  }

  // Warga Kita (RT, RW, Kelurahan, Kecamatan)
  const isWargaOrPengurus =
    p.includes("penduduk") ||
    p.includes("pengurus") ||
    p.includes("admin") ||
    p.includes("kader") ||
    p.includes("ketua") ||
    p.includes("pendatang");

  if (isWargaOrPengurus) {
    return { canCreate: true, canEdit: true, canDelete: true, isReadOnly: false };
  }

  return { canCreate: false, canEdit: false, canDelete: false, isReadOnly: true };
}

import type { KontakKomunitasDetail, KaderBidangItem } from "@/types/database";

/**
 * Format nomor HP / WhatsApp menjadi tautan wa.me yang valid
 */
export function formatWhatsAppUrl(phone?: string | null, text?: string): string | null {
  if (!phone) return null;
  let clean = phone.replace(/\D/g, "");
  if (!clean) return null;
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (!clean.startsWith("62")) {
    clean = "62" + clean;
  }
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${clean}${encodedText}`;
}

/**
 * Mengurai string kontak komunitas menjadi objek KontakKomunitasDetail lengkap
 */
export function parseKontakKomunitas(rawKontak?: string | null): KontakKomunitasDetail {
  const emptyKader = (): KaderBidangItem => ({ nama: "", wa: "" });
  const result: KontakKomunitasDetail = {
    utama: "",
    kader_pendidikan: emptyKader(),
    kader_kesehatan: emptyKader(),
    kader_pekerjaan_umum: emptyKader(),
    kader_perumahan_rakyat: emptyKader(),
    kader_trantipbumlinmas: emptyKader(),
    kader_sosial: emptyKader(),
  };

  if (!rawKontak) return result;

  const trimmed = rawKontak.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      result.utama = parsed.utama || parsed.telepon || "";
      if (parsed.kader_pendidikan) {
        result.kader_pendidikan = {
          nama: parsed.kader_pendidikan.nama || "",
          wa: parsed.kader_pendidikan.wa || "",
        };
      }
      if (parsed.kader_kesehatan) {
        result.kader_kesehatan = {
          nama: parsed.kader_kesehatan.nama || "",
          wa: parsed.kader_kesehatan.wa || "",
        };
      }
      if (parsed.kader_pekerjaan_umum) {
        result.kader_pekerjaan_umum = {
          nama: parsed.kader_pekerjaan_umum.nama || "",
          wa: parsed.kader_pekerjaan_umum.wa || "",
        };
      }
      if (parsed.kader_perumahan_rakyat) {
        result.kader_perumahan_rakyat = {
          nama: parsed.kader_perumahan_rakyat.nama || "",
          wa: parsed.kader_perumahan_rakyat.wa || "",
        };
      }
      if (parsed.kader_trantipbumlinmas) {
        result.kader_trantipbumlinmas = {
          nama: parsed.kader_trantipbumlinmas.nama || "",
          wa: parsed.kader_trantipbumlinmas.wa || "",
        };
      }
      if (parsed.kader_sosial) {
        result.kader_sosial = {
          nama: parsed.kader_sosial.nama || "",
          wa: parsed.kader_sosial.wa || "",
        };
      }
      return result;
    } catch {
      // Fallback
    }
  }

  result.utama = rawKontak;
  return result;
}





