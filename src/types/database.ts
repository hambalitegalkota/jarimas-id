export type UserRole = "Super Admin" | "Pengurus" | "Kader" | "Anggota";
export type MembershipStatus = "pending" | "approved" | "rejected";
export type VisibilitasKabar = "publik" | "teman" | "komunitas";
export type SortingKabar = "terbaru" | "terpopuler";
export type JenisKomunitas = "warga_kita" | "posyandu" | "satuan_paud";

export interface Profile {
  id: string;
  nama_lengkap: string;
  email: string;
  is_super_admin: boolean;
  avatar_url?: string | null;
  nomor_hp?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Komunitas {
  id: string;
  nama: string;
  jenis: JenisKomunitas | string;
  kecamatan?: string;
  kelurahan?: string;
  rt?: string | null;
  rw?: string | null;
  lokasi: string;
  deskripsi?: string | null;
  logo_url?: string | null;
  kontak?: string | null;
  jadwal?: string | null;
  created_at?: string;
}

export interface AnggotaKomunitas {
  id: string;
  user_id: string;
  komunitas_id: string;
  peran: string;
  status: MembershipStatus;
  approved_by?: string | null;
  created_at: string;
  updated_at?: string;
  komunitas?: Komunitas | null;
}

export interface AnggotaKomunitasDetail {
  id: string;
  user_id: string;
  komunitas_id: string;
  peran: string;
  peran_diajukan?: string | null;
  berdomisili?: boolean;
  kk_terdaftar?: boolean;
  status: MembershipStatus;
  created_at: string;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
}

export interface HierarchyAdminTierInfo {
  level: "rt" | "rw" | "kelurahan" | "kecamatan";
  levelLabel: string;
  title: string;
  komunitasId: string;
  komunitasNama: string;
  adminName: string | null;
  hasAdmin: boolean;
  canApply: boolean;
  userStatusAtTier?: {
    status: MembershipStatus;
    peran: string;
    peran_diajukan?: string | null;
  } | null;
}

export interface WargaHierarchyAdmins {
  rt?: HierarchyAdminTierInfo | null;
  rw?: HierarchyAdminTierInfo | null;
  kelurahan?: HierarchyAdminTierInfo | null;
  kecamatan?: HierarchyAdminTierInfo | null;
}

export interface KomunitasWithMembership extends Komunitas {
  jumlah_anggota: number;
  hasAdmin?: boolean;
  adminName?: string | null;
  adminRole?: string | null;
  currentUserMembership?: {
    id: string;
    status: MembershipStatus;
    peran: string;
    peran_diajukan?: string | null;
    berdomisili?: boolean;
    kk_terdaftar?: boolean;
  } | null;
  hierarchyAdmins?: WargaHierarchyAdmins | null;
  hierarchyAdminList?: HierarchyAdminTierInfo[];
}

export interface UserJoinedKomunitas {
  id: string;
  membershipId: string;
  nama: string;
  jenis: JenisKomunitas | string;
  kecamatan?: string | null;
  kelurahan?: string | null;
  rt?: string | null;
  rw?: string | null;
  lokasi?: string | null;
  deskripsi?: string | null;
  logo_url?: string | null;
  kontak?: string | null;
  jadwal?: string | null;
  status: MembershipStatus;
  peran: string;
  peran_diajukan?: string | null;
  berdomisili?: boolean;
  kk_terdaftar?: boolean;
  hasAdmin?: boolean;
  adminName?: string | null;
  adminRole?: string | null;
  joinedAt: string;
  jumlah_anggota: number;
}

export interface DdksRecord {
  id: string;
  data_anak_id: string;
  berat_badan: number;
  tinggi_badan: number;
  panjang_badan?: number | null;
  lingkar_kepala: number;
  catatan?: string | null;
  recorded_by?: string;
  created_at: string;
  profiles?: {
    nama_lengkap?: string;
  } | null;
}

// DDTK (Deteksi Dini Tumbuh Kembang) alias for DDKS
export type DdtkRecord = DdksRecord;

export interface DataAnakItem {
  id: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P" | "Laki-laki" | "Perempuan" | string;
  nama_orangtua: string;
  nomor_hp: string;
  tinggal_bersama: string;
  jarak_rumah_km: number;
  is_sekolah: boolean;
  nama_sekolah?: string | null;
  alasan_sekolah?: string | null;
  komunitas_id: string;
  komunitas_nama?: string;
  status_approval: "pending" | "approved" | "rejected";
  validated_by?: string | null;
  validated_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  latest_ddks?: DdksRecord | null;
  ddks_history?: DdksRecord[];
  latest_ddtk?: DdtkRecord | null;
  ddtk_history?: DdtkRecord[];
}

export const ALASAN_TIDAK_SEKOLAH_LIST = [
  "Data tidak ditemukan",
  "Pindah domisili",
  "Bukan Warga RT",
  "Meninggal dunia",
  "Tidak mau sekolah lagi",
  "Tidak ada biaya",
  "Bekerja",
  "Menikah",
  "Masalah kesehatan / disabilitas",
  "Korban perundungan",
  "Anak bermasalah dengan hukum",
  "Anak orang tua bermasalah dengan hukum",
  "Beranggapan sekolah tidak penting",
  "Cukup dengan pendidikan yang sekarang",
  "Pengaruh lingkungan",
] as const;

export type AlasanTidakSekolah = typeof ALASAN_TIDAK_SEKOLAH_LIST[number] | string;

export interface DataAtsItem {
  id: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P" | "Laki-laki" | "Perempuan" | string;
  nama_orangtua: string;
  nomor_hp: string;
  tinggal_bersama: string;
  keinginan_sekolah: "Masih Ada" | "Tidak Ada";
  alasan_tidak_sekolah: AlasanTidakSekolah;
  keterangan?: string | null;
  komunitas_id: string;
  komunitas_nama?: string;
  status_approval: "pending" | "approved" | "rejected";
  validated_by?: string | null;
  validated_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  latest_ddtk?: DdtkRecord | null;
  ddtk_history?: DdtkRecord[];
}

export interface PendingApprovalItem {
  id: string;
  user_id: string;
  komunitas_id: string;
  peran: string;
  peran_diajukan?: string | null;
  status: MembershipStatus;
  created_at: string;
  tierLevel?: "RT" | "RW" | "Kelurahan" | "Kecamatan" | "Posyandu" | "Satuan PAUD" | "Umum";
  targetApproverTitle?: string;
  berdomisili?: boolean;
  kk_terdaftar?: boolean;
  canApprove?: boolean;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    email?: string;
    nomor_hp?: string | null;
    avatar_url?: string | null;
  } | null;
  komunitas?: {
    id?: string;
    nama?: string;
    jenis?: string;
    lokasi?: string;
    kecamatan?: string | null;
    kelurahan?: string | null;
    rw?: string | null;
    rt?: string | null;
  } | null;
}

export interface ReaksiKabar {
  id: string;
  kabar_id: string;
  user_id: string;
  tipe_reaksi: string; // '❤️' | '👍' | '🙏' | '😊'
  created_at?: string;
}

export type VisibilitasKomentar = "publik" | "pembuat_kabar";

export interface KomentarKabar {
  id: string;
  kabar_id: string;
  user_id: string;
  konten: string;
  visibilitas?: VisibilitasKomentar | string;
  parent_id?: string | null;
  created_at: string;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    avatar_url?: string | null;
  } | null;
}

export interface KabarItem {
  id: string;
  user_id: string;
  konten: string;
  visibilitas: VisibilitasKabar;
  komentar_dinonaktifkan?: boolean;
  komunitas_id?: string | null;
  created_at: string;
  updated_at?: string;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    avatar_url?: string | null;
    is_super_admin?: boolean;
  } | null;
  komunitas?: {
    id?: string;
    nama?: string;
  } | null;
  jumlah_reaksi: number;
  jumlah_komentar: number;
  reaksi_counts: Record<string, number>;
  user_reaction?: string | null;
  komentar_list: KomentarKabar[];
}

export interface AuthActionState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AdminActionState {
  success: boolean;
  message: string;
  data?: PendingApprovalItem[];
}

export type KategoriMarket =
  | "Kesehatan & Gizi"
  | "Alat Posyandu"
  | "Edukasi PAUD"
  | "Merchandise & Seragam"
  | "Buku & Modul";

export type StatusPesanan =
  | "pending"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export type MetodePembayaran =
  | "qris"
  | "transfer_bca"
  | "transfer_mandiri"
  | "transfer_bri";

export interface MarketProduk {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: KategoriMarket | string;
  harga: number;
  stok: number;
  gambar_url: string;
  is_active: boolean;
  berat_gram?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MarketPesanan {
  id: string;
  user_id: string;
  produk_id: string;
  jumlah: number;
  total_harga: number;
  status_pembayaran: StatusPesanan;
  metode_pembayaran: MetodePembayaran | string;
  nama_penerima: string;
  nomor_hp: string;
  alamat_lengkap: string;
  kecamatan: string;
  kelurahan: string;
  catatan?: string | null;
  nomor_resi?: string | null;
  bukti_bayar_url?: string | null;
  created_at: string;
  updated_at?: string;
  produk?: MarketProduk | null;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    email?: string;
    nomor_hp?: string | null;
  } | null;
}

